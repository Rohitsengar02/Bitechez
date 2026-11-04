import React, { memo, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  ShoppingCart,
  PlusCircle,
  ChefHat,
  Users,
  BarChart3,
  Printer,
  Settings,
  Armchair,
  Coins,
  Package,
  ChevronDown,
  Wallet,
  Lightbulb,
  CheckCircle2,
  ClipboardList,
  UtensilsCrossed,
  IndianRupee,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import bannerBg from '../assets/banner_bg.jpg';

/* =====================================================================
   THEME + CONSTANTS
   ===================================================================== */
const BRAND = '#800D32';
const INK = '#191923';

/** Where the steam rises from the chef's cloche (in % of the banner). Tune if your banner art differs. */
const CLOCHE_STEAM = { right: '8.5%', bottom: '49%' };

type Timeframe = 'Today' | '7 Days' | '30 Days';
type TrendSeries = { labels: string[]; values: number[]; tipPrefix: string };
type Seg = { label: string; value: number; color: string; muted?: boolean };

const TREND: Record<Timeframe, TrendSeries> = {
  Today: {
    labels: ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM'],
    values: [3200, 7400, 11800, 14100, 10200, 12600, 20500, 26400, 16800, 20900],
    tipPrefix: 'at',
  },
  '7 Days': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [18400, 21900, 19600, 24300, 31200, 38600, 35100],
    tipPrefix: 'on',
  },
  '30 Days': {
    labels: ['W1', 'W2', 'W3', 'W4'],
    values: [142000, 163000, 184000, 171000],
    tipPrefix: 'in',
  },
};

const OFFERS = [
  { icon: '🍛', text: 'Flat 20% OFF on Biryani Combos' },
  { icon: '🍹', text: 'Buy 1 Get 1 on Mocktails · 4–7 PM' },
  { icon: '🧁', text: 'Free Dessert on bills above ₹999' },
  { icon: '🍢', text: 'Happy Hours: 15% OFF on Starters' },
];

const QUICK_ACTIONS = [
  { label: 'New Sale', key: 'F2', to: '/pos', icon: ShoppingCart, primary: true },
  { label: 'Add Item', key: 'F3', to: '/menu', icon: PlusCircle },
  { label: 'Add Table', key: 'F4', to: '/tables', icon: Armchair },
  { label: 'KOT', key: 'F5', to: '/kitchen', icon: ChefHat },
  { label: 'Customers', key: 'F6', to: '/customers', icon: Users },
  { label: 'Reports', key: 'F7', to: '/tools', icon: BarChart3 },
  { label: 'Printers', key: 'F8', to: '/printers', icon: Printer },
  { label: 'Settings', key: 'F9', to: '/tools', icon: Settings },
];

const STATS = [
  { label: 'Total Sales', value: 24850, prefix: '₹', icon: Coins, color: '#16A34A', tint: 'from-emerald-50', iconCls: 'bg-emerald-100/70 text-emerald-600', delta: '+12.8%', sub: 'vs yesterday', up: true, spark: [4, 6, 5, 7, 6, 9, 8, 11, 12, 15] },
  { label: 'Total Orders', value: 128, icon: ClipboardList, color: '#7C3AED', tint: 'from-violet-50', iconCls: 'bg-violet-100/70 text-violet-600', delta: '+8.2%', up: true, spark: [5, 7, 6, 9, 7, 8, 11, 10, 12, 13] },
  { label: 'Occupied Tables', value: 18, suffix: ' / 24', icon: Armchair, color: '#EA580C', tint: 'from-orange-50', iconCls: 'bg-orange-100/70 text-orange-600', delta: '75%', up: true, spark: [4, 6, 8, 7, 5, 6, 9, 8, 10, 12] },
  { label: 'Total Customers', value: 36, icon: Users, color: '#2563EB', tint: 'from-sky-50', iconCls: 'bg-sky-100/70 text-sky-600', delta: '+15.4%', up: true, spark: [3, 4, 6, 5, 7, 6, 8, 10, 9, 13] },
  { label: 'Pending KOT', value: 6, icon: ChefHat, color: '#E11D48', tint: 'from-rose-50', iconCls: 'bg-rose-100/70 text-rose-600', status: '2 Preparing', spark: [6, 8, 5, 9, 7, 6, 10, 8, 11, 12] },
  { label: 'Inventory Value', value: 5420, prefix: '₹', icon: Package, color: '#16A34A', tint: 'from-emerald-50', iconCls: 'bg-emerald-100/70 text-emerald-600', delta: '-3.1%', up: false, spark: [5, 7, 6, 8, 7, 9, 8, 10, 11, 12] },
];

const ORDER_TYPES: Seg[] = [
  { label: 'Dine In', value: 52, color: BRAND },
  { label: 'Takeaway', value: 28, color: '#E46A93' },
  { label: 'Delivery', value: 20, color: '#F6BCCD' },
];

const TABLE_STATUS: Seg[] = [
  { label: 'Available', value: 6, color: '#22C55E' },
  { label: 'Occupied', value: 18, color: BRAND },
  { label: 'Reserved', value: 0, color: '#F59E0B', muted: true },
  { label: 'Cleaning', value: 0, color: '#60A5FA', muted: true },
];

const PAYMENTS: Seg[] = [
  { label: 'Cash', value: 46, color: BRAND },
  { label: 'UPI', value: 32, color: '#F25C8C' },
  { label: 'Card', value: 14, color: '#C084FC' },
  { label: 'Other', value: 8, color: '#93C5FD' },
];

