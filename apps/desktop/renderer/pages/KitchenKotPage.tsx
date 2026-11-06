import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChefHat,
  Clock,
  BellRing,
  CheckCircle2,
  Check,
  MoreHorizontal,
  Armchair,
  Users,
  Maximize2,
  Minimize2,
  Utensils,
  ShoppingBag,
  Bike,
  Edit2,
  X,
  FileText,
} from 'lucide-react';
import { type KotDoc, type OrderTypeKey } from '../utils/posPdf';

// Food images map
import butterChickenImg from '../assets/3d/butter_chicken.png';
import garlicNaanImg from '../assets/3d/garlic_naan.png';
import classicBurgerImg from '../assets/3d/classic_burger.png';
import paneerTikkaImg from '../assets/3d/paneer_tikka.png';
import chickenRiceBowlImg from '../assets/3d/chicken_rice_bowl.png';
import pepperoniPizzaImg from '../assets/3d/pepperoni_pizza.png';
import berryCheesecakeImg from '../assets/3d/berry_cheesecake.png';
import recentDrinkImg from '../assets/3d/recent_drink.png';

const QUEUE_KEY = 'pos.kotQueue';
const SETTINGS_KEY = 'kot.settings';

type KotStatus = 'pending' | 'preparing' | 'ready' | 'served';
type OrderFilter = 'all' | OrderTypeKey;

export type KotEntry = KotDoc & {
  id: string;
  status: KotStatus;
  startedAt?: string;
  readyAt?: string;
  servedAt?: string;
  doneItems?: number[];
  kitchenNote?: string;
  estMinutes?: number;
};

interface KotSettings {
  sound: boolean;
  targetMins: number;
  autoRefresh: boolean;
}

const DEFAULT_SETTINGS: KotSettings = {
  sound: true,
  targetMins: 20,
  autoRefresh: true,
};

// Image resolver for order items
const getItemThumbnail = (name: string): string => {
  const n = name.toLowerCase();
  if (/butter chicken/.test(n)) return butterChickenImg;
  if (/naan|roti|paratha/.test(n)) return garlicNaanImg;
  if (/burger/.test(n)) return classicBurgerImg;
  if (/paneer|tikka|kebab/.test(n)) return paneerTikkaImg;
  if (/rice|biryani|bowl|pulao/.test(n)) return chickenRiceBowlImg;
  if (/pizza/.test(n)) return pepperoniPizzaImg;
  if (/cake|cheesecake|dessert|sweet/.test(n)) return berryCheesecakeImg;
  if (/drink|coke|shake|mojito|tea|coffee|lassi|water|beverage/.test(n)) return recentDrinkImg;
  return chickenRiceBowlImg;
};

