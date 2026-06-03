"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children, className = "" }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-all duration-300">
      <div className={`relative w-full max-w-2xl glass-panel-heavy p-8 border border-gold-500/30 overflow-y-auto max-h-[90vh] shadow-[0_20px_50px_rgba(212,175,55,0.15)] ${className}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gold-500/10">
          <h3 className="text-2xl font-serif tracking-widest uppercase gold-text-gradient">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-gold-500 hover:text-gold-300 hover:bg-gold-500/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="text-white/90">{children}</div>
      </div>
    </div>
  );
}
