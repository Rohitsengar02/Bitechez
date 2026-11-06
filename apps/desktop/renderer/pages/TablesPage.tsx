import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  CalendarDays,
  PlusCircle,
  FileText,
  ArrowLeftRight,
  Combine,
  Brush,
  Printer,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Armchair,
  Check,
  Plus,
} from 'lucide-react';
import type { MenuItem, RestaurantTable } from '@bitechez/shared-types';
import { formatINR } from '@bitechez/business-logic';
import { useCartStore } from '../stores/cartStore';
import { apiService } from '../services/api';
import { type OrderTypeKey } from '../utils/posPdf';

// 3D Table Assets
import tableAvailableImg from '../assets/tables/table_available.png';
import tableOccupiedImg from '../assets/tables/table_occupied.png';
import tableReservedImg from '../assets/tables/table_reserved.png';
import tableCleaningImg from '../assets/tables/table_cleaning.png';

// 3D Mascot & Food thumbnails
import butterChicken3d from '../assets/3d/butter_chicken.png';
import garlicNaan3d from '../assets/3d/garlic_naan.png';
import classicBurger3d from '../assets/3d/classic_burger.png';
import paneerTikka3d from '../assets/3d/paneer_tikka.png';
import recentDrink3d from '../assets/3d/recent_drink.png';

/* =====================================================================
   CONFIG + TYPES
   ===================================================================== */
type Status = 'available' | 'occupied' | 'reserved' | 'cleaning';
type StatusFilter = 'all' | Status;

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
  order?: HeldOrder;
  inPos?: boolean;
  posTotal?: number;
  posGuests?: number;
  reservation?: Reservation;
  isLocal: boolean;
}

const TABLE_IMAGES: Record<Status, string> = {
  available: tableAvailableImg,
  occupied: tableOccupiedImg,
  reserved: tableReservedImg,
  cleaning: tableCleaningImg,
};

const STATUS_CONFIG: Record<
  Status,
  {
    label: string;
    pillBg: string;
    pillText: string;
    cardBg: string;
    cardBorder: string;
    dotColor: string;
    activeRing: string;
    iconColor: string;
  }
> = {
  available: {
    label: 'Available',
    pillBg: 'bg-[#E7F9F0]',
    pillText: 'text-[#00C060]',
    cardBg: 'bg-white',
    cardBorder: 'border-slate-100 hover:border-emerald-200',
    dotColor: 'bg-[#00C060]',
    activeRing: 'ring-[#00C060]',
    iconColor: 'text-[#00C060]',
  },
  occupied: {
    label: 'Occupied',
    pillBg: 'bg-[#FFF0F3]',
    pillText: 'text-[#E11D48]',
    cardBg: 'bg-[#FFF8FA]',
    cardBorder: 'border-rose-100 hover:border-rose-300',
    dotColor: 'bg-[#E11D48]',
    activeRing: 'ring-[#E11D48]',
    iconColor: 'text-[#E11D48]',
  },
  reserved: {
    label: 'Reserved',
    pillBg: 'bg-[#EFF6FF]',
    pillText: 'text-[#2563EB]',
    cardBg: 'bg-[#F8FAFF]',
    cardBorder: 'border-blue-100 hover:border-blue-300',
    dotColor: 'bg-[#2563EB]',
    activeRing: 'ring-[#2563EB]',
    iconColor: 'text-[#2563EB]',
  },
  cleaning: {
    label: 'Cleaning',
    pillBg: 'bg-[#FFFBEB]',
    pillText: 'text-[#D97706]',
    cardBg: 'bg-[#FFFDF5]',
    cardBorder: 'border-amber-100 hover:border-amber-300',
    dotColor: 'bg-[#D97706]',
    activeRing: 'ring-[#D97706]',
    iconColor: 'text-[#D97706]',
  },
};

/* =====================================================================
   CSS ANIMATIONS (SMOKE EFFECT + TRANSITIONS)
   ===================================================================== */
