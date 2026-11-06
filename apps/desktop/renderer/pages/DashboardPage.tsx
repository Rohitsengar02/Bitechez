import React, { useState } from 'react';
import {
  TrendingUp,
  ChevronDown,
  Plus,
  Star,
  Layers,
  Sparkles,
} from 'lucide-react';

// 3D Cartoon Assets
import pizzaOvenImg from '../assets/3d/pizza_oven.png';
import pickupBagImg from '../assets/3d/pickup_bag.png';
import clocheGoldImg from '../assets/3d/cloche_gold.png';
import restaurantStoreImg from '../assets/3d/restaurant_store.png';
import pepperoniPizzaImg from '../assets/3d/pepperoni_pizza.png';
import berryCheesecakeImg from '../assets/3d/berry_cheesecake.png';
import sushiPlatterImg from '../assets/3d/sushi_platter.png';
import chickenRiceBowlImg from '../assets/3d/chicken_rice_bowl.png';
import classicBurgerImg from '../assets/3d/classic_burger.png';
import chefMascotImg from '../assets/3d/chef_mascot.png';
import recentPizzaImg from '../assets/3d/recent_pizza.png';
import recentBurgerImg from '../assets/3d/recent_burger.png';
import recentBowlImg from '../assets/3d/recent_bowl.png';
import recentDrinkImg from '../assets/3d/recent_drink.png';

export const DashboardPage: React.FC = () => {
  const [selectedTime, setSelectedTime] = useState('This Week');

  return (
    <div className="w-full max-w-[1720px] mx-auto flex flex-col gap-4 sm:gap-4.5 pb-24 sm:pb-32 select-none font-sans text-slate-800 animate-fadeIn">
      <style>{`
        @keyframes growUp {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        .anim-bar {
          transform-origin: bottom;
          animation: growUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .anim-float {
          animation: floatSlow 4s ease-in-out infinite;
        }
      `}</style>

      {/* ================= ROW 1: TOP 3D METRIC CARDS + STORE FRONT ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 items-stretch">
        {/* Card 1: Preparing */}
        <div className="bg-white rounded-2xl p-4 sm:p-4.5 flex items-center justify-between border border-emerald-50/80 shadow-[0_4px_20px_rgba(16,185,129,0.05)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex flex-col justify-between h-full">
            <div>
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight block leading-none">08</span>
              <span className="text-xs font-bold text-slate-400 mt-1 block">Preparing</span>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-black text-[#00B859] mt-3 bg-emerald-50 px-2.5 py-0.5 rounded-full w-max shadow-sm">
              <span className="text-xs">↑</span> 12%
            </div>
          </div>
          <div className="w-20 h-20 sm:w-22 sm:h-22 flex items-center justify-center shrink-0">
            <img src={pizzaOvenImg} alt="Preparing Oven" className="w-full h-full object-contain filter drop-shadow-md anim-float" />
          </div>
        </div>

        {/* Card 2: Out for Pick-up */}
        <div className="bg-white rounded-2xl p-4 sm:p-4.5 flex items-center justify-between border border-emerald-50/80 shadow-[0_4px_20px_rgba(16,185,129,0.05)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex flex-col justify-between h-full">
            <div>
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight block leading-none">12</span>
              <span className="text-xs font-bold text-slate-400 mt-1 block">Out for Pick-up</span>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-black text-[#00B859] mt-3 bg-emerald-50 px-2.5 py-0.5 rounded-full w-max shadow-sm">
              <span className="text-xs">↑</span> 8%
            </div>
          </div>
          <div className="w-20 h-20 sm:w-22 sm:h-22 flex items-center justify-center shrink-0">
            <img src={pickupBagImg} alt="Pick up bag" className="w-full h-full object-contain filter drop-shadow-md anim-float" style={{ animationDelay: '0.8s' }} />
          </div>
        </div>

        {/* Card 3: Served */}
        <div className="bg-white rounded-2xl p-4 sm:p-4.5 flex items-center justify-between border border-emerald-50/80 shadow-[0_4px_20px_rgba(16,185,129,0.05)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex flex-col justify-between h-full">
            <div>
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight block leading-none">28</span>
              <span className="text-xs font-bold text-slate-400 mt-1 block">Served</span>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-black text-[#00B859] mt-3 bg-emerald-50 px-2.5 py-0.5 rounded-full w-max shadow-sm">
              <span className="text-xs">↑</span> 18%
            </div>
          </div>
          <div className="w-20 h-20 sm:w-22 sm:h-22 flex items-center justify-center shrink-0">
            <img src={clocheGoldImg} alt="Served Cloche" className="w-full h-full object-contain filter drop-shadow-md anim-float" style={{ animationDelay: '1.6s' }} />
          </div>
        </div>

        {/* Card 4: Resto Daddy Storefront Illustration */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 flex items-center justify-center border border-emerald-50/80 shadow-[0_4px_20px_rgba(16,185,129,0.05)] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <img src={restaurantStoreImg} alt="Resto Daddy Store" className="w-full h-24 sm:h-28 object-contain filter drop-shadow-md hover:scale-105 transition-transform duration-500" />
        </div>
      </div>

      {/* ================= ROW 2: SALES OVERVIEW + ORDER ANALYTICS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-4.5">
        {/* Sales Overview Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4.5 sm:p-5 border border-emerald-50/80 shadow-[0_4px_20px_rgba(16,185,129,0.05)] flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-[#00C060] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-sm font-black text-slate-800">Sales Overview</h3>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">₹24,850</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-[#00B859] bg-emerald-50 px-2 py-0.5 rounded-full shadow-sm">
                  ↗ +12.4%
                </span>
              </div>
            </div>

            {/* Comparison Legend */}
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00C060] shadow-sm" /> Today
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-sky-400" /> Yesterday
              </span>
            </div>
          </div>

          {/* SVG Smooth Curve Area Chart with Comparison */}
          <div className="relative w-full h-44 sm:h-48 mt-4">
            <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
              <defs>
                {/* Today's Emerald Gradient */}
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00C060" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#00C060" stopOpacity="0.0" />
                </linearGradient>
                {/* Yesterday's Soft Sky Gradient */}
                <linearGradient id="yesterdayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="140" x2="500" y2="140" stroke="#F1F5F3" strokeWidth="1.2" />
              <line x1="0" y1="105" x2="500" y2="105" stroke="#F1F5F3" strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#F1F5F3" strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1="0" y1="35" x2="500" y2="35" stroke="#F1F5F3" strokeWidth="1.2" strokeDasharray="3 3" />

              {/* --- YESTERDAY COMPARISON CURVE (Dashed Sky Blue) --- */}
              <path
                d="M 10 142 Q 50 135 90 120 T 170 102 T 250 110 T 330 98 T 410 52 T 490 80 L 490 140 L 10 140 Z"
                fill="url(#yesterdayGrad)"
              />
              <path
                d="M 10 142 Q 50 135 90 120 T 170 102 T 250 110 T 330 98 T 410 52 T 490 80"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2.2"
                strokeDasharray="4 4"
                strokeLinecap="round"
                opacity="0.85"
              />

              {/* --- TODAY CURVE (Solid Emerald with Glow) --- */}
              <path
                d="M 10 140 Q 50 130 90 108 T 170 88 T 250 94 T 330 82 T 410 28 T 490 62 L 490 140 L 10 140 Z"
                fill="url(#salesGrad)"
              />
              <path
                d="M 10 140 Q 50 130 90 108 T 170 88 T 250 94 T 330 82 T 410 28 T 490 62"
                fill="none"
                stroke="#00C060"
                strokeWidth="3.2"
                strokeLinecap="round"
              />

              {/* Dots on Today's Curve */}
              {[
                { cx: 90, cy: 108 },
                { cx: 170, cy: 88 },
                { cx: 250, cy: 94 },
                { cx: 330, cy: 82 },
                { cx: 410, cy: 28 },
                { cx: 490, cy: 62 },
              ].map((p, idx) => (
                <circle key={idx} cx={p.cx} cy={p.cy} r={idx === 4 ? '5.5' : '3.5'} fill="#00C060" stroke="#FFFFFF" strokeWidth="2.5" />
              ))}

              {/* Peak Dashed Drop Line */}
              <line x1="410" y1="28" x2="410" y2="140" stroke="#00C060" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
            </svg>

            {/* Peak Tooltip Pill */}
            <div className="absolute top-0 left-[81%] -translate-x-1/2 bg-white px-2.5 py-0.5 rounded-lg shadow-md border border-emerald-100 text-[11px] font-black text-slate-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C060]" />
              ₹8,420
            </div>

            {/* X Axis Time Labels */}
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 px-1">
              <span>9 AM</span>
              <span>10 AM</span>
              <span>11 AM</span>
              <span>12 PM</span>
              <span>1 PM</span>
              <span>2 PM</span>
              <span>3 PM</span>
              <span>4 PM</span>
              <span>5 PM</span>
              <span>6 PM</span>
              <span className="text-white bg-[#00C060] font-black px-1.5 py-0.5 rounded-full text-[9px] shadow-sm">7 PM</span>
              <span>8 PM</span>
            </div>
          </div>
        </div>

        {/* Order Analytics Bar Chart (5 Cols) with Dual-Tone Bars */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4.5 sm:p-5 border border-emerald-50/80 shadow-[0_4px_20px_rgba(16,185,129,0.05)] flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-50 text-[#00C060] flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
              <h3 className="text-sm font-black text-slate-800">Order Analytics</h3>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Legend for Dual Bars */}
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold">
                <span className="inline-flex items-center gap-1 text-slate-600">
                  <span className="w-2 h-2 rounded bg-[#00C060]" /> This Wk
                </span>
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <span className="w-2 h-2 rounded bg-sky-300" /> Last Wk
                </span>
              </div>
              <button
                onClick={() => setSelectedTime((t) => (t === 'This Week' ? 'This Month' : 'This Week'))}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100 hover:bg-slate-100 transition-colors shadow-sm"
              >
                {selectedTime} <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Animated Dual Comparison Bars */}
          <div className="flex items-end justify-between gap-2 pt-4 h-44 sm:h-48 px-1">
            {[
              { day: 'Mon', current: 64, prev: 48, currentH: 54, prevH: 40, delay: '0.1s' },
              { day: 'Tue', current: 72, prev: 58, currentH: 62, prevH: 48, delay: '0.2s' },
              { day: 'Wed', current: 58, prev: 62, currentH: 48, prevH: 52, delay: '0.3s' },
              { day: 'Thu', current: 91, prev: 74, currentH: 78, prevH: 62, delay: '0.4s' },
              { day: 'Fri', current: 120, prev: 92, currentH: 100, prevH: 76, active: true, delay: '0.5s' },
              { day: 'Sat', current: 108, prev: 88, currentH: 90, prevH: 72, delay: '0.6s' },
              { day: 'Sun', current: 86, prev: 70, currentH: 72, prevH: 58, delay: '0.7s' },
            ].map((bar) => (
              <div key={bar.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className={`text-[11px] font-black transition-all ${bar.active ? 'text-[#00C060] scale-110' : 'text-slate-500 group-hover:text-slate-800'}`}>
                  {bar.current}
                </span>

                {/* Side-by-side comparison bars */}
                <div className="w-full flex items-end justify-center gap-1 h-[78%]">
                  {/* Previous Period Bar (Sky/Indigo accent) */}
                  <div
                    className="anim-bar w-full max-w-[11px] rounded-t-md bg-gradient-to-t from-sky-400/80 to-sky-300 transition-all duration-300 group-hover:from-sky-500 group-hover:to-sky-400"
                    style={{ height: `${bar.prevH}%`, animationDelay: `${parseFloat(bar.delay) + 0.05}s` }}
                    title={`Previous: ${bar.prev}`}
                  />
                  {/* Current Period Bar (Emerald/Mint accent) */}
                  <div
                    className={`anim-bar w-full max-w-[13px] rounded-t-md transition-all duration-300 ${
                      bar.active
                        ? 'bg-gradient-to-t from-[#00C060] to-[#34D399] shadow-md shadow-emerald-500/25 ring-2 ring-emerald-300/40'
                        : 'bg-gradient-to-t from-[#00C060]/75 to-[#34D399]/70 group-hover:from-[#00C060] group-hover:to-[#34D399]'
                    }`}
                    style={{ height: `${bar.currentH}%`, animationDelay: bar.delay }}
                    title={`Current: ${bar.current}`}
                  />
                </div>

                <span className={`text-[11px] font-bold mt-0.5 ${bar.active ? 'text-[#00C060] font-black' : 'text-slate-400'}`}>
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= ROW 3: ORDER TYPES + PAYMENT METHODS + TOP CATEGORIES ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-4.5">
        {/* Order Types (Donut) */}
        <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-emerald-50/80 shadow-[0_4px_20px_rgba(16,185,129,0.05)] hover:shadow-md transition-all">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-5 h-5 rounded-full bg-emerald-50 text-[#00C060] flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Order Types</h4>
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Donut graphic */}
            <div className="relative w-26 h-26 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                <path
                  className="text-emerald-50"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#00C060]"
                  strokeDasharray="56, 100"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#86EFAC]"
                  strokeDasharray="28, 100"
                  strokeDashoffset="-56"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-900 leading-none">128</span>
                <span className="text-[9px] font-bold text-slate-400 mt-0.5">Orders</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600 font-semibold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-[#00C060]" /> Dine In
                </span>
                <span className="font-black text-slate-900 text-xs">72 (56%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600 font-semibold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-[#86EFAC]" /> Takeaway
                </span>
                <span className="font-black text-slate-900 text-xs">36 (28%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600 font-semibold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-[#BBF7D0]" /> Delivery
                </span>
                <span className="font-black text-slate-900 text-xs">12 (9%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600 font-semibold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-slate-200" /> Others
                </span>
                <span className="font-black text-slate-900 text-xs">8 (6%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-emerald-50/80 shadow-[0_4px_20px_rgba(16,185,129,0.05)] hover:shadow-md transition-all">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-5 h-5 rounded-full bg-emerald-50 text-[#00C060] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Payment Methods</h4>
          </div>

          <div className="space-y-2">
            {[
              { name: 'UPI', pct: '58%', amount: '₹14,413', icon: '📱' },
              { name: 'Card', pct: '24%', amount: '₹5,964', icon: '💳' },
              { name: 'Cash', pct: '14%', amount: '₹3,479', icon: '💵' },
              { name: 'Others', pct: '4%', amount: '₹994', icon: '•••' },
            ].map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center text-sm">{p.icon}</span>
                  <span className="font-bold text-slate-700 text-[11px]">{p.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-slate-400">{p.pct}</span>
                  <span className="font-black text-slate-900 w-16 text-right text-xs">{p.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-emerald-50/80 shadow-[0_4px_20px_rgba(16,185,129,0.05)] hover:shadow-md transition-all">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-5 h-5 rounded-full bg-emerald-50 text-[#00C060] flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Top Categories</h4>
          </div>

          <div className="space-y-2.5">
            {[
              { name: 'Main Course', pct: '36%', bar: 72 },
              { name: 'Starters', pct: '24%', bar: 54 },
              { name: 'Beverages', pct: '18%', bar: 42 },
              { name: 'Desserts', pct: '12%', bar: 30 },
              { name: 'Others', pct: '10%', bar: 22 },
            ].map((cat) => (
              <div key={cat.name} className="flex items-center gap-2 text-xs">
                <span className="w-22 font-bold text-slate-600 truncate text-[11px]">{cat.name}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#00C060] to-[#34D399]" style={{ width: `${cat.bar}%` }} />
                </div>
                <span className="font-black text-slate-800 w-8 text-right text-[11px]">{cat.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= ROW 4: POPULAR ITEMS (3D CARTOONS WITH PURE WHITE BG) ================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-50/80 shadow-[0_4px_20px_rgba(16,185,129,0.05)] hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-emerald-50 text-[#00C060] flex items-center justify-center">
              <Star className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-sm font-black text-slate-800">Popular Items</h3>
          </div>
          <button className="text-xs font-black text-[#00C060] hover:underline flex items-center gap-1">
            View All →
          </button>
        </div>

        {/* 5 Cards Row - Compact Height */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            { name: 'Pepperoni Pizza', rating: '4.8', orders: '248 orders', price: '₹340.00', img: pepperoniPizzaImg },
            { name: 'Berry Cheesecake', rating: '4.7', orders: '189 orders', price: '₹240.00', img: berryCheesecakeImg },
            { name: 'Sushi Platter', rating: '4.8', orders: '156 orders', price: '₹280.00', img: sushiPlatterImg },
            { name: 'Chicken Rice Bowl', rating: '4.7', orders: '142 orders', price: '₹320.00', img: chickenRiceBowlImg },
            { name: 'Classic Burger', rating: '4.6', orders: '131 orders', price: '₹149.00', img: classicBurgerImg },
          ].map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-xl border border-slate-100 p-3 flex flex-col justify-between hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                  ★ {item.rating}
                </span>
              </div>

              {/* 3D Food Cartoon Sticker */}
              <div className="w-full h-22 sm:h-24 flex items-center justify-center my-1.5">
                <img
                  src={item.img}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-900 truncate">{item.name}</h4>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{item.orders}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                  <span className="text-xs font-black text-slate-900">{item.price}</span>
                  <button className="w-6 h-6 rounded-full border border-emerald-300 text-[#00C060] flex items-center justify-center hover:bg-[#00C060] hover:text-white transition-colors shadow-sm">
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= ROW 5: TABLE STATUS + KITCHEN STATUS + TODAY'S SUMMARY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-4.5 items-stretch">
        {/* Table Status (4 Cols) */}
        <div className="md:col-span-4 bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="text-sm">🪑</span>
              <h4 className="text-xs font-black text-slate-900 tracking-wide uppercase">Table Status</h4>
            </div>
            <button className="text-[11px] font-black text-[#00C060] hover:underline flex items-center gap-1">
              View Floor →
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center my-auto">
            {[
              { colorDot: 'bg-[#00C060]', count: '12', label: 'Available', bg: 'bg-[#F0FDF4]', text: 'text-[#00C060]' },
              { colorDot: 'bg-[#F97316]', count: '14', label: 'Occupied', bg: 'bg-[#FFF7ED]', text: 'text-[#F97316]' },
              { colorDot: 'bg-[#0284C7]', count: '4', label: 'Reserved', bg: 'bg-[#F0F9FF]', text: 'text-[#0284C7]' },
              { colorDot: 'bg-[#EC4899]', count: '2', label: 'Cleaning', bg: 'bg-[#FDF2F8]', text: 'text-[#EC4899]' },
            ].map((t) => (
              <div key={t.label} className={`rounded-xl py-3 px-1.5 flex flex-col items-center justify-center ${t.bg} transition-transform hover:scale-[1.03]`}>
                <span className={`w-3 h-3 rounded-md ${t.colorDot} shadow-sm block`} />
                <span className={`text-xl font-black ${t.text} block mt-2 leading-none`}>{t.count}</span>
                <span className="text-[10px] font-bold text-slate-500 block leading-tight mt-1.5">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kitchen (KOT) Status (4 Cols) */}
        <div className="md:col-span-4 bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="text-sm">👨‍🍳</span>
              <h4 className="text-xs font-black text-slate-900 tracking-wide uppercase">Kitchen (KOT) Status</h4>
            </div>
            <button className="text-[11px] font-black text-[#00C060] hover:underline flex items-center gap-1">
              View KOT →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center my-auto">
            {[
              { icon: '⏳', count: '8', label: 'Preparing', bg: 'bg-[#FEFCE8]', text: 'text-amber-500' },
              { icon: '✓', count: '4', label: 'Ready', bg: 'bg-[#F0FDF4]', text: 'text-[#00C060]' },
              { icon: '⏱', count: '2', label: 'Delayed', bg: 'bg-[#FFF1F2]', text: 'text-rose-500' },
            ].map((k) => (
              <div key={k.label} className={`rounded-xl py-3 px-2 flex flex-col items-center justify-center ${k.bg} transition-transform hover:scale-[1.03]`}>
                <span className={`text-base leading-none block font-black ${k.text}`}>{k.icon}</span>
                <span className={`text-xl font-black ${k.text} block mt-2 leading-none`}>{k.count}</span>
                <span className="text-[10px] font-bold text-slate-500 block leading-tight mt-1.5">{k.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Summary (4 Cols) */}
        <div className="md:col-span-4 bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-3.5">
            <span className="w-5 h-5 rounded-full bg-emerald-50 text-[#00C060] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-xs font-black text-slate-900 tracking-wide uppercase">Today's Summary</h4>
          </div>

          <div className="space-y-2.5 text-xs my-auto">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500 font-semibold text-xs">
                <span className="text-sm">💵</span> Total Sales
              </span>
              <span className="font-black text-slate-900 text-sm">₹24,850</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500 font-semibold text-xs">
                <span className="text-sm">🛍️</span> Total Orders
              </span>
              <span className="font-black text-slate-900 text-sm">128</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500 font-semibold text-xs">
                <span className="text-sm">👥</span> Total Guests
              </span>
              <span className="font-black text-slate-900 text-sm">56</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500 font-semibold text-xs">
                <span className="text-sm">📈</span> Avg. Order Value
              </span>
              <span className="font-black text-slate-900 text-sm">₹435</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ROW 6: RECENT ORDERS + TODAY'S PERFORMANCE (CHEF 3D) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-4.5 items-stretch">
        {/* Recent Orders (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="text-sm">📋</span>
              <h4 className="text-xs font-black text-slate-900 tracking-wide uppercase">Recent Orders</h4>
            </div>
            <button className="text-[11px] font-black text-[#00C060] hover:underline flex items-center gap-1">
              View All →
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              { id: '#RP031', type: 'Dine In', typeCls: 'bg-emerald-50 text-[#00C060]', sub: 'T4 • 2 Guests', price: '₹714.00', time: '2 min ago', img: recentPizzaImg },
              { id: '#RP030', type: 'Takeaway', typeCls: 'bg-orange-50 text-orange-500', sub: 'T2 • 1 Guest', price: '₹320.00', time: '6 min ago', img: recentBurgerImg },
              { id: '#RP029', type: 'Delivery', typeCls: 'bg-purple-50 text-purple-600', sub: 'T6 • 4 Guests', price: '₹1,240.00', time: '10 min ago', img: recentBowlImg },
              { id: '#RP028', type: 'Dine In', typeCls: 'bg-emerald-50 text-[#00C060]', sub: 'T1 • 1 Guest', price: '₹290.00', time: '12 min ago', img: recentDrinkImg },
            ].map((o) => (
              <div key={o.id} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                    <img src={o.img} alt="Order item" className="w-6 h-6 object-contain" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-900 text-xs">{o.id}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${o.typeCls}`}>{o.type}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-semibold">{o.sub}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-black text-slate-900 text-xs">{o.price}</span>
                  <span className="block text-[9px] text-slate-400 font-semibold">{o.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Performance Banner with 3D Chef Mascot (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-3.5">
            <span className="text-sm">🎯</span>
            <h4 className="text-xs font-black text-slate-900 tracking-wide uppercase">Today's Performance</h4>
          </div>

          <div className="grid grid-cols-3 gap-3 pr-24 sm:pr-44 my-auto pt-1">
            {/* Sales */}
            <div className="bg-[#F8FAFC] rounded-2xl p-3.5 sm:p-4 border border-slate-100 flex flex-col justify-between shadow-sm hover:border-emerald-200 transition-all">
              <span className="text-base">🎯</span>
              <div className="mt-2.5">
                <span className="text-xl font-black text-slate-900 block leading-tight">₹24,850</span>
                <span className="text-[11px] text-slate-400 font-semibold block mt-0.5">Sales</span>
              </div>
              <span className="text-[11px] font-bold text-[#00B859] mt-2 block">↑ 12.4%</span>
            </div>

            {/* Orders */}
            <div className="bg-[#F8FAFC] rounded-2xl p-3.5 sm:p-4 border border-slate-100 flex flex-col justify-between shadow-sm hover:border-emerald-200 transition-all">
              <span className="text-base">🛍️</span>
              <div className="mt-2.5">
                <span className="text-xl font-black text-slate-900 block leading-tight">128</span>
                <span className="text-[11px] text-slate-400 font-semibold block mt-0.5">Orders</span>
              </div>
              <span className="text-[11px] font-bold text-[#00B859] mt-2 block">↑ 8.1%</span>
            </div>

            {/* Guests */}
            <div className="bg-[#F8FAFC] rounded-2xl p-3.5 sm:p-4 border border-slate-100 flex flex-col justify-between shadow-sm hover:border-emerald-200 transition-all">
              <span className="text-base">👥</span>
              <div className="mt-2.5">
                <span className="text-xl font-black text-slate-900 block leading-tight">56</span>
                <span className="text-[11px] text-slate-400 font-semibold block mt-0.5">Guests</span>
              </div>
              <span className="text-[11px] font-bold text-[#00B859] mt-2 block">↑ 5.6%</span>
            </div>
          </div>

          {/* 3D Chef Mascot Sticking Out from Bottom Right */}
          <div className="absolute right-1 bottom-0 w-36 sm:w-52 h-52 pointer-events-none flex items-end justify-end">
            <img src={chefMascotImg} alt="Chef Mascot" className="w-full h-full object-contain object-bottom filter drop-shadow-xl anim-float" style={{ animationDelay: '2s' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
