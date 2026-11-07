import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Plus,
  Minus,
  Lock,
  Armchair,
  ArrowRight,
  ArrowLeft,
  ChefHat,
  Heart,
  SlidersHorizontal,
  Users,
  Star,
} from 'lucide-react';
import {
  RESTO_CATEGORIES,
  RESTO_PRODUCTS,
  WebsiteProduct,
  cheeseBurgerImg,
} from './websiteData';
import { CartItem } from './OrdersView';

interface HomeMenuViewProps {
  shopName: string;
  tableNumber: string;
  guestsCount?: number;
  cart: CartItem[];
  onAddToCart: (product: WebsiteProduct) => void;
  onRemoveFromCart: (productId: string) => void;
  onOpenCart: () => void;
  onBack?: () => void;
}

export const HomeMenuView: React.FC<HomeMenuViewProps> = ({
  shopName,
  tableNumber,
  guestsCount = 4,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onOpenCart,
  onBack,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'priceLow' | 'priceHigh'>('popular');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Categories carousel drag-to-scroll & smooth buttons
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setDragStartX(e.pageX - carouselRef.current.offsetLeft);
    setDragScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - dragStartX) * 1.6;
    if (Math.abs(walk) > 4) {
      setHasDragged(true);
    }
    carouselRef.current.scrollLeft = dragScrollLeft - walk;
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -190 : 190,
      behavior: 'smooth',
    });
  };

  const cartMap = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach((c) => {
      map[c.product.id] = c.quantity;
    });
    return map;
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((sum, c) => sum + c.quantity, 0);
  }, [cart]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredProducts = useMemo(() => {
    let list = RESTO_PRODUCTS.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (
        searchQuery &&
        !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });

    if (sortBy === 'priceLow') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceHigh') {
      list = [...list].sort((a, b) => b.price - a.price);
    }

    return list;
  }, [selectedCategory, searchQuery, sortBy]);

  // Format outlet name nicely, default to 'Resto Daddy' to match screenshot
  const displayTitle = shopName && shopName.toLowerCase() !== 'cyberlim'
    ? shopName.charAt(0).toUpperCase() + shopName.slice(1).replace(/[-_]/g, ' ')
    : 'Resto Daddy';

  return (
    <div className="min-h-full flex flex-col bg-[#F8FAF9] pb-24 text-slate-900 select-none">
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
                {displayTitle}
              </h1>
              <p className="text-[11px] font-bold text-emerald-200/80 flex items-center gap-1 mt-0.5 truncate">
                <span>Main Outlet • Outlet No. 01</span>
                <ChevronDown className="w-3.5 h-3.5 shrink-0" />
              </p>
            </div>
          </div>

          {/* Right Action Circle Buttons (Search & Cart Bag) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition active:scale-95"
              aria-label="Search items"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="relative w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition active:scale-95"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#00C060] text-white text-[11px] font-black flex items-center justify-center shadow-md animate-in zoom-in-75">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Search Input */}
        {searchOpen && (
          <div className="mt-3 relative animate-in fade-in slide-in-from-top-2 duration-200">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search burgers, pizzas, fries, drinks..."
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

      {/* ================= 3. FEATURED PROMOTIONAL BANNER ================= */}
      {selectedCategory === 'all' && !searchQuery && (
        <div className="px-4 pt-3 shrink-0">
          <div
            className="rounded-3xl overflow-hidden text-white p-5 relative shadow-md flex items-center justify-between min-h-[165px]"
            style={{
              background: 'linear-gradient(105deg, #021E0F 0%, #063118 45%, #0A4222 100%)',
            }}
          >
            {/* Banner Left Info */}
            <div className="flex-1 pr-2 z-10">
              <span className="text-xs font-bold text-emerald-400 block tracking-wide">
                Chef's Special
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 leading-tight tracking-tight">
                Cheese Burger
              </h2>
              <p className="text-xs font-medium text-emerald-100/80 mt-1 leading-snug">
                Juicy, Cheesy, Signature Taste
              </p>
              <button
                type="button"
                onClick={() => onAddToCart(RESTO_PRODUCTS[0])}
                className="mt-3.5 px-4 py-2 rounded-full bg-[#E7F9F0] hover:bg-white text-[#006A35] font-black text-xs transition flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <span>Order Now</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Banner Right Image (Cheeseburger with French fries) */}
            <div className="w-36 h-32 sm:w-44 sm:h-36 relative shrink-0 flex items-center justify-center">
              <img
                src={cheeseBurgerImg}
                alt="Chef's Special Cheese Burger"
                className="max-h-full max-w-full object-contain filter drop-shadow-xl transform scale-105"
              />
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            <span className="w-5 h-1.5 rounded-full bg-[#00C060]" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          </div>
        </div>
      )}

      {/* ================= 4. CATEGORY CAROUSEL (All, Burgers, Pizza, Wraps, Fries, Beverages, Desserts) ================= */}
      <div className="pt-3.5 shrink-0 relative group/carousel">
        {/* Subtle Desktop Left/Right Scroll Arrows */}
        <button
          type="button"
          onClick={() => scrollCarousel('left')}
          className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/95 border border-slate-200/80 shadow-md items-center justify-center text-slate-700 hover:text-black hover:scale-105 transition opacity-0 group-hover/carousel:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={() => scrollCarousel('right')}
          className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/95 border border-slate-200/80 shadow-md items-center justify-center text-slate-700 hover:text-black hover:scale-105 transition opacity-0 group-hover/carousel:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Horizontally Scrollable Carousel */}
        <div
          ref={carouselRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex items-center gap-3 overflow-x-auto scrollbar-none px-4 py-1.5 snap-x select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {RESTO_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  if (!hasDragged) {
                    setSelectedCategory(cat.id);
                  }
                }}
                className="flex flex-col items-center gap-1.5 shrink-0 snap-start transition-transform active:scale-95 group/cat focus:outline-none"
              >
                <div
                  className={`w-[68px] h-[68px] rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-150 ${
                    isSelected
                      ? cat.isGridIcon
                        ? 'bg-[#E7F9F0] border-2 border-[#00C060] shadow-sm scale-105'
                        : 'bg-white border-2 border-[#00C060] shadow-sm ring-2 ring-[#00C060]/20 scale-105'
                      : cat.isGridIcon
                      ? 'bg-[#E7F9F0] border border-emerald-300/60 shadow-2xs hover:border-[#00C060]'
                      : 'bg-white border border-slate-100/90 shadow-2xs hover:border-slate-200 hover:shadow-xs'
                  }`}
                >
                  {cat.isGridIcon ? (
                    /* Custom 4-dots grid icon matching user reference screenshot */
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
                      <circle cx="7" cy="7" r="3.2" fill="#00C060" />
                      <circle cx="17" cy="7" r="3.2" fill="#00C060" />
                      <circle cx="7" cy="17" r="3.2" fill="#00C060" />
                      <circle cx="17" cy="17" r="2.5" stroke="#00C060" strokeWidth="1.8" fill="none" />
                    </svg>
                  ) : (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-12 h-12 object-contain filter drop-shadow-xs pointer-events-none"
                      loading="lazy"
                    />
                  )}
                </div>

                <span
                  className={`text-[12px] tracking-tight ${
                    isSelected
                      ? 'font-black text-[#00C060]'
                      : 'font-bold text-slate-700 group-hover/cat:text-slate-900'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 5. ALL ITEMS HEADER WITH SORT DROPDOWN ================= */}
      <div className="px-4 pt-3 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-lg font-black text-slate-900 leading-tight">All Items</h3>
          <span className="text-xs font-bold text-slate-400">
            {filteredProducts.length} Items
          </span>
        </div>

        {/* Sort Pill Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSortDropdownOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs hover:border-slate-300 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span className="capitalize">
              {sortBy === 'popular' ? 'Popular' : sortBy === 'priceLow' ? 'Price: Low' : 'Price: High'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {sortDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1 z-30 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={() => {
                  setSortBy('popular');
                  setSortDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs font-bold ${
                  sortBy === 'popular' ? 'bg-emerald-50 text-[#00C060]' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Popular
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortBy('priceLow');
                  setSortDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs font-bold ${
                  sortBy === 'priceLow' ? 'bg-emerald-50 text-[#00C060]' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Price: Low to High
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortBy('priceHigh');
                  setSortDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs font-bold ${
                  sortBy === 'priceHigh' ? 'bg-emerald-50 text-[#00C060]' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Price: High to Low
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= 6. 2-COLUMN PRODUCT CARDS GRID (EXACT MATCH TO SCREENSHOT) ================= */}
      <div className="px-4 pt-3 flex-1">
        <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
          {filteredProducts.map((prod) => {
            const qty = cartMap[prod.id] || 0;
            const isFav = favorites[prod.id];

            return (
              <div
                key={prod.id}
                className="rounded-3xl bg-white border border-slate-100 p-2.5 sm:p-3 flex flex-col justify-between shadow-xs hover:shadow-md transition text-left group relative overflow-hidden"
              >
                {/* Image Box with Badges */}
                <div className="relative w-full h-32 sm:h-36 rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center p-1">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Bestseller Badge (matching top-left badge) */}
                  {prod.isBestseller && (
                    <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E7F9F0] text-[#00C060] text-[10px] font-black border border-emerald-200/80 shadow-2xs backdrop-blur-xs">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>Bestseller</span>
                    </div>
                  )}

                  {/* Favorite Heart Button (matching top-right circle) */}
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(prod.id, e)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 text-slate-400 hover:text-rose-500 flex items-center justify-center shadow-xs transition active:scale-90"
                    aria-label="Add to favorites"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isFav ? 'text-rose-500 fill-rose-500' : 'text-slate-700'
                      }`}
                    />
                  </button>
                </div>

                {/* Title & Veg Indicator Row */}
                <div className="mt-2.5 flex items-start gap-1 min-w-0">
                  {prod.isVeg && (
                    <span
                      className="w-3.5 h-3.5 rounded border border-emerald-600 flex items-center justify-center shrink-0 mt-0.5 mr-0.5"
                      title="Vegetarian"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    </span>
                  )}
                  <h4 className="text-sm font-black text-slate-900 leading-tight truncate">
                    {prod.name}
                  </h4>
                </div>

                {/* Subtitle / Description */}
                <p className="text-[11px] font-semibold text-slate-400 line-clamp-1 mt-0.5">
                  {prod.subtitle}
                </p>

                {/* Price & + Add Button Row */}
                <div className="mt-2.5 pt-1 border-t border-slate-50 flex items-center justify-between gap-1">
                  <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                    ₹{prod.price}
                  </span>

                  {/* + Add button or Stepper */}
                  {qty > 0 ? (
                    <div className="flex items-center gap-1.5 rounded-xl bg-[#00C060] text-white px-2 py-1 text-xs font-black shadow-xs">
                      <button
                        type="button"
                        onClick={() => onRemoveFromCart(prod.id)}
                        className="hover:scale-110 active:scale-95"
                      >
                        <Minus className="w-3 h-3 stroke-[3]" />
                      </button>
                      <span className="w-3 text-center">{qty}</span>
                      <button
                        type="button"
                        onClick={() => onAddToCart(prod)}
                        className="hover:scale-110 active:scale-95"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onAddToCart(prod)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#E7F9F0] text-[#00C060] hover:bg-[#00C060] hover:text-white border border-emerald-200 text-xs font-black transition active:scale-95 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Cart Bar (when cart has items) */}
      {totalItems > 0 && (
        <div className="fixed bottom-16 inset-x-3 sm:max-w-md sm:mx-auto z-40 bg-slate-900 text-white rounded-2xl shadow-2xl p-3 flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-200 border border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00C060] text-white flex items-center justify-center font-black">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black">
                <span>{totalItems} {totalItems === 1 ? 'item' : 'items'} in order</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-400">
                Table {tableNumber || 'T-06'} • Tap to checkout
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCart}
            className="px-3.5 py-2 rounded-xl bg-[#00C060] hover:bg-[#00A850] text-white text-xs font-black shadow-md flex items-center gap-1 transition"
          >
            <span>View Bag</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
