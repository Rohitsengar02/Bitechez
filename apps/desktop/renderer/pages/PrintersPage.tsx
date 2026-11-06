import React, { useMemo, useState } from 'react';
import {
  Printer,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Layers,
  Plus,
  Wifi,
  Usb,
  Edit2,
  MoreHorizontal,
  Home,
  Monitor,
  Wine,
  ChevronDown,
  Check,
  X,
  Share2,
  ChevronRight,
} from 'lucide-react';

export type PrinterType = 'kitchen' | 'billing' | 'bar' | 'other';
export type PrinterStatus = 'online' | 'offline' | 'error';
export type PrinterConnection = 'wifi' | 'usb';

export interface PrinterItem {
  id: string;
  name: string;
  model: string;
  type: PrinterType;
  typeLabel: string;
  connection: PrinterConnection;
  endpoint: string; // e.g. 192.168.1.45 or USB-001
  status: PrinterStatus;
  assignedTo: string; // e.g. Kitchen KOT, POS / Bills, Beverages, Not Assigned
  paperSize: string; // 80 mm (Thermal)
  printFormat: string; // KOT (Kitchen Order Ticket)
  autoPrintNewOrders: boolean;
  printModifiers: boolean;
  cutPaperAfterPrint: boolean;
}

const SEED_PRINTERS: PrinterItem[] = [
  {
    id: 'p-1',
    name: 'Kitchen Printer',
    model: 'Epson TM-T82',
    type: 'kitchen',
    typeLabel: 'Kitchen',
    connection: 'wifi',
    endpoint: '192.168.1.45',
    status: 'online',
    assignedTo: 'Kitchen KOT',
    paperSize: '80 mm (Thermal)',
    printFormat: 'KOT (Kitchen Order Ticket)',
    autoPrintNewOrders: true,
    printModifiers: true,
    cutPaperAfterPrint: true,
  },
  {
    id: 'p-2',
    name: 'Billing Printer',
    model: 'Epson TM-T82',
    type: 'billing',
    typeLabel: 'Billing',
    connection: 'usb',
    endpoint: 'USB-001',
    status: 'online',
    assignedTo: 'POS / Bills',
    paperSize: '80 mm (Thermal)',
    printFormat: 'Tax Invoice (Bill)',
    autoPrintNewOrders: true,
    printModifiers: false,
    cutPaperAfterPrint: true,
  },
  {
    id: 'p-3',
    name: 'Bar Printer',
    model: 'Xprinter XP-80',
    type: 'bar',
    typeLabel: 'Bar',
    connection: 'wifi',
    endpoint: '192.168.1.47',
    status: 'online',
    assignedTo: 'Beverages',
    paperSize: '80 mm (Thermal)',
    printFormat: 'Bar KOT',
    autoPrintNewOrders: true,
    printModifiers: true,
    cutPaperAfterPrint: true,
  },
  {
    id: 'p-4',
    name: 'Backup Printer',
    model: 'Epson TM-T20',
    type: 'other',
    typeLabel: 'Other',
    connection: 'wifi',
    endpoint: '192.168.1.50',
    status: 'error',
    assignedTo: 'Not Assigned',
    paperSize: '80 mm (Thermal)',
    printFormat: 'Standard Bill',
    autoPrintNewOrders: false,
    printModifiers: false,
    cutPaperAfterPrint: false,
  },
];