// Initial Seed KOTs if queue is empty so the UI looks active and populated exactly like the mockup
const SEED_KOTS: KotEntry[] = [
  {
    id: 'kot-1028',
    kotNumber: 1028,
    orderNumber: 'ORD-1028',
    status: 'pending',
    orderType: 'dine_in',
    tableName: 'T-06',
    guests: 2,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    kitchenNote: 'Medium spicy, extra dip',
    estMinutes: 15,
    items: [
      { name: 'Butter Chicken', qty: 1 },
      { name: 'Garlic Naan', qty: 2 },
      { name: 'Masala Coke', qty: 1 },
    ],
  },
  {
    id: 'kot-1029',
    kotNumber: 1029,
    orderNumber: 'ORD-1029',
    status: 'pending',
    orderType: 'dine_in',
    tableName: 'T-03',
    guests: 3,
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    kitchenNote: '',
    estMinutes: 18,
    items: [
      { name: 'Paneer Tikka', qty: 2 },
      { name: 'Veg Biryani', qty: 1 },
    ],
  },
  {
    id: 'kot-1030',
    kotNumber: 1030,
    orderNumber: 'ORD-1030',
    status: 'pending',
    orderType: 'takeaway',
    tableName: '',
    guests: 1,
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    kitchenNote: 'Pack extra cutlery',
    estMinutes: 12,
    items: [
      { name: 'Chicken Seekh Kebab', qty: 1 },
      { name: 'Mint Raita', qty: 1 },
    ],
  },
  {
    id: 'kot-1024',
    kotNumber: 1024,
    orderNumber: 'ORD-1024',
    status: 'preparing',
    orderType: 'dine_in',
    tableName: 'T-02',
    guests: 4,
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    kitchenNote: 'Less spicy, extra raita',
    estMinutes: 20,
    items: [
      { name: 'Chicken Biryani', qty: 1 },
      { name: 'Raita', qty: 1 },
    ],
  },
  {
    id: 'kot-1025',
    kotNumber: 1025,
    orderNumber: 'ORD-1025',
    status: 'preparing',
    orderType: 'takeaway',
    tableName: '',
    guests: 1,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    kitchenNote: 'Extra butter on roti',
    estMinutes: 15,
    items: [
      { name: 'Paneer Butter Masala', qty: 2 },
      { name: 'Tandoori Roti', qty: 2 },
    ],
  },
  {
    id: 'kot-1026',
    kotNumber: 1026,
    orderNumber: 'ORD-1026',
    status: 'preparing',
    orderType: 'delivery',
    tableName: '',
    guests: 1,
    createdAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    kitchenNote: 'Handle with care',
    estMinutes: 18,
    items: [
      { name: 'Hyderabadi Dum Biryani', qty: 1 },
      { name: 'Coke', qty: 1 },
    ],
  },
  {
    id: 'kot-1021',
    kotNumber: 1021,
    orderNumber: 'ORD-1021',
    status: 'ready',
    orderType: 'dine_in',
    tableName: 'T-04',
    guests: 2,
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    readyAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    kitchenNote: '',
    estMinutes: 15,
    items: [
      { name: 'Crispy Corn', qty: 1 },
      { name: 'Veg Manchurian', qty: 1 },
    ],
  },
  {
    id: 'kot-1022',
    kotNumber: 1022,
    orderNumber: 'ORD-1022',
    status: 'ready',
    orderType: 'dine_in',
    tableName: 'T-01',
    guests: 2,
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 17 * 60 * 1000).toISOString(),
    readyAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    kitchenNote: 'Cut naan in 4 pieces',
    estMinutes: 15,
    items: [
      { name: 'Butter Chicken', qty: 1 },
      { name: 'Garlic Naan', qty: 2 },
    ],
  },
  {
    id: 'kot-1023',
    kotNumber: 1023,
    orderNumber: 'ORD-1023',
    status: 'ready',
    orderType: 'takeaway',
    tableName: '',
    guests: 1,
    createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    readyAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    kitchenNote: '',
    estMinutes: 15,
    items: [
      { name: 'Paneer Tikka', qty: 1 },
      { name: 'Lachha Paratha', qty: 1 },
    ],
  },
  {
    id: 'kot-1018',
    kotNumber: 1018,
    orderNumber: 'ORD-1018',
    status: 'served',
    orderType: 'dine_in',
    tableName: 'T-08',
    guests: 4,
    createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
    readyAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    servedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    kitchenNote: '',
    estMinutes: 20,
    items: [
      { name: 'Dal Makhani', qty: 1 },
      { name: 'Garlic Naan', qty: 2 },
    ],
  },
  {
    id: 'kot-1019',
    kotNumber: 1019,
    orderNumber: 'ORD-1019',
    status: 'served',
    orderType: 'dine_in',
    tableName: 'T-05',
    guests: 2,
    createdAt: new Date(Date.now() - 31 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 27 * 60 * 1000).toISOString(),
    readyAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    servedAt: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
    kitchenNote: '',
    estMinutes: 18,
    items: [
      { name: 'Chicken Curry', qty: 1 },
      { name: 'Jeera Rice', qty: 1 },
    ],
  },
  {
    id: 'kot-1020',
    kotNumber: 1020,
    orderNumber: 'ORD-1020',
    status: 'served',
    orderType: 'delivery',
    tableName: '',
    guests: 1,
    createdAt: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 29 * 60 * 1000).toISOString(),
    readyAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    servedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    kitchenNote: 'Cutlery included',
    estMinutes: 20,
    items: [
      { name: 'Veg Biryani', qty: 1 },
      { name: 'Raita', qty: 1 },
    ],
  },
];

const readQueue = (): KotEntry[] => {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(SEED_KOTS));
      return SEED_KOTS;
    }
    const parsed = JSON.parse(raw) as KotEntry[];
    if (parsed.length === 0) {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(SEED_KOTS));
      return SEED_KOTS;
    }
    return parsed;
  } catch {
    return SEED_KOTS;
  }
};

const writeQueue = (q: KotEntry[]) => {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch {
    /* ignore */
  }
};

const minsSince = (iso: string | undefined, now: number) =>
  iso ? Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000)) : 0;

const formatAgo = (iso: string | undefined, now: number) => {
  const m = minsSince(iso, now);
  if (m < 1) return 'Just now';
  return `${m} min ago`;
};

const formatTimeOnly = (iso: string) => {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const KitchenKotPage: React.FC = () => {
  const [queue, setQueue] = useState<KotEntry[]>(readQueue);
  const [settings, setSettings] = useState<KotSettings>(() => {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');
  const [selectedId, setSelectedId] = useState<string | undefined>('kot-1024');
  const [now, setNow] = useState(Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [serverAlertKot, setServerAlertKot] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<null | { type: 'addTime' | 'edit' | 'cancel'; kotId: string }>(null);
  const [extraTime, setExtraTime] = useState(5);
  const [editNote, setEditNote] = useState('');

  const seenIds = useRef<Set<string>>(new Set(queue.map((k) => k.id)));

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Sync with localStorage
  const syncFromStorage = useCallback(() => {
    if (!settings.autoRefresh) return;
    const q = readQueue();
    const fresh = q.filter((k) => !seenIds.current.has(k.id));
    if (fresh.length) {
      fresh.forEach((k) => seenIds.current.add(k.id));
    }
    setQueue((cur) => (JSON.stringify(cur) === JSON.stringify(q) ? cur : q));
  }, [settings.autoRefresh]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => e.key === QUEUE_KEY && syncFromStorage();
    window.addEventListener('storage', onStorage);
    const poll = setInterval(syncFromStorage, 4000);
    const tick = setInterval(() => setNow(Date.now()), 20000);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [syncFromStorage]);

  const mutate = useCallback((fn: (q: KotEntry[]) => KotEntry[]) => {
    const next = fn(readQueue());
    writeQueue(next);
    next.forEach((k) => seenIds.current.add(k.id));
    setQueue(next);
  }, []);

  // Filtered by order type
  const filteredQueue = useMemo(() => {
    if (orderFilter === 'all') return queue;
    return queue.filter((k) => k.orderType === orderFilter);
  }, [queue, orderFilter]);

  // Breakdown by status
  const columns = useMemo(() => {
    return {
      pending: filteredQueue.filter((k) => k.status === 'pending'),
      preparing: filteredQueue.filter((k) => k.status === 'preparing'),
      ready: filteredQueue.filter((k) => k.status === 'ready'),
      served: filteredQueue.filter((k) => k.status === 'served'),
    };
  }, [filteredQueue]);

  // Counts for tabs
  const typeCounts = useMemo(() => {
    return {
      all: queue.length,
      dine_in: queue.filter((k) => k.orderType === 'dine_in').length,
      takeaway: queue.filter((k) => k.orderType === 'takeaway').length,
      delivery: queue.filter((k) => k.orderType === 'delivery').length,
    };
  }, [queue]);

  // Selected KOT object
  const selectedKot = useMemo(() => {
    return queue.find((k) => k.id === selectedId) || queue[0];
  }, [queue, selectedId]);

  // State transitions
  const handleStart = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    mutate((q) =>
      q.map((k) => (k.id === id ? { ...k, status: 'preparing', startedAt: new Date().toISOString() } : k))
    );
    setSelectedId(id);
  };

  const handleMarkReady = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    mutate((q) =>
      q.map((k) => (k.id === id ? { ...k, status: 'ready', readyAt: new Date().toISOString() } : k))
    );
    setSelectedId(id);
  };

  const handleCallServer = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setServerAlertKot(id);
    setTimeout(() => setServerAlertKot(null), 3000);
  };

  const handleServe = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    mutate((q) =>
      q.map((k) => (k.id === id ? { ...k, status: 'served', servedAt: new Date().toISOString() } : k))
    );
    setSelectedId(id);
  };

  const handleAddExtraTime = () => {
    if (!actionModal) return;
    mutate((q) =>
      q.map((k) =>
        k.id === actionModal.kotId
          ? { ...k, estMinutes: (k.estMinutes || 15) + extraTime }
          : k
      )
    );
    setActionModal(null);
  };

  const handleSaveEditNote = () => {
    if (!actionModal) return;
    mutate((q) =>
      q.map((k) => (k.id === actionModal.kotId ? { ...k, kitchenNote: editNote } : k))
    );
    setActionModal(null);
  };

  const handleCancelKot = () => {
    if (!actionModal) return;
    mutate((q) => q.filter((k) => k.id !== actionModal.kotId));
    setActionModal(null);
    setSelectedId(queue.find((k) => k.id !== actionModal.kotId)?.id);
  };

  return (
    <div className="flex gap-4 font-sans text-[#191923] select-none pb-2 h-full overflow-hidden">
      {/* Left Main Section: Top Controls + Metrics + 4-Column Kanban */}
      <div className="flex-1 min-w-0 flex flex-col gap-3.5 h-full overflow-hidden">
        {/* Top Controls Row: Filter Pills + Auto Refresh + Fullscreen */}
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOrderFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                orderFilter === 'all'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              All KOT ({typeCounts.all})
            </button>
            <button
              onClick={() => setOrderFilter('dine_in')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                orderFilter === 'dine_in'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              Dine In ({typeCounts.dine_in})
            </button>
            <button
              onClick={() => setOrderFilter('takeaway')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                orderFilter === 'takeaway'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Takeaway ({typeCounts.takeaway})
            </button>
            <button
              onClick={() => setOrderFilter('delivery')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                orderFilter === 'delivery'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              Delivery ({typeCounts.delivery})
            </button>
          </div>

          {/* Auto Refresh Switch + Fullscreen */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-gray-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#00C060] animate-pulse"></span>
              <span className="text-xs font-bold text-gray-600">Auto Refresh</span>
              <button
                onClick={() =>
                  setSettings((s) => ({
                    ...s,
                    autoRefresh: !s.autoRefresh,
                  }))
                }
                className={`w-8 h-4.5 rounded-full p-0.5 transition-colors relative ${
                  settings.autoRefresh ? 'bg-[#00C060]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                    settings.autoRefresh ? 'translate-x-3.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 shadow-xs transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Metric Cards Row (To the left of the full-height right sidebar) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="bg-white rounded-2xl border border-gray-100 p-2.5 shadow-xs flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E7F9F0] text-[#00C060] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-black text-gray-900 leading-none">{queue.length}</p>
              <p className="text-[10px] font-semibold text-gray-500 mt-1 truncate">Total KOT</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-2.5 shadow-xs flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-black text-gray-900 leading-none">{columns.pending.length}</p>
              <p className="text-[10px] font-semibold text-gray-500 mt-1 truncate">New</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-2.5 shadow-xs flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <ChefHat className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-black text-gray-900 leading-none">{columns.preparing.length}</p>
              <p className="text-[10px] font-semibold text-gray-500 mt-1 truncate">Preparing</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-2.5 shadow-xs flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <BellRing className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-black text-gray-900 leading-none">{columns.ready.length}</p>
              <p className="text-[10px] font-semibold text-gray-500 mt-1 truncate">Ready</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-2.5 shadow-xs flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-black text-gray-900 leading-none">{columns.served.length}</p>
              <p className="text-[10px] font-semibold text-gray-500 mt-1 truncate">Served</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-2.5 shadow-xs flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-black text-gray-900 leading-none">32 min</p>
              <p className="text-[10px] font-semibold text-gray-500 mt-1 truncate">Avg. Prep</p>
            </div>
          </div>
        </div>

        {/* 4-Column Kanban Board */}
        <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 overflow-y-auto pr-1">
          {/* Column 1: New */}
          <div className="flex flex-col bg-[#FFF9F3] border border-amber-100 rounded-2xl p-2.5 min-h-[460px]">
            <div className="flex items-center gap-2 px-2 py-1.5 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h2 className="text-xs font-black text-amber-900">New ({columns.pending.length})</h2>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {columns.pending.map((k) => {
                const isSelected = selectedKot?.id === k.id;
                return (
                  <div
                    key={k.id}
                    onClick={() => setSelectedId(k.id)}
                    className={`bg-white rounded-xl p-2.5 border transition-all cursor-pointer relative shadow-xs ${
                      isSelected
                        ? 'border-[#00C060] ring-2 ring-[#00C060]/20'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-1.5">
                        {k.orderType === 'takeaway' ? (
                          <ShoppingBag className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        ) : k.orderType === 'delivery' ? (
                          <Bike className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        ) : (
                          <Utensils className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        )}
                        <span className="text-xs font-black text-gray-900">KOT #{k.kotNumber}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-gray-400">{formatAgo(k.createdAt, now)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionModal({ type: 'edit', kotId: k.id });
                            setEditNote(k.kitchenNote || '');
                          }}
                          className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-gray-600"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 mb-1.5">
                      {k.tableName && (
                        <span className="text-xs font-bold text-gray-700">{k.tableName}</span>
                      )}
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          k.orderType === 'takeaway'
                            ? 'bg-amber-100 text-amber-800'
                            : k.orderType === 'delivery'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {k.orderType === 'dine_in' ? 'Dine In' : k.orderType === 'takeaway' ? 'Takeaway' : 'Delivery'}
                      </span>
                    </div>

                    <div className="space-y-0.5 my-1.5">
                      {k.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-gray-700 font-medium truncate">
                            {it.qty} × {it.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-gray-50 flex items-center justify-end">
                      <button
                        onClick={(e) => handleStart(k.id, e)}
                        className="px-3 py-1 bg-[#00C060] text-white rounded-lg text-xs font-bold hover:bg-[#00a854] shadow-xs flex items-center gap-1 transition-all"
                      >
                        <ChefHat className="w-3 h-3" />
                        Start
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Preparing */}
          <div className="flex flex-col bg-[#F3F8FF] border border-blue-100 rounded-2xl p-2.5 min-h-[460px]">
            <div className="flex items-center gap-2 px-2 py-1.5 mb-1.5">
              <ChefHat className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-black text-blue-900">Preparing ({columns.preparing.length})</h2>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {columns.preparing.map((k) => {
                const isSelected = selectedKot?.id === k.id;
                const elapsedMins = minsSince(k.startedAt || k.createdAt, now);
                const totalTarget = k.estMinutes || 20;
                const leftMins = Math.max(1, totalTarget - elapsedMins);
                const progressPct = Math.min(95, Math.round((elapsedMins / totalTarget) * 100));

                return (
                  <div
                    key={k.id}
                    onClick={() => setSelectedId(k.id)}
                    className={`bg-white rounded-xl p-2.5 border transition-all cursor-pointer relative shadow-xs ${
                      isSelected
                        ? 'border-[#00C060] ring-2 ring-[#00C060]/20'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-1.5">
                        {k.orderType === 'takeaway' ? (
                          <ShoppingBag className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        ) : k.orderType === 'delivery' ? (
                          <Bike className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        ) : (
                          <ChefHat className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        )}
                        <span className="text-xs font-black text-gray-900">KOT #{k.kotNumber}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-gray-400">{formatAgo(k.startedAt || k.createdAt, now)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionModal({ type: 'edit', kotId: k.id });
                            setEditNote(k.kitchenNote || '');
                          }}
                          className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-gray-600"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 mb-1.5">
                      {k.tableName && (
                        <span className="text-xs font-bold text-gray-700">{k.tableName}</span>
                      )}
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          k.orderType === 'takeaway'
                            ? 'bg-amber-100 text-amber-800'
                            : k.orderType === 'delivery'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {k.orderType === 'dine_in' ? 'Dine In' : k.orderType === 'takeaway' ? 'Takeaway' : 'Delivery'}
                      </span>
                    </div>

                    <div className="space-y-0.5 my-1.5">
                      {k.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-gray-700 font-medium truncate">
                            {it.qty} × {it.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar + Left time */}
                    <div className="mt-2 pt-1.5">
                      <div className="w-full bg-blue-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px] font-semibold text-gray-500">
                        <span>{elapsedMins} min in prep</span>
                        <span className="font-bold text-blue-600">{leftMins} min left</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 3: Ready */}
          <div className="flex flex-col bg-[#F0FAF4] border border-emerald-100 rounded-2xl p-2.5 min-h-[460px]">
            <div className="flex items-center gap-2 px-2 py-1.5 mb-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-black text-emerald-900">Ready ({columns.ready.length})</h2>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {columns.ready.map((k) => {
                const isSelected = selectedKot?.id === k.id;
                const isAlerting = serverAlertKot === k.id;
                return (
                  <div
                    key={k.id}
                    onClick={() => setSelectedId(k.id)}
                    className={`bg-white rounded-xl p-2.5 border transition-all cursor-pointer relative shadow-xs ${
                      isSelected
                        ? 'border-[#00C060] ring-2 ring-[#00C060]/20'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-black text-gray-900">KOT #{k.kotNumber}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-gray-400">{formatAgo(k.readyAt || k.createdAt, now)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionModal({ type: 'edit', kotId: k.id });
                            setEditNote(k.kitchenNote || '');
                          }}
                          className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-gray-600"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 mb-1.5">
                      {k.tableName && (
                        <span className="text-xs font-bold text-gray-700">{k.tableName}</span>
                      )}
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          k.orderType === 'takeaway'
                            ? 'bg-amber-100 text-amber-800'
                            : k.orderType === 'delivery'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {k.orderType === 'dine_in' ? 'Dine In' : k.orderType === 'takeaway' ? 'Takeaway' : 'Delivery'}
                      </span>
                    </div>

                    <div className="space-y-0.5 my-1.5">
                      {k.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-gray-700 font-medium truncate">
                            {it.qty} × {it.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-gray-50 flex items-center justify-between">
                      <button
                        onClick={(e) => handleServe(k.id, e)}
                        className="text-[11px] font-bold text-gray-500 hover:text-gray-800"
                      >
                        Serve
                      </button>
                      <button
                        onClick={(e) => handleCallServer(k.id, e)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 transition-all ${
                          isAlerting
                            ? 'bg-emerald-600 text-white border-emerald-600 animate-bounce'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        <BellRing className="w-3 h-3" />
                        {isAlerting ? 'Calling...' : 'Call Server'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 4: Served */}
          <div className="flex flex-col bg-[#F7F4FD] border border-purple-100 rounded-2xl p-2.5 min-h-[460px]">
            <div className="flex items-center gap-2 px-2 py-1.5 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              <h2 className="text-xs font-black text-purple-900">Served ({columns.served.length})</h2>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {columns.served.map((k) => {
                const isSelected = selectedKot?.id === k.id;
                return (
                  <div
                    key={k.id}
                    onClick={() => setSelectedId(k.id)}
                    className={`bg-white rounded-xl p-2.5 border transition-all cursor-pointer relative shadow-xs opacity-90 hover:opacity-100 ${
                      isSelected
                        ? 'border-[#00C060] ring-2 ring-[#00C060]/20'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                        <span className="text-xs font-black text-gray-900">KOT #{k.kotNumber}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-gray-400">{formatAgo(k.servedAt || k.createdAt, now)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionModal({ type: 'edit', kotId: k.id });
                            setEditNote(k.kitchenNote || '');
                          }}
                          className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-gray-600"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 mb-1.5">
                      {k.tableName && (
                        <span className="text-xs font-bold text-gray-700">{k.tableName}</span>
                      )}
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          k.orderType === 'takeaway'
                            ? 'bg-amber-100 text-amber-800'
                            : k.orderType === 'delivery'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {k.orderType === 'dine_in' ? 'Dine In' : k.orderType === 'takeaway' ? 'Takeaway' : 'Delivery'}
                      </span>
                    </div>

                    <div className="space-y-0.5 my-1.5">
                      {k.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-gray-700 font-medium truncate">
                            {it.qty} × {it.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-gray-50 flex items-center justify-end">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Served
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Detail Sidebar: Extended Full to Top */}
      <div className="w-[320px] xl:w-[350px] bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col p-3.5 shrink-0 h-full overflow-hidden">
        {selectedKot ? (
          <div className="flex flex-col h-full min-h-0">
            {/* Header: Badge, KOT #, Status */}
            <div className="flex items-start justify-between pb-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 leading-tight">
                    KOT #{selectedKot.kotNumber}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 mt-0.5">
                    {selectedKot.tableName && (
                      <span className="flex items-center gap-0.5">
                        <Armchair className="w-3 h-3 text-gray-400" />
                        {selectedKot.tableName}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5">
                      <Users className="w-3 h-3 text-gray-400" />
                      {selectedKot.guests || 2} Guests
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Utensils className="w-3 h-3 text-gray-400" />
                      {selectedKot.orderType === 'dine_in'
                        ? 'Dine In'
                        : selectedKot.orderType === 'takeaway'
                        ? 'Takeaway'
                        : 'Delivery'}
                    </span>
                  </div>
                </div>
              </div>

              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${
                  selectedKot.status === 'preparing'
                    ? 'bg-blue-100 text-blue-700'
                    : selectedKot.status === 'ready'
                    ? 'bg-emerald-100 text-emerald-700'
                    : selectedKot.status === 'served'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {selectedKot.status === 'preparing' ? '✓ Preparing' : selectedKot.status}
              </span>
            </div>

            {/* Order Timers */}
            <div className="py-2 border-b border-gray-100 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-gray-500 font-semibold">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-[11px]">Order Time</span>
                </div>
                <span className="font-bold text-gray-900 text-[11px]">
                  {formatTimeOnly(selectedKot.createdAt)} ({formatAgo(selectedKot.createdAt, now)})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-gray-500 font-semibold">
                  <Clock className="w-3 h-3 text-emerald-500" />
                  <span className="text-[11px]">Est. Ready</span>
                </div>
                <span className="font-bold text-[#00C060] text-[11px]">
                  {formatTimeOnly(
                    new Date(new Date(selectedKot.createdAt).getTime() + (selectedKot.estMinutes || 20) * 60000).toISOString()
                  )}{' '}
                  ({Math.max(1, (selectedKot.estMinutes || 20) - minsSince(selectedKot.createdAt, now))} min left)
                </span>
              </div>
            </div>

            {/* Order Items List (compacted, clean spacing) */}
            <div className="py-2 flex-1 min-h-0 overflow-y-auto space-y-1.5">
              <h4 className="text-[11px] font-black text-gray-900 mb-1">
                Order Items ({selectedKot.items.length})
              </h4>
              <div className="space-y-1.5">
                {selectedKot.items.map((it, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-1.5 rounded-xl bg-gray-50/80 border border-gray-100"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={getItemThumbnail(it.name)}
                        alt={it.name}
                        className="w-8 h-8 rounded-lg object-cover bg-white p-0.5 border border-gray-200 shrink-0"
                      />
                      <span className="text-xs font-bold text-gray-900 truncate">{it.name}</span>
                    </div>
                    <span className="text-xs font-black text-gray-700 ml-1.5 shrink-0">×{it.qty}</span>
                  </div>
                ))}
              </div>

              {/* Kitchen Note */}
              <div className="mt-2.5 p-2 rounded-xl bg-amber-50/80 border border-amber-200">
                <div className="flex items-center gap-1 text-amber-800 text-[11px] font-bold mb-0.5">
                  <FileText className="w-3 h-3" />
                  <span>Kitchen Note</span>
                </div>
                <p className="text-[11px] text-amber-900/90 font-medium">
                  {selectedKot.kitchenNote || 'Less spicy, extra raita'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-gray-100 space-y-2 mt-auto">
              {selectedKot.status === 'pending' ? (
                <button
                  onClick={() => handleStart(selectedKot.id)}
                  className="w-full py-2.5 bg-[#00C060] text-white rounded-xl text-xs font-black hover:bg-[#00a854] shadow-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <ChefHat className="w-4 h-4" />
                  Start Preparing
                </button>
              ) : selectedKot.status === 'preparing' ? (
                <button
                  onClick={() => handleMarkReady(selectedKot.id)}
                  className="w-full py-2.5 bg-[#00C060] text-white rounded-xl text-xs font-black hover:bg-[#00a854] shadow-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  Mark Ready
                </button>
              ) : selectedKot.status === 'ready' ? (
                <button
                  onClick={() => handleServe(selectedKot.id)}
                  className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-xs font-black hover:bg-purple-700 shadow-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Serve Order
                </button>
              ) : (
                <div className="w-full py-2 text-center bg-purple-50 text-purple-700 text-xs font-black rounded-xl">
                  Order Completed
                </div>
              )}

              {/* Bottom Secondary Actions */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => {
                    setActionModal({ type: 'addTime', kotId: selectedKot.id });
                    setExtraTime(5);
                  }}
                  className="py-1.5 px-1 rounded-xl border border-gray-200 text-[11px] font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1 transition-colors"
                >
                  <Clock className="w-3 h-3 text-gray-400" />
                  Add Time
                </button>
                <button
                  onClick={() => {
                    setActionModal({ type: 'edit', kotId: selectedKot.id });
                    setEditNote(selectedKot.kitchenNote || '');
                  }}
                  className="py-1.5 px-1 rounded-xl border border-gray-200 text-[11px] font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3 h-3 text-gray-400" />
                  Edit
                </button>
                <button
                  onClick={() => setActionModal({ type: 'cancel', kotId: selectedKot.id })}
                  className="py-1.5 px-1 rounded-xl border border-rose-200 text-[11px] font-bold text-rose-600 hover:bg-rose-50 flex items-center justify-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3 text-rose-500" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
            <ChefHat className="w-8 h-8 text-gray-300 mb-1" />
            <p className="text-xs font-bold text-gray-600">No KOT selected</p>
            <p className="text-[10px] text-gray-400">Select any ticket from the columns</p>
          </div>
        )}
      </div>

      {/* Action Modals */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-gray-100">
            {actionModal.type === 'addTime' && (
              <div className="space-y-4">
                <h3 className="text-base font-black text-gray-900">Add Extra Preparation Time</h3>
                <p className="text-xs text-gray-500">
                  Notify waiters & display additional preparation minutes on this ticket.
                </p>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map((m) => (
                    <button
                      key={m}
                      onClick={() => setExtraTime(m)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                        extraTime === m
                          ? 'bg-[#00C060] text-white border-[#00C060]'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      +{m}m
                    </button>
                  ))}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setActionModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleAddExtraTime}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-[#00C060] text-white hover:bg-[#00a854]"
                  >
                    Confirm +{extraTime} min
                  </button>
                </div>
              </div>
            )}

            {actionModal.type === 'edit' && (
              <div className="space-y-4">
                <h3 className="text-base font-black text-gray-900">Edit Kitchen Note</h3>
                <p className="text-xs text-gray-500">Update instructions for cooks & kitchen staff.</p>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="e.g. Less spicy, pack extra dips..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00C060] resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setActionModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEditNote}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-[#00C060] text-white hover:bg-[#00a854]"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            )}

            {actionModal.type === 'cancel' && (
              <div className="space-y-4">
                <h3 className="text-base font-black text-rose-600">Cancel KOT Ticket</h3>
                <p className="text-xs text-gray-500">
                  Are you sure you want to cancel this KOT ticket? This will remove it from the kitchen queue.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setActionModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                  >
                    No, keep
                  </button>
                  <button
                    onClick={handleCancelKot}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 text-white hover:bg-rose-700"
                  >
                    Yes, Cancel KOT
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenKotPage;
