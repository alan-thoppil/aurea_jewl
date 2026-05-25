"use client";

import React, { useState } from "react";
import { X, ShoppingBag, Plus, Minus, Trash2, ShieldCheck, Sparkles } from "lucide-react";
import { useAppState } from "@/context/StateContext";
import GoldButton from "@/components/ui/GoldButton";

export default function CartDrawer({ isOpen, onClose }) {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    calculateProductPrice,
    checkoutCart
  } = useAppState();

  const [checkoutStep, setCheckoutStep] = useState("cart"); // cart, checkout, paying, success
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    phone: "",
    birthday: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [placedOrderInfo, setPlacedOrderInfo] = useState(null);

  if (!isOpen) return null;

  // Compute total prices
  let totalMetal = 0;
  let totalMaking = 0;
  let totalSubtotal = 0;
  let totalGst = 0;
  let totalGrand = 0;

  cart.forEach((item) => {
    const pricing = calculateProductPrice(item);
    totalMetal += pricing.metalValue * item.quantity;
    totalMaking += pricing.makingCharges * item.quantity;
    totalSubtotal += pricing.subtotal * item.quantity;
    totalGst += pricing.gst * item.quantity;
    totalGrand += pricing.total * item.quantity;
  });

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!customerDetails.name || !customerDetails.email) {
      alert("Please provide name and email for the invoice.");
      return;
    }

    setCheckoutStep("paying");

    // Simulate Razorpay Gateway Loading
    setTimeout(() => {
      const res = checkoutCart(customerDetails, paymentMethod);
      if (res.success) {
        setPlacedOrderInfo(res);
        setCheckoutStep("success");
      } else {
        alert("Transaction declined. Check inventory limits.");
        setCheckoutStep("cart");
      }
    }, 2000);
  };

  const handleCloseReset = () => {
    setCheckoutStep("cart");
    setCustomerDetails({ name: "", email: "", phone: "", birthday: "" });
    setPlacedOrderInfo(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Outside click detector */}
      <div className="absolute inset-0 -z-10" onClick={handleCloseReset} />

      <div className="w-full max-w-md h-full bg-[#0B0B0B] border-l border-gold-500/25 flex flex-col shadow-[0_0_50px_rgba(212,175,55,0.15)]">
        
        {/* Header */}
        <div className="p-6 border-b border-gold-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-gold-500" />
            <h3 className="text-xl font-serif tracking-widest uppercase text-white">Your Atelier Cart</h3>
          </div>
          <button
            onClick={handleCloseReset}
            className="p-1 text-gold-500 hover:text-gold-300 transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar">
          {checkoutStep === "cart" && (
            <>
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-white/50">
                  <ShoppingBag size={48} strokeWidth={1} className="text-gold-500/40" />
                  <p className="font-serif tracking-wide text-lg text-white">Your cart is empty.</p>
                  <p className="text-xs">Explore our featured collections to add fine jewellery.</p>
                  <GoldButton onClick={handleCloseReset} className="mt-4 text-xs py-2 px-4">
                    Continue Browsing
                  </GoldButton>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {cart.map((item) => {
                    const priceBreakdown = calculateProductPrice(item);
                    return (
                      <div
                        key={item.sku}
                        className="flex gap-4 p-4 bg-zinc-950 border border-white/5 relative group"
                      >
                        <div className="w-20 h-20 bg-zinc-900 border border-gold-500/10 overflow-hidden shrink-0">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-sm font-serif tracking-wide text-white font-medium line-clamp-1">
                              {item.name}
                            </h4>
                            <div className="text-[10px] text-white/40 mt-0.5">
                              {item.purity} {item.metal} • {item.weight.toFixed(2)}g
                            </div>
                          </div>
                          
                          {/* Price and Counter */}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gold-300 font-medium font-serif">
                              ₹{priceBreakdown.total.toLocaleString('en-IN')}
                            </span>
                            
                            <div className="flex items-center border border-white/10 bg-black">
                              <button
                                onClick={() => updateCartQuantity(item.sku, item.quantity - 1)}
                                className="px-2 py-0.5 text-white/60 hover:text-gold-300 text-xs cursor-pointer"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="px-3 py-0.5 text-xs font-semibold text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.sku, item.quantity + 1)}
                                className="px-2 py-0.5 text-white/60 hover:text-gold-300 text-xs cursor-pointer"
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => removeFromCart(item.sku)}
                          className="absolute top-2 right-2 text-white/30 hover:text-red-400 p-1 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {checkoutStep === "checkout" && (
            <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-5 text-left">
              <h4 className="text-md font-serif tracking-widest uppercase text-gold-500 border-b border-gold-500/10 pb-2">
                Luxury Billing Details
              </h4>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs tracking-wider uppercase text-white/60">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={customerDetails.name}
                  onChange={handleDetailsChange}
                  className="w-full bg-zinc-950 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
                  placeholder="Devon Lane"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs tracking-wider uppercase text-white/60">Email Address *</label>
                <input
                  type="email"
                  required
                  name="email"
                  value={customerDetails.email}
                  onChange={handleDetailsChange}
                  className="w-full bg-zinc-950 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
                  placeholder="devon@luxury.com"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs tracking-wider uppercase text-white/60">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={customerDetails.phone}
                  onChange={handleDetailsChange}
                  className="w-full bg-zinc-950 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs tracking-wider uppercase text-white/60">Date of Birth (CRM Birthday Gifting)</label>
                <input
                  type="date"
                  name="birthday"
                  value={customerDetails.birthday}
                  onChange={handleDetailsChange}
                  className="w-full bg-zinc-950 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              {/* Payment selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs tracking-wider uppercase text-white/60">Select Luxury Payment Method</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {["UPI", "Card", "Net Banking", "EMI"].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-3 border uppercase text-center transition-all ${
                        paymentMethod === method
                          ? "border-gold-500 bg-gold-500/10 text-gold-300 font-semibold"
                          : "border-white/10 bg-zinc-950 text-white/60 hover:text-white"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {checkoutStep === "paying" && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-6">
              <div className="w-16 h-16 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
              <div>
                <h4 className="text-lg font-serif tracking-widest uppercase text-white">Razorpay Secure Sandbox</h4>
                <p className="text-xs text-white/50 mt-2">Connecting to premium banking gateways...</p>
                <p className="text-[10px] text-gold-300/80 tracking-widest mt-4 uppercase animate-pulse">
                  Simulating Secure UPI / Card Handshake
                </p>
              </div>
            </div>
          )}

          {checkoutStep === "success" && placedOrderInfo && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-6 animate-scaleIn">
              <div className="w-16 h-16 bg-gold-500/10 border border-gold-500 rounded-full flex items-center justify-center text-gold-500">
                <Sparkles size={28} className="animate-pulse" />
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-2xl font-serif tracking-widest uppercase text-gold-300">AURA Order Secured</h4>
                <p className="text-xs text-white/70">
                  Payment of <span className="font-semibold text-gold-300">₹{placedOrderInfo.total.toLocaleString('en-IN')}</span> has been confirmed.
                </p>
                <div className="mt-6 p-4 bg-zinc-950 border border-white/5 rounded-none text-left flex flex-col gap-2 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-2 text-[10px] uppercase text-white/40 tracking-wider">
                    <span>Invoice Details</span>
                    <span>SUCCESS</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-white/60">Invoice No:</span>
                    <span className="font-medium text-white">{placedOrderInfo.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Customer:</span>
                    <span className="font-medium text-white">{customerDetails.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Method:</span>
                    <span className="font-medium text-white">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Status:</span>
                    <span className="font-semibold text-green-400">Order Locked</span>
                  </div>
                </div>
                <p className="text-[10px] text-white/40 mt-6">
                  Stock has been deducted and general ledger transaction created.
                </p>
              </div>
              <GoldButton onClick={handleCloseReset} className="w-full mt-4 py-3 text-xs">
                Receive Ledger Invoice
              </GoldButton>
            </div>
          )}
        </div>

        {/* Footer Billing Breakdown */}
        {cart.length > 0 && checkoutStep !== "paying" && checkoutStep !== "success" && (
          <div className="p-6 border-t border-gold-500/15 bg-zinc-950 flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-2 text-white/70">
              <div className="flex justify-between">
                <span>Metal Value Base</span>
                <span>₹{totalMetal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Weight-Based Making Charges</span>
                <span>₹{totalMaking.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>3% GST (HSN 7113)</span>
                <span>₹{totalGst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-base font-serif font-bold text-gold-300 tracking-wider pt-2">
                <span>ORDER TOTAL</span>
                <span>₹{totalGrand.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {checkoutStep === "cart" ? (
              <GoldButton
                onClick={() => setCheckoutStep("checkout")}
                className="w-full py-3.5 text-xs text-black"
              >
                PROCEED TO VALUATION
              </GoldButton>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setCheckoutStep("cart")}
                  className="w-1/3 py-3 border border-white/10 text-white/60 hover:text-white uppercase font-medium tracking-wider bg-black"
                >
                  Back
                </button>
                <button
                  onClick={handleCheckoutSubmit}
                  className="w-2/3 py-3 shimmer-btn text-black uppercase font-bold tracking-widest hover:scale-[1.01] transition-all cursor-pointer"
                >
                  Razorpay PAY NOW
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/40 mt-1 uppercase tracking-widest">
              <ShieldCheck size={12} className="text-gold-500" />
              BIS Hallmarked & Insured Delivery Assured
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
