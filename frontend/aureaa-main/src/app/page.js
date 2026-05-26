"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Gem, Truck, RefreshCw, Mail, Check, Star, X, ShoppingCart } from "lucide-react";
import { useAppState } from "@/context/StateContext";
import CustomerNavbar from "@/components/CustomerNavbar";
import CartDrawer from "@/components/CartDrawer";
import GlowCard from "@/components/ui/GlowCard";
import GoldButton from "@/components/ui/GoldButton";
import { useStore } from "@/store/useStore";
import ARModal from "@/components/ar/ARModal";

export default function Home() {
  const {
    products,
    calculateProductPrice,
    addToCart,
    subscribeEmail,
    liveGoldPrice24K
  } = useAppState();

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeCollection, setActiveCollection] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);
  
  const { setArModalOpen, setInitialProduct, setIsIsolatedTryOn } = useStore();

  const handleOpenAR = (product = null) => {
    if (product) {
      setInitialProduct(product);
      setIsIsolatedTryOn(true);
    } else {
      setInitialProduct(products[0]);
      setIsIsolatedTryOn(false);
    }
    setArModalOpen(true);
  };

  // Filter products by category, collection, and hide 0 stock items
  const filteredProducts = products.filter(p => {
    if (p.stock_count <= 0) return false;
    
    const categoryMatch = activeCategory === "All" || p.category.toLowerCase() === activeCategory.toLowerCase();
    
    // Default mock data handles cases where p.collection is missing
    const pColl = p.collection ? p.collection.toLowerCase() : "all";
    const collectionMatch = activeCollection === "All" || pColl === activeCollection.toLowerCase();
    
    return categoryMatch && collectionMatch;
  });

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    const res = subscribeEmail(newsletterEmail);
    if (res.success || res.error === "Already subscribed.") {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
    }
  };

  const categories = ["All", "Rings", "Necklaces", "Earrings", "Bangles", "Anklets"];
  const collections = ["All", "Bridal", "Womens", "Gents", "Child"];

  return (
    <>
      <CustomerNavbar onCartClick={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Main Luxury Content */}
      <main className="min-h-screen relative overflow-hidden bg-[#0B0B0B] text-white">
        
        {/* Subtle Ambient Radial Light Layers */}
        <div className="absolute top-[20%] left-[-15%] w-[60%] h-[60%] rounded-full bg-gold-500/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[20%] right-[-15%] w-[60%] h-[60%] rounded-full bg-gold-500/5 blur-[120px] pointer-events-none"></div>

        {/* 1. CINEMATIC HERO SECTION */}
        <section className="relative min-h-screen flex items-center justify-center pt-24 px-6 md:px-12 bg-[radial-gradient(ellipse_at_center,rgba(20,20,20,0.8)_0%,rgba(11,11,11,1)_80%)]">
          
          {/* Custom cinematic golden grid particle mesh backdrop */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full relative z-10 py-12">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
              
              {/* Premium micro badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold-500/10 border border-gold-500/25 rounded-none text-xs font-medium tracking-[0.2em] text-gold-300 uppercase animate-pulse">
                <Sparkles size={12} />
                <span>Atelier of Divine Creations</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-serif font-light tracking-[0.1em] leading-[1.1] uppercase text-white">
                Sculpted in <span className="gold-text-gradient font-normal block mt-2">Pure Splendour</span>
              </h1>

              <p className="max-w-xl text-sm md:text-base text-white/60 font-light leading-relaxed tracking-wider">
                Immerse yourself in AUREA. Hand-crafted, heritage-certified luxury jewellery tailored for extraordinary souls. Experience beauty through our native real-time WebRTC AR try-on.
              </p>

              {/* LIVE TAPE PRICE INSIDE HERO */}
              <div className="glass-panel py-3.5 px-6 border border-gold-500/20 bg-black/60 flex items-center gap-4 text-xs mt-2 w-fit">
                <span className="h-2 w-2 rounded-full bg-gold-500 animate-ping"></span>
                <span className="text-white/50 tracking-widest uppercase">Live Ticket 24K Gold</span>
                <span className="font-serif font-bold text-gold-300 tracking-wider text-sm">
                  ₹{liveGoldPrice24K.toLocaleString('en-IN')}/g
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
                <Link href="#collection">
                  <GoldButton className="w-full sm:w-auto text-xs py-4 px-8 font-bold">
                    Explore Collection
                  </GoldButton>
                </Link>
                <button
                  onClick={() => handleOpenAR()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-xs font-semibold tracking-widest uppercase border border-gold-500/40 text-gold-300 bg-black hover:border-gold-500 hover:bg-gold-500/10 hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all duration-300"
                >
                  <Sparkles size={16} className="animate-pulse text-gold-500" />
                  Launch AR Studio
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Hero Right: FLOATING LUXURY CSS 3D RING */}
            <div className="lg:col-span-5 flex justify-center items-center relative py-12 lg:py-0">
              
              {/* Cinematic lighting spots */}
              <div className="absolute w-[250px] h-[250px] rounded-full bg-gold-500/10 blur-[60px] pointer-events-none animate-pulse"></div>

              {/* Floating Ring Outer frame */}
              <div className="w-[300px] h-[300px] md:w-[350px] md:h-[350px] flex items-center justify-center relative animate-float">
                
                {/* Floating Solitaire Image Ring (sized exactly to the 2nd circle) */}
                <div className="absolute inset-4 bg-black rounded-full drop-shadow-[0_0_60px_rgba(212,175,55,0.4)] flex items-center justify-center border border-gold-500/40 overflow-hidden group z-10 scale-95">
                  <div className="absolute inset-0 bg-gold-500/10 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-500 z-10 pointer-events-none"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop" 
                    alt="HD Glowing Ring" 
                    className="w-[115%] h-[115%] object-cover object-center transform scale-105 group-hover:scale-125 transition-transform duration-700 filter brightness-110 contrast-125" 
                  />
                  {/* Inner shadow for smooth blending into the black circle */}
                  <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.9)] pointer-events-none z-20"></div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 2. ATELIER FEATURED COLLECTIONS */}
        <section id="collection" className="py-28 px-6 md:px-12 max-w-7xl mx-auto border-t border-gold-500/10">
          
          <div className="flex flex-col items-center text-center gap-4 mb-16">
            <span className="text-[10px] tracking-[0.3em] font-medium text-gold-500 uppercase">Discover the Catalogues</span>
            <h2 className="text-3xl md:text-5xl font-serif tracking-widest uppercase text-white">
              Signature Collections
            </h2>
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-gold-500 to-transparent mt-2"></div>
          </div>

          {/* Dynamic Categories Tab Scroller */}
          <div className="flex justify-center gap-3 overflow-x-auto pb-4 scrollbar max-w-2xl mx-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 text-xs tracking-widest uppercase transition-all shrink-0 border rounded-none cursor-pointer ${
                  activeCategory === cat
                    ? "border-gold-500 bg-gold-500/10 text-gold-300 font-semibold"
                    : "border-white/5 bg-zinc-950 text-white/50 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Dynamic Subsections (Collections) Scroller */}
          <div className="flex justify-center gap-2 overflow-x-auto pb-8 scrollbar max-w-xl mx-auto mb-6">
            {collections.map((coll) => (
              <button
                key={coll}
                onClick={() => setActiveCollection(coll)}
                className={`px-4 py-1.5 text-[10px] tracking-widest uppercase transition-all shrink-0 border rounded-none cursor-pointer ${
                  activeCollection === coll
                    ? "border-gold-500/50 bg-gold-500/5 text-gold-300"
                    : "border-transparent bg-transparent text-white/40 hover:text-white/80"
                }`}
              >
                {coll}
              </button>
            ))}
          </div>

          {/* Dynamic Filterable Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => {
              const prices = calculateProductPrice(product);
              return (
                <GlowCard
                  key={product.sku}
                  className="flex flex-col h-full bg-zinc-950/60 border border-white/5 hover:border-gold-500/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-500 group overflow-hidden p-0 relative"
                >
                  {/* Custom Status Badge */}
                  {product.badge && (
                    <span className="absolute top-3 right-3 z-10 bg-black/80 backdrop-blur-md border border-gold-500/50 text-[9px] px-2 py-0.5 uppercase tracking-widest text-gold-300 font-semibold shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                      {product.badge}
                    </span>
                  )}
                  {/* Stock Alert Badge */}
                  {product.stock_count <= 3 && (
                    <span className="absolute top-3 left-3 z-10 bg-red-950 border border-red-500/30 text-[9px] px-2 py-0.5 uppercase tracking-widest text-red-400 font-semibold">
                      Only {product.stock_count} Left
                    </span>
                  )}

                  {/* Product Card Image Container */}
                  <div className="w-full aspect-square bg-zinc-900 overflow-hidden relative border-b border-white/5 cursor-pointer" onClick={() => setSelectedProductForDetail(product)}>
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenAR(product)}
                        suppressHydrationWarning
                        className="w-40 py-2.5 bg-gold-500 hover:bg-gold-300 text-black font-bold uppercase tracking-widest text-[10px] shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 cursor-pointer"
                      >
                        Try AR Now
                      </button>
                      <button
                        onClick={() => setSelectedProductForDetail(product)}
                        suppressHydrationWarning
                        className="w-40 py-2.5 border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-black font-bold uppercase tracking-widest text-[10px] shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Product Info Description */}
                  <div className="p-5 flex-1 flex flex-col justify-between text-left gap-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-wider">
                        <span>{product.category}</span>
                        <span className="font-semibold text-gold-500">{product.purity} {product.metal}</span>
                      </div>
                      <h3 
                        onClick={() => setSelectedProductForDetail(product)}
                        className="text-sm font-serif font-semibold tracking-wide text-white group-hover:text-gold-300 transition-colors line-clamp-1 cursor-pointer"
                      >
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-white/50 leading-relaxed font-light line-clamp-2 mt-0.5">
                        {product.description}
                      </p>
                      <div className="text-[10px] text-white/30 italic mt-1">
                        Weight: {product.weight.toFixed(2)}g
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-1">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-white/40 uppercase tracking-wider">Estimated Price</span>
                        <span className="text-base font-serif font-bold text-gold-300">
                          ₹{prices.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          addToCart(product, 1);
                          setCartOpen(true);
                        }}
                        disabled={product.stock_count === 0}
                        suppressHydrationWarning
                        className="px-4 py-2 border border-gold-500 text-gold-500 text-[10px] font-bold tracking-widest uppercase hover:bg-gold-500 hover:text-black transition-colors rounded-none disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        {product.stock_count === 0 ? "Sold Out" : "Buy Piece"}
                      </button>
                    </div>
                  </div>
                </GlowCard>
              );
            })}
          </div>
        </section>

        {/* 3. AR TRY-ON TEASER SECTION */}
        <section id="try-on" className="py-24 px-6 md:px-12 bg-zinc-950 border-t border-b border-gold-500/10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Promo Left: Screen Demonstration */}
            <div className="lg:col-span-6 flex justify-center order-2 lg:order-1">
              <div className="relative w-full max-w-md aspect-[4/3] glass-panel-heavy p-2 border border-gold-500/30 shadow-[0_20px_50px_rgba(212,175,55,0.15)] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop"
                  alt="Model wearing premium jewellery"
                  className="w-full h-full object-cover filter brightness-95"
                />
                
                {/* Interactive Simulated Choker Overlay on Model */}
                <div className="absolute top-[48%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none animate-pulse">
                  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-90 drop-shadow-[0_5px_15px_rgba(212,175,55,0.4)]">
                    <circle cx="100" cy="80" r="60" stroke="#D4AF37" strokeWidth="6" strokeDasharray="10 4" />
                    <circle cx="100" cy="80" r="54" stroke="#F5D06F" strokeWidth="2" />
                    <circle cx="100" cy="140" r="10" fill="#059669" stroke="#D4AF37" strokeWidth="2" />
                    <circle cx="50" cy="115" r="6" fill="#059669" stroke="#D4AF37" strokeWidth="2" />
                    <circle cx="150" cy="115" r="6" fill="#059669" stroke="#D4AF37" strokeWidth="2" />
                  </svg>
                </div>

                <span className="absolute bottom-4 right-4 bg-black/85 px-3 py-1 border border-gold-500/20 text-[9px] uppercase tracking-widest text-gold-300 font-semibold">
                  AUREA × WEBRTC CAMERA ACTIVE
                </span>
              </div>
            </div>

            {/* Promo Right: Text details */}
            <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left gap-6 order-1 lg:order-2">
              <span className="text-[10px] tracking-[0.3em] font-medium text-gold-500 uppercase">Seamless Virtual Salon</span>
              <h2 className="text-3xl md:text-5xl font-serif tracking-widest uppercase text-white">
                Live AR Virtual Try-On
              </h2>
              <p className="text-sm md:text-base text-white/60 font-light leading-relaxed tracking-wider">
                Experience luxury from anywhere. Grant camera access to let our live WebRTC system map high-fidelity gold chokers, diamond rings, and emerald droplets directly onto your profile at 60 frames per second.
              </p>
              <ul className="flex flex-col gap-3.5 text-xs text-white/80 w-full font-light tracking-wide text-left">
                <li className="flex items-center gap-3">
                  <span className="h-5 w-5 bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-300 text-[10px] shrink-0 font-bold">✓</span>
                  <span>Zero lag browser camera streams using Canvas overlay logic</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-5 w-5 bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-300 text-[10px] shrink-0 font-bold">✓</span>
                  <span>Manual precision transforms (drag, rotate, scale, translate)</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-5 w-5 bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-300 text-[10px] shrink-0 font-bold">✓</span>
                  <span>Snapshot capture tool to secure and download your model portfolio</span>
                </li>
              </ul>
              <GoldButton onClick={() => handleOpenAR()} className="mt-4 text-xs py-4 px-10 font-bold">
                Open AR Studio Now
              </GoldButton>
            </div>

          </div>
        </section>

        {/* 4. TRUST & HALLMARK DETAILS */}
        <section id="trust" className="py-24 px-6 md:px-12 max-w-7xl mx-auto text-center">
          
          <div className="flex flex-col items-center gap-2 mb-16">
            <span className="text-[10px] tracking-[0.3em] font-medium text-gold-500 uppercase">Guaranteed Heritage Markers</span>
            <h2 className="text-3xl md:text-4xl font-serif tracking-widest uppercase text-white">
              Trust & Certifications
            </h2>
            <div className="h-[1px] w-16 bg-gold-500/30 mt-2"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "BIS Hallmark certified",
                desc: "Every single yellow, rose gold, and platinum piece features laser-etched HUID standards guaranteeing purity certifications."
              },
              {
                icon: Gem,
                title: "Lifetime Detailing",
                desc: "Complimentary ultrasonic spa cleaning and checking services at any global AUREA showroom for life."
              },
              {
                icon: Truck,
                title: "Insured Transit",
                desc: "Every order travels securely inside sealed, temperature-locked luxury capsules, backed by total Lloyds coverage."
              },
              {
                icon: RefreshCw,
                title: "Exchanges & Buybacks",
                desc: "Flexible exchange metrics offering 100% buyback valuation against current dynamic live metal listings."
              }
            ].map((feature, idx) => (
              <GlowCard key={idx} className="flex flex-col items-center text-center gap-4 bg-zinc-950/40 p-8 rounded-none border border-white/5">
                <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-300">
                  <feature.icon size={22} className="animate-pulse" />
                </div>
                <h3 className="text-sm font-serif font-semibold tracking-widest uppercase text-white">
                  {feature.title}
                </h3>
                <p className="text-xs text-white/50 font-light leading-relaxed tracking-wider">
                  {feature.desc}
                </p>
              </GlowCard>
            ))}
          </div>
        </section>

        {/* 5. TESTIMONIALS SLIDER SECTION */}
        <section id="testimonials" className="py-24 px-6 md:px-12 bg-zinc-950 border-t border-gold-500/10">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
            
            <span className="text-[10px] tracking-[0.3em] font-medium text-gold-500 uppercase">Elite Reviews</span>
            <h2 className="text-3xl font-serif tracking-widest uppercase text-white">
              Customer Diaries
            </h2>
            <div className="h-[1px] w-12 bg-gold-500/20 mt-1"></div>

            <div className="relative mt-8 glass-panel-heavy p-8 md:p-12 border border-gold-500/15 max-w-2xl text-center">
              
              <div className="flex items-center justify-center gap-1 text-gold-500 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#D4AF37" />
                ))}
              </div>

              <blockquote className="text-base md:text-lg font-serif italic text-white/90 leading-relaxed tracking-wider">
                &quot;The AUREA Royal Peacock Choker exceeded absolute expectations. The POS invoice generated in the ERP was highly professional, and the AR try-on studio previewed the dimensions perfectly. Dynamic live gold pricing guarantees transparent transactions.&quot;
              </blockquote>

              <cite className="block text-xs font-semibold tracking-widest uppercase text-gold-300 mt-6 not-italic">
                Eleanor Pena — Royal Member
              </cite>
              
            </div>

          </div>
        </section>

        {/* 6. NEWSLETTER EMAIL CAPTURE */}
        <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto text-center border-t border-gold-500/10">
          <div className="glass-panel p-8 md:p-16 border border-gold-500/20 bg-gradient-to-b from-zinc-950 to-[#0B0B0B] flex flex-col items-center gap-6">
            <h2 className="text-2xl md:text-4xl font-serif tracking-widest uppercase text-white">
              Join the inner sanctum
            </h2>
            <p className="max-w-md text-xs text-white/50 leading-relaxed tracking-wider">
              Subscribe to recieve early catalogues, private showroom scheduling, and active live gold price alerts.
            </p>

            {newsletterSubscribed ? (
              <div className="flex flex-col items-center gap-3 py-4 text-gold-300 animate-scaleIn">
                <div className="w-10 h-10 rounded-full border border-gold-500 flex items-center justify-center bg-gold-500/10">
                  <Check size={18} />
                </div>
                <span className="text-xs uppercase tracking-widest font-bold">Email catalogued. Welcome.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full max-w-md border border-white/10 bg-black mt-2">
                <input
                  type="email"
                  required
                  placeholder="devon@luxury.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  suppressHydrationWarning
                  className="flex-1 bg-transparent border-0 px-4 py-3 text-xs focus:outline-none focus:ring-0 text-white placeholder-white/30"
                />
                <button
                  type="submit"
                  suppressHydrationWarning
                  className="px-6 py-3 bg-gold-500 hover:bg-gold-300 text-black text-[10px] font-bold tracking-widest uppercase transition-colors shrink-0 cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </section>

        {/* 7. PREMIUM FOOTER */}
        <footer className="py-16 px-6 md:px-12 bg-black border-t border-gold-500/15 text-xs text-white/50">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
            
            <div className="flex flex-col gap-4">
              <span className="text-xl font-serif tracking-[0.25em] uppercase text-white font-light">
                AUREA
              </span>
              <p className="text-[10px] leading-relaxed text-white/30">
                Pioneering elite design houses representing high jewellery and real-time POS, Inventory, and general ledger operations.
              </p>
              <div className="text-[10px] text-gold-500/70 font-semibold tracking-wider">
                GSTIN: 27AUREA7113J1Z0 • HSN: 7113
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-white text-[10px] tracking-widest uppercase font-semibold">Atelier links</h4>
              <Link href="#collection" className="hover:text-gold-300 transition-colors">Catalogues</Link>
              <button onClick={() => handleOpenAR()} suppressHydrationWarning className="hover:text-gold-300 transition-colors text-left">Virtual Try-On</button>
              <Link href="#trust" className="hover:text-gold-300 transition-colors">Certifications</Link>
              <Link href="/admin" className="text-gold-500/80 hover:text-gold-300 font-semibold transition-colors">ERP Admin portal</Link>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-white text-[10px] tracking-widest uppercase font-semibold">Legal parameters</h4>
              <Link href="#" className="hover:text-gold-300 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-gold-300 transition-colors">Terms of Atelier</Link>
              <Link href="#" className="hover:text-gold-300 transition-colors">Hallmark Verification</Link>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-white text-[10px] tracking-widest uppercase font-semibold">Showroom contact</h4>
              <p>M-50, Greater Kailash-I, New Delhi, India</p>
              <p>Hotline: +91 11 4987 6543</p>
              <p>Email: concierge@aurea-luxury.com</p>
            </div>

          </div>

          <div className="max-w-7xl mx-auto border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-white/20">
            <span>© 2026 AUREA × JewelPro. All sovereign rights reserved.</span>
            <span>Hand-crafted inside the Indian Subcontinent.</span>
          </div>
        </footer>

        {/* 8. LUXURY PRODUCT DETAIL MODAL */}
        {selectedProductForDetail && (() => {
          const product = selectedProductForDetail;
          const prices = calculateProductPrice(product);
          return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6 animate-fadeIn">
              {/* Modal Container */}
              <div className="relative w-full max-w-4xl bg-zinc-950/95 border border-gold-500/25 shadow-[0_0_80px_rgba(212,175,55,0.15)] flex flex-col md:flex-row overflow-hidden max-h-[90vh] md:max-h-[85vh] animate-scaleIn">
                
                {/* Gold Top Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-500 to-transparent"></div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedProductForDetail(null)}
                  className="absolute top-4 right-4 z-20 p-2 text-white/50 hover:text-gold-300 hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>

                {/* Left Column: Image Showcase */}
                <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-white border-r border-white/5 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-contain p-6 transform hover:scale-105 transition-transform duration-700 filter brightness-105 contrast-[1.02]"
                  />
                  {/* Image shadow mask */}
                  <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] pointer-events-none z-10"></div>
                  
                  {/* Purity Indicator overlay */}
                  <span className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur-md border border-gold-500/30 text-[9px] px-2.5 py-1 uppercase tracking-widest text-gold-300 font-semibold shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                    BIS Hallmark • {product.purity} Purity
                  </span>
                </div>

                {/* Right Column: Spec Grid & Actions */}
                <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-none gap-6 text-left">
                  
                  {/* Header info */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] tracking-[0.2em] font-semibold text-gold-500 uppercase bg-gold-500/10 px-2 py-0.5 border border-gold-500/20">
                        {product.category}
                      </span>
                      {product.badge && (
                        <span className="text-[9px] tracking-widest text-white/40 uppercase font-semibold">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl font-serif tracking-widest uppercase text-white leading-tight">
                      {product.name}
                    </h2>
                    <div className="h-[1px] w-16 bg-gold-500/30 my-1"></div>
                    
                    <p className="text-xs text-white/60 leading-relaxed font-light tracking-wide mt-1">
                      {product.description || "An exquisite piece crafted with flawless detail, celebrating time-tested heritage and modern refinement."}
                    </p>
                  </div>

                  {/* Technical Specifications Grid */}
                  <div className="bg-zinc-900/60 border border-white/5 p-4 flex flex-col gap-3">
                    <span className="text-[10px] tracking-widest uppercase text-white/45 font-semibold">Technical Specifications</span>
                    
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-light text-white/70">
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/30 uppercase tracking-wider text-[9px]">Metal</span>
                        <span className="font-semibold text-white">{product.metal}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/30 uppercase tracking-wider text-[9px]">Purity</span>
                        <span className="font-semibold text-gold-300">{product.purity}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/30 uppercase tracking-wider text-[9px]">Gross Weight</span>
                        <span className="font-semibold text-white">{product.weight.toFixed(2)} g</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/30 uppercase tracking-wider text-[9px]">Making Charge</span>
                        <span className="font-semibold text-white">₹{product.making_charges}/g</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Dynamic Pricing breakdown */}
                  <div className="bg-black/40 border border-gold-500/15 p-4 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between text-[10px] tracking-widest uppercase">
                      <span className="text-white/45 font-semibold">Dynamic Pricing breakdown</span>
                      <span className="text-gold-300 font-bold">Live Rate Sync</span>
                    </div>

                    <div className="flex flex-col gap-1.5 text-xs font-light text-white/60">
                      <div className="flex justify-between">
                        <span>Metal Value ({product.weight.toFixed(2)}g × ₹{prices.metalValue ? (prices.metalValue / product.weight).toLocaleString('en-IN') : '0'}/g)</span>
                        <span>₹{prices.metalValue.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Making Charges (₹{product.making_charges}/g × {product.weight.toFixed(2)}g)</span>
                        <span>₹{prices.makingCharges.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>GST Purity Compliance (3% on subtotal)</span>
                        <span>₹{prices.gst.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between pt-1 font-serif text-sm font-bold text-gold-300">
                        <span className="uppercase tracking-widest text-[10px] text-white/50 self-center">Estimated Total (Inclusive GST)</span>
                        <span className="text-lg">₹{prices.total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Action Hub */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => {
                        handleOpenAR(product);
                        setSelectedProductForDetail(null);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 text-xs font-bold tracking-widest uppercase border border-gold-500/50 text-gold-300 bg-black hover:border-gold-500 hover:bg-gold-500/10 hover:shadow-[0_0_15px_rgba(212,175,55,0.25)] transition-all duration-300 cursor-pointer"
                    >
                      <Sparkles size={14} className="animate-pulse text-gold-500" />
                      Try AR Showcase
                    </button>
                    
                    <button
                      onClick={() => {
                        addToCart(product, 1);
                        setSelectedProductForDetail(null);
                        setCartOpen(true);
                      }}
                      disabled={product.stock_count === 0}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 text-xs font-bold tracking-widest uppercase bg-gold-500 hover:bg-gold-300 text-black shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      <ShoppingCart size={14} />
                      {product.stock_count === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>

                </div>

              </div>
            </div>
          );
        })()}

      </main>
      <ARModal />
    </>
  );
}
