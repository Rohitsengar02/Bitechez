import React, { useMemo, useState } from 'react';
import {
  Users,
  UserPlus,
  Repeat,
  Crown,
  IndianRupee,
  ShoppingBag,
  Calendar,
  Gift,
  Phone,
  Edit2,
  MoreHorizontal,
  LayoutGrid,
  List,
  Plus,
  FileText,
  Slash,
  MessageSquare,
  X,
} from 'lucide-react';

// Food images for Recent Orders
import pepperoniPizzaImg from '../assets/3d/pepperoni_pizza.png';
import classicBurgerImg from '../assets/3d/classic_burger.png';
import butterChickenImg from '../assets/3d/butter_chicken.png';

export type CustomerFilter = 'all' | 'loyal' | 'new' | 'regular' | 'inactive';
export type CustomerTier = 'loyal' | 'new' | 'regular' | 'inactive';

export interface CustomerOrderHistory {
  id: string; // e.g. #OD8421
  title: string; // e.g. Order #OD8421
  type: string; // e.g. Dine In · T-02 or Takeaway
  time: string; // e.g. Today, 2:35 PM
  amount: number; // e.g. 780
  image: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  avatarText?: string;
  avatarBg?: string;
  tier: CustomerTier;
  totalOrders: number;
  totalSpent: number; // in INR
  lastVisit: string;
  status: 'active' | 'inactive';
  visits: number;
  rewardPoints: number;
  recentOrders: CustomerOrderHistory[];
}

