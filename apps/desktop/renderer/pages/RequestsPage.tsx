import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Clock,
  RotateCw,
  CheckCircle2,
  XCircle,
  ConciergeBell,
  Coffee,
  Receipt,
  Headphones,
  Star,
  Users,
  Check,
  Edit2,
  Eye,
  UserPlus,
  X,
  LayoutGrid,
  List,
  Armchair,
  Plus,
  Sparkles,
} from 'lucide-react';

const REQ_KEY = 'service.requests';

export type RequestCategory = 'all' | 'service' | 'refill' | 'bill' | 'assistance' | 'special';
export type RequestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface TableServiceRequest {
  id: string; // e.g. R-1048
  table: string; // e.g. T-02
  tableColor?: 'green' | 'red' | 'yellow' | 'blue';
  category: 'service' | 'refill' | 'bill' | 'assistance' | 'special';
  categoryLabel: string;
  details: string;
  guests: number;
  timeAgo: string;
  createdAt: string;
  status: RequestStatus;
  assignedStaff?: string;
}

const DEFAULT_TABLES = [
  { id: 'T-01', name: 'T-01', guests: 2, color: 'green' as const },
  { id: 'T-02', name: 'T-02', guests: 4, color: 'green' as const },
  { id: 'T-03', name: 'T-03', guests: 2, color: 'green' as const },
  { id: 'T-04', name: 'T-04', guests: 6, color: 'red' as const },
  { id: 'T-05', name: 'T-05', guests: 4, color: 'blue' as const },
  { id: 'T-06', name: 'T-06', guests: 2, color: 'green' as const },
  { id: 'T-07', name: 'T-07', guests: 4, color: 'red' as const },
  { id: 'T-08', name: 'T-08', guests: 2, color: 'green' as const },
  { id: 'T-09', name: 'T-09', guests: 4, color: 'yellow' as const },
  { id: 'T-10', name: 'T-10', guests: 6, color: 'green' as const },
];

const SEED_REQUESTS: TableServiceRequest[] = [
  {
    id: 'R-1048',
    table: 'T-02',
    tableColor: 'green',
    category: 'service',
    categoryLabel: 'Service',
    details: 'Need water and cutlery',
    guests: 4,
    timeAgo: '2 min ago',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    status: 'pending',
  },
  {
    id: 'R-1047',
    table: 'T-05',
    tableColor: 'green',
    category: 'refill',
    categoryLabel: 'Refill',
    details: 'Refill Cold Drink (2)',
    guests: 2,
    timeAgo: '4 min ago',
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    status: 'in_progress',
    assignedStaff: 'Rahul Sharma',
  },
  {
    id: 'R-1046',
    table: 'T-07',
    tableColor: 'red',
    category: 'bill',
    categoryLabel: 'Bill',
    details: 'Requesting the bill',
    guests: 3,
    timeAgo: '5 min ago',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: 'pending',
  },
  {
    id: 'R-1045',
    table: 'T-03',
    tableColor: 'green',
    category: 'assistance',
    categoryLabel: 'Assistance',
    details: 'Need help with menu',
    guests: 2,
    timeAgo: '7 min ago',
    createdAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    status: 'in_progress',
    assignedStaff: 'Priya Patel',
  },
  {
    id: 'R-1044',
    table: 'T-09',
    tableColor: 'yellow',
    category: 'refill',
    categoryLabel: 'Refill',
    details: 'Refill Water (1)',
    guests: 4,
    timeAgo: '8 min ago',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    status: 'completed',
  },
  {
    id: 'R-1043',
    table: 'T-01',
    tableColor: 'green',
    category: 'special',
    categoryLabel: 'Special',
    details: 'Extra chutney and onions',
    guests: 2,
    timeAgo: '10 min ago',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    status: 'completed',
  },
  {
    id: 'R-1042',
    table: 'T-06',
    tableColor: 'green',
    category: 'service',
    categoryLabel: 'Service',
    details: 'Change plate',
    guests: 1,
    timeAgo: '12 min ago',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    status: 'cancelled',
  },
];

