import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Search,
  ConciergeBell,
  ClipboardList,
  CalendarDays,
  Users,
  Bell,
  Package,
  Box,
  ShoppingCart,
  Truck,
  RefreshCw,
  BarChart3,
  PieChart,
  TrendingUp,
  Table2,
  UserCog,
  Database,
  Wallet,
  FileText,
  Receipt,
  HandCoins,
  Gift,
  Star,
  BadgePercent,
  Megaphone,
  Settings,
  Store,
  SlidersHorizontal,
  ShieldCheck,
  Zap,
  Printer,
  Download,
  Upload,
  CloudUpload,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  Phone,
  BadgeCheck,
  PencilLine,
  Headset,
  ArrowRight,
  ChevronRight,
  X,
  Mail,
  Globe,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { formatINR } from '@bitechez/business-logic';
import { apiService } from '../services/api';
import { buildBillPdf, buildInvoicePdf, outputPdf, OUTLET_INFO, type BillDoc } from '../utils/posPdf';

/* =====================================================================
   CONFIG — flip `ready: true` (and set `to`) as each tool page is built
   ===================================================================== */
const PAGE_OFFSET = '9.75rem';
const OUTLET_KEY = 'outlet.info';
const BACKUP_PREFIXES = ['pos.', 'tables.', 'menu.', 'customers.', 'service.', 'printers.', 'kot.', 'outlet.'];
const SUPPORT = { phone: '+91 95996 76325', whatsapp: '919599676325', email: 'contact@cyberlim.com', site: 'https://cyberlim.com' };

type ToolAction = 'reprint' | 'reports';
interface Tool {
  title: string;
  desc: string;
  icon: React.ElementType;
  to?: string;
  action?: ToolAction;
  ready?: boolean;
}
interface Section {
  title: string;
  desc: string;
  icon: React.ElementType;
  iconCls: string;
  bg: string;
  tools: Tool[];
}

