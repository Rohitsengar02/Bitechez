import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Clock,
  Archive,
  FileText,
  Settings,
  ChevronLeft,
  Store,
  Receipt,
  Percent,
  Bell,
  Save,
  CheckCircle2,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<'general' | 'taxes' | 'receipt' | 'notifications'>('general');
  const [outletName, setOutletName] = useState('Resto Daddy - Main Outlet');
  const [gstNumber, setGstNumber] = useState('07AAAAA0000A1Z5');
  const [fssaiNumber, setFssaiNumber] = useState('10020011000123');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [enableGst, setEnableGst] = useState(true);
  const [gstRate, setGstRate] = useState('5');
  const [enableServiceCharge, setEnableServiceCharge] = useState(true);
  const [serviceChargeRate, setServiceChargeRate] = useState('10');
  const [autoPrintKOT, setAutoPrintKOT] = useState(true);
  const [autoCutPaper, setAutoCutPaper] = useState(true);
  const [receiptFooterNote, setReceiptFooterNote] = useState('Thank you for dining with us! Visit again soon.');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
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
              onClick={() => navigate('/shifts')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all text-left"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="flex-1">Shift Management</span>
            </button>

            <button
              onClick={() => navigate('/staff')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all text-left"
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="flex-1">Staff & Roles</span>
            </button>

            <button
              onClick={() => navigate('/attendance')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all text-left"
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span className="flex-1">Attendance</span>
            </button>

            <button
              onClick={() => navigate('/cashdrawer')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all text-left"
            >
              <Archive className="w-4 h-4 shrink-0" />
              <span className="flex-1">Cash Drawer</span>
            </button>

            <button
              onClick={() => navigate('/dayclose')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all text-left"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="flex-1">Day Close (Z-Report)</span>
            </button>

            <button
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold bg-[#E7F9F0] text-[#00C060] shadow-2xs transition-all text-left"
            >
              <Settings className="w-4 h-4 shrink-0 text-[#00C060]" />
              <span className="flex-1">Settings</span>
            </button>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-[#F6FAF7] border border-[#E0F2E9] rounded-2xl p-3 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-100/70 text-[#00C060] flex items-center justify-center">
            <Settings className="w-6 h-6 text-[#00C060]" />
          </div>
          <h4 className="text-xs font-bold text-gray-900 leading-tight">POS Settings</h4>
          <p className="text-[10px] text-gray-500 mt-1 leading-normal">
            Configure outlet details, GST rates, billing and receipt formats.
          </p>
        </div>
      </div>

      {/* 2. CENTER CONTENT */}
      <div className="flex-1 flex flex-col overflow-y-auto px-5 py-4 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 shrink-0">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">System & Outlet Settings</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage restaurant profiles, tax compliance, bill customizations and automation preferences.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isSaved && (
              <span className="text-xs font-bold text-[#00A852] flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                Settings Saved!
              </span>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#00C060] hover:bg-[#00ab55] active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex items-center gap-2 pb-3 shrink-0">
          <button
            onClick={() => setActiveSection('general')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'general'
                ? 'bg-[#00C060] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Outlet Profile</span>
          </button>
          <button
            onClick={() => setActiveSection('taxes')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'taxes'
                ? 'bg-[#00C060] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Taxes & Compliance</span>
          </button>
          <button
            onClick={() => setActiveSection('receipt')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'receipt'
                ? 'bg-[#00C060] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Receipt & Printing</span>
          </button>
          <button
            onClick={() => setActiveSection('notifications')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'notifications'
                ? 'bg-[#00C060] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts & Sound</span>
          </button>
        </div>

        {/* Form Content Area */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-5 flex-1 overflow-y-auto">
          {activeSection === 'general' && (
            <div className="space-y-4 max-w-2xl">
              <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                Outlet Profile & Contact Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Outlet Name</label>
                  <input
                    type="text"
                    value={outletName}
                    onChange={(e) => setOutletName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">FSSAI License No.</label>
                  <input
                    type="text"
                    value={fssaiNumber}
                    onChange={(e) => setFssaiNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-32 px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                />
              </div>
            </div>
          )}

          {activeSection === 'taxes' && (
            <div className="space-y-4 max-w-2xl">
              <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                Goods and Services Tax (GST) & Service Charge
              </h3>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Enable GST Computation</h4>
                  <p className="text-[11px] text-gray-500">Automatically calculate CGST & SGST on orders</p>
                </div>
                <input
                  type="checkbox"
                  checked={enableGst}
                  onChange={(e) => setEnableGst(e.target.checked)}
                  className="w-5 h-5 rounded text-[#00C060] focus:ring-[#00C060]"
                />
              </div>

              {enableGst && (
                <div className="grid grid-cols-2 gap-4 pl-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">GST Rate (%)</label>
                    <input
                      type="number"
                      value={gstRate}
                      onChange={(e) => setGstRate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Split Details</label>
                    <p className="text-xs text-gray-500 mt-2">CGST: {(parseFloat(gstRate) / 2 || 0)}% + SGST: {(parseFloat(gstRate) / 2 || 0)}%</p>
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Enable Service Charge</h4>
                  <p className="text-[11px] text-gray-500">Add service charge percentage for Dine In orders</p>
                </div>
                <input
                  type="checkbox"
                  checked={enableServiceCharge}
                  onChange={(e) => setEnableServiceCharge(e.target.checked)}
                  className="w-5 h-5 rounded text-[#00C060] focus:ring-[#00C060]"
                />
              </div>

              {enableServiceCharge && (
                <div className="pl-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Service Charge (%)</label>
                  <input
                    type="number"
                    value={serviceChargeRate}
                    onChange={(e) => setServiceChargeRate(e.target.value)}
                    className="w-48 px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                  />
                </div>
              )}
            </div>
          )}

          {activeSection === 'receipt' && (
            <div className="space-y-4 max-w-2xl">
              <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                Thermal Receipt & Printing Behavior
              </h3>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Auto Print Kitchen KOT</h4>
                  <p className="text-[11px] text-gray-500">Automatically fire KOT to kitchen printer on order confirm</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoPrintKOT}
                  onChange={(e) => setAutoPrintKOT(e.target.checked)}
                  className="w-5 h-5 rounded text-[#00C060] focus:ring-[#00C060]"
                />
              </div>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Auto Cut Paper</h4>
                  <p className="text-[11px] text-gray-500">Send guillotine cutter pulse at end of receipt print</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoCutPaper}
                  onChange={(e) => setAutoCutPaper(e.target.checked)}
                  className="w-5 h-5 rounded text-[#00C060] focus:ring-[#00C060]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Receipt Footer Note</label>
                <textarea
                  value={receiptFooterNote}
                  onChange={(e) => setReceiptFooterNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#00C060]"
                />
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-4 max-w-2xl">
              <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                Order Chimes & Audio Notifications
              </h3>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">New Order Sound Alert</h4>
                  <p className="text-[11px] text-gray-500">Play pleasant chime when table customer raises request or places order</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded text-[#00C060] focus:ring-[#00C060]"
                />
              </div>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Low Stock Warnings</h4>
                  <p className="text-[11px] text-gray-500">Popup notification when recipe ingredients drop below safety threshold</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded text-[#00C060] focus:ring-[#00C060]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR: QUICK STATUS */}
      <div className="w-72 shrink-0 bg-white border-l border-gray-200/80 p-4 flex flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-1">System Health</h3>
            <p className="text-[11px] text-gray-500 mb-3">POS engine status & connectivity</p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-600 font-medium">Cloud Database</span>
                <span className="font-bold text-emerald-600">Synced</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-600 font-medium">Thermal Printers</span>
                <span className="font-bold text-emerald-600">3 Online</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-600 font-medium">App Version</span>
                <span className="font-bold text-gray-800">v2.4.0 (Latest)</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
            <h4 className="text-xs font-bold text-gray-900">Auto Backup Enabled</h4>
            <p className="text-[11px] text-emerald-800 mt-1">
              Encrypted snapshots taken daily at 11:59 PM.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#00C060] hover:bg-[#00ab55] active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