const TOP_ITEMS = [
  { name: 'Chicken Biryani', emoji: '🍛', orders: 42 },
  { name: 'Paneer Tikka', emoji: '🍢', orders: 28 },
  { name: 'Veg Fried Rice', emoji: '🍚', orders: 24 },
  { name: 'Hakka Noodles', emoji: '🍜', orders: 20 },
  { name: 'Masala Dosa', emoji: '🥞', orders: 18 },
];

const HOURLY = [
  { t: '9 AM', v: 850 }, { t: '10 AM', v: 1700 }, { t: '11 AM', v: 2850 }, { t: '12 PM', v: 3550 },
  { t: '1 PM', v: 2550 }, { t: '2 PM', v: 3000 }, { t: '3 PM', v: 3850 }, { t: '4 PM', v: 5840 },
  { t: '5 PM', v: 3850 }, { t: '6 PM', v: 2850 },
];

const CATEGORIES = [
  { name: 'Biryani', icon: '🍛', v: 8450 },
  { name: 'Starters', icon: '🍢', v: 5420 },
  { name: 'Main Course', icon: '🍲', v: 4860 },
  { name: 'Beverages', icon: '🥤', v: 3240 },
  { name: 'Desserts', icon: '🧁', v: 1880 },
];

const HIGHLIGHTS = [
  'Sales is up by 12.8% (₹24,850)',
  '128 orders completed',
  '18 of 24 tables are occupied (75%)',
  '6 KOT pending (2 preparing)',
];

/* =====================================================================
   CSS (GPU-only transforms/opacity → smooth + cheap)
   ===================================================================== */
const CSS = `
.cl-draw{stroke-dasharray:1;stroke-dashoffset:1;animation:cl-draw 1.2s cubic-bezier(.65,0,.35,1) .2s forwards}
@keyframes cl-draw{to{stroke-dashoffset:0}}
.cl-fade{opacity:0;animation:cl-fade .9s ease .55s forwards}
@keyframes cl-fade{to{opacity:1}}
.cl-pop{transform-box:fill-box;transform-origin:center;animation:cl-pop .45s cubic-bezier(.34,1.56,.64,1) both}
@keyframes cl-pop{from{transform:scale(0);opacity:0}}
.cl-bar{transform-origin:bottom;animation:cl-grow-y .75s cubic-bezier(.34,1.25,.64,1) both}
@keyframes cl-grow-y{from{transform:scaleY(0)}}
.cl-bar-x{transform-origin:left;animation:cl-grow-x 1s cubic-bezier(.22,1,.36,1) both}
@keyframes cl-grow-x{from{transform:scaleX(0)}}
.cl-donut-seg{animation:cl-donut 1.1s cubic-bezier(.22,1,.36,1) both}
@keyframes cl-donut{from{stroke-dasharray:0 100}}
.cl-offer-in{animation:cl-offer .5s cubic-bezier(.22,1,.36,1) both}
@keyframes cl-offer{from{transform:translateY(110%);opacity:0}}
.cl-wave{display:inline-block;transform-origin:70% 70%;animation:cl-wave 2.8s ease-in-out infinite}
@keyframes cl-wave{0%,60%,100%{transform:rotate(0)}10%,30%{transform:rotate(16deg)}20%{transform:rotate(-8deg)}40%{transform:rotate(-4deg)}50%{transform:rotate(10deg)}}
.cl-ping{transform-box:fill-box;transform-origin:center;animation:cl-ping 1.6s cubic-bezier(0,0,.2,1) infinite}
@keyframes cl-ping{75%,100%{transform:scale(2.4);opacity:0}}
/* ---- cooking / boiling ---- */
.cl-flame{transform-box:fill-box;transform-origin:50% 100%;animation:cl-flicker .45s ease-in-out infinite alternate}
.cl-flame.d2{animation-duration:.6s;animation-delay:-.2s}
@keyframes cl-flicker{0%{transform:scale(1,1)}50%{transform:scale(.88,1.18)}100%{transform:scale(1.08,.9)}}
.cl-pot{transform-box:fill-box;transform-origin:50% 100%;animation:cl-rattle 1.3s ease-in-out infinite}
@keyframes cl-rattle{0%,100%{transform:rotate(0)}25%{transform:rotate(-2deg)}75%{transform:rotate(2deg)}}
.cl-bubble{transform-box:fill-box;transform-origin:center;animation:cl-bubble 1.5s ease-in infinite;opacity:0}
@keyframes cl-bubble{0%{transform:translateY(3px) scale(.3);opacity:0}25%{opacity:1}85%{opacity:.9}100%{transform:translateY(-10px) scale(1);opacity:0}}
.cl-wisp{transform-box:fill-box;transform-origin:50% 100%;animation:cl-wisp 2.2s ease-out infinite;opacity:0}
@keyframes cl-wisp{0%{transform:translateY(4px) scaleY(.5);opacity:0}35%{opacity:.85}100%{transform:translateY(-7px) scaleY(1.2);opacity:0}}
.cl-steam{position:absolute;width:72px;height:90px;pointer-events:none}
.cl-steam span{position:absolute;bottom:0;width:24px;height:24px;border-radius:9999px;opacity:0;
  background:radial-gradient(circle,rgba(255,255,255,.95) 0%,rgba(255,255,255,.4) 45%,transparent 70%);
  filter:blur(3px);animation:cl-rise 3.4s ease-out infinite;will-change:transform,opacity}
.cl-steam span:nth-child(1){left:8px;animation-delay:0s}
.cl-steam span:nth-child(2){left:26px;animation-delay:.85s}
.cl-steam span:nth-child(3){left:40px;animation-delay:1.7s}
.cl-steam span:nth-child(4){left:18px;animation-delay:2.55s}
@keyframes cl-rise{0%{transform:translate(0,0) scale(.5);opacity:0}20%{opacity:.9}55%{transform:translate(9px,-45px) scale(1.35)}100%{transform:translate(-7px,-88px) scale(2);opacity:0}}
.cl-spark{position:absolute;pointer-events:none;animation:cl-twinkle 2.6s ease-in-out infinite}
@keyframes cl-twinkle{0%,100%{transform:translateY(0) scale(.6);opacity:.15}50%{transform:translateY(-8px) scale(1);opacity:.9}}
@media (prefers-reduced-motion:reduce){.cl-root *,.cl-root *::before,.cl-root *::after{animation-duration:.001ms!important;animation-iteration-count:1!important;animation-delay:0s!important}}
`;

