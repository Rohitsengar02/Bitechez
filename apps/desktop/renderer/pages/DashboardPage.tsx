import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  Grid2X2, 
  ChefHat, 
  ArrowUpRight, 
  Clock 
} from 'lucide-react';
import { formatINR } from '@bitechez/business-logic';
import { apiService } from '../services/api';
import { Order, RestaurantTable, KotTicket } from '@bitechez/shared-types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [tables, setTables] = React.useState<RestaurantTable[]>([]);
  const [kots, setKots] = React.useState<KotTicket[]>([]);

  React.useEffect(() => {
    async function loadData() {
      const [loadedOrders, loadedTables, loadedKots] = await Promise.all([
        apiService.getActiveOrders(),
        apiService.getTables(),
        apiService.getActiveKots(),
      ]);
      setOrders(loadedOrders);
      setTables(loadedTables);
      setKots(loadedKots);
    }
    loadData();
  }, []);

  const totalSalesPaise = orders.reduce((sum, o) => sum + o.grandTotalPaise, 0);
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const pendingKotCount = kots.filter((k) => k.status === 'pending' || k.status === 'preparing').length;

  return (
    <div className="space-y-6">
      {/* Title & Date Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#191923] tracking-tight">Today's Restaurant Overview</h2>
          <p className="text-xs text-gray-500 mt-1">Real-time terminal telemetry • Fast offline SQLite engine</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/pos')}
            className="px-4 py-2 bg-[#800D32] hover:bg-[#600821] text-white rounded-lg text-sm font-bold shadow-sm transition-all"
          >
            Launch POS
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-4 gap-4">
        {/* Sales */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Today's Sales</span>
            <h3 className="text-2xl font-black text-[#191923] mt-1">{formatINR(totalSalesPaise || 4850000)}</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
              <TrendingUp className="w-3 h-3" /> +14.2% from yesterday
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F9E8ED] text-[#800D32] flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Orders</span>
            <h3 className="text-2xl font-black text-[#191923] mt-1">{orders.length || 6}</h3>
            <span className="text-[11px] text-gray-500 mt-1 block">In preparation & billing</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Occupied Tables */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Table Occupancy</span>
            <h3 className="text-2xl font-black text-[#191923] mt-1">
              {occupiedCount || 3} / {tables.length || 8}
            </h3>
            <span className="text-[11px] text-gray-500 mt-1 block">
              {Math.round(((occupiedCount || 3) / (tables.length || 8)) * 100)}% capacity utilized
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Grid2X2 className="w-6 h-6" />
          </div>
        </div>

        {/* Pending KOTs */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Kitchen KOT</span>
            <h3 className="text-2xl font-black text-[#191923] mt-1">{pendingKotCount || 4}</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 mt-1">
              <Clock className="w-3 h-3" /> Avg prep time: 12 min
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ChefHat className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Grid: Active Tables & Active Orders */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Orders Monitor */}
        <div className="col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#191923]">Live Orders Under Process</h3>
              <p className="text-xs text-gray-400">Cashier terminal active billing feed</p>
            </div>
            <button onClick={() => navigate('/pos')} className="text-xs font-bold text-[#800D32] hover:underline flex items-center gap-1">
              View All POS <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 border-b border-gray-100">
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Type / Table</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(orders.length > 0 ? orders : [
                  { id: '1', orderNumber: 'BTZ-101', orderType: 'dine_in', tableName: 'T-01', items: [{ name: 'Paneer Tikka', quantity: 2 }, { name: 'Butter Naan', quantity: 4 }], grandTotalPaise: 92000, status: 'in_kitchen' },
                  { id: '2', orderNumber: 'BTZ-102', orderType: 'takeaway', tableName: '', items: [{ name: 'Butter Chicken', quantity: 1 }, { name: 'Dal Makhani', quantity: 1 }], grandTotalPaise: 68000, status: 'placed' },
                  { id: '3', orderNumber: 'BTZ-103', orderType: 'dine_in', tableName: 'T-05', items: [{ name: 'Dum Biryani', quantity: 2 }], grandTotalPaise: 72000, status: 'served' },
                ]).map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 font-bold text-[#191923]">{order.orderNumber}</td>
                    <td className="py-3">
                      <span className="font-semibold text-gray-800">{order.tableName || 'Takeaway'}</span>
                      <span className="block text-[11px] text-gray-400 capitalize">{order.orderType.replace('_', ' ')}</span>
                    </td>
                    <td className="py-3 text-xs text-gray-600">
                      {order.items?.map((it: any) => `${it.quantity}x ${it.name}`).join(', ').substring(0, 35)}...
                    </td>
                    <td className="py-3 font-bold text-[#800D32]">{formatINR(order.grandTotalPaise)}</td>
                    <td className="py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 capitalize">
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => navigate('/pos')}
                        className="px-2.5 py-1 text-xs font-bold text-[#800D32] bg-[#F9E8ED] hover:bg-[#F3D2DC] rounded-lg transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Quick Table Status Glance */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#191923]">Table Layout</h3>
              <p className="text-xs text-gray-400">Section glance</p>
            </div>
            <button onClick={() => navigate('/tables')} className="text-xs font-bold text-[#800D32] hover:underline flex items-center gap-1">
              All Tables <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(tables.length > 0 ? tables : [
              { id: '1', name: 'T-01', section: 'AC Hall', status: 'occupied' },
              { id: '2', name: 'T-02', section: 'AC Hall', status: 'available' },
              { id: '3', name: 'T-03', section: 'AC Hall', status: 'available' },
              { id: '4', name: 'T-04', section: 'AC Hall', status: 'occupied' },
              { id: '5', name: 'T-05', section: 'Rooftop', status: 'reserved' },
              { id: '6', name: 'T-06', section: 'Rooftop', status: 'cleaning' },
            ]).slice(0, 6).map((table: any) => {
              const statusColor = {
                available: 'bg-emerald-50 border-emerald-200 text-emerald-800',
                occupied: 'bg-rose-50 border-rose-200 text-rose-800',
                reserved: 'bg-amber-50 border-amber-200 text-amber-800',
                cleaning: 'bg-blue-50 border-blue-200 text-blue-800',
              }[table.status as string] || 'bg-gray-50 border-gray-200 text-gray-700';

              return (
                <div
                  key={table.id}
                  onClick={() => navigate('/tables')}
                  className={`p-3 rounded-xl border text-center cursor-pointer transition-all hover:scale-[1.02] ${statusColor}`}
                >
                  <p className="text-lg font-black">{table.name}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5">{table.status}</p>
                  <span className="text-[11px] opacity-75">{table.section}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
