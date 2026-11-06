import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  XCircle,
  IndianRupee,
  Utensils,
  Bike,
  Globe,
  Plus,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Printer,
  Check,
  X,
  Edit2,
  Calendar,
  TrendingUp,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';

// Food Images
import classicBurgerImg from '../assets/3d/classic_burger.png';
import recentDrinkImg from '../assets/3d/recent_drink.png';
import chickenRiceBowlImg from '../assets/3d/chicken_rice_bowl.png';

export type OrderType = 'dine_in' | 'takeaway' | 'delivery' | 'online';
export type OrderStatus = 'in_progress' | 'preparing' | 'out_for_delivery' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  image: string;
}

export interface CustomerOrder {
  id: string; // e.g. ORD-1024
  type: OrderType;
  tableName?: string;
  customerName: string;
  customerPhone?: string;
  itemCount: number;
  amount: number;
  status: OrderStatus;
  time: string; // e.g. 12:28 PM
  date: string; // e.g. 02 Nov 2026, 12:28 PM
  subtotal: number;
  tax: number;
  serviceCharge: number;
  items: OrderItem[];
}

const SEED_ORDERS: CustomerOrder[] = [
  {
    id: 'ORD-1024',
    type: 'dine_in',
    tableName: 'T-06',
    customerName: 'Aman Verma',
    customerPhone: '+91 98765 43210',
    itemCount: 3,
    amount: 780,
    status: 'in_progress',
    time: '12:28 PM',
    date: '02 Nov 2026, 12:28 PM',
    subtotal: 500,
    tax: 25,
    serviceCharge: 50,
    items: [
      { id: '1', name: 'Cheese Burger', qty: 1, price: 220, image: classicBurgerImg },
      { id: '2', name: 'French Fries', qty: 1, price: 160, image: classicBurgerImg },
      { id: '3', name: 'Cold Drink (Large)', qty: 1, price: 120, image: recentDrinkImg },
    ],
  },
  {
    id: 'ORD-1023',
    type: 'takeaway',
    tableName: '',
    customerName: 'Walk-in',
    customerPhone: '+91 98987 11223',
    itemCount: 2,
    amount: 420,
    status: 'completed',
    time: '12:20 PM',
    date: '02 Nov 2026, 12:20 PM',
    subtotal: 380,
    tax: 19,
    serviceCharge: 21,
    items: [
      { id: '1', name: 'Chicken Seekh Kebab', qty: 1, price: 340, image: chickenRiceBowlImg },
      { id: '2', name: 'Cold Drink (Large)', qty: 1, price: 80, image: recentDrinkImg },
    ],
  },
  {
    id: 'ORD-1022',
    type: 'delivery',
    tableName: '',
    customerName: 'Ravi Kumar',
    customerPhone: '+91 99123 45678',
    itemCount: 4,
    amount: 1120,
    status: 'out_for_delivery',
    time: '12:05 PM',
    date: '02 Nov 2026, 12:05 PM',
    subtotal: 1000,
    tax: 50,
    serviceCharge: 70,
    items: [
      { id: '1', name: 'Butter Chicken', qty: 1, price: 390, image: chickenRiceBowlImg },
      { id: '2', name: 'Garlic Naan', qty: 2, price: 180, image: classicBurgerImg },
      { id: '3', name: 'Jeera Rice', qty: 1, price: 180, image: chickenRiceBowlImg },
    ],
  },
  {
    id: 'ORD-1021',
    type: 'dine_in',
    tableName: 'T-03',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98765 12345',
    itemCount: 5,
    amount: 1340,
    status: 'completed',
    time: '11:48 AM',
    date: '02 Nov 2026, 11:48 AM',
    subtotal: 1200,
    tax: 60,
    serviceCharge: 80,
    items: [
      { id: '1', name: 'Paneer Butter Masala', qty: 1, price: 340, image: chickenRiceBowlImg },
      { id: '2', name: 'Tandoori Roti', qty: 4, price: 160, image: classicBurgerImg },
      { id: '3', name: 'Dal Makhani', qty: 1, price: 290, image: chickenRiceBowlImg },
    ],
  },
  {
    id: 'ORD-1020',
    type: 'online',
    tableName: '',
    customerName: 'Neha Gupta',
    customerPhone: '+91 99887 66554',
    itemCount: 3,
    amount: 690,
    status: 'completed',
    time: '11:35 AM',
    date: '02 Nov 2026, 11:35 AM',
    subtotal: 620,
    tax: 31,
    serviceCharge: 39,
    items: [
      { id: '1', name: 'Veg Biryani', qty: 1, price: 260, image: chickenRiceBowlImg },
      { id: '2', name: 'Raita', qty: 1, price: 60, image: recentDrinkImg },
    ],
  },
];

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<CustomerOrder[]>(SEED_ORDERS);
  const [activeFilterPill, setActiveFilterPill] = useState<'all' | 'dine_in' | 'takeaway' | 'delivery' | 'online'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('ORD-1024');
  const [searchQuery, setSearchQuery] = useState('');

  // Right sidebar mode: 'order' (default showing selected order) or 'filters' (opened on clicking filter icon)
  const [rightPanelMode, setRightPanelMode] = useState<'order' | 'filters'>('order');

  // Filter state for the advanced filter sidebar
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMinAmount, setFilterMinAmount] = useState<number>(0);
  const [filterMaxAmount, setFilterMaxAmount] = useState<number>(5000);
  const [filterTable, setFilterTable] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');

  // Selected Order
  const selectedOrder = useMemo(() => {
    return orders.find((o) => o.id === selectedOrderId) || orders[0];
  }, [orders, selectedOrderId]);

  // Counts & Revenue
  const counts = useMemo(() => {
    const totalRev = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.amount : sum), 0);
    return {
      all: 86,
      completed: 80,
      in_progress: 4,
      cancelled: 6,
      totalSales: 28430,
      todayRevenue: totalRev,
      dineInRevenue: 16420,
      takeawayRevenue: 6850,
      deliveryRevenue: 5160,
      avgOrderValue: 330.58,
      dine_in: 32,
      takeaway: 18,
      delivery: 14,
      online: 10,
    };
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Filter Pill
      if (activeFilterPill !== 'all' && o.type !== activeFilterPill) return false;

      // Filter Drawer fields
      if (filterStatus !== 'all' && o.status !== filterStatus) return false;
      if (filterTable !== 'all' && o.tableName !== filterTable) return false;
      if (o.amount < filterMinAmount || o.amount > filterMaxAmount) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          (o.tableName && o.tableName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [orders, activeFilterPill, filterStatus, filterTable, filterMinAmount, filterMaxAmount, searchQuery]);

  // State transitions
  const handleMarkReady = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'completed' } : o))
    );
  };

  const handleCancelOrder = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'cancelled' } : o))
    );
  };

  const handleResetFilters = () => {
    setActiveFilterPill('all');
    setFilterStatus('all');
    setFilterTable('all');
    setFilterMinAmount(0);
    setFilterMaxAmount(5000);
    setSearchQuery('');
  };

  const getTypeBadge = (type: OrderType) => {
    switch (type) {
      case 'dine_in':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
            <Utensils className="w-3 h-3 text-emerald-600" /> Dine In
          </span>
        );
      case 'takeaway':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200">
            <ShoppingBag className="w-3 h-3 text-purple-600" /> Takeaway
          </span>
        );
      case 'delivery':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200">
            <Bike className="w-3 h-3 text-rose-600" /> Delivery
          </span>
        );
      case 'online':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200">
            <Globe className="w-3 h-3 text-blue-600" /> Online
          </span>
        );
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> In Progress
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Preparing
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Out for Delivery
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600" /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200">
            <X className="w-3 h-3 text-rose-600" /> Cancelled
          </span>
        );
    }
  };

  return (
    <div className="flex gap-4 font-sans text-[#191923] select-none pb-2 h-full overflow-hidden">
      {/* Center Main Section: Header Title + Status Metric Cards + Orders Table */}
      <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col p-4 h-full overflow-hidden">
        {/* Top Header: Title & Date + Create Order */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 gap-3 flex-wrap shrink-0">
          <div>
            <h1 className="text-base font-black text-gray-900 leading-tight">Orders</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Manage and track all customer orders in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-xs cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>Today, 02 Nov 2026</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>

            <button
              onClick={() => navigate('/pos')}
              className="px-4 py-1.5 rounded-xl bg-[#00C060] text-white text-xs font-black hover:bg-[#00a854] shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Order</span>
            </button>
          </div>
        </div>

        {/* Status Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 py-3 border-b border-gray-100 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-2.5 px-3 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00C060] flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-black text-gray-900 leading-none">{counts.all}</p>
              <p className="text-[10px] font-semibold text-gray-500 mt-1">Total Orders</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-2.5 px-3 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-black text-gray-900 leading-none">{counts.completed}</p>
              <p className="text-[10px] font-semibold text-gray-500 mt-1">Completed</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-2.5 px-3 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-black text-gray-900 leading-none">{counts.in_progress}</p>
              <p className="text-[10px] font-semibold text-gray-500 mt-1">In Progress</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-2.5 px-3 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-black text-gray-900 leading-none">{counts.cancelled}</p>
              <p className="text-[10px] font-semibold text-gray-500 mt-1">Cancelled</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-2.5 px-3 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-black text-gray-900 leading-none">₹28,430.00</p>
              <p className="text-[10px] font-semibold text-gray-500 mt-1">Total Sales</p>
            </div>
          </div>
        </div>

        {/* Filter Pills + Search Input Bar */}
        <div className="flex items-center justify-between gap-3 py-3 border-b border-gray-100 flex-wrap shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveFilterPill('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilterPill === 'all'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setActiveFilterPill('dine_in')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilterPill === 'dine_in'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              Dine In ({counts.dine_in})
            </button>
            <button
              onClick={() => setActiveFilterPill('takeaway')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilterPill === 'takeaway'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Takeaway ({counts.takeaway})
            </button>
            <button
              onClick={() => setActiveFilterPill('delivery')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilterPill === 'delivery'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              Delivery ({counts.delivery})
            </button>
            <button
              onClick={() => setActiveFilterPill('online')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilterPill === 'online'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Online ({counts.online})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order (ID, table, customer...)"
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#00C060] bg-gray-50/60"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setRightPanelMode(rightPanelMode === 'filters' ? 'order' : 'filters')}
              className={`p-2 rounded-xl border transition-all ${
                rightPanelMode === 'filters'
                  ? 'bg-[#00C060] text-white border-[#00C060] shadow-xs'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
              title="Toggle Advanced Filters & Analytics"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Orders Table Container */}
        <div className="flex-1 overflow-y-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-white border-b border-gray-100 z-10 text-gray-400 font-bold">
              <tr>
                <th className="py-2.5 px-3 w-8">
                  <input type="checkbox" className="rounded accent-[#00C060]" />
                </th>
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Table</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Items</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map((ord) => {
                const isSelected = selectedOrder?.id === ord.id;
                return (
                  <tr
                    key={ord.id}
                    onClick={() => {
                      setSelectedOrderId(ord.id);
                      setRightPanelMode('order');
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected && rightPanelMode === 'order'
                        ? 'bg-[#E7F9F0]/60 border-y border-[#00C060]/30'
                        : 'hover:bg-gray-50/70'
                    }`}
                  >
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded accent-[#00C060]" />
                    </td>
                    <td className="py-3 px-3 font-black text-gray-900">{ord.id}</td>
                    <td className="py-3 px-3">{getTypeBadge(ord.type)}</td>
                    <td className="py-3 px-3 font-bold text-gray-800">{ord.tableName || '—'}</td>
                    <td className="py-3 px-3 font-semibold text-gray-800">
                      <span className="flex items-center gap-1.5">
                        <span className="text-gray-400">👤</span>
                        <span>{ord.customerName}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-gray-600">{ord.itemCount} items</td>
                    <td className="py-3 px-3 font-black text-gray-900">₹{ord.amount.toFixed(2)}</td>
                    <td className="py-3 px-3">{getStatusBadge(ord.status)}</td>
                    <td className="py-3 px-3 font-medium text-gray-500">{ord.time}</td>
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1 text-gray-400">
                        <button
                          onClick={() => {
                            setSelectedOrderId(ord.id);
                            setRightPanelMode('order');
                          }}
                          className="hover:text-gray-700 p-1"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="hover:text-gray-700 p-1" title="More">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Bar */}
        <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-semibold shrink-0">
          <span>Showing 1-5 of 86 orders</span>
          <div className="flex items-center gap-1">
            <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-gray-400">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="w-6 h-6 rounded bg-[#00C060] text-white font-bold flex items-center justify-center">
              1
            </button>
            <button className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center">
              2
            </button>
            <button className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center">
              3
            </button>
            <button className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center">
              4
            </button>
            <button className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center">
              5
            </button>
            <span>...</span>
            <button className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center">
              18
            </button>
            <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-gray-400">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Dynamic between 'order' (Default) and 'filters' (Scrollable Filter & Analytics) */}
      <div className="w-[320px] xl:w-[350px] bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col p-4 shrink-0 h-full overflow-hidden">
        {rightPanelMode === 'filters' ? (
          /* ============================================================
             CUSTOM FILTER & SALES REVENUE SIDEBAR
             ============================================================ */
          <div className="flex flex-col h-full min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#00C060]" />
                <h3 className="text-sm font-black text-gray-900">Filters & Revenue</h3>
              </div>
              <button
                onClick={() => setRightPanelMode('order')}
                className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600"
                title="Close and show order"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Filters Content */}
            <div className="py-3 flex-1 min-h-0 overflow-y-auto space-y-4 text-xs pr-1">
              {/* Revenue & Sales Breakdown Card */}
              <div className="p-3 bg-gradient-to-br from-[#E7F9F0] to-emerald-50/50 rounded-2xl border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black text-emerald-950 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#00C060]" /> Sales Revenue
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full shadow-2xs">
                    Today
                  </span>
                </div>

                <p className="text-2xl font-black text-emerald-900 leading-tight">
                  ₹{counts.totalSales.toLocaleString('en-IN')}.00
                </p>
                <p className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                  Avg. Order Value: ₹{counts.avgOrderValue.toFixed(2)}
                </p>

                <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-emerald-200/60 text-center">
                  <div className="bg-white/80 rounded-lg p-1.5">
                    <span className="text-[9px] text-gray-400 font-bold block">Dine In</span>
                    <span className="text-[11px] font-black text-gray-800">₹16.4k</span>
                  </div>
                  <div className="bg-white/80 rounded-lg p-1.5">
                    <span className="text-[9px] text-gray-400 font-bold block">Takeaway</span>
                    <span className="text-[11px] font-black text-gray-800">₹6.8k</span>
                  </div>
                  <div className="bg-white/80 rounded-lg p-1.5">
                    <span className="text-[9px] text-gray-400 font-bold block">Delivery</span>
                    <span className="text-[11px] font-black text-gray-800">₹5.1k</span>
                  </div>
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1.5">
                  Filter by Status
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { k: 'all', l: 'All Status' },
                    { k: 'in_progress', l: 'In Progress' },
                    { k: 'completed', l: 'Completed' },
                    { k: 'out_for_delivery', l: 'Delivery' },
                    { k: 'cancelled', l: 'Cancelled' },
                  ].map((st) => (
                    <button
                      key={st.k}
                      onClick={() => setFilterStatus(st.k)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        filterStatus === st.k
                          ? 'bg-[#00C060] text-white border-[#00C060]'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {st.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Filter */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Filter by Table
                </label>
                <div className="relative">
                  <select
                    value={filterTable}
                    onChange={(e) => setFilterTable(e.target.value)}
                    className="w-full appearance-none p-2.5 pr-8 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="all">All Tables</option>
                    <option value="T-01">Table T-01</option>
                    <option value="T-02">Table T-02</option>
                    <option value="T-03">Table T-03</option>
                    <option value="T-04">Table T-04</option>
                    <option value="T-05">Table T-05</option>
                    <option value="T-06">Table T-06</option>
                    <option value="T-07">Table T-07</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Order Amount Range */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-gray-700">Amount Range</label>
                  <span className="text-xs font-black text-[#00C060]">
                    ₹{filterMinAmount} - ₹{filterMaxAmount}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={filterMaxAmount}
                  onChange={(e) => setFilterMaxAmount(Number(e.target.value))}
                  className="w-full accent-[#00C060] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-semibold mt-0.5">
                  <span>₹0</span>
                  <span>₹2,500</span>
                  <span>₹5,000</span>
                </div>
              </div>

              {/* Payment Type */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['all', 'UPI / QR', 'Cash'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setFilterPayment(m)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all text-center capitalize ${
                        filterPayment === m
                          ? 'bg-[#E7F9F0] text-[#00C060] border-[#00C060]'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions for Filter */}
            <div className="pt-3 border-t border-gray-100 flex items-center gap-2 mt-auto">
              <button
                onClick={handleResetFilters}
                className="py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1 transition-colors flex-1"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
                <span>Reset</span>
              </button>
              <button
                onClick={() => setRightPanelMode('order')}
                className="py-2.5 px-4 rounded-xl bg-[#00C060] text-white text-xs font-black hover:bg-[#00a854] shadow-xs flex items-center justify-center gap-1.5 transition-all flex-1"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================
             DEFAULT ORDER DETAILS SIDEBAR
             ============================================================ */
          selectedOrder ? (
            <div className="flex flex-col h-full min-h-0">
              {/* Header: Title, Order ID, Status, Type, Table */}
              <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-black text-gray-900 leading-tight">Order Details</h3>
                  <div className="flex items-center gap-2 mt-1.5 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <div>
                      <span className="font-black text-gray-900">{selectedOrder.id}</span>
                      <span className="text-[10px] text-gray-400 block font-medium">
                        {selectedOrder.date}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(selectedOrder.status)}
                  {getTypeBadge(selectedOrder.type)}
                  {selectedOrder.tableName && (
                    <span className="text-[10px] font-bold text-gray-500">
                      Table: {selectedOrder.tableName}
                    </span>
                  )}
                </div>
              </div>

              {/* Customer Info Card */}
              <div className="py-2.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                    👤
                  </span>
                  <div>
                    <h4 className="font-black text-gray-900 leading-tight">
                      {selectedOrder.customerName}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {selectedOrder.customerPhone || 'Walk-in Guest'}
                    </p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-700 p-1">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Items List */}
              <div className="py-2.5 flex-1 min-h-0 overflow-y-auto space-y-2">
                <h4 className="text-xs font-black text-gray-900 mb-1">
                  Items ({selectedOrder.items.length})
                </h4>

                <div className="space-y-1.5">
                  {selectedOrder.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between p-1.5 rounded-xl bg-gray-50/80 border border-gray-100"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={it.image}
                          alt={it.name}
                          className="w-8 h-8 rounded-lg object-cover bg-white p-0.5 border border-gray-200 shrink-0"
                        />
                        <span className="text-xs font-bold text-gray-900 truncate">
                          {it.name} <span className="text-gray-400 font-semibold">× {it.qty}</span>
                        </span>
                      </div>
                      <span className="text-xs font-black text-gray-900 ml-2 shrink-0">
                        ₹{it.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Calculation Breakdown */}
              <div className="pt-2.5 border-t border-gray-100 space-y-1 text-xs">
                <div className="flex justify-between text-gray-500 font-semibold text-[11px]">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-semibold text-[11px]">
                  <span>Tax (5%)</span>
                  <span>₹{selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-semibold text-[11px]">
                  <span>Service Charge (10%)</span>
                  <span>₹{selectedOrder.serviceCharge.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-100 font-black text-gray-900 text-sm">
                  <span>Total Amount</span>
                  <span className="text-[#00C060] text-base">₹{selectedOrder.amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons: Cancel | Print KOT | Mark Ready */}
              <div className="pt-3 border-t border-gray-100 flex items-center gap-2 mt-auto">
                <button
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                  className="py-2.5 px-3 rounded-xl border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center justify-center gap-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>

                <button
                  onClick={() => alert(`Printing KOT for ${selectedOrder.id}...`)}
                  className="py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1 transition-colors flex-1"
                >
                  <Printer className="w-3.5 h-3.5 text-gray-400" />
                  <span>Print KOT</span>
                </button>

                <button
                  onClick={() => handleMarkReady(selectedOrder.id)}
                  className="py-2.5 px-4 rounded-xl bg-[#00C060] text-white text-xs font-black hover:bg-[#00a854] shadow-xs flex items-center justify-center gap-1.5 transition-all flex-1"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Mark Ready</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
              <ShoppingBag className="w-8 h-8 text-gray-300 mb-1" />
              <p className="text-xs font-bold text-gray-600">No order selected</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
