import React from 'react';
import { Home, ShoppingBag, Star, Gift, User, Lock } from 'lucide-react';

export type WebsiteTab = 'home' | 'orders' | 'review' | 'loyalty' | 'profile';

interface BottomNavBarProps {
  activeTab: WebsiteTab;
  onChangeTab: (tab: WebsiteTab) => void;
  hasTable: boolean;
  orderCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onChangeTab,
  hasTable,
  orderCount = 0,
}) => {
  const tabs: {
    id: WebsiteTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    requiresTable?: boolean;
  }[] = [
    { id: 'home', label: 'Home', icon: Home, requiresTable: true },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, requiresTable: true },
    { id: 'review', label: 'Review', icon: Star, requiresTable: false },
    { id: 'loyalty', label: 'Loyalty', icon: Gift, requiresTable: false },
    { id: 'profile', label: 'Profile', icon: User, requiresTable: false },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] px-3 py-1.5 sm:py-2">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isLocked = !hasTable && tab.requiresTable;

          return (
            <button
              key={tab.id}
              type="button"
              disabled={isLocked}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1.5 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-[#00C060] font-black'
                  : isLocked
                  ? 'text-slate-300 cursor-not-allowed opacity-40'
                  : 'text-slate-500 hover:text-slate-800 font-semibold'
              }`}
            >
              <div
                className={`w-12 h-7 rounded-full flex items-center justify-center relative transition-all ${
                  isActive ? 'bg-[#E7F9F0] text-[#00C060]' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />

                {/* Orders count badge */}
                {tab.id === 'orders' && orderCount > 0 && (
                  <span className="absolute -top-1 -right-0.5 w-4 h-4 rounded-full bg-[#00C060] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    {orderCount}
                  </span>
                )}

                {/* Lock icon for non-table mode */}
                {isLocked && (
                  <span className="absolute -top-1 -right-0.5 w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
                    <Lock className="w-2 h-2" />
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive ? 'font-black text-[#00C060]' : 'font-bold text-slate-600'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
