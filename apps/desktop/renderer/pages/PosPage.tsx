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
  CalendarDays,
  Armchair,
  Users,
  ChevronDown,
  LayoutGrid,
  Heart,
  MoreHorizontal,
  PencilLine,
  BadgePercent,
  Split,
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
  Loader2,
  Bike,
  Check,
} from 'lucide-react';
import { MenuItem, Category, RestaurantTable } from '@bitechez/shared-types';
import { formatINR, paiseToRupees } from '@bitechez/business-logic';
import { useCartStore } from '../stores/cartStore';
import { apiService, OUTLET_ID } from '../services/api';

// 3D Cartoon Assets
import pepperoniPizza3d from '../assets/3d/pepperoni_pizza.png';
import berryCheesecake3d from '../assets/3d/berry_cheesecake.png';
import sushiPlatter3d from '../assets/3d/sushi_platter.png';
import chickenRiceBowl3d from '../assets/3d/chicken_rice_bowl.png';
import classicBurger3d from '../assets/3d/classic_burger.png';
import paneerTikka3d from '../assets/3d/paneer_tikka.png';
import butterChicken3d from '../assets/3d/butter_chicken.png';
import garlicNaan3d from '../assets/3d/garlic_naan.png';
import chefSide3d from '../assets/3d/chef_side.png';
import recentDrink3d from '../assets/3d/recent_drink.png';
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
  const n = (item.name || '').toLowerCase();
  if (/pepperoni|pizza/.test(n)) return pepperoniPizza3d;
  if (/cheesecake|berry/.test(n)) return berryCheesecake3d;
  if (/sushi/.test(n)) return sushiPlatter3d;
  if (/rice.*bowl|chicken.*rice|bowl/.test(n)) return chickenRiceBowl3d;
  if (/classic.*burger|burger/.test(n)) return classicBurger3d;
  if (/paneer.*tikka|tikka/.test(n)) return paneerTikka3d;
  if (/butter.*chicken|chicken/.test(n)) return butterChicken3d;
  if (/garlic.*naan|naan|roti|bread/.test(n)) return garlicNaan3d;
  if (/chocolate|shake|drink|beverage/.test(n)) return recentDrink3d;
  const a = item as unknown as Record<string, unknown>;
  return (a.imageUrl || a.image || a.thumbnailUrl) as string | undefined;
};

/* =====================================================================
   CSS
   ===================================================================== */
const CSS = `
.pos-scroll{scrollbar-width:thin;scrollbar-color:#A7F3D0 transparent}
.pos-scroll::-webkit-scrollbar{width:5px;height:5px}
.pos-scroll::-webkit-scrollbar-thumb{background:#A7F3D0;border-radius:9999px}
.pos-scroll::-webkit-scrollbar-track{background:transparent}
.pos-noscroll{scrollbar-width:none}.pos-noscroll::-webkit-scrollbar{display:none}
@keyframes pos-bump{35%{transform:scale(1.15)}}.pos-bump{animation:pos-bump .22s ease}
@keyframes pos-toast{from{opacity:0;transform:translateY(-8px)}}.pos-toast{animation:pos-toast .25s ease both}
@keyframes floatSlow{0%,100%{transform:translateY(0px)}50%{transform:translateY(-3px)}}
.anim-float{animation:floatSlow 4s ease-in-out infinite}
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
    <div className={`bg-[#F9ECEF] flex items-center justify-center overflow-hidden relative ${className}`}>
      {src && !broken ? (
        <img
          src={src}
          alt={item.name}
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <span className={`${emojiCls} leading-none select-none transition-transform duration-300 group-hover:scale-110`}>{itemEmoji(item.name, catName)}</span>
      )}
    </div>
  );
});

