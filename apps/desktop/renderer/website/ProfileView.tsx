import React, { useState } from 'react';
import {
  ArrowLeft,
  ChefHat,
  Search,
  ShoppingBag,
  Armchair,
  Lock,
  Users,
  Coins,
  Gift,
  Check,
  ChevronRight,
  Ticket,
  Percent,
  Star,
  FileText,
  Heart,
  CreditCard,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Camera,
  Crown,
  Phone,
  Mail,
  CheckCircle2,
  X,
} from 'lucide-react';
import { userRohitImg } from './websiteData';

interface ProfileViewProps {
  shopName?: string;
  tableNumber?: string;
  guestsCount?: number;
  cartCount?: number;
  onBack?: () => void;
  onOpenCart?: () => void;
  onNavigateTab?: (tab: 'home' | 'orders' | 'review' | 'loyalty' | 'profile') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  shopName = 'Resto Daddy',
  tableNumber = 'T-06',
  guestsCount = 4,
  cartCount = 2,
  onBack,
  onOpenCart,
  onNavigateTab,
}) => {
  // Search input state in header
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast feedback message
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Logout confirmation modal
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Rewards & Offers Modal state
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // User details
  const [userName, setUserName] = useState('Rohit Sengar');
  const [userPhone, setUserPhone] = useState('+91 98765 43210');
  const [userEmail, setUserEmail] = useState('rohit.sengar@gmail.com');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  return (
    <div className="min-h-full flex flex-col bg-[#F8FAF9] pb-28 text-slate-900 select-none">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#00C060] shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* ================= 1. DARK FOREST GREEN HEADER BAR ================= */}
      <header
        className="w-full px-4 pt-3 pb-4 text-white shrink-0 shadow-md"
        style={{
          background: 'linear-gradient(180deg, #041B0D 0%, #062613 60%, #082E17 100%)',
        }}
      >
        <div className="flex items-center justify-between gap-2.5">
          {/* Back Circle Button */}
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition shrink-0 active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Restaurant Identity with Chef Hat Icon */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
              <ChefHat className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-black text-white leading-tight truncate tracking-tight">
                {shopName}
              </h1>
              <p className="text-[11px] font-bold text-emerald-200/80 flex items-center gap-1 mt-0.5 truncate">
                <span>Main Outlet • Outlet No. 01</span>
                <span className="text-emerald-400 text-xs">⌵</span>
              </p>
            </div>
          </div>

          {/* Right Action Circle Buttons (Search & Cart Bag) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition active:scale-95"
              aria-label="Search"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="relative w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition active:scale-95"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#00C060] text-white text-[11px] font-black flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Collapsible Search Input */}
        {searchOpen && (
          <div className="mt-3 relative animate-in fade-in slide-in-from-top-2 duration-200">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search profile, saved orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-emerald-200/50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#00C060]"
              autoFocus
            />
          </div>
        )}
      </header>

      {/* ================= 2. TABLE STATUS BAR (LOCKED) ================= */}
      <div className="px-4 pt-3 shrink-0">
        <div className="rounded-2xl bg-white border border-slate-100 shadow-xs p-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-[#00C060]">
              <Armchair className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-sm font-black text-slate-900 tracking-tight">
              Table {tableNumber || 'T-06'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E7F9F0] text-[#00C060] text-[10px] font-black border border-emerald-200">
              <Lock className="w-2.5 h-2.5 stroke-[2.5]" />
              <span>Locked</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Users className="w-4 h-4 text-slate-400" />
            <span>{guestsCount} Guests</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-3">
        {/* ================= 3. USER PROFILE HERO CARD (ROHIT SENGAR / GOLD MEMBER) ================= */}
        <div className="px-4">
          <div
            className="rounded-3xl p-4 sm:p-5 text-white relative shadow-md overflow-hidden flex items-center justify-between"
            style={{
              background: 'linear-gradient(110deg, #021E0F 0%, #063118 45%, #0A4222 100%)',
            }}
          >
            {/* Glowing Wave Accent */}
            <div
              className="absolute right-0 bottom-0 top-0 w-1/2 opacity-35 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at 85% 50%, rgba(0, 192, 96, 0.5) 0%, transparent 70%)',
              }}
            />

            {/* Left side: Avatar + User Info */}
            <div className="flex items-center gap-3.5 z-10 min-w-0">
              {/* Avatar Photo with Camera Icon Badge */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-white/80 overflow-hidden shadow-md bg-slate-800">
                  <img
                    src={userRohitImg}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#00C060] text-white flex items-center justify-center border-2 border-white shadow-xs active:scale-95 transition"
                  aria-label="Edit Profile"
                >
                  <Camera className="w-3 h-3 stroke-[2.2]" />
                </button>
              </div>

              {/* Name, Phone, Email */}
              <div className="min-w-0">
                <h2 className="text-lg font-black text-white leading-tight tracking-tight truncate">
                  {userName}
                </h2>
                <p className="text-xs font-semibold text-emerald-100/90 flex items-center gap-1.5 mt-1 truncate">
                  <Phone className="w-3 h-3 text-[#00C060] shrink-0" />
                  <span>{userPhone}</span>
                </p>
                <p className="text-xs font-semibold text-emerald-100/80 flex items-center gap-1.5 mt-0.5 truncate">
                  <Mail className="w-3 h-3 text-[#00C060] shrink-0" />
                  <span className="truncate">{userEmail}</span>
                </p>
              </div>
            </div>

            {/* Right side: Gold Member Crown Badge */}
            <div className="flex flex-col items-end z-10 shrink-0 pl-2">
              <div className="mb-1 text-amber-400 drop-shadow-md">
                <Crown className="w-6 h-6 fill-amber-400 text-amber-300" />
              </div>
              <span className="px-2.5 py-1 rounded-full border border-amber-400/80 bg-black/30 text-amber-300 text-[11px] font-black tracking-tight shadow-xs">
                Gold Member
              </span>
            </div>
          </div>
        </div>

        {/* ================= 4. LOYALTY SUMMARY DUAL CARDS (MY POINTS & MY STAMPS) ================= */}
        <div className="px-4">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Card 1: My Points */}
            <button
              type="button"
              onClick={() => onNavigateTab ? onNavigateTab('loyalty') : showToast('320 Reward Points = ₹32.00')}
              className="rounded-2xl bg-[#EBF9F1] border border-emerald-200/80 p-3.5 text-left transition active:scale-95 hover:shadow-xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#DCF6E7] text-[#008A46] flex items-center justify-center shrink-0 shadow-2xs">
                  <Coins className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block leading-tight">
                    My Points
                  </span>
                  <span className="text-xl font-black text-[#006A35] flex items-center gap-0.5 leading-tight group-hover:text-emerald-700">
                    <span>320</span>
                    <ChevronRight className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                  </span>
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-600 mt-2 pl-0.5">
                50 Points = ₹5
              </p>
            </button>

            {/* Card 2: My Stamps */}
            <button
              type="button"
              onClick={() => onNavigateTab ? onNavigateTab('loyalty') : showToast('4 of 5 Stamps collected!')}
              className="rounded-2xl bg-[#EBF9F1] border border-emerald-200/80 p-3.5 text-left transition active:scale-95 hover:shadow-xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#DCF6E7] text-[#008A46] flex items-center justify-center shrink-0 shadow-2xs">
                  <Gift className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block leading-tight">
                    My Stamps
                  </span>
                  <span className="text-xl font-black text-[#006A35] flex items-center gap-0.5 leading-tight group-hover:text-emerald-700">
                    <span>4 / 5</span>
                    <ChevronRight className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                  </span>
                </div>
              </div>

              {/* 5 mini stamp badges matching screenshot */}
              <div className="flex items-center gap-1 mt-2 pl-0.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full bg-[#00C060] text-white flex items-center justify-center text-[9px] shadow-2xs"
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                ))}
                <div className="w-4 h-4 rounded-full border border-dashed border-slate-300 text-slate-400 flex items-center justify-center text-[9px]">
                  <Gift className="w-2.5 h-2.5" />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ================= 5. QUICK ACTION TRIPLET PILLS ================= */}
        <div className="px-4">
          <div className="grid grid-cols-3 gap-2">
            {/* Pill 1: My Rewards */}
            <button
              type="button"
              onClick={() => setActiveModal('rewards')}
              className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-[#00C060] transition text-left flex items-center justify-between active:scale-95 group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#E7F9F0] text-[#008A46] flex items-center justify-center shrink-0">
                  <Ticket className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-black text-slate-900 block truncate">
                    My Rewards
                  </span>
                  <span className="text-[9.5px] font-black text-[#008A46] truncate block">
                    2 Available
                  </span>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0" />
            </button>

            {/* Pill 2: Offers for You */}
            <button
              type="button"
              onClick={() => setActiveModal('offers')}
              className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-[#00C060] transition text-left flex items-center justify-between active:scale-95 group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#E7F9F0] text-[#008A46] flex items-center justify-center shrink-0">
                  <Percent className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-black text-slate-900 block truncate">
                    Offers for You
                  </span>
                  <span className="text-[9.5px] font-black text-[#008A46] truncate block">
                    3 New Offers
                  </span>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0" />
            </button>

            {/* Pill 3: My Reviews */}
            <button
              type="button"
              onClick={() => onNavigateTab ? onNavigateTab('review') : showToast('Opening your reviews')}
              className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-[#00C060] transition text-left flex items-center justify-between active:scale-95 group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#E7F9F0] text-[#008A46] flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-black text-slate-900 block truncate">
                    My Reviews
                  </span>
                  <span className="text-[9.5px] font-bold text-slate-500 truncate block">
                    View / Edit
                  </span>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0" />
            </button>
          </div>
        </div>

        {/* ================= 6. ACCOUNT & DINING SETTINGS MENU LIST (7 ITEMS) ================= */}
        <div className="px-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {/* 1. My Orders */}
            <button
              type="button"
              onClick={() => onNavigateTab ? onNavigateTab('orders') : showToast('Opening Orders')}
              className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50 transition text-left group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-2xl bg-slate-50 group-hover:bg-[#E7F9F0] text-slate-700 group-hover:text-[#008A46] flex items-center justify-center transition">
                  <FileText className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-[#008A46] transition">
                    My Orders
                  </h4>
                  <p className="text-[11px] font-medium text-slate-400">
                    Track, reorder and view order history
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
            </button>

            {/* 2. Saved Items */}
            <button
              type="button"
              onClick={() => setActiveModal('saved')}
              className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50 transition text-left group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-2xl bg-slate-50 group-hover:bg-[#E7F9F0] text-slate-700 group-hover:text-[#008A46] flex items-center justify-center transition">
                  <Heart className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-[#008A46] transition">
                    Saved Items
                  </h4>
                  <p className="text-[11px] font-medium text-slate-400">
                    Your favorite food items
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
            </button>

            {/* 3. Group Order */}
            <button
              type="button"
              onClick={() => setActiveModal('group')}
              className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50 transition text-left group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-2xl bg-slate-50 group-hover:bg-[#E7F9F0] text-slate-700 group-hover:text-[#008A46] flex items-center justify-center transition">
                  <Users className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-[#008A46] transition">
                    Group Order
                  </h4>
                  <p className="text-[11px] font-medium text-slate-400">
                    Order together with friends
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
            </button>

            {/* 4. Payment Methods */}
            <button
              type="button"
              onClick={() => setActiveModal('payment')}
              className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50 transition text-left group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-2xl bg-slate-50 group-hover:bg-[#E7F9F0] text-slate-700 group-hover:text-[#008A46] flex items-center justify-center transition">
                  <CreditCard className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-[#008A46] transition">
                    Payment Methods
                  </h4>
                  <p className="text-[11px] font-medium text-slate-400">
                    UPI, Cards and more
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
            </button>

            {/* 5. Notifications */}
            <button
              type="button"
              onClick={() => setActiveModal('notifications')}
              className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50 transition text-left group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-2xl bg-slate-50 group-hover:bg-[#E7F9F0] text-slate-700 group-hover:text-[#008A46] flex items-center justify-center transition">
                  <Bell className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-[#008A46] transition">
                    Notifications
                  </h4>
                  <p className="text-[11px] font-medium text-slate-400">
                    Order updates, offers and rewards
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
            </button>

            {/* 6. App Settings */}
            <button
              type="button"
              onClick={() => setActiveModal('settings')}
              className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50 transition text-left group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-2xl bg-slate-50 group-hover:bg-[#E7F9F0] text-slate-700 group-hover:text-[#008A46] flex items-center justify-center transition">
                  <Settings className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-[#008A46] transition">
                    App Settings
                  </h4>
                  <p className="text-[11px] font-medium text-slate-400">
                    Language, theme and preferences
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
            </button>

            {/* 7. Help & Support */}
            <button
              type="button"
              onClick={() => setActiveModal('help')}
              className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50 transition text-left group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-2xl bg-slate-50 group-hover:bg-[#E7F9F0] text-slate-700 group-hover:text-[#008A46] flex items-center justify-center transition">
                  <HelpCircle className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-[#008A46] transition">
                    Help & Support
                  </h4>
                  <p className="text-[11px] font-medium text-slate-400">
                    Get help, FAQs or contact us
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
            </button>
          </div>
        </div>

        {/* ================= 7. LOGOUT BUTTON ================= */}
        <div className="px-4">
          <button
            type="button"
            onClick={() => setLogoutModalOpen(true)}
            className="w-full py-3.5 rounded-2xl bg-[#FFF0F0] hover:bg-rose-100/70 border border-rose-200/90 text-rose-600 text-sm font-black shadow-2xs flex items-center justify-center gap-2 transition active:scale-95"
          >
            <LogOut className="w-4 h-4 stroke-[2.5]" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ================= LOGOUT CONFIRMATION MODAL ================= */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6 stroke-[2.2]" />
            </div>

            <h3 className="text-base font-black text-slate-900">
              End Table Session?
            </h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to log out from Table {tableNumber || 'T-06'}? Your active points and orders are saved securely.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLogoutModalOpen(false)}
                className="py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black hover:bg-slate-200 transition"
              >
                Stay Logged In
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogoutModalOpen(false);
                  showToast('Logged out successfully.');
                  if (onNavigateTab) onNavigateTab('home');
                }}
                className="py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black hover:bg-rose-700 transition"
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT PROFILE MODAL ================= */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Edit Profile</h3>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00C060]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00C060]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00C060]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsEditingProfile(false);
                showToast('Profile updated successfully!');
              }}
              className="w-full py-3 rounded-2xl bg-[#00C060] text-white text-xs font-black shadow-md transition active:scale-95"
            >
              Save Profile Changes
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: MY REWARDS / OFFERS ================= */}
      {activeModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 capitalize">
                {activeModal === 'rewards' ? 'My Available Rewards' : activeModal === 'offers' ? 'Special Offers for You' : activeModal.replace('-', ' ')}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeModal === 'rewards' && (
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-[#EBF9F1] border border-emerald-300 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-900 block">Free Iced Cold Coffee</span>
                    <span className="text-[10px] text-emerald-700 font-bold">Unlocked via 5 Stamps</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#00C060] text-white text-[10px] font-black">
                    Ready to Claim
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-900 block">₹50 OFF on Order Above ₹399</span>
                    <span className="text-[10px] text-slate-500 font-bold">Gold Member Perk</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-[10px] font-black">
                    DINE50
                  </span>
                </div>
              </div>
            )}

            {activeModal === 'offers' && (
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-[#EBF9F1] border border-emerald-300">
                  <span className="text-xs font-black text-emerald-800 block">🔥 20% OFF Happy Hours (4 PM - 7 PM)</span>
                  <span className="text-[10px] text-slate-600 font-medium">Valid on all Burgers and Coolers</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300">
                  <span className="text-xs font-black text-amber-800 block">⭐ 2x Loyalty Points Weekend</span>
                  <span className="text-[10px] text-slate-600 font-medium">Double points on every dine-in bill this Saturday</span>
                </div>
              </div>
            )}

            {activeModal !== 'rewards' && activeModal !== 'offers' && (
              <div className="p-4 rounded-2xl bg-slate-50 text-center text-xs font-bold text-slate-600">
                <span>Feature linked to Table {tableNumber || 'T-06'}. Managed by Resto Daddy Floor Management.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
