import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Clock,
  Archive,
  FileText,
  Settings,
  ChevronDown,
  ChevronLeft,
  Zap,
  Flag,
  Receipt,
  Printer,
  TrendingUp,
  MoreHorizontal,
  Plus,
  CheckCircle2,
  User,
  Building2,
  X,
} from 'lucide-react';

export type ShiftNavTab =
  | 'shift_management'
  | 'staff_roles'
  | 'attendance'
  | 'cash_drawer'
  | 'day_close'
  | 'settings';

export interface ShiftRecord {
  id: string; // e.g. S-1024
  staffName: string;
  staffAvatar: string;
  staffRole?: string;
  shiftTime: string; // e.g. 10:00 AM - Ongoing
  duration: string; // e.g. 08h 32m
  totalSales: number; // e.g. 28430
  cashInOut: number; // positive or negative (+2,000.00)
  status: 'active' | 'closed';
  ordersCount: number;
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  closingCash?: number;
}

const INITIAL_SHIFTS: ShiftRecord[] = [
  {
    id: 'S-1024',
    staffName: 'Rohit Sengar',
    staffAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
    staffRole: 'Store Manager',
    shiftTime: '10:00 AM - Ongoing',
    duration: '08h 32m',
    totalSales: 28430,
    cashInOut: 2000,
    status: 'active',
    ordersCount: 86,
    openedAt: '10:00 AM',
    openingCash: 5000,
  },
  {
    id: 'S-1023',
    staffName: 'Priya Sharma',
    staffAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
    staffRole: 'Cashier',
    shiftTime: '02:00 PM - 10:00 PM',
    duration: '08h 00m',
    totalSales: 21860,
    cashInOut: 1000,
    status: 'closed',
    ordersCount: 64,
    openedAt: '02:00 PM',
    closedAt: '10:00 PM',
    openingCash: 5000,
    closingCash: 27860,
  },
  {
    id: 'S-1022',
    staffName: 'Aman Verma',
    staffAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80',
    staffRole: 'Cashier',
    shiftTime: '06:00 AM - 02:00 PM',
    duration: '08h 00m',
    totalSales: 18240,
    cashInOut: 500,
    status: 'closed',
    ordersCount: 52,
    openedAt: '06:00 AM',
    closedAt: '02:00 PM',
    openingCash: 5000,
    closingCash: 23740,
  },
];

