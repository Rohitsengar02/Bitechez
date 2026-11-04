import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChefHat,
  Upload,
  Download,
  Plus,
  List as ListIcon,
  LayoutGrid,
  Search,
  Filter,
  Heart,
  MoreHorizontal,
  Package,
  PencilLine,
  Trash2,
  Maximize2,
  Copy,
  Check,
  X,
  CheckCircle2,
  AlertCircle,
  Sandwich,
  Pizza,
  CupSoda,
  Popcorn,
  CakeSlice,
  IceCreamCone,
  Gift,
  Soup,
  Coffee,
  Salad,
  Drumstick,
  UtensilsCrossed,
  ImagePlus,
  Wand2,
  RotateCcw,
} from 'lucide-react';
import type { Category, MenuItem } from '@bitechez/shared-types';
import { formatINR } from '@bitechez/business-logic';
import { apiService } from '../services/api';

/* =====================================================================
   CONFIG + TYPES
   ===================================================================== */
const PAGE_OFFSET = '9.75rem';
const OVERLAY_KEY = 'menu.local';
const FAV_KEY = 'pos.favorites'; // shared with POS
const LOW_STOCK = 10;
const UNITS = ['PCS', 'PLATE', 'BOWL', 'GLASS', 'CUP', 'KG', 'GM', 'LTR', 'ML'];
const GST_RATES = [0, 5, 12, 18, 28];
const BADGES = ['', 'Bestseller', 'Popular', 'New', "Chef's Special"] as const;

interface PriceLine {
  id: string;
  name: string;
  pricePaise: number;
}
interface Ingredient {
  id: string;
  name: string;
  qty: string;
}
/** MenuItem from the API plus the extra fields this page manages. */
export type MenuItemX = MenuItem & {
  description?: string;
  costPaise?: number;
  stock?: number;
  unit?: string;
  available?: boolean;
  images?: string[];
  badge?: string;
  variants?: PriceLine[];
  addons?: PriceLine[];
  ingredients?: Ingredient[];
  isLocal?: boolean;
};
interface MenuOverlay {
  items: Record<string, Partial<MenuItemX>>;
  created: MenuItemX[];
  deleted: string[];
  categories: Category[];
}
const EMPTY_OVERLAY: MenuOverlay = { items: {}, created: [], deleted: [], categories: [] };

/* =====================================================================
   STORAGE + SHARED HELPER
   ===================================================================== */
const readJSON = <T,>(key: string, fallback: T): T => {
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
};
const writeJSON = (key: string, v: unknown): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(v));
    return true;
  } catch {
    return false; // quota exceeded (usually too many images)
  }
};
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/**
 * Apply edits made on this page to API data. Use it in PosPage after loading:
 *   const merged = withLocalMenu(items, cats);
 *   setMenuItems(merged.items.filter(i => i.available !== false)); setCategories(merged.categories);
 */
export function withLocalMenu(items: MenuItem[], cats: Category[]) {
  const o = readJSON<MenuOverlay>(OVERLAY_KEY, EMPTY_OVERLAY);
  const del = new Set(o.deleted);
  const merged: MenuItemX[] = [
    ...items.filter((i) => !del.has(i.id)).map((i) => ({ ...i, ...(o.items[i.id] ?? {}) }) as MenuItemX),
    ...o.created.filter((i) => !del.has(i.id)).map((i) => ({ ...i, ...(o.items[i.id] ?? {}), isLocal: true })),
  ];
  const catIds = new Set(cats.map((c) => c.id));
  return { items: merged, categories: [...cats, ...o.categories.filter((c) => !catIds.has(c.id))] };
}

/** Resize + compress an image file so it fits comfortably in storage. */
function compressImage(file: File, max = 640): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/webp', 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Invalid image'));
    };
    img.src = url;
  });
}

const catIcon = (name = '') => {
  const n = name.toLowerCase();
  if (/burger|sandwich|wrap/.test(n)) return Sandwich;
  if (/pizza/.test(n)) return Pizza;
  if (/ice|kulfi|gelato/.test(n)) return IceCreamCone;
  if (/bever|drink|shake|juice|mocktail|soda/.test(n)) return CupSoda;
  if (/coffee|tea|chai/.test(n)) return Coffee;
  if (/dessert|sweet|cake|bakery/.test(n)) return CakeSlice;
  if (/snack|fries|starter|chaat/.test(n)) return Popcorn;
  if (/combo|meal|thali/.test(n)) return Gift;
  if (/soup|biryani|rice|curry|main|noodle/.test(n)) return Soup;
  if (/salad|healthy/.test(n)) return Salad;
  if (/chicken|tandoor|kebab|non/.test(n)) return Drumstick;
  return UtensilsCrossed;
};
const itemEmoji = (name = '') => {
  const n = name.toLowerCase();
  const map: [RegExp, string][] = [
    [/burger/, '🍔'], [/pizza/, '🍕'], [/fries/, '🍟'], [/coffee|latte/, '☕'], [/ice ?cream|sundae/, '🍨'], [/mojito|mocktail|lemon|soda/, '🍹'],
    [/shake|smoothie/, '🥤'], [/tea|chai/, '🍵'], [/biryani/, '🍛'], [/rice/, '🍚'], [/noodle|hakka/, '🍜'], [/dosa|idli/, '🥞'], [/tikka|kebab/, '🍢'],
    [/chicken/, '🍗'], [/paneer|curry|dal/, '🍲'], [/sandwich|wrap|roll/, '🥪'], [/cake|pastry|brownie/, '🍰'], [/salad/, '🥗'], [/pasta/, '🍝'], [/momo/, '🥟'],
  ];
  return map.find(([r]) => r.test(n))?.[1] ?? '🍽️';
};
const imageOf = (i: MenuItemX) => i.images?.[0] || ((i as unknown as Record<string, unknown>).imageUrl as string | undefined);
const toPaise = (v: string) => Math.round((parseFloat(v) || 0) * 100);
const rupees = (p?: number) => (p ? (p / 100).toFixed(2).replace(/\.00$/, '') : '');
const skuFor = (name: string, cat: string, n: number) => `${(cat || name).replace(/[^a-z]/gi, '').slice(0, 3).toUpperCase() || 'ITM'}-${String(n).padStart(3, '0')}`;

function csvEscape(v: unknown) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') (cur += '"'), i++;
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') row.push(cur), (cur = '');
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cur), rows.push(row), (row = []), (cur = '');
    } else cur += c;
  }
  if (cur || row.length) row.push(cur), rows.push(row);
  return rows.filter((r) => r.some((x) => x.trim()));
}

