import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Clock,
  Archive,
  FileText,
  Settings,
  ChevronLeft,
  Search,
  Plus,
  CheckCircle2,
  TrendingUp,
  Lock,
  Unlock,
  Printer,
  X,
  Banknote,
  MoreHorizontal,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

export interface CashTransaction {
  id: string; // TXN-801
  type: 'in' | 'out' | 'sale' | 'refund';
  amount: number;
  reason: string;
  staffName: string;
  time: string;
  status: 'verified' | 'pending';
  drawerBalanceAfter: number;
}

const INITIAL_TRANSACTIONS: CashTransaction[] = [
  {
    id: 'TXN-801',
    type: 'sale',
    amount: 1450,
    reason: 'Order #ORD-1024 Cash Payment',
    staffName: 'Rohit Sengar',
    time: '12:28 PM',
    status: 'verified',
    drawerBalanceAfter: 28430,
  },
  {
    id: 'TXN-800',
    type: 'in',
    amount: 2000,
    reason: 'Petty cash drawer float top-up',
    staffName: 'Rohit Sengar',
    time: '11:15 AM',
    status: 'verified',
    drawerBalanceAfter: 26980,
  },
  {
    id: 'TXN-799',
    type: 'out',
    amount: 350,
    reason: 'Vegetable supplier daily cash payout',
    staffName: 'Aman Verma',
    time: '10:45 AM',
    status: 'verified',
    drawerBalanceAfter: 24980,
  },
  {
    id: 'TXN-798',
    type: 'sale',
    amount: 890,
    reason: 'Order #ORD-1021 Dine In Cash',
    staffName: 'Priya Sharma',
    time: '10:10 AM',
    status: 'verified',
    drawerBalanceAfter: 25330,
  },
  {
    id: 'TXN-797',
    type: 'in',
    amount: 5000,
    reason: 'Opening Drawer Float (Morning Shift)',
    staffName: 'Rohit Sengar',
    time: '09:00 AM',
    status: 'verified',
    drawerBalanceAfter: 24440,
  },
];