const TABLES_CSS = `
@keyframes smokeWave {
  0% {
    opacity: 0.8;
    transform: scale(0.96) translateY(4px);
    filter: blur(2px);
  }
  50% {
    opacity: 0.5;
    filter: blur(4px);
  }
  100% {
    opacity: 0;
    transform: scale(1.04) translateY(-8px);
    filter: blur(8px);
  }
}
.anim-smoke {
  animation: smokeWave 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  pointer-events: none;
}
@keyframes floatGentle {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}
.anim-float-gentle {
  animation: floatGentle 3.5s ease-in-out infinite;
}
`;

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
const seatsOf = (t: RestaurantTable | LocalTable) => {
  const a = t as unknown as Record<string, unknown>;
  return Number(a.capacity ?? a.seats ?? a.seatCount ?? 4) || 4;
};

const foodThumbnail = (name: string) => {
  const n = name.toLowerCase();
  if (/butter.*chicken|chicken/.test(n)) return butterChicken3d;
  if (/naan|roti|bread/.test(n)) return garlicNaan3d;
  if (/tikka|paneer/.test(n)) return paneerTikka3d;
  if (/burger/.test(n)) return classicBurger3d;
  return recentDrink3d;
};

/* =====================================================================
   MODAL
   ===================================================================== */
