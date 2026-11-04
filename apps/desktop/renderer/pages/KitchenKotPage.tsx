import React from 'react';
import { ChefHat, Clock, ArrowRight } from 'lucide-react';
import { KotTicket, KotStatus } from '@bitechez/shared-types';
import { apiService } from '../services/api';

const COLUMNS: Array<{ id: KotStatus; title: string; color: string }> = [
  { id: 'pending', title: 'Pending Orders', color: 'border-rose-400 bg-rose-50/30' },
  { id: 'preparing', title: 'Currently Cooking', color: 'border-amber-400 bg-amber-50/30' },
  { id: 'ready', title: 'Ready to Serve', color: 'border-emerald-400 bg-emerald-50/30' },
  { id: 'completed', title: 'Served History', color: 'border-gray-300 bg-gray-50/30' },
];

export const KitchenKotPage: React.FC = () => {
  const [kots, setKots] = React.useState<KotTicket[]>([]);

  const loadKots = async () => {
    const list = await apiService.getActiveKots();
    setKots(list);
  };

  React.useEffect(() => {
    loadKots();
    const interval = setInterval(loadKots, 4000);
    return () => clearInterval(interval);
  }, []);

  const advanceKot = async (kotId: string, currentStatus: KotStatus) => {
    const nextStatusMap: Partial<Record<KotStatus, KotStatus>> = {
      pending: 'preparing',
      preparing: 'ready',
      ready: 'completed',
    };
    const next = nextStatusMap[currentStatus];
    if (next) {
      await apiService.updateKotStatus(kotId, next);
      await loadKots();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#191923] tracking-tight">Kitchen KOT Display (KDS)</h2>
          <p className="text-xs text-gray-500 mt-1">Live order tickets • Station dispatch • Chef timers</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-[#800D32]">
            <ChefHat className="w-3.5 h-3.5" /> Station: Main Kitchen
          </span>
        </div>
      </div>

      {/* 4-Column Kanban Board */}
      <div className="grid grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
        {COLUMNS.map((col) => {
          const colKots = kots.filter((k) => k.status === col.id);

          return (
            <div key={col.id} className="flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Column Header */}
              <div className={`p-3.5 border-b flex items-center justify-between ${col.color}`}>
                <h3 className="font-bold text-sm text-[#191923]">{col.title}</h3>
                <span className="w-6 h-6 rounded-full bg-white text-[#191923] font-black text-xs flex items-center justify-center shadow-sm">
                  {colKots.length}
                </span>
              </div>

              {/* Tickets List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {colKots.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-gray-400 py-10">
                    <span className="text-xs font-medium">No tickets</span>
                  </div>
                ) : (
                  colKots.map((kot) => (
                    <div
                      key={kot.id}
                      className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm space-y-3 hover:border-[#800D32] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-[#800D32]">
                          KOT #{kot.kotNumber}
                        </span>
                        <span className="text-xs font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-lg">
                          {kot.tableName || 'Takeaway'}
                        </span>
                      </div>

                      <div className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(kot.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-gray-100 text-xs">
                        {kot.items.map((item, idx) => (
                          <div key={idx} className="py-1.5 flex items-start justify-between">
                            <span className="font-bold text-gray-800">
                              {item.quantity}x {item.itemName}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Advance Button */}
                      {col.id !== 'completed' && (
                        <button
                          onClick={() => advanceKot(kot.id, kot.status)}
                          className="w-full py-2 bg-[#800D32] hover:bg-[#600821] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>
                            {col.id === 'pending'
                              ? 'Start Cooking'
                              : col.id === 'preparing'
                              ? 'Mark Ready'
                              : 'Mark Served'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
