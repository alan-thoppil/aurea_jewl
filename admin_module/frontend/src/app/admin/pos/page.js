"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppState } from "@/context/StateContext";
import GlowCard from "@/components/ui/GlowCard";
import GoldButton from "@/components/ui/GoldButton";
import Modal from "@/components/ui/Modal";
import { Search, Plus, Minus, Trash2, Barcode, User, FileText, CheckCircle, Printer } from "lucide-react";

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  birthday: z.string().optional(),
});

export default function POSPage() {
  const {
    products,
    customers,
    calculateProductPrice,
    processPOSSale,
    addCustomer
  } = useAppState();

  const [skuInput, setSkuInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [billedItems, setBilledItems] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  // Modal controls
  const [custModalOpen, setCustModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);

  const {
    register: registerCustomer,
    handleSubmit: handleCustomerSubmit,
    reset: resetCustomerForm,
    formState: { errors: customerErrors },
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: "", email: "", phone: "", birthday: "" }
  });

  // Quick SKU Scanner Enter trigger
  const handleSkuSubmit = (e) => {
    e.preventDefault();
    if (!skuInput) return;
    const prod = products.find((p) => p.sku.toLowerCase() === skuInput.trim().toLowerCase());
    if (prod) {
      addItemToBill(prod);
      setSkuInput("");
    } else {
      alert(`SKU "${skuInput}" not found in active inventory.`);
    }
  };

  const addItemToBill = (product) => {
    if (product.stock_count <= 0) {
      alert("This item is currently sold out in inventory.");
      return;
    }
    setBilledItems((prev) => {
      const existing = prev.find((item) => item.sku === product.sku);
      if (existing) {
        if (existing.quantity >= product.stock_count) {
          alert(`Cannot exceed active stock level of ${product.stock_count} units.`);
          return prev;
        }
        return prev.map((item) =>
          item.sku === product.sku ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateBilledQty = (sku, qty, stock) => {
    if (qty <= 0) {
      setBilledItems((prev) => prev.filter((item) => item.sku !== sku));
      return;
    }
    if (qty > stock) {
      alert(`Cannot exceed inventory availability of ${stock} units.`);
      return;
    }
    setBilledItems((prev) =>
      prev.map((item) => (item.sku === sku ? { ...item, quantity: qty } : item))
    );
  };

  const removeBilledItem = (sku) => {
    setBilledItems((prev) => prev.filter((item) => item.sku !== sku));
  };

  // Quick Customer Enrollment inside POS
  const onValidCustomerSubmit = (data) => {
    addCustomer(data);
    setTimeout(() => {
      setCustModalOpen(false);
      resetCustomerForm();
    }, 500);
  };

  // Perform Billing mathematics
  let rawSubtotal = 0;
  let rawMaking = 0;

  billedItems.forEach((item) => {
    const prices = calculateProductPrice(item);
    rawSubtotal += prices.metalValue * item.quantity;
    rawMaking += prices.makingCharges * item.quantity;
  });

  const combinedSub = rawSubtotal + rawMaking;
  const discountVal = combinedSub * (discountPercent / 100);
  const activeSub = combinedSub - discountVal;
  const gst = activeSub * 0.03;
  const grandTotal = activeSub + gst;

  // Complete Billing Checkout
  const handleFinaliseSale = () => {
    if (billedItems.length === 0) {
      alert("Billing cart is empty.");
      return;
    }

    const res = processPOSSale(
      billedItems,
      selectedCustomerId || null,
      paymentMethod,
      discountPercent
    );

    if (res.success) {
      const activeCust = customers.find((c) => c.id === selectedCustomerId);
      setLastInvoice({
        invoiceNumber: res.invoiceNumber,
        items: [...billedItems],
        subtotal: rawSubtotal,
        makingCharges: rawMaking,
        discount: discountVal,
        gst,
        total: res.total,
        customerName: activeCust ? activeCust.name : "Walk-in Customer",
        customerPhone: activeCust ? activeCust.phone : "N/A",
        paymentMethod,
        date: new Date().toLocaleDateString()
      });
      
      setBilledItems([]);
      setSelectedCustomerId("");
      setDiscountPercent(0);
      setPaymentMethod("Cash");
      setInvoiceModalOpen(true);
    } else {
      alert(`POS Error: ${res.error}`);
    }
  };

  // Filter products by lookup queries
  const searchedProducts = searchQuery
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products.slice(0, 4);

  return (
    <div className="flex flex-col gap-6 text-left animate-fadeIn">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-serif tracking-widest uppercase text-white">POS Terminal</h1>
        <p className="text-xs text-white/50 tracking-wider uppercase mt-1">Atelier checkout and customer billing desk</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left POS Panel: SKU Scanner, Search, and Billing table */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* SKU and Live Search widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* SKU Scanner Barcode simulator */}
            <form onSubmit={handleSkuSubmit} className="glass-panel p-4 flex flex-col gap-3 bg-zinc-950/60">
              <label className="text-[10px] tracking-widest uppercase text-gold-500 font-semibold flex items-center gap-1.5">
                <Barcode size={13} />
                SKU Scanner Input
              </label>
              <div className="flex w-full bg-black border border-white/10">
                <input
                  type="text"
                  value={skuInput}
                  onChange={(e) => setSkuInput(e.target.value)}
                  placeholder="Type SKU & Enter (e.g. AU-RNG-001)"
                  className="flex-1 bg-transparent px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-0"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-300 text-black text-[10px] font-bold tracking-widest uppercase cursor-pointer"
                >
                  Enter
                </button>
              </div>
            </form>

            {/* Live Search Drawer */}
            <div className="glass-panel p-4 flex flex-col gap-3 bg-zinc-950/60">
              <label className="text-[10px] tracking-widest uppercase text-gold-500 font-semibold flex items-center gap-1.5">
                <Search size={13} />
                Lookup Catalogues
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, SKU, metal..."
                className="w-full bg-black border border-white/10 px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-0 focus:border-gold-500"
              />
            </div>

          </div>

          {/* Search Catalogue results */}
          {searchQuery && (
            <div className="glass-panel p-4 bg-zinc-950 border border-gold-500/20 flex flex-col gap-2.5 animate-fadeIn">
              <span className="text-[9px] text-white/40 uppercase tracking-widest">Search outcomes ({searchedProducts.length})</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {searchedProducts.map((p) => (
                  <div
                    key={p.sku}
                    onClick={() => addItemToBill(p)}
                    className="p-2.5 bg-black border border-white/5 hover:border-gold-500/30 cursor-pointer flex flex-col gap-1 text-xs"
                  >
                    <span className="font-serif text-white font-medium truncate">{p.name}</span>
                    <div className="flex justify-between text-[9px] text-white/40">
                      <span>{p.sku}</span>
                      <span className="text-gold-500">Qty: {p.stock_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Billing queue table */}
          <div className="glass-panel p-6 bg-zinc-950/40">
            <h3 className="text-sm font-serif tracking-widest uppercase text-gold-500 font-semibold border-b border-white/5 pb-3 mb-4">
              Billing Ledger Queue
            </h3>

            {billedItems.length === 0 ? (
              <div className="py-16 text-center text-xs text-white/30 uppercase tracking-widest flex flex-col items-center gap-3">
                <Barcode size={36} strokeWidth={1} className="text-gold-500/40" />
                <span>Queue is empty. Scan SKU or lookup catalogues to initialize.</span>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-xs text-left text-white/70 border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] text-white/40 uppercase tracking-wider">
                      <th className="py-2.5">SKU / Piece Details</th>
                      <th className="py-2.5">Metal Rate Rate/g</th>
                      <th className="py-2.5 text-center">Qty</th>
                      <th className="py-2.5 text-right">Computed Total</th>
                      <th className="py-2.5 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {billedItems.map((item) => {
                      const detailPrice = calculateProductPrice(item);
                      return (
                        <tr key={item.sku} className="border-b border-white/5 hover:bg-white/1">
                          <td className="py-3.5 pr-3 text-left">
                            <div className="font-serif text-white font-semibold">{item.name}</div>
                            <div className="text-[9px] text-white/40 mt-0.5 uppercase tracking-wider">
                              {item.sku} • {item.purity} {item.metal} • {item.weight.toFixed(2)}g
                            </div>
                          </td>
                          <td className="py-3.5 font-serif text-white/80">
                            ₹{detailPrice.metalValue.toLocaleString()}
                          </td>
                          <td className="py-3.5 text-center">
                            <div className="inline-flex items-center border border-white/10 bg-black text-[10px]">
                              <button
                                onClick={() => updateBilledQty(item.sku, item.quantity - 1, item.stock_count)}
                                className="px-1.5 py-0.5 text-white/50 hover:text-gold-300 cursor-pointer"
                              >
                                <Minus size={8} />
                              </button>
                              <span className="px-2 py-0.5 text-white font-bold">{item.quantity}</span>
                              <button
                                onClick={() => updateBilledQty(item.sku, item.quantity + 1, item.stock_count)}
                                className="px-1.5 py-0.5 text-white/50 hover:text-gold-300 cursor-pointer"
                              >
                                <Plus size={8} />
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 text-right font-serif text-gold-300 font-bold">
                            ₹{(detailPrice.total * item.quantity).toLocaleString()}
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => removeBilledItem(item.sku)}
                              className="text-white/20 hover:text-red-400 p-1 cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right POS Sidebar: Customer, Discounts, Totals, Payments */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Customer CRM Connector */}
          <div className="glass-panel p-6 bg-zinc-950/60 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h4 className="text-[10px] tracking-widest uppercase text-gold-500 font-semibold flex items-center gap-1.5">
                <User size={13} />
                CRM Customer Link
              </h4>
              <button
                onClick={() => setCustModalOpen(true)}
                className="text-[9px] text-gold-500 hover:text-gold-300 uppercase tracking-widest font-bold cursor-pointer"
              >
                + Quick Add
              </button>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-black border border-white/10 px-3 py-2.5 text-white/80 focus:outline-none focus:border-gold-500"
              >
                <option value="">Walk-in Customer (Guest)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone || c.email})
                  </option>
                ))}
              </select>

              {selectedCustomerId && (
                <div className="p-3 bg-gold-500/5 border border-gold-500/20 text-[10px] uppercase text-white/50 tracking-wider flex flex-col gap-1.5 animate-fadeIn">
                  <div className="flex justify-between text-gold-300 font-semibold">
                    <span>Active Profile:</span>
                    <span>Points: {customers.find((c) => c.id === selectedCustomerId)?.loyalty_points}</span>
                  </div>
                  <div>Scheme Link: {customers.find((c) => c.id === selectedCustomerId)?.gold_scheme_status}</div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing calculations details */}
          <div className="glass-panel p-6 bg-zinc-950/60 flex flex-col gap-5 text-xs text-white/70">
            <h4 className="text-[10px] tracking-widest uppercase text-gold-500 font-semibold border-b border-white/5 pb-2">
              Tax invoice summary
            </h4>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <span>Metal Base Subtotal</span>
                <span className="font-serif">₹{rawSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Weight-Based Making Charges</span>
                <span className="font-serif">₹{rawMaking.toLocaleString()}</span>
              </div>
              
              {/* Discount selection slider */}
              <div className="flex flex-col gap-2 border-t border-b border-white/5 py-3">
                <div className="flex justify-between font-medium">
                  <span>Manager Discount</span>
                  <span className="text-gold-300 font-bold">{discountPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseInt(e.target.value))}
                  className="w-full accent-gold-500 h-1 bg-black rounded-lg cursor-pointer"
                />
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Discount Value</span>
                  <span className="font-serif">-₹{discountVal.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>3% GST (HSN 7113)</span>
                <span className="font-serif">₹{gst.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-base font-serif font-bold text-gold-300 tracking-wider pt-2 border-t border-gold-500/15">
                <span>GRAND BILL TOTAL</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Method and Finalize trigger */}
          <div className="glass-panel p-6 bg-zinc-950/60 flex flex-col gap-4">
            <h4 className="text-[10px] tracking-widest uppercase text-gold-500 font-semibold border-b border-white/5 pb-2">
              Payment parameters
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {["Cash", "UPI", "Card", "EMI"].map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2 border uppercase text-center transition-all cursor-pointer ${
                    paymentMethod === m
                      ? "border-gold-500 bg-gold-500/10 text-gold-300 font-semibold"
                      : "border-white/10 bg-black text-white/50 hover:text-white"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <GoldButton
              onClick={handleFinaliseSale}
              disabled={billedItems.length === 0}
              className="w-full py-4 text-xs font-bold gap-2 mt-2"
            >
              <CheckCircle size={14} />
              Lock Transaction & Invoice
            </GoldButton>
          </div>

        </div>

      </div>

      {/* QUICK CUSTOMER ADD MODAL */}
      <Modal
        isOpen={custModalOpen}
        onClose={() => setCustModalOpen(false)}
        title="Quick CRM Customer Enrollment"
      >
        <form onSubmit={handleCustomerSubmit(onValidCustomerSubmit)} className="flex flex-col gap-4 text-xs text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase text-white/50 tracking-wider">Full Name *</label>
            <input
              type="text"
              {...registerCustomer("name")}
              className={`w-full bg-black border ${customerErrors.name ? 'border-red-500' : 'border-white/10'} px-3 py-2.5 text-white focus:outline-none focus:border-gold-500`}
              placeholder="Devon Lane"
            />
            {customerErrors.name && <span className="text-red-400 text-[9px] uppercase">{customerErrors.name.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase text-white/50 tracking-wider">Email Address *</label>
            <input
              type="email"
              {...registerCustomer("email")}
              className={`w-full bg-black border ${customerErrors.email ? 'border-red-500' : 'border-white/10'} px-3 py-2.5 text-white focus:outline-none focus:border-gold-500`}
              placeholder="devon@luxury.com"
            />
            {customerErrors.email && <span className="text-red-400 text-[9px] uppercase">{customerErrors.email.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase text-white/50 tracking-wider">Phone Number</label>
            <input
              type="text"
              {...registerCustomer("phone")}
              className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500"
              placeholder="+91 98765 43210"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase text-white/50 tracking-wider">Date of Birth</label>
            <input
              type="date"
              {...registerCustomer("birthday")}
              className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500"
            />
          </div>
          <GoldButton type="submit" className="w-full py-3.5 text-xs font-bold mt-2">
            Enroll Customer Profile
          </GoldButton>
        </form>
      </Modal>

      {/* PRINT INVOICE MODAL */}
      <Modal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        title="Secure ERP Tax Invoice"
        className="max-w-xl"
      >
        {lastInvoice && (
          <div className="flex flex-col gap-6 text-left text-xs bg-zinc-950 p-6 border border-white/5 relative">
            
            {/* Stamp */}
            <div className="absolute top-4 right-4 border-2 border-green-500/40 text-green-400 font-bold uppercase tracking-widest text-[9px] px-3 py-1 rotate-6 select-none bg-zinc-950">
              POS TRANSACTION SECURED
            </div>

            {/* Header info */}
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div className="flex flex-col gap-1">
                <span className="text-base font-serif font-bold text-white tracking-widest uppercase">AUREA ATELIERS</span>
                <span className="text-[9px] text-white/30 uppercase tracking-widest">GK-1, New Delhi • Tel: 011-49876543</span>
                <span className="text-[9px] text-gold-500/70 font-semibold uppercase tracking-wider">GSTIN: 27AUREA7113J1Z0 • HSN: 7113</span>
              </div>
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="font-serif font-bold text-white uppercase text-xs">Tax Invoice</span>
                <span className="text-[10px] text-white/50">{lastInvoice.invoiceNumber}</span>
                <span className="text-[9px] text-white/30 uppercase">{lastInvoice.date}</span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-white/30 uppercase tracking-wider">Billed Customer</span>
                <span className="font-bold text-white">{lastInvoice.customerName}</span>
              </div>
              <div className="flex flex-col gap-0.5 items-end text-right">
                <span className="text-[9px] text-white/30 uppercase tracking-wider">Payment Method</span>
                <span className="font-bold text-gold-300 uppercase">{lastInvoice.paymentMethod}</span>
              </div>
            </div>

            {/* Items details table */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between border-b border-white/10 pb-1.5 text-[9px] uppercase tracking-wider text-white/40">
                <span>SKU / Product Details</span>
                <span className="w-16 text-center">Qty</span>
                <span className="w-24 text-right">Invoice Sum</span>
              </div>
              {lastInvoice.items.map((item) => (
                <div key={item.sku} className="flex justify-between text-white/80 py-1.5 border-b border-white/5">
                  <div className="flex flex-col text-left">
                    <span className="font-serif text-white font-medium">{item.name}</span>
                    <span className="text-[9px] text-white/40">{item.sku} • {item.purity} {item.metal}</span>
                  </div>
                  <span className="w-16 text-center text-white/60 self-center">{item.quantity}</span>
                  <span className="w-24 text-right font-serif font-bold text-white self-center">
                    ₹{item.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Final Breakdowns */}
            <div className="flex flex-col gap-2 border-t border-white/10 pt-4 text-white/60 pl-24">
              <div className="flex justify-between">
                <span>Metal Base Sum:</span>
                <span className="font-serif text-white">₹{lastInvoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Making charges:</span>
                <span className="font-serif text-white">₹{lastInvoice.makingCharges.toLocaleString()}</span>
              </div>
              {lastInvoice.discount > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Manager Discount:</span>
                  <span className="font-serif">-₹{lastInvoice.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>3% GST (HSN 7113):</span>
                <span className="font-serif text-white">₹{lastInvoice.gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-serif font-bold text-gold-300 tracking-wider pt-2 border-t border-gold-500/20">
                <span>Grand Paid Total:</span>
                <span>₹{lastInvoice.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Hallmark note */}
            <div className="text-[9px] text-white/30 uppercase tracking-widest text-center border-t border-white/10 pt-4 flex items-center justify-center gap-1.5">
              <span>🛡️ BIS Hallmarked & Fully Insured Transit Assured</span>
            </div>

            {/* Trigger to Print */}
            <div className="flex gap-2 mt-4 select-none">
              <button
                onClick={() => window.print()}
                className="w-1/2 py-3 border border-white/10 text-white/60 hover:text-white uppercase font-bold tracking-widest flex items-center justify-center gap-2 cursor-pointer bg-black"
              >
                <Printer size={13} />
                Print Invoice
              </button>
              <GoldButton onClick={() => setInvoiceModalOpen(false)} className="w-1/2 py-3 text-xs font-bold">
                Lock and Return
              </GoldButton>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
}
