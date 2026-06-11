"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children, className = "" }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className={`relative w-full max-w-2xl bg-[#111111] border border-gold-500/30 p-8 overflow-y-auto max-h-[90vh] shadow-[0_20px_50px_rgba(212,175,55,0.2)] animate-scaleIn ${className}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gold-500/10">
          <h3 className="text-2xl font-serif tracking-widest uppercase gold-text-gradient">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-gold-500 hover:text-gold-300 hover:bg-gold-500/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="text-white/90">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

