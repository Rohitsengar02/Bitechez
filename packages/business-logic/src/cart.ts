import { Paise } from '@bitechez/shared-types';

export interface CartCalculationInput {
  items: Array<{
    unitPricePaise: Paise;
    quantity: number;
    gstRate: number; // e.g. 5, 12, 18
    addonsTotalPaise?: Paise;
  }>;
  discountPercentage?: number; // 0 to 100
  flatDiscountPaise?: Paise;
  applyRounding?: boolean;
}

export interface CartCalculationResult {
  subtotalPaise: Paise;
  discountPaise: Paise;
  taxablePaise: Paise;
  cgstPaise: Paise;
  sgstPaise: Paise;
  totalGstPaise: Paise;
  roundingPaise: Paise;
  grandTotalPaise: Paise;
  gstBreakdown: Record<number, { taxablePaise: Paise; cgstPaise: Paise; sgstPaise: Paise; totalPaise: Paise }>;
}

export function calculateCart(input: CartCalculationInput): CartCalculationResult {
  const { items, discountPercentage = 0, flatDiscountPaise = 0, applyRounding = true } = input;

  let rawSubtotalPaise: Paise = 0;
  const gstBreakdown: CartCalculationResult['gstBreakdown'] = {};

  // 1. Calculate raw subtotal per item
  for (const item of items) {
    const itemUnit = item.unitPricePaise + (item.addonsTotalPaise || 0);
    const itemTotal = itemUnit * item.quantity;
    rawSubtotalPaise += itemTotal;

    const rate = item.gstRate || 0;
    if (!gstBreakdown[rate]) {
      gstBreakdown[rate] = { taxablePaise: 0, cgstPaise: 0, sgstPaise: 0, totalPaise: 0 };
    }
    gstBreakdown[rate].taxablePaise += itemTotal;
  }

  // 2. Compute discount
  let totalDiscountPaise: Paise = 0;
  if (discountPercentage > 0) {
    totalDiscountPaise = Math.round((rawSubtotalPaise * discountPercentage) / 100);
  } else if (flatDiscountPaise > 0) {
    totalDiscountPaise = Math.min(flatDiscountPaise, rawSubtotalPaise);
  }

  const taxablePaise = Math.max(0, rawSubtotalPaise - totalDiscountPaise);

  // Pro-rate discount across GST slabs if discount exists
  const discountRatio = rawSubtotalPaise > 0 ? taxablePaise / rawSubtotalPaise : 1;

  let totalCgstPaise: Paise = 0;
  let totalSgstPaise: Paise = 0;

  for (const [rateStr, slab] of Object.entries(gstBreakdown)) {
    const rate = Number(rateStr);
    const adjustedTaxable = Math.round(slab.taxablePaise * discountRatio);
    slab.taxablePaise = adjustedTaxable;

    // Split equally into CGST & SGST (e.g. 5% GST = 2.5% CGST + 2.5% SGST)
    const totalTaxForSlab = Math.round((adjustedTaxable * rate) / 100);
    const halfTax = Math.floor(totalTaxForSlab / 2);
    const remainder = totalTaxForSlab - halfTax * 2;

    slab.cgstPaise = halfTax + remainder;
    slab.sgstPaise = halfTax;
    slab.totalPaise = slab.cgstPaise + slab.sgstPaise;

    totalCgstPaise += slab.cgstPaise;
    totalSgstPaise += slab.sgstPaise;
  }

  const totalGstPaise = totalCgstPaise + totalSgstPaise;
  const unroundedTotalPaise = taxablePaise + totalGstPaise;

  // 3. Indian 50-paise / Rupee rounding
  let roundingPaise: Paise = 0;
  let grandTotalPaise = unroundedTotalPaise;

  if (applyRounding) {
    // Round to nearest integer Rupee (100 paise)
    const roundedToRupee = Math.round(unroundedTotalPaise / 100) * 100;
    roundingPaise = roundedToRupee - unroundedTotalPaise;
    grandTotalPaise = roundedToRupee;
  }

  return {
    subtotalPaise: rawSubtotalPaise,
    discountPaise: totalDiscountPaise,
    taxablePaise,
    cgstPaise: totalCgstPaise,
    sgstPaise: totalSgstPaise,
    totalGstPaise,
    roundingPaise,
    grandTotalPaise,
    gstBreakdown,
  };
}
