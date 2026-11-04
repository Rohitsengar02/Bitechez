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
  Grid2X2,
  Flame,
  Wallet,
  CheckCircle2
} from 'lucide-react';
import bannerBg from '../assets/banner_bg.jpg';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [salesTimeframe, setSalesTimeframe] = React.useState('Today');

  return (
    <div className="space-y-5 pb-6">
      {/* 2-COLUMN TOP DASHBOARD GRID */}
      <div className="grid grid-cols-12 gap-5 items-start">
        
        {/* ========================================================
            LEFT COLUMN (Cols 1-7: ~60% width on desktop)
           ======================================================== */}
        <div className="col-span-12 xl:col-span-7 space-y-4">
          
          {/* 1. HERO BANNER WITH THE EXACT USER UPLOADED BACKGROUND IMAGE */}
          <div className="relative rounded-3xl overflow-hidden border border-gray-100 shadow-sm min-h-[240px] lg:min-h-[265px] flex items-center bg-[#FAF8F9]">
            {/* Background Image: Uploaded media with pink wave on left & 3D chef on right */}
            <img
              src={bannerBg}
              alt="Hero Banner Background"
              className="absolute inset-0 w-full h-full object-cover object-right pointer-events-none select-none"
            />
            
            {/* Left Content Overlay */}
            <div className="relative z-10 p-6 lg:p-7 max-w-[380px] xl:max-w-[420px] flex flex-col justify-between h-full">
              <div>
                <h2 className="text-2xl lg:text-[28px] font-black text-[#191923] tracking-tight flex items-center gap-2">
                  Good Afternoon, Rohit <span className="inline-block text-2xl lg:text-3xl">👋</span>
                </h2>
                <p className="text-xl lg:text-2xl font-black text-[#800D32] mt-0.5 tracking-tight">
                  Welcome to CyberLim POS
                </p>
                <p className="text-xs text-gray-600 font-medium mt-1.5 leading-relaxed">
                  Manage orders, tables, kitchen and more — all in one place.
                </p>
              </div>

              {/* Bottom Stat Strip */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm px-4 py-2.5 inline-flex items-center gap-4 mt-5 self-start">
                {/* Orders Today */}
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

                {/* Sales Today */}
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

                {/* Tables Occupied */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-50 text-[#800D32] flex items-center justify-center">
                    <Grid2X2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-[#191923] leading-none block">18/24</span>
                    <span className="text-[10px] text-gray-500 font-semibold block">Tables Occupied</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. TODAY'S SNAPSHOT (ROW OF 4 STAT CARDS) */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-[#191923]">Today's Snapshot</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Card 1: Total Sales */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 transition-transform hover:scale-[1.01]">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-[#191923] leading-tight">₹24,850</h4>
                  <p className="text-[11px] text-gray-400 font-medium">Total Sales</p>
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                    ↑ +12.5%
                  </span>
                </div>
              </div>

              {/* Card 2: Total Orders */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 transition-transform hover:scale-[1.01]">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-[#191923] leading-tight">128</h4>
                  <p className="text-[11px] text-gray-400 font-medium">Total Orders</p>
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                    ↑ +8.2%
                  </span>
                </div>
              </div>

              {/* Card 3: Occupied Tables */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 transition-transform hover:scale-[1.01]">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-[#191923] leading-tight">18 / 24</h4>
                  <p className="text-[11px] text-gray-400 font-medium">Occupied Tables</p>
                  <span className="text-[11px] font-bold text-amber-600">
                    75%
                  </span>
                </div>
              </div>

              {/* Card 4: Pending KOT */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 transition-transform hover:scale-[1.01]">
                <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-[#191923] leading-tight">6</h4>
                  <p className="text-[11px] text-gray-400 font-medium">Pending KOT</p>
                  <span className="text-[11px] font-bold text-rose-600">
                    2 Preparing
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. CHARTS ROW: SALES OVERVIEW + ORDER TYPES */}
          <div className="grid grid-cols-12 gap-3.5">
            {/* Sales Overview Area Chart (7 Cols) */}
            <div className="col-span-12 md:col-span-7 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-bold text-[#191923]">Sales Overview</h4>
                  <p className="text-[10px] text-gray-400">Peak hour: 8:30 PM (₹7,420)</p>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[10px] font-bold">
                  {['Today', 'Week'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSalesTimeframe(period)}
                      className={`px-2 py-0.5 rounded-md transition-colors ${
                        salesTimeframe === period ? 'bg-white text-[#800D32] shadow-sm' : 'text-gray-500'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* SVG Area Spline Chart */}
              <div className="h-44 w-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 320 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="salesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#800D32" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#800D32" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="30" y1="20" x2="315" y2="20" stroke="#F1F1F4" strokeDasharray="3 3" />
                  <line x1="30" y1="50" x2="315" y2="50" stroke="#F1F1F4" strokeDasharray="3 3" />
                  <line x1="30" y1="80" x2="315" y2="80" stroke="#F1F1F4" strokeDasharray="3 3" />
                  <line x1="30" y1="105" x2="315" y2="105" stroke="#F1F1F4" />

                  {/* Y-Axis Labels */}
                  <text x="5" y="23" fill="#9CA3AF" fontSize="8" fontWeight="600">30K</text>
                  <text x="5" y="53" fill="#9CA3AF" fontSize="8" fontWeight="600">20K</text>
                  <text x="5" y="83" fill="#9CA3AF" fontSize="8" fontWeight="600">10K</text>
                  <text x="18" y="108" fill="#9CA3AF" fontSize="8" fontWeight="600">0</text>

                  {/* Area fill */}
                  <path
                    d="M 35 105 Q 65 95, 80 85 T 125 70 T 170 80 T 215 50 T 260 62 T 310 38 L 310 105 L 35 105 Z"
                    fill="url(#salesGrad)"
                  />

                  {/* Stroke line */}
                  <path
                    d="M 35 105 Q 65 95, 80 85 T 125 70 T 170 80 T 215 50 T 260 62 T 310 38"
                    fill="none"
                    stroke="#D95D80"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Circular Node Points */}
                  {[
                    { cx: 35, cy: 105 },
                    { cx: 80, cy: 85 },
                    { cx: 125, cy: 70 },
                    { cx: 170, cy: 80 },
                    { cx: 215, cy: 50 },
                    { cx: 260, cy: 62 },
                    { cx: 310, cy: 38 },
                  ].map((pt, i) => (
                    <circle key={i} cx={pt.cx} cy={pt.cy} r="3" fill="#FFFFFF" stroke="#800D32" strokeWidth="2" />
                  ))}
                </svg>

                {/* X-Axis Labels */}
                <div className="flex justify-between pl-8 pr-1 text-[8px] font-semibold text-gray-400 mt-1">
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
            <div className="col-span-12 md:col-span-5 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
              <h4 className="text-xs font-bold text-[#191923] mb-2">Order Types</h4>

              <div className="flex items-center justify-between gap-2">
                {/* SVG Donut Ring */}
                <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
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
                    <span className="text-lg font-black text-[#191923] leading-none block">128</span>
                    <span className="text-[10px] text-gray-400 font-semibold block">Orders</span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="space-y-2.5 text-xs font-semibold pr-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#800D32]" />
                      Dine In
                    </span>
                    <span className="font-bold text-[#191923]">52% (₹12,920)</span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D95D80]" />
                      Takeaway
                    </span>
                    <span className="font-bold text-[#191923]">28% (₹6,950)</span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F5C2CE]" />
                      Delivery
                    </span>
                    <span className="font-bold text-[#191923]">20% (₹4,980)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* ========================================================
            RIGHT COLUMN (Cols 8-12: ~40% width on desktop)
           ======================================================== */}
        <div className="col-span-12 xl:col-span-5 space-y-4">
          
          {/* 1. QUICK ACTIONS CARD */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#191923]">Quick Actions</h3>
              <button 
                onClick={() => navigate('/tools')}
                className="text-xs font-bold text-[#800D32] hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2x4 Action Grid */}
            <div className="grid grid-cols-4 gap-2.5">
              {/* Button 1: New Sale (Highlighted in soft pink) */}
              <button
                onClick={() => navigate('/pos')}
                className="bg-[#F9E8ED] hover:bg-[#F3D2DC] border border-[#F3D2DC] rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all group active:scale-95 shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#191923] leading-tight">New Sale</span>
                <span className="text-[9px] text-gray-500 font-medium">Take Order</span>
              </button>

              {/* Button 2: Add Item */}
              <button
                onClick={() => navigate('/menu')}
                className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
              >
                <div className="w-8 h-8 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#191923] leading-tight">Add Item</span>
                <span className="text-[9px] text-gray-400 font-medium">Menu & Price</span>
              </button>

              {/* Button 3: Add Table */}
              <button
                onClick={() => navigate('/tables')}
                className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
              >
                <div className="w-8 h-8 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                  <Grid2X2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#191923] leading-tight">Add Table</span>
                <span className="text-[9px] text-gray-400 font-medium">Manage Tables</span>
              </button>

              {/* Button 4: KOT */}
              <button
                onClick={() => navigate('/kitchen')}
                className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
              >
                <div className="w-8 h-8 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                  <ChefHat className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#191923] leading-tight">KOT</span>
                <span className="text-[9px] text-gray-400 font-medium">Kitchen Orders</span>
              </button>

              {/* Button 5: Customers */}
              <button
                onClick={() => navigate('/customers')}
                className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
              >
                <div className="w-8 h-8 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#191923] leading-tight">Customers</span>
                <span className="text-[9px] text-gray-400 font-medium">Manage Customers</span>
              </button>

              {/* Button 6: Reports */}
              <button
                onClick={() => navigate('/tools')}
                className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
              >
                <div className="w-8 h-8 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#191923] leading-tight">Reports</span>
                <span className="text-[9px] text-gray-400 font-medium">Sales & Orders</span>
              </button>

              {/* Button 7: Printers */}
              <button
                onClick={() => navigate('/printers')}
                className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
              >
                <div className="w-8 h-8 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                  <Printer className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#191923] leading-tight">Printers</span>
                <span className="text-[9px] text-gray-400 font-medium">Configure Devices</span>
              </button>

              {/* Button 8: Settings */}
              <button
                onClick={() => navigate('/tools')}
                className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all group active:scale-95"
              >
                <div className="w-8 h-8 rounded-lg text-[#800D32] flex items-center justify-center mb-1">
                  <Settings className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#191923] leading-tight">Settings</span>
                <span className="text-[9px] text-gray-400 font-medium">System & Outlet</span>
              </button>
            </div>
          </div>

          {/* 2. RECENT ORDERS TABLE CARD */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#191923]">Recent Orders</h3>
              <button 
                onClick={() => navigate('/pos')}
                className="text-xs font-bold text-[#800D32] hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[11px] font-semibold text-gray-400 border-b border-gray-100 pb-2">
                    <th className="pb-2.5 font-medium">#</th>
                    <th className="pb-2.5 font-medium">Type</th>
                    <th className="pb-2.5 font-medium">Table</th>
                    <th className="pb-2.5 font-medium">Amount</th>
                    <th className="pb-2.5 font-medium">Status</th>
                    <th className="pb-2.5 font-medium text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-medium">
                  {/* Row 1: RP031 */}
                  <tr className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2.5 font-bold text-[#191923]">#RP031</td>
                    <td className="py-2.5">
                      <span className="flex items-center gap-1 text-[#800D32] font-semibold">
                        <UtensilsCrossed className="w-3 h-3 text-[#800D32]" /> Dine In
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-gray-800">T4</td>
                    <td className="py-2.5 font-bold text-[#191923]">₹960.00</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Preparing
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-gray-400 text-[10px]">2 min ago</td>
                  </tr>

                  {/* Row 2: RP030 */}
                  <tr className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2.5 font-bold text-[#191923]">#RP030</td>
                    <td className="py-2.5">
                      <span className="flex items-center gap-1 text-[#800D32] font-semibold">
                        <ShoppingBag className="w-3 h-3 text-[#800D32]" /> Takeaway
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-400 font-bold">—</td>
                    <td className="py-2.5 font-bold text-[#191923]">₹320.00</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Ready
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-gray-400 text-[10px]">5 min ago</td>
                  </tr>

                  {/* Row 3: RP029 */}
                  <tr className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2.5 font-bold text-[#191923]">#RP029</td>
                    <td className="py-2.5">
                      <span className="flex items-center gap-1 text-[#800D32] font-semibold">
                        <Bike className="w-3 h-3 text-[#800D32]" /> Delivery
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-400 font-bold">—</td>
                    <td className="py-2.5 font-bold text-[#191923]">₹1,240.00</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        Out for Delivery
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-gray-400 text-[10px]">8 min ago</td>
                  </tr>

                  {/* Row 4: RP028 */}
                  <tr className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2.5 font-bold text-[#191923]">#RP028</td>
                    <td className="py-2.5">
                      <span className="flex items-center gap-1 text-[#800D32] font-semibold">
                        <UtensilsCrossed className="w-3 h-3 text-[#800D32]" /> Dine In
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-gray-800">T2</td>
                    <td className="py-2.5 font-bold text-[#191923]">₹780.00</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-gray-400 text-[10px]">12 min ago</td>
                  </tr>

                  {/* Row 5: RP027 */}
                  <tr className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2.5 font-bold text-[#191923]">#RP027</td>
                    <td className="py-2.5">
                      <span className="flex items-center gap-1 text-[#800D32] font-semibold">
                        <UtensilsCrossed className="w-3 h-3 text-[#800D32]" /> Dine In
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-gray-800">T5</td>
                    <td className="py-2.5 font-bold text-[#191923]">₹1,120.00</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-gray-400 text-[10px]">18 min ago</td>
                  </tr>

                  {/* Row 6: RP026 */}
                  <tr className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2.5 font-bold text-[#191923]">#RP026</td>
                    <td className="py-2.5">
                      <span className="flex items-center gap-1 text-[#800D32] font-semibold">
                        <ShoppingBag className="w-3 h-3 text-[#800D32]" /> Takeaway
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-400 font-bold">—</td>
                    <td className="py-2.5 font-bold text-[#191923]">₹480.00</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-gray-400 text-[10px]">25 min ago</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>


      {/* ========================================================
          FULL-WIDTH LOWER SECTION (ELIMINATES BOTTOM GAP BEAUTIFULLY!)
          3 Interactive Enterprise Operational Widgets
         ======================================================== */}
      <div className="grid grid-cols-12 gap-5 pt-1">
        
        {/* WIDGET 1: TOP SELLING DISHES & MENU PERFORMANCE (Cols 1-4) */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#191923] flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#800D32]" />
                <span>Today's Bestsellers</span>
              </h3>
              <p className="text-[11px] text-gray-400">Top revenue generating menu items</p>
            </div>
            <span className="text-[10px] font-bold bg-rose-50 text-[#800D32] px-2 py-0.5 rounded-full">
              Live Ranking
            </span>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Paneer Butter Masala Royal', orders: 48, revenue: '₹15,360', isVeg: true, share: 85 },
              { name: 'Butter Chicken Delhi Special', orders: 42, revenue: '₹16,380', isVeg: false, share: 74 },
              { name: 'Hyderabadi Dum Biryani', orders: 36, revenue: '₹12,960', isVeg: false, share: 62 },
              { name: 'Butter Garlic Naan', orders: 94, revenue: '₹8,460', isVeg: true, share: 95 },
            ].map((dish, idx) => (
              <div key={dish.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800 truncate max-w-[200px]">
                    <span className="text-[10px] text-gray-400 font-mono">#{idx + 1}</span>
                    <span className={`w-2.5 h-2.5 rounded-sm border text-[7px] flex items-center justify-center font-bold ${
                      dish.isVeg ? 'border-emerald-600 text-emerald-600' : 'border-rose-600 text-rose-600'
                    }`}>●</span>
                    <span className="truncate">{dish.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#800D32]">{dish.revenue}</span>
                    <span className="text-[10px] text-gray-400 ml-1.5">({dish.orders} sold)</span>
                  </div>
                </div>
                {/* Mini progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-[#800D32] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${dish.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WIDGET 2: LIVE KITCHEN STATIONS & DISPATCH LOAD (Cols 5-8) */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#191923] flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-[#800D32]" />
                <span>Kitchen Display (KDS) Stations</span>
              </h3>
              <p className="text-[11px] text-gray-400">Station ticket load & preparation speed</p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> All Online
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { station: 'Main Kitchen', active: 4, avgTime: '14 min', status: 'Optimal', badge: 'bg-emerald-50 text-emerald-700' },
              { station: 'Tandoor & Breads', active: 3, avgTime: '9 min', status: 'Moderate', badge: 'bg-amber-50 text-amber-700' },
              { station: 'Bar & Mocktails', active: 1, avgTime: '4 min', status: 'Low Load', badge: 'bg-blue-50 text-blue-700' },
              { station: 'Dessert Counter', active: 2, avgTime: '6 min', status: 'Low Load', badge: 'bg-blue-50 text-blue-700' },
            ].map((st) => (
              <div key={st.station} className="bg-[#FAF8F9] p-3 rounded-xl border border-gray-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#191923] truncate">{st.station}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${st.badge}`}>
                    {st.status}
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-base font-black text-[#800D32] leading-none">{st.active}</span>
                    <span className="text-[10px] text-gray-400 ml-1">KOTs</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">Avg {st.avgTime}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between text-xs text-[#800D32] font-semibold">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Station Rebalance Ready
            </span>
            <button 
              onClick={() => navigate('/kitchen')}
              className="text-[10px] font-black underline hover:text-[#600821]"
            >
              Open KDS Fullscreen →
            </button>
          </div>
        </div>

        {/* WIDGET 3: SHIFT CASH REGISTER & PAYMENT MIX (Cols 9-12) */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#191923] flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-[#800D32]" />
                <span>Shift Register & Payment Mix</span>
              </h3>
              <p className="text-[11px] text-gray-400">Cashier: Rohit Sengar • Shift #1042</p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Balanced
            </span>
          </div>

          {/* Payment Method Progress Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700">
              <span>UPI / QR (58%)</span>
              <span className="text-[#800D32]">₹14,413.00</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex">
              <div className="bg-[#800D32] h-full" style={{ width: '58%' }} />
              <div className="bg-[#D95D80] h-full" style={{ width: '28%' }} />
              <div className="bg-[#F5C2CE] h-full" style={{ width: '14%' }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium pt-0.5">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#D95D80]" /> Cash: ₹6,958 (28%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F5C2CE]" /> Card: ₹3,479 (14%)
              </span>
            </div>
          </div>

          {/* Drawer Reconciliation Strip */}
          <div className="bg-[#FAF8F9] rounded-xl p-3 border border-gray-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Opening Float:</span>
              <span className="font-bold text-gray-800">₹5,000.00</span>
            </div>
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Cash In Drawer:</span>
              <span className="font-bold text-emerald-700">₹11,958.00</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-gray-200 text-[#800D32] font-black">
              <span>Reconciled Discrepancy:</span>
              <span>₹0.00 (Exact)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
