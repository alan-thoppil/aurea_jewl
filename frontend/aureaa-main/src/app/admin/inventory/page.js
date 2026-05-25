"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppState } from "@/context/StateContext";
import GlowCard from "@/components/ui/GlowCard";
import GoldButton from "@/components/ui/GoldButton";
import Modal from "@/components/ui/Modal";
import { Plus, Edit3, Trash2, Search, Sliders, Boxes } from "lucide-react";

const inventorySchema = z.object({
  sku: z.string().min(3, "SKU is required"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  category: z.string().min(1, "Category is required"),
  metal: z.string().min(1, "Metal is required"),
  purity: z.string().min(1, "Purity is required"),
  weight: z.coerce.number().min(0.01, "Weight must be greater than 0"),
  making_charges: z.coerce.number().min(0, "Charges cannot be negative"),
  stock_count: z.coerce.number().int().min(0, "Stock cannot be negative"),
  image_url: z.string().url("Must be a valid URL"),
  description: z.string().optional(),
});

export default function InventoryPage() {
  const {
    products,
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem
  } = useAppState();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Modal controls
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSku, setSelectedSku] = useState("");

  const {
    register: registerInv,
    handleSubmit: handleInvSubmit,
    reset: resetInvForm,
    setValue: setInvValue,
    formState: { errors: invErrors }
  } = useForm({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      sku: "",
      name: "",
      category: "Rings",
      metal: "Gold",
      purity: "18K",
      weight: 0,
      making_charges: 0,
      stock_count: 5,
      image_url: "",
      description: ""
    }
  });

  const categories = ["All", "Rings", "Necklaces", "Earrings", "Bangles", "Anklets"];

  const handleOpenAdd = () => {
    setEditMode(false);
    setSelectedSku("");
    resetInvForm({
      sku: `AU-SKU-${Date.now().toString().slice(-4)}`,
      name: "",
      category: "Rings",
      metal: "Gold",
      purity: "18K",
      weight: 5.2,
      making_charges: 500,
      stock_count: 5,
      image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
      description: "An elegant custom atelier craft piece."
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditMode(true);
    setSelectedSku(product.sku);
    resetInvForm({
      sku: product.sku,
      name: product.name,
      category: product.category,
      metal: product.metal,
      purity: product.purity,
      weight: product.weight,
      making_charges: product.making_charges,
      stock_count: product.stock_count,
      image_url: product.image_url,
      description: product.description
    });
    setModalOpen(true);
  };

  const onValidInvSubmit = (data) => {
    if (editMode) {
      updateInventoryItem(selectedSku, data);
    } else {
      const exists = products.find((p) => p.sku.toLowerCase() === data.sku.trim().toLowerCase());
      if (exists) {
        alert(`SKU "${data.sku}" already catalogued.`);
        return;
      }
      addInventoryItem(data);
    }
    setModalOpen(false);
  };

  const handleDelete = (sku) => {
    if (confirm(`Are you absolutely sure you want to delete piece SKU: ${sku}?`)) {
      removeInventoryItem(sku);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.metal.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCat = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col gap-6 text-left animate-fadeIn">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif tracking-widest uppercase text-white">Inventory desk</h1>
          <p className="text-xs text-white/50 tracking-wider uppercase mt-1">Catalog logistics & SKU stock controls</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1 px-4 py-2.5 text-xs tracking-widest font-semibold uppercase bg-gold-500 text-black hover:bg-gold-300 transition-all cursor-pointer"
        >
          <Plus size={14} />
          Create SKU
        </button>
      </div>

      {/* Search & Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        
        {/* Search bar */}
        <div className="lg:col-span-4 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU, description..."
            className="w-full bg-zinc-950 border border-white/10 px-3 py-2.5 pl-9 text-xs text-white focus:outline-none focus:border-gold-500 focus:ring-0"
          />
          <Search size={14} className="absolute left-3 top-3 text-white/40" />
        </div>

        {/* Categories Tab */}
        <div className="lg:col-span-8 flex gap-2 overflow-x-auto scrollbar pb-2 lg:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 border text-xs tracking-widest uppercase shrink-0 rounded-none transition-all cursor-pointer ${
                activeCategory === cat
                  ? "border-gold-500 bg-gold-500/10 text-gold-300 font-semibold"
                  : "border-white/5 bg-zinc-950 text-white/50 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Inventory Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="glass-panel py-20 bg-zinc-950/40 text-center text-xs text-white/30 uppercase tracking-widest flex flex-col items-center gap-3">
          <Boxes size={40} strokeWidth={1} className="text-gold-500/40" />
          <span>No inventory products match criteria.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <GlowCard key={p.sku} className="flex flex-col h-full bg-zinc-950/60 p-0 border border-white/5 group relative">
              
              {/* Product Thumbnail */}
              <div className="w-full aspect-video bg-zinc-900 overflow-hidden border-b border-white/5 relative">
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Stock Badges */}
                <div className="absolute top-3 left-3">
                  {p.stock_count === 0 ? (
                    <span className="bg-zinc-800 border border-white/10 text-[9px] px-2 py-0.5 uppercase tracking-widest text-white/60 font-semibold font-sans">
                      Out of Stock
                    </span>
                  ) : p.stock_count <= 3 ? (
                    <span className="bg-red-950 border border-red-500/30 text-[9px] px-2 py-0.5 uppercase tracking-widest text-red-400 font-semibold font-sans animate-pulse">
                      Low Stock: {p.stock_count}
                    </span>
                  ) : (
                    <span className="bg-green-950 border border-green-500/30 text-[9px] px-2 py-0.5 uppercase tracking-widest text-green-400 font-semibold font-sans">
                      Billed: {p.stock_count}
                    </span>
                  )}
                </div>
              </div>

              {/* Product specifics */}
              <div className="p-5 flex-1 flex flex-col justify-between text-left gap-4">
                
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[9px] text-white/40 uppercase tracking-widest">
                    <span>{p.category}</span>
                    <span className="font-semibold text-gold-500">{p.purity} {p.metal}</span>
                  </div>
                  <h3 className="text-sm font-serif font-semibold text-white tracking-wide truncate group-hover:text-gold-300">
                    {p.name}
                  </h3>
                  <div className="text-[10px] text-white/50 flex flex-col gap-0.5 font-light tracking-wide">
                    <div>Weight: <span className="font-medium text-white/80">{p.weight.toFixed(2)}g</span></div>
                    <div>Making: <span className="font-medium text-white/80">₹{p.making_charges}/g</span></div>
                  </div>
                  <p className="text-[10px] text-white/40 line-clamp-2 mt-1 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                {/* Operations Edit/Delete */}
                <div className="flex gap-2 border-t border-white/5 pt-4 mt-1">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="flex-1 py-2 border border-white/10 text-white/60 hover:text-gold-300 hover:border-gold-500/30 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-widest cursor-pointer bg-zinc-950 transition-colors"
                  >
                    <Edit3 size={10} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.sku)}
                    className="px-3 py-2 border border-white/10 text-white/40 hover:text-red-400 hover:border-red-500/30 flex items-center justify-center cursor-pointer bg-zinc-950 transition-colors"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>

              </div>

            </GlowCard>
          ))}
        </div>
      )}

      {/* ADD/EDIT INVENTORY MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editMode ? "Modify Catalogue Product" : "Enroll New Product"}
        className="max-w-2xl"
      >
        <form onSubmit={handleInvSubmit(onValidInvSubmit)} className="flex flex-col gap-5 text-xs text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase text-white/50 tracking-wider">Product SKU *</label>
              <input
                type="text"
                {...registerInv("sku")}
                readOnly={editMode}
                className={`w-full bg-black border ${invErrors.sku ? 'border-red-500' : 'border-white/10'} px-3 py-2.5 text-white focus:outline-none focus:border-gold-500 ${editMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {invErrors.sku && <span className="text-red-400 text-[9px] uppercase">{invErrors.sku.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase text-white/50 tracking-wider">Product Name *</label>
              <input
                type="text"
                {...registerInv("name")}
                className={`w-full bg-black border ${invErrors.name ? 'border-red-500' : 'border-white/10'} px-3 py-2.5 text-white focus:outline-none focus:border-gold-500`}
                placeholder="Royal Diamond Ring"
              />
              {invErrors.name && <span className="text-red-400 text-[9px] uppercase">{invErrors.name.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase text-white/50 tracking-wider">Category</label>
              <select
                {...registerInv("category")}
                className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500 appearance-none"
              >
                {categories.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase text-white/50 tracking-wider">Metal Type</label>
              <select
                {...registerInv("metal")}
                className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500 appearance-none"
              >
                <option value="Gold">Gold</option>
                <option value="Rose Gold">Rose Gold</option>
                <option value="Platinum">Platinum</option>
                <option value="Silver">Silver</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase text-white/50 tracking-wider">Purity</label>
              <select
                {...registerInv("purity")}
                className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500 appearance-none"
              >
                <option value="24K">24K</option>
                <option value="22K">22K</option>
                <option value="18K">18K</option>
                <option value="14K">14K</option>
                <option value="PT950">PT950</option>
                <option value="925">925 Sterling</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase text-white/50 tracking-wider">Weight (Grams) *</label>
              <input
                type="number"
                step="0.01"
                {...registerInv("weight")}
                className={`w-full bg-black border ${invErrors.weight ? 'border-red-500' : 'border-white/10'} px-3 py-2.5 text-white focus:outline-none focus:border-gold-500`}
              />
              {invErrors.weight && <span className="text-red-400 text-[9px] uppercase">{invErrors.weight.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase text-white/50 tracking-wider">Making Charges /gm (₹) *</label>
              <input
                type="number"
                step="0.01"
                {...registerInv("making_charges")}
                className={`w-full bg-black border ${invErrors.making_charges ? 'border-red-500' : 'border-white/10'} px-3 py-2.5 text-white focus:outline-none focus:border-gold-500`}
              />
              {invErrors.making_charges && <span className="text-red-400 text-[9px] uppercase">{invErrors.making_charges.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase text-white/50 tracking-wider">Stock Count *</label>
              <input
                type="number"
                step="1"
                {...registerInv("stock_count")}
                className={`w-full bg-black border ${invErrors.stock_count ? 'border-red-500' : 'border-white/10'} px-3 py-2.5 text-white focus:outline-none focus:border-gold-500`}
              />
              {invErrors.stock_count && <span className="text-red-400 text-[9px] uppercase">{invErrors.stock_count.message}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase text-white/50 tracking-wider">High-Res Image URL *</label>
            <input
              type="url"
              {...registerInv("image_url")}
              className={`w-full bg-black border ${invErrors.image_url ? 'border-red-500' : 'border-white/10'} px-3 py-2.5 text-white focus:outline-none focus:border-gold-500`}
            />
            {invErrors.image_url && <span className="text-red-400 text-[9px] uppercase">{invErrors.image_url.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase text-white/50 tracking-wider">Product Story (Description)</label>
            <textarea
              {...registerInv("description")}
              rows={3}
              className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500 resize-none"
            ></textarea>
          </div>

          <GoldButton type="submit" className="w-full py-4 text-xs font-bold mt-2">
            {editMode ? "Update Product Record" : "Enroll Product to Catalogue"}
          </GoldButton>
        </form>
      </Modal>

    </div>
  );
}
