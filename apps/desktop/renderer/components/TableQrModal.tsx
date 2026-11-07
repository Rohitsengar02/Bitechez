import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Download,
  Printer,
  Copy,
  ExternalLink,
  Check,
  Smartphone,
  Sparkles,
  Settings,
} from 'lucide-react';
import { getScansForTable, TableScanRecord } from '../utils/deviceDetector';

interface TableQrModalProps {
  open: boolean;
  onClose: () => void;
  table: {
    id: string;
    name: string;
    section: string;
    seats: number;
    status: string;
  } | null;
}

export const TableQrModal: React.FC<TableQrModalProps> = ({ open, onClose, table }) => {
  if (!open || !table) return null;

  const [qrColor, setQrColor] = useState('00C060');
  const [copied, setCopied] = useState(false);
  const [outletName, setOutletName] = useState(() => {
    try {
      return localStorage.getItem('bitechez_outlet_slug') || 'cyberlim';
    } catch {
      return 'cyberlim';
    }
  });
  const [customHost, setCustomHost] = useState(() => {
    try {
      return localStorage.getItem('bitechez_qr_custom_host') || '';
    } catch {
      return '';
    }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [recentScans, setRecentScans] = useState<TableScanRecord[]>([]);

  // Calculate target URL
  const baseOrigin = customHost.trim()
    ? customHost.trim().replace(/\/+$/, '')
    : window.location.origin + window.location.pathname;

  const scanUrl = `${baseOrigin}#/${encodeURIComponent(outletName || 'cyberlim')}?table=${encodeURIComponent(
    table.name
  )}&id=${encodeURIComponent(table.id)}&section=${encodeURIComponent(table.section)}&seats=${table.seats}`;

  // Cyberlim QR API endpoint
  const cyberlimQrUrl = `https://qr.cyberlim.com/api/v1/qr?data=${encodeURIComponent(
    scanUrl
  )}&size=320&color=${qrColor.replace('#', '')}&bg=ffffff&level=M`;

  // Fallback endpoint if needed
  const fallbackQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
    scanUrl
  )}&color=${qrColor.replace('#', '')}`;

  const [imgSrc, setImgSrc] = useState(cyberlimQrUrl);

  useEffect(() => {
    setImgSrc(cyberlimQrUrl);
  }, [cyberlimQrUrl]);

  // Load recent scans for this table
  useEffect(() => {
    const scans = getScansForTable(table.id).concat(getScansForTable(table.name));
    // unique by id
    const unique = Array.from(new Map(scans.map((s) => [s.id, s])).values()).sort(
      (a, b) => b.timestamp - a.timestamp
    );
    setRecentScans(unique);
  }, [table]);

  const handleCopy = () => {
    navigator.clipboard.writeText(scanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      const resp = await fetch(imgSrc);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Table-${table.name}-QR.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(imgSrc + '&download=true', '_blank');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Table ${table.name} QR - CyberLim POS</title>
          <style>
            @page { size: auto; margin: 15mm; }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 90vh;
              margin: 0;
              background: #fff;
              color: #0f172a;
            }
            .standee {
              width: 320px;
              border: 3px solid #00C060;
              border-radius: 28px;
              padding: 28px 24px;
              text-align: center;
              box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            }
            .brand {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              font-size: 18px;
              font-weight: 900;
              color: #00C060;
              margin-bottom: 4px;
            }
            .table-badge {
              display: inline-block;
              background: #E7F9F0;
              color: #00C060;
              padding: 6px 16px;
              border-radius: 999px;
              font-size: 14px;
              font-weight: 900;
              margin: 10px 0 16px;
            }
            .table-title {
              font-size: 32px;
              font-weight: 900;
              margin: 0 0 4px;
              letter-spacing: -0.5px;
            }
            .table-subtitle {
              font-size: 12px;
              color: #64748b;
              font-weight: 600;
              margin-bottom: 20px;
            }
            .qr-wrap {
              background: #fff;
              padding: 16px;
              border-radius: 20px;
              border: 2px dashed #e2e8f0;
              display: inline-block;
            }
            .qr-wrap img {
              width: 220px;
              height: 220px;
              display: block;
            }
            .instruction {
              font-size: 13px;
              font-weight: 800;
              color: #0f172a;
              margin-top: 18px;
              margin-bottom: 4px;
            }
            .subtext {
              font-size: 11px;
              color: #94a3b8;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="standee">
            <div class="brand">CyberLim POS</div>
            <div class="table-title">Table ${table.name}</div>
            <div class="table-subtitle">${table.section} • Capacity: ${table.seats} Guests</div>
            <div class="table-badge">SCAN TO ORDER</div>
            <div class="qr-wrap">
              <img src="${imgSrc}" alt="Table ${table.name} QR" />
            </div>
            <div class="instruction">Scan with any Phone Camera</div>
            <div class="subtext">View digital menu, call waiter & view table details</div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const saveCustomHost = (val: string) => {
    setCustomHost(val);
    try {
      localStorage.setItem('bitechez_qr_custom_host', val);
    } catch {
      /* ignore */
    }
  };

  const saveOutletName = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-_]/g, '');
    setOutletName(clean);
    try {
      localStorage.setItem('bitechez_outlet_slug', clean);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-lg max-h-[92dvh] flex flex-col rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E7F9F0] text-[#00C060] flex items-center justify-center font-black">
              <QrCode className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 leading-tight">Table {table.name} QR</h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-[#00C060]">
                  CYBERLIM QR
                </span>
              </div>
              <p className="text-xs font-bold text-slate-400">
                {table.section} • {table.seats} Seats • Scan to view device & mobile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowSettings((v) => !v)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                showSettings ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
              }`}
              title="QR URL Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Custom Host & Outlet Settings (collapsible) */}
          {showSettings && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-200">
              <div className="space-y-1">
                <span className="text-xs font-black text-slate-800">Shop / Outlet Slug</span>
                <input
                  type="text"
                  value={outletName}
                  onChange={(e) => saveOutletName(e.target.value)}
                  placeholder="cyberlim"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#00C060]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">Target Base Host</span>
                  <button
                    type="button"
                    onClick={() => saveCustomHost('')}
                    className="text-[10px] font-bold text-[#00C060] hover:underline"
                  >
                    Reset
                  </button>
                </div>
                <input
                  type="url"
                  value={customHost}
                  onChange={(e) => saveCustomHost(e.target.value)}
                  placeholder={window.location.origin + window.location.pathname}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#00C060]"
                />
              </div>

              <p className="text-[10px] font-bold text-slate-400 leading-tight">
                Scanned QR target: {scanUrl}
              </p>
            </div>
          )}

          {/* QR Code Presentation Standee Box */}
          <div className="relative rounded-3xl bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 border-2 border-emerald-100 p-5 flex flex-col items-center justify-center text-center shadow-xs">
            {/* Top Table Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-emerald-200 text-[#00C060] text-xs font-black shadow-xs mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CyberLim POS • Table {table.name}</span>
            </div>

            {/* QR Image Container */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 bg-white p-3.5 rounded-2xl border-2 border-slate-100 shadow-md flex items-center justify-center group overflow-hidden">
              <img
                src={imgSrc}
                alt={`Table ${table.name} QR Code`}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-102"
                onError={() => {
                  if (imgSrc !== fallbackQrUrl) setImgSrc(fallbackQrUrl);
                }}
              />
            </div>

            {/* Color switcher pills */}
            <div className="flex items-center gap-2 mt-3.5">
              <span className="text-[11px] font-bold text-slate-400">QR Color:</span>
              {[
                { hex: '00C060', label: 'Green', bg: 'bg-[#00C060]' },
                { hex: '000000', label: 'Dark', bg: 'bg-black' },
                { hex: '2563EB', label: 'Blue', bg: 'bg-blue-600' },
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setQrColor(c.hex)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black border transition ${
                    qrColor === c.hex
                      ? 'border-slate-800 ring-2 ring-slate-800/20 bg-white text-slate-900'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>

            <p className="text-xs font-black text-slate-800 mt-3">Scan with Phone Camera</p>
            <p className="text-[11px] font-semibold text-slate-400">
              Opens <span className="font-bold text-[#00C060]">/{outletName}</span> with Splash Screen & Table {table.name} Menu
            </p>
          </div>

          {/* Action Buttons: Test Scanner / Print / Download */}
          <div className="grid grid-cols-3 gap-2">
            {/* Test / Open Scanner View */}
            <button
              type="button"
              onClick={() => window.open(scanUrl, '_blank')}
              className="py-2.5 px-3 rounded-2xl bg-[#00C060] hover:bg-[#00A850] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition"
              title="Test Scanner in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Test Scan</span>
            </button>

            {/* Print Standee */}
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-[#00C060] text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition"
              title="Print Table Tent Card"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Card</span>
            </button>

            {/* Download PNG */}
            <button
              type="button"
              onClick={handleDownload}
              className="py-2.5 px-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-[#00C060] text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition"
              title="Download QR Image"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save PNG</span>
            </button>
          </div>

          {/* URL Copy Bar */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-mono text-[11px] text-slate-500 truncate max-w-[280px] sm:max-w-[340px]">
              {scanUrl}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 font-bold text-xs text-[#00C060] hover:underline shrink-0 ml-2"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Live Recent Scans Telemetry for this Table */}
          <div className="rounded-2xl border border-slate-100 p-3.5 bg-white space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#00C060]" />
                <span>Live Scanners for Table {table.name}</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {recentScans.length} {recentScans.length === 1 ? 'Scan' : 'Scans'}
              </span>
            </div>

            {recentScans.length > 0 ? (
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {recentScans.slice(0, 5).map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900">{scan.scannerMobile || 'Guest'}</span>
                        <span className="text-[9px] font-black px-1.5 py-0.2 bg-emerald-100 text-[#00C060] rounded">
                          Scanned
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5 truncate max-w-[200px]">
                        {scan.device.brandModel} • {scan.device.osName} • {scan.device.browserName}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">
                      {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center rounded-xl bg-slate-50/70 border border-dashed border-slate-200">
                <p className="text-[11px] font-bold text-slate-500">No scans recorded yet for Table {table.name}</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                  Click "Test Scan" or scan this QR with your phone camera to view live device & mobile details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
