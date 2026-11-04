import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChefHat,
  ClipboardList,
  Clock,
  BellRing,
  Hourglass,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  List,
  Search,
  Utensils,
  ShoppingBag,
  Bike,
  Armchair,
  Users,
  CheckCircle2,
  Check,
  PencilLine,
  Eye,
  X,
  Printer,
  Download,
  FileText,
  Wine,
  CakeSlice,
  StickyNote,
  AlertCircle,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { buildKotPdf, outputPdf, type KotDoc, type OrderTypeKey, type PdfMode } from '../utils/posPdf';

/* =====================================================================
   CONFIG + TYPES
   ===================================================================== */
const PAGE_OFFSET = '9.75rem';
const QUEUE_KEY = 'pos.kotQueue'; // shared with PosPage
const SETTINGS_KEY = 'kot.settings';

type KotStatus = 'pending' | 'preparing' | 'ready' | 'served';
type Station = 'Main Kitchen' | 'Bar' | 'Desserts';
type StationFilter = 'all' | Station;

/** KotDoc (from POS) + kitchen tracking fields. Extra fields are optional so old tickets still load. */
type KotEntry = KotDoc & {
  id: string;
  status: KotStatus;
  startedAt?: string;
  readyAt?: string;
  servedAt?: string;
  doneItems?: number[];
  kitchenNote?: string;
};

interface KotSettings {
  sound: boolean;
  targetMins: number;
  showCompleted: number; // how many completed tickets to keep visible
  collapsed: KotStatus[];
}
const DEFAULT_SETTINGS: KotSettings = { sound: true, targetMins: 20, showCompleted: 20, collapsed: [] };

const COLUMNS: { status: KotStatus; title: string; icon: React.ElementType; head: string; accent: string }[] = [
  { status: 'pending', title: 'New Orders', icon: ClipboardList, head: 'bg-[#FDECF1]', accent: 'text-[#800D32]' },
  { status: 'preparing', title: 'Preparing', icon: ChefHat, head: 'bg-[#FFF3E2]', accent: 'text-orange-600' },
  { status: 'ready', title: 'Ready', icon: BellRing, head: 'bg-[#EAF8EE]', accent: 'text-emerald-600' },
  { status: 'served', title: 'Completed', icon: CheckCircle2, head: 'bg-[#EEF1FF]', accent: 'text-indigo-600' },
];

const STATUS_PILL: Record<KotStatus, { cls: string; label: string }> = {
  pending: { cls: 'bg-rose-100 text-[#B0123F]', label: 'New Order' },
  preparing: { cls: 'bg-orange-100 text-orange-700', label: 'Preparing' },
  ready: { cls: 'bg-emerald-100 text-emerald-700', label: 'Ready' },
  served: { cls: 'bg-indigo-100 text-indigo-700', label: 'Completed' },
};

const TYPE_META: Record<OrderTypeKey, { label: string; icon: React.ElementType }> = {
  dine_in: { label: 'Dine In', icon: Utensils },
  takeaway: { label: 'Takeaway', icon: ShoppingBag },
  delivery: { label: 'Delivery', icon: Bike },
};

/* =====================================================================
   HELPERS
   ===================================================================== */
const readQueue = (): KotEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') as KotEntry[];
  } catch {
    return [];
  }
};
const writeQueue = (q: KotEntry[]) => {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch {
    /* ignore */
  }
};

const kotLabel = (n: number) => `#KOT${String(n).padStart(3, '0')}`;
const minsSince = (iso: string | undefined, now: number) => (iso ? Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000)) : 0);
const ago = (iso: string | undefined, now: number) => {
  const m = minsSince(iso, now);
  return m < 1 ? 'Just now' : m < 60 ? `${m} min ago` : `${Math.floor(m / 60)}h ${m % 60}m ago`;
};
const clock = (iso: string) => new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

const stationOf = (name: string): Station => {
  const n = name.toLowerCase();
  if (/coffee|tea|chai|mojito|mocktail|cocktail|shake|smoothie|juice|soda|cola|lassi|beer|wine|water|lemonade|latte|cappuccino/.test(n)) return 'Bar';
  if (/ice ?cream|sundae|dessert|cake|brownie|pastry|kulfi|gulab|rasmalai|halwa|pudding|waffle/.test(n)) return 'Desserts';
  return 'Main Kitchen';
};
const kotStations = (k: KotEntry) => new Set(k.items.map((i) => stationOf(i.name)));

