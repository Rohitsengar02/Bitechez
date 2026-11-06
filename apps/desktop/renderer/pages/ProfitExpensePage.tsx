import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2,
  Tag,
  DollarSign,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Percent,
  Plus,
  X,
} from 'lucide-react';

export interface ExpenseItem {
  id: string;
  category: string;
  amount: number;
  paidTo: string;
  date: string;
  paymentMode: string;
}

const INITIAL_EXPENSES: ExpenseItem[] = [
  { id: 'EXP-101', category: 'Raw Materials & Supplies', amount: 98500, paidTo: 'Various Vendors', date: '01 Nov 2026', paymentMode: 'Bank Transfer' },
  { id: 'EXP-102', category: 'Staff Salaries & Wages', amount: 65000, paidTo: 'Outlet Staff (18)', date: '31 Oct 2026', paymentMode: 'Direct Deposit' },
  { id: 'EXP-103', category: 'Kitchen LPG & Utilities', amount: 14200, paidTo: 'City Gas Corporation', date: '28 Oct 2026', paymentMode: 'UPI' },
  { id: 'EXP-104', category: 'Commercial Electricity Bill', amount: 18400, paidTo: 'State Electricity Board', date: '25 Oct 2026', paymentMode: 'Net Banking' },
  { id: 'EXP-105', category: 'Store Rent & Maintenance', amount: 45000, paidTo: 'Mall Property Management', date: '01 Nov 2026', paymentMode: 'Cheque' },
];

export const ProfitExpensePage: React.FC = () => {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // Modal form
  const [newCat, setNewCat] = useState('Raw Materials & Supplies');
  const [newAmount, setNewAmount] = useState('5000');
  const [newPaidTo, setNewPaidTo] = useState('Vendor');

  // Figures
  const totalRevenueMonth = 425600;
  const totalExpensesMonth = expenses.reduce((acc, e) => acc + e.amount, 0); // ~241,100
  const netProfitMonth = totalRevenueMonth - totalExpensesMonth; // ~184,500
  const netProfitMargin = Math.round((netProfitMonth / totalRevenueMonth) * 100); // ~43%

  const handleAddExpense = () => {
    const newExp: ExpenseItem = {
      id: `EXP-${101 + expenses.length}`,
      category: newCat,
      amount: parseFloat(newAmount) || 0,
      paidTo: newPaidTo,
      date: 'Today',
      paymentMode: 'Cash Drawer',
    };
    setExpenses([newExp, ...expenses]);
    setShowAddExpenseModal(false);
  };

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
              onClick={() => navigate('/reports/items')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all text-left"
            >
              <Tag className="w-4 h-4 shrink-0" />
              <span className="flex-1">Item Reports</span>
            </button>

            <button
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold bg-[#E7F9F0] text-[#00C060] shadow-2xs transition-all text-left"
            >
              <DollarSign className="w-4 h-4 shrink-0 text-[#00C060]" />
              <span className="flex-1">Profit & Expense</span>
            </button>
          </div>
        </div>

        <div className="bg-[#F6FAF7] border border-[#E0F2E9] rounded-2xl p-3 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-100/70 text-[#00C060] flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-[#00C060]" />
          </div>
          <h4 className="text-xs font-bold text-gray-900 leading-tight">P&L Overview</h4>
          <p className="text-[10px] text-gray-500 mt-1 leading-normal">
            Net restaurant margins, operating overheads & profit tracking.
          </p>
        </div>
      </div>

      {/* 2. CENTER CONTENT */}
      <div className="flex-1 flex flex-col overflow-y-auto px-5 py-4 min-w-0">
        <div className="flex items-center justify-between pb-3 shrink-0">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Profit & Loss (P&L) Statement</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Track overall profitability, gross receipts, kitchen overheads and operating expenses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#00C060] hover:bg-[#00ab55] active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Expense</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-4 gap-3 py-1 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#E7F9F0] text-[#00C060] flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">₹{totalRevenueMonth.toLocaleString('en-IN')}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Total Monthly Revenue</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">₹{totalExpensesMonth.toLocaleString('en-IN')}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Total Operating Expenses</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-black text-emerald-600 leading-none">₹{netProfitMonth.toLocaleString('en-IN')}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Net Operating Profit</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{netProfitMargin}%</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Net Margin Rate</p>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="mt-4 flex items-center justify-between pb-1 shrink-0">
          <h3 className="text-xs font-bold text-gray-800">Operating Expenses & Cost Ledger</h3>
          <span className="text-xs text-gray-500 font-medium">{expenses.length} Expense Records</span>
        </div>

        <div className="mt-2 bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="py-2.5 px-3.5">Log ID</th>
                <th className="py-2.5 px-3.5">Expense Category</th>
                <th className="py-2.5 px-3.5">Amount</th>
                <th className="py-2.5 px-3.5">Paid To</th>
                <th className="py-2.5 px-3.5">Payment Method</th>
                <th className="py-2.5 px-3.5 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-3.5 font-bold text-gray-900">{exp.id}</td>
                  <td className="py-3 px-3.5 font-bold text-gray-800">{exp.category}</td>
                  <td className="py-3 px-3.5 font-black text-rose-500">₹{exp.amount.toLocaleString('en-IN')}.00</td>
                  <td className="py-3 px-3.5 text-gray-700 font-medium">{exp.paidTo}</td>
                  <td className="py-3 px-3.5">
                    <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-gray-100 text-gray-700">
                      {exp.paymentMode}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-right text-gray-500">{exp.date}</td>
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
            <h3 className="text-sm font-extrabold text-gray-900 mb-1">Expense Distribution</h3>
            <p className="text-[11px] text-gray-500 mb-3">Cost breakdown as % of revenue</p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex justify-between">
                <span className="text-gray-600">Food Cost (COGS)</span>
                <span className="font-extrabold text-gray-900">23.1%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex justify-between">
                <span className="text-gray-600">Labor / Payroll</span>
                <span className="font-extrabold text-gray-900">15.2%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex justify-between">
                <span className="text-gray-600">Rent & Property</span>
                <span className="font-extrabold text-gray-900">10.5%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex justify-between">
                <span className="text-gray-600">Utilities & Gas</span>
                <span className="font-extrabold text-gray-900">7.6%</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
            <h4 className="text-xs font-bold text-[#00A852]">Healthy Prime Cost</h4>
            <p className="text-[11px] text-emerald-800 mt-1">
              Food + Labor is at 38.3% (ideal restaurant benchmark is &lt; 55%).
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddExpenseModal(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#00C060] hover:bg-[#00ab55] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Expense</span>
        </button>
      </div>

      {/* MODAL */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Record Operating Expense</h3>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Expense Category</label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                >
                  <option>Raw Materials & Supplies</option>
                  <option>Staff Salaries & Wages</option>
                  <option>Kitchen LPG & Utilities</option>
                  <option>Commercial Electricity Bill</option>
                  <option>Store Rent & Maintenance</option>
                  <option>Marketing & Social Ads</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Paid To / Recipient</label>
                <input
                  type="text"
                  value={newPaidTo}
                  onChange={(e) => setNewPaidTo(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-3.5 bg-gray-50/70 border-t border-gray-100">
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#00C060] text-white"
              >
                Log Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitExpensePage;
