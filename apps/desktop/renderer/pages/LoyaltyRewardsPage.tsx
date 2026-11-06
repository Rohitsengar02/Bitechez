import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Percent,
  Crown,
  ChevronLeft,
  Search,
  Gift,
  Sparkles,
  Users,
  MoreHorizontal,
  X,
} from 'lucide-react';

export interface LoyaltyCustomer {
  id: string; // CUST-01
  name: string;
  phone: string;
  tier: 'Gold' | 'Silver' | 'Platinum';
  pointsBalance: number;
  totalSpent: number;
  visits: number;
}

const INITIAL_LOYALTY: LoyaltyCustomer[] = [
  { id: 'CUST-01', name: 'Aman Verma', phone: '+91 98765 43210', tier: 'Platinum', pointsBalance: 1250, totalSpent: 28400, visits: 24 },
  { id: 'CUST-02', name: 'Priya Sharma', phone: '+91 99123 45678', tier: 'Gold', pointsBalance: 780, totalSpent: 16200, visits: 14 },
  { id: 'CUST-03', name: 'Rahul Singh', phone: '+91 99887 65432', tier: 'Silver', pointsBalance: 320, totalSpent: 6400, visits: 6 },
  { id: 'CUST-04', name: 'Neha Gupta', phone: '+91 99876 54321', tier: 'Gold', pointsBalance: 890, totalSpent: 19800, visits: 17 },
  { id: 'CUST-05', name: 'Rohit Saxena', phone: '+91 94567 89012', tier: 'Platinum', pointsBalance: 1540, totalSpent: 34200, visits: 29 },
];

export const LoyaltyRewardsPage: React.FC = () => {
  const navigate = useNavigate();

  const [tierFilter, setTierFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>(INITIAL_LOYALTY);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsCust, setPointsCust] = useState('Aman Verma');
  const [addPoints, setAddPoints] = useState('100');

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (tierFilter !== 'all' && c.tier.toLowerCase() !== tierFilter) return false;
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q);
    });
  }, [customers, tierFilter, searchQuery]);

  const handleCreditPoints = () => {
    const val = parseInt(addPoints, 10) || 0;
    setCustomers((prev) =>
      prev.map((c) => (c.name === pointsCust ? { ...c, pointsBalance: c.pointsBalance + val } : c))
    );
    setShowPointsModal(false);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#F6F8FA]">
      {/* 1. LEFT SIDEBAR */}
      <div className="w-56 shrink-0 bg-white border-r border-gray-200/80 flex flex-col justify-between p-3.5 select-none overflow-y-auto">
        <div>
          <button
            onClick={() => navigate('/tools')}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gray-100/80 transition-all mb-4"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
            <span>More Tools</span>
          </button>

          <div className="space-y-1">
            <button
              onClick={() => navigate('/marketing/offers')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all text-left"
            >
              <Percent className="w-4 h-4 shrink-0" />
              <span className="flex-1">Offers & Discounts</span>
            </button>

            <button
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold bg-[#E7F9F0] text-[#00C060] shadow-2xs transition-all text-left"
            >
              <Crown className="w-4 h-4 shrink-0 text-[#00C060]" />
              <span className="flex-1">Loyalty & Rewards</span>
            </button>
          </div>
        </div>

        <div className="bg-[#F6FAF7] border border-[#E0F2E9] rounded-2xl p-3 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-100/70 text-[#00C060] flex items-center justify-center">
            <Crown className="w-6 h-6 text-[#00C060]" />
          </div>
          <h4 className="text-xs font-bold text-gray-900 leading-tight">Loyalty Program</h4>
          <p className="text-[10px] text-gray-500 mt-1 leading-normal">
            Tier points accrual, VIP benefits & repeat diner retention.
          </p>
        </div>
      </div>

      {/* 2. CENTER CONTENT */}
      <div className="flex-1 flex flex-col overflow-y-auto px-5 py-4 min-w-0">
        <div className="flex items-center justify-between pb-3 shrink-0">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Customer Loyalty & Rewards</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Reward frequent diners with points (1 Point = ₹1), tier upgrades and birthday specials.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPointsModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#00C060] hover:bg-[#00ab55] active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Credit Reward Points</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-4 gap-3 py-1 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#E7F9F0] text-[#00C060] flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">128</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Enrolled VIP Members</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">4,780</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Total Active Points</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">412</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Repeat Customer Visits</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">68%</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Retention Rate</p>
            </div>
          </div>
        </div>

        {/* Filter Pills + Search */}
        <div className="mt-4 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTierFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tierFilter === 'all'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              All Members ({customers.length})
            </button>
            <button
              onClick={() => setTierFilter('platinum')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tierFilter === 'platinum'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              Platinum Tier
            </button>
            <button
              onClick={() => setTierFilter('gold')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tierFilter === 'gold'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              Gold Tier
            </button>
            <button
              onClick={() => setTierFilter('silver')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tierFilter === 'silver'
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              Silver Tier
            </button>
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member name or phone..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#00C060] bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-3 bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="py-2.5 px-3.5">Customer</th>
                <th className="py-2.5 px-3.5">Phone Number</th>
                <th className="py-2.5 px-3.5">Loyalty Tier</th>
                <th className="py-2.5 px-3.5">Reward Points</th>
                <th className="py-2.5 px-3.5">Lifetime Spend</th>
                <th className="py-2.5 px-3.5">Visits</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-3.5 font-bold text-gray-900">{c.name}</td>
                  <td className="py-3 px-3.5 text-gray-600 font-medium">{c.phone}</td>
                  <td className="py-3 px-3.5">
                    {c.tier === 'Platinum' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        Platinum VIP
                      </span>
                    )}
                    {c.tier === 'Gold' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Gold Member
                      </span>
                    )}
                    {c.tier === 'Silver' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                        Silver Member
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 font-black text-[#00A852]">{c.pointsBalance} pts</td>
                  <td className="py-3 px-3.5 font-bold text-gray-800">₹{c.totalSpent.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3.5 text-gray-600 font-semibold">{c.visits} times</td>
                  <td className="py-3 px-3.5 text-right">
                    <button className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR */}
      <div className="w-72 shrink-0 bg-white border-l border-gray-200/80 p-4 flex flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-1">Tier Thresholds</h3>
            <p className="text-[11px] text-gray-500 mb-3">Automatic spend upgrades</p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                <span className="font-extrabold text-purple-900 block">Platinum (₹25,000+ spend)</span>
                <span className="text-[11px] text-purple-700 mt-0.5 block">1.5x points multiplier + free dessert</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                <span className="font-extrabold text-amber-900 block">Gold (₹10,000+ spend)</span>
                <span className="text-[11px] text-amber-700 mt-0.5 block">1.2x points multiplier</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                <span className="font-extrabold text-gray-800 block">Silver (Base tier)</span>
                <span className="text-[11px] text-gray-600 mt-0.5 block">1 point earned per ₹10 spent</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowPointsModal(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#00C060] hover:bg-[#00ab55] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
        >
          <Gift className="w-4 h-4" />
          <span>Reward Customer</span>
        </button>
      </div>

      {/* MODAL */}
      {showPointsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Credit Reward Points</h3>
              <button
                onClick={() => setShowPointsModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Customer Member</label>
                <select
                  value={pointsCust}
                  onChange={(e) => setPointsCust(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                >
                  <option>Aman Verma</option>
                  <option>Priya Sharma</option>
                  <option>Rahul Singh</option>
                  <option>Neha Gupta</option>
                  <option>Rohit Saxena</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Points to Credit</label>
                <input
                  type="number"
                  value={addPoints}
                  onChange={(e) => setAddPoints(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-3.5 bg-gray-50/70 border-t border-gray-100">
              <button
                onClick={() => setShowPointsModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreditPoints}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#00C060] text-white"
              >
                Credit Points
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyRewardsPage;
