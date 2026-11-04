import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Map as MapIcon,
  Search,
  Plus,
  Users,
  Clock,
  CalendarDays,
  Utensils,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  FileText,
  ArrowLeftRight,
  Combine,
  Brush,
  Printer,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Sofa,
  Trees,
  DoorClosed,
  Armchair,
  Grid2X2,
} from 'lucide-react';
import type { MenuItem, RestaurantTable } from '@bitechez/shared-types';
import { formatINR } from '@bitechez/business-logic';
import { useCartStore } from '../stores/cartStore';
import { apiService } from '../services/api';
import { buildBillPdf, buildInvoicePdf, outputPdf, type BillDoc, type OrderTypeKey } from '../utils/posPdf';

/* =====================================================================
   CONFIG + TYPES
   ===================================================================== */
const PAGE_OFFSET = '9.75rem'; // header + nav height
const CASHIER = 'Rohit Sengar';

type Status = 'available' | 'occupied' | 'reserved' | 'cleaning';
type StatusFilter = 'all' | Status;

/** Shapes shared with PosPage (same localStorage keys). */
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
interface Reservation {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  tableId?: string;
  tableName?: string;
  note?: string;
}
interface LocalTable {
  id: string;
  name: string;
  section: string;
  seats: number;
}

interface TableView {
  id: string;
  name: string;
  section: string;
  seats: number;
  status: Status;
  order?: HeldOrder; // running order (held)
  inPos?: boolean; // the open cart in POS is on this table
  posTotal?: number;
  posGuests?: number;
  reservation?: Reservation;
  isLocal: boolean;
}

const STATUS_STYLE: Record<Status, { card: string; ring: string; pill: string; badge: string; dot: string; label: string }> = {
  available: {
    card: 'bg-gradient-to-br from-[#F5FBF7] to-white border-[#D6F0DD] hover:border-emerald-300',
    ring: 'ring-emerald-500',
    pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    badge: 'bg-emerald-100 text-emerald-800',
    dot: 'bg-emerald-500',
    label: 'Available',
  },
  occupied: {
    card: 'bg-gradient-to-br from-[#FFF5F8] to-white border-[#FAD4DF] hover:border-[#800D32]/40',
    ring: 'ring-[#800D32]',
    pill: 'bg-rose-50 text-[#800D32] border border-rose-200/60',
    badge: 'bg-rose-100 text-[#800D32]',
    dot: 'bg-[#800D32] animate-pulse',
    label: 'Occupied',
  },
  reserved: {
    card: 'bg-gradient-to-br from-[#FFFDF7] to-white border-[#FDE8BA] hover:border-amber-300',
    ring: 'ring-amber-500',
    pill: 'bg-amber-50 text-amber-800 border border-amber-200/60',
    badge: 'bg-amber-100 text-amber-800',
    dot: 'bg-amber-500',
    label: 'Reserved',
  },
  cleaning: {
    card: 'bg-gradient-to-br from-[#F6FAFF] to-white border-[#D6E7FC] hover:border-sky-300',
    ring: 'ring-sky-500',
    pill: 'bg-sky-50 text-sky-700 border border-sky-200/60',
    badge: 'bg-sky-100 text-sky-800',
    dot: 'bg-sky-500',
    label: 'Cleaning',
  },
};

/* =====================================================================
   HELPERS
   ===================================================================== */
function usePersisted<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? (JSON.parse(s) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {
      /* ignore */
    }
  }, [key, v]);
  return [v, setV] as const;
}

const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const to12h = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
const minutesSince = (iso: string, now: number) => Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const seatsOf = (t: RestaurantTable) => {
  const a = t as unknown as Record<string, unknown>;
  return Number(a.capacity ?? a.seats ?? a.seatCount ?? 4) || 4;
};

/** Bill maths for a held order (mirrors POS: discount → GST on discounted value → round to rupee). */
function calcHeld(h: HeldOrder) {
  const subtotal = h.entries.reduce((a, e) => a + e.item.basePricePaise * e.quantity, 0);
  const discount = Math.round((subtotal * (h.discountPercentage || 0)) / 100);
  const f = subtotal ? (subtotal - discount) / subtotal : 1;
  const gst = h.entries.reduce((a, e) => a + Math.round((e.item.basePricePaise * e.quantity * f * e.item.gstRate) / 100), 0);
  const cgst = Math.floor(gst / 2);
  const raw = subtotal - discount + gst;
  const grand = Math.round(raw / 100) * 100;
  return { subtotal, discount, gst, cgst, sgst: gst - cgst, rounding: grand - raw, grand };
}

function heldToBillDoc(h: HeldOrder): BillDoc {
  const c = calcHeld(h);
  return {
    orderNumber: h.orderNumber,
    createdAt: new Date().toISOString(),
    orderType: h.orderType,
    tableName: h.tableName,
    guests: h.guests,
    cashier: CASHIER,
    customer: h.customer?.name || h.customer?.phone ? h.customer : undefined,
    lines: h.entries.map((e) => ({
      id: e.item.id,
      name: e.item.name,
      qty: e.quantity,
      unitPaise: e.item.basePricePaise,
      gstRate: e.item.gstRate,
      notes: h.itemNotes?.[e.item.id],
      isVeg: e.item.isVeg,
    })),
    orderNote: h.orderNote || undefined,
    subtotalPaise: c.subtotal,
    discountPaise: c.discount,
    discountPercentage: h.discountPercentage || 0,
    offerCode: h.offerCode,
    cgstPaise: c.cgst,
    sgstPaise: c.sgst,
    totalGstPaise: c.gst,
    roundingPaise: c.rounding,
    grandTotalPaise: c.grand,
  };
}

