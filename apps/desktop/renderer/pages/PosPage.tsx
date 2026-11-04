import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { jsPDF as JsPDF } from 'jspdf';
import {
  Search,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  CheckCircle2,
  Utensils,
  ShoppingBag,
  Trash2,
  Pause,
  History,
  FileText,
  ChefHat,
  Bike,
  CalendarDays,
  Armchair,
  Users,
  ChevronDown,
  LayoutGrid,
  List,
  Heart,
  MoreHorizontal,
  PencilLine,
  BadgePercent,
  Split,
  ArrowRight,
  Download,
  Eye,
  X,
  Clock,
  Pizza,
  IceCreamCone,
  CupSoda,
  CakeSlice,
  Popcorn,
  Gift,
  Soup,
  Coffee,
  Salad,
  Sandwich,
  Drumstick,
  UtensilsCrossed,
  AlertCircle,
  RotateCcw,
  Play,
  Receipt,
  Monitor,
  Loader2,
} from 'lucide-react';
import { MenuItem, Category, RestaurantTable } from '@bitechez/shared-types';
import { formatINR, paiseToRupees } from '@bitechez/business-logic';
import { useCartStore } from '../stores/cartStore';
import { apiService, OUTLET_ID } from '../services/api';
import {
  buildBillPdf,
  buildInvoicePdf,
  buildKotPdf,
  outputPdf,
  upiQrDataUrl,
  OUTLET_INFO,
  type BillDoc,
  type BillPayment,
  type KotDoc,
  type OrderTypeKey,
  type PdfMode,
} from '../utils/posPdf';

/* =====================================================================
   CONFIG
   ===================================================================== */
const CASHIER = { id: '00000000-0000-0000-0000-000000000001', name: 'Rohit Sengar' };
/** Height of header + top nav. The POS fills the rest of the screen and never scrolls the page. */
const POS_OFFSET = '9.75rem';

const OFFERS = [
  { code: 'WELCOME10', pct: 10, desc: '10% off for first-time guests' },
  { code: 'HAPPY15', pct: 15, desc: 'Happy hours · 4 PM – 7 PM' },
  { code: 'FEAST20', pct: 20, desc: 'On bills above ₹1,500', minPaise: 150000 },
  { code: 'REGULAR5', pct: 5, desc: 'Regular customers / staff' },
];
const NOTE_TAGS = ['Less spicy', 'Extra spicy', 'No onion', 'No garlic', 'Jain', 'Extra cheese', 'Pack separately', 'Serve hot'];

type PayMethod = 'cash' | 'upi' | 'card';
type PayTab = PayMethod | 'split';
type ModalKind = null | 'pay' | 'offer' | 'note' | 'itemNote' | 'held' | 'history' | 'kot' | 'reservation' | 'newOrder';
type SortKey = 'bestseller' | 'priceAsc' | 'priceDesc' | 'name';
type Customer = { name?: string; phone?: string; address?: string };
type CartEntry = { item: MenuItem; quantity: number; notes?: string };

interface HeldOrder {
  id: string;
  orderNumber: string;
  heldAt: string;
  orderType: OrderTypeKey;
  tableId?: string;
  tableName?: string;
  guests: number;
  discountPercentage: number;
  offerCode?: string;
  orderNote: string;
  itemNotes: Record<string, string>;
  customer: Customer;
  sentQty: Record<string, number>;
  entries: { item: MenuItem; quantity: number }[];
  totalPaise: number;
}
type RecentOrder = BillDoc & { id: string; itemIds: { id: string; qty: number }[] };
type KotEntry = KotDoc & { id: string; status: 'pending' | 'preparing' | 'ready' | 'served' };
interface Reservation {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  tableId?: string;
  tableName?: string;
  note?: string;
}

/* =====================================================================
   HELPERS
   ===================================================================== */
const newOrderNumber = () => `BTZ-${Date.now().toString().slice(-6)}`;
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const toPaise = (rupees: string) => Math.round((parseFloat(rupees) || 0) * 100);
const timeAgo = (iso: string) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h ago` : new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};
const ORDER_TYPE_LABEL: Record<OrderTypeKey, string> = { dine_in: 'Dine In', takeaway: 'Takeaway', delivery: 'Delivery' };

function usePersisted<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? (JSON.parse(s) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {
      /* storage full / private mode */
    }
  }, [key, v]);
  return [v, setV] as const;
}

function nextKotNumber() {
  const today = new Date().toISOString().slice(0, 10);
  let seq = { date: today, n: 0 };
  try {
    const s = JSON.parse(localStorage.getItem('pos.kotSeq') || 'null');
    if (s && s.date === today) seq = s;
  } catch {
    /* ignore */
  }
  seq.n += 1;
  try {
    localStorage.setItem('pos.kotSeq', JSON.stringify(seq));
  } catch {
    /* ignore */
  }
  return seq.n;
}

function useOutside(ref: React.RefObject<HTMLElement>, onOut: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOut();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [active, onOut, ref]);
}

const catIcon = (name = '') => {
  const n = name.toLowerCase();
  if (/burger|sandwich|wrap/.test(n)) return Sandwich;
  if (/pizza/.test(n)) return Pizza;
  if (/ice|kulfi|gelato/.test(n)) return IceCreamCone;
  if (/bever|drink|shake|juice|mocktail|soda/.test(n)) return CupSoda;
  if (/coffee|tea|chai/.test(n)) return Coffee;
  if (/dessert|sweet|cake|bakery/.test(n)) return CakeSlice;
  if (/snack|fries|starter|chaat/.test(n)) return Popcorn;
  if (/combo|meal|thali/.test(n)) return Gift;
  if (/soup|biryani|rice|curry|main|noodle/.test(n)) return Soup;
  if (/salad|healthy/.test(n)) return Salad;
  if (/chicken|tandoor|kebab|non/.test(n)) return Drumstick;
  return UtensilsCrossed;
};

const itemEmoji = (name = '', cat = '') => {
  const n = `${name} ${cat}`.toLowerCase();
  const map: [RegExp, string][] = [
    [/burger/, '🍔'], [/pizza/, '🍕'], [/fries/, '🍟'], [/coffee|latte|cappuccino/, '☕'], [/ice ?cream|sundae|kulfi/, '🍨'],
    [/mojito|mocktail|lemon|soda|cola/, '🍹'], [/shake|smoothie/, '🥤'], [/tea|chai/, '🍵'], [/biryani/, '🍛'], [/rice/, '🍚'],
    [/noodle|chowmein|hakka/, '🍜'], [/dosa|idli|uttapam/, '🥞'], [/tikka|kebab|tandoor/, '🍢'], [/chicken|wings/, '🍗'],
    [/paneer|curry|dal|masala/, '🍲'], [/sandwich|wrap|roll/, '🥪'], [/cake|pastry|brownie|dessert/, '🍰'],
    [/salad/, '🥗'], [/soup/, '🥣'], [/pasta/, '🍝'], [/momo|dumpling/, '🥟'], [/combo|meal|thali/, '🍱'], [/bread|naan|roti|paratha/, '🫓'],
  ];
  return map.find(([r]) => r.test(n))?.[1] ?? '🍽️';
};

const itemImage = (item: MenuItem): string | undefined => {
  const a = item as unknown as Record<string, unknown>;
  return (a.imageUrl || a.image || a.thumbnailUrl) as string | undefined;
};

/* =====================================================================
   CSS
   ===================================================================== */
const CSS = `
.pos-scroll{scrollbar-width:thin;scrollbar-color:#ECC7D3 transparent}
.pos-scroll::-webkit-scrollbar{width:6px;height:6px}
.pos-scroll::-webkit-scrollbar-thumb{background:#ECC7D3;border-radius:9999px}
.pos-scroll::-webkit-scrollbar-track{background:transparent}
.pos-noscroll{scrollbar-width:none}.pos-noscroll::-webkit-scrollbar{display:none}
@keyframes pos-fade{from{opacity:0}}.pos-fade{animation:pos-fade .2s ease both}
@keyframes pos-pop{from{opacity:0;transform:translateY(10px) scale(.97)}}.pos-pop{animation:pos-pop .28s cubic-bezier(.22,1,.36,1) both}
@keyframes pos-in{from{opacity:0;transform:translateX(14px)}}.pos-in{animation:pos-in .32s cubic-bezier(.22,1,.36,1) both}
@keyframes pos-card{from{opacity:0;transform:translateY(10px)}}.pos-card{animation:pos-card .38s cubic-bezier(.22,1,.36,1) both}
@keyframes pos-bump{35%{transform:scale(1.3)}}.pos-bump{animation:pos-bump .35s ease}
@keyframes pos-toast{from{opacity:0;transform:translateY(-12px)}}.pos-toast{animation:pos-toast .3s cubic-bezier(.22,1,.36,1) both}
@media (prefers-reduced-motion:reduce){.pos-root *{animation:none!important;transition:none!important}}
`;

/* =====================================================================
   SMALL UI PIECES
   ===================================================================== */
const VegMark = ({ veg }: { veg?: boolean }) => (
  <span
    title={veg ? 'Veg' : 'Non-veg'}
    className={`w-3.5 h-3.5 rounded-[3px] border-[1.5px] flex items-center justify-center bg-white shrink-0 ${veg ? 'border-emerald-600' : 'border-rose-600'}`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${veg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
  </span>
);

const Thumb = memo(({ item, catName, className = '', emojiCls = 'text-3xl' }: { item: MenuItem; catName?: string; className?: string; emojiCls?: string }) => {
  const [broken, setBroken] = useState(false);
  const src = itemImage(item);
  return (
    <div className={`bg-gradient-to-b from-[#FFF0F4] to-[#FFF9FB] flex items-center justify-center overflow-hidden ${className}`}>
      {src && !broken ? (
        <img src={src} alt={item.name} loading="lazy" decoding="async" onError={() => setBroken(true)} className="w-[82%] h-[86%] object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105" />
      ) : (
        <span className={`${emojiCls} leading-none select-none transition-transform duration-300 group-hover:scale-110`}>{itemEmoji(item.name, catName)}</span>
      )}
    </div>
  );
});

