import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  ChevronLeft,
  Search,
  Plus,
  Minus,
  X,
  RotateCcw,
} from 'lucide-react';

export interface StockAdjustmentRecord {
  id: string; // ADJ-201
  itemName: string;
  category: string;
  adjustmentType: 'addition' | 'reduction' | 'correction' | 'wastage';
  qtyChanged: number;
  unit: string;
  previousQty: number;
  newQty: number;
  reason: string;
  adjustedBy: string;
  date: string;
}

const INITIAL_ADJUSTMENTS: StockAdjustmentRecord[] = [
  {
    id: 'ADJ-201',
    itemName: 'Burger Buns (Sesame)',
    category: 'Bakery',
    adjustmentType: 'wastage',
    qtyChanged: -10,
    unit: 'pcs',
    previousQty: 150,
    newQty: 140,
    reason: 'Damaged packaging during morning delivery unload',
    adjustedBy: 'Rohit Sengar',
    date: 'Today, 11:30 AM',
  },
  {
    id: 'ADJ-200',
    itemName: 'Cooking Oil (Refined)',
    category: 'Grocery',
    adjustmentType: 'addition',
    qtyChanged: +15,
    unit: 'litres',
    previousQty: 3,
    newQty: 18,
    reason: 'Emergency purchase from local cash supplier',
    adjustedBy: 'Aman Verma',
    date: 'Today, 10:15 AM',
  },
  {
    id: 'ADJ-199',
    itemName: 'Boneless Chicken Breast',
    category: 'Poultry',
    adjustmentType: 'reduction',
    qtyChanged: -2.5,
    unit: 'kg',
    previousQty: 26.5,
    newQty: 24,
    reason: 'Trimming & prep loss during batch marination',
    adjustedBy: 'Karan Malhotra',
    date: 'Yesterday, 06:00 PM',
  },
  {
    id: 'ADJ-198',
    itemName: 'Mozzarella Cheese Blend',
    category: 'Dairy',
    adjustmentType: 'correction',
    qtyChanged: +1.5,
    unit: 'kg',
    previousQty: 7,
    newQty: 8.5,
    reason: 'Physical inventory count scale recalibration',
    adjustedBy: 'Priya Sharma',
    date: 'Yesterday, 02:30 PM',
  },
];

export const StockAdjustmentPage: React.FC = () => {
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [adjustments, setAdjustments] = useState<StockAdjustmentRecord[]>(INITIAL_ADJUSTMENTS);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // Form states
  const [adjItem, setAdjItem] = useState('Burger Buns (Sesame)');
  const [adjType, setAdjType] = useState<'addition' | 'reduction' | 'wastage'>('wastage');
  const [adjQty, setAdjQty] = useState('5');
  const [adjReason, setAdjReason] = useState('');

  const filtered = useMemo(() => {
    return adjustments.filter((a) => {
      if (filterType !== 'all' && a.adjustmentType !== filterType) return false;
      const q = searchQuery.toLowerCase();
      return (
        a.itemName.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.reason.toLowerCase().includes(q)
      );
    });
  }, [adjustments, filterType, searchQuery]);

  const handleApplyAdjustment = () => {
    const qtyNum = parseFloat(adjQty) || 0;
    const delta = adjType === 'addition' ? Math.abs(qtyNum) : -Math.abs(qtyNum);

    const newRecord: StockAdjustmentRecord = {
      id: `ADJ-${202 + adjustments.length}`,
      itemName: adjItem,
      category: 'Bakery',
      adjustmentType: adjType,
      qtyChanged: delta,
      unit: 'pcs',
      previousQty: 100,
      newQty: 100 + delta,
      reason: adjReason || 'Regular physical stock correction',
      adjustedBy: 'Rohit Sengar',
      date: 'Just Now',
    };

    setAdjustments([newRecord, ...adjustments]);
    setShowAdjustModal(false);
    setAdjReason('');
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
              onClick={() => navigate('/inventory/stock')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all text-left"
            >
              <Package className="w-4 h-4 shrink-0" />
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
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold bg-[#E7F9F0] text-[#00C060] shadow-2xs transition-all text-left"
            >
              <TrendingUp className="w-4 h-4 shrink-0 text-[#00C060]" />
              <span className="flex-1">Stock Adjustment</span>
            </button>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-[#F6FAF7] border border-[#E0F2E9] rounded-2xl p-3 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-100/70 text-[#00C060] flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[#00C060]" />
          </div>
          <h4 className="text-xs font-bold text-gray-900 leading-tight">Stock Audit Logs</h4>
          <p className="text-[10px] text-gray-500 mt-1 leading-normal">
            Audit inventory variances, record shrinkage & correct physical ledger counts.
          </p>
        </div>
      </div>

      {/* 2. CENTER CONTENT */}
      <div className="flex-1 flex flex-col overflow-y-auto px-5 py-4 min-w-0">
        {/* Header Title */}
        <div className="flex items-center justify-between pb-3 shrink-0">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Stock Adjustment</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Add extra stock, log kitchen wastage and correct physical inventory variances.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdjustModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#00C060] hover:bg-[#00ab55] active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Stock Adjustment</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-4 gap-3 py-1 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#E7F9F0] text-[#00C060] flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{adjustments.length}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Adjustments Logged</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <Minus className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">₹1,850</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Wastage / Shrinkage</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Plus className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">+15 L</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Direct Stock In</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">99.4%</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Inventory Accuracy</p>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mt-4 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              All Adjustments ({adjustments.length})
            </button>
            <button
              onClick={() => setFilterType('wastage')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'wastage'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              Wastage
            </button>
            <button
              onClick={() => setFilterType('addition')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'addition'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              Additions
            </button>
            <button
              onClick={() => setFilterType('correction')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'correction'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              Corrections
            </button>
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search adjustments or reasons..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#00C060] bg-white"
            />
          </div>
        </div>

        {/* Adjustments Table */}
        <div className="mt-3 bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="py-2.5 px-3.5">Log ID</th>
                <th className="py-2.5 px-3.5">Item Name</th>
                <th className="py-2.5 px-3.5">Type</th>
                <th className="py-2.5 px-3.5">Variance</th>
                <th className="py-2.5 px-3.5">Previous → New</th>
                <th className="py-2.5 px-3.5">Reason</th>
                <th className="py-2.5 px-3.5">Staff</th>
                <th className="py-2.5 px-3.5 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-3.5 font-bold text-gray-900">{item.id}</td>
                  <td className="py-3 px-3.5 font-bold text-gray-800">{item.itemName}</td>
                  <td className="py-3 px-3.5">
                    {item.adjustmentType === 'addition' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E7F9F0] text-[#00A852]">
                        <Plus className="w-3 h-3" />
                        Addition
                      </span>
                    )}
                    {item.adjustmentType === 'wastage' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600">
                        <Minus className="w-3 h-3" />
                        Wastage
                      </span>
                    )}
                    {item.adjustmentType === 'reduction' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600">
                        <Minus className="w-3 h-3" />
                        Reduction
                      </span>
                    )}
                    {item.adjustmentType === 'correction' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600">
                        <RotateCcw className="w-3 h-3" />
                        Correction
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 font-black text-gray-900">
                    {item.qtyChanged > 0 ? `+${item.qtyChanged}` : item.qtyChanged} {item.unit}
                  </td>
                  <td className="py-3 px-3.5 text-gray-600 font-medium">
                    {item.previousQty} → <span className="font-bold text-gray-900">{item.newQty} {item.unit}</span>
                  </td>
                  <td className="py-3 px-3.5 text-gray-600 font-medium max-w-xs truncate">{item.reason}</td>
                  <td className="py-3 px-3.5 text-gray-800 font-medium">{item.adjustedBy}</td>
                  <td className="py-3 px-3.5 text-right text-gray-500">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR: AUDIT SUMMARY */}
      <div className="w-72 shrink-0 bg-white border-l border-gray-200/80 p-4 flex flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-1">Adjustment Policies</h3>
            <p className="text-[11px] text-gray-500 mb-3">Kitchen audit guidelines</p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-bold text-gray-800 block">Wastage Protocol</span>
                <span className="text-[11px] text-gray-500 mt-0.5 block">
                  All dropped or spoiled ingredients exceeding ₹500 require Store Manager sign-off.
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-bold text-gray-800 block">Scale Variance</span>
                <span className="text-[11px] text-gray-500 mt-0.5 block">
                  Weekly recalibration done every Monday morning before supplier arrivals.
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
            <h4 className="text-xs font-bold text-gray-900">Inventory Loss Status</h4>
            <p className="text-[11px] text-emerald-800 mt-1">
              Current monthly shrinkage: 0.6% (within target &lt; 1.0%).
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAdjustModal(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#00C060] hover:bg-[#00ab55] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Adjustment Entry</span>
        </button>
      </div>

      {/* MODAL: RECORD ADJUSTMENT */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Record Stock Adjustment</h3>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Item</label>
                <select
                  value={adjItem}
                  onChange={(e) => setAdjItem(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                >
                  <option>Burger Buns (Sesame)</option>
                  <option>Cooking Oil (Refined)</option>
                  <option>Boneless Chicken Breast</option>
                  <option>Mozzarella Cheese Blend</option>
                  <option>French Fries (Frozen 9mm)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Adjustment Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjType('wastage')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border ${
                      adjType === 'wastage' ? 'bg-rose-500 text-white border-rose-500' : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    Wastage
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjType('addition')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border ${
                      adjType === 'addition' ? 'bg-[#00C060] text-white border-[#00C060]' : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    Addition
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjType('reduction')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border ${
                      adjType === 'reduction' ? 'bg-amber-500 text-white border-amber-500' : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    Reduction
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={adjQty}
                  onChange={(e) => setAdjQty(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Reason / Note</label>
                <input
                  type="text"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="e.g. Expired batch, kitchen burn, physical count check"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-3.5 bg-gray-50/70 border-t border-gray-100">
              <button
                onClick={() => setShowAdjustModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyAdjustment}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#00C060] text-white"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockAdjustmentPage;