/* =====================================================================
   HELPERS
   ===================================================================== */
function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = (w: number, h: number) =>
      setSize((s) => (Math.abs(s.w - w) < 1 && Math.abs(s.h - h) < 1 ? s : { w, h }));
    const r = el.getBoundingClientRect();
    update(r.width, r.height);
    const ro = new ResizeObserver(([e]) => update(e.contentRect.width, e.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    d += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6}, ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function niceScale(maxVal: number, count = 6) {
  const raw = Math.max(maxVal, 1) / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? mag * 10;
  const max = Math.ceil(maxVal / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= max + 0.001; v += step) ticks.push(v);
  return { max, ticks };
}

const fmtAxis = (v: number) =>
  v >= 1e5 ? `${+(v / 1e5).toFixed(1)}L` : v >= 1000 ? `${+(v / 1000).toFixed(1)}K` : `${v}`;
const fmtINR = (v: number) => `₹${v.toLocaleString('en-IN')}`;

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
};

/* =====================================================================
   SMALL BUILDING BLOCKS
   ===================================================================== */
const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div
    className={`cl-card bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(16,24,40,0.05)] hover:shadow-[0_8px_24px_-8px_rgba(128,13,50,0.18)] hover:-translate-y-0.5 transition-[box-shadow,transform] duration-300 ${className}`}
  >
    {children}
  </div>
);

const CountUp = memo(
  ({ value, prefix = '', suffix = '', delay = 0.25 }: { value: number; prefix?: string; suffix?: string; delay?: number }) => {
    const ref = useRef<HTMLSpanElement>(null);
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const o = { v: 0 };
      const tw = gsap.to(o, {
        v: value,
        duration: 1.3,
        delay,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = `${prefix}${Math.round(o.v).toLocaleString('en-IN')}${suffix}`;
        },
      });
      return () => {
        tw.kill();
        el.textContent = `${prefix}${value.toLocaleString('en-IN')}${suffix}`;
      };
    }, [value, prefix, suffix, delay]);
    return <span ref={ref}>{`${prefix}0${suffix}`}</span>;
  }
);

const Sparkline = memo(({ data, color }: { data: number[]; color: string }) => {
  const id = useId().replace(/:/g, '');
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * 100, y: 28 - ((v - min) / (max - min || 1)) * 24 }));
  const line = smoothPath(pts);
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="w-16 xl:w-20 h-7 shrink-0 overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L 100 32 L 0 32 Z`} fill={`url(#${id})`} className="cl-fade" />
      <path d={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" pathLength={1} className="cl-draw" />
    </svg>
  );
});

