import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Printer,
  Plus,
  Settings,
  FileText,
  ReceiptText,
  Barcode,
  PowerOff,
  Layers,
  Wifi,
  WifiOff,
  MoreHorizontal,
  Monitor,
  Database,
  Workflow,
  Minus,
  Check,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  PencilLine,
  Trash2,
  Usb,
  Bluetooth,
  Globe,
  ChevronDown,
  Copy,
  Power,
  HelpCircle,
} from 'lucide-react';
import type { Category } from '@bitechez/shared-types';
import { apiService } from '../services/api';
import { buildBillPdf, buildKotPdf, outputPdf, type BillDoc, type KotDoc } from '../utils/posPdf';

/* =====================================================================
   CONFIG + TYPES
   ===================================================================== */
const PAGE_OFFSET = '9.75rem';
const PRINTERS_KEY = 'printers.list';
const RULES_KEY = 'printers.rules';
const TEMPLATE_KEY = 'printers.template';
const LOG_KEY = 'printers.log';

type PrinterType = 'kot' | 'bill' | 'barcode';
type Connection = 'network' | 'usb' | 'bluetooth' | 'system';
type Paper = '58mm' | '80mm' | 'A4' | 'label';
type Status = 'online' | 'offline' | 'unknown' | 'checking';
type DocKind = 'kot' | 'bill' | 'invoice' | 'reports';

export interface PrinterConfig {
  id: string;
  name: string;
  model: string;
  type: PrinterType;
  connection: Connection;
  ip?: string;
  port?: number;
  paper: Paper;
  copies: number;
  autoPrintKot: boolean;
  printModifiers: boolean;
  enabled: boolean;
  docs: DocKind[];
  header?: string;
  footer?: string;
  fontSize: 'small' | 'normal' | 'large';
  cutPaper: boolean;
  beep: boolean;
}
export interface RoutingRule {
  id: string;
  name: string;
  categoryIds: string[];
  printerId: string;
  active: boolean;
}
interface PrintTemplate {
  showLogo: boolean;
  showGstin: boolean;
  showUpiQr: boolean;
  showItemNotes: boolean;
  billHeader: string;
  billFooter: string;
  kotShowPrices: boolean;
}

