import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2,
  Tag,
  DollarSign,
  ChevronLeft,
  Download,
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  Search,
  ArrowUpRight,
  Printer,
  ChevronDown,
} from 'lucide-react';

export interface SalesReportRow {
  id: string;
  date: string;
  totalOrders: number;
  grossSales: number;
  discount: number;
  tax: number;
  netRevenue: number;
  topItem: string;
}

const INITIAL_SALES_REPORTS: SalesReportRow[] = [
  { id: 'SR-01', date: '02 Nov 2026 (Today)', totalOrders: 86, grossSales: 28430, discount: 850, tax: 1379, netRevenue: 28959, topItem: 'Cheese Burger' },
  { id: 'SR-02', date: '01 Nov 2026', totalOrders: 112, grossSales: 38240, discount: 1200, tax: 1852, netRevenue: 38892, topItem: 'Butter Chicken' },
  { id: 'SR-03', date: '31 Oct 2026', totalOrders: 98, grossSales: 32150, discount: 950, tax: 1560, netRevenue: 32760, topItem: 'Garlic Naan' },
  { id: 'SR-04', date: '30 Oct 2026', totalOrders: 90, grossSales: 29800, discount: 800, tax: 1450, netRevenue: 30450, topItem: 'Paneer Tikka' },
  { id: 'SR-05', date: '29 Oct 2026', totalOrders: 104, grossSales: 35600, discount: 1100, tax: 1725, netRevenue: 36225, topItem: 'Chicken Biryani' },
  { id: 'SR-06', date: '28 Oct 2026', totalOrders: 78, grossSales: 24500, discount: 600, tax: 1195, netRevenue: 25095, topItem: 'Cold Coffee' },
  { id: 'SR-07', date: '27 Oct 2026', totalOrders: 82, grossSales: 26900, discount: 750, tax: 1307, netRevenue: 27457, topItem: 'Cheese Burger' },
];

export const SalesReportsPage: React.FC = () => {
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [searchQuery, setSearchQuery] = useState('');
  const [reports] = useState<SalesReportRow[]>(INITIAL_SALES_REPORTS);

  const totalRevenue = reports.reduce((acc, r) => acc + r.netRevenue, 0);
  const totalOrders = reports.reduce((acc, r) => acc + r.totalOrders, 0);
  const avgOrderValue = Math.round(totalRevenue / totalOrders);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const q = searchQuery.toLowerCase();
      return r.date.toLowerCase().includes(q) || r.topItem.toLowerCase().includes(q);
    });
  }, [reports, searchQuery]);

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
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold bg-[#E7F9F0] text-[#00C060] shadow-2xs transition-all text-left"
            >
              <BarChart2 className="w-4 h-4 shrink-0 text-[#00C060]" />
              <span className="flex-1">Sales Reports</span>
            </button>

            <button
              onClick={() => navigate('/reports/items')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all text-left"
            >
              <Tag className="w-4 h-4 shrink-0" />
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
            <BarChart2 className="w-6 h-6 text-[#00C060]" />
          </div>
          <h4 className="text-xs font-bold text-gray-900 leading-tight">Sales Analytics</h4>
          <p className="text-[10px] text-gray-500 mt-1 leading-normal">
            Track daily revenues, average bill sizes and sales patterns.
          </p>
        </div>
      </div>

      {/* 2. CENTER CONTENT */}
      <div className="flex-1 flex flex-col overflow-y-auto px-5 py-4 min-w-0">
        <div className="flex items-center justify-between pb-3 shrink-0">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Sales Reports & Trends</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Comprehensive breakdown of daily gross billings, taxes, discounts and net takings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-white border border-gray-200 hover:border-gray-300 px-3 pr-8 py-1.5 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#00C060]"
              >
                <option>Today</option>
                <option>Last 7 Days</option>
                <option>This Month</option>
                <option>Custom Range</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={() => alert('Exporting Sales Report PDF/Excel...')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00C060] hover:bg-[#00ab55] active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-4 gap-3 py-1 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#E7F9F0] text-[#00C060] flex items-center justify-center shrink-0">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">₹{totalRevenue.toLocaleString('en-IN')}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Total Net Revenue</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{totalOrders}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Total Orders Settled</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">₹{avgOrderValue}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Avg Order Value (AOV)</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">+14.2%</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Growth vs Prev Week</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 flex items-center justify-between gap-3 shrink-0">
          <p className="text-xs font-bold text-gray-700">Daily Sales Summary ({filtered.length} Days)</p>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search date or item..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#00C060] bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-3 bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="py-2.5 px-3.5">Date</th>
                <th className="py-2.5 px-3.5">Orders</th>
                <th className="py-2.5 px-3.5">Gross Sales</th>
                <th className="py-2.5 px-3.5">Discounts</th>
                <th className="py-2.5 px-3.5">Tax (GST)</th>
                <th className="py-2.5 px-3.5">Net Revenue</th>
                <th className="py-2.5 px-3.5 text-right">Top Seller</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-3.5 font-bold text-gray-900">{row.date}</td>
                  <td className="py-3 px-3.5 font-medium text-gray-600">{row.totalOrders}</td>
                  <td className="py-3 px-3.5 font-bold text-gray-800">₹{row.grossSales.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3.5 font-semibold text-rose-500">-₹{row.discount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3.5 font-medium text-gray-600">₹{row.tax.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3.5 font-black text-[#00A852]">₹{row.netRevenue.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3.5 text-right">
                    <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-[#E7F9F0] text-[#00A852]">
                      {row.topItem}
                    </span>
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
            <h3 className="text-sm font-extrabold text-gray-900 mb-1">Channel Breakdown</h3>
            <p className="text-[11px] text-gray-500 mb-3">Revenue share by dining channel</p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex justify-between">
                <span className="text-gray-600">Dine In (55%)</span>
                <span className="font-extrabold text-gray-900">₹1,20,940</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex justify-between">
                <span className="text-gray-600">Takeaway (25%)</span>
                <span className="font-extrabold text-gray-900">₹54,970</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex justify-between">
                <span className="text-gray-600">Delivery / Online (20%)</span>
                <span className="font-extrabold text-gray-900">₹43,978</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
            <h4 className="text-xs font-bold text-[#00A852]">Peak Billing Hours</h4>
            <p className="text-[11px] text-emerald-800 mt-1">
              Highest table turnover occurred between 8:00 PM – 10:00 PM.
            </p>
          </div>
        </div>

        <button
          onClick={() => alert('Printing sales report...')}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#00C060] hover:bg-[#00ab55] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print Weekly Report</span>
        </button>
      </div>
    </div>
  );
};

export default SalesReportsPage;
