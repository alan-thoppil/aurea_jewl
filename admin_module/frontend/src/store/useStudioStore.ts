import { create } from 'zustand';

export type Category = 'Necklaces' | 'Earrings' | 'Rings' | 'Bangles';

export interface Ornament {
  id: string;
  name: string;
  category: Category;
  price: number;
  imageUrl: string;
}

interface StudioState {
  uploadedPhoto: string | null;
  selectedCategory: Category;
  selectedOrnaments: Ornament[];
  isARMode: boolean;
  isGeneratingAI: boolean;
  
  setUploadedPhoto: (photo: string | null) => void;
  setSelectedCategory: (category: Category) => void;
  toggleOrnament: (ornament: Ornament) => void;
  toggleARMode: () => void;
  setAIGenerating: (isGenerating: boolean) => void;
  clearStudio: () => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  uploadedPhoto: null,
  selectedCategory: 'Necklaces',
  selectedOrnaments: [],
  isARMode: false,
  isGeneratingAI: false,

  setUploadedPhoto: (photo) => set({ uploadedPhoto: photo, isARMode: false }),
  
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  
  toggleOrnament: (ornament) => set((state) => {
    const exists = state.selectedOrnaments.find(o => o.id === ornament.id);
    if (exists) {
      return {
        selectedOrnaments: state.selectedOrnaments.filter(o => o.id !== ornament.id)
      };
    } else {
      // Allow multiple selections, or we could limit to 1 per category
      // For now, allow multiple since they might stack necklaces or wear multiple rings
      return {
        selectedOrnaments: [...state.selectedOrnaments, ornament]
      };
    }
  }),
  
  toggleARMode: () => set((state) => ({ 
    isARMode: !state.isARMode,
    uploadedPhoto: state.isARMode ? state.uploadedPhoto : null // Clear photo when entering AR
  })),

  setAIGenerating: (isGenerating) => set({ isGeneratingAI: isGenerating }),
  
  clearStudio: () => set({
    uploadedPhoto: null,
    selectedCategory: 'Necklaces',
    selectedOrnaments: [],
    isARMode: false,
    isGeneratingAI: false
  })
}));