/** Donut that sizes itself to the available space. */
const Donut = memo(
  ({ segs, thickness = 15, children, innerFill }: { segs: Seg[]; thickness?: number; children?: React.ReactNode; innerFill?: string }) => {
    const [ref, { w, h }] = useSize<HTMLDivElement>();
    const size = Math.max(84, Math.min(h - 4, w, 168));
    const total = segs.reduce((a, s) => a + s.value, 0) || 1;
    const r = 50 - thickness / 2 - 1;
    let acc = 0;
    return (
      <div ref={ref} className="h-full w-full min-h-[110px] flex items-center justify-center">
        {w > 0 && (
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {innerFill && <circle cx="50" cy="50" r={r - thickness / 2} fill={innerFill} />}
              <circle cx="50" cy="50" r={r} fill="none" stroke="#F4EEF1" strokeWidth={thickness} />
              {segs.map((s, i) => {
                const pct = (s.value / total) * 100;
                const start = acc;
                acc += pct;
                if (pct <= 0) return null;
                const len = Math.max(pct - 0.8, 0.2);
                return (
                  <circle
                    key={s.label}
                    cx="50"
                    cy="50"
                    r={r}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={thickness}
                    pathLength={100}
                    strokeDasharray={`${len} ${100 - len}`}
                    strokeDashoffset={-start}
                    className="cl-donut-seg"
                    style={{ animationDelay: `${0.2 + i * 0.12}s` }}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">{children}</div>
          </div>
        )}
      </div>
    );
  }
);

const Legend = ({ segs, suffix = '' }: { segs: Seg[]; suffix?: string }) => (
  <div className="space-y-2 xl:space-y-2.5 text-[11px] xl:text-xs font-semibold shrink-0 min-w-[96px]">
    {segs.map((s) => (
      <div key={s.label} className="flex items-center justify-between gap-4">
        <span className={`flex items-center gap-2 ${s.muted ? 'text-gray-400' : 'text-gray-700'}`}>
          <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
          {s.label}
        </span>
        <span className={`font-bold ${s.muted ? 'text-gray-400' : 'text-[#191923]'}`}>
          {s.value}
          {suffix}
        </span>
      </div>
    ))}
  </div>
);

/* ---------- Boiling pot (infinite cooking animation) ---------- */
const BoilingPot = memo(({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden>
    {/* steam wisps */}
    <path className="cl-wisp" style={{ animationDelay: '0s' }} d="M17 14c-2-3 2-4 0-7" stroke="#E9A9BD" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path className="cl-wisp" style={{ animationDelay: '.7s' }} d="M24 13c-2-3 2-4 0-8" stroke="#E9A9BD" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path className="cl-wisp" style={{ animationDelay: '1.4s' }} d="M31 14c-2-3 2-4 0-7" stroke="#E9A9BD" strokeWidth="2" fill="none" strokeLinecap="round" />
    <g className="cl-pot">
      {/* bubbles */}
      <circle className="cl-bubble" style={{ animationDelay: '0s' }} cx="18" cy="20" r="2" fill="#F6BCCD" />
      <circle className="cl-bubble" style={{ animationDelay: '.5s' }} cx="25" cy="19.5" r="2.4" fill="#F6BCCD" />
      <circle className="cl-bubble" style={{ animationDelay: '1s' }} cx="31" cy="20" r="1.8" fill="#F6BCCD" />
      {/* pot */}
      <rect x="7" y="20" width="34" height="4" rx="2" fill="#5E0924" />
      <path d="M10 24h28v9a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6v-9z" fill={BRAND} />
      <rect x="3" y="25" width="6" height="3" rx="1.5" fill="#5E0924" />
      <rect x="39" y="25" width="6" height="3" rx="1.5" fill="#5E0924" />
      <rect x="13" y="27" width="10" height="2" rx="1" fill="#fff" opacity=".25" />
    </g>
    {/* flame */}
    <path className="cl-flame" d="M18 47c-3-2-3-5 0-8 0 2 2 2 2 0 2 2 3 6-2 8z" fill="#FB923C" />
    <path className="cl-flame d2" d="M24 47c-4-2-4-6 0-9 0 3 3 3 2 0 3 3 3 7-2 9z" fill="#F97316" />
    <path className="cl-flame" d="M30 47c-3-2-3-5 0-8 0 2 2 2 2 0 2 2 3 6-2 8z" fill="#FB923C" />
  </svg>
));

const OfferTicker = memo(() => {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setI((p) => (p + 1) % OFFERS.length), 3200);
    return () => window.clearInterval(id);
  }, [paused]);
  const o = OFFERS[i];
  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="banner-fade-item pointer-events-auto inline-flex items-center gap-2 self-start max-w-full rounded-full bg-white/90 backdrop-blur-sm border border-rose-100 shadow-sm pl-1 pr-3 py-1"
    >
      <span className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
        <BoilingPot className="w-7 h-7" />
      </span>
      <span className="shrink-0 rounded-full bg-[#800D32] text-white text-[9px] font-extrabold tracking-wider px-2 py-0.5 uppercase">
        Today's Offer
      </span>
      <div className="relative h-4 overflow-hidden min-w-0 w-[170px] sm:w-[220px]">
        <span key={i} className="cl-offer-in block text-[11px] xl:text-xs font-bold text-[#191923] truncate leading-4">
          {o.icon} {o.text}
        </span>
      </div>
      <div className="hidden sm:flex gap-1 shrink-0">
        {OFFERS.map((_, k) => (
          <button
            key={k}
            onClick={() => setI(k)}
            aria-label={`Offer ${k + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${k === i ? 'w-3.5 bg-[#800D32]' : 'w-1.5 bg-rose-200'}`}
          />
        ))}
      </div>
    </div>
  );
});

/* =====================================================================
   SECTIONS
   ===================================================================== */
const HeroBanner = memo(({ userName }: { userName: string }) => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!bannerRef.current || !layerRef.current) return;
    const r = bannerRef.current.getBoundingClientRect();
    const xr = (e.clientX - r.left) / r.width - 0.5;
    const yr = (e.clientY - r.top) / r.height - 0.5;
    // Keep x <= 0 so parallax never pushes the right edge of the image past the card boundary
    gsap.to(layerRef.current, { x: Math.min(0, xr * -12), y: yr * -6, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
  };
  const onLeave = () =>
    layerRef.current && gsap.to(layerRef.current, { x: 0, y: 0, duration: 0.8, ease: 'power3.out', overwrite: 'auto' });

  const stats = [
    { icon: UtensilsCrossed, value: 128, label: 'Orders Today' },
    { icon: IndianRupee, value: 24850, prefix: '₹', label: 'Sales Today' },
    { icon: Armchair, value: 18, suffix: ' / 24', label: 'Tables Occupied' },
  ];

  return (
    <Card className="col-span-12 lg:col-span-7 relative overflow-hidden !bg-[#FFF5F8] min-h-[240px] lg:min-h-0 !hover:translate-y-0">
      <div ref={bannerRef} onMouseMove={onMove} onMouseLeave={onLeave} className="absolute inset-0">
        {/* Parallax layer: art + steam move together */}
        <div ref={layerRef} className="cl-parallax absolute inset-0 will-change-transform">
          <img
            src={bannerBg}
            alt="CyberLim Banner"
            loading="eager"
            decoding="async"
            draggable={false}
            className="absolute right-0 top-0 bottom-0 h-full w-auto max-w-none object-contain object-right select-none pointer-events-none"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 15%, black 30%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 15%, black 30%, black 100%)',
            }}
          />
          <div className="cl-steam hidden sm:block" style={CLOCHE_STEAM}>
            <span />
            <span />
            <span />
            <span />
          </div>
          {[
            { r: '30%', t: '18%', d: '0s', s: 8 },
            { r: '22%', t: '70%', d: '.9s', s: 6 },
            { r: '4%', t: '22%', d: '1.6s', s: 7 },
            { r: '38%', t: '55%', d: '2.1s', s: 5 },
          ].map((p, i) => (
            <span key={i} className="cl-spark hidden md:block" style={{ right: p.r, top: p.t, animationDelay: p.d }}>
              <svg width={p.s * 2} height={p.s * 2} viewBox="0 0 20 20">
                <path d="M10 0l2.2 7.8L20 10l-7.8 2.2L10 20l-2.2-7.8L0 10l7.8-2.2z" fill="#fff" />
              </svg>
            </span>
          ))}
        </div>
        {/* Smooth linear gradient fade from the left */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFF5F8] via-[#FFF5F8]/70 via-35% to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-between gap-3 p-5 xl:p-6 2xl:p-7 max-w-[560px] md:max-w-[62%] pointer-events-none">
        <div className="space-y-1">
          <h2 className="banner-fade-item text-xl xl:text-2xl 2xl:text-[30px] font-black text-[#191923] tracking-tight flex items-center gap-2 leading-tight">
            {greeting()}, {userName} <span className="cl-wave">👋</span>
          </h2>
          <p className="banner-fade-item text-lg xl:text-xl 2xl:text-[26px] font-black text-[#800D32] tracking-tight leading-tight">
            Welcome to CyberLim POS
          </p>
          <p className="banner-fade-item text-xs xl:text-sm text-gray-600 font-medium leading-snug [@media(max-height:760px)]:hidden">
            Manage orders, tables, kitchen and more — all in one place.
          </p>
        </div>

        <OfferTicker />

        <div className="banner-fade-item flex flex-wrap gap-2 xl:gap-3 pointer-events-auto">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2.5 bg-white/95 backdrop-blur-sm rounded-xl border border-white shadow-sm px-3 py-2 xl:px-3.5 xl:py-2.5"
            >
              <s.icon className="w-5 h-5 text-[#800D32] shrink-0" />
              <div>
                <span className="text-sm xl:text-base 2xl:text-lg font-black text-[#191923] leading-none block">
                  <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} delay={0.4} />
                </span>
                <span className="text-[10px] xl:text-[11px] text-gray-500 font-semibold block mt-0.5 whitespace-nowrap">
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
});

const QuickActionsCard = memo(() => {
  const navigate = useNavigate();
  return (
    <Card className="col-span-12 lg:col-span-5 p-4 xl:p-5 flex flex-col gap-3 min-h-0">
      <div className="flex items-center justify-between">
        <h3 className="text-sm xl:text-base font-bold text-[#191923]">Quick Actions</h3>
        <button
          onClick={() => navigate('/tools')}
          className="text-xs font-semibold text-[#800D32] hover:opacity-80 flex items-center gap-1.5 transition-opacity"
        >
          <Settings className="w-3.5 h-3.5" />
          Customize
        </button>
      </div>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 xl:gap-2.5 flex-1 min-h-0">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.to)}
            className={`group relative rounded-xl border min-h-[70px] lg:min-h-0 flex flex-col items-center justify-center text-center gap-0.5 transition-all duration-200 active:scale-95 overflow-hidden ${a.primary
                ? 'bg-[#FDEBF1] border-[#F8C6D6] hover:bg-[#FADDE7]'
                : 'bg-white border-gray-100 hover:border-[#F8C6D6] hover:bg-[#FFF7FA] shadow-[0_1px_2px_rgba(16,24,40,0.04)]'
              }`}
          >
            <a.icon className="w-5 h-5 xl:w-6 xl:h-6 text-[#800D32] mb-0.5 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
            <span className="text-[11px] xl:text-[13px] font-bold text-[#191923] leading-tight">{a.label}</span>
            <span className="text-[9px] xl:text-[10px] text-gray-400 font-semibold">{a.key}</span>
          </button>
        ))}
      </div>
    </Card>
  );
});

