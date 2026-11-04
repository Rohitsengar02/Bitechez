import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  FileText, 
  PlusCircle, 
  ChefHat, 
  Users, 
  BarChart3, 
  Printer, 
  Settings, 
  UtensilsCrossed, 
  Grid2X2,
  Coins,
  Package,
  ChevronDown
} from 'lucide-react';
import bannerBg from '../assets/banner_bg.jpg';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [salesTimeframe, setSalesTimeframe] = React.useState<'Today' | '7 Days' | '30 Days'>('Today');

  // Dynamic Sales Trend Data depending on selected timeframe
  const salesTrendData = {
    'Today': {
      points: [
        { x: 30, y: 105, label: '9 AM' },
        { x: 60, y: 88, label: '10 AM' },
        { x: 90, y: 72, label: '11 AM' },
        { x: 120, y: 70, label: '12 PM' },
        { x: 150, y: 92, label: '1 PM' },
        { x: 180, y: 85, label: '2 PM' },
        { x: 210, y: 65, label: '3 PM' },
        { x: 240, y: 40, label: '4 PM', highlight: '₹26,400 at 4:00 PM' },
        { x: 270, y: 78, label: '5 PM' },
        { x: 300, y: 55, label: '6 PM' },
      ],
      pathD: 'M 30 105 Q 60 88, 90 72 T 120 70 T 150 92 T 180 85 T 210 65 T 240 40 T 270 78 T 300 55',
      areaD: 'M 30 105 Q 60 88, 90 72 T 120 70 T 150 92 T 180 85 T 210 65 T 240 40 T 270 78 T 300 55 L 300 115 L 30 115 Z',
    },
    '7 Days': {
      points: [
        { x: 30, y: 95, label: 'Mon' },
        { x: 75, y: 80, label: 'Tue' },
        { x: 120, y: 65, label: 'Wed' },
        { x: 165, y: 70, label: 'Thu' },
        { x: 210, y: 45, label: 'Fri', highlight: '₹31,200 on Fri' },
        { x: 255, y: 35, label: 'Sat' },
        { x: 300, y: 40, label: 'Sun' },
      ],
      pathD: 'M 30 95 Q 75 80, 120 65 T 165 70 T 210 45 T 255 35 T 300 40',
      areaD: 'M 30 95 Q 75 80, 120 65 T 165 70 T 210 45 T 255 35 T 300 40 L 300 115 L 30 115 Z',
    },
    '30 Days': {
      points: [
        { x: 30, y: 85, label: 'W1' },
        { x: 120, y: 60, label: 'W2' },
        { x: 210, y: 38, label: 'W3', highlight: '₹1,84,000 W3' },
        { x: 300, y: 50, label: 'W4' },
      ],
      pathD: 'M 30 85 Q 120 60, 210 38 T 300 50',
      areaD: 'M 30 85 Q 120 60, 210 38 T 300 50 L 300 115 L 30 115 Z',
    },
  }[salesTimeframe];

  return (
    <div className="space-y-3 pb-3 w-full select-none">
      
      {/* ========================================================
          ROW 1: TOP HERO 16:9 BANNER + QUICK ACTIONS
         ======================================================== */}
      <div className="grid grid-cols-12 gap-4 items-stretch">
        
        {/* Left 16:9 Hero Banner Card (~58% width) */}
        <div className="col-span-12 xl:col-span-7 relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm aspect-[16/9] max-h-[285px] min-h-[260px] w-full flex items-center bg-[#FAF8F9]">
          <img
            src={bannerBg}
            alt="CyberLim Hero Banner"
            className="absolute inset-0 w-full h-full object-cover object-right pointer-events-none"
          />
          
          <div className="relative z-10 p-6 2xl:p-7 max-w-[420px] 2xl:max-w-[460px] flex flex-col justify-between h-full">
            <div>
              <h2 className="text-2xl 2xl:text-3xl font-black text-[#191923] tracking-tight flex items-center gap-2">
                Good Afternoon, Rohit <span className="inline-block text-2xl">👋</span>
              </h2>
              <p className="text-xl 2xl:text-2xl font-black text-[#800D32] mt-0.5 tracking-tight">
                Welcome to CyberLim POS
              </p>
              <p className="text-xs 2xl:text-sm text-gray-600 font-medium mt-1 leading-snug">
                Manage orders, tables, kitchen and more — all in one place.
              </p>
            </div>

            {/* Stat Strip */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm px-4 py-2 inline-flex items-center gap-4 self-start">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-rose-50 text-[#800D32] flex items-center justify-center">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-sm font-black text-[#191923] leading-none block">128</span>
                  <span className="text-[10px] text-gray-500 font-semibold block">Orders Today</span>
                </div>
              </div>

              <div className="w-px h-6 bg-gray-200" />

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-rose-50 text-[#800D32] flex items-center justify-center font-bold text-xs">
                  ₹
                </div>
                <div>
                  <span className="text-sm font-black text-[#191923] leading-none block">₹24,850</span>
                  <span className="text-[10px] text-gray-500 font-semibold block">Sales Today</span>
                </div>
              </div>

              <div className="w-px h-6 bg-gray-200" />

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-rose-50 text-[#800D32] flex items-center justify-center">
                  <Grid2X2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-sm font-black text-[#191923] leading-none block">18 / 24</span>
                  <span className="text-[10px] text-gray-500 font-semibold block">Tables Occupied</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Quick Actions Card (~42% width) */}
        <div className="col-span-12 xl:col-span-5 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-bold text-[#191923]">Quick Actions</h3>
            <button className="text-[11px] font-bold text-gray-500 hover:text-[#800D32] flex items-center gap-1">
              <Settings className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 flex-1 items-stretch pt-1">
            {/* New Sale F2 */}
            <button
              onClick={() => navigate('/pos')}
              className="bg-[#F9E8ED] hover:bg-[#F3D2DC] border border-[#F3D2DC] rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all group active:scale-95 shadow-sm"
            >
              <div className="w-7 h-7 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#191923] leading-tight">New Sale</span>
              <span className="text-[10px] text-gray-500 font-medium mt-0.5">F2</span>
            </button>

            {/* Add Item F3 */}
            <button
              onClick={() => navigate('/menu')}
              className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
            >
              <div className="w-7 h-7 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                <PlusCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#191923] leading-tight">Add Item</span>
              <span className="text-[10px] text-gray-400 font-medium mt-0.5">F3</span>
            </button>

            {/* Add Table F4 */}
            <button
              onClick={() => navigate('/tables')}
              className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
            >
              <div className="w-7 h-7 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                <Grid2X2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#191923] leading-tight">Add Table</span>
              <span className="text-[10px] text-gray-400 font-medium mt-0.5">F4</span>
            </button>

            {/* KOT F5 */}
            <button
              onClick={() => navigate('/kitchen')}
              className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
            >
              <div className="w-7 h-7 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                <ChefHat className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#191923] leading-tight">KOT</span>
              <span className="text-[10px] text-gray-400 font-medium mt-0.5">F5</span>
            </button>

            {/* Customers F6 */}
            <button
              onClick={() => navigate('/customers')}
              className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
            >
              <div className="w-7 h-7 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#191923] leading-tight">Customers</span>
              <span className="text-[10px] text-gray-400 font-medium mt-0.5">F6</span>
            </button>

            {/* Reports F7 */}
            <button
              onClick={() => navigate('/tools')}
              className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
            >
              <div className="w-7 h-7 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#191923] leading-tight">Reports</span>
              <span className="text-[10px] text-gray-400 font-medium mt-0.5">F7</span>
            </button>

            {/* Printers F8 */}
            <button
              onClick={() => navigate('/printers')}
              className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
            >
              <div className="w-7 h-7 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                <Printer className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#191923] leading-tight">Printers</span>
              <span className="text-[10px] text-gray-400 font-medium mt-0.5">F8</span>
            </button>

            {/* Settings F9 */}
            <button
              onClick={() => navigate('/tools')}
              className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
            >
              <div className="w-7 h-7 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                <Settings className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#191923] leading-tight">Settings</span>
              <span className="text-[10px] text-gray-400 font-medium mt-0.5">F9</span>
            </button>
          </div>
        </div>

      </div>


      {/* ========================================================
          ROW 2: 6 SNAPSHOT STAT CARDS IN A ROW WITH MINI SPARKLINES
         ======================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Card 1: Total Sales */}
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm flex flex-col justify-between h-[96px] relative overflow-hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Coins className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-base font-black text-[#191923] leading-tight">₹24,850</h4>
              <p className="text-[10px] text-gray-400 font-medium">Total Sales</p>
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[10px] font-bold text-emerald-600">↑ +12.8% vs yesterday</span>
            <svg className="w-14 h-5 text-emerald-500" viewBox="0 0 50 15" fill="none">
              <path d="M 0 12 Q 15 14, 25 7 T 50 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm flex flex-col justify-between h-[96px] relative overflow-hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-base font-black text-[#191923] leading-tight">128</h4>
              <p className="text-[10px] text-gray-400 font-medium">Total Orders</p>
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[10px] font-bold text-indigo-600">↑ +8.2%</span>
            <svg className="w-14 h-5 text-indigo-500" viewBox="0 0 50 15" fill="none">
              <path d="M 0 10 Q 15 3, 25 9 T 50 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 3: Occupied Tables */}
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm flex flex-col justify-between h-[96px] relative overflow-hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Grid2X2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-base font-black text-[#191923] leading-tight">18 / 24</h4>
              <p className="text-[10px] text-gray-400 font-medium">Occupied Tables</p>
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[10px] font-bold text-amber-600">↑ 75%</span>
            <svg className="w-14 h-5 text-amber-500" viewBox="0 0 50 15" fill="none">
              <path d="M 0 12 Q 15 6, 25 10 T 50 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 4: Total Customers */}
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm flex flex-col justify-between h-[96px] relative overflow-hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Users className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-base font-black text-[#191923] leading-tight">36</h4>
              <p className="text-[10px] text-gray-400 font-medium">Total Customers</p>
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[10px] font-bold text-sky-600">↑ +15.4%</span>
            <svg className="w-14 h-5 text-sky-500" viewBox="0 0 50 15" fill="none">
              <path d="M 0 13 Q 15 11, 25 8 T 50 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 5: Pending KOT */}
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm flex flex-col justify-between h-[96px] relative overflow-hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <ChefHat className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-base font-black text-[#191923] leading-tight">6</h4>
              <p className="text-[10px] text-gray-400 font-medium">Pending KOT</p>
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[10px] font-bold text-rose-600">2 Preparing</span>
            <svg className="w-14 h-5 text-rose-500" viewBox="0 0 50 15" fill="none">
              <path d="M 0 10 Q 15 4, 30 11 T 50 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 6: Inventory Value */}
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm flex flex-col justify-between h-[96px] relative overflow-hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Package className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-base font-black text-[#191923] leading-tight">₹5,420</h4>
              <p className="text-[10px] text-gray-400 font-medium">Inventory Value</p>
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[10px] font-bold text-rose-600">↓ -3.1%</span>
            <svg className="w-12 h-5 text-emerald-500" viewBox="0 0 50 15" fill="none">
              <path d="M 0 4 Q 15 10, 25 6 T 50 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

      </div>


      {/* ========================================================
          ROW 3: 4 EQUAL CARDS (Sales Trend, Order Types, Top Selling, Table Status)
         ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Sales Trend */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#191923]">Sales Trend</h4>
            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[10px] font-bold">
              {(['Today', '7 Days', '30 Days'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSalesTimeframe(t)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    salesTimeframe === t ? 'bg-[#800D32] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Spline Area Chart with Tooltip Node */}
          <div className="h-48 w-full relative mt-3">
            {/* Tooltip Pill */}
            <div className="absolute top-2 left-1/2 -translate-x-4 bg-white border border-gray-200 shadow-md rounded-lg px-2.5 py-1 text-[10px] font-bold text-[#191923] flex items-center gap-1.5 z-10">
              <span className="w-2 h-2 rounded-full bg-[#800D32]" />
              <span>₹26,400 at 4:00 PM</span>
            </div>

            <svg className="w-full h-full overflow-visible" viewBox="0 0 320 125" preserveAspectRatio="none">
              <defs>
                <linearGradient id="trendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#800D32" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#800D32" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="25" y1="20" x2="310" y2="20" stroke="#F1F1F4" strokeDasharray="3 3" />
              <line x1="25" y1="48" x2="310" y2="48" stroke="#F1F1F4" strokeDasharray="3 3" />
              <line x1="25" y1="76" x2="310" y2="76" stroke="#F1F1F4" strokeDasharray="3 3" />
              <line x1="25" y1="102" x2="310" y2="102" stroke="#F1F1F4" strokeDasharray="3 3" />
              <line x1="25" y1="120" x2="310" y2="120" stroke="#F1F1F4" />

              {/* Y-Axis */}
              <text x="5" y="23" fill="#9CA3AF" fontSize="8" fontWeight="600">30K</text>
              <text x="5" y="51" fill="#9CA3AF" fontSize="8" fontWeight="600">20K</text>
              <text x="5" y="79" fill="#9CA3AF" fontSize="8" fontWeight="600">10K</text>
              <text x="12" y="122" fill="#9CA3AF" fontSize="8" fontWeight="600">0</text>

              {/* Area Fill */}
              <path d={salesTrendData.areaD} fill="url(#trendGrad)" />

              {/* Curve Stroke */}
              <path d={salesTrendData.pathD} fill="none" stroke="#800D32" strokeWidth="2.5" strokeLinecap="round" />

              {/* Points */}
              {salesTrendData.points.map((pt, idx) => (
                <circle 
                  key={idx} 
                  cx={pt.x} 
                  cy={pt.y} 
                  r={pt.highlight ? "4.5" : "3"} 
                  fill={pt.highlight ? "#800D32" : "#FFFFFF"} 
                  stroke="#800D32" 
                  strokeWidth="2.5" 
                />
              ))}
            </svg>

            <div className="flex justify-between pl-6 pr-2 text-[8px] font-semibold text-gray-400 mt-1">
              {salesTrendData.points.map((pt, i) => (
                <span key={i}>{pt.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Order Types */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[300px]">
          <h4 className="text-sm font-bold text-[#191923]">Order Types</h4>

          <div className="flex items-center justify-between gap-3 flex-1 my-auto">
            {/* Donut Chart */}
            <div className="relative w-32 h-32 2xl:w-36 2xl:h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F1F1F4" strokeWidth="13" />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#800D32"
                  strokeWidth="13"
                  strokeDasharray="238.76"
                  strokeDashoffset={238.76 * (1 - 0.52)}
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#D95D80"
                  strokeWidth="13"
                  strokeDasharray="238.76"
                  strokeDashoffset={238.76 * (1 - 0.28)}
                  style={{
                    transform: `rotate(${360 * 0.52}deg)`,
                    transformOrigin: '50px 50px',
                  }}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#F5C2CE"
                  strokeWidth="13"
                  strokeDasharray="238.76"
                  strokeDashoffset={238.76 * (1 - 0.20)}
                  style={{
                    transform: `rotate(${360 * (0.52 + 0.28)}deg)`,
                    transformOrigin: '50px 50px',
                  }}
                />
              </svg>

              <div className="absolute text-center">
                <span className="text-xl font-black text-[#191923] leading-none block">128</span>
                <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Orders</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3 text-xs font-semibold pr-2">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#800D32]" />
                  Dine In
                </span>
                <span className="font-bold text-[#191923]">52%</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D95D80]" />
                  Takeaway
                </span>
                <span className="font-bold text-[#191923]">28%</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F5C2CE]" />
                  Delivery
                </span>
                <span className="font-bold text-[#191923]">20%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Top Selling Items */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-[#191923]">Top Selling Items</h4>
            <span className="text-xs font-semibold text-gray-500 flex items-center gap-0.5">
              Today <ChevronDown className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-3 my-auto">
            {[
              { name: 'Chicken Biryani', orders: 42, barWidth: '100%' },
              { name: 'Paneer Tikka', orders: 28, barWidth: '66%' },
              { name: 'Veg Fried Rice', orders: 24, barWidth: '57%' },
              { name: 'Hakka Noodles', orders: 20, barWidth: '47%' },
              { name: 'Masala Dosa', orders: 18, barWidth: '42%' },
            ].map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center text-[10px] font-bold">
                      🍲
                    </div>
                    <span className="text-[#191923] font-bold">{item.name}</span>
                  </div>
                  <span className="text-gray-500 font-mono text-[11px]">{item.orders} orders</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-[#800D32] h-full rounded-full" 
                    style={{ width: item.barWidth }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Table Status */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[300px]">
          <h4 className="text-sm font-bold text-[#191923]">Table Status</h4>

          <div className="flex items-center justify-between gap-3 flex-1 my-auto">
            {/* Donut Chart */}
            <div className="relative w-32 h-32 2xl:w-36 2xl:h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F1F1F4" strokeWidth="13" />
                {/* Occupied: 18/24 = 75% Maroon */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#800D32"
                  strokeWidth="13"
                  strokeDasharray="238.76"
                  strokeDashoffset={238.76 * (1 - 0.75)}
                  strokeLinecap="round"
                />
                {/* Available: 6/24 = 25% Green */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#22C55E"
                  strokeWidth="13"
                  strokeDasharray="238.76"
                  strokeDashoffset={238.76 * (1 - 0.25)}
                  style={{
                    transform: `rotate(${360 * 0.75}deg)`,
                    transformOrigin: '50px 50px',
                  }}
                />
              </svg>

              <div className="absolute text-center">
                <span className="text-2xl font-black text-[#191923] leading-none block">24</span>
                <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Tables</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2.5 text-xs font-semibold pr-2">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Available
                </span>
                <span className="font-bold text-[#191923]">6</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#800D32]" />
                  Occupied
                </span>
                <span className="font-bold text-[#191923]">18</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Reserved
                </span>
                <span className="font-bold text-gray-400">0</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  Cleaning
                </span>
                <span className="font-bold text-gray-400">0</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
