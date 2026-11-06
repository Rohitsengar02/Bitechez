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
  Filter,
  Plus,
  Edit2,
  MoreHorizontal,
  ChevronRight,
  Shield,
  ShieldCheck,
  Crown,
  Receipt,
  Utensils,
  ChefHat,
  Layers,
  CheckCircle2,
  XCircle,
  PauseCircle,
  X,
} from 'lucide-react';

export type StaffNavTab =
  | 'shift_management'
  | 'staff_roles'
  | 'attendance'
  | 'cash_drawer'
  | 'day_close'
  | 'settings';

export type RoleType = 'Manager' | 'Cashier' | 'Server' | 'Chef' | 'Steward' | 'Admin';
export type StaffStatus = 'Active' | 'On Leave' | 'Inactive';

export interface StaffMember {
  id: string; // STF-001
  name: string;
  avatar: string;
  role: RoleType;
  phone: string;
  shift: string; // e.g. "Morning (9 AM - 5 PM)"
  status: StaffStatus;
}

export interface RoleDef {
  id: string;
  name: RoleType;
  description: string;
  staffCount: number;
  icon: React.ElementType;
  colorScheme: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    badgeText: string;
  };
  permissions: string[];
}

const ROLES_DATA: RoleDef[] = [
  {
    id: 'manager',
    name: 'Manager',
    description: 'Full access to all modules',
    staffCount: 2,
    icon: Crown,
    colorScheme: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-200',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-700',
    },
    permissions: [
      'Dashboard',
      'POS & Billing',
      'Tables',
      'Kitchen KOT',
      'Inventory',
      'Reports',
      'Staff Management',
      'Settings',
    ],
  },
  {
    id: 'cashier',
    name: 'Cashier',
    description: 'POS, billing, payments',
    staffCount: 4,
    icon: Receipt,
    colorScheme: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      badgeBg: 'bg-purple-50',
      badgeText: 'text-purple-700',
    },
    permissions: ['Dashboard', 'POS & Billing', 'Tables', 'Reports'],
  },
  {
    id: 'server',
    name: 'Server',
    description: 'Orders, tables, KOT',
    staffCount: 5,
    icon: Utensils,
    colorScheme: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-700',
    },
    permissions: ['POS & Billing', 'Tables', 'Kitchen KOT'],
  },
  {
    id: 'chef',
    name: 'Chef',
    description: 'Kitchen KOT, order view only',
    staffCount: 3,
    icon: ChefHat,
    colorScheme: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-200',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
    },
    permissions: ['Kitchen KOT', 'Item Menu View'],
  },
  {
    id: 'steward',
    name: 'Steward',
    description: 'Table setup, service tasks',
    staffCount: 2,
    icon: Layers,
    colorScheme: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-600',
      border: 'border-cyan-200',
      badgeBg: 'bg-cyan-50',
      badgeText: 'text-cyan-700',
    },
    permissions: ['Tables', 'Requests'],
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'System, settings, reports',
    staffCount: 2,
    icon: Settings,
    colorScheme: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
      badgeBg: 'bg-gray-100',
      badgeText: 'text-gray-800',
    },
    permissions: [
      'Dashboard',
      'POS & Billing',
      'Tables',
      'Kitchen KOT',
      'Inventory',
      'Reports',
      'Staff Management',
      'Settings',
      'System Logs',
    ],
  },
];

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'STF-001',
    name: 'Aman Verma',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
    role: 'Manager',
    phone: '+91 98765 43210',
    shift: 'Morning (9 AM - 5 PM)',
    status: 'Active',
  },
  {
    id: 'STF-002',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
    role: 'Cashier',
    phone: '+91 99123 45678',
    shift: 'Evening (5 PM - 11 PM)',
    status: 'Active',
  },
  {
    id: 'STF-003',
    name: 'Rahul Singh',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80',
    role: 'Server',
    phone: '+91 99887 65432',
    shift: 'Morning (9 AM - 5 PM)',
    status: 'Active',
  },
  {
    id: 'STF-004',
    name: 'Karan Malhotra',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    role: 'Chef',
    phone: '+91 97654 32109',
    shift: 'Full Day (9 AM - 11 PM)',
    status: 'Active',
  },
  {
    id: 'STF-005',
    name: 'Neha Gupta',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    role: 'Steward',
    phone: '+91 99876 54321',
    shift: 'Morning (9 AM - 5 PM)',
    status: 'On Leave',
  },
];

