import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ConciergeBell,
  Clock,
  Check,
  CheckCircle2,
  UserRound,
  Droplet,
  Utensils,
  FileText,
  Headset,
  MoreHorizontal,
  ChevronDown,
  Search,
  LayoutGrid,
  List,
  Users,
  X,
  AlertCircle,
  Settings,
  Plus,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import type { MenuItem, RestaurantTable } from '@bitechez/shared-types';
import { apiService } from '../services/api';

/* =====================================================================
   CONFIG + TYPES
   ===================================================================== */
const PAGE_OFFSET = '9.75rem';
const REQ_KEY = 'service.requests';
const WAITERS_KEY = 'service.waiters';
const AUTO_KEY = 'service.autoAssign';

export type RequestType = 'call_waiter' | 'water' | 'cutlery' | 'bill' | 'assistance' | 'other';
type ReqStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface ServiceRequest {
  id: string;
  tableId: string;
  tableName: string;
  type: RequestType;
  note?: string;
  status: ReqStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  waiter?: string;
}

interface FloorTable {
  id: string;
  name: string;
  section: string;
  seats: number;
  guests?: number;
  occupied: boolean;
}

const TYPE_META: Record<RequestType, { label: string; icon: React.ElementType; describe: (t: string) => string }> = {
  call_waiter: { label: 'Call Waiter', icon: ConciergeBell, describe: (t) => `Customer has requested a waiter at Table ${t}.` },
  water: { label: 'Water', icon: Droplet, describe: (t) => `Table ${t} has asked for water.` },
  cutlery: { label: 'Cutlery', icon: Utensils, describe: (t) => `Table ${t} needs cutlery.` },
  bill: { label: 'Bill Request', icon: FileText, describe: (t) => `Table ${t} has asked for the bill.` },
  assistance: { label: 'Assistance', icon: Headset, describe: (t) => `Table ${t} needs assistance from staff.` },
  other: { label: 'Other', icon: MoreHorizontal, describe: (t) => `Table ${t} has a request.` },
};
const TYPE_ORDER: RequestType[] = ['call_waiter', 'water', 'cutlery', 'bill', 'assistance', 'other'];

const STATUS_PILL: Record<ReqStatus, { cls: string; label: string }> = {
  pending: { cls: 'bg-rose-100 text-[#B0123F]', label: 'Pending' },
  in_progress: { cls: 'bg-amber-100 text-amber-700', label: 'In Progress' },
  completed: { cls: 'bg-emerald-100 text-emerald-700', label: 'Completed' },
  cancelled: { cls: 'bg-gray-100 text-gray-500', label: 'Cancelled' },
};

/* =====================================================================
   STORAGE (shared across tabs)
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

/** Least-loaded waiter (fewest open requests). */
function pickWaiter(waiters: string[], reqs: ServiceRequest[]) {
  if (!waiters.length) return undefined;
  const load = Object.fromEntries(waiters.map((w) => [w, 0]));
  reqs.forEach((r) => r.waiter && r.status !== 'completed' && r.status !== 'cancelled' && load[r.waiter] !== undefined && (load[r.waiter] += 1));
  return [...waiters].sort((a, b) => load[a] - load[b])[0];
}

/**
 * Raise a service request from anywhere (POS, QR table menu, tablet at the table).
 * The Requests page picks it up instantly (same tab) or via the storage event (other tabs).
 */
export function addServiceRequest(tableId: string, tableName: string, type: RequestType, note?: string): ServiceRequest {
  const list = readJSON<ServiceRequest[]>(REQ_KEY, []);
  const auto = readJSON<boolean>(AUTO_KEY, true);
  const req: ServiceRequest = {
    id: uid(),
    tableId,
    tableName,
    type,
    note: note?.trim() || undefined,
    status: 'pending',
    createdAt: new Date().toISOString(),
    waiter: auto ? pickWaiter(readJSON<string[]>(WAITERS_KEY, []), list) : undefined,
  };
  writeJSON(REQ_KEY, [req, ...list].slice(0, 500));
  window.dispatchEvent(new CustomEvent('service-requests-changed'));
  return req;
}

/* =====================================================================
   HELPERS
   ===================================================================== */
const minsSince = (iso: string | undefined, now: number) => (iso ? Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000)) : 0);
const ago = (iso: string | undefined, now: number) => {
  const m = minsSince(iso, now);
  return m < 1 ? 'Just now' : m < 60 ? `${m} min ago` : `${Math.floor(m / 60)}h ${m % 60}m ago`;
};
const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();
const isOpen = (r: ServiceRequest) => r.status === 'pending' || r.status === 'in_progress';

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 660;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.4);
    setTimeout(() => ctx.close(), 600);
  } catch {
    /* ignore */
  }
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