const StatCard = memo(({ s }: { s: (typeof STATS)[number] }) => {
  const Icon = s.icon;
  return (
    <Card className={`relative overflow-hidden p-3 xl:p-3.5 flex flex-col justify-between gap-1.5 min-h-[96px] lg:min-h-0 bg-gradient-to-br ${s.tint} to-white to-70%`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 xl:w-10 xl:h-10 rounded-full flex items-center justify-center shrink-0 ${s.iconCls}`}>
          <Icon className="w-[18px] h-[18px] xl:w-5 xl:h-5" />
        </div>
        <div className="min-w-0">
          <h4 className="text-base xl:text-lg 2xl:text-xl font-black text-[#191923] leading-tight truncate">
            <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />
          </h4>
          <p className="text-[10px] xl:text-[11px] text-gray-500 font-medium truncate">{s.label}</p>
        </div>
      </div>
      <div className="flex items-end justify-between gap-1">
        {s.status ? (
          <span className="text-[10px] xl:text-[11px] font-bold text-rose-600 whitespace-nowrap">{s.status}</span>
        ) : (
          <span className={`text-[10px] xl:text-[11px] font-bold flex items-center gap-0.5 whitespace-nowrap ${s.up ? 'text-emerald-600' : 'text-rose-600'}`}>
            {s.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {s.delta}
            {s.sub && <span className="hidden 2xl:inline text-[9px] text-gray-400 font-semibold ml-0.5">{s.sub}</span>}
          </span>
        )}
        <Sparkline data={s.spark} color={s.color} />
      </div>
    </Card>
  );
});

const SalesTrendChart = memo(({ series, seriesKey }: { series: TrendSeries; seriesKey: string }) => {
  const [ref, { w, h }] = useSize<HTMLDivElement>();
  const gid = useId().replace(/:/g, '');
  const peak = useMemo(() => series.values.indexOf(Math.max(...series.values)), [series]);
  const [active, setActive] = useState<number | null>(null);
  useEffect(() => setActive(null), [seriesKey]);
  const { max, ticks } = useMemo(() => niceScale(Math.max(...series.values)), [series]);

  const pad = { l: 30, r: 10, t: 34, b: 20 };
  const iw = Math.max(w - pad.l - pad.r, 1);
  const ih = Math.max(h - pad.t - pad.b, 1);
  const n = series.values.length;
  const pts = series.values.map((v, i) => ({ x: pad.l + (n === 1 ? iw / 2 : (i * iw) / (n - 1)), y: pad.t + ih - (v / max) * ih }));
  const line = smoothPath(pts);
  const area = pts.length ? `${line} L ${pts[n - 1].x} ${pad.t + ih} L ${pts[0].x} ${pad.t + ih} Z` : '';
  const idx = active ?? peak;
  const p = pts[idx];
  const showEvery = iw / n < 30 ? 2 : 1;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - r.left - pad.l) / iw) * (n - 1));
    setActive(Math.max(0, Math.min(n - 1, i)));
  };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={() => setActive(null)} className="relative flex-1 min-h-[170px] lg:min-h-0">
      {w > 0 && p && (
        <>
          <svg width={w} height={h} className="absolute inset-0 overflow-visible">
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BRAND} stopOpacity="0.28" />
                <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
              </linearGradient>
            </defs>
            {ticks.map((t) => {
              const y = pad.t + ih - (t / max) * ih;
              return (
                <g key={t}>
                  <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="#F1EDF0" strokeDasharray={t === 0 ? undefined : '3 4'} />
                  <text x={pad.l - 7} y={y + 3} textAnchor="end" fontSize="9" fontWeight="600" fill="#9CA3AF">
                    {fmtAxis(t)}
                  </text>
                </g>
              );
            })}
            <line x1={p.x} x2={p.x} y1={p.y} y2={pad.t + ih} stroke={BRAND} strokeOpacity="0.25" strokeDasharray="3 3" />
            <g key={seriesKey}>
              <path d={area} fill={`url(#${gid})`} className="cl-fade" />
              <path d={line} fill="none" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round" pathLength={1} className="cl-draw" />
              {pts.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r={i === idx ? 5 : 3.5}
                  fill={i === idx ? BRAND : '#fff'}
                  stroke={BRAND}
                  strokeWidth="2"
                  className="cl-pop"
                  style={{ animationDelay: `${0.45 + i * 0.06}s`, transition: 'r .2s' }}
                />
              ))}
            </g>
            <circle cx={p.x} cy={p.y} r="5" fill={BRAND} opacity="0.35" className="cl-ping" />
            {series.labels.map((l, i) =>
              i % showEvery === 0 || i === n - 1 ? (
                <text key={l} x={pts[i].x} y={h - 4} textAnchor="middle" fontSize="9" fontWeight="600" fill="#9CA3AF">
                  {l}
                </text>
              ) : null
            )}
          </svg>
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full transition-[left,top] duration-200 ease-out"
            style={{ left: Math.min(Math.max(p.x, 46), w - 46), top: p.y - 10 }}
          >
            <div className="rounded-lg bg-white border border-gray-200 shadow-md px-2 py-1 text-center whitespace-nowrap">
              <div className="flex items-center gap-1 text-[10px] xl:text-[11px] font-extrabold text-[#191923]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#800D32]" />
                {fmtINR(series.values[idx])}
              </div>
              <div className="text-[8px] xl:text-[9px] text-gray-400 font-semibold">
                {series.tipPrefix} {series.labels[idx]}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

const SalesTrendCard = memo(() => {
  const [tf, setTf] = useState<Timeframe>('Today');
  return (
    <Card className="p-3.5 xl:p-4 flex flex-col gap-1 min-h-[250px] lg:min-h-0">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm xl:text-base font-bold text-[#191923]">Sales Trend</h4>
        <div className="flex items-center gap-1 text-[9px] xl:text-[10px] font-bold">
          {(Object.keys(TREND) as Timeframe[]).map((t) => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={`px-2 xl:px-2.5 py-1 rounded-full border transition-all duration-200 ${tf === t ? 'bg-[#800D32] border-[#800D32] text-white shadow-sm' : 'border-gray-200 text-gray-600 hover:border-[#800D32]/40'
                }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <SalesTrendChart series={TREND[tf]} seriesKey={tf} />
    </Card>
  );
});

const DonutCard = memo(
  ({ title, segs, center, legendSuffix, innerFill }: { title: string; segs: Seg[]; center: React.ReactNode; legendSuffix?: string; innerFill?: string }) => (
    <Card className="p-3.5 xl:p-4 flex flex-col gap-2 min-h-[220px] lg:min-h-0">
      <h4 className="text-sm xl:text-base font-bold text-[#191923]">{title}</h4>
      <div className="flex-1 min-h-0 flex items-center gap-3 xl:gap-4">
        <div className="flex-1 min-w-0 h-full">
          <Donut segs={segs} innerFill={innerFill}>
            {center}
          </Donut>
        </div>
        <Legend segs={segs} suffix={legendSuffix} />
      </div>
    </Card>
  )
);

const TopSellingCard = memo(() => {
  const max = TOP_ITEMS[0].orders;
  return (
    <Card className="p-3.5 xl:p-4 flex flex-col gap-2 min-h-[240px] lg:min-h-0">
      <div className="flex items-center justify-between">
        <h4 className="text-sm xl:text-base font-bold text-[#191923]">Top Selling Items</h4>
        <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-0.5 border border-gray-200 rounded-lg px-2 py-0.5">
          Today <ChevronDown className="w-3.5 h-3.5" />
        </span>
      </div>
      <div className="flex-1 min-h-0 flex flex-col justify-between gap-1">
        {TOP_ITEMS.map((it, i) => (
          <div key={it.name} className="flex items-center gap-2.5 group">
            <span className="w-7 h-7 xl:w-8 xl:h-8 rounded-lg bg-amber-50 flex items-center justify-center text-base shrink-0 transition-transform group-hover:scale-110">
              {it.emoji}
            </span>
            <span className="text-[11px] xl:text-xs font-bold text-[#191923] truncate w-[88px] xl:w-[104px] shrink-0">{it.name}</span>
            <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="cl-bar-x h-full rounded-full bg-[#800D32]"
                style={{ width: `${(it.orders / max) * 100}%`, animationDelay: `${0.3 + i * 0.08}s` }}
              />
            </div>
            <span className="text-[10px] text-gray-500 font-semibold whitespace-nowrap w-[52px] text-right">{it.orders} orders</span>
          </div>
        ))}
      </div>
    </Card>
  );
});

const HourlySalesCard = memo(() => {
  const { max, ticks } = useMemo(() => niceScale(Math.max(...HOURLY.map((h) => h.v))), []);
  const peak = HOURLY.reduce((m, h, i, a) => (h.v > a[m].v ? i : m), 0);
  return (
    <Card className="p-3.5 xl:p-4 flex flex-col gap-1 min-h-[230px] lg:min-h-0">
      <h4 className="text-sm xl:text-base font-bold text-[#191923]">Hourly Sales</h4>
      <div className="flex-1 min-h-[160px] lg:min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 flex pt-6">
          <div className="relative w-7 shrink-0">
            {ticks.map((t) => (
              <span key={t} className="absolute right-1.5 translate-y-1/2 text-[9px] font-semibold text-gray-400" style={{ bottom: `${(t / max) * 100}%` }}>
                {fmtAxis(t)}
              </span>
            ))}
          </div>
          <div className="relative flex-1">
            {ticks.map((t) => (
              <div key={t} className={`absolute inset-x-0 border-t ${t === 0 ? 'border-gray-200' : 'border-dashed border-gray-100'}`} style={{ bottom: `${(t / max) * 100}%` }} />
            ))}
            <div className="absolute inset-0 flex items-end justify-between gap-[5%] px-1">
              {HOURLY.map((b, i) => {
                const pct = (b.v / max) * 100;
                const isPeak = i === peak;
                return (
                  <div key={b.t} className="relative flex-1 h-full flex items-end justify-center group">
                    <div
                      className={`cl-bar w-full max-w-[26px] rounded-t-md transition-colors ${isPeak ? 'bg-[#800D32]' : 'bg-[#F8C3D3] group-hover:bg-[#EE9AB4]'}`}
                      style={{ height: `${pct}%`, animationDelay: `${0.2 + i * 0.05}s` }}
                    />
                    <span
                      className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#800D32] text-white text-[9px] font-bold px-1.5 py-0.5 shadow-sm transition-opacity duration-200 ${isPeak ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      style={{ bottom: `calc(${pct}% + 5px)` }}
                    >
                      {fmtINR(b.v)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex pl-7 pt-1.5">
          <div className="flex-1 flex justify-between gap-[5%] px-1">
            {HOURLY.map((b) => (
              <span key={b.t} className="flex-1 text-center text-[8px] xl:text-[9px] font-semibold text-gray-400 whitespace-nowrap">
                {b.t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
});

const CategoryCard = memo(() => {
  const max = Math.max(...CATEGORIES.map((c) => c.v));
  return (
    <Card className="p-3.5 xl:p-4 flex flex-col gap-1 min-h-[230px] lg:min-h-0">
      <div className="flex items-center justify-between">
        <h4 className="text-sm xl:text-base font-bold text-[#191923]">Category Performance</h4>
        <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-0.5 border border-gray-200 rounded-lg px-2 py-0.5">
          Revenue <ChevronDown className="w-3.5 h-3.5" />
        </span>
      </div>
      <div className="flex-1 min-h-[150px] lg:min-h-0 flex items-stretch justify-between gap-2 pt-2">
        {CATEGORIES.map((c, i) => (
          <div key={c.name} className="flex-1 flex flex-col items-center min-w-0 group">
            <div className="flex-1 w-full min-h-0 flex items-end justify-center">
              <div
                className={`cl-bar w-full max-w-[44px] rounded-t-lg transition-colors ${i === 0 ? 'bg-[#800D32]' : 'bg-[#F8C3D3] group-hover:bg-[#EE9AB4]'}`}
                style={{ height: `${(c.v / max) * 92}%`, animationDelay: `${0.25 + i * 0.08}s` }}
              />
            </div>
            <span className="text-sm mt-1.5 leading-none transition-transform group-hover:scale-125">{c.icon}</span>
            <span className="text-[9px] xl:text-[10px] font-semibold text-gray-600 truncate max-w-full leading-tight mt-0.5">{c.name}</span>
            <span className="text-[10px] xl:text-[11px] font-extrabold text-[#191923] leading-none mt-0.5">{fmtINR(c.v)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
});

const HighlightsCard = memo(() => (
  <Card className="p-3.5 xl:p-4 flex flex-col gap-2 min-h-[200px] lg:min-h-0">
    <div className="flex items-center gap-2">
      <Lightbulb className="w-4 h-4 text-[#800D32]" />
      <h4 className="text-sm xl:text-base font-bold text-[#191923]">Today's Highlights</h4>
    </div>
    <div className="flex-1 min-h-0 flex flex-col justify-evenly gap-2">
      {HIGHLIGHTS.map((t, i) => (
        <div key={t} className="cl-hl flex items-center gap-2.5 text-[11px] xl:text-[13px] font-semibold text-gray-700" style={{ animationDelay: `${i * 0.1}s` }}>
          <CheckCircle2 className="w-[18px] h-[18px] text-white fill-emerald-500 shrink-0" />
          <span>{t}</span>
        </div>
      ))}
    </div>
  </Card>
));

/* =====================================================================
   PAGE
   ===================================================================== */
export const DashboardPage: React.FC<{ userName?: string }> = ({ userName = 'Rohit' }) => {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);

  // F2–F9 keyboard shortcuts
  useEffect(() => {
    const map = Object.fromEntries(QUICK_ACTIONS.map((a) => [a.key, a.to]));
    const onKey = (e: KeyboardEvent) => {
      const to = map[e.key];
      if (to && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        navigate(to);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  // Entrance choreography
  useLayoutEffect(() => {
    if (!rootRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.set('.cl-parallax', { scale: 1.05 });
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.cl-card', { autoAlpha: 0, y: 14, duration: 0.5, stagger: 0.035, clearProps: 'transform,opacity,visibility' })
        .from('.cl-parallax', { autoAlpha: 0, scale: 1.14, duration: 1.1, ease: 'power2.out' }, 0)
        .from('.banner-fade-item', { autoAlpha: 0, y: 12, duration: 0.5, stagger: 0.08, clearProps: 'transform,opacity,visibility' }, 0.15)
        .from('.cl-hl', { autoAlpha: 0, x: -10, duration: 0.4, stagger: 0.08, clearProps: 'transform,opacity,visibility' }, 0.5);
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="cl-root h-full min-h-0 w-full flex flex-col gap-3 select-none overflow-y-auto lg:overflow-hidden pb-1"
      style={{ color: INK }}
    >
      <style>{CSS}</style>

      {/* ROW 1 — Hero + Quick actions */}
      <div className="grid grid-cols-12 gap-3 lg:flex-[1.32] lg:min-h-0 lg:grid-rows-[minmax(0,1fr)]">
        <HeroBanner userName={userName} />
        <QuickActionsCard />
      </div>

      {/* ROW 2 — 6 snapshot cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:flex-[0.56] lg:min-h-0 lg:grid-rows-[minmax(0,1fr)]">
        {STATS.map((s) => (
          <StatCard key={s.label} s={s} />
        ))}
      </div>

      {/* ROW 3 — Trend, Order types, Top items, Table status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1.25fr_1fr] gap-3 lg:flex-[1.18] lg:min-h-0 lg:grid-rows-[minmax(0,1fr)]">
        <SalesTrendCard />
        <DonutCard
          title="Order Types"
          segs={ORDER_TYPES}
          legendSuffix="%"
          innerFill="#FFF5F8"
          center={
            <div className="text-center">
              <span className="text-xl xl:text-2xl font-black text-[#191923] leading-none block">
                <CountUp value={128} />
              </span>
              <span className="text-[10px] text-gray-500 font-semibold">Orders</span>
            </div>
          }
        />
        <TopSellingCard />
        <DonutCard
          title="Table Status"
          segs={TABLE_STATUS}
          center={
            <div className="text-center">
              <span className="text-xl xl:text-2xl font-black text-[#191923] leading-none block">
                <CountUp value={24} />
              </span>
              <span className="text-[10px] text-gray-500 font-semibold">Tables</span>
            </div>
          }
        />
      </div>

      {/* ROW 4 — Hourly, Payments, Categories, Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.25fr_1.05fr] gap-3 lg:flex-[1.05] lg:min-h-0 lg:grid-rows-[minmax(0,1fr)]">
        <HourlySalesCard />
        <DonutCard
          title="Payment Methods"
          segs={PAYMENTS}
          legendSuffix="%"
          center={
            <div className="w-11 h-11 xl:w-12 xl:h-12 rounded-full bg-rose-50 text-[#800D32] flex items-center justify-center">
              <Wallet className="w-5 h-5 xl:w-6 xl:h-6" />
            </div>
          }
        />
        <CategoryCard />
        <HighlightsCard />
      </div>
    </div>
  );
};

export default DashboardPage;