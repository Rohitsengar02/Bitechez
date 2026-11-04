import React from 'react';
import { Check, Clock, Droplets, Utensils, ReceiptText, UserCheck } from 'lucide-react';

interface RequestItem {
  id: string;
  table: string;
  type: string;
  time: string;
  icon: any;
  status: 'pending' | 'resolved';
}

export const RequestsPage: React.FC = () => {
  const [requests, setRequests] = React.useState<RequestItem[]>([
    { id: '1', table: 'T-01', type: 'Extra Water Jar', time: '2 mins ago', icon: Droplets, status: 'pending' },
    { id: '2', table: 'T-04', type: 'Call Captain / Waiter', time: '4 mins ago', icon: UserCheck, status: 'pending' },
    { id: '3', table: 'T-05', type: 'Cutlery & Plates', time: '6 mins ago', icon: Utensils, status: 'pending' },
    { id: '4', table: 'T-03', type: 'Print Final Bill', time: '8 mins ago', icon: ReceiptText, status: 'pending' },
  ]);

  const markResolved = (id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'resolved' } : r)));
  };

  const pending = requests.filter((r) => r.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#191923] tracking-tight">Table Assistance & Requests</h2>
          <p className="text-xs text-gray-500 mt-1">Guest bell alerts • Waiter call dispatch • Service tracking</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-rose-100 text-[#800D32] text-xs font-bold">
          {pending.length} Active Requests
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {requests.map((req) => {
          const Icon = req.icon;
          return (
            <div
              key={req.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition-all ${
                req.status === 'resolved' ? 'opacity-50 border-gray-100' : 'border-rose-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F9E8ED] text-[#800D32] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-base text-[#191923]">{req.table}</h4>
                    <p className="text-xs text-gray-500 font-semibold">{req.type}</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {req.time}
                </span>
              </div>

              {req.status === 'pending' ? (
                <button
                  onClick={() => markResolved(req.id)}
                  className="w-full py-2 bg-[#800D32] hover:bg-[#600821] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Mark Attended
                </button>
              ) : (
                <div className="text-center py-1 text-xs font-bold text-emerald-600">
                  ✓ Resolved
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
