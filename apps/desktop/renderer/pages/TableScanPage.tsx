import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Smartphone,
  Tablet,
  Laptop,
  CheckCircle2,
  Armchair,
  Wifi,
  Phone,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  BellRing,
  Layers,
  Copy,
  Check,
  ExternalLink,
  Pause,
  Play,
} from 'lucide-react';
import {
  detectDeviceDetails,
  DeviceDetails,
  getSavedScannerMobile,
  saveScannerMobile,
  saveTableScanRecord,
  TableScanRecord,
} from '../utils/deviceDetector';

const DEFAULT_REDIRECT_URL = 'https://qr.cyberlim.com/developer';

export const TableScanPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const tableName = params.get('table') || 'T-01';
  const tableId = params.get('id') || 't-1';
  const tableSection = params.get('section') || 'Floor 1';
  const tableSeats = params.get('seats') || '4';
  const redirectTarget = params.get('redirect') || DEFAULT_REDIRECT_URL;

  const [device, setDevice] = useState<DeviceDetails | null>(null);
  const [mobileNumber, setMobileNumber] = useState(getSavedScannerMobile() || '+91 98765 43210');
  const [inputMobile, setInputMobile] = useState(getSavedScannerMobile() || '');
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedUa, setCopiedUa] = useState(false);

  // Top notification banner state
  const [showTopNotification, setShowTopNotification] = useState(true);

  // Redirection countdown state
  const [countdown, setCountdown] = useState(4);
  const [isRedirectPaused, setIsRedirectPaused] = useState(false);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. Detect device details instantly
    const d = detectDeviceDetails();
    setDevice(d);

    // 2. Read saved mobile or fallback
    const saved = getSavedScannerMobile();
    const effectiveMobile = saved || '+91 98765 43210';
    if (saved) {
      setMobileNumber(saved);
      setInputMobile(saved);
    }

    // 3. Record scan instantly and broadcast
    const record: TableScanRecord = {
      id: 'scan-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      tableId,
      tableName,
      scannerMobile: effectiveMobile,
      device: d,
      timestamp: Date.now(),
    };
    saveTableScanRecord(record);

    // 4. Try reading battery if available
    const nav = navigator as unknown as { getBattery?: () => Promise<{ level: number; charging: boolean }> };
    if (nav.getBattery) {
      nav.getBattery().then((battery) => {
        setDevice((prev) =>
          prev
            ? {
                ...prev,
                batteryLevel: Math.round(battery.level * 100),
                isCharging: battery.charging,
              }
            : null
        );
      });
    }

    // Trigger haptic vibration if supported on phone
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch {
        /* ignore */
      }
    }
  }, [tableId, tableName]);

  // Handle auto-redirection countdown
  useEffect(() => {
    if (isRedirectPaused) {
      if (redirectTimerRef.current) clearInterval(redirectTimerRef.current);
      return;
    }

    if (countdown <= 0) {
      window.location.href = redirectTarget;
      return;
    }

    redirectTimerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(redirectTimerRef.current!);
          window.location.href = redirectTarget;
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      if (redirectTimerRef.current) clearInterval(redirectTimerRef.current);
    };
  }, [countdown, isRedirectPaused, redirectTarget]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveMobile = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputMobile.trim().replace(/\s+/g, '');
    if (!clean || clean.length < 10) {
      showToast('Please enter a valid 10-digit mobile number');
      return;
    }
    const formatted = clean.startsWith('+') ? clean : `+91 ${clean.slice(-10)}`;
    setMobileNumber(formatted);
    saveScannerMobile(formatted);
    setIsEditingMobile(false);
    setHasCheckedIn(true);

    if (device) {
      const record: TableScanRecord = {
        id: 'scan-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        tableId,
        tableName,
        scannerMobile: formatted,
        device,
        timestamp: Date.now(),
      };
      saveTableScanRecord(record);
    }
    showToast(`Scanner mobile updated for Table ${tableName}!`);
  };

  const handleCallWaiter = () => {
    try {
      const existingReqs = JSON.parse(localStorage.getItem('bitechez_table_requests') || '[]');
      const newReq = {
        id: 'req-' + Date.now(),
        table: tableName,
        type: 'Waiter Call',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        scannerMobile: mobileNumber || 'Guest',
        device: device?.brandModel || 'Mobile Device',
      };
      localStorage.setItem('bitechez_table_requests', JSON.stringify([newReq, ...existingReqs]));
      showToast(`Waiter alerted for Table ${tableName}!`);
    } catch {
      showToast(`Request sent to staff!`);
    }
  };

  const copyUserAgent = () => {
    if (device?.userAgent) {
      navigator.clipboard.writeText(device.userAgent);
      setCopiedUa(true);
      setTimeout(() => setCopiedUa(false), 2000);
      showToast('User Agent string copied!');
    }
  };

  const getDeviceIcon = () => {
    if (device?.deviceType === 'Mobile') return <Smartphone className="w-6 h-6 text-[#00C060]" />;
    if (device?.deviceType === 'Tablet') return <Tablet className="w-6 h-6 text-blue-500" />;
    return <Laptop className="w-6 h-6 text-purple-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-100 text-slate-800 flex flex-col items-center justify-start p-3 sm:p-6 pb-24 pt-20">
      {/* 1. TOP NOTIFICATION BANNER: "QR SCANNED" */}
      {showTopNotification && (
        <div className="fixed top-2 inset-x-2 sm:inset-x-auto sm:w-[480px] z-50 bg-[#00C060] text-white p-3 sm:p-3.5 rounded-2xl shadow-[0_10px_30px_rgba(0,192,96,0.35)] flex items-center justify-between gap-3 border-2 border-emerald-400 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider">QR Code Scanned!</span>
                <span className="text-[9px] font-black px-1.5 py-0.2 bg-white/25 rounded-full uppercase">
                  Verified
                </span>
              </div>
              <p className="text-[11px] font-bold text-emerald-100 truncate">
                Table {tableName} • Scanner Details Captured Instantly
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-black bg-white text-[#00C060] px-2 py-0.5 rounded-lg shadow-xs">
              Live
            </span>
            <button
              onClick={() => setShowTopNotification(false)}
              className="text-white/80 hover:text-white text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Floating Toast Alert */}
      {toast && (
        <div className="fixed top-18 z-50 px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#00C060]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-lg space-y-4">
        {/* Top App Header with CyberLim POS Logo */}
        <header className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00C060] text-white flex items-center justify-center font-black shadow-md shadow-emerald-500/20">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black text-slate-900 leading-none">CyberLim POS</h1>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 text-[#00C060]">
                  QR TELEMETRY
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">Smart Table Dining System</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/tables')}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>POS Tables</span>
          </button>
        </header>

        {/* 2. AUTOMATIC REDIRECTION COUNTDOWN CARD */}
        <div className="rounded-3xl bg-slate-900 text-white p-4 sm:p-5 shadow-xl border border-slate-800 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-[#00C060] flex items-center justify-center shrink-0 border border-emerald-500/30">
                <ExternalLink className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                  Redirection Target
                </span>
                <h4 className="text-sm font-black text-white truncate max-w-[240px] sm:max-w-[280px]">
                  {redirectTarget}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsRedirectPaused((p) => !p)}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 transition"
                title={isRedirectPaused ? 'Resume countdown' : 'Pause redirection'}
              >
                {isRedirectPaused ? <Play className="w-3 h-3 text-[#00C060]" /> : <Pause className="w-3 h-3" />}
                <span>{isRedirectPaused ? 'Resume' : 'Pause'}</span>
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = redirectTarget)}
                className="px-3 py-1 rounded-xl bg-[#00C060] hover:bg-[#00A850] text-white text-xs font-black shadow-md transition flex items-center gap-1"
              >
                <span>Go Now</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Countdown timer & progress bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>{isRedirectPaused ? 'Redirection paused' : `Redirecting in ${countdown}s...`}</span>
              <span className="text-emerald-400 font-mono font-black">{countdown}s</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00C060] rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${((4 - countdown) / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3. TABLE NUMBER & VERIFIED HERO CARD */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#00C060] via-[#00A850] to-emerald-700 text-white p-5 sm:p-6 shadow-xl shadow-emerald-600/20">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -left-6 -top-6 w-24 h-24 rounded-full bg-emerald-400/20 blur-lg pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white/20 backdrop-blur-md text-white border border-white/20">
                <Sparkles className="w-3 h-3 text-amber-300" />
                {hasCheckedIn ? 'Active Dining Session' : 'Table Scanned Successfully'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-2 flex items-center gap-2">
                Table {tableName}
              </h2>
              <div className="flex items-center gap-3 text-xs font-bold text-emerald-100 mt-1.5">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  {tableSection}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Armchair className="w-3.5 h-3.5" />
                  {tableSeats} Seats Capacity
                </span>
              </div>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex flex-col items-center justify-center text-white shrink-0 shadow-inner">
              <Armchair className="w-7 h-7" />
              <span className="text-[9px] font-black uppercase mt-0.5 tracking-wider">Active</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-bold text-emerald-50">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Scan Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-lg text-[10px] font-black">
              <ShieldCheck className="w-3 h-3 text-white" />
              Verified Telemetry
            </span>
          </div>
        </div>

        {/* 4. SCANNER MOBILE NUMBER CARD */}
        <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00C060] flex items-center justify-center font-bold">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 leading-tight">Scanner Mobile Number</h3>
                <p className="text-[11px] font-semibold text-slate-400">Mobile identity of this phone scanner</p>
              </div>
            </div>

            {!isEditingMobile && (
              <button
                type="button"
                onClick={() => setIsEditingMobile(true)}
                className="text-xs font-bold text-[#00C060] hover:underline px-2 py-1 rounded-lg hover:bg-emerald-50 transition"
              >
                Edit
              </button>
            )}
          </div>

          {isEditingMobile ? (
            <form onSubmit={handleSaveMobile} className="space-y-2.5 pt-1">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    value={inputMobile.replace(/^\+91\s*/, '')}
                    onChange={(e) => setInputMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C060] focus:border-transparent transition"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#00C060] hover:bg-[#00A850] text-white text-xs font-black shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 shrink-0"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00C060] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-900 tracking-wide">{mobileNumber}</span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-[#00C060] text-white">
                      Linked
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-emerald-800 mt-0.5">
                    Scanner verified for Table {tableName}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-black text-[#00C060] block">Connected</span>
              </div>
            </div>
          )}
        </div>

        {/* 5. INSTANT SCANNER DEVICE DETAILS CARD */}
        <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                {getDeviceIcon()}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 leading-tight">Scanner Device Details</h3>
                <p className="text-[11px] font-semibold text-slate-400">Live hardware, OS & browser telemetry</p>
              </div>
            </div>

            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide">
              {device?.deviceType || 'Device'}
            </span>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs font-bold">
            {/* Brand / Model */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Device Model</span>
              <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 truncate">
                {device?.brandModel || 'Detecting...'}
              </p>
            </div>

            {/* Operating System */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">OS & Version</span>
              <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 truncate">
                {device?.osName} {device?.osVersion ? `v${device.osVersion}` : ''}
              </p>
            </div>

            {/* Browser */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Browser</span>
              <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 truncate">
                {device?.browserName} {device?.browserVersion ? `v${device.browserVersion}` : ''}
              </p>
            </div>

            {/* Screen Resolution */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Screen & DPR</span>
              <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 truncate">
                {device ? `${device.screenWidth} × ${device.screenHeight} (${device.pixelRatio}x)` : '—'}
              </p>
            </div>

            {/* Network / Connection */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Connection</span>
              <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 flex items-center gap-1.5 truncate">
                <Wifi className="w-3.5 h-3.5 text-[#00C060]" />
                <span>{device?.connectionType || 'High-Speed'}</span>
              </p>
            </div>

            {/* Timezone & Language */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Locale & Zone</span>
              <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 truncate">
                {device?.language} • {device?.timezone}
              </p>
            </div>
          </div>

          {/* Battery Info (if available) */}
          {device?.batteryLevel !== undefined && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs font-bold text-emerald-900">
              <span>Scanner Battery Level</span>
              <span className="font-black">
                {device.batteryLevel}% {device.isCharging ? '⚡ Charging' : ''}
              </span>
            </div>
          )}

          {/* User Agent String collapsible info */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Full User Agent String
              </span>
              <button
                type="button"
                onClick={copyUserAgent}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                {copiedUa ? <Check className="w-3 h-3 text-[#00C060]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUa ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[10px] font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600 break-all max-h-16 overflow-y-auto">
              {device?.userAgent}
            </p>
          </div>
        </div>

        {/* 6. ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleCallWaiter}
            className="py-3 px-4 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition"
          >
            <BellRing className="w-4 h-4 text-amber-500" />
            <span>Call Waiter</span>
          </button>

          <button
            type="button"
            onClick={() => (window.location.href = redirectTarget)}
            className="py-3 px-4 rounded-2xl bg-[#00C060] hover:bg-[#00A850] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition"
          >
            <span>Cyberlim Portal</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* Footer info */}
        <footer className="text-center pt-4 pb-6 text-slate-400 text-xs">
          <p className="font-bold">Powered by CyberLim QR API & Bitechez Engine</p>
          <p className="text-[11px] text-slate-400 mt-1">Real-time Table Verification & Device Telemetry</p>
        </footer>
      </div>
    </div>
  );
};
