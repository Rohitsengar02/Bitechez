import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Monitor, 
  Grid2X2, 
  ChefHat, 
  Bell, 
  Users, 
  UtensilsCrossed, 
  Printer, 
  LayoutGrid, 
  Search, 
  Store, 
  ChevronDown,
  Wifi
} from 'lucide-react';

const NAV_TABS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/pos', label: 'POS', icon: Monitor },
  { path: '/tables', label: 'Tables', icon: Grid2X2 },
  { path: '/kitchen', label: 'Kitchen KOT', icon: ChefHat },
  { path: '/requests', label: 'Requests', icon: Bell },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/menu', label: 'Item Menu', icon: UtensilsCrossed },
  { path: '/printers', label: 'Printers', icon: Printer },
  { path: '/tools', label: 'More Tools', icon: LayoutGrid },
];

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <div className="flex flex-col h-screen w-screen bg-[#FAF8F9] text-[#191923] overflow-hidden select-none">
      {/* 1. TOP DARK MAROON HEADER BAR */}
      <header className="h-16 bg-[#600821] px-6 flex items-center justify-between shrink-0 z-30 shadow-sm">
        {/* Left: Brand Logo & Outlet Pill */}
        <div className="flex items-center gap-5">
          {/* Hexagonal Logo + Name */}
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-white text-[#600821] flex items-center justify-center font-black shadow-md transition-transform group-hover:scale-105">
              <svg className="w-5 h-5 text-[#800D32]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 3.2L18.5 8v8L12 19.8 5.5 16V8L12 5.2zM9 10a3 3 0 100 4h5a1 1 0 100-2H9a1 1 0 110-2h5a1 1 0 100-2H9z" />
              </svg>
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-extrabold tracking-tight text-white">CyberLim</span>
              <span className="text-xs font-black text-rose-300 ml-1 tracking-wider uppercase">POS</span>
            </div>
          </div>

          {/* Outlet Switcher Pill */}
          <button className="bg-[#480518] hover:bg-[#3D0414] border border-rose-900/60 rounded-2xl px-3.5 py-1.5 flex items-center gap-3 transition-colors text-left shadow-inner">
            <div className="w-6 h-6 rounded-lg bg-rose-200/20 flex items-center justify-center text-rose-200">
              <Store className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">Resto Daddy</p>
              <p className="text-[10px] text-rose-300/80 font-medium leading-none">Main Outlet</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-rose-300 ml-1" />
          </button>
        </div>

        {/* Center: Search Box */}
        <div className="flex items-center justify-center flex-1 max-w-xl mx-8">
          <div className="w-full bg-[#480518] border border-rose-900/60 rounded-2xl px-4 py-2 flex items-center justify-between text-xs text-rose-200 shadow-inner focus-within:border-rose-400 focus-within:ring-1 focus-within:ring-rose-400/50 transition-all">
            <div className="flex items-center gap-2.5 flex-1 mr-3">
              <Search className="w-4 h-4 text-rose-300 shrink-0" />
              <input
                type="text"
                placeholder="Search orders, tables, items, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white placeholder-rose-300/60 text-xs outline-none w-full font-medium"
              />
            </div>
            <kbd className="bg-[#380412] px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold text-rose-300 border border-rose-950 shrink-0">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* Right: Wifi, Notifications & User Profile */}
        <div className="flex items-center gap-4">
          {/* Online Wifi Status Indicator */}
          <div className="w-8 h-8 rounded-xl bg-[#480518] flex items-center justify-center text-emerald-400">
            <Wifi className="w-4 h-4" />
          </div>

          {/* Notification Bell */}
          <button className="relative w-8 h-8 rounded-xl bg-[#480518] hover:bg-[#3D0414] border border-rose-900/60 flex items-center justify-center text-rose-200 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#600821]" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 cursor-pointer pl-1">
            <div className="w-8 h-8 rounded-full ring-2 ring-rose-400/50 overflow-hidden bg-rose-100 flex items-center justify-center shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Rohit Sengar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-xs font-black text-[#800D32]">RS</span>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white leading-tight">Rohit Sengar</p>
              <p className="text-[10px] text-rose-300/80 font-medium leading-none">Owner</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-rose-300 ml-0.5" />
          </div>
        </div>
      </header>

      {/* 2. SECOND HORIZONTAL NAVIGATION TABS BAR */}
      <div className="bg-[#FAF8F9] px-6 py-2.5 shrink-0 border-b border-gray-200/60">
        <nav className="flex items-center gap-3 overflow-x-auto scrollbar-none">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
                    isActive
                      ? 'bg-[#800D32] text-white shadow-md shadow-[#800D32]/20 translate-y-[-1px]'
                      : 'bg-white text-gray-700 hover:text-[#800D32] hover:bg-white/80 border border-gray-200/70 hover:border-rose-200'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 overflow-y-auto px-6 py-3.5 bg-[#FAF8F9]">
        <Outlet />
      </main>
    </div>
  );
};