const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}> = ({ open, onClose, title, subtitle, width = 'max-w-md', footer, children }) =>
  open ? (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-xs" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white w-full ${width} max-h-[90dvh] flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-100`}>
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-slate-900 truncate">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  ) : null;

/* =====================================================================
   REAL-TIME 3D TABLE CARD
   ===================================================================== */
const TableCard = memo(
  ({
    t,
    selected,
    now,
    onSelect,
  }: {
    t: TableView;
    selected: boolean;
    now: number;
    onSelect: (id: string) => void;
  }) => {
    const cfg = STATUS_CONFIG[t.status];
    const img = TABLE_IMAGES[t.status];
    const guests = t.order?.guests ?? t.posGuests ?? t.seats;
    const amount = t.order?.totalPaise ?? t.posTotal;

    return (
      <div
        onClick={() => onSelect(t.id)}
        className={`group relative rounded-2xl border p-3 flex flex-col justify-between text-left transition-all duration-200 cursor-pointer overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] ${
          cfg.cardBg
        } ${cfg.cardBorder} ${
          selected
            ? `ring-2 ${cfg.activeRing} ring-offset-2 border-emerald-400 shadow-md`
            : ''
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          {/* 3D Chair and Table Sticker (Real-time Color Changes based on Status) */}
          <div className="relative w-20 h-16 sm:w-24 sm:h-18 flex items-center justify-center shrink-0">
            <img
              src={img}
              alt={`${t.name} ${t.status}`}
              className="max-h-full max-w-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>

          {/* Table Info & Status Tag */}
          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-sm font-black text-slate-900 tracking-tight">{t.name}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 flex items-center justify-end gap-1">
              <Users className="w-2.5 h-2.5 text-slate-400" />
              <span>{guests}</span>
            </p>

            {/* Status Pill matching reference */}
            <div className="mt-1.5 flex justify-end">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${cfg.pillBg} ${cfg.pillText}`}
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
                {cfg.label}
              </span>
            </div>

            {/* Time or Reservation note */}
            {t.status === 'occupied' && (
              <div className="mt-1 flex items-center justify-end gap-2 text-[10px] font-bold text-slate-400">
                <span className="flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5 text-slate-400" />
                  {t.order ? `${minutesSince(t.order.heldAt, now)} min` : 'active'}
                </span>
                {amount !== undefined && (
                  <span className="font-black text-slate-800">
                    {formatINR(amount)}
                  </span>
                )}
              </div>
            )}
            {t.status === 'reserved' && t.reservation && (
              <p className="text-[9px] font-bold text-blue-600 mt-1 flex items-center justify-end gap-1">
                <CalendarDays className="w-2.5 h-2.5" />
                {to12h(t.reservation.time)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

/* =====================================================================
   MAIN COMPONENT: TABLES PAGE
   ===================================================================== */
export const TablesPage: React.FC = () => {
  const navigate = useNavigate();
  const cartStore = useCartStore();
  const {
    items: cartItems,
    tableId: cartTableId,
    orderType: cartOrderType,
    setOrderType,
    setTable,
    clearCart,
    getCalculations,
  } = cartStore;

  /* ---------- Data State ---------- */
  const [apiTables, setApiTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [localTables, setLocalTables] = usePersisted<LocalTable[]>('tables.local', []);
  const [overrides, setOverrides] = usePersisted<Record<string, Status>>('tables.status', {});
  const [held] = usePersisted<HeldOrder[]>('pos.held', []);
  const [reservations] = usePersisted<Reservation[]>('pos.reservations', []);

  /* ---------- Filters & Smoke Trigger ---------- */
  const [section, setSection] = useState('Floor 1');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [smokeKey, setSmokeKey] = useState(0);

  const triggerSmoke = useCallback(() => {
    setSmokeKey((k) => k + 1);
  }, []);

  const handleSectionChange = (sec: string) => {
    setSection(sec);
    triggerSmoke();
  };

  const handleStatusChange = (st: StatusFilter) => {
    setStatusFilter(st);
    triggerSmoke();
  };

  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [modal, setModal] = useState<null | 'add' | 'transfer' | 'merge' | 'clear'>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [now, setNow] = useState(Date.now());
  const [cartTab, setCartTab] = useState<'current' | 'history'>('current');

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 20_000);
    return () => clearInterval(id);
  }, []);

  const notify = (type: 'success' | 'error', text: string) => setToast({ type, text });

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await apiService.getTables();
      setApiTables(data);
    } catch (e) {
      console.error(e);
      setLoadError('Could not load tables from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ---------- Derived Tables Data ---------- */
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
        section: (t as unknown as { section?: string }).section || 'Floor 1',
        seats: seatsOf(t),
        apiStatus: String((t as unknown as { status?: string }).status ?? 'available').toLowerCase(),
        isLocal: false,
      })),
      ...localTables.map((t) => ({ ...t, apiStatus: 'available', isLocal: true })),
    ];

    return base.map((t) => {
      // Find matching active order for this table by id or by table name
      const order = heldByTable[t.id] || held.find((h) => h.tableName === t.name);
      const inPos = cartOrderType === 'dine_in' && (cartTableId === t.id || t.name === cartTableId) && cartItems.length > 0;
      const reservation = resByTable[t.id];

      let status: Status;
      if (overrides[t.id]) status = overrides[t.id];
      else if (order || inPos) status = 'occupied';
      else if (reservation) status = 'reserved';
      else if (['available', 'occupied', 'reserved', 'cleaning'].includes(t.apiStatus)) status = t.apiStatus as Status;
      else status = 'available';

      return {
        id: t.id,
        name: t.name,
        section: t.section,
        seats: t.seats,
        status,
        order,
        inPos,
        posTotal: order ? order.totalPaise : inPos ? posCalc?.grandTotalPaise : undefined,
        posGuests: order?.guests ?? undefined,
        reservation,
        isLocal: t.isLocal,
      };
    });
  }, [apiTables, localTables, held, reservations, overrides, cartOrderType, cartTableId, cartItems.length, posCalc?.grandTotalPaise]);

  // Default select T-02 as shown in reference image
  useEffect(() => {
    if (!selectedId) {
      const t02 = tables.find((t) => t.name === 'T-02') || tables[0];
      if (t02) setSelectedId(t02.id);
    }
  }, [tables, selectedId]);

  const sel = tables.find((t) => t.id === selectedId) || tables[0];

  const counts = useMemo(() => {
    const c = { total: tables.length, available: 0, occupied: 0, reserved: 0, cleaning: 0 };
    tables.forEach((t) => {
      c[t.status] = (c[t.status] || 0) + 1;
    });
    return c;
  }, [tables]);

  const visibleTables = useMemo(() => {
    return tables.filter((t) => {
      if (section !== 'all' && t.section !== section) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      return true;
    });
  }, [tables, section, statusFilter]);

  const setStatus = (id: string, st: Status) => {
    setOverrides((o) => ({ ...o, [id]: st }));
    notify('success', `Status updated to ${st}`);
  };

  /* Navigation to POS */
  const goToPos = (t: TableView) => {
    clearCart();
    setOrderType('dine_in');
    setTable(t.id, t.name);
    navigate('/pos');
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden bg-[#F4F7F6]">
      <style>{TABLES_CSS}</style>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[80] px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold border ${
            toast.type === 'success' ? 'bg-[#00C060] text-white border-emerald-300' : 'bg-white text-rose-600 border-rose-200'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.text}
        </div>
      )}

      {/* Main Floor Body */}
      <div className="flex-1 min-h-0 flex gap-3 overflow-hidden">
        {/* ================= LEFT / CENTER: TABLES FLOOR ================= */}
        <div className="flex-1 min-w-0 flex flex-col gap-3 h-full overflow-hidden">
          {/* Top Row: Floor Switcher Pills + Grid/List Icons */}
          <div className="flex items-center justify-between shrink-0">
            {/* Floor tabs */}
            <div className="flex items-center gap-2">
              {[
                { id: 'Floor 1', label: 'Floor 1 (16)' },
                { id: 'Floor 2', label: 'Floor 2 (12)' },
                { id: 'Rooftop', label: 'Rooftop (8)' },
              ].map((f) => {
                const active = section === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => handleSectionChange(f.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                      active
                        ? 'bg-[#00C060] text-white shadow-md shadow-emerald-500/20'
                        : 'bg-white border border-slate-200/80 text-slate-700 hover:border-emerald-300 hover:text-[#00C060]'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded border border-current flex items-center justify-center text-[9px] leading-none">
                      {f.id === 'Floor 1' ? '1' : f.id === 'Floor 2' ? '2' : 'R'}
                    </span>
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions / Add table */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setModal('add')}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200/90 text-slate-700 flex items-center justify-center hover:border-emerald-300 hover:text-[#00C060] transition shadow-xs"
                title="Add Table"
              >
                <Plus className="w-4 h-4" />
              </button>
              <div className="w-8 h-8 rounded-xl bg-[#00C060] text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Armchair className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Status Metric Filter Cards (Matching Reference) */}
          <div className="grid grid-cols-5 gap-2.5 shrink-0">
            {/* Total */}
            <button
              onClick={() => handleStatusChange('all')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border bg-white transition shadow-xs hover:border-slate-300 ${
                statusFilter === 'all' ? 'ring-2 ring-slate-800 border-slate-800' : 'border-slate-100'
              }`}
            >
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#00C060] flex items-center justify-center">
                <Armchair className="w-4 h-4 stroke-[2.5]" />
              </span>
              <div className="text-left leading-tight">
                <span className="text-sm font-black text-slate-900">{counts.total}</span>
                <span className="block text-[11px] font-bold text-slate-500">Total Tables</span>
              </div>
            </button>

            {/* Occupied (Red) */}
            <button
              onClick={() => handleStatusChange('occupied')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border bg-white transition shadow-xs hover:border-rose-300 ${
                statusFilter === 'occupied' ? 'ring-2 ring-rose-500 border-rose-500' : 'border-slate-100'
              }`}
            >
              <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Armchair className="w-4 h-4 stroke-[2.5]" />
              </span>
              <div className="text-left leading-tight">
                <span className="text-sm font-black text-rose-600">{counts.occupied}</span>
                <span className="block text-[11px] font-bold text-slate-500">Occupied</span>
              </div>
            </button>

            {/* Available (Green) */}
            <button
              onClick={() => handleStatusChange('available')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border bg-white transition shadow-xs hover:border-emerald-300 ${
                statusFilter === 'available' ? 'ring-2 ring-[#00C060] border-[#00C060]' : 'border-slate-100'
              }`}
            >
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#00C060] flex items-center justify-center">
                <Armchair className="w-4 h-4 stroke-[2.5]" />
              </span>
              <div className="text-left leading-tight">
                <span className="text-sm font-black text-[#00C060]">{counts.available}</span>
                <span className="block text-[11px] font-bold text-slate-500">Available</span>
              </div>
            </button>

            {/* Reserved (Blue) */}
            <button
              onClick={() => handleStatusChange('reserved')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border bg-white transition shadow-xs hover:border-blue-300 ${
                statusFilter === 'reserved' ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-100'
              }`}
            >
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 stroke-[2.5]" />
              </span>
              <div className="text-left leading-tight">
                <span className="text-sm font-black text-blue-600">{counts.reserved}</span>
                <span className="block text-[11px] font-bold text-slate-500">Reserved</span>
              </div>
            </button>

            {/* Cleaning (Yellow / Orange) */}
            <button
              onClick={() => handleStatusChange('cleaning')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border bg-white transition shadow-xs hover:border-amber-300 ${
                statusFilter === 'cleaning' ? 'ring-2 ring-amber-500 border-amber-500' : 'border-slate-100'
              }`}
            >
              <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Brush className="w-4 h-4 stroke-[2.5]" />
              </span>
              <div className="text-left leading-tight">
                <span className="text-sm font-black text-amber-600">{counts.cleaning}</span>
                <span className="block text-[11px] font-bold text-slate-500">Cleaning</span>
              </div>
            </button>
          </div>

          {/* Tables Grid with Smoke Wave Transition on Filter/Floor Switch */}
          <div className="relative flex-1 min-h-0 overflow-y-auto pos-scroll pr-1 pb-4">
            {/* Visual Smoke Animation Layer */}
            <div
              key={smokeKey}
              className="anim-smoke pointer-events-none absolute inset-0 bg-gradient-to-b from-white/70 via-emerald-100/30 to-transparent z-20 rounded-2xl"
            />

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-2xl bg-white border border-slate-100 p-4 animate-pulse shadow-xs" />
                ))}
              </div>
            ) : loadError ? (
              <div className="py-16 text-center">
                <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">{loadError}</p>
                <button onClick={load} className="mt-3 px-4 py-2 rounded-xl bg-[#00C060] text-white text-xs font-bold">
                  Retry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {visibleTables.map((t) => (
                  <TableCard
                    key={t.id}
                    t={t}
                    selected={t.id === sel?.id}
                    now={now}
                    onSelect={(id) => setSelectedId(id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT: SELECTED TABLE ORDER SIDEBAR ================= */}
        <aside className="w-[320px] xl:w-[350px] shrink-0 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(15,23,42,0.05)] flex flex-col h-full overflow-hidden justify-between">
          {sel ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E7F9F0] text-[#00C060] flex items-center justify-center shrink-0">
                    <Armchair className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">Table {sel.name}</h3>
                    <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-2">
                      <span>{sel.seats} Seats</span>
                      {sel.order && (
                        <>
                          <span>•</span>
                          <span>{minutesSince(sel.order.heldAt, now)} min</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black ${STATUS_CONFIG[sel.status].pillBg} ${STATUS_CONFIG[sel.status].pillText}`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                  {STATUS_CONFIG[sel.status].label}
                </span>
              </div>

              {/* Tabs: Current Order vs Order History */}
              <div className="flex items-center border-b border-slate-100 px-4 pt-1 shrink-0">
                <button
                  onClick={() => setCartTab('current')}
                  className={`flex-1 py-2 text-xs font-black border-b-2 transition ${
                    cartTab === 'current'
                      ? 'border-[#00C060] text-[#00C060]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Current Order {sel.order ? `(${sel.order.entries.length})` : '(0)'}
                </button>
                <button
                  onClick={() => setCartTab('history')}
                  className={`flex-1 py-2 text-xs font-black border-b-2 transition ${
                    cartTab === 'history'
                      ? 'border-[#00C060] text-[#00C060]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Order History
                </button>
              </div>

              {/* Order Items List (Real Order Data only, Clear when Available/Cleaning) */}
              <div className="flex-1 min-h-0 overflow-y-auto pos-scroll px-4 divide-y divide-slate-100/70">
                {sel.order && sel.order.entries.length > 0 ? (
                  sel.order.entries.map((e, i) => (
                    <div key={i} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={foodThumbnail(e.item.name)}
                          alt={e.item.name}
                          className="w-9 h-9 rounded-lg object-contain bg-slate-50 shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="text-[11px] font-black text-slate-900 truncate">{e.item.name}</h5>
                          <p className="text-[10px] font-bold text-slate-400">×{e.quantity}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-900 whitespace-nowrap">
                        {formatINR(e.item.basePricePaise * e.quantity)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-14 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00C060] flex items-center justify-center mb-2">
                      <Armchair className="w-6 h-6 stroke-[2]" />
                    </div>
                    <p className="text-xs font-black text-slate-800">
                      {sel.status === 'available'
                        ? 'Table is Ready & Available'
                        : sel.status === 'cleaning'
                        ? 'Table is Being Cleaned'
                        : sel.status === 'reserved'
                        ? 'Table is Reserved'
                        : 'No Active Order'}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-1">
                      {sel.status === 'available'
                        ? 'Click "Take Order" below to seat guests and start billing.'
                        : sel.status === 'cleaning'
                        ? 'Click "Cleaned" below once sanitization is completed.'
                        : 'Ready for guest seating'}
                    </p>
                  </div>
                )}
              </div>

              {/* Total & Action Buttons */}
              <div className="p-3 border-t border-slate-100 space-y-2.5 bg-white shrink-0">
                {/* Total amount bar */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-2">
                  <span className="text-xs font-black text-slate-800">Total Amount</span>
                  <span className="text-lg font-black text-[#00C060]">
                    {formatINR(sel.order ? sel.order.totalPaise : 0)}
                  </span>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => goToPos(sel)}
                    className="col-span-1 py-2 px-2 rounded-xl bg-[#00C060] hover:bg-[#00A850] text-white text-xs font-black flex items-center justify-center gap-1 shadow-xs transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{sel.order ? 'Add Items' : 'Take Order'}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!sel.order) return notify('error', 'No active order to print KOT');
                      notify('success', `KOT printed for Table ${sel.name}`);
                    }}
                    disabled={!sel.order}
                    className="py-2 px-2 rounded-xl border border-slate-200/90 text-slate-700 hover:border-slate-300 text-xs font-black flex items-center justify-center gap-1 shadow-xs transition bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>KOT</span>
                  </button>
                  <button
                    onClick={() => goToPos(sel)}
                    disabled={!sel.order}
                    className="py-2 px-2 rounded-xl border border-slate-200/90 text-slate-700 hover:border-slate-300 text-xs font-black flex items-center justify-center gap-1 shadow-xs transition bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Settle Bill</span>
                  </button>
                </div>

                {/* Secondary Actions Row */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setModal('transfer')}
                    className="py-1.5 px-2 rounded-lg border border-slate-200 text-slate-700 hover:border-slate-300 text-[10px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    <ArrowLeftRight className="w-3 h-3 text-slate-500" />
                    <span>Move Table</span>
                  </button>
                  <button
                    onClick={() => setModal('merge')}
                    className="py-1.5 px-2 rounded-lg border border-slate-200 text-slate-700 hover:border-slate-300 text-[10px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    <Combine className="w-3 h-3 text-slate-500" />
                    <span>Merge Table</span>
                  </button>
                  {sel.status === 'cleaning' ? (
                    <button
                      onClick={() => {
                        setStatus(sel.id, 'available');
                        notify('success', `${sel.name} is now Cleaned & Available`);
                      }}
                      className="py-1.5 px-2 rounded-lg border border-emerald-300 bg-emerald-50 text-[#00C060] hover:bg-emerald-100 text-[10px] font-black flex items-center justify-center gap-1 transition shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3] text-[#00C060]" />
                      <span>Cleaned</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setStatus(sel.id, 'cleaning');
                        notify('success', `${sel.name} sent for cleaning`);
                      }}
                      className="py-1.5 px-2 rounded-lg border border-rose-100 text-rose-500 hover:bg-rose-50 text-[10px] font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Trash2 className="w-3 h-3 text-rose-500" />
                      <span>Clear Table</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">Select a table to view order</div>
          )}
        </aside>
      </div>

      {/* ================= MODALS ================= */}
      {/* Transfer / Move Table */}
      <Modal
        open={modal === 'transfer'}
        onClose={() => setModal(null)}
        title={`Move Table ${sel?.name}`}
        subtitle="Select destination table to move running order"
      >
        <div className="grid grid-cols-3 gap-2">
          {tables
            .filter((t) => t.id !== sel?.id && t.status === 'available')
            .map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setStatus(t.id, 'occupied');
                  setStatus(sel.id, 'cleaning');
                  setSelectedId(t.id);
                  setModal(null);
                  notify('success', `Moved ${sel.name} → ${t.name}`);
                }}
                className="py-3 rounded-xl border border-slate-200 bg-white hover:border-[#00C060] flex flex-col items-center gap-1 font-black text-xs text-slate-800 transition"
              >
                <Armchair className="w-5 h-5 text-[#00C060]" />
                <span>{t.name}</span>
                <span className="text-[10px] font-semibold text-slate-400">{t.seats} seats</span>
              </button>
            ))}
        </div>
      </Modal>

      {/* Merge Table */}
      <Modal
        open={modal === 'merge'}
        onClose={() => setModal(null)}
        title={`Merge Table ${sel?.name}`}
        subtitle="Select another table to combine bills"
      >
        <div className="grid grid-cols-3 gap-2">
          {tables
            .filter((t) => t.id !== sel?.id && t.status === 'occupied')
            .map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setStatus(sel.id, 'cleaning');
                  setSelectedId(t.id);
                  setModal(null);
                  notify('success', `Merged ${sel.name} into ${t.name}`);
                }}
                className="py-3 rounded-xl border border-slate-200 bg-white hover:border-rose-400 flex flex-col items-center gap-1 font-black text-xs text-slate-800 transition"
              >
                <Armchair className="w-5 h-5 text-rose-500" />
                <span>{t.name}</span>
                <span className="text-[10px] font-semibold text-slate-400">Occupied</span>
              </button>
            ))}
        </div>
      </Modal>

      {/* Add Table Modal */}
      <Modal
        open={modal === 'add'}
        onClose={() => setModal(null)}
        title="Add New Table"
        subtitle="Add a new dining table to this floor"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const name = (form.elements.namedItem('name') as HTMLInputElement).value;
            const seats = Number((form.elements.namedItem('seats') as HTMLInputElement).value) || 4;
            setLocalTables((prev) => [...prev, { id: `local-${uid()}`, name, section, seats }]);
            setModal(null);
            notify('success', `${name} created successfully`);
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">Table Name</label>
            <input
              name="name"
              defaultValue={`T-${String(tables.length + 1).padStart(2, '0')}`}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">Seats Capacity</label>
            <input
              name="seats"
              type="number"
              defaultValue={4}
              min={1}
              max={20}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-emerald-400"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#00C060] text-white text-xs font-black shadow-md shadow-emerald-500/20 hover:bg-[#00A850] transition"
          >
            Create Table
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default TablesPage;
