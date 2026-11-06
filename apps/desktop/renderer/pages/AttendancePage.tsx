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
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck,
  UserX,
  LogIn,
  ChevronDown,
  X,
  MoreHorizontal,
} from 'lucide-react';

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'on_break';

export interface AttendanceRecord {
  id: string; // ATT-101
  staffId: string; // STF-001
  staffName: string;
  avatar: string;
  role: string;
  shift: string;
  clockIn: string;
  clockOut?: string;
  workHours: string;
  status: AttendanceStatus;
}

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'ATT-101',
    staffId: 'STF-001',
    staffName: 'Rohit Sengar',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
    role: 'Store Manager',
    shift: 'Morning (9 AM - 5 PM)',
    clockIn: '08:55 AM',
    workHours: '08h 15m',
    status: 'present',
  },
  {
    id: 'ATT-102',
    staffId: 'STF-002',
    staffName: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
    role: 'Cashier',
    shift: 'Morning (9 AM - 5 PM)',
    clockIn: '09:18 AM',
    workHours: '07h 52m',
    status: 'late',
  },
  {
    id: 'ATT-103',
    staffId: 'STF-003',
    staffName: 'Rahul Singh',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80',
    role: 'Server',
    shift: 'Morning (9 AM - 5 PM)',
    clockIn: '08:58 AM',
    workHours: '08h 12m',
    status: 'on_break',
  },
  {
    id: 'ATT-104',
    staffId: 'STF-004',
    staffName: 'Karan Malhotra',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    role: 'Head Chef',
    shift: 'Full Day (9 AM - 11 PM)',
    clockIn: '08:45 AM',
    workHours: '08h 25m',
    status: 'present',
  },
  {
    id: 'ATT-105',
    staffId: 'STF-005',
    staffName: 'Neha Gupta',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    role: 'Steward',
    shift: 'Morning (9 AM - 5 PM)',
    clockIn: '--',
    workHours: '0h 00m',
    status: 'absent',
  },
];

