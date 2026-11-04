import { KotTicket, PrinterPaperWidth } from '@bitechez/shared-types';
import { EscPosBuilder } from './escpos';

export interface KotPrintData {
  kot: KotTicket;
  paperWidth: PrinterPaperWidth;
}

export function buildKotEscPos(data: KotPrintData): Uint8Array {
  const width = data.paperWidth === '58mm' ? 32 : 48;
  const esc = new EscPosBuilder();

  // Header
  esc.align('center')
     .bold(true)
     .doubleSize(true)
     .line(`KOT #${data.kot.kotNumber}`)
     .doubleSize(false)
     .line(`Station: ${data.kot.station}`)
     .divider(width)
     .align('left');

  if (data.kot.tableName) {
    esc.bold(true)
       .twoColumn(`Table: ${data.kot.tableName}`, `Type: ${data.kot.orderType.toUpperCase()}`, width)
       .bold(false);
  } else {
    esc.twoColumn(`Order: ${data.kot.orderNumber}`, `Type: ${data.kot.orderType.toUpperCase()}`, width);
  }

  esc.twoColumn(`Time: ${new Date(data.kot.createdAt).toLocaleTimeString('en-IN')}`, '', width)
     .divider(width)
     .twoColumn('QTY  ITEM', '', width)
     .divider(width);

  // KOT Items
  for (const item of data.kot.items) {
    const itemName = item.variantName ? `${item.itemName} (${item.variantName})` : item.itemName;
    esc.bold(true)
       .line(`[${item.quantity}x]  ${itemName}`)
       .bold(false);

    if (item.notes) {
      esc.line(`   >> Note: ${item.notes}`);
    }
  }

  esc.divider(width)
     .align('center')
     .line('*** END OF KOT ***')
     .cut();

  return esc.toUint8Array();
}