export const PrintersPage: React.FC = () => {
  const [printers, setPrinters] = useState<PrinterItem[]>(SEED_PRINTERS);
  const [activeCategory, setActiveCategory] = useState<'all' | PrinterType>('all');
  const [selectedId, setSelectedId] = useState<string>('p-1');

  // Form states linked to right detail sidebar
  const selectedPrinter = useMemo(() => {
    return printers.find((p) => p.id === selectedId) || printers[0];
  }, [printers, selectedId]);

  const [assignedTo, setAssignedTo] = useState(selectedPrinter?.assignedTo || 'Kitchen KOT');
  const [paperSize, setPaperSize] = useState(selectedPrinter?.paperSize || '80 mm (Thermal)');
  const [printFormat, setPrintFormat] = useState(selectedPrinter?.printFormat || 'KOT (Kitchen Order Ticket)');
  const [autoPrint, setAutoPrint] = useState(selectedPrinter?.autoPrintNewOrders ?? true);
  const [printModifiers, setPrintModifiers] = useState(selectedPrinter?.printModifiers ?? true);
  const [cutPaper, setCutPaper] = useState(selectedPrinter?.cutPaperAfterPrint ?? true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Add Printer Modal
  const [addPrinterModal, setAddPrinterModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newModel, setNewModel] = useState('Epson TM-T82');
  const [newType, setNewType] = useState<PrinterType>('kitchen');
  const [newConnection, setNewConnection] = useState<PrinterConnection>('wifi');
  const [newEndpoint, setNewEndpoint] = useState('192.168.1.55');

  // Sync edit form on selection change
  const handleSelectPrinter = (p: PrinterItem) => {
    setSelectedId(p.id);
    setAssignedTo(p.assignedTo);
    setPaperSize(p.paperSize);
    setPrintFormat(p.printFormat);
    setAutoPrint(p.autoPrintNewOrders);
    setPrintModifiers(p.printModifiers);
    setCutPaper(p.cutPaperAfterPrint);
  };

  // Save changes
  const handleSaveChanges = () => {
    if (!selectedPrinter) return;
    setPrinters((prev) =>
      prev.map((p) =>
        p.id === selectedPrinter.id
          ? {
              ...p,
              assignedTo,
              paperSize,
              printFormat,
              autoPrintNewOrders: autoPrint,
              printModifiers,
              cutPaperAfterPrint: cutPaper,
            }
          : p
      )
    );
    alert('Printer settings saved successfully!');
  };

  // Add new printer
  const handleCreatePrinter = () => {
    if (!newName.trim()) return;
    const typeLabels: Record<PrinterType, string> = {
      kitchen: 'Kitchen',
      billing: 'Billing',
      bar: 'Bar',
      other: 'Other',
    };
    const created: PrinterItem = {
      id: `p-${Date.now()}`,
      name: newName.trim(),
      model: newModel,
      type: newType,
      typeLabel: typeLabels[newType],
      connection: newConnection,
      endpoint: newEndpoint,
      status: 'online',
      assignedTo: newType === 'kitchen' ? 'Kitchen KOT' : newType === 'billing' ? 'POS / Bills' : 'Beverages',
      paperSize: '80 mm (Thermal)',
      printFormat: newType === 'kitchen' ? 'KOT (Kitchen Order Ticket)' : 'Tax Invoice (Bill)',
      autoPrintNewOrders: true,
      printModifiers: true,
      cutPaperAfterPrint: true,
    };

    setPrinters((prev) => [...prev, created]);
    handleSelectPrinter(created);
    setAddPrinterModal(false);
    setNewName('');
  };

  // Test Print
  const handleTestPrint = () => {
    alert(`Sending test print slip to ${selectedPrinter?.name} (${selectedPrinter?.endpoint})... Done!`);
  };

  // Filtered printers list
  const filteredPrinters = useMemo(() => {
    if (activeCategory === 'all') return printers;
    return printers.filter((p) => p.type === activeCategory);
  }, [printers, activeCategory]);

  // Counts
  const counts = useMemo(() => {
    return {
      total: printers.length,
      online: printers.filter((p) => p.status === 'online').length,
      offline: printers.filter((p) => p.status === 'offline').length,
      error: printers.filter((p) => p.status === 'error').length,
      mappedAreas: 3,
      // Left categories
      kitchen: printers.filter((p) => p.type === 'kitchen').length,
      billing: printers.filter((p) => p.type === 'billing').length,
      bar: printers.filter((p) => p.type === 'bar').length,
      other: printers.filter((p) => p.type === 'other').length,
    };
  }, [printers]);

  const getTypeBadge = (type: PrinterType) => {
    switch (type) {
      case 'kitchen':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200">
            <Home className="w-3 h-3 text-amber-500" /> Kitchen
          </span>
        );
      case 'billing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
            <Monitor className="w-3 h-3 text-emerald-500" /> Billing
          </span>
        );
      case 'bar':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200">
            <Wine className="w-3 h-3 text-purple-500" /> Bar
          </span>
        );
      case 'other':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200">
            <Layers className="w-3 h-3 text-blue-500" /> Other
          </span>
        );
    }
  };

  const getStatusBadge = (status: PrinterStatus) => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C060] animate-pulse" /> Online
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Offline
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Error
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-3.5 font-sans text-[#191923] select-none pb-2 h-full overflow-hidden">
      {/* Top Header Metrics Row */}
      <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto max-w-full pb-0.5 shrink-0 scrollbar-none snap-x">
        {/* Total Printers */}
        <div className="bg-white rounded-2xl border border-gray-100 p-2.5 px-3.5 shadow-xs flex items-center gap-3 shrink-0 min-w-[130px] snap-start">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00C060] flex items-center justify-center shrink-0">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-black text-gray-900 leading-none">{counts.total}</p>
            <p className="text-[10px] font-semibold text-gray-500 mt-1">Total Printers</p>
          </div>
        </div>

        {/* Online */}
        <div className="bg-white rounded-2xl border border-gray-100 p-2.5 px-3.5 shadow-xs flex items-center gap-3 shrink-0 min-w-[130px] snap-start">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00C060] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-black text-gray-900 leading-none">{counts.online}</p>
            <p className="text-[10px] font-semibold text-gray-500 mt-1">Online</p>
          </div>
        </div>

        {/* Offline */}
        <div className="bg-white rounded-2xl border border-gray-100 p-2.5 px-3.5 shadow-xs flex items-center gap-3 shrink-0 min-w-[130px] snap-start">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-black text-gray-900 leading-none">{counts.offline}</p>
            <p className="text-[10px] font-semibold text-gray-500 mt-1">Offline</p>
          </div>
        </div>

        {/* Error */}
        <div className="bg-white rounded-2xl border border-gray-100 p-2.5 px-3.5 shadow-xs flex items-center gap-3 shrink-0 min-w-[130px] snap-start">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-black text-gray-900 leading-none">{counts.error}</p>
            <p className="text-[10px] font-semibold text-gray-500 mt-1">Error</p>
          </div>
        </div>

        {/* Mapped Areas */}
        <div className="bg-white rounded-2xl border border-gray-100 p-2.5 px-3.5 shadow-xs flex items-center gap-3 shrink-0 min-w-[130px] snap-start">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-black text-gray-900 leading-none">{counts.mappedAreas}</p>
            <p className="text-[10px] font-semibold text-gray-500 mt-1">Mapped Areas</p>
          </div>
        </div>
      </div>

      {/* Mobile Categories Selector Bar */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto scrollbar-none snap-x py-1 shrink-0">
        {[
          { id: 'all', label: 'All Printers', icon: Printer, count: counts.total },
          { id: 'kitchen', label: 'Kitchen (KOT)', icon: Home, count: counts.kitchen },
          { id: 'billing', label: 'Billing / Counter', icon: Monitor, count: counts.billing },
          { id: 'bar', label: 'Bar', icon: Wine, count: counts.bar },
          { id: 'other', label: 'Others', icon: Layers, count: counts.other },
        ].map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as PrinterType | 'all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all snap-start shrink-0 ${
                isActive
                  ? 'bg-[#00C060] text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              <span className={`text-[10px] ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                ({cat.count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Main 3-Column Layout: Categories Sidebar (Left) + Printers Table (Center) + Printer Settings (Right) */}
      <div className="flex-1 min-h-0 flex gap-3.5 overflow-hidden">
        {/* Left Categories Sidebar (Desktop) */}
        <div className="hidden md:flex w-[180px] xl:w-[200px] bg-white rounded-2xl border border-gray-200 shadow-sm flex-col p-3 shrink-0 h-full overflow-hidden">
          <div className="flex-1 space-y-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeCategory === 'all'
                  ? 'bg-[#E7F9F0] text-[#00C060] font-black'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                <span>All Printers</span>
              </div>
              <span className={`text-[11px] ${activeCategory === 'all' ? 'text-[#00C060]' : 'text-gray-400'}`}>
                ({counts.total})
              </span>
            </button>

            <button
              onClick={() => setActiveCategory('kitchen')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeCategory === 'kitchen'
                  ? 'bg-[#E7F9F0] text-[#00C060] font-black'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-gray-400" />
                <span>Kitchen</span>
              </div>
              <span className={`text-[11px] ${activeCategory === 'kitchen' ? 'text-[#00C060]' : 'text-gray-400'}`}>
                ({counts.kitchen})
              </span>
            </button>

            <button
              onClick={() => setActiveCategory('billing')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeCategory === 'billing'
                  ? 'bg-[#E7F9F0] text-[#00C060] font-black'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-gray-400" />
                <span>Billing / Counter</span>
              </div>
              <span className={`text-[11px] ${activeCategory === 'billing' ? 'text-[#00C060]' : 'text-gray-400'}`}>
                ({counts.billing})
              </span>
            </button>

            <button
              onClick={() => setActiveCategory('bar')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeCategory === 'bar'
                  ? 'bg-[#E7F9F0] text-[#00C060] font-black'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Wine className="w-4 h-4 text-gray-400" />
                <span>Bar</span>
              </div>
              <span className={`text-[11px] ${activeCategory === 'bar' ? 'text-[#00C060]' : 'text-gray-400'}`}>
                ({counts.bar})
              </span>
            </button>

            <button
              onClick={() => setActiveCategory('other')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeCategory === 'other'
                  ? 'bg-[#E7F9F0] text-[#00C060] font-black'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-400" />
                <span>Others</span>
              </div>
              <span className={`text-[11px] ${activeCategory === 'other' ? 'text-[#00C060]' : 'text-gray-400'}`}>
                ({counts.other})
              </span>
            </button>
          </div>
        </div>

        {/* Center: Printers Table + Bottom Printer Mapping Banner */}
        <div className="flex-1 min-w-0 flex flex-col gap-3 h-full overflow-hidden">
          {/* Main Table Card */}
          <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col p-4 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-base font-black text-gray-900">Printers</h2>
              <button
                onClick={() => setAddPrinterModal(true)}
                className="px-4 py-1.5 rounded-xl bg-[#00C060] text-white text-xs font-black hover:bg-[#00a854] shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Printer</span>
              </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block flex-1 overflow-y-auto scrollbar-none pt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-white border-b border-gray-100 z-10 text-gray-400 font-bold">
                  <tr>
                    <th className="py-2.5 px-3 w-8">
                      <input type="checkbox" className="rounded accent-[#00C060]" />
                    </th>
                    <th className="py-2.5 px-3">Printer Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Connection</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Assigned To</th>
                    <th className="py-2.5 px-3 text-center w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPrinters.map((p) => {
                    const isSelected = selectedPrinter?.id === p.id;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => handleSelectPrinter(p)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#E7F9F0]/60 border-y border-[#00C060]/30'
                            : 'hover:bg-gray-50/70'
                        }`}
                      >
                        <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded accent-[#00C060]" />
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center p-1 shrink-0 shadow-xs">
                              <Printer className="w-4 h-4 text-gray-200" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 leading-tight">{p.name}</p>
                              <p className="text-[10px] text-gray-400 font-medium">{p.model}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">{getTypeBadge(p.type)}</td>
                        <td className="py-3 px-3 font-semibold text-gray-700">
                          <span className="flex items-center gap-1.5">
                            {p.connection === 'wifi' ? (
                              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Usb className="w-3.5 h-3.5 text-gray-500" />
                            )}
                            <span>{p.endpoint}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3">{getStatusBadge(p.status)}</td>
                        <td className="py-3 px-3 font-semibold text-gray-700">{p.assignedTo}</td>
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1 text-gray-400">
                            <button
                              onClick={() => handleSelectPrinter(p)}
                              className="hover:text-gray-700 p-1"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button className="hover:text-gray-700 p-1" title="More">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Printer Cards */}
            <div className="md:hidden flex-1 overflow-y-auto scrollbar-none pt-2 space-y-2.5 pb-24">
              {filteredPrinters.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Printer className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-xs font-bold text-gray-600">No printers found</p>
                </div>
              ) : (
                filteredPrinters.map((p) => {
                  const isSelected = selectedPrinter?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        handleSelectPrinter(p);
                        setMobileDrawerOpen(true);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E7F9F0]/60 border-[#00C060] shadow-xs'
                          : 'bg-white border-gray-100 hover:border-gray-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center p-1 shrink-0 shadow-xs">
                            <Printer className="w-4.5 h-4.5 text-gray-200" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-xs text-gray-900 truncate">{p.name}</h4>
                            <p className="text-[10px] text-gray-400 font-medium truncate">{p.model}</p>
                          </div>
                        </div>
                        <div className="shrink-0">{getStatusBadge(p.status)}</div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-600">
                          {getTypeBadge(p.type)}
                          <span className="flex items-center gap-1 text-[11px] text-gray-500">
                            {p.connection === 'wifi' ? (
                              <Wifi className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Usb className="w-3 h-3 text-gray-500" />
                            )}
                            <span className="truncate max-w-[100px]">{p.endpoint}</span>
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-gray-800">{p.assignedTo}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom Printer Mapping Banner */}
          <div className="hidden sm:flex bg-[#E7F9F0]/70 border border-[#00C060]/30 rounded-2xl p-3 px-4 items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#00C060] text-white flex items-center justify-center shrink-0 text-xs font-bold">
                i
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-900 leading-tight">Printer Mapping</h4>
                <p className="text-[11px] text-gray-600 font-medium">
                  Automatically route different orders to the right printer (e.g. Kitchen, Bar, Billing).
                </p>
              </div>
            </div>

            <button
              onClick={() => alert('Printer Routing Rules')}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-800 hover:bg-gray-50 shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Share2 className="w-3.5 h-3.5 text-gray-500" />
              <span>Manage Mappings →</span>
            </button>
          </div>
        </div>

        {/* Right Detail Sidebar: Printer Settings */}
        <div className="hidden lg:flex w-[300px] xl:w-[330px] bg-white rounded-2xl border border-gray-200 shadow-sm flex-col p-4 shrink-0 h-full overflow-hidden">
          {selectedPrinter ? (
            <div className="flex flex-col h-full min-h-0">
              {/* Profile Card Header */}
              <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0 p-1.5 shadow-xs">
                    <Printer className="w-5 h-5 text-gray-200" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 leading-tight">
                      {selectedPrinter.name}
                    </h3>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                      {selectedPrinter.model}
                    </p>
                  </div>
                </div>

                {getStatusBadge(selectedPrinter.status)}
              </div>

              {/* Quick Info Grid: Type, Connection, IP Address */}
              <div className="py-2.5 border-b border-gray-100 grid grid-cols-3 gap-1.5 text-center">
                <div className="bg-gray-50/80 rounded-xl p-1.5 border border-gray-100 flex flex-col items-center">
                  <Home className="w-3 h-3 text-amber-500 mb-0.5" />
                  <span className="text-[9px] text-gray-400 font-bold">Type</span>
                  <span className="text-[11px] font-black text-gray-800 truncate">
                    {selectedPrinter.typeLabel}
                  </span>
                </div>

                <div className="bg-gray-50/80 rounded-xl p-1.5 border border-gray-100 flex flex-col items-center">
                  <Wifi className="w-3 h-3 text-emerald-500 mb-0.5" />
                  <span className="text-[9px] text-gray-400 font-bold">Connection</span>
                  <span className="text-[11px] font-black text-gray-800 capitalize">
                    {selectedPrinter.connection}
                  </span>
                </div>

                <div className="bg-gray-50/80 rounded-xl p-1.5 border border-gray-100 flex flex-col items-center">
                  <Monitor className="w-3 h-3 text-gray-400 mb-0.5" />
                  <span className="text-[9px] text-gray-400 font-bold">IP Address</span>
                  <span className="text-[10px] font-black text-gray-800 truncate">
                    {selectedPrinter.endpoint}
                  </span>
                </div>
              </div>

              {/* Settings Form */}
              <div className="py-2.5 flex-1 min-h-0 overflow-y-auto space-y-3 text-xs">
                <h4 className="font-black text-gray-900 text-xs">Printer Settings</h4>

                {/* Assigned To */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Assigned To <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full appearance-none p-2 pr-7 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none bg-white cursor-pointer"
                    >
                      <option>Kitchen KOT</option>
                      <option>POS / Bills</option>
                      <option>Beverages</option>
                      <option>Not Assigned</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Paper Size */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Paper Size</label>
                  <div className="relative">
                    <select
                      value={paperSize}
                      onChange={(e) => setPaperSize(e.target.value)}
                      className="w-full appearance-none p-2 pr-7 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none bg-white cursor-pointer"
                    >
                      <option>80 mm (Thermal)</option>
                      <option>58 mm (Thermal)</option>
                      <option>A4</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Print Format */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Print Format</label>
                  <div className="relative">
                    <select
                      value={printFormat}
                      onChange={(e) => setPrintFormat(e.target.value)}
                      className="w-full appearance-none p-2 pr-7 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none bg-white cursor-pointer"
                    >
                      <option>KOT (Kitchen Order Ticket)</option>
                      <option>Tax Invoice (Bill)</option>
                      <option>Bar KOT</option>
                      <option>Standard Bill</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-2 pt-1 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-700">Auto Print New Orders</span>
                    <button
                      onClick={() => setAutoPrint(!autoPrint)}
                      className={`w-8 h-4.5 rounded-full p-0.5 transition-colors relative ${
                        autoPrint ? 'bg-[#00C060]' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                          autoPrint ? 'translate-x-3.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-700">Print Modifiers & Notes</span>
                    <button
                      onClick={() => setPrintModifiers(!printModifiers)}
                      className={`w-8 h-4.5 rounded-full p-0.5 transition-colors relative ${
                        printModifiers ? 'bg-[#00C060]' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                          printModifiers ? 'translate-x-3.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-700">Cut Paper After Print</span>
                    <button
                      onClick={() => setCutPaper(!cutPaper)}
                      className={`w-8 h-4.5 rounded-full p-0.5 transition-colors relative ${
                        cutPaper ? 'bg-[#00C060]' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                          cutPaper ? 'translate-x-3.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Buttons: Test Print | Cancel | Save Changes */}
              <div className="pt-2 border-t border-gray-100 space-y-2 mt-auto">
                <button
                  type="button"
                  onClick={handleTestPrint}
                  className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black hover:bg-emerald-100 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Test Print</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPrinter(selectedPrinter)}
                    className="py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    className="py-2.5 rounded-xl bg-[#00C060] text-white text-xs font-black hover:bg-[#00a854] shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
              <Printer className="w-8 h-8 text-gray-300 mb-1" />
              <p className="text-xs font-bold text-gray-600">No printer selected</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Floating Printer Quick Bar */}
      <div className="md:hidden fixed bottom-14 left-2.5 right-2.5 z-40 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 px-3.5 border border-emerald-500/25 shadow-xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Printer className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-gray-900 truncate">
              {selectedPrinter ? selectedPrinter.name : `${printers.length} Printers`}
            </p>
            <p className="text-[10px] text-gray-500 font-bold truncate">
              {selectedPrinter ? `Assigned: ${selectedPrinter.assignedTo}` : 'Tap printer to edit'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {selectedPrinter && (
            <button
              type="button"
              onClick={handleTestPrint}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black hover:bg-emerald-100 flex items-center gap-1 shadow-2xs"
            >
              <Printer className="w-3 h-3 text-emerald-600" />
              <span>Test</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (selectedPrinter) {
                setMobileDrawerOpen(true);
              } else if (filteredPrinters[0]) {
                handleSelectPrinter(filteredPrinters[0]);
                setMobileDrawerOpen(true);
              } else {
                setAddPrinterModal(true);
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-[#00C060] text-white text-xs font-black shadow-xs flex items-center gap-1"
          >
            <span>{selectedPrinter ? 'Configure' : 'Add'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Slide-Up Drawer for Printer Settings */}
      {mobileDrawerOpen && selectedPrinter && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl shadow-2xl border-t border-gray-200 max-h-[88vh] flex flex-col p-4 z-10 animate-in slide-in-from-bottom">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3" />

            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0 p-1.5 shadow-xs">
                  <Printer className="w-5 h-5 text-gray-200" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 leading-tight">
                    {selectedPrinter.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                    {selectedPrinter.model}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(selectedPrinter.status)}
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className="py-2.5 border-b border-gray-100 grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-gray-50/80 rounded-xl p-1.5 border border-gray-100 flex flex-col items-center">
                <Home className="w-3 h-3 text-amber-500 mb-0.5" />
                <span className="text-[9px] text-gray-400 font-bold">Type</span>
                <span className="text-[11px] font-black text-gray-800 truncate">
                  {selectedPrinter.typeLabel}
                </span>
              </div>
              <div className="bg-gray-50/80 rounded-xl p-1.5 border border-gray-100 flex flex-col items-center">
                <Wifi className="w-3 h-3 text-emerald-500 mb-0.5" />
                <span className="text-[9px] text-gray-400 font-bold">Connection</span>
                <span className="text-[11px] font-black text-gray-800 capitalize">
                  {selectedPrinter.connection}
                </span>
              </div>
              <div className="bg-gray-50/80 rounded-xl p-1.5 border border-gray-100 flex flex-col items-center">
                <Monitor className="w-3 h-3 text-gray-400 mb-0.5" />
                <span className="text-[9px] text-gray-400 font-bold">IP Address</span>
                <span className="text-[10px] font-black text-gray-800 truncate">
                  {selectedPrinter.endpoint}
                </span>
              </div>
            </div>

            {/* Settings Form inside Drawer */}
            <div className="py-2.5 flex-1 min-h-0 overflow-y-auto scrollbar-none space-y-3 text-xs">
              <h4 className="font-black text-gray-900 text-xs">Printer Settings</h4>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Assigned To <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full appearance-none p-2 pr-7 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none bg-white cursor-pointer"
                  >
                    <option>Kitchen KOT</option>
                    <option>POS / Bills</option>
                    <option>Beverages</option>
                    <option>Not Assigned</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Paper Size</label>
                <div className="relative">
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value)}
                    className="w-full appearance-none p-2 pr-7 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none bg-white cursor-pointer"
                  >
                    <option>80 mm (Thermal)</option>
                    <option>58 mm (Thermal)</option>
                    <option>A4</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Print Format</label>
                <div className="relative">
                  <select
                    value={printFormat}
                    onChange={(e) => setPrintFormat(e.target.value)}
                    className="w-full appearance-none p-2 pr-7 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none bg-white cursor-pointer"
                  >
                    <option>KOT (Kitchen Order Ticket)</option>
                    <option>Tax Invoice (Bill)</option>
                    <option>Bar KOT</option>
                    <option>Standard Bill</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-700">Auto Print New Orders</span>
                  <button
                    onClick={() => setAutoPrint(!autoPrint)}
                    className={`w-8 h-4.5 rounded-full p-0.5 transition-colors relative ${
                      autoPrint ? 'bg-[#00C060]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                        autoPrint ? 'translate-x-3.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-700">Print Modifiers & Notes</span>
                  <button
                    onClick={() => setPrintModifiers(!printModifiers)}
                    className={`w-8 h-4.5 rounded-full p-0.5 transition-colors relative ${
                      printModifiers ? 'bg-[#00C060]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                        printModifiers ? 'translate-x-3.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-700">Cut Paper After Print</span>
                  <button
                    onClick={() => setCutPaper(!cutPaper)}
                    className={`w-8 h-4.5 rounded-full p-0.5 transition-colors relative ${
                      cutPaper ? 'bg-[#00C060]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                        cutPaper ? 'translate-x-3.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions inside Drawer */}
            <div className="pt-3 border-t border-gray-100 space-y-2 mt-auto">
              <button
                type="button"
                onClick={handleTestPrint}
                className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black hover:bg-emerald-100 flex items-center justify-center gap-1.5 transition-all"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-600" />
                <span>Test Print</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 text-center"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSaveChanges();
                    setMobileDrawerOpen(false);
                  }}
                  className="py-2.5 rounded-xl bg-[#00C060] text-white text-xs font-black hover:bg-[#00a854] shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Printer Modal */}
      {addPrinterModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-gray-100 space-y-3.5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#00C060]" />
                Add New Printer
              </h3>
              <button
                onClick={() => setAddPrinterModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Printer Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Bar Printer 2"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00C060]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Model</label>
                <input
                  type="text"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder="e.g. Epson TM-T82"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00C060]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as PrinterType)}
                    className="w-full p-2 rounded-xl border border-gray-200 focus:outline-none bg-white font-semibold"
                  >
                    <option value="kitchen">Kitchen</option>
                    <option value="billing">Billing</option>
                    <option value="bar">Bar</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Connection</label>
                  <select
                    value={newConnection}
                    onChange={(e) => setNewConnection(e.target.value as PrinterConnection)}
                    className="w-full p-2 rounded-xl border border-gray-200 focus:outline-none bg-white font-semibold"
                  >
                    <option value="wifi">Wi-Fi (Network)</option>
                    <option value="usb">USB</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">IP / USB Port</label>
                <input
                  type="text"
                  value={newEndpoint}
                  onChange={(e) => setNewEndpoint(e.target.value)}
                  placeholder="e.g. 192.168.1.55"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00C060]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setAddPrinterModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreatePrinter}
                className="px-5 py-2 rounded-xl text-xs font-black bg-[#00C060] text-white hover:bg-[#00a854] shadow-xs"
              >
                Add Printer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintersPage;
