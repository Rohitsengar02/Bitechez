import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  ChevronLeft,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  X,
  DollarSign,
  Building,
} from 'lucide-react';

export interface PurchaseOrder {
  id: string; // PO-501
  supplierName: string;
  itemsCount: number;
  totalAmount: number;
  orderDate: string;
  expectedDate: string;
  status: 'received' | 'pending' | 'cancelled';
  paymentStatus: 'paid' | 'pending';
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  category: string;
  activeOrders: number;
}

const INITIAL_POS: PurchaseOrder[] = [
  {
    id: 'PO-501',
    supplierName: 'Metro Bakers Pvt Ltd',
    itemsCount: 4,
    totalAmount: 14200,
    orderDate: '02 Nov 2026',
    expectedDate: '03 Nov 2026',
    status: 'pending',
    paymentStatus: 'pending',
  },
  {
    id: 'PO-500',
    supplierName: 'Amul Dairy Supplies',
    itemsCount: 6,
    totalAmount: 28500,
    orderDate: '01 Nov 2026',
    expectedDate: '02 Nov 2026',
    status: 'received',
    paymentStatus: 'paid',
  },
  {
    id: 'PO-499',
    supplierName: 'Fresh Meat Suppliers',
    itemsCount: 3,
    totalAmount: 19800,
    orderDate: '30 Oct 2026',
    expectedDate: '31 Oct 2026',
    status: 'received',
    paymentStatus: 'paid',
  },
  {
    id: 'PO-498',
    supplierName: 'Fortune Distributors',
    itemsCount: 8,
    totalAmount: 34100,
    orderDate: '28 Oct 2026',
    expectedDate: '29 Oct 2026',
    status: 'received',
    paymentStatus: 'paid',
  },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-01',
    name: 'Metro Bakers Pvt Ltd',
    contactPerson: 'Sunil Rao',
    phone: '+91 98111 22334',
    category: 'Bakery & Bread',
    activeOrders: 1,
  },
  {
    id: 'SUP-02',
    name: 'Amul Dairy Supplies',
    contactPerson: 'Ketan Patel',
    phone: '+91 98222 33445',
    category: 'Dairy & Cheese',
    activeOrders: 0,
  },
  {
    id: 'SUP-03',
    name: 'Fresh Meat Suppliers',
    contactPerson: 'Imran Khan',
    phone: '+91 98333 44556',
    category: 'Poultry & Meat',
    activeOrders: 0,
  },
  {
    id: 'SUP-04',
    name: 'Fortune Distributors',
    contactPerson: 'Deepak Jain',
    phone: '+91 98444 55667',
    category: 'Edible Oils & Staples',
    activeOrders: 0,
  },
];

export const PurchaseSuppliersPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_POS);
  const [suppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [showNewPOModal, setShowNewPOModal] = useState(false);

  // Form states
  const [poSupplier, setPoSupplier] = useState('Metro Bakers Pvt Ltd');
  const [poAmount, setPoAmount] = useState('12500');
  const [poItemsCount, setPoItemsCount] = useState('3');

  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const q = searchQuery.toLowerCase();
      return po.id.toLowerCase().includes(q) || po.supplierName.toLowerCase().includes(q);
    });
  }, [purchaseOrders, searchQuery]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    });
  }, [suppliers, searchQuery]);

  const handleCreatePO = () => {
    const newPO: PurchaseOrder = {
      id: `PO-${502 + purchaseOrders.length}`,
      supplierName: poSupplier,
      itemsCount: parseInt(poItemsCount, 10) || 1,
      totalAmount: parseFloat(poAmount) || 0,
      orderDate: 'Today',
      expectedDate: 'Tomorrow',
      status: 'pending',
      paymentStatus: 'pending',
    };
    setPurchaseOrders([newPO, ...purchaseOrders]);
    setShowNewPOModal(false);
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
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold bg-[#E7F9F0] text-[#00C060] shadow-2xs transition-all text-left"
            >
              <ShoppingCart className="w-4 h-4 shrink-0 text-[#00C060]" />
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
            <ShoppingCart className="w-6 h-6 text-[#00C060]" />
          </div>
          <h4 className="text-xs font-bold text-gray-900 leading-tight">Vendor Management</h4>
          <p className="text-[10px] text-gray-500 mt-1 leading-normal">
            Procure raw materials, track PO shipments and manage vendor payables.
          </p>
        </div>
      </div>

      {/* 2. CENTER CONTENT */}
      <div className="flex-1 flex flex-col overflow-y-auto px-5 py-4 min-w-0">
        {/* Header Title */}
        <div className="flex items-center justify-between pb-3 shrink-0">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Purchase & Suppliers</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Create purchase orders, manage vendor relationships and track incoming deliveries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewPOModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#00C060] hover:bg-[#00ab55] active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Purchase Order</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-4 gap-3 py-1 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#E7F9F0] text-[#00C060] flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{purchaseOrders.length}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Total POs</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">1</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Pending Deliveries</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{suppliers.length}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Active Suppliers</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">₹96,600</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Total Procurement</p>
            </div>
          </div>
        </div>

        {/* Sub Tabs + Search Bar */}
        <div className="mt-4 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              Purchase Orders ({purchaseOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'suppliers'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              Suppliers Directory ({suppliers.length})
            </button>
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search POs or suppliers..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#00C060] bg-white"
            />
          </div>
        </div>

        {/* Content Table */}
        <div className="mt-3 bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs flex-1">
          {activeTab === 'orders' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                  <th className="py-2.5 px-3.5">PO Number</th>
                  <th className="py-2.5 px-3.5">Supplier</th>
                  <th className="py-2.5 px-3.5">Items</th>
                  <th className="py-2.5 px-3.5">Amount</th>
                  <th className="py-2.5 px-3.5">Order Date</th>
                  <th className="py-2.5 px-3.5">Expected Delivery</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-3.5 font-bold text-gray-900">{po.id}</td>
                    <td className="py-3 px-3.5 font-bold text-gray-800">{po.supplierName}</td>
                    <td className="py-3 px-3.5 text-gray-600 font-medium">{po.itemsCount} Items</td>
                    <td className="py-3 px-3.5 font-black text-gray-900">
                      ₹{po.totalAmount.toLocaleString('en-IN')}.00
                    </td>
                    <td className="py-3 px-3.5 text-gray-600 font-medium">{po.orderDate}</td>
                    <td className="py-3 px-3.5 text-gray-600 font-medium">{po.expectedDate}</td>
                    <td className="py-3 px-3.5">
                      {po.status === 'received' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E7F9F0] text-[#00A852]">
                          <CheckCircle2 className="w-3 h-3 text-[#00C060]" />
                          Received
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600">
                          <Clock className="w-3 h-3 text-amber-500" />
                          Pending Delivery
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <button className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                  <th className="py-2.5 px-3.5">Supplier Name</th>
                  <th className="py-2.5 px-3.5">Category</th>
                  <th className="py-2.5 px-3.5">Contact Person</th>
                  <th className="py-2.5 px-3.5">Phone</th>
                  <th className="py-2.5 px-3.5">Active Orders</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-3.5 font-bold text-gray-900">{s.name}</td>
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-gray-100 text-gray-700">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-gray-800 font-medium">{s.contactPerson}</td>
                    <td className="py-3 px-3.5 text-gray-600 font-medium">{s.phone}</td>
                    <td className="py-3 px-3.5">
                      {s.activeOrders > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E7F9F0] text-[#00A852]">
                          {s.activeOrders} Active Order
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium">None</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <button className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR: QUICK ACTIONS */}
      <div className="w-72 shrink-0 bg-white border-l border-gray-200/80 p-4 flex flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-1">Incoming Shipments</h3>
            <p className="text-[11px] text-gray-500 mb-3">Expected deliveries in next 24 hours</p>

            <div className="p-3.5 rounded-2xl bg-[#E7F9F0] border border-[#DCFCE7]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">PO-501 (Metro Bakers)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#00C060] text-white rounded-full">Tomorrow</span>
              </div>
              <p className="text-[11px] text-gray-600 mt-1">4 bakery items • ₹14,200.00</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h4 className="text-xs font-extrabold text-gray-900">Payment Due Dates</h4>
            <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-gray-600 font-medium">Amul Dairy</span>
              <span className="font-bold text-emerald-600">Cleared</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-gray-600 font-medium">Metro Bakers</span>
              <span className="font-bold text-amber-600">₹14,200 Due</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowNewPOModal(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#00C060] hover:bg-[#00ab55] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* MODAL: CREATE PO */}
      {showNewPOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Create Purchase Order</h3>
              <button
                onClick={() => setShowNewPOModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Supplier</label>
                <select
                  value={poSupplier}
                  onChange={(e) => setPoSupplier(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                >
                  <option>Metro Bakers Pvt Ltd</option>
                  <option>Amul Dairy Supplies</option>
                  <option>Fresh Meat Suppliers</option>
                  <option>Fortune Distributors</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Estimated Items Count</label>
                <input
                  type="number"
                  value={poItemsCount}
                  onChange={(e) => setPoItemsCount(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Total Bill Amount (₹)</label>
                <input
                  type="number"
                  value={poAmount}
                  onChange={(e) => setPoAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-3.5 bg-gray-50/70 border-t border-gray-100">
              <button
                onClick={() => setShowNewPOModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePO}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#00C060] text-white"
              >
                Issue Purchase Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseSuppliersPage;