const SECTIONS: Section[] = [
  {
    title: 'Operations',
    desc: 'Manage daily restaurant operations',
    icon: ConciergeBell,
    iconCls: 'text-[#C0163F]',
    bg: 'from-[#FFF0F4]',
    tools: [
      { title: 'Orders', desc: 'View & manage all orders (live, completed, delivery)', icon: ClipboardList, to: '/orders', ready: true },
      { title: 'Reservations', desc: 'Table bookings & guest details', icon: CalendarDays, to: '/tables', ready: true },
      { title: 'Queue Management', desc: 'Manage waiting list', icon: Users, to: '/tools/queue' },
      { title: 'Announcements', desc: 'Broadcast to staff & kitchen', icon: Bell, to: '/tools/announcements' },
    ],
  },
  {
    title: 'Inventory & Stock',
    desc: 'Track ingredients, stock and suppliers',
    icon: Package,
    iconCls: 'text-orange-500',
    bg: 'from-[#FFF5EA]',
    tools: [
      { title: 'Stock Management', desc: 'Ingredients & item stock', icon: Box, to: '/menu', ready: true },
      { title: 'Purchase Orders', desc: 'Create & manage POs', icon: ShoppingCart, to: '/tools/purchase-orders' },
      { title: 'Suppliers', desc: 'Manage vendor details', icon: Truck, to: '/tools/suppliers' },
      { title: 'Stock Transfer', desc: 'Move stock between outlets', icon: RefreshCw, to: '/tools/stock-transfer' },
    ],
  },
  {
    title: 'Reports & Analytics',
    desc: 'Get detailed insights and business reports',
    icon: BarChart3,
    iconCls: 'text-indigo-600',
    bg: 'from-[#F1F2FF]',
    tools: [
      { title: 'Sales Reports', desc: 'Daily, weekly & monthly', icon: PieChart, action: 'reports', ready: true },
      { title: 'Item Performance', desc: 'Best & least selling items', icon: TrendingUp, action: 'reports', ready: true },
      { title: 'Table Reports', desc: 'Table-wise sales & usage', icon: Table2, to: '/tools/table-reports' },
      { title: 'Staff Reports', desc: 'Staff activity & performance', icon: UserCog, to: '/tools/staff-reports' },
    ],
  },
  {
    title: 'Finance & Billing',
    desc: 'Manage payments, taxes and financials',
    icon: Database,
    iconCls: 'text-emerald-600',
    bg: 'from-[#EFFBF3]',
    tools: [
      { title: 'Payments', desc: 'Track all transactions', icon: Wallet, action: 'reports', ready: true },
      { title: 'GST & Tax', desc: 'Configure tax & GST', icon: FileText, to: '/tools/gst' },
      { title: 'Invoices', desc: 'Generate & manage invoices', icon: Receipt, action: 'reprint', ready: true },
      { title: 'Refunds', desc: 'Process customer refunds', icon: HandCoins, to: '/tools/refunds' },
    ],
  },
  {
    title: 'Marketing & Loyalty',
    desc: 'Grow your business and retain customers',
    icon: Gift,
    iconCls: 'text-orange-500',
    bg: 'from-[#FFF6EC]',
    tools: [
      { title: 'Loyalty Program', desc: 'Points, tiers & rewards', icon: Star, to: '/customers', ready: true },
      { title: 'Offers & Discounts', desc: 'Create & manage offers', icon: BadgePercent, to: '/tools/offers' },
      { title: 'Campaigns', desc: 'SMS, Email & WhatsApp', icon: Megaphone, to: '/tools/campaigns' },
      { title: 'Gift Cards', desc: 'Create & manage gift cards', icon: Gift, to: '/tools/gift-cards' },
    ],
  },
  {
    title: 'Settings & Admin',
    desc: 'System configuration and user management',
    icon: Settings,
    iconCls: 'text-indigo-700',
    bg: 'from-[#F0F4FF]',
    tools: [
      { title: 'User Management', desc: 'Add & manage staff', icon: Users, to: '/tools/users' },
      { title: 'Outlets', desc: 'Manage branches/outlets', icon: Store, to: '/tools/outlets' },
      { title: 'POS Settings', desc: 'Billing, KOT, taxes & more', icon: SlidersHorizontal, to: '/printers', ready: true },
      { title: 'Role & Permissions', desc: 'Control access & security', icon: ShieldCheck, to: '/tools/roles' },
    ],
  },
];

/* =====================================================================
   TYPES + HELPERS
   ===================================================================== */
type RecentOrder = BillDoc & { id: string };
interface OutletInfo {
  name: string;
  branch: string;
  address: string;
  phone: string;
  gstin: string;
}

const readJSON = <T,>(key: string, fallback: T): T => {
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
};
const csvEscape = (v: unknown) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const downloadFile = (name: string, text: string, type: string) => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const rs = (p: number) => (p / 100).toFixed(2);
const fmtDT = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
const TYPE_LABEL: Record<string, string> = { dine_in: 'Dine In', takeaway: 'Takeaway', delivery: 'Delivery' };

/* =====================================================================
   SMALL UI
   ===================================================================== */
const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; subtitle?: string; width?: string; children: React.ReactNode }> = ({ open, onClose, title, subtitle, width = 'max-w-md', children }) =>
  open ? (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/40" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white w-full ${width} max-h-[92dvh] flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl`}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-black text-[#191923] truncate">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  ) : null;

const field = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#191923] focus:outline-none focus:ring-2 focus:ring-[#800D32]/30';

/* =====================================================================
   PAGE
   ===================================================================== */
