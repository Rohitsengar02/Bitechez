import React, { useState } from 'react';
import {
  ArrowLeft,
  ChefHat,
  Search,
  ShoppingBag,
  Armchair,
  Lock,
  Users,
  Star,
  Send,
  ExternalLink,
  UtensilsCrossed,
  Bell,
  Store,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  QrCode,
} from 'lucide-react';
import { cheeseBurgerImg } from './websiteData';

interface ReviewViewProps {
  shopName?: string;
  tableNumber?: string;
  hasTable?: boolean;
  guestsCount?: number;
  cartCount?: number;
  onBack?: () => void;
  onOpenCart?: () => void;
}

interface DinerReview {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
  avatarChar: string;
  avatarBg: string;
  avatarColor: string;
  tags?: string[];
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  shopName = 'Resto Daddy',
  tableNumber = 'T-06',
  hasTable = true,
  guestsCount = 4,
  cartCount = 2,
  onBack,
  onOpenCart,
}) => {
  // Interactive Rating state (default 4 stars to match reference image)
  const [rating, setRating] = useState<number>(4);
  const [hoverRating, setHoverRating] = useState<number>(0);

  // Review comment state
  const [comment, setComment] = useState<string>('');
  const [dinerName] = useState<string>('Guest Diner');

  // 4 Interactive Category Pills: Food Quality | Service | Ambience | Cleanliness
  const [selectedPills, setSelectedPills] = useState<string[]>(['Food Quality']);

  // Search input state in header
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast feedback message
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // View All Reviews toggle
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Recent Reviews list (Aman Verma on top matching screenshot)
  const [recentReviews, setRecentReviews] = useState<DinerReview[]>([
    {
      id: 'rev-1',
      name: 'Aman Verma',
      rating: 5,
      date: '2 days ago',
      comment:
        'Amazing food and great service! The burger was delicious and the staff was very polite.',
      avatarChar: 'A',
      avatarBg: 'bg-[#DCF6E7]',
      avatarColor: 'text-[#008A46]',
      tags: ['Food Quality', 'Service'],
    },
    {
      id: 'rev-2',
      name: 'Priya Sharma',
      rating: 5,
      date: '4 days ago',
      comment:
        'Loved the authentic pizza and iced cooler! Super clean table and easy QR order process.',
      avatarChar: 'P',
      avatarBg: 'bg-purple-100',
      avatarColor: 'text-purple-700',
      tags: ['Cleanliness', 'Food Quality'],
    },
    {
      id: 'rev-3',
      name: 'Rohan Patel',
      rating: 4,
      date: '1 week ago',
      comment:
        'Crispy salted fries and great dining vibe. Chef special cheese burger is a must try!',
      avatarChar: 'R',
      avatarBg: 'bg-sky-100',
      avatarColor: 'text-sky-700',
      tags: ['Ambience'],
    },
  ]);

  // Rating descriptor mapping
  const getRatingLabel = (val: number) => {
    switch (val) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Average';
      case 4:
        return 'Good';
      case 5:
        return 'Excellent';
      default:
        return 'Good';
    }
  };

  const activeRating = hoverRating || rating;

  // Toggle category pill
  const togglePill = (pillName: string) => {
    setSelectedPills((prev) =>
      prev.includes(pillName) ? prev.filter((p) => p !== pillName) : [...prev, pillName]
    );
  };

  // Submit Review Handler
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() && selectedPills.length === 0) {
      showToast('Please add a short note about your experience!');
      return;
    }

    const nameToUse = dinerName.trim() || 'Verified Diner';
    const newReview: DinerReview = {
      id: `rev-${Date.now()}`,
      name: nameToUse,
      rating,
      date: 'Just now',
      comment:
        comment.trim() ||
        `Great dining experience! Loved the ${selectedPills.join(', ') || 'food & service'}.`,
      avatarChar: nameToUse.charAt(0).toUpperCase(),
      avatarBg: 'bg-[#DCF6E7]',
      avatarColor: 'text-[#008A46]',
      tags: selectedPills,
    };

    setRecentReviews((prev) => [newReview, ...prev]);
    setComment('');
    showToast('Thank you! Your review has been submitted.');
  };

  // Google Review click handler
  const handleGoogleReview = () => {
    window.open('https://www.google.com/search?q=resto+daddy+restaurant+reviews', '_blank');
  };

  return (
    <div className="min-h-full flex flex-col bg-[#F8FAF9] pb-28 text-slate-900 select-none">
      {/* Toast alert */}
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
              placeholder="Search feedback & dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-emerald-200/50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#00C060]"
              autoFocus
            />
          </div>
        )}
      </header>

      {/* ================= 2. TABLE STATUS BAR ================= */}
      <div className="px-4 pt-3 shrink-0">
        {hasTable ? (
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
        ) : (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 shadow-xs p-3 px-4 flex items-center justify-between text-amber-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="text-xs font-black block">Table QR Not Scanned</span>
                <span className="text-[10px] text-amber-700 font-medium">
                  Scan table QR to unlock digital food ordering & menu
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-200/70 text-amber-800 flex items-center justify-center shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 pt-3">
        {/* ================= 3. SHARE YOUR EXPERIENCE HERO BANNER ================= */}
        <div className="px-4">
          <div
            className="rounded-3xl p-5 text-white relative shadow-md overflow-hidden flex items-center justify-between min-h-[145px]"
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
            <div className="flex-1 pr-3 z-10">
              <h2 className="text-2xl font-black text-white leading-tight tracking-tight">
                Share Your <br />
                Experience
              </h2>
              <p className="text-xs font-medium text-emerald-100/90 mt-1.5 leading-snug">
                Your feedback helps us serve you better!
              </p>
            </div>

            {/* Banner Right Image (Cheeseburger with French Fries in cup) */}
            <div className="w-36 h-28 sm:w-40 sm:h-32 relative shrink-0 flex items-center justify-center z-10">
              <img
                src={cheeseBurgerImg}
                alt="Resto Daddy Experience"
                className="max-h-full max-w-full object-contain filter drop-shadow-xl transform scale-105"
              />
            </div>
          </div>
        </div>

        {/* ================= 4. RATE YOUR EXPERIENCE CARD ================= */}
        <div className="px-4">
          <div className="rounded-3xl bg-white border border-slate-100 shadow-xs p-5 space-y-4">
            {/* Header Title */}
            <h3 className="text-base font-black text-slate-900 text-center tracking-tight">
              Rate Your Experience
            </h3>

            {/* 5 Big Interactive Stars */}
            <div className="flex items-center justify-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isFilled = starVal <= activeRating;

                return (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRating(starVal)}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform active:scale-90 hover:scale-110 focus:outline-none"
                    aria-label={`Rate ${starVal} stars`}
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        isFilled
                          ? 'fill-[#FFA41C] text-[#FFA41C] drop-shadow-xs'
                          : 'fill-transparent text-slate-300 stroke-[1.8]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Rating Descriptor Pill ("Good" matching screenshot) */}
            <div className="flex justify-center">
              <span className="px-3.5 py-1 rounded-full bg-[#E7F9F0] text-[#008A46] text-xs font-black tracking-tight border border-emerald-200/80">
                {getRatingLabel(activeRating)}
              </span>
            </div>

            {/* Experience Textarea */}
            <div className="relative">
              <textarea
                rows={3}
                maxLength={500}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience..."
                className="w-full p-3.5 rounded-2xl bg-white border border-slate-200/80 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C060] resize-none"
              />
              <span className="absolute right-3.5 bottom-2.5 text-[10px] font-bold text-slate-400">
                {comment.length} / 500
              </span>
            </div>

            {/* 4 Interactive Feedback Category Tag Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
              {/* 1. Food Quality */}
              <button
                type="button"
                onClick={() => togglePill('Food Quality')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 ${
                  selectedPills.includes('Food Quality')
                    ? 'bg-[#E7F9F0] border border-emerald-300 text-[#008A46]'
                    : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate">Food Quality</span>
              </button>

              {/* 2. Service */}
              <button
                type="button"
                onClick={() => togglePill('Service')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 ${
                  selectedPills.includes('Service')
                    ? 'bg-[#E7F9F0] border border-emerald-300 text-[#008A46]'
                    : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate">Service</span>
              </button>

              {/* 3. Ambience */}
              <button
                type="button"
                onClick={() => togglePill('Ambience')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 ${
                  selectedPills.includes('Ambience')
                    ? 'bg-[#E7F9F0] border border-emerald-300 text-[#008A46]'
                    : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate">Ambience</span>
              </button>

              {/* 4. Cleanliness */}
              <button
                type="button"
                onClick={() => togglePill('Cleanliness')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 ${
                  selectedPills.includes('Cleanliness')
                    ? 'bg-[#E7F9F0] border border-emerald-300 text-[#008A46]'
                    : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate">Cleanliness</span>
              </button>
            </div>

            {/* Primary Submit Review Button */}
            <button
              type="button"
              onClick={handleSubmitReview}
              className="w-full py-3.5 rounded-2xl bg-[#00C060] hover:bg-[#00A854] text-white text-xs font-black shadow-sm flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Send className="w-4 h-4 stroke-[2.2]" />
              <span>Submit Review</span>
            </button>
          </div>
        </div>

        {/* ================= 5. DIVIDER ("or") ================= */}
        <div className="px-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200/90" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-px bg-slate-200/90" />
          </div>
        </div>

        {/* ================= 6. REVIEW US ON GOOGLE CARD ================= */}
        <div className="px-4">
          <div
            onClick={handleGoogleReview}
            className="rounded-2xl bg-[#EBF9F1] border border-emerald-200/80 p-4 flex items-center justify-between shadow-2xs hover:border-[#00C060] hover:shadow-xs transition cursor-pointer group active:scale-[0.99]"
          >
            {/* Left side with Google "G" icon */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-2xs">
                {/* Google multi-colored G logo */}
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-900 group-hover:text-[#008A46] transition">
                  Review Us on Google
                </h4>
                <p className="text-[11px] font-medium text-slate-500 leading-tight mt-0.5">
                  Help others by sharing your experience on Google.
                </p>
              </div>
            </div>

            {/* Right side external link icon */}
            <div className="w-9 h-9 rounded-xl bg-white/80 group-hover:bg-white text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60 shadow-2xs transition">
              <ExternalLink className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
        </div>

        {/* ================= 7. RECENT REVIEWS SECTION ================= */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-black text-slate-900">Recent Reviews</h3>
            <button
              type="button"
              onClick={() => setShowAllReviews((v) => !v)}
              className="text-xs font-bold text-[#008A46] hover:underline flex items-center gap-1"
            >
              <span>{showAllReviews ? 'Show Less' : 'View All'}</span>
              <span>→</span>
            </button>
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            {(showAllReviews ? recentReviews : recentReviews.slice(0, 1)).map((rev) => (
              <div
                key={rev.id}
                className="rounded-3xl bg-white border border-slate-100 shadow-xs p-4 sm:p-5 space-y-2.5 transition hover:border-slate-200"
              >
                {/* Reviewer Header */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${rev.avatarBg} ${rev.avatarColor} flex items-center justify-center font-black text-sm shrink-0`}
                  >
                    <span>{rev.avatarChar}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900">{rev.name}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {/* 5 Filled Stars */}
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i <= rev.rating
                                ? 'fill-[#FFA41C] text-[#FFA41C]'
                                : 'fill-transparent text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        • {rev.date}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-xs font-medium text-slate-700 leading-relaxed pl-0.5">
                  {rev.comment}
                </p>

                {/* Tags if any */}
                {rev.tags && rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {rev.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-100"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