export const StaffRolesPage: React.FC = () => {
  const navigate = useNavigate();

  // Navigation Sidebar
  const [activeTab, setActiveTab] = useState<StaffNavTab>('staff_roles');

  // Sub Tab
  const [mainSubTab, setMainSubTab] = useState<'members' | 'roles' | 'logs'>('members');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>(['STF-001']);
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);

  // Selected Role for Role Permissions preview card
  const [selectedRole, setSelectedRole] = useState<RoleDef>(ROLES_DATA[0]);

  // Modals
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<RoleType>('Server');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffShift, setNewStaffShift] = useState('Morning (9 AM - 5 PM)');

  // Metric counts
  const totalStaffCount = 18; // shown on UI metric card
  const activeStaffCount = 14;
  const onLeaveCount = 2;
  const inactiveCount = 2;
  const rolesCount = 6;

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.phone.includes(q)
      );
    });
  }, [staffList, searchQuery]);

  const toggleSelectStaff = (id: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddStaff = () => {
    if (!newStaffName.trim()) return;
    const newMember: StaffMember = {
      id: `STF-00${staffList.length + 1}`,
      name: newStaffName,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
      role: newStaffRole,
      phone: newStaffPhone || '+91 98765 00000',
      shift: newStaffShift,
      status: 'Active',
    };
    setStaffList([newMember, ...staffList]);
    setSelectedStaffIds([newMember.id]);
    setShowAddStaffModal(false);
    setNewStaffName('');
    setNewStaffPhone('');
  };

  const getRoleBadge = (role: RoleType) => {
    switch (role) {
      case 'Manager':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Crown className="w-3 h-3 text-amber-500" />
            Manager
          </span>
        );
      case 'Cashier':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Receipt className="w-3 h-3 text-purple-500" />
            Cashier
          </span>
        );
      case 'Server':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Utensils className="w-3 h-3 text-blue-500" />
            Server
          </span>
        );
      case 'Chef':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <ChefHat className="w-3 h-3 text-rose-500" />
            Chef
          </span>
        );
      case 'Steward':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <Layers className="w-3 h-3 text-cyan-500" />
            Steward
          </span>
        );
      case 'Admin':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <Settings className="w-3 h-3 text-gray-500" />
            Admin
          </span>
        );
    }
  };

  const getStatusBadge = (status: StaffStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A852]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C060]" />
            Active
          </span>
        );
      case 'On Leave':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            On Leave
          </span>
        );
      case 'Inactive':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#F6F8FA]">
      {/* 1. LEFT SIDEBAR */}
      <div className="w-56 shrink-0 bg-white border-r border-gray-200/80 flex flex-col justify-between p-3.5 select-none overflow-y-auto">
        <div>
          {/* Back button to More Tools */}
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
              onClick={() => {
                setActiveTab('shift_management');
                navigate('/shifts');
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                activeTab === 'shift_management'
                  ? 'bg-[#E7F9F0] text-[#00C060] font-bold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="flex-1">Shift Management</span>
            </button>

            <button
              onClick={() => setActiveTab('staff_roles')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'staff_roles'
                  ? 'bg-[#E7F9F0] text-[#00C060] font-extrabold shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4 shrink-0 text-[#00C060]" />
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
            {/* Visual team icon badge */}
            <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-[#00C060] flex items-center justify-center">
              <Users className="w-6 h-6 text-[#00C060]" />
            </div>
          </div>
          <h4 className="text-xs font-bold text-gray-900 leading-tight">Staff & Roles</h4>
          <p className="text-[10px] text-gray-500 mt-1 leading-normal">
            Manage your team, roles, permissions and their access.
          </p>
        </div>
      </div>

      {/* 2. CENTER CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-y-auto px-5 py-4 min-w-0">
        {/* Header Title */}
        <div className="pb-3 shrink-0">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Staff & Roles</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage staff members, roles and access permissions for your POS.
          </p>
        </div>

        {/* 5 Stat Metric Cards */}
        <div className="grid grid-cols-5 gap-3 py-1 shrink-0">
          {/* Total Staff */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#E7F9F0] text-[#00C060] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{totalStaffCount}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Total Staff</p>
            </div>
          </div>

          {/* Active Staff */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{activeStaffCount}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Active Staff</p>
            </div>
          </div>

          {/* On Leave */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <PauseCircle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{onLeaveCount}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">On Leave</p>
            </div>
          </div>

          {/* Inactive */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{inactiveCount}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Inactive</p>
            </div>
          </div>

          {/* Roles */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{rolesCount}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Roles</p>
            </div>
          </div>
        </div>

        {/* Sub Tabs + Search Bar + Add Staff */}
        <div className="mt-4 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          {/* Sub tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMainSubTab('members')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mainSubTab === 'members'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Staff Members (18)</span>
            </button>

            <button
              onClick={() => setMainSubTab('roles')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mainSubTab === 'roles'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Roles & Permissions (6)</span>
            </button>

            <button
              onClick={() => setMainSubTab('logs')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mainSubTab === 'logs'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Access Logs</span>
            </button>
          </div>

          {/* Search, Filter, Add Staff Button */}
          <div className="flex items-center gap-2">
            <div className="relative w-52">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#00C060] bg-white"
              />
            </div>

            <button className="p-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl shadow-2xs">
              <Filter className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowAddStaffModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00C060] hover:bg-[#00ab55] active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Staff</span>
            </button>
          </div>
        </div>

        {/* STAFF TABLE */}
        <div className="mt-3 bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="py-2.5 px-3.5 w-8">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-[#00C060] focus:ring-[#00C060]"
                    checked={selectedStaffIds.length === filteredStaff.length && filteredStaff.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStaffIds(filteredStaff.map((s) => s.id));
                      } else {
                        setSelectedStaffIds([]);
                      }
                    }}
                  />
                </th>
                <th className="py-2.5 px-3.5">Staff</th>
                <th className="py-2.5 px-3.5">Role</th>
                <th className="py-2.5 px-3.5">Phone</th>
                <th className="py-2.5 px-3.5">Shift</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredStaff.map((staff) => {
                const isSelected = selectedStaffIds.includes(staff.id);
                return (
                  <tr
                    key={staff.id}
                    onClick={() => toggleSelectStaff(staff.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#EAFBF1]/60 hover:bg-[#EAFBF1]/80'
                        : 'hover:bg-gray-50/80'
                    }`}
                  >
                    <td className="py-3 px-3.5 w-8" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectStaff(staff.id)}
                        className="rounded border-gray-300 text-[#00C060] focus:ring-[#00C060]"
                      />
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={staff.avatar}
                          alt={staff.name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-bold text-gray-900 leading-tight">{staff.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{staff.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3.5">{getRoleBadge(staff.role)}</td>
                    <td className="py-3 px-3.5 text-gray-600 font-medium">{staff.phone}</td>
                    <td className="py-3 px-3.5 text-gray-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C060]" />
                        <span>{staff.shift}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5">{getStatusBadge(staff.status)}</td>
                    <td className="py-3 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
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

        {/* Pagination footer */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <span>Showing 1-5 of 18 staff</span>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#00C060] text-white font-bold">
              1
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              2
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              3
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              4
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR: ROLES LIST & ROLE PERMISSIONS */}
      <div className="w-80 shrink-0 bg-white border-l border-gray-200/80 p-4 flex flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-4">
          {/* Top Roles (6) header */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00C060]" />
                <h3 className="text-sm font-extrabold text-gray-900">Roles ({ROLES_DATA.length})</h3>
              </div>
              <button
                onClick={() => setShowAddRoleModal(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-[#00C060] hover:text-[#009b4d]"
              >
                <Plus className="w-3 h-3" />
                <span>Add Role</span>
              </button>
            </div>

            {/* Role Cards List */}
            <div className="space-y-2">
              {ROLES_DATA.map((role) => {
                const IconComp = role.icon;
                const isSelected = selectedRole.id === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#00C060] bg-[#F6FAF7] shadow-2xs'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg ${role.colorScheme.bg} ${role.colorScheme.text} flex items-center justify-center shrink-0`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 leading-tight">{role.name}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{role.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 font-semibold">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span>{role.staffCount}</span>
                      </div>
                      <button className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                        <MoreHorizontal className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Role Permissions Preview for Selected Role */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00C060]" />
                <h3 className="text-xs font-extrabold text-gray-900">
                  Role Permissions ({selectedRole.name})
                </h3>
              </div>
              <button className="text-[11px] font-bold text-[#00C060] hover:underline flex items-center gap-0.5">
                <span>View / Edit</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Permission badges grid */}
            <div className="flex flex-wrap gap-1.5">
              {selectedRole.permissions.map((perm) => (
                <span
                  key={perm}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-[#E7F9F0] text-[#00A852]"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#00C060]" />
                  <span>{perm}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Staff quick stats */}
        <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100 text-[11px] text-gray-600">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-800">Total Active Staff:</span>
            <span className="font-extrabold text-[#00C060]">14 Staff Online</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Shift change scheduled at 5:00 PM</p>
        </div>
      </div>

      {/* --- MODAL: ADD STAFF --- */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00C060] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Add New Staff Member</h3>
              </div>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Saurabh Kumar"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Role</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as RoleType)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                >
                  <option>Manager</option>
                  <option>Cashier</option>
                  <option>Server</option>
                  <option>Chef</option>
                  <option>Steward</option>
                  <option>Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  placeholder="+91 91234 56789"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Default Shift</label>
                <select
                  value={newStaffShift}
                  onChange={(e) => setNewStaffShift(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                >
                  <option>Morning (9 AM - 5 PM)</option>
                  <option>Evening (5 PM - 11 PM)</option>
                  <option>Full Day (9 AM - 11 PM)</option>
                  <option>Night Shift (11 PM - 7 AM)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-3.5 bg-gray-50/70 border-t border-gray-100">
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStaff}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#00C060] hover:bg-[#00ab55] text-white shadow-xs"
              >
                Add Staff Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD ROLE --- */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Create New Role</h3>
              </div>
              <button
                onClick={() => setShowAddRoleModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Bartender / Sommelier"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Bar orders, beverage inventory"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-3.5 bg-gray-50/70 border-t border-gray-100">
              <button
                onClick={() => setShowAddRoleModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddRoleModal(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#00C060] hover:bg-[#00ab55] text-white shadow-xs"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffRolesPage;