const emojiFor = (name: string) => {
  const n = name.toLowerCase();
  const map: [RegExp, string][] = [
    [/burger/, '🍔'], [/pizza/, '🍕'], [/fries/, '🍟'], [/coffee|latte|cappuccino/, '☕'], [/ice ?cream|sundae|kulfi/, '🍨'],
    [/mojito|mocktail|lemon|soda|cola/, '🍹'], [/shake|smoothie/, '🥤'], [/tea|chai/, '🍵'], [/biryani/, '🍛'], [/rice/, '🍚'],
    [/noodle|chowmein|hakka/, '🍜'], [/manchurian/, '🥘'], [/dosa|idli|uttapam/, '🥞'], [/tikka|kebab|tandoor/, '🍢'],
    [/chicken|wings/, '🍗'], [/paneer|curry|dal|masala/, '🍲'], [/sandwich|wrap|roll/, '🥪'], [/cake|pastry|brownie/, '🍰'],
    [/salad/, '🥗'], [/soup/, '🥣'], [/pasta/, '🍝'], [/momo|dumpling/, '🥟'], [/naan|roti|paratha/, '🫓'],
  ];
  return map.find(([r]) => r.test(n))?.[1] ?? '🍽️';
};

/** Short beep via Web Audio — no audio file to load. */
function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.22].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.18);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.2);
    });
    setTimeout(() => ctx.close(), 800);
  } catch {
    /* audio blocked until user interacts — ignore */
  }
}

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

