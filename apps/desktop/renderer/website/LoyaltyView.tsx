import React, { useState } from 'react';
import {
  ArrowLeft,
  ChefHat,
  Search,
  ShoppingBag,
  Armchair,
  Lock,
  Users,
  Gift,
  Coins,
  Stamp,
  Check,
  ChevronRight,
  Info,
  Sparkles,
  CheckCircle2,
  X,
  Percent,
} from 'lucide-react';
import { cheeseBurgerImg, coldCoffeeImg } from './websiteData';

interface LoyaltyViewProps {
  shopName?: string;
  tableNumber?: string;
  guestsCount?: number;
  cartCount?: number;
  onBack?: () => void;
  onOpenCart?: () => void;
  onGoToMenu?: () => void;
}

export const LoyaltyView: React.FC<LoyaltyViewProps> = ({
  shopName = 'Resto Daddy',
  tableNumber = 'T-06',
  guestsCount = 4,
  cartCount = 2,
  onBack,
  onOpenCart,
  onGoToMenu: _onGoToMenu,
}) => {
  // Current Points state (320 matching screenshot)
  const [points, setPoints] = useState<number>(320);

  // Current Stamps state (4 of 5 matching screenshot)
  const [stampsCount, setStampsCount] = useState<number>(4);

  // Selected reward choice: 'coffee' | 'burger'
  const [selectedReward, setSelectedReward] = useState<'coffee' | 'burger'>('coffee');

  // Search input state in header
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Info modal state
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [pointsDrawerOpen, setPointsDrawerOpen] = useState(false);

  // Toast feedback message
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Convert points to Rupee value: 50 points = ₹5 -> 10 points = ₹1
  const pointsRupeeValue = (points / 10).toFixed(2);

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
              placeholder="Search rewards & discounts..."
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
        {/* ================= 3. RESTO DADDY LOYALTY PROGRAM HERO BANNER ================= */}
        <div className="px-4">
          <div
            className="rounded-3xl p-5 text-white relative shadow-md overflow-hidden flex items-center justify-between min-h-[155px]"
            style={{
              background: 'linear-gradient(110deg, #021E0F 0%, #063118 45%, #0A4222 100%)',
            }}
          >
            {/* Glowing Accent Wave */}
            <div
              className="absolute right-0 bottom-0 top-0 w-1/2 opacity-35 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at 85% 50%, rgba(0, 192, 96, 0.5) 0%, transparent 70%)',
              }}
            />

            {/* Banner Left Info */}
            <div className="flex-1 pr-2 z-10">
              <div className="flex items-center gap-2">
                <div>
                  <span className="text-sm font-black text-emerald-400 block tracking-wide">
                    Resto Daddy
                  </span>
                  <h2 className="text-2xl font-black text-white leading-tight tracking-tight mt-0.5">
                    Loyalty Program
                  </h2>
                </div>
                <div className="w-8 h-8 rounded-xl bg-emerald-900/60 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>

              <p className="text-xs font-medium text-emerald-100/90 mt-2 leading-snug">
                Collect Stamps, Earn Points <br />
                & Get Free Treats!
              </p>
            </div>

            {/* Banner Right Image (Cheeseburger & Iced Cold Coffee with whipped cream) */}
            <div className="w-40 h-32 sm:w-44 sm:h-36 relative shrink-0 flex items-center justify-center z-10">
              <div className="relative flex items-center justify-center">
                <img
                  src={cheeseBurgerImg}
                  alt="Cheese Burger"
                  className="w-24 h-24 object-contain filter drop-shadow-xl transform -translate-x-3 translate-y-1"
                />
                <img
                  src={coldCoffeeImg}
                  alt="Iced Cold Coffee"
                  className="w-20 h-28 object-contain filter drop-shadow-2xl transform translate-x-1 -translate-y-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= 4. POINTS BANNER CARD (320 Points | 50 Points = ₹5) ================= */}
        <div className="px-4">
          <div className="rounded-2xl bg-[#EBF9F1] border border-emerald-200/80 p-3.5 px-5 flex items-center justify-between shadow-2xs">
            {/* Left: Your Points 320 > */}
            <button
              type="button"
              onClick={() => setPointsDrawerOpen(true)}
              className="flex items-center gap-3 text-left group transition active:scale-95"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#DCF6E7] text-[#008A46] flex items-center justify-center shrink-0 shadow-2xs">
                <Coins className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">
                  Your Points
                </span>
                <span className="text-2xl font-black text-[#006A35] flex items-center gap-1 leading-tight group-hover:text-emerald-700">
                  <span>{points}</span>
                  <ChevronRight className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                </span>
              </div>
            </button>

            {/* Vertical Divider */}
            <div className="w-px h-9 bg-emerald-200/80" />

            {/* Right: Points Value 50 Points = ₹5 ⓘ */}
            <button
              type="button"
              onClick={() => setInfoModalOpen(true)}
              className="flex flex-col items-start text-left group transition active:scale-95"
            >
              <span className="text-[11px] font-bold text-slate-500 block">
                Points Value
              </span>
              <span className="text-sm font-black text-slate-900 flex items-center gap-1 mt-0.5 group-hover:text-[#008A46]">
                <span>50 Points = ₹5</span>
                <Info className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
              </span>
            </button>
          </div>
        </div>

        {/* ================= 5. LOYALTY STAMPS CARD (4 / 5 Stamps) ================= */}
        <div className="px-4">
          <div className="rounded-3xl bg-white border border-slate-100 shadow-xs p-5 space-y-4">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E7F9F0] text-[#008A46] flex items-center justify-center shrink-0">
                  <Stamp className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Loyalty Stamps</h3>
                  <p className="text-[11px] font-semibold text-slate-400">
                    Collect 5 stamps to get a FREE reward!
                  </p>
                </div>
              </div>

              {/* Status Pill Badge: 4 / 5 Stamps */}
              <span className="px-3 py-1 rounded-full bg-[#E7F9F0] text-[#008A46] text-xs font-black border border-emerald-200/90 shadow-2xs">
                {stampsCount} / 5 Stamps
              </span>
            </div>

            {/* 5 Stamps Row */}
            <div className="flex items-center justify-between px-1 py-1">
              {[1, 2, 3, 4, 5].map((idx) => {
                const isEarned = idx <= stampsCount;

                if (isEarned) {
                  return (
                    /* Green checked scalloped rosette badge matching screenshot */
                    <div
                      key={idx}
                      className="relative flex items-center justify-center w-12 h-12"
                    >
                      {/* Outer Green Rosette */}
                      <div className="w-11 h-11 rounded-full bg-[#00C060] text-white flex items-center justify-center shadow-xs border-2 border-dashed border-emerald-200/80">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                    </div>
                  );
                }

                /* 5th Stamp: Target Gift Stamp with dashed ring */
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (stampsCount < 5) {
                        setStampsCount(5);
                        showToast('🎉 Congratulations! 5th Stamp collected! Free Treat Unlocked!');
                      }
                    }}
                    className="relative flex items-center justify-center w-12 h-12 active:scale-95 transition"
                    aria-label="Unlock 5th Stamp"
                  >
                    <div className="w-11 h-11 rounded-full border-2 border-dashed border-slate-300 text-slate-400 hover:border-[#00C060] hover:text-[#00C060] flex items-center justify-center transition">
                      <Gift className="w-5 h-5 stroke-[1.8]" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Motivational Banner */}
            <div className="rounded-2xl bg-[#E7F9F0] border border-emerald-200/90 py-2.5 px-4 text-center text-[#006A35] text-xs font-black flex items-center justify-center gap-2 shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {stampsCount >= 5
                  ? '🎉 Free Reward Unlocked! Claim below.'
                  : '1 Stamp More to Unlock a Free Treat!'}
              </span>
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
          </div>
        </div>

        {/* ================= 6. YOUR REWARDS SECTION ================= */}
        <div className="px-4">
          <h3 className="text-sm font-black text-slate-900 mb-2.5">Your Rewards</h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Card 1: Free Cold Coffee (Selected by default matching screenshot) */}
            <div
              onClick={() => {
                setSelectedReward('coffee');
                showToast('Selected Reward: Free Cold Coffee');
              }}
              className={`rounded-2xl p-3 flex items-center gap-3 relative transition cursor-pointer active:scale-95 ${
                selectedReward === 'coffee'
                  ? 'bg-[#EBF9F1] border-2 border-emerald-400 shadow-xs'
                  : 'bg-white border border-slate-100 hover:border-slate-200 shadow-2xs'
              }`}
            >
              {/* Coffee Thumbnail */}
              <div className="w-14 h-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={coldCoffeeImg}
                  alt="Free Cold Coffee"
                  className="w-full h-full object-contain filter drop-shadow-xs"
                />
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-slate-900 leading-tight">
                  Free <br />
                  Cold Coffee
                </h4>
                <p className="text-[10px] font-bold text-[#008A46] mt-1 flex items-center gap-1">
                  <Gift className="w-3 h-3 shrink-0" />
                  <span>On 5 Stamps</span>
                </p>
              </div>

              {/* Top Right Checkbox / Radio Circle */}
              <div className="absolute top-2.5 right-2.5">
                {selectedReward === 'coffee' ? (
                  <div className="w-4 h-4 rounded-full bg-[#00C060] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300" />
                )}
              </div>
            </div>

            {/* Card 2: Free Burger */}
            <div
              onClick={() => {
                setSelectedReward('burger');
                showToast('Selected Reward: Free Burger');
              }}
              className={`rounded-2xl p-3 flex items-center gap-3 relative transition cursor-pointer active:scale-95 ${
                selectedReward === 'burger'
                  ? 'bg-[#EBF9F1] border-2 border-emerald-400 shadow-xs'
                  : 'bg-white border border-slate-200/80 hover:border-slate-300 shadow-2xs'
              }`}
            >
              {/* Burger Thumbnail */}
              <div className="w-14 h-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={cheeseBurgerImg}
                  alt="Free Burger"
                  className="w-full h-full object-contain filter drop-shadow-xs"
                />
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-slate-900 leading-tight">
                  Free <br />
                  Burger
                </h4>
                <p className="text-[10px] font-bold text-[#008A46] mt-1 flex items-center gap-1">
                  <Gift className="w-3 h-3 shrink-0" />
                  <span>On 5 Stamps</span>
                </p>
              </div>

              {/* Top Right Radio Circle */}
              <div className="absolute top-2.5 right-2.5">
                {selectedReward === 'burger' ? (
                  <div className="w-4 h-4 rounded-full bg-[#00C060] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= 7. HOW IT WORKS? SECTION ================= */}
        <div className="px-4">
          <h3 className="text-sm font-black text-slate-900 mb-2.5">How It Works?</h3>

          <div className="rounded-3xl bg-white border border-slate-100 shadow-xs p-4">
            <div className="grid grid-cols-3 gap-2">
              {/* Step 1: Collect Stamps */}
              <div className="flex flex-col items-start text-left">
                <div className="relative mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#E7F9F0] text-[#008A46] flex items-center justify-center font-black shadow-2xs">
                    <Stamp className="w-5 h-5" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00C060] text-white text-[9px] font-black flex items-center justify-center">
                    1
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-900 leading-tight flex items-center gap-0.5">
                  <span>Collect Stamps</span>
                  <span className="text-slate-400 text-[10px]">&gt;</span>
                </h4>
                <p className="text-[10px] font-semibold text-slate-400 mt-1 leading-snug">
                  Get 1 stamp on eligible orders.
                </p>
              </div>

              {/* Step 2: Earn Points */}
              <div className="flex flex-col items-start text-left">
                <div className="relative mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#E7F9F0] text-[#008A46] flex items-center justify-center font-black shadow-2xs">
                    <Coins className="w-5 h-5" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00C060] text-white text-[9px] font-black flex items-center justify-center">
                    2
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-900 leading-tight flex items-center gap-0.5">
                  <span>Earn Points</span>
                  <span className="text-slate-400 text-[10px]">&gt;</span>
                </h4>
                <p className="text-[10px] font-semibold text-slate-400 mt-1 leading-snug">
                  Get points on every order.
                </p>
              </div>

              {/* Step 3: Redeem & Enjoy */}
              <div className="flex flex-col items-start text-left">
                <div className="relative mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#E7F9F0] text-[#008A46] flex items-center justify-center font-black shadow-2xs">
                    <Gift className="w-5 h-5" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00C060] text-white text-[9px] font-black flex items-center justify-center">
                    3
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">
                  Redeem & Enjoy
                </h4>
                <p className="text-[10px] font-semibold text-slate-400 mt-1 leading-snug">
                  Use 50 points = ₹5 off or unlock free treats with 5 stamps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL: POINTS DETAIL MODAL ================= */}
      {pointsDrawerOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E7F9F0] text-[#008A46] flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Your Reward Points: {points}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400">
                    Equivalent Cash Value: ₹{pointsRupeeValue}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPointsDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Total Points Balance</span>
                <span className="text-[#008A46] font-black">{points} Pts</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Earn Rate</span>
                <span>10 Pts per ₹100 spent</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Redemption Rate</span>
                <span>50 Pts = ₹5.00</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900">
                <span>Instant Discount at Checkout</span>
                <span className="text-[#008A46]">₹{pointsRupeeValue} OFF</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setPoints((p) => Math.max(0, p - 50));
                showToast(`Applied ₹${pointsRupeeValue} discount to Table ${tableNumber}!`);
                setPointsDrawerOpen(false);
              }}
              className="w-full py-3 rounded-2xl bg-[#00C060] text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Percent className="w-4 h-4" />
              <span>Redeem ₹{pointsRupeeValue} on Current Bill</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: POINTS EXPLAINER ⓘ ================= */}
      {infoModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-[#E7F9F0] text-[#008A46] flex items-center justify-center mx-auto">
              <Info className="w-6 h-6 stroke-[2.2]" />
            </div>

            <h3 className="text-base font-black text-slate-900">
              50 Points = ₹5.00
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every ₹10 spent on food & drinks earns you 1 reward point. Accumulate 50 points to deduct ₹5 directly from your dine-in bill!
            </p>

            <button
              type="button"
              onClick={() => setInfoModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#00C060] text-white text-xs font-black hover:bg-[#00A854] transition"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