const Stepper = ({ qty, onDec, onInc, size = 'md' }: { qty: number; onDec: () => void; onInc: () => void; size?: 'xs' | 'sm' | 'md' }) => {
  const b = size === 'xs' ? 'w-3.5 h-3.5' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const iconCls = size === 'xs' ? 'w-2 h-2 stroke-[3]' : size === 'sm' ? 'w-2.5 h-2.5 stroke-[3]' : 'w-3 h-3 stroke-[3]';
  const textCls = size === 'xs' ? 'text-[9px] min-w-[12px]' : size === 'sm' ? 'text-[10px] min-w-[14px]' : 'text-xs min-w-[18px]';
  const padding = size === 'xs' ? 'px-0.5 py-0.2' : size === 'sm' ? 'px-1 py-0.5' : 'px-1.5 py-0.5';

  return (
    <div className={`inline-flex items-center gap-0.5 bg-[#E7F9F0] ${padding} rounded-md border border-emerald-200/60`} onClick={(e) => e.stopPropagation()}>
      <button onClick={onDec} className={`${b} flex items-center justify-center text-[#00C060] hover:bg-emerald-100 rounded active:scale-90 transition font-black`} aria-label="Decrease">
        <Minus className={iconCls} />
      </button>
      <span key={qty} className={`pos-bump text-center font-black text-slate-800 ${textCls}`}>
        {qty}
      </span>
      <button onClick={onInc} className={`${b} flex items-center justify-center text-[#00C060] hover:bg-emerald-100 rounded active:scale-90 transition font-black`} aria-label="Increase">
        <Plus className={iconCls} />
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
      <div className={`flex items-stretch rounded-lg border border-slate-200/90 bg-white shadow-xs overflow-hidden transition ${disabled ? 'opacity-50' : 'hover:border-slate-300'}`}>
        <button disabled={disabled || busy} onClick={() => onAction('print')} className="flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed" title={`Print ${label}`}>
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span className="[&>svg]:w-3.5 [&>svg]:h-3.5 text-slate-600">{icon}</span>}
          <span className="text-[10px] font-black leading-none">
            {label}
            {sub && <span className="text-[8px] font-semibold text-slate-400"> {sub}</span>}
          </span>
        </button>
        <button disabled={disabled || busy} onClick={() => setOpen((o) => !o)} className="px-1 border-l border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed" aria-label={`${label} options`}>
          <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open && (
        <div className="pos-pop absolute bottom-full mb-1.5 left-0 right-0 min-w-[140px] bg-white rounded-xl border border-slate-100 shadow-xl p-1 z-30">
          {[
            { m: 'print' as PdfMode, l: 'Print', i: <Printer className="w-3 h-3" /> },
            { m: 'download' as PdfMode, l: 'Download PDF', i: <Download className="w-3 h-3" /> },
            { m: 'preview' as PdfMode, l: 'Preview', i: <Eye className="w-3 h-3" /> },
          ].map((o) => (
            <button
              key={o.m}
              onClick={() => {
                setOpen(false);
                onAction(o.m);
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900"
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

const ItemCard = memo(({ item, catName, qty, badge, fav, index, onAdd, onDec, onFav }: ItemProps) => {
  const imgSrc = itemImage(item);
  return (
    <div
      onClick={() => onAdd(item)}
      style={{ animationDelay: `${Math.min(index, 14) * 15}ms` }}
      className={`pos-card group relative bg-white rounded-lg border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col p-2 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] ${
        qty
          ? 'border-emerald-400 ring-1 ring-emerald-400/20 shadow-xs'
          : 'border-slate-100 hover:border-emerald-200 shadow-xs'
      }`}
    >
      {/* Top action row: badge or heart */}
      <div className="flex items-center justify-between w-full h-3.5 mb-0.5">
        {badge ? (
          <span className="text-[7.5px] font-black px-1 py-0.2 rounded bg-emerald-50 text-[#00C060]">
            {badge}
          </span>
        ) : <span />}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onFav(item.id);
          }}
          className="w-4 h-4 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 transition active:scale-90 ml-auto"
          aria-label="Favourite"
        >
          <Heart className={`w-2.5 h-2.5 transition ${fav ? 'fill-[#E11D48] text-[#E11D48]' : 'text-slate-300 hover:text-rose-400'}`} />
        </button>
      </div>

      {/* 3D Food Cartoon Sticker */}
      <div className="w-full h-14 sm:h-16 flex items-center justify-center my-0.5">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={item.name}
            className="max-h-full max-w-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <span className="text-2xl select-none group-hover:scale-110 transition-transform">
            {itemEmoji(item.name, catName)}
          </span>
        )}
      </div>

      {/* Item info */}
      <div className="mt-0.5 flex flex-col justify-between flex-1">
        <h4 className="text-[10px] font-black text-slate-850 truncate leading-tight" title={item.name}>
          {item.name}
        </h4>
        <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-50/80">
          <span className="text-[10px] font-black text-[#00C060] tracking-tight">
            {formatINR(item.basePricePaise)}
          </span>
          {qty ? (
            <Stepper qty={qty} onDec={() => onDec(item)} onInc={() => onAdd(item)} size="xs" />
          ) : (
            <span className="w-4 h-4 rounded-full border border-emerald-300 text-[#00C060] flex items-center justify-center group-hover:bg-[#00C060] group-hover:text-white transition shadow-xs active:scale-90">
              <Plus className="w-2.5 h-2.5 stroke-[3]" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

const ItemRow = memo(({ item, catName, qty, badge, fav, index, onAdd, onDec, onFav }: ItemProps) => {
  const imgSrc = itemImage(item);
  return (
    <div
      onClick={() => onAdd(item)}
      style={{ animationDelay: `${Math.min(index, 14) * 18}ms` }}
      className={`pos-card group flex items-center gap-3 bg-white rounded-xl border p-2.5 pr-3 cursor-pointer hover:shadow-md transition ${
        qty ? 'border-emerald-300' : 'border-slate-100 hover:border-emerald-200'
      }`}
    >
      <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
        {imgSrc ? (
          <img src={imgSrc} alt={item.name} className="w-10 h-10 object-contain" />
        ) : (
          <span className="text-2xl">{itemEmoji(item.name, catName)}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <VegMark veg={item.isVeg} />
          <h4 className="text-xs font-black text-slate-900 truncate">{item.name}</h4>
          {badge && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-[#00C060]">{badge}</span>}
        </div>
        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
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
        <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-[#E11D48] text-[#E11D48]' : 'text-slate-300 hover:text-rose-400'}`} />
      </button>
      <span className="w-18 text-right text-xs font-black text-slate-900">{formatINR(item.basePricePaise)}</span>
      {qty ? (
        <Stepper qty={qty} onDec={() => onDec(item)} onInc={() => onAdd(item)} size="sm" />
      ) : (
        <span className="w-6 h-6 rounded-full border border-emerald-300 text-[#00C060] flex items-center justify-center group-hover:bg-[#00C060] group-hover:text-white transition">
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
        </span>
      )}
    </div>
  );
});

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
  const [categories, setCategories] = usePersisted<Category[]>('pos.categories', []);
  const [menuItems, setMenuItems] = usePersisted<MenuItem[]>('pos.menuItems', []);
  const [tables, setTables] = usePersisted<RestaurantTable[]>('pos.tables', []);
  const [loading, setLoading] = useState(() => menuItems.length === 0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPosData = useCallback(async () => {
    if (!menuItems.length) setLoading(true);
    setLoadError(null);
    try {
      const [cats, items, tbls] = await Promise.all([apiService.getCategories(), apiService.getMenuItems(), apiService.getTables()]);
      setCategories(cats);
      setMenuItems(items);
      setTables(tbls);
    } catch (e) {
      console.error(e);
      if (!menuItems.length) setLoadError('Could not load menu. Check the local server / database.');
    } finally {
      setLoading(false);
    }
  }, [menuItems.length, setCategories, setMenuItems, setTables]);
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
  void setSearchQuery;
  void setVegOnly;
  void setView;
  void setSort;

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
  void setHistoryMode;
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
  void startNewOrder;

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

  /* ---------- place order without immediate payment (Dine & Pay Later) ---------- */
  const handlePlaceOrderLater = async () => {
    if (!cart.length) return notify('error', 'Cart is empty');
    if (orderType === 'dine_in' && !tableId) return notify('error', 'Please select a table');
    setIsProcessing(true);
    try {
      const orderNumber = orderNo;
      const orderPayload = {
        outletId: OUTLET_ID,
        orderNumber,
        orderType,
        tableId: orderType === 'dine_in' ? tableId : undefined,
        tableName: orderType === 'dine_in' ? tableName : undefined,
        status: 'placed',
        paymentStatus: 'pending',
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

      const createdOrder = await apiService.createOrder(orderPayload as any);

      // Create KOT for kitchen
      await apiService.createKot({
        outletId: OUTLET_ID,
        orderId: createdOrder.id,
        orderNumber,
        kotNumber: nextKotNumber(),
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

      // Save to held orders for real-time table syncing
      const h: HeldOrder = {
        id: createdOrder.id || uid(),
        orderNumber,
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
        sentQty: Object.fromEntries(cart.map((e) => [e.item.id, e.quantity])),
        entries: cart.map((e) => ({ item: e.item, quantity: e.quantity })),
        totalPaise: total,
      };
      setHeld((l) => [h, ...l.filter((x) => x.tableId !== tableId)]);

      // Realtime table update
      if (tableId) {
        await apiService.updateTableStatus(tableId, 'occupied', createdOrder.id, guests);
      }

      notify('success', `Order ${orderNumber} placed (Pay Later). Table is now Occupied.`);
      resetOrder();
    } catch (err) {
      console.error('Failed to place order:', err);
      notify('error', 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
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

      // Realtime table update: free table or mark for cleaning
      if (orderPayload.tableId) {
        await apiService.updateTableStatus(orderPayload.tableId, 'cleaning');
        setHeld((l) => l.filter((x) => x.tableId !== orderPayload.tableId));
      }
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
  return (
    <div className="pos-root flex gap-3 h-full w-full overflow-hidden bg-[#FAF8F9]">
      <style>{CSS}</style>

      {/* Toast */}
      {toast && (
        <div
          key={toast.id}
          className={`pos-toast fixed top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-5 z-[80] px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-bold border ${toast.type === 'success' ? 'bg-[#800D32] text-white border-rose-400' : toast.type === 'error' ? 'bg-white text-rose-700 border-rose-200' : 'bg-white text-[#191923] border-gray-200'
            }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <AlertCircle className={`w-4 h-4 ${toast.type === 'error' ? 'text-rose-500' : 'text-[#800D32]'}`} />}
          {toast.text}
        </div>
      )}

      {/* ================= LEFT: MENU ================= */}
      <div className="flex-1 min-w-0 flex gap-3 h-full overflow-hidden">
        {/* Categories sidebar (soft white card with chef illustration at bottom) */}
        <aside className="hidden md:flex w-44 xl:w-48 shrink-0 flex-col bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-2 h-full overflow-hidden justify-between">
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
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-[#E7F9F0] text-[#00C060] font-black shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <c.Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#00C060]' : 'text-slate-400'}`} />
                  <span className="flex-1 text-left truncate">{c.name}</span>
                  <span className={`text-[11px] font-semibold ${active ? 'text-[#00C060]' : 'text-slate-400'}`}>
                    ({c.count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom 3D Chef mascot badge */}
          <div className="pt-2 shrink-0 border-t border-slate-50 flex items-center justify-center">
            <img src={chefSide3d} alt="Chef" className="w-24 h-24 object-contain filter drop-shadow-md anim-float" />
          </div>
        </aside>

        {/* Right side of the left sidebar: Top controls + Menu items grid */}
        <div className="flex-1 min-w-0 flex flex-col gap-2.5 h-full overflow-hidden">
          {/* Top Controls Row matching reference image: Order Type, Table, Guests, Search, Category carousel on mobile */}
          <div className="flex flex-col gap-2 shrink-0 py-0.5">
            {/* Top selectors row (Carousel on small screens) */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory py-1">
              {/* Order Type Dropdown */}
              <div className="shrink-0 snap-start">
                <OrderTypePicker orderType={orderType as OrderTypeKey} onChange={(t) => setOrderType(t)} />
              </div>

              {/* Table Picker */}
              <div className="shrink-0 snap-start">
                <TablePicker tables={tables} tableId={tableId} tableName={tableName} disabled={orderType !== 'dine_in'} onPick={(t) => setTable(t?.id, t?.name)} />
              </div>

              {/* Guests Picker */}
              <div className="shrink-0 snap-start">
                <GuestPicker guests={guests} setGuests={setGuests} />
              </div>

              {/* Search bar on mobile / compact */}
              <div className="relative shrink-0 w-36 sm:w-48 snap-start">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search item..."
                  className="w-full pl-7 pr-2 py-1.5 rounded-xl border border-slate-200/90 text-xs focus:outline-none focus:border-[#00C060] bg-white"
                />
              </div>
            </div>

            {/* Mobile Categories Carousel (Visible on mobile/tablet when sidebar is hidden) */}
            <div className="md:hidden flex items-center gap-1.5 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1">
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
                    className={`shrink-0 snap-start flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      active
                        ? 'bg-[#00C060] text-white shadow-xs'
                        : 'bg-white border border-slate-200/80 text-slate-600 hover:border-emerald-200'
                    }`}
                  >
                    <c.Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{c.name}</span>
                    <span className={`text-[10px] ${active ? 'text-white/80' : 'text-slate-400'}`}>
                      ({c.count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Items Section */}
          <section className="flex-1 min-w-0 flex flex-col gap-2 h-full overflow-hidden">
            {/* Optimized compact cards grid: 4 to 5 cards per row */}
            <div className="flex-1 min-h-0 overflow-y-auto pos-scroll pr-1 pb-28 md:pb-4">
              {loading ? (
                <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="rounded-xl bg-white border border-slate-100 p-3 space-y-2 shadow-xs">
                      <div className="h-20 rounded-lg bg-slate-50 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />
                      </div>
                      <div className="h-2.5 w-3/4 rounded bg-slate-100" />
                      <div className="h-2.5 w-1/3 rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : loadError ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />
                  <p className="text-xs font-bold text-slate-700">{loadError}</p>
                  <button onClick={loadPosData} className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00C060] text-white text-xs font-bold shadow-md">
                    <RotateCcw className="w-3.5 h-3.5" /> Retry
                  </button>
                </div>
              ) : filteredItems.length === 0 ? (
                <Empty icon={<Search className="w-6 h-6" />} title="No items found" sub="Try another category or search term" />
              ) : view === 'grid' ? (
                <div key={selectedCategory + sort} className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                  {filteredItems.map((item, i) => (
                    <ItemCard key={item.id} item={item} catName={catName[item.categoryId]} qty={qtyMap[item.id] ?? 0} badge={badges[item.id]} fav={favSet.has(item.id)} index={i} onAdd={onAdd} onDec={onDec} onFav={toggleFav} />
                  ))}
                </div>
              ) : (
                <div key={selectedCategory + sort + 'l'} className="space-y-1.5">
                  {filteredItems.map((item, i) => (
                    <ItemRow key={item.id} item={item} catName={catName[item.categoryId]} qty={qtyMap[item.id] ?? 0} badge={badges[item.id]} fav={favSet.has(item.id)} index={i} onAdd={onAdd} onDec={onDec} onFav={toggleFav} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* ================= RIGHT: CART (Soft UI) ================= */}
      <aside
        className={`fixed lg:static inset-y-0 right-0 z-50 lg:z-auto w-[90vw] max-w-[360px] lg:w-[320px] xl:w-[350px] lg:max-w-none shrink-0 bg-white lg:rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(15,23,42,0.05)] flex flex-col h-full overflow-hidden transition-transform duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Cart header */}
        <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#E7F9F0] text-[#00C060] flex items-center justify-center shrink-0">
              <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black text-slate-900 leading-tight">Current Order</h3>
              <p className="text-[10px] font-semibold text-slate-400 truncate">
                {ORDER_TYPE_LABEL[orderType as OrderTypeKey]} {orderType === 'dine_in' && tableName ? `• Table ${tableName}` : ''} • {guests} Guests
              </p>
            </div>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => (clearCart(), setSentQty({}), setItemNotes({}))}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-rose-100 text-rose-500 text-[10px] font-bold hover:bg-rose-50 hover:border-rose-200 transition"
            >
              <Trash2 className="w-2.5 h-2.5" /> Clear
            </button>
          )}
          <button onClick={() => setCartOpen(false)} className="lg:hidden w-6 h-6 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400" aria-label="Close cart">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Cart lines (scrollable) */}
        <div className="flex-1 min-h-0 overflow-y-auto pos-scroll px-2.5 divide-y divide-slate-100/70 pb-20 lg:pb-0">
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

        {/* Summary (compact space-optimized) */}
        <div className="p-2.5 border-t border-slate-100 space-y-1.5 bg-white shrink-0">
          {/* Quick buttons: Add Note, Offer, Split Bill */}
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { l: orderNote ? 'Note ✓' : 'Add Note', i: <PencilLine className="w-3 h-3" />, on: () => setModal('note'), active: !!orderNote },
              { l: offerCode || discountPercentage ? `${discountPercentage}% Off` : 'Offer', i: <BadgePercent className="w-3 h-3" />, on: () => setModal('offer'), active: discountPercentage > 0 },
              { l: 'Split Bill', i: <Split className="w-3 h-3" />, on: () => openPay('split'), active: false },
            ].map((b) => (
              <button
                key={b.l}
                onClick={b.on}
                disabled={!cart.length}
                className={`inline-flex items-center justify-center gap-1 py-1.5 rounded-lg border text-[10px] font-bold transition disabled:opacity-40 shadow-xs ${
                  b.active
                    ? 'bg-[#E7F9F0] border-emerald-300 text-[#00C060]'
                    : 'bg-white border-slate-200/80 text-slate-700 hover:border-emerald-300 hover:text-[#00C060]'
                }`}
              >
                {b.i}
                <span className="truncate">{b.l}</span>
              </button>
            ))}
          </div>

          {/* Pricing calculations (compact) */}
          <div className="space-y-1 text-[11px] px-0.5 pt-0.5">
            <div className="flex justify-between font-medium text-slate-500">
              <span>Subtotal</span>
              <span className="text-slate-800 font-bold">{formatINR(calculations.subtotalPaise)}</span>
            </div>
            {calculations.discountPaise > 0 && (
              <div className="flex justify-between font-medium text-[#00C060] text-[10px]">
                <span className="flex items-center gap-1">
                  Discount {offerCode && <span className="text-[8px] font-black bg-emerald-50 border border-emerald-200 rounded px-1">{offerCode}</span>} ({discountPercentage}%)
                </span>
                <span>-{formatINR(calculations.discountPaise)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium text-slate-500 text-[10px]">
              <span>GST (5%)</span>
              <span className="text-slate-800 font-bold">{formatINR(calculations.totalGstPaise)}</span>
            </div>
            {calculations.roundingPaise !== 0 && (
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>Round off</span>
                <span>{formatINR(calculations.roundingPaise)}</span>
              </div>
            )}
          </div>

          {/* Total Amount in emerald accent as in reference */}
          <div className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-100 px-3 py-1.5">
            <span className="text-[11px] font-black text-slate-800 tracking-wide">Total Amount</span>
            <span key={total} className="pos-bump text-base font-black text-[#00C060]">
              {formatINR(total)}
            </span>
          </div>

          {/* Action Buttons: Place Order (Pay Later) & Pay Now */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePlaceOrderLater}
              disabled={!cart.length || isProcessing}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border-2 border-emerald-500 text-[#00C060] bg-emerald-50/50 hover:bg-emerald-100/70 text-xs font-black shadow-xs active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChefHat className="w-3.5 h-3.5" /> Place Order
            </button>
            <button
              onClick={() => openPay()}
              disabled={!cart.length || isProcessing}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#00C060] hover:bg-[#00A850] text-white shadow-xs shadow-emerald-500/20 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-1.5 text-xs font-black">
                <CreditCard className="w-3.5 h-3.5" /> Pay Now
              </span>
              <span className="text-[10px] font-bold text-emerald-100 hidden xl:inline">F10</span>
            </button>
          </div>

          {/* Printable Docs (Compact) */}
          <div className="grid grid-cols-3 gap-1">
            <DocButton icon={<ChefHat className="w-3.5 h-3.5" />} label="KOT" sub="(F8)" busy={pdfBusy === 'kot'} disabled={!cart.length} onAction={handleKot} />
            <DocButton icon={<Receipt className="w-3.5 h-3.5" />} label="Bill PDF" busy={pdfBusy === 'bill'} disabled={!cart.length} onAction={handleBill} />
            <DocButton icon={<FileText className="w-3.5 h-3.5" />} label="Invoice PDF" busy={pdfBusy === 'invoice'} disabled={!cart.length} onAction={handleInvoice} />
          </div>
        </div>
      </aside>

      {/* ================= MOBILE FLOATING ORDER BAR (Above bottom navbar) ================= */}
      {cart.length > 0 && !cartOpen && (
        <div className="lg:hidden fixed bottom-14 left-3 right-3 z-40 animate-bounce-short">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full bg-[#00C060] text-white p-3 rounded-2xl shadow-xl flex items-center justify-between active:scale-[0.99] transition-all border border-emerald-400"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-xs">
                {cartCount}
              </div>
              <div className="text-left">
                <span className="text-xs font-black block leading-tight">View Current Order</span>
                <span className="text-[10px] text-emerald-100 font-semibold block leading-none">
                  {orderType.toUpperCase()} {tableName ? `• T-${tableName}` : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight">{formatINR(total)}</span>
              <span className="px-2.5 py-1 bg-white text-[#00C060] text-xs font-black rounded-xl shadow-xs">
                Checkout →
              </span>
            </div>
          </button>
        </div>
      )}

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
      <div className="pos-in group flex items-center gap-2.5 py-1.5 px-0.5 hover:bg-slate-50/60 rounded-lg transition-colors">
        <Thumb item={entry.item} catName={catName} className="w-9 h-9 rounded-lg shrink-0 bg-slate-50" emojiCls="text-xl" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h5 className="text-[11px] font-black text-slate-800 truncate" title={entry.item.name}>{entry.item.name}</h5>
            <span className="text-[11px] font-black text-slate-900 whitespace-nowrap">{formatINR(entry.item.basePricePaise * entry.quantity)}</span>
          </div>
          {note && <p className="text-[9px] italic text-[#00C060] truncate -mt-0.5">“{note}”</p>}
          <div className="flex items-center justify-between gap-1 mt-1">
            <div className="flex items-center gap-1.5">
              <Stepper qty={entry.quantity} onDec={onDec} onInc={onInc} size="sm" />
              {sent > 0 && (
                <span className={`text-[8px] font-black px-1 py-0.2 rounded ${sent >= entry.quantity ? 'bg-emerald-50 text-[#00C060]' : 'bg-amber-50 text-amber-700'}`}>
                  {sent >= entry.quantity ? 'KOT ✓' : `+${entry.quantity - sent}`}
                </span>
              )}
            </div>
            <div ref={ref} className="relative">
              <button onClick={() => setMenu((m) => !m)} className="w-5 h-5 rounded hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 flex items-center justify-center transition" aria-label="Item options">
                <MoreHorizontal className="w-3 h-3" />
              </button>
              {menu && (
                <div className="pos-pop absolute right-0 top-full mt-1 w-32 bg-white rounded-xl border border-slate-100 shadow-xl p-1 z-20">
                  <button onClick={() => (setMenu(false), onNote())} className="w-full flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-emerald-50 hover:text-[#00C060]">
                    <PencilLine className="w-3 h-3" /> {note ? 'Edit note' : 'Add note'}
                  </button>
                  <button onClick={() => (setMenu(false), onRemove())} className="w-full flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold text-rose-500 hover:bg-rose-50">
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const TABLE_STATUS_CLS: Record<string, string> = {
  available: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300',
  occupied: 'border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300',
  reserved: 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300',
  cleaning: 'border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-300',
};

const OrderTypePicker = ({
  orderType,
  onChange,
}: {
  orderType: OrderTypeKey;
  onChange: (t: OrderTypeKey) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useOutside(ref, close, open);

  const options: { id: OrderTypeKey; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dine_in', label: 'Dine In', icon: Utensils },
    { id: 'takeaway', label: 'Takeaway', icon: ShoppingBag },
    { id: 'delivery', label: 'Delivery', icon: Bike },
  ];

  const current = options.find((o) => o.id === orderType) || options[0];
  const CurrentIcon = current.icon;

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-black text-slate-800 shadow-xs hover:border-emerald-300 hover:shadow-sm transition"
      >
        <span className="w-5 h-5 rounded-lg bg-emerald-50 text-[#00C060] flex items-center justify-center shrink-0">
          <CurrentIcon className="w-3 h-3 stroke-[2.5]" />
        </span>
        <span className="text-slate-600 font-bold">
          Order Type: <span className="text-[#00C060] font-black">{current.label}</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180 text-emerald-600' : ''}`} />
      </button>

      {open && (
        <div className="pos-pop absolute left-0 top-full mt-1.5 w-44 bg-white rounded-xl border border-slate-100 shadow-xl p-1 z-40 space-y-0.5">
          {options.map((opt) => {
            const active = opt.id === orderType;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-bold transition ${
                  active
                    ? 'bg-[#E7F9F0] text-[#00C060] font-black'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#00C060]' : 'text-slate-400'}`} />
                  <span>{opt.label}</span>
                </div>
                {active && <Check className="w-3.5 h-3.5 text-[#00C060] stroke-[3]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
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
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-white text-xs font-black transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs ${
          !tableId && !disabled ? 'border-amber-300 text-amber-700' : 'border-slate-200/90 text-slate-800 hover:border-emerald-300 hover:shadow-sm'
        }`}
      >
        <span className="w-5 h-5 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <Armchair className="w-3 h-3 stroke-[2.5]" />
        </span>
        <span className="font-black text-slate-900">{tableName ?? 'Select Table'}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180 text-emerald-600' : ''}`} />
      </button>
      {open && (
        <div className="pos-pop fixed sm:absolute left-3 right-3 sm:left-0 sm:right-auto top-auto sm:top-full mt-1.5 sm:w-[340px] max-h-[60dvh] overflow-y-auto pos-scroll bg-white rounded-xl border border-slate-100 shadow-2xl p-2.5 z-40">
          {tables.length === 0 && <p className="text-xs text-slate-400 p-2">No tables configured.</p>}
          {Object.entries(sections).map(([sec, list]) => (
            <div key={sec} className="mb-2 last:mb-0">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1 px-1">{sec}</p>
              <div className="grid grid-cols-4 gap-1.5">
                {list.map((t) => {
                  const st = String((t as unknown as { status?: string }).status ?? 'available').toLowerCase();
                  return (
                    <button
                      key={t.id}
                      onClick={() => (onPick(t), setOpen(false))}
                      className={`py-1.5 rounded-lg border text-xs font-black transition hover:scale-105 ${TABLE_STATUS_CLS[st] ?? TABLE_STATUS_CLS.available} ${t.id === tableId ? 'ring-2 ring-[#00C060] ring-offset-1 border-[#00C060]' : ''}`}
                      title={st}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2.5 pt-2 mt-1 border-t border-slate-100 text-[9px] font-bold text-slate-400">
            {Object.keys(TABLE_STATUS_CLS).map((s) => (
              <span key={s} className="flex items-center gap-1 capitalize">
                <span className={`w-2 h-2 rounded border ${TABLE_STATUS_CLS[s]}`} />
                {s}
              </span>
            ))}
            {tableId && (
              <button onClick={() => (onPick(undefined), setOpen(false))} className="ml-auto text-rose-500 font-bold hover:underline">
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
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white text-xs font-bold text-slate-800 shadow-xs hover:border-emerald-300 hover:shadow-sm transition"
      >
        <span className="w-5 h-5 rounded-lg bg-emerald-50 text-[#00C060] flex items-center justify-center shrink-0">
          <Users className="w-3 h-3 stroke-[2.5]" />
        </span>
        <span className="font-black text-slate-900">{guests} Guests</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180 text-emerald-600' : ''}`} />
      </button>
      {open && (
        <div className="pos-pop absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-52 bg-white rounded-xl border border-slate-100 shadow-2xl p-2.5 z-40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Guests</span>
            <Stepper qty={guests} onDec={() => setGuests(Math.max(1, guests - 1))} onInc={() => setGuests(Math.min(50, guests + 1))} size="xs" />
          </div>
          <div className="grid grid-cols-5 gap-1">
            {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15].map((n) => (
              <button
                key={n}
                onClick={() => (setGuests(n), setOpen(false))}
                className={`py-1 rounded-md text-[11px] font-black border transition ${
                  n === guests
                    ? 'bg-[#00C060] text-white border-[#00C060] shadow-xs'
                    : 'border-slate-200/80 text-slate-700 hover:border-emerald-300 hover:text-[#00C060]'
                }`}
              >
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