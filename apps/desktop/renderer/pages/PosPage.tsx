import React from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Printer, 
  CheckCircle2, 
  Utensils 
} from 'lucide-react';
import { MenuItem, Category, RestaurantTable } from '@bitechez/shared-types';
import { formatINR, paiseToRupees, rupeesToPaise } from '@bitechez/business-logic';
import { useCartStore } from '../stores/cartStore';
import { apiService, OUTLET_ID } from '../services/api';

export const PosPage: React.FC = () => {
  const {
    items: cartItems,
    orderType,
    tableId,
    tableName,
    discountPercentage,
    setOrderType,
    setTable,
    addItem,
    updateQuantity,
    setDiscount,
    clearCart,
    getCalculations,
  } = useCartStore();

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([]);
  const [tables, setTables] = React.useState<RestaurantTable[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [vegOnly, setVegOnly] = React.useState<boolean>(false);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = React.useState<'cash' | 'upi' | 'card'>('cash');
  const [tenderedRupees, setTenderedRupees] = React.useState<string>('');
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadPosData() {
      const [cats, items, tbls] = await Promise.all([
        apiService.getCategories(),
        apiService.getMenuItems(),
        apiService.getTables(),
      ]);
      setCategories(cats);
      setMenuItems(items);
      setTables(tbls);
    }
    loadPosData();
  }, []);

  const calculations = getCalculations();

  // Filter menu items
  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) return false;
    if (vegOnly && !item.isVeg) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(query);
      const matchCode = item.shortCode?.toLowerCase().includes(query);
      return matchName || matchCode;
    }
    return true;
  });

  // Handle Checkout / Payment Completion
  const handleCompleteOrder = async () => {
    if (cartItems.length === 0) return;
    setIsProcessing(true);

    try {
      const orderNumber = `BTZ-${Date.now().toString().slice(-6)}`;
      const orderPayload = {
        outletId: OUTLET_ID,
        orderNumber,
        orderType,
        tableId: orderType === 'dine_in' ? tableId : undefined,
        tableName: orderType === 'dine_in' ? tableName : undefined,
        status: 'completed',
        guestCount: 2,
        subtotalPaise: calculations.subtotalPaise,
        discountPaise: calculations.discountPaise,
        discountPercentage: discountPercentage > 0 ? discountPercentage : undefined,
        cgstPaise: calculations.cgstPaise,
        sgstPaise: calculations.sgstPaise,
        totalGstPaise: calculations.totalGstPaise,
        roundingPaise: calculations.roundingPaise,
        grandTotalPaise: calculations.grandTotalPaise,
        paymentStatus: 'completed',
        cashierId: '00000000-0000-0000-0000-000000000001',
        items: cartItems.map((entry) => ({
          itemId: entry.item.id,
          name: entry.item.name,
          quantity: entry.quantity,
          unitPricePaise: entry.item.basePricePaise,
          totalPricePaise: entry.item.basePricePaise * entry.quantity,
          gstRate: entry.item.gstRate,
          gstAmountPaise: Math.round((entry.item.basePricePaise * entry.quantity * entry.item.gstRate) / 100),
          notes: entry.notes,
          kotStatus: 'pending' as const,
        })),
      };

      // 1. Create order in SQLite
      const createdOrder = await apiService.createOrder(orderPayload);

      // 2. Dispatch Kitchen KOT
      await apiService.createKot({
        outletId: OUTLET_ID,
        orderId: createdOrder.id,
        orderNumber,
        kotNumber: 1,
        tableId: orderPayload.tableId,
        tableName: orderPayload.tableName,
        orderType,
        station: 'Main Kitchen',
        items: orderPayload.items.map((it) => ({
          orderItemId: it.itemId,
          itemName: it.name,
          quantity: it.quantity,
          notes: it.notes,
          status: 'pending' as const,
        })),
      });

      // 3. Record Payment
      const tenderedPaise = tenderedRupees ? rupeesToPaise(tenderedRupees) : calculations.grandTotalPaise;
      await apiService.recordPayment({
        outletId: OUTLET_ID,
        orderId: createdOrder.id,
        amountPaise: calculations.grandTotalPaise,
        method: paymentMethod,
        status: 'completed',
        tenderedPaise,
        changePaise: Math.max(0, tenderedPaise - calculations.grandTotalPaise),
        collectedBy: '00000000-0000-0000-0000-000000000001',
      });

      setSuccessMessage(`Order ${orderNumber} settled & printed successfully!`);
      clearCart();
      setIsCheckoutOpen(false);
      setTenderedRupees('');

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3500);
    } catch (err) {
      console.error('Order creation failed:', err);
      alert('Error saving order. Check terminal SQLite database.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-5.5rem)] flex gap-5 overflow-hidden">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#800D32] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in border border-rose-400">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm">{successMessage}</span>
        </div>
      )}

      {/* Left Menu Section (65%) */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Controls Bar: Order Type, Tables, Search, Veg filter */}
        <div className="p-4 border-b border-gray-100 space-y-3 bg-[#FAF8F9]/50">
          <div className="flex items-center justify-between gap-3">
            {/* Order Type Toggle */}
            <div className="inline-flex rounded-xl bg-gray-100 p-1">
              {(['dine_in', 'takeaway', 'delivery'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                    orderType === type
                      ? 'bg-[#800D32] text-white shadow-sm'
                      : 'text-gray-600 hover:text-[#191923]'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Table Selector (If Dine In) */}
            {orderType === 'dine_in' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Table:</span>
                <select
                  value={tableId || ''}
                  onChange={(e) => {
                    const sel = tables.find((t) => t.id === e.target.value);
                    setTable(sel?.id, sel?.name);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold bg-white text-[#191923] focus:ring-2 focus:ring-[#800D32] outline-none"
                >
                  <option value="">Select Table</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.section}) - {t.status}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Veg Only Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                className="rounded text-[#239B56] focus:ring-[#239B56] w-4 h-4 cursor-pointer"
              />
              <span className="text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" /> Veg Only
              </span>
            </label>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items by name or code (e.g. 'Paneer', 'PTK')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#800D32] focus:border-transparent transition-all"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#800D32] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#800D32]'
              }`}
            >
              All Items ({menuItems.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#800D32] text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#800D32]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-3.5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => addItem(item)}
                className="bg-white rounded-xl border border-gray-200 p-3.5 hover:border-[#800D32] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between active:scale-[0.98] group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] font-bold ${
                        item.isVeg
                          ? 'border-emerald-600 text-emerald-600'
                          : 'border-rose-600 text-rose-600'
                      }`}
                    >
                      ●
                    </span>
                    {item.shortCode && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-bold">
                        {item.shortCode}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-[#191923] mt-2 group-hover:text-[#800D32] transition-colors leading-snug">
                    {item.name}
                  </h4>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-sm font-black text-[#800D32]">
                    {formatINR(item.basePricePaise)}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400">
                    +{item.gstRate}% GST
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Billing Cart Panel (35%) */}
      <div className="w-96 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-100 bg-[#800D32] text-white flex items-center justify-between">
          <div>
            <h3 className="font-black text-base flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              <span>Current Order</span>
            </h3>
            <span className="text-xs text-rose-200 font-medium">
              {tableName ? `Table: ${tableName}` : 'Direct Takeaway'} • {cartItems.length} items
            </span>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-200 hover:text-white underline font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-12">
              <Utensils className="w-10 h-10 stroke-1 text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-500">Cart is empty</p>
              <p className="text-xs text-gray-400">Select items from the menu to start billing</p>
            </div>
          ) : (
            cartItems.map((entry) => (
              <div key={entry.item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-[#191923] truncate">{entry.item.name}</h5>
                  <span className="text-[11px] font-semibold text-gray-500">
                    {formatINR(entry.item.basePricePaise)} each
                  </span>
                </div>

                {/* Qty Controls */}
                <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg p-1 shrink-0">
                  <button
                    onClick={() => updateQuantity(entry.item.id, -1)}
                    className="w-5 h-5 rounded bg-white text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-bold text-[#191923]">
                    {entry.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(entry.item.id, 1)}
                    className="w-5 h-5 rounded bg-white text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Item Total */}
                <div className="w-16 text-right shrink-0">
                  <span className="text-xs font-black text-[#800D32]">
                    {formatINR(entry.item.basePricePaise * entry.quantity)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Financial Summary & Actions */}
        <div className="p-4 border-t border-gray-100 bg-[#FAF8F9]/50 space-y-2.5">
          {/* Subtotal */}
          <div className="flex justify-between text-xs text-gray-600 font-medium">
            <span>Subtotal</span>
            <span>{formatINR(calculations.subtotalPaise)}</span>
          </div>

          {/* Discount Selector */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 font-medium">Discount</span>
            <div className="flex items-center gap-1">
              {[0, 5, 10, 15].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setDiscount(pct)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    discountPercentage === pct
                      ? 'bg-[#800D32] text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {pct}%
                </button>
              ))}
              {calculations.discountPaise > 0 && (
                <span className="text-rose-600 font-bold ml-1">
                  -{formatINR(calculations.discountPaise)}
                </span>
              )}
            </div>
          </div>

          {/* Taxes (CGST + SGST) */}
          <div className="flex justify-between text-xs text-gray-600 font-medium">
            <span>Taxes (CGST + SGST)</span>
            <span>{formatINR(calculations.totalGstPaise)}</span>
          </div>

          {/* Rounding */}
          {calculations.roundingPaise !== 0 && (
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>Rounding Adjustment</span>
              <span>{formatINR(calculations.roundingPaise)}</span>
            </div>
          )}

          {/* Grand Total */}
          <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
            <span className="text-sm font-bold text-[#191923]">Grand Total</span>
            <span className="text-xl font-black text-[#800D32]">
              {formatINR(calculations.grandTotalPaise)}
            </span>
          </div>

          {/* Checkout & KOT Buttons */}
          <div className="pt-2 grid grid-cols-2 gap-2">
            <button
              disabled={cartItems.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
              className="col-span-2 py-3 bg-[#800D32] hover:bg-[#600821] text-white rounded-xl font-black text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <CreditCard className="w-4 h-4" />
              <span>Settle & Pay ({formatINR(calculations.grandTotalPaise)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settle / Payment Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5 animate-scale-up border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-[#191923]">Payment & Settlement</h3>
                <p className="text-xs text-gray-500">Bitechez Fast Checkout Terminal</p>
              </div>
              <span className="text-2xl font-black text-[#800D32]">
                {formatINR(calculations.grandTotalPaise)}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'upi', label: 'UPI QR', icon: QrCode },
                { id: 'card', label: 'Card Swipe', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-1.5 transition-all font-bold text-xs ${
                      paymentMethod === m.id
                        ? 'border-[#800D32] bg-[#F9E8ED] text-[#800D32] shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Cash Tendered Input */}
            {paymentMethod === 'cash' && (
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                <label className="text-xs font-bold text-gray-700 block">Cash Tendered by Customer (₹)</label>
                <input
                  type="number"
                  placeholder={paiseToRupees(calculations.grandTotalPaise).toString()}
                  value={tenderedRupees}
                  onChange={(e) => setTenderedRupees(e.target.value)}
                  className="w-full text-lg font-black px-4 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#800D32]"
                />

                {/* Quick Cash Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {[500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTenderedRupees(amt.toString())}
                      className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-[#800D32]"
                    >
                      ₹{amt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTenderedRupees(paiseToRupees(calculations.grandTotalPaise).toString())}
                    className="px-3 py-1 bg-[#800D32] text-white rounded-lg text-xs font-bold"
                  >
                    Exact
                  </button>
                </div>

                {/* Change Due Display */}
                {tenderedRupees && parseFloat(tenderedRupees) >= paiseToRupees(calculations.grandTotalPaise) && (
                  <div className="pt-2 flex justify-between items-center text-sm font-bold text-emerald-700">
                    <span>Return Change:</span>
                    <span>
                      {formatINR(rupeesToPaise(parseFloat(tenderedRupees)) - calculations.grandTotalPaise)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* UPI QR Code Preview */}
            {paymentMethod === 'upi' && (
              <div className="p-4 bg-gray-50 rounded-xl text-center space-y-2">
                <div className="w-36 h-36 mx-auto bg-white border border-gray-200 rounded-xl flex items-center justify-center p-2 shadow-inner">
                  <QrCode className="w-28 h-28 text-gray-800" />
                </div>
                <p className="text-xs font-bold text-gray-700">Scan via any UPI App (GPay / PhonePe / Paytm)</p>
                <p className="text-[11px] text-gray-500 font-mono">VPA: bitechez.pos@icici</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCompleteOrder}
                className="px-6 py-2.5 bg-[#800D32] hover:bg-[#600821] text-white rounded-xl text-sm font-black shadow-md flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>{isProcessing ? 'Saving & Printing...' : 'Confirm & Print Receipt'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