const SEED_CUSTOMERS: Customer[] = [
  {
    id: 'c-1',
    name: 'Aman Verma',
    phone: '+91 98765 43210',
    avatarText: 'AV',
    avatarBg: 'bg-amber-100 text-amber-800',
    tier: 'loyal',
    totalOrders: 24,
    totalSpent: 12480,
    lastVisit: 'Today, 2:35 PM',
    status: 'active',
    visits: 18,
    rewardPoints: 820,
    recentOrders: [
      {
        id: 'OD8421',
        title: 'Order #OD8421',
        type: 'Dine In · T-02',
        time: 'Today, 2:35 PM',
        amount: 780,
        image: pepperoniPizzaImg,
      },
      {
        id: 'OD8405',
        title: 'Order #OD8405',
        type: 'Takeaway',
        time: '25 Oct, 8:20 PM',
        amount: 420,
        image: classicBurgerImg,
      },
      {
        id: 'OD8372',
        title: 'Order #OD8372',
        type: 'Dine In · T-06',
        time: '20 Oct, 7:10 PM',
        amount: 1240,
        image: pepperoniPizzaImg,
      },
    ],
  },
  {
    id: 'c-2',
    name: 'Priya Sharma',
    phone: '+91 99123 45678',
    avatarText: 'PS',
    avatarBg: 'bg-emerald-100 text-emerald-800',
    tier: 'regular',
    totalOrders: 12,
    totalSpent: 6240,
    lastVisit: 'Yesterday, 8:20 PM',
    status: 'active',
    visits: 9,
    rewardPoints: 340,
    recentOrders: [
      {
        id: 'OD8390',
        title: 'Order #OD8390',
        type: 'Dine In · T-01',
        time: 'Yesterday, 8:20 PM',
        amount: 920,
        image: butterChickenImg,
      },
      {
        id: 'OD8340',
        title: 'Order #OD8340',
        type: 'Takeaway',
        time: '22 Oct, 1:15 PM',
        amount: 350,
        image: classicBurgerImg,
      },
    ],
  },
  {
    id: 'c-3',
    name: 'Rahul Singh',
    phone: '+91 98987 65432',
    avatarText: 'RS',
    avatarBg: 'bg-blue-100 text-blue-800',
    tier: 'regular',
    totalOrders: 9,
    totalSpent: 4930,
    lastVisit: '28 Oct, 3:10 PM',
    status: 'active',
    visits: 6,
    rewardPoints: 210,
    recentOrders: [
      {
        id: 'OD8311',
        title: 'Order #OD8311',
        type: 'Dine In · T-04',
        time: '28 Oct, 3:10 PM',
        amount: 880,
        image: butterChickenImg,
      },
    ],
  },
  {
    id: 'c-4',
    name: 'Saurabh Kumar',
    phone: '+91 91234 56789',
    avatarText: 'SK',
    avatarBg: 'bg-emerald-100 text-emerald-800',
    tier: 'new',
    totalOrders: 2,
    totalSpent: 980,
    lastVisit: '28 Oct, 1:05 PM',
    status: 'active',
    visits: 2,
    rewardPoints: 80,
    recentOrders: [
      {
        id: 'OD8302',
        title: 'Order #OD8302',
        type: 'Takeaway',
        time: '28 Oct, 1:05 PM',
        amount: 490,
        image: classicBurgerImg,
      },
    ],
  },
  {
    id: 'c-5',
    name: 'Neha Gupta',
    phone: '+91 99876 54321',
    avatarText: 'NG',
    avatarBg: 'bg-purple-100 text-purple-800',
    tier: 'loyal',
    totalOrders: 18,
    totalSpent: 9560,
    lastVisit: '27 Oct, 8:45 PM',
    status: 'active',
    visits: 14,
    rewardPoints: 610,
    recentOrders: [
      {
        id: 'OD8289',
        title: 'Order #OD8289',
        type: 'Dine In · T-03',
        time: '27 Oct, 8:45 PM',
        amount: 1420,
        image: pepperoniPizzaImg,
      },
    ],
  },
  {
    id: 'c-6',
    name: 'Aditya Verma',
    phone: '+91 98712 34567',
    avatarText: 'AV',
    avatarBg: 'bg-emerald-100 text-emerald-800',
    tier: 'regular',
    totalOrders: 7,
    totalSpent: 3120,
    lastVisit: '26 Oct, 7:30 PM',
    status: 'inactive',
    visits: 5,
    rewardPoints: 120,
    recentOrders: [
      {
        id: 'OD8250',
        title: 'Order #OD8250',
        type: 'Takeaway',
        time: '26 Oct, 7:30 PM',
        amount: 620,
        image: classicBurgerImg,
      },
    ],
  },
  {
    id: 'c-7',
    name: 'Karan Malhotra',
    phone: '+91 97654 32109',
    avatarText: 'KM',
    avatarBg: 'bg-blue-100 text-blue-800',
    tier: 'regular',
    totalOrders: 10,
    totalSpent: 4860,
    lastVisit: '26 Oct, 2:15 PM',
    status: 'active',
    visits: 8,
    rewardPoints: 240,
    recentOrders: [
      {
        id: 'OD8241',
        title: 'Order #OD8241',
        type: 'Dine In · T-05',
        time: '26 Oct, 2:15 PM',
        amount: 850,
        image: butterChickenImg,
      },
    ],
  },
  {
    id: 'c-8',
    name: 'Rohit Saxena',
    phone: '+91 94567 89012',
    avatarText: 'RS',
    avatarBg: 'bg-emerald-100 text-emerald-800',
    tier: 'loyal',
    totalOrders: 16,
    totalSpent: 8240,
    lastVisit: '25 Oct, 9:10 PM',
    status: 'active',
    visits: 12,
    rewardPoints: 540,
    recentOrders: [
      {
        id: 'OD8204',
        title: 'Order #OD8204',
        type: 'Dine In · T-02',
        time: '25 Oct, 9:10 PM',
        amount: 1100,
        image: pepperoniPizzaImg,
      },
    ],
  },
];

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(SEED_CUSTOMERS);
  const [selectedId, setSelectedId] = useState<string>('c-1');
  const [activeFilter, setActiveFilter] = useState<CustomerFilter>('all');
  const [sidebarTab, setSidebarTab] = useState<'orders' | 'visits' | 'rewards'>('orders');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery] = useState('');

  // Modals
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTier, setNewTier] = useState<CustomerTier>('new');

  const [addPointsOpen, setAddPointsOpen] = useState(false);
  const [pointsAmount, setPointsAmount] = useState(100);

  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Selected customer object
  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedId) || customers[0];
  }, [customers, selectedId]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (activeFilter === 'loyal' && c.tier !== 'loyal') return false;
      if (activeFilter === 'new' && c.tier !== 'new') return false;
      if (activeFilter === 'regular' && c.tier !== 'regular') return false;
      if (activeFilter === 'inactive' && c.status !== 'inactive') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.phone.includes(q);
      }
      return true;
    });
  }, [customers, activeFilter, searchQuery]);

  // Metric counts
  const counts = useMemo(() => {
    return {
      total: 1248,
      newMonth: 86,
      repeat: 412,
      loyal: 128,
      regular: 326,
      inactive: 78,
      totalSales: 286430,
    };
  }, []);

  // Handlers
  const handleCreateCustomer = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    const initialText = newName
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('');
    const newCust: Customer = {
      id: `c-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.startsWith('+91') ? newPhone : `+91 ${newPhone.trim()}`,
      avatarText: initialText || 'CU',
      avatarBg: 'bg-emerald-100 text-emerald-800',
      tier: newTier,
      totalOrders: 1,
      totalSpent: 450,
      lastVisit: 'Today, Just now',
      status: 'active',
      visits: 1,
      rewardPoints: 50,
      recentOrders: [
        {
          id: `OD${Math.floor(1000 + Math.random() * 9000)}`,
          title: `Order #OD${Math.floor(1000 + Math.random() * 9000)}`,
          type: 'Takeaway',
          time: 'Today, Just now',
          amount: 450,
          image: classicBurgerImg,
        },
      ],
    };

    setCustomers((prev) => [newCust, ...prev]);
    setSelectedId(newCust.id);
    setAddCustomerOpen(false);
    setNewName('');
    setNewPhone('');
  };

  const handleAddRewardPoints = () => {
    if (!selectedCustomer) return;
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === selectedCustomer.id ? { ...c, rewardPoints: c.rewardPoints + pointsAmount } : c
      )
    );
    setAddPointsOpen(false);
  };

  const handleToggleBlock = () => {
    if (!selectedCustomer) return;
    const nextStatus = selectedCustomer.status === 'active' ? 'inactive' : 'active';
    setCustomers((prev) =>
      prev.map((c) => (c.id === selectedCustomer.id ? { ...c, status: nextStatus } : c))
    );
  };

  const getTierBadge = (tier: CustomerTier) => {
    switch (tier) {
      case 'loyal':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200">
            <Crown className="w-3 h-3 text-amber-500" /> Loyal
          </span>
        );
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
            <UserPlus className="w-3 h-3 text-emerald-500" /> New
          </span>
        );
      case 'regular':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200">
            <Users className="w-3 h-3 text-blue-500" /> Regular
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200">
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="flex gap-4 font-sans text-[#191923] select-none pb-2 h-full overflow-hidden">
      {/* Left Main Section */}
      <div className="flex-1 min-w-0 flex flex-col gap-3.5 h-full overflow-hidden">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00C060] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">1,248</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Total Customers</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">86</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">New (This Month)</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">412</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Repeat Customers</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">128</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Loyal Customers</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">₹2,86,430</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Total Sales</p>
            </div>
          </div>
        </div>

        {/* Filter Pills + Add Customer Button */}
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-0.5">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === 'all'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              All Customers ({counts.total})
            </button>
            <button
              onClick={() => setActiveFilter('loyal')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === 'loyal'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              Loyal ({counts.loyal})
            </button>
            <button
              onClick={() => setActiveFilter('new')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === 'new'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              New ({counts.newMonth})
            </button>
            <button
              onClick={() => setActiveFilter('regular')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === 'regular'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Regular ({counts.regular})
            </button>
            <button
              onClick={() => setActiveFilter('inactive')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === 'inactive'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Inactive ({counts.inactive})
            </button>
          </div>

          {/* Right Controls: View toggles + Add Customer */}
          <div className="flex items-center gap-2">
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

            <button
              onClick={() => setAddCustomerOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-[#00C060] text-white text-xs font-bold hover:bg-[#00a854] shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Customer Table / List */}
        <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          {viewMode === 'table' ? (
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-white border-b border-gray-100 z-10 text-gray-400 font-bold">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <input type="checkbox" className="rounded accent-[#00C060]" />
                    </th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4 text-center">Total Orders</th>
                    <th className="py-3 px-4">Total Spent</th>
                    <th className="py-3 px-4">Last Visit</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCustomers.map((c) => {
                    const isSelected = selectedCustomer?.id === c.id;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedId(c.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#E7F9F0]/60 border-y border-[#00C060]/30'
                            : 'hover:bg-gray-50/70'
                        }`}
                      >
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded accent-[#00C060]" />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${c.avatarBg || 'bg-gray-100 text-gray-700'}`}
                            >
                              {c.avatarText || 'CU'}
                            </div>
                            <span className="font-bold text-gray-900 text-xs">{c.name}</span>
                            {getTierBadge(c.tier)}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-600">
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {c.phone}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-black text-gray-800 text-center">
                          {c.totalOrders}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-gray-900">
                          ₹{c.totalSpent.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-600">{c.lastVisit}</td>
                        <td className="py-3.5 px-4">
                          <span className="flex items-center gap-1.5 font-bold text-xs">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                c.status === 'active' ? 'bg-[#00C060]' : 'bg-gray-400'
                              }`}
                            />
                            <span className={c.status === 'active' ? 'text-gray-900' : 'text-gray-400'}>
                              {c.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCustomers.map((c) => {
                const isSelected = selectedCustomer?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white relative shadow-xs flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#00C060] ring-2 ring-[#00C060]/20'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${c.avatarBg || 'bg-gray-100'}`}
                          >
                            {c.avatarText || 'CU'}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-gray-900 leading-tight">{c.name}</h4>
                            <span className="text-[11px] text-gray-500 font-medium">{c.phone}</span>
                          </div>
                        </div>
                        {getTierBadge(c.tier)}
                      </div>

                      <div className="grid grid-cols-2 gap-2 my-2.5 p-2 rounded-lg bg-gray-50 text-xs">
                        <div>
                          <span className="text-gray-400 block text-[10px]">Total Orders</span>
                          <span className="font-bold text-gray-800">{c.totalOrders}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Total Spent</span>
                          <span className="font-bold text-gray-800">₹{c.totalSpent.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">{c.lastVisit}</span>
                      <span
                        className={`font-bold ${c.status === 'active' ? 'text-[#00C060]' : 'text-gray-400'}`}
                      >
                        ● {c.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Detail Sidebar */}
      <div className="w-[320px] xl:w-[350px] bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col p-4 shrink-0 h-full overflow-hidden">
        {selectedCustomer ? (
          <div className="flex flex-col h-full min-h-0">
            {/* Customer Profile Header */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-base shadow-xs ${selectedCustomer.avatarBg || 'bg-amber-100 text-amber-800'}`}
                >
                  {selectedCustomer.avatarText || 'AV'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-gray-900 leading-tight">
                      {selectedCustomer.name}
                    </h3>
                  </div>
                  <div className="mt-0.5">{getTierBadge(selectedCustomer.tier)}</div>
                  <p className="text-xs font-semibold text-gray-500 mt-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    {selectedCustomer.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setAddCustomerOpen(true)}
                  className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600"
                  title="Edit Customer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Stats Grid: 24 Orders, ₹12,480 Total Spent, 18 Visits, 820 Reward Points */}
            <div className="py-3 border-b border-gray-100 grid grid-cols-4 gap-2 text-center">
              <div className="bg-gray-50/80 rounded-xl p-2 border border-gray-100 flex flex-col items-center">
                <ShoppingBag className="w-3.5 h-3.5 text-[#00C060] mb-1" />
                <span className="text-xs font-black text-gray-900">{selectedCustomer.totalOrders}</span>
                <span className="text-[9px] text-gray-400 font-bold mt-0.5">Orders</span>
              </div>

              <div className="bg-gray-50/80 rounded-xl p-2 border border-gray-100 flex flex-col items-center">
                <IndianRupee className="w-3.5 h-3.5 text-[#00C060] mb-1" />
                <span className="text-xs font-black text-gray-900">₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}</span>
                <span className="text-[9px] text-gray-400 font-bold mt-0.5 truncate">Total Spent</span>
              </div>

              <div className="bg-gray-50/80 rounded-xl p-2 border border-gray-100 flex flex-col items-center">
                <Calendar className="w-3.5 h-3.5 text-[#00C060] mb-1" />
                <span className="text-xs font-black text-gray-900">{selectedCustomer.visits}</span>
                <span className="text-[9px] text-gray-400 font-bold mt-0.5">Visits</span>
              </div>

              <div className="bg-gray-50/80 rounded-xl p-2 border border-gray-100 flex flex-col items-center">
                <Gift className="w-3.5 h-3.5 text-[#00C060] mb-1" />
                <span className="text-xs font-black text-gray-900">{selectedCustomer.rewardPoints}</span>
                <span className="text-[9px] text-gray-400 font-bold mt-0.5 truncate">Reward Pts</span>
              </div>
            </div>

            {/* Sub-Tabs: Orders | Visits | Rewards */}
            <div className="flex items-center justify-between border-b border-gray-100 text-xs font-bold text-gray-500 pt-2 pb-1">
              <button
                onClick={() => setSidebarTab('orders')}
                className={`flex items-center gap-1.5 pb-2 transition-all relative ${
                  sidebarTab === 'orders'
                    ? 'text-[#00C060] font-black'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Orders</span>
                {sidebarTab === 'orders' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C060] rounded-full" />
                )}
              </button>

              <button
                onClick={() => setSidebarTab('visits')}
                className={`flex items-center gap-1.5 pb-2 transition-all relative ${
                  sidebarTab === 'visits'
                    ? 'text-[#00C060] font-black'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Visits</span>
                {sidebarTab === 'visits' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C060] rounded-full" />
                )}
              </button>

              <button
                onClick={() => setSidebarTab('rewards')}
                className={`flex items-center gap-1.5 pb-2 transition-all relative ${
                  sidebarTab === 'rewards'
                    ? 'text-[#00C060] font-black'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Rewards</span>
                {sidebarTab === 'rewards' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C060] rounded-full" />
                )}
              </button>
            </div>

            {/* Sub-Tab Content */}
            <div className="py-2.5 flex-1 min-h-0 overflow-y-auto space-y-2">
              {sidebarTab === 'orders' && (
                <>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="font-bold text-gray-900">Recent Orders</span>
                    <button className="text-[#00C060] font-bold text-[11px] hover:underline flex items-center gap-0.5">
                      View All →
                    </button>
                  </div>

                  <div className="space-y-2">
                    {selectedCustomer.recentOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-gray-50/80 border border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={ord.image}
                            alt="Order item"
                            className="w-10 h-10 rounded-lg object-cover bg-white p-0.5 border border-gray-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-gray-900 leading-tight">
                              {ord.title}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-semibold">{ord.type}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-gray-900">
                            ₹{ord.amount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-gray-400 block font-medium">
                            {ord.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {sidebarTab === 'visits' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800">Dine-in Visit</p>
                      <p className="text-[10px] text-gray-400 font-semibold">Table T-02 · 4 Guests</p>
                    </div>
                    <span className="font-black text-[#00C060]">Today, 2:35 PM</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800">Takeaway Pickup</p>
                      <p className="text-[10px] text-gray-400 font-semibold">Order #OD8405</p>
                    </div>
                    <span className="font-black text-gray-600">25 Oct, 8:20 PM</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800">Dine-in Visit</p>
                      <p className="text-[10px] text-gray-400 font-semibold">Table T-06 · 2 Guests</p>
                    </div>
                    <span className="font-black text-gray-600">20 Oct, 7:10 PM</span>
                  </div>
                </div>
              )}

              {sidebarTab === 'rewards' && (
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-amber-900 text-xs">Loyalty Balance</span>
                      <span className="text-base font-black text-amber-700">
                        {selectedCustomer.rewardPoints} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800/80 font-medium">
                      100 Points = ₹25 discount on next bill
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-500 font-semibold">+78 pts from #OD8421</span>
                      <span className="font-bold text-emerald-600">+78</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-500 font-semibold">+42 pts from #OD8405</span>
                      <span className="font-bold text-emerald-600">+42</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Row: View Full History | Add Note | Add Reward Points | Block Customer */}
            <div className="pt-2 border-t border-gray-100 space-y-2 mt-auto">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => alert(`Showing history for ${selectedCustomer.name}`)}
                  className="py-2.5 bg-[#00C060] text-white rounded-xl text-xs font-black hover:bg-[#00a854] shadow-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Full History
                </button>
                <button
                  onClick={() => setNoteOpen(true)}
                  className="py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 shadow-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                  Add Note
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAddPointsOpen(true)}
                  className="py-2 px-1 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Gift className="w-3.5 h-3.5 text-gray-400" />
                  Add Reward Points
                </button>
                <button
                  onClick={handleToggleBlock}
                  className={`py-2 px-1 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                    selectedCustomer.status === 'active'
                      ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  <Slash className="w-3.5 h-3.5" />
                  {selectedCustomer.status === 'active' ? 'Block Customer' : 'Unblock Customer'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
            <Users className="w-8 h-8 text-gray-300 mb-1" />
            <p className="text-xs font-bold text-gray-600">No customer selected</p>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {addCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#00C060]" />
                Add New Customer
              </h3>
              <button
                onClick={() => setAddCustomerOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Customer Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00C060]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. 98765 43210"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00C060]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Loyalty Tier</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { k: 'new', l: 'New' },
                    { k: 'regular', l: 'Regular' },
                    { k: 'loyal', l: 'Loyal' },
                  ].map((t) => (
                    <button
                      key={t.k}
                      type="button"
                      onClick={() => setNewTier(t.k as CustomerTier)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        newTier === t.k
                          ? 'bg-[#E7F9F0] border-[#00C060] text-[#00C060]'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setAddCustomerOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCustomer}
                className="px-5 py-2 rounded-xl text-xs font-black bg-[#00C060] text-white hover:bg-[#00a854] shadow-xs"
              >
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Reward Points Modal */}
      {addPointsOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#00C060]" />
              Add Reward Points
            </h3>
            <p className="text-xs text-gray-500">
              Credit reward points directly to {selectedCustomer?.name}'s account.
            </p>
            <div className="flex gap-2">
              {[50, 100, 200, 500].map((pts) => (
                <button
                  key={pts}
                  onClick={() => setPointsAmount(pts)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                    pointsAmount === pts
                      ? 'bg-[#00C060] text-white border-[#00C060]'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  +{pts}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAddPointsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRewardPoints}
                className="px-4 py-2 rounded-xl text-xs font-black bg-[#00C060] text-white hover:bg-[#00a854]"
              >
                Confirm +{pointsAmount} pts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {noteOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#00C060]" />
              Add Customer Note
            </h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Prefers window table, allergic to peanuts..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00C060] resize-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setNoteOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Note saved!');
                  setNoteOpen(false);
                  setNoteText('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-black bg-[#00C060] text-white hover:bg-[#00a854]"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