const sectionIcon = (name: string) => {
  const n = name.toLowerCase();
  if (/main|dining|hall/.test(n)) return Utensils;
  if (/family/.test(n)) return Users;
  if (/out|garden|terrace|roof|patio/.test(n)) return Trees;
  if (/private|room|vip|cabin/.test(n)) return DoorClosed;
  if (/lounge|bar/.test(n)) return Sofa;
  return Armchair;
};


/* =====================================================================
   SMALL UI
   ===================================================================== */
const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; subtitle?: string; width?: string; footer?: React.ReactNode; children: React.ReactNode }> = ({
  open,
  onClose,
  title,
  subtitle,
  width = 'max-w-md',
  footer,
  children,
}) =>
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
        {footer && <div className="px-5 py-3.5 border-t border-gray-100 bg-[#FCF8F9] rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  ) : null;

const StatCard = ({ icon, value, label, tint }: { icon: React.ReactNode; value: number; label: string; tint: string }) => (
  <div className="shrink-0 flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 min-w-[150px]">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tint}`}>{icon}</div>
    <div>
      <p className="text-xl font-black text-[#191923] leading-none">{value}</p>
      <p className="text-xs font-semibold text-gray-500 mt-1">{label}</p>
    </div>
  </div>
);

/* =====================================================================
   TABLE CARD (grid)
   ===================================================================== */
const TableCard = memo(({ t, selected, now, onSelect }: { t: TableView; selected: boolean; now: number; onSelect: (id: string) => void }) => {
  const s = STATUS_STYLE[t.status];
  const guests = t.order?.guests ?? t.posGuests;
  const amount = t.order?.totalPaise ?? t.posTotal;
  return (
    <button
      onClick={() => onSelect(t.id)}
      className={`group relative w-full rounded-2xl border p-3.5 flex flex-col justify-between text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${s.card} ${
        selected ? `ring-2 ${s.ring} ring-offset-2 shadow-md` : 'shadow-xs'
      }`}
    >
      {/* Top Header: Squircle Badge + Status Pill */}
      <div className="w-full flex items-center justify-between gap-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm tracking-tight shadow-xs ${s.badge}`}>
          {t.name}
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${s.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {t.inPos && !t.order ? 'In POS' : s.label}
        </span>
      </div>

      {/* Middle Content */}
      <div className="w-full my-2.5">
        {t.status === 'occupied' ? (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Current Bill</p>
            <p className="text-xl font-black text-[#800D32] tracking-tight leading-tight">
              {amount !== undefined ? formatINR(amount) : '₹0'}
            </p>
            <div className="flex items-center justify-between mt-1.5 text-[11px] font-semibold text-gray-500 bg-white/80 px-2 py-0.5 rounded-md border border-rose-100/70">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#800D32]" />
                {t.order ? `${minutesSince(t.order.heldAt, now)}m ago` : 'active'}
              </span>
              {guests ? (
                <span className="flex items-center gap-0.5 text-[#800D32] font-bold">
                  <Users className="w-3 h-3" /> {guests}
                </span>
              ) : null}
            </div>
          </div>
        ) : t.status === 'reserved' ? (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700/80">Reserved</p>
            <p className="text-sm font-black text-gray-900 truncate leading-snug">
              {t.reservation?.name || 'Upcoming Guest'}
            </p>
            <div className="flex items-center justify-between mt-1.5 text-[11px] font-semibold text-amber-900/80 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/60">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                {t.reservation ? to12h(t.reservation.time) : 'Booked'}
              </span>
              <span className="flex items-center gap-0.5 font-bold">
                <Users className="w-3 h-3" /> {t.reservation?.guests ?? t.seats}
              </span>
            </div>
          </div>
        ) : t.status === 'cleaning' ? (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700/80">Sanitation</p>
            <p className="text-sm font-black text-gray-900 leading-snug">Needs Cleaning</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold text-sky-800 bg-sky-50/80 px-2 py-0.5 rounded-md border border-sky-200/60">
              <Brush className="w-3 h-3 text-sky-600" />
              <span>Reset in progress</span>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/80">Floor Ready</p>
            <p className="text-sm font-black text-gray-900 leading-snug">Available to Seat</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200/60">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Tap to order</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer: Seats & Section */}
      <div className="w-full pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          {t.seats} Seats
        </span>
        <span className="text-[11px] text-gray-400 font-medium truncate max-w-[100px]">{t.section}</span>
      </div>
    </button>
  );
});

/* =====================================================================
   MAP VIEW (drag to arrange, positions saved)
   ===================================================================== */