type ApiExtra = {
  createMenuItem?: (p: object) => Promise<MenuItem>;
  updateMenuItem?: (id: string, p: object) => Promise<unknown>;
  deleteMenuItem?: (id: string) => Promise<unknown>;
  createCategory?: (p: object) => Promise<Category>;
};
const api = apiService as unknown as ApiExtra;

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

const VegDot = ({ veg }: { veg?: boolean }) => (
  <span className={`w-3.5 h-3.5 rounded-[3px] border-[1.5px] flex items-center justify-center bg-white shrink-0 ${veg ? 'border-emerald-600' : 'border-rose-600'}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${veg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
  </span>
);
const BADGE_CLS: Record<string, string> = {
  Bestseller: 'bg-[#800D32] text-white',
  Popular: 'bg-[#F0508A] text-white',
  New: 'bg-emerald-600 text-white',
  "Chef's Special": 'bg-amber-500 text-white',
};
const field = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#191923] focus:outline-none focus:ring-2 focus:ring-[#800D32]/30';
const label = 'block text-xs font-bold text-gray-600 mb-1';

/* =====================================================================
   ITEM CARD
   ===================================================================== */
type CardProps = {
  item: MenuItemX;
  selected: boolean;
  fav: boolean;
  onSelect: (id: string) => void;
  onFav: (id: string) => void;
  onMenu: (id: string, action: 'edit' | 'duplicate' | 'toggle' | 'delete') => void;
};

const ItemCard = memo(({ item, selected, fav, onSelect, onFav, onMenu }: CardProps) => {
  const [open, setOpen] = useState(false);
  const img = imageOf(item);
  const available = item.available !== false;
  const low = item.stock !== undefined && item.stock < LOW_STOCK;
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [open]);
  return (
    <div
      onClick={() => onSelect(item.id)}
      className={`relative bg-white rounded-2xl border cursor-pointer flex flex-col overflow-visible hover:shadow-md transition-shadow ${selected ? 'border-[#C0163F] ring-1 ring-[#C0163F]' : 'border-gray-100 shadow-sm'
        } ${available ? '' : 'opacity-60'}`}
    >
      <div className="relative aspect-[4/3] rounded-t-2xl overflow-hidden bg-gradient-to-b from-[#FFF0F4] to-[#FFF9FB] flex items-center justify-center">
        {img ? <img src={img} alt={item.name} loading="lazy" decoding="async" className="w-[86%] h-[90%] object-contain" /> : <span className="text-6xl">{itemEmoji(item.name)}</span>}
        {item.badge && <span className={`absolute top-2.5 left-2.5 text-[11px] font-extrabold px-2 py-0.5 rounded-md ${BADGE_CLS[item.badge] ?? 'bg-gray-700 text-white'}`}>{item.badge}</span>}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFav(item.id);
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/80"
          aria-label="Favourite"
        >
          <Heart className={`w-5 h-5 ${fav ? 'fill-[#E11D48] text-[#E11D48]' : 'text-[#C2185B]'}`} />
        </button>
      </div>
      <div className="px-3 pt-2 pb-3">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
          <span className={`w-2 h-2 rounded-full ${available ? 'bg-emerald-500' : 'bg-gray-400'}`} />
          {available ? 'Available' : 'Unavailable'}
          <span className="ml-auto">
            <VegDot veg={item.isVeg} />
          </span>
        </p>
        <h4 className="text-[15px] font-black text-[#191923] leading-snug truncate mt-0.5">{item.name}</h4>
        <p className="text-base font-black text-[#191923] mt-1">{formatINR(item.basePricePaise)}</p>
        <div className="flex items-center justify-between mt-0.5">
          <span className={`flex items-center gap-1 text-xs font-semibold ${low ? 'text-rose-600' : 'text-gray-500'}`}>
            <Package className="w-3.5 h-3.5" /> Stock: {item.stock ?? '—'}
          </span>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen((o) => !o);
              }}
              className="w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50"
              aria-label="Item actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {open && (
              <div className="absolute right-0 bottom-full mb-1 w-40 bg-white rounded-xl border border-gray-100 shadow-xl p-1 z-20" onClick={(e) => e.stopPropagation()}>
                {(
                  [
                    ['edit', 'Edit', PencilLine],
                    ['duplicate', 'Duplicate', Copy],
                    ['toggle', available ? 'Mark unavailable' : 'Mark available', Check],
                    ['delete', 'Delete', Trash2],
                  ] as const
                ).map(([a, l, I]) => (
                  <button
                    key={a}
                    onClick={() => (setOpen(false), onMenu(item.id, a))}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold ${a === 'delete' ? 'text-rose-600 hover:bg-rose-50' : 'text-gray-700 hover:bg-[#FDEBF1] hover:text-[#800D32]'}`}
                  >
                    <I className="w-3.5 h-3.5" /> {l}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

/* =====================================================================
   PAGE
   ===================================================================== */
export const ItemMenuPage: React.FC = () => {
  const [apiItems, setApiItems] = useState<MenuItem[]>([]);
  const [apiCats, setApiCats] = useState<Category[]>([]);
  const [overlay, setOverlay] = useState<MenuOverlay>(() => readJSON(OVERLAY_KEY, EMPTY_OVERLAY));
  const [favorites, setFavorites] = useState<string[]>(() => readJSON(FAV_KEY, []));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({ status: 'all', type: 'all', lowStock: false, sort: 'name' });
  const [filterOpen, setFilterOpen] = useState(false);

  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [draft, setDraft] = useState<MenuItemX | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [editorTab, setEditorTab] = useState<'details' | 'variants' | 'addons' | 'ingredients'>('details');
  const [activeImg, setActiveImg] = useState(0);
  const [mobileEditor, setMobileEditor] = useState(false);

  const [modal, setModal] = useState<null | 'category' | 'bulk' | 'import' | 'delete' | 'preview'>(null);
  const [deleteId, setDeleteId] = useState<string | undefined>();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const imgInput = useRef<HTMLInputElement>(null);
  const replaceIdx = useRef<number | null>(null);
  const csvInput = useRef<HTMLInputElement>(null);

  const notify = (type: 'success' | 'error', text: string) => setToast({ type, text });
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!writeJSON(OVERLAY_KEY, overlay)) notify('error', 'Storage full — remove some images');
  }, [overlay]);
  useEffect(() => {
    writeJSON(FAV_KEY, favorites);
  }, [favorites]);
  useEffect(() => {
    if (!filterOpen) return;
    const close = () => setFilterOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [filterOpen]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [cats, items] = await Promise.all([apiService.getCategories(), apiService.getMenuItems()]);
      setApiCats(cats);
      setApiItems(items);
    } catch (e) {
      console.error(e);
      setLoadError('Could not load the menu from the server.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  /* ---------- merged data ---------- */
  const { items, categories } = useMemo(() => {
    const del = new Set(overlay.deleted);
    const merged: MenuItemX[] = [
      ...apiItems.filter((i) => !del.has(i.id)).map((i) => ({ ...i, ...(overlay.items[i.id] ?? {}) }) as MenuItemX),
      ...overlay.created.filter((i) => !del.has(i.id)).map((i) => ({ ...i, ...(overlay.items[i.id] ?? {}), isLocal: true })),
    ];
    const ids = new Set(apiCats.map((c) => c.id));
    return { items: merged, categories: [...apiCats, ...overlay.categories.filter((c) => !ids.has(c.id))] };
  }, [apiItems, apiCats, overlay]);

  const catName = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories]);
  const catCount = useMemo(() => {
    const m: Record<string, number> = {};
    items.forEach((i) => (m[i.categoryId] = (m[i.categoryId] ?? 0) + 1));
    return m;
  }, [items]);
  const favSet = useMemo(() => new Set(favorites), [favorites]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter(
      (i) =>
        (category === 'all' || i.categoryId === category) &&
        (filters.status === 'all' || (filters.status === 'available' ? i.available !== false : i.available === false)) &&
        (filters.type === 'all' || (filters.type === 'veg' ? i.isVeg : !i.isVeg)) &&
        (!filters.lowStock || (i.stock !== undefined && i.stock < LOW_STOCK)) &&
        (!q || i.name.toLowerCase().includes(q) || (i.shortCode ?? '').toLowerCase().includes(q))
    );
    const s = filters.sort;
    return list.sort((a, b) =>
      s === 'priceAsc' ? a.basePricePaise - b.basePricePaise : s === 'priceDesc' ? b.basePricePaise - a.basePricePaise : s === 'stock' ? (a.stock ?? 1e9) - (b.stock ?? 1e9) : a.name.localeCompare(b.name)
    );
  }, [items, category, filters, query]);

  const activeFilters = (filters.status !== 'all' ? 1 : 0) + (filters.type !== 'all' ? 1 : 0) + (filters.lowStock ? 1 : 0);

  /* ---------- selection / draft ---------- */
  const openItem = useCallback(
    (id: string, force = false) => {
      if (!force && dirty && !window.confirm('Discard unsaved changes?')) return;
      const it = items.find((i) => i.id === id);
      if (!it) return;
      setSelectedId(id);
      setDraft(structuredClone(it));
      setIsNew(false);
      setDirty(false);
      setActiveImg(0);
      if (window.matchMedia('(max-width: 1279px)').matches) setMobileEditor(true);
    },
    [items, dirty]
  );

  useEffect(() => {
    if (!draft && !isNew && visible[0]) openItem(visible[0].id, true);
  }, [visible, draft, isNew, openItem]);

  const newItem = () => {
    if (dirty && !window.confirm('Discard unsaved changes?')) return;
    const cat = category !== 'all' ? category : categories[0]?.id ?? '';
    setDraft({
      id: `local-${uid()}`,
      outletId: 'default',
      name: '',
      categoryId: cat,
      isVeg: true,
      basePricePaise: 0,
      gstRate: 5,
      shortCode: skuFor('', catName[cat] ?? '', items.length + 1),
      available: true,
      isAvailable: true,
      unit: 'PCS',
      stock: 0,
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as MenuItemX);
    setSelectedId(undefined);
    setIsNew(true);
    setDirty(false);
    setActiveImg(0);
    setEditorTab('details');
    if (window.matchMedia('(max-width: 1279px)').matches) setMobileEditor(true);
  };

  const patch = (p: Partial<MenuItemX>) => {
    setDraft((d) => (d ? { ...d, ...p } : d));
    setDirty(true);
  };

  /* ---------- persistence ---------- */
  const persist = async (it: MenuItemX, created: boolean) => {
    const { isLocal: _l, ...clean } = it;
    setOverlay((o) =>
      created || it.isLocal
        ? { ...o, created: created ? [...o.created, clean] : o.created.map((c) => (c.id === it.id ? clean : c)), items: { ...o.items, [it.id]: {} } }
        : { ...o, items: { ...o.items, [it.id]: clean } }
    );
    try {
      if (created && api.createMenuItem) await api.createMenuItem(clean);
      else if (!created && !it.isLocal && api.updateMenuItem) await api.updateMenuItem(it.id, clean);
    } catch (e) {
      console.error(e);
      notify('error', 'Saved on this device; server update failed');
    }
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.name.trim()) return notify('error', 'Item name is required');
    if (!draft.categoryId) return notify('error', 'Choose a category');
    if (draft.basePricePaise <= 0) return notify('error', 'Enter a price');
    if (draft.shortCode && items.some((i) => i.id !== draft.id && (i.shortCode ?? '').toLowerCase() === draft.shortCode!.toLowerCase()))
      return notify('error', `SKU ${draft.shortCode} is already used`);
    setSaving(true);
    const it = { ...draft, name: draft.name.trim() };
    await persist(it, isNew);
    setSaving(false);
    setIsNew(false);
    setDirty(false);
    setSelectedId(it.id);
    notify('success', isNew ? `${it.name} added` : `${it.name} updated`);
  };

  const duplicate = (src?: MenuItemX) => {
    const base = src ?? draft;
    if (!base) return;
    const copy: MenuItemX = {
      ...structuredClone(base),
      id: `local-${uid()}`,
      name: `${base.name} (Copy)`,
      shortCode: skuFor(base.name, catName[base.categoryId] ?? '', items.length + 1),
      badge: '',
      isLocal: true,
    };
    persist(copy, true);
    setDraft(copy);
    setSelectedId(copy.id);
    setIsNew(false);
    setDirty(false);
    notify('success', 'Item duplicated');
  };

  const removeItem = async (id: string) => {
    const it = items.find((i) => i.id === id);
    setOverlay((o) => ({ ...o, deleted: [...o.deleted, id], created: o.created.filter((c) => c.id !== id) }));
    if (it && !it.isLocal && api.deleteMenuItem) api.deleteMenuItem(id).catch(() => notify('error', 'Server delete failed'));
    if (selectedId === id) {
      setDraft(null);
      setSelectedId(undefined);
      setDirty(false);
      setMobileEditor(false);
    }
    setModal(null);
    notify('success', `${it?.name ?? 'Item'} deleted`);
  };

  const quickPatch = (id: string, p: Partial<MenuItemX>) => {
    const it = items.find((i) => i.id === id);
    if (!it) return;
    persist({ ...it, ...p }, false);
    if (draft?.id === id) setDraft((d) => (d ? { ...d, ...p } : d));
  };

  const onCardMenu = useCallback(
    (id: string, action: 'edit' | 'duplicate' | 'toggle' | 'delete') => {
      const it = items.find((i) => i.id === id);
      if (!it) return;
      if (action === 'edit') openItem(id);
      if (action === 'duplicate') duplicate(it);
      if (action === 'toggle') quickPatch(id, { available: it.available === false });
      if (action === 'delete') (setDeleteId(id), setModal('delete'));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, openItem]
  );
  const toggleFav = useCallback((id: string) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])), []);

  /* ---------- images ---------- */
  const onImageFiles = async (files: FileList | null) => {
    if (!files?.length || !draft) return;
    try {
      const imgs = await Promise.all([...files].slice(0, 5).map((f) => compressImage(f)));
      const list = [...(draft.images ?? [])];
      if (replaceIdx.current !== null) list[replaceIdx.current] = imgs[0];
      else list.push(...imgs);
      patch({ images: list.slice(0, 6) });
      setActiveImg(replaceIdx.current ?? list.length - imgs.length);
    } catch {
      notify('error', 'Could not read that image');
    } finally {
      replaceIdx.current = null;
    }
  };

  /* ---------- categories ---------- */
  const addCategory = async (name: string) => {
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) return notify('error', 'Category already exists');
    let cat: Category = { id: `cat-${uid()}`, name } as Category;
    try {
      if (api.createCategory) cat = await api.createCategory({ name });
    } catch {
      notify('error', 'Saved on this device; server update failed');
    }
    setOverlay((o) => ({ ...o, categories: [...o.categories, cat] }));
    setCategory(cat.id);
    setModal(null);
    notify('success', `Category “${name}” added`);
  };

  /* ---------- bulk + csv ---------- */
  const applyBulk = (b: { pricePct: number; gst: number | null; available: boolean | null; stock: number | null }) => {
    visible.forEach((it) => {
      const p: Partial<MenuItemX> = {};
      if (b.pricePct) p.basePricePaise = Math.max(100, Math.round((it.basePricePaise * (100 + b.pricePct)) / 100 / 100) * 100);
      if (b.gst !== null) p.gstRate = b.gst;
      if (b.available !== null) p.available = b.available;
      if (b.stock !== null) p.stock = b.stock;
      if (Object.keys(p).length) persist({ ...it, ...p }, false);
    });
    setModal(null);
    setDraft(null);
    notify('success', `Updated ${visible.length} item(s)`);
  };

  const exportCsv = () => {
    const rows = [['Name', 'Category', 'Type', 'Price', 'Cost', 'GST %', 'Stock', 'Unit', 'SKU', 'Available', 'Badge', 'Description']];
    visible.forEach((i) =>
      rows.push([i.name, catName[i.categoryId] ?? '', i.isVeg ? 'Veg' : 'Non-Veg', rupees(i.basePricePaise), rupees(i.costPaise), String(i.gstRate), String(i.stock ?? ''), i.unit ?? '', i.shortCode ?? '', i.available === false ? 'No' : 'Yes', i.badge ?? '', i.description ?? ''])
    );
    const url = URL.createObjectURL(new Blob(['﻿' + rows.map((r) => r.map(csvEscape).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu-items.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('success', `Exported ${visible.length} item(s)`);
  };

  const importCsv = async (file: File) => {
    const rows = parseCsv(await file.text());
    if (rows.length < 2) return notify('error', 'CSV has no rows');
    const h = rows[0].map((x) => x.trim().toLowerCase());
    const col = (k: string) => h.findIndex((x) => x.startsWith(k));
    const ci = { name: col('name'), cat: col('categ'), type: col('type'), price: col('price'), cost: col('cost'), gst: col('gst'), stock: col('stock'), unit: col('unit'), sku: col('sku'), avail: col('avail'), badge: col('badge'), desc: col('desc') };
    if (ci.name < 0 || ci.price < 0) return notify('error', 'CSV needs at least Name and Price columns');
    const catByName = Object.fromEntries(categories.map((c) => [c.name.toLowerCase(), c.id]));
    const newCats: Category[] = [];
    let added = 0;
    let updated = 0;
    rows.slice(1).forEach((r) => {
      const get = (i: number) => (i >= 0 ? (r[i] ?? '').trim() : '');
      const name = get(ci.name);
      if (!name) return;
      const cn = get(ci.cat) || 'Uncategorised';
      let catId = catByName[cn.toLowerCase()];
      if (!catId) {
        const c = { id: `cat-${uid()}`, name: cn } as Category;
        newCats.push(c);
        catId = catByName[cn.toLowerCase()] = c.id;
      }
      const sku = get(ci.sku);
      const fields: Partial<MenuItemX> = {
        name,
        categoryId: catId,
        isVeg: !/non/i.test(get(ci.type)),
        basePricePaise: toPaise(get(ci.price)),
        gstRate: Number(get(ci.gst)) || 5,
        ...(get(ci.cost) && { costPaise: toPaise(get(ci.cost)) }),
        ...(get(ci.stock) && { stock: Number(get(ci.stock)) || 0 }),
        ...(get(ci.unit) && { unit: get(ci.unit).toUpperCase() }),
        ...(sku && { shortCode: sku }),
        ...(get(ci.avail) && { available: !/^(no|false|0)$/i.test(get(ci.avail)) }),
        ...(get(ci.badge) && { badge: get(ci.badge) }),
        ...(get(ci.desc) && { description: get(ci.desc).slice(0, 200) }),
      };
      const existing = items.find((i) => (sku && (i.shortCode ?? '').toLowerCase() === sku.toLowerCase()) || i.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        persist({ ...existing, ...fields }, false);
        updated++;
      } else {
        persist({ id: `local-${uid()}`, available: true, unit: 'PCS', ...fields } as MenuItemX, true);
        added++;
      }
    });
    if (newCats.length) setOverlay((o) => ({ ...o, categories: [...o.categories, ...newCats] }));
    setModal(null);
    notify('success', `${added} added · ${updated} updated`);
  };

  /* ---------- editor ---------- */
  const imgs = draft?.images ?? [];
  const mainImg = imgs[activeImg] ?? (draft ? imageOf(draft) : undefined);
  const margin = draft && draft.costPaise && draft.basePricePaise ? Math.round(((draft.basePricePaise - draft.costPaise) / draft.basePricePaise) * 100) : null;

  const editor = draft ? (
    <div className="h-full min-h-0 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {/* Images */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-2 w-16 shrink-0">
            {imgs.map((src, i) => (
              <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-14 rounded-xl overflow-hidden border-2 bg-[#FFF5F8] ${i === activeImg ? 'border-[#C0163F]' : 'border-gray-100'}`}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            {imgs.length < 6 && (
              <button onClick={() => ((replaceIdx.current = null), imgInput.current?.click())} className="w-16 h-14 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#F3C3D2]" aria-label="Add image">
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="relative flex-1 aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-b from-[#FFF0F4] to-[#FFF9FB] flex items-center justify-center">
            {mainImg ? (
              <img src={mainImg} alt={draft.name} className="w-full h-full object-cover" />
            ) : (
              <button onClick={() => imgInput.current?.click()} className="flex flex-col items-center gap-1 text-gray-400">
                <ImagePlus className="w-10 h-10" />
                <span className="text-xs font-bold">Add photo</span>
              </button>
            )}
            {imgs.length > 0 && (
              <>
                <div className="absolute top-2.5 right-2.5 flex gap-2">
                  <button onClick={() => ((replaceIdx.current = activeImg), imgInput.current?.click())} className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-gray-700" aria-label="Replace image">
                    <PencilLine className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      patch({ images: imgs.filter((_, i) => i !== activeImg) });
                      setActiveImg(0);
                    }}
                    className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-rose-600"
                    aria-label="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => setModal('preview')} className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-gray-700" aria-label="Full screen">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Name + availability */}
        <div className="flex items-center gap-2">
          <input value={draft.name} onChange={(e) => patch({ name: e.target.value })} placeholder="Item name" className="flex-1 min-w-0 text-2xl font-black text-[#191923] bg-transparent border-b-2 border-transparent focus:border-[#F3C3D2] focus:outline-none" />
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${draft.available !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            {draft.available !== false ? '✓ Available' : 'Unavailable'}
          </span>
          <button onClick={() => patch({ available: draft.available === false })} className={`relative w-12 h-7 rounded-full shrink-0 ${draft.available !== false ? 'bg-emerald-600' : 'bg-gray-300'}`} aria-label="Toggle availability">
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow ${draft.available !== false ? 'left-6' : 'left-1'}`} />
          </button>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Category</label>
            <select value={draft.categoryId} onChange={(e) => patch({ categoryId: e.target.value })} className={field}>
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Type</label>
            <select value={draft.isVeg ? 'veg' : 'nonveg'} onChange={(e) => patch({ isVeg: e.target.value === 'veg' })} className={field}>
              <option value="veg">🟢 Veg</option>
              <option value="nonveg">🔴 Non-Veg</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={label}>Price (INR)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">₹</span>
              <input inputMode="decimal" value={rupees(draft.basePricePaise)} onChange={(e) => patch({ basePricePaise: toPaise(e.target.value.replace(/[^\d.]/g, '')) })} className={`${field} pl-7`} placeholder="0" />
            </div>
          </div>
          <div>
            <label className={label}>Cost Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">₹</span>
              <input inputMode="decimal" value={rupees(draft.costPaise)} onChange={(e) => patch({ costPaise: toPaise(e.target.value.replace(/[^\d.]/g, '')) || undefined })} className={`${field} pl-7`} placeholder="0" />
            </div>
          </div>
          <div>
            <label className={label}>GST</label>
            <select value={draft.gstRate} onChange={(e) => patch({ gstRate: Number(e.target.value) })} className={field}>
              {GST_RATES.map((g) => (
                <option key={g} value={g}>
                  {g}%
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Stock</label>
            <input inputMode="numeric" value={draft.stock ?? ''} onChange={(e) => patch({ stock: e.target.value === '' ? undefined : Number(e.target.value.replace(/\D/g, '')) })} className={field} placeholder="—" />
          </div>
          <div>
            <label className={label}>Unit</label>
            <select value={draft.unit ?? 'PCS'} onChange={(e) => patch({ unit: e.target.value })} className={field}>
              {UNITS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>SKU</label>
            <div className="relative">
              <input value={draft.shortCode ?? ''} onChange={(e) => patch({ shortCode: e.target.value.toUpperCase() })} className={`${field} pr-9`} />
              <button
                onClick={() => (navigator.clipboard?.writeText(draft.shortCode ?? ''), notify('success', 'SKU copied'))}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#800D32]"
                aria-label="Copy SKU"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        {margin !== null && (
          <p className={`text-xs font-bold ${margin < 30 ? 'text-rose-600' : 'text-emerald-700'}`}>
            Margin {margin}% · Profit {formatINR(draft.basePricePaise - (draft.costPaise ?? 0))} per {draft.unit?.toLowerCase() ?? 'unit'}
          </p>
        )}

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-1 rounded-xl border border-gray-100 p-1">
          {(
            [
              ['details', 'Details'],
              ['variants', 'Variants'],
              ['addons', 'Add-ons'],
              ['ingredients', 'Ingredients'],
            ] as const
          ).map(([k, l]) => (
            <button key={k} onClick={() => setEditorTab(k)} className={`py-2 rounded-lg text-sm font-bold ${editorTab === k ? 'bg-[#FDE3EB] text-[#800D32]' : 'text-[#191923] hover:bg-gray-50'}`}>
              {l}
              {k !== 'details' && (draft[k]?.length ?? 0) > 0 && <span className="ml-1 text-[10px] text-gray-500">({draft[k]!.length})</span>}
            </button>
          ))}
        </div>

        {editorTab === 'details' && (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between">
                <label className={label}>Description</label>
                <span className="text-xs text-gray-400">{(draft.description ?? '').length} / 200</span>
              </div>
              <textarea value={draft.description ?? ''} onChange={(e) => patch({ description: e.target.value.slice(0, 200) })} rows={3} placeholder="Short description shown to guests" className={`${field} resize-none font-medium`} />
            </div>
            <div>
              <label className={label}>Badge</label>
              <div className="flex flex-wrap gap-1.5">
                {BADGES.map((b) => (
                  <button key={b || 'none'} onClick={() => patch({ badge: b })} className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${(draft.badge ?? '') === b ? 'bg-[#800D32] text-white border-[#800D32]' : 'border-gray-200 text-gray-700'}`}>
                    {b || 'None'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {(editorTab === 'variants' || editorTab === 'addons') && (
          <PriceLines
            key={editorTab}
            lines={draft[editorTab] ?? []}
            placeholder={editorTab === 'variants' ? 'Variant (e.g. Large, Double Patty)' : 'Add-on (e.g. Extra Cheese)'}
            hint={editorTab === 'variants' ? 'Variant price replaces the base price.' : 'Add-on price is added on top of the item price.'}
            onChange={(l) => patch({ [editorTab]: l })}
          />
        )}
        {editorTab === 'ingredients' && <IngredientLines lines={draft.ingredients ?? []} onChange={(l) => patch({ ingredients: l })} />}
      </div>

      <div className="p-4 border-t border-gray-100 grid grid-cols-[1fr_1.4fr] gap-2.5">
        {isNew ? (
          <button onClick={() => (setDraft(null), setIsNew(false), setDirty(false), setMobileEditor(false))} className="inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-black text-[#191923]">
            Cancel
          </button>
        ) : dirty ? (
          <button onClick={() => selectedId && openItem(selectedId, true)} className="inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-black text-[#191923]">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        ) : (
          <button onClick={() => duplicate()} className="inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-black text-[#191923] hover:border-[#F3C3D2]">
            <Copy className="w-4 h-4 text-[#800D32]" /> Duplicate
          </button>
        )}
        <button disabled={saving || (!dirty && !isNew)} onClick={save} className="inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#800D32] text-white text-sm font-black hover:bg-[#6a0a29] disabled:opacity-50">
          <Check className="w-4 h-4" /> {isNew ? 'Add Item' : saving ? 'Saving…' : 'Update Item'}
        </button>
      </div>
    </div>
  ) : (
    <div className="h-full bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center p-6">
      <ChefHat className="w-10 h-10 text-rose-200 mb-2" />
      <p className="text-sm font-bold text-gray-600">Select an item to edit</p>
    </div>
  );

  /* ---------- render ---------- */
  return (
    <div className="flex flex-col gap-3 overflow-hidden" style={{ height: `calc(100dvh - var(--pos-offset, ${PAGE_OFFSET}))` }}>
      {toast && (
        <div className={`fixed top-5 right-5 z-[80] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border ${toast.type === 'success' ? 'bg-[#800D32] text-white border-rose-400' : 'bg-white text-rose-700 border-rose-200'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
          {toast.text}
        </div>
      )}
      <input ref={imgInput} type="file" accept="image/*" multiple className="hidden" onChange={(e) => (onImageFiles(e.target.files), (e.target.value = ''))} />
      <input ref={csvInput} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => (e.target.files?.[0] && importCsv(e.target.files[0]), (e.target.value = ''))} />

      {/* ===== Header ===== */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-3 mr-auto">
          <ChefHat className="w-12 h-12 text-[#800D32]" strokeWidth={1.7} />
          <div>
            <h1 className="text-2xl font-black text-[#191923] leading-tight">Item Menu</h1>
            <p className="text-xs text-gray-500 font-medium hidden sm:block">Manage food items, categories, variants, pricing and availability</p>
          </div>
        </div>
        <button onClick={() => setModal('bulk')} className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-[#191923] hover:border-[#F3C3D2]">
          <Upload className="w-4 h-4 text-[#800D32]" /> Bulk Update
        </button>
        <button onClick={() => setModal('import')} className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-[#191923] hover:border-[#F3C3D2]">
          <Download className="w-4 h-4 text-[#800D32]" /> Import / Export
        </button>
        <button onClick={newItem} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#800D32] text-white text-sm font-black shadow-md hover:bg-[#6a0a29]">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* ===== Body ===== */}
      <div className="flex-1 min-h-0 flex gap-3">
        {/* Categories */}
        <aside className="hidden md:flex w-52 xl:w-60 shrink-0 min-h-0 flex-col bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
          <div className="flex items-center gap-2 px-2 py-2">
            <ListIcon className="w-5 h-5 text-[#800D32]" />
            <span className="flex-1 text-sm font-black text-[#191923]">Categories ({categories.length})</span>
            <button onClick={() => setModal('category')} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-[#800D32] hover:bg-[#FFF5F8]" aria-label="Add category">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
            {[{ id: 'all', name: 'All Items', n: items.length, I: LayoutGrid }, ...categories.map((c) => ({ id: c.id, name: c.name, n: catCount[c.id] ?? 0, I: catIcon(c.name) }))].map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-colors ${active ? 'bg-[#800D32] text-white shadow-md' : 'text-[#191923] hover:bg-[#FFF5F8]'}`}
                >
                  <c.I className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-[#800D32]'}`} />
                  <span className="flex-1 text-left truncate">{c.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-lg ${active ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>{c.n}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Items */}
        <section className="flex-1 min-w-0 min-h-0 flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-black text-[#191923]">
              {category === 'all' ? 'All Items' : catName[category]} <span className="text-[#C0163F] font-bold text-base">({visible.length})</span>
            </h2>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="md:hidden px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold">
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="relative flex-1 min-w-[180px] max-w-[380px] ml-auto">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search items (e.g. Burger, Pizza...)" className={`${field} pl-9 font-medium`} />
            </div>
            <div className="inline-flex rounded-xl border border-gray-200 bg-white p-0.5">
              {(['grid', 'list'] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} className={`w-10 h-9 rounded-lg flex items-center justify-center ${view === v ? 'bg-[#800D32] text-white' : 'text-gray-600'}`} aria-label={`${v} view`}>
                  {v === 'grid' ? <LayoutGrid className="w-4 h-4" /> : <ListIcon className="w-4 h-4" />}
                </button>
              ))}
            </div>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterOpen((o) => !o);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-[#191923]"
              >
                <Filter className="w-4 h-4" /> Filter
                {activeFilters > 0 && <span className="w-5 h-5 rounded-full bg-[#800D32] text-white text-[10px] font-black flex items-center justify-center">{activeFilters}</span>}
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-2xl border border-gray-100 shadow-xl p-3 z-30 space-y-3" onClick={(e) => e.stopPropagation()}>
                  {(
                    [
                      ['status', 'Availability', [['all', 'All'], ['available', 'Available'], ['unavailable', 'Unavailable']]],
                      ['type', 'Type', [['all', 'All'], ['veg', 'Veg'], ['nonveg', 'Non-Veg']]],
                      ['sort', 'Sort', [['name', 'Name'], ['priceAsc', 'Price ↑'], ['priceDesc', 'Price ↓'], ['stock', 'Stock ↑']]],
                    ] as const
                  ).map(([k, l, opts]) => (
                    <div key={k}>
                      <p className="text-[10px] font-black uppercase text-gray-400 mb-1">{l}</p>
                      <div className="flex flex-wrap gap-1">
                        {opts.map(([v, t]) => (
                          <button key={v} onClick={() => setFilters((f) => ({ ...f, [k]: v }))} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border ${filters[k] === v ? 'bg-[#800D32] text-white border-[#800D32]' : 'border-gray-200 text-gray-700'}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700">
                    <input type="checkbox" className="w-4 h-4 accent-[#800D32]" checked={filters.lowStock} onChange={(e) => setFilters((f) => ({ ...f, lowStock: e.target.checked }))} /> Low stock only (&lt; {LOW_STOCK})
                  </label>
                  <button onClick={() => setFilters({ status: 'all', type: 'all', lowStock: false, sort: 'name' })} className="w-full py-2 rounded-lg text-xs font-bold text-gray-500 hover:text-[#800D32]">
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            {loading && !items.length ? (
              <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-[260px] rounded-2xl bg-gray-100" />
                ))}
              </div>
            ) : loadError && !items.length ? (
              <div className="py-16 text-center">
                <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-700">{loadError}</p>
                <button onClick={load} className="mt-3 px-4 py-2 rounded-xl bg-[#800D32] text-white text-xs font-bold">
                  Retry
                </button>
              </div>
            ) : visible.length === 0 ? (
              <div className="py-16 text-center text-sm font-bold text-gray-500">No items found.</div>
            ) : view === 'grid' ? (
              <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]">
                {visible.map((i) => (
                  <ItemCard key={i.id} item={i} selected={i.id === (draft?.id ?? selectedId)} fav={favSet.has(i.id)} onSelect={openItem} onFav={toggleFav} onMenu={onCardMenu} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#FFF5F8] text-left text-xs font-black text-[#800D32]">
                    <tr>
                      <th className="px-3 py-3">Item</th>
                      <th className="px-3 py-3">Category</th>
                      <th className="px-3 py-3 text-right">Price</th>
                      <th className="px-3 py-3 text-center">GST</th>
                      <th className="px-3 py-3 text-center">Stock</th>
                      <th className="px-3 py-3">SKU</th>
                      <th className="px-3 py-3 text-center">Available</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {visible.map((i) => {
                      const img = imageOf(i);
                      return (
                        <tr key={i.id} onClick={() => openItem(i.id)} className={`cursor-pointer hover:bg-gray-50 ${i.id === draft?.id ? 'bg-[#FFF7FA]' : ''}`}>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2.5">
                              <span className="w-10 h-10 rounded-lg bg-[#FFF5F8] overflow-hidden flex items-center justify-center shrink-0">
                                {img ? <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" /> : <span className="text-xl">{itemEmoji(i.name)}</span>}
                              </span>
                              <VegDot veg={i.isVeg} />
                              <span className="font-bold text-[#191923]">{i.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-gray-600">{catName[i.categoryId] ?? '—'}</td>
                          <td className="px-3 py-2 text-right font-black">{formatINR(i.basePricePaise)}</td>
                          <td className="px-3 py-2 text-center text-gray-600">{i.gstRate}%</td>
                          <td className={`px-3 py-2 text-center font-bold ${i.stock !== undefined && i.stock < LOW_STOCK ? 'text-rose-600' : 'text-gray-700'}`}>{i.stock ?? '—'}</td>
                          <td className="px-3 py-2 font-mono text-xs text-gray-600">{i.shortCode ?? '—'}</td>
                          <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => quickPatch(i.id, { available: i.available === false })} className={`relative w-10 h-6 rounded-full ${i.available !== false ? 'bg-emerald-600' : 'bg-gray-300'}`} aria-label="Toggle availability">
                              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow ${i.available !== false ? 'left-5' : 'left-1'}`} />
                            </button>
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

        {/* Editor */}
        <aside className="hidden xl:flex w-[400px] 2xl:w-[460px] shrink-0 min-h-0 flex-col">{editor}</aside>
      </div>

      {/* ===== Modals ===== */}
      <Modal open={mobileEditor && !!draft && !modal} onClose={() => (dirty && !window.confirm('Discard unsaved changes?') ? undefined : (setMobileEditor(false), setDirty(false)))} title={isNew ? 'Add Item' : draft?.name || 'Edit Item'} width="max-w-lg">
        <div className="h-[75dvh] -mx-5 -my-4">{editor}</div>
      </Modal>

      <Modal open={modal === 'preview'} onClose={() => setModal(null)} title={draft?.name ?? ''} width="max-w-3xl">
        {mainImg && <img src={mainImg} alt={draft?.name} className="w-full rounded-xl object-contain max-h-[70dvh]" />}
      </Modal>

      <Modal open={modal === 'category'} onClose={() => setModal(null)} title="Add Category">
        <SingleInput placeholder="Category name (e.g. Wraps)" cta="Add Category" onSubmit={addCategory} />
      </Modal>

      <Modal open={modal === 'bulk'} onClose={() => setModal(null)} title="Bulk Update" subtitle={`Applies to the ${visible.length} item(s) currently shown`}>
        <BulkForm count={visible.length} onApply={applyBulk} />
      </Modal>

      <Modal open={modal === 'import'} onClose={() => setModal(null)} title="Import / Export" subtitle="CSV works with Excel and Google Sheets">
        <div className="space-y-3">
          <button onClick={() => csvInput.current?.click()} className="w-full flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left hover:border-[#F3C3D2]">
            <Upload className="w-6 h-6 text-[#800D32]" />
            <span>
              <span className="block text-sm font-black text-[#191923]">Import CSV</span>
              <span className="block text-xs text-gray-500">Name and Price required. Matches existing items by SKU or name; new categories are created.</span>
            </span>
          </button>
          <button onClick={() => (exportCsv(), setModal(null))} className="w-full flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left hover:border-[#F3C3D2]">
            <Download className="w-6 h-6 text-[#800D32]" />
            <span>
              <span className="block text-sm font-black text-[#191923]">Export {visible.length} item(s)</span>
              <span className="block text-xs text-gray-500">Uses the current category, search and filters. The same columns can be re-imported.</span>
            </span>
          </button>
        </div>
      </Modal>

      <Modal open={modal === 'delete'} onClose={() => setModal(null)} title={`Delete ${items.find((i) => i.id === deleteId)?.name ?? 'item'}?`}>
        <p className="text-sm text-gray-600 mb-4">It will be removed from the menu. Past orders and bills are not affected.</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setModal(null)} className="py-2.5 rounded-xl border border-gray-200 text-sm font-bold">
            Cancel
          </button>
          <button onClick={() => deleteId && removeItem(deleteId)} className="py-2.5 rounded-xl bg-rose-600 text-white text-sm font-black">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

/* =====================================================================
   SUB-COMPONENTS
   ===================================================================== */
const SingleInput = ({ placeholder, cta, onSubmit }: { placeholder: string; cta: string; onSubmit: (v: string) => void }) => {
  const [v, setV] = useState('');
  return (
    <div className="space-y-3">
      <input autoFocus value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && v.trim() && onSubmit(v.trim())} placeholder={placeholder} className={field} />
      <button disabled={!v.trim()} onClick={() => onSubmit(v.trim())} className="w-full py-3 rounded-xl bg-[#800D32] text-white text-sm font-black disabled:opacity-50">
        {cta}
      </button>
    </div>
  );
};

const PriceLines = ({ lines, placeholder, hint, onChange }: { lines: PriceLine[]; placeholder: string; hint: string; onChange: (l: PriceLine[]) => void }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const add = () => {
    if (!name.trim() || !price) return;
    onChange([...lines, { id: uid(), name: name.trim(), pricePaise: toPaise(price) }]);
    setName('');
    setPrice('');
  };
  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={placeholder} className={`${field} flex-1`} />
        <input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ''))} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="₹" inputMode="decimal" className={`${field} w-24`} />
        <button onClick={add} className="px-3 rounded-xl bg-[#800D32] text-white" aria-label="Add">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[11px] text-gray-400">{hint}</p>
      {lines.length > 0 && (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100">
          {lines.map((l) => (
            <li key={l.id} className="flex items-center gap-2 px-3 py-2 text-sm">
              <span className="flex-1 font-semibold">{l.name}</span>
              <span className="font-black">{formatINR(l.pricePaise)}</span>
              <button onClick={() => onChange(lines.filter((x) => x.id !== l.id))} className="text-gray-400 hover:text-rose-600" aria-label="Remove">
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const IngredientLines = ({ lines, onChange }: { lines: Ingredient[]; onChange: (l: Ingredient[]) => void }) => {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const add = () => {
    if (!name.trim()) return;
    onChange([...lines, { id: uid(), name: name.trim(), qty: qty.trim() }]);
    setName('');
    setQty('');
  };
  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ingredient (e.g. Bun)" className={`${field} flex-1`} />
        <input value={qty} onChange={(e) => setQty(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Qty (e.g. 1 pc, 120 g)" className={`${field} w-36`} />
        <button onClick={add} className="px-3 rounded-xl bg-[#800D32] text-white" aria-label="Add">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {lines.length === 0 ? (
        <p className="text-xs text-gray-400">List ingredients for recipe costing and allergen info.</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100">
          {lines.map((l) => (
            <li key={l.id} className="flex items-center gap-2 px-3 py-2 text-sm">
              <span className="flex-1 font-semibold">{l.name}</span>
              <span className="text-gray-500">{l.qty}</span>
              <button onClick={() => onChange(lines.filter((x) => x.id !== l.id))} className="text-gray-400 hover:text-rose-600" aria-label="Remove">
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const BulkForm = ({ count, onApply }: { count: number; onApply: (b: { pricePct: number; gst: number | null; available: boolean | null; stock: number | null }) => void }) => {
  const [pricePct, setPricePct] = useState('');
  const [gst, setGst] = useState<string>('');
  const [avail, setAvail] = useState<string>('');
  const [stock, setStock] = useState('');
  const pct = Number(pricePct) || 0;
  const nothing = !pct && gst === '' && avail === '' && stock === '';
  return (
    <div className="space-y-4">
      <div>
        <label className={label}>Change price by %</label>
        <div className="flex gap-1.5 mb-1.5">
          {[-10, -5, 5, 10].map((p) => (
            <button key={p} onClick={() => setPricePct(String(p))} className={`flex-1 py-1.5 rounded-lg border text-xs font-black ${pct === p ? 'bg-[#800D32] text-white border-[#800D32]' : 'border-gray-200'}`}>
              {p > 0 ? `+${p}` : p}%
            </button>
          ))}
        </div>
        <input value={pricePct} onChange={(e) => setPricePct(e.target.value.replace(/[^\d.-]/g, ''))} placeholder="Custom % (e.g. 8 or -5)" className={field} />
        <p className="text-[11px] text-gray-400 mt-1">New prices are rounded to the nearest rupee.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Set GST</label>
          <select value={gst} onChange={(e) => setGst(e.target.value)} className={field}>
            <option value="">No change</option>
            {GST_RATES.map((g) => (
              <option key={g} value={g}>
                {g}%
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Availability</label>
          <select value={avail} onChange={(e) => setAvail(e.target.value)} className={field}>
            <option value="">No change</option>
            <option value="yes">Available</option>
            <option value="no">Unavailable</option>
          </select>
        </div>
      </div>
      <div>
        <label className={label}>Set stock</label>
        <input value={stock} onChange={(e) => setStock(e.target.value.replace(/\D/g, ''))} placeholder="No change" inputMode="numeric" className={field} />
      </div>
      <button
        disabled={nothing || count === 0}
        onClick={() => onApply({ pricePct: pct, gst: gst === '' ? null : Number(gst), available: avail === '' ? null : avail === 'yes', stock: stock === '' ? null : Number(stock) })}
        className="w-full py-3 rounded-xl bg-[#800D32] text-white text-sm font-black inline-flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Wand2 className="w-4 h-4" /> Apply to {count} item(s)
      </button>
    </div>
  );
};

export const MenuItemsPage = ItemMenuPage;
export default ItemMenuPage;