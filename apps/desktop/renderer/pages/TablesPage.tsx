import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Utensils, Sparkles, Clock } from 'lucide-react';
import { RestaurantTable } from '@bitechez/shared-types';
import { apiService } from '../services/api';
import { useCartStore } from '../stores/cartStore';

export const TablesPage: React.FC = () => {
  const navigate = useNavigate();
  const { setTable, setOrderType } = useCartStore();
  const [tables, setTables] = React.useState<RestaurantTable[]>([]);
  const [selectedSection, setSelectedSection] = React.useState<string>('all');

  const loadTables = async () => {
    const list = await apiService.getTables();
    setTables(list);
  };

  React.useEffect(() => {
    loadTables();
  }, []);

  const sections = Array.from(new Set(tables.map((t) => t.section)));

  const handleTableClick = (table: RestaurantTable) => {
    if (table.status === 'available') {
      setOrderType('dine_in');
      setTable(table.id, table.name);
      navigate('/pos');
    }
  };

  const handleMarkCleaned = async (tableId: string) => {
    await apiService.updateTableStatus(tableId, 'available');
    await loadTables();
  };

  const filteredTables = tables.filter((t) => {
    if (selectedSection !== 'all' && t.section !== selectedSection) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#191923] tracking-tight">Table Management</h2>
          <p className="text-xs text-gray-500 mt-1">Live floor map • Occupancy tracking • Guest management</p>
        </div>

        {/* Section Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedSection('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedSection === 'all'
                ? 'bg-[#800D32] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            All Areas ({tables.length})
          </button>
          {sections.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedSection === sec
                  ? 'bg-[#800D32] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const statusStyles = {
            available: {
              card: 'border-emerald-200 hover:border-emerald-500 bg-white',
              badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              accent: 'bg-emerald-500',
            },
            occupied: {
              card: 'border-rose-200 hover:border-rose-500 bg-rose-50/20',
              badge: 'bg-rose-50 text-rose-700 border-rose-200',
              accent: 'bg-rose-500',
            },
            reserved: {
              card: 'border-amber-200 hover:border-amber-500 bg-amber-50/20',
              badge: 'bg-amber-50 text-amber-700 border-amber-200',
              accent: 'bg-amber-500',
            },
            cleaning: {
              card: 'border-blue-200 hover:border-blue-500 bg-blue-50/20',
              badge: 'bg-blue-50 text-blue-700 border-blue-200',
              accent: 'bg-blue-500',
            },
          }[table.status];

          return (
            <div
              key={table.id}
              className={`rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between h-48 relative overflow-hidden ${statusStyles.card}`}
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${statusStyles.accent}`} />

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-[#191923]">{table.name}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${statusStyles.badge}`}>
                    {table.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-1">{table.section}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2 font-medium">
                  <Users className="w-3.5 h-3.5" />
                  <span>Max {table.capacity} guests</span>
                </div>
              </div>

              {/* Action Buttons based on status */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                {table.status === 'available' ? (
                  <button
                    onClick={() => handleTableClick(table)}
                    className="w-full py-2 bg-[#800D32] hover:bg-[#600821] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Utensils className="w-3.5 h-3.5" /> Start Order
                  </button>
                ) : table.status === 'cleaning' ? (
                  <button
                    onClick={() => handleMarkCleaned(table.id)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Mark Ready
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-between text-xs text-rose-700 font-bold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Active Billing
                    </span>
                    <button
                      onClick={() => navigate('/pos')}
                      className="text-[#800D32] underline hover:text-[#600821]"
                    >
                      View
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