export const MoreToolsPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<null | 'reprint' | 'reports' | 'import' | 'outlet' | 'help'>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [outlet, setOutlet] = useState<OutletInfo>(() => ({
    name: OUTLET_INFO.name,
    branch: OUTLET_INFO.branch,
    address: OUTLET_INFO.address,
    phone: OUTLET_INFO.phone,
    gstin: OUTLET_INFO.gstin,
    ...readJSON<Partial<OutletInfo>>(OUTLET_KEY, {}),
  }));
  const searchRef = useRef<HTMLInputElement>(null);

  const notify = (type: 'success' | 'error', text: string) => setToast({ type, text });
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !/input|textarea|select/i.test((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ---------- system status ---------- */
  const [db, setDb] = useState<'checking' | 'ok' | 'error'>('checking');
  const [online, setOnline] = useState(navigator.onLine);
  const checkDb = useCallback(() => {
    setDb('checking');
    apiService
      .getCategories()
      .then(() => setDb('ok'))
      .catch(() => setDb('error'));
  }, []);
  useEffect(() => {
    checkDb();
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, [checkDb]);
  const printers = useMemo(() => readJSON<{ enabled: boolean; connection: string }[]>('printers.list', []), []);
  const activePrinters = printers.filter((p) => p.enabled);
  const statusRows: { label: string; ok: boolean | null; value: string }[] = [
    { label: 'POS System', ok: true, value: 'Running' },
    { label: 'Database', ok: db === 'checking' ? null : db === 'ok', value: db === 'checking' ? 'Checking…' : db === 'ok' ? 'Connected' : 'Not reachable' },
    { label: `Printers (${activePrinters.length}/${printers.length})`, ok: activePrinters.length > 0, value: activePrinters.length ? 'Configured' : 'None active' },
    { label: 'Network', ok: online, value: online ? 'Online' : 'Offline' },
  ];
  const allGood = statusRows.every((r) => r.ok !== false);

  /* ---------- tools ---------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS.map((s) => ({ ...s, tools: s.tools.filter((t) => `${t.title} ${t.desc} ${s.title}`.toLowerCase().includes(q)) })).filter((s) => s.tools.length);
  }, [query]);

  const openTool = (t: Tool) => {
    if (!t.ready) return notify('error', `${t.title} is coming soon`);
    if (t.action) setModal(t.action);
    else if (t.to) navigate(t.to);
  };

  /* ---------- backup / restore ---------- */
  const backup = () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (BACKUP_PREFIXES.some((p) => k.startsWith(p))) data[k] = localStorage.getItem(k)!;
    }
    const payload = { app: 'cyberlim-pos', version: 1, outlet: outlet.name, createdAt: new Date().toISOString(), data };
    downloadFile(`cyberlim-backup-${ymd(new Date())}.json`, JSON.stringify(payload), 'application/json');
    notify('success', `Backup saved (${Object.keys(data).length} data sets)`);
  };

  const restore = async (file: File, mode: 'merge' | 'replace') => {
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed?.app !== 'cyberlim-pos' || typeof parsed.data !== 'object') throw new Error('bad');
      const keys = Object.keys(parsed.data).filter((k) => BACKUP_PREFIXES.some((p) => k.startsWith(p)));
      if (mode === 'replace') {
        const existing: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)!;
          if (BACKUP_PREFIXES.some((p) => k.startsWith(p))) existing.push(k);
        }
        existing.forEach((k) => localStorage.removeItem(k));
      }
      keys.forEach((k) => localStorage.setItem(k, parsed.data[k]));
      setModal(null);
      notify('success', `Restored ${keys.length} data sets — reloading…`);
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      notify('error', 'Not a valid CyberLim backup file');
    }
  };

  const saveOutlet = (o: OutletInfo) => {
    setOutlet(o);
    localStorage.setItem(OUTLET_KEY, JSON.stringify(o));
    setModal(null);
    notify('success', 'Outlet info saved');
  };

  /* ---------- render ---------- */
  const quick = [
    { l: 'Reprint Bill', I: Printer, on: () => setModal('reprint') },
    { l: 'Download Reports', I: Download, on: () => setModal('reports') },
    { l: 'Import Data', I: Database, on: () => setModal('import') },
    { l: 'Backup Now', I: CloudUpload, on: backup },
  ];

  return (
    <div className="flex flex-col gap-3 overflow-hidden" style={{ height: `calc(100dvh - var(--pos-offset, ${PAGE_OFFSET}))` }}>
      {toast && (
        <div className={`fixed top-5 right-5 z-[80] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border ${toast.type === 'success' ? 'bg-[#800D32] text-white border-rose-400' : 'bg-white text-rose-700 border-rose-200'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
          {toast.text}
        </div>
      )}

      <div className="flex-1 min-h-0 flex gap-4">
        {/* ===== Main ===== */}
        <div className="flex-1 min-w-0 min-h-0 overflow-y-auto pr-1">
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <div className="flex items-center gap-3 mr-auto">
              <LayoutGrid className="w-12 h-12 text-[#800D32]" strokeWidth={1.7} />
              <div>
                <h1 className="text-2xl font-black text-[#191923] leading-tight">More Tools</h1>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">All advanced tools to manage your restaurant operations in one place</p>
              </div>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tools...  ( / )" className={`${field} pl-11 py-3 font-medium`} />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-label="Clear search">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm font-bold text-gray-500">No tools match “{query}”.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-2">
              {filtered.map((s) => (
                <section key={s.title} className={`rounded-2xl border border-gray-100 bg-gradient-to-b ${s.bg} to-white p-3.5`}>
                  <div className="flex items-start gap-3 px-1 pb-3">
                    <s.icon className={`w-10 h-10 ${s.iconCls}`} strokeWidth={1.7} />
                    <div>
                      <h2 className="text-lg font-black text-[#191923] leading-tight">{s.title}</h2>
                      <p className="text-xs font-semibold text-gray-500">{s.desc}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {s.tools.map((t) => (
                      <button
                        key={t.title}
                        onClick={() => openTool(t)}
                        className={`relative bg-white rounded-xl border border-gray-100 shadow-sm px-2.5 pt-4 pb-3 flex flex-col items-center text-center gap-1 transition-colors ${t.ready ? 'hover:border-[#F3C3D2] hover:bg-[#FFF8FA]' : 'opacity-70 cursor-default'
                          }`}
                      >
                        {t.ready ? (
                          <ChevronRight className="w-4 h-4 text-gray-400 absolute top-2.5 right-2" />
                        ) : (
                          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-gray-100 text-gray-500">Soon</span>
                        )}
                        <t.icon className={`w-7 h-7 ${s.iconCls}`} strokeWidth={1.8} />
                        <span className="text-sm font-black text-[#191923] leading-tight">{t.title}</span>
                        <span className="text-[11px] font-medium text-gray-500 leading-snug">{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        {/* ===== Right column ===== */}
        <aside className="hidden lg:flex w-[320px] xl:w-[360px] shrink-0 min-h-0 flex-col gap-3 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="flex items-center gap-2 text-lg font-black text-[#191923] mb-3">
              <Zap className="w-5 h-5 text-[#C0163F]" /> Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {quick.map((q) => (
                <button key={q.l} onClick={q.on} className="flex flex-col items-center gap-1.5 py-4 rounded-xl border border-gray-100 shadow-sm text-sm font-bold text-[#191923] hover:border-[#F3C3D2] hover:bg-[#FFF8FA]">
                  <q.I className="w-6 h-6 text-[#C0163F]" />
                  {q.l}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-[#C0163F]" />
              <h3 className="flex-1 text-lg font-black text-[#191923]">System Status</h3>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${allGood ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>{allGood ? 'All Good' : 'Check'}</span>
            </div>
            <ul className="space-y-2.5">
              {statusRows.map((r) => (
                <li key={r.label} className="flex items-center gap-2 text-sm">
                  {r.ok === null ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : r.ok ? <CheckCircle2 className="w-4 h-4 text-white fill-emerald-500" /> : <XCircle className="w-4 h-4 text-white fill-rose-500" />}
                  <span className="flex-1 font-semibold text-[#191923]">{r.label}</span>
                  <span className={`font-bold ${r.ok === false ? 'text-rose-600' : r.ok ? 'text-emerald-600' : 'text-gray-400'}`}>{r.value}</span>
                </li>
              ))}
            </ul>
            {db === 'error' && (
              <button onClick={checkDb} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#800D32]">
                <RefreshCw className="w-3.5 h-3.5" /> Retry database
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Store className="w-5 h-5 text-[#C0163F]" />
              <h3 className="flex-1 text-lg font-black text-[#191923]">Outlet Info</h3>
              <button onClick={() => setModal('outlet')} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-[#C0163F]">
                <PencilLine className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
            <div className="flex gap-3">
              <span className="w-14 h-14 rounded-xl bg-[#FFF0F4] flex items-center justify-center shrink-0">
                <Store className="w-7 h-7 text-[#C0163F]" />
              </span>
              <div className="min-w-0 space-y-1.5 text-sm">
                <p className="font-black text-[#191923]">
                  {outlet.name} – {outlet.branch}
                </p>
                <p className="flex items-start gap-1.5 font-semibold text-gray-700">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" /> {outlet.address}
                </p>
                <p className="flex items-center gap-1.5 font-semibold text-gray-700">
                  <Phone className="w-4 h-4" /> {outlet.phone}
                </p>
                <p className="flex items-center gap-1.5 font-semibold text-gray-700">
                  <BadgeCheck className="w-4 h-4" /> GSTIN: {outlet.gstin}
                </p>
              </div>
            </div>
          </div>

          <button onClick={() => setModal('help')} className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#800D32] to-[#A3164A] text-white p-4 text-left shadow-md">
            <span className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <Headset className="w-6 h-6" />
            </span>
            <span className="flex-1">
              <span className="block text-lg font-black">Need Help?</span>
              <span className="block text-xs text-rose-100">Get support, tutorials and setup guides.</span>
            </span>
            <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </aside>
      </div>

      {/* Mobile quick actions */}
      <div className="lg:hidden grid grid-cols-4 gap-2">
        {[...quick, { l: 'Help', I: Headset, on: () => setModal('help') }].slice(0, 4).map((q) => (
          <button key={q.l} onClick={q.on} className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-white border border-gray-100 text-[11px] font-bold">
            <q.I className="w-5 h-5 text-[#C0163F]" />
            {q.l}
          </button>
        ))}
      </div>

      {/* ===== Modals ===== */}
      <Modal open={modal === 'reprint'} onClose={() => setModal(null)} title="Reprint Bill / Invoice" subtitle="Settled orders on this terminal" width="max-w-2xl">
        <ReprintPanel onError={(m) => notify('error', m)} />
      </Modal>
      <Modal open={modal === 'reports'} onClose={() => setModal(null)} title="Download Reports" subtitle="CSV files open in Excel / Google Sheets">
        <ReportsPanel onDone={(m) => notify('success', m)} onError={(m) => notify('error', m)} />
      </Modal>
      <Modal open={modal === 'import'} onClose={() => setModal(null)} title="Import Data" subtitle="Restore from a CyberLim backup file">
        <ImportPanel onRestore={restore} />
      </Modal>
      <Modal open={modal === 'outlet'} onClose={() => setModal(null)} title="Edit Outlet Info">
        <OutletForm value={outlet} onSave={saveOutlet} />
      </Modal>
      <Modal open={modal === 'help'} onClose={() => setModal(null)} title="CyberLim Support" subtitle="We usually reply within a few hours">
        <div className="space-y-2">
          {[
            { I: Phone, l: 'Call support', v: SUPPORT.phone, href: `tel:${SUPPORT.phone.replace(/\s/g, '')}` },
            { I: MessageCircle, l: 'WhatsApp', v: 'Chat with us', href: `https://wa.me/${SUPPORT.whatsapp}?text=${encodeURIComponent(`Hi, I need help with CyberLim POS (${outlet.name} – ${outlet.branch}).`)}` },
            { I: Mail, l: 'Email', v: SUPPORT.email, href: `mailto:${SUPPORT.email}?subject=${encodeURIComponent(`POS support – ${outlet.name}`)}` },
            { I: Globe, l: 'Website', v: SUPPORT.site.replace('https://', ''), href: SUPPORT.site },
          ].map((c) => (
            <a key={c.l} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:border-[#F3C3D2] hover:bg-[#FFF8FA]">
              <span className="w-10 h-10 rounded-xl bg-[#FFF0F4] flex items-center justify-center">
                <c.I className="w-5 h-5 text-[#C0163F]" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-black text-[#191923]">{c.l}</span>
                <span className="block text-xs font-semibold text-gray-500">{c.v}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </a>
          ))}
        </div>
      </Modal>
    </div>
  );
};

/* =====================================================================
   PANELS
   ===================================================================== */
const ReprintPanel = ({ onError }: { onError: (m: string) => void }) => {
  const orders = useMemo(() => readJSON<RecentOrder[]>('pos.recent', []), []);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return orders.filter((o) => !s || [o.orderNumber, o.tableName ?? '', o.customer?.name ?? '', o.customer?.phone ?? ''].some((x) => x.toLowerCase().includes(s))).slice(0, 60);
  }, [orders, q]);
  const run = async (o: RecentOrder, kind: 'bill' | 'invoice', mode: 'print' | 'download') => {
    setBusy(`${o.id}-${kind}-${mode}`);
    try {
      const doc = kind === 'bill' ? await buildBillPdf(o) : await buildInvoicePdf(o);
      outputPdf(doc, `${kind === 'bill' ? 'Bill' : 'Invoice'}-${o.orderNumber}.pdf`, mode);
    } catch {
      onError('Could not generate PDF');
    } finally {
      setBusy(null);
    }
  };
  if (!orders.length) return <p className="py-10 text-center text-sm font-bold text-gray-500">No settled orders yet.</p>;
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order no, table, customer or phone" className={`${field} pl-9`} />
      </div>
      <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100">
        {list.map((o) => (
          <li key={o.id} className="flex items-center gap-3 px-3 py-2.5 flex-wrap">
            <span className="flex-1 min-w-[160px]">
              <span className="block text-sm font-black text-[#191923]">{o.orderNumber}</span>
              <span className="block text-xs font-semibold text-gray-500">
                {fmtDT(o.createdAt)} · {TYPE_LABEL[o.orderType]}
                {o.tableName ? ` · ${o.tableName}` : ''}
                {o.customer?.name ? ` · ${o.customer.name}` : ''}
              </span>
            </span>
            <span className="text-sm font-black">{formatINR(o.grandTotalPaise)}</span>
            <div className="flex gap-1.5">
              <button disabled={!!busy} onClick={() => run(o, 'bill', 'print')} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#800D32] text-white text-xs font-bold disabled:opacity-50">
                <Printer className="w-3.5 h-3.5" /> Bill
              </button>
              <button disabled={!!busy} onClick={() => run(o, 'bill', 'download')} className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold disabled:opacity-50" aria-label="Download bill">
                <Download className="w-3.5 h-3.5" />
              </button>
              <button disabled={!!busy} onClick={() => run(o, 'invoice', 'download')} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold disabled:opacity-50">
                <FileText className="w-3.5 h-3.5" /> Invoice
              </button>
            </div>
          </li>
        ))}
      </ul>
      {list.length === 60 && <p className="text-[11px] text-gray-400">Showing latest 60 — search to find older orders.</p>}
    </div>
  );
};

