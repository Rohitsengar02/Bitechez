import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBasket,
  Monitor,
  ChefHat,
  Bell,
  Users,
  UtensilsCrossed,
  Printer,
  LayoutGrid,
  Search,
  Store,
  ChevronDown,
  Wifi,
  WifiOff,
  Maximize,
  Minimize,
  UserRound,
  Settings,
  LogOut,
  Check,
  Receipt,
  Armchair,
} from 'lucide-react';

/* =====================================================================
   CONFIG
   ===================================================================== */
const TableIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 6h18v3H3z" />
    <path d="M6 9v11M18 9v11" />
  </svg>
);

const NAV_TABS: { path: string; label: string; icon: React.ElementType; end?: boolean }[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/pos', label: 'POS', icon: Monitor },
  { path: '/tables', label: 'Tables', icon: TableIcon },
  { path: '/kitchen', label: 'Kitchen KOT', icon: ChefHat },
  { path: '/requests', label: 'Requests', icon: Bell },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/menu', label: 'Item Menu', icon: UtensilsCrossed },
  { path: '/printers', label: 'Printers', icon: Printer },
  { path: '/tools', label: 'More Tools', icon: LayoutGrid },
  { path: '/orders', label: 'Orders', icon: ShoppingBasket },
];

interface MainLayoutProps {
  userName?: string;
  userRole?: string;
  avatarUrl?: string;
  onLogout?: () => void;
}

/* =====================================================================
   HELPERS
   ===================================================================== */
const readJSON = <T,>(key: string, fallback: T): T => {
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
};
const initials = (n: string) =>
  n
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');

/** Close a popover on outside click / Escape. */
function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
}

type SearchHit = { id: string; group: string; title: string; sub?: string; to: string; icon: React.ElementType };

/* =====================================================================
   LAYOUT
   ===================================================================== */
export const MainLayout: React.FC<MainLayoutProps> = ({ userName = 'Rohit Sengar', userRole = 'Owner', avatarUrl, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  /* ---------- page height for full-screen pages (POS, Tables, KOT…) ---------- */
  useEffect(() => {
    const set = () => {
      const h = (headerRef.current?.offsetHeight ?? 0) + (navRef.current?.offsetHeight ?? 0) + 20; // + main padding
      rootRef.current?.style.setProperty('--pos-offset', `${h}px`);
    };
    set();
    const ro = new ResizeObserver(set);
    headerRef.current && ro.observe(headerRef.current);
    navRef.current && ro.observe(navRef.current);
    return () => ro.disconnect();
  }, []);

  /* ---------- outlet ---------- */
  const [outlet, setOutlet] = useState(() => ({ name: 'Resto Daddy', branch: 'Main Outlet', ...readJSON<{ name?: string; branch?: string }>('outlet.info', {}) }));

  /* ---------- network + fullscreen ---------- */
  const [online, setOnline] = useState(navigator.onLine);
  const [full, setFull] = useState(!!document.fullscreenElement);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    const fs = () => setFull(!!document.fullscreenElement);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    document.addEventListener('fullscreenchange', fs);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
      document.removeEventListener('fullscreenchange', fs);
    };
  }, []);
  const toggleFull = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.())?.catch?.(() => undefined);

  /* ---------- notifications (service requests + ready KOTs) ---------- */
  const [notes, setNotes] = useState<{ id: string; kind: 'request' | 'kot'; title: string; sub: string; at: string }[]>([]);
  const [seenAt, setSeenAt] = useState(() => localStorage.getItem('layout.notifSeen') ?? '');
  const refresh = useCallback(() => {
    const reqs = readJSON<{ id: string; tableName: string; type: string; status: string; createdAt: string }[]>('service.requests', []).filter((r) => r.status === 'pending');
    const kots = readJSON<{ id: string; kotNumber: number; tableName?: string; orderType: string; status: string; readyAt?: string; createdAt: string }[]>('pos.kotQueue', []).filter((k) => k.status === 'ready');
    const label: Record<string, string> = { call_waiter: 'Call Waiter', water: 'Water', cutlery: 'Cutlery', bill: 'Bill Request', assistance: 'Assistance', other: 'Request' };
    setNotes(
      [
        ...reqs.map((r) => ({ id: r.id, kind: 'request' as const, title: `Table ${r.tableName} · ${label[r.type] ?? 'Request'}`, sub: 'Service request pending', at: r.createdAt })),
        ...kots.map((k) => ({
          id: k.id,
          kind: 'kot' as const,
          title: `KOT #${String(k.kotNumber).padStart(3, '0')} ready`,
          sub: k.tableName ? `Table ${k.tableName} · serve now` : 'Ready for pickup',
          at: k.readyAt ?? k.createdAt,
        })),
      ].sort((a, b) => b.at.localeCompare(a.at))
    );
    setOutlet((o) => ({ ...o, ...readJSON<{ name?: string; branch?: string }>('outlet.info', {}) }));
  }, []);
  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => (!e.key || /^(service\.|pos\.kotQueue|outlet\.)/.test(e.key)) && refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener('service-requests-changed', refresh);
    const t = setInterval(refresh, 10_000);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('service-requests-changed', refresh);
      clearInterval(t);
    };
  }, [refresh]);
  useEffect(refresh, [location.pathname, refresh]);
  const unread = notes.filter((n) => n.at > seenAt).length;

  /* ---------- popovers ---------- */
  const outletPop = usePopover();
  const bellPop = usePopover();
  const userPop = usePopover();
  const searchPop = usePopover();

  /* ---------- global search ---------- */
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        searchPop.setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchPop]);

  const hits: SearchHit[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!searchPop.open) return [];
    const pages: SearchHit[] = NAV_TABS.map((t) => ({ id: `p-${t.path}`, group: 'Pages', title: t.label, to: t.path, icon: t.icon }));
    if (!q) return pages;
    const qd = q.replace(/\D/g, '');
    const out: SearchHit[] = pages.filter((p) => p.title.toLowerCase().includes(q));

    const recent = readJSON<{ id: string; orderNumber: string; tableName?: string; orderType: string; grandTotalPaise: number; customer?: { name?: string; phone?: string } }[]>('pos.recent', []);
    const held = readJSON<{ id: string; orderNumber: string; tableName?: string; orderType: string; totalPaise: number; customer?: { name?: string; phone?: string } }[]>('pos.held', []);
    const orderMatch = (o: { orderNumber: string; tableName?: string; customer?: { name?: string; phone?: string } }) =>
      [o.orderNumber, o.orderNumber.replace(/^BTZ-/, 'RP'), o.tableName ?? '', o.customer?.name ?? ''].some((x) => x.toLowerCase().includes(q.replace('#', ''))) ||
      (qd.length >= 3 && (o.customer?.phone ?? '').replace(/\D/g, '').includes(qd));
    [...held.map((o) => ({ ...o, running: true, total: o.totalPaise })), ...recent.map((o) => ({ ...o, running: false, total: o.grandTotalPaise }))]
      .filter(orderMatch)
      .slice(0, 6)
      .forEach((o) =>
        out.push({
          id: `o-${o.id}`,
          group: 'Orders',
          title: `#${o.orderNumber.replace(/^BTZ-/, 'RP')}${o.tableName ? ` · Table ${o.tableName}` : ''}`,
          sub: `${o.running ? 'Running' : 'Completed'} · ₹${(o.total / 100).toLocaleString('en-IN')}${o.customer?.name ? ` · ${o.customer.name}` : ''}`,
          to: '/orders',
          icon: Receipt,
        })
      );

    const tables = new Set<string>();
    held.forEach((h) => h.tableName && tables.add(h.tableName));
    [...tables]
      .filter((t) => t.toLowerCase().includes(q) || `table ${t}`.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((t) => out.push({ id: `t-${t}`, group: 'Tables', title: `Table ${t}`, sub: 'Occupied', to: '/tables', icon: Armchair }));

    const customers = new Map<string, { name: string; phone: string }>();
    readJSON<{ name: string; phone: string }[]>('customers.db', []).forEach((c) => customers.set(c.phone.replace(/\D/g, '').slice(-10), c));
    recent.forEach((o) => {
      const k = (o.customer?.phone ?? '').replace(/\D/g, '').slice(-10);
      if (k.length === 10 && !customers.has(k)) customers.set(k, { name: o.customer?.name || 'Guest', phone: k });
    });
    [...customers.values()]
      .filter((c) => c.name.toLowerCase().includes(q) || (qd.length >= 3 && c.phone.replace(/\D/g, '').includes(qd)))
      .slice(0, 5)
      .forEach((c) => out.push({ id: `c-${c.phone}`, group: 'Customers', title: c.name, sub: c.phone, to: '/customers', icon: UserRound }));

    return out;
  }, [query, searchPop.open]);

  useEffect(() => setActive(0), [query]);
  const go = (h?: SearchHit) => {
    if (!h) return;
    navigate(h.to);
    setQuery('');
    searchPop.setOpen(false);
    inputRef.current?.blur();
  };

  /* ---------- render ---------- */
  const isDashboard = location.pathname === '/' || location.pathname === '';
  const isPos = location.pathname.startsWith('/pos');
  const showEmeraldHeader = isDashboard;

  return (
    <div ref={rootRef} className={`flex flex-col h-[100dvh] w-full text-[#191923] overflow-hidden ${showEmeraldHeader ? 'bg-[#F4F7F6]' : 'bg-[#FAF8F9]'}`}>
      {/* ================= HEADER (Clean White & Emerald style) ================= */}
      {showEmeraldHeader && (
        <header ref={headerRef} className="h-14 shrink-0 z-40 bg-white border-b border-emerald-100/80 px-4 sm:px-6 flex items-center justify-between shadow-[0_2px_12px_rgba(16,185,129,0.04)]">
          {/* Logo & Outlet */}
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 shrink-0 group" aria-label="CyberLim POS home">
              <div className="w-8 h-8 rounded-xl bg-[#00C060] flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Check className="w-5 h-5" strokeWidth={3.2} />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-[#162720] flex items-center gap-1.5">
                CyberLim <span className="bg-[#E7F9F0] text-[#00B859] px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider uppercase">POS</span>
              </span>
            </button>

            <span className="hidden lg:block w-px h-5 bg-gray-200" />

            {/* Outlet */}
            <div ref={outletPop.ref} className="relative hidden sm:block shrink-0">
              <button onClick={() => outletPop.setOpen((o) => !o)} className="flex items-center gap-2.5 rounded-xl px-2 py-1 hover:bg-emerald-50/60 transition-colors" aria-haspopup="menu" aria-expanded={outletPop.open}>
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#00B859] flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </span>
                <span className="text-left">
                  <span className="block text-xs font-bold text-[#162720] leading-tight">{outlet.name}</span>
                  <span className="block text-[10px] text-gray-400 font-semibold leading-tight">{outlet.branch}</span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${outletPop.open ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Search Bar - Soft Pill */}
          <div ref={searchPop.ref} className="relative flex-1 min-w-0 max-w-md mx-4">
            <div className="flex items-center gap-2 h-9 rounded-full bg-[#F4F7F6] border border-gray-200/60 px-4 focus-within:bg-white focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition-all">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => (setQuery(e.target.value), searchPop.setOpen(true))}
                onFocus={() => searchPop.setOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') (e.preventDefault(), setActive((a) => Math.min(a + 1, hits.length - 1)));
                  if (e.key === 'ArrowUp') (e.preventDefault(), setActive((a) => Math.max(a - 1, 0)));
                  if (e.key === 'Enter') go(hits[active]);
                }}
                placeholder="Search orders, items, customers..."
                className="flex-1 min-w-0 bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-none"
                aria-label="Search"
              />
              <span className="hidden sm:flex items-center gap-1 shrink-0">
                <kbd className="px-1.5 py-0.5 rounded bg-white shadow-sm border border-gray-200 text-[9px] font-bold text-gray-500">Ctrl</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white shadow-sm border border-gray-200 text-[9px] font-bold text-gray-500">K</kbd>
              </span>
            </div>
            {searchPop.open && (
              <div className="absolute left-0 right-0 top-full mt-2 max-h-[60dvh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50">
                {hits.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm font-semibold text-gray-500">No matches for “{query}”</p>
                ) : (
                  hits.map((h, i) => (
                    <button
                      key={h.id}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(h)}
                      className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left ${i === active ? 'bg-[#F4F7F6]' : ''}`}
                    >
                      <span className="w-8 h-8 rounded-lg bg-emerald-50 text-[#00C060] flex items-center justify-center shrink-0">
                        <h.icon className="w-4 h-4" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-bold text-[#191923] truncate">{h.title}</span>
                        {h.sub && <span className="block text-xs text-gray-500 truncate">{h.sub}</span>}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="relative w-8 h-8 rounded-full flex items-center justify-center text-gray-500" title={online ? 'Online' : 'Offline'}>
              {online ? <Wifi className="w-4 h-4 text-[#00C060]" /> : <WifiOff className="w-4 h-4 text-rose-500" />}
            </span>

            <div ref={bellPop.ref} className="relative">
              <button
                onClick={() => {
                  bellPop.setOpen((o) => !o);
                  const latest = notes[0]?.at ?? new Date().toISOString();
                  setSeenAt(latest);
                  localStorage.setItem('layout.notifSeen', latest);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors relative"
                aria-label={`Notifications${unread ? ` (${unread} new)` : ''}`}
              >
                <Bell className="w-4 h-4" />
                {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />}
              </button>
              {bellPop.open && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50">
                  <p className="px-2.5 py-1 text-xs font-black text-gray-800">Notifications</p>
                  {notes.length === 0 ? (
                    <p className="px-2.5 py-4 text-center text-xs text-gray-400">All caught up</p>
                  ) : (
                    notes.slice(0, 5).map((n) => (
                      <div key={n.id} className="p-2 text-xs border-b border-gray-50 last:border-0">
                        <p className="font-bold text-gray-800 truncate">{n.title}</p>
                        <p className="text-[10px] text-gray-400">{n.sub}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <button onClick={toggleFull} className="w-8 h-8 rounded-full hidden sm:flex items-center justify-center text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors" title="Full screen">
              {full ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            <span className="w-px h-5 bg-gray-200 mx-1" />

            {/* User */}
            <div ref={userPop.ref} className="relative">
              <button onClick={() => userPop.setOpen((o) => !o)} className="flex items-center gap-2.5 pl-1" aria-haspopup="menu">
                <div className="w-8 h-8 rounded-full ring-2 ring-emerald-500/20 overflow-hidden bg-emerald-100 flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-black text-emerald-700">{initials(userName)}</span>
                  )}
                </div>
                <div className="hidden lg:block text-left leading-none">
                  <span className="block text-xs font-bold text-[#162720]">{userName}</span>
                  <span className="block text-[10px] text-gray-400 font-semibold mt-0.5">{userRole}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
              {userPop.open && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 z-50">
                  <button onClick={() => (userPop.setOpen(false), navigate('/customers'))} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700">
                    <UserRound className="w-3.5 h-3.5" /> Customers
                  </button>
                  <button onClick={() => (userPop.setOpen(false), navigate('/printers'))} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700">
                    <Settings className="w-3.5 h-3.5" /> Settings
                  </button>
                  {onLogout && (
                    <button onClick={() => (userPop.setOpen(false), onLogout())} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border-t border-gray-100 mt-1">
                      <LogOut className="w-3.5 h-3.5" /> Log out
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* ================= NAV TABS ================= */}
      <div ref={navRef} className="shrink-0 border-b px-2 sm:px-6 py-2 bg-white border-slate-100 shadow-xs">
        <nav className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Main">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                end={tab.end}
                className={({ isActive }) =>
                  `shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#00C060] text-white shadow-md shadow-emerald-500/25 scale-[1.02]'
                      : 'text-slate-600 hover:bg-emerald-50/60 hover:text-[#00C060]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-[#00C060]'}`} />
                    <span>{tab.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* ================= CONTENT ================= */}
      <main className={`flex-1 min-h-0 flex flex-col ${isDashboard ? 'bg-[#F4F7F6] overflow-y-auto px-4 sm:px-6 py-4' : isPos ? 'bg-[#F4F7F6] p-3 overflow-hidden' : 'bg-[#FAF8F9] overflow-y-auto px-2 sm:px-3 py-2.5'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;