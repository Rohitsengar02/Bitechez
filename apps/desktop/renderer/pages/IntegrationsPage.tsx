import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Share2,
  ChevronLeft,
  RefreshCw,
  Settings,
} from 'lucide-react';

export interface IntegrationService {
  id: string;
  name: string;
  category: 'Communication' | 'Accounting' | 'Payments' | 'Food Aggregators';
  description: string;
  connected: boolean;
  icon: string;
  lastSync?: string;
}

const INITIAL_INTEGRATIONS: IntegrationService[] = [
  { id: 'INT-01', name: 'WhatsApp Business Cloud API', category: 'Communication', description: 'Send automated e-bills & KOT updates directly to customer WhatsApp.', connected: true, icon: '📱', lastSync: '10 mins ago' },
  { id: 'INT-02', name: 'Twilio SMS Gateway', category: 'Communication', description: 'SMS alerts for table reservation confirmations and OTP logins.', connected: true, icon: '💬', lastSync: '1 hour ago' },
  { id: 'INT-03', name: 'Tally Prime / ERP Bridge', category: 'Accounting', description: 'Auto-sync daily sales, GST tax vouchers & inventory purchases to Tally.', connected: true, icon: '📊', lastSync: 'Today, 11:59 AM' },
  { id: 'INT-04', name: 'Zoho Books', category: 'Accounting', description: 'Sync customer ledgers, invoices and vendor payables.', connected: false, icon: '📑' },
  { id: 'INT-05', name: 'Razorpay UPI & Smart POS', category: 'Payments', description: 'Direct webhook reconciliation for QR payments and EDC card swipe machines.', connected: true, icon: '💳', lastSync: 'Just Now' },
  { id: 'INT-06', name: 'Pine Labs Card Terminals', category: 'Payments', description: 'Direct dynamic amount push to countertop card swiping machines.', connected: false, icon: '🏧' },
];

export const IntegrationsPage: React.FC = () => {
  const navigate = useNavigate();

  const [integrations, setIntegrations] = useState<IntegrationService[]>(INITIAL_INTEGRATIONS);
  const [selectedService, setSelectedService] = useState<IntegrationService>(INITIAL_INTEGRATIONS[0]);

  const toggleConnect = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, connected: !item.connected, lastSync: !item.connected ? 'Just Now' : undefined }
          : item
      )
    );
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
              onClick={() => navigate('/settings')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all text-left"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="flex-1">Outlet Settings</span>
            </button>

            <button
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold bg-[#E7F9F0] text-[#00C060] shadow-2xs transition-all text-left"
            >
              <Share2 className="w-4 h-4 shrink-0 text-[#00C060]" />
              <span className="flex-1">Integrations</span>
            </button>
          </div>
        </div>

        <div className="bg-[#F6FAF7] border border-[#E0F2E9] rounded-2xl p-3 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-100/70 text-[#00C060] flex items-center justify-center">
            <Share2 className="w-6 h-6 text-[#00C060]" />
          </div>
          <h4 className="text-xs font-bold text-gray-900 leading-tight">API Hub</h4>
          <p className="text-[10px] text-gray-500 mt-1 leading-normal">
            Connect accounting, WhatsApp e-bills and EDC payment terminals.
          </p>
        </div>
      </div>

      {/* 2. CENTER CONTENT */}
      <div className="flex-1 flex flex-col overflow-y-auto px-5 py-4 min-w-0">
        <div className="pb-3 shrink-0">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Integrations & External APIs</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Synchronize customer communication, accounting ledgers and EDC card terminals.
          </p>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-2 gap-3.5 flex-1 min-h-0 overflow-y-auto">
          {integrations.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedService(item)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between bg-white ${
                selectedService.id === item.id
                  ? 'border-[#00C060] shadow-sm ring-1 ring-[#00C060]/30'
                  : 'border-gray-200/80 hover:border-gray-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h3 className="text-xs font-bold text-gray-900">{item.name}</h3>
                      <span className="text-[10px] font-semibold text-gray-500">{item.category}</span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.connected
                        ? 'bg-[#E7F9F0] text-[#00A852]'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${item.connected ? 'bg-[#00C060]' : 'bg-gray-400'}`} />
                    {item.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">
                  {item.lastSync ? `Last synced: ${item.lastSync}` : 'Never configured'}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleConnect(item.id);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    item.connected
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                      : 'bg-[#00C060] text-white hover:bg-[#00ab55]'
                  }`}
                >
                  {item.connected ? 'Disconnect' : 'Connect Service'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR */}
      <div className="w-72 shrink-0 bg-white border-l border-gray-200/80 p-4 flex flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-1">{selectedService.name}</h3>
            <p className="text-[11px] text-gray-500 mb-3">Service configuration & credentials</p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-bold text-[#00A852]">
                  {selectedService.connected ? 'Live & Authorized' : 'Inactive'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex justify-between">
                <span className="text-gray-500">Webhook Health</span>
                <span className="font-bold text-gray-800">200 OK (0 retries)</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
            <h4 className="text-xs font-bold text-gray-900">Encrypted Transport</h4>
            <p className="text-[11px] text-emerald-800 mt-1">
              All payload transactions are signed with SHA-256 HMAC tokens.
            </p>
          </div>
        </div>

        <button
          onClick={() => alert(`Synchronized ${selectedService.name} payload.`)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#00C060] hover:bg-[#00ab55] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sync Now</span>
        </button>
      </div>
    </div>
  );
};

export default IntegrationsPage;
