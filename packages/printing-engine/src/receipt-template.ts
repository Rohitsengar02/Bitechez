import { Order, PrinterPaperWidth } from '@bitechez/shared-types';
import { formatINR } from '@bitechez/business-logic';
import { EscPosBuilder } from './escpos';

export interface ReceiptData {
  restaurantName: string;
  address: string;
  phone: string;
  gstin?: string;
  fssaiLicense?: string;
  order: Order;
  paperWidth: PrinterPaperWidth;
  cashierName?: string;
  footerMessage?: string;
}

export function buildReceiptEscPos(data: ReceiptData): Uint8Array {
  const width = data.paperWidth === '58mm' ? 32 : 48;
  const esc = new EscPosBuilder();

  // Header
  esc.align('center')
     .doubleSize(true)
     .bold(true)
     .line(data.restaurantName)
     .doubleSize(false)
     .bold(false)
     .line(data.address)
     .line(`Tel: ${data.phone}`);

  if (data.gstin) esc.line(`GSTIN: ${data.gstin}`);
  if (data.fssaiLicense) esc.line(`FSSAI: ${data.fssaiLicense}`);

  esc.divider(width)
     .align('left')
     .twoColumn(`Order: ${data.order.orderNumber}`, `Type: ${data.order.orderType.toUpperCase()}`, width);

  if (data.order.tableName) {
    esc.twoColumn(`Table: ${data.order.tableName}`, `Guests: ${data.order.guestCount}`, width);
  }

  esc.twoColumn(`Date: ${new Date(data.order.createdAt).toLocaleDateString('en-IN')}`, 
                `Time: ${new Date(data.order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, width);

  esc.divider(width)
     .twoColumn('ITEM', 'QTY   AMOUNT', width)
     .divider(width);

  // Items
  for (const item of data.order.items) {
    const itemName = item.variantName ? `${item.name} (${item.variantName})` : item.name;
    const amountStr = formatINR(item.totalPricePaise, false);
    const rightCol = `${item.quantity.toString().padStart(3, ' ')}   ${amountStr}`;

    esc.twoColumn(itemName.substring(0, width - rightCol.length - 1), rightCol, width);
    if (item.notes) {
      esc.line(` * ${item.notes}`);
    }
  }

  esc.divider(width);

  // Totals
  esc.twoColumn('Subtotal', formatINR(data.order.subtotalPaise), width);
  if (data.order.discountPaise > 0) {
    esc.twoColumn('Discount', `-${formatINR(data.order.discountPaise)}`, width);
  }
  if (data.order.cgstPaise > 0) {
    esc.twoColumn('CGST (2.5%)', formatINR(data.order.cgstPaise), width);
    esc.twoColumn('SGST (2.5%)', formatINR(data.order.sgstPaise), width);
  }
  if (data.order.roundingPaise !== 0) {
    esc.twoColumn('Round Off', `${data.order.roundingPaise > 0 ? '+' : ''}${formatINR(data.order.roundingPaise)}`, width);
  }

  esc.divider(width)
     .bold(true)
     .twoColumn('GRAND TOTAL', formatINR(data.order.grandTotalPaise), width)
     .bold(false)
     .divider(width);

  // Footer
  esc.align('center')
     .line(data.footerMessage || 'Thank You! Visit Again!')
     .line('Powered by Bitechez POS')
     .cut();

  return esc.toUint8Array();
}
