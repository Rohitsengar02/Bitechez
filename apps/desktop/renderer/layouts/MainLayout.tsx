import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Grid2X2, 
  ChefHat, 
  BellRing, 
  Users, 
  BookOpen, 
  Printer, 
  Layers, 
  WifiOff, 
  Wifi, 
  PlusCircle,
  HardDrive
} from 'lucide-react';
import { useSyncStore } from '../stores/syncStore';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/pos', label: 'POS Billing', icon: UtensilsCrossed },
  { path: '/tables', label: 'Tables', icon: Grid2X2 },
  { path: '/kitchen', label: 'Kitchen KOT', icon: ChefHat },
  { path: '/requests', label: 'Requests', icon: BellRing },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/menu', label: 'Item Menu', icon: BookOpen },
  { path: '/printers', label: 'Printers', icon: Printer },
  { path: '/tools', label: 'More Tools', icon: Layers },
];

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const { isOnline } = useSyncStore();
  const [time, setTime] = React.useState(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen w-screen bg-[#FAF8F9] overflow-hidden select-none">
      {/* Persistent Left Sidebar Navigation */}
      <aside className="w-64 bg-[#800D32] text-white flex flex-col justify-between shadow-xl z-20">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-[#600821] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FAF8F9] text-[#800D32] flex items-center justify-center font-black text-lg shadow-sm">
                  B
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white leading-none">Bitechez</h1>
                  <span className="text-[10px] font-semibold text-rose-200 tracking-wider uppercase">Restaurant POS</span>
                </div>
              </div>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#600821] text-rose-200 font-mono">v1.0</span>
          </div>

          {/* Quick Action Button */}
          <div className="p-3">
            <button
              onClick={() => navigate('/pos')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white text-[#800D32] hover:bg-[#F9E8ED] rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Order</span>
            </button>
          </div>

          {/* Main Navigation Links */}
          <nav className="px-3 py-2 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#600821] text-white shadow-inner font-semibold translate-x-1'
                        : 'text-rose-100 hover:bg-[#A31542]/50 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Station & Hardware Info */}
        <div className="p-4 border-t border-[#600821] bg-[#600821]/40 space-y-2">
          {/* System Operating Status */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-rose-200 font-medium">
              <HardDrive className="w-3.5 h-3.5" />
              <span>SQLite Terminal</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#800D32] text-rose-100 text-[10px] font-medium border border-rose-900">
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span>Cloud Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span>Local First</span>
                </>
              )}
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] text-rose-300 font-mono">
            <span>Terminal: T-CASH-01</span>
            <span>{time}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Operational Bar */}
        <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Outlet</span>
            <span className="text-sm font-bold text-[#191923]">Bitechez Bistro & Bar – Mumbai Flagship</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Open Shift
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-[#191923]">Cashier: Rohit Verma</p>
              <p className="text-[11px] text-gray-500">Shift #1042 • 8 Orders Active</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#F9E8ED] text-[#800D32] flex items-center justify-center font-bold text-xs border border-[#F3D2DC]">
              RV
            </div>
          </div>
        </header>

        {/* Dynamic Page Router Outlet */}
        <main className="flex-1 overflow-auto bg-[#FAF8F9] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