const TYPE_META: Record<PrinterType, { label: string; pill: string; icon: React.ElementType }> = {
  kot: { label: 'KOT', pill: 'bg-rose-100 text-[#B0123F]', icon: FileText },
  bill: { label: 'Bill', pill: 'bg-violet-100 text-violet-700', icon: ReceiptText },
  barcode: { label: 'Barcode', pill: 'bg-amber-100 text-amber-700', icon: Barcode },
};
const CONN_META: Record<Connection, { label: string; icon: React.ElementType }> = {
  network: { label: 'Network (IP)', icon: Globe },
  usb: { label: 'USB', icon: Usb },
  bluetooth: { label: 'Bluetooth', icon: Bluetooth },
  system: { label: 'System Print Dialog', icon: Monitor },
};
const PAPER_LABEL: Record<Paper, string> = { '58mm': '58 mm (Thermal)', '80mm': '80 mm (Thermal)', A4: 'A4', label: 'Label (50×25 mm)' };
const DOC_LABEL: Record<DocKind, string> = { kot: 'Kitchen KOT', bill: 'Customer Bill', invoice: 'Tax Invoice (A4)', reports: 'Reports' };
const STATUS_META: Record<Status, { label: string; cls: string; dot: string }> = {
  online: { label: 'Online', cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  offline: { label: 'Offline', cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  unknown: { label: 'Unverified', cls: 'bg-amber-50 text-amber-700', dot: 'bg-amber-400' },
  checking: { label: 'Checking…', cls: 'bg-gray-50 text-gray-500', dot: 'bg-gray-300' },
};

const DEFAULT_TEMPLATE: PrintTemplate = {
  showLogo: true,
  showGstin: true,
  showUpiQr: true,
  showItemNotes: true,
  billHeader: '',
  billFooter: 'Thank you! Please visit again.',
  kotShowPrices: false,
};

/** Optional backend hooks — used automatically if your apiService provides them. */
type PrinterApi = {
  pingPrinter?: (p: { ip?: string; port?: number; connection: Connection }) => Promise<boolean>;
  printTest?: (p: PrinterConfig) => Promise<unknown>;
};
const api = apiService as unknown as PrinterApi;

/* =====================================================================
   HELPERS (exported for POS / KOT integration)
   ===================================================================== */
const readJSON = <T,>(key: string, fallback: T): T => {
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
};
const writeJSON = (key: string, v: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* ignore */
  }
};
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/** Which printer should get KOT lines for this category? Falls back to the first enabled KOT printer. */
export function printerForCategory(categoryId: string): PrinterConfig | undefined {
  const printers = readJSON<PrinterConfig[]>(PRINTERS_KEY, []).filter((p) => p.enabled);
  const rule = readJSON<RoutingRule[]>(RULES_KEY, []).find((r) => r.active && r.categoryIds.includes(categoryId));
  return printers.find((p) => p.id === rule?.printerId) ?? printers.find((p) => p.type === 'kot');
}
/** Record a print so "Prints Today" stays accurate. */
export function logPrint(printerId: string, kind: DocKind) {
  const log = readJSON<{ at: string; printerId: string; kind: DocKind }[]>(LOG_KEY, []);
  writeJSON(LOG_KEY, [...log.slice(-999), { at: new Date().toISOString(), printerId, kind }]);
}

const isIp = (s = '') => /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(s.trim());

const SAMPLE_KOT: KotDoc = {
  kotNumber: 999,
  orderNumber: 'TEST-PRINT',
  createdAt: new Date().toISOString(),
  orderType: 'dine_in',
  tableName: 'T1',
  guests: 2,
  items: [
    { name: 'Classic Burger', qty: 1, notes: 'No onions' },
    { name: 'French Fries', qty: 2 },
  ],
  orderNote: 'This is a test print',
};
const SAMPLE_BILL: BillDoc = {
  orderNumber: 'TEST-PRINT',
  createdAt: new Date().toISOString(),
  orderType: 'dine_in',
  tableName: 'T1',
  guests: 2,
  cashier: 'Test',
  lines: [
    { id: '1', name: 'Classic Burger', qty: 1, unitPaise: 14900, gstRate: 5 },
    { id: '2', name: 'French Fries', qty: 2, unitPaise: 9900, gstRate: 5 },
  ],
  subtotalPaise: 34700,
  discountPaise: 0,
  discountPercentage: 0,
  cgstPaise: 868,
  sgstPaise: 868,
  totalGstPaise: 1736,
  roundingPaise: -36,
  grandTotalPaise: 36400,
  payments: [{ method: 'cash', amountPaise: 36400 }],
};

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

const Toggle = ({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) => (
  <button onClick={() => onChange(!on)} className={`relative w-11 h-6 rounded-full shrink-0 ${on ? 'bg-[#C0163F]' : 'bg-gray-300'}`} aria-label={label} aria-pressed={on}>
    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow ${on ? 'left-6' : 'left-1'}`} />
  </button>
);

const StatusPill = ({ s }: { s: Status }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${STATUS_META[s].cls}`}>
    <span className={`w-2 h-2 rounded-full ${STATUS_META[s].dot}`} />
    {STATUS_META[s].label}
  </span>
);

const PrinterArt = ({ type, size = 'w-14 h-14' }: { type: PrinterType; size?: string }) => (
  <span className={`${size} rounded-xl bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center shrink-0`}>
    {type === 'barcode' ? <Barcode className="w-1/2 h-1/2 text-gray-800" /> : <Printer className="w-1/2 h-1/2 text-gray-800" />}
  </span>
);

const field = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#191923] focus:outline-none focus:ring-2 focus:ring-[#800D32]/30';
const lbl = 'block text-sm font-bold text-gray-700 mb-1.5';

const Select = <T extends string>({ value, onChange, options, icon }: { value: T; onChange: (v: T) => void; options: [T, string][]; icon?: React.ReactNode }) => (
  <div className="relative">
    {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">{icon}</span>}
    <select value={value} onChange={(e) => onChange(e.target.value as T)} className={`${field} appearance-none pr-9 ${icon ? 'pl-9' : ''}`}>
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
  </div>
);

/* =====================================================================
   PRINTER ROW
   ===================================================================== */
const PrinterRow = memo(
  ({
    p,
    status,
    selected,
    onSelect,
    onAction,
  }: {
    p: PrinterConfig;
    status: Status;
    selected: boolean;
    onSelect: (id: string) => void;
    onAction: (id: string, a: 'test' | 'toggle' | 'duplicate' | 'delete') => void;
  }) => {
    const [menu, setMenu] = useState(false);
    useEffect(() => {
      if (!menu) return;
      const c = () => setMenu(false);
      window.addEventListener('click', c);
      return () => window.removeEventListener('click', c);
    }, [menu]);
    const where = p.connection === 'network' ? `IP: ${p.ip ?? '—'}` : CONN_META[p.connection].label;
    return (
      <div
        onClick={() => onSelect(p.id)}
        className={`relative flex items-center gap-4 rounded-2xl border px-4 py-3 cursor-pointer transition-colors ${selected ? 'border-[#E58AA7] bg-[#FFF8FA] shadow-sm' : 'border-transparent hover:bg-gray-50'
          } ${p.enabled ? '' : 'opacity-60'}`}
      >
        {selected && <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-[#C0163F]" />}
        <PrinterArt type={p.type} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-black text-[#191923] truncate">{p.name}</h4>
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${TYPE_META[p.type].pill}`}>{TYPE_META[p.type].label}</span>
            {!p.enabled && <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-500">Inactive</span>}
          </div>
          <p className="text-sm font-semibold text-gray-500 truncate">
            {p.model || 'Generic'} <span className="text-gray-300 mx-1">|</span> {where}
          </p>
        </div>
        <StatusPill s={p.enabled ? status : 'offline'} />
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setMenu((m) => !m)} className="w-10 h-10 rounded-xl border border-gray-100 bg-white flex items-center justify-center text-gray-600" aria-label="Printer actions">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-gray-100 shadow-xl p-1 z-20">
              {(
                [
                  ['test', 'Test print', Printer],
                  ['toggle', p.enabled ? 'Deactivate' : 'Activate', p.enabled ? PowerOff : Power],
                  ['duplicate', 'Duplicate', Copy],
                  ['delete', 'Delete', Trash2],
                ] as const
              ).map(([a, l, I]) => (
                <button
                  key={a}
                  onClick={() => (setMenu(false), onAction(p.id, a))}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold ${a === 'delete' ? 'text-rose-600 hover:bg-rose-50' : 'text-gray-700 hover:bg-[#FDEBF1] hover:text-[#800D32]'}`}
                >
                  <I className="w-3.5 h-3.5" /> {l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

/* =====================================================================
   PAGE
   ===================================================================== */
export const PrintersPage: React.FC = () => {
  const [printers, setPrinters] = useState<PrinterConfig[]>(() =>
    readJSON<PrinterConfig[]>(PRINTERS_KEY, [
      {
        id: 'system-default',
        name: 'Browser Print',
        model: 'System printer',
        type: 'bill',
        connection: 'system',
        paper: '80mm',
        copies: 1,
        autoPrintKot: false,
        printModifiers: true,
        enabled: true,
        docs: ['bill', 'kot', 'invoice'],
        fontSize: 'normal',
        cutPaper: true,
        beep: false,
      },
    ])
  );
  const [rules, setRules] = useState<RoutingRule[]>(() => readJSON(RULES_KEY, []));
  const [template, setTemplate] = useState<PrintTemplate>(() => ({ ...DEFAULT_TEMPLATE, ...readJSON(TEMPLATE_KEY, {}) }));
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [filter, setFilter] = useState<'all' | PrinterType | 'inactive'>('all');
  const [selectedId, setSelectedId] = useState<string | undefined>(printers[0]?.id);
  const [draft, setDraft] = useState<PrinterConfig | null>(null);
  const [tab, setTab] = useState<'settings' | 'rules' | 'template'>('settings');
  const [modal, setModal] = useState<null | 'add' | 'edit' | 'rule' | 'bulk' | 'templates' | 'delete' | 'test' | 'details'>(null);
  const [editRule, setEditRule] = useState<RoutingRule | null>(null);
  const [deleteId, setDeleteId] = useState<string | undefined>();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const notify = (type: 'success' | 'error', text: string) => setToast({ type, text });
  useEffect(() => writeJSON(PRINTERS_KEY, printers), [printers]);
  useEffect(() => writeJSON(RULES_KEY, rules), [rules]);
  useEffect(() => writeJSON(TEMPLATE_KEY, template), [template]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    apiService
      .getCategories()
      .then(setCategories)
      .catch(() => undefined);
  }, []);

  /* ---------- status check ---------- */
  const checkAll = useCallback(async (list: PrinterConfig[]) => {
    setStatus((s) => ({ ...s, ...Object.fromEntries(list.map((p) => [p.id, 'checking' as Status])) }));
    const results = await Promise.all(
      list.map(async (p): Promise<[string, Status]> => {
        if (p.connection === 'system') return [p.id, 'online'];
        if (!api.pingPrinter) return [p.id, 'unknown'];
        try {
          return [p.id, (await api.pingPrinter({ ip: p.ip, port: p.port, connection: p.connection })) ? 'online' : 'offline'];
        } catch {
          return [p.id, 'offline'];
        }
      })
    );
    setStatus((s) => ({ ...s, ...Object.fromEntries(results) }));
  }, []);
  useEffect(() => {
    checkAll(printers);
    const t = setInterval(() => checkAll(readJSON(PRINTERS_KEY, [])), 60_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- derived ---------- */
  const counts = useMemo(
    () => ({
      all: printers.length,
      kot: printers.filter((p) => p.type === 'kot').length,
      bill: printers.filter((p) => p.type === 'bill').length,
      barcode: printers.filter((p) => p.type === 'barcode').length,
      inactive: printers.filter((p) => !p.enabled).length,
      online: printers.filter((p) => p.enabled && status[p.id] === 'online').length,
      offline: printers.filter((p) => !p.enabled || status[p.id] === 'offline').length,
      unknown: printers.filter((p) => p.enabled && status[p.id] === 'unknown').length,
    }),
    [printers, status]
  );

  /** Prints today = KOTs + settled bills (shared POS data) + logged test prints, with an hourly sparkline. */
  const printsToday = useMemo(() => {
    const today = new Date().toDateString();
    const stamps = [
      ...readJSON<{ createdAt: string }[]>('pos.kotQueue', []).map((k) => k.createdAt),
      ...readJSON<{ createdAt: string }[]>('pos.recent', []).map((o) => o.createdAt),
      ...readJSON<{ at: string }[]>(LOG_KEY, []).map((l) => l.at),
    ].filter((s) => s && new Date(s).toDateString() === today);
    const hours = Array(24).fill(0);
    stamps.forEach((s) => (hours[new Date(s).getHours()] += 1));
    const now = new Date().getHours();
    return { total: stamps.length, series: hours.slice(Math.max(0, now - 9), now + 1) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const visible = printers.filter((p) => (filter === 'all' ? true : filter === 'inactive' ? !p.enabled : p.type === filter));
  const sel = printers.find((p) => p.id === selectedId);
  const catName = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories]);

  useEffect(() => {
    if (sel) setDraft(structuredClone(sel));
    else setDraft(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, sel?.id]);
  useEffect(() => {
    if (!sel && printers[0]) setSelectedId(printers[0].id);
  }, [sel, printers]);

  const dirty = !!draft && !!sel && JSON.stringify(draft) !== JSON.stringify(sel);
  const patch = (p: Partial<PrinterConfig>) => setDraft((d) => (d ? { ...d, ...p } : d));

  /* ---------- actions ---------- */
  const testPrint = async (p: PrinterConfig, kind?: 'kot' | 'bill') => {
    const k = kind ?? (p.type === 'kot' ? 'kot' : 'bill');
    try {
      if (p.connection !== 'system' && api.printTest) {
        await api.printTest(p);
        notify('success', `Test page sent to ${p.name}`);
      } else {
        const doc = k === 'kot' ? await buildKotPdf({ ...SAMPLE_KOT, createdAt: new Date().toISOString() }) : await buildBillPdf({ ...SAMPLE_BILL, createdAt: new Date().toISOString() });
        outputPdf(doc, `Test-${k}.pdf`, 'print');
        notify('success', p.connection === 'system' ? 'Print dialog opened' : 'Print dialog opened — pick this printer in the dialog');
      }
      logPrint(p.id, k);
    } catch (e) {
      console.error(e);
      notify('error', `Test print failed for ${p.name}`);
    }
  };

  const saveSettings = () => {
    if (!draft) return;
    if (draft.connection === 'network' && !isIp(draft.ip)) return notify('error', 'Enter a valid IP address');
    setPrinters((l) => l.map((p) => (p.id === draft.id ? draft : p)));
    checkAll([draft]);
    notify('success', 'Settings saved');
  };

  const onRowAction = useCallback(
    (id: string, a: 'test' | 'toggle' | 'duplicate' | 'delete') => {
      const p = readJSON<PrinterConfig[]>(PRINTERS_KEY, []).find((x) => x.id === id);
      if (!p) return;
      if (a === 'test') testPrint(p);
      if (a === 'toggle') setPrinters((l) => l.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)));
      if (a === 'duplicate') {
        const copy = { ...structuredClone(p), id: uid(), name: `${p.name} (Copy)` };
        setPrinters((l) => [...l, copy]);
        setSelectedId(copy.id);
        checkAll([copy]);
      }
      if (a === 'delete') (setDeleteId(id), setModal('delete'));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const select = useCallback((id: string) => {
    setSelectedId(id);
    if (window.matchMedia('(max-width: 1279px)').matches) setModal('details');
  }, []);

  /* ---------- details panel ---------- */
  const details = draft ? (
    <div className="h-full min-h-0 flex flex-col gap-3">
      <div className="rounded-2xl bg-gradient-to-br from-[#FFF0F4] to-white border border-rose-50 p-4 flex gap-4">
        <PrinterArt type={draft.type} size="w-28 h-28" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h2 className="flex-1 text-xl font-black text-[#191923] leading-tight">{draft.name}</h2>
            <button onClick={() => setModal('edit')} className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-600" aria-label="Edit printer">
              <PencilLine className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-1.5">
            <StatusPill s={draft.enabled ? status[draft.id] ?? 'unknown' : 'offline'} />
          </div>
          <p className="text-base font-semibold text-gray-600 mt-2">{draft.model || 'Generic printer'}</p>
          <p className="flex items-center gap-3 flex-wrap text-sm font-semibold text-[#191923] mt-1.5">
            {draft.connection === 'network' ? (
              <>
                <span className="flex items-center gap-1.5">
                  <Monitor className="w-4 h-4" /> IP: {draft.ip || '—'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Database className="w-4 h-4" /> Port: {draft.port ?? 9100}
                </span>
              </>
            ) : (
              <span className="flex items-center gap-1.5">
                {React.createElement(CONN_META[draft.connection].icon, { className: 'w-4 h-4' })} {CONN_META[draft.connection].label}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(
          [
            ['settings', 'Settings', Settings],
            ['rules', 'Print Rules', Workflow],
            ['template', 'Template', FileText],
          ] as const
        ).map(([k, l, I]) => (
          <button key={k} onClick={() => setTab(k)} className={`inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border ${tab === k ? 'bg-[#800D32] text-white border-[#800D32]' : 'bg-white text-[#191923] border-gray-100'}`}>
            <I className="w-4 h-4" /> {l}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 px-0.5">
        {tab === 'settings' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Printer Type</label>
                <Select
                  value={draft.type}
                  onChange={(v) => patch({ type: v, docs: v === 'kot' ? ['kot'] : v === 'bill' ? ['bill', 'invoice'] : [] })}
                  options={[
                    ['kot', 'KOT Printer'],
                    ['bill', 'Bill Printer'],
                    ['barcode', 'Barcode / Label'],
                  ]}
                  icon={<Printer className="w-4 h-4" />}
                />
              </div>
              <div>
                <label className={lbl}>Connection</label>
                <Select value={draft.connection} onChange={(v) => patch({ connection: v })} options={(Object.keys(CONN_META) as Connection[]).map((c) => [c, CONN_META[c].label])} icon={<Wifi className="w-4 h-4" />} />
              </div>
            </div>
            {draft.connection === 'network' && (
              <div className="grid grid-cols-[1fr_110px] gap-3">
                <div>
                  <label className={lbl}>IP Address</label>
                  <input value={draft.ip ?? ''} onChange={(e) => patch({ ip: e.target.value.replace(/[^\d.]/g, '') })} placeholder="192.168.1.100" className={`${field} ${draft.ip && !isIp(draft.ip) ? 'border-rose-300' : ''}`} />
                </div>
                <div>
                  <label className={lbl}>Port</label>
                  <input value={draft.port ?? 9100} onChange={(e) => patch({ port: Number(e.target.value.replace(/\D/g, '')) || 9100 })} inputMode="numeric" className={field} />
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Paper Size</label>
                <Select value={draft.paper} onChange={(v) => patch({ paper: v })} options={(Object.keys(PAPER_LABEL) as Paper[]).map((k) => [k, PAPER_LABEL[k]])} icon={<ReceiptText className="w-4 h-4" />} />
              </div>
              <div>
                <label className={lbl}>Copies</label>
                <div className="grid grid-cols-3 rounded-xl border border-gray-200 overflow-hidden">
                  <button onClick={() => patch({ copies: Math.max(1, draft.copies - 1) })} className="py-2.5 flex items-center justify-center hover:bg-gray-50" aria-label="Fewer copies">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="py-2.5 text-center font-black border-x border-gray-200">{draft.copies}</span>
                  <button onClick={() => patch({ copies: Math.min(5, draft.copies + 1) })} className="py-2.5 flex items-center justify-center hover:bg-gray-50" aria-label="More copies">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-gray-100 p-3">
              {(
                [
                  ['autoPrintKot', 'Auto Print KOT'],
                  ['printModifiers', 'Print Item Modifiers'],
                  ['cutPaper', 'Auto Cut Paper'],
                  ['beep', 'Beep on Print'],
                ] as const
              ).map(([k, l]) => (
                <label key={k} className="flex items-center justify-between gap-2 text-sm font-bold text-[#191923]">
                  {l}
                  <Toggle on={draft[k]} onChange={(v) => patch({ [k]: v })} label={l} />
                </label>
              ))}
              <label className="flex items-center justify-between gap-2 text-sm font-bold text-[#191923]">
                Active
                <Toggle on={draft.enabled} onChange={(v) => patch({ enabled: v })} label="Active" />
              </label>
            </div>
          </>
        )}

        {tab === 'rules' && (
          <>
            <div>
              <p className={lbl}>This printer prints</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(DOC_LABEL) as DocKind[]).map((d) => {
                  const on = draft.docs.includes(d);
                  return (
                    <button
                      key={d}
                      onClick={() => patch({ docs: on ? draft.docs.filter((x) => x !== d) : [...draft.docs, d] })}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-bold text-left ${on ? 'border-[#C0163F] bg-[#FFF5F8] text-[#800D32]' : 'border-gray-200 text-gray-700'}`}
                    >
                      <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${on ? 'bg-[#C0163F] border-[#C0163F] text-white' : 'border-gray-300'}`}>{on && <Check className="w-3 h-3" />}</span>
                      {DOC_LABEL[d]}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className={lbl}>Routing rules sending to this printer</p>
              {rules.filter((r) => r.printerId === draft.id).length === 0 ? (
                <p className="text-sm text-gray-500">No routing rules. {draft.type === 'kot' ? 'It receives all KOT items not routed elsewhere.' : ''}</p>
              ) : (
                <ul className="space-y-1.5">
                  {rules
                    .filter((r) => r.printerId === draft.id)
                    .map((r) => (
                      <li key={r.id} className="flex items-center gap-2 rounded-xl border border-gray-100 px-3 py-2 text-sm">
                        <span className="font-black">{r.name}</span>
                        <span className="text-gray-500 truncate flex-1">{r.categoryIds.map((c) => catName[c] ?? 'Removed').join(', ')}</span>
                        <button onClick={() => (setEditRule(r), setModal('rule'))} className="text-gray-500 hover:text-[#800D32]" aria-label="Edit rule">
                          <PencilLine className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                </ul>
              )}
              <button
                onClick={() => (setEditRule({ id: uid(), name: '', categoryIds: [], printerId: draft.id, active: true }), setModal('rule'))}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-[#800D32]"
              >
                <Plus className="w-3.5 h-3.5" /> Add rule for this printer
              </button>
            </div>
          </>
        )}

        {tab === 'template' && (
          <>
            <div>
              <label className={lbl}>Header text</label>
              <input value={draft.header ?? ''} onChange={(e) => patch({ header: e.target.value.slice(0, 60) })} placeholder="e.g. Main Kitchen Copy" className={field} />
            </div>
            <div>
              <label className={lbl}>Footer text</label>
              <input value={draft.footer ?? ''} onChange={(e) => patch({ footer: e.target.value.slice(0, 80) })} placeholder="e.g. Prepared with love" className={field} />
            </div>
            <div>
              <label className={lbl}>Font size</label>
              <div className="grid grid-cols-3 gap-2">
                {(['small', 'normal', 'large'] as const).map((f) => (
                  <button key={f} onClick={() => patch({ fontSize: f })} className={`py-2.5 rounded-xl border text-sm font-bold capitalize ${draft.fontSize === f ? 'bg-[#800D32] text-white border-[#800D32]' : 'border-gray-200'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => testPrint(draft, 'kot')} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold">
                Preview KOT
              </button>
              <button onClick={() => testPrint(draft, 'bill')} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold">
                Preview Bill
              </button>
            </div>
            <p className="text-[11px] text-gray-400">Shop-wide bill settings (GSTIN, UPI QR, footer) are under Print Templates.</p>
          </>
        )}
      </div>

      <div className="grid grid-cols-[1fr_1.3fr] gap-2.5">
        <button onClick={() => testPrint(draft)} className="inline-flex items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200 bg-white text-base font-black text-[#800D32] hover:border-[#F3C3D2]">
          <Printer className="w-5 h-5" /> Test Print
        </button>
        <button disabled={!dirty} onClick={saveSettings} className="inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#800D32] text-white text-base font-black shadow-md hover:bg-[#6a0a29] disabled:opacity-50">
          <Check className="w-5 h-5" /> Save Settings
        </button>
      </div>
    </div>
  ) : (
    <div className="h-full flex flex-col items-center justify-center text-center p-6">
      <Printer className="w-10 h-10 text-rose-200 mb-2" />
      <p className="text-sm font-bold text-gray-600">Add a printer to get started</p>
    </div>
  );

  /* ---------- render ---------- */
  const sparkMax = Math.max(1, ...printsToday.series);
  const sparkPts = printsToday.series.map((v, i, a) => `${(i / Math.max(1, a.length - 1)) * 60},${22 - (v / sparkMax) * 18}`).join(' ');

  return (
    <div className="flex flex-col gap-3 overflow-hidden" style={{ height: `calc(100dvh - var(--pos-offset, ${PAGE_OFFSET}))` }}>
      {toast && (
        <div className={`fixed top-5 right-5 z-[80] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border ${toast.type === 'success' ? 'bg-[#800D32] text-white border-rose-400' : 'bg-white text-rose-700 border-rose-200'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
          {toast.text}
        </div>
      )}

      {/* ===== Header ===== */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-3 mr-auto">
          <Printer className="w-12 h-12 text-[#800D32]" strokeWidth={1.7} />
          <div>
            <h1 className="text-2xl font-black text-[#191923] leading-tight">Printers</h1>
            <p className="text-xs text-gray-500 font-medium hidden sm:block">Manage printers, KOT & bill printing, and print rules</p>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto max-w-full">
          <button onClick={() => setModal('add')} className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#800D32] text-white text-sm font-black shadow-md hover:bg-[#6a0a29]">
            <Plus className="w-4 h-4" /> Add Printer
          </button>
          <button onClick={() => setModal('test')} className="shrink-0 inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-[#191923] hover:border-[#F3C3D2]">
            <Printer className="w-4 h-4 text-[#800D32]" /> Test Print
          </button>
          <button onClick={() => setModal('bulk')} className="shrink-0 inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-[#191923] hover:border-[#F3C3D2]">
            <Settings className="w-4 h-4 text-[#800D32]" /> Bulk Settings
          </button>
          <button onClick={() => setModal('templates')} className="shrink-0 inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-[#191923] hover:border-[#F3C3D2]">
            <FileText className="w-4 h-4 text-[#800D32]" /> Print Templates
          </button>
        </div>
      </div>

      {/* ===== Body ===== */}
      <div className="flex-1 min-h-0 flex gap-3">
        {/* Filters */}
        <aside className="hidden md:flex w-52 xl:w-60 shrink-0 flex-col gap-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm p-2 self-start">
          {(
            [
              ['all', 'All Printers', Printer, counts.all],
              ['kot', 'KOT Printers', FileText, counts.kot],
              ['bill', 'Bill Printers', ReceiptText, counts.bill],
              ['barcode', 'Barcode Printers', Barcode, counts.barcode],
              ['inactive', 'Inactive', PowerOff, counts.inactive],
            ] as const
          ).map(([k, l, I, n]) => {
            const active = filter === k;
            return (
              <button key={k} onClick={() => setFilter(k)} className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-xl text-sm font-bold ${active ? 'bg-[#800D32] text-white shadow-md' : 'text-[#191923] hover:bg-[#FFF5F8]'}`}>
                <I className={`w-5 h-5 ${active ? 'text-white' : 'text-[#800D32]'}`} />
                <span className="flex-1 text-left">{l}</span>
                <span className={`text-xs px-2 py-0.5 rounded-lg ${active ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>{n}</span>
              </button>
            );
          })}
        </aside>

        {/* Center */}
        <section className="flex-1 min-w-0 min-h-0 overflow-y-auto flex flex-col gap-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              { i: <Layers className="w-6 h-6 text-emerald-600" />, t: 'bg-emerald-50', v: counts.all, l: 'Total Printers' },
              { i: <Wifi className="w-6 h-6 text-emerald-600" />, t: 'bg-emerald-50', v: counts.online, l: counts.unknown ? `Online · ${counts.unknown} unverified` : 'Online' },
              { i: <WifiOff className="w-6 h-6 text-rose-600" />, t: 'bg-rose-50', v: counts.offline, l: 'Offline' },
            ].map((s) => (
              <div key={s.l} className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.t}`}>{s.i}</div>
                <div className="min-w-0">
                  <p className="text-2xl font-black text-[#191923] leading-none">{s.v}</p>
                  <p className="text-xs font-semibold text-gray-500 mt-1 truncate">{s.l}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-black text-[#191923] leading-none">{printsToday.total.toLocaleString('en-IN')}</p>
                <p className="text-xs font-semibold text-gray-500 mt-1">Prints Today</p>
              </div>
              <svg viewBox="0 0 60 24" className="w-16 h-7 shrink-0" aria-hidden>
                <polyline points={sparkPts} fill="none" stroke="#A855F7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
            <div className="flex items-center justify-between px-1 pb-2">
              <h3 className="text-lg font-black text-[#191923]">Connected Printers</h3>
              <button onClick={() => (checkAll(printers), notify('success', 'Status refreshed'))} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#800D32]">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh status
              </button>
            </div>
            <div className="md:hidden flex gap-1.5 overflow-x-auto pb-2">
              {(['all', 'kot', 'bill', 'barcode', 'inactive'] as const).map((k) => (
                <button key={k} onClick={() => setFilter(k)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border capitalize ${filter === k ? 'bg-[#800D32] text-white border-[#800D32]' : 'border-gray-200'}`}>
                  {k}
                </button>
              ))}
            </div>
            {visible.length === 0 ? (
              <p className="py-10 text-center text-sm font-bold text-gray-500">No printers here.</p>
            ) : (
              <div className="space-y-1.5">
                {visible.map((p) => (
                  <PrinterRow key={p.id} p={p} status={status[p.id] ?? 'checking'} selected={p.id === selectedId} onSelect={select} onAction={onRowAction} />
                ))}
              </div>
            )}
            {counts.unknown > 0 && (
              <p className="flex items-start gap-1.5 text-[11px] text-gray-500 mt-2 px-1">
                <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
                Browsers can't reach network/USB printers directly, so their status can't be verified here. Test prints open the system print dialog — choose the printer there.
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start gap-3 mb-3">
              <Workflow className="w-7 h-7 text-[#800D32]" />
              <div className="flex-1">
                <h3 className="text-lg font-black text-[#191923] leading-tight">Print Routing Rules</h3>
                <p className="text-xs font-semibold text-gray-500">Automatically send items to the right kitchen printer</p>
              </div>
              <button
                disabled={!printers.some((p) => p.type === 'kot')}
                onClick={() => (setEditRule({ id: uid(), name: '', categoryIds: [], printerId: printers.find((p) => p.type === 'kot')?.id ?? '', active: true }), setModal('rule'))}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#191923] hover:border-[#F3C3D2] disabled:opacity-40"
                title={printers.some((p) => p.type === 'kot') ? '' : 'Add a KOT printer first'}
              >
                <Plus className="w-4 h-4 text-[#800D32]" /> Add Rule
              </button>
            </div>
            {rules.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No rules yet — all KOTs go to the first active KOT printer.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#FAF7F8] text-left text-xs font-bold text-gray-500">
                    <tr>
                      <th className="px-3 py-2.5">#</th>
                      <th className="px-3 py-2.5">Rule Name</th>
                      <th className="px-3 py-2.5">Items / Category</th>
                      <th className="px-3 py-2.5">Send To</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rules.map((r, i) => {
                      const target = printers.find((p) => p.id === r.printerId);
                      return (
                        <tr key={r.id}>
                          <td className="px-3 py-2.5 font-bold">{i + 1}</td>
                          <td className="px-3 py-2.5 font-black whitespace-nowrap">{r.name}</td>
                          <td className="px-3 py-2.5 text-gray-700 max-w-[260px] truncate">{r.categoryIds.map((c) => catName[c] ?? 'Removed').join(', ') || '—'}</td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 font-semibold">
                              <Printer className="w-4 h-4 text-[#800D32]" /> {target?.name ?? <span className="text-rose-600">Missing printer</span>}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <button
                              onClick={() => setRules((l) => l.map((x) => (x.id === r.id ? { ...x, active: !x.active } : x)))}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${r.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
                            >
                              {r.active ? '✓ Active' : 'Paused'}
                            </button>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex gap-1.5 justify-end">
                              <button onClick={() => (setEditRule(r), setModal('rule'))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600" aria-label="Edit rule">
                                <PencilLine className="w-4 h-4" />
                              </button>
                              <button onClick={() => setRules((l) => l.filter((x) => x.id !== r.id))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-rose-600" aria-label="Delete rule">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Details */}
        <aside className="hidden xl:flex w-[420px] 2xl:w-[470px] shrink-0 min-h-0 flex-col bg-white rounded-2xl border border-gray-100 shadow-sm p-3">{details}</aside>
      </div>

      {/* ===== Modals ===== */}
      <Modal open={modal === 'details'} onClose={() => setModal(null)} title={draft?.name ?? ''} width="max-w-lg">
        <div className="h-[72dvh]">{details}</div>
      </Modal>

      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'edit' ? 'Edit Printer' : 'Add Printer'}>
        <PrinterForm
          initial={modal === 'edit' ? sel : undefined}
          onSubmit={(p) => {
            if (modal === 'edit') setPrinters((l) => l.map((x) => (x.id === p.id ? p : x)));
            else setPrinters((l) => [...l, p]);
            setSelectedId(p.id);
            setDraft(structuredClone(p));
            checkAll([p]);
            setModal(null);
            notify('success', modal === 'edit' ? 'Printer updated' : `${p.name} added`);
          }}
        />
      </Modal>

      <Modal open={modal === 'rule' && !!editRule} onClose={() => setModal(null)} title={rules.some((r) => r.id === editRule?.id) ? 'Edit Rule' : 'Add Routing Rule'} subtitle="KOT lines from these categories print on the chosen printer">
        {editRule && (
          <RuleForm
            rule={editRule}
            categories={categories}
            printers={printers.filter((p) => p.type === 'kot')}
            takenBy={Object.fromEntries(rules.filter((r) => r.id !== editRule.id).flatMap((r) => r.categoryIds.map((c) => [c, r.name])))}
            onSubmit={(r) => {
              setRules((l) => (l.some((x) => x.id === r.id) ? l.map((x) => (x.id === r.id ? r : x)) : [...l, r]));
              setModal(null);
              notify('success', 'Rule saved');
            }}
          />
        )}
      </Modal>

      <Modal open={modal === 'test'} onClose={() => setModal(null)} title="Test Print" subtitle="Send a sample KOT or bill">
        <div className="space-y-2">
          {printers.filter((p) => p.enabled).length === 0 && <p className="text-sm text-gray-500">No active printers.</p>}
          {printers
            .filter((p) => p.enabled)
            .map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                <PrinterArt type={p.type} size="w-10 h-10" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black truncate">{p.name}</p>
                  <StatusPill s={status[p.id] ?? 'unknown'} />
                </div>
                <button onClick={() => testPrint(p, 'kot')} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold">
                  KOT
                </button>
                <button onClick={() => testPrint(p, 'bill')} className="px-3 py-2 rounded-lg bg-[#800D32] text-white text-xs font-bold">
                  Bill
                </button>
              </div>
            ))}
        </div>
      </Modal>

      <Modal open={modal === 'bulk'} onClose={() => setModal(null)} title="Bulk Settings" subtitle="Apply settings to many printers at once">
        <BulkForm
          onApply={(scope, p) => {
            const targets = printers.filter((x) => scope === 'all' || x.type === scope);
            setPrinters((l) => l.map((x) => (targets.some((t) => t.id === x.id) ? { ...x, ...p } : x)));
            setDraft((d) => (d && targets.some((t) => t.id === d.id) ? { ...d, ...p } : d));
            setModal(null);
            notify('success', `Updated ${targets.length} printer(s)`);
          }}
        />
      </Modal>

      <Modal open={modal === 'templates'} onClose={() => setModal(null)} title="Print Templates" subtitle="Shop-wide settings for bills and KOTs">
        <TemplateForm
          value={template}
          onSave={(t) => {
            setTemplate(t);
            setModal(null);
            notify('success', 'Template saved');
          }}
          onPreview={() => printers[0] && testPrint(printers.find((p) => p.type === 'bill') ?? printers[0], 'bill')}
        />
      </Modal>

      <Modal open={modal === 'delete'} onClose={() => setModal(null)} title={`Delete ${printers.find((p) => p.id === deleteId)?.name ?? 'printer'}?`}>
        <p className="text-sm text-gray-600 mb-4">Routing rules that point to this printer will also be removed.</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setModal(null)} className="py-2.5 rounded-xl border border-gray-200 text-sm font-bold">
            Cancel
          </button>
          <button
            onClick={() => {
              setPrinters((l) => l.filter((p) => p.id !== deleteId));
              setRules((l) => l.filter((r) => r.printerId !== deleteId));
              if (selectedId === deleteId) setSelectedId(undefined);
              setModal(null);
              notify('success', 'Printer deleted');
            }}
            className="py-2.5 rounded-xl bg-rose-600 text-white text-sm font-black"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

/* =====================================================================
   FORMS
   ===================================================================== */
const PrinterForm = ({ initial, onSubmit }: { initial?: PrinterConfig; onSubmit: (p: PrinterConfig) => void }) => {
  const [f, setF] = useState<PrinterConfig>(
    initial ?? {
      id: uid(),
      name: '',
      model: '',
      type: 'kot',
      connection: 'network',
      ip: '',
      port: 9100,
      paper: '80mm',
      copies: 1,
      autoPrintKot: true,
      printModifiers: true,
      enabled: true,
      docs: ['kot'],
      fontSize: 'normal',
      cutPaper: true,
      beep: false,
    }
  );
  const [err, setErr] = useState('');
  const set = (p: Partial<PrinterConfig>) => (setF((x) => ({ ...x, ...p })), setErr(''));
  const submit = () => {
    if (!f.name.trim()) return setErr('Printer name is required');
    if (f.connection === 'network' && !isIp(f.ip)) return setErr('Enter a valid IP address (e.g. 192.168.1.101)');
    onSubmit({ ...f, name: f.name.trim(), model: f.model.trim() });
  };
  return (
    <div className="space-y-3">
      <div>
        <label className={lbl}>Printer name</label>
        <input autoFocus value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Kitchen KOT - Main" className={field} />
      </div>
      <div>
        <label className={lbl}>Model</label>
        <input value={f.model} onChange={(e) => set({ model: e.target.value })} placeholder="e.g. Epson TM-T82III" className={field} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Type</label>
          <Select
            value={f.type}
            onChange={(v) => set({ type: v, docs: v === 'kot' ? ['kot'] : v === 'bill' ? ['bill', 'invoice'] : [], paper: v === 'barcode' ? 'label' : f.paper })}
            options={[
              ['kot', 'KOT Printer'],
              ['bill', 'Bill Printer'],
              ['barcode', 'Barcode / Label'],
            ]}
          />
        </div>
        <div>
          <label className={lbl}>Connection</label>
          <Select value={f.connection} onChange={(v) => set({ connection: v })} options={(Object.keys(CONN_META) as Connection[]).map((c) => [c, CONN_META[c].label])} />
        </div>
      </div>
      {f.connection === 'network' && (
        <div className="grid grid-cols-[1fr_110px] gap-3">
          <div>
            <label className={lbl}>IP Address</label>
            <input value={f.ip ?? ''} onChange={(e) => set({ ip: e.target.value.replace(/[^\d.]/g, '') })} placeholder="192.168.1.101" className={field} />
          </div>
          <div>
            <label className={lbl}>Port</label>
            <input value={f.port ?? 9100} onChange={(e) => set({ port: Number(e.target.value.replace(/\D/g, '')) || 9100 })} className={field} />
          </div>
        </div>
      )}
      <div>
        <label className={lbl}>Paper size</label>
        <Select value={f.paper} onChange={(v) => set({ paper: v })} options={(Object.keys(PAPER_LABEL) as Paper[]).map((k) => [k, PAPER_LABEL[k]])} />
      </div>
      {err && <p className="text-xs font-bold text-rose-600">{err}</p>}
      <button onClick={submit} className="w-full py-3 rounded-xl bg-[#800D32] text-white text-sm font-black">
        {initial ? 'Save Printer' : 'Add Printer'}
      </button>
    </div>
  );
};

const RuleForm = ({
  rule,
  categories,
  printers,
  takenBy,
  onSubmit,
}: {
  rule: RoutingRule;
  categories: Category[];
  printers: PrinterConfig[];
  takenBy: Record<string, string>;
  onSubmit: (r: RoutingRule) => void;
}) => {
  const [r, setR] = useState(rule);
  const [err, setErr] = useState('');
  const submit = () => {
    if (!r.name.trim()) return setErr('Give the rule a name');
    if (!r.categoryIds.length) return setErr('Pick at least one category');
    if (!r.printerId) return setErr('Choose a printer');
    onSubmit({ ...r, name: r.name.trim() });
  };
  return (
    <div className="space-y-3">
      <div>
        <label className={lbl}>Rule name</label>
        <input value={r.name} onChange={(e) => (setR({ ...r, name: e.target.value }), setErr(''))} placeholder="e.g. Desserts" className={field} />
      </div>
      <div>
        <label className={lbl}>Categories</label>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500">No categories loaded.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => {
              const on = r.categoryIds.includes(c.id);
              const taken = !on && takenBy[c.id];
              return (
                <button
                  key={c.id}
                  disabled={!!taken}
                  title={taken ? `Already routed by “${taken}”` : ''}
                  onClick={() => (setR({ ...r, categoryIds: on ? r.categoryIds.filter((x) => x !== c.id) : [...r.categoryIds, c.id] }), setErr(''))}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${on ? 'bg-[#800D32] text-white border-[#800D32]' : 'border-gray-200 text-gray-700'} disabled:opacity-40`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div>
        <label className={lbl}>Send to</label>
        <Select value={r.printerId} onChange={(v) => setR({ ...r, printerId: v })} options={[['', 'Select KOT printer…'], ...printers.map((p) => [p.id, p.name] as [string, string])]} />
      </div>
      <label className="flex items-center justify-between text-sm font-bold">
        Active
        <Toggle on={r.active} onChange={(v) => setR({ ...r, active: v })} label="Active" />
      </label>
      {err && <p className="text-xs font-bold text-rose-600">{err}</p>}
      <button onClick={submit} className="w-full py-3 rounded-xl bg-[#800D32] text-white text-sm font-black">
        Save Rule
      </button>
    </div>
  );
};

const BulkForm = ({ onApply }: { onApply: (scope: 'all' | PrinterType, p: Partial<PrinterConfig>) => void }) => {
  const [scope, setScope] = useState<'all' | PrinterType>('kot');
  const [paper, setPaper] = useState<'' | Paper>('');
  const [copies, setCopies] = useState('');
  const [auto, setAuto] = useState<'' | 'on' | 'off'>('');
  const [mods, setMods] = useState<'' | 'on' | 'off'>('');
  const patch: Partial<PrinterConfig> = {
    ...(paper && { paper }),
    ...(copies && { copies: Math.min(5, Math.max(1, Number(copies))) }),
    ...(auto && { autoPrintKot: auto === 'on' }),
    ...(mods && { printModifiers: mods === 'on' }),
  };
  return (
    <div className="space-y-3">
      <div>
        <label className={lbl}>Apply to</label>
        <Select
          value={scope}
          onChange={setScope}
          options={[
            ['all', 'All printers'],
            ['kot', 'KOT printers'],
            ['bill', 'Bill printers'],
            ['barcode', 'Barcode printers'],
          ]}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Paper size</label>
          <Select value={paper} onChange={setPaper} options={[['', 'No change'], ...(Object.keys(PAPER_LABEL) as Paper[]).map((k) => [k, PAPER_LABEL[k]] as [Paper, string])]} />
        </div>
        <div>
          <label className={lbl}>Copies</label>
          <input value={copies} onChange={(e) => setCopies(e.target.value.replace(/\D/g, '').slice(0, 1))} placeholder="No change" className={field} />
        </div>
        <div>
          <label className={lbl}>Auto Print KOT</label>
          <Select value={auto} onChange={setAuto} options={[['', 'No change'], ['on', 'On'], ['off', 'Off']]} />
        </div>
        <div>
          <label className={lbl}>Item Modifiers</label>
          <Select value={mods} onChange={setMods} options={[['', 'No change'], ['on', 'On'], ['off', 'Off']]} />
        </div>
      </div>
      <button disabled={!Object.keys(patch).length} onClick={() => onApply(scope, patch)} className="w-full py-3 rounded-xl bg-[#800D32] text-white text-sm font-black disabled:opacity-50">
        Apply
      </button>
    </div>
  );
};

const TemplateForm = ({ value, onSave, onPreview }: { value: PrintTemplate; onSave: (t: PrintTemplate) => void; onPreview: () => void }) => {
  const [t, setT] = useState(value);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2.5 rounded-xl border border-gray-100 p-3">
        {(
          [
            ['showLogo', 'Show logo on bill'],
            ['showGstin', 'Show GSTIN & FSSAI'],
            ['showUpiQr', 'UPI QR on unpaid bills'],
            ['showItemNotes', 'Item notes on bill'],
            ['kotShowPrices', 'Show prices on KOT'],
          ] as const
        ).map(([k, l]) => (
          <label key={k} className="flex items-center justify-between text-sm font-bold">
            {l}
            <Toggle on={t[k]} onChange={(v) => setT({ ...t, [k]: v })} label={l} />
          </label>
        ))}
      </div>
      <div>
        <label className={lbl}>Bill header line</label>
        <input value={t.billHeader} onChange={(e) => setT({ ...t, billHeader: e.target.value.slice(0, 60) })} placeholder="e.g. Pure Veg · Since 2015" className={field} />
      </div>
      <div>
        <label className={lbl}>Bill footer line</label>
        <input value={t.billFooter} onChange={(e) => setT({ ...t, billFooter: e.target.value.slice(0, 80) })} className={field} />
      </div>
      <div className="grid grid-cols-[1fr_1.4fr] gap-2">
        <button onClick={onPreview} className="py-3 rounded-xl border border-gray-200 text-sm font-bold">
          Preview Bill
        </button>
        <button onClick={() => onSave(t)} className="py-3 rounded-xl bg-[#800D32] text-white text-sm font-black">
          Save Template
        </button>
      </div>
    </div>
  );
};

export default PrintersPage;