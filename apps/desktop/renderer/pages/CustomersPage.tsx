import React from 'react';
import { Search, UserPlus, Award } from 'lucide-react';
import { formatINR } from '@bitechez/business-logic';

interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  points: number;
  ordersCount: number;
  totalSpentPaise: number;
  lastVisit: string;
}

export const CustomersPage: React.FC = () => {
  const [search, setSearch] = React.useState('');
  const [customers] = React.useState<CustomerProfile[]>([
    { id: '1', name: 'Aarav Sharma', phone: '+91 98201 12345', points: 340, ordersCount: 14, totalSpentPaise: 845000, lastVisit: 'Yesterday' },
    { id: '2', name: 'Priya Mehra', phone: '+91 98112 54321', points: 520, ordersCount: 22, totalSpentPaise: 1620000, lastVisit: '3 days ago' },
    { id: '3', name: 'Karan Kapoor', phone: '+91 99234 88776', points: 120, ordersCount: 5, totalSpentPaise: 380000, lastVisit: '1 week ago' },
    { id: '4', name: 'Sneha Patel', phone: '+91 97654 33211', points: 890, ordersCount: 38, totalSpentPaise: 2940000, lastVisit: 'Today' },
  ]);

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#191923] tracking-tight">Customer Loyalty & Directory</h2>
          <p className="text-xs text-gray-500 mt-1">Reward points • Visit history • VIP guest recognition</p>
        </div>
        <button className="px-4 py-2 bg-[#800D32] hover:bg-[#600821] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
          <UserPlus className="w-4 h-4" /> Add New Customer
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by customer name or mobile number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#800D32]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FAF8F9] border-b border-gray-100 text-xs font-semibold text-gray-400">
            <tr>
              <th className="p-4">Customer Name</th>
              <th className="p-4">Mobile</th>
              <th className="p-4">Loyalty Points</th>
              <th className="p-4">Visits</th>
              <th className="p-4">Lifetime Spend</th>
              <th className="p-4">Last Seen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="p-4 font-bold text-[#191923] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F9E8ED] text-[#800D32] flex items-center justify-center font-bold text-xs">
                    {c.name[0]}
                  </div>
                  <span>{c.name}</span>
                </td>
                <td className="p-4 text-xs text-gray-600 font-mono">{c.phone}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Award className="w-3.5 h-3.5" /> {c.points} pts
                  </span>
                </td>
                <td className="p-4 text-xs font-bold text-gray-700">{c.ordersCount} orders</td>
                <td className="p-4 font-bold text-[#800D32]">{formatINR(c.totalSpentPaise)}</td>
                <td className="p-4 text-xs text-gray-500">{c.lastVisit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
