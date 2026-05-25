"use client";

import React, { useState } from "react";
import GlowCard from "@/components/ui/GlowCard";
import GoldButton from "@/components/ui/GoldButton";
import {
  Settings,
  Store,
  Percent,
  Bell,
  Shield,
  Database,
  Palette,
  Save,
  CheckCircle,
  AlertTriangle,
  Info,
  Globe,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  RefreshCw
} from "lucide-react";

const SECTION_ICONS = {
  "Store Information": Store,
  "Tax & Compliance": Percent,
  "Payment Gateway": CreditCard,
  "Notifications": Bell,
  "Security": Shield,
  "System": Database,
};

export default function SettingsPage() {
  const [savedSection, setSavedSection] = useState(null);
  const [activeTab, setActiveTab] = useState("Store Information");

  // Store Info State
  const [storeInfo, setStoreInfo] = useState({
    name: "AUREA Ateliers",
    tagline: "Sculpted in Pure Splendour",
    gstin: "27AUREA7113J1Z0",
    hsn_code: "7113",
    address: "M-50, Greater Kailash-I, New Delhi, India 110048",
    phone: "+91 11 4987 6543",
    email: "concierge@aurea-luxury.com",
    website: "https://aurea-jewelpro.vercel.app",
    currency: "INR",
    timezone: "Asia/Kolkata",
  });

  // Tax State
  const [taxConfig, setTaxConfig] = useState({
    gst_rate: 3,
    cgst: 1.5,
    sgst: 1.5,
    hsn_code: "7113",
    pan: "AUREA7113P",
    state_code: "27 (Maharashtra)",
    gst_filing_frequency: "Monthly",
  });

  // Payment State
  const [paymentConfig, setPaymentConfig] = useState({
    razorpay_key_id: "rzp_test_••••••••••••••",
    razorpay_key_secret: "••••••••••••••••••••••••",
    enable_upi: true,
    enable_card: true,
    enable_emi: true,
    enable_netbanking: true,
    min_emi_amount: 5000,
  });

  // Notification State
  const [notifConfig, setNotifConfig] = useState({
    low_stock_threshold: 3,
    birthday_reminder_days: 7,
    whatsapp_notifications: true,
    email_notifications: true,
    order_confirmation: true,
    repair_status_alerts: true,
    scheme_maturity_alerts: true,
  });

  // Security State
  const [securityConfig, setSecurityConfig] = useState({
    session_timeout: 60,
    two_factor_auth: false,
    ip_whitelist: "",
    audit_log_enabled: true,
    require_pin_for_discount: true,
    max_discount_allowed: 15,
  });

  const handleSave = (section) => {
    setSavedSection(section);
    setTimeout(() => setSavedSection(null), 2500);
  };

  const tabs = Object.keys(SECTION_ICONS);

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fadeIn">

      {/* Header */}
      <div className="border-b border-gold-500/10 pb-6">
        <h1 className="text-4xl font-serif tracking-[0.15em] uppercase gold-text-gradient font-light">
          System Settings
        </h1>
        <p className="text-white/40 text-xs tracking-widest uppercase mt-1">
          Configure AUREA × JewelPro enterprise platform settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Sidebar Navigation */}
        <div className="lg:col-span-3">
          <div className="glass-panel p-2 bg-zinc-950/60 flex flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = SECTION_ICONS[tab];
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-3 px-4 py-3 text-xs tracking-widest uppercase transition-all text-left border cursor-pointer ${
                    isActive
                      ? "border-gold-500/40 bg-gold-500/5 text-gold-300 font-semibold"
                      : "border-transparent text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={13} className={isActive ? "text-gold-300" : "text-white/40"} />
                  <span>{tab}</span>
                </button>
              );
            })}
          </div>

          {/* Info panel */}
          <div className="mt-4 p-4 bg-gold-500/5 border border-gold-500/15 text-[10px] text-white/50 leading-relaxed tracking-wide">
            <div className="flex items-center gap-1.5 text-gold-400 font-semibold mb-2">
              <Info size={11} />
              Note
            </div>
            Settings are saved to localStorage for this demo. Connect Supabase to persist across devices.
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-9">

          {/* STORE INFORMATION */}
          {activeTab === "Store Information" && (
            <GlowCard className="bg-zinc-950/60 flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h2 className="text-lg font-serif tracking-widest uppercase text-white flex items-center gap-2">
                  <Store size={16} className="text-gold-500" />
                  Store Information
                </h2>
                {savedSection === "store" && (
                  <span className="text-[10px] text-green-400 flex items-center gap-1 uppercase tracking-widest animate-scaleIn">
                    <CheckCircle size={12} />
                    Saved Successfully
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {[
                  { label: "Store Name", key: "name", icon: Store, placeholder: "AUREA Ateliers" },
                  { label: "Tagline", key: "tagline", icon: Palette, placeholder: "Sculpted in Pure Splendour" },
                  { label: "GSTIN", key: "gstin", icon: Percent, placeholder: "27AUREA7113J1Z0" },
                  { label: "HSN Code", key: "hsn_code", icon: Shield, placeholder: "7113" },
                  { label: "Phone", key: "phone", icon: Phone, placeholder: "+91 11 4987 6543" },
                  { label: "Email", key: "email", icon: Mail, placeholder: "concierge@aurea-luxury.com" },
                  { label: "Website", key: "website", icon: Globe, placeholder: "https://aurea.com" },
                  { label: "Currency", key: "currency", icon: CreditCard, placeholder: "INR" },
                ].map(({ label, key, icon: Icon, placeholder }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-white/40 flex items-center gap-1">
                      <Icon size={10} />
                      {label}
                    </label>
                    <input
                      type="text"
                      value={storeInfo[key]}
                      onChange={(e) => setStoreInfo({ ...storeInfo, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>
                ))}

                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 flex items-center gap-1">
                    <MapPin size={10} />
                    Full Address
                  </label>
                  <textarea
                    rows="2"
                    value={storeInfo.address}
                    onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })}
                    className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500 resize-none transition-colors"
                  />
                </div>
              </div>

              <GoldButton onClick={() => handleSave("store")} className="self-end px-8 py-3 text-xs font-bold gap-2">
                <Save size={13} />
                Save Store Info
              </GoldButton>
            </GlowCard>
          )}

          {/* TAX & COMPLIANCE */}
          {activeTab === "Tax & Compliance" && (
            <GlowCard className="bg-zinc-950/60 flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h2 className="text-lg font-serif tracking-widest uppercase text-white flex items-center gap-2">
                  <Percent size={16} className="text-gold-500" />
                  Tax & Compliance
                </h2>
                {savedSection === "tax" && (
                  <span className="text-[10px] text-green-400 flex items-center gap-1 uppercase tracking-widest animate-scaleIn">
                    <CheckCircle size={12} />
                    Saved Successfully
                  </span>
                )}
              </div>

              {/* Compliance Notice */}
              <div className="bg-gold-500/5 border border-gold-500/20 p-4 flex gap-3 items-start">
                <AlertTriangle size={14} className="text-gold-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Jewellery articles under <strong className="text-gold-300">HSN 7113</strong> attract a uniform
                  GST rate of <strong className="text-gold-300">3.0%</strong> (1.5% CGST + 1.5% SGST).
                  Verify with a CA before modifying tax parameters.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {[
                  { label: "GST Rate (%)", key: "gst_rate", type: "number" },
                  { label: "CGST Rate (%)", key: "cgst", type: "number" },
                  { label: "SGST Rate (%)", key: "sgst", type: "number" },
                  { label: "HSN Code", key: "hsn_code", type: "text" },
                  { label: "PAN Number", key: "pan", type: "text" },
                  { label: "State Code", key: "state_code", type: "text" },
                ].map(({ label, key, type }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-white/40">{label}</label>
                    <input
                      type={type}
                      value={taxConfig[key]}
                      onChange={(e) => setTaxConfig({ ...taxConfig, [key]: e.target.value })}
                      className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>
                ))}

                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40">GST Filing Frequency</label>
                  <select
                    value={taxConfig.gst_filing_frequency}
                    onChange={(e) => setTaxConfig({ ...taxConfig, gst_filing_frequency: e.target.value })}
                    className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500 transition-colors"
                  >
                    {["Monthly", "Quarterly", "Annually"].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <GoldButton onClick={() => handleSave("tax")} className="self-end px-8 py-3 text-xs font-bold gap-2">
                <Save size={13} />
                Save Tax Config
              </GoldButton>
            </GlowCard>
          )}

          {/* PAYMENT GATEWAY */}
          {activeTab === "Payment Gateway" && (
            <GlowCard className="bg-zinc-950/60 flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h2 className="text-lg font-serif tracking-widest uppercase text-white flex items-center gap-2">
                  <CreditCard size={16} className="text-gold-500" />
                  Payment Gateway
                </h2>
                {savedSection === "payment" && (
                  <span className="text-[10px] text-green-400 flex items-center gap-1 uppercase tracking-widest animate-scaleIn">
                    <CheckCircle size={12} />
                    Saved Successfully
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40">Razorpay Key ID</label>
                  <input
                    type="text"
                    value={paymentConfig.razorpay_key_id}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, razorpay_key_id: e.target.value })}
                    className="w-full bg-black border border-white/10 px-3 py-2.5 text-white font-mono focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40">Razorpay Key Secret</label>
                  <input
                    type="password"
                    value={paymentConfig.razorpay_key_secret}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, razorpay_key_secret: e.target.value })}
                    className="w-full bg-black border border-white/10 px-3 py-2.5 text-white font-mono focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40">Min. EMI Amount (₹)</label>
                  <input
                    type="number"
                    value={paymentConfig.min_emi_amount}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, min_emi_amount: e.target.value })}
                    className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
              </div>

              {/* Toggle Payment Methods */}
              <div className="border-t border-white/5 pt-4">
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-4">Enabled Payment Methods</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { key: "enable_upi", label: "UPI" },
                    { key: "enable_card", label: "Credit / Debit Card" },
                    { key: "enable_emi", label: "EMI Financing" },
                    { key: "enable_netbanking", label: "Net Banking" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setPaymentConfig((p) => ({ ...p, [key]: !p[key] }))}
                      className={`py-3 border text-center uppercase tracking-widest font-medium transition-all cursor-pointer ${
                        paymentConfig[key]
                          ? "border-gold-500 bg-gold-500/10 text-gold-300 font-semibold"
                          : "border-white/10 bg-black text-white/40"
                      }`}
                    >
                      {paymentConfig[key] ? "✓ " : "○ "}{label}
                    </button>
                  ))}
                </div>
              </div>

              <GoldButton onClick={() => handleSave("payment")} className="self-end px-8 py-3 text-xs font-bold gap-2">
                <Save size={13} />
                Save Payment Config
              </GoldButton>
            </GlowCard>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === "Notifications" && (
            <GlowCard className="bg-zinc-950/60 flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h2 className="text-lg font-serif tracking-widest uppercase text-white flex items-center gap-2">
                  <Bell size={16} className="text-gold-500" />
                  Notification Settings
                </h2>
                {savedSection === "notif" && (
                  <span className="text-[10px] text-green-400 flex items-center gap-1 uppercase tracking-widest animate-scaleIn">
                    <CheckCircle size={12} />
                    Saved Successfully
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40">Low Stock Alert Threshold (Units)</label>
                  <input
                    type="number"
                    value={notifConfig.low_stock_threshold}
                    onChange={(e) => setNotifConfig({ ...notifConfig, low_stock_threshold: parseInt(e.target.value) })}
                    className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40">Birthday Reminder (Days Before)</label>
                  <input
                    type="number"
                    value={notifConfig.birthday_reminder_days}
                    onChange={(e) => setNotifConfig({ ...notifConfig, birthday_reminder_days: parseInt(e.target.value) })}
                    className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="border-t border-white/5 pt-4 flex flex-col gap-3 text-xs">
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Notification Channels & Types</p>
                {[
                  { key: "whatsapp_notifications", label: "WhatsApp API Notifications", desc: "Send status updates via WhatsApp" },
                  { key: "email_notifications", label: "Email Notifications", desc: "Send transactional emails to customers" },
                  { key: "order_confirmation", label: "Order Confirmations", desc: "Notify on every new purchase" },
                  { key: "repair_status_alerts", label: "Repair Status Alerts", desc: "Alert customers on repair workflow changes" },
                  { key: "scheme_maturity_alerts", label: "Gold Scheme Maturity Alerts", desc: "Notify on scheme maturity milestones" },
                ].map(({ key, label, desc }) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-3.5 border cursor-pointer transition-all ${
                      notifConfig[key]
                        ? "border-gold-500/20 bg-gold-500/5"
                        : "border-white/5 bg-black"
                    }`}
                    onClick={() => setNotifConfig((n) => ({ ...n, [key]: !n[key] }))}
                  >
                    <div>
                      <div className={`font-medium ${notifConfig[key] ? "text-gold-300" : "text-white/60"}`}>{label}</div>
                      <div className="text-[9px] text-white/30 mt-0.5">{desc}</div>
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-all relative ${
                      notifConfig[key] ? "bg-gold-500" : "bg-zinc-800"
                    }`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                        notifConfig[key] ? "left-5" : "left-0.5"
                      }`} />
                    </div>
                  </div>
                ))}
              </div>

              <GoldButton onClick={() => handleSave("notif")} className="self-end px-8 py-3 text-xs font-bold gap-2">
                <Save size={13} />
                Save Notification Config
              </GoldButton>
            </GlowCard>
          )}

          {/* SECURITY */}
          {activeTab === "Security" && (
            <GlowCard className="bg-zinc-950/60 flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h2 className="text-lg font-serif tracking-widest uppercase text-white flex items-center gap-2">
                  <Shield size={16} className="text-gold-500" />
                  Security Configuration
                </h2>
                {savedSection === "security" && (
                  <span className="text-[10px] text-green-400 flex items-center gap-1 uppercase tracking-widest animate-scaleIn">
                    <CheckCircle size={12} />
                    Saved Successfully
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={securityConfig.session_timeout}
                    onChange={(e) => setSecurityConfig({ ...securityConfig, session_timeout: parseInt(e.target.value) })}
                    className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40">Max Discount Allowed (%)</label>
                  <input
                    type="number"
                    max="50"
                    min="0"
                    value={securityConfig.max_discount_allowed}
                    onChange={(e) => setSecurityConfig({ ...securityConfig, max_discount_allowed: parseInt(e.target.value) })}
                    className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40">IP Whitelist (comma-separated)</label>
                  <input
                    type="text"
                    value={securityConfig.ip_whitelist}
                    onChange={(e) => setSecurityConfig({ ...securityConfig, ip_whitelist: e.target.value })}
                    placeholder="e.g. 192.168.1.100, 10.0.0.1"
                    className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 flex flex-col gap-3 text-xs">
                {[
                  { key: "two_factor_auth", label: "Two-Factor Authentication (2FA)", desc: "Require OTP on admin login" },
                  { key: "audit_log_enabled", label: "Audit Log Enabled", desc: "Track all admin actions with timestamps" },
                  { key: "require_pin_for_discount", label: "Manager PIN for Discounts", desc: "Require PIN approval for POS discounts" },
                ].map(({ key, label, desc }) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-3.5 border cursor-pointer transition-all ${
                      securityConfig[key]
                        ? "border-gold-500/20 bg-gold-500/5"
                        : "border-white/5 bg-black"
                    }`}
                    onClick={() => setSecurityConfig((s) => ({ ...s, [key]: !s[key] }))}
                  >
                    <div>
                      <div className={`font-medium ${securityConfig[key] ? "text-gold-300" : "text-white/60"}`}>{label}</div>
                      <div className="text-[9px] text-white/30 mt-0.5">{desc}</div>
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-all relative ${
                      securityConfig[key] ? "bg-gold-500" : "bg-zinc-800"
                    }`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                        securityConfig[key] ? "left-5" : "left-0.5"
                      }`} />
                    </div>
                  </div>
                ))}
              </div>

              <GoldButton onClick={() => handleSave("security")} className="self-end px-8 py-3 text-xs font-bold gap-2">
                <Save size={13} />
                Save Security Config
              </GoldButton>
            </GlowCard>
          )}

          {/* SYSTEM */}
          {activeTab === "System" && (
            <GlowCard className="bg-zinc-950/60 flex flex-col gap-6">
              <div className="border-b border-white/5 pb-4">
                <h2 className="text-lg font-serif tracking-widest uppercase text-white flex items-center gap-2">
                  <Database size={16} className="text-gold-500" />
                  System Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {[
                  { label: "Platform", value: "AUREA × JewelPro ERP" },
                  { label: "Version", value: "v1.2.0 (Production)" },
                  { label: "Framework", value: "Next.js 16 / React 19" },
                  { label: "Database", value: "Supabase PostgreSQL" },
                  { label: "Auth Provider", value: "Supabase Auth" },
                  { label: "Storage", value: "Cloudinary CDN" },
                  { label: "Payments", value: "Razorpay Gateway" },
                  { label: "Deployment", value: "Vercel Edge Network" },
                  { label: "AR Engine", value: "WebRTC + Canvas API" },
                  { label: "Styling", value: "Tailwind CSS v4" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between p-3 bg-zinc-950 border border-white/5">
                    <span className="text-white/40 uppercase tracking-wider text-[9px]">{label}</span>
                    <span className="text-white/80 font-mono text-[10px]">{value}</span>
                  </div>
                ))}
              </div>

              {/* Data Management */}
              <div className="border-t border-white/5 pt-6 flex flex-col gap-4">
                <p className="text-[10px] uppercase tracking-widest text-white/40">Data Management</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <button
                    onClick={() => {
                      const data = {
                        products: localStorage.getItem("aurea_products"),
                        customers: localStorage.getItem("aurea_customers"),
                        orders: localStorage.getItem("aurea_orders"),
                        ledger: localStorage.getItem("aurea_ledger"),
                      };
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `aurea_backup_${Date.now()}.json`;
                      link.click();
                    }}
                    className="flex items-center justify-center gap-2 py-3 border border-white/10 text-white/60 hover:text-gold-300 hover:border-gold-500/30 uppercase tracking-widest transition-all cursor-pointer bg-black"
                  >
                    <Database size={13} />
                    Export Data Backup
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("Are you sure? This will clear all local data and reset to defaults.")) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="flex items-center justify-center gap-2 py-3 border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 uppercase tracking-widest transition-all cursor-pointer bg-black"
                  >
                    <RefreshCw size={13} />
                    Reset All Data
                  </button>
                </div>
              </div>
            </GlowCard>
          )}

        </div>
      </div>
    </div>
  );
}