const MapView = memo(
  ({
    tables,
    layout,
    selectedId,
    onSelect,
    onMove,
  }: {
    tables: TableView[];
    layout: Record<string, { x: number; y: number }>;
    selectedId?: string;
    onSelect: (id: string) => void;
    onMove: (id: string, pos: { x: number; y: number }) => void;
  }) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const drag = useRef<{ id: string; dx: number; dy: number; moved: boolean } | null>(null);
    const [live, setLive] = useState<{ id: string; x: number; y: number } | null>(null);

    // Default positions: sections as rows of 6
    const defaults = useMemo(() => {
      const out: Record<string, { x: number; y: number }> = {};
      let row = 0;
      const bySection: Record<string, TableView[]> = {};
      tables.forEach((t) => (bySection[t.section] ||= []).push(t));
      Object.values(bySection).forEach((list) => {
        list.forEach((t, i) => {
          out[t.id] = { x: 3 + (i % 6) * 16, y: 36 + (row + Math.floor(i / 6)) * 118 };
        });
        row += Math.ceil(list.length / 6);
      });
      return out;
    }, [tables]);

    const posOf = (id: string) => (live?.id === id ? live : layout[id] ?? defaults[id] ?? { x: 2, y: 20 });
    const height = Math.max(520, ...tables.map((t) => posOf(t.id).y + 130));

    const toPos = (e: React.PointerEvent) => {
      const r = canvasRef.current!.getBoundingClientRect();
      const d = drag.current!;
      const x = Math.min(88, Math.max(0, ((e.clientX - r.left - d.dx) / r.width) * 100));
      const y = Math.max(0, e.clientY - r.top - d.dy);
      return { x, y };
    };

    return (
      <div className="relative">
        <p className="absolute left-3 top-2 z-10 text-[11px] font-semibold text-gray-400">Drag tables to arrange your floor plan · positions are saved</p>
        <div
          ref={canvasRef}
          className="relative w-full rounded-2xl border border-dashed border-gray-200"
          style={{ height, backgroundImage: 'radial-gradient(#ECDDE2 1px, transparent 1px)', backgroundSize: '18px 18px' }}
        >
          {tables.map((t) => {
            const p = posOf(t.id);
            const s = STATUS_STYLE[t.status];
            const round = t.seats <= 4;
            return (
              <div
                key={t.id}
                onPointerDown={(e) => {
                  const el = e.currentTarget.getBoundingClientRect();
                  drag.current = { id: t.id, dx: e.clientX - el.left, dy: e.clientY - el.top, moved: false };
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerMove={(e) => {
                  if (drag.current?.id !== t.id) return;
                  drag.current.moved = true;
                  setLive({ id: t.id, ...toPos(e) });
                }}
                onPointerUp={(e) => {
                  const d = drag.current;
                  drag.current = null;
                  if (!d) return;
                  if (d.moved) onMove(t.id, toPos(e));
                  else onSelect(t.id);
                  setLive(null);
                }}
                className={`absolute select-none touch-none cursor-grab active:cursor-grabbing border-2 flex flex-col items-center justify-center text-center shadow-sm transition-shadow ${s.card} ${
                  round ? 'rounded-full w-[96px] h-[96px]' : 'rounded-2xl w-[120px] h-[96px]'
                } ${selectedId === t.id ? `ring-2 ${s.ring} ring-offset-2 shadow-md` : ''}`}
                style={{ left: `${p.x}%`, top: p.y }}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-2xs mb-0.5 ${s.badge}`}>
                  {t.name}
                </div>
                <p className="text-[10px] font-bold text-gray-500 flex items-center gap-0.5">
                  <Users className="w-2.5 h-2.5 text-gray-400" /> {t.seats} seats
                </p>
                <span className={`mt-0.5 px-2 py-0.2 rounded-full text-[9px] font-bold inline-flex items-center gap-1 ${s.pill}`}>
                  <span className={`w-1 h-1 rounded-full ${s.dot}`} />
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

/* =====================================================================
   PAGE
   ===================================================================== */
export const TablesPage: React.FC = () => {
  const navigate = useNavigate();
  const cartStore = useCartStore();
  const { items: cartItems, tableId: cartTableId, orderType: cartOrderType, setOrderType, setTable, clearCart, addItem, updateQuantity, setDiscount, getCalculations } = cartStore;

  /* ---------- data ---------- */
  const [apiTables, setApiTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [localTables, setLocalTables] = usePersisted<LocalTable[]>('tables.local', []);
  const [overrides, setOverrides] = usePersisted<Record<string, Status>>('tables.status', {});
  const [layout, setLayout] = usePersisted<Record<string, { x: number; y: number }>>('tables.layout', {});
  const [held, setHeld] = usePersisted<HeldOrder[]>('pos.held', []);
  const [reservations, setReservations] = usePersisted<Reservation[]>('pos.reservations', []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setApiTables(await apiService.getTables());
    } catch (e) {
      console.error(e);
      setLoadError('Could not load tables from the server.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  /* ---------- ui state ---------- */
  const [section, setSection] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [view, setView] = usePersisted<'grid' | 'map'>('tables.view', 'grid');
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [modal, setModal] = useState<null | 'add' | 'order' | 'transfer' | 'merge' | 'clear'>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);
  const notify = (type: 'success' | 'error', text: string) => setToast({ type, text });

  /* ---------- derived ---------- */
  const posCalc = cartItems.length ? getCalculations() : null;

  const tables: TableView[] = useMemo(() => {
    const today = localToday();
    const heldByTable: Record<string, HeldOrder> = {};
    held.forEach((h) => {
      if (h.orderType === 'dine_in' && h.tableId && !heldByTable[h.tableId]) heldByTable[h.tableId] = h;
    });
    const resByTable: Record<string, Reservation> = {};
    reservations
      .filter((r) => r.tableId && r.date === today)
      .sort((a, b) => a.time.localeCompare(b.time))
      .forEach((r) => (resByTable[r.tableId!] ||= r));

    const base = [
      ...apiTables.map((t) => ({
        id: t.id,
        name: t.name,
        section: (t as unknown as { section?: string }).section || 'Main Dining',
        seats: seatsOf(t),
        apiStatus: String((t as unknown as { status?: string }).status ?? 'available').toLowerCase(),
        isLocal: false,
      })),
      ...localTables.map((t) => ({ ...t, apiStatus: 'available', isLocal: true })),
    ];

    return base
      .map((t) => {
        const order = heldByTable[t.id];
        const inPos = cartOrderType === 'dine_in' && cartTableId === t.id && cartItems.length > 0;
        const reservation = resByTable[t.id];
        let status: Status;
        if (order || inPos) status = 'occupied';
        else if (overrides[t.id] === 'cleaning') status = 'cleaning';
        else if (reservation || overrides[t.id] === 'reserved') status = 'reserved';
        else if (overrides[t.id]) status = overrides[t.id];
        else status = (['available', 'occupied', 'reserved', 'cleaning'].includes(t.apiStatus) ? t.apiStatus : 'available') as Status;
        return {
          id: t.id,
          name: t.name,
          section: t.section,
          seats: t.seats,
          status,
          order,
          inPos,
          posTotal: inPos ? posCalc?.grandTotalPaise : undefined,
          posGuests: undefined,
          reservation,
          isLocal: t.isLocal,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [apiTables, localTables, held, reservations, overrides, cartItems.length, cartTableId, cartOrderType, posCalc?.grandTotalPaise]);

  const sections = useMemo(() => {
    const m = new Map<string, number>();
    tables.forEach((t) => m.set(t.section, (m.get(t.section) ?? 0) + 1));
    return [...m.entries()];
  }, [tables]);

  const counts = useMemo(() => {
    const c = { available: 0, occupied: 0, reserved: 0, cleaning: 0, seats: 0 };
    tables.forEach((t) => {
      c[t.status] += 1;
      c.seats += t.seats;
    });
    return c;
  }, [tables]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tables.filter(
      (t) => (section === 'all' || t.section === section) && (statusFilter === 'all' || t.status === statusFilter) && (!q || t.name.toLowerCase().includes(q))
    );
  }, [tables, section, statusFilter, query]);

  // Default selection: first occupied, else first table
  useEffect(() => {
    if (selectedId && tables.some((t) => t.id === selectedId)) return;
    setSelectedId((tables.find((t) => t.status === 'occupied') ?? tables[0])?.id);
  }, [tables, selectedId]);

  const sel = tables.find((t) => t.id === selectedId);

  /* ---------- actions ---------- */
  const setStatus = (id: string, status: Status | null) => {
    setOverrides((o) => {
      const n = { ...o };
      if (status) n[id] = status;
      else delete n[id];
      return n;
    });
    const api = apiService as unknown as { updateTableStatus?: (id: string, s: string) => Promise<unknown>; updateTable?: (id: string, p: object) => Promise<unknown> };
    (api.updateTableStatus?.(id, status ?? 'available') ?? api.updateTable?.(id, { status: status ?? 'available' }))?.catch?.(() => undefined);
  };

  const goToPos = (t: TableView) => {
    if (t.order) {
      // Load the running order into the POS cart, then remove it from hold
      if (cartItems.length && !(cartTableId === t.id)) {
        notify('error', 'POS has another open order — hold or settle it first');
        return;
      }
      clearCart();
      setOrderType('dine_in');
      setTable(t.id, t.name);
      t.order.entries.forEach(({ item, quantity }) => {
        addItem(item);
        if (quantity > 1) updateQuantity(item.id, quantity - 1);
      });
      setDiscount(t.order.discountPercentage || 0);
      setHeld((l) => l.filter((h) => h.id !== t.order!.id));
    } else {
      if (cartItems.length && cartTableId !== t.id) {
        notify('error', 'POS has another open order — hold or settle it first');
        return;
      }
      setOrderType('dine_in');
      setTable(t.id, t.name);
      if (t.reservation) setReservations((l) => l.filter((r) => r.id !== t.reservation!.id));
      if (t.status === 'cleaning' || t.status === 'reserved') setStatus(t.id, null);
    }
    navigate('/pos');
  };

  const printBill = async (t: TableView, mode: 'print' | 'download', kind: 'bill' | 'invoice' = 'bill') => {
    if (!t.order) return notify('error', t.inPos ? 'This order is open in POS — print it from there' : 'No running order on this table');
    try {
      const d = heldToBillDoc(t.order);
      const doc = kind === 'bill' ? await buildBillPdf(d) : await buildInvoicePdf(d);
      outputPdf(doc, `${kind === 'bill' ? 'Bill' : 'Invoice'}-${t.order.orderNumber}.pdf`, mode);
    } catch (e) {
      console.error(e);
      notify('error', 'Could not generate PDF');
    }
  };

  const transferTo = (target: TableView) => {
    if (!sel?.order) return;
    setHeld((l) => l.map((h) => (h.id === sel.order!.id ? { ...h, tableId: target.id, tableName: target.name } : h)));
    setStatus(sel.id, 'cleaning');
    setSelectedId(target.id);
    setModal(null);
    notify('success', `Order moved ${sel.name} → ${target.name}`);
  };

  const mergeInto = (target: TableView) => {
    if (!sel?.order || !target.order) return;
    const a = sel.order;
    const b = target.order;
    const map = new Map<string, { item: MenuItem; quantity: number }>();
    [...b.entries, ...a.entries].forEach((e) => {
      const cur = map.get(e.item.id);
      map.set(e.item.id, cur ? { item: e.item, quantity: cur.quantity + e.quantity } : { ...e });
    });
    const merged: HeldOrder = {
      ...b,
      guests: b.guests + a.guests,
      entries: [...map.values()],
      itemNotes: { ...a.itemNotes, ...b.itemNotes },
      orderNote: [b.orderNote, a.orderNote].filter(Boolean).join(' | '),
      heldAt: new Date(Math.min(new Date(a.heldAt).getTime(), new Date(b.heldAt).getTime())).toISOString(),
    };
    merged.totalPaise = calcHeld(merged).grand;
    setHeld((l) => l.filter((h) => h.id !== a.id).map((h) => (h.id === b.id ? merged : h)));
    setStatus(sel.id, 'cleaning');
    setSelectedId(target.id);
    setModal(null);
    notify('success', `${sel.name} merged into ${target.name}`);
  };

  const clearTable = (discardOrder: boolean) => {
    if (!sel) return;
    if (discardOrder && sel.order) setHeld((l) => l.filter((h) => h.id !== sel.order!.id));
    setStatus(sel.id, 'cleaning');
    setModal(null);
    notify('success', `${sel.name} sent for cleaning`);
  };

  const addTable = async (t: { name: string; seats: number; section: string }) => {
    if (tables.some((x) => x.name.toLowerCase() === t.name.toLowerCase())) return notify('error', `${t.name} already exists`);
    const api = apiService as unknown as { createTable?: (p: object) => Promise<RestaurantTable> };
    try {
      if (api.createTable) {
        const created = await api.createTable({ name: t.name, section: t.section, capacity: t.seats, seats: t.seats, status: 'available' });
        setApiTables((l) => [...l, created]);
      } else {
        setLocalTables((l) => [...l, { id: `local-${uid()}`, ...t }]);
      }
      setModal(null);
      notify('success', `${t.name} added to ${t.section}`);
    } catch (e) {
      console.error(e);
      notify('error', 'Could not save table');
    }
  };

  const deleteLocalTable = (id: string) => {
    setLocalTables((l) => l.filter((t) => t.id !== id));
    setSelectedId(undefined);
    notify('success', 'Table removed');
  };

  const [mobileDetails, setMobileDetails] = useState(false);
  const selectTable = useCallback((id: string) => {
    setSelectedId(id);
    if (window.matchMedia('(max-width: 1023px)').matches) setMobileDetails(true);
  }, []);

  const details = sel ? (
    <TableDetails
      t={sel}
      now={now}
      onTakeOrder={() => goToPos(sel)}
      onViewOrder={() => (sel.order ? setModal('order') : sel.inPos ? navigate('/pos') : notify('error', 'No running order on this table'))}
      onTransfer={() => (sel.order ? setModal('transfer') : notify('error', 'Only held orders can be transferred'))}
      onMerge={() => (sel.order ? setModal('merge') : notify('error', 'No running order to merge'))}
      onClear={() => (sel.order ? setModal('clear') : clearTable(false))}
      onPrint={(mode) => printBill(sel, mode)}
      onMarkAvailable={() => (setStatus(sel.id, 'available'), notify('success', `${sel.name} is available`))}
      onReserveToggle={() => setStatus(sel.id, sel.status === 'reserved' ? null : 'reserved')}
      onDelete={sel.isLocal ? () => deleteLocalTable(sel.id) : undefined}
    />
  ) : null;

  /* ---------- render ---------- */
  const filterBtn = (active: boolean) =>
    `w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-colors ${active ? 'bg-[#800D32] text-white shadow-md' : 'text-[#191923] hover:bg-[#FFF5F8]'}`;

  return (
    <div className="flex flex-col gap-3 overflow-hidden" style={{ height: `calc(100dvh - var(--pos-offset, ${PAGE_OFFSET}))` }}>
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[80] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border ${toast.type === 'success' ? 'bg-[#800D32] text-white border-rose-400' : 'bg-white text-rose-700 border-rose-200'
            }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
          {toast.text}
        </div>
      )}

      {/* ===== Header ===== */}
      <div className="flex items-center gap-3 flex-wrap xl:flex-nowrap">
        <div className="flex items-center gap-3 mr-auto">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#800D32] to-[#5a0923] text-white flex items-center justify-center shadow-md">
            <Grid2X2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#191923] leading-tight">Tables & Floor</h1>
            <p className="text-xs text-gray-500 font-medium hidden sm:block">Manage floor layout, live orders, reservations and table status</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 overflow-x-auto max-w-full pb-0.5">
          <StatCard icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} value={counts.available} label="Available" tint="bg-emerald-50" />
          <StatCard icon={<Users className="w-5 h-5 text-[#800D32]" />} value={counts.occupied} label="Occupied" tint="bg-rose-50" />
          <StatCard icon={<CalendarDays className="w-5 h-5 text-amber-600" />} value={counts.reserved} label="Reserved" tint="bg-amber-50" />
          <StatCard icon={<Brush className="w-5 h-5 text-sky-600" />} value={counts.cleaning} label="Cleaning" tint="bg-sky-50" />
          <StatCard icon={<Armchair className="w-5 h-5 text-violet-600" />} value={counts.seats} label="Total Seats" tint="bg-violet-50" />
        </div>
        <button onClick={() => setModal('add')} className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#800D32] text-white text-sm font-black shadow-md hover:bg-[#6a0a29]">
          <Plus className="w-4 h-4" /> Add Table
        </button>
      </div>

      {/* ===== Body ===== */}
      <div className="flex-1 min-h-0 flex gap-3">
        {/* Sections */}
        <aside className="hidden md:flex w-52 xl:w-56 shrink-0 flex-col gap-3">
          <div className="flex-1 min-h-0 overflow-y-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-2 space-y-1">
            <button onClick={() => setSection('all')} className={filterBtn(section === 'all')}>
              <LayoutGrid className={`w-5 h-5 ${section === 'all' ? 'text-white' : 'text-[#800D32]'}`} />
              <span className="flex-1 text-left">All Tables</span>
              <span className={`text-xs px-2 py-0.5 rounded-lg ${section === 'all' ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>{tables.length}</span>
            </button>
            {sections.map(([name, n]) => {
              const Icon = sectionIcon(name);
              const active = section === name;
              return (
                <button key={name} onClick={() => setSection(name)} className={filterBtn(active)}>
                  <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-[#800D32]'}`} />
                  <span className="flex-1 text-left truncate">{name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-lg ${active ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>{n}</span>
                </button>
              );
            })}
          </div>
          <label className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 cursor-pointer">
            <MapIcon className="w-5 h-5 text-[#800D32]" />
            <span className="flex-1 text-sm font-bold text-[#191923]">Table Map</span>
            <input type="checkbox" className="sr-only" checked={view === 'map'} onChange={(e) => setView(e.target.checked ? 'map' : 'grid')} />
            <span className={`relative w-10 h-6 rounded-full transition-colors ${view === 'map' ? 'bg-[#800D32]' : 'bg-gray-200'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-[left] ${view === 'map' ? 'left-5' : 'left-1'}`} />
            </span>
          </label>
        </aside>

        {/* Tables area */}
        <section className="flex-1 min-w-0 flex flex-col gap-3 bg-white/60 rounded-2xl border border-gray-100 p-3">
          <div className="flex items-center gap-2 flex-wrap">
            {(['grid', 'map'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border ${view === v ? 'bg-[#800D32] text-white border-[#800D32]' : 'bg-white text-[#191923] border-gray-200 hover:border-[#F3C3D2]'
                  }`}
              >
                {v === 'grid' ? <LayoutGrid className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
                {v === 'grid' ? 'Grid View' : 'Map View'}
              </button>
            ))}
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="md:hidden px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold"
            >
              <option value="all">All sections</option>
              {sections.map(([n]) => (
                <option key={n}>{n}</option>
              ))}
            </select>
            <div className="relative ml-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-[#191923] focus:outline-none focus:ring-2 focus:ring-[#800D32]/30"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="cleaning">Cleaning</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search table (e.g. T4)..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#800D32]/30"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            {loading && !tables.length ? (
              <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(185px,1fr))]">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-[170px] rounded-2xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : loadError && !tables.length ? (
              <div className="py-16 text-center">
                <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-700">{loadError}</p>
                <button onClick={load} className="mt-3 px-4 py-2 rounded-xl bg-[#800D32] text-white text-xs font-bold">
                  Retry
                </button>
              </div>
            ) : visible.length === 0 ? (
              <div className="py-16 text-center text-sm font-bold text-gray-500">No tables match these filters.</div>
            ) : view === 'grid' ? (
              <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(185px,1fr))]">
                {visible.map((t) => (
                  <TableCard key={t.id} t={t} selected={t.id === selectedId} now={now} onSelect={selectTable} />
                ))}
              </div>
            ) : (
              <MapView tables={visible} layout={layout} selectedId={selectedId} onSelect={selectTable} onMove={(id, pos) => setLayout((l) => ({ ...l, [id]: pos }))} />
            )}
          </div>
        </section>

        {/* Details panel */}
        <aside className="hidden lg:flex w-[340px] xl:w-[390px] shrink-0 flex-col gap-3 min-h-0 overflow-y-auto">
          {details ?? <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm font-semibold text-gray-500">Select a table to see details</div>}
        </aside>
      </div>

      {/* Mobile / tablet details: bottom sheet */}
      <Modal open={mobileDetails && !!sel && modal === null} onClose={() => setMobileDetails(false)} title={sel ? `Table ${sel.name}` : ''} width="max-w-lg">
        <div className="space-y-3">{details}</div>
      </Modal>

      {/* ===== Modals ===== */}
      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="Add Table" subtitle="Create a new table in a section">
        <AddTableForm sections={sections.map(([n]) => n)} suggestedName={`T${tables.length + 1}`} onSubmit={addTable} />
      </Modal>

      <Modal
        open={modal === 'order' && !!sel?.order}
        onClose={() => setModal(null)}
        title={`${sel?.name} · ${sel?.order?.orderNumber ?? ''}`}
        subtitle={sel?.order ? `${sel.order.guests} guests · running ${minutesSince(sel.order.heldAt, now)} min` : ''}
        width="max-w-lg"
        footer={
          sel?.order && (
            <div className="flex flex-wrap gap-2 justify-end">
              <button onClick={() => printBill(sel, 'download', 'invoice')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700">
                <Download className="w-3.5 h-3.5" /> Invoice PDF
              </button>
              <button onClick={() => printBill(sel, 'download')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700">
                <Download className="w-3.5 h-3.5" /> Bill PDF
              </button>
              <button onClick={() => (setModal(null), goToPos(sel))} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#800D32] text-white text-xs font-black">
                <PlusCircle className="w-3.5 h-3.5" /> Open in POS
              </button>
            </div>
          )
        }
      >
        {sel?.order && <OrderBreakdown h={sel.order} />}
      </Modal>

      <Modal open={modal === 'transfer'} onClose={() => setModal(null)} title={`Transfer ${sel?.name ?? ''}`} subtitle="Move the running order to a free table">
        <TablePickList tables={tables.filter((t) => t.id !== sel?.id && t.status === 'available')} empty="No available tables" onPick={transferTo} />
      </Modal>

      <Modal open={modal === 'merge'} onClose={() => setModal(null)} title={`Merge ${sel?.name ?? ''} into…`} subtitle="Items, guests and notes are combined">
        <TablePickList tables={tables.filter((t) => t.id !== sel?.id && !!t.order)} empty="No other table has a running order" onPick={mergeInto} />
      </Modal>

      <Modal open={modal === 'clear'} onClose={() => setModal(null)} title={`Clear ${sel?.name ?? ''}?`} subtitle={sel?.order ? `Running order ${sel.order.orderNumber} · ${formatINR(sel.order.totalPaise)}` : ''}>
        <p className="text-sm text-gray-600 mb-4">This table still has an unsettled order. Settle it from POS first, or discard it and send the table for cleaning.</p>
        <div className="grid sm:grid-cols-2 gap-2">
          <button onClick={() => sel && (setModal(null), goToPos(sel))} className="px-4 py-3 rounded-xl bg-[#800D32] text-white text-sm font-black">
            Settle in POS
          </button>
          <button onClick={() => clearTable(true)} className="px-4 py-3 rounded-xl border border-rose-200 text-rose-600 text-sm font-black hover:bg-rose-50">
            Discard & clear
          </button>
        </div>
      </Modal>
    </div>
  );
};

/* =====================================================================
   SUB-COMPONENTS
   ===================================================================== */
const TableDetails = ({
  t,
  now,
  onTakeOrder,
  onViewOrder,
  onTransfer,
  onMerge,
  onClear,
  onPrint,
  onMarkAvailable,
  onReserveToggle,
  onDelete,
}: {
  t: TableView;
  now: number;
  onTakeOrder: () => void;
  onViewOrder: () => void;
  onTransfer: () => void;
  onMerge: () => void;
  onClear: () => void;
  onPrint: (mode: 'print' | 'download') => void;
  onMarkAvailable: () => void;
  onReserveToggle: () => void;
  onDelete?: () => void;
}) => {
  const s = STATUS_STYLE[t.status];
  const guests = t.order?.guests ?? t.reservation?.guests;
  const occupied = t.status === 'occupied';
  const hasHeld = !!t.order;
  const actions = [
    { l: t.status === 'reserved' ? 'Seat Guests' : occupied ? 'Add Items' : 'Take Order', i: PlusCircle, on: onTakeOrder, ok: true },
    { l: 'View Order', i: FileText, on: onViewOrder, ok: occupied },
    { l: 'Transfer', i: ArrowLeftRight, on: onTransfer, ok: hasHeld },
    { l: 'Merge', i: Combine, on: onMerge, ok: hasHeld },
    { l: t.status === 'cleaning' ? 'Mark Available' : 'Clear Table', i: Brush, on: t.status === 'cleaning' ? onMarkAvailable : onClear, ok: true },
    { l: 'Print Bill', i: Printer, on: () => onPrint('print'), ok: hasHeld },
  ];
  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-sm shrink-0 ${s.badge}`}>
          <span className="text-[10px] uppercase tracking-wider font-extrabold opacity-75">Table</span>
          <span className="text-xl font-black leading-none">{t.name}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-black text-[#191923]">Table {t.name}</h2>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap mt-1.5 text-xs font-semibold text-gray-600">
            <span className="flex items-center gap-1">
              <Utensils className="w-3.5 h-3.5 text-gray-400" /> {t.section}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gray-400" /> {guests ? `${guests} Guests` : `${t.seats} Seats`}
            </span>
            {t.order && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#800D32]" /> {minutesSince(t.order.heldAt, now)} min
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="text-base font-black text-[#191923] mb-3">{t.status === 'reserved' ? 'Reservation' : 'Current Order'}</h3>
        {t.order ? (
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <button onClick={onViewOrder} className="w-full flex items-center justify-between px-3 py-2.5 bg-[#FFF1F4] text-sm font-black text-[#191923]">
              <span>#{t.order.orderNumber}</span>
              <span className="flex items-center gap-1 text-[#800D32]">
                {formatINR(t.order.totalPaise)} <ChevronRight className="w-4 h-4" />
              </span>
            </button>
            <div className="max-h-52 overflow-y-auto divide-y divide-gray-50">
              {t.order.entries.map((e) => (
                <div key={e.item.id} className="grid grid-cols-[1fr_auto_auto] gap-4 px-3 py-2 text-sm">
                  <span className="font-semibold text-[#191923] truncate">{e.item.name}</span>
                  <span className="text-gray-500 font-semibold">× {e.quantity}</span>
                  <span className="font-semibold text-[#191923] w-20 text-right">{formatINR(e.item.basePricePaise * e.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : t.inPos ? (
          <p className="text-sm font-semibold text-gray-600">
            This table's order is open in POS{t.posTotal !== undefined ? ` (${formatINR(t.posTotal)})` : ''}. Use “View Order” to continue.
          </p>
        ) : t.reservation ? (
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-sm">
            <p className="font-black text-[#191923]">{t.reservation.name}</p>
            <p className="font-semibold text-gray-600">
              {to12h(t.reservation.time)} · {t.reservation.guests} guests · {t.reservation.phone}
            </p>
            {t.reservation.note && <p className="text-xs italic text-gray-500 mt-1">{t.reservation.note}</p>}
          </div>
        ) : (
          <p className="text-sm font-semibold text-gray-500">No running order. Tap “Take Order” to start one.</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="text-base font-black text-[#191923] mb-3">Table Actions</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {actions.map((a) => (
            <button
              key={a.l}
              onClick={a.on}
              disabled={!a.ok}
              className="flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl border border-gray-100 bg-white shadow-sm text-xs font-bold text-[#191923] hover:border-[#F3C3D2] hover:bg-[#FFF7FA] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <a.i className="w-5 h-5 text-[#800D32]" />
              {a.l}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {hasHeld && (
            <button onClick={() => onPrint('download')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700">
              <Download className="w-3.5 h-3.5" /> Download bill
            </button>
          )}
          {!occupied && t.status !== 'cleaning' && (
            <button onClick={onReserveToggle} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700">
              <CalendarDays className="w-3.5 h-3.5" /> {t.status === 'reserved' ? 'Unmark reserved' : 'Mark reserved'}
            </button>
          )}
          {onDelete && !occupied && (
            <button onClick={onDelete} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-200 text-xs font-bold text-rose-600 ml-auto">
              <Trash2 className="w-3.5 h-3.5" /> Delete table
            </button>
          )}
        </div>
      </div>
    </>
  );
};

const OrderBreakdown = ({ h }: { h: HeldOrder }) => {
  const c = calcHeld(h);
  return (
    <div className="space-y-3">
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
        {h.entries.map((e) => (
          <div key={e.item.id} className="flex items-center gap-3 px-3 py-2 text-sm">
            <span className="flex-1 font-semibold text-[#191923]">
              {e.item.name}
              {h.itemNotes?.[e.item.id] && <span className="block text-[11px] italic text-[#800D32]">“{h.itemNotes[e.item.id]}”</span>}
            </span>
            <span className="text-gray-500 font-semibold">× {e.quantity}</span>
            <span className="w-20 text-right font-bold">{formatINR(e.item.basePricePaise * e.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="text-sm space-y-1 px-1">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatINR(c.subtotal)}</span>
        </div>
        {c.discount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Discount ({h.discountPercentage}%)</span>
            <span>-{formatINR(c.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>GST</span>
          <span>{formatINR(c.gst)}</span>
        </div>
        <div className="flex justify-between font-black text-[#800D32] text-base pt-1 border-t border-gray-100">
          <span>Total</span>
          <span>{formatINR(c.grand)}</span>
        </div>
      </div>
      {h.orderNote && <p className="text-xs italic text-gray-500">Note: {h.orderNote}</p>}
    </div>
  );
};

const TablePickList = ({ tables, empty, onPick }: { tables: TableView[]; empty: string; onPick: (t: TableView) => void }) =>
  tables.length === 0 ? (
    <p className="text-sm font-semibold text-gray-500 py-6 text-center">{empty}</p>
  ) : (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {tables.map((t) => {
        const s = STATUS_STYLE[t.status];
        return (
          <button key={t.id} onClick={() => onPick(t)} className={`rounded-xl border p-2.5 text-center hover:brightness-95 ${s.card}`}>
            <p className="text-sm font-black text-[#191923]">{t.name}</p>
            <p className="text-[10px] font-bold text-gray-500">
              {t.seats} seats{t.order ? ` · ${formatINR(t.order.totalPaise)}` : ''}
            </p>
          </button>
        );
      })}
    </div>
  );

const AddTableForm = ({ sections, suggestedName, onSubmit }: { sections: string[]; suggestedName: string; onSubmit: (t: { name: string; seats: number; section: string }) => void }) => {
  const [name, setName] = useState(suggestedName);
  const [seats, setSeats] = useState(4);
  const [sec, setSec] = useState(sections[0] ?? 'Main Dining');
  const [newSec, setNewSec] = useState('');
  const [err, setErr] = useState('');
  const submit = () => {
    const section = sec === '__new' ? newSec.trim() : sec;
    if (!name.trim()) return setErr('Table name is required');
    if (!section) return setErr('Section is required');
    onSubmit({ name: name.trim().toUpperCase(), seats, section });
  };
  const inp = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800D32]/30';
  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-gray-600">
        Table name
        <input className={`${inp} mt-1`} value={name} onChange={(e) => (setName(e.target.value), setErr(''))} />
      </label>
      <div className="text-xs font-bold text-gray-600">
        Seats
        <div className="grid grid-cols-6 gap-1.5 mt-1">
          {[2, 4, 6, 8, 10, 12].map((n) => (
            <button key={n} onClick={() => setSeats(n)} className={`py-2 rounded-lg border text-sm font-black ${seats === n ? 'bg-[#800D32] text-white border-[#800D32]' : 'border-gray-200 text-gray-700'}`}>
              {n}
            </button>
          ))}
        </div>
      </div>
      <label className="block text-xs font-bold text-gray-600">
        Section
        <select className={`${inp} mt-1 bg-white`} value={sec} onChange={(e) => setSec(e.target.value)}>
          {sections.map((s) => (
            <option key={s}>{s}</option>
          ))}
          <option value="__new">+ New section…</option>
        </select>
      </label>
      {sec === '__new' && <input className={inp} placeholder="e.g. Rooftop" value={newSec} onChange={(e) => setNewSec(e.target.value)} />}
      {err && <p className="text-xs font-bold text-rose-600">{err}</p>}
      <button onClick={submit} className="w-full py-3 rounded-xl bg-[#800D32] text-white text-sm font-black inline-flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Add Table
      </button>
    </div>
  );
};

export default TablesPage;