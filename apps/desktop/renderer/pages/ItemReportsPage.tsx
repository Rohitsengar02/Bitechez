import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2,
  Tag,
  DollarSign,
  ChevronLeft,
  Search,
  Download,
  TrendingUp,
  Star,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export interface ItemPerformance {
  id: string;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  costPrice: number;
  marginPercent: number;
  trend: 'up' | 'down';
}

const ITEMS_DATA: ItemPerformance[] = [
  { id: 'ITM-01', name: 'Cheese Burger', category: 'Burgers', unitsSold: 420, revenue: 92400, costPrice: 90, marginPercent: 59, trend: 'up' },
  { id: 'ITM-02', name: 'Butter Chicken', category: 'Main Course', unitsSold: 310, revenue: 120900, costPrice: 160, marginPercent: 58, trend: 'up' },
  { id: 'ITM-03', name: 'Garlic Naan', category: 'Breads', unitsSold: 580, revenue: 46400, costPrice: 20, marginPercent: 75, trend: 'up' },
  { id: 'ITM-04', name: 'Chicken Biryani', category: 'Main Course', unitsSold: 290, revenue: 98600, costPrice: 140, marginPercent: 58, trend: 'up' },
  { id: 'ITM-05', name: 'Paneer Tikka', category: 'Starters', unitsSold: 180, revenue: 50400, costPrice: 110, marginPercent: 60, trend: 'down' },
  { id: 'ITM-06', name: 'Cold Coffee', category: 'Beverages', unitsSold: 240, revenue: 38400, costPrice: 40, marginPercent: 75, trend: 'up' },
  { id: 'ITM-07', name: 'Gulab Jamun', category: 'Desserts', unitsSold: 140, revenue: 16800, costPrice: 35, marginPercent: 70, trend: 'down' },
];

export const ItemReportsPage: React.FC = () => {
  const navigate = useNavigate();

  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [items] = useState<ItemPerformance[]>(ITEMS_DATA);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (categoryFilter !== 'All Categories' && item.category !== categoryFilter) return false;
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    });
  }, [items, categoryFilter, searchQuery]);

  return (
    <div className="flex-1 flex overflow-hidden bg-[#F6F8FA]">
      {/* 1. LEFT SIDEBAR */}
      <div className="w-56 shrink-0 bg-white border-r border-gray-200/80 flex flex-col justify-between p-3.5 select-none overflow-y-auto">
        <div>
          <button
            onClick={() => navigate('/tools')}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gray-100/80 transition-all mb-4"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
            <span>More Tools</span>
          </button>

          <div className="space-y-1">
            <button
              onClick={() => navigate('/reports/sales')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all text-left"
            >
              <BarChart2 className="w-4 h-4 shrink-0" />
              <span className="flex-1">Sales Reports</span>
            </button>

            <button
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold bg-[#E7F9F0] text-[#00C060] shadow-2xs transition-all text-left"
            >
              <Tag className="w-4 h-4 shrink-0 text-[#00C060]" />
              <span className="flex-1">Item Reports</span>
            </button>

            <button
              onClick={() => navigate('/reports/profit')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all text-left"
            >
              <DollarSign className="w-4 h-4 shrink-0" />
              <span className="flex-1">Profit & Expense</span>
            </button>
          </div>
        </div>

        <div className="bg-[#F6FAF7] border border-[#E0F2E9] rounded-2xl p-3 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-100/70 text-[#00C060] flex items-center justify-center">
            <Tag className="w-6 h-6 text-[#00C060]" />
          </div>
          <h4 className="text-xs font-bold text-gray-900 leading-tight">Menu Matrix</h4>
          <p className="text-[10px] text-gray-500 mt-1 leading-normal">
            Analyze bestseller dishes, margins & low movement items.
          </p>
        </div>
      </div>

      {/* 2. CENTER CONTENT */}
      <div className="flex-1 flex flex-col overflow-y-auto px-5 py-4 min-w-0">
        <div className="flex items-center justify-between pb-3 shrink-0">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Item Sales & Profitability</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Rank food & drink items by volume sold, gross margin contribution and popularity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Exporting Item Performance Report...')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00C060] hover:bg-[#00ab55] active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-4 gap-3 py-1 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#E7F9F0] text-[#00C060] flex items-center justify-center shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">Garlic Naan</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">#1 Volume Seller (580 pcs)</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">Butter Chicken</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Highest Revenue (₹1.20L)</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">64.5%</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Average Food Margin</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">2,160</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Total Plates Served</p>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-4 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 hover:border-gray-300 px-3 pr-8 py-1.5 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#00C060]"
            >
              <option>All Categories</option>
              <option>Burgers</option>
              <option>Main Course</option>
              <option>Breads</option>
              <option>Starters</option>
              <option>Beverages</option>
              <option>Desserts</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes or categories..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#00C060] bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-3 bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="py-2.5 px-3.5">Item Name</th>
                <th className="py-2.5 px-3.5">Category</th>
                <th className="py-2.5 px-3.5">Plates Sold</th>
                <th className="py-2.5 px-3.5">Revenue Generated</th>
                <th className="py-2.5 px-3.5">Food Cost</th>
                <th className="py-2.5 px-3.5">Gross Margin</th>
                <th className="py-2.5 px-3.5 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-3.5 font-bold text-gray-900">{item.name}</td>
                  <td className="py-3 px-3.5">
                    <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-gray-100 text-gray-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-extrabold text-gray-900">{item.unitsSold} pcs</td>
                  <td className="py-3 px-3.5 font-black text-gray-900">₹{item.revenue.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3.5 text-gray-600 font-medium">₹{item.costPrice}</td>
                  <td className="py-3 px-3.5 font-bold text-[#00A852]">{item.marginPercent}%</td>
                  <td className="py-3 px-3.5 text-right">
                    {item.trend === 'up' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        Rising
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-500 font-bold">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        Slow
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR */}
      <div className="w-72 shrink-0 bg-white border-l border-gray-200/80 p-4 flex flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-1">Menu Engineering</h3>
            <p className="text-[11px] text-gray-500 mb-3">Item profitability quadrant</p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="font-extrabold text-emerald-800 block">Stars (High Vol / High Margin)</span>
                <span className="text-[11px] text-emerald-700 mt-0.5 block">Cheese Burger, Garlic Naan</span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                <span className="font-extrabold text-blue-800 block">Plowhorses (High Vol / Low Margin)</span>
                <span className="text-[11px] text-blue-700 mt-0.5 block">Chicken Biryani, Butter Chicken</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                <span className="font-extrabold text-amber-800 block">Puzzles (Low Vol / High Margin)</span>
                <span className="text-[11px] text-amber-700 mt-0.5 block">Paneer Tikka, Cold Coffee</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/menu')}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#00C060] hover:bg-[#00ab55] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
        >
          <span>Modify Menu Pricing</span>
        </button>
      </div>
    </div>
  );
};

export default ItemReportsPage;