const StatCard = ({ icon, value, label, tint }: { icon: React.ReactNode; value: number; label: string; tint: string }) => (
  <div className="shrink-0 flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 min-w-[160px]">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tint}`}>{icon}</div>
    <div>
      <p className="text-2xl font-black text-[#191923] leading-none">{value}</p>
      <p className="text-xs font-semibold text-gray-500 mt-1">{label}</p>
    </div>
  </div>
);

const StatusPill = ({ s }: { s: ReqStatus }) => (
  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${STATUS_PILL[s].cls}`}>
    {s === 'in_progress' && <UserRound className="w-3 h-3" />}
    {s === 'completed' && <Check className="w-3 h-3" />}
    {STATUS_PILL[s].label}
  </span>
);

const TypeIcon = ({ type, className = 'w-5 h-5' }: { type: RequestType; className?: string }) => {
  const I = TYPE_META[type].icon;
  return <I className={className} />;
};

/* =====================================================================
   REQUEST ROW (left list)
   ===================================================================== */
const RequestRow = memo(({ r, now, selected, onSelect }: { r: ServiceRequest; now: number; selected: boolean; onSelect: (r: ServiceRequest) => void }) => {
  const water = r.type === 'water';
  return (
    <button
      onClick={() => onSelect(r)}
      className={`w-full flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${selected ? 'border-[#E58AA7] bg-[#FFF5F8]' : 'border-gray-100 bg-white hover:bg-gray-50'
        } ${r.status === 'completed' || r.status === 'cancelled' ? 'opacity-75' : ''}`}
    >
      <span className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${water ? 'bg-sky-50 text-sky-600' : 'bg-rose-50 text-[#800D32]'}`}>
        <TypeIcon type={r.type} className="w-6 h-6" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] font-black text-[#191923] truncate">Table {r.tableName}</span>
        <span className="block text-xs font-semibold text-gray-600 truncate">
          {TYPE_META[r.type].label}
          {r.note ? ` (${r.note})` : ''}
        </span>
        {r.waiter && <span className="block text-[10px] font-semibold text-gray-400 truncate">→ {r.waiter}</span>}
      </span>
      <span className="flex flex-col items-end gap-1.5 shrink-0">
        <span className={`text-[11px] font-bold ${r.status === 'pending' && minsSince(r.createdAt, now) < 1 ? 'text-[#B0123F]' : 'text-gray-500'}`}>{ago(r.createdAt, now)}</span>
        <StatusPill s={r.status} />
      </span>
    </button>
  );
});

/* =====================================================================
   FLOOR VIEW
   ===================================================================== */
type TileState = 'available' | 'request' | 'progress' | 'assistance' | 'occupied';
const TILE: Record<TileState, { top: string; chair: string; text: string; label: string; dot: string }> = {
  available: { top: 'bg-[#F2FBF5] border-[#CDEFD8]', chair: 'bg-[#E9D9C7]', text: 'text-[#191923]', label: 'Available', dot: 'bg-emerald-500' },
  request: { top: 'bg-[#FFE4EB] border-[#F3A2B8]', chair: 'bg-[#E7809D]', text: 'text-[#800D32]', label: 'Request', dot: 'bg-rose-500' },
  progress: { top: 'bg-[#FFF3D6] border-[#F7D27A]', chair: 'bg-[#E9D9C7]', text: 'text-[#191923]', label: 'In Progress', dot: 'bg-amber-400' },
  assistance: { top: 'bg-[#F1EBFF] border-[#CDBBF7]', chair: 'bg-[#E9D9C7]', text: 'text-[#191923]', label: 'Assistance', dot: 'bg-violet-500' },
  occupied: { top: 'bg-[#F3F3F5] border-[#DADAE0]', chair: 'bg-[#D9D9DE]', text: 'text-[#191923]', label: 'Occupied', dot: 'bg-gray-300' },
};

const FloorTile = memo(({ t, state, req, selected, onClick }: { t: FloorTable; state: TileState; req?: ServiceRequest; selected: boolean; onClick: () => void }) => {
  const s = TILE[state];
  return (
    <button onClick={onClick} className="relative w-full aspect-square max-w-[150px] mx-auto flex items-center justify-center" aria-label={`Table ${t.name}`}>
      {/* chairs */}
      <span className={`absolute top-[6%] left-1/2 -translate-x-1/2 w-[34%] h-[12%] rounded-t-xl ${s.chair}`} />
      <span className={`absolute bottom-[6%] left-1/2 -translate-x-1/2 w-[34%] h-[12%] rounded-b-xl ${s.chair}`} />
      <span className={`absolute left-[6%] top-1/2 -translate-y-1/2 h-[34%] w-[12%] rounded-l-xl ${s.chair}`} />
      <span className={`absolute right-[6%] top-1/2 -translate-y-1/2 h-[34%] w-[12%] rounded-r-xl ${s.chair}`} />
      {/* table top */}
      <span
        className={`relative w-[64%] h-[64%] rounded-2xl border-2 shadow-[0_6px_14px_-6px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center gap-0.5 ${s.top} ${selected ? 'ring-4 ring-[#800D32]/35' : ''
          } ${state === 'request' ? 'shadow-[0_0_0_6px_rgba(240,80,120,0.18)]' : ''}`}
      >
        {state === 'available' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        {state === 'occupied' && <Users className="w-5 h-5 text-gray-500" />}
        {(state === 'request' || state === 'assistance') && req && <TypeIcon type={req.type} className={`w-5 h-5 ${state === 'assistance' ? 'text-violet-600' : 'text-[#800D32]'}`} />}
        {state === 'progress' && (
          <span className="w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center">
            <UserRound className="w-3 h-3" />
          </span>
        )}
        <span className={`text-base font-black leading-none ${s.text}`}>{t.name}</span>
        {t.guests ? <span className="text-[9px] font-bold text-gray-500">{t.guests} guests</span> : null}
      </span>
    </button>
  );
});

/* =====================================================================
   PAGE
   ===================================================================== */
export const RequestsPage: React.FC = () => {
  const navigate = useNavigate();

  /* ---------- data ---------- */
  const [requests, setRequests] = useState<ServiceRequest[]>(() => readJSON(REQ_KEY, []));
  const [waiters, setWaiters] = useState<string[]>(() => readJSON(WAITERS_KEY, ['Amit', 'Priya', 'Rahul', 'Sneha']));
  const [autoAssign, setAutoAssign] = useState<boolean>(() => readJSON(AUTO_KEY, true));
  const [apiTables, setApiTables] = useState<RestaurantTable[]>([]);
  const [tablesError, setTablesError] = useState(false);
  const seen = useRef(new Set(requests.map((r) => r.id)));

  useEffect(() => {
    apiService
      .getTables()
      .then(setApiTables)
      .catch(() => setTablesError(true));
  }, []);
  useEffect(() => writeJSON(WAITERS_KEY, waiters), [waiters]);
  useEffect(() => writeJSON(AUTO_KEY, autoAssign), [autoAssign]);

  const sync = useCallback(() => {
    const list = readJSON<ServiceRequest[]>(REQ_KEY, []);
    if (list.some((r) => !seen.current.has(r.id) && r.status === 'pending')) beep();
    list.forEach((r) => seen.current.add(r.id));
    setRequests((cur) => (JSON.stringify(cur) === JSON.stringify(list) ? cur : list));
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => e.key === REQ_KEY && sync();
    const onLocal = () => sync();
    window.addEventListener('storage', onStorage);
    window.addEventListener('service-requests-changed', onLocal);
    const poll = setInterval(sync, 5000);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('service-requests-changed', onLocal);
      clearInterval(poll);
    };
  }, [sync]);

  /** Mutate the latest stored list so requests raised elsewhere are never lost. */
  const mutate = useCallback((fn: (l: ServiceRequest[]) => ServiceRequest[]) => {
    const next = fn(readJSON<ServiceRequest[]>(REQ_KEY, []));
    writeJSON(REQ_KEY, next);
    next.forEach((r) => seen.current.add(r.id));
    setRequests(next);
  }, []);

  // When auto-assign is switched on, assign every open unassigned request
  useEffect(() => {
    if (!autoAssign || !waiters.length) return;
    const cur = readJSON<ServiceRequest[]>(REQ_KEY, []);
    if (!cur.some((r) => isOpen(r) && !r.waiter)) return;
    mutate((l) => {
      const out = [...l];
      out.forEach((r, i) => {
        if (isOpen(r) && !r.waiter) out[i] = { ...r, waiter: pickWaiter(waiters, out) };
      });
      return out;
    });
  }, [autoAssign, waiters, mutate, requests.length]);

  /* ---------- ui state ---------- */
  const [typeFilter, setTypeFilter] = useState<'all' | RequestType>('all');
  const [tableFilter, setTableFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'floor' | 'list'>('floor');
  const [section, setSection] = useState<string>('');
  const [sel, setSel] = useState<{ tableId?: string; requestId?: string }>({});
  const [modal, setModal] = useState<null | 'other' | 'settings' | 'details'>(null);
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------- tables (API + local + guests from held orders) ---------- */
  const tables: FloorTable[] = useMemo(() => {
    const held = readJSON<{ tableId?: string; guests: number; entries: { item: MenuItem; quantity: number }[] }[]>('pos.held', []);
    const guestsBy: Record<string, number> = {};
    held.forEach((h) => h.tableId && (guestsBy[h.tableId] = h.guests));
    const local = readJSON<{ id: string; name: string; section: string; seats: number }[]>('tables.local', []);
    const base = [
      ...apiTables.map((t) => {
        const a = t as unknown as Record<string, unknown>;
        return {
          id: t.id,
          name: t.name,
          section: String(a.section || 'Main Dining'),
          seats: Number(a.capacity ?? a.seats ?? 4) || 4,
          apiOccupied: String(a.status ?? '').toLowerCase() === 'occupied',
        };
      }),
      ...local.map((t) => ({ ...t, apiOccupied: false })),
    ];
    return base
      .map((t) => ({ id: t.id, name: t.name, section: t.section, seats: t.seats, guests: guestsBy[t.id], occupied: !!guestsBy[t.id] || t.apiOccupied }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [apiTables]);

  const sections = useMemo(() => [...new Set(tables.map((t) => t.section))], [tables]);
  useEffect(() => {
    if (!section && sections.length) setSection(sections[0]);
  }, [sections, section]);

  /* ---------- derived ---------- */
  const todays = useMemo(() => requests.filter((r) => isToday(r.createdAt) || isOpen(r)), [requests]);

  const typeCounts = useMemo(() => {
    const c = Object.fromEntries(TYPE_ORDER.map((t) => [t, 0])) as Record<RequestType, number>;
    todays.forEach((r) => (c[r.type] += 1));
    return c;
  }, [todays]);

  const stats = useMemo(
    () => ({
      total: todays.length,
      pending: todays.filter((r) => r.status === 'pending').length,
      progress: todays.filter((r) => r.status === 'in_progress').length,
      done: todays.filter((r) => r.status === 'completed').length,
    }),
    [todays]
  );

  const listed = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rank: Record<ReqStatus, number> = { pending: 0, in_progress: 1, completed: 2, cancelled: 3 };
    return todays
      .filter(
        (r) =>
          (typeFilter === 'all' || r.type === typeFilter) &&
          (tableFilter === 'all' || r.tableId === tableFilter) &&
          (!q || [r.tableName, TYPE_META[r.type].label, r.note ?? '', r.waiter ?? ''].some((x) => x.toLowerCase().includes(q)))
      )
      .sort((a, b) => rank[a.status] - rank[b.status] || b.createdAt.localeCompare(a.createdAt));
  }, [todays, typeFilter, tableFilter, query]);

  /** Latest open request per table. */
  const openByTable = useMemo(() => {
    const m: Record<string, ServiceRequest> = {};
    todays
      .filter(isOpen)
      .sort((a, b) => (a.status === b.status ? b.createdAt.localeCompare(a.createdAt) : a.status === 'pending' ? -1 : 1))
      .forEach((r) => (m[r.tableId] ||= r));
    return m;
  }, [todays]);

  const tileState = useCallback(
    (t: FloorTable): TileState => {
      const r = openByTable[t.id];
      if (r?.status === 'pending') return r.type === 'assistance' ? 'assistance' : 'request';
      if (r?.status === 'in_progress') return 'progress';
      return t.occupied ? 'occupied' : 'available';
    },
    [openByTable]
  );

  const legend = useMemo(() => {
    const c: Record<TileState, number> = { available: 0, request: 0, progress: 0, assistance: 0, occupied: 0 };
    tables.filter((t) => t.section === section).forEach((t) => (c[tileState(t)] += 1));
    return c;
  }, [tables, section, tileState]);

  // Default selection: newest pending request
  useEffect(() => {
    if (sel.tableId) return;
    const first = listed.find((r) => r.status === 'pending') ?? listed[0];
    if (first) setSel({ tableId: first.tableId, requestId: first.id });
  }, [listed, sel.tableId]);

  const selRequest = requests.find((r) => r.id === sel.requestId);
  const selTable: FloorTable | undefined =
    tables.find((t) => t.id === sel.tableId) ?? (selRequest ? { id: selRequest.tableId, name: selRequest.tableName, section: '', seats: 0, occupied: false } : undefined);

  /* ---------- actions ---------- */
  const isMobile = () => window.matchMedia('(max-width: 1279px)').matches;
  const selectRequest = useCallback((r: ServiceRequest) => {
    setSel({ tableId: r.tableId, requestId: r.id });
    if (isMobile()) setModal('details');
  }, []);
  const selectTable = (t: FloorTable) => {
    setSel({ tableId: t.id, requestId: openByTable[t.id]?.id });
    if (isMobile()) setModal('details');
  };

  const setStatus = (id: string, status: ReqStatus) => {
    const stamp = new Date().toISOString();
    mutate((l) =>
      l.map((r) =>
        r.id === id
          ? {
            ...r,
            status,
            startedAt: status === 'in_progress' ? stamp : r.startedAt,
            completedAt: status === 'completed' || status === 'cancelled' ? stamp : r.completedAt,
            waiter: status === 'in_progress' && !r.waiter ? pickWaiter(waiters, l) : r.waiter,
          }
          : r
      )
    );
    setToast({ type: 'success', text: `Request ${STATUS_PILL[status].label.toLowerCase()}` });
  };

  const assign = (id: string, waiter: string | undefined) => mutate((l) => l.map((r) => (r.id === id ? { ...r, waiter } : r)));

  const raise = (type: RequestType, note?: string) => {
    if (!selTable) return;
    const r = addServiceRequest(selTable.id, selTable.name, type, note);
    seen.current.add(r.id);
    sync();
    setSel({ tableId: selTable.id, requestId: r.id });
    setToast({ type: 'success', text: `${TYPE_META[type].label} raised for Table ${selTable.name}` });
  };

  /* ---------- details panel ---------- */
  const details = selTable ? (
    <DetailsPanel
      table={selTable}
      req={selRequest}
      openForTable={todays.filter((r) => r.tableId === selTable.id && isOpen(r))}
      now={now}
      waiters={waiters}
      onPick={(r) => setSel({ tableId: r.tableId, requestId: r.id })}
      onStatus={setStatus}
      onAssign={assign}
      onQuick={(t) => (t === 'other' ? setModal('other') : raise(t))}
      onOpenTable={() => navigate('/tables')}
    />
  ) : (
    <div className="h-full bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center p-6">
      <ConciergeBell className="w-10 h-10 text-rose-200 mb-2" />
      <p className="text-sm font-bold text-gray-600">Select a request or table</p>
    </div>
  );

  /* ---------- render ---------- */
  const tabs: { k: 'all' | RequestType; l: string; I: React.ElementType; n: number }[] = [
    { k: 'all', l: 'All Requests', I: ConciergeBell, n: todays.length },
    ...TYPE_ORDER.map((t) => ({ k: t, l: t === 'bill' ? 'Bill' : TYPE_META[t].label, I: TYPE_META[t].icon, n: typeCounts[t] })),
  ];

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
          <ConciergeBell className="w-12 h-12 text-[#800D32]" strokeWidth={1.7} />
          <div>
            <h1 className="text-2xl font-black text-[#191923] leading-tight">Service Requests</h1>
            <p className="text-xs text-gray-500 font-medium hidden sm:block">Manage and respond to table service requests in real-time</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 overflow-x-auto max-w-full pb-0.5">
          <StatCard icon={<ConciergeBell className="w-6 h-6 text-[#800D32]" />} value={stats.total} label="Total Requests" tint="bg-rose-50" />
          <StatCard icon={<Clock className="w-6 h-6 text-[#800D32]" />} value={stats.pending} label="Pending" tint="bg-rose-50" />
          <StatCard icon={<Check className="w-6 h-6 text-blue-600" />} value={stats.progress} label="In Progress" tint="bg-blue-50" />
          <StatCard icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />} value={stats.done} label="Completed" tint="bg-emerald-50" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 cursor-pointer">
            <span className="text-sm font-bold text-[#191923]">Auto Assign</span>
            <input type="checkbox" className="sr-only" checked={autoAssign} onChange={(e) => setAutoAssign(e.target.checked)} />
            <span className={`relative w-11 h-6 rounded-full ${autoAssign ? 'bg-[#800D32]' : 'bg-gray-200'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow ${autoAssign ? 'left-6' : 'left-1'}`} />
            </span>
          </label>
          <button onClick={() => setModal('settings')} className="w-12 h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:text-[#800D32]" aria-label="Waiters & settings">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ===== Filters ===== */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full">
          {tabs.map((t) => (
            <button
              key={t.k}
              onClick={() => setTypeFilter(t.k)}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold ${typeFilter === t.k ? 'bg-[#800D32] text-white border-[#800D32]' : 'bg-white text-[#191923] border-gray-200 hover:border-[#F3C3D2]'
                }`}
            >
              <t.I className="w-4 h-4" /> {t.l} <span className={typeFilter === t.k ? 'text-rose-100' : 'text-gray-400'}>({t.n})</span>
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-[#191923] focus:outline-none focus:ring-2 focus:ring-[#800D32]/30"
          >
            <option value="all">All Tables</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                Table {t.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search request..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#800D32]/30" />
        </div>
      </div>

      {/* ===== Body ===== */}
      <div className="flex-1 min-h-0 flex gap-3">
        {/* Request list */}
        <aside className={`${view === 'list' ? 'flex' : 'hidden md:flex'} flex-1 md:flex-none md:w-[300px] xl:w-[330px] 2xl:w-[360px] shrink-0 min-h-0 flex-col bg-white rounded-2xl border border-gray-100 shadow-sm p-2`}>
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 p-0.5">
            {listed.length === 0 ? (
              <div className="py-16 text-center">
                <ConciergeBell className="w-10 h-10 text-rose-200 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-600">No requests</p>
                <p className="text-xs text-gray-400">Requests raised from tables appear here instantly</p>
              </div>
            ) : (
              listed.map((r) => <RequestRow key={r.id} r={r} now={now} selected={r.id === sel.requestId} onSelect={selectRequest} />)
            )}
          </div>
        </aside>

        {/* Floor / list switcher */}
        <section className={`${view === 'list' ? 'hidden md:flex' : 'flex'} flex-1 min-w-0 min-h-0 flex-col gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-3`}>
          <div className="flex items-center gap-2 flex-wrap">
            {(['floor', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold ${view === v ? 'bg-[#800D32] text-white' : 'text-[#191923] hover:bg-gray-50'}`}
              >
                {v === 'floor' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                {v === 'floor' ? 'Floor View' : 'List View'}
              </button>
            ))}
            {sections.length > 0 && (
              <div className="relative ml-auto">
                <select value={section} onChange={(e) => setSection(e.target.value)} className="appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-[#191923] focus:outline-none">
                  {sections.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
              </div>
            )}
          </div>

          {view === 'floor' ? (
            <>
              <div
                className="flex-1 min-h-[300px] overflow-y-auto rounded-2xl border-[10px] border-[#E9DFD4] p-4"
                style={{
                  backgroundColor: '#F7F1EA',
                  backgroundImage: 'linear-gradient(#EFE6DC 1px, transparent 1px), linear-gradient(90deg, #EFE6DC 1px, transparent 1px)',
                  backgroundSize: '48px 48px',
                }}
              >
                {tablesError ? (
                  <p className="text-center text-sm font-bold text-gray-500 py-10">Could not load tables.</p>
                ) : (
                  <div className="grid gap-x-6 gap-y-4 [grid-template-columns:repeat(auto-fill,minmax(110px,1fr))]">
                    {tables
                      .filter((t) => t.section === section)
                      .map((t) => (
                        <FloorTile key={t.id} t={t} state={tileState(t)} req={openByTable[t.id]} selected={t.id === sel.tableId} onClick={() => selectTable(t)} />
                      ))}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center gap-x-5 gap-y-1 flex-wrap text-xs font-bold text-[#191923]">
                {(Object.keys(TILE) as TileState[]).map((k) => (
                  <span key={k} className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded-full ${TILE[k].dot}`} />
                    {TILE[k].label} <span className="text-gray-400">({legend[k]})</span>
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#FFF5F8] text-left text-xs font-black text-[#800D32]">
                  <tr>
                    <th className="px-4 py-3">Table</th>
                    <th className="px-3 py-3">Request</th>
                    <th className="px-3 py-3">Waiter</th>
                    <th className="px-3 py-3">Time</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {listed.map((r) => (
                    <tr key={r.id} onClick={() => selectRequest(r)} className={`cursor-pointer hover:bg-gray-50 ${r.id === sel.requestId ? 'bg-[#FFF7FA]' : ''}`}>
                      <td className="px-4 py-3 font-black whitespace-nowrap">{r.tableName}</td>
                      <td className="px-3 py-3 font-semibold text-gray-700">
                        {TYPE_META[r.type].label}
                        {r.note ? <span className="text-gray-400"> · {r.note}</span> : null}
                      </td>
                      <td className="px-3 py-3 text-gray-600">{r.waiter ?? '—'}</td>
                      <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{ago(r.createdAt, now)}</td>
                      <td className="px-3 py-3">
                        <StatusPill s={r.status} />
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {r.status === 'pending' && (
                          <button onClick={() => setStatus(r.id, 'in_progress')} className="px-3 py-1.5 rounded-lg bg-[#800D32] text-white text-xs font-black">
                            Start
                          </button>
                        )}
                        {r.status === 'in_progress' && (
                          <button onClick={() => setStatus(r.id, 'completed')} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-black">
                            Done
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Details */}
        <aside className="hidden xl:flex w-[360px] 2xl:w-[400px] shrink-0 min-h-0 flex-col">{details}</aside>
      </div>

      {/* ===== Modals ===== */}
      <Modal open={modal === 'details'} onClose={() => setModal(null)} title={selTable ? `Table ${selTable.name}` : ''} width="max-w-lg">
        {details}
      </Modal>

      <Modal open={modal === 'other'} onClose={() => setModal(null)} title={`Other request · Table ${selTable?.name ?? ''}`}>
        <OtherForm
          onSubmit={(note) => {
            raise('other', note);
            setModal(null);
          }}
        />
      </Modal>

      <Modal open={modal === 'settings'} onClose={() => setModal(null)} title="Waiters" subtitle="Used for assignment and auto-assign">
        <WaiterSettings waiters={waiters} setWaiters={setWaiters} />
      </Modal>
    </div>
  );
};

/* =====================================================================
   SUB-COMPONENTS
   ===================================================================== */
const DetailsPanel = ({
  table,
  req,
  openForTable,
  now,
  waiters,
  onPick,
  onStatus,
  onAssign,
  onQuick,
  onOpenTable,
}: {
  table: FloorTable;
  req?: ServiceRequest;
  openForTable: ServiceRequest[];
  now: number;
  waiters: string[];
  onPick: (r: ServiceRequest) => void;
  onStatus: (id: string, s: ReqStatus) => void;
  onAssign: (id: string, w?: string) => void;
  onQuick: (t: RequestType) => void;
  onOpenTable: () => void;
}) => (
  <div className="h-full min-h-0 flex flex-col gap-3 overflow-y-auto">
    {/* Table header */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      <div className="w-20 h-20 rounded-full bg-[#FFF5F8] border border-rose-100 flex items-center justify-center shrink-0">
        <Utensils className="w-9 h-9 text-[#800D32]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-2xl font-black text-[#191923]">Table {table.name}</h2>
          {req && <StatusPill s={req.status} />}
          {req && (
            <span className="flex items-center gap-1 text-xs font-bold text-[#B0123F]">
              <Clock className="w-3.5 h-3.5" /> {ago(req.createdAt, now)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap mt-2 text-xs font-semibold text-gray-700">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {table.guests ? `${table.guests} Guests` : table.seats ? `${table.seats} Seats` : '—'}
          </span>
          <span className="flex items-center gap-1">
            <Utensils className="w-3.5 h-3.5" /> Dine In
          </span>
          {req && (
            <label className="relative flex items-center gap-1">
              <UserRound className="w-3.5 h-3.5" />
              <select
                value={req.waiter ?? ''}
                onChange={(e) => onAssign(req.id, e.target.value || undefined)}
                className="appearance-none bg-transparent pr-5 font-semibold focus:outline-none cursor-pointer"
                aria-label="Assign waiter"
              >
                <option value="">Assign Waiter</option>
                {waiters.map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-0 pointer-events-none" />
            </label>
          )}
        </div>
      </div>
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
      {/* Request details */}
      <div>
        <h3 className="text-base font-black text-[#191923] mb-2">Request Details</h3>
        {req ? (
          <div className="flex items-start gap-3 rounded-xl bg-[#FFF1F4] p-3.5">
            <TypeIcon type={req.type} className="w-7 h-7 text-[#800D32] shrink-0" />
            <div>
              <p className="text-base font-black text-[#191923]">{TYPE_META[req.type].label}</p>
              <p className="text-sm text-gray-600">{req.note ? `${TYPE_META[req.type].describe(table.name)} Note: ${req.note}` : TYPE_META[req.type].describe(table.name)}</p>
              {req.waiter && <p className="text-xs font-semibold text-gray-500 mt-1">Assigned to {req.waiter}</p>}
              {req.type === 'bill' && (
                <button onClick={onOpenTable} className="mt-2 inline-flex items-center gap-1 text-xs font-black text-[#800D32]">
                  Open table to print bill <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm font-semibold text-gray-500">No open request on this table.</p>
        )}
        {openForTable.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {openForTable.map((r) => (
              <button key={r.id} onClick={() => onPick(r)} className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${r.id === req?.id ? 'bg-[#800D32] text-white border-[#800D32]' : 'border-gray-200 text-gray-600'}`}>
                {TYPE_META[r.type].label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {req && (req.status === 'pending' || req.status === 'in_progress') && (
        <div>
          <h3 className="text-base font-black text-[#191923] mb-2">Actions</h3>
          {req.status === 'pending' && (
            <button onClick={() => onStatus(req.id, 'in_progress')} className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#800D32] text-white text-base font-black shadow-md hover:bg-[#6a0a29] mb-2">
              <CheckCircle2 className="w-5 h-5" /> Mark In Progress
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onStatus(req.id, 'completed')} className="inline-flex items-center justify-center gap-1.5 py-3 rounded-xl border border-gray-200 text-sm font-black text-[#191923] hover:border-emerald-300">
              <Check className="w-4 h-4 text-emerald-600" /> Mark Completed
            </button>
            <button onClick={() => onStatus(req.id, 'cancelled')} className="inline-flex items-center justify-center gap-1.5 py-3 rounded-xl border border-gray-200 text-sm font-black text-[#B0123F] hover:border-rose-300">
              <X className="w-4 h-4" /> Cancel Request
            </button>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h3 className="text-base font-black text-[#191923] mb-2">Quick Actions</h3>
        <div className="grid grid-cols-5 gap-2">
          {(['water', 'cutlery', 'bill', 'assistance', 'other'] as RequestType[]).map((t) => (
            <button key={t} onClick={() => onQuick(t)} className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-gray-100 bg-white shadow-sm text-[11px] font-bold text-[#191923] hover:border-[#F3C3D2] hover:bg-[#FFF7FA]">
              <TypeIcon type={t} className="w-5 h-5 text-[#800D32]" />
              {t === 'bill' ? 'Bill' : TYPE_META[t].label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-2">Raises a new request for this table.</p>
      </div>
    </div>
  </div>
);

const OtherForm = ({ onSubmit }: { onSubmit: (note: string) => void }) => {
  const [v, setV] = useState('');
  const tags = ['Napkins', 'Extra plates', 'Baby chair', 'Clean table', 'AC too cold', 'Pack leftovers'];
  return (
    <div className="space-y-3">
      <textarea autoFocus value={v} onChange={(e) => setV(e.target.value.slice(0, 120))} rows={3} placeholder="What does the table need?" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#800D32]/30" />
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <button key={t} onClick={() => setV(t)} className="px-2.5 py-1 rounded-full bg-[#FFF5F8] border border-[#F8D5E0] text-[11px] font-bold text-[#800D32]">
            {t}
          </button>
        ))}
      </div>
      <button disabled={!v.trim()} onClick={() => onSubmit(v)} className="w-full py-3 rounded-xl bg-[#800D32] text-white text-sm font-black disabled:opacity-50">
        Raise request
      </button>
    </div>
  );
};

const WaiterSettings = ({ waiters, setWaiters }: { waiters: string[]; setWaiters: (f: (w: string[]) => string[]) => void }) => {
  const [name, setName] = useState('');
  const add = () => {
    const n = name.trim();
    if (!n || waiters.includes(n)) return;
    setWaiters((w) => [...w, n]);
    setName('');
  };
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Waiter name" className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800D32]/30" />
        <button onClick={add} className="px-4 rounded-xl bg-[#800D32] text-white text-sm font-black inline-flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      {waiters.length === 0 ? (
        <p className="text-xs text-gray-500">Add waiters to enable assignment.</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100">
          {waiters.map((w) => (
            <li key={w} className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold">
              <UserRound className="w-4 h-4 text-[#800D32]" />
              <span className="flex-1">{w}</span>
              <button onClick={() => setWaiters((l) => l.filter((x) => x !== w))} className="text-gray-400 hover:text-rose-600" aria-label={`Remove ${w}`}>
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-[11px] text-gray-400">Auto Assign gives each new request to the waiter with the fewest open requests.</p>
    </div>
  );
};

export default RequestsPage;