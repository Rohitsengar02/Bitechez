import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  ChevronDown,
  Plus,
  Utensils,
  ShoppingBag,
  Bike,
  Globe,
  Printer,
  Package,
  UserPlus,
  Banknote,
  Clock,
  BarChart2,
  Settings,
} from 'lucide-react';

// 3D Food image assets
import classicBurgerImg from '../assets/3d/classic_burger.png';
import recentBurgerImg from '../assets/3d/recent_burger.png';
import recentDrinkImg from '../assets/3d/recent_drink.png';
import recentPizzaImg from '../assets/3d/recent_pizza.png';
import restaurantStoreImg from '../assets/3d/restaurant_store.png';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [dateFilter] = useState('Today, 02 Nov 2026');
  const [salesTab, setSalesTab] = useState<'sales' | 'orders' | 'revenue'>('sales');

  return (
    <div className="w-full max-w-[1720px] mx-auto flex flex-col gap-4 pb-20 select-none font-sans text-gray-800 animate-fadeIn">
      {/* ================= HEADER SECTION ================= */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Good Evening, Rohit!</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">
            Here's what's happening at Resto Daddy today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-2 bg-white border border-gray-200/90 hover:border-gray-300 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 shadow-2xs transition-all">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>{dateFilter}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          <button
            onClick={() => navigate('/pos')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#00C060] hover:bg-[#00ab55] active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* ================= ROW 1: SALES HERO BANNER + 5 METRIC CARDS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Today's Sales Hero Banner (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-r from-[#03542B] via-[#026E37] to-[#018040] rounded-2xl p-4 sm:p-5 text-white flex items-center justify-between relative overflow-hidden shadow-xs">
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-100/90 tracking-wide">Today's Sales</span>
                <span className="p-1 rounded-md bg-white/10 text-white/90">
                  <BarChart2 className="w-3.5 h-3.5" />
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1.5">
                ₹28,430.00
              </h2>
            </div>

            <div className="flex items-center gap-2 mt-4 text-xs font-semibold">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-white/15 text-white text-[11px] font-bold">
                ↑ +18.4%
              </span>
              <span className="text-emerald-100/80 text-[11px]">vs. yesterday (₹24,010)</span>
            </div>
          </div>

          {/* Restaurant Store / Burger Neon Image Illustration */}
          <div className="w-36 h-28 sm:w-44 sm:h-32 shrink-0 relative flex items-center justify-center">
            <img
              src={restaurantStoreImg}
              alt="Restaurant store"
              className="w-full h-full object-cover rounded-xl shadow-lg border border-white/20 filter brightness-95"
            />
          </div>
        </div>

        {/* 5 KPI Stat Cards (Desktop: 5 cols grid, Mobile: horizontal scrollable carousel with snap) */}
        <div className="lg:col-span-7 flex sm:grid sm:grid-cols-5 gap-2.5 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scrollbar-none snap-x snap-mandatory">
          {/* Card 1: Total Orders */}
          <div className="min-w-[130px] sm:min-w-0 flex-1 bg-white rounded-2xl border border-gray-100/90 p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all snap-start">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00C060] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-gray-900 leading-none block">86</span>
              <span className="text-[11px] font-bold text-gray-500 mt-0.5 block whitespace-nowrap">Total Orders</span>
            </div>
            <span className="text-[10px] font-extrabold text-[#00A852] mt-2 block">↑ +17%</span>
          </div>

          {/* Card 2: Dine In */}
          <div className="min-w-[130px] sm:min-w-0 flex-1 bg-white rounded-2xl border border-gray-100/90 p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all snap-start">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00C060] flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-gray-900 leading-none block">32</span>
              <span className="text-[11px] font-bold text-gray-500 mt-0.5 block whitespace-nowrap">Dine In</span>
            </div>
            <span className="text-[10px] font-extrabold text-[#00A852] mt-2 block">↑ +10%</span>
          </div>

          {/* Card 3: Takeaway */}
          <div className="min-w-[130px] sm:min-w-0 flex-1 bg-white rounded-2xl border border-gray-100/90 p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all snap-start">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-gray-900 leading-none block">18</span>
              <span className="text-[11px] font-bold text-gray-500 mt-0.5 block whitespace-nowrap">Takeaway</span>
            </div>
            <span className="text-[10px] font-extrabold text-[#00A852] mt-2 block">↑ +20%</span>
          </div>

          {/* Card 4: Delivery */}
          <div className="min-w-[130px] sm:min-w-0 flex-1 bg-white rounded-2xl border border-gray-100/90 p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all snap-start">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <Bike className="w-4 h-4" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-gray-900 leading-none block">14</span>
              <span className="text-[11px] font-bold text-gray-500 mt-0.5 block whitespace-nowrap">Delivery</span>
            </div>
            <span className="text-[10px] font-extrabold text-[#00A852] mt-2 block">↑ +27%</span>
          </div>

          {/* Card 5: Online */}
          <div className="min-w-[130px] sm:min-w-0 flex-1 bg-white rounded-2xl border border-gray-100/90 p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all snap-start">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-gray-900 leading-none block">10</span>
              <span className="text-[11px] font-bold text-gray-500 mt-0.5 block whitespace-nowrap">Online</span>
            </div>
            <span className="text-[10px] font-extrabold text-[#00A852] mt-2 block">↑ +11%</span>
          </div>
        </div>
      </div>

      {/* ================= ROW 2: SALES OVERVIEW (CHART) + ORDER STATUS (DONUT) + TOP SELLING ITEMS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* 1. Sales Overview Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100/90 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900">Sales Overview</h3>
              <div className="flex items-center gap-3 mt-1 text-[11px]">
                <span className="flex items-center gap-1.5 text-gray-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#00C060]" />
                  Today ₹28,430
                </span>
                <span className="flex items-center gap-1.5 text-gray-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                  Yesterday ₹24,010
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setSalesTab('sales')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  salesTab === 'sales' ? 'bg-[#00C060] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sales
              </button>
              <button
                onClick={() => setSalesTab('orders')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  salesTab === 'orders' ? 'bg-[#00C060] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setSalesTab('revenue')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  salesTab === 'revenue' ? 'bg-[#00C060] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Revenue
              </button>
            </div>
          </div>

          {/* Smooth Curved SVG Wave Chart with Tooltip */}
          <div className="relative pt-4 pb-2">
            {/* Tooltip on peak at 6 PM */}
            <div className="absolute left-[68%] top-3 -translate-x-1/2 flex flex-col items-center">
              <div className="bg-white border border-gray-200 px-2 py-0.5 rounded-lg shadow-sm text-center">
                <span className="text-[11px] font-black text-gray-900 block leading-tight">₹6,420</span>
                <span className="text-[9px] font-semibold text-gray-400 block leading-none">6 PM</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#00C060] ring-4 ring-emerald-100 mt-1" />
            </div>

            <svg viewBox="0 0 500 160" className="w-full h-36 overflow-visible">
              <defs>
                <linearGradient id="chartEmeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00C060" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#00C060" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeDasharray="3 3" />

              {/* Yesterday curve (Gray) */}
              <path
                d="M 10 135 C 70 120, 110 115, 170 110 C 230 105, 270 95, 330 85 C 380 75, 430 90, 490 95"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Today area fill */}
              <path
                d="M 10 135 C 60 125, 100 110, 160 85 C 210 65, 260 100, 310 90 C 340 85, 360 45, 390 40 C 430 35, 460 75, 490 80 L 490 140 L 10 140 Z"
                fill="url(#chartEmeraldGrad)"
              />

              {/* Today primary line */}
              <path
                d="M 10 135 C 60 125, 100 110, 160 85 C 210 65, 260 100, 310 90 C 340 85, 360 45, 390 40 C 430 35, 460 75, 490 80"
                fill="none"
                stroke="#00C060"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>

            {/* X Axis Time Labels */}
            <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400 pt-1 px-1">
              <span>8 AM</span>
              <span>10 AM</span>
              <span>12 PM</span>
              <span>2 PM</span>
              <span>4 PM</span>
              <span>6 PM</span>
              <span>8 PM</span>
              <span>10 PM</span>
            </div>
          </div>
        </div>

        {/* 2. Order Status Donut Chart (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100/90 p-4 shadow-2xs flex flex-col justify-between">
          <h3 className="text-sm font-extrabold text-gray-900 pb-2 border-b border-gray-100">Order Status</h3>

          <div className="flex items-center justify-between gap-3 my-auto py-2">
            {/* SVG Donut */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                {/* Completed (93% -> ~222 length out of 238) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#00C060"
                  strokeWidth="12"
                  strokeDasharray="222 238"
                  strokeDashoffset="0"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* In Progress (amber) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#F59E0B"
                  strokeWidth="12"
                  strokeDasharray="12 238"
                  strokeDashoffset="-222"
                  fill="none"
                />
                {/* Cancelled (red) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#EF4444"
                  strokeWidth="12"
                  strokeDasharray="4 238"
                  strokeDashoffset="-234"
                  fill="none"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-gray-900 leading-none">86</span>
                <span className="text-[10px] font-bold text-gray-400 mt-0.5">Orders</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-1.5 text-xs flex-1">
              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00C060]" />
                  <span>Completed</span>
                </span>
                <span className="font-bold text-gray-900">80 <span className="text-gray-400 text-[10px]">93.0%</span></span>
              </div>

              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>In Progress</span>
                </span>
                <span className="font-bold text-gray-900">4 <span className="text-gray-400 text-[10px]">4.7%</span></span>
              </div>

              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Cancelled</span>
                </span>
                <span className="font-bold text-gray-900">1 <span className="text-gray-400 text-[10px]">1.2%</span></span>
              </div>

              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  <span>Pending</span>
                </span>
                <span className="font-bold text-gray-900">1 <span className="text-gray-400 text-[10px]">1.2%</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Top Selling Items (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100/90 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-sm font-extrabold text-gray-900">Top Selling Items</h3>
            <button
              onClick={() => navigate('/menu')}
              className="text-xs font-bold text-[#00C060] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <span className="text-xs">→</span>
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-2 mt-2">
            {/* Item 1 */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2.5">
                <img src={classicBurgerImg} alt="Cheese Burger" className="w-7 h-7 object-contain" />
                <span className="text-xs font-bold text-gray-900">Cheese Burger</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-gray-500">28</span>
                <span className="text-gray-900 w-14 text-right">₹6,160</span>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2.5">
                <img src={recentBurgerImg} alt="French Fries" className="w-7 h-7 object-contain" />
                <span className="text-xs font-bold text-gray-900">French Fries</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-gray-500">24</span>
                <span className="text-gray-900 w-14 text-right">₹3,840</span>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2.5">
                <img src={recentDrinkImg} alt="Cold Drink" className="w-7 h-7 object-contain" />
                <span className="text-xs font-bold text-gray-900">Cold Drink (Large)</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-gray-500">20</span>
                <span className="text-gray-900 w-14 text-right">₹2,400</span>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2.5">
                <img src={recentPizzaImg} alt="Veg Pizza" className="w-7 h-7 object-contain" />
                <span className="text-xs font-bold text-gray-900">Veg Pizza</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-gray-500">18</span>
                <span className="text-gray-900 w-14 text-right">₹9,000</span>
              </div>
            </div>

            {/* Item 5 */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2.5">
                <img src={classicBurgerImg} alt="Paneer Wrap" className="w-7 h-7 object-contain" />
                <span className="text-xs font-bold text-gray-900">Paneer Wrap</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-gray-500">14</span>
                <span className="text-gray-900 w-14 text-right">₹4,060</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ROW 3: RECENT ORDERS + QUICK ACTIONS + TODAY AT A GLANCE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* 1. Recent Orders (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100/90 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-sm font-extrabold text-gray-900">Recent Orders</h3>
            <button
              onClick={() => navigate('/orders')}
              className="text-xs font-bold text-[#00C060] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <span className="text-xs">→</span>
            </button>
          </div>

          <div className="space-y-2 mt-2">
            {/* Order 1 */}
            <div className="flex items-center justify-between py-1 text-xs">
              <span className="font-bold text-gray-900">ORD-1024</span>
              <span className="text-gray-600 font-medium flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5 text-[#00C060]" />
                Dine In • T-06
              </span>
              <span className="font-extrabold text-gray-900">₹780.00</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                In Progress
              </span>
            </div>

            {/* Order 2 */}
            <div className="flex items-center justify-between py-1 text-xs">
              <span className="font-bold text-gray-900">ORD-1023</span>
              <span className="text-gray-600 font-medium flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                Takeaway
              </span>
              <span className="font-extrabold text-gray-900">₹420.00</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Preparing
              </span>
            </div>

            {/* Order 3 */}
            <div className="flex items-center justify-between py-1 text-xs">
              <span className="font-bold text-gray-900">ORD-1022</span>
              <span className="text-gray-600 font-medium flex items-center gap-1">
                <Bike className="w-3.5 h-3.5 text-rose-500" />
                Delivery
              </span>
              <span className="font-extrabold text-gray-900">₹1,120.00</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Out for Delivery
              </span>
            </div>

            {/* Order 4 */}
            <div className="flex items-center justify-between py-1 text-xs">
              <span className="font-bold text-gray-900">ORD-1021</span>
              <span className="text-gray-600 font-medium flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5 text-[#00C060]" />
                Dine In • T-03
              </span>
              <span className="font-extrabold text-gray-900">₹1,340.00</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E7F9F0] text-[#00A852]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C060]" />
                Completed
              </span>
            </div>
          </div>
        </div>

        {/* 2. Quick Actions Grid (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100/90 p-4 shadow-2xs flex flex-col justify-between">
          <h3 className="text-sm font-extrabold text-gray-900 pb-2 border-b border-gray-100">Quick Actions</h3>

          <div className="grid grid-cols-4 gap-2 mt-2">
            <button
              onClick={() => navigate('/pos')}
              className="p-2 rounded-xl bg-gray-50 hover:bg-[#E7F9F0] border border-gray-100 hover:border-[#00C060] flex flex-col items-center justify-center gap-1 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-[#00C060] text-white flex items-center justify-center shadow-xs">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-gray-700 group-hover:text-[#00C060]">New Order</span>
            </button>

            <button
              onClick={() => navigate('/kitchen')}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100/80 border border-gray-100 flex flex-col items-center justify-center gap-1 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-white text-gray-700 border border-gray-200 flex items-center justify-center">
                <Printer className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-[10px] font-bold text-gray-700 group-hover:text-gray-900">KOT</span>
            </button>

            <button
              onClick={() => navigate('/inventory/stock')}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100/80 border border-gray-100 flex flex-col items-center justify-center gap-1 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-white text-gray-700 border border-gray-200 flex items-center justify-center">
                <Package className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-[10px] font-bold text-gray-700 group-hover:text-gray-900">Add Item</span>
            </button>

            <button
              onClick={() => navigate('/customers')}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100/80 border border-gray-100 flex flex-col items-center justify-center gap-1 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-white text-gray-700 border border-gray-200 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-[10px] font-bold text-gray-700 group-hover:text-gray-900">Add Customer</span>
            </button>

            <button
              onClick={() => navigate('/cashdrawer')}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100/80 border border-gray-100 flex flex-col items-center justify-center gap-1 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-white text-gray-700 border border-gray-200 flex items-center justify-center">
                <Banknote className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-[10px] font-bold text-gray-700 group-hover:text-gray-900">Cash In/Out</span>
            </button>

            <button
              onClick={() => navigate('/shifts')}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100/80 border border-gray-100 flex flex-col items-center justify-center gap-1 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-white text-gray-700 border border-gray-200 flex items-center justify-center">
                <Clock className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-[10px] font-bold text-gray-700 group-hover:text-gray-900">Shift</span>
            </button>

            <button
              onClick={() => navigate('/reports/sales')}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100/80 border border-gray-100 flex flex-col items-center justify-center gap-1 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-white text-gray-700 border border-gray-200 flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-[10px] font-bold text-gray-700 group-hover:text-gray-900">Reports</span>
            </button>

            <button
              onClick={() => navigate('/settings')}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100/80 border border-gray-100 flex flex-col items-center justify-center gap-1 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-white text-gray-700 border border-gray-200 flex items-center justify-center">
                <Settings className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-[10px] font-bold text-gray-700 group-hover:text-gray-900">Settings</span>
            </button>
          </div>
        </div>

        {/* 3. Today at a Glance (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100/90 p-4 shadow-2xs flex flex-col justify-between">
          <h3 className="text-sm font-extrabold text-gray-900 pb-2 border-b border-gray-100">Today at a Glance</h3>

          <div className="space-y-3 mt-2">
            {/* Metric 1: Tables Occupied */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2 font-bold text-gray-800">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#00C060] flex items-center justify-center">
                    <Utensils className="w-3.5 h-3.5" />
                  </div>
                  <span>Tables Occupied</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-gray-900">12 / 20</span>
                  <span className="text-gray-400 text-[10px] ml-1">60%</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#00C060] h-full rounded-full transition-all" style={{ width: '60%' }} />
              </div>
            </div>

            {/* Metric 2: Active Staff */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2 font-bold text-gray-800">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#00C060] flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span>Active Staff</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-gray-900">6 / 8</span>
                  <span className="text-gray-400 text-[10px] ml-1">75%</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#00C060] h-full rounded-full transition-all" style={{ width: '75%' }} />
              </div>
            </div>

            {/* Metric 3: Kitchen Load */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2 font-bold text-gray-800">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#00C060] flex items-center justify-center">
                    <Utensils className="w-3.5 h-3.5" />
                  </div>
                  <span>Kitchen Load</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                  Medium
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#00C060] h-full rounded-full transition-all" style={{ width: '50%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
