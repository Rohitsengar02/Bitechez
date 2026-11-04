import React from 'react';
import { Plus, Search } from 'lucide-react';
import { MenuItem } from '@bitechez/shared-types';
import { formatINR } from '@bitechez/business-logic';
import { apiService } from '../services/api';

export const ItemMenuPage: React.FC = () => {
  const [items, setItems] = React.useState<MenuItem[]>([]);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    async function load() {
      const it = await apiService.getMenuItems();
      setItems(it);
    }
    load();
  }, []);

  const toggleAvailability = (itemId: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i))
    );
  };

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) || i.shortCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#191923] tracking-tight">Menu Catalog & Items</h2>
          <p className="text-xs text-gray-500 mt-1">Item pricing • Veg/non-veg status • Instant stock availability</p>
        </div>
        <button className="px-4 py-2 bg-[#800D32] hover:bg-[#600821] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" /> Add Menu Item
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search menu items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#800D32]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FAF8F9] border-b border-gray-100 text-xs font-semibold text-gray-400">
            <tr>
              <th className="p-4">Type</th>
              <th className="p-4">Item Name</th>
              <th className="p-4">Code</th>
              <th className="p-4">Price</th>
              <th className="p-4">GST Rate</th>
              <th className="p-4 text-center">Status (In Stock)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="p-4">
                  <span
                    className={`inline-block w-3.5 h-3.5 rounded border text-[9px] text-center font-black ${
                      item.isVeg ? 'border-emerald-600 text-emerald-600' : 'border-rose-600 text-rose-600'
                    }`}
                  >
                    ●
                  </span>
                </td>
                <td className="p-4 font-bold text-[#191923]">{item.name}</td>
                <td className="p-4 font-mono text-xs text-gray-500">{item.shortCode || '-'}</td>
                <td className="p-4 font-black text-[#800D32]">{formatINR(item.basePricePaise)}</td>
                <td className="p-4 text-xs font-semibold text-gray-600">{item.gstRate}%</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => toggleAvailability(item.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      item.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {item.isAvailable ? 'Available' : 'Sold Out'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
