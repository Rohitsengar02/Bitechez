import React from 'react';
import { 
  ClipboardList, 
  CalendarDays, 
  Clock, 
  Boxes, 
  Truck, 
  Building2, 
  AlertTriangle, 
  Trash, 
  Percent, 
  Award, 
  Gift, 
  Megaphone, 
  Ticket, 
  BarChart3, 
  PieChart, 
  FileSpreadsheet, 
  FileText, 
  UserCog, 
  ShieldCheck, 
  Settings, 
  Store 
} from 'lucide-react';

export const MoreToolsPage: React.FC = () => {
  const sections = [
    {
      title: 'Operations',
      items: [
        { label: 'Orders Management', icon: ClipboardList, desc: 'Historical bills, reprints, audits' },
        { label: 'Table Reservations', icon: CalendarDays, desc: 'Guest booking diary & advance holds' },
        { label: 'Shift Management', icon: Clock, desc: 'Cashier float, day close, drawer audits' },
      ],
    },
    {
      title: 'Inventory & Supplies',
      items: [
        { label: 'Stock Management', icon: Boxes, desc: 'Raw ingredients & recipe consumption' },
        { label: 'Purchase Orders', icon: Truck, desc: 'Vendor procurement & GRN entry' },
        { label: 'Suppliers Directory', icon: Building2, desc: 'Vendor accounts & payment ledgers' },
        { label: 'Stock Alerts', icon: AlertTriangle, desc: 'Reorder limits & low stock alarms' },
        { label: 'Wastage Tracking', icon: Trash, desc: 'Kitchen spoilage & damage logging' },
      ],
    },
    {
      title: 'Marketing & Loyalty',
      items: [
        { label: 'Offers & Discounts', icon: Percent, desc: 'Happy hours & promotional rules' },
        { label: 'Loyalty Program', icon: Award, desc: 'Points per ₹100 spend configuration' },
        { label: 'Gift Cards', icon: Gift, desc: 'Prepaid vouchers & balance check' },
        { label: 'SMS & WhatsApp Campaigns', icon: Megaphone, desc: 'Promotional broadcast dispatch' },
        { label: 'Coupons Manager', icon: Ticket, desc: 'Promo codes & redeem limits' },
      ],
    },
    {
      title: 'Reports & Analytics',
      items: [
        { label: 'Sales Reports', icon: BarChart3, desc: 'Daily, weekly, monthly revenue breakdown' },
        { label: 'Item Performance', icon: PieChart, desc: 'Top grossing dishes & slow movers' },
        { label: 'Tax & GST Reports', icon: FileSpreadsheet, desc: 'GSTR-1, GSTR-3B compliant export' },
        { label: 'Profit & Loss', icon: FileText, desc: 'COGS vs net restaurant earnings' },
      ],
    },
    {
      title: 'Administration',
      items: [
        { label: 'Staff Management', icon: UserCog, desc: 'Captains, cashiers & kitchen logins' },
        { label: 'Roles & Permissions', icon: ShieldCheck, desc: 'Discount authorization & void locks' },
        { label: 'Terminal Settings', icon: Settings, desc: 'Receipt headers, taxes, currency' },
        { label: 'Outlet Management', icon: Store, desc: 'Multi-outlet sync & cloud linking' },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-[#191923] tracking-tight">More Tools & Management</h2>
        <p className="text-xs text-gray-500 mt-1">Enterprise restaurant back-office • Inventory • Marketing • Analytics</p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#800D32] border-b border-[#F3D2DC] pb-1">
              {section.title}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-[#800D32] hover:shadow-md transition-all cursor-pointer flex items-start gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#F9E8ED] text-[#800D32] flex items-center justify-center shrink-0 group-hover:bg-[#800D32] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#191923] group-hover:text-[#800D32] transition-colors">
                        {item.label}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

