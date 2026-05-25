'use client';

import { useStudioStore, Category } from '@/store/useStudioStore';
import { DUMMY_ORNAMENTS } from '@/app/studio/dummyData';
import OrnamentCard from './OrnamentCard';

const CATEGORIES: Category[] = ['Necklaces', 'Earrings', 'Rings', 'Bangles'];

export default function Sidebar() {
  const { selectedCategory, setSelectedCategory } = useStudioStore();

  const filteredOrnaments = DUMMY_ORNAMENTS.filter(o => o.category === selectedCategory);

  return (
    <div className="w-full h-full flex flex-col glass-panel-heavy border-l border-gold/10">
      <div className="p-6 pb-2">
        <h2 className="font-serif text-2xl text-white mb-6">Collections</h2>
        
        {/* Category Tabs */}
        <div className="flex overflow-x-auto scrollbar gap-2 pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm transition-all whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-gold text-black font-medium'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Ornament Grid */}
      <div className="flex-1 overflow-y-auto scrollbar p-6 pt-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredOrnaments.map(ornament => (
            <OrnamentCard key={ornament.id} ornament={ornament} />
          ))}
          {filteredOrnaments.length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-500 text-sm">
              No items available in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