const StatCard = ({ icon, value, label, tint }: { icon: React.ReactNode; value: React.ReactNode; label: string; tint: string }) => (
  <div className="shrink-0 flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 min-w-[148px]">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tint}`}>{icon}</div>
    <div>
      <p className="text-xl font-black text-[#191923] leading-none">{value}</p>
      <p className="text-xs font-semibold text-gray-500 mt-1">{label}</p>
    </div>
  </div>
);

const TypeBadge = ({ type }: { type: OrderTypeKey }) => {
  const m = TYPE_META[type] ?? TYPE_META.dine_in;
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-[#FDEBF1] px-2 py-1 text-[11px] font-bold text-[#800D32] shrink-0">
      <m.icon className="w-3.5 h-3.5" />
      {m.label}
    </span>
  );
};

const subtitleOf = (k: KotEntry) => `${k.orderType === 'dine_in' ? `Table ${k.tableName ?? '-'}` : TYPE_META[k.orderType]?.label ?? ''} • ${k.items.length} Item${k.items.length === 1 ? '' : 's'}`;

/* =====================================================================
   KOT CARD
   ===================================================================== */
type CardProps = {
  k: KotEntry;
  now: number;
  target: number;
  selected: boolean;
  onSelect: (id: string) => void;
  onAdvance: (id: string) => void;
  onUpdate: (id: string) => void;
};

const KotCard = memo(({ k, now, target, selected, onSelect, onAdvance, onUpdate }: CardProps) => {
  const prepMins = minsSince(k.startedAt ?? k.createdAt, now);
  const overdue = k.status !== 'served' && minsSince(k.createdAt, now) >= target;
  const done = k.doneItems?.length ?? 0;
  return (
    <div
      onClick={() => onSelect(k.id)}
      className={`bg-white rounded-2xl border p-3.5 cursor-pointer hover:shadow-md transition-shadow ${selected ? 'border-[#800D32] ring-1 ring-[#800D32]' : overdue ? 'border-rose-300' : 'border-gray-100 shadow-sm'
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-base font-black text-[#191923]">{kotLabel(k.kotNumber)}</p>
        <TypeBadge type={k.orderType} />
      </div>
      <div className="flex items-center justify-between gap-2 mt-0.5 mb-2.5">
        <p className="text-xs font-semibold text-gray-500 truncate">{subtitleOf(k)}</p>
        {k.status === 'pending' && <span className={`text-[11px] font-bold ${overdue ? 'text-rose-600' : 'text-[#B0123F]'}`}>{ago(k.createdAt, now)}</span>}
        {k.status === 'preparing' && (
          <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-black ${overdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
            <Clock className="w-3 h-3" /> {prepMins} min
          </span>
        )}
        {k.status === 'ready' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready • {minsSince(k.readyAt, now)} min
          </span>
        )}
        {k.status === 'served' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500">
            <Check className="w-3.5 h-3.5 text-emerald-600" /> {ago(k.servedAt, now)}
          </span>
        )}
      </div>

      <ul className="space-y-1.5">
        {k.items.map((it, i) => {
          const isDone = k.doneItems?.includes(i);
          return (
            <li key={i} className="flex items-center gap-2.5 text-[13px]">
              <span className="w-7 text-center text-lg leading-none shrink-0">{emojiFor(it.name)}</span>
              <span className={`flex-1 min-w-0 font-semibold truncate ${isDone ? 'line-through text-gray-400' : 'text-[#191923]'}`}>
                {it.name}
                {it.notes && <span className="block text-[10px] italic font-medium text-[#800D32] truncate">{it.notes}</span>}
              </span>
              <span className="font-black text-[#191923]">×{it.qty}</span>
            </li>
          );
        })}
      </ul>

      {k.status === 'preparing' && (
        <div className="h-1.5 rounded-full bg-gray-100 mt-3 overflow-hidden">
          <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.max(8, (done / k.items.length) * 100)}%` }} />
        </div>
      )}

      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
        {k.status === 'pending' && (
          <button onClick={() => onAdvance(k.id)} className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#800D32] text-white text-sm font-black hover:bg-[#6a0a29]">
            <ChefHat className="w-4 h-4" /> Start Preparing
          </button>
        )}
        {k.status === 'preparing' && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onAdvance(k.id)} className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-black hover:bg-emerald-100">
              <Check className="w-4 h-4" /> Mark Ready
            </button>
            <button onClick={() => onUpdate(k.id)} className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#191923] hover:border-[#F3C3D2]">
              <PencilLine className="w-4 h-4" /> Update
            </button>
          </div>
        )}
        {k.status === 'ready' && (
          <button onClick={() => onAdvance(k.id)} className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#800D32] text-white text-sm font-black hover:bg-[#6a0a29]">
            <BellRing className="w-4 h-4" /> Serve / Complete
          </button>
        )}
        {k.status === 'served' && (
          <button onClick={() => onSelect(k.id)} className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#191923] hover:border-[#F3C3D2]">
            <Eye className="w-4 h-4" /> View
          </button>
        )}
      </div>
    </div>
  );
});

/* =====================================================================
   PAGE
   ===================================================================== */
export const KitchenKotPage: React.FC = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<KotEntry[]>(readQueue);
  const [settings, setSettings] = useState<KotSettings>(() => {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [station, setStation] = useState<StationFilter>('all');
  const [view, setView] = useState<'kanban' | 'list'>(() => (localStorage.getItem('kot.view') as 'kanban' | 'list') || 'kanban');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [modal, setModal] = useState<null | 'update' | 'order' | 'settings'>(null);
  const [updateId, setUpdateId] = useState<string | undefined>();
  const [mobileDetails, setMobileDetails] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const seenIds = useRef<Set<string>>(new Set(queue.map((k) => k.id)));

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);
  useEffect(() => {
    localStorage.setItem('kot.view', view);
  }, [view]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------- live sync: other tabs (storage event) + light polling ---------- */
  const syncFromStorage = useCallback(() => {
    const q = readQueue();
    const fresh = q.filter((k) => !seenIds.current.has(k.id));
    if (fresh.length) {
      fresh.forEach((k) => seenIds.current.add(k.id));
      if (settings.sound && fresh.some((k) => k.status === 'pending')) beep();
    }
    setQueue((cur) => (JSON.stringify(cur) === JSON.stringify(q) ? cur : q));
  }, [settings.sound]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => e.key === QUEUE_KEY && syncFromStorage();
    window.addEventListener('storage', onStorage);
    const poll = setInterval(syncFromStorage, 5000);
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [syncFromStorage]);

  /** Always mutate the latest stored queue so we never overwrite tickets POS just added. */
  const mutate = useCallback((fn: (q: KotEntry[]) => KotEntry[]) => {
    const next = fn(readQueue());
    writeQueue(next);
    next.forEach((k) => seenIds.current.add(k.id));
    setQueue(next);
  }, []);

  /* ---------- derived ---------- */
  const today = useMemo(() => queue.filter((k) => isToday(k.createdAt) || k.status !== 'served'), [queue]);

  const stationCounts = useMemo(() => {
    const c: Record<Station, number> = { 'Main Kitchen': 0, Bar: 0, Desserts: 0 };
    today.forEach((k) => kotStations(k).forEach((s) => (c[s] += 1)));
    return c;
  }, [today]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace('#', '');
    return today.filter((k) => {
      if (station !== 'all' && !kotStations(k).has(station)) return false;
      if (!q) return true;
      return [kotLabel(k.kotNumber).slice(1), String(k.kotNumber), k.orderNumber, k.tableName ?? '', ...k.items.map((i) => i.name)].some((x) => x.toLowerCase().includes(q));
    });
  }, [today, station, query]);

  const byStatus = useMemo(() => {
    const m: Record<KotStatus, KotEntry[]> = { pending: [], preparing: [], ready: [], served: [] };
    filtered.forEach((k) => m[k.status]?.push(k));
    m.pending.sort((a, b) => a.createdAt.localeCompare(b.createdAt)); // oldest first
    m.preparing.sort((a, b) => (a.startedAt ?? a.createdAt).localeCompare(b.startedAt ?? b.createdAt));
    m.ready.sort((a, b) => (a.readyAt ?? '').localeCompare(b.readyAt ?? ''));
    m.served.sort((a, b) => (b.servedAt ?? b.createdAt).localeCompare(a.servedAt ?? a.createdAt));
    m.served = m.served.slice(0, settings.showCompleted);
    return m;
  }, [filtered, settings.showCompleted]);

  const stats = useMemo(() => {
    const prep = today.filter((k) => k.readyAt).map((k) => (new Date(k.readyAt!).getTime() - new Date(k.createdAt).getTime()) / 60000);
    return {
      total: today.length,
      pending: today.filter((k) => k.status === 'pending').length,
      preparing: today.filter((k) => k.status === 'preparing').length,
      ready: today.filter((k) => k.status === 'ready').length,
      avg: prep.length ? Math.round(prep.reduce((a, b) => a + b, 0) / prep.length) : 0,
    };
  }, [today]);

  useEffect(() => {
    if (selectedId && queue.some((k) => k.id === selectedId)) return;
    setSelectedId((byStatus.pending[0] ?? byStatus.preparing[0] ?? byStatus.ready[0])?.id);
  }, [queue, selectedId, byStatus]);

  const sel = queue.find((k) => k.id === selectedId);
  const updating = queue.find((k) => k.id === updateId);

  /* ---------- actions ---------- */
  const advance = useCallback(
    (id: string) => {
      const stamp = new Date().toISOString();
      mutate((q) =>
        q.map((k) => {
          if (k.id !== id) return k;
          if (k.status === 'pending') return { ...k, status: 'preparing', startedAt: stamp };
          if (k.status === 'preparing') return { ...k, status: 'ready', readyAt: stamp, doneItems: k.items.map((_, i) => i) };
          if (k.status === 'ready') return { ...k, status: 'served', servedAt: stamp };
          return k;
        })
      );
    },
    [mutate]
  );

  const revert = (id: string) =>
    mutate((q) =>
      q.map((k) => {
        if (k.id !== id) return k;
        if (k.status === 'served') return { ...k, status: 'ready', servedAt: undefined };
        if (k.status === 'ready') return { ...k, status: 'preparing', readyAt: undefined };
        if (k.status === 'preparing') return { ...k, status: 'pending', startedAt: undefined, doneItems: [] };
        return k;
      })
    );

  const saveUpdate = (id: string, doneItems: number[], kitchenNote: string) => {
    mutate((q) => q.map((k) => (k.id === id ? { ...k, doneItems, kitchenNote: kitchenNote || undefined } : k)));
    setModal(null);
    setToast({ type: 'success', text: 'KOT updated' });
  };

  const pdf = async (k: KotEntry, mode: PdfMode) => {
    try {
      const doc = await buildKotPdf(k);
      outputPdf(doc, `KOT-${k.kotNumber}-${k.orderNumber}.pdf`, mode);
    } catch (e) {
      console.error(e);
      setToast({ type: 'error', text: 'Could not generate PDF' });
    }
  };

  const select = useCallback((id: string) => {
    setSelectedId(id);
    if (window.matchMedia('(max-width: 1279px)').matches) setMobileDetails(true);
  }, []);
  const openUpdate = useCallback((id: string) => {
    setUpdateId(id);
    setModal('update');
  }, []);

  const toggleCollapse = (s: KotStatus) =>
    setSettings((st) => ({ ...st, collapsed: st.collapsed.includes(s) ? st.collapsed.filter((x) => x !== s) : [...st.collapsed, s] }));

  const orderKots = sel ? queue.filter((k) => k.orderNumber === sel.orderNumber).sort((a, b) => a.kotNumber - b.kotNumber) : [];

  /* ---------- details panel ---------- */
  const details = sel ? (
    <div className="flex flex-col gap-3 h-full min-h-0">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="bg-[#FFF5F8] px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-[#191923] mr-auto">{kotLabel(sel.kotNumber)}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_PILL[sel.status].cls}`}>{STATUS_PILL[sel.status].label}</span>
            <button onClick={() => (setSelectedId(undefined), setMobileDetails(false))} className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-gray-600" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-4 flex-wrap mt-2 text-xs font-semibold text-gray-700">
            <span className="flex items-center gap-1">
              {React.createElement(TYPE_META[sel.orderType]?.icon ?? Utensils, { className: 'w-3.5 h-3.5' })} {TYPE_META[sel.orderType]?.label}
            </span>
            {sel.orderType === 'dine_in' && (
              <span className="flex items-center gap-1">
                <Armchair className="w-3.5 h-3.5" /> Table {sel.tableName ?? '-'}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> {sel.guests} Guests
            </span>
          </div>
          <p className="flex items-center gap-1 mt-1.5 text-xs font-semibold text-gray-700">
            <Clock className="w-3.5 h-3.5" /> Order Time: {clock(sel.createdAt)} ({ago(sel.createdAt, now)})
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
          <p className="text-sm font-black text-[#191923] mb-2">Order Items ({sel.items.length})</p>
          <ul className="space-y-1.5">
            {sel.items.map((it, i) => (
              <li key={i} className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-gray-50">
                <span className="w-11 h-11 rounded-xl bg-[#FFF5F8] flex items-center justify-center text-2xl shrink-0">{emojiFor(it.name)}</span>
                <span className={`flex-1 min-w-0 text-sm font-bold truncate ${sel.doneItems?.includes(i) ? 'line-through text-gray-400' : 'text-[#191923]'}`}>
                  {it.name}
                  <span className="block text-[10px] font-semibold text-gray-400">{stationOf(it.name)}</span>
                </span>
                <span className="text-sm font-black">× {it.qty}</span>
              </li>
            ))}
          </ul>

          {(sel.items.some((i) => i.notes) || sel.orderNote || sel.kitchenNote) && (
            <>
              <p className="text-sm font-black text-[#191923] mt-4 mb-2">Remarks</p>
              <div className="rounded-xl bg-[#FFF1F4] px-3 py-2.5 text-xs font-semibold text-[#191923] space-y-1">
                {sel.items
                  .filter((i) => i.notes)
                  .map((i, n) => (
                    <p key={n} className="flex items-start gap-1.5">
                      <StickyNote className="w-3.5 h-3.5 text-[#800D32] shrink-0 mt-px" />
                      {i.name} – {i.notes}
                    </p>
                  ))}
                {sel.orderNote && <p>Order: {sel.orderNote}</p>}
                {sel.kitchenNote && <p className="text-orange-700">Kitchen: {sel.kitchenNote}</p>}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        {sel.status !== 'served' ? (
          <button onClick={() => advance(sel.id)} className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#800D32] text-white text-base font-black shadow-md hover:bg-[#6a0a29]">
            {sel.status === 'pending' ? <ChefHat className="w-5 h-5" /> : sel.status === 'preparing' ? <Check className="w-5 h-5" /> : <BellRing className="w-5 h-5" />}
            {sel.status === 'pending' ? 'Start Preparing' : sel.status === 'preparing' ? 'Mark Ready' : 'Serve / Complete'}
          </button>
        ) : (
          <div className="w-full py-3 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-black text-center">Served {ago(sel.servedAt, now)}</div>
        )}
        <div className="grid grid-cols-3 gap-2">
          {[
            { l: 'Print KOT', i: Printer, on: () => pdf(sel, 'print') },
            { l: 'Download PDF', i: FileText, on: () => pdf(sel, 'download') },
            { l: 'View Order', i: Eye, on: () => setModal('order') },
          ].map((b) => (
            <button key={b.l} onClick={b.on} className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-gray-100 bg-white shadow-sm text-xs font-bold text-[#191923] hover:border-[#F3C3D2]">
              <b.i className="w-5 h-5 text-[#800D32]" />
              {b.l}
            </button>
          ))}
        </div>
        {sel.status !== 'pending' && (
          <button onClick={() => revert(sel.id)} className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-[#800D32]">
            <RotateCcw className="w-3.5 h-3.5" /> Move back a step
          </button>
        )}
      </div>
    </div>
  ) : null;

  /* ---------- render ---------- */
  const stationTabs: { k: StationFilter; l: string; i: React.ElementType; n: number }[] = [
    { k: 'all', l: 'All Orders', i: ClipboardList, n: today.length },
    { k: 'Main Kitchen', l: 'Main Kitchen', i: ChefHat, n: stationCounts['Main Kitchen'] },
    { k: 'Bar', l: 'Bar', i: Wine, n: stationCounts.Bar },
    { k: 'Desserts', l: 'Desserts', i: CakeSlice, n: stationCounts.Desserts },
  ];

  const cardProps = { now, target: settings.targetMins, onSelect: select, onAdvance: advance, onUpdate: openUpdate };

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
          <ChefHat className="w-11 h-11 text-[#800D32]" strokeWidth={1.8} />
          <div>
            <h1 className="text-2xl font-black text-[#191923] leading-tight">Kitchen KOT</h1>
            <p className="text-xs text-gray-500 font-medium hidden sm:block">Manage and track kitchen orders in real-time</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 overflow-x-auto max-w-full pb-0.5">
          <StatCard icon={<ClipboardList className="w-5 h-5 text-[#800D32]" />} value={stats.total} label="Total KOT" tint="bg-rose-50" />
          <StatCard icon={<Clock className="w-5 h-5 text-violet-600" />} value={stats.pending} label="New Orders" tint="bg-violet-50" />
          <StatCard icon={<ChefHat className="w-5 h-5 text-orange-600" />} value={stats.preparing} label="Preparing" tint="bg-orange-50" />
          <StatCard icon={<BellRing className="w-5 h-5 text-amber-600" />} value={stats.ready} label="Ready" tint="bg-amber-50" />
          <StatCard icon={<Hourglass className="w-5 h-5 text-[#800D32]" />} value={`${stats.avg} min`} label="Avg. Prep Time" tint="bg-rose-50" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <select
              value={station}
              onChange={(e) => setStation(e.target.value as StationFilter)}
              className="appearance-none pl-4 pr-9 py-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-[#191923] focus:outline-none focus:ring-2 focus:ring-[#800D32]/30"
            >
              <option value="all">All Stations</option>
              <option>Main Kitchen</option>
              <option>Bar</option>
              <option>Desserts</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
          </div>
          <button onClick={() => setModal('settings')} className="w-12 h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:text-[#800D32]" aria-label="KOT settings">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ===== Filters ===== */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full">
          {stationTabs.map((t) => (
            <button
              key={t.k}
              onClick={() => setStation(t.k)}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold ${station === t.k ? 'bg-[#800D32] text-white border-[#800D32]' : 'bg-white text-[#191923] border-gray-200 hover:border-[#F3C3D2]'
                }`}
            >
              <t.i className="w-4 h-4" /> {t.l} <span className={station === t.k ? 'text-rose-100' : 'text-gray-400'}>({t.n})</span>
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-0.5 ml-auto">
          {(['kanban', 'list'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold capitalize ${view === v ? 'bg-[#800D32] text-white' : 'text-gray-600'}`}>
              {v === 'kanban' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />} {v}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search KOT (e.g. #KOT045)..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#800D32]/30"
          />
        </div>
      </div>

      {/* ===== Board + details ===== */}
      <div className="flex-1 min-h-0 flex gap-3">
        <div className="flex-1 min-w-0 min-h-0">
          {view === 'kanban' ? (
            <div className="h-full flex gap-3 overflow-x-auto">
              {COLUMNS.map((c) => {
                const list = byStatus[c.status];
                const collapsed = settings.collapsed.includes(c.status);
                if (collapsed)
                  return (
                    <button key={c.status} onClick={() => toggleCollapse(c.status)} className={`shrink-0 w-12 rounded-2xl ${c.head} flex flex-col items-center gap-3 py-4`} title={`Expand ${c.title}`}>
                      <ChevronLeft className={`w-4 h-4 ${c.accent}`} />
                      <c.icon className={`w-5 h-5 ${c.accent}`} />
                      <span className="text-sm font-black text-[#191923] [writing-mode:vertical-rl] rotate-180">
                        {c.title} ({list.length})
                      </span>
                    </button>
                  );
                return (
                  <div key={c.status} className={`flex-1 min-w-[260px] min-h-0 flex flex-col rounded-2xl ${c.head} p-2`}>
                    <div className="flex items-center gap-2 px-2 py-2">
                      <c.icon className={`w-5 h-5 ${c.accent}`} />
                      <h3 className="text-base font-black text-[#191923]">
                        {c.title} <span className={`font-bold ${c.accent}`}>({list.length})</span>
                      </h3>
                      <button onClick={() => toggleCollapse(c.status)} className="ml-auto w-7 h-7 rounded-lg hover:bg-white/70 flex items-center justify-center text-gray-400" aria-label={`Collapse ${c.title}`}>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 px-0.5 pb-1">
                      {list.length === 0 ? (
                        <p className="text-center text-xs font-semibold text-gray-400 py-8">No tickets</p>
                      ) : (
                        list.map((k) => <KotCard key={k.id} k={k} selected={k.id === selectedId} {...cardProps} />)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <ListView rows={[...byStatus.pending, ...byStatus.preparing, ...byStatus.ready, ...byStatus.served]} now={now} selectedId={selectedId} onSelect={select} onAdvance={advance} />
          )}
        </div>

        <aside className="hidden xl:flex w-[370px] 2xl:w-[400px] shrink-0 min-h-0 flex-col">
          {details ?? (
            <div className="h-full bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center p-6">
              <ChefHat className="w-10 h-10 text-rose-200 mb-2" />
              <p className="text-sm font-bold text-gray-600">Kitchen is all clear</p>
              <p className="text-xs text-gray-400">New KOTs from POS appear here automatically</p>
            </div>
          )}
        </aside>
      </div>

      {/* ===== Modals ===== */}
      <Modal open={mobileDetails && !!sel && modal === null} onClose={() => setMobileDetails(false)} title={sel ? kotLabel(sel.kotNumber) : ''} width="max-w-lg">
        <div className="h-[70dvh]">{details}</div>
      </Modal>

      <Modal open={modal === 'update' && !!updating} onClose={() => setModal(null)} title={`Update ${updating ? kotLabel(updating.kotNumber) : ''}`} subtitle="Tick items as they're done, add a kitchen remark">
        {updating && <UpdateForm k={updating} onSave={(d, n) => saveUpdate(updating.id, d, n)} onReady={() => (advance(updating.id), setModal(null))} />}
      </Modal>

      <Modal
        open={modal === 'order' && !!sel}
        onClose={() => setModal(null)}
        title={`Order ${sel?.orderNumber ?? ''}`}
        subtitle={sel ? `${TYPE_META[sel.orderType]?.label}${sel.tableName ? ` · Table ${sel.tableName}` : ''} · ${orderKots.length} KOT(s)` : ''}
        width="max-w-lg"
        footer={
          sel?.orderType === 'dine_in' ? (
            <button onClick={() => navigate('/tables')} className="w-full py-2.5 rounded-xl bg-[#800D32] text-white text-sm font-black">
              Open in Tables
            </button>
          ) : undefined
        }
      >
        <div className="space-y-3">
          {orderKots.map((k) => (
            <div key={k.id} className="rounded-xl border border-gray-100 p-3">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-black text-[#191923]">{kotLabel(k.kotNumber)}</p>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_PILL[k.status].cls}`}>{STATUS_PILL[k.status].label}</span>
                <span className="ml-auto text-[11px] font-semibold text-gray-400">{clock(k.createdAt)}</span>
                <button onClick={() => pdf(k, 'download')} className="text-gray-500 hover:text-[#800D32]" aria-label="Download KOT">
                  <Download className="w-4 h-4" />
                </button>
              </div>
              {k.items.map((it, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="font-semibold text-[#191923]">
                    {emojiFor(it.name)} {it.name}
                  </span>
                  <span className="font-black">×{it.qty}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={modal === 'settings'} onClose={() => setModal(null)} title="Kitchen Settings">
        <div className="space-y-4">
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-[#191923]">Sound alert for new KOT</span>
            <input type="checkbox" checked={settings.sound} onChange={(e) => (setSettings((s) => ({ ...s, sound: e.target.checked })), e.target.checked && beep())} className="w-5 h-5 accent-[#800D32]" />
          </label>
          <div>
            <p className="text-sm font-bold text-[#191923] mb-1.5">Mark late after (minutes)</p>
            <div className="flex gap-1.5">
              {[10, 15, 20, 25, 30, 45].map((m) => (
                <button key={m} onClick={() => setSettings((s) => ({ ...s, targetMins: m }))} className={`flex-1 py-2 rounded-lg border text-sm font-black ${settings.targetMins === m ? 'bg-[#800D32] text-white border-[#800D32]' : 'border-gray-200'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-[#191923] mb-1.5">Completed tickets to show</p>
            <div className="flex gap-1.5">
              {[10, 20, 50].map((n) => (
                <button key={n} onClick={() => setSettings((s) => ({ ...s, showCompleted: n }))} className={`flex-1 py-2 rounded-lg border text-sm font-black ${settings.showCompleted === n ? 'bg-[#800D32] text-white border-[#800D32]' : 'border-gray-200'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              mutate((q) => q.filter((k) => k.status !== 'served'));
              setModal(null);
              setToast({ type: 'success', text: 'Completed tickets cleared' });
            }}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-200 text-rose-600 text-sm font-black hover:bg-rose-50"
          >
            <Trash2 className="w-4 h-4" /> Clear all completed tickets
          </button>
          <p className="text-[11px] text-gray-400">Stations are assigned automatically from item names (drinks → Bar, sweets & ice cream → Desserts, rest → Main Kitchen).</p>
        </div>
      </Modal>
    </div>
  );
};

/* =====================================================================
   SUB-COMPONENTS
   ===================================================================== */
const UpdateForm = ({ k, onSave, onReady }: { k: KotEntry; onSave: (done: number[], note: string) => void; onReady: () => void }) => {
  const [done, setDone] = useState<number[]>(k.doneItems ?? []);
  const [note, setNote] = useState(k.kitchenNote ?? '');
  const toggle = (i: number) => setDone((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]));
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        {k.items.map((it, i) => {
          const on = done.includes(i);
          return (
            <button key={i} onClick={() => toggle(i)} className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left ${on ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200'}`}>
              <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${on ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'}`}>{on && <Check className="w-3.5 h-3.5" />}</span>
              <span className="text-lg">{emojiFor(it.name)}</span>
              <span className={`flex-1 text-sm font-bold ${on ? 'line-through text-gray-400' : 'text-[#191923]'}`}>{it.name}</span>
              <span className="text-sm font-black">×{it.qty}</span>
            </button>
          );
        })}
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value.slice(0, 160))}
        rows={2}
        placeholder="Kitchen remark (e.g. Paneer out of stock, 5 min delay)"
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#800D32]/30"
      />
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => onSave(done, note.trim())} className="py-2.5 rounded-xl border border-gray-200 text-sm font-black text-[#191923]">
          Save progress
        </button>
        <button onClick={onReady} className="py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-black inline-flex items-center justify-center gap-1.5">
          <Check className="w-4 h-4" /> Mark Ready
        </button>
      </div>
    </div>
  );
};

const ListView = memo(
  ({ rows, now, selectedId, onSelect, onAdvance }: { rows: KotEntry[]; now: number; selectedId?: string; onSelect: (id: string) => void; onAdvance: (id: string) => void }) =>
    rows.length === 0 ? (
      <div className="h-full bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">No tickets</div>
    ) : (
      <div className="h-full overflow-y-auto bg-white rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#FFF5F8] text-left text-xs font-black text-[#800D32]">
            <tr>
              <th className="px-4 py-3">KOT</th>
              <th className="px-3 py-3">Type / Table</th>
              <th className="px-3 py-3">Items</th>
              <th className="px-3 py-3">Time</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((k) => (
              <tr key={k.id} onClick={() => onSelect(k.id)} className={`cursor-pointer hover:bg-gray-50 ${k.id === selectedId ? 'bg-[#FFF7FA]' : ''}`}>
                <td className="px-4 py-3 font-black text-[#191923] whitespace-nowrap">{kotLabel(k.kotNumber)}</td>
                <td className="px-3 py-3 font-semibold text-gray-600 whitespace-nowrap">
                  {TYPE_META[k.orderType]?.label}
                  {k.tableName ? ` · ${k.tableName}` : ''}
                </td>
                <td className="px-3 py-3 text-gray-700 max-w-[320px] truncate">{k.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</td>
                <td className="px-3 py-3 font-semibold text-gray-500 whitespace-nowrap">{ago(k.createdAt, now)}</td>
                <td className="px-3 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${STATUS_PILL[k.status].cls}`}>{STATUS_PILL[k.status].label}</span>
                </td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  {k.status !== 'served' && (
                    <button onClick={() => onAdvance(k.id)} className="px-3 py-1.5 rounded-lg bg-[#800D32] text-white text-xs font-black whitespace-nowrap">
                      {k.status === 'pending' ? 'Start' : k.status === 'preparing' ? 'Ready' : 'Serve'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
);

export default KitchenKotPage;