export const CashDrawerPage: React.FC = () => {
  const navigate = useNavigate();

  const [subTab, setSubTab] = useState<'all' | 'in' | 'out' | 'sales'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerLocked, setIsDrawerLocked] = useState(false);

  // Modals
  const [showCashInOutModal, setShowCashInOutModal] = useState(false);
  const [cashType, setCashType] = useState<'in' | 'out'>('in');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [transactions, setTransactions] = useState<CashTransaction[]>(INITIAL_TRANSACTIONS);

  // Live Metrics
  const openingFloat = 5000;
  const cashSales = 23780;
  const totalCashIn = 2000;
  const totalCashOut = 350;
  const currentExpectedCash = openingFloat + cashSales + totalCashIn - totalCashOut; // ₹30,430.00

  // Filtered
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (subTab === 'in' && t.type !== 'in') return false;
      if (subTab === 'out' && t.type !== 'out') return false;
      if (subTab === 'sales' && t.type !== 'sale') return false;

      const q = searchQuery.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.reason.toLowerCase().includes(q) ||
        t.staffName.toLowerCase().includes(q)
      );
    });
  }, [transactions, subTab, searchQuery]);

  const handleRecordCash = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    const newTxn: CashTransaction = {
      id: `TXN-${802 + transactions.length}`,
      type: cashType,
      amount: val,
      reason: reason || (cashType === 'in' ? 'Manual Cash In' : 'Manual Cash Out'),
      staffName: 'Rohit Sengar',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'verified',
      drawerBalanceAfter: cashType === 'in' ? currentExpectedCash + val : currentExpectedCash - val,
    };

    setTransactions([newTxn, ...transactions]);
    setShowCashInOutModal(false);
    setAmount('');
    setReason('');
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
              onClick={() => navigate('/shifts')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all text-left"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="flex-1">Shift Management</span>
            </button>

            <button
              onClick={() => navigate('/staff')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all text-left"
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="flex-1">Staff & Roles</span>
            </button>

            <button
              onClick={() => navigate('/attendance')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all text-left"
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span className="flex-1">Attendance</span>
            </button>

            <button
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold bg-[#E7F9F0] text-[#00C060] shadow-2xs transition-all text-left"
            >
              <Archive className="w-4 h-4 shrink-0 text-[#00C060]" />
              <span className="flex-1">Cash Drawer</span>
            </button>

            <button
              onClick={() => navigate('/dayclose')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all text-left"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="flex-1">Day Close (Z-Report)</span>
            </button>

            <button
              onClick={() => navigate('/settings')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all text-left"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="flex-1">Settings</span>
            </button>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-[#F6FAF7] border border-[#E0F2E9] rounded-2xl p-3 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-100/70 text-[#00C060] flex items-center justify-center">
            <Archive className="w-6 h-6 text-[#00C060]" />
          </div>
          <h4 className="text-xs font-bold text-gray-900 leading-tight">Cash Drawer</h4>
          <p className="text-[10px] text-gray-500 mt-1 leading-normal">
            Real-time drawer balance, cash drop and payout logs.
          </p>
        </div>
      </div>

      {/* 2. CENTER CONTENT */}
      <div className="flex-1 flex flex-col overflow-y-auto px-5 py-4 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 shrink-0">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Cash Drawer</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live till balance, float audit, payouts and drawer cash security.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDrawerLocked(!isDrawerLocked)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isDrawerLocked
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-emerald-50 text-[#00C060] border-emerald-200'
              }`}
            >
              {isDrawerLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{isDrawerLocked ? 'Till Locked' : 'Till Active'}</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-4 gap-3 py-1 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#E7F9F0] text-[#00C060] flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">₹{currentExpectedCash.toLocaleString('en-IN')}.00</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Current Till Balance</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">₹{cashSales.toLocaleString('en-IN')}.00</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Today's Cash Sales</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">+₹{totalCashIn.toLocaleString('en-IN')}.00</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Total Cash In (Drops)</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">-₹{totalCashOut.toLocaleString('en-IN')}.00</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Total Cash Out (Payouts)</p>
            </div>
          </div>
        </div>

        {/* Sub Tabs + Search + Action */}
        <div className="mt-4 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSubTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                subTab === 'all'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              All Transactions ({transactions.length})
            </button>
            <button
              onClick={() => setSubTab('sales')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                subTab === 'sales'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              Cash Sales
            </button>
            <button
              onClick={() => setSubTab('in')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                subTab === 'in'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              Cash In
            </button>
            <button
              onClick={() => setSubTab('out')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                subTab === 'out'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              Cash Out
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#00C060] bg-white"
              />
            </div>

            <button
              onClick={() => {
                setCashType('in');
                setShowCashInOutModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00C060] hover:bg-[#00ab55] active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Cash</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="mt-3 bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="py-2.5 px-3.5">Txn ID</th>
                <th className="py-2.5 px-3.5">Type</th>
                <th className="py-2.5 px-3.5">Reason / Description</th>
                <th className="py-2.5 px-3.5">Amount</th>
                <th className="py-2.5 px-3.5">Balance After</th>
                <th className="py-2.5 px-3.5">Staff</th>
                <th className="py-2.5 px-3.5">Time</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-3.5 font-bold text-gray-900">{t.id}</td>
                  <td className="py-3 px-3.5">
                    {t.type === 'in' || t.type === 'sale' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E7F9F0] text-[#00A852]">
                        <ArrowDownLeft className="w-3 h-3" />
                        {t.type === 'sale' ? 'Sale' : 'Cash In'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600">
                        <ArrowUpRight className="w-3 h-3" />
                        Cash Out
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 font-medium text-gray-800">{t.reason}</td>
                  <td className="py-3 px-3.5 font-black text-gray-900">
                    {t.type === 'out' ? `-₹${t.amount.toLocaleString('en-IN')}` : `+₹${t.amount.toLocaleString('en-IN')}`}
                  </td>
                  <td className="py-3 px-3.5 font-bold text-gray-600">
                    ₹{t.drawerBalanceAfter.toLocaleString('en-IN')}.00
                  </td>
                  <td className="py-3 px-3.5 text-gray-600 font-medium">{t.staffName}</td>
                  <td className="py-3 px-3.5 text-gray-500">{t.time}</td>
                  <td className="py-3 px-3.5 text-right">
                    <button className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR: CASH AUDIT & DENOMINATIONS */}
      <div className="w-72 shrink-0 bg-white border-l border-gray-200/80 p-4 flex flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-1">Cash Breakdown</h3>
            <p className="text-[11px] text-gray-500 mb-3">Currency denominations present in drawer</p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-bold text-gray-700">₹500 × 50</span>
                <span className="font-extrabold text-gray-900">₹25,000.00</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-bold text-gray-700">₹200 × 20</span>
                <span className="font-extrabold text-gray-900">₹4,000.00</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-bold text-gray-700">₹100 × 12</span>
                <span className="font-extrabold text-gray-900">₹1,200.00</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-bold text-gray-700">₹50 × 4</span>
                <span className="font-extrabold text-gray-900">₹200.00</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-bold text-gray-700">Coins</span>
                <span className="font-extrabold text-gray-900">₹30.00</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E7F9F0] border border-[#DCFCE7]">
            <p className="text-xs font-bold text-gray-800">Counted Total</p>
            <p className="text-xl font-black text-[#00A852] mt-0.5">₹30,430.00</p>
            <p className="text-[10px] text-emerald-700 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-[#00C060]" />
              Exact Match with System
            </p>
          </div>

          <button
            onClick={() => alert('Electronic drawer pop pulse signal sent.')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 rounded-xl text-xs font-bold shadow-2xs transition-all"
          >
            <Unlock className="w-4 h-4 text-gray-500" />
            <span>Open Cash Drawer (Pop)</span>
          </button>
        </div>

        <button
          onClick={() => alert('Drawer balance audit report printed.')}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#00C060] hover:bg-[#00ab55] text-white rounded-xl text-xs font-bold shadow-xs transition-all mt-4"
        >
          <Printer className="w-4 h-4" />
          <span>Print Drawer Audit</span>
        </button>
      </div>

      {/* MODAL: RECORD CASH */}
      {showCashInOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Record Cash In / Cash Out</h3>
              <button
                onClick={() => setShowCashInOutModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCashType('in')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                    cashType === 'in' ? 'bg-[#00C060] text-white border-[#00C060]' : 'border-gray-200 text-gray-700'
                  }`}
                >
                  Cash In (Float / Top-up)
                </button>
                <button
                  type="button"
                  onClick={() => setCashType('out')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                    cashType === 'out' ? 'bg-rose-500 text-white border-rose-500' : 'border-gray-200 text-gray-700'
                  }`}
                >
                  Cash Out (Expense / Payout)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Reason</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Petty cash, ingredient purchase"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-3.5 bg-gray-50/70 border-t border-gray-100">
              <button
                onClick={() => setShowCashInOutModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordCash}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#00C060] text-white"
              >
                Confirm Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashDrawerPage;
