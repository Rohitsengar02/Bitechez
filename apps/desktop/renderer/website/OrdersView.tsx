import React, { useState } from 'react';
import {
  ArrowLeft,
  ChefHat,
  Search,
  ShoppingBag,
  Armchair,
  Lock,
  Users,
  Bell,
  History,
  Check,
  Plus,
  Minus,
  MoreHorizontal,
  FileText,
  Download,
  X,
  Droplets,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  QrCode,
  Banknote,
  Send,
  UtensilsCrossed,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import jsPDF from 'jspdf';
import {
  WebsiteProduct,
  cheeseBurgerImg,
  frenchFriesImg,
  icedBeverageImg,
} from './websiteData';

export interface CartItem {
  product: WebsiteProduct;
  quantity: number;
}

export interface ServiceRequest {
  id: string;
  type: string;
  label: string;
  time: string;
  status: 'pending' | 'in-progress' | 'completed';
  statusText: string;
}

export interface PastOrder {
  id: string;
  date: string;
  total: number;
  status: 'completed' | 'in-progress' | 'cancelled';
  itemsCount: number;
  items: {
    name: string;
    portion: string;
    price: number;
    quantity: number;
    image: string;
  }[];
}

interface OrdersViewProps {
  shopName?: string;
  tableNumber?: string;
  guestsCount?: number;
  cart: CartItem[];
  placedOrders?: any[];
  onAddToCart?: (product: WebsiteProduct) => void;
  onCallWaiter?: () => void;
  onClearCart?: () => void;
  onGoToMenu?: () => void;
  onOpenCart?: () => void;
  onBack?: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  shopName = 'Resto Daddy',
  tableNumber = 'T-06',
  guestsCount = 4,
  cart,
  onAddToCart,
  onCallWaiter,
  onClearCart: _onClearCart,
  onGoToMenu,
  onOpenCart,
  onBack,
}) => {
  // Sub-Navigation Tabs: 'my-order' | 'requests' | 'history'
  const [subTab, setSubTab] = useState<'my-order' | 'requests' | 'history'>('my-order');

  // Search input toggle
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast feedback message
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Bill Modal state
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'upi' | 'card' | 'cash'>('upi');
  const [billPaid, setBillPaid] = useState(false);

  // Cancel Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderCancelled, setOrderCancelled] = useState(false);

  // Other Request Modal state
  const [customRequestModal, setCustomRequestModal] = useState(false);
  const [customRequestText, setCustomRequestText] = useState('');

  // Active Current Order state
  const [orderStatus, setOrderStatus] = useState<'placed' | 'preparing' | 'ready' | 'served'>('preparing');
  const [orderItems, setOrderItems] = useState([
    {
      id: 'item-burger',
      name: 'Cheese Burger',
      subtitle: 'Regular • Single Patty',
      price: 220,
      quantity: 1,
      image: cheeseBurgerImg,
    },
    {
      id: 'item-fries',
      name: 'French Fries',
      subtitle: 'Large • Crispy & Salted',
      price: 160,
      quantity: 1,
      image: frenchFriesImg,
    },
    {
      id: 'item-drink',
      name: 'Cold Drink',
      subtitle: 'Large • Coke',
      price: 120,
      quantity: 1,
      image: icedBeverageImg,
    },
  ]);

  // Requests state
  const [requestsList, setRequestsList] = useState<ServiceRequest[]>([
    {
      id: 'req-1',
      type: 'water',
      label: 'Fresh Drinking Water',
      time: '12:30 PM',
      status: 'completed',
      statusText: 'Delivered by Waiter Rahul',
    },
    {
      id: 'req-2',
      type: 'cutlery',
      label: 'Extra Plates & Cutlery',
      time: '12:32 PM',
      status: 'in-progress',
      statusText: 'Server is on the way',
    },
  ]);

  // Order History state
  const [historyOrders] = useState<PastOrder[]>([
    {
      id: 'ORD-5632',
      date: '28 Oct, 2:14 PM',
      total: 640.0,
      status: 'completed',
      itemsCount: 3,
      items: [
        {
          name: 'Cheese Burger',
          portion: 'Regular',
          price: 220,
          quantity: 2,
          image: cheeseBurgerImg,
        },
        {
          name: 'French Fries',
          portion: 'Large',
          price: 160,
          quantity: 1,
          image: frenchFriesImg,
        },
        {
          name: 'Cold Drink',
          portion: 'Large',
          price: 40,
          quantity: 1,
          image: icedBeverageImg,
        },
      ],
    },
    {
      id: 'ORD-5590',
      date: '14 Oct, 7:45 PM',
      total: 480.0,
      status: 'completed',
      itemsCount: 2,
      items: [
        {
          name: 'Margherita Pizza',
          portion: 'Medium 8"',
          price: 320,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=300&auto=format&fit=crop&q=80',
        },
        {
          name: 'French Fries',
          portion: 'Regular',
          price: 160,
          quantity: 1,
          image: frenchFriesImg,
        },
      ],
    },
    {
      id: 'ORD-5412',
      date: '02 Oct, 1:15 PM',
      total: 980.0,
      status: 'completed',
      itemsCount: 4,
      items: [
        {
          name: 'Cheese Burger Combo',
          portion: 'Family Pack',
          price: 580,
          quantity: 1,
          image: cheeseBurgerImg,
        },
        {
          name: 'Iced Cola Cooler',
          portion: 'Jug 1.5L',
          price: 220,
          quantity: 1,
          image: icedBeverageImg,
        },
        {
          name: 'French Fries',
          portion: 'Large',
          price: 180,
          quantity: 1,
          image: frenchFriesImg,
        },
      ],
    },
  ]);

  // Quantity stepper handler
  const handleUpdateQuantity = (id: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as typeof orderItems
    );
  };

  // Calculate totals
  const totalItemsCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Send quick request helper
  const handleSendRequest = (type: string, label: string) => {
    const newReq: ServiceRequest = {
      id: `req-${Date.now()}`,
      type,
      label,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'in-progress',
      statusText: 'Server assigned to Table ' + (tableNumber || 'T-06'),
    };
    setRequestsList((prev) => [newReq, ...prev]);
    showToast(`Request sent: ${label}! Staff notified.`);
    if (onCallWaiter) onCallWaiter();
  };

  // Instant PDF Bill generation
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        unit: 'mm',
        format: [80, 160], // Thermal receipt size format
      });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Resto Daddy', 40, 12, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('Main Outlet • Outlet No. 01', 40, 17, { align: 'center' });
      doc.text(`Table: ${tableNumber || 'T-06'} | Order: ORD-5687`, 40, 22, { align: 'center' });
      doc.text(
        `Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        40,
        26,
        { align: 'center' }
      );

      doc.setLineWidth(0.3);
      doc.line(8, 29, 72, 29);

      let y = 35;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('Item', 10, y);
      doc.text('Qty', 46, y);
      doc.text('Price', 70, y, { align: 'right' });

      doc.line(8, y + 2, 72, y + 2);
      y += 7;

      doc.setFont('helvetica', 'normal');
      orderItems.forEach((item) => {
        doc.text(item.name.substring(0, 15), 10, y);
        doc.text(`${item.quantity}`, 48, y);
        doc.text(`₹${(item.price * item.quantity).toFixed(2)}`, 70, y, { align: 'right' });
        y += 5;
      });

      doc.line(8, y + 1, 72, y + 1);
      y += 6;

      doc.setFont('helvetica', 'bold');
      doc.text('Subtotal:', 10, y);
      doc.text(`₹${totalAmount.toFixed(2)}`, 70, y, { align: 'right' });
      y += 5;

      const tax = totalAmount * 0.05;
      doc.text('GST (5%):', 10, y);
      doc.text(`₹${tax.toFixed(2)}`, 70, y, { align: 'right' });
      y += 5;

      doc.setFontSize(10);
      doc.text('Total Amount:', 10, y);
      doc.text(`₹${(totalAmount + tax).toFixed(2)}`, 70, y, { align: 'right' });
      y += 8;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Thank you for dining with us!', 40, y, { align: 'center' });
      doc.text('Verified Dine-In Session', 40, y + 4, { align: 'center' });

      doc.save(`RestoDaddy-ORD-5687-Bill.pdf`);
      showToast('Bill PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast('Downloaded Bill Receipt!');
    }
  };

  // Cancel order handler
  const handleCancelOrder = () => {
    setOrderCancelled(true);
    setCancelModalOpen(false);
    showToast('Order ORD-5687 has been cancelled.');
  };

  return (
    <div className="min-h-full flex flex-col bg-[#F8FAF9] pb-28 text-slate-900 select-none">
      {/* Toast alert */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#00C060] shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* ================= 1. DARK FOREST GREEN HEADER BAR ================= */}
      <header
        className="w-full px-4 pt-3 pb-4 text-white shrink-0 shadow-md"
        style={{
          background: 'linear-gradient(180deg, #041B0D 0%, #062613 60%, #082E17 100%)',
        }}
      >
        <div className="flex items-center justify-between gap-2.5">
          {/* Back Circle Button */}
          <button
            type="button"
            onClick={onBack || onGoToMenu}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition shrink-0 active:scale-95"
            aria-label="Back to Menu"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Restaurant Identity with Chef Hat Icon */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
              <ChefHat className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-black text-white leading-tight truncate tracking-tight">
                {shopName}
              </h1>
              <p className="text-[11px] font-bold text-emerald-200/80 flex items-center gap-1 mt-0.5 truncate">
                <span>Main Outlet • Outlet No. 01</span>
                <span className="text-emerald-400 text-xs">⌵</span>
              </p>
            </div>
          </div>

          {/* Right Action Circle Buttons (Search & Cart Bag) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition active:scale-95"
              aria-label="Search"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="relative w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition active:scale-95"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#00C060] text-white text-[11px] font-black flex items-center justify-center shadow-md">
                {totalItemsCount || cart.length || 2}
              </span>
            </button>
          </div>
        </div>

        {/* Collapsible Search Input */}
        {searchOpen && (
          <div className="mt-3 relative animate-in fade-in slide-in-from-top-2 duration-200">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search your order items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-emerald-200/50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#00C060]"
              autoFocus
            />
          </div>
        )}
      </header>

      {/* ================= 2. TABLE STATUS BAR (LOCKED) ================= */}
      <div className="px-4 pt-3 shrink-0">
        <div className="rounded-2xl bg-white border border-slate-100 shadow-xs p-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-[#00C060]">
              <Armchair className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-sm font-black text-slate-900 tracking-tight">
              Table {tableNumber || 'T-06'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E7F9F0] text-[#00C060] text-[10px] font-black border border-emerald-200">
              <Lock className="w-2.5 h-2.5 stroke-[2.5]" />
              <span>Locked</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Users className="w-4 h-4 text-slate-400" />
            <span>{guestsCount} Guests</span>
          </div>
        </div>
      </div>

      {/* ================= 3. SUB-NAVIGATION TABS (My Order | Requests | Order History) ================= */}
      <div className="px-4 pt-3 shrink-0">
        <div className="grid grid-cols-3 gap-2 bg-transparent">
          {/* Tab 1: My Order */}
          <button
            type="button"
            onClick={() => setSubTab('my-order')}
            className={`py-2 px-3 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-black transition-all ${
              subTab === 'my-order'
                ? 'bg-[#E7F9F0] text-[#008A46] border border-emerald-300/80 shadow-xs'
                : 'bg-white border border-slate-100 text-slate-600 hover:text-slate-900 shadow-2xs'
            }`}
          >
            <ShoppingBag className={`w-3.5 h-3.5 ${subTab === 'my-order' ? 'text-[#008A46]' : 'text-slate-400'}`} />
            <span>My Order</span>
          </button>

          {/* Tab 2: Requests */}
          <button
            type="button"
            onClick={() => setSubTab('requests')}
            className={`py-2 px-3 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-black transition-all ${
              subTab === 'requests'
                ? 'bg-[#E7F9F0] text-[#008A46] border border-emerald-300/80 shadow-xs'
                : 'bg-white border border-slate-100 text-slate-600 hover:text-slate-900 shadow-2xs'
            }`}
          >
            <Bell className={`w-3.5 h-3.5 ${subTab === 'requests' ? 'text-[#008A46]' : 'text-slate-400'}`} />
            <span>Requests</span>
            {requestsList.filter((r) => r.status === 'in-progress').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>

          {/* Tab 3: Order History */}
          <button
            type="button"
            onClick={() => setSubTab('history')}
            className={`py-2 px-3 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-black transition-all ${
              subTab === 'history'
                ? 'bg-[#E7F9F0] text-[#008A46] border border-emerald-300/80 shadow-xs'
                : 'bg-white border border-slate-100 text-slate-600 hover:text-slate-900 shadow-2xs'
            }`}
          >
            <History className={`w-3.5 h-3.5 ${subTab === 'history' ? 'text-[#008A46]' : 'text-slate-400'}`} />
            <span>Order History</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ============================ TAB 1: MY ORDER ============================ */}
      {/* ========================================================================= */}
      {subTab === 'my-order' && (
        <div className="space-y-4 pt-3">
          {/* Cancelled Alert Banner if user cancelled */}
          {orderCancelled && (
            <div className="mx-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Order ORD-5687 was cancelled.</span>
              </span>
              <button
                type="button"
                onClick={() => setOrderCancelled(false)}
                className="text-[11px] underline font-black text-rose-700 hover:text-rose-900"
              >
                Restore
              </button>
            </div>
          )}

          {/* 4. CURRENT ORDER CARD (DARK FOREST GREEN WITH LIVE TRACKER) */}
          <div className="px-4">
            <div
              className="rounded-3xl p-4 sm:p-5 text-white relative shadow-md overflow-hidden"
              style={{
                background: 'linear-gradient(115deg, #021E0F 0%, #063118 55%, #0A4222 100%)',
              }}
            >
              {/* Subtle Glowing Wavy Accent in background */}
              <div
                className="absolute right-0 bottom-0 top-0 w-1/2 opacity-30 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 80% 50%, rgba(0, 192, 96, 0.45) 0%, transparent 70%)',
                }}
              />

              {/* Card Header */}
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                    <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-white tracking-tight">
                        Current Order
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E7F9F0] text-[#006A35] text-[10px] font-black">
                        Dine In
                      </span>
                    </div>
                    <p className="text-xs font-bold text-emerald-200/90 mt-0.5">
                      Order ID: ORD-5687
                    </p>
                    <p className="text-[11px] font-medium text-emerald-200/60 mt-0.5">
                      Placed at 12:28 PM
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8E6] text-[#D97706] text-xs font-black shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
                    <span>In Progress</span>
                  </span>
                </div>
              </div>

              {/* Stepper Progress Bar (Placed -> Preparing -> Ready -> Served) */}
              <div className="mt-5 pt-3 border-t border-emerald-800/40 relative z-10">
                <div className="flex items-center justify-between relative">
                  {/* Progress Line */}
                  <div className="absolute top-3 left-4 right-4 h-0.5 bg-emerald-900/80 -z-0">
                    <div
                      className="h-full bg-[#00C060] transition-all duration-500"
                      style={{
                        width:
                          orderStatus === 'placed'
                            ? '0%'
                            : orderStatus === 'preparing'
                            ? '33%'
                            : orderStatus === 'ready'
                            ? '66%'
                            : '100%',
                      }}
                    />
                  </div>

                  {/* Step 1: Placed */}
                  <button
                    type="button"
                    onClick={() => {
                      setOrderStatus('placed');
                      showToast('Status: Placed');
                    }}
                    className="flex flex-col items-center gap-1.5 z-10 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#00C060] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-[10px] font-black text-emerald-300">Placed</span>
                  </button>

                  {/* Step 2: Preparing */}
                  <button
                    type="button"
                    onClick={() => {
                      setOrderStatus('preparing');
                      showToast('Status: Preparing');
                    }}
                    className="flex flex-col items-center gap-1.5 z-10 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#00C060] text-white flex items-center justify-center ring-4 ring-[#00C060]/30 shadow-xs animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="text-[10px] font-black text-white">Preparing</span>
                  </button>

                  {/* Step 3: Ready */}
                  <button
                    type="button"
                    onClick={() => {
                      setOrderStatus('ready');
                      showToast('Status: Food is Ready!');
                    }}
                    className="flex flex-col items-center gap-1.5 z-10 cursor-pointer"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        orderStatus === 'ready' || orderStatus === 'served'
                          ? 'bg-[#00C060] text-white'
                          : 'bg-emerald-950 border-2 border-emerald-700/80 text-emerald-400'
                      }`}
                    >
                      {orderStatus === 'ready' || orderStatus === 'served' ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-300/70">Ready</span>
                  </button>

                  {/* Step 4: Served */}
                  <button
                    type="button"
                    onClick={() => {
                      setOrderStatus('served');
                      showToast('Status: Order Served!');
                    }}
                    className="flex flex-col items-center gap-1.5 z-10 cursor-pointer"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        orderStatus === 'served'
                          ? 'bg-[#00C060] text-white'
                          : 'bg-emerald-950 border-2 border-emerald-700/80 text-emerald-400'
                      }`}
                    >
                      {orderStatus === 'served' ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-300/70">Served</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 5. QUICK REQUESTS SECTION (Call Staff | Water | Bill | Download Bill | Other Request) */}
          <div className="px-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-slate-900">Quick Requests</h3>
              <span className="text-[11px] font-semibold text-slate-400">
                Need something? Let us know instantly.
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {/* 1. Call Staff */}
              <button
                type="button"
                onClick={() => handleSendRequest('waiter', 'Call Staff')}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-[#00C060] hover:shadow-xs transition active:scale-95 text-center group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-50 group-hover:bg-[#E7F9F0] flex items-center justify-center text-slate-600 group-hover:text-[#00C060] transition mb-1">
                  <Bell className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-bold text-slate-800 leading-tight">
                  Call Staff
                </span>
              </button>

              {/* 2. Water */}
              <button
                type="button"
                onClick={() => handleSendRequest('water', 'Drinking Water')}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-[#00C060] hover:shadow-xs transition active:scale-95 text-center group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-50 group-hover:bg-[#E7F9F0] flex items-center justify-center text-slate-600 group-hover:text-[#00C060] transition mb-1">
                  <Droplets className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-bold text-slate-800 leading-tight">
                  Water
                </span>
              </button>

              {/* 3. Bill */}
              <button
                type="button"
                onClick={() => setBillModalOpen(true)}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#E7F9F0] border border-emerald-300 shadow-2xs hover:bg-[#DCF6E7] transition active:scale-95 text-center group"
              >
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#008A46] transition mb-1 shadow-2xs">
                  <FileText className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-black text-[#008A46] leading-tight">
                  Bill
                </span>
              </button>

              {/* 4. Download Bill (PDF) */}
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-[#00C060] hover:shadow-xs transition active:scale-95 text-center group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-50 group-hover:bg-[#E7F9F0] flex items-center justify-center text-slate-600 group-hover:text-[#00C060] transition mb-1">
                  <Download className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-[9.5px] font-bold text-slate-800 leading-tight">
                  Download Bill (PDF)
                </span>
              </button>

              {/* 5. Other Request */}
              <button
                type="button"
                onClick={() => setCustomRequestModal(true)}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-[#00C060] hover:shadow-xs transition active:scale-95 text-center group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-50 group-hover:bg-[#E7F9F0] flex items-center justify-center text-slate-600 group-hover:text-[#00C060] transition mb-1">
                  <Plus className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-bold text-slate-800 leading-tight">
                  Other Request
                </span>
              </button>
            </div>
          </div>

          {/* 6. ORDER ITEMS LIST (3 ITEMS FROM SCREENSHOT) */}
          <div className="px-4">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-black text-slate-900">
                Order Items ({totalItemsCount})
              </h3>
              <button
                type="button"
                onClick={onGoToMenu}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-emerald-300 bg-[#E7F9F0] text-[#008A46] text-xs font-black hover:bg-emerald-100 transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add More Items</span>
              </button>
            </div>

            {/* Items Cards */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-3 divide-y divide-slate-100">
              {orderItems.map((item) => (
                <div key={item.id} className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-2.5">
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain filter drop-shadow-xs"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-slate-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] font-semibold text-slate-400 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Right: Stepper, Price & Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Stepper [- 1 +] */}
                    <div className="flex items-center bg-slate-50 rounded-full border border-slate-200/80 p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 transition active:scale-95 shadow-2xs"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3 h-3 stroke-[2.5]" />
                      </button>
                      <span className="w-6 text-center text-xs font-black text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center text-[#008A46] transition active:scale-95 shadow-2xs"
                        aria-label="Increase"
                      >
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Price */}
                    <span className="w-14 text-right text-sm font-black text-slate-900">
                      ₹{item.price * item.quantity}
                    </span>

                    {/* More button */}
                    <button
                      type="button"
                      onClick={() => showToast(`Options for ${item.name}`)}
                      className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7. TOTAL SUMMARY BAR (Matching green banner from screenshot) */}
          <div className="px-4">
            <div className="rounded-2xl bg-[#E7F9F0] border border-emerald-200/90 p-3.5 px-5 flex items-center justify-between text-[#006A35] shadow-xs">
              <span className="text-sm font-bold tracking-tight">
                Total ({totalItemsCount} Items)
              </span>
              <span className="text-xl font-black tracking-tight">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* 8. ACTION BUTTONS GRID (4 Buttons from screenshot) */}
          <div className="px-4">
            <div className="grid grid-cols-2 gap-2.5">
              {/* Button 1: + Add More Items */}
              <button
                type="button"
                onClick={onGoToMenu}
                className="py-3 px-3 rounded-2xl bg-[#00C060] hover:bg-[#00A854] text-white text-xs font-black shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add More Items</span>
              </button>

              {/* Button 2: Bill (Checkout) */}
              <button
                type="button"
                onClick={() => setBillModalOpen(true)}
                className="py-3 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Bill (Checkout)</span>
              </button>

              {/* Button 3: Download Bill PDF */}
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="py-3 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Download Bill PDF</span>
              </button>

              {/* Button 4: Cancel Order */}
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="py-3 px-3 rounded-2xl bg-rose-50/50 hover:bg-rose-100/60 border border-rose-200/80 text-rose-600 text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
                <span>Cancel Order</span>
              </button>
            </div>
          </div>

          {/* 9. ORDER HISTORY PREVIEW CARD */}
          <div className="px-4 pt-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-slate-900">Order History</h3>
              <button
                type="button"
                onClick={() => setSubTab('history')}
                className="text-xs font-bold text-[#008A46] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <span>→</span>
              </button>
            </div>

            {/* Past Order Item Card */}
            <div
              onClick={() => setSubTab('history')}
              className="rounded-2xl bg-white border border-slate-100 shadow-xs p-3.5 flex items-center justify-between cursor-pointer hover:border-slate-200 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#E7F9F0] text-[#008A46] flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">ORD-5632</h4>
                  <p className="text-[11px] font-semibold text-slate-400">
                    28 Oct, 2:14 PM
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-sm font-black text-slate-900">₹640.00</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E7F9F0] text-[#008A46] text-[10px] font-black border border-emerald-200">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Completed</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* =========================== TAB 2: REQUESTS ============================= */}
      {/* ========================================================================= */}
      {subTab === 'requests' && (
        <div className="space-y-4 pt-3 px-4">
          <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#E7F9F0] text-[#008A46] flex items-center justify-center font-black">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Table Service Requests
                </h3>
                <p className="text-xs font-semibold text-slate-400">
                  Instant alerts dispatched directly to kitchen and floor waiters.
                </p>
              </div>
            </div>

            {/* Quick Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleSendRequest('water', 'Drinking Water (2 Glasses)')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-[#E7F9F0] border border-slate-200/60 hover:border-emerald-300 text-left transition active:scale-95"
              >
                <Droplets className="w-5 h-5 text-sky-500 mb-1.5" />
                <span className="text-xs font-black text-slate-800 block">
                  Fresh Water
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Chilled / Room Temp
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSendRequest('waiter', 'Call Waiter to Table')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-[#E7F9F0] border border-slate-200/60 hover:border-emerald-300 text-left transition active:scale-95"
              >
                <Bell className="w-5 h-5 text-amber-500 mb-1.5" />
                <span className="text-xs font-black text-slate-800 block">
                  Call Waiter
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Staff to Table T-06
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSendRequest('cutlery', 'Extra Plates & Cutlery')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-[#E7F9F0] border border-slate-200/60 hover:border-emerald-300 text-left transition active:scale-95"
              >
                <UtensilsCrossed className="w-5 h-5 text-emerald-500 mb-1.5" />
                <span className="text-xs font-black text-slate-800 block">
                  Extra Cutlery
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Forks, spoons & tissues
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSendRequest('clean', 'Clean Table Surface')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-[#E7F9F0] border border-slate-200/60 hover:border-emerald-300 text-left transition active:scale-95"
              >
                <Sparkles className="w-5 h-5 text-purple-500 mb-1.5" />
                <span className="text-xs font-black text-slate-800 block">
                  Clean Table
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Wipe & clear plates
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSendRequest('sauces', 'Extra Sauces & Seasoning')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-[#E7F9F0] border border-slate-200/60 hover:border-emerald-300 text-left transition active:scale-95"
              >
                <HelpCircle className="w-5 h-5 text-rose-500 mb-1.5" />
                <span className="text-xs font-black text-slate-800 block">
                  Sauces & Dip
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Mayo, Ketchup, Chili
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBillModalOpen(true)}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-[#E7F9F0] border border-slate-200/60 hover:border-emerald-300 text-left transition active:scale-95"
              >
                <FileText className="w-5 h-5 text-emerald-600 mb-1.5" />
                <span className="text-xs font-black text-slate-800 block">
                  Bring The Bill
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Card machine / Cash
                </span>
              </button>
            </div>
          </div>

          {/* Active Requests Feed */}
          <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-xs">
            <h3 className="text-sm font-black text-slate-900 mb-3">
              Request Activity ({requestsList.length})
            </h3>

            <div className="space-y-2.5">
              {requestsList.map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${
                        req.status === 'completed'
                          ? 'bg-emerald-100 text-[#008A46]'
                          : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      {req.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5 animate-spin" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{req.label}</h4>
                      <p className="text-[10px] font-semibold text-slate-500">
                        {req.statusText} • {req.time}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      req.status === 'completed'
                        ? 'bg-[#E7F9F0] text-[#008A46]'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}
                  >
                    {req.status === 'completed' ? 'Completed' : 'On The Way'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ========================= TAB 3: ORDER HISTORY ========================== */}
      {/* ========================================================================= */}
      {subTab === 'history' && (
        <div className="space-y-3 pt-3 px-4">
          <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-black text-slate-900">
                Your Dine-In Order History
              </h3>
              <span className="text-xs font-bold text-slate-400">
                Table {tableNumber || 'T-06'}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Track previous items ordered during this and past restaurant sessions.
            </p>
          </div>

          {/* History List */}
          <div className="space-y-3">
            {historyOrders.map((hist) => (
              <div
                key={hist.id}
                className="rounded-3xl bg-white border border-slate-100 shadow-xs p-4 sm:p-5 space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#E7F9F0] text-[#008A46] flex items-center justify-center font-black">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{hist.id}</h4>
                      <p className="text-[11px] font-semibold text-slate-400">
                        {hist.date} • {hist.itemsCount} Items
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-slate-900 block">
                      ₹{hist.total.toFixed(2)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#008A46]">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Completed</span>
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="bg-slate-50 rounded-2xl p-3 divide-y divide-slate-100/80 text-xs">
                  {hist.items.map((it, idx) => (
                    <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between">
                      <span className="font-bold text-slate-700">
                        {it.quantity}x {it.name} ({it.portion})
                      </span>
                      <span className="font-black text-slate-900">
                        ₹{it.price * it.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onAddToCart) {
                        hist.items.forEach((it) => {
                          onAddToCart({
                            id: `reorder-${it.name}`,
                            name: it.name,
                            category: 'reorder',
                            subtitle: it.portion,
                            price: it.price,
                            image: it.image,
                          });
                        });
                        showToast(`Re-ordered items from ${hist.id}!`);
                      }
                    }}
                    className="flex-1 py-2 rounded-xl bg-[#00C060] text-white text-xs font-black shadow-xs hover:bg-[#00A854] transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Re-order Items</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition active:scale-95 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ======================== BILL & CHECKOUT MODAL ========================== */}
      {/* ========================================================================= */}
      {billModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E7F9F0] text-[#008A46] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Table {tableNumber || 'T-06'} Bill
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400">
                    Order ID: ORD-5687 • Dine-In Summary
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBillModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bill Calculation */}
            <div className="space-y-2 py-1 text-xs">
              {orderItems.map((it) => (
                <div key={it.id} className="flex justify-between text-slate-700">
                  <span>
                    {it.name} <span className="text-slate-400">x{it.quantity}</span>
                  </span>
                  <span className="font-bold text-slate-900">
                    ₹{it.price * it.quantity}
                  </span>
                </div>
              ))}

              <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between font-bold text-slate-600">
                <span>Subtotal</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>CGST (2.5%)</span>
                <span>₹{(totalAmount * 0.025).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>SGST (2.5%)</span>
                <span>₹{(totalAmount * 0.025).toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-900 pt-2 flex justify-between text-base font-black text-slate-900">
                <span>Grand Total</span>
                <span className="text-[#008A46]">₹{(totalAmount * 1.05).toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Choice */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-black text-slate-900 block">
                Select Payment Mode:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayment('upi')}
                  className={`p-2.5 rounded-2xl border text-center transition ${
                    selectedPayment === 'upi'
                      ? 'border-[#00C060] bg-[#E7F9F0] text-[#008A46] font-black'
                      : 'border-slate-200 bg-white text-slate-700 font-bold'
                  }`}
                >
                  <QrCode className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-[11px] block">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPayment('card')}
                  className={`p-2.5 rounded-2xl border text-center transition ${
                    selectedPayment === 'card'
                      ? 'border-[#00C060] bg-[#E7F9F0] text-[#008A46] font-black'
                      : 'border-slate-200 bg-white text-slate-700 font-bold'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-[11px] block">Card Machine</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPayment('cash')}
                  className={`p-2.5 rounded-2xl border text-center transition ${
                    selectedPayment === 'cash'
                      ? 'border-[#00C060] bg-[#E7F9F0] text-[#008A46] font-black'
                      : 'border-slate-200 bg-white text-slate-700 font-bold'
                  }`}
                >
                  <Banknote className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-[11px] block">Cash Table</span>
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setBillPaid(true);
                  showToast('Payment request sent to billing desk! Waiter approaching.');
                  setTimeout(() => setBillModalOpen(false), 1200);
                }}
                className="w-full py-3 rounded-2xl bg-[#00C060] hover:bg-[#00A854] text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {billPaid ? 'Paid & Verified' : `Pay ₹${(totalAmount * 1.05).toFixed(2)}`}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                className="w-full py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-50 transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Download Itemized PDF Bill</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ===================== OTHER CUSTOM REQUEST MODAL ======================== */}
      {/* ========================================================================= */}
      {customRequestModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                Custom Table Request
              </h3>
              <button
                type="button"
                onClick={() => setCustomRequestModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Need special condiments, high chair, or table assistance? Tell us here:
            </p>

            <textarea
              rows={3}
              value={customRequestText}
              onChange={(e) => setCustomRequestText(e.target.value)}
              placeholder="e.g. Please bring warm water, extra tissues, and spicy dip..."
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00C060]"
            />

            <button
              type="button"
              onClick={() => {
                if (customRequestText.trim()) {
                  handleSendRequest('custom', customRequestText.trim());
                  setCustomRequestText('');
                  setCustomRequestModal(false);
                }
              }}
              className="w-full py-3 rounded-2xl bg-[#00C060] text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Submit Request to Staff</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ======================= CANCEL ORDER MODAL ============================== */}
      {/* ========================================================================= */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6 stroke-[2.2]" />
            </div>

            <h3 className="text-base font-black text-slate-900">
              Cancel Order ORD-5687?
            </h3>
            <p className="text-xs text-slate-500">
              Your food is currently being prepared in the kitchen. Cancelling now will notify the head chef immediately.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black hover:bg-slate-200 transition"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                className="py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black hover:bg-rose-700 transition"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
