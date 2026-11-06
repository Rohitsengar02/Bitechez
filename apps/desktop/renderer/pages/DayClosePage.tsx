import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Clock,
  Archive,
  FileText,
  Settings,
  ChevronLeft,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Download,
  IndianRupee,
  ShoppingBag,
  CreditCard,
  QrCode,
  Banknote,
  Percent,
  TrendingUp,
  FileCheck,
} from 'lucide-react';

export const DayClosePage: React.FC = () => {
  const navigate = useNavigate();

  const [isClosingDay, setIsClosingDay] = useState(false);
  const [dayClosedStatus, setDayClosedStatus] = useState(false);

  // Financial figures for Day Close (Z-Report)
  const reportDate = '02 Nov 2026';
  const grossSales = 28430;
  const discounts = 850;
  const netSales = grossSales - discounts; // 27,580
  const taxCollected = 1379; // 5% GST
  const serviceCharge = 1100;
  const totalRevenue = netSales + taxCollected + serviceCharge; // 30,059

  // Payment Breakdown
  const paymentMethods = [
    { name: 'UPI & QR Codes', amount: 16500, orders: 48, icon: QrCode, color: 'text-purple-600 bg-purple-50' },
    { name: 'Cash in Drawer', amount: 9800, orders: 26, icon: Banknote, color: 'text-emerald-600 bg-emerald-50' },
    { name: 'Credit / Debit Cards', amount: 3759, orders: 12, icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
  ];

  const handleGenerateZReport = () => {
    setIsClosingDay(true);
    setTimeout(() => {
      setIsClosingDay(false);
      setDayClosedStatus(true);
      alert('Z-Report generated & Shift Day Closed successfully!');
    }, 1000);
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
              onClick={() => navigate('/cashdrawer')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all text-left"
            >
              <Archive className="w-4 h-4 shrink-0" />
              <span className="flex-1">Cash Drawer</span>
            </button>

            <button
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold bg-[#E7F9F0] text-[#00C060] shadow-2xs transition-all text-left"
            >
              <FileText className="w-4 h-4 shrink-0 text-[#00C060]" />
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
            <FileText className="w-6 h-6 text-[#00C060]" />
          </div>
          <h4 className="text-xs font-bold text-gray-900 leading-tight">Z-Report Day Close</h4>
          <p className="text-[10px] text-gray-500 mt-1 leading-normal">
            End of day financial settlement, tax audit & accounting summary.
          </p>
        </div>
      </div>

      {/* 2. CENTER CONTENT */}
      <div className="flex-1 flex flex-col overflow-y-auto px-5 py-4 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 shrink-0">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Day Close (Z-Report)</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Comprehensive end-of-day sales, taxes, payments and cash drawer settlement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Printing official Z-Report summary ticket...')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl text-xs font-bold shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              <span>Print Z-Report</span>
            </button>
            <button
              onClick={() => alert('Exporting Z-Report CSV / PDF...')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl text-xs font-bold shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Status Alert Banner */}
        <div className="mb-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00C060] text-white flex items-center justify-center shadow-xs">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900">
                {dayClosedStatus ? 'Day Closed • Z-Report #Z-20261102 Generated' : 'Z-Report Ready to Finalize for ' + reportDate}
              </h3>
              <p className="text-[11px] text-gray-600">
                86 orders completed across 3 shifts with zero drawer discrepancy.
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateZReport}
            disabled={isClosingDay}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#00C060] hover:bg-[#00ab55] text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{dayClosedStatus ? 'Re-Print Day Close' : 'Execute Day Close'}</span>
          </button>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-4 gap-3 py-1 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#E7F9F0] text-[#00C060] flex items-center justify-center shrink-0">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">₹{totalRevenue.toLocaleString('en-IN')}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Total Revenue</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">86</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Total Orders</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">₹{taxCollected.toLocaleString('en-IN')}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">GST Tax Collected</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">₹349.50</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Avg Order Value</p>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Panels */}
        <div className="mt-3 grid grid-cols-2 gap-3 flex-1 min-h-0">
          {/* Sales & Revenue Accounting Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 mb-1">Financial Reconciliation</h3>
              <p className="text-[11px] text-gray-500 mb-3">Gross sales, tax liability and net takings</p>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Gross Food & Beverage Sales</span>
                  <span className="font-bold text-gray-900">₹{grossSales.toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Discounts & Promos Given</span>
                  <span className="font-bold text-rose-500">-₹{discounts.toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="font-semibold text-gray-800">Net Sales</span>
                  <span className="font-bold text-gray-900">₹{netSales.toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Output CGST (2.5%)</span>
                  <span className="font-bold text-gray-900">₹{(taxCollected / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Output SGST (2.5%)</span>
                  <span className="font-bold text-gray-900">₹{(taxCollected / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Service Charges (10%)</span>
                  <span className="font-bold text-gray-900">₹{serviceCharge.toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-black text-gray-900 text-sm">Total Day Settlement</span>
                  <span className="font-black text-[#00A852] text-sm">₹{totalRevenue.toLocaleString('en-IN')}.00</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-[11px] text-gray-500 mt-3">
              Tax invoice sequence from INV-1001 to INV-1086 accounted for.
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 mb-1">Tender Types Breakdown</h3>
              <p className="text-[11px] text-gray-500 mb-3">Settlements received per payment method</p>

              <div className="space-y-3">
                {paymentMethods.map((pm) => {
                  const Icon = pm.icon;
                  const pct = Math.round((pm.amount / totalRevenue) * 100);
                  return (
                    <div key={pm.name} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg ${pm.color} flex items-center justify-center`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{pm.name}</p>
                            <p className="text-[10px] text-gray-400">{pm.orders} Orders ({pct}%)</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-gray-900">
                          ₹{pm.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#00C060] h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-xs font-bold text-[#00A852] mt-3">
              <CheckCircle2 className="w-4 h-4 text-[#00C060]" />
              <span>All 3 shift cash drawers balanced and matched.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR: AUDIT & CONFIRMATION */}
      <div className="w-72 shrink-0 bg-white border-l border-gray-200/80 p-4 flex flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-1">Z-Report Checkpoints</h3>
            <p className="text-[11px] text-gray-500 mb-3">Pre-closing verification requirements</p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#00C060] shrink-0" />
                <span>All Kitchen KOTs Completed</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#00C060] shrink-0" />
                <span>All Open Tables Settled</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#00C060] shrink-0" />
                <span>Staff Cash Drawer Reconciled</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#00C060] shrink-0" />
                <span>GST Tax Ledger Verified</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Important Note</span>
            </div>
            <p className="text-[11px] text-amber-700 mt-1 leading-normal">
              Performing Day Close locks all transactions for {reportDate} and resets daily sequence counters for tomorrow.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateZReport}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#00C060] hover:bg-[#00ab55] active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Finalize & Close Day</span>
        </button>
      </div>
    </div>
  );
};

export default DayClosePage;

