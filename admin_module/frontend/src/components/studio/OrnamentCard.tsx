'use client';

import { useStudioStore, Ornament } from '@/store/useStudioStore';
import { Check } from 'lucide-react';

interface OrnamentCardProps {
  ornament: Ornament;
}

export default function OrnamentCard({ ornament }: OrnamentCardProps) {
  const { selectedOrnaments, toggleOrnament } = useStudioStore();
  
  const isSelected = selectedOrnaments.some(o => o.id === ornament.id);

  return (
    <div 
      onClick={() => toggleOrnament(ornament)}
      className={`glow-card relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border ${
        isSelected ? 'border-gold bg-gold/5' : 'border-white/10 glass-panel hover:border-gold/30'
      }`}
    >
      <div className="aspect-square w-full overflow-hidden bg-black/40 p-4 flex items-center justify-center product-img-wrap">
        <img 
          src={ornament.imageUrl} 
          alt={ornament.name} 
          className="w-full h-full object-contain mix-blend-screen"
        />
      </div>
      
      <div className="p-3">
        <h3 className="text-white text-sm font-medium truncate">{ornament.name}</h3>
        <p className="gold-text-gradient text-xs mt-1 font-semibold">
          ₹{ornament.price.toLocaleString('en-IN')}
        </p>
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gold flex items-center justify-center text-black shadow-lg animate-scaleIn">
          <Check size={14} strokeWidth={3} />
        </div>
      )}
    </div>
  );
}
