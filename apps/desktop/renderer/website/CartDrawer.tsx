import React, { useState } from 'react';
import { X, Plus, Minus, Armchair, Lock, ArrowRight } from 'lucide-react';
import { CartItem } from './OrdersView';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  tableNumber: string;
  onAddToCart: (product: CartItem['product']) => void;
  onRemoveFromCart: (productId: string) => void;
  onPlaceOrder: (notes: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  onClose,
  cart,
  tableNumber,
  onAddToCart,
  onRemoveFromCart,
  onPlaceOrder,
}) => {
  if (!open) return null;

  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.05;
  const grandTotal = subtotal + tax;

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onPlaceOrder(orderNotes);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-md max-h-[85dvh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-black text-slate-900 leading-tight">Your Order Bag</h3>
            <p className="text-xs font-bold text-[#00C060] flex items-center gap-1 mt-0.5">
              <Armchair className="w-3.5 h-3.5" />
              <span>Dine-In • Table {tableNumber}</span>
              <Lock className="w-3 h-3 text-slate-400" />
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-xs font-bold">Your bag is currently empty.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 p-1 flex items-center justify-center shrink-0 border border-slate-100">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-900 truncate">{item.product.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400">{item.product.subtitle}</span>
                    <p className="text-xs font-black text-slate-900 mt-0.5">
                      ₹{(item.product.price * item.quantity).toFixed(0)}
                    </p>
                  </div>
                </div>

                {/* Quantity Controller */}
                <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-2 py-1 text-xs font-black text-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => onRemoveFromCart(item.product.id)}
                    className="hover:text-rose-500"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-4 text-center">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => onAddToCart(item.product)}
                    className="hover:text-[#00C060]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}

          {cart.length > 0 && (
            <div className="pt-3">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Special Kitchen Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Less spicy, extra sauce, water with ice..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C060]"
              />
            </div>
          )}
        </div>

        {/* Footer Billing & Confirm */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-2.5 shrink-0">
            <div className="space-y-1 text-xs font-bold text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST / Tax (5%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Payable</span>
                <span className="text-[#00C060]">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirm}
              className="w-full py-3 rounded-2xl bg-[#00C060] hover:bg-[#00A850] text-white text-xs font-black shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Sending to Kitchen KOT...' : 'Send Order to Kitchen'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