export const ShiftManagementPage: React.FC = () => {
  const navigate = useNavigate();

  // Navigation Sidebar Tab
  const [activeTab, setActiveTab] = useState<ShiftNavTab>('shift_management');

  // Sub tab: Shift History, Shift Report, Cash Summary
  const [subTab, setSubTab] = useState<'history' | 'report' | 'cash'>('history');

  // Filter dropdowns
  const [staffFilter, setStaffFilter] = useState('All Staff');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Shifts list & active shift state
  const [shifts, setShifts] = useState<ShiftRecord[]>(INITIAL_SHIFTS);
  const [selectedShift, setSelectedShift] = useState<ShiftRecord>(INITIAL_SHIFTS[0]);

  // Modals for actions
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashActionType, setCashActionType] = useState<'in' | 'out'>('in');
  const [cashAmount, setCashAmount] = useState('');
  const [cashReason, setCashReason] = useState('');
  const [newShiftStaff, setNewShiftStaff] = useState('Rohit Sengar');
  const [newShiftOpeningCash, setNewShiftOpeningCash] = useState('5000');

  // Filtered shifts
  const filteredShifts = shifts.filter((s) => {
    if (staffFilter !== 'All Staff' && s.staffName !== staffFilter) return false;
    if (statusFilter !== 'All Status') {
      if (statusFilter === 'Active' && s.status !== 'active') return false;
      if (statusFilter === 'Closed' && s.status !== 'closed') return false;
    }
    return true;
  });

  // Summary Metrics
  const activeShift = shifts.find((s) => s.status === 'active') || shifts[0];
  const totalShiftsCount = shifts.length;
  const activeShiftsCount = shifts.filter((s) => s.status === 'active').length;
  const closedShiftsCount = shifts.filter((s) => s.status === 'closed').length;
  const staffOnDutyCount = 6;

  // Handlers
  const handleOpenShift = () => {
    if (!newShiftStaff) return;
    const newRecord: ShiftRecord = {
      id: `S-${1025 + shifts.length}`,
      staffName: newShiftStaff,
      staffAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
      staffRole: 'Cashier',
      shiftTime: 'Just Now - Ongoing',
      duration: '00h 01m',
      totalSales: 0,
      cashInOut: 0,
      status: 'active',
      ordersCount: 0,
      openedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      openingCash: parseFloat(newShiftOpeningCash) || 5000,
    };
    setShifts([newRecord, ...shifts]);
    setSelectedShift(newRecord);
    setShowOpenModal(false);
  };

  const handleCloseShift = () => {
    setShifts((prev) =>
      prev.map((s) =>
        s.id === activeShift.id
          ? {
              ...s,
              status: 'closed',
              closedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              shiftTime: `${s.openedAt} - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            }
          : s
      )
    );
    setShowCloseModal(false);
  };

  const handleCashInOut = () => {
    const val = parseFloat(cashAmount);
    if (isNaN(val) || val <= 0) return;
    const delta = cashActionType === 'in' ? val : -val;

    setShifts((prev) =>
      prev.map((s) =>
        s.id === activeShift.id
          ? {
              ...s,
              cashInOut: s.cashInOut + delta,
            }
          : s
      )
    );
    setCashAmount('');
    setCashReason('');
    setShowCashModal(false);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#F6F8FA]">
      {/* 1. LEFT SIDEBAR */}
      <div className="w-56 shrink-0 bg-white border-r border-gray-200/80 flex flex-col justify-between p-3.5 select-none overflow-y-auto">
        <div>
          {/* Back to More Tools button */}
          <button
            onClick={() => navigate('/tools')}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gray-100/80 transition-all mb-4"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
            <span>More Tools</span>
          </button>

          {/* Navigation Items */}
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('shift_management')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'shift_management'
                  ? 'bg-[#E7F9F0] text-[#00C060] shadow-2xs font-extrabold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0 text-[#00C060]" />
              <span className="flex-1">Shift Management</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('staff_roles');
                navigate('/staff');
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                activeTab === 'staff_roles'
                  ? 'bg-[#E7F9F0] text-[#00C060] font-bold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="flex-1">Staff & Roles</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('attendance');
                navigate('/attendance');
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                activeTab === 'attendance'
                  ? 'bg-[#E7F9F0] text-[#00C060] font-bold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span className="flex-1">Attendance</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('cash_drawer');
                navigate('/cashdrawer');
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                activeTab === 'cash_drawer'
                  ? 'bg-[#E7F9F0] text-[#00C060] font-bold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Archive className="w-4 h-4 shrink-0" />
              <span className="flex-1">Cash Drawer</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('day_close');
                navigate('/dayclose');
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                activeTab === 'day_close'
                  ? 'bg-[#E7F9F0] text-[#00C060] font-bold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="flex-1">Day Close (Z-Report)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('settings');
                navigate('/settings');
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                activeTab === 'settings'
                  ? 'bg-[#E7F9F0] text-[#00C060] font-bold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="flex-1">Settings</span>
            </button>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-[#F6FAF7] border border-[#E0F2E9] rounded-2xl p-3 text-center">
          <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
            {/* Visual calendar clock badge */}
            <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-[#00C060] flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#00C060]" />
            </div>
          </div>
          <h4 className="text-xs font-bold text-gray-900 leading-tight">Shift Management</h4>
          <p className="text-[10px] text-gray-500 mt-1 leading-normal">
            Open, close and manage staff shifts, cash and performance.
          </p>
        </div>
      </div>

      {/* 2. CENTER CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-y-auto px-5 py-4 min-w-0">
        {/* Header Title + Date Selector */}
        <div className="flex items-center justify-between pb-3 shrink-0">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Shift Management</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Create, monitor and close daily shifts with complete cash and sales tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>Today, 02 Nov 2026</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-4 gap-3 py-1 shrink-0">
          {/* Total Shifts */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#E7F9F0] text-[#00C060] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{totalShiftsCount}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Total Shifts</p>
            </div>
          </div>

          {/* Active Shift */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{activeShiftsCount}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Active Shift</p>
            </div>
          </div>

          {/* Closed Shifts */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{closedShiftsCount}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Closed Shifts</p>
            </div>
          </div>

          {/* Staff on Duty */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{staffOnDutyCount}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Staff on Duty</p>
            </div>
          </div>
        </div>

        {/* Current Shift Banner Card */}
        <div className="mt-3 bg-gradient-to-r from-[#F0FDF4] to-[#F7FEFA] border border-[#DCFCE7] rounded-2xl p-4 shadow-2xs shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Shift Title + Badge */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00C060] text-white flex items-center justify-center shadow-2xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-gray-900">Current Shift</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#00A852]">
                    Active
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">Shift #{activeShift.id}</p>
              </div>
            </div>

            {/* Opened By */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-gray-900">{activeShift.staffName}</p>
                <p className="text-[10px] text-gray-400">Opened by</p>
              </div>
            </div>

            {/* Opened At */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                <Clock className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-gray-900">{activeShift.openedAt}</p>
                <p className="text-[10px] text-gray-400">Opened at</p>
              </div>
            </div>

            {/* Running For */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-gray-900">{activeShift.duration}</p>
                <p className="text-[10px] text-gray-400">Running for</p>
              </div>
            </div>

            {/* Total Sales */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100/70 flex items-center justify-center text-emerald-600">
                <Receipt className="w-4 h-4 text-[#00C060]" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-gray-900">₹{activeShift.totalSales.toLocaleString('en-IN')}.00</p>
                <p className="text-[10px] text-gray-400">Total Sales</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 pt-3 border-t border-emerald-100/60 flex items-center gap-3">
            <span className="text-[11px] font-bold text-gray-700 shrink-0">Shift Progress</span>
            <div className="flex-1 bg-gray-200/70 h-2 rounded-full overflow-hidden">
              <div className="bg-[#00C060] h-full rounded-full transition-all duration-500" style={{ width: '68%' }} />
            </div>
            <span className="text-xs font-extrabold text-gray-800 shrink-0">68%</span>
          </div>
        </div>

        {/* Sub-Tabs + Filters Bar */}
        <div className="mt-4 flex items-center justify-between gap-3 shrink-0">
          {/* Left sub tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSubTab('history')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                subTab === 'history'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Shift History</span>
            </button>

            <button
              onClick={() => setSubTab('report')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                subTab === 'report'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Shift Report</span>
            </button>

            <button
              onClick={() => setSubTab('cash')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                subTab === 'cash'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Cash Summary</span>
            </button>
          </div>

          {/* Right filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 hover:border-gray-300 px-3 pr-8 py-1.5 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#00C060]"
              >
                <option>All Staff</option>
                <option>Rohit Sengar</option>
                <option>Priya Sharma</option>
                <option>Aman Verma</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 hover:border-gray-300 px-3 pr-8 py-1.5 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#00C060]"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Closed</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* SHIFTS TABLE */}
        <div className="mt-3 bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="py-2.5 px-3.5">Shift ID</th>
                <th className="py-2.5 px-3.5">Staff</th>
                <th className="py-2.5 px-3.5">Shift Time</th>
                <th className="py-2.5 px-3.5">Duration</th>
                <th className="py-2.5 px-3.5">Total Sales</th>
                <th className="py-2.5 px-3.5">Cash In/Out</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredShifts.map((shift) => {
                const isSelected = selectedShift.id === shift.id;
                return (
                  <tr
                    key={shift.id}
                    onClick={() => setSelectedShift(shift)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#EAFBF1]/60 hover:bg-[#EAFBF1]/80'
                        : 'hover:bg-gray-50/80'
                    }`}
                  >
                    <td className="py-3 px-3.5 font-bold text-gray-900">{shift.id}</td>
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={shift.staffAvatar}
                          alt={shift.staffName}
                          className="w-7 h-7 rounded-full object-cover border border-gray-200"
                        />
                        <span className="font-bold text-gray-800">{shift.staffName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-gray-600 font-medium">{shift.shiftTime}</td>
                    <td className="py-3 px-3.5 text-gray-600 font-medium">{shift.duration}</td>
                    <td className="py-3 px-3.5 font-extrabold text-gray-900">
                      ₹{shift.totalSales.toLocaleString('en-IN')}.00
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-emerald-600">
                      +{shift.cashInOut >= 0 ? `₹${shift.cashInOut.toLocaleString('en-IN')}.00` : `-₹${Math.abs(shift.cashInOut).toLocaleString('en-IN')}.00`}
                    </td>
                    <td className="py-3 px-3.5">
                      {shift.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E7F9F0] text-[#00A852]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00C060] animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <button className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR: SHIFT ACTIONS & TODAY'S SUMMARY */}
      <div className="w-72 shrink-0 bg-white border-l border-gray-200/80 p-4 flex flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-4">
          {/* Shift Actions Card */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00C060]" />
              <h3 className="text-sm font-extrabold text-gray-900">Shift Actions</h3>
            </div>

            <button
              onClick={() => setShowOpenModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#00C060] hover:bg-[#00ab55] active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Open New Shift</span>
            </button>

            <button
              onClick={() => setShowCloseModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              <Flag className="w-4 h-4 text-gray-500" />
              <span>Close Current Shift</span>
            </button>

            <button
              onClick={() => {
                setCashActionType('in');
                setShowCashModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              <Archive className="w-4 h-4 text-gray-500" />
              <span>Cash In / Cash Out</span>
            </button>

            <button
              onClick={() => alert('Printing shift report to kitchen & billing printers...')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              <Printer className="w-4 h-4 text-gray-500" />
              <span>Print Shift Report</span>
            </button>
          </div>

          {/* Today's Summary */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-[#00C060]" />
              <h3 className="text-sm font-extrabold text-gray-900">Today's Summary</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100/60">
                <span className="font-bold text-gray-800">Total Sales</span>
                <span className="font-black text-[#00A852]">₹28,430.00</span>
              </div>

              <div className="flex items-center justify-between py-1.5 px-1 text-gray-600">
                <span className="font-medium">Total Orders</span>
                <span className="font-bold text-gray-900">86</span>
              </div>

              <div className="flex items-center justify-between py-1.5 px-1 text-gray-600">
                <span className="font-medium">Cash In</span>
                <span className="font-bold text-emerald-600">₹2,000.00</span>
              </div>

              <div className="flex items-center justify-between py-1.5 px-1 text-gray-600">
                <span className="font-medium">Cash Out</span>
                <span className="font-bold text-rose-500">₹0.00</span>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 px-1">
                <span className="font-extrabold text-gray-900">Net Cash</span>
                <span className="font-black text-gray-900 text-sm">₹30,430.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Shift Quick Details footer preview */}
        <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200/70 text-[11px]">
          <p className="font-bold text-gray-800">Selected: {selectedShift.id}</p>
          <p className="text-gray-500 mt-0.5">Staff: {selectedShift.staffName}</p>
          <p className="text-gray-500">Orders handled: {selectedShift.ordersCount}</p>
        </div>
      </div>

      {/* --- MODAL: OPEN NEW SHIFT --- */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00C060] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Open New Shift</h3>
              </div>
              <button
                onClick={() => setShowOpenModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Staff Member</label>
                <select
                  value={newShiftStaff}
                  onChange={(e) => setNewShiftStaff(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                >
                  <option>Rohit Sengar</option>
                  <option>Priya Sharma</option>
                  <option>Aman Verma</option>
                  <option>Saurabh Kumar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Opening Cash Balance (₹)</label>
                <input
                  type="number"
                  value={newShiftOpeningCash}
                  onChange={(e) => setNewShiftOpeningCash(e.target.value)}
                  placeholder="5000"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[11px] text-gray-600">
                Opening this shift will log the initial drawer cash and activate live sales recording for this staff user.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-3.5 bg-gray-50/70 border-t border-gray-100">
              <button
                onClick={() => setShowOpenModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleOpenShift}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#00C060] hover:bg-[#00ab55] text-white shadow-xs"
              >
                Confirm Open Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CLOSE CURRENT SHIFT --- */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Flag className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Close Current Shift #{activeShift.id}</h3>
              </div>
              <button
                onClick={() => setShowCloseModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <p className="text-gray-600">
                Are you sure you want to close the active shift for <span className="font-bold text-gray-900">{activeShift.staffName}</span>?
              </p>
              <div className="space-y-1.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Shift Sales:</span>
                  <span className="font-bold text-gray-900">₹{activeShift.totalSales.toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-bold text-gray-900">{activeShift.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Expected Drawer Cash:</span>
                  <span className="font-bold text-emerald-600">₹{(activeShift.openingCash + activeShift.cashInOut).toLocaleString('en-IN')}.00</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-3.5 bg-gray-50/70 border-t border-gray-100">
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseShift}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-xs"
              >
                Close & Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CASH IN / CASH OUT --- */}
      {showCashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00C060] flex items-center justify-center">
                  <Archive className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Cash In / Cash Out</h3>
              </div>
              <button
                onClick={() => setShowCashModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3.5">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCashActionType('in')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    cashActionType === 'in'
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-2xs'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cash In (Add)
                </button>
                <button
                  type="button"
                  onClick={() => setCashActionType('out')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    cashActionType === 'out'
                      ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cash Out (Expense)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={cashReason}
                  onChange={(e) => setCashReason(e.target.value)}
                  placeholder="e.g. Petty cash replenishment, vendor payment"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-3.5 bg-gray-50/70 border-t border-gray-100">
              <button
                onClick={() => setShowCashModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCashInOut}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#00C060] hover:bg-[#00ab55] text-white shadow-xs"
              >
                Record Cash Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManagementPage;
