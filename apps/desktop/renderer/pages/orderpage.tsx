import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBasket,
    Utensils,
    ShoppingBag,
    Bike,
    TrendingUp,
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    Armchair,
    Users,
    Check,
    ChefHat,
    BellRing,
    UserRound,
    Phone,
    PencilLine,
    Plus,
    ArrowLeftRight,
    Split,
    X,
    RotateCcw,
    CreditCard,
    ArrowRight,
    Printer,
    Download,
    RefreshCw,
    FileText,
    ReceiptText,
    Zap,
    CheckCircle2,
    AlertCircle,
    Truck,
    Ban,
} from 'lucide-react';
import type { MenuItem, RestaurantTable } from '@bitechez/shared-types';
import { formatINR } from '@bitechez/business-logic';
import { useCartStore } from '../stores/cartStore';
import { apiService } from '../services/api';
import { buildBillPdf, buildInvoicePdf, buildKotPdf, outputPdf, type BillDoc, type BillPayment, type KotDoc, type OrderTypeKey, type PdfMode } from '../utils/posPdf';

/* =====================================================================
   CONFIG + TYPES
   ===================================================================== */
const PAGE_OFFSET = '9.75rem';
const PAGE_SIZE = 20;
const CANCELLED_KEY = 'orders.cancelled';
const REFUNDS_KEY = 'orders.refunds';
const DELIVERY_KEY = 'orders.delivery';
const CASHIER = 'Rohit Sengar';

interface HeldOrder {
    id: string;
    orderNumber: string;
    heldAt: string;
    orderType: OrderTypeKey;
    tableId?: string;
    tableName?: string;
    guests: number;
    discountPercentage: number;
    offerCode?: string;
    orderNote: string;
    itemNotes: Record<string, string>;
    customer: { name?: string; phone?: string; address?: string };
    sentQty: Record<string, number>;
    entries: { item: MenuItem; quantity: number }[];
    totalPaise: number;
}
type RecentOrder = BillDoc & { id: string; itemIds?: { id: string; qty: number }[] };
type KotEntry = KotDoc & { id: string; status: 'pending' | 'preparing' | 'ready' | 'served'; startedAt?: string; readyAt?: string; servedAt?: string };
interface CancelledOrder {
    doc: BillDoc;
    held?: HeldOrder;
    reason: string;
    at: string;
}
interface Refund {
    orderNumber: string;
    amountPaise: number;
    method: string;
    reason: string;
    at: string;
}

type Status = 'placed' | 'preparing' | 'ready' | 'out_for_delivery' | 'served' | 'completed' | 'cancelled' | 'refunded';
const STATUS_META: Record<Status, { label: string; cls: string }> = {
    placed: { label: 'Placed', cls: 'bg-gray-100 text-gray-700' },
    preparing: { label: 'Preparing', cls: 'bg-amber-100 text-amber-800' },
    ready: { label: 'Ready', cls: 'bg-emerald-100 text-emerald-700' },
    out_for_delivery: { label: 'Out for Delivery', cls: 'bg-violet-100 text-violet-700' },
    served: { label: 'Served · Unpaid', cls: 'bg-sky-100 text-sky-700' },
    completed: { label: 'Completed', cls: 'bg-emerald-100 text-emerald-700' },
    cancelled: { label: 'Cancelled', cls: 'bg-gray-200 text-gray-600' },
    refunded: { label: 'Refunded', cls: 'bg-rose-100 text-rose-700' },
};
const TYPE_META: Record<OrderTypeKey, { label: string; icon: React.ElementType }> = {
    dine_in: { label: 'Dine In', icon: Utensils },
    takeaway: { label: 'Takeaway', icon: ShoppingBag },
    delivery: { label: 'Delivery', icon: Bike },
};

interface OrderView {
    key: string;
    source: 'held' | 'recent' | 'cancelled';
    doc: BillDoc;
    held?: HeldOrder;
    status: Status;
    kots: KotEntry[];
    refundPaise: number;
    refunds: Refund[];
    cancelReason?: string;
    timeline: { placed: string; preparing?: string; ready?: string; served?: string };
}

/* =====================================================================
   HELPERS
   ===================================================================== */
