import { Paise } from '@bitechez/shared-types';

/**
 * Format integer paise into Indian Rupee currency string
 * e.g. 15050 paise => "₹150.50"
 */
export function formatINR(paise: Paise, showSymbol = true): string {
  const rupees = paise / 100;
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);

  return showSymbol ? `₹${formatted}` : formatted;
}

/**
 * Convert rupee decimal to integer paise safely without floating point inaccuracies
 * e.g. 149.99 => 14999
 */
export function rupeesToPaise(rupees: number | string): Paise {
  const num = typeof rupees === 'string' ? parseFloat(rupees) : rupees;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Convert paise back to rupees float for display if needed
 */
export function paiseToRupees(paise: Paise): number {
  return paise / 100;
}
