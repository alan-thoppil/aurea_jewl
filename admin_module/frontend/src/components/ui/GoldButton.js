"use client";

import React from "react";

export default function GoldButton({ children, onClick, type = "button", className = "", disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      suppressHydrationWarning
      className={`relative inline-flex items-center justify-center px-6 py-3 font-medium tracking-widest text-black uppercase transition-all duration-300 rounded-none bg-gradient-to-r from-gold-700 via-gold-500 to-gold-300 hover:from-gold-300 hover:via-gold-500 hover:to-gold-700 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-shadow duration-300 cursor-pointer ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 w-full h-full border border-white/20"></span>
    </button>
  );
}
