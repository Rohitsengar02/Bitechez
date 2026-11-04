import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  ShoppingCart,
  Star,
  Gift,
  Plus,
  Download,
  Upload,
  Search,
  SlidersHorizontal,
  Crown,
  Phone,
  Mail,
  CalendarDays,
  PencilLine,
  MoreHorizontal,
  UserRound,
  IndianRupee,
  List,
  Heart,
  MapPin,
  StickyNote,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BarChart3,
  Clock,
  Utensils,
  ShoppingBag,
  Bike,
  Zap,
  Coins,
  Tag,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
  MessageCircle,
  Copy,
  ArrowLeft,
} from 'lucide-react';
import { formatINR } from '@bitechez/business-logic';
import { buildBillPdf, outputPdf, OUTLET_INFO, type BillDoc, type OrderTypeKey } from '../utils/posPdf';

/* =====================================================================
   CONFIG
   ===================================================================== */
const PAGE_OFFSET = '9.75rem';
const STORE_KEY = 'customers.db';
const PAGE_SIZE = 25;
/** Loyalty rules — edit to match your programme. */
const EARN_PER_PAISE = 1000; // 1 point per ₹10 spent
const POINT_VALUE_PAISE = 25; // 1 point = ₹0.25 when redeemed
const TIERS = [
  { name: 'Silver', min: 0, cls: 'bg-gray-100 text-gray-700' },
  { name: 'Gold', min: 1000, cls: 'bg-amber-100 text-amber-700' },
  { name: 'Platinum', min: 4000, cls: 'bg-violet-100 text-violet-700' },
];
const OFFER_TEMPLATES = [
  'Flat 20% OFF on your next visit! Show this message at the counter.',
  'Happy Hours 4–7 PM: Buy 1 Get 1 on all mocktails.',
  'Free dessert on bills above ₹999 this week.',
  'We miss you! Enjoy 15% OFF on your next order.',
];

/* =====================================================================
   TYPES
   ===================================================================== */
interface LedgerEntry {
  id: string;
  type: 'add' | 'redeem';
  points: number;
  reason: string;
  at: string;
}
interface Address {
  id: string;
  label: string;
  line: string;
}
interface Note {
  id: string;
  text: string;
  at: string;
}
interface CustomerRec {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vip?: boolean;
  loyalty?: boolean;
  createdAt: string;
  diet?: string;
  spice?: string;
  allergies?: string;
  addresses?: Address[];
  notes?: Note[];
  ledger?: LedgerEntry[];
  stored?: boolean; // false = derived from POS orders only
}
type RecentOrder = BillDoc & { id: string; itemIds?: { id: string; qty: number }[] };

interface CustomerView extends CustomerRec {
  key: string;
  orders: RecentOrder[];
  spent: number;
  earned: number;
  points: number;
  lifetime: number;
  tier: (typeof TIERS)[number];
  next?: (typeof TIERS)[number];
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
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const phoneKey = (p = '') => p.replace(/\D/g, '').slice(-10);
const fmtPhone = (p: string) => {
  const k = phoneKey(p);
  return k.length === 10 ? `+91 ${k.slice(0, 5)} ${k.slice(5)}` : p;
};
const initials = (n: string) =>
  n
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || '?';
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDateTime = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
const shortNo = (n: string) => `#${n.replace(/^BTZ-/, 'RP')}`;
const tierFor = (lifetime: number) => {
  let i = 0;
  TIERS.forEach((t, k) => lifetime >= t.min && (i = k));
  return { tier: TIERS[i], next: TIERS[i + 1] };
};
const TYPE_META: Record<OrderTypeKey, { label: string; icon: React.ElementType; cls: string }> = {
  dine_in: { label: 'Dine In', icon: Utensils, cls: 'bg-rose-50 text-[#B0123F]' },
  takeaway: { label: 'Takeaway', icon: ShoppingBag, cls: 'bg-rose-50 text-[#B0123F]' },
  delivery: { label: 'Delivery', icon: Bike, cls: 'bg-rose-50 text-[#B0123F]' },
};

function csvEscape(v: unknown) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') {
      row.push(cur);
      cur = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cur);
      rows.push(row);
      row = [];
      cur = '';
    } else cur += c;
  }
  if (cur || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows.filter((r) => r.some((x) => x.trim()));
}
function downloadText(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** A4 customer statement (orders + loyalty ledger). */
async function buildStatementPdf(c: CustomerView) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const M = 14;
  const rs = (p: number) => `Rs. ${(p / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  doc.setFillColor(128, 13, 50);
  doc.rect(0, 0, W, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(OUTLET_INFO.name, M, 13);
  doc.setFontSize(14);
  doc.text('CUSTOMER STATEMENT', W - M, 13, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`${OUTLET_INFO.branch} · ${OUTLET_INFO.phone}`, M, 20);
  doc.text(`Generated: ${fmtDateTime(new Date().toISOString())}`, W - M, 20, { align: 'right' });

  doc.setTextColor(25, 25, 35);
  let y = 38;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(c.name, M, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${fmtPhone(c.phone)}${c.email ? `   ${c.email}` : ''}`, M, y + 5);
  doc.text(`Member since ${fmtDate(c.createdAt)}`, M, y + 10);
  const sumL = [`Orders: ${c.orders.length}`, `Total spent: ${rs(c.spent)}`, `Points: ${c.points} (${c.tier.name})`];
  sumL.forEach((t, i) => doc.text(t, W - M, y + i * 5, { align: 'right' }));
  y += 20;

  const head = (cols: [string, number, 'left' | 'right'][]) => {
    doc.setFillColor(249, 232, 237);
    doc.rect(M, y, W - M * 2, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(128, 13, 50);
    cols.forEach(([h, x, a]) => doc.text(h, x, y + 4.8, { align: a }));
    doc.setTextColor(25, 25, 35);
    doc.setFont('helvetica', 'normal');
    y += 10;
  };
  const orderCols: [string, number, 'left' | 'right'][] = [
    ['Date', M + 2, 'left'],
    ['Order #', M + 44, 'left'],
    ['Type', M + 78, 'left'],
    ['Items', M + 120, 'right'],
    ['Amount', W - M - 2, 'right'],
  ];
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Order History', M, y);
  y += 4;
  head(orderCols);
  c.orders.forEach((o) => {
    if (y > 275) {
      doc.addPage();
      y = 18;
      head(orderCols);
    }
    doc.setFontSize(8.5);
    doc.text(fmtDateTime(o.createdAt), M + 2, y);
    doc.text(o.orderNumber, M + 44, y);
    doc.text(TYPE_META[o.orderType]?.label ?? '', M + 78, y);
    doc.text(String(o.lines.reduce((a, l) => a + l.qty, 0)), M + 120, y, { align: 'right' });
    doc.text(rs(o.grandTotalPaise), W - M - 2, y, { align: 'right' });
    y += 6;
  });
  if (!c.orders.length) {
    doc.text('No orders yet.', M + 2, y);
    y += 6;
  }

  if (c.ledger?.length) {
    y += 6;
    if (y > 255) {
      doc.addPage();
      y = 18;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Loyalty Adjustments', M, y);
    y += 4;
    const lc: [string, number, 'left' | 'right'][] = [
      ['Date', M + 2, 'left'],
      ['Reason', M + 44, 'left'],
      ['Points', W - M - 2, 'right'],
    ];
    head(lc);
    c.ledger.forEach((l) => {
      if (y > 275) {
        doc.addPage();
        y = 18;
        head(lc);
      }
      doc.setFontSize(8.5);
      doc.text(fmtDateTime(l.at), M + 2, y);
      doc.text(l.reason.slice(0, 70), M + 44, y);
      doc.text(`${l.type === 'add' ? '+' : '-'}${l.points}`, W - M - 2, y, { align: 'right' });
      y += 6;
    });
  }
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 120);
  doc.text(`Earned points: ${c.earned} · Balance: ${c.points} · Powered by CyberLim POS`, M, 287);
  return doc;
}

