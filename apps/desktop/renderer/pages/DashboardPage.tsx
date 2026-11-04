import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ShoppingCart, 
  FileText, 
  Clock, 
  PlusCircle, 
  ChefHat, 
  Users, 
  BarChart3, 
  Printer, 
  Settings, 
  Store, 
  UtensilsCrossed, 
  ShoppingBag, 
  Bike,
  CreditCard,
  Grid2X2
} from 'lucide-react';
import bannerBg from '../assets/banner_bg.jpg';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full w-full flex flex-col justify-between overflow-hidden select-none">
      {/* 2-COLUMN MAIN DASHBOARD GRID - FILLS 100% CONTAINER HEIGHT WITH NO SCROLL */}
      <div className="grid grid-cols-12 gap-4 h-full overflow-hidden">
        
        {/* ========================================================
            LEFT COLUMN (Cols 1-7: ~58% width)
           ======================================================== */}
        <div className="col-span-7 flex flex-col justify-between h-full gap-3 overflow-hidden">
          
          {/* 1. HERO 16:9 RATIO BANNER CARD WITH COVER IMAGE */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm aspect-[16/9] max-h-[38%] w-full flex items-center bg-[#FAF8F9] shrink-0">
            {/* Full 16:9 Cover Image */}
            <img
              src={bannerBg}
              alt="CyberLim Hero Banner"
              className="absolute inset-0 w-full h-full object-cover object-right pointer-events-none"
            />
            
            {/* Left Content Overlay */}
            <div className="relative z-10 p-5 2xl:p-6 max-w-[360px] 2xl:max-w-[400px] flex flex-col justify-between h-full">
              <div>
                <h2 className="text-xl 2xl:text-2xl font-black text-[#191923] tracking-tight flex items-center gap-1.5">
                  Good Afternoon, Rohit <span className="inline-block text-xl">👋</span>
                </h2>
                <p className="text-lg 2xl:text-xl font-black text-[#800D32] mt-0.5 tracking-tight">
                  Welcome to CyberLim POS
                </p>
                <p className="text-[11px] 2xl:text-xs text-gray-600 font-medium mt-1 leading-snug">
                  Manage orders, tables, kitchen and more — all in one place.
                </p>
              </div>

              {/* Stat Strip */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm px-3.5 py-1.5 inline-flex items-center gap-3.5 self-start">
                {/* Orders Today */}
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-rose-50 text-[#800D32] flex items-center justify-center">
                    <UtensilsCrossed className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#191923] leading-none block">128</span>
                    <span className="text-[9px] text-gray-500 font-semibold block">Orders Today</span>
                  </div>
                </div>

                <div className="w-px h-5 bg-gray-200" />

                {/* Sales Today */}
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-rose-50 text-[#800D32] flex items-center justify-center font-bold text-[10px]">
                    ₹
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#191923] leading-none block">₹24,850</span>
                    <span className="text-[9px] text-gray-500 font-semibold block">Sales Today</span>
                  </div>
                </div>

                <div className="w-px h-5 bg-gray-200" />

                {/* Tables Occupied */}
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-rose-50 text-[#800D32] flex items-center justify-center">
                    <Grid2X2 className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#191923] leading-none block">18/24</span>
                    <span className="text-[9px] text-gray-500 font-semibold block">Tables Occupied</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. TODAY'S SNAPSHOT (4 STAT CARDS) */}
          <div className="shrink-0 space-y-1.5">
            <h3 className="text-xs font-bold text-[#191923]">Today's Snapshot</h3>
            
            <div className="grid grid-cols-4 gap-2.5">
              {/* Card 1: Total Sales */}
              <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm 2xl:text-base font-black text-[#191923] leading-tight">₹24,850</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Total Sales</p>
                  <span className="text-[10px] font-bold text-emerald-600">
                    ↑ +12.5%
                  </span>
                </div>
              </div>

              {/* Card 2: Total Orders */}
              <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm 2xl:text-base font-black text-[#191923] leading-tight">128</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Total Orders</p>
                  <span className="text-[10px] font-bold text-emerald-600">
                    ↑ +8.2%
                  </span>
                </div>
              </div>

              {/* Card 3: Occupied Tables */}
              <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm 2xl:text-base font-black text-[#191923] leading-tight">18 / 24</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Occupied Tables</p>
                  <span className="text-[10px] font-bold text-amber-600">
                    75%
                  </span>
                </div>
              </div>

              {/* Card 4: Pending KOT */}
              <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm 2xl:text-base font-black text-[#191923] leading-tight">6</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Pending KOT</p>
                  <span className="text-[10px] font-bold text-rose-600">
                    2 Preparing
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. CHARTS ROW: SALES OVERVIEW + ORDER TYPES (FLEX-1 MIN-H-0) */}
          <div className="grid grid-cols-12 gap-2.5 flex-1 min-h-0">
            {/* Sales Overview Area Chart (7 Cols) */}
            <div className="col-span-7 bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-bold text-[#191923]">Sales Overview</h4>
                <span className="px-2 py-0.5 rounded-md border border-gray-200 text-[10px] font-semibold text-gray-600">
                  Today ▾
                </span>
              </div>

              {/* SVG Area Spline Chart */}
              <div className="flex-1 w-full relative min-h-0">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 320 110" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="salesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#800D32" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#800D32" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="30" y1="20" x2="315" y2="20" stroke="#F1F1F4" strokeDasharray="3 3" />
                  <line x1="30" y1="50" x2="315" y2="50" stroke="#F1F1F4" strokeDasharray="3 3" />
                  <line x1="30" y1="80" x2="315" y2="80" stroke="#F1F1F4" strokeDasharray="3 3" />
                  <line x1="30" y1="95" x2="315" y2="95" stroke="#F1F1F4" />

                  {/* Y-Axis Labels */}
                  <text x="5" y="23" fill="#9CA3AF" fontSize="8" fontWeight="600">30K</text>
                  <text x="5" y="53" fill="#9CA3AF" fontSize="8" fontWeight="600">20K</text>
                  <text x="5" y="83" fill="#9CA3AF" fontSize="8" fontWeight="600">10K</text>
                  <text x="18" y="98" fill="#9CA3AF" fontSize="8" fontWeight="600">0</text>

                  {/* Area fill */}
                  <path
                    d="M 35 95 Q 65 85, 80 75 T 125 60 T 170 72 T 215 42 T 260 55 T 310 32 L 310 95 L 35 95 Z"
                    fill="url(#salesGrad)"
                  />

                  {/* Stroke line */}
                  <path
                    d="M 35 95 Q 65 85, 80 75 T 125 60 T 170 72 T 215 42 T 260 55 T 310 32"
                    fill="none"
                    stroke="#D95D80"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Circular Node Points */}
                  {[
                    { cx: 35, cy: 95 },
                    { cx: 80, cy: 75 },
                    { cx: 125, cy: 60 },
                    { cx: 170, cy: 72 },
                    { cx: 215, cy: 42 },
                    { cx: 260, cy: 55 },
                    { cx: 310, cy: 32 },
                  ].map((pt, i) => (
                    <circle key={i} cx={pt.cx} cy={pt.cy} r="2.5" fill="#FFFFFF" stroke="#800D32" strokeWidth="2" />
                  ))}
                </svg>

                {/* X-Axis Labels */}
                <div className="flex justify-between pl-8 pr-1 text-[8px] font-semibold text-gray-400 mt-0.5">
                  <span>9 AM</span>
                  <span>11 AM</span>
                  <span>1 PM</span>
                  <span>3 PM</span>
                  <span>5 PM</span>
                  <span>7 PM</span>
                  <span>9 PM</span>
                </div>
              </div>
            </div>

            {/* Order Types Donut Chart (5 Cols) */}
            <div className="col-span-5 bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden">
              <h4 className="text-xs font-bold text-[#191923] mb-1">Order Types</h4>

              <div className="flex items-center justify-between gap-2 flex-1">
                {/* SVG Donut Ring */}
                <div className="relative w-24 h-24 2xl:w-28 2xl:h-28 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F1F1F4" strokeWidth="12" />
                    
                    {/* Dine In: 52% (Maroon) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#800D32"
                      strokeWidth="12"
                      strokeDasharray="238.76"
                      strokeDashoffset={238.76 * (1 - 0.52)}
                      strokeLinecap="round"
                    />

                    {/* Takeaway: 28% (Rose) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#D95D80"
                      strokeWidth="12"
                      strokeDasharray="238.76"
                      strokeDashoffset={238.76 * (1 - 0.28)}
                      style={{
                        transform: `rotate(${360 * 0.52}deg)`,
                        transformOrigin: '50px 50px',
                      }}
                    />

                    {/* Delivery: 20% (Light Pink) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#F5C2CE"
                      strokeWidth="12"
                      strokeDasharray="238.76"
                      strokeDashoffset={238.76 * (1 - 0.20)}
                      style={{
                        transform: `rotate(${360 * (0.52 + 0.28)}deg)`,
                        transformOrigin: '50px 50px',
                      }}
                    />
                  </svg>

                  {/* Center Text */}
                  <div className="absolute text-center">
                    <span className="text-base font-black text-[#191923] leading-none block">128</span>
                    <span className="text-[9px] text-gray-400 font-semibold block">Orders</span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="space-y-1.5 text-[11px] font-semibold pr-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <span className="w-2 h-2 rounded-full bg-[#800D32]" />
                      Dine In
                    </span>
                    <span className="font-bold text-[#191923]">52%</span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <span className="w-2 h-2 rounded-full bg-[#D95D80]" />
                      Takeaway
                    </span>
                    <span className="font-bold text-[#191923]">28%</span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <span className="w-2 h-2 rounded-full bg-[#F5C2CE]" />
                      Delivery
                    </span>
                    <span className="font-bold text-[#191923]">20%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* ========================================================
            RIGHT COLUMN (Cols 8-12: ~42% width)
           ======================================================== */}
        <div className="col-span-5 flex flex-col justify-between h-full gap-3 overflow-hidden">
          
          {/* 1. QUICK ACTIONS CARD (SHRINK-0) */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#191923]">Quick Actions</h3>
              <button 
                onClick={() => navigate('/tools')}
                className="text-[11px] font-bold text-[#800D32] hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* 2x4 Action Grid */}
            <div className="grid grid-cols-4 gap-2">
              {/* Button 1: New Sale (Highlighted in soft pink) */}
              <button
                onClick={() => navigate('/pos')}
                className="bg-[#F9E8ED] hover:bg-[#F3D2DC] border border-[#F3D2DC] rounded-xl p-2.5 flex flex-col items-center justify-center text-center transition-all group active:scale-95 shadow-sm"
              >
                <div className="w-6 h-6 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-[#191923] leading-tight">New Sale</span>
                <span className="text-[8px] text-gray-500 font-medium">Take Order</span>
              </button>

              {/* Button 2: Add Item */}
              <button
                onClick={() => navigate('/menu')}
                className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
              >
                <div className="w-6 h-6 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-[#191923] leading-tight">Add Item</span>
                <span className="text-[8px] text-gray-400 font-medium">Menu & Price</span>
              </button>

              {/* Button 3: Add Table */}
              <button
                onClick={() => navigate('/tables')}
                className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
              >
                <div className="w-6 h-6 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                  <Grid2X2 className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-[#191923] leading-tight">Add Table</span>
                <span className="text-[8px] text-gray-400 font-medium">Manage Tables</span>
              </button>

              {/* Button 4: KOT */}
              <button
                onClick={() => navigate('/kitchen')}
                className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
              >
                <div className="w-6 h-6 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                  <ChefHat className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-[#191923] leading-tight">KOT</span>
                <span className="text-[8px] text-gray-400 font-medium">Kitchen Orders</span>
              </button>

              {/* Button 5: Customers */}
              <button
                onClick={() => navigate('/customers')}
                className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
              >
                <div className="w-6 h-6 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-[#191923] leading-tight">Customers</span>
                <span className="text-[8px] text-gray-400 font-medium">Manage Customers</span>
              </button>

              {/* Button 6: Reports */}
              <button
                onClick={() => navigate('/tools')}
                className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
              >
                <div className="w-6 h-6 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-[#191923] leading-tight">Reports</span>
                <span className="text-[8px] text-gray-400 font-medium">Sales & Orders</span>
              </button>

              {/* Button 7: Printers */}
              <button
                onClick={() => navigate('/printers')}
                className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
              >
                <div className="w-6 h-6 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                  <Printer className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-[#191923] leading-tight">Printers</span>
                <span className="text-[8px] text-gray-400 font-medium">Configure Devices</span>
              </button>

              {/* Button 8: Settings */}
              <button
                onClick={() => navigate('/tools')}
                className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
              >
                <div className="w-6 h-6 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                  <Settings className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-[#191923] leading-tight">Settings</span>
                <span className="text-[8px] text-gray-400 font-medium">System & Outlet</span>
              </button>
            </div>
          </div>

          {/* 2. RECENT ORDERS TABLE CARD (FLEX-1 MIN-H-0 - EXPANDS TO FILL EXACT VERTICAL HEIGHT) */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0 space-y-2 overflow-hidden">
            <div className="flex items-center justify-between shrink-0">
              <h3 className="text-xs font-bold text-[#191923]">Recent Orders</h3>
              <button 
                onClick={() => navigate('/pos')}
                className="text-[11px] font-bold text-[#800D32] hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] font-semibold text-gray-400 border-b border-gray-100 pb-1.5">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Table</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-medium text-[11px]">
                  {/* Row 1: RP031 */}
                  <tr className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2 font-bold text-[#191923]">#RP031</td>
                    <td className="py-2">
                      <span className="flex items-center gap-1 text-[#800D32] font-semibold">
                        <UtensilsCrossed className="w-3 h-3 text-[#800D32]" /> Dine In
                      </span>
                    </td>
                    <td className="py-2 font-bold text-gray-800">T4</td>
                    <td className="py-2 font-bold text-[#191923]">₹960.00</td>
                    <td className="py-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                        Preparing
                      </span>
                    </td>
                    <td className="py-2 text-right text-gray-400 text-[10px]">2 min ago</td>
                  </tr>

                  {/* Row 2: RP030 */}
                  <tr className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2 font-bold text-[#191923]">#RP030</td>
                    <td className="py-2">
                      <span className="flex items-center gap-1 text-[#800D32] font-semibold">
                        <ShoppingBag className="w-3 h-3 text-[#800D32]" /> Takeaway
                      </span>
                    </td>
                    <td className="py-2 text-gray-400 font-bold">—</td>
                    <td className="py-2 font-bold text-[#191923]">₹320.00</td>
                    <td className="py-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                        Ready
                      </span>
                    </td>
                    <td className="py-2 text-right text-gray-400 text-[10px]">5 min ago</td>
                  </tr>

                  {/* Row 3: RP029 */}
                  <tr className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2 font-bold text-[#191923]">#RP029</td>
                    <td className="py-2">
                      <span className="flex items-center gap-1 text-[#800D32] font-semibold">
                        <Bike className="w-3 h-3 text-[#800D32]" /> Delivery
                      </span>
                    </td>
                    <td className="py-2 text-gray-400 font-bold">—</td>
                    <td className="py-2 font-bold text-[#191923]">₹1,240.00</td>
                    <td className="py-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-800">
                        Out for Delivery
                      </span>
                    </td>
                    <td className="py-2 text-right text-gray-400 text-[10px]">8 min ago</td>
                  </tr>

                  {/* Row 4: RP028 */}
                  <tr className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2 font-bold text-[#191923]">#RP028</td>
                    <td className="py-2">
                      <span className="flex items-center gap-1 text-[#800D32] font-semibold">
                        <UtensilsCrossed className="w-3 h-3 text-[#800D32]" /> Dine In
                      </span>
                    </td>
                    <td className="py-2 font-bold text-gray-800">T2</td>
                    <td className="py-2 font-bold text-[#191923]">₹780.00</td>
                    <td className="py-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                    </td>
                    <td className="py-2 text-right text-gray-400 text-[10px]">12 min ago</td>
                  </tr>

                  {/* Row 5: RP027 */}
                  <tr className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2 font-bold text-[#191923]">#RP027</td>
                    <td className="py-2">
                      <span className="flex items-center gap-1 text-[#800D32] font-semibold">
                        <UtensilsCrossed className="w-3 h-3 text-[#800D32]" /> Dine In
                      </span>
                    </td>
                    <td className="py-2 font-bold text-gray-800">T5</td>
                    <td className="py-2 font-bold text-[#191923]">₹1,120.00</td>
                    <td className="py-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                    </td>
                    <td className="py-2 text-right text-gray-400 text-[10px]">18 min ago</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