const ReportsPanel = ({ onDone, onError }: { onDone: (m: string) => void; onError: (m: string) => void }) => {
  const today = new Date();
  const [range, setRange] = useState<'today' | 'yesterday' | '7' | '30' | 'custom'>('today');
  const [from, setFrom] = useState(ymd(today));
  const [to, setTo] = useState(ymd(today));

  const bounds = (): [number, number] => {
    const d0 = new Date();
    d0.setHours(0, 0, 0, 0);
    const day = 864e5;
    if (range === 'today') return [d0.getTime(), d0.getTime() + day];
    if (range === 'yesterday') return [d0.getTime() - day, d0.getTime()];
    if (range === '7') return [d0.getTime() - 6 * day, d0.getTime() + day];
    if (range === '30') return [d0.getTime() - 29 * day, d0.getTime() + day];
    return [new Date(`${from}T00:00:00`).getTime(), new Date(`${to}T00:00:00`).getTime() + day];
  };

  const orders = () => {
    const [a, b] = bounds();
    return readJSON<RecentOrder[]>('pos.recent', []).filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= a && t < b;
    });
  };
  const tag = () => (range === 'custom' ? `${from}_to_${to}` : range === '7' || range === '30' ? `last-${range}-days` : range);

  const sales = () => {
    const list = orders();
    if (!list.length) return onError('No orders in this period');
    const sum = (f: (o: RecentOrder) => number) => list.reduce((x, o) => x + f(o), 0);
    const byMethod: Record<string, number> = {};
    const byType: Record<string, number> = {};
    list.forEach((o) => {
      (o.payments ?? []).forEach((p) => (byMethod[p.method] = (byMethod[p.method] ?? 0) + p.amountPaise));
      byType[o.orderType] = (byType[o.orderType] ?? 0) + o.grandTotalPaise;
    });
    const rows: unknown[][] = [
      ['SALES SUMMARY', tag()],
      ['Orders', list.length],
      ['Gross (subtotal)', rs(sum((o) => o.subtotalPaise))],
      ['Discounts', rs(sum((o) => o.discountPaise))],
      ['CGST', rs(sum((o) => o.cgstPaise))],
      ['SGST', rs(sum((o) => o.sgstPaise))],
      ['Round off', rs(sum((o) => o.roundingPaise))],
      ['Net sales', rs(sum((o) => o.grandTotalPaise))],
      ['Average order', rs(sum((o) => o.grandTotalPaise) / list.length)],
      [],
      ['PAYMENT METHOD', 'Amount'],
      ...Object.entries(byMethod).map(([k, v]) => [k.toUpperCase(), rs(v)]),
      [],
      ['ORDER TYPE', 'Amount'],
      ...Object.entries(byType).map(([k, v]) => [TYPE_LABEL[k] ?? k, rs(v)]),
      [],
      ['Order #', 'Date', 'Type', 'Table', 'Customer', 'Phone', 'Items', 'Subtotal', 'Discount', 'GST', 'Total', 'Payment'],
      ...list.map((o) => [
        o.orderNumber,
        fmtDT(o.createdAt),
        TYPE_LABEL[o.orderType],
        o.tableName ?? '',
        o.customer?.name ?? '',
        o.customer?.phone ?? '',
        o.lines.reduce((x, l) => x + l.qty, 0),
        rs(o.subtotalPaise),
        rs(o.discountPaise),
        rs(o.totalGstPaise),
        rs(o.grandTotalPaise),
        (o.payments ?? []).map((p) => p.method.toUpperCase()).join(' + '),
      ]),
    ];
    downloadFile(`sales-report-${tag()}.csv`, '﻿' + rows.map((r) => r.map(csvEscape).join(',')).join('\n'), 'text/csv;charset=utf-8');
    onDone(`Sales report downloaded (${list.length} orders)`);
  };

  const items = () => {
    const list = orders();
    if (!list.length) return onError('No orders in this period');
    const m: Record<string, { qty: number; gross: number; orders: number }> = {};
    list.forEach((o) =>
      o.lines.forEach((l) => {
        const r = (m[l.name] ||= { qty: 0, gross: 0, orders: 0 });
        r.qty += l.qty;
        r.gross += l.unitPaise * l.qty;
        r.orders += 1;
      })
    );
    const rows: unknown[][] = [['Rank', 'Item', 'Qty Sold', 'Orders', 'Gross Sales'], ...Object.entries(m)
      .sort((a, b) => b[1].qty - a[1].qty)
      .map(([name, r], i) => [i + 1, name, r.qty, r.orders, rs(r.gross)])];
    downloadFile(`item-performance-${tag()}.csv`, '﻿' + rows.map((r) => r.map(csvEscape).join(',')).join('\n'), 'text/csv;charset=utf-8');
    onDone(`Item report downloaded (${Object.keys(m).length} items)`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ['today', 'Today'],
            ['yesterday', 'Yesterday'],
            ['7', 'Last 7 days'],
            ['30', 'Last 30 days'],
            ['custom', 'Custom'],
          ] as const
        ).map(([k, l]) => (
          <button key={k} onClick={() => setRange(k)} className={`px-3 py-2 rounded-lg border text-xs font-bold ${range === k ? 'bg-[#800D32] text-white border-[#800D32]' : 'border-gray-200'}`}>
            {l}
          </button>
        ))}
      </div>
      {range === 'custom' && (
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={field} />
          <input type="date" value={to} min={from} max={ymd(today)} onChange={(e) => setTo(e.target.value)} className={field} />
        </div>
      )}
      <button onClick={sales} className="w-full flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left hover:border-[#F3C3D2]">
        <PieChart className="w-6 h-6 text-[#C0163F]" />
        <span className="flex-1">
          <span className="block text-sm font-black">Sales & Payments report</span>
          <span className="block text-xs text-gray-500">Totals, GST, discounts, payment & order-type split, every order</span>
        </span>
        <Download className="w-4 h-4 text-gray-500" />
      </button>
      <button onClick={items} className="w-full flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left hover:border-[#F3C3D2]">
        <TrendingUp className="w-6 h-6 text-[#C0163F]" />
        <span className="flex-1">
          <span className="block text-sm font-black">Item performance report</span>
          <span className="block text-xs text-gray-500">Best to least selling items with quantity and sales</span>
        </span>
        <Download className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
};