// Helper to normalize any request so it is never blank/corrupt
function normalizeRequest(raw: any, index: number): TableServiceRequest {
  const numId = raw.id && typeof raw.id === 'string' && raw.id.startsWith('R-') ? raw.id : `R-${1040 + index}`;
  const table = raw.table || raw.tableName || `T-0${(index % 7) + 1}`;
  let category: TableServiceRequest['category'] = 'service';
  if (['service', 'refill', 'bill', 'assistance', 'special'].includes(raw.category)) {
    category = raw.category;
  } else if (raw.type) {
    if (raw.type === 'water') category = 'refill';
    else if (raw.type === 'bill') category = 'bill';
    else if (raw.type === 'assistance') category = 'assistance';
    else category = 'service';
  }

  const categoryLabel = raw.categoryLabel || category.charAt(0).toUpperCase() + category.slice(1);
  const details = raw.details || raw.note || (category === 'service' ? 'Service requested' : category === 'bill' ? 'Requesting bill' : 'Customer request');
  const guests = typeof raw.guests === 'number' && raw.guests > 0 ? raw.guests : 2;

  let timeAgo = raw.timeAgo;
  if (!timeAgo && raw.createdAt) {
    const m = Math.max(1, Math.floor((Date.now() - new Date(raw.createdAt).getTime()) / 60000));
    timeAgo = `${m} min ago`;
  }
  if (!timeAgo) timeAgo = 'Just now';

  let status: RequestStatus = 'pending';
  if (['pending', 'in_progress', 'completed', 'cancelled'].includes(raw.status)) {
    status = raw.status;
  }

  return {
    id: numId,
    table,
    tableColor: raw.tableColor || 'green',
    category,
    categoryLabel,
    details,
    guests,
    timeAgo,
    createdAt: raw.createdAt || new Date().toISOString(),
    status,
    assignedStaff: raw.assignedStaff || raw.waiter,
  };
}

const readRequests = (): TableServiceRequest[] => {
  try {
    const raw = localStorage.getItem(REQ_KEY);
    if (!raw) {
      localStorage.setItem(REQ_KEY, JSON.stringify(SEED_REQUESTS));
      return SEED_REQUESTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(REQ_KEY, JSON.stringify(SEED_REQUESTS));
      return SEED_REQUESTS;
    }
    // Normalize any legacy requests that had blank/uuid fields
    const normalized = parsed.map((item, idx) => normalizeRequest(item, idx));
    return normalized;
  } catch {
    return SEED_REQUESTS;
  }
};

const writeRequests = (reqs: TableServiceRequest[]) => {
  try {
    localStorage.setItem(REQ_KEY, JSON.stringify(reqs));
  } catch {
    /* ignore */
  }
};

export const RequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<TableServiceRequest[]>(readRequests);
  const [activeCategory, setActiveCategory] = useState<RequestCategory>('all');
  const [selectedId, setSelectedId] = useState<string>('R-1048');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [raiseModalOpen, setRaiseModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('Rahul Sharma');
  const [waiters] = useState<string[]>(['Rahul Sharma', 'Priya Patel', 'Amit Verma', 'Sneha Kapoor']);

  // New Request Form State
  const [newTable, setNewTable] = useState('T-02');
  const [newCategory, setNewCategory] = useState<'service' | 'refill' | 'bill' | 'assistance' | 'special'>('service');
  const [newDetails, setNewDetails] = useState('');
  const [newGuests, setNewGuests] = useState(2);

  // Sync with storage
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === REQ_KEY) {
        setRequests(readRequests());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const mutate = useCallback((fn: (prev: TableServiceRequest[]) => TableServiceRequest[]) => {
    setRequests((cur) => {
      const next = fn(cur);
      writeRequests(next);
      return next;
    });
  }, []);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    if (activeCategory === 'all') return requests;
    return requests.filter((r) => r.category === activeCategory);
  }, [requests, activeCategory]);

  // Selected request
  const selectedReq = useMemo(() => {
    return requests.find((r) => r.id === selectedId) || requests[0];
  }, [requests, selectedId]);

  // Category & Status counts
  const counts = useMemo(() => {
    return {
      all: requests.length,
      service: requests.filter((r) => r.category === 'service').length,
      refill: requests.filter((r) => r.category === 'refill').length,
      bill: requests.filter((r) => r.category === 'bill').length,
      assistance: requests.filter((r) => r.category === 'assistance').length,
      special: requests.filter((r) => r.category === 'special').length,
      // Status metrics
      pending: requests.filter((r) => r.status === 'pending').length,
      in_progress: requests.filter((r) => r.status === 'in_progress').length,
      completed: requests.filter((r) => r.status === 'completed').length,
      cancelled: requests.filter((r) => r.status === 'cancelled').length,
    };
  }, [requests]);

  // Actions
  const handleAccept = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    mutate((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'in_progress' } : r))
    );
    setSelectedId(id);
  };

  const handleComplete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    mutate((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'completed' } : r))
    );
    setSelectedId(id);
  };

  const handleReject = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    mutate((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r))
    );
    setSelectedId(id);
  };

  const handleAssignStaff = () => {
    if (!selectedReq) return;
    mutate((prev) =>
      prev.map((r) =>
        r.id === selectedReq.id
          ? { ...r, assignedStaff: selectedStaff, status: 'in_progress' }
          : r
      )
    );
    setStaffModalOpen(false);
  };

  // Submit New Request
  const handleCreateRequest = () => {
    const tableInfo = DEFAULT_TABLES.find((t) => t.name === newTable) || DEFAULT_TABLES[0];
    const nextNum = Math.floor(1000 + Math.random() * 9000);
    const newReqId = `R-${nextNum}`;
    const categoryLabels: Record<string, string> = {
      service: 'Service',
      refill: 'Refill',
      bill: 'Bill',
      assistance: 'Assistance',
      special: 'Special',
    };

    const created: TableServiceRequest = {
      id: newReqId,
      table: tableInfo.name,
      tableColor: tableInfo.color,
      category: newCategory,
      categoryLabel: categoryLabels[newCategory] || 'Service',
      details: newDetails.trim() || `Customer requested ${categoryLabels[newCategory]}`,
      guests: newGuests,
      timeAgo: 'Just now',
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    mutate((prev) => [created, ...prev]);
    setSelectedId(newReqId);
    setRaiseModalOpen(false);
    setNewDetails('');
  };

  // Quick Raise from Sidebar or Table selector
  const openRaiseForTable = (tableNumber?: string) => {
    if (tableNumber) setNewTable(tableNumber);
    setRaiseModalOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'service':
        return <ConciergeBell className="w-4 h-4 text-emerald-500" />;
      case 'refill':
        return <Coffee className="w-4 h-4 text-emerald-600" />;
      case 'bill':
        return <Receipt className="w-4 h-4 text-blue-500" />;
      case 'assistance':
        return <Headphones className="w-4 h-4 text-cyan-600" />;
      case 'special':
        return <Star className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTableBadge = (table: string, color?: string) => {
    if (color === 'red') {
      return (
        <span className="px-2 py-0.5 rounded-md text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 shadow-2xs">
          {table}
        </span>
      );
    }
    if (color === 'yellow') {
      return (
        <span className="px-2 py-0.5 rounded-md text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 shadow-2xs">
          {table}
        </span>
      );
    }
    if (color === 'blue') {
      return (
        <span className="px-2 py-0.5 rounded-md text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 shadow-2xs">
          {table}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 shadow-2xs">
        {table}
      </span>
    );
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" /> Pending
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200">
            <RotateCw className="w-3 h-3 text-blue-500" /> In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-500" /> Cancelled
          </span>
        );
    }
  };

  return (
    <div className="flex gap-4 font-sans text-[#191923] select-none pb-2 h-full overflow-hidden">
      {/* Left Main Section */}
      <div className="flex-1 min-w-0 flex flex-col gap-3.5 h-full overflow-hidden">
        {/* Metric Cards Row (Swipeable on mobile, grid on desktop) */}
        <div className="flex lg:grid lg:grid-cols-5 gap-2.5 sm:gap-3 overflow-x-auto scrollbar-none snap-x py-0.5 shrink-0">
          <div className="shrink-0 snap-start bg-white rounded-2xl border border-gray-100 p-2.5 sm:p-3 shadow-xs flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-[#00C060] flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-base sm:text-xl font-black text-gray-900 leading-none">{counts.all}</p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 mt-1 whitespace-nowrap">Total Requests</p>
            </div>
          </div>

          <div className="shrink-0 snap-start bg-white rounded-2xl border border-gray-100 p-2.5 sm:p-3 shadow-xs flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-base sm:text-xl font-black text-gray-900 leading-none">{counts.pending}</p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 mt-1 whitespace-nowrap">Pending</p>
            </div>
          </div>

          <div className="shrink-0 snap-start bg-white rounded-2xl border border-gray-100 p-2.5 sm:p-3 shadow-xs flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-base sm:text-xl font-black text-gray-900 leading-none">{counts.in_progress}</p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 mt-1 whitespace-nowrap">In Progress</p>
            </div>
          </div>

          <div className="shrink-0 snap-start bg-white rounded-2xl border border-gray-100 p-2.5 sm:p-3 shadow-xs flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-base sm:text-xl font-black text-gray-900 leading-none">{counts.completed}</p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 mt-1 whitespace-nowrap">Completed</p>
            </div>
          </div>

          <div className="shrink-0 snap-start bg-white rounded-2xl border border-gray-100 p-2.5 sm:p-3 shadow-xs flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-base sm:text-xl font-black text-gray-900 leading-none">{counts.cancelled}</p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 mt-1 whitespace-nowrap">Cancelled</p>
            </div>
          </div>
        </div>

        {/* Filter Pills + "Raise Request" Button */}
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none snap-x max-w-full pb-0.5">
            <button
              onClick={() => setActiveCategory('all')}
              className={`shrink-0 snap-start px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              All Requests ({counts.all})
            </button>
            <button
              onClick={() => setActiveCategory('service')}
              className={`shrink-0 snap-start px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeCategory === 'service'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <ConciergeBell className="w-3.5 h-3.5" />
              Service ({counts.service})
            </button>
            <button
              onClick={() => setActiveCategory('refill')}
              className={`shrink-0 snap-start px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeCategory === 'refill'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              Refill ({counts.refill})
            </button>
            <button
              onClick={() => setActiveCategory('bill')}
              className={`shrink-0 snap-start px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeCategory === 'bill'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              Bill ({counts.bill})
            </button>
            <button
              onClick={() => setActiveCategory('assistance')}
              className={`shrink-0 snap-start px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeCategory === 'assistance'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              Assistance ({counts.assistance})
            </button>
            <button
              onClick={() => setActiveCategory('special')}
              className={`shrink-0 snap-start px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeCategory === 'special'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              Special ({counts.special})
            </button>
          </div>

          {/* Right Action: Raise Request Button + View Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => openRaiseForTable()}
              className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-[#00C060] text-white text-xs font-bold hover:bg-[#00a854] shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Raise Request</span>
            </button>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-[#00C060] text-white' : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-[#00C060] text-white' : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Requests List / Table Content */}
        <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          {viewMode === 'table' ? (
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-white border-b border-gray-100 z-10 text-gray-400 font-bold">
                  <tr>
                    <th className="py-3 px-4 w-20">#</th>
                    <th className="py-3 px-4 w-24">Table</th>
                    <th className="py-3 px-4 w-36">Request</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4 w-28">Time</th>
                    <th className="py-3 px-4 w-32">Status</th>
                    <th className="py-3 px-4 w-28 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredRequests.map((r) => {
                    const isSelected = selectedReq?.id === r.id;
                    return (
                      <tr
                        key={r.id}
                        onClick={() => {
                          setSelectedId(r.id);
                          setMobileDrawerOpen(true);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#E7F9F0]/60 border-y border-[#00C060]/30'
                            : 'hover:bg-gray-50/70'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-black text-gray-800">{r.id}</td>
                        <td className="py-3.5 px-4">{getTableBadge(r.table, r.tableColor)}</td>
                        <td className="py-3.5 px-4">
                          <span className="flex items-center gap-2 font-bold text-gray-800">
                            {getCategoryIcon(r.category)}
                            {r.categoryLabel}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-700 truncate max-w-[280px]">
                          {r.details}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 font-medium">{r.timeAgo}</td>
                        <td className="py-3.5 px-4">{getStatusBadge(r.status)}</td>
                        <td className="py-3.5 px-4 text-center">
                          {r.status === 'pending' && (
                            <button
                              onClick={(e) => handleAccept(r.id, e)}
                              className="px-3.5 py-1 bg-[#00C060] text-white font-bold rounded-lg hover:bg-[#00a854] shadow-xs flex items-center justify-center gap-1 mx-auto text-xs transition-all"
                            >
                              <Check className="w-3.5 h-3.5" /> Accept
                            </button>
                          )}
                          {r.status === 'in_progress' && (
                            <button
                              onClick={(e) => handleComplete(r.id, e)}
                              className="px-3 py-1 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 shadow-xs flex items-center justify-center gap-1 mx-auto text-xs transition-all"
                            >
                              <Edit2 className="w-3 h-3 text-gray-400" /> Update
                            </button>
                          )}
                          {(r.status === 'completed' || r.status === 'cancelled') && (
                            <button
                              onClick={() => setSelectedId(r.id)}
                              className="px-3 py-1 bg-white border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 shadow-xs flex items-center justify-center gap-1 mx-auto text-xs transition-all"
                            >
                              <Eye className="w-3 h-3 text-gray-400" /> View
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredRequests.map((r) => {
                const isSelected = selectedReq?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedId(r.id);
                      setMobileDrawerOpen(true);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white relative shadow-xs flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#00C060] ring-2 ring-[#00C060]/20'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-gray-900">{r.id}</span>
                        {getTableBadge(r.table, r.tableColor)}
                      </div>
                      <div className="flex items-center gap-2 mb-2 font-bold text-xs text-gray-800">
                        {getCategoryIcon(r.category)}
                        <span>{r.categoryLabel}</span>
                      </div>
                      <p className="text-xs text-gray-600 font-medium mb-3">{r.details}</p>
                    </div>

                    <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">{r.timeAgo}</span>
                      {getStatusBadge(r.status)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Detail Sidebar (Desktop only; Mobile uses bottom sheet drawer) */}
      <div className="hidden lg:flex w-[300px] xl:w-[330px] bg-white rounded-2xl border border-gray-200 shadow-sm flex-col p-4 shrink-0 h-full overflow-hidden">
        {selectedReq ? (
          <div className="flex flex-col h-full min-h-0">
            {/* Header: Concierge Icon, Request #, Status */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00C060] flex items-center justify-center shrink-0">
                  <ConciergeBell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 leading-tight">
                    Request #{selectedReq.id}
                  </h3>
                </div>
              </div>

              {getStatusBadge(selectedReq.status)}
            </div>

            {/* Table, Guests, Requested time info */}
            <div className="py-3 border-b border-gray-100 grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50/80 rounded-xl p-2 border border-gray-100 flex flex-col items-center">
                <span className="text-[10px] text-gray-400 font-bold mb-1 flex items-center gap-1">
                  <Armchair className="w-3 h-3" /> Table
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-black text-emerald-700 bg-emerald-100/60">
                  {selectedReq.table}
                </span>
              </div>

              <div className="bg-gray-50/80 rounded-xl p-2 border border-gray-100 flex flex-col items-center">
                <span className="text-[10px] text-gray-400 font-bold mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Guests
                </span>
                <span className="text-xs font-black text-gray-800">{selectedReq.guests}</span>
              </div>

              <div className="bg-gray-50/80 rounded-xl p-2 border border-gray-100 flex flex-col items-center">
                <span className="text-[10px] text-gray-400 font-bold mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Requested
                </span>
                <span className="text-xs font-black text-gray-800">{selectedReq.timeAgo}</span>
              </div>
            </div>

            {/* Details Section */}
            <div className="py-3 flex-1 min-h-0 overflow-y-auto space-y-3">
              {/* Request Type */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                  <Bell className="w-4 h-4 text-gray-400" />
                  <span>Request Type</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100">
                  {selectedReq.categoryLabel}
                </span>
              </div>

              {/* Details text */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-1.5">
                  <Receipt className="w-4 h-4 text-gray-400" />
                  <span>Details</span>
                </div>
                <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 text-xs font-medium text-gray-700">
                  {selectedReq.details}
                </div>
              </div>

              {/* Assigned Staff if any */}
              {selectedReq.assignedStaff && (
                <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-blue-500" /> Assigned Staff
                  </span>
                  <span className="text-xs font-black text-blue-800">
                    {selectedReq.assignedStaff}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-gray-100 space-y-2 mt-auto">
              {selectedReq.status === 'pending' ? (
                <button
                  onClick={() => handleAccept(selectedReq.id)}
                  className="w-full py-2.5 bg-[#00C060] text-white rounded-xl text-xs font-black hover:bg-[#00a854] shadow-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  Accept Request
                </button>
              ) : selectedReq.status === 'in_progress' ? (
                <button
                  onClick={() => handleComplete(selectedReq.id)}
                  className="w-full py-2.5 bg-[#00C060] text-white rounded-xl text-xs font-black hover:bg-[#00a854] shadow-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Completed
                </button>
              ) : (
                <div className="w-full py-2 text-center bg-gray-100 text-gray-600 text-xs font-bold rounded-xl">
                  Request {selectedReq.status === 'completed' ? 'Resolved' : 'Cancelled'}
                </div>
              )}

              {/* Secondary Actions: Assign to Staff & Reject */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setStaffModalOpen(true)}
                  className="py-2 px-1 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 text-gray-400" />
                  Assign to Staff
                </button>
                <button
                  onClick={() => handleReject(selectedReq.id)}
                  className="py-2 px-1 rounded-xl border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-rose-500" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
            <ConciergeBell className="w-8 h-8 text-gray-300 mb-1" />
            <p className="text-xs font-bold text-gray-600">No request selected</p>
            <p className="text-[10px] text-gray-400">Select any row from the table</p>
          </div>
        )}
      </div>

      {/* ================= MOBILE BOTTOM FLOATING REQUEST BAR & SLIDE-UP DRAWER ================= */}
      {selectedReq && (
        <>
          {/* Floating Mobile Bar above bottom navigation */}
          <div className="lg:hidden fixed bottom-14 inset-x-2 z-40 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.12)] p-2.5 flex items-center justify-between gap-2.5">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="flex items-center gap-2.5 min-w-0 text-left flex-1"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00C060] flex items-center justify-center shrink-0">
                <ConciergeBell className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-gray-900">{selectedReq.id}</span>
                  {getTableBadge(selectedReq.table, selectedReq.tableColor)}
                  {getStatusBadge(selectedReq.status)}
                </div>
                <p className="text-[10px] font-bold text-gray-500 truncate">
                  {selectedReq.categoryLabel} • {selectedReq.details}
                </p>
              </div>
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              {selectedReq.status === 'pending' ? (
                <button
                  onClick={(e) => handleAccept(selectedReq.id, e)}
                  className="px-3 py-1.5 bg-[#00C060] text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Accept</span>
                </button>
              ) : selectedReq.status === 'in_progress' ? (
                <button
                  onClick={(e) => handleComplete(selectedReq.id, e)}
                  className="px-3 py-1.5 bg-[#00C060] text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Done</span>
                </button>
              ) : (
                <button
                  onClick={() => setMobileDrawerOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold bg-white"
                >
                  Details
                </button>
              )}
            </div>
          </div>

          {/* Mobile Bottom Sheet Drawer */}
          {mobileDrawerOpen && (
            <div
              className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end justify-center"
              onClick={(e) => e.target === e.currentTarget && setMobileDrawerOpen(false)}
            >
              <div className="w-full bg-white rounded-t-3xl max-h-[80dvh] flex flex-col shadow-2xl border-t border-gray-100 animate-in slide-in-from-bottom duration-300">
                {/* Drag handle */}
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-2.5 mb-1" />

                {/* Header */}
                <div className="px-4 py-2.5 flex items-center justify-between border-b border-gray-100 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00C060] flex items-center justify-center shrink-0">
                      <ConciergeBell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900 leading-tight">
                        Request #{selectedReq.id}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-medium">Table {selectedReq.table} • {selectedReq.timeAgo}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedReq.status)}
                    <button
                      onClick={() => setMobileDrawerOpen(false)}
                      className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center font-bold"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Table & Guests Summary */}
                <div className="px-4 py-2.5 border-b border-gray-100 grid grid-cols-3 gap-2 text-center bg-gray-50/50">
                  <div className="bg-white rounded-xl p-2 border border-gray-100 flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 font-bold mb-0.5">Table</span>
                    <span className="text-xs font-black text-emerald-700">{selectedReq.table}</span>
                  </div>
                  <div className="bg-white rounded-xl p-2 border border-gray-100 flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 font-bold mb-0.5">Guests</span>
                    <span className="text-xs font-black text-gray-800">{selectedReq.guests}</span>
                  </div>
                  <div className="bg-white rounded-xl p-2 border border-gray-100 flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 font-bold mb-0.5">Category</span>
                    <span className="text-xs font-black text-gray-800 truncate">{selectedReq.categoryLabel}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 min-h-0 overflow-y-auto space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-gray-700 block mb-1">Request Details</span>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs font-medium text-gray-800">
                      {selectedReq.details}
                    </div>
                  </div>

                  {selectedReq.assignedStaff && (
                    <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs font-bold text-blue-900">
                      <span>Assigned Staff</span>
                      <span>{selectedReq.assignedStaff}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-gray-100 space-y-2 bg-white shrink-0 pb-6">
                  {selectedReq.status === 'pending' ? (
                    <button
                      onClick={() => {
                        handleAccept(selectedReq.id);
                        setMobileDrawerOpen(false);
                      }}
                      className="w-full py-2.5 bg-[#00C060] text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      Accept Request
                    </button>
                  ) : selectedReq.status === 'in_progress' ? (
                    <button
                      onClick={() => {
                        handleComplete(selectedReq.id);
                        setMobileDrawerOpen(false);
                      }}
                      className="w-full py-2.5 bg-[#00C060] text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Completed
                    </button>
                  ) : (
                    <div className="w-full py-2 text-center bg-gray-100 text-gray-600 text-xs font-bold rounded-xl">
                      Request {selectedReq.status === 'completed' ? 'Resolved' : 'Cancelled'}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        setStaffModalOpen(true);
                      }}
                      className="py-2 px-1 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 flex items-center justify-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-gray-400" />
                      Assign Staff
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedReq.id);
                        setMobileDrawerOpen(false);
                      }}
                      className="py-2 px-1 rounded-xl border border-rose-200 text-xs font-bold text-rose-600 flex items-center justify-center gap-1"
                    >
                      <X className="w-3.5 h-3.5 text-rose-500" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Raise New Request Modal */}
      {raiseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#00C060]" />
                Raise Service Request
              </h3>
              <button
                onClick={() => setRaiseModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Select Table */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Select Table</label>
              <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto p-1 bg-gray-50 rounded-xl border border-gray-200">
                {DEFAULT_TABLES.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => {
                      setNewTable(t.name);
                      setNewGuests(t.guests);
                    }}
                    className={`py-2 px-1 rounded-lg text-xs font-black transition-all ${
                      newTable === t.name
                        ? 'bg-[#00C060] text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Category */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Request Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { k: 'service', l: 'Service', icon: ConciergeBell },
                  { k: 'refill', l: 'Refill', icon: Coffee },
                  { k: 'bill', l: 'Bill', icon: Receipt },
                  { k: 'assistance', l: 'Assistance', icon: Headphones },
                  { k: 'special', l: 'Special', icon: Star },
                ].map((c) => (
                  <button
                    key={c.k}
                    type="button"
                    onClick={() => setNewCategory(c.k as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                      newCategory === c.k
                        ? 'bg-[#E7F9F0] border-[#00C060] text-[#00C060]'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <c.icon className="w-3.5 h-3.5" />
                    <span>{c.l}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Details input */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Details / Notes</label>
              <textarea
                value={newDetails}
                onChange={(e) => setNewDetails(e.target.value)}
                placeholder="e.g. Need extra water, napkins, change cutlery..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00C060] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setRaiseModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateRequest}
                className="px-5 py-2 rounded-xl text-xs font-black bg-[#00C060] text-white hover:bg-[#00a854] shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Raise for {newTable}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Assignment Modal */}
      {staffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#00C060]" />
              Assign Request to Waiter
            </h3>
            <p className="text-xs text-gray-500">
              Select a staff member to handle Table {selectedReq?.table}'s request.
            </p>

            <div className="space-y-1.5">
              {waiters.map((w) => (
                <button
                  key={w}
                  onClick={() => setSelectedStaff(w)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    selectedStaff === w
                      ? 'border-[#00C060] bg-[#E7F9F0] text-emerald-900'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>{w}</span>
                  {selectedStaff === w && <Check className="w-4 h-4 text-[#00C060]" />}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setStaffModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignStaff}
                className="px-4 py-2 rounded-xl text-xs font-black bg-[#00C060] text-white hover:bg-[#00a854]"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsPage;
