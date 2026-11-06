import React, { useMemo, useState } from 'react';
import {
  Utensils,
  Package,
  Layers,
  Star,
  AlertTriangle,
  Plus,
  Upload,
  Download,
  Search,
  ChevronDown,
  LayoutGrid,
  List,
  Edit2,
  Copy,
  Trash2,
  Check,
  Camera,
  Coffee,
  Sparkles,
  Pizza,
  Sandwich,
  Flame,
  Cake,
  FolderTree,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

// Food Assets
import classicBurgerImg from '../assets/3d/classic_burger.png';
import butterChickenImg from '../assets/3d/butter_chicken.png';
import paneerTikkaImg from '../assets/3d/paneer_tikka.png';
import chickenRiceBowlImg from '../assets/3d/chicken_rice_bowl.png';
import pepperoniPizzaImg from '../assets/3d/pepperoni_pizza.png';
import recentDrinkImg from '../assets/3d/recent_drink.png';
import berryCheesecakeImg from '../assets/3d/berry_cheesecake.png';

export interface Variant {
  id: string;
  name: string;
  price: number;
}

export interface MenuItemRow {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number | 'unlimited';
  status: boolean; // active/available
  type: 'veg' | 'non-veg';
  badge?: 'Bestseller' | 'Popular' | 'New';
  image: string;
  variants: Variant[];
}

const SEED_CATEGORIES = [
  { id: 'all', name: 'All Items', count: 248, icon: LayoutGrid },
  { id: 'bestsellers', name: 'Bestsellers', count: 36, icon: Star },
  { id: 'main_course', name: 'Main Course', count: 48, icon: Utensils },
  { id: 'starters', name: 'Starters', count: 32, icon: Flame },
  { id: 'burgers', name: 'Burgers', count: 24, icon: Sandwich },
  { id: 'pizza', name: 'Pizza', count: 18, icon: Pizza },
  { id: 'beverages', name: 'Beverages', count: 26, icon: Coffee },
  { id: 'desserts', name: 'Desserts', count: 20, icon: Cake },
  { id: 'combos', name: 'Combos', count: 12, icon: Package },
  { id: 'tandoor', name: 'Tandoor', count: 16, icon: Sparkles },
];

const SEED_ITEMS: MenuItemRow[] = [
  {
    id: 'item-1',
    name: 'Cheese Burger',
    category: 'Burgers',
    price: 220,
    stock: 'unlimited',
    status: true,
    type: 'veg',
    badge: 'Bestseller',
    image: classicBurgerImg,
    variants: [
      { id: 'v1', name: 'Regular', price: 220 },
      { id: 'v2', name: 'Double Cheese', price: 290 },
    ],
  },
  {
    id: 'item-2',
    name: 'Butter Chicken',
    category: 'Main Course',
    price: 390,
    stock: 42,
    status: true,
    type: 'non-veg',
    badge: 'Popular',
    image: butterChickenImg,
    variants: [
      { id: 'v1', name: 'Half', price: 390 },
      { id: 'v2', name: 'Full', price: 680 },
    ],
  },
  {
    id: 'item-3',
    name: 'Paneer Tikka',
    category: 'Starters',
    price: 280,
    stock: 28,
    status: true,
    type: 'veg',
    image: paneerTikkaImg,
    variants: [
      { id: 'v1', name: '6 Pcs', price: 280 },
      { id: 'v2', name: '10 Pcs', price: 420 },
    ],
  },
  {
    id: 'item-4',
    name: 'Chicken Biryani',
    category: 'Main Course',
    price: 340,
    stock: 36,
    status: true,
    type: 'non-veg',
    badge: 'Bestseller',
    image: chickenRiceBowlImg,
    variants: [
      { id: 'v1', name: 'Regular', price: 340 },
      { id: 'v2', name: 'Family Pack', price: 790 },
    ],
  },
  {
    id: 'item-5',
    name: 'Margherita Pizza',
    category: 'Pizza',
    price: 420,
    stock: 'unlimited',
    status: true,
    type: 'veg',
    image: pepperoniPizzaImg,
    variants: [
      { id: 'v1', name: 'Medium 8"', price: 420 },
      { id: 'v2', name: 'Large 12"', price: 620 },
    ],
  },
  {
    id: 'item-6',
    name: 'Cold Coffee',
    category: 'Beverages',
    price: 160,
    stock: 24,
    status: true,
    type: 'veg',
    badge: 'Popular',
    image: recentDrinkImg,
    variants: [
      { id: 'v1', name: 'Regular', price: 160 },
      { id: 'v2', name: 'With Ice Cream', price: 210 },
    ],
  },
  {
    id: 'item-7',
    name: 'Gulab Jamun',
    category: 'Desserts',
    price: 120,
    stock: 18,
    status: true,
    type: 'veg',
    image: berryCheesecakeImg,
    variants: [{ id: 'v1', name: '2 Pcs', price: 120 }],
  },
];

export const ItemMenuPage: React.FC = () => {
  const [items, setItems] = useState<MenuItemRow[]>(SEED_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItemId, setSelectedItemId] = useState<string>('item-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Edit / Form state (linked to selected item in right sidebar)
  const selectedItem = useMemo(() => {
    return items.find((i) => i.id === selectedItemId) || items[0];
  }, [items, selectedItemId]);

  const [editName, setEditName] = useState(selectedItem?.name || '');
  const [editCategory, setEditCategory] = useState(selectedItem?.category || 'Burgers');
  const [editType, setEditType] = useState<'veg' | 'non-veg'>(selectedItem?.type || 'veg');
  const [editPrice, setEditPrice] = useState<number>(selectedItem?.price || 220);
  const [editUnlimitedStock, setEditUnlimitedStock] = useState<boolean>(selectedItem?.stock === 'unlimited');
  const [editStock, setEditStock] = useState<number>(typeof selectedItem?.stock === 'number' ? selectedItem.stock : 20);
  const [editBadge, setEditBadge] = useState<string>(selectedItem?.badge || 'Bestseller');
  const [variantsList, setVariantsList] = useState<Variant[]>(selectedItem?.variants || []);

  // Sync edit form whenever selected item changes
  const handleSelectItem = (item: MenuItemRow) => {
    setSelectedItemId(item.id);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditType(item.type);
    setEditPrice(item.price);
    setEditUnlimitedStock(item.stock === 'unlimited');
    setEditStock(typeof item.stock === 'number' ? item.stock : 20);
    setEditBadge(item.badge || '');
    setVariantsList(item.variants || []);
  };

  // Toggle item status switch
  const handleToggleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: !it.status } : it))
    );
  };

  // Duplicate item
  const handleDuplicate = (item: MenuItemRow, e: React.MouseEvent) => {
    e.stopPropagation();
    const copy: MenuItemRow = {
      ...item,
      id: `item-${Date.now()}`,
      name: `${item.name} (Copy)`,
    };
    setItems((prev) => [copy, ...prev]);
    handleSelectItem(copy);
  };

  // Delete item
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (selectedItemId === id) {
      const remaining = items.filter((it) => it.id !== id);
      if (remaining.length) handleSelectItem(remaining[0]);
    }
  };

  // Save changes from Right Sidebar
  const handleSaveChanges = () => {
    if (!selectedItem) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === selectedItem.id
          ? {
              ...it,
              name: editName,
              category: editCategory,
              type: editType,
              price: Number(editPrice) || 0,
              stock: editUnlimitedStock ? 'unlimited' : Number(editStock) || 0,
              badge: (editBadge as any) || undefined,
              variants: variantsList,
            }
          : it
      )
    );
    alert('Changes saved successfully!');
  };

  // Add new variant
  const handleAddVariant = () => {
    const newV: Variant = {
      id: `v-${Date.now()}`,
      name: 'New Size',
      price: editPrice + 50,
    };
    setVariantsList((prev) => [...prev, newV]);
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'bestsellers' && it.badge !== 'Bestseller') return false;
        if (selectedCategory === 'main_course' && it.category !== 'Main Course') return false;
        if (selectedCategory === 'starters' && it.category !== 'Starters') return false;
        if (selectedCategory === 'burgers' && it.category !== 'Burgers') return false;
        if (selectedCategory === 'pizza' && it.category !== 'Pizza') return false;
        if (selectedCategory === 'beverages' && it.category !== 'Beverages') return false;
        if (selectedCategory === 'desserts' && it.category !== 'Desserts') return false;
      }
      if (availabilityFilter === 'available' && !it.status) return false;
      if (availabilityFilter === 'unavailable' && it.status) return false;
      if (typeFilter !== 'all' && it.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return it.name.toLowerCase().includes(q) || it.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, selectedCategory, availabilityFilter, typeFilter, searchQuery]);

  return (
    <div className="flex flex-col gap-3.5 font-sans text-[#191923] select-none pb-2 h-full overflow-hidden">
      {/* Top Header Metrics Row (Swipeable on mobile) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto scrollbar-none snap-x max-w-full pb-0.5">
          {/* Total Items */}
          <div className="shrink-0 snap-start bg-white rounded-2xl border border-gray-100 p-2 sm:p-2.5 px-3 shadow-xs flex items-center gap-2.5 sm:gap-3 min-w-[120px] sm:min-w-[130px]">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-[#00C060] flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-black text-gray-900 leading-none">248</p>
              <p className="text-[10px] font-semibold text-gray-500 mt-1 whitespace-nowrap">Total Items</p>
            </div>
          </div>

          {/* Categories */}
          <div className="shrink-0 snap-start bg-white rounded-2xl border border-gray-100 p-2 sm:p-2.5 px-3 shadow-xs flex items-center gap-2.5 sm:gap-3 min-w-[120px] sm:min-w-[130px]">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-black text-gray-900 leading-none">12</p>
              <p className="text-[10px] font-semibold text-gray-500 mt-1 whitespace-nowrap">Categories</p>
            </div>
          </div>

          {/* Variants */}
          <div className="shrink-0 snap-start bg-white rounded-2xl border border-gray-100 p-2 sm:p-2.5 px-3 shadow-xs flex items-center gap-2.5 sm:gap-3 min-w-[120px] sm:min-w-[130px]">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-black text-gray-900 leading-none">18</p>
              <p className="text-[10px] font-semibold text-gray-500 mt-1 whitespace-nowrap">Variants</p>
            </div>
          </div>

          {/* Bestsellers */}
          <div className="shrink-0 snap-start bg-white rounded-2xl border border-gray-100 p-2 sm:p-2.5 px-3 shadow-xs flex items-center gap-2.5 sm:gap-3 min-w-[120px] sm:min-w-[130px]">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-[#00C060] flex items-center justify-center shrink-0">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-black text-gray-900 leading-none">36</p>
              <p className="text-[10px] font-semibold text-gray-500 mt-1 whitespace-nowrap">Bestsellers</p>
            </div>
          </div>

          {/* Low Stock */}
          <div className="shrink-0 snap-start bg-white rounded-2xl border border-gray-100 p-2 sm:p-2.5 px-3 shadow-xs flex items-center gap-2.5 sm:gap-3 min-w-[120px] sm:min-w-[130px]">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-black text-gray-900 leading-none">6</p>
              <p className="text-[10px] font-semibold text-gray-500 mt-1 whitespace-nowrap">Low Stock</p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Add Item | Import | Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newItem: MenuItemRow = {
                id: `item-${Date.now()}`,
                name: 'New Dish',
                category: 'Main Course',
                price: 250,
                stock: 'unlimited',
                status: true,
                type: 'veg',
                image: classicBurgerImg,
                variants: [],
              };
              setItems((prev) => [newItem, ...prev]);
              handleSelectItem(newItem);
              setMobileDrawerOpen(true);
            }}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#00C060] text-white text-xs font-black hover:bg-[#00a854] shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>

          <button
            onClick={() => alert('Import CSV/Excel')}
            className="hidden sm:flex px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-gray-500" />
            <span>Import</span>
          </button>

          <button
            onClick={() => alert('Export Menu')}
            className="hidden sm:flex px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Area: Categories Sidebar (Left) + Items Table (Center) + Edit Item Sidebar (Right) */}
      <div className="flex-1 min-h-0 flex gap-3.5 overflow-hidden">
        {/* Left Categories Sidebar (Desktop only) */}
        <div className="hidden md:flex w-[180px] xl:w-[200px] bg-white rounded-2xl border border-gray-200 shadow-sm flex-col p-3 shrink-0 h-full overflow-hidden">
          <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
            <span className="text-xs font-black text-gray-900">Categories (12)</span>
            <button
              onClick={() => alert('Add New Category')}
              className="w-6 h-6 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500"
              title="Add Category"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-none py-2 space-y-1">
            {SEED_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                    isSelected
                      ? 'bg-[#E7F9F0] text-[#00C060] font-black'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <cat.icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#00C060]' : 'text-gray-400'}`} />
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-md font-semibold ${
                      isSelected ? 'bg-white text-[#00C060]' : 'text-gray-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => alert('Manage Categories')}
            className="w-full py-2 mt-auto border-t border-gray-100 text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1.5"
          >
            <FolderTree className="w-3.5 h-3.5 text-gray-400" />
            <span>Manage Categories</span>
          </button>
        </div>

        {/* Center: Search & Filter bar + Table of Items */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col p-3 sm:p-3.5 h-full overflow-hidden">
          {/* Mobile Categories Carousel */}
          <div className="md:hidden flex items-center gap-1.5 overflow-x-auto scrollbar-none snap-x pb-2.5 border-b border-gray-100 shrink-0">
            {SEED_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#00C060] text-white shadow-xs'
                      : 'bg-gray-50 border border-gray-200 text-gray-600'
                  }`}
                >
                  <cat.icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                    ({cat.count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Top Controls: Search + Availability Dropdown + Type Dropdown + Grid/List View */}
          <div className="flex items-center justify-between gap-2.5 py-2.5 border-b border-gray-100 flex-wrap shrink-0">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#00C060] bg-gray-50/60"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Availability Filter */}
              <div className="relative">
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                  className="appearance-none pl-3 pr-7 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-white focus:outline-none cursor-pointer"
                >
                  <option value="all">Availability: All</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Type Filter */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="appearance-none pl-3 pr-7 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-white focus:outline-none cursor-pointer"
                >
                  <option value="all">Type: All</option>
                  <option value="veg">Veg</option>
                  <option value="non-veg">Non-Veg</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-50 p-0.5 rounded-xl border border-gray-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-[#00C060] text-white shadow-xs' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'table' ? 'bg-[#00C060] text-white shadow-xs' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Table View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === 'table' ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-white border-b border-gray-100 z-10 text-gray-400 font-bold">
                  <tr>
                    <th className="py-2.5 px-3 w-8">
                      <input type="checkbox" className="rounded accent-[#00C060]" />
                    </th>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">Stock</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredItems.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => {
                          handleSelectItem(item);
                          setMobileDrawerOpen(true);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#E7F9F0]/60 border-y border-[#00C060]/30'
                            : 'hover:bg-gray-50/70'
                        }`}
                      >
                        <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded accent-[#00C060]" />
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-9 h-9 rounded-lg object-cover bg-white p-0.5 border border-gray-200 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{item.name}</span>
                                {item.badge && (
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      item.badge === 'Bestseller'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                                <span
                                  className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    item.type === 'veg'
                                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                      : 'text-rose-700 bg-rose-50 border border-rose-200'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      item.type === 'veg' ? 'bg-emerald-600' : 'bg-rose-600'
                                    }`}
                                  />
                                  {item.type === 'veg' ? 'Veg' : 'Non-Veg'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-gray-600">{item.category}</td>
                        <td className="py-2.5 px-3 font-black text-gray-900">
                          ₹{item.price.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-gray-700">
                          {item.stock === 'unlimited' ? '∞' : item.stock}
                        </td>
                        <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleToggleStatus(item.id, e)}
                            className={`w-8 h-4.5 rounded-full p-0.5 transition-colors relative ${
                              item.status ? 'bg-[#00C060]' : 'bg-gray-300'
                            }`}
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                                item.status ? 'translate-x-3.5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5 text-gray-400">
                            <button
                              onClick={() => handleSelectItem(item)}
                              className="hover:text-gray-700"
                              title="Edit Item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDuplicate(item, e)}
                              className="hover:text-gray-700"
                              title="Duplicate"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(item.id, e)}
                              className="hover:text-rose-600"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredItems.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        handleSelectItem(item);
                        setMobileDrawerOpen(true);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer bg-white relative shadow-xs flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#00C060] ring-2 ring-[#00C060]/20'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex gap-2.5 items-start">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover bg-white p-0.5 border border-gray-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
                          <span className="text-[10px] text-gray-400 block mb-1">{item.category}</span>
                          <span className="text-xs font-black text-gray-900">₹{item.price.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-50 flex items-center justify-between mt-2">
                        <span
                          className={`text-[10px] font-bold ${
                            item.type === 'veg' ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          ● {item.type === 'veg' ? 'Veg' : 'Non-Veg'}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-500">
                          Stock: {item.stock === 'unlimited' ? '∞' : item.stock}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Table Bottom Pagination Bar */}
          <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-semibold">
            <span>Showing 1-7 of 248 items</span>
            <div className="flex items-center gap-1">
              <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-gray-400">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="w-6 h-6 rounded bg-[#00C060] text-white font-bold flex items-center justify-center">
                1
              </button>
              <button className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center">
                2
              </button>
              <button className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center">
                3
              </button>
              <button className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center">
                4
              </button>
              <button className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center">
                5
              </button>
              <span>...</span>
              <button className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center">
                36
              </button>
              <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-gray-400">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Edit Item Sidebar (Desktop only; Mobile uses bottom sheet drawer) */}
        <div className="hidden lg:flex w-[300px] xl:w-[330px] bg-white rounded-2xl border border-gray-200 shadow-sm flex-col p-4 shrink-0 h-full overflow-hidden">
          {selectedItem ? (
            <div className="flex flex-col h-full min-h-0">
              {/* Header */}
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <Edit2 className="w-4 h-4 text-gray-700" />
                <h3 className="text-sm font-black text-gray-900">Edit Item</h3>
              </div>

              {/* Form Body */}
              <div className="py-3 flex-1 min-h-0 overflow-y-auto space-y-3.5 text-xs">
                {/* Photo & Item Name */}
                <div className="flex gap-3 items-center">
                  <div className="relative w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 p-1 shrink-0 flex items-center justify-center">
                    <img
                      src={selectedItem.image}
                      alt="Product"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      className="absolute bottom-0 right-0 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white"
                      title="Change Image"
                    >
                      <Camera className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Item Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00C060] font-bold"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full appearance-none p-2 pr-7 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none bg-white cursor-pointer"
                    >
                      <option>Burgers</option>
                      <option>Main Course</option>
                      <option>Starters</option>
                      <option>Pizza</option>
                      <option>Beverages</option>
                      <option>Desserts</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Type: Veg / Non-Veg */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditType('veg')}
                      className={`py-1.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        editType === 'veg'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span>Veg</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditType('non-veg')}
                      className={`py-1.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        editType === 'non-veg'
                          ? 'bg-rose-50 border-rose-300 text-rose-800'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-600" />
                      <span>Non-Veg</span>
                    </button>
                  </div>
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Price (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00C060] font-black"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">Stock</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        disabled={editUnlimitedStock}
                        value={editUnlimitedStock ? '∞' : editStock}
                        onChange={(e) => setEditStock(Number(e.target.value) || 0)}
                        className="w-16 text-xs p-2 rounded-xl border border-gray-200 focus:outline-none font-bold text-center disabled:bg-gray-100 disabled:text-gray-400"
                      />
                      <label className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editUnlimitedStock}
                          onChange={(e) => setEditUnlimitedStock(e.target.checked)}
                          className="rounded accent-[#00C060]"
                        />
                        <span>Unlimited</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Variants Section */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-gray-700">
                      Variants ({variantsList.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="text-[11px] font-black text-[#00C060] hover:underline flex items-center gap-0.5"
                    >
                      + Add Variant
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {variantsList.map((v, i) => (
                      <div
                        key={v.id || i}
                        className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-200"
                      >
                        <span className="font-bold text-gray-800 text-xs">{v.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-gray-900">₹{v.price.toFixed(2)}</span>
                          <button
                            onClick={() =>
                              setVariantsList((prev) => prev.filter((_, idx) => idx !== i))
                            }
                            className="text-gray-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular & Tags */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Popular & Tags
                  </label>
                  <div className="flex items-center gap-3 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editBadge === 'Bestseller'}
                        onChange={(e) => setEditBadge(e.target.checked ? 'Bestseller' : '')}
                        className="rounded accent-[#00C060]"
                      />
                      <span className="font-semibold text-gray-700">Bestseller</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editBadge === 'Popular'}
                        onChange={(e) => setEditBadge(e.target.checked ? 'Popular' : '')}
                        className="rounded accent-[#00C060]"
                      />
                      <span className="font-semibold text-gray-700">Popular</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editBadge === 'New'}
                        onChange={(e) => setEditBadge(e.target.checked ? 'New' : '')}
                        className="rounded accent-[#00C060]"
                      />
                      <span className="font-semibold text-gray-700">New</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Bottom Buttons: Cancel | Save Changes */}
              <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 mt-auto">
                <button
                  type="button"
                  onClick={() => handleSelectItem(selectedItem)}
                  className="py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="py-2.5 rounded-xl bg-[#00C060] text-white text-xs font-black hover:bg-[#00a854] shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
              <Utensils className="w-8 h-8 text-gray-300 mb-1" />
              <p className="text-xs font-bold text-gray-600">No item selected</p>
            </div>
          )}
        </div>
      </div>

      {/* ================= MOBILE BOTTOM FLOATING ITEM BAR & SLIDE-UP DRAWER ================= */}
      {selectedItem && (
        <>
          {/* Floating Mobile Bar above bottom navigation */}
          <div className="lg:hidden fixed bottom-14 left-2 right-2 z-40 bg-white/98 backdrop-blur-lg rounded-2xl border border-slate-200/90 shadow-[0_6px_24px_rgba(0,0,0,0.12)] p-2.5 flex items-center justify-between gap-2.5">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="flex items-center gap-2.5 min-w-0 text-left flex-1"
            >
              <img
                src={selectedItem.image}
                alt="Product"
                className="w-9 h-9 rounded-xl object-cover bg-gray-50 border border-gray-200 p-0.5 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-gray-900 leading-none">{selectedItem.name}</span>
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[9px] font-bold ${
                      selectedItem.type === 'veg'
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                        : 'text-rose-700 bg-rose-50 border border-rose-200'
                    }`}
                  >
                    {selectedItem.type === 'veg' ? 'Veg' : 'Non-Veg'}
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-gray-500 truncate mt-0.5">
                  ₹{selectedItem.price.toFixed(2)} • {selectedItem.category} • {selectedItem.status ? 'Available' : 'Unavailable'}
                </p>
              </div>
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="px-2.5 py-1.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold bg-white hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={(e) => handleToggleStatus(selectedItem.id, e)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-xs flex items-center gap-1 ${
                  selectedItem.status
                    ? 'bg-[#00C060] text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{selectedItem.status ? 'Active' : 'Off'}</span>
              </button>
            </div>
          </div>

          {/* Mobile Bottom Sheet Drawer for Item Editing */}
          {mobileDrawerOpen && (
            <div
              className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end justify-center"
              onClick={(e) => e.target === e.currentTarget && setMobileDrawerOpen(false)}
            >
              <div className="w-full bg-white rounded-t-3xl max-h-[85dvh] flex flex-col shadow-2xl border-t border-gray-100 animate-in slide-in-from-bottom duration-300">
                {/* Drag handle */}
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-2.5 mb-1" />

                {/* Header */}
                <div className="px-4 py-2.5 flex items-center justify-between border-b border-gray-100 shrink-0">
                  <div className="flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-gray-700" />
                    <h3 className="text-sm font-black text-gray-900">Edit Dish Details</h3>
                  </div>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center font-bold"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Edit Form */}
                <div className="p-4 flex-1 min-h-0 overflow-y-auto scrollbar-none space-y-3.5 text-xs">
                  {/* Photo & Item Name */}
                  <div className="flex gap-3 items-center">
                    <div className="relative w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 p-1 shrink-0 flex items-center justify-center">
                      <img
                        src={selectedItem.image}
                        alt="Product"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-[11px] font-bold text-gray-500 block mb-1">Dish Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-200 font-bold text-xs focus:outline-none focus:border-[#00C060]"
                      />
                    </div>
                  </div>

                  {/* Category & Type */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 block mb-1">Category</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full p-2 rounded-xl border border-gray-200 font-bold text-xs bg-white"
                      >
                        {SEED_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-500 block mb-1">Food Type</label>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditType('veg')}
                          className={`flex-1 py-1.5 rounded-xl font-bold border transition-all ${
                            editType === 'veg'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          Veg
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditType('non-veg')}
                          className={`flex-1 py-1.5 rounded-xl font-bold border transition-all ${
                            editType === 'non-veg'
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          Non-Veg
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Base Price & Stock */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 block mb-1">Base Price (₹)</label>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-200 font-black text-xs focus:outline-none focus:border-[#00C060]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 block mb-1">Stock Count</label>
                      <input
                        type="number"
                        disabled={editUnlimitedStock}
                        value={editStock}
                        onChange={(e) => setEditStock(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-200 font-bold text-xs disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-gray-100 grid grid-cols-2 gap-2 bg-white shrink-0 pb-6">
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleSaveChanges();
                      setMobileDrawerOpen(false);
                    }}
                    className="py-2.5 rounded-xl bg-[#00C060] text-white text-xs font-black shadow-sm flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ItemMenuPage;
