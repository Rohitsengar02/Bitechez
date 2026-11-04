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
  ConciergeBell,
  BellRing,
  UserRound,
  Settings,
  LifeBuoy,
  LogOut,
  Check,
  CornerDownLeft,
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
  const iconBtn = 'relative w-10 h-10 rounded-xl flex items-center justify-center text-white/90 hover:bg-white/10 transition-colors';

  return (
    <div ref={rootRef} className="flex flex-col h-[100dvh] w-full bg-[#FAF8F9] text-[#191923] overflow-hidden">
      {/* ================= HEADER ================= */}
      <header ref={headerRef} className="h-[68px] shrink-0 z-40 bg-gradient-to-r from-[#5E0721] via-[#6E0A28] to-[#5E0721] px-3 sm:px-5 flex items-center gap-3 sm:gap-5 shadow-md">
        {/* Logo */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 shrink-0" aria-label="CyberLim POS home">
          <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center bg-white/10">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
            CyberLim <span className="font-extrabold">POS</span>
          </span>
        </button>

        <span className="hidden lg:block w-px h-8 bg-white/20" />

        {/* Outlet switcher */}
        <div ref={outletPop.ref} className="relative shrink-0">
          <button onClick={() => outletPop.setOpen((o) => !o)} className="flex items-center gap-3 rounded-2xl pl-1 pr-2 py-1 hover:bg-white/5 transition-colors" aria-haspopup="menu" aria-expanded={outletPop.open}>
            <span className="w-11 h-11 rounded-xl bg-[#8E1A3D] flex items-center justify-center text-white">
              <Store className="w-5 h-5" />
            </span>
            <span className="hidden sm:block text-left">
              <span className="block text-[15px] font-bold text-white leading-tight">{outlet.name}</span>
              <span className="block text-xs text-rose-200/90 font-medium leading-tight">{outlet.branch}</span>
            </span>
            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <ChevronDown className={`w-4 h-4 text-white transition-transform ${outletPop.open ? 'rotate-180' : ''}`} />
            </span>
          </button>
          {outletPop.open && (
            <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50">
              <p className="px-2.5 pt-1 pb-2 text-[10px] font-black uppercase tracking-wider text-gray-400">Outlets</p>
              <div className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl bg-[#FFF5F8]">
                <Store className="w-5 h-5 text-[#800D32]" />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-black truncate">{outlet.name}</span>
                  <span className="block text-xs text-gray-500 truncate">{outlet.branch}</span>
                </span>
                <Check className="w-4 h-4 text-[#800D32]" />
              </div>
              <button onClick={() => (outletPop.setOpen(false), navigate('/tools'))} className="w-full mt-1 px-2.5 py-2 rounded-xl text-left text-xs font-bold text-[#800D32] hover:bg-gray-50">
                Edit outlet info
              </button>
            </div>
          )}
        </div>

        {/* Search */}
        <div ref={searchPop.ref} className="relative flex-1 min-w-0 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 h-11 rounded-2xl bg-white/10 border border-white/10 px-4 focus-within:bg-white/15 focus-within:border-white/30 transition-colors">
            <Search className="w-5 h-5 text-white/90 shrink-0" />
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
              placeholder="Search orders, tables, customers, items..."
              className="flex-1 min-w-0 bg-transparent text-[15px] text-white placeholder-white/80 outline-none"
              aria-label="Search"
            />
            <span className="hidden sm:flex items-center gap-1 shrink-0">
              <kbd className="px-2 py-0.5 rounded-md bg-white/15 text-xs font-bold text-white">Ctrl</kbd>
              <kbd className="px-2 py-0.5 rounded-md bg-white/15 text-xs font-bold text-white">K</kbd>
            </span>
          </div>
          {searchPop.open && (
            <div className="absolute left-0 right-0 top-full mt-2 max-h-[60dvh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50">
              {hits.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm font-semibold text-gray-500">No matches for “{query}”</p>
              ) : (
                hits.map((h, i) => (
                  <React.Fragment key={h.id}>
                    {(i === 0 || hits[i - 1].group !== h.group) && <p className="px-2.5 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider text-gray-400">{h.group}</p>}
                    <button
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(h)}
                      className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left ${i === active ? 'bg-[#FFF0F4]' : ''}`}
                    >
                      <span className="w-8 h-8 rounded-lg bg-[#FDEBF1] text-[#800D32] flex items-center justify-center shrink-0">
                        <h.icon className="w-4 h-4" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-bold text-[#191923] truncate">{h.title}</span>
                        {h.sub && <span className="block text-xs text-gray-500 truncate">{h.sub}</span>}
                      </span>
                      {i === active && <CornerDownLeft className="w-4 h-4 text-gray-400" />}
                    </button>
                  </React.Fragment>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <span className={iconBtn} title={online ? 'Online' : 'Offline — changes are saved on this device'} aria-label={online ? 'Online' : 'Offline'}>
            {online ? <Wifi className="w-6 h-6 text-[#4ADE80]" strokeWidth={2.5} /> : <WifiOff className="w-6 h-6 text-rose-300" strokeWidth={2.5} />}
          </span>

          {/* Notifications */}
          <div ref={bellPop.ref} className="relative">
            <button
              onClick={() => {
                bellPop.setOpen((o) => !o);
                const latest = notes[0]?.at ?? new Date().toISOString();
                setSeenAt(latest);
                localStorage.setItem('layout.notifSeen', latest);
              }}
              className={iconBtn}
              aria-label={`Notifications${unread ? ` (${unread} new)` : ''}`}
            >
              <Bell className="w-6 h-6" />
              {notes.length > 0 && (
                <span className={`absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center ring-2 ring-[#6E0A28] ${unread ? 'bg-[#FF3B5C] text-white' : 'bg-white/30 text-white'}`}>
                  {notes.length > 9 ? '9+' : notes.length}
                </span>
              )}
            </button>
            {bellPop.open && (
              <div className="absolute right-0 top-full mt-2 w-80 max-h-[60dvh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50">
                <p className="px-2.5 pt-1 pb-2 text-sm font-black text-[#191923]">Notifications</p>
                {notes.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm font-semibold text-gray-500">You're all caught up</p>
                ) : (
                  notes.slice(0, 12).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => (bellPop.setOpen(false), navigate(n.kind === 'request' ? '/requests' : '/kitchen'))}
                      className="w-full flex items-start gap-3 px-2.5 py-2.5 rounded-xl text-left hover:bg-gray-50"
                    >
                      <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.kind === 'request' ? 'bg-rose-50 text-[#800D32]' : 'bg-emerald-50 text-emerald-600'}`}>
                        {n.kind === 'request' ? <ConciergeBell className="w-4 h-4" /> : <BellRing className="w-4 h-4" />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-bold text-[#191923] truncate">{n.title}</span>
                        <span className="block text-xs text-gray-500">{n.sub}</span>
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap">{new Date(n.at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <button onClick={toggleFull} className={`${iconBtn} hidden sm:flex`} aria-label={full ? 'Exit full screen' : 'Full screen'} title={full ? 'Exit full screen' : 'Full screen'}>
            {full ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
          </button>

          <span className="hidden lg:block w-px h-8 bg-white/20 mx-1" />

          {/* User */}
          <div ref={userPop.ref} className="relative">
            <button onClick={() => userPop.setOpen((o) => !o)} className="flex items-center gap-2.5 rounded-2xl pl-1 pr-2 py-1 hover:bg-white/5" aria-haspopup="menu" aria-expanded={userPop.open}>
              <span className="w-11 h-11 rounded-full ring-2 ring-white/80 overflow-hidden bg-white flex items-center justify-center">
                {avatarUrl ? <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" /> : <span className="text-sm font-black text-[#800D32]">{initials(userName)}</span>}
              </span>
              <span className="hidden lg:block text-left">
                <span className="block text-[15px] font-bold text-white leading-tight">{userName}</span>
                <span className="block text-xs text-rose-200/90 font-medium leading-tight">{userRole}</span>
              </span>
              <ChevronDown className={`w-5 h-5 text-white transition-transform ${userPop.open ? 'rotate-180' : ''}`} />
            </button>
            {userPop.open && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50">
                <div className="px-2.5 py-2 border-b border-gray-100 mb-1">
                  <p className="text-sm font-black text-[#191923]">{userName}</p>
                  <p className="text-xs text-gray-500">{userRole}</p>
                </div>
                {[
                  { l: 'Customers', I: UserRound, on: () => navigate('/customers') },
                  { l: 'POS Settings', I: Settings, on: () => navigate('/printers') },
                  { l: 'Help & Support', I: LifeBuoy, on: () => navigate('/tools') },
                ].map((m) => (
                  <button key={m.l} onClick={() => (userPop.setOpen(false), m.on())} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-[#FFF5F8] hover:text-[#800D32]">
                    <m.I className="w-4 h-4" /> {m.l}
                  </button>
                ))}
                {onLogout && (
                  <button onClick={() => (userPop.setOpen(false), onLogout())} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 mt-1 border-t border-gray-100 pt-2.5">
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================= NAV TABS ================= */}
      <div ref={navRef} className="shrink-0 bg-white border-b border-gray-200/70 shadow-[0_1px_2px_rgba(16,24,40,0.04)] px-2 sm:px-4 py-1.5">
        <nav className="flex items-center justify-between gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Main">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                end={tab.end}
                className={({ isActive }) =>
                  `shrink-0 flex items-center gap-2 px-4 xl:px-7 py-2.5 rounded-xl text-sm xl:text-[15px] font-bold whitespace-nowrap transition-colors ${isActive ? 'bg-gradient-to-b from-[#8E1239] to-[#6E0A28] text-white shadow-md shadow-[#800D32]/25' : 'text-[#191923] hover:bg-[#FFF5F8] hover:text-[#800D32]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-[#800D32]'}`} />
                    <span>{tab.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* ================= CONTENT ================= */}
      <main className="flex-1 min-h-0 overflow-y-auto px-2 sm:px-3 py-2.5 bg-[#FAF8F9] flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;