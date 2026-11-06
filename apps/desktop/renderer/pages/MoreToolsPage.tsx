import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Search,
  ConciergeBell,
  Calendar,
  Users,
  Clock,
  Archive,
  FileText,
  Package,
  ShoppingCart,
  TrendingUp,
  BarChart2,
  Tag,
  DollarSign,
  Percent,
  Crown,
  Store,
  Receipt,
  CreditCard,
  Share2,
  Database,
  ArrowRight,
  ChevronRight,
  Download,
  Upload,
  RefreshCw,
  Info,
  Wrench,
} from 'lucide-react';

export type ToolCategory = 'all' | 'operations' | 'inventory' | 'reports' | 'marketing' | 'settings' | 'integrations';

export interface ToolItem {
  id: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  to?: string;
  category: ToolCategory;
}

const ALL_TOOLS: ToolItem[] = [
  // Operations (5)
  {
    id: 'shift_mgmt',
    title: 'Shift Management',
    desc: 'Open, close and manage staff shifts',
    icon: Calendar,
    category: 'operations',
    to: '/shifts',
  },
  {
    id: 'staff_roles',
    title: 'Staff & Roles',
    desc: 'Add staff, roles & permissions',
    icon: Users,
    category: 'operations',
    to: '/staff',
  },
  {
    id: 'attendance',
    title: 'Attendance',
    desc: 'Track staff attendance and working hours',
    icon: Clock,
    category: 'operations',
    to: '/attendance',
  },
  {
    id: 'cash_drawer',
    title: 'Cash Drawer',
    desc: 'Manage cash in/out and shift cash',
    icon: Archive,
    category: 'operations',
    to: '/cashdrawer',
  },
  {
    id: 'day_close',
    title: 'Day Close (Z-Report)',
    desc: 'Close the day, summary & sales report',
    icon: FileText,
    category: 'operations',
    to: '/dayclose',
  },

  // Inventory (3)
  {
    id: 'stock_mgmt',
    title: 'Stock Management',
    desc: 'Track stock in real-time and get low stock alerts',
    icon: Package,
    category: 'inventory',
    to: '/inventory/stock',
  },
  {
    id: 'purchase_suppliers',
    title: 'Purchase & Suppliers',
    desc: 'Create purchase, manage suppliers & bills',
    icon: ShoppingCart,
    category: 'inventory',
    to: '/inventory/purchase',
  },
  {
    id: 'stock_adjustment',
    title: 'Stock Adjustment',
    desc: 'Add, reduce or correct stock records',
    icon: TrendingUp,
    category: 'inventory',
    to: '/inventory/adjustments',
  },

  // Reports & Analytics (3)
  {
    id: 'sales_reports',
    title: 'Sales Reports',
    desc: 'Daily, weekly & monthly sales insights',
    icon: BarChart2,
    category: 'reports',
    to: '/reports/sales',
  },
  {
    id: 'item_reports',
    title: 'Item Reports',
    desc: 'Best & low selling items',
    icon: Tag,
    category: 'reports',
    to: '/reports/items',
  },
  {
    id: 'profit_expense',
    title: 'Profit & Expense',
    desc: 'Track profit, expense and overall P&L',
    icon: DollarSign,
    category: 'reports',
    to: '/reports/profit',
  },

  // Marketing & Growth (2)
  {
    id: 'offers_discounts',
    title: 'Offers & Discounts',
    desc: 'Create offers, coupons & combo deals',
    icon: Percent,
    category: 'marketing',
    to: '/marketing/offers',
  },
  {
    id: 'loyalty_rewards',
    title: 'Loyalty & Rewards',
    desc: 'Manage reward points, loyalty tiers & redemptions',
    icon: Crown,
    category: 'marketing',
    to: '/marketing/loyalty',
  },

  // Settings & Integrations (5)
  {
    id: 'outlet_settings',
    title: 'Outlet Settings',
    desc: 'Manage outlet info, taxes & billing',
    icon: Store,
    category: 'settings',
    to: '/settings',
  },
  {
    id: 'taxes_compliance',
    title: 'Taxes & Compliance',
    desc: 'Configure GST, service charge & more',
    icon: Receipt,
    category: 'settings',
    to: '/settings',
  },
  {
    id: 'payment_methods',
    title: 'Payment Methods',
    desc: 'UPI, Card, Wallet & other payments',
    icon: CreditCard,
    category: 'settings',
    to: '/settings',
  },
  {
    id: 'integrations',
    title: 'Integrations',
    desc: 'Connect WhatsApp, SMS, Accounting, etc.',
    icon: Share2,
    category: 'integrations',
    to: '/integrations',
  },
  {
    id: 'data_backup',
    title: 'Data & Backup',
    desc: 'Export data, auto backup & restore',
    icon: Database,
    category: 'settings',
    to: '/dayclose',
  },
];

export const MoreToolsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Counts for left sidebar
  const counts = useMemo(() => {
    return {
      all: ALL_TOOLS.length,
      operations: ALL_TOOLS.filter((t) => t.category === 'operations').length,
      inventory: ALL_TOOLS.filter((t) => t.category === 'inventory').length,
      reports: ALL_TOOLS.filter((t) => t.category === 'reports').length,
      marketing: ALL_TOOLS.filter((t) => t.category === 'marketing').length,
      settings: ALL_TOOLS.filter((t) => t.category === 'settings').length,
      integrations: ALL_TOOLS.filter((t) => t.category === 'integrations').length,
    };
  }, []);

  // Filter tools based on search and activeCategory
  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter((t) => {
      if (activeCategory !== 'all' && t.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q);
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  // Section Groups
  const operationsTools = useMemo(() => filteredTools.filter((t) => t.category === 'operations'), [filteredTools]);
  const inventoryTools = useMemo(() => filteredTools.filter((t) => t.category === 'inventory'), [filteredTools]);
  const reportsTools = useMemo(() => filteredTools.filter((t) => t.category === 'reports'), [filteredTools]);
  const marketingTools = useMemo(() => filteredTools.filter((t) => t.category === 'marketing'), [filteredTools]);
  const settingsTools = useMemo(
    () => filteredTools.filter((t) => t.category === 'settings' || t.category === 'integrations'),
    [filteredTools]
  );

  const handleToolClick = (tool: ToolItem) => {
    if (tool.to) {
      navigate(tool.to);
    } else {
      alert(`Opening ${tool.title}...`);
    }
  };

  const handleBackup = () => {
    alert('Creating database backup... Backup successfully saved to /backup/2026-11-06.db');
  };

  const handleResetPos = () => {
    if (confirm('Are you sure you want to reset POS cache and refresh device memory?')) {
      window.location.reload();
    }
  };

  return (
    <div className="flex gap-4 font-sans text-[#191923] select-none pb-2 h-full overflow-hidden">
      {/* Left Sidebar: Categories Navigation + Mascot Box */}
      <div className="w-[180px] xl:w-[200px] bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col p-3 shrink-0 h-full overflow-hidden">
        <div className="space-y-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
              activeCategory === 'all'
                ? 'bg-[#E7F9F0] text-[#00C060] font-black'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              <span>All Tools</span>
            </div>
            <span className={`text-[11px] ${activeCategory === 'all' ? 'text-[#00C060]' : 'text-gray-400'}`}>
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('operations')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
              activeCategory === 'operations'
                ? 'bg-[#E7F9F0] text-[#00C060] font-black'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <ConciergeBell className="w-4 h-4 text-gray-400" />
              <span>Operations</span>
            </div>
            <span className={`text-[11px] ${activeCategory === 'operations' ? 'text-[#00C060]' : 'text-gray-400'}`}>
              ({counts.operations})
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('inventory')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
              activeCategory === 'inventory'
                ? 'bg-[#E7F9F0] text-[#00C060] font-black'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <span>Inventory</span>
            </div>
            <span className={`text-[11px] ${activeCategory === 'inventory' ? 'text-[#00C060]' : 'text-gray-400'}`}>
              ({counts.inventory})
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('reports')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
              activeCategory === 'reports'
                ? 'bg-[#E7F9F0] text-[#00C060] font-black'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-gray-400" />
              <span>Reports</span>
            </div>
            <span className={`text-[11px] ${activeCategory === 'reports' ? 'text-[#00C060]' : 'text-gray-400'}`}>
              ({counts.reports})
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('marketing')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
              activeCategory === 'marketing'
                ? 'bg-[#E7F9F0] text-[#00C060] font-black'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-gray-400" />
              <span>Marketing</span>
            </div>
            <span className={`text-[11px] ${activeCategory === 'marketing' ? 'text-[#00C060]' : 'text-gray-400'}`}>
              ({counts.marketing})
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('settings')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
              activeCategory === 'settings'
                ? 'bg-[#E7F9F0] text-[#00C060] font-black'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-gray-400" />
              <span>Settings</span>
            </div>
            <span className={`text-[11px] ${activeCategory === 'settings' ? 'text-[#00C060]' : 'text-gray-400'}`}>
              ({counts.settings})
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('integrations')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
              activeCategory === 'integrations'
                ? 'bg-[#E7F9F0] text-[#00C060] font-black'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-gray-400" />
              <span>Integrations</span>
            </div>
            <span className={`text-[11px] ${activeCategory === 'integrations' ? 'text-[#00C060]' : 'text-gray-400'}`}>
              ({counts.integrations})
            </span>
          </button>
        </div>

        {/* Mascot Bottom Card */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col items-center text-center p-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00C060] flex items-center justify-center mb-2 shadow-xs">
            <Wrench className="w-6 h-6" />
          </div>
          <h4 className="text-xs font-black text-gray-900 leading-tight">More Tools</h4>
          <p className="text-[10px] text-gray-400 font-medium mt-1 leading-normal">
            Powerful utilities to manage your restaurant business from one place.
          </p>
        </div>
      </div>

      {/* Center Main Section: Header Title & Search + Tool Section Cards */}
      <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col p-4 h-full overflow-hidden">
        {/* Top Header: Title & Subtitle + Search Bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 gap-3 flex-wrap shrink-0">
          <div>
            <h1 className="text-base font-black text-gray-900 leading-tight">More Tools</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Advanced tools to run and grow your restaurant smoothly.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#00C060] bg-gray-50/60"
            />
          </div>
        </div>

        {/* Tools Scrollable Container */}
        <div className="flex-1 overflow-y-auto pt-3 space-y-5">
          {/* Section 1: Operations */}
          {operationsTools.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#00C060] flex items-center justify-center">
                    <Store className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-black text-gray-900">Operations</h3>
                </div>
                <span className="text-[11px] font-bold text-gray-400">
                  {operationsTools.length} Tools
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {operationsTools.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToolClick(t)}
                    className="p-3.5 rounded-xl border border-gray-100 hover:border-emerald-200 bg-gray-50/50 hover:bg-emerald-50/20 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group min-h-[110px]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#00C060] flex items-center justify-center">
                          <t.icon className="w-4 h-4" />
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#00C060] transition-colors" />
                      </div>
                      <h4 className="text-xs font-black text-gray-900 leading-tight mb-1">
                        {t.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-medium leading-normal">
                        {t.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Inventory */}
          {inventoryTools.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#00C060] flex items-center justify-center">
                    <Package className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-black text-gray-900">Inventory</h3>
                </div>
                <span className="text-[11px] font-bold text-gray-400">
                  {inventoryTools.length} Tools
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
                {inventoryTools.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToolClick(t)}
                    className="p-3.5 rounded-xl border border-gray-100 hover:border-emerald-200 bg-gray-50/50 hover:bg-emerald-50/20 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group min-h-[110px]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#00C060] flex items-center justify-center">
                          <t.icon className="w-4 h-4" />
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#00C060] transition-colors" />
                      </div>
                      <h4 className="text-xs font-black text-gray-900 leading-tight mb-1">
                        {t.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-medium leading-normal">
                        {t.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Reports & Analytics */}
          {reportsTools.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#00C060] flex items-center justify-center">
                    <BarChart2 className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-black text-gray-900">Reports & Analytics</h3>
                </div>
                <span className="text-[11px] font-bold text-gray-400">
                  {reportsTools.length} Tools
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
                {reportsTools.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToolClick(t)}
                    className="p-3.5 rounded-xl border border-gray-100 hover:border-emerald-200 bg-gray-50/50 hover:bg-emerald-50/20 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group min-h-[110px]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#00C060] flex items-center justify-center">
                          <t.icon className="w-4 h-4" />
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#00C060] transition-colors" />
                      </div>
                      <h4 className="text-xs font-black text-gray-900 leading-tight mb-1">
                        {t.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-medium leading-normal">
                        {t.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Marketing & Growth */}
          {marketingTools.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#00C060] flex items-center justify-center">
                    <Percent className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-black text-gray-900">Marketing & Growth</h3>
                </div>
                <span className="text-[11px] font-bold text-gray-400">
                  {marketingTools.length} Tools
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {marketingTools.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToolClick(t)}
                    className="p-3.5 rounded-xl border border-gray-100 hover:border-emerald-200 bg-gray-50/50 hover:bg-emerald-50/20 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group min-h-[110px]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#00C060] flex items-center justify-center">
                          <t.icon className="w-4 h-4" />
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#00C060] transition-colors" />
                      </div>
                      <h4 className="text-xs font-black text-gray-900 leading-tight mb-1">
                        {t.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-medium leading-normal">
                        {t.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Settings & Integrations */}
          {settingsTools.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#00C060] flex items-center justify-center">
                    <Store className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-black text-gray-900">Settings & Integrations</h3>
                </div>
                <span className="text-[11px] font-bold text-gray-400">
                  {settingsTools.length} Tools
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {settingsTools.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToolClick(t)}
                    className="p-3.5 rounded-xl border border-gray-100 hover:border-emerald-200 bg-gray-50/50 hover:bg-emerald-50/20 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group min-h-[110px]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#00C060] flex items-center justify-center">
                          <t.icon className="w-4 h-4" />
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#00C060] transition-colors" />
                      </div>
                      <h4 className="text-xs font-black text-gray-900 leading-tight mb-1">
                        {t.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-medium leading-normal">
                        {t.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar: Quick Actions & System Info */}
      <div className="w-[240px] xl:w-[260px] flex flex-col gap-3.5 shrink-0 h-full overflow-hidden">
        {/* Quick Actions Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-md bg-emerald-50 text-[#00C060] flex items-center justify-center">
              <span className="text-xs font-black">⚡</span>
            </div>
            <h3 className="text-xs font-black text-gray-900">Quick Actions</h3>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={handleBackup}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-800 transition-all text-left"
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#00C060]" />
                <span>Create Backup</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button
              onClick={() => alert('Import Data wizard')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-800 transition-all text-left"
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Import Data</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button
              onClick={() => alert('Exporting all sales & inventory reports...')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-800 transition-all text-left"
            >
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Export Reports</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button
              onClick={handleResetPos}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-800 transition-all text-left"
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#00C060]" />
                <span>Reset POS</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* System Info Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex-1 overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-md bg-emerald-50 text-[#00C060] flex items-center justify-center">
              <Info className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-black text-gray-900">System Info</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-gray-500 font-semibold">POS Version</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                v2.4.0
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-gray-500 font-semibold">Last Backup</span>
              <span className="text-gray-900 font-bold">Today, 10:24 AM</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-gray-500 font-semibold">Database Size</span>
              <span className="text-gray-900 font-bold">256 MB</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-semibold">Active Users</span>
              <span className="text-gray-900 font-bold">6</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreToolsPage;
