import { describe, it, expect } from 'vitest';
import { calculateCart } from '../src/cart';
import { formatINR, rupeesToPaise } from '../src/currency';

describe('Bitechez Business Logic - Cart & Financial Calculations', () => {
  it('converts rupees to paise and formats back safely', () => {
    const paise = rupeesToPaise(249.50);
    expect(paise).toBe(24950);
    expect(formatINR(paise)).toBe('₹249.50');
  });

  it('calculates 5% GST on food item accurately without floating point drift', () => {
    // 2 x Paneer Butter Masala @ ₹250 (25000 paise each) = 50000 paise
    const result = calculateCart({
      items: [
        {
          unitPricePaise: 25000,
          quantity: 2,
          gstRate: 5,
        },
      ],
      applyRounding: true,
    });

    expect(result.subtotalPaise).toBe(50000); // ₹500
    expect(result.discountPaise).toBe(0);
    expect(result.totalGstPaise).toBe(2500);  // 5% of ₹500 = ₹25.00
    expect(result.cgstPaise).toBe(1250);      // 2.5% = ₹12.50
    expect(result.sgstPaise).toBe(1250);      // 2.5% = ₹12.50
    expect(result.grandTotalPaise).toBe(52500); // ₹525.00
  });

  it('applies flat discount and prorates tax correctly', () => {
    // 1 item @ ₹1000 with 10% discount
    const result = calculateCart({
      items: [
        {
          unitPricePaise: 100000,
          quantity: 1,
          gstRate: 5,
        },
      ],
      discountPercentage: 10,
    });

    expect(result.subtotalPaise).toBe(100000); // ₹1000
    expect(result.discountPaise).toBe(10000);  // ₹100 discount
    expect(result.taxablePaise).toBe(90000);   // ₹900 taxable
    expect(result.totalGstPaise).toBe(4500);   // 5% on ₹900 = ₹45
    expect(result.grandTotalPaise).toBe(94500); // ₹945.00
  });
});