const Stepper = ({ qty, onDec, onInc, size = 'md' }: { qty: number; onDec: () => void; onInc: () => void; size?: 'sm' | 'md' }) => {
  const b = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7';
  return (
    <div className="inline-flex items-center rounded-lg border border-[#F3C3D2] bg-white overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <button onClick={onDec} className={`${b} flex items-center justify-center text-[#800D32] hover:bg-[#FDEBF1] active:scale-90 transition`} aria-label="Decrease">
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span key={qty} className="pos-bump min-w-[22px] text-center text-xs font-black text-[#191923]">
        {qty}
      </span>
      <button onClick={onInc} className={`${b} flex items-center justify-center text-[#800D32] hover:bg-[#FDEBF1] active:scale-90 transition`} aria-label="Increase">
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  width?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}> = ({ open, onClose, title, subtitle, icon, width = 'max-w-lg', footer, children }) =>
    open ? (
      <div className="pos-fade fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/45 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className={`pos-pop bg-white w-full ${width} max-h-[92dvh] flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-100`}>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            {icon && <div className="w-10 h-10 rounded-xl bg-[#FDEBF1] text-[#800D32] flex items-center justify-center shrink-0">{icon}</div>}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-black text-[#191923] truncate">{title}</h3>
              {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pos-scroll px-5 py-4">{children}</div>
          {footer && <div className="px-5 py-3.5 border-t border-gray-100 bg-[#FCF8F9] rounded-b-2xl">{footer}</div>}
        </div>
      </div>
    ) : null;

const Empty = ({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) => (
  <div className="py-10 flex flex-col items-center text-center text-gray-400">
    <div className="w-14 h-14 rounded-2xl bg-[#FFF3F7] text-[#D58AA3] flex items-center justify-center mb-3">{icon}</div>
    <p className="text-sm font-bold text-gray-600">{title}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

/** Document button with Print (main click) + menu: Print / Download / Preview. Opens upward. */
const DocButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  sub?: string;
  busy?: boolean;
  disabled?: boolean;
  onAction: (mode: PdfMode) => void;
}> = ({ icon, label, sub, busy, disabled, onAction }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useOutside(ref, close, open);
  return (
    <div ref={ref} className="relative">
      <div className={`flex items-stretch rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition ${disabled ? 'opacity-50' : 'hover:border-[#F3C3D2]'}`}>
        <button disabled={disabled || busy} onClick={() => onAction('print')} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 px-1 text-[#800D32] hover:bg-[#FFF5F8] disabled:cursor-not-allowed" title={`Print ${label}`}>
          {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : icon}
          <span className="text-[11px] font-black leading-tight">
            {label}
            {sub && <span className="text-[8px] font-semibold text-gray-500"> {sub}</span>}
          </span>
        </button>
        <button disabled={disabled || busy} onClick={() => setOpen((o) => !o)} className="px-1.5 border-l border-gray-100 text-gray-500 hover:bg-[#FFF5F8] hover:text-[#800D32] disabled:cursor-not-allowed" aria-label={`${label} options`}>
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open && (
        <div className="pos-pop absolute bottom-full mb-2 left-0 right-0 min-w-[150px] bg-white rounded-xl border border-gray-100 shadow-xl p-1 z-30">
          {[
            { m: 'print' as PdfMode, l: 'Print', i: <Printer className="w-3.5 h-3.5" /> },
            { m: 'download' as PdfMode, l: 'Download PDF', i: <Download className="w-3.5 h-3.5" /> },
            { m: 'preview' as PdfMode, l: 'Preview', i: <Eye className="w-3.5 h-3.5" /> },
          ].map((o) => (
            <button
              key={o.m}
              onClick={() => {
                setOpen(false);
                onAction(o.m);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-[#FDEBF1] hover:text-[#800D32]"
            >
              {o.i}
              {o.l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* =====================================================================
   ITEM CARD / ROW
   ===================================================================== */
type ItemProps = {
  item: MenuItem;
  catName?: string;
  qty: number;
  badge?: 'Bestseller' | 'Popular' | 'New';
  fav: boolean;
  index: number;
  onAdd: (i: MenuItem) => void;
  onDec: (i: MenuItem) => void;
  onFav: (id: string) => void;
};
const BADGE_CLS = { Bestseller: 'bg-[#800D32] text-white', Popular: 'bg-[#F0508A] text-white', New: 'bg-emerald-500 text-white' };

const ItemCard = memo(({ item, catName, qty, badge, fav, index, onAdd, onDec, onFav }: ItemProps) => (
  <div
    onClick={() => onAdd(item)}
    style={{ animationDelay: `${Math.min(index, 14) * 22}ms` }}
    className={`pos-card group relative bg-white rounded-2xl border shadow-[0_1px_3px_rgba(16,24,40,0.06)] hover:shadow-[0_10px_24px_-10px_rgba(128,13,50,0.3)] hover:-translate-y-0.5 transition-[box-shadow,transform,border-color] duration-300 cursor-pointer overflow-hidden flex flex-col active:scale-[0.98] ${qty ? 'border-[#E9A3BA]' : 'border-gray-100 hover:border-[#F3C3D2]'
      }`}
  >
    <div className="relative">
      <Thumb item={item} catName={catName} className="aspect-[4/3]" emojiCls="text-5xl" />
      {badge && <span className={`absolute top-2 left-2 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm ${BADGE_CLS[badge]}`}>{badge}</span>}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onFav(item.id);
        }}
        className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/80 transition"
        aria-label="Favourite"
      >
        <Heart className={`w-[18px] h-[18px] transition ${fav ? 'fill-[#E11D48] text-[#E11D48] scale-110' : 'text-[#C2185B]'}`} />
      </button>
      <div className="absolute bottom-1.5 left-2.5 flex items-center gap-1.5">
        <VegMark veg={item.isVeg} />
        {item.shortCode && <span className="text-[9px] font-mono font-bold text-gray-500 bg-white/80 rounded px-1">{item.shortCode}</span>}
      </div>
    </div>
    <div className="px-3 pt-1.5 pb-3 flex flex-col gap-1.5">
      <h4 className="text-[13px] font-bold text-[#191923] leading-snug line-clamp-1 group-hover:text-[#800D32] transition-colors">{item.name}</h4>
      <div className="flex items-center justify-between gap-1">
        <span className="text-[15px] font-black text-[#191923]">{formatINR(item.basePricePaise)}</span>
        {qty ? (
          <Stepper qty={qty} onDec={() => onDec(item)} onInc={() => onAdd(item)} size="sm" />
        ) : (
          <span className="w-7 h-7 rounded-lg border border-[#F3C3D2] text-[#800D32] flex items-center justify-center group-hover:bg-[#800D32] group-hover:text-white group-hover:border-[#800D32] transition">
            <Plus className="w-4 h-4" />
          </span>
        )}
      </div>
    </div>
  </div>
));

const ItemRow = memo(({ item, catName, qty, badge, fav, index, onAdd, onDec, onFav }: ItemProps) => (
  <div
    onClick={() => onAdd(item)}
    style={{ animationDelay: `${Math.min(index, 14) * 18}ms` }}
    className={`pos-card group flex items-center gap-3 bg-white rounded-xl border p-2 pr-3 cursor-pointer hover:shadow-md transition ${qty ? 'border-[#E9A3BA]' : 'border-gray-100 hover:border-[#F3C3D2]'}`}
  >
    <Thumb item={item} catName={catName} className="w-14 h-12 rounded-lg shrink-0" emojiCls="text-2xl" />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <VegMark veg={item.isVeg} />
        <h4 className="text-[13px] font-bold text-[#191923] truncate">{item.name}</h4>
        {badge && <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${BADGE_CLS[badge]}`}>{badge}</span>}
      </div>
      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
        {item.shortCode ? `${item.shortCode} · ` : ''}+{item.gstRate}% GST
      </p>
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onFav(item.id);
      }}
      aria-label="Favourite"
    >
      <Heart className={`w-4 h-4 ${fav ? 'fill-[#E11D48] text-[#E11D48]' : 'text-gray-300 hover:text-[#C2185B]'}`} />
    </button>
    <span className="w-20 text-right text-sm font-black text-[#191923]">{formatINR(item.basePricePaise)}</span>
    {qty ? (
      <Stepper qty={qty} onDec={() => onDec(item)} onInc={() => onAdd(item)} size="sm" />
    ) : (
      <span className="w-7 h-7 rounded-lg border border-[#F3C3D2] text-[#800D32] flex items-center justify-center group-hover:bg-[#800D32] group-hover:text-white transition">
        <Plus className="w-4 h-4" />
      </span>
    )}
  </div>
));

/* =====================================================================
   PAGE
   ===================================================================== */
export const PosPage: React.FC = () => {
  const {
    items: cartItems,
    orderType,
    tableId,
    tableName,
    discountPercentage,
    setOrderType,
    setTable,
    addItem,
    updateQuantity,
    setDiscount,
    clearCart,
    getCalculations,
  } = useCartStore();
  const cart = cartItems as CartEntry[];

  /* ---------- data ---------- */
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPosData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [cats, items, tbls] = await Promise.all([apiService.getCategories(), apiService.getMenuItems(), apiService.getTables()]);
      setCategories(cats);
      setMenuItems(items);
      setTables(tbls);
    } catch (e) {
      console.error(e);
      setLoadError('Could not load menu. Check the local server / database.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadPosData();
  }, [loadPosData]);

  /* ---------- filters ---------- */
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [view, setView] = usePersisted<'grid' | 'list'>('pos.view', 'grid');
  const [sort, setSort] = usePersisted<SortKey>('pos.sort', 'bestseller');
  const [favorites, setFavorites] = usePersisted<string[]>('pos.favorites', []);
  const searchRef = useRef<HTMLInputElement>(null);

  /* ---------- order state ---------- */
  const [orderNo, setOrderNo] = useState(newOrderNumber);
  const [guests, setGuests] = useState(2);
  const [orderNote, setOrderNote] = useState('');
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [customer, setCustomer] = useState<Customer>({});
  const [offerCode, setOfferCode] = useState<string | undefined>();
  const [sentQty, setSentQty] = useState<Record<string, number>>({});

  /* ---------- persisted lists ---------- */
  const [held, setHeld] = usePersisted<HeldOrder[]>('pos.held', []);
  const [recent, setRecent] = usePersisted<RecentOrder[]>('pos.recent', []);
  const [kotQueue, setKotQueue] = usePersisted<KotEntry[]>('pos.kotQueue', []);
  const [reservations, setReservations] = usePersisted<Reservation[]>('pos.reservations', []);

  /* ---------- ui state ---------- */
  const [modal, setModal] = useState<ModalKind>(null);
  const [historyMode, setHistoryMode] = useState<'recent' | 'bills'>('recent');
  const [noteTarget, setNoteTarget] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [pdfBusy, setPdfBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const notify = useCallback((type: 'success' | 'error' | 'info', text: string) => setToast({ id: Date.now(), type, text }), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------- payment state ---------- */
  const [payTab, setPayTab] = useState<PayTab>('cash');
  const [tenderedRupees, setTenderedRupees] = useState('');
  const [cardRef, setCardRef] = useState('');
  const [splitParts, setSplitParts] = useState<PayMethod[]>(['cash', 'upi']);
  const [afterPay, setAfterPay] = usePersisted<'print' | 'download' | 'none'>('pos.afterPay', 'print');
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiQr, setUpiQr] = useState<string | null>(null);

  const calculations = getCalculations();
  const total = calculations.grandTotalPaise;

  /* ---------- derived ---------- */
  const catName = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories]);
  const catCount = useMemo(() => {
    const m: Record<string, number> = {};
    menuItems.forEach((i) => (m[i.categoryId] = (m[i.categoryId] ?? 0) + 1));
    return m;
  }, [menuItems]);
  const qtyMap = useMemo(() => Object.fromEntries(cart.map((e) => [e.item.id, e.quantity])), [cart]);
  const cartCount = useMemo(() => cart.reduce((a, e) => a + e.quantity, 0), [cart]);
  const favSet = useMemo(() => new Set(favorites), [favorites]);

  const salesCount = useMemo(() => {
    const m: Record<string, number> = {};
    recent.forEach((o) => o.itemIds?.forEach((l) => (m[l.id] = (m[l.id] ?? 0) + l.qty)));
    return m;
  }, [recent]);

  const badges = useMemo(() => {
    const m: Record<string, ItemProps['badge']> = {};
    const ranked = Object.entries(salesCount).sort((a, b) => b[1] - a[1]);
    ranked.slice(0, 3).forEach(([id]) => (m[id] = 'Bestseller'));
    ranked.slice(3, 6).forEach(([id]) => (m[id] = m[id] ?? 'Popular'));
    menuItems.forEach((it) => {
      const a = it as unknown as Record<string, unknown>;
      if (a.isBestseller) m[it.id] = 'Bestseller';
      else if (a.isPopular) m[it.id] = m[it.id] ?? 'Popular';
      const created = a.createdAt ? new Date(String(a.createdAt)).getTime() : 0;
      if ((a.isNew || (created && Date.now() - created < 14 * 864e5)) && !m[it.id]) m[it.id] = 'New';
    });
    return m;
  }, [salesCount, menuItems]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = menuItems.filter((item) => {
      if (selectedCategory === 'fav' && !favSet.has(item.id)) return false;
      if (selectedCategory !== 'all' && selectedCategory !== 'fav' && item.categoryId !== selectedCategory) return false;
      if (vegOnly && !item.isVeg) return false;
      if (q) return item.name.toLowerCase().includes(q) || !!item.shortCode?.toLowerCase().includes(q);
      return true;
    });
    const s = [...list];
    if (sort === 'priceAsc') s.sort((a, b) => a.basePricePaise - b.basePricePaise);
    else if (sort === 'priceDesc') s.sort((a, b) => b.basePricePaise - a.basePricePaise);
    else if (sort === 'name') s.sort((a, b) => a.name.localeCompare(b.name));
    else s.sort((a, b) => (salesCount[b.id] ?? 0) - (salesCount[a.id] ?? 0) || (badges[b.id] ? 1 : 0) - (badges[a.id] ? 1 : 0));
    return s;
  }, [menuItems, selectedCategory, vegOnly, searchQuery, sort, salesCount, badges, favSet]);

  /* ---------- cart actions ---------- */
  const onAdd = useCallback((item: MenuItem) => addItem(item), [addItem]);
  const onDec = useCallback((item: MenuItem) => updateQuantity(item.id, -1), [updateQuantity]);
  const removeLine = (id: string, qty: number) => updateQuantity(id, -qty);
  const toggleFav = useCallback((id: string) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])), [setFavorites]);

  const resetOrder = useCallback(() => {
    clearCart();
    setDiscount(0);
    setOfferCode(undefined);
    setOrderNote('');
    setItemNotes({});
    setCustomer({});
    setSentQty({});
    setGuests(2);
    setTenderedRupees('');
    setCardRef('');
    setOrderNo(newOrderNumber());
  }, [clearCart, setDiscount]);

  const buildBillDoc = useCallback(
    (payments?: BillPayment[]): BillDoc => ({
      orderNumber: orderNo,
      createdAt: new Date().toISOString(),
      orderType: orderType as OrderTypeKey,
      tableName: orderType === 'dine_in' ? tableName : undefined,
      guests,
      cashier: CASHIER.name,
      customer: customer.name || customer.phone || customer.address ? customer : undefined,
      lines: cart.map((e) => ({
        id: e.item.id,
        name: e.item.name,
        qty: e.quantity,
        unitPaise: e.item.basePricePaise,
        gstRate: e.item.gstRate,
        notes: itemNotes[e.item.id] || e.notes,
        isVeg: e.item.isVeg,
      })),
      orderNote: orderNote || undefined,
      subtotalPaise: calculations.subtotalPaise,
      discountPaise: calculations.discountPaise,
      discountPercentage,
      offerCode,
      cgstPaise: calculations.cgstPaise,
      sgstPaise: calculations.sgstPaise,
      totalGstPaise: calculations.totalGstPaise,
      roundingPaise: calculations.roundingPaise,
      grandTotalPaise: calculations.grandTotalPaise,
      payments,
    }),
    [orderNo, orderType, tableName, guests, customer, cart, itemNotes, orderNote, calculations, discountPercentage, offerCode]
  );

  /* ---------- PDFs ---------- */
  const runPdf = useCallback(
    async (key: string, build: () => Promise<JsPDF>, filename: string, mode: PdfMode) => {
      setPdfBusy(key);
      try {
        const doc = await build();
        outputPdf(doc, filename, mode);
        if (mode === 'download') notify('success', `${filename} downloaded`);
      } catch (e) {
        console.error(e);
        notify('error', 'Could not generate PDF. Is jspdf installed?');
      } finally {
        setPdfBusy(null);
      }
    },
    [notify]
  );

  const handleKot = (mode: PdfMode) => {
    if (!cart.length) return notify('error', 'Add items before sending a KOT');
    if (orderType === 'dine_in' && !tableId) return notify('error', 'Select a table for dine-in KOT');
    const fresh = cart
      .map((e) => ({ e, delta: e.quantity - (sentQty[e.item.id] ?? 0) }))
      .filter((x) => x.delta > 0);
    if (!fresh.length) {
      const last = kotQueue.find((k) => k.orderNumber === orderNo);
      if (!last) return notify('info', 'No new items for kitchen');
      notify('info', `No new items — reprinting KOT #${last.kotNumber}`);
      return runPdf('kot', () => buildKotPdf(last), `KOT-${last.kotNumber}-${orderNo}.pdf`, mode);
    }
    const kot: KotEntry = {
      id: uid(),
      status: 'pending',
      kotNumber: nextKotNumber(),
      orderNumber: orderNo,
      createdAt: new Date().toISOString(),
      orderType: orderType as OrderTypeKey,
      tableName: orderType === 'dine_in' ? tableName : undefined,
      guests,
      orderNote: orderNote || undefined,
      items: fresh.map(({ e, delta }) => ({ name: e.item.name, qty: delta, notes: itemNotes[e.item.id] || e.notes, isVeg: e.item.isVeg })),
    };
    setKotQueue((q) => [kot, ...q].slice(0, 150));
    setSentQty(Object.fromEntries(cart.map((e) => [e.item.id, e.quantity])));
    notify('success', `KOT #${kot.kotNumber} sent to kitchen`);
    runPdf('kot', () => buildKotPdf(kot), `KOT-${kot.kotNumber}-${orderNo}.pdf`, mode);
  };

  const handleBill = (mode: PdfMode) => {
    if (!cart.length) return notify('error', 'Cart is empty');
    runPdf('bill', () => buildBillPdf(buildBillDoc()), `Bill-${orderNo}.pdf`, mode);
  };
  const handleInvoice = (mode: PdfMode) => {
    if (!cart.length) return notify('error', 'Cart is empty');
    runPdf('invoice', () => buildInvoicePdf(buildBillDoc()), `Invoice-${orderNo}.pdf`, mode);
  };

  /* ---------- hold / resume ---------- */
  const holdCurrent = (silent = false) => {
    if (!cart.length) {
      if (!silent) notify('error', 'Nothing to hold — cart is empty');
      return false;
    }
    const h: HeldOrder = {
      id: uid(),
      orderNumber: orderNo,
      heldAt: new Date().toISOString(),
      orderType: orderType as OrderTypeKey,
      tableId,
      tableName,
      guests,
      discountPercentage,
      offerCode,
      orderNote,
      itemNotes,
      customer,
      sentQty,
      entries: cart.map((e) => ({ item: e.item, quantity: e.quantity })),
      totalPaise: total,
    };
    setHeld((l) => [h, ...l]);
    resetOrder();
    if (!silent) notify('success', `Order ${h.orderNumber} put on hold`);
    return true;
  };

  const loadEntries = (entries: { item: MenuItem; quantity: number }[]) => {
    entries.forEach(({ item, quantity }) => {
      addItem(item);
      if (quantity > 1) updateQuantity(item.id, quantity - 1);
    });
  };

  const resumeHeld = (h: HeldOrder) => {
    if (cart.length) holdCurrent(true);
    clearCart();
    setOrderType(h.orderType);
    setTable(h.tableId, h.tableName);
    loadEntries(h.entries);
    setDiscount(h.discountPercentage);
    setOfferCode(h.offerCode);
    setOrderNote(h.orderNote);
    setItemNotes(h.itemNotes);
    setCustomer(h.customer);
    setSentQty(h.sentQty);
    setGuests(h.guests);
    setOrderNo(h.orderNumber);
    setHeld((l) => l.filter((x) => x.id !== h.id));
    setModal(null);
    notify('success', `Resumed ${h.orderNumber}`);
  };

  const reorder = (o: RecentOrder) => {
    const entries = (o.itemIds ?? [])
      .map((l) => ({ item: menuItems.find((m) => m.id === l.id), quantity: l.qty }))
      .filter((x): x is { item: MenuItem; quantity: number } => !!x.item);
    if (!entries.length) return notify('error', 'Items from this order are no longer on the menu');
    if (cart.length) holdCurrent(true);
    resetOrder();
    setOrderType(o.orderType);
    loadEntries(entries);
    setModal(null);
    notify('success', `Re-ordered ${entries.length} item(s) from ${o.orderNumber}`);
  };

  /* ---------- new order ---------- */
  const startNewOrder = () => (cart.length ? setModal('newOrder') : (resetOrder(), notify('info', 'New order started')));

  /* ---------- payment ---------- */
  const tenderedPaise = toPaise(tenderedRupees);
  const splitAmounts = useMemo(() => {
    const n = splitParts.length;
    const base = Math.floor(total / n);
    return splitParts.map((_, i) => (i === n - 1 ? total - base * (n - 1) : base));
  }, [splitParts, total]);

  useEffect(() => {
    if (modal !== 'pay' || (payTab !== 'upi' && payTab !== 'split')) return;
    let alive = true;
    upiQrDataUrl(payTab === 'upi' ? total : splitAmounts[splitParts.indexOf('upi')] ?? total, orderNo).then((d) => alive && setUpiQr(d));
    return () => {
      alive = false;
    };
  }, [modal, payTab, total, orderNo, splitAmounts, splitParts]);

  const openPay = (tab: PayTab = 'cash') => {
    if (!cart.length) return notify('error', 'Cart is empty');
    if (orderType === 'dine_in' && !tableId) return notify('error', 'Select a table before payment');
    setPayTab(tab);
    setModal('pay');
    setCartOpen(false);
  };

  const canSettle =
    cart.length > 0 &&
    !isProcessing &&
    (payTab !== 'cash' || !tenderedRupees || tenderedPaise >= total) &&
    (orderType !== 'delivery' || (!!customer.phone && !!customer.address));

  const handleCompleteOrder = async () => {
    if (!canSettle) return;
    setIsProcessing(true);
    try {
      const orderNumber = orderNo;
      const payments: BillPayment[] =
        payTab === 'split'
          ? splitParts.map((m, i) => ({ method: m, amountPaise: splitAmounts[i] }))
          : [
            {
              method: payTab,
              amountPaise: total,
              tenderedPaise: payTab === 'cash' && tenderedRupees ? tenderedPaise : total,
              changePaise: payTab === 'cash' && tenderedRupees ? Math.max(0, tenderedPaise - total) : 0,
              reference: payTab === 'card' && cardRef ? cardRef : undefined,
            },
          ];

      const orderPayload = {
        outletId: OUTLET_ID,
        orderNumber,
        orderType,
        tableId: orderType === 'dine_in' ? tableId : undefined,
        tableName: orderType === 'dine_in' ? tableName : undefined,
        status: 'completed',
        guestCount: guests,
        notes: orderNote || undefined,
        customerName: customer.name || undefined,
        customerPhone: customer.phone || undefined,
        deliveryAddress: orderType === 'delivery' ? customer.address : undefined,
        subtotalPaise: calculations.subtotalPaise,
        discountPaise: calculations.discountPaise,
        discountPercentage: discountPercentage > 0 ? discountPercentage : undefined,
        cgstPaise: calculations.cgstPaise,
        sgstPaise: calculations.sgstPaise,
        totalGstPaise: calculations.totalGstPaise,
        roundingPaise: calculations.roundingPaise,
        grandTotalPaise: calculations.grandTotalPaise,
        paymentStatus: 'completed',
        cashierId: CASHIER.id,
        items: cart.map((entry) => ({
          itemId: entry.item.id,
          name: entry.item.name,
          quantity: entry.quantity,
          unitPricePaise: entry.item.basePricePaise,
          totalPricePaise: entry.item.basePricePaise * entry.quantity,
          gstRate: entry.item.gstRate,
          gstAmountPaise: Math.round((entry.item.basePricePaise * entry.quantity * entry.item.gstRate) / 100),
          notes: itemNotes[entry.item.id] || entry.notes,
          kotStatus: 'pending' as const,
        })),
      };

      // 1. Order
      const createdOrder = await apiService.createOrder(orderPayload as any);

      // 2. Kitchen KOT
      await apiService.createKot({
        outletId: OUTLET_ID,
        orderId: createdOrder.id,
        orderNumber,
        kotNumber: 1,
        tableId: orderPayload.tableId,
        tableName: orderPayload.tableName,
        orderType,
        station: 'Main Kitchen',
        items: orderPayload.items.map((it) => ({
          orderItemId: it.itemId,
          itemName: it.name,
          quantity: it.quantity,
          notes: it.notes,
          status: 'pending' as const,
        })),
      } as any);

      // 3. Payment(s)
      for (const p of payments) {
        await apiService.recordPayment({
          outletId: OUTLET_ID,
          orderId: createdOrder.id,
          amountPaise: p.amountPaise,
          method: p.method as PayMethod,
          status: 'completed',
          tenderedPaise: p.tenderedPaise ?? p.amountPaise,
          changePaise: p.changePaise ?? 0,
          collectedBy: CASHIER.id,
        } as any);
      }

      // 4. Local history + receipt
      const doc = buildBillDoc(payments);
      setRecent((r) => [{ ...doc, id: createdOrder?.id ?? uid(), itemIds: cart.map((e) => ({ id: e.item.id, qty: e.quantity })) }, ...r].slice(0, 300));
      if (afterPay !== 'none') runPdf('bill', () => buildBillPdf(doc), `Bill-${orderNumber}.pdf`, afterPay);

      notify('success', `Order ${orderNumber} settled successfully`);
      setModal(null);
      resetOrder();
    } catch (err) {
      console.error('Order creation failed:', err);
      notify('error', 'Error saving order. Check terminal SQLite database.');
    } finally {
      setIsProcessing(false);
    }
  };

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /input|textarea|select/i.test((e.target as HTMLElement)?.tagName);
      if (e.key === 'Escape') {
        if (modal) setModal(null);
        else if (cartOpen) setCartOpen(false);
        return;
      }
      if (modal) return;
      if (e.key === '/' && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === 'F10') {
        e.preventDefault();
        openPay();
      } else if (e.key === 'F8' && !e.ctrlKey) {
        e.preventDefault();
        handleKot('print');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const activeKots = kotQueue.filter((k) => k.status !== 'served').length;

  /* =====================================================================
     RENDER
     ===================================================================== */
  const headerBtn =
    'shrink-0 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs xl:text-[13px] font-bold text-[#191923] shadow-sm hover:border-[#F3C3D2] hover:text-[#800D32] active:scale-95 transition';

  return (
    <div className="pos-root flex gap-4 overflow-hidden" style={{ height: `calc(100dvh - var(--pos-offset, ${POS_OFFSET}))` }}>
      <style>{CSS}</style>

      {/* Toast */}
      {toast && (
        <div
          key={toast.id}
          className={`pos-toast fixed top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-5 z-[80] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border ${toast.type === 'success' ? 'bg-[#800D32] text-white border-rose-400' : toast.type === 'error' ? 'bg-white text-rose-700 border-rose-200' : 'bg-white text-[#191923] border-gray-200'
            }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : <AlertCircle className={`w-5 h-5 ${toast.type === 'error' ? 'text-rose-500' : 'text-[#800D32]'}`} />}
          {toast.text}
        </div>
      )}

      {/* ================= LEFT: MENU ================= */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* Title + actions */}
        <div className="flex items-center gap-3 flex-wrap xl:flex-nowrap">
          <div className="flex items-center gap-3 mr-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#FDEBF1] text-[#800D32] flex items-center justify-center shrink-0">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl xl:text-2xl font-black text-[#191923] leading-tight">Point Of Sale</h1>
              <p className="text-xs text-gray-500 font-medium hidden sm:block">Take orders, manage items and generate bills</p>
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pos-noscroll max-w-full py-1 -my-1">
            <button onClick={startNewOrder} className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#800D32] text-white text-xs xl:text-[13px] font-black shadow-md shadow-rose-900/20 hover:bg-[#6a0a29] active:scale-95 transition">
              <Plus className="w-4 h-4" /> New Order
            </button>
            <button onClick={() => setModal('held')} className={`${headerBtn} relative`}>
              <Pause className="w-4 h-4" /> Hold Orders
              {held.length > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">{held.length}</span>}
            </button>
            <button onClick={() => (setHistoryMode('recent'), setModal('history'))} className={headerBtn}>
              <History className="w-4 h-4" /> Recent Orders
            </button>
            <button onClick={() => (setHistoryMode('bills'), setModal('history'))} className={headerBtn}>
              <FileText className="w-4 h-4" /> Bills (PDF)
            </button>
            <button onClick={() => setModal('kot')} className={`${headerBtn} relative`}>
              <ChefHat className="w-4 h-4" /> KOT Queue
              {activeKots > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E11D48] text-white text-[10px] font-black flex items-center justify-center">{activeKots}</span>}
            </button>
          </div>
        </div>

        {/* Order type + table + guests */}
        <div className="flex items-center gap-2 overflow-x-auto pos-noscroll py-1 -my-1">
          {(
            [
              { k: 'dine_in', l: 'Dine In', i: Utensils },
              { k: 'takeaway', l: 'Takeaway', i: ShoppingBag },
              { k: 'delivery', l: 'Delivery', i: Bike },
            ] as const
          ).map((t) => (
            <button
              key={t.k}
              onClick={() => setOrderType(t.k)}
              className={`shrink-0 inline-flex items-center gap-2 px-4 xl:px-6 py-2.5 rounded-xl text-xs xl:text-sm font-black border transition active:scale-95 ${orderType === t.k ? 'bg-[#800D32] text-white border-[#800D32] shadow-md shadow-rose-900/20' : 'bg-white text-[#191923] border-gray-200 hover:border-[#F3C3D2]'
                }`}
            >
              <t.i className="w-4 h-4" /> {t.l}
            </button>
          ))}
          <button onClick={() => setModal('reservation')} className="shrink-0 inline-flex items-center gap-2 px-4 xl:px-5 py-2.5 rounded-xl text-xs xl:text-sm font-black border bg-white text-[#191923] border-gray-200 hover:border-[#F3C3D2] transition active:scale-95 relative">
            <CalendarDays className="w-4 h-4 text-[#800D32]" /> Reservation
            {reservations.length > 0 && <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#FDEBF1] text-[#800D32] text-[10px] font-black flex items-center justify-center">{reservations.length}</span>}
          </button>
          <span className="w-px h-8 bg-gray-200 mx-1 shrink-0" />
          <TablePicker tables={tables} tableId={tableId} tableName={tableName} disabled={orderType !== 'dine_in'} onPick={(t) => setTable(t?.id, t?.name)} />
          <GuestPicker guests={guests} setGuests={setGuests} />
        </div>

        {/* Body: categories + items */}
        <div className="flex-1 min-h-0 flex gap-3">
          {/* Categories sidebar (scrollable) */}
          <aside className="hidden md:flex w-48 xl:w-56 shrink-0 flex-col bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
            <div className="flex-1 min-h-0 overflow-y-auto pos-scroll space-y-1.5 pr-0.5">
              {[
                { id: 'all', name: 'All Items', count: menuItems.length, Icon: LayoutGrid },
                { id: 'fav', name: 'Favourites', count: favorites.length, Icon: Heart },
                ...categories.map((c) => ({ id: c.id, name: c.name, count: catCount[c.id] ?? 0, Icon: catIcon(c.name) })),
              ].map((c) => {
                const active = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-bold transition-all ${active ? 'bg-[#800D32] text-white shadow-md shadow-rose-900/20' : 'text-[#191923] hover:bg-[#FFF5F8] border border-transparent hover:border-[#F8D5E0]'
                      }`}
                  >
                    <c.Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-[#800D32]'}`} />
                    <span className="flex-1 text-left truncate">{c.name}</span>
                    <span className={`text-[11px] font-semibold ${active ? 'text-rose-100' : 'text-gray-400'}`}>({c.count})</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Items */}
          <section className="flex-1 min-w-0 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg xl:text-xl font-black text-[#191923]">
                {selectedCategory === 'all' ? 'All Items' : selectedCategory === 'fav' ? 'Favourites' : catName[selectedCategory] ?? 'Items'}
              </h2>
              <span className="text-xs font-semibold text-gray-500">{filteredItems.length} Items</span>
              <div className="relative flex-1 min-w-[160px] max-w-[340px] ml-auto">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name or code…  ( / )"
                  className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#800D32]/40 focus:border-[#800D32] transition"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700" aria-label="Clear search">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setVegOnly((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition ${vegOnly ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-gray-200 text-gray-600'}`}
              >
                <VegMark veg /> Veg
              </button>
              <div className="inline-flex rounded-xl bg-white border border-gray-200 p-0.5">
                {(['grid', 'list'] as const).map((v) => (
                  <button key={v} onClick={() => setView(v)} className={`w-9 h-8 rounded-lg flex items-center justify-center transition ${view === v ? 'bg-[#800D32] text-white' : 'text-gray-500 hover:text-[#800D32]'}`} aria-label={`${v} view`}>
                    {v === 'grid' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                  </button>
                ))}
              </div>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-white border border-gray-200 text-xs xl:text-sm font-bold text-[#191923] focus:outline-none focus:ring-2 focus:ring-[#800D32]/40 cursor-pointer"
                >
                  <option value="bestseller">Bestseller</option>
                  <option value="priceAsc">Price: Low → High</option>
                  <option value="priceDesc">Price: High → Low</option>
                  <option value="name">Name A–Z</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
              </div>
            </div>

            {/* Mobile category chips */}
            <div className="md:hidden flex gap-2 overflow-x-auto pos-noscroll pb-0.5">
              {[{ id: 'all', name: 'All' }, { id: 'fav', name: '♥ Favourites' }, ...categories].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${selectedCategory === c.id ? 'bg-[#800D32] text-white border-[#800D32]' : 'bg-white text-gray-600 border-gray-200'}`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Items grid (scrollable) */}
            <div className="flex-1 min-h-0 overflow-y-auto pos-scroll pr-1 pb-20 lg:pb-2">
              {loading ? (
                <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
                      <div className="aspect-[4/3] bg-gradient-to-r from-rose-50 via-white to-rose-50 animate-pulse" />
                      <div className="p-3 space-y-2">
                        <div className="h-3 w-3/4 rounded bg-gray-100 animate-pulse" />
                        <div className="h-3 w-1/3 rounded bg-gray-100 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : loadError ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <AlertCircle className="w-10 h-10 text-rose-400 mb-2" />
                  <p className="text-sm font-bold text-gray-700">{loadError}</p>
                  <button onClick={loadPosData} className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#800D32] text-white text-xs font-bold">
                    <RotateCcw className="w-3.5 h-3.5" /> Retry
                  </button>
                </div>
              ) : filteredItems.length === 0 ? (
                <Empty icon={<Search className="w-6 h-6" />} title="No items found" sub="Try another category or search term" />
              ) : view === 'grid' ? (
                <div key={selectedCategory + sort} className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))] xl:[grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]">
                  {filteredItems.map((item, i) => (
                    <ItemCard key={item.id} item={item} catName={catName[item.categoryId]} qty={qtyMap[item.id] ?? 0} badge={badges[item.id]} fav={favSet.has(item.id)} index={i} onAdd={onAdd} onDec={onDec} onFav={toggleFav} />
                  ))}
                </div>
              ) : (
                <div key={selectedCategory + sort + 'l'} className="space-y-2">
                  {filteredItems.map((item, i) => (
                    <ItemRow key={item.id} item={item} catName={catName[item.categoryId]} qty={qtyMap[item.id] ?? 0} badge={badges[item.id]} fav={favSet.has(item.id)} index={i} onAdd={onAdd} onDec={onDec} onFav={toggleFav} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Mobile cart bar */}
      <button
        onClick={() => setCartOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 right-4 z-30 flex items-center justify-between px-5 py-3.5 rounded-2xl bg-[#800D32] text-white shadow-2xl shadow-rose-900/40 active:scale-[0.98] transition"
      >
        <span className="flex items-center gap-2 font-black text-sm">
          <ShoppingBag className="w-5 h-5" /> {cartCount} item{cartCount === 1 ? '' : 's'}
        </span>
        <span className="flex items-center gap-2 font-black">
          {formatINR(total)} <ArrowRight className="w-4 h-4" />
        </span>
      </button>
      {cartOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/40 pos-fade" onClick={() => setCartOpen(false)} />}

      {/* ================= RIGHT: CART ================= */}
      <aside
        className={`fixed lg:static inset-y-0 right-0 z-50 lg:z-auto w-[92vw] max-w-[400px] lg:w-[360px] xl:w-[400px] lg:max-w-none shrink-0 bg-white lg:rounded-2xl border border-gray-100 shadow-2xl lg:shadow-sm flex flex-col overflow-hidden transition-transform duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Cart header */}
        <div className="px-4 py-3.5 flex items-center gap-3 bg-gradient-to-r from-[#FFF3F7] to-white border-b border-gray-100">
          <div className="w-12 h-12 rounded-full bg-[#800D32] text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-900/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-[#191923] leading-tight">Current Order</h3>
            <p className="text-xs font-semibold text-gray-500 truncate">
              {orderType === 'dine_in' && <span className="text-[#800D32] font-bold">{tableName ?? 'No table'} • </span>}
              {ORDER_TYPE_LABEL[orderType as OrderTypeKey]} • {guests} Guests
            </p>
            <p className="text-[10px] font-mono text-gray-400">{orderNo}</p>
          </div>
          {cart.length > 0 && (
            <button onClick={() => (clearCart(), setSentQty({}), setItemNotes({}))} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 transition">
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
          <button onClick={() => setCartOpen(false)} className="lg:hidden w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center" aria-label="Close cart">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart lines (scrollable) */}
        <div className="flex-1 min-h-0 overflow-y-auto pos-scroll px-4 divide-y divide-gray-100">
          {cart.length === 0 ? (
            <Empty icon={<Utensils className="w-6 h-6" />} title="Cart is empty" sub="Tap any item to start billing" />
          ) : (
            cart.map((e) => (
              <CartLine
                key={e.item.id}
                entry={e}
                catName={catName[e.item.categoryId]}
                note={itemNotes[e.item.id] || e.notes}
                sent={sentQty[e.item.id] ?? 0}
                onInc={() => onAdd(e.item)}
                onDec={() => onDec(e.item)}
                onRemove={() => removeLine(e.item.id, e.quantity)}
                onNote={() => (setNoteTarget(e.item), setModal('itemNote'))}
              />
            ))
          )}
        </div>

        {/* Summary */}
        <div className="px-4 pt-3 pb-4 border-t border-gray-100 space-y-2.5 bg-white">
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: orderNote ? 'Edit Note' : 'Add Note', i: <PencilLine className="w-3.5 h-3.5" />, on: () => setModal('note'), active: !!orderNote },
              { l: offerCode || discountPercentage ? `${discountPercentage}% Off` : 'Apply Offer', i: <BadgePercent className="w-3.5 h-3.5" />, on: () => setModal('offer'), active: discountPercentage > 0 },
              { l: 'Split Bill', i: <Split className="w-3.5 h-3.5" />, on: () => openPay('split'), active: false },
            ].map((b) => (
              <button
                key={b.l}
                onClick={b.on}
                disabled={!cart.length}
                className={`inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[11px] xl:text-xs font-bold transition disabled:opacity-40 ${b.active ? 'bg-[#FDEBF1] border-[#F3C3D2] text-[#800D32]' : 'bg-white border-gray-200 text-[#191923] hover:border-[#F3C3D2] hover:text-[#800D32]'
                  }`}
              >
                {b.i}
                <span className="truncate">{b.l}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1.5 text-[13px] px-0.5">
            <div className="flex justify-between font-semibold text-gray-600">
              <span>Subtotal</span>
              <span className="text-[#191923] font-bold">{formatINR(calculations.subtotalPaise)}</span>
            </div>
            {calculations.discountPaise > 0 && (
              <div className="flex justify-between font-semibold text-emerald-700">
                <span className="flex items-center gap-1">
                  Discount {offerCode && <span className="text-[10px] font-black bg-emerald-50 border border-emerald-200 rounded px-1">{offerCode}</span>} ({discountPercentage}%)
                </span>
                <span>-{formatINR(calculations.discountPaise)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-gray-600" title={`CGST ${formatINR(calculations.cgstPaise)} + SGST ${formatINR(calculations.sgstPaise)}`}>
              <span>GST (CGST + SGST)</span>
              <span className="text-[#191923] font-bold">{formatINR(calculations.totalGstPaise)}</span>
            </div>
            {calculations.roundingPaise !== 0 && (
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Round off</span>
                <span>{formatINR(calculations.roundingPaise)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl bg-[#FDEBF1] px-4 py-2.5">
            <span className="text-base font-black text-[#800D32]">Total Amount</span>
            <span key={total} className="pos-bump text-xl xl:text-2xl font-black text-[#800D32]">
              {formatINR(total)}
            </span>
          </div>

          <button
            onClick={() => openPay()}
            disabled={!cart.length}
            className="group w-full flex items-center justify-between gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#800D32] to-[#9E1340] text-white shadow-lg shadow-rose-900/25 hover:shadow-xl active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2.5 text-base font-black">
              <CreditCard className="w-5 h-5" /> Proceed to Pay
            </span>
            <span className="text-[10px] font-bold text-rose-200 hidden xl:inline">F10</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>

          <div className="grid grid-cols-3 gap-2">
            <DocButton icon={<ChefHat className="w-5 h-5" />} label="KOT" sub="(F8)" busy={pdfBusy === 'kot'} disabled={!cart.length} onAction={handleKot} />
            <DocButton icon={<Receipt className="w-5 h-5" />} label="Bill PDF" busy={pdfBusy === 'bill'} disabled={!cart.length} onAction={handleBill} />
            <DocButton icon={<FileText className="w-5 h-5" />} label="Invoice PDF" busy={pdfBusy === 'invoice'} disabled={!cart.length} onAction={handleInvoice} />
          </div>
        </div>
      </aside>

      {/* ================= MODALS ================= */}

      {/* Payment */}
      <Modal
        open={modal === 'pay'}
        onClose={() => setModal(null)}
        title="Payment & Settlement"
        subtitle={`${orderNo} · ${ORDER_TYPE_LABEL[orderType as OrderTypeKey]}${orderType === 'dine_in' && tableName ? ` · ${tableName}` : ''} · ${cartCount} items`}
        icon={<CreditCard className="w-5 h-5" />}
        width="max-w-xl"
        footer={
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-600">
              After payment:
              <select value={afterPay} onChange={(e) => setAfterPay(e.target.value as typeof afterPay)} className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold focus:outline-none">
                <option value="print">Print bill</option>
                <option value="download">Download bill PDF</option>
                <option value="none">No receipt</option>
              </select>
            </label>
            <div className="flex gap-2 sm:ml-auto">
              <button onClick={() => setModal(null)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100">
                Cancel
              </button>
              <button
                disabled={!canSettle}
                onClick={handleCompleteOrder}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-[#800D32] hover:bg-[#6a0a29] text-white rounded-xl text-sm font-black shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isProcessing ? 'Saving…' : `Confirm ${formatINR(total)}`}
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#800D32] to-[#A3164A] text-white px-5 py-4">
            <div>
              <p className="text-[11px] font-bold text-rose-200 uppercase tracking-wider">Amount payable</p>
              <p className="text-3xl font-black leading-tight">{formatINR(total)}</p>
            </div>
            <div className="text-right text-[11px] font-semibold text-rose-100 space-y-0.5">
              <p>Subtotal {formatINR(calculations.subtotalPaise)}</p>
              {calculations.discountPaise > 0 && <p>Discount −{formatINR(calculations.discountPaise)}</p>}
              <p>GST {formatINR(calculations.totalGstPaise)}</p>
            </div>
          </div>

          {/* Customer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input value={customer.name ?? ''} onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))} placeholder="Customer name (optional)" className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800D32]/40" />
            <input
              value={customer.phone ?? ''}
              onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value.replace(/[^\d+ ]/g, '').slice(0, 15) }))}
              placeholder={orderType === 'delivery' ? 'Phone (required)' : 'Phone (optional)'}
              inputMode="tel"
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800D32]/40"
            />
            {orderType === 'delivery' && (
              <textarea
                value={customer.address ?? ''}
                onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))}
                placeholder="Delivery address (required)"
                rows={2}
                className="sm:col-span-2 px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#800D32]/40"
              />
            )}
          </div>

          {/* Methods */}
          <div className="grid grid-cols-4 gap-2">
            {(
              [
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'upi', label: 'UPI', icon: QrCode },
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'split', label: 'Split', icon: Split },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => setPayTab(m.id)}
                className={`py-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition ${payTab === m.id ? 'border-[#800D32] bg-[#FDEBF1] text-[#800D32] shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
              >
                <m.icon className="w-5 h-5" />
                {m.label}
              </button>
            ))}
          </div>

          {payTab === 'cash' && (
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
              <label className="text-xs font-bold text-gray-700 block">Cash tendered by customer (₹)</label>
              <input
                type="number"
                inputMode="decimal"
                autoFocus
                placeholder={paiseToRupees(total).toString()}
                value={tenderedRupees}
                onChange={(e) => setTenderedRupees(e.target.value)}
                className="w-full text-lg font-black px-4 py-2 border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#800D32]/40"
              />
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set([Math.ceil(total / 10000) * 100, 500, 1000, 2000]))
                  .filter((a) => a * 100 >= total)
                  .map((amt) => (
                    <button key={amt} type="button" onClick={() => setTenderedRupees(String(amt))} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-[#800D32]">
                      ₹{amt}
                    </button>
                  ))}
                <button type="button" onClick={() => setTenderedRupees(String(paiseToRupees(total)))} className="px-3 py-1.5 bg-[#800D32] text-white rounded-lg text-xs font-bold">
                  Exact
                </button>
              </div>
              {tenderedRupees &&
                (tenderedPaise >= total ? (
                  <div className="flex justify-between items-center text-sm font-black text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                    <span>Return change</span>
                    <span>{formatINR(tenderedPaise - total)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-sm font-bold text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
                    <span>Short by</span>
                    <span>{formatINR(total - tenderedPaise)}</span>
                  </div>
                ))}
            </div>
          )}

          {payTab === 'upi' && (
            <div className="p-4 bg-gray-50 rounded-xl text-center space-y-2">
              <div className="w-44 h-44 mx-auto bg-white border border-gray-200 rounded-xl flex items-center justify-center p-2 shadow-inner">
                {upiQr ? <img src={upiQr} alt="UPI QR" className="w-full h-full" /> : <Loader2 className="w-8 h-8 animate-spin text-[#800D32]" />}
              </div>
              <p className="text-xs font-bold text-gray-700">Scan with any UPI app (GPay / PhonePe / Paytm) to pay {formatINR(total)}</p>
              <p className="text-[11px] text-gray-500 font-mono">VPA: {OUTLET_INFO.upiVpa}</p>
            </div>
          )}

          {payTab === 'card' && (
            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
              <p className="text-sm font-bold text-gray-700">Swipe / tap the card on the terminal for {formatINR(total)}.</p>
              <input value={cardRef} onChange={(e) => setCardRef(e.target.value.slice(0, 20))} placeholder="Approval / reference no. (optional)" className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#800D32]/40" />
            </div>
          )}

          {payTab === 'split' && (
            <div className="p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">Split equally between</span>
                <Stepper
                  qty={splitParts.length}
                  onDec={() => setSplitParts((p) => (p.length > 2 ? p.slice(0, -1) : p))}
                  onInc={() => setSplitParts((p) => (p.length < 10 ? [...p, 'cash'] : p))}
                />
              </div>
              <div className="space-y-2">
                {splitParts.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
                    <span className="w-6 h-6 rounded-full bg-[#FDEBF1] text-[#800D32] text-[11px] font-black flex items-center justify-center">{i + 1}</span>
                    <span className="flex-1 text-sm font-black text-[#191923]">{formatINR(splitAmounts[i])}</span>
                    <div className="inline-flex rounded-lg bg-gray-100 p-0.5">
                      {(['cash', 'upi', 'card'] as const).map((pm) => (
                        <button
                          key={pm}
                          onClick={() => setSplitParts((p) => p.map((x, k) => (k === i ? pm : x)))}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition ${m === pm ? 'bg-[#800D32] text-white' : 'text-gray-600'}`}
                        >
                          {pm}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {splitParts.includes('upi') && upiQr && (
                <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-2">
                  <img src={upiQr} alt="UPI QR" className="w-20 h-20" />
                  <p className="text-xs font-semibold text-gray-600">QR for the first UPI share ({formatINR(splitAmounts[splitParts.indexOf('upi')])}).</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Offer */}
      <Modal open={modal === 'offer'} onClose={() => setModal(null)} title="Apply Offer / Discount" subtitle={`Subtotal ${formatINR(calculations.subtotalPaise)}`} icon={<BadgePercent className="w-5 h-5" />}>
        <OfferPanel
          subtotal={calculations.subtotalPaise}
          activeCode={offerCode}
          activePct={discountPercentage}
          onApply={(pct, code) => {
            setDiscount(pct);
            setOfferCode(code);
            setModal(null);
            notify('success', pct ? `${code ?? 'Discount'} applied — ${pct}% off` : 'Discount removed');
          }}
        />
      </Modal>

      {/* Order note */}
      <Modal open={modal === 'note'} onClose={() => setModal(null)} title="Order Note" subtitle="Printed on KOT, bill and invoice" icon={<PencilLine className="w-5 h-5" />}>
        <NoteEditor initial={orderNote} onSave={(v) => (setOrderNote(v), setModal(null))} />
      </Modal>

      {/* Item note */}
      <Modal open={modal === 'itemNote' && !!noteTarget} onClose={() => setModal(null)} title={`Note · ${noteTarget?.name ?? ''}`} subtitle="Shown to the kitchen on the KOT" icon={<PencilLine className="w-5 h-5" />}>
        {noteTarget && (
          <NoteEditor
            initial={itemNotes[noteTarget.id] ?? ''}
            onSave={(v) => {
              setItemNotes((n) => ({ ...n, [noteTarget.id]: v }));
              setModal(null);
            }}
          />
        )}
      </Modal>

      {/* New order confirm */}
      <Modal open={modal === 'newOrder'} onClose={() => setModal(null)} title="Start a new order?" subtitle={`Current order has ${cartCount} item(s) · ${formatINR(total)}`} icon={<Plus className="w-5 h-5" />}>
        <div className="grid sm:grid-cols-2 gap-2">
          <button onClick={() => (holdCurrent(), setModal(null))} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#800D32] text-white text-sm font-black">
            <Pause className="w-4 h-4" /> Hold & start new
          </button>
          <button onClick={() => (resetOrder(), setModal(null), notify('info', 'Order discarded'))} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-rose-200 text-rose-600 text-sm font-black hover:bg-rose-50">
            <Trash2 className="w-4 h-4" /> Discard & start new
          </button>
        </div>
      </Modal>

      {/* Held orders */}
      <Modal open={modal === 'held'} onClose={() => setModal(null)} title="Hold Orders" subtitle={`${held.length} order(s) on hold`} icon={<Pause className="w-5 h-5" />} width="max-w-2xl">
        <button
          onClick={() => holdCurrent()}
          disabled={!cart.length}
          className="w-full mb-3 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[#F3C3D2] text-[#800D32] text-sm font-black hover:bg-[#FFF5F8] disabled:opacity-40"
        >
          <Pause className="w-4 h-4" /> Hold current order ({cartCount} items · {formatINR(total)})
        </button>
        {held.length === 0 ? (
          <Empty icon={<Pause className="w-6 h-6" />} title="No orders on hold" />
        ) : (
          <div className="space-y-2">
            {held.map((h) => (
              <div key={h.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:border-[#F3C3D2] transition">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-[#191923]">
                    {h.orderNumber} <span className="text-xs font-semibold text-gray-400">· {timeAgo(h.heldAt)}</span>
                  </p>
                  <p className="text-xs text-gray-500 font-semibold truncate">
                    {ORDER_TYPE_LABEL[h.orderType]}
                    {h.orderType === 'dine_in' && h.tableName ? ` · ${h.tableName}` : ''} · {h.entries.map((e) => `${e.quantity}× ${e.item.name}`).join(', ')}
                  </p>
                </div>
                <span className="text-sm font-black text-[#800D32]">{formatINR(h.totalPaise)}</span>
                <button onClick={() => resumeHeld(h)} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#800D32] text-white text-xs font-bold">
                  <Play className="w-3.5 h-3.5" /> Resume
                </button>
                <button onClick={() => setHeld((l) => l.filter((x) => x.id !== h.id))} className="w-8 h-8 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center" aria-label="Delete held order">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Recent orders / Bills */}
      <Modal
        open={modal === 'history'}
        onClose={() => setModal(null)}
        title={historyMode === 'bills' ? 'Bills (PDF)' : 'Recent Orders'}
        subtitle={`${recent.length} settled order(s) on this terminal`}
        icon={historyMode === 'bills' ? <FileText className="w-5 h-5" /> : <History className="w-5 h-5" />}
        width="max-w-3xl"
      >
        <HistoryList
          orders={recent}
          mode={historyMode}
          busy={pdfBusy}
          onPdf={(o, kind, mode) =>
            runPdf(
              `h-${o.id}-${kind}`,
              () => (kind === 'bill' ? buildBillPdf(o) : buildInvoicePdf(o)),
              `${kind === 'bill' ? 'Bill' : 'Invoice'}-${o.orderNumber}.pdf`,
              mode
            )
          }
          onReorder={reorder}
        />
      </Modal>

      {/* KOT queue */}
      <Modal open={modal === 'kot'} onClose={() => setModal(null)} title="KOT Queue" subtitle={`${activeKots} active ticket(s)`} icon={<ChefHat className="w-5 h-5" />} width="max-w-3xl">
        <KotQueue
          queue={kotQueue}
          onAdvance={(id) =>
            setKotQueue((q) =>
              q.map((k) => (k.id === id ? { ...k, status: k.status === 'pending' ? 'preparing' : k.status === 'preparing' ? 'ready' : 'served' } : k))
            )
          }
          onReprint={(k, mode) => runPdf(`kq-${k.id}`, () => buildKotPdf(k), `KOT-${k.kotNumber}-${k.orderNumber}.pdf`, mode)}
          onClearServed={() => setKotQueue((q) => q.filter((k) => k.status !== 'served'))}
        />
      </Modal>

      {/* Reservation */}
      <Modal open={modal === 'reservation'} onClose={() => setModal(null)} title="Reservations" subtitle="Book a table for later" icon={<CalendarDays className="w-5 h-5" />} width="max-w-2xl">
        <ReservationPanel
          tables={tables}
          list={reservations}
          onAdd={(r) => {
            setReservations((l) => [...l, r].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)));
            notify('success', `Table reserved for ${r.name}`);
          }}
          onRemove={(id) => setReservations((l) => l.filter((x) => x.id !== id))}
          onSeat={(r) => {
            setOrderType('dine_in');
            if (r.tableId) setTable(r.tableId, r.tableName);
            setGuests(r.guests);
            setCustomer({ name: r.name, phone: r.phone });
            if (r.note) setOrderNote(r.note);
            setReservations((l) => l.filter((x) => x.id !== r.id));
            setModal(null);
            notify('success', `${r.name} seated${r.tableName ? ` at ${r.tableName}` : ''}`);
          }}
        />
      </Modal>
    </div>
  );
};

/* =====================================================================
   SUB-COMPONENTS
   ===================================================================== */
const CartLine = memo(
  ({ entry, catName, note, sent, onInc, onDec, onRemove, onNote }: { entry: CartEntry; catName?: string; note?: string; sent: number; onInc: () => void; onDec: () => void; onRemove: () => void; onNote: () => void }) => {
    const [menu, setMenu] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const close = useCallback(() => setMenu(false), []);
    useOutside(ref, close, menu);
    return (
      <div className="pos-in group flex items-center gap-3 py-2.5">
        <Thumb item={entry.item} catName={catName} className="w-14 h-14 rounded-xl shrink-0" emojiCls="text-3xl" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <VegMark veg={entry.item.isVeg} />
            <h5 className="text-[13px] font-bold text-[#191923] truncate">{entry.item.name}</h5>
          </div>
          {note && <p className="text-[10px] italic text-[#800D32] truncate mt-0.5">“{note}”</p>}
          <div className="flex items-center gap-2 mt-1">
            <Stepper qty={entry.quantity} onDec={onDec} onInc={onInc} size="sm" />
            {sent > 0 && (
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${sent >= entry.quantity ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {sent >= entry.quantity ? 'KOT ✓' : `+${entry.quantity - sent} new`}
              </span>
            )}
          </div>
        </div>
        <span className="text-sm font-black text-[#191923] whitespace-nowrap">{formatINR(entry.item.basePricePaise * entry.quantity)}</span>
        <div ref={ref} className="relative">
          <button onClick={() => setMenu((m) => !m)} className="w-7 h-7 rounded-lg text-gray-500 hover:bg-gray-100 flex items-center justify-center" aria-label="Item options">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menu && (
            <div className="pos-pop absolute right-0 top-full mt-1 w-40 bg-white rounded-xl border border-gray-100 shadow-xl p-1 z-20">
              <button onClick={() => (setMenu(false), onNote())} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-[#FDEBF1] hover:text-[#800D32]">
                <PencilLine className="w-3.5 h-3.5" /> {note ? 'Edit note' : 'Add note'}
              </button>
              <button onClick={() => (setMenu(false), onRemove())} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50">
                <Trash2 className="w-3.5 h-3.5" /> Remove item
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

const TABLE_STATUS_CLS: Record<string, string> = {
  available: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  occupied: 'border-rose-200 bg-rose-50 text-[#800D32]',
  reserved: 'border-amber-200 bg-amber-50 text-amber-700',
  cleaning: 'border-sky-200 bg-sky-50 text-sky-700',
};

const TablePicker = ({ tables, tableId, tableName, disabled, onPick }: { tables: RestaurantTable[]; tableId?: string; tableName?: string; disabled: boolean; onPick: (t?: RestaurantTable) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useOutside(ref, close, open);
  const sections = useMemo(() => {
    const m: Record<string, RestaurantTable[]> = {};
    tables.forEach((t) => {
      const s = (t as unknown as { section?: string }).section || 'Main';
      (m[s] ||= []).push(t);
    });
    return m;
  }, [tables]);
  return (
    <div ref={ref} className="relative shrink-0">
      <button
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-white text-xs xl:text-sm font-black transition disabled:opacity-40 disabled:cursor-not-allowed ${!tableId && !disabled ? 'border-amber-300 text-amber-700' : 'border-gray-200 text-[#191923] hover:border-[#F3C3D2]'
          }`}
      >
        <Armchair className="w-4 h-4 text-[#800D32]" />
        {tableName ?? 'Select Table'}
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pos-pop fixed sm:absolute left-3 right-3 sm:left-0 sm:right-auto top-auto sm:top-full mt-2 sm:w-[360px] max-h-[60dvh] overflow-y-auto pos-scroll bg-white rounded-2xl border border-gray-100 shadow-2xl p-3 z-40">
          {tables.length === 0 && <p className="text-xs text-gray-500 p-2">No tables configured.</p>}
          {Object.entries(sections).map(([sec, list]) => (
            <div key={sec} className="mb-2 last:mb-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">{sec}</p>
              <div className="grid grid-cols-4 gap-1.5">
                {list.map((t) => {
                  const st = String((t as unknown as { status?: string }).status ?? 'available').toLowerCase();
                  return (
                    <button
                      key={t.id}
                      onClick={() => (onPick(t), setOpen(false))}
                      className={`py-2 rounded-lg border text-xs font-black transition hover:scale-105 ${TABLE_STATUS_CLS[st] ?? TABLE_STATUS_CLS.available} ${t.id === tableId ? 'ring-2 ring-[#800D32] ring-offset-1' : ''}`}
                      title={st}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-3 pt-2 mt-1 border-t border-gray-100 text-[10px] font-bold text-gray-500">
            {Object.keys(TABLE_STATUS_CLS).map((s) => (
              <span key={s} className="flex items-center gap-1 capitalize">
                <span className={`w-2.5 h-2.5 rounded border ${TABLE_STATUS_CLS[s]}`} />
                {s}
              </span>
            ))}
            {tableId && (
              <button onClick={() => (onPick(undefined), setOpen(false))} className="ml-auto text-rose-600">
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const GuestPicker = ({ guests, setGuests }: { guests: number; setGuests: (n: number) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useOutside(ref, close, open);
  return (
    <div ref={ref} className="relative shrink-0">
      <button onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs xl:text-sm font-bold text-[#191923] hover:border-[#F3C3D2] transition">
        <Users className="w-4 h-4 text-[#800D32]" /> {guests} Guests
      </button>
      {open && (
        <div className="pos-pop absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-gray-100 shadow-2xl p-3 z-40">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-gray-600">Guests</span>
            <Stepper qty={guests} onDec={() => setGuests(Math.max(1, guests - 1))} onInc={() => setGuests(Math.min(50, guests + 1))} />
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15].map((n) => (
              <button key={n} onClick={() => (setGuests(n), setOpen(false))} className={`py-1.5 rounded-lg text-xs font-black border transition ${n === guests ? 'bg-[#800D32] text-white border-[#800D32]' : 'border-gray-200 text-gray-700 hover:border-[#F3C3D2]'}`}>
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const OfferPanel = ({ subtotal, activeCode, activePct, onApply }: { subtotal: number; activeCode?: string; activePct: number; onApply: (pct: number, code?: string) => void }) => {
  const [custom, setCustom] = useState('');
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const applyCode = () => {
    const o = OFFERS.find((x) => x.code === code.trim().toUpperCase());
    if (!o) return setErr('Invalid coupon code');
    if (o.minPaise && subtotal < o.minPaise) return setErr(`Minimum bill ${formatINR(o.minPaise)} required`);
    onApply(o.pct, o.code);
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={code} onChange={(e) => (setCode(e.target.value), setErr(''))} onKeyDown={(e) => e.key === 'Enter' && applyCode()} placeholder="Enter coupon code" className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#800D32]/40" />
        <button onClick={applyCode} className="px-4 rounded-xl bg-[#800D32] text-white text-sm font-black">
          Apply
        </button>
      </div>
      {err && <p className="text-xs font-bold text-rose-600 -mt-2">{err}</p>}
      <div className="space-y-2">
        {OFFERS.map((o) => {
          const locked = !!o.minPaise && subtotal < o.minPaise;
          const active = activeCode === o.code;
          return (
            <div key={o.code} className={`flex items-center gap-3 rounded-xl border-2 border-dashed p-3 transition ${active ? 'border-[#800D32] bg-[#FFF5F8]' : 'border-[#F3C3D2]'} ${locked ? 'opacity-50' : ''}`}>
              <div className="w-11 h-11 rounded-xl bg-[#800D32] text-white flex flex-col items-center justify-center shrink-0 leading-none">
                <span className="text-sm font-black">{o.pct}%</span>
                <span className="text-[8px] font-bold">OFF</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-[#191923]">{o.code}</p>
                <p className="text-xs text-gray-500">{o.desc}</p>
              </div>
              <button disabled={locked} onClick={() => onApply(active ? 0 : o.pct, active ? undefined : o.code)} className={`px-3 py-1.5 rounded-lg text-xs font-black ${active ? 'bg-white border border-rose-200 text-rose-600' : 'bg-[#800D32] text-white'} disabled:cursor-not-allowed`}>
                {active ? 'Remove' : locked ? 'Locked' : 'Apply'}
              </button>
            </div>
          );
        })}
      </div>
      <div className="rounded-xl bg-gray-50 p-3 space-y-2">
        <p className="text-xs font-bold text-gray-600">Manual discount</p>
        <div className="flex flex-wrap gap-2">
          {[0, 5, 10, 15, 20, 25].map((p) => (
            <button key={p} onClick={() => onApply(p, undefined)} className={`px-3 py-1.5 rounded-lg text-xs font-black border ${!activeCode && activePct === p ? 'bg-[#800D32] text-white border-[#800D32]' : 'bg-white border-gray-200 text-gray-700'}`}>
              {p === 0 ? 'None' : `${p}%`}
            </button>
          ))}
          <div className="flex items-center gap-1">
            <input value={custom} onChange={(e) => setCustom(e.target.value.replace(/[^\d.]/g, ''))} placeholder="Custom %" className="w-24 px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-bold bg-white focus:outline-none" />
            <button onClick={() => custom && onApply(Math.min(100, parseFloat(custom) || 0))} className="px-3 py-1.5 rounded-lg bg-[#191923] text-white text-xs font-bold">
              Set
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NoteEditor = ({ initial, onSave }: { initial: string; onSave: (v: string) => void }) => {
  const [v, setV] = useState(initial);
  return (
    <div className="space-y-3">
      <textarea autoFocus value={v} onChange={(e) => setV(e.target.value.slice(0, 200))} rows={3} placeholder="e.g. Less spicy, no onion…" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#800D32]/40" />
      <div className="flex flex-wrap gap-1.5">
        {NOTE_TAGS.map((t) => (
          <button key={t} onClick={() => setV((x) => (x ? `${x}, ${t}` : t))} className="px-2.5 py-1 rounded-full bg-[#FFF5F8] border border-[#F8D5E0] text-[11px] font-bold text-[#800D32] hover:bg-[#FDEBF1]">
            + {t}
          </button>
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-1">
        {initial && (
          <button onClick={() => onSave('')} className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 text-sm font-bold">
            Remove
          </button>
        )}
        <button onClick={() => onSave(v.trim())} className="px-5 py-2 rounded-xl bg-[#800D32] text-white text-sm font-black">
          Save note
        </button>
      </div>
    </div>
  );
};

const HistoryList = ({
  orders,
  mode,
  busy,
  onPdf,
  onReorder,
}: {
  orders: RecentOrder[];
  mode: 'recent' | 'bills';
  busy: string | null;
  onPdf: (o: RecentOrder, kind: 'bill' | 'invoice', mode: PdfMode) => void;
  onReorder: (o: RecentOrder) => void;
}) => {
  const [q, setQ] = useState('');
  const [day, setDay] = useState<'today' | 'all'>('today');
  const today = new Date().toDateString();
  const list = orders.filter((o) => {
    if (day === 'today' && new Date(o.createdAt).toDateString() !== today) return false;
    const s = q.trim().toLowerCase();
    return !s || [o.orderNumber, o.tableName, o.customer?.name, o.customer?.phone].some((x) => x?.toLowerCase().includes(s));
  });
  const sum = list.reduce((a, o) => a + o.grandTotalPaise, 0);
  const iconBtn = 'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition';
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order no, table, customer…" className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800D32]/40" />
        </div>
        <div className="inline-flex rounded-xl bg-gray-100 p-0.5">
          {(['today', 'all'] as const).map((d) => (
            <button key={d} onClick={() => setDay(d)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${day === d ? 'bg-white text-[#800D32] shadow-sm' : 'text-gray-500'}`}>
              {d}
            </button>
          ))}
        </div>
        <span className="text-xs font-bold text-gray-500">
          {list.length} · <span className="text-[#800D32]">{formatINR(sum)}</span>
        </span>
      </div>
      {list.length === 0 ? (
        <Empty icon={<Receipt className="w-6 h-6" />} title="No settled orders yet" sub="Completed orders will appear here" />
      ) : (
        <div className="space-y-2">
          {list.map((o) => (
            <div key={o.id} className="rounded-xl border border-gray-100 p-3 hover:border-[#F3C3D2] transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FDEBF1] text-[#800D32] flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-[#191923]">
                    {o.orderNumber} <span className="text-xs font-semibold text-gray-400">· {timeAgo(o.createdAt)}</span>
                  </p>
                  <p className="text-xs font-semibold text-gray-500 truncate">
                    {ORDER_TYPE_LABEL[o.orderType]}
                    {o.tableName ? ` · ${o.tableName}` : ''}
                    {o.customer?.name ? ` · ${o.customer.name}` : ''} · {o.lines.length} items · {o.payments?.map((p) => p.method.toUpperCase()).join(' + ')}
                  </p>
                </div>
                <span className="text-sm font-black text-[#191923]">{formatINR(o.grandTotalPaise)}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2.5 pl-[52px]">
                <button disabled={busy === `h-${o.id}-bill`} onClick={() => onPdf(o, 'bill', 'download')} className={`${iconBtn} border-gray-200 text-gray-700 hover:border-[#800D32] hover:text-[#800D32]`}>
                  <Download className="w-3.5 h-3.5" /> Bill
                </button>
                <button disabled={busy === `h-${o.id}-invoice`} onClick={() => onPdf(o, 'invoice', 'download')} className={`${iconBtn} border-gray-200 text-gray-700 hover:border-[#800D32] hover:text-[#800D32]`}>
                  <Download className="w-3.5 h-3.5" /> Invoice
                </button>
                <button onClick={() => onPdf(o, 'bill', 'print')} className={`${iconBtn} border-gray-200 text-gray-700 hover:border-[#800D32] hover:text-[#800D32]`}>
                  <Printer className="w-3.5 h-3.5" /> Reprint
                </button>
                <button onClick={() => onPdf(o, 'invoice', 'preview')} className={`${iconBtn} border-gray-200 text-gray-700 hover:border-[#800D32] hover:text-[#800D32]`}>
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                {mode === 'recent' && (
                  <button onClick={() => onReorder(o)} className={`${iconBtn} border-[#800D32] bg-[#800D32] text-white ml-auto`}>
                    <RotateCcw className="w-3.5 h-3.5" /> Reorder
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const KOT_STATUS = {
  pending: { cls: 'bg-amber-50 text-amber-700 border-amber-200', next: 'Start preparing' },
  preparing: { cls: 'bg-sky-50 text-sky-700 border-sky-200', next: 'Mark ready' },
  ready: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', next: 'Served' },
  served: { cls: 'bg-gray-50 text-gray-500 border-gray-200', next: '' },
};

const KotQueue = ({ queue, onAdvance, onReprint, onClearServed }: { queue: KotEntry[]; onAdvance: (id: string) => void; onReprint: (k: KotEntry, m: PdfMode) => void; onClearServed: () => void }) => {
  const [show, setShow] = useState<'active' | 'all'>('active');
  const list = queue.filter((k) => show === 'all' || k.status !== 'served');
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-xl bg-gray-100 p-0.5">
          {(['active', 'all'] as const).map((s) => (
            <button key={s} onClick={() => setShow(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${show === s ? 'bg-white text-[#800D32] shadow-sm' : 'text-gray-500'}`}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={onClearServed} className="ml-auto text-xs font-bold text-gray-500 hover:text-rose-600">
          Clear served
        </button>
      </div>
      {list.length === 0 ? (
        <Empty icon={<ChefHat className="w-6 h-6" />} title="Kitchen is all clear" sub="Send a KOT from the cart to see it here" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-2.5">
          {list.map((k) => (
            <div key={k.id} className="rounded-xl border border-gray-100 p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-[#191923]">KOT #{k.kotNumber}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border capitalize ${KOT_STATUS[k.status].cls}`}>{k.status}</span>
                <span className="ml-auto text-[11px] font-semibold text-gray-400">{timeAgo(k.createdAt)}</span>
              </div>
              <p className="text-xs font-semibold text-gray-500">
                {k.orderNumber} · {ORDER_TYPE_LABEL[k.orderType]}
                {k.tableName ? ` · ${k.tableName}` : ''}
              </p>
              <ul className="text-xs text-[#191923] space-y-0.5">
                {k.items.map((it, i) => (
                  <li key={i} className="flex gap-1.5">
                    <span className="font-black text-[#800D32]">{it.qty}×</span>
                    <span className="font-semibold">{it.name}</span>
                    {it.notes && <span className="italic text-gray-400 truncate">— {it.notes}</span>}
                  </li>
                ))}
              </ul>
              <div className="flex gap-1.5 mt-auto pt-1">
                {k.status !== 'served' && (
                  <button onClick={() => onAdvance(k.id)} className="flex-1 px-2 py-1.5 rounded-lg bg-[#800D32] text-white text-[11px] font-bold">
                    {KOT_STATUS[k.status].next}
                  </button>
                )}
                <button onClick={() => onReprint(k, 'print')} className="px-2 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-[#800D32]" aria-label="Reprint KOT">
                  <Printer className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onReprint(k, 'download')} className="px-2 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-[#800D32]" aria-label="Download KOT">
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ReservationPanel = ({ tables, list, onAdd, onRemove, onSeat }: { tables: RestaurantTable[]; list: Reservation[]; onAdd: (r: Reservation) => void; onRemove: (id: string) => void; onSeat: (r: Reservation) => void }) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState({ name: '', phone: '', date: todayStr, time: '20:00', guests: 2, tableId: '', note: '' });
  const [err, setErr] = useState('');
  const submit = () => {
    if (!f.name.trim()) return setErr('Guest name is required');
    if (!/^\+?\d[\d ]{8,14}$/.test(f.phone.trim())) return setErr('Enter a valid phone number');
    const t = tables.find((x) => x.id === f.tableId);
    onAdd({ id: uid(), name: f.name.trim(), phone: f.phone.trim(), date: f.date, time: f.time, guests: f.guests, tableId: t?.id, tableName: t?.name, note: f.note.trim() || undefined });
    setF({ ...f, name: '', phone: '', note: '' });
    setErr('');
  };
  const inp = 'px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800D32]/40';
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <input className={inp} placeholder="Guest name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className={inp} placeholder="Phone" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        <input className={inp} type="date" min={todayStr} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        <input className={inp} type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} />
        <input className={inp} type="number" min={1} max={50} value={f.guests} onChange={(e) => setF({ ...f, guests: Math.max(1, +e.target.value || 1) })} placeholder="Guests" />
        <select className={inp} value={f.tableId} onChange={(e) => setF({ ...f, tableId: e.target.value })}>
          <option value="">Any table</option>
          {tables.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <input className={`${inp} col-span-2`} placeholder="Note (birthday, window seat…)" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
      </div>
      {err && <p className="text-xs font-bold text-rose-600 -mt-2">{err}</p>}
      <button onClick={submit} className="w-full py-2.5 rounded-xl bg-[#800D32] text-white text-sm font-black flex items-center justify-center gap-2">
        <CalendarDays className="w-4 h-4" /> Reserve table
      </button>
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Upcoming ({list.length})</p>
        {list.length === 0 ? (
          <p className="text-xs text-gray-400">No reservations yet.</p>
        ) : (
          <div className="space-y-2">
            {list.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                <div className="w-12 text-center shrink-0">
                  <p className="text-sm font-black text-[#800D32] leading-none">{r.time}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-0.5">{new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-[#191923] truncate">{r.name}</p>
                  <p className="text-xs font-semibold text-gray-500 truncate">
                    {r.phone} · {r.guests} guests{r.tableName ? ` · ${r.tableName}` : ''}
                    {r.note ? ` · ${r.note}` : ''}
                  </p>
                </div>
                <button onClick={() => onSeat(r)} className="px-3 py-1.5 rounded-lg bg-[#800D32] text-white text-xs font-bold">
                  Seat now
                </button>
                <button onClick={() => onRemove(r.id)} className="w-8 h-8 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center" aria-label="Cancel reservation">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PosPage;