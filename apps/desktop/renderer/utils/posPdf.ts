/* =====================================================================
   CyberLim POS — PDF engine (KOT · Bill · Tax Invoice)
   - jsPDF + qrcode are lazy-loaded, so they never slow the first paint.
   - Built-in PDF fonts can't draw "₹", so PDFs use "Rs.".
   ===================================================================== */
import type { jsPDF as JsPDF } from 'jspdf';

/** TODO: replace with real outlet details (or load from your settings API). */
export const OUTLET_INFO = {
  name: 'Resto Daddy',
  branch: 'Main Outlet',
  address: 'Shop No. 12, Main Market, Greater Noida, Uttar Pradesh 201310',
  phone: '+91 98765 43210',
  gstin: '09ABCDE1234F1Z5',
  fssai: '12345678901234',
  upiVpa: 'restodaddy@icici',
  sac: '996331', // SAC for restaurant services
};

export type OrderTypeKey = 'dine_in' | 'takeaway' | 'delivery';

export interface BillLine {
  id: string;
  name: string;
  qty: number;
  unitPaise: number;
  gstRate: number;
  notes?: string;
  isVeg?: boolean;
}

export interface BillPayment {
  method: string;
  amountPaise: number;
  tenderedPaise?: number;
  changePaise?: number;
  reference?: string;
}

export interface BillDoc {
  orderNumber: string;
  createdAt: string; // ISO
  orderType: OrderTypeKey;
  tableName?: string;
  guests: number;
  cashier: string;
  customer?: { name?: string; phone?: string; address?: string };
  lines: BillLine[];
  orderNote?: string;
  subtotalPaise: number;
  discountPaise: number;
  discountPercentage: number;
  offerCode?: string;
  cgstPaise: number;
  sgstPaise: number;
  totalGstPaise: number;
  roundingPaise: number;
  grandTotalPaise: number;
  payments?: BillPayment[];
}

export interface KotDoc {
  kotNumber: number;
  orderNumber: string;
  createdAt: string;
  orderType: OrderTypeKey;
  tableName?: string;
  guests: number;
  items: { name: string; qty: number; notes?: string; isVeg?: boolean }[];
  orderNote?: string;
}

export type PdfMode = 'print' | 'download' | 'preview';

/* ---------------- formatting helpers ---------------- */
const n2 = (p: number) => (p / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const rs = (p: number) => `Rs. ${n2(p)}`;
const typeLabel = (t: OrderTypeKey) => ({ dine_in: 'Dine In', takeaway: 'Takeaway', delivery: 'Delivery' }[t]);
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function amountInWords(paise: number): string {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = (n: number) => (n < 20 ? a[n] : b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : ''));
  const three = (n: number) => (n >= 100 ? a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + two(n % 100) : '') : two(n));
  const words = (n: number) => {
    if (n === 0) return 'Zero';
    const parts: string[] = [];
    const crore = Math.floor(n / 1e7);
    const lakh = Math.floor(n / 1e5) % 100;
    const thousand = Math.floor(n / 1000) % 100;
    const rest = n % 1000;
    if (crore) parts.push(words(crore) + ' Crore');
    if (lakh) parts.push(two(lakh) + ' Lakh');
    if (thousand) parts.push(two(thousand) + ' Thousand');
    if (rest) parts.push(three(rest));
    return parts.join(' ');
  };
  const rupees = Math.floor(Math.abs(paise) / 100);
  const ps = Math.abs(paise) % 100;
  return `Rupees ${words(rupees)}${ps ? ' and ' + two(ps) + ' Paise' : ''} Only`;
}

async function upiQrDataUrl(amountPaise: number, note: string) {
  try {
    const QR = await import('qrcode');
    const url = `upi://pay?pa=${encodeURIComponent(OUTLET_INFO.upiVpa)}&pn=${encodeURIComponent(OUTLET_INFO.name)}&am=${(amountPaise / 100).toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;
    return await (QR.default ?? QR).toDataURL(url, { margin: 1, width: 320 });
  } catch {
    return null;
  }
}
export { upiQrDataUrl };

/* ---------------- 80mm thermal renderer (2-pass to auto-size height) ---------------- */
type Renderer = (doc: JsPDF, W: number) => number;

async function thermal(render: Renderer): Promise<JsPDF> {
  const { jsPDF } = await import('jspdf');
  const W = 80;
  const probe = new jsPDF({ unit: 'mm', format: [W, 2000] });
  const h = render(probe, W);
  const doc = new jsPDF({ unit: 'mm', format: [W, Math.max(h + 8, 100)] });
  render(doc, W);
  return doc;
}

function thermalKit(doc: JsPDF, W: number) {
  const M = 4;
  const k = {
    y: 7,
    M,
    font(size: number, style: 'normal' | 'bold' | 'italic' = 'normal') {
      doc.setFont('helvetica', style);
      doc.setFontSize(size);
    },
    center(s: string, size = 8, style: 'normal' | 'bold' = 'normal') {
      k.font(size, style);
      const lines = doc.splitTextToSize(s, W - M * 2) as string[];
      lines.forEach((l) => {
        doc.text(l, W / 2, k.y, { align: 'center' });
        k.y += size * 0.42 + 1;
      });
    },
    row(l: string, r: string, size = 8, style: 'normal' | 'bold' = 'normal') {
      k.font(size, style);
      doc.text(l, M, k.y);
      doc.text(r, W - M, k.y, { align: 'right' });
      k.y += size * 0.42 + 1.3;
    },
    dashed(gap = 4) {
      k.y -= 1;
      doc.setDrawColor(110);
      doc.setLineWidth(0.2);
      doc.setLineDashPattern([0.8, 0.8], 0);
      doc.line(M, k.y, W - M, k.y);
      doc.setLineDashPattern([], 0);
      k.y += gap;
    },
  };
  return k;
}

/* ---------------- KOT ---------------- */
export async function buildKotPdf(d: KotDoc) {
  return thermal((doc, W) => {
    const k = thermalKit(doc, W);
    k.center('KITCHEN ORDER TICKET', 11, 'bold');
    k.center(`${OUTLET_INFO.name} · ${OUTLET_INFO.branch}`, 7.5);
    k.y += 1;
    k.dashed();
    k.row(`KOT #${d.kotNumber}`, fmtDate(d.createdAt), 9, 'bold');
    k.row(`Order: ${d.orderNumber}`, typeLabel(d.orderType), 8);
    if (d.orderType === 'dine_in') k.row(`Table: ${d.tableName ?? '-'}`, `Guests: ${d.guests}`, 9, 'bold');
    k.dashed();
    k.row('ITEM', 'QTY', 8, 'bold');
    k.dashed(3.5);
    d.items.forEach((it) => {
      k.font(10, 'bold');
      const lines = doc.splitTextToSize(`${it.isVeg === false ? '[NV] ' : ''}${it.name}`, W - k.M * 2 - 12) as string[];
      doc.text(lines, k.M, k.y);
      doc.text(String(it.qty), W - k.M, k.y, { align: 'right' });
      k.y += lines.length * 4.4 + 0.6;
      if (it.notes) {
        k.font(8, 'italic');
        const nl = doc.splitTextToSize(`>> ${it.notes}`, W - k.M * 2 - 4) as string[];
        doc.text(nl, k.M + 3, k.y);
        k.y += nl.length * 3.4 + 0.6;
      }
    });
    k.dashed();
    if (d.orderNote) {
      k.font(8, 'bold');
      doc.text('ORDER NOTE:', k.M, k.y);
      k.y += 3.6;
      k.font(8, 'italic');
      const nl = doc.splitTextToSize(d.orderNote, W - k.M * 2) as string[];
      doc.text(nl, k.M, k.y);
      k.y += nl.length * 3.4 + 1;
      k.dashed();
    }
    k.row(`Total items: ${d.items.reduce((a, i) => a + i.qty, 0)}`, 'Main Kitchen', 8, 'bold');
    return k.y;
  });
}

/* ---------------- Bill (80mm) ---------------- */
export async function buildBillPdf(d: BillDoc) {
  const unpaid = !d.payments?.length;
  const qr = unpaid ? await upiQrDataUrl(d.grandTotalPaise, d.orderNumber) : null;

  return thermal((doc, W) => {
    const k = thermalKit(doc, W);
    k.center(OUTLET_INFO.name.toUpperCase(), 13, 'bold');
    k.center(OUTLET_INFO.branch, 8);
    k.center(OUTLET_INFO.address, 7);
    k.center(`Ph: ${OUTLET_INFO.phone}`, 7);
    k.center(`GSTIN: ${OUTLET_INFO.gstin}  |  FSSAI: ${OUTLET_INFO.fssai}`, 6.5);
    k.y += 1;
    k.dashed();
    k.center(unpaid ? 'BILL (UNPAID)' : 'TAX INVOICE', 9.5, 'bold');
    k.y += 0.5;
    k.row(`Bill: ${d.orderNumber}`, fmtDate(d.createdAt), 7.5);
    k.row(`Type: ${typeLabel(d.orderType)}${d.tableName && d.orderType === 'dine_in' ? ` · ${d.tableName}` : ''}`, `Guests: ${d.guests}`, 7.5);
    k.row(`Cashier: ${d.cashier}`, '', 7.5);
    if (d.customer?.name || d.customer?.phone) k.row(`Cust: ${d.customer?.name ?? ''}`, d.customer?.phone ?? '', 7.5);
    if (d.customer?.address) {
      k.font(7);
      const al = doc.splitTextToSize(`Addr: ${d.customer.address}`, W - k.M * 2) as string[];
      doc.text(al, k.M, k.y);
      k.y += al.length * 3 + 0.8;
    }
    k.dashed();

    // Items header
    k.font(7.5, 'bold');
    doc.text('Item', k.M, k.y);
    doc.text('Qty', 50, k.y, { align: 'right' });
    doc.text('Rate', 63, k.y, { align: 'right' });
    doc.text('Amt', W - k.M, k.y, { align: 'right' });
    k.y += 4;
    k.dashed(3.5);

    d.lines.forEach((l) => {
      k.font(7.5);
      const nl = doc.splitTextToSize(l.name, 36) as string[];
      doc.text(nl, k.M, k.y);
      doc.text(String(l.qty), 50, k.y, { align: 'right' });
      doc.text(n2(l.unitPaise), 63, k.y, { align: 'right' });
      doc.text(n2(l.unitPaise * l.qty), W - k.M, k.y, { align: 'right' });
      k.y += nl.length * 3.3 + 0.8;
      if (l.notes) {
        k.font(6.5, 'italic');
        doc.text(`  - ${l.notes}`, k.M, k.y);
        k.y += 3;
      }
    });
    k.dashed();

    k.row(`Subtotal (${d.lines.reduce((a, l) => a + l.qty, 0)} items)`, n2(d.subtotalPaise), 7.5);
    if (d.discountPaise > 0)
      k.row(`Discount${d.offerCode ? ` [${d.offerCode}]` : ''} (${d.discountPercentage}%)`, `-${n2(d.discountPaise)}`, 7.5);
    k.row('CGST', n2(d.cgstPaise), 7.5);
    k.row('SGST', n2(d.sgstPaise), 7.5);
    if (d.roundingPaise) k.row('Round Off', n2(d.roundingPaise), 7.5);
    k.dashed(4.5);
    k.row('GRAND TOTAL', rs(d.grandTotalPaise), 11, 'bold');
    k.dashed();

    if (!unpaid) {
      d.payments!.forEach((p) => {
        k.row(`Paid via ${p.method.toUpperCase()}`, n2(p.amountPaise), 7.5, 'bold');
        if (p.tenderedPaise && p.tenderedPaise > p.amountPaise) {
          k.row('  Tendered', n2(p.tenderedPaise), 7);
          k.row('  Change returned', n2(p.changePaise ?? 0), 7);
        }
        if (p.reference) k.row('  Ref', p.reference, 7);
      });
      k.dashed();
    } else if (qr) {
      doc.addImage(qr, 'PNG', W / 2 - 15, k.y - 1, 30, 30);
      k.y += 31;
      k.center(`Scan & pay ${rs(d.grandTotalPaise)} via any UPI app`, 7, 'bold');
      k.center(`UPI: ${OUTLET_INFO.upiVpa}`, 6.5);
      k.dashed();
    }

    k.center('Thank you! Please visit again.', 8.5, 'bold');
    k.center('Powered by CyberLim POS', 6.5);
    return k.y;
  });
}

/* ---------------- A4 GST Tax Invoice ---------------- */
export async function buildInvoicePdf(d: BillDoc) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const M = 14;
  const BR: [number, number, number] = [128, 13, 50];
  const INK: [number, number, number] = [25, 25, 35];

  const font = (size: number, style: 'normal' | 'bold' | 'italic' = 'normal') => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
  };

  // Header band
  doc.setFillColor(...BR);
  doc.rect(0, 0, W, 32, 'F');
  doc.setTextColor(255, 255, 255);
  font(19, 'bold');
  doc.text(OUTLET_INFO.name, M, 13);
  font(8.5);
  doc.text(`${OUTLET_INFO.branch} · ${OUTLET_INFO.address}`, M, 19.5, { maxWidth: 120 });
  doc.text(`Ph: ${OUTLET_INFO.phone}   GSTIN: ${OUTLET_INFO.gstin}   FSSAI: ${OUTLET_INFO.fssai}`, M, 26.5);
  font(16, 'bold');
  doc.text('TAX INVOICE', W - M, 13, { align: 'right' });
  font(8.5);
  doc.text(`Invoice No: INV-${d.orderNumber}`, W - M, 20, { align: 'right' });
  doc.text(`Date: ${fmtDate(d.createdAt)}`, W - M, 25.5, { align: 'right' });

  // Billed to / Order details
  doc.setTextColor(...INK);
  let y = 42;
  font(8.5, 'bold');
  doc.setTextColor(...BR);
  doc.text('BILLED TO', M, y);
  doc.text('ORDER DETAILS', 118, y);
  doc.setTextColor(...INK);
  font(9);
  const left = [
    d.customer?.name || 'Walk-in Customer',
    d.customer?.phone ? `Phone: ${d.customer.phone}` : '',
    d.customer?.address ? `Address: ${d.customer.address}` : '',
  ].filter(Boolean);
  const right = [
    `Order Type: ${typeLabel(d.orderType)}`,
    d.orderType === 'dine_in' ? `Table: ${d.tableName ?? '-'}   Guests: ${d.guests}` : `Guests: ${d.guests}`,
    `Cashier: ${d.cashier}`,
    `Place of Supply: Uttar Pradesh (09)`,
  ];
  let ly = y + 5.5;
  left.forEach((t) => {
    const lines = doc.splitTextToSize(t, 92) as string[];
    doc.text(lines, M, ly);
    ly += lines.length * 4.5;
  });
  let ry = y + 5.5;
  right.forEach((t) => {
    doc.text(t, 118, ry);
    ry += 4.5;
  });
  y = Math.max(ly, ry) + 5;

  // Table
  const cols = [
    { h: '#', w: 7, a: 'left' as const },
    { h: 'Item', w: 45, a: 'left' as const },
    { h: 'SAC', w: 15, a: 'center' as const },
    { h: 'Qty', w: 10, a: 'right' as const },
    { h: 'Rate', w: 18, a: 'right' as const },
    { h: 'Taxable', w: 20, a: 'right' as const },
    { h: 'GST%', w: 11, a: 'right' as const },
    { h: 'CGST', w: 17, a: 'right' as const },
    { h: 'SGST', w: 17, a: 'right' as const },
    { h: 'Amount', w: 22, a: 'right' as const },
  ];
  const xs: number[] = [];
  cols.reduce((x, c) => {
    xs.push(x);
    return x + c.w;
  }, M);
  const tx = (i: number) => (cols[i].a === 'left' ? xs[i] + 1.5 : cols[i].a === 'center' ? xs[i] + cols[i].w / 2 : xs[i] + cols[i].w - 1.5);
  const drawHead = () => {
    doc.setFillColor(249, 232, 237);
    doc.rect(M, y, 182, 8, 'F');
    font(8, 'bold');
    doc.setTextColor(...BR);
    cols.forEach((c, i) => doc.text(c.h, tx(i), y + 5.3, { align: c.a }));
    doc.setTextColor(...INK);
    y += 8;
  };
  drawHead();

  const f = d.subtotalPaise > 0 ? (d.subtotalPaise - d.discountPaise) / d.subtotalPaise : 1;
  let sumTaxable = 0;
  d.lines.forEach((l, idx) => {
    font(8);
    const nameLines = doc.splitTextToSize(l.name + (l.notes ? ` (${l.notes})` : ''), 42) as string[];
    const rh = Math.max(7.5, nameLines.length * 3.6 + 3.8);
    if (y + rh > 272) {
      doc.addPage();
      y = 18;
      drawHead();
    }
    if (idx % 2 === 1) {
      doc.setFillColor(252, 248, 250);
      doc.rect(M, y, 182, rh, 'F');
    }
    const taxable = Math.round(l.unitPaise * l.qty * f);
    sumTaxable += taxable;
    const gst = Math.round((taxable * l.gstRate) / 100);
    const half = gst / 2;
    const base = y + 4.8;
    font(8);
    doc.text(String(idx + 1), tx(0), base);
    doc.text(nameLines, tx(1), base);
    doc.text(OUTLET_INFO.sac, tx(2), base, { align: 'center' });
    doc.text(String(l.qty), tx(3), base, { align: 'right' });
    doc.text(n2(l.unitPaise), tx(4), base, { align: 'right' });
    doc.text(n2(taxable), tx(5), base, { align: 'right' });
    doc.text(`${l.gstRate}%`, tx(6), base, { align: 'right' });
    doc.text(n2(half), tx(7), base, { align: 'right' });
    doc.text(n2(half), tx(8), base, { align: 'right' });
    font(8, 'bold');
    doc.text(n2(taxable + gst), tx(9), base, { align: 'right' });
    y += rh;
  });
  doc.setDrawColor(230, 220, 225);
  doc.line(M, y, W - M, y);
  y += 6;

  if (y > 215) {
    doc.addPage();
    y = 20;
  }

  // Totals (right)
  const tL = 128;
  const tR = W - M;
  let ty = y;
  const tRow = (l: string, r: string, bold = false) => {
    font(9, bold ? 'bold' : 'normal');
    doc.text(l, tL, ty);
    doc.text(r, tR, ty, { align: 'right' });
    ty += 5.5;
  };
  tRow('Sub Total', n2(d.subtotalPaise));
  if (d.discountPaise > 0) tRow(`Discount${d.offerCode ? ` (${d.offerCode})` : ''} ${d.discountPercentage}%`, `-${n2(d.discountPaise)}`);
  tRow('Taxable Amount', n2(sumTaxable));
  tRow('CGST', n2(d.cgstPaise));
  tRow('SGST', n2(d.sgstPaise));
  if (d.roundingPaise) tRow('Round Off', n2(d.roundingPaise));
  doc.setFillColor(...BR);
  doc.roundedRect(tL - 3, ty - 4, tR - tL + 6, 10, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  font(11, 'bold');
  doc.text('Grand Total', tL, ty + 2.6);
  doc.text(rs(d.grandTotalPaise), tR, ty + 2.6, { align: 'right' });
  doc.setTextColor(...INK);
  ty += 12;

  // Left: words + payment + note
  let wy = y;
  font(8, 'bold');
  doc.setTextColor(...BR);
  doc.text('AMOUNT IN WORDS', M, wy);
  doc.setTextColor(...INK);
  font(8.5, 'italic');
  const words = doc.splitTextToSize(amountInWords(d.grandTotalPaise), 105) as string[];
  doc.text(words, M, wy + 5);
  wy += 5 + words.length * 4 + 4;

  font(8, 'bold');
  doc.setTextColor(...BR);
  doc.text('PAYMENT', M, wy);
  doc.setTextColor(...INK);
  font(8.5);
  wy += 5;
  if (d.payments?.length) {
    d.payments.forEach((p) => {
      doc.text(`${p.method.toUpperCase()}: ${rs(p.amountPaise)}${p.reference ? `  (Ref ${p.reference})` : ''}`, M, wy);
      wy += 4.5;
    });
    doc.setTextColor(22, 163, 74);
    font(8.5, 'bold');
    doc.text('PAID', M, wy);
    doc.setTextColor(...INK);
    wy += 6;
  } else {
    doc.setTextColor(225, 29, 72);
    font(8.5, 'bold');
    doc.text(`DUE — pay via UPI: ${OUTLET_INFO.upiVpa}`, M, wy);
    doc.setTextColor(...INK);
    wy += 6;
  }
  if (d.orderNote) {
    font(8, 'bold');
    doc.setTextColor(...BR);
    doc.text('NOTE', M, wy);
    doc.setTextColor(...INK);
    font(8.5);
    const nl = doc.splitTextToSize(d.orderNote, 105) as string[];
    doc.text(nl, M, wy + 5);
  }

  // Footer
  const fy = 278;
  doc.setDrawColor(230, 220, 225);
  doc.line(M, fy - 8, W - M, fy - 8);
  font(8);
  doc.setTextColor(110, 110, 120);
  doc.text('This is a computer generated invoice. Prices are inclusive of applicable discounts.', M, fy - 3);
  doc.text('Thank you for dining with us!  ·  Powered by CyberLim POS', M, fy + 2);
  doc.setTextColor(...INK);
  font(8.5, 'bold');
  doc.text(`For ${OUTLET_INFO.name}`, W - M, fy - 3, { align: 'right' });
  font(8);
  doc.text('Authorised Signatory', W - M, fy + 2, { align: 'right' });

  return doc;
}

/* ---------------- print / download ---------------- */
export function outputPdf(doc: JsPDF, filename: string, mode: PdfMode) {
  if (mode === 'download') {
    doc.save(filename);
    return;
  }
  const url = String(doc.output('bloburl'));
  if (mode === 'preview') {
    window.open(url, '_blank', 'noopener');
    return;
  }
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
  iframe.src = url;
  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.open(url, '_blank');
    }
    setTimeout(() => {
      iframe.remove();
      URL.revokeObjectURL(url);
    }, 60_000);
  };
  document.body.appendChild(iframe);
}