const ImportPanel = ({ onRestore }: { onRestore: (f: File, mode: 'merge' | 'replace') => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-3">
      <input ref={ref} type="file" accept=".json,application/json" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <button onClick={() => ref.current?.click()} className="w-full flex flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 py-6 hover:border-[#F3C3D2]">
        <Upload className="w-7 h-7 text-[#C0163F]" />
        <span className="text-sm font-black text-[#191923]">{file ? file.name : 'Choose backup file (.json)'}</span>
        <span className="text-xs text-gray-500">Created with “Backup Now”</span>
      </button>
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ['merge', 'Merge', 'Keep data not in the file'],
            ['replace', 'Replace all', 'Clear current data first'],
          ] as const
        ).map(([k, l, d]) => (
          <button key={k} onClick={() => setMode(k)} className={`rounded-xl border p-3 text-left ${mode === k ? 'border-[#800D32] bg-[#FFF5F8]' : 'border-gray-200'}`}>
            <span className="block text-sm font-black">{l}</span>
            <span className="block text-[11px] text-gray-500">{d}</span>
          </button>
        ))}
      </div>
      {mode === 'replace' && <p className="text-xs font-bold text-rose-600">Replace removes all current orders, customers and settings on this device. Take a backup first.</p>}
      <button disabled={!file} onClick={() => file && onRestore(file, mode)} className="w-full py-3 rounded-xl bg-[#800D32] text-white text-sm font-black disabled:opacity-50">
        Restore backup
      </button>
    </div>
  );
};

