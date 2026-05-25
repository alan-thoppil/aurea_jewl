import { useStore } from '@/store/useStore';
import { useAppState } from '@/context/StateContext';

export const ProductSelector = ({ activeProduct, setActiveProduct }) => {
  const { products } = useAppState();
  const { isIsolatedTryOn } = useStore();

  if (isIsolatedTryOn) return null;

  // Filter to show all AR-compatible jewelry categories
  const tryOnProducts = products.filter(p => {
    const cat = p.category.toLowerCase();
    return cat.includes('necklace') || 
           cat.includes('pendant') || 
           cat.includes('earring') || 
           cat.includes('ring') || 
           cat.includes('bangle');
  });

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-x-auto max-w-[90vw] scrollbar-hide shadow-2xl">
      {tryOnProducts.map((product) => (
        <button
          key={product.sku}
          onClick={() => setActiveProduct(product)}
          className={`relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
            activeProduct?.sku === product.sku 
              ? 'border-gold-500 scale-110 shadow-[0_0_15px_rgba(212,175,55,0.5)]' 
              : 'border-transparent hover:border-white/30'
          }`}
        >
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover bg-zinc-900"
          />
        </button>
      ))}
    </div>
  );
};