/* =====================================================================
   SMALL UI
   ===================================================================== */
const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; subtitle?: string; width?: string; children: React.ReactNode }> = ({ open, onClose, title, subtitle, width = 'max-w-md', children }) =>
  open ? (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/40" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white w-full ${width} max-h-[90dvh] flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl`}>
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
  <div className="shrink-0 flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 min-w-[170px]">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tint}`}>{icon}</div>
    <div>
      <p className="text-xl font-black text-[#191923] leading-none">{value}</p>
      <p className="text-xs font-semibold text-gray-500 mt-1">{label}</p>
    </div>
  </div>
);

const Avatar = ({ name, size = 'w-12 h-12 text-sm' }: { name: string; size?: string }) => (
  <span className={`${size} rounded-full bg-[#FDEBF1] text-[#800D32] font-black flex items-center justify-center shrink-0`}>{initials(name)}</span>
);

const inp = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800D32]/30';

/* =====================================================================
   LIST ROW
   ===================================================================== */
const CustomerRow = memo(({ c, selected, onSelect }: { c: CustomerView; selected: boolean; onSelect: (id: string) => void }) => (
  <button
    onClick={() => onSelect(c.id)}
    className={`w-full flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors ${selected ? 'border-[#E58AA7] bg-[#FFF5F8]' : 'border-transparent hover:bg-gray-50'}`}
  >
    <Avatar name={c.name} />
    <span className="flex-1 min-w-0">
      <span className="flex items-center gap-1 text-[15px] font-black text-[#191923] truncate">
        {c.name}
        {c.vip && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
      </span>
      <span className="block text-xs font-semibold text-gray-500">{fmtPhone(c.phone)}</span>
    </span>
    <span className="text-right shrink-0">
      <span className="block text-[15px] font-black text-[#191923]">{formatINR(c.spent)}</span>
      <span className="block text-xs font-semibold text-gray-500">
        {c.orders.length} Order{c.orders.length === 1 ? '' : 's'}
      </span>
    </span>
  </button>
));

/* =====================================================================
   PAGE
   ===================================================================== */
export const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const [stored, setStored] = useState<CustomerRec[]>(() => readJSON(STORE_KEY, []));
  const [orders, setOrders] = useState<RecentOrder[]>(() => readJSON('pos.recent', []));
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'loyalty' | 'vip'>('all');
  const [sort, setSort] = useState<'spent' | 'orders' | 'recent' | 'name'>('spent');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [detailTab, setDetailTab] = useState<'orders' | 'loyalty' | 'prefs' | 'addresses' | 'notes'>('orders');
  const [period, setPeriod] = useState<'30' | '90' | '180' | 'all'>('180');
  const [modal, setModal] = useState<null | 'add' | 'edit' | 'points' | 'redeem' | 'offer' | 'order' | 'import' | 'delete'>(null);
  const [viewOrder, setViewOrder] = useState<RecentOrder | null>(null);
  const [menu, setMenu] = useState<null | 'profile' | 'quick' | 'sort'>(null);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => writeJSON(STORE_KEY, stored), [stored]);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'pos.recent') setOrders(readJSON('pos.recent', []));
      if (e.key === STORE_KEY) setStored(readJSON(STORE_KEY, []));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [menu]);
  const notify = (type: 'success' | 'error', text: string) => setToast({ type, text });

  /* ---------- merge stored customers + customers from POS orders ---------- */
  const customers: CustomerView[] = useMemo(() => {
    const ordersBy: Record<string, RecentOrder[]> = {};
    orders.forEach((o) => {
      const k = phoneKey(o.customer?.phone);
      if (k.length === 10) (ordersBy[k] ||= []).push(o);
    });
    const map = new Map<string, CustomerRec>();
    stored.forEach((c) => map.set(phoneKey(c.phone), { ...c, stored: true }));
    Object.entries(ordersBy).forEach(([k, list]) => {
      if (map.has(k)) return;
      const first = list.reduce((a, o) => (o.createdAt < a ? o.createdAt : a), list[0].createdAt);
      const named = list.find((o) => o.customer?.name)?.customer?.name;
      map.set(k, { id: `auto-${k}`, name: named || 'Guest', phone: k, createdAt: first, stored: false });
    });
    return [...map.entries()].map(([k, c]) => {
      const list = (ordersBy[k] ?? []).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const spent = list.reduce((a, o) => a + o.grandTotalPaise, 0);
      const earned = Math.floor(spent / EARN_PER_PAISE);
      const added = (c.ledger ?? []).filter((l) => l.type === 'add').reduce((a, l) => a + l.points, 0);
      const redeemed = (c.ledger ?? []).filter((l) => l.type === 'redeem').reduce((a, l) => a + l.points, 0);
      const lifetime = earned + added;
      const { tier, next } = tierFor(lifetime);
      return { ...c, key: k, orders: list, spent, earned, points: Math.max(0, lifetime - redeemed), lifetime, tier, next };
    });
  }, [stored, orders]);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: customers.length,
      newMonth: customers.filter((c) => {
        const d = new Date(c.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length,
      spent: customers.reduce((a, c) => a + c.spent, 0),
      loyalty: customers.filter((c) => c.loyalty).length,
      vip: customers.filter((c) => c.vip).length,
      points: customers.reduce((a, c) => a + c.lifetime, 0),
    };
  }, [customers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qd = q.replace(/\D/g, '');
    const list = customers.filter(
      (c) =>
        (tab === 'all' || (tab === 'vip' ? c.vip : c.loyalty)) &&
        (!q || c.name.toLowerCase().includes(q) || (qd.length >= 3 && c.phone.replace(/\D/g, '').includes(qd)) || (c.email ?? '').toLowerCase().includes(q))
    );
    const last = (c: CustomerView) => c.orders[0]?.createdAt ?? c.createdAt;
    return list.sort((a, b) =>
      sort === 'spent' ? b.spent - a.spent : sort === 'orders' ? b.orders.length - a.orders.length : sort === 'recent' ? last(b).localeCompare(last(a)) : a.name.localeCompare(b.name)
    );
  }, [customers, query, tab, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => setPage(1), [query, tab, sort]);
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (selectedId && customers.some((c) => c.id === selectedId)) return;
    setSelectedId(filtered[0]?.id);
  }, [customers, filtered, selectedId]);

  const sel = customers.find((c) => c.id === selectedId);

  /* ---------- mutations ---------- */
  /** Upsert by phone; derived (auto) customers become stored on first edit. */
  const save = useCallback((rec: CustomerRec) => {
    setStored((list) => {
      const k = phoneKey(rec.phone);
      const clean = { ...rec };
      delete clean.stored;
      if (clean.id.startsWith('auto-')) clean.id = uid();
      const i = list.findIndex((c) => c.id === rec.id || phoneKey(c.phone) === k);
      return i >= 0 ? list.map((c, j) => (j === i ? { ...c, ...clean, id: c.id } : c)) : [...list, clean];
    });
    return phoneKey(rec.phone);
  }, []);

  // Keep selection after an auto customer becomes stored (its id changes)
  const saveSel = (patch: Partial<CustomerRec>) => {
    if (!sel) return;
    const k = save({ ...stripView(sel), ...patch });
    setTimeout(() => {
      const found = readJSON<CustomerRec[]>(STORE_KEY, []).find((c) => phoneKey(c.phone) === k);
      if (found) setSelectedId(found.id);
    }, 0);
  };

  const removeSel = () => {
    if (!sel) return;
    setStored((l) => l.filter((c) => c.id !== sel.id));
    setSelectedId(undefined);
    setModal(null);
    notify('success', sel.orders.length ? 'Profile removed (order history stays in POS)' : 'Customer deleted');
  };

  const exportCsv = (list: CustomerView[], name = 'customers.csv') => {
    const rows = [['Name', 'Phone', 'Email', 'VIP', 'Loyalty', 'Orders', 'Total Spent (₹)', 'Points', 'Tier', 'Member Since']];
    list.forEach((c) =>
      rows.push([c.name, fmtPhone(c.phone), c.email ?? '', c.vip ? 'Yes' : 'No', c.loyalty ? 'Yes' : 'No', String(c.orders.length), (c.spent / 100).toFixed(2), String(c.points), c.tier.name, fmtDate(c.createdAt)])
    );
    downloadText(name, '﻿' + rows.map((r) => r.map(csvEscape).join(',')).join('\n'));
    notify('success', `Exported ${list.length} customer(s)`);
  };

  const importCsv = async (file: File) => {
    const rows = parseCsv(await file.text());
    if (rows.length < 2) return notify('error', 'CSV has no rows');
    const h = rows[0].map((x) => x.trim().toLowerCase());
    const ni = h.findIndex((x) => x.includes('name'));
    const pi = h.findIndex((x) => x.includes('phone') || x.includes('mobile'));
    const ei = h.findIndex((x) => x.includes('mail'));
    if (ni < 0 || pi < 0) return notify('error', 'CSV needs "Name" and "Phone" columns');
    let added = 0;
    let skipped = 0;
    setStored((list) => {
      const out = [...list];
      const keys = new Set(out.map((c) => phoneKey(c.phone)));
      rows.slice(1).forEach((r) => {
        const k = phoneKey(r[pi]);
        if (k.length !== 10 || !r[ni]?.trim()) return skipped++;
        if (keys.has(k)) {
          const i = out.findIndex((c) => phoneKey(c.phone) === k);
          out[i] = { ...out[i], name: r[ni].trim(), email: (ei >= 0 && r[ei]?.trim()) || out[i].email };
        } else {
          out.push({ id: uid(), name: r[ni].trim(), phone: k, email: ei >= 0 ? r[ei]?.trim() || undefined : undefined, createdAt: new Date().toISOString(), loyalty: true });
          keys.add(k);
          added++;
        }
      });
      return out;
    });
    setModal(null);
    setTimeout(() => notify('success', `Imported ${added} new · ${skipped} skipped`), 0);
  };

  const select = useCallback((id: string) => {
    setSelectedId(id);
    setMobileDetail(true);
  }, []);

  /* ---------- order history filter ---------- */
  const periodOrders = useMemo(() => {
    if (!sel) return [];
    if (period === 'all') return sel.orders;
    const cutoff = Date.now() - Number(period) * 864e5;
    return sel.orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff);
  }, [sel, period]);

  const insights = useMemo(() => {
    if (!sel || !sel.orders.length) return null;
    const first = new Date(sel.orders[sel.orders.length - 1].createdAt).getTime();
    const months = Math.max(1, (Date.now() - first) / (30 * 864e5));
    const itemQty: Record<string, number> = {};
    const types: Record<string, number> = {};
    sel.orders.forEach((o) => {
      types[o.orderType] = (types[o.orderType] ?? 0) + 1;
      o.lines.forEach((l) => (itemQty[l.name] = (itemQty[l.name] ?? 0) + l.qty));
    });
    const top = (m: Record<string, number>) => Object.entries(m).sort((a, b) => b[1] - a[1])[0]?.[0];
    return {
      aov: Math.round(sel.spent / sel.orders.length),
      freq: (sel.orders.length / months).toFixed(1),
      favType: TYPE_META[top(types) as OrderTypeKey]?.label ?? '—',
      favItem: top(itemQty) ?? '—',
      last: sel.orders[0].createdAt,
    };
  }, [sel]);

  const openWhatsApp = (text: string) => {
    if (!sel) return;
    window.open(`https://wa.me/91${phoneKey(sel.phone)}?text=${encodeURIComponent(`Hi ${sel.name.split(' ')[0]}, ${text}\n— ${OUTLET_INFO.name}`)}`, '_blank', 'noopener');
  };

  const statement = async () => {
    if (!sel) return;
    try {
      outputPdf(await buildStatementPdf(sel), `Statement-${sel.name.replace(/\s+/g, '-')}.pdf`, 'download');
    } catch (e) {
      console.error(e);
      notify('error', 'Could not generate statement');
    }
  };

  /* ---------- render ---------- */
  const tierPct = sel?.next ? Math.min(100, ((sel.lifetime - sel.tier.min) / (sel.next.min - sel.tier.min)) * 100) : 100;

  const profile = sel && (
    <div className="flex flex-col gap-3">
      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-start gap-4">
          <button onClick={() => setMobileDetail(false)} className="md:hidden w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center" aria-label="Back">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Avatar name={sel.name} size="w-20 h-20 text-2xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-black text-[#191923] truncate">{sel.name}</h2>
              {sel.vip && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-black">
                  <Crown className="w-3.5 h-3.5" /> VIP
                </span>
              )}
              {!sel.stored && <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold">From POS</span>}
            </div>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 mt-2 text-sm font-semibold text-[#191923]">
              <a href={`tel:+91${phoneKey(sel.phone)}`} className="flex items-center gap-2 hover:text-[#800D32]">
                <Phone className="w-4 h-4 text-[#800D32]" /> {fmtPhone(sel.phone)}
              </a>
              <span className="flex items-start gap-2 row-span-2">
                <CalendarDays className="w-4 h-4 text-[#800D32] mt-0.5" />
                <span>
                  <span className="block text-xs text-gray-500">Member Since</span>
                  {fmtDate(sel.createdAt)}
                </span>
              </span>
              {sel.email ? (
                <a href={`mailto:${sel.email}`} className="flex items-center gap-2 hover:text-[#800D32] truncate">
                  <Mail className="w-4 h-4 text-[#800D32]" /> {sel.email}
                </a>
              ) : (
                <span className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-4 h-4" /> No email
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setModal('edit')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold text-[#191923] hover:border-[#F3C3D2]">
              <PencilLine className="w-4 h-4 text-[#800D32]" /> Edit
            </button>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenu(menu === 'profile' ? null : 'profile');
                }}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600"
                aria-label="More"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {menu === 'profile' && (
                <ProfileMenu
                  vip={!!sel.vip}
                  loyalty={!!sel.loyalty}
                  onVip={() => (saveSel({ vip: !sel.vip }), notify('success', sel.vip ? 'VIP removed' : 'Marked as VIP'))}
                  onLoyalty={() => (saveSel({ loyalty: !sel.loyalty }), notify('success', sel.loyalty ? 'Removed from loyalty' : 'Enrolled in loyalty'))}
                  onCopy={() => (navigator.clipboard?.writeText(fmtPhone(sel.phone)), notify('success', 'Phone copied'))}
                  onExport={() => exportCsv([sel], `${sel.name.replace(/\s+/g, '-')}.csv`)}
                  onDelete={sel.stored ? () => setModal('delete') : undefined}
                />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-4">
          {[
            { i: <UserRound className="w-5 h-5 text-[#800D32]" />, l: 'Total Orders', v: String(sel.orders.length) },
            { i: <IndianRupee className="w-5 h-5 text-[#800D32]" />, l: 'Total Spent', v: formatINR(sel.spent) },
            { i: <Star className="w-5 h-5 text-amber-500" />, l: 'Loyalty Points', v: sel.points.toLocaleString('en-IN') },
            {
              i: <Gift className="w-5 h-5 text-amber-500" />,
              l: 'Tier',
              v: (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black ${sel.tier.cls}`}>
                  <Crown className="w-3 h-3" /> {sel.tier.name}
                </span>
              ),
            },
          ].map((s) => (
            <div key={s.l} className="flex items-center gap-3 rounded-xl bg-[#FFF8FA] border border-rose-50 px-3 py-2.5">
              {s.i}
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-gray-500">{s.l}</p>
                <p className="text-lg font-black text-[#191923] leading-tight truncate">{s.v}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex gap-1.5 p-2 overflow-x-auto border-b border-gray-100">
          {(
            [
              { k: 'orders', l: 'Order History', I: List },
              { k: 'loyalty', l: 'Loyalty & Rewards', I: Gift },
              { k: 'prefs', l: 'Preferences', I: Heart },
              { k: 'addresses', l: 'Addresses', I: MapPin },
              { k: 'notes', l: 'Notes', I: StickyNote },
            ] as const
          ).map((t) => (
            <button
              key={t.k}
              onClick={() => setDetailTab(t.k)}
              className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold ${detailTab === t.k ? 'bg-[#800D32] text-white' : 'text-[#191923] hover:bg-gray-50'}`}
            >
              <t.I className="w-4 h-4" /> {t.l}
            </button>
          ))}
        </div>

        <div className="p-4">
          {detailTab === 'orders' && (
            <>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-lg font-black text-[#191923]">Order History ({periodOrders.length})</h3>
                <div className="relative">
                  <CalendarDays className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#800D32] pointer-events-none" />
                  <select value={period} onChange={(e) => setPeriod(e.target.value as typeof period)} className="appearance-none pl-9 pr-8 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold focus:outline-none">
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 3 Months</option>
                    <option value="180">Last 6 Months</option>
                    <option value="all">All Time</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                </div>
              </div>
              {periodOrders.length === 0 ? (
                <p className="py-8 text-center text-sm font-semibold text-gray-500">No orders in this period.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-[#FAF7F8] text-left text-xs font-bold text-gray-500">
                      <tr>
                        <th className="px-3 py-2.5">Order #</th>
                        <th className="px-3 py-2.5">Date & Time</th>
                        <th className="px-3 py-2.5">Type</th>
                        <th className="px-3 py-2.5 text-right">Amount</th>
                        <th className="px-3 py-2.5 text-center">Items</th>
                        <th className="px-3 py-2.5">Status</th>
                        <th className="px-3 py-2.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {periodOrders.map((o) => {
                        const T = TYPE_META[o.orderType] ?? TYPE_META.dine_in;
                        return (
                          <tr key={o.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2.5 font-black whitespace-nowrap">{shortNo(o.orderNumber)}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{fmtDateTime(o.createdAt)}</td>
                            <td className="px-3 py-2.5">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${T.cls}`}>
                                <T.icon className="w-3.5 h-3.5" /> {T.label}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right font-bold whitespace-nowrap">{formatINR(o.grandTotalPaise)}</td>
                            <td className="px-3 py-2.5 text-center">{o.lines.reduce((a, l) => a + l.qty, 0)}</td>
                            <td className="px-3 py-2.5">
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">Completed</span>
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center justify-center gap-1.5">
                                <button onClick={() => (setViewOrder(o), setModal('order'))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-[#800D32]" aria-label="View order">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={async () => outputPdf(await buildBillPdf(o), `Bill-${o.orderNumber}.pdf`, 'download')}
                                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-[#800D32]"
                                  aria-label="Download bill"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {detailTab === 'loyalty' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { l: 'Earned from orders', v: sel.earned },
                  { l: 'Bonus added', v: (sel.ledger ?? []).filter((x) => x.type === 'add').reduce((a, x) => a + x.points, 0) },
                  { l: 'Redeemed', v: (sel.ledger ?? []).filter((x) => x.type === 'redeem').reduce((a, x) => a + x.points, 0) },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl bg-[#FFF8FA] p-3">
                    <p className="text-lg font-black text-[#191923]">{s.v.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] font-semibold text-gray-500">{s.l}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Earns 1 point per ₹{EARN_PER_PAISE / 100} spent · 1 point = ₹{(POINT_VALUE_PAISE / 100).toFixed(2)} on redemption · Balance worth {formatINR(sel.points * POINT_VALUE_PAISE)}
              </p>
              {!sel.loyalty && (
                <button onClick={() => saveSel({ loyalty: true })} className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#F3C3D2] text-[#800D32] text-sm font-black">
                  Enroll in loyalty programme
                </button>
              )}
              {(sel.ledger ?? []).length === 0 ? (
                <p className="text-sm font-semibold text-gray-500 py-4 text-center">No manual adjustments yet.</p>
              ) : (
                <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100">
                  {[...(sel.ledger ?? [])].reverse().map((l) => (
                    <li key={l.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${l.type === 'add' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-[#800D32]'}`}>
                        {l.type === 'add' ? <Coins className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-bold text-[#191923] truncate">{l.reason}</span>
                        <span className="block text-[11px] text-gray-400">{fmtDateTime(l.at)}</span>
                      </span>
                      <span className={`font-black ${l.type === 'add' ? 'text-emerald-600' : 'text-[#800D32]'}`}>
                        {l.type === 'add' ? '+' : '−'}
                        {l.points}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {detailTab === 'prefs' && <PrefsForm c={sel} favItem={insights?.favItem} onSave={(p) => (saveSel(p), notify('success', 'Preferences saved'))} />}

          {detailTab === 'addresses' && (
            <ListEditor
              items={(sel.addresses ?? []).map((a) => ({ id: a.id, title: a.label, body: a.line }))}
              empty="No saved addresses."
              fields={['Label (Home / Office)', 'Full address']}
              onAdd={([label, line]) => saveSel({ addresses: [...(sel.addresses ?? []), { id: uid(), label: label || 'Address', line }] })}
              onRemove={(id) => saveSel({ addresses: (sel.addresses ?? []).filter((a) => a.id !== id) })}
              icon={<MapPin className="w-4 h-4" />}
            />
          )}

          {detailTab === 'notes' && (
            <ListEditor
              items={[...(sel.notes ?? [])].reverse().map((n) => ({ id: n.id, title: fmtDateTime(n.at), body: n.text }))}
              empty="No notes yet."
              fields={['Note (e.g. prefers window seat)']}
              onAdd={([text]) => saveSel({ notes: [...(sel.notes ?? []), { id: uid(), text, at: new Date().toISOString() }] })}
              onRemove={(id) => saveSel({ notes: (sel.notes ?? []).filter((n) => n.id !== id) })}
              icon={<StickyNote className="w-4 h-4" />}
            />
          )}
        </div>
      </div>
    </div>
  );

  const side = sel && (
    <div className="flex flex-col gap-3">
      {/* Loyalty summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="flex items-center gap-2 text-base font-black text-[#191923] mb-3">
          <Star className="w-5 h-5 text-[#800D32]" /> Loyalty Summary
        </h3>
        <div className="flex items-center gap-4">
          <div className="relative w-32 h-32 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#FBE7EE" strokeWidth="10" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="url(#loyGrad)" strokeWidth="10" strokeLinecap="round" pathLength={100} strokeDasharray={`${tierPct} 100`} />
              <defs>
                <linearGradient id="loyGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#E11D48" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Crown className="w-5 h-5 text-amber-500" />
              <span className="text-xl font-black text-[#191923] leading-tight">{sel.points.toLocaleString('en-IN')}</span>
              <span className="text-[11px] font-semibold text-gray-500">Points</span>
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <p className="flex items-center gap-2 text-sm font-bold text-gray-600">
              Tier: <span className={`px-3 py-0.5 rounded-full text-sm font-black ${sel.tier.cls}`}>{sel.tier.name}</span>
            </p>
            {sel.next ? (
              <>
                <p className="text-xs font-semibold text-gray-600">
                  <ChevronRight className="inline w-3.5 h-3.5 text-[#800D32]" /> Next Tier: {sel.next.name}
                  <br />
                  {(sel.next.min - sel.lifetime).toLocaleString('en-IN')} more points
                </p>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-[#C0163F]" style={{ width: `${tierPct}%` }} />
                </div>
              </>
            ) : (
              <p className="text-xs font-semibold text-gray-600">Top tier reached</p>
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="flex items-center gap-2 text-base font-black text-[#191923] mb-3">
          <BarChart3 className="w-5 h-5 text-[#800D32]" /> Customer Insights
        </h3>
        {insights ? (
          <dl className="space-y-2.5 text-sm">
            {[
              { I: CalendarDays, l: 'Avg. Order Value', v: formatINR(insights.aov) },
              { I: Clock, l: 'Visit Frequency', v: `${insights.freq} times / month` },
              { I: Heart, l: 'Preferred Order Type', v: insights.favType },
              { I: Utensils, l: 'Favorite Item', v: insights.favItem },
              { I: Clock, l: 'Last Visit', v: fmtDate(insights.last) },
            ].map((r) => (
              <div key={r.l} className="flex items-center gap-2.5">
                <r.I className="w-4 h-4 text-[#800D32] shrink-0" />
                <dt className="flex-1 font-semibold text-gray-600">{r.l}</dt>
                <dd className="font-black text-[#191923] text-right truncate max-w-[50%]">{r.v}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm font-semibold text-gray-500">Insights appear after the first order.</p>
        )}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="flex items-center gap-2 text-base font-black text-[#191923] mb-3">
          <Zap className="w-5 h-5 text-[#800D32]" /> Quick Actions
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { l: 'New Order', I: ShoppingCart, on: () => navigate('/pos') },
            { l: 'Add Points', I: Coins, on: () => setModal('points') },
            { l: 'Redeem Points', I: Gift, on: () => (sel.points > 0 ? setModal('redeem') : notify('error', 'No points to redeem')) },
            { l: 'Send Offer', I: Tag, on: () => setModal('offer') },
            { l: 'View Statement', I: FileText, on: statement },
          ].map((a) => (
            <button key={a.l} onClick={a.on} className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-gray-100 bg-white shadow-sm text-xs font-bold text-[#191923] hover:border-[#F3C3D2] hover:bg-[#FFF7FA]">
              <a.I className="w-5 h-5 text-[#800D32]" />
              {a.l}
            </button>
          ))}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenu(menu === 'quick' ? null : 'quick');
              }}
              className="w-full h-full flex flex-col items-center gap-1.5 py-3 rounded-xl border border-gray-100 bg-white shadow-sm text-xs font-bold text-[#191923] hover:border-[#F3C3D2]"
            >
              <MoreHorizontal className="w-5 h-5 text-[#800D32]" /> More
            </button>
            {menu === 'quick' && (
              <ProfileMenu
                up
                vip={!!sel.vip}
                loyalty={!!sel.loyalty}
                onVip={() => saveSel({ vip: !sel.vip })}
                onLoyalty={() => saveSel({ loyalty: !sel.loyalty })}
                onCopy={() => (navigator.clipboard?.writeText(fmtPhone(sel.phone)), notify('success', 'Phone copied'))}
                onExport={() => exportCsv([sel], `${sel.name.replace(/\s+/g, '-')}.csv`)}
                onDelete={sel.stored ? () => setModal('delete') : undefined}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 overflow-hidden" style={{ height: `calc(100dvh - var(--pos-offset, ${PAGE_OFFSET}))` }}>
      {toast && (
        <div className={`fixed top-5 right-5 z-[80] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border ${toast.type === 'success' ? 'bg-[#800D32] text-white border-rose-400' : 'bg-white text-rose-700 border-rose-200'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
          {toast.text}
        </div>
      )}
      <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => (e.target.files?.[0] && importCsv(e.target.files[0]), (e.target.value = ''))} />

      {/* ===== Header ===== */}
      <div className="flex items-center gap-3 flex-wrap xl:flex-nowrap">
        <div className="flex items-center gap-3 mr-auto">
          <Users className="w-12 h-12 text-[#800D32]" strokeWidth={1.7} />
          <div>
            <h1 className="text-2xl font-black text-[#191923] leading-tight">Customers</h1>
            <p className="text-xs text-gray-500 font-medium hidden sm:block">Manage customer profiles, order history, loyalty and more</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 overflow-x-auto max-w-full pb-0.5">
          <StatCard icon={<Users className="w-6 h-6 text-[#800D32]" />} value={stats.total.toLocaleString('en-IN')} label="Total Customers" tint="bg-rose-50" />
          <StatCard icon={<TrendingUp className="w-6 h-6 text-emerald-600" />} value={stats.newMonth.toLocaleString('en-IN')} label="New (This Month)" tint="bg-emerald-50" />
          <StatCard icon={<ShoppingCart className="w-6 h-6 text-[#800D32]" />} value={formatINR(stats.spent)} label="Total Spent" tint="bg-rose-50" />
          <StatCard icon={<Star className="w-6 h-6 text-amber-500" />} value={stats.loyalty.toLocaleString('en-IN')} label="Loyalty Members" tint="bg-amber-50" />
          <StatCard icon={<Gift className="w-6 h-6 text-[#800D32]" />} value={stats.points.toLocaleString('en-IN')} label="Points Issued" tint="bg-rose-50" />
        </div>
      </div>

      {/* ===== Body ===== */}
      <div className="flex-1 min-h-0 flex gap-3">
        {/* Customer list */}
        <aside className={`${mobileDetail ? 'hidden md:flex' : 'flex'} w-full md:w-[320px] xl:w-[360px] 2xl:w-[400px] shrink-0 min-h-0 flex-col gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-3`}>
          <div className="grid grid-cols-[1.2fr_1fr] gap-2">
            <button onClick={() => setModal('add')} className="inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#800D32] text-white text-sm font-black hover:bg-[#6a0a29]">
              <Plus className="w-4 h-4" /> Add Customer
            </button>
            <button onClick={() => setModal('import')} className="inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#191923] hover:border-[#F3C3D2]">
              <Download className="w-4 h-4" /> Import / Export
            </button>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customer (name, phone, email)..." className={`${inp} pl-9`} />
            </div>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenu(menu === 'sort' ? null : 'sort');
                }}
                className="w-11 h-full rounded-xl border border-gray-200 flex items-center justify-center text-gray-600"
                aria-label="Sort"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              {menu === 'sort' && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-gray-100 shadow-xl p-1 z-20" onClick={(e) => e.stopPropagation()}>
                  <p className="px-2.5 pt-1.5 pb-1 text-[10px] font-black uppercase text-gray-400">Sort by</p>
                  {(
                    [
                      ['spent', 'Highest spent'],
                      ['orders', 'Most orders'],
                      ['recent', 'Recent visit'],
                      ['name', 'Name A–Z'],
                    ] as const
                  ).map(([k, l]) => (
                    <button key={k} onClick={() => (setSort(k), setMenu(null))} className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold ${sort === k ? 'bg-[#FDEBF1] text-[#800D32]' : 'text-gray-700 hover:bg-gray-50'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 rounded-xl border border-gray-100 p-0.5 bg-[#FAF7F8]">
            {(
              [
                ['all', `All (${stats.total.toLocaleString('en-IN')})`],
                ['loyalty', `Loyalty (${stats.loyalty})`],
                ['vip', `VIP (${stats.vip})`],
              ] as const
            ).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={`py-2.5 rounded-lg text-sm font-bold ${tab === k ? 'bg-[#800D32] text-white' : 'text-[#191923]'}`}>
                {l}
              </button>
            ))}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
            {pageRows.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-10 h-10 text-rose-200 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-600">{customers.length ? 'No customers match' : 'No customers yet'}</p>
                <p className="text-xs text-gray-400">Add one, import a CSV, or settle a POS order with a phone number</p>
              </div>
            ) : (
              pageRows.map((c) => <CustomerRow key={c.id} c={c} selected={c.id === selectedId} onSelect={select} />)
            )}
          </div>
          {pages > 1 && <Pager page={page} pages={pages} setPage={setPage} />}
        </aside>

        {/* Profile + side */}
        <div className={`${mobileDetail ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 min-h-0 gap-3`}>
          {sel ? (
            <>
              <section className="flex-1 min-w-0 min-h-0 overflow-y-auto">
                {profile}
                <div className="xl:hidden mt-3">{side}</div>
              </section>
              <aside className="hidden xl:block w-[340px] 2xl:w-[380px] shrink-0 min-h-0 overflow-y-auto">{side}</aside>
            </>
          ) : (
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center p-6">
              <UserRound className="w-10 h-10 text-rose-200 mb-2" />
              <p className="text-sm font-bold text-gray-600">Select a customer</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== Modals ===== */}
      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'edit' ? 'Edit Customer' : 'Add Customer'}>
        <CustomerForm
          initial={modal === 'edit' && sel ? stripView(sel) : undefined}
          existingKeys={customers.filter((c) => c.id !== (modal === 'edit' ? sel?.id : '')).map((c) => c.key)}
          onSubmit={(rec) => {
            const k = save(rec);
            setModal(null);
            setTimeout(() => {
              const found = readJSON<CustomerRec[]>(STORE_KEY, []).find((c) => phoneKey(c.phone) === k);
              if (found) setSelectedId(found.id);
            }, 0);
            notify('success', modal === 'edit' ? 'Customer updated' : `${rec.name} added`);
          }}
        />
      </Modal>

      <Modal open={modal === 'import'} onClose={() => setModal(null)} title="Import / Export" subtitle="CSV works with Excel and Google Sheets">
        <div className="space-y-3">
          <button onClick={() => fileRef.current?.click()} className="w-full flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left hover:border-[#F3C3D2]">
            <Upload className="w-6 h-6 text-[#800D32]" />
            <span>
              <span className="block text-sm font-black text-[#191923]">Import CSV</span>
              <span className="block text-xs text-gray-500">Columns: Name, Phone, Email (optional). Existing phones are updated.</span>
            </span>
          </button>
          <button onClick={() => (exportCsv(filtered), setModal(null))} className="w-full flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left hover:border-[#F3C3D2]">
            <Download className="w-6 h-6 text-[#800D32]" />
            <span>
              <span className="block text-sm font-black text-[#191923]">Export {filtered.length} customer(s)</span>
              <span className="block text-xs text-gray-500">Uses the current tab and search filter.</span>
            </span>
          </button>
        </div>
      </Modal>

      <Modal open={modal === 'points' || modal === 'redeem'} onClose={() => setModal(null)} title={modal === 'redeem' ? 'Redeem Points' : 'Add Points'} subtitle={sel ? `${sel.name} · balance ${sel.points} points` : ''}>
        {sel && (
          <PointsForm
            mode={modal === 'redeem' ? 'redeem' : 'add'}
            balance={sel.points}
            onSubmit={(points, reason) => {
              saveSel({ ledger: [...(sel.ledger ?? []), { id: uid(), type: modal === 'redeem' ? 'redeem' : 'add', points, reason, at: new Date().toISOString() }] });
              setModal(null);
              notify('success', modal === 'redeem' ? `${points} points redeemed (worth ${formatINR(points * POINT_VALUE_PAISE)})` : `${points} points added`);
            }}
          />
        )}
      </Modal>

      <Modal open={modal === 'offer'} onClose={() => setModal(null)} title="Send Offer" subtitle={sel ? `Opens WhatsApp to ${fmtPhone(sel.phone)}` : ''}>
        <OfferForm
          onSend={(t) => {
            openWhatsApp(t);
            setModal(null);
          }}
        />
      </Modal>

      <Modal open={modal === 'order' && !!viewOrder} onClose={() => setModal(null)} title={viewOrder ? shortNo(viewOrder.orderNumber) : ''} subtitle={viewOrder ? `${fmtDateTime(viewOrder.createdAt)} · ${TYPE_META[viewOrder.orderType]?.label}` : ''}>
        {viewOrder && (
          <div className="space-y-3">
            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100">
              {viewOrder.lines.map((l, i) => (
                <li key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <span className="flex-1 font-semibold">{l.name}</span>
                  <span className="text-gray-500">× {l.qty}</span>
                  <span className="w-20 text-right font-bold">{formatINR(l.unitPaise * l.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="text-sm space-y-1 px-1">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatINR(viewOrder.subtotalPaise)}</span>
              </div>
              {viewOrder.discountPaise > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span>-{formatINR(viewOrder.discountPaise)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>GST</span>
                <span>{formatINR(viewOrder.totalGstPaise)}</span>
              </div>
              <div className="flex justify-between font-black text-[#800D32] text-base pt-1 border-t border-gray-100">
                <span>Total</span>
                <span>{formatINR(viewOrder.grandTotalPaise)}</span>
              </div>
              <p className="text-xs text-gray-500">Paid via {viewOrder.payments?.map((p) => p.method.toUpperCase()).join(' + ') || '—'}</p>
            </div>
            <button onClick={async () => outputPdf(await buildBillPdf(viewOrder), `Bill-${viewOrder.orderNumber}.pdf`, 'download')} className="w-full py-2.5 rounded-xl bg-[#800D32] text-white text-sm font-black inline-flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download Bill PDF
            </button>
          </div>
        )}
      </Modal>

      <Modal open={modal === 'delete'} onClose={() => setModal(null)} title={`Delete ${sel?.name ?? ''}?`}>
        <p className="text-sm text-gray-600 mb-4">
          Removes the saved profile, notes, addresses and loyalty adjustments.
          {sel?.orders.length ? ' Order history stays in POS, so they will reappear as a basic customer.' : ''}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setModal(null)} className="py-2.5 rounded-xl border border-gray-200 text-sm font-bold">
            Cancel
          </button>
          <button onClick={removeSel} className="py-2.5 rounded-xl bg-rose-600 text-white text-sm font-black">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

/* =====================================================================
   SUB-COMPONENTS
   ===================================================================== */
function stripView(c: CustomerView): CustomerRec {
  const { key: _k, orders: _o, spent: _s, earned: _e, points: _p, lifetime: _l, tier: _t, next: _n, ...rec } = c;
  return rec;
}

const ProfileMenu = ({
  vip,
  loyalty,
  up,
  onVip,
  onLoyalty,
  onCopy,
  onExport,
  onDelete,
}: {
  vip: boolean;
  loyalty: boolean;
  up?: boolean;
  onVip: () => void;
  onLoyalty: () => void;
  onCopy: () => void;
  onExport: () => void;
  onDelete?: () => void;
}) => (
  <div className={`absolute right-0 ${up ? 'bottom-full mb-1' : 'top-full mt-1'} w-48 bg-white rounded-xl border border-gray-100 shadow-xl p-1 z-30`} onClick={(e) => e.stopPropagation()}>
    {[
      { l: vip ? 'Remove VIP' : 'Mark as VIP', I: Crown, on: onVip },
      { l: loyalty ? 'Remove from loyalty' : 'Enroll in loyalty', I: Star, on: onLoyalty },
      { l: 'Copy phone', I: Copy, on: onCopy },
      { l: 'Export CSV', I: Download, on: onExport },
    ].map((m) => (
      <button key={m.l} onClick={m.on} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-[#FDEBF1] hover:text-[#800D32]">
        <m.I className="w-3.5 h-3.5" /> {m.l}
      </button>
    ))}
    {onDelete && (
      <button onClick={onDelete} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50">
        <Trash2 className="w-3.5 h-3.5" /> Delete customer
      </button>
    )}
  </div>
);

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

const CustomerForm = ({ initial, existingKeys, onSubmit }: { initial?: CustomerRec; existingKeys: string[]; onSubmit: (c: CustomerRec) => void }) => {
  const [f, setF] = useState({
    name: initial?.name ?? '',
    phone: initial ? phoneKey(initial.phone) : '',
    email: initial?.email ?? '',
    vip: !!initial?.vip,
    loyalty: initial ? !!initial.loyalty : true,
  });
  const [err, setErr] = useState('');
  const submit = () => {
    const k = phoneKey(f.phone);
    if (!f.name.trim()) return setErr('Name is required');
    if (k.length !== 10) return setErr('Enter a 10-digit mobile number');
    if (existingKeys.includes(k)) return setErr('A customer with this phone already exists');
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) return setErr('Enter a valid email');
    onSubmit({
      ...(initial ?? { id: uid(), createdAt: new Date().toISOString() }),
      name: f.name.trim(),
      phone: k,
      email: f.email.trim() || undefined,
      vip: f.vip,
      loyalty: f.loyalty,
    });
  };
  return (
    <div className="space-y-3">
      <input className={inp} placeholder="Full name" value={f.name} onChange={(e) => (setF({ ...f, name: e.target.value }), setErr(''))} />
      <div className="flex">
        <span className="px-3 flex items-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-sm font-bold text-gray-500">+91</span>
        <input className={`${inp} rounded-l-none`} placeholder="Mobile number" inputMode="tel" value={f.phone} onChange={(e) => (setF({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }), setErr(''))} />
      </div>
      <input className={inp} placeholder="Email (optional)" type="email" value={f.email} onChange={(e) => (setF({ ...f, email: e.target.value }), setErr(''))} />
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" className="w-4 h-4 accent-[#800D32]" checked={f.vip} onChange={(e) => setF({ ...f, vip: e.target.checked })} /> VIP
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" className="w-4 h-4 accent-[#800D32]" checked={f.loyalty} onChange={(e) => setF({ ...f, loyalty: e.target.checked })} /> Loyalty member
        </label>
      </div>
      {err && <p className="text-xs font-bold text-rose-600">{err}</p>}
      <button onClick={submit} className="w-full py-3 rounded-xl bg-[#800D32] text-white text-sm font-black">
        {initial ? 'Save changes' : 'Add Customer'}
      </button>
    </div>
  );
};

const PointsForm = ({ mode, balance, onSubmit }: { mode: 'add' | 'redeem'; balance: number; onSubmit: (points: number, reason: string) => void }) => {
  const [pts, setPts] = useState('');
  const [reason, setReason] = useState(mode === 'add' ? 'Bonus points' : 'Redeemed on bill');
  const n = Math.floor(Number(pts) || 0);
  const invalid = n <= 0 || (mode === 'redeem' && n > balance);
  return (
    <div className="space-y-3">
      <input className={inp} inputMode="numeric" placeholder="Points" value={pts} onChange={(e) => setPts(e.target.value.replace(/\D/g, ''))} />
      <div className="flex flex-wrap gap-1.5">
        {(mode === 'add' ? [50, 100, 250, 500] : [100, 250, 500, balance]).filter((v, i, a) => v > 0 && a.indexOf(v) === i && (mode === 'add' || v <= balance)).map((v) => (
          <button key={v} onClick={() => setPts(String(v))} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-black">
            {v === balance && mode === 'redeem' ? `All (${v})` : v}
          </button>
        ))}
      </div>
      <input className={inp} placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
      {mode === 'redeem' && n > 0 && <p className="text-xs font-bold text-gray-600">Worth {formatINR(n * POINT_VALUE_PAISE)} — apply this as a discount in POS.</p>}
      {mode === 'redeem' && n > balance && <p className="text-xs font-bold text-rose-600">Only {balance} points available</p>}
      <button disabled={invalid} onClick={() => onSubmit(n, reason.trim() || (mode === 'add' ? 'Bonus points' : 'Redeemed'))} className="w-full py-3 rounded-xl bg-[#800D32] text-white text-sm font-black disabled:opacity-50">
        {mode === 'add' ? 'Add Points' : 'Redeem'}
      </button>
    </div>
  );
};

const OfferForm = ({ onSend }: { onSend: (t: string) => void }) => {
  const [t, setT] = useState(OFFER_TEMPLATES[0]);
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        {OFFER_TEMPLATES.map((o) => (
          <button key={o} onClick={() => setT(o)} className={`w-full text-left rounded-xl border px-3 py-2.5 text-sm font-semibold ${t === o ? 'border-[#800D32] bg-[#FFF5F8]' : 'border-gray-200'}`}>
            {o}
          </button>
        ))}
      </div>
      <textarea className={`${inp} resize-none`} rows={3} value={t} onChange={(e) => setT(e.target.value)} />
      <button disabled={!t.trim()} onClick={() => onSend(t.trim())} className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-black inline-flex items-center justify-center gap-2 disabled:opacity-50">
        <MessageCircle className="w-4 h-4" /> Open in WhatsApp
      </button>
    </div>
  );
};

const PrefsForm = ({ c, favItem, onSave }: { c: CustomerRec; favItem?: string; onSave: (p: Partial<CustomerRec>) => void }) => {
  const [f, setF] = useState({ diet: c.diet ?? '', spice: c.spice ?? '', allergies: c.allergies ?? '' });
  useEffect(() => setF({ diet: c.diet ?? '', spice: c.spice ?? '', allergies: c.allergies ?? '' }), [c.id, c.diet, c.spice, c.allergies]);
  const chip = (active: boolean) => `px-3 py-2 rounded-xl border text-sm font-bold ${active ? 'bg-[#800D32] text-white border-[#800D32]' : 'border-gray-200 text-[#191923]'}`;
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-black uppercase text-gray-400 mb-1.5">Diet</p>
        <div className="flex flex-wrap gap-1.5">
          {['Veg', 'Non-Veg', 'Eggetarian', 'Vegan', 'Jain'].map((d) => (
            <button key={d} onClick={() => setF({ ...f, diet: f.diet === d ? '' : d })} className={chip(f.diet === d)}>
              {d}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-black uppercase text-gray-400 mb-1.5">Spice level</p>
        <div className="flex flex-wrap gap-1.5">
          {['Mild', 'Medium', 'Hot'].map((d) => (
            <button key={d} onClick={() => setF({ ...f, spice: f.spice === d ? '' : d })} className={chip(f.spice === d)}>
              {d}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-black uppercase text-gray-400 mb-1.5">Avoid / allergies</p>
        <input className={inp} placeholder="e.g. peanuts, no onion" value={f.allergies} onChange={(e) => setF({ ...f, allergies: e.target.value })} />
      </div>
      {favItem && favItem !== '—' && (
        <p className="text-sm font-semibold text-gray-600">
          Most ordered: <span className="font-black text-[#191923]">{favItem}</span>
        </p>
      )}
      <button onClick={() => onSave({ diet: f.diet || undefined, spice: f.spice || undefined, allergies: f.allergies.trim() || undefined })} className="px-5 py-2.5 rounded-xl bg-[#800D32] text-white text-sm font-black">
        Save preferences
      </button>
    </div>
  );
};

const ListEditor = ({
  items,
  empty,
  fields,
  onAdd,
  onRemove,
  icon,
}: {
  items: { id: string; title: string; body: string }[];
  empty: string;
  fields: string[];
  onAdd: (vals: string[]) => void;
  onRemove: (id: string) => void;
  icon: React.ReactNode;
}) => {
  const [vals, setVals] = useState<string[]>(fields.map(() => ''));
  const last = vals[vals.length - 1].trim();
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        {fields.map((p, i) => (
          <input key={p} className={`${inp} ${i === fields.length - 1 ? 'flex-1' : 'sm:w-48'}`} placeholder={p} value={vals[i]} onChange={(e) => setVals(vals.map((v, j) => (j === i ? e.target.value : v)))} />
        ))}
        <button
          disabled={!last}
          onClick={() => {
            onAdd(vals.map((v) => v.trim()));
            setVals(fields.map(() => ''));
          }}
          className="px-4 py-2.5 rounded-xl bg-[#800D32] text-white text-sm font-black inline-flex items-center justify-center gap-1 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm font-semibold text-gray-500 py-4 text-center">{empty}</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100">
          {items.map((it) => (
            <li key={it.id} className="flex items-start gap-3 px-3 py-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#FDEBF1] text-[#800D32] flex items-center justify-center shrink-0">{icon}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-xs font-bold text-gray-500">{it.title}</span>
                <span className="block text-sm font-semibold text-[#191923] break-words">{it.body}</span>
              </span>
              <button onClick={() => onRemove(it.id)} className="text-gray-400 hover:text-rose-600" aria-label="Remove">
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomersPage;