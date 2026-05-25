"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X, Sparkles, LayoutDashboard } from "lucide-react";
import { useAppState } from "@/context/StateContext";
import { useStore } from "@/store/useStore";

export default function CustomerNavbar({ onCartClick }) {
  const { cart, products } = useAppState();
  const { setArModalOpen, setInitialProduct, setIsIsolatedTryOn } = useStore();
  
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleOpenAR = () => {
    setInitialProduct(products[0]);
    setIsIsolatedTryOn(false);
    setArModalOpen(true);
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled ? "bg-black/90 backdrop-blur-md border-b border-gold-500/10 py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* AUREA Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-3xl font-serif tracking-[0.25em] font-light uppercase gold-text-gradient group-hover:opacity-90 transition-opacity">
            AUREA
          </span>
          <span className="text-white/20 text-xs font-light tracking-[0.4em] uppercase border-l border-white/10 pl-2 hidden sm:inline">
            JewelPro
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#collection" className="text-sm tracking-widest text-white/80 hover:text-gold-300 transition-colors uppercase">
            Collection
          </Link>
          <Link href="/#try-on" className="text-sm tracking-widest text-white/80 hover:text-gold-300 transition-colors uppercase">
            AR Try-On
          </Link>
          <Link href="/#trust" className="text-sm tracking-widest text-white/80 hover:text-gold-300 transition-colors uppercase">
            Trust
          </Link>
          <Link href="/#testimonials" className="text-sm tracking-widest text-white/80 hover:text-gold-300 transition-colors uppercase">
            Reviews
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-2 text-xs tracking-widest text-gold-500/80 hover:text-gold-300 border border-gold-500/20 hover:border-gold-500/40 px-3 py-1.5 transition-colors uppercase bg-gold-500/5"
          >
            <LayoutDashboard size={13} />
            ERP Admin
          </Link>
        </div>

        {/* Utility Buttons */}
        <div className="flex items-center gap-6">
          {/* Cart Icon */}
          <button
            onClick={onCartClick}
            className="relative p-2 text-white hover:text-gold-300 transition-colors group cursor-pointer"
          >
            <ShoppingCart size={22} className="group-hover:scale-105 transition-transform" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-black animate-bounce">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* AR Studio Button */}
          <button
            onClick={handleOpenAR}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2 text-xs tracking-widest font-medium uppercase border border-gold-500 bg-gold-500/10 text-gold-300 hover:bg-gold-500 hover:text-black transition-all duration-300 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer"
          >
            <Sparkles size={13} className="animate-pulse" />
            Try AR
          </button>

          {/* Mobile Menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-white hover:text-gold-300 transition-colors"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-panel-heavy border-b border-gold-500/20 py-6 px-6 flex flex-col gap-6 animate-fadeIn">
          <Link
            href="/#collection"
            onClick={() => setMenuOpen(false)}
            className="text-sm tracking-widest text-white/80 hover:text-gold-300 transition-colors uppercase"
          >
            Collection
          </Link>
          <Link
            href="/#try-on"
            onClick={() => setMenuOpen(false)}
            className="text-sm tracking-widest text-white/80 hover:text-gold-300 transition-colors uppercase"
          >
            AR Try-On
          </Link>
          <Link
            href="/#trust"
            onClick={() => setMenuOpen(false)}
            className="text-sm tracking-widest text-white/80 hover:text-gold-300 transition-colors uppercase"
          >
            Trust
          </Link>
          <Link
            href="/#testimonials"
            onClick={() => setMenuOpen(false)}
            className="text-sm tracking-widest text-white/80 hover:text-gold-300 transition-colors uppercase"
          >
            Reviews
          </Link>
          <button
            onClick={handleOpenAR}
            className="flex items-center justify-center gap-2 px-5 py-3 text-xs tracking-widest font-medium uppercase border border-gold-500 bg-gold-500/10 text-gold-300 hover:bg-gold-500 hover:text-black transition-all cursor-pointer"
          >
            <Sparkles size={13} />
            Try AR Studio
          </button>
          <Link
            href="/admin"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-2 px-5 py-3 text-xs tracking-widest font-medium uppercase border border-white/10 bg-white/5 text-white/80 hover:text-white transition-all"
          >
            <LayoutDashboard size={13} />
            ERP Admin Dashboard
          </Link>
        </div>
      )}
    </nav>
  );
}