const readJSON = <T,>(key: string, fallback: T): T => {
    try {
        const s = localStorage.getItem(key);
        return s ? (JSON.parse(s) as T) : fallback;
    } catch {
        return fallback;
    }
};
const writeJSON = (key: string, v: unknown) => {
    try {
        localStorage.setItem(key, JSON.stringify(v));
    } catch {
        /* ignore */
    }
};
const shortNo = (n: string) => `#${n.replace(/^BTZ-/, 'RP')}`;
const ago = (iso: string, now: number) => {
    const m = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
    return m < 1 ? 'Just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.floor(m / 60)}h ago` : new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};
const clock = (iso?: string) => (iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : '–');
const fmtDT = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const maxIso = (a: (string | undefined)[]) => a.filter(Boolean).sort().pop();
const minIso = (a: (string | undefined)[]) => a.filter(Boolean).sort()[0];

/** Same maths as POS: discount → GST on discounted value → round to rupee. */
function heldToDoc(h: HeldOrder): BillDoc {
    const subtotal = h.entries.reduce((a, e) => a + e.item.basePricePaise * e.quantity, 0);
    const discount = Math.round((subtotal * (h.discountPercentage || 0)) / 100);
    const f = subtotal ? (subtotal - discount) / subtotal : 1;
    const gst = h.entries.reduce((a, e) => a + Math.round((e.item.basePricePaise * e.quantity * f * e.item.gstRate) / 100), 0);
    const cgst = Math.floor(gst / 2);
    const raw = subtotal - discount + gst;
    const grand = Math.round(raw / 100) * 100;
    return {
        orderNumber: h.orderNumber,
        createdAt: h.heldAt,
        orderType: h.orderType,
        tableName: h.tableName,
        guests: h.guests,
        cashier: CASHIER,
        customer: h.customer?.name || h.customer?.phone ? h.customer : undefined,
        lines: h.entries.map((e) => ({ id: e.item.id, name: e.item.name, qty: e.quantity, unitPaise: e.item.basePricePaise, gstRate: e.item.gstRate, notes: h.itemNotes?.[e.item.id], isVeg: e.item.isVeg })),
        orderNote: h.orderNote || undefined,
        subtotalPaise: subtotal,
        discountPaise: discount,
        discountPercentage: h.discountPercentage || 0,
        offerCode: h.offerCode,
        cgstPaise: cgst,
        sgstPaise: gst - cgst,
        totalGstPaise: gst,
        roundingPaise: grand - raw,
        grandTotalPaise: grand,
    };
}

const emojiFor = (name: string) => {
    const n = name.toLowerCase();
    const map: [RegExp, string][] = [
        [/burger/, '🍔'], [/pizza/, '🍕'], [/fries/, '🍟'], [/coffee|latte/, '☕'], [/ice ?cream|sundae/, '🍨'], [/mojito|mocktail|lemon|soda/, '🍹'],
        [/shake|smoothie/, '🥤'], [/tea|chai/, '🍵'], [/biryani/, '🍛'], [/rice/, '🍚'], [/noodle|hakka/, '🍜'], [/dosa|idli/, '🥞'], [/tikka|kebab/, '🍢'],
        [/chicken/, '🍗'], [/paneer|curry|dal/, '🍲'], [/sandwich|wrap|roll/, '🥪'], [/cake|pastry|brownie/, '🍰'], [/salad/, '🥗'], [/pasta/, '🍝'], [/momo/, '🥟'],
    ];
    return map.find(([r]) => r.test(n))?.[1] ?? '🍽️';
};

/* =====================================================================
   SMALL UI
   ===================================================================== */
const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; subtitle?: string; width?: string; children: React.ReactNode }> = ({ open, onClose, title, subtitle, width = 'max-w-md', children }) =>
    open ? (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/40" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className={`bg-white w-full ${width} max-h-[92dvh] flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl`}>
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-black text-[#191923] truncate">{title}</h3>
                        {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500" aria-label="Close">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
            </div>
        </div>
    ) : null;

const StatCard = ({ icon, value, label, tint }: { icon: React.ReactNode; value: string; label: string; tint: string }) => (
    <div className="shrink-0 flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 min-w-[150px]">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tint}`}>{icon}</div>
        <div>
            <p className="text-xl font-black text-[#191923] leading-none">{value}</p>
            <p className="text-xs font-semibold text-gray-500 mt-1">{label}</p>
        </div>
    </div>
);
const Pill = ({ s }: { s: Status }) => <span className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${STATUS_META[s].cls}`}>{STATUS_META[s].label}</span>;
const field = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#191923] focus:outline-none focus:ring-2 focus:ring-[#800D32]/30';

/* =====================================================================
   LIST ROW
   ===================================================================== */
const OrderRow = memo(({ o, now, selected, onSelect }: { o: OrderView; now: number; selected: boolean; onSelect: (k: string) => void }) => {
    const T = TYPE_META[o.doc.orderType] ?? TYPE_META.dine_in;
    return (
        <button
            onClick={() => onSelect(o.key)}
            className={`w-full flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors ${selected ? 'border-[#E58AA7] bg-[#FFF5F8]' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
        >
            <span className="w-11 h-11 rounded-full bg-[#FFF0F4] text-[#800D32] flex items-center justify-center shrink-0">
                <T.icon className="w-5 h-5" />
            </span>
            <span className="flex-1 min-w-0">
                <span className="block text-base font-black text-[#191923]">{shortNo(o.doc.orderNumber)}</span>
                <span className="flex items-center gap-1 text-xs font-semibold text-gray-600 truncate">
                    <T.icon className="w-3.5 h-3.5 text-[#800D32]" /> {T.label}
                    {o.doc.orderType === 'dine_in' && o.doc.tableName ? ` • Table ${o.doc.tableName}` : ''}
                </span>
            </span>
            <span className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[11px] font-semibold text-gray-500">{ago(o.doc.createdAt, now)}</span>
                <span className="text-sm font-black text-[#191923]">{formatINR(o.doc.grandTotalPaise)}</span>
                <Pill s={o.status} />
            </span>
        </button>
    );
});

/* =====================================================================
   PAGE
   ===================================================================== */
export const OrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const { items: cartItems, tableId: cartTableId, setOrderType, setTable, clearCart, addItem, updateQuantity, setDiscount } = useCartStore();

    const [held, setHeld] = useState<HeldOrder[]>(() => readJSON('pos.held', []));
    const [recent, setRecent] = useState<RecentOrder[]>(() => readJSON('pos.recent', []));
    const [kots, setKots] = useState<KotEntry[]>(() => readJSON('pos.kotQueue', []));
    const [cancelled, setCancelled] = useState<CancelledOrder[]>(() => readJSON(CANCELLED_KEY, []));
    const [refunds, setRefunds] = useState<Refund[]>(() => readJSON(REFUNDS_KEY, []));
    const [delivery, setDelivery] = useState<Record<string, 'out_for_delivery'>>(() => readJSON(DELIVERY_KEY, {}));
    const [tables, setTables] = useState<RestaurantTable[]>([]);

    const [typeTab, setTypeTab] = useState<'all' | OrderTypeKey>('all');
    const [day, setDay] = useState<'today' | 'yesterday' | '7' | '30' | 'all' | 'custom'>('today');
    const [customDate, setCustomDate] = useState(ymd(new Date()));
    const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'completed' | 'cancelled' | 'refunded'>('all');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [selectedKey, setSelectedKey] = useState<string | undefined>();
    const [modal, setModal] = useState<null | 'table' | 'cancel' | 'refund' | 'date' | 'filter' | 'details'>(null);
    const [now, setNow] = useState(Date.now());
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const notify = (type: 'success' | 'error', text: string) => setToast({ type, text });

    /* ---------- sync ---------- */
    const reload = useCallback(() => {
        setHeld(readJSON('pos.held', []));
        setRecent(readJSON('pos.recent', []));
        setKots(readJSON('pos.kotQueue', []));
        setCancelled(readJSON(CANCELLED_KEY, []));
        setRefunds(readJSON(REFUNDS_KEY, []));
        setDelivery(readJSON(DELIVERY_KEY, {}));
    }, []);
    useEffect(() => {
        apiService
            .getTables()
            .then(setTables)
            .catch(() => undefined);
        const onStorage = (e: StorageEvent) => e.key && /^(pos\.|orders\.)/.test(e.key) && reload();
        window.addEventListener('storage', onStorage);
        const t = setInterval(() => {
            setNow(Date.now());
            reload();
        }, 15_000);
        return () => {
            window.removeEventListener('storage', onStorage);
            clearInterval(t);
        };
    }, [reload]);
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 2800);
        return () => clearTimeout(t);
    }, [toast]);

    /** Write-through helpers that always start from the latest stored data. */
    const updateHeld = (fn: (l: HeldOrder[]) => HeldOrder[]) => {
        const next = fn(readJSON('pos.held', []));
        writeJSON('pos.held', next);
        setHeld(next);
    };
    const updateKots = (fn: (l: KotEntry[]) => KotEntry[]) => {
        const next = fn(readJSON('pos.kotQueue', []));
        writeJSON('pos.kotQueue', next);
        setKots(next);
    };

    /* ---------- unified orders ---------- */
    const orders: OrderView[] = useMemo(() => {
        const kotsBy: Record<string, KotEntry[]> = {};
        kots.forEach((k) => (kotsBy[k.orderNumber] ||= []).push(k));
        const refundsBy: Record<string, Refund[]> = {};
        refunds.forEach((r) => (refundsBy[r.orderNumber] ||= []).push(r));

        const timeline = (placed: string, ks: KotEntry[], servedFallback?: string) => ({
            placed,
            preparing: minIso(ks.map((k) => k.startedAt)),
            ready: ks.length && ks.every((k) => k.readyAt) ? maxIso(ks.map((k) => k.readyAt)) : undefined,
            served: ks.length && ks.every((k) => k.servedAt) ? maxIso(ks.map((k) => k.servedAt)) : servedFallback,
        });

        const out: OrderView[] = [];
        held.forEach((h) => {
            const ks = kotsBy[h.orderNumber] ?? [];
            const tl = timeline(h.heldAt, ks);
            let status: Status = 'placed';
            if (tl.served) status = 'served';
            else if (tl.ready) status = h.orderType === 'delivery' && delivery[h.orderNumber] ? 'out_for_delivery' : 'ready';
            else if (tl.preparing) status = 'preparing';
            out.push({ key: `h-${h.id}`, source: 'held', doc: heldToDoc(h), held: h, status, kots: ks, refundPaise: 0, refunds: [], timeline: tl });
        });
        recent.forEach((r) => {
            const ks = kotsBy[r.orderNumber] ?? [];
            const rf = refundsBy[r.orderNumber] ?? [];
            const refundPaise = rf.reduce((a, x) => a + x.amountPaise, 0);
            out.push({ key: `r-${r.id}`, source: 'recent', doc: r, status: refundPaise > 0 ? 'refunded' : 'completed', kots: ks, refundPaise, refunds: rf, timeline: timeline(r.createdAt, ks, r.createdAt) });
        });
        cancelled.forEach((c, i) => {
            out.push({ key: `c-${c.doc.orderNumber}-${i}`, source: 'cancelled', doc: c.doc, held: c.held, status: 'cancelled', kots: kotsBy[c.doc.orderNumber] ?? [], refundPaise: 0, refunds: [], cancelReason: c.reason, timeline: { placed: c.doc.createdAt } });
        });
        return out.sort((a, b) => b.doc.createdAt.localeCompare(a.doc.createdAt));
    }, [held, recent, kots, cancelled, refunds, delivery]);

    const inDay = useCallback(
        (iso: string) => {
            if (day === 'all') return true;
            const d0 = new Date();
            d0.setHours(0, 0, 0, 0);
            const t = new Date(iso).getTime();
            const D = 864e5;
            if (day === 'today') return t >= d0.getTime();
            if (day === 'yesterday') return t >= d0.getTime() - D && t < d0.getTime();
            if (day === '7') return t >= d0.getTime() - 6 * D;
            if (day === '30') return t >= d0.getTime() - 29 * D;
            return ymd(new Date(iso)) === customDate;
        },
        [day, customDate]
    );

    const dated = useMemo(() => orders.filter((o) => inDay(o.doc.createdAt)), [orders, inDay]);
    const typeCounts = useMemo(() => {
        const c = { all: dated.length, dine_in: 0, takeaway: 0, delivery: 0 };
        dated.forEach((o) => (c[o.doc.orderType] += 1));
        return c;
    }, [dated]);
    const totalSales = useMemo(() => dated.filter((o) => o.source === 'recent').reduce((a, o) => a + o.doc.grandTotalPaise - o.refundPaise, 0), [dated]);

    const listed = useMemo(() => {
        const q = query.trim().toLowerCase().replace('#', '');
        return dated.filter((o) => {
            if (typeTab !== 'all' && o.doc.orderType !== typeTab) return false;
            if (statusFilter === 'running' && o.source !== 'held') return false;
            if (statusFilter === 'completed' && o.status !== 'completed') return false;
            if (statusFilter === 'cancelled' && o.status !== 'cancelled') return false;
            if (statusFilter === 'refunded' && o.status !== 'refunded') return false;
            if (!q) return true;
            return [o.doc.orderNumber, shortNo(o.doc.orderNumber), o.doc.tableName ?? '', o.doc.customer?.name ?? '', o.doc.customer?.phone ?? ''].some((x) => x.toLowerCase().includes(q));
        });
    }, [dated, typeTab, statusFilter, query]);

    const pages = Math.max(1, Math.ceil(listed.length / PAGE_SIZE));
    useEffect(() => setPage(1), [typeTab, day, customDate, statusFilter, query]);
    const pageRows = listed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => {
        if (selectedKey && orders.some((o) => o.key === selectedKey)) return;
        setSelectedKey(listed[0]?.key);
    }, [orders, listed, selectedKey]);
    const sel = orders.find((o) => o.key === selectedKey);

    /* ---------- actions ---------- */
    const images = useMemo(() => {
        const o = readJSON<{ items?: Record<string, { images?: string[] }>; created?: { id: string; images?: string[] }[] }>('menu.local', {});
        const m: Record<string, string> = {};
        Object.entries(o.items ?? {}).forEach(([id, v]) => v.images?.[0] && (m[id] = v.images[0]));
        (o.created ?? []).forEach((c) => c.images?.[0] && (m[c.id] = c.images[0]));
        return m;
    }, []);

    const select = useCallback((k: string) => {
        setSelectedKey(k);
        if (window.matchMedia('(max-width: 1279px)').matches) setModal('details');
    }, []);

    /** Load a running order into the POS cart (removes it from hold) and open POS. */
    const openInPos = (o: OrderView, hint?: string) => {
        const h = o.held;
        if (!h) return;
        if (cartItems.length && cartTableId !== h.tableId) return notify('error', 'POS has another open order — hold or settle it first');
        clearCart();
        setOrderType(h.orderType);
        setTable(h.tableId, h.tableName);
        h.entries.forEach(({ item, quantity }) => {
            addItem(item);
            if (quantity > 1) updateQuantity(item.id, quantity - 1);
        });
        setDiscount(h.discountPercentage || 0);
        updateHeld((l) => l.filter((x) => x.id !== h.id));
        if (hint) sessionStorage.setItem('pos.hint', hint);
        navigate('/pos');
    };

    const reorder = (o: OrderView) => {
        if (cartItems.length) return notify('error', 'POS has an open order — hold or settle it first');
        const byId = Object.fromEntries((o.held?.entries ?? []).map((e) => [e.item.id, e.item]));
        clearCart();
        setOrderType(o.doc.orderType);
        let added = 0;
        o.doc.lines.forEach((l) => {
            const item: MenuItem = byId[l.id] ?? ({ id: l.id, name: l.name, basePricePaise: l.unitPaise, gstRate: l.gstRate, isVeg: l.isVeg ?? true, categoryId: '' } as MenuItem);
            addItem(item);
            if (l.qty > 1) updateQuantity(item.id, l.qty - 1);
            added++;
        });
        if (added) navigate('/pos');
    };

    const pdf = async (kind: 'bill' | 'invoice' | 'kot', mode: PdfMode) => {
        if (!sel) return;
        try {
            const doc =
                kind === 'kot'
                    ? await buildKotPdf({
                        kotNumber: sel.kots[sel.kots.length - 1]?.kotNumber ?? 0,
                        orderNumber: sel.doc.orderNumber,
                        createdAt: new Date().toISOString(),
                        orderType: sel.doc.orderType,
                        tableName: sel.doc.tableName,
                        guests: sel.doc.guests,
                        items: sel.doc.lines.map((l) => ({ name: l.name, qty: l.qty, notes: l.notes, isVeg: l.isVeg })),
                        orderNote: [sel.doc.orderNote, 'FULL ORDER REPRINT'].filter(Boolean).join(' · '),
                    })
                    : kind === 'bill'
                        ? await buildBillPdf(sel.doc)
                        : await buildInvoicePdf(sel.doc);
            outputPdf(doc, `${kind === 'kot' ? 'KOT' : kind === 'bill' ? 'Bill' : 'Invoice'}-${sel.doc.orderNumber}.pdf`, mode);
        } catch (e) {
            console.error(e);
            notify('error', 'Could not generate PDF');
        }
    };

    const changeTable = (t: RestaurantTable) => {
        if (!sel?.held) return;
        const id = sel.held.id;
        updateHeld((l) => l.map((h) => (h.id === id ? { ...h, tableId: t.id, tableName: t.name } : h)));
        updateKots((l) => l.map((k) => (k.orderNumber === sel.doc.orderNumber && k.status !== 'served' ? { ...k, tableName: t.name } : k)));
        setModal(null);
        notify('success', `Moved to Table ${t.name}`);
    };

    const cancelOrder = (reason: string) => {
        if (!sel?.held) return;
        const h = sel.held;
        updateHeld((l) => l.filter((x) => x.id !== h.id));
        // Stop the kitchen: drop tickets that haven't been served
        updateKots((l) => l.filter((k) => !(k.orderNumber === h.orderNumber && k.status !== 'served')));
        const next = [...readJSON<CancelledOrder[]>(CANCELLED_KEY, []), { doc: { ...heldToDoc(h) }, held: h, reason, at: new Date().toISOString() }];
        writeJSON(CANCELLED_KEY, next);
        setCancelled(next);
        setModal(null);
        notify('success', `${shortNo(h.orderNumber)} cancelled`);
    };

    const refund = async (amountPaise: number, method: string, reason: string) => {
        if (!sel) return;
        const r: Refund = { orderNumber: sel.doc.orderNumber, amountPaise, method, reason, at: new Date().toISOString() };
        const next = [...readJSON<Refund[]>(REFUNDS_KEY, []), r];
        writeJSON(REFUNDS_KEY, next);
        setRefunds(next);
        const api = apiService as unknown as { refundOrder?: (p: object) => Promise<unknown> };
        try {
            await api.refundOrder?.({ orderId: sel.source === 'recent' ? sel.key.slice(2) : undefined, ...r });
        } catch {
            notify('error', 'Refund saved on this device; server update failed');
        }
        setModal(null);
        notify('success', `Refund of ${formatINR(amountPaise)} recorded`);
    };

    const markServed = () => {
        if (!sel) return;
        const t = new Date().toISOString();
        updateKots((l) =>
            l.map((k) => (k.orderNumber === sel.doc.orderNumber && k.status !== 'served' ? { ...k, status: 'served', startedAt: k.startedAt ?? t, readyAt: k.readyAt ?? t, servedAt: t } : k))
        );
        notify('success', 'Marked as served');
    };
    const markOutForDelivery = () => {
        if (!sel) return;
        const next = { ...readJSON<Record<string, 'out_for_delivery'>>(DELIVERY_KEY, {}), [sel.doc.orderNumber]: 'out_for_delivery' as const };
        writeJSON(DELIVERY_KEY, next);
        setDelivery(next);
        notify('success', 'Out for delivery');
    };

    /* ---------- details panel ---------- */
    const steps = sel
        ? [
            { l: 'Order Placed', t: sel.timeline.placed, I: Check },
            { l: 'Preparing', t: sel.timeline.preparing, I: ChefHat },
            { l: sel.doc.orderType === 'delivery' ? 'Ready / Dispatched' : 'Ready', t: sel.timeline.ready, I: BellRing },
            { l: sel.doc.orderType === 'delivery' ? 'Delivered' : 'Served', t: sel.timeline.served, I: Check },
        ]
        : [];
    const doneIdx = steps.reduce((a, s, i) => (s.t ? i : a), 0);

    const running = sel?.source === 'held';
    const actions = sel
        ? running
            ? [
                { l: 'Edit Order', I: PencilLine, on: () => openInPos(sel) },
                { l: 'Add Item', I: Plus, on: () => openInPos(sel) },
                { l: 'Change Table', I: ArrowLeftRight, on: () => setModal('table'), ok: sel.doc.orderType === 'dine_in' },
                { l: 'Split Bill', I: Split, on: () => openInPos(sel, 'split') },
                { l: 'Cancel Order', I: X, on: () => setModal('cancel'), danger: true },
                sel.doc.orderType === 'delivery' && sel.status === 'ready'
                    ? { l: 'Out for Delivery', I: Truck, on: markOutForDelivery }
                    : { l: 'Mark Served', I: Check, on: markServed, ok: sel.status !== 'served' && sel.kots.length > 0 },
            ]
            : sel.source === 'recent'
                ? [
                    { l: 'Reprint Bill', I: Printer, on: () => pdf('bill', 'print') },
                    { l: 'Invoice PDF', I: FileText, on: () => pdf('invoice', 'download') },
                    { l: 'Reorder', I: RotateCcw, on: () => reorder(sel) },
                    { l: 'Refund', I: RefreshCw, on: () => setModal('refund'), ok: sel.refundPaise < sel.doc.grandTotalPaise, danger: true },
                ]
                : [{ l: 'Reorder', I: RotateCcw, on: () => reorder(sel) }]
        : [];

    const center = sel && (
        <div className="h-full min-h-0 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-4 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-black text-[#191923]">{shortNo(sel.doc.orderNumber)}</h2>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FFF0F4] text-[#800D32] text-sm font-bold">
                        {React.createElement(TYPE_META[sel.doc.orderType].icon, { className: 'w-4 h-4' })} {TYPE_META[sel.doc.orderType].label}
                    </span>
                    <span className="ml-auto">
                        <Pill s={sel.status} />
                    </span>
                </div>
                <div className="flex items-center gap-4 flex-wrap mt-2 text-sm font-semibold text-gray-700">
                    <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4 text-[#800D32]" /> {fmtDT(sel.doc.createdAt)}
                    </span>
                    {sel.doc.orderType === 'dine_in' && (
                        <span className="flex items-center gap-1.5">
                            <Armchair className="w-4 h-4 text-[#800D32]" /> Table: {sel.doc.tableName ?? '—'}
                        </span>
                    )}
                    <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#800D32]" /> Guests: {sel.doc.guests}
                    </span>
                </div>
                {sel.cancelReason && <p className="mt-2 text-xs font-bold text-rose-600">Cancelled: {sel.cancelReason}</p>}
            </div>

            {/* Timeline */}
            {sel.status !== 'cancelled' && (
                <div className="mx-4 rounded-xl border border-gray-100 px-3 py-3">
                    <div className="grid grid-cols-4">
                        {steps.map((s, i) => {
                            const done = !!s.t;
                            const current = i === doneIdx && sel.source === 'held';
                            return (
                                <div key={s.l} className="relative flex flex-col items-center text-center">
                                    {i < steps.length - 1 && <span className={`absolute top-[18px] left-1/2 w-full h-0.5 ${i < doneIdx ? 'bg-[#800D32]' : 'bg-gray-200'}`} />}
                                    <span
                                        className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center ${current ? 'bg-[#FDEBF1] text-[#800D32] ring-2 ring-[#800D32]' : done ? 'bg-[#800D32] text-white' : 'bg-gray-100 text-gray-400'
                                            }`}
                                    >
                                        <s.I className="w-4 h-4" />
                                    </span>
                                    <span className={`mt-1 text-xs font-bold ${done ? 'text-[#191923]' : 'text-gray-400'}`}>{s.l}</span>
                                    <span className="text-[11px] font-semibold text-gray-500">{clock(s.t)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Items */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
                <p className="flex items-center gap-2 text-base font-black text-[#191923] mb-2">
                    <Utensils className="w-5 h-5 text-[#800D32]" /> Order Items ({sel.doc.lines.length})
                </p>
                <ul className="space-y-1.5">
                    {sel.doc.lines.map((l) => (
                        <li key={l.id} className="flex items-center gap-3 rounded-xl bg-[#FFF8FA] px-2.5 py-2">
                            <span className="w-14 h-12 rounded-lg bg-white overflow-hidden flex items-center justify-center shrink-0">
                                {images[l.id] ? <img src={images[l.id]} alt="" loading="lazy" className="w-full h-full object-cover" /> : <span className="text-2xl">{emojiFor(l.name)}</span>}
                            </span>
                            <span className="flex-1 min-w-0">
                                <span className="block text-sm font-black text-[#191923] truncate">{l.name}</span>
                                <span className="block text-xs font-semibold text-gray-500">
                                    Qty: {l.qty}
                                    {l.qty > 1 && <> | {formatINR(l.unitPaise)} each</>}
                                </span>
                                {l.notes && <span className="block text-[11px] italic text-[#800D32] truncate">“{l.notes}”</span>}
                            </span>
                            <span className="text-right">
                                <span className="block text-xs font-semibold text-gray-500">{formatINR(l.unitPaise)}</span>
                                <span className="block text-base font-black text-[#191923]">{formatINR(l.unitPaise * l.qty)}</span>
                            </span>
                        </li>
                    ))}
                </ul>
                {sel.doc.orderNote && <p className="mt-2 text-xs italic text-gray-600">Note: {sel.doc.orderNote}</p>}
            </div>

            {/* KOT / Print */}
            <div className="m-3 mt-0 rounded-xl border border-gray-100 p-3 flex items-center gap-3 flex-wrap">
                <ChefHat className="w-8 h-8 text-[#800D32]" />
                <div className="flex-1 min-w-[140px]">
                    <p className="text-base font-black text-[#191923] leading-tight">KOT / Print</p>
                    <p className="text-xs font-semibold text-gray-500">
                        {sel.kots.length ? `${sel.kots.length} KOT(s) sent to kitchen` : 'No KOT sent yet'}
                    </p>
                </div>
                <button onClick={() => pdf('kot', 'print')} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#800D32] text-white text-sm font-black">
                    <Printer className="w-4 h-4" /> Print KOT
                </button>
                <button onClick={() => pdf('kot', 'download')} className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#800D32]">
                    <Download className="w-4 h-4" /> Download KOT
                </button>
                <button onClick={() => pdf('bill', 'print')} className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#800D32]">
                    <RefreshCw className="w-4 h-4" /> Reprint
                </button>
            </div>
        </div>
    );

    const side = sel && (
        <div className="flex flex-col gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-[#800D32]" />
                    <h3 className="flex-1 text-base font-black text-[#191923]">Customer Details</h3>
                    {sel.doc.customer?.phone && (
                        <button onClick={() => navigate('/customers')} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-[#C0163F]">
                            <PencilLine className="w-3.5 h-3.5" /> View Profile
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-full bg-[#FFF0F4] text-[#C0163F] flex items-center justify-center">
                        <UserRound className="w-6 h-6" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-sm font-black text-[#191923] truncate">{sel.doc.customer?.name || 'Walk-in Customer'}</p>
                        {sel.doc.customer?.phone ? (
                            <a href={`tel:${sel.doc.customer.phone}`} className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                                <Phone className="w-4 h-4 text-[#C0163F]" /> {sel.doc.customer.phone}
                            </a>
                        ) : (
                            <p className="text-xs text-gray-400">No phone captured</p>
                        )}
                        {sel.doc.customer?.address && <p className="text-xs text-gray-500 mt-0.5">{sel.doc.customer.address}</p>}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="flex items-center gap-2 text-base font-black text-[#191923] mb-2">
                    <ReceiptText className="w-5 h-5 text-[#800D32]" /> Order Summary
                </h3>
                <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                        <dt className="text-gray-700">Subtotal ({sel.doc.lines.reduce((a, l) => a + l.qty, 0)} items)</dt>
                        <dd className="font-bold">{formatINR(sel.doc.subtotalPaise)}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-gray-700">Discount{sel.doc.discountPercentage ? ` (${sel.doc.discountPercentage}%)` : ''}</dt>
                        <dd className="font-bold text-emerald-600">- {formatINR(sel.doc.discountPaise)}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-gray-700">GST</dt>
                        <dd className="font-bold">{formatINR(sel.doc.totalGstPaise)}</dd>
                    </div>
                    {sel.doc.roundingPaise !== 0 && (
                        <div className="flex justify-between text-xs text-gray-500">
                            <dt>Round off</dt>
                            <dd>{formatINR(sel.doc.roundingPaise)}</dd>
                        </div>
                    )}
                    {sel.refundPaise > 0 && (
                        <div className="flex justify-between text-rose-600">
                            <dt>Refunded</dt>
                            <dd className="font-bold">- {formatINR(sel.refundPaise)}</dd>
                        </div>
                    )}
                </dl>
                <div className="flex items-center justify-between rounded-xl bg-[#FDEBF1] px-4 py-3 mt-3">
                    <span className="text-base font-black text-[#800D32]">Total Amount</span>
                    <span className="text-xl font-black text-[#800D32]">{formatINR(sel.doc.grandTotalPaise - sel.refundPaise)}</span>
                </div>
                {sel.doc.payments?.length ? <p className="text-xs font-semibold text-gray-500 mt-2">Paid via {sel.doc.payments.map((p: BillPayment) => `${p.method.toUpperCase()} ${formatINR(p.amountPaise)}`).join(' + ')}</p> : null}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="flex items-center gap-2 text-base font-black text-[#191923] mb-3">
                    <Zap className="w-5 h-5 text-[#800D32]" /> Actions
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    {actions.map((a) => (
                        <button
                            key={a.l}
                            onClick={a.on}
                            disabled={'ok' in a && a.ok === false}
                            className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-1 rounded-xl border text-xs font-bold disabled:opacity-40 ${'danger' in a && a.danger ? 'border-gray-200 text-[#191923] hover:border-rose-300 hover:text-rose-600' : 'border-gray-200 text-[#191923] hover:border-[#F3C3D2]'
                                }`}
                        >
                            <a.I className="w-4 h-4" /> {a.l}
                        </button>
                    ))}
                </div>
            </div>

            {running && (
                <button onClick={() => openInPos(sel, 'pay')} className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-gradient-to-r from-[#800D32] to-[#A3164A] text-white shadow-lg">
                    <CreditCard className="w-6 h-6" />
                    <span className="flex-1 text-left text-lg font-black">Proceed to Payment</span>
                    <span className="text-lg font-black">{formatINR(sel.doc.grandTotalPaise)}</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
            )}
        </div>
    );

    /* ---------- render ---------- */
    const dayLabel =
        day === 'today'
            ? `Today, ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
            : day === 'yesterday'
                ? 'Yesterday'
                : day === '7'
                    ? 'Last 7 days'
                    : day === '30'
                        ? 'Last 30 days'
                        : day === 'all'
                            ? 'All time'
                            : new Date(`${customDate}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div className="flex flex-col gap-3 overflow-hidden" style={{ height: `calc(100dvh - var(--pos-offset, ${PAGE_OFFSET}))` }}>
            {toast && (
                <div className={`fixed top-5 right-5 z-[80] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border ${toast.type === 'success' ? 'bg-[#800D32] text-white border-rose-400' : 'bg-white text-rose-700 border-rose-200'}`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
                    {toast.text}
                </div>
            )}

            {/* ===== Header ===== */}
            <div className="flex items-center gap-3 flex-wrap xl:flex-nowrap">
                <div className="flex items-center gap-3 mr-auto">
                    <ShoppingBasket className="w-12 h-12 text-[#800D32]" strokeWidth={1.7} />
                    <div>
                        <h1 className="text-2xl font-black text-[#191923] leading-tight">Orders</h1>
                        <p className="text-xs text-gray-500 font-medium hidden sm:block">Manage all restaurant orders, track status and take actions</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 overflow-x-auto max-w-full pb-0.5">
                    <StatCard icon={<ShoppingBasket className="w-6 h-6 text-[#C0163F]" />} value={String(typeCounts.all)} label="Total Orders" tint="bg-rose-50" />
                    <StatCard icon={<Utensils className="w-6 h-6 text-[#C0163F]" />} value={String(typeCounts.dine_in)} label="Dine In" tint="bg-rose-50" />
                    <StatCard icon={<ShoppingBag className="w-6 h-6 text-[#C0163F]" />} value={String(typeCounts.takeaway)} label="Takeaway" tint="bg-rose-50" />
                    <StatCard icon={<Bike className="w-6 h-6 text-[#C0163F]" />} value={String(typeCounts.delivery)} label="Delivery" tint="bg-rose-50" />
                    <StatCard icon={<TrendingUp className="w-6 h-6 text-emerald-600" />} value={formatINR(totalSales)} label="Total Sales" tint="bg-emerald-50" />
                </div>
            </div>

            {/* ===== Filters ===== */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 overflow-x-auto max-w-full bg-white rounded-2xl border border-gray-100 p-1.5">
                    {(
                        [
                            ['all', 'All Orders', ShoppingBasket],
                            ['dine_in', 'Dine In', Utensils],
                            ['takeaway', 'Takeaway', ShoppingBag],
                            ['delivery', 'Delivery', Bike],
                        ] as const
                    ).map(([k, l, I]) => (
                        <button
                            key={k}
                            onClick={() => setTypeTab(k)}
                            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold ${typeTab === k ? 'bg-[#800D32] text-white' : 'text-[#191923] hover:bg-gray-50'}`}
                        >
                            <I className="w-4 h-4" /> {l} <span className={typeTab === k ? 'text-rose-100' : 'text-gray-500'}>({typeCounts[k]})</span>
                        </button>
                    ))}
                </div>
                <button onClick={() => setModal('date')} className="ml-auto inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#191923] min-w-[200px]">
                    <CalendarDays className="w-4 h-4" /> <span className="flex-1 text-left">{dayLabel}</span> <ChevronDown className="w-4 h-4" />
                </button>
                <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by order ID, table, customer..." className={`${field} pl-9 py-3 font-medium`} />
                </div>
                <button onClick={() => setModal('filter')} className="relative w-12 h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-700" aria-label="Status filter">
                    <Filter className="w-5 h-5" />
                    {statusFilter !== 'all' && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#C0163F]" />}
                </button>
            </div>

            {/* ===== Body ===== */}
            <div className="flex-1 min-h-0 flex gap-3">
                <aside className="w-full md:w-[340px] xl:w-[380px] shrink-0 min-h-0 flex flex-col gap-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-2.5">
                    <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
                        {pageRows.length === 0 ? (
                            <div className="py-14 text-center">
                                <ShoppingBasket className="w-10 h-10 text-rose-200 mx-auto mb-2" />
                                <p className="text-sm font-bold text-gray-600">No orders</p>
                                <p className="text-xs text-gray-400">Try another date or filter</p>
                            </div>
                        ) : (
                            pageRows.map((o) => <OrderRow key={o.key} o={o} now={now} selected={o.key === selectedKey} onSelect={select} />)
                        )}
                    </div>
                    {pages > 1 && <Pager page={page} pages={pages} setPage={setPage} />}
                </aside>

                <section className="hidden md:flex flex-1 min-w-0 min-h-0 flex-col">
                    {center ?? (
                        <div className="h-full bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center p-6">
                            <ShoppingBasket className="w-10 h-10 text-rose-200 mb-2" />
                            <p className="text-sm font-bold text-gray-600">Select an order</p>
                        </div>
                    )}
                </section>

                <aside className="hidden xl:block w-[360px] 2xl:w-[400px] shrink-0 min-h-0 overflow-y-auto">{side}</aside>
            </div>

            {/* ===== Modals ===== */}
            <Modal open={modal === 'details' && !!sel} onClose={() => setModal(null)} title={sel ? shortNo(sel.doc.orderNumber) : ''} width="max-w-2xl">
                <div className="space-y-3">
                    <div className="h-[60dvh]">{center}</div>
                    {side}
                </div>
            </Modal>

            <Modal open={modal === 'date'} onClose={() => setModal(null)} title="Choose date">
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        {(
                            [
                                ['today', 'Today'],
                                ['yesterday', 'Yesterday'],
                                ['7', 'Last 7 days'],
                                ['30', 'Last 30 days'],
                                ['all', 'All time'],
                            ] as const
                        ).map(([k, l]) => (
                            <button key={k} onClick={() => (setDay(k), setModal(null))} className={`py-2.5 rounded-xl border text-sm font-bold ${day === k ? 'bg-[#800D32] text-white border-[#800D32]' : 'border-gray-200'}`}>
                                {l}
                            </button>
                        ))}
                    </div>
                    <label className="block text-xs font-bold text-gray-600">
                        Specific date
                        <input type="date" max={ymd(new Date())} value={customDate} onChange={(e) => (setCustomDate(e.target.value), setDay('custom'), setModal(null))} className={`${field} mt-1`} />
                    </label>
                </div>
            </Modal>

            <Modal open={modal === 'filter'} onClose={() => setModal(null)} title="Filter by status">
                <div className="grid grid-cols-2 gap-2">
                    {(
                        [
                            ['all', 'All statuses'],
                            ['running', 'Running (unpaid)'],
                            ['completed', 'Completed'],
                            ['refunded', 'Refunded'],
                            ['cancelled', 'Cancelled'],
                        ] as const
                    ).map(([k, l]) => (
                        <button key={k} onClick={() => (setStatusFilter(k), setModal(null))} className={`py-2.5 rounded-xl border text-sm font-bold ${statusFilter === k ? 'bg-[#800D32] text-white border-[#800D32]' : 'border-gray-200'}`}>
                            {l}
                        </button>
                    ))}
                </div>
            </Modal>

            <Modal open={modal === 'table'} onClose={() => setModal(null)} title="Change Table" subtitle="Move this order to a free table">
                <TablePicker tables={tables} busy={new Set(held.map((h) => h.tableId).filter(Boolean) as string[])} current={sel?.held?.tableId} onPick={changeTable} />
            </Modal>

            <Modal open={modal === 'cancel'} onClose={() => setModal(null)} title={`Cancel ${sel ? shortNo(sel.doc.orderNumber) : ''}?`} subtitle="Unserved kitchen tickets for this order are removed">
                <ReasonForm options={['Customer left', 'Ordered by mistake', 'Item unavailable', 'Long wait time', 'Duplicate order']} cta="Cancel Order" danger onSubmit={(r) => cancelOrder(r)} />
            </Modal>

            <Modal open={modal === 'refund' && !!sel} onClose={() => setModal(null)} title={`Refund ${sel ? shortNo(sel.doc.orderNumber) : ''}`} subtitle={sel ? `Paid ${formatINR(sel.doc.grandTotalPaise)} · already refunded ${formatINR(sel.refundPaise)}` : ''}>
                {sel && <RefundForm max={sel.doc.grandTotalPaise - sel.refundPaise} defaultMethod={sel.doc.payments?.[0]?.method ?? 'cash'} onSubmit={refund} />}
            </Modal>
        </div>
    );
};

/* =====================================================================
   SUB-COMPONENTS
   ===================================================================== */
const Pager = ({ page, pages, setPage }: { page: number; pages: number; setPage: (n: number) => void }) => {
    const nums: (number | '…')[] = [];
    for (let i = 1; i <= pages; i++) {
        if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
        else if (nums[nums.length - 1] !== '…') nums.push('…');
    }
    const btn = 'min-w-9 h-9 px-2 rounded-lg text-sm font-bold flex items-center justify-center';
    return (
        <div className="flex items-center justify-center gap-1">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className={`${btn} border border-gray-200 disabled:opacity-40`} aria-label="Previous page">
                <ChevronLeft className="w-4 h-4" />
            </button>
            {nums.map((n, i) =>
                n === '…' ? (
                    <span key={`e${i}`} className="px-1 text-gray-400">
                        …
                    </span>
                ) : (
                    <button key={n} onClick={() => setPage(n)} className={`${btn} ${n === page ? 'bg-[#800D32] text-white' : 'text-[#191923] hover:bg-gray-50'}`}>
                        {n}
                    </button>
                )
            )}
            <button disabled={page === pages} onClick={() => setPage(page + 1)} className={`${btn} border border-gray-200 disabled:opacity-40`} aria-label="Next page">
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
};

const TablePicker = ({ tables, busy, current, onPick }: { tables: RestaurantTable[]; busy: Set<string>; current?: string; onPick: (t: RestaurantTable) => void }) => {
    const free = tables.filter((t) => t.id !== current && !busy.has(t.id));
    if (!free.length) return <p className="py-6 text-center text-sm font-semibold text-gray-500">No free tables right now.</p>;
    return (
        <div className="grid grid-cols-4 gap-2">
            {free.map((t) => (
                <button key={t.id} onClick={() => onPick(t)} className="py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-black text-emerald-800 hover:bg-emerald-100">
                    {t.name}
                </button>
            ))}
        </div>
    );
};

const ReasonForm = ({ options, cta, danger, onSubmit }: { options: string[]; cta: string; danger?: boolean; onSubmit: (r: string) => void }) => {
    const [r, setR] = useState('');
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
                {options.map((o) => (
                    <button key={o} onClick={() => setR(o)} className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${r === o ? 'bg-[#800D32] text-white border-[#800D32]' : 'border-gray-200'}`}>
                        {o}
                    </button>
                ))}
            </div>
            <textarea value={r} onChange={(e) => setR(e.target.value.slice(0, 140))} rows={2} placeholder="Reason (required)" className={`${field} resize-none font-medium`} />
            <button disabled={!r.trim()} onClick={() => onSubmit(r.trim())} className={`w-full py-3 rounded-xl text-white text-sm font-black inline-flex items-center justify-center gap-2 disabled:opacity-50 ${danger ? 'bg-rose-600' : 'bg-[#800D32]'}`}>
                <Ban className="w-4 h-4" /> {cta}
            </button>
        </div>
    );
};

const RefundForm = ({ max, defaultMethod, onSubmit }: { max: number; defaultMethod: string; onSubmit: (amountPaise: number, method: string, reason: string) => void }) => {
    const [mode, setMode] = useState<'full' | 'partial'>('full');
    const [amt, setAmt] = useState('');
    const [method, setMethod] = useState(defaultMethod);
    const [reason, setReason] = useState('');
    const paise = mode === 'full' ? max : Math.round((parseFloat(amt) || 0) * 100);
    const invalid = paise <= 0 || paise > max || !reason.trim();
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                {(['full', 'partial'] as const).map((m) => (
                    <button key={m} onClick={() => setMode(m)} className={`py-2.5 rounded-xl border text-sm font-bold capitalize ${mode === m ? 'bg-[#800D32] text-white border-[#800D32]' : 'border-gray-200'}`}>
                        {m === 'full' ? `Full (${formatINR(max)})` : 'Partial'}
                    </button>
                ))}
            </div>
            {mode === 'partial' && <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^\d.]/g, ''))} placeholder="Amount in ₹" inputMode="decimal" className={field} />}
            {mode === 'partial' && paise > max && <p className="text-xs font-bold text-rose-600">Max refundable is {formatINR(max)}</p>}
            <div className="grid grid-cols-3 gap-2">
                {['cash', 'upi', 'card'].map((m) => (
                    <button key={m} onClick={() => setMethod(m)} className={`py-2 rounded-xl border text-xs font-black uppercase ${method === m ? 'bg-[#191923] text-white border-[#191923]' : 'border-gray-200'}`}>
                        {m}
                    </button>
                ))}
            </div>
            <input value={reason} onChange={(e) => setReason(e.target.value.slice(0, 140))} placeholder="Reason (e.g. Wrong item served)" className={field} />
            <button disabled={invalid} onClick={() => onSubmit(paise, method, reason.trim())} className="w-full py-3 rounded-xl bg-rose-600 text-white text-sm font-black disabled:opacity-50">
                Refund {paise > 0 && paise <= max ? formatINR(paise) : ''}
            </button>
            <p className="text-[11px] text-gray-400">Records the refund and lowers total sales. Return the money to the customer by the chosen method.</p>
        </div>
    );
};

export default OrdersPage;