import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { SplashScreen } from './SplashScreen';
import { BottomNavBar, WebsiteTab } from './BottomNavBar';
import { HomeMenuView } from './HomeMenuView';
import { OrdersView, CartItem } from './OrdersView';
import { ReviewView } from './ReviewView';
import { LoyaltyView } from './LoyaltyView';
import { ProfileView } from './ProfileView';
import { CartDrawer } from './CartDrawer';
import { WebsiteProduct } from './websiteData';
import { Smartphone, Monitor, Signal, Wifi, Battery, CheckCircle2 } from 'lucide-react';

export const WebsiteMenuPage: React.FC = () => {
  const { shopName: routeShop } = useParams<{ shopName?: string }>();
  const [searchParams] = useSearchParams();

  // Read shop name / outlet name from path or query
  const shopName = routeShop || searchParams.get('outlet') || 'cyberlim';

  // Read table number from query parameters
  const queryTable = searchParams.get('table') || searchParams.get('tableNumber') || searchParams.get('id') || '';

  // Has table check
  const hasTable = Boolean(queryTable.trim());
  const tableNumber = queryTable.trim();

  // Splash screen state (shown on initial load)
  const [showSplash, setShowSplash] = useState(true);

  // Active tab state:
  // USER RULE: "when table number not selected thn do not show any menu or anything only show review page"
  const [activeTab, setActiveTab] = useState<WebsiteTab>(hasTable ? 'home' : 'review');

  // Enforce review page if no table is selected
  useEffect(() => {
    if (!hasTable) {
      setActiveTab('review');
    }
  }, [hasTable]);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([
    // Pre-populate with 2 items to match the screenshot badge '2'
    {
      product: {
        id: 'item-cheese-burger',
        name: 'Cheese Burger',
        category: 'burgers',
        subtitle: 'Juicy patty, cheese, fresh veggies',
        price: 220,
        originalPrice: 260,
        image: '',
        isBestseller: true,
      },
      quantity: 1,
    },
    {
      product: {
        id: 'item-margherita-pizza',
        name: 'Margherita Pizza',
        category: 'pizza',
        subtitle: 'Classic tomato, mozzarella & basil',
        price: 320,
        originalPrice: 380,
        image: '',
        isVeg: true,
      },
      quantity: 1,
    },
  ]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  // Placed orders list
  const [placedOrders, setPlacedOrders] = useState<
    {
      id: string;
      items: CartItem[];
      total: number;
      status: 'received' | 'kitchen' | 'ready' | 'served';
      placedAt: string;
    }[]
  >([]);

  // Desktop view mode toggle: 'phone-mockup' (matching screenshot) or 'wide'
  const [desktopMode, setDesktopMode] = useState<'phone-mockup' | 'wide'>('phone-mockup');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = (product: WebsiteProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (!existing) return prev;
      if (existing.quantity === 1) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const handlePlaceOrder = (notes: string) => {
    if (cart.length === 0) return;
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const total = subtotal * 1.05;

    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      items: [...cart],
      total,
      status: 'received' as const,
      placedAt: 'Just now',
    };

    setPlacedOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setActiveTab('orders');
    showToast(`Order sent to kitchen for Table ${tableNumber}!${notes ? ` (Note: ${notes})` : ''}`);
  };

  const handleCallWaiter = () => {
    showToast(`Waiter alerted for Table ${tableNumber || 'your table'}!`);
  };

  // Main interactive view router
  const renderActiveTabContent = () => {
    // STRICT RULE: If table number not selected, NEVER show menu or orders - ONLY review page!
    if (!hasTable) {
      return (
        <ReviewView
          shopName={shopName}
          tableNumber={tableNumber}
          hasTable={hasTable}
          cartCount={cart.length}
          onBack={() => showToast('Scan a table QR code to unlock menu')}
          onOpenCart={() => setCartDrawerOpen(true)}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeMenuView
            shopName={shopName}
            tableNumber={tableNumber}
            guestsCount={4}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onOpenCart={() => setCartDrawerOpen(true)}
            onBack={() => showToast('Dining session active')}
          />
        );
      case 'orders':
        return (
          <OrdersView
            shopName={shopName}
            tableNumber={tableNumber}
            guestsCount={4}
            cart={cart}
            placedOrders={placedOrders}
            onAddToCart={handleAddToCart}
            onCallWaiter={handleCallWaiter}
            onClearCart={() => setCart([])}
            onGoToMenu={() => setActiveTab('home')}
            onOpenCart={() => setCartDrawerOpen(true)}
            onBack={() => setActiveTab('home')}
          />
        );
      case 'review':
        return (
          <ReviewView
            shopName={shopName}
            tableNumber={tableNumber}
            hasTable={hasTable}
            cartCount={cart.length}
            onBack={() => setActiveTab('home')}
            onOpenCart={() => setCartDrawerOpen(true)}
          />
        );
      case 'loyalty':
        return (
          <LoyaltyView
            shopName={shopName}
            tableNumber={tableNumber}
            guestsCount={4}
            cartCount={cart.length || 2}
            onBack={() => setActiveTab('home')}
            onOpenCart={() => setCartDrawerOpen(true)}
            onGoToMenu={() => setActiveTab('home')}
          />
        );
      case 'profile':
        return (
          <ProfileView
            shopName={shopName}
            tableNumber={tableNumber}
            guestsCount={4}
            cartCount={cart.length || 2}
            onBack={() => setActiveTab('home')}
            onOpenCart={() => setCartDrawerOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F2] flex flex-col items-center justify-start text-slate-800 antialiased select-none">
      {/* 1. INITIAL SPLASH SCREEN (matching left screen in user's image) */}
      {showSplash && (
        <SplashScreen
          shopName={shopName}
          onFinish={() => setShowSplash(false)}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 z-[99] px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#00C060]" />
          <span>{toast}</span>
        </div>
      )}

      {/* 2. DESKTOP VIEW CONTROLLER TOP BAR (VISIBLE ONLY ON LARGE SCREENS) */}
      <div className="hidden lg:flex w-full bg-white border-b border-slate-200/90 px-6 py-2.5 items-center justify-between shadow-2xs z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#00C060] text-white flex items-center justify-center font-black">
            <span>RD</span>
          </div>
          <div>
            <h1 className="text-xs font-black text-slate-900 capitalize leading-tight">
              Resto Daddy • Customer Web Menu
            </h1>
            <p className="text-[10px] font-bold text-slate-400">
              {hasTable ? `Locked to Table ${tableNumber}` : 'No Table Selected (Review Mode)'}
            </p>
          </div>
        </div>

        {/* Desktop View Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setDesktopMode('phone-mockup')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
              desktopMode === 'phone-mockup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App Mockup</span>
          </button>
          <button
            type="button"
            onClick={() => setDesktopMode('wide')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
              desktopMode === 'wide'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Wide Desktop Portal</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN APPLICATION CONTAINER (RESPONSIVE: MOBILE FULLSCREEN OR PHONE MOCKUP ON DESKTOP) */}
      <main
        className={`w-full transition-all flex flex-col justify-between ${
          desktopMode === 'phone-mockup'
            ? 'max-w-[430px] h-[100dvh] sm:h-[880px] sm:max-h-[94vh] my-0 sm:my-4 sm:rounded-[48px] bg-[#F8FAF9] shadow-[0_24px_70px_rgba(0,0,0,0.22)] sm:border-[9px] sm:border-slate-900 overflow-hidden relative'
            : 'max-w-4xl h-[100dvh] sm:h-[90vh] my-0 sm:my-4 rounded-3xl bg-[#F8FAF9] shadow-xl overflow-hidden relative'
        }`}
      >
        {/* Mock Smartphone Notch & Status Bar (Over dark green header) */}
        {desktopMode === 'phone-mockup' && activeTab === 'home' && hasTable && (
          <div className="w-full px-7 pt-3 pb-1 flex items-center justify-between text-white text-xs font-bold z-20 shrink-0 select-none bg-[#041B0D]">
            <span>9:41</span>
            <div className="w-4 h-4 bg-black rounded-full mx-auto" />
            <div className="flex items-center gap-1.5">
              <Signal className="w-3.5 h-3.5 fill-current" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4 fill-current" />
            </div>
          </div>
        )}

        {/* Content Body - Fully Vertically Scrollable with smooth momentum */}
        <div className="flex-1 overflow-y-auto overscroll-contain pos-scroll w-full relative">
          {renderActiveTabContent()}
        </div>

        {/* 4. BOTTOM NAVIGATION BAR (Home, Orders, Review, Loyalty, Profile) */}
        <BottomNavBar
          activeTab={activeTab}
          onChangeTab={(tab) => {
            if (!hasTable && tab !== 'review') {
              showToast('Please scan table QR code to unlock menu & orders!');
              return;
            }
            setActiveTab(tab);
          }}
          hasTable={hasTable}
          orderCount={placedOrders.length}
        />
      </main>

      {/* 5. CART DRAWER */}
      <CartDrawer
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cart={cart}
        tableNumber={tableNumber || 'T-06'}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onPlaceOrder={handlePlaceOrder}
      />
    </div>
  );
};

export default WebsiteMenuPage;