export const AttendancePage: React.FC = () => {
  const navigate = useNavigate();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [records] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [showClockModal, setShowClockModal] = useState(false);
  const [selectedStaffToClock, setSelectedStaffToClock] = useState('Rahul Singh');

  // Counts
  const total = 18;
  const presentCount = 14;
  const lateCount = 2;
  const onBreakCount = 1;
  const absentCount = 1;

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      const q = searchQuery.toLowerCase();
      return (
        r.staffName.toLowerCase().includes(q) ||
        r.staffId.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q)
      );
    });
  }, [records, filterStatus, searchQuery]);

  const handleClockInAction = () => {
    alert(`Clocked status recorded for ${selectedStaffToClock}`);
    setShowClockModal(false);
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
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold bg-[#E7F9F0] text-[#00C060] shadow-2xs transition-all text-left"
            >
              <Clock className="w-4 h-4 shrink-0 text-[#00C060]" />
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
            <Clock className="w-6 h-6 text-[#00C060]" />
          </div>
          <h4 className="text-xs font-bold text-gray-900 leading-tight">Staff Attendance</h4>
          <p className="text-[10px] text-gray-500 mt-1 leading-normal">
            Track daily clock-in, late arrivals and total work hours.
          </p>
        </div>
      </div>

      {/* 2. CENTER CONTENT */}
      <div className="flex-1 flex flex-col overflow-y-auto px-5 py-4 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 shrink-0">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Attendance</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live shift clock-in, punch times, overtime and break status.
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
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#E7F9F0] text-[#00C060] flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{presentCount}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Present On Duty</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{lateCount}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Late Arrivals</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{onBreakCount}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">On Break</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{absentCount}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Absent</p>
            </div>
          </div>
        </div>

        {/* Filter Pills + Search + Clock button */}
        <div className="mt-4 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === 'all'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              All Staff ({total})
            </button>
            <button
              onClick={() => setFilterStatus('present')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === 'present'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              Present ({presentCount})
            </button>
            <button
              onClick={() => setFilterStatus('late')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === 'late'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              Late ({lateCount})
            </button>
            <button
              onClick={() => setFilterStatus('on_break')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === 'on_break'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              Break ({onBreakCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff attendance..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#00C060] bg-white"
              />
            </div>

            <button
              onClick={() => setShowClockModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00C060] hover:bg-[#00ab55] active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Punch Clock In</span>
            </button>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="mt-3 bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="py-2.5 px-3.5">Staff</th>
                <th className="py-2.5 px-3.5">Role</th>
                <th className="py-2.5 px-3.5">Shift Scheduled</th>
                <th className="py-2.5 px-3.5">Clock In</th>
                <th className="py-2.5 px-3.5">Work Duration</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.avatar}
                        alt={item.staffName}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <p className="font-bold text-gray-900 leading-tight">{item.staffName}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{item.staffId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3.5 font-semibold text-gray-700">{item.role}</td>
                  <td className="py-3 px-3.5 text-gray-600 font-medium">{item.shift}</td>
                  <td className="py-3 px-3.5 font-bold text-gray-900">{item.clockIn}</td>
                  <td className="py-3 px-3.5 font-semibold text-gray-800">{item.workHours}</td>
                  <td className="py-3 px-3.5">
                    {item.status === 'present' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E7F9F0] text-[#00A852]">
                        <CheckCircle2 className="w-3 h-3 text-[#00C060]" />
                        Present
                      </span>
                    )}
                    {item.status === 'late' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600">
                        <AlertCircle className="w-3 h-3 text-amber-500" />
                        Late (18m)
                      </span>
                    )}
                    {item.status === 'on_break' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600">
                        <Clock className="w-3 h-3 text-blue-500" />
                        On Break
                      </span>
                    )}
                    {item.status === 'absent' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600">
                        <XCircle className="w-3 h-3 text-rose-500" />
                        Absent
                      </span>
                    )}
                  </td>
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

      {/* 3. RIGHT SIDEBAR: QUICK CLOCK & SHIFT OVERVIEW */}
      <div className="w-72 shrink-0 bg-white border-l border-gray-200/80 p-4 flex flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-1">Live Shift Attendance</h3>
            <p className="text-[11px] text-gray-500 mb-3">Today's active roster compliance</p>

            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-[#E7F9F0] border border-emerald-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">Attendance Rate</span>
                <span className="text-sm font-extrabold text-[#00A852]">92%</span>
              </div>
              <div className="w-full bg-white h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-[#00C060] h-full rounded-full" style={{ width: '92%' }} />
              </div>
              <p className="text-[10px] text-gray-500 mt-2">14 of 15 scheduled staff checked in</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h4 className="text-xs font-extrabold text-gray-900">Shift Coverage</h4>
            <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-gray-600 font-medium">Morning Shift</span>
              <span className="font-bold text-gray-900">8 / 8 Staff</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-gray-600 font-medium">Evening Shift</span>
              <span className="font-bold text-gray-900">6 / 7 Staff</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-gray-600 font-medium">Kitchen Line</span>
              <span className="font-bold text-emerald-600">Full Crew</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowClockModal(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#00C060] hover:bg-[#00ab55] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
        >
          <Clock className="w-4 h-4" />
          <span>Manual Punch In / Out</span>
        </button>
      </div>

      {/* CLOCK MODAL */}
      {showClockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Record Staff Punch Clock</h3>
              <button
                onClick={() => setShowClockModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Staff Member</label>
                <select
                  value={selectedStaffToClock}
                  onChange={(e) => setSelectedStaffToClock(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                >
                  <option>Rahul Singh</option>
                  <option>Priya Sharma</option>
                  <option>Neha Gupta</option>
                  <option>Rohit Sengar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Action</label>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#00C060] text-white">
                    Clock In
                  </button>
                  <button className="flex-1 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-700">
                    Clock Out
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-3.5 bg-gray-50/70 border-t border-gray-100">
              <button
                onClick={() => setShowClockModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleClockInAction}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#00C060] text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
