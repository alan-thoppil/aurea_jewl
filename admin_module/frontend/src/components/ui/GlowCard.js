"use client";

import React from "react";

export default function GlowCard({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`glass-panel p-6 hover:border-gold-500/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(212,175,55,0.08)] ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