const OutletForm = ({ value, onSave }: { value: OutletInfo; onSave: (o: OutletInfo) => void }) => {
  const [o, setO] = useState(value);
  const [err, setErr] = useState('');
  const submit = () => {
    if (!o.name.trim() || !o.branch.trim()) return setErr('Name and branch are required');
    if (o.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/.test(o.gstin.trim().toUpperCase())) return setErr('GSTIN format looks wrong (15 characters, e.g. 09ABCDE1234F1Z5)');
    onSave({ ...o, gstin: o.gstin.trim().toUpperCase() });
  };
  return (
    <div className="space-y-3">
      {(
        [
          ['name', 'Restaurant name'],
          ['branch', 'Branch / outlet'],
          ['address', 'Address'],
          ['phone', 'Phone'],
          ['gstin', 'GSTIN'],
        ] as const
      ).map(([k, l]) => (
        <label key={k} className="block">
          <span className="block text-xs font-bold text-gray-600 mb-1">{l}</span>
          <input value={o[k]} onChange={(e) => (setO({ ...o, [k]: e.target.value }), setErr(''))} className={field} />
        </label>
      ))}
      {err && <p className="text-xs font-bold text-rose-600">{err}</p>}
      <button onClick={submit} className="w-full py-3 rounded-xl bg-[#800D32] text-white text-sm font-black">
        Save
      </button>
    </div>
  );
};

export default MoreToolsPage;