import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Percent,
  Crown,
  ChevronLeft,
  Plus,
  Search,
  Tag,
  CheckCircle2,
  X,
  Sparkles,
  Scissors,
} from 'lucide-react';

export interface CouponOffer {
  id: string; // OFF-101
  title: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderAmount: number;
  validTill: string;
  redemptions: number;
  status: 'active' | 'scheduled' | 'expired';
}

const INITIAL_OFFERS: CouponOffer[] = [
  { id: 'OFF-101', title: 'Weekend Feast 20% Off', code: 'FEAST20', discountType: 'percentage', discountValue: 20, minOrderAmount: 799, validTill: '30 Nov 2026', redemptions: 142, status: 'active' },
  { id: 'OFF-102', title: 'Flat ₹100 Off on First Order', code: 'WELCOME100', discountType: 'flat', discountValue: 100, minOrderAmount: 499, validTill: '31 Dec 2026', redemptions: 310, status: 'active' },
  { id: 'OFF-103', title: 'Happy Hour Buy 2 Get 1 Free', code: 'HAPPYHOUR', discountType: 'percentage', discountValue: 33, minOrderAmount: 399, validTill: '15 Nov 2026', redemptions: 88, status: 'active' },
  { id: 'OFF-104', title: 'Diwali Festive Combo 25%', code: 'FESTIVE25', discountType: 'percentage', discountValue: 25, minOrderAmount: 1200, validTill: '01 Nov 2026', redemptions: 240, status: 'expired' },
];

export const OffersDiscountsPage: React.FC = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [offers, setOffers] = useState<CouponOffer[]>(INITIAL_OFFERS);
  const [showAddModal, setShowAddModal] = useState(false);

  // Modal
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newValue, setNewValue] = useState('15');
  const [newMinOrder, setNewMinOrder] = useState('500');

  const filtered = useMemo(() => {
    return offers.filter((o) => {
      const q = searchQuery.toLowerCase();
      return o.title.toLowerCase().includes(q) || o.code.toLowerCase().includes(q);
    });
  }, [offers, searchQuery]);

  const handleCreateOffer = () => {
    if (!newTitle.trim() || !newCode.trim()) return;
    const newOffer: CouponOffer = {
      id: `OFF-${101 + offers.length}`,
      title: newTitle,
      code: newCode.toUpperCase(),
      discountType: 'percentage',
      discountValue: parseFloat(newValue) || 10,
      minOrderAmount: parseFloat(newMinOrder) || 0,
      validTill: '31 Dec 2026',
      redemptions: 0,
      status: 'active',
    };
    setOffers([newOffer, ...offers]);
    setShowAddModal(false);
    setNewTitle('');
    setNewCode('');
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
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold bg-[#E7F9F0] text-[#00C060] shadow-2xs transition-all text-left"
            >
              <Percent className="w-4 h-4 shrink-0 text-[#00C060]" />
              <span className="flex-1">Offers & Discounts</span>
            </button>

            <button
              onClick={() => navigate('/marketing/loyalty')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all text-left"
            >
              <Crown className="w-4 h-4 shrink-0" />
              <span className="flex-1">Loyalty & Rewards</span>
            </button>
          </div>
        </div>

        <div className="bg-[#F6FAF7] border border-[#E0F2E9] rounded-2xl p-3 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-100/70 text-[#00C060] flex items-center justify-center">
            <Percent className="w-6 h-6 text-[#00C060]" />
          </div>
          <h4 className="text-xs font-bold text-gray-900 leading-tight">Promotions Engine</h4>
          <p className="text-[10px] text-gray-500 mt-1 leading-normal">
            Run coupon campaigns, combo deals and boost basket size.
          </p>
        </div>
      </div>

      {/* 2. CENTER CONTENT */}
      <div className="flex-1 flex flex-col overflow-y-auto px-5 py-4 min-w-0">
        <div className="flex items-center justify-between pb-3 shrink-0">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Offers & Discounts</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Create coupon promo codes, happy hour discounts and manage order redemptions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#00C060] hover:bg-[#00ab55] active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Coupon</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-4 gap-3 py-1 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#E7F9F0] text-[#00C060] flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">3</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Active Campaigns</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">780</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Coupons Redeemed</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">₹42,800</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Discounts Granted</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">₹2,14,000</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Promo Generated Sales</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 flex items-center justify-between gap-3 shrink-0">
          <p className="text-xs font-bold text-gray-700">Coupon Offers Directory</p>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code or title..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#00C060] bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-3 bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="py-2.5 px-3.5">Promo Title</th>
                <th className="py-2.5 px-3.5">Coupon Code</th>
                <th className="py-2.5 px-3.5">Discount</th>
                <th className="py-2.5 px-3.5">Min Order Value</th>
                <th className="py-2.5 px-3.5">Redemptions</th>
                <th className="py-2.5 px-3.5">Validity</th>
                <th className="py-2.5 px-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filtered.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-3.5 font-bold text-gray-900">{offer.title}</td>
                  <td className="py-3 px-3.5">
                    <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 tracking-wider text-gray-800">
                      {offer.code}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-black text-[#00A852]">
                    {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} FLAT`}
                  </td>
                  <td className="py-3 px-3.5 text-gray-600 font-medium">₹{offer.minOrderAmount}</td>
                  <td className="py-3 px-3.5 font-bold text-gray-800">{offer.redemptions} times</td>
                  <td className="py-3 px-3.5 text-gray-500 font-medium">{offer.validTill}</td>
                  <td className="py-3 px-3.5 text-right">
                    {offer.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E7F9F0] text-[#00A852]">
                        <CheckCircle2 className="w-3 h-3 text-[#00C060]" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500">
                        Expired
                      </span>
                    )}
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
            <h3 className="text-sm font-extrabold text-gray-900 mb-1">Coupon Best Practices</h3>
            <p className="text-[11px] text-gray-500 mb-3">Maximize average bill size</p>

            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#E7F9F0] to-emerald-50 border border-emerald-100">
              <h4 className="text-xs font-bold text-[#00A852]">Tiered Spend Incentives</h4>
              <p className="text-[11px] text-emerald-800 mt-1 leading-normal">
                Setting min order value at 1.3x your AOV (₹450+) nudges diners to order an extra dessert or drink.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#00C060] hover:bg-[#00ab55] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Promo</span>
        </button>
      </div>

      {/* MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Create New Coupon Offer</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Offer Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Midweek 15% Savings"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Promo Code</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="e.g. SAVE15"
                  className="w-full px-3 py-2 text-xs uppercase font-mono border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={newMinOrder}
                    onChange={(e) => setNewMinOrder(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-3.5 bg-gray-50/70 border-t border-gray-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOffer}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#00C060] text-white"
              >
                Publish Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersDiscountsPage;
