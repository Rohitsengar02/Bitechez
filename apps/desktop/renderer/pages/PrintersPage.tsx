import React from 'react';
import { Printer, CheckCircle, Plus, Send } from 'lucide-react';
import { apiService } from '../services/api';

export const PrintersPage: React.FC = () => {
  const [printers] = React.useState([
    { id: 'prn-1', name: 'Main Counter Thermal Printer', station: 'Billing', type: 'ESC/POS USB', paper: '80mm', isDefault: true, status: 'Online' },
    { id: 'prn-2', name: 'Kitchen KOT Order Printer', station: 'Kitchen', type: 'ESC/POS Network (LAN)', paper: '80mm', isDefault: false, status: 'Online' },
    { id: 'prn-3', name: 'Bar Dispatch Printer', station: 'Bar', type: 'ESC/POS LAN', paper: '58mm', isDefault: false, status: 'Standby' },
  ]);

  const [testedId, setTestedId] = React.useState<string | null>(null);

  const handleTestPrint = async (printerId: string) => {
    setTestedId(printerId);
    await apiService.testPrint(printerId);
    setTimeout(() => {
      setTestedId(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#191923] tracking-tight">Thermal Printers & Hardware</h2>
          <p className="text-xs text-gray-500 mt-1">ESC/POS driver configuration • 58mm/80mm roll setup • Station routing</p>
        </div>
        <button className="px-4 py-2 bg-[#800D32] hover:bg-[#600821] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" /> Add Thermal Printer
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {printers.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4 hover:border-[#800D32] transition-colors">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#F9E8ED] text-[#800D32] flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {p.status}
              </span>
            </div>

            <div>
              <h4 className="font-black text-base text-[#191923]">{p.name}</h4>
              <p className="text-xs text-gray-500 mt-0.5">Assigned Station: <span className="font-bold text-gray-700">{p.station}</span></p>
            </div>

            <div className="bg-[#FAF8F9] p-3 rounded-xl space-y-1 text-xs text-gray-600 font-medium">
              <div className="flex justify-between">
                <span>Driver:</span>
                <span className="font-bold text-gray-800">{p.type}</span>
              </div>
              <div className="flex justify-between">
                <span>Paper Width:</span>
                <span className="font-bold text-gray-800">{p.paper}</span>
              </div>
              <div className="flex justify-between">
                <span>Cash Drawer Kick:</span>
                <span className="font-bold text-gray-800">{p.isDefault ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>

            <button
              onClick={() => handleTestPrint(p.id)}
              className="w-full py-2 bg-white border border-[#800D32] text-[#800D32] hover:bg-[#F9E8ED] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              {testedId === p.id ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Printed Test Slip!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Test Print</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
