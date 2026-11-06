import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  ChevronLeft,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  ChevronDown,
  X,
} from 'lucide-react';

export interface StockItem {
  id: string; // ITM-001
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  minThreshold: number;
  costPerUnit: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  supplier: string;
  lastUpdated: string;
}

const INITIAL_STOCK_ITEMS: StockItem[] = [
  {
    id: 'STK-101',
    name: 'Burger Buns (Sesame)',
    category: 'Bakery',
    currentStock: 140,
    unit: 'pcs',
    minThreshold: 50,
    costPerUnit: 8.5,
    status: 'in_stock',
    supplier: 'Metro Bakers Pvt Ltd',
    lastUpdated: 'Today, 11:20 AM',
  },
  {
    id: 'STK-102',
    name: 'Mozzarella Cheese Blend',
    category: 'Dairy',
    currentStock: 8.5,
    unit: 'kg',
    minThreshold: 15,
    costPerUnit: 340,
    status: 'low_stock',
    supplier: 'Amul Dairy Supplies',
    lastUpdated: 'Today, 09:15 AM',
  },
  {
    id: 'STK-103',
    name: 'Boneless Chicken Breast',
    category: 'Poultry',
    currentStock: 24,
    unit: 'kg',
    minThreshold: 10,
    costPerUnit: 220,
    status: 'in_stock',
    supplier: 'Fresh Meat Suppliers',
    lastUpdated: 'Today, 08:30 AM',
  },
  {
    id: 'STK-104',
    name: 'Cooking Oil (Refined)',
    category: 'Grocery',
    currentStock: 3,
    unit: 'litres',
    minThreshold: 10,
    costPerUnit: 140,
    status: 'low_stock',
    supplier: 'Fortune Distributors',
    lastUpdated: 'Yesterday, 04:00 PM',
  },
  {
    id: 'STK-105',
    name: 'Fresh Paneer (Cottage Cheese)',
    category: 'Dairy',
    currentStock: 0,
    unit: 'kg',
    minThreshold: 5,
    costPerUnit: 280,
    status: 'out_of_stock',
    supplier: 'Amul Dairy Supplies',
    lastUpdated: '2 Days ago',
  },
  {
    id: 'STK-106',
    name: 'French Fries (Frozen 9mm)',
    category: 'Frozen',
    currentStock: 45,
    unit: 'kg',
    minThreshold: 20,
    costPerUnit: 110,
    status: 'in_stock',
    supplier: 'McCain Foods Depot',
    lastUpdated: 'Today, 10:00 AM',
  },
  {
    id: 'STK-107',
    name: 'Tomato Ketchup Dispensers',
    category: 'Condiments',
    currentStock: 18,
    unit: 'bottles',
    minThreshold: 6,
    costPerUnit: 95,
    status: 'in_stock',
    supplier: 'Kissan Enterprise',
    lastUpdated: '3 Days ago',
  },
];

export const StockManagementPage: React.FC = () => {
  const navigate = useNavigate();

  const [subTab, setSubTab] = useState<'all' | 'low' | 'out'>('all');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<StockItem[]>(INITIAL_STOCK_ITEMS);
  const [selectedItem, setSelectedItem] = useState<StockItem>(INITIAL_STOCK_ITEMS[0]);

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Grocery');
  const [newStock, setNewStock] = useState('20');
  const [newUnit, setNewUnit] = useState('kg');
  const [newMinThreshold, setNewMinThreshold] = useState('5');
  const [newCost, setNewCost] = useState('150');
  const [newSupplier, setNewSupplier] = useState('Metro Bakers Pvt Ltd');

  // Stats
  const totalItems = items.length;
  const lowStockCount = items.filter((i) => i.status === 'low_stock').length;
  const outOfStockCount = items.filter((i) => i.status === 'out_of_stock').length;
  const totalStockValue = items.reduce((sum, item) => sum + item.currentStock * item.costPerUnit, 0);

  const filteredItems = useMemo(() => {
    return items.filter((i) => {
      if (subTab === 'low' && i.status !== 'low_stock') return false;
      if (subTab === 'out' && i.status !== 'out_of_stock') return false;
      if (categoryFilter !== 'All Categories' && i.category !== categoryFilter) return false;

      const q = searchQuery.toLowerCase();
      return (
        i.name.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        i.supplier.toLowerCase().includes(q)
      );
    });
  }, [items, subTab, categoryFilter, searchQuery]);

  const handleAddItem = () => {
    if (!newName.trim()) return;
    const stockVal = parseFloat(newStock) || 0;
    const threshVal = parseFloat(newMinThreshold) || 5;

    let stat: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
    if (stockVal === 0) stat = 'out_of_stock';
    else if (stockVal <= threshVal) stat = 'low_stock';

    const newItem: StockItem = {
      id: `STK-${101 + items.length}`,
      name: newName,
      category: newCategory,
      currentStock: stockVal,
      unit: newUnit,
      minThreshold: threshVal,
      costPerUnit: parseFloat(newCost) || 0,
      status: stat,
      supplier: newSupplier,
      lastUpdated: 'Just Now',
    };

    setItems([newItem, ...items]);
    setSelectedItem(newItem);
    setShowAddModal(false);
    setNewName('');
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#F6F8FA]">
      {/* 1. LEFT SIDEBAR */}
      <div className="w-56 shrink-0 bg-white border-r border-gray-200/80 flex flex-col justify-between p-3.5 select-none overflow-y-auto">
        <div>
          <button
            onClick={() => navigate('/tools')}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gray-100/80 transition-all mb-4"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
            <span>More Tools</span>
          </button>

          <div className="space-y-1">
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold bg-[#E7F9F0] text-[#00C060] shadow-2xs transition-all text-left"
            >
              <Package className="w-4 h-4 shrink-0 text-[#00C060]" />
              <span className="flex-1">Stock Management</span>
            </button>

            <button
              onClick={() => navigate('/inventory/purchase')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all text-left"
            >
              <ShoppingCart className="w-4 h-4 shrink-0" />
              <span className="flex-1">Purchase & Suppliers</span>
            </button>

            <button
              onClick={() => navigate('/inventory/adjustments')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all text-left"
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span className="flex-1">Stock Adjustment</span>
            </button>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-[#F6FAF7] border border-[#E0F2E9] rounded-2xl p-3 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-100/70 text-[#00C060] flex items-center justify-center">
            <Package className="w-6 h-6 text-[#00C060]" />
          </div>
          <h4 className="text-xs font-bold text-gray-900 leading-tight">Live Stock Radar</h4>
          <p className="text-[10px] text-gray-500 mt-1 leading-normal">
            Real-time recipe depletion, inventory counts & safety threshold alerts.
          </p>
        </div>
      </div>

      {/* 2. CENTER CONTENT */}
      <div className="flex-1 flex flex-col overflow-y-auto px-5 py-4 min-w-0">
        {/* Header Title */}
        <div className="flex items-center justify-between pb-3 shrink-0">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Stock Management</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live inventory tracking, minimum thresholds, stock consumption and valuations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#00C060] hover:bg-[#00ab55] active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stock Item</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-4 gap-3 py-1 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#E7F9F0] text-[#00C060] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{totalItems}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Total Stock Items</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{lowStockCount}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Low Stock Alerts</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{outOfStockCount}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Out of Stock</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">₹{Math.round(totalStockValue).toLocaleString('en-IN')}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Total Valuation</p>
            </div>
          </div>
        </div>

        {/* Filters + Search bar */}
        <div className="mt-4 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSubTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                subTab === 'all'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              All Items ({items.length})
            </button>
            <button
              onClick={() => setSubTab('low')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                subTab === 'low'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              Low Stock ({lowStockCount})
            </button>
            <button
              onClick={() => setSubTab('out')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                subTab === 'out'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              Out of Stock ({outOfStockCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 hover:border-gray-300 px-3 pr-8 py-1.5 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#00C060]"
              >
                <option>All Categories</option>
                <option>Bakery</option>
                <option>Dairy</option>
                <option>Poultry</option>
                <option>Grocery</option>
                <option>Frozen</option>
                <option>Condiments</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items or suppliers..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#00C060] bg-white"
              />
            </div>
          </div>
        </div>

        {/* Stock Items Table */}
        <div className="mt-3 bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="py-2.5 px-3.5">Item Name</th>
                <th className="py-2.5 px-3.5">Category</th>
                <th className="py-2.5 px-3.5">Current Stock</th>
                <th className="py-2.5 px-3.5">Min Threshold</th>
                <th className="py-2.5 px-3.5">Cost / Unit</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5">Supplier</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredItems.map((item) => {
                const isSelected = selectedItem.id === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#EAFBF1]/60 hover:bg-[#EAFBF1]/80' : 'hover:bg-gray-50/80'
                    }`}
                  >
                    <td className="py-3 px-3.5">
                      <div>
                        <p className="font-bold text-gray-900 leading-tight">{item.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{item.id}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-gray-100 text-gray-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-black text-gray-900">
                      {item.currentStock} {item.unit}
                    </td>
                    <td className="py-3 px-3.5 text-gray-500 font-medium">
                      {item.minThreshold} {item.unit}
                    </td>
                    <td className="py-3 px-3.5 font-bold text-gray-800">
                      ₹{item.costPerUnit}
                    </td>
                    <td className="py-3 px-3.5">
                      {item.status === 'in_stock' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E7F9F0] text-[#00A852]">
                          <CheckCircle2 className="w-3 h-3 text-[#00C060]" />
                          In Stock
                        </span>
                      )}
                      {item.status === 'low_stock' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          Low Stock
                        </span>
                      )}
                      {item.status === 'out_of_stock' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600">
                          <XCircle className="w-3 h-3 text-rose-500" />
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-gray-600 font-medium">{item.supplier}</td>
                    <td className="py-3 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR: QUICK RE-ORDER & STOCK DETAILS */}
      <div className="w-72 shrink-0 bg-white border-l border-gray-200/80 p-4 flex flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-1">Item Details</h3>
            <p className="text-[11px] text-gray-500 mb-3">{selectedItem.name}</p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex justify-between">
                <span className="text-gray-500">Current Qty</span>
                <span className="font-extrabold text-gray-900">
                  {selectedItem.currentStock} {selectedItem.unit}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex justify-between">
                <span className="text-gray-500">Total Value</span>
                <span className="font-extrabold text-[#00A852]">
                  ₹{(selectedItem.currentStock * selectedItem.costPerUnit).toFixed(2)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex justify-between">
                <span className="text-gray-500">Supplier</span>
                <span className="font-bold text-gray-800">{selectedItem.supplier}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
            <h4 className="text-xs font-bold text-amber-900">Safety Threshold Check</h4>
            <p className="text-[11px] text-amber-800 mt-1 leading-normal">
              Minimum alert triggers when stock dips below {selectedItem.minThreshold} {selectedItem.unit}.
            </p>
          </div>

          <button
            onClick={() => navigate('/inventory/purchase')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 rounded-xl text-xs font-bold shadow-2xs transition-all"
          >
            <ShoppingCart className="w-4 h-4 text-gray-500" />
            <span>Create Purchase Order</span>
          </button>
        </div>

        <button
          onClick={() => navigate('/inventory/adjustments')}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#00C060] hover:bg-[#00ab55] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Quick Adjust Stock</span>
        </button>
      </div>

      {/* MODAL: ADD STOCK ITEM */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Add Inventory Stock Item</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Basmati Rice 1121"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                  >
                    <option>Bakery</option>
                    <option>Dairy</option>
                    <option>Poultry</option>
                    <option>Grocery</option>
                    <option>Frozen</option>
                    <option>Condiments</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Unit of Measure</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                  >
                    <option>kg</option>
                    <option>grams</option>
                    <option>litres</option>
                    <option>pcs</option>
                    <option>bottles</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Initial Qty</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={newMinThreshold}
                    onChange={(e) => setNewMinThreshold(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Cost / Unit (₹)</label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Supplier</label>
                <select
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                >
                  <option>Metro Bakers Pvt Ltd</option>
                  <option>Amul Dairy Supplies</option>
                  <option>Fresh Meat Suppliers</option>
                  <option>Fortune Distributors</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-3.5 bg-gray-50/70 border-t border-gray-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#00C060] text-white"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagementPage;
