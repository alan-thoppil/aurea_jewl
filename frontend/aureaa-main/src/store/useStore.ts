import { create } from 'zustand';
import { removeBackground } from '@/utils/removeBackground';

export interface CartItem {
  sku: string;
  name: string;
  category: string;
  metal: string;
  purity: string;
  weight: number;
  making_charges: number;
  stock_count: number;
  image_url: string;
  description: string;
  quantity: number;
}

export interface ARLayer {
  id: string;
  sku: string;
  image_url: string;
  name: string;
  category: string;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  opacity: number;
}

export interface StoreState {
  cart: CartItem[];
  addToCart: (product: any, quantity: number) => void;
  removeFromCart: (sku: string) => void;
  updateCartQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  
  // AR Multi-Layer Studio State
  arModalOpen: boolean;
  setArModalOpen: (open: boolean) => void;
  
  baseImage: string | null;
  setBaseImage: (dataUrl: string | null) => void;

  layers: ARLayer[];
  selectedLayerId: string | null;
  isExtracting: boolean;
  
  addLayerAsync: (product: any, canvasWidth?: number, canvasHeight?: number) => Promise<void>;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<ARLayer>) => void;
  setSelectedLayerId: (id: string | null) => void;
  clearLayers: () => void;
  
  // To handle the initial product click from the storefront
  initialProduct: any | null;
  setInitialProduct: (product: any | null) => void;

  arMode: 'camera' | 'photo' | null;
  setArMode: (mode: 'camera' | 'photo' | null) => void;
  uploadedPhoto: string | null;
  setUploadedPhoto: (photo: string | null) => void;

  detectedFeatures: { hasFace: boolean; hasHand: boolean; hasPose: boolean } | null;
  setDetectedFeatures: (features: { hasFace: boolean; hasHand: boolean; hasPose: boolean } | null) => void;

  // AI Generation State
  isGeneratingAI: boolean;
  generatedPortrait: string | null;
  generateAIPortrait: (mergedImage: string) => Promise<void>;
  clearGeneratedPortrait: () => void;
  
  // Isolated Try-On State
  isIsolatedTryOn: boolean;
  setIsIsolatedTryOn: (isolated: boolean) => void;
}

export const useStore = create<StoreState>((set) => ({
  cart: [],
  addToCart: (product, quantity) => set((state) => {
    const existing = state.cart.find((item) => item.sku === product.sku);
    if (existing) {
      if (existing.quantity >= product.stock_count) return state; // Block over-ordering
      return {
        cart: state.cart.map((item) =>
          item.sku === product.sku ? { ...item, quantity: item.quantity + quantity } : item
        )
      };
    }
    return { cart: [...state.cart, { ...product, quantity }] };
  }),
  removeFromCart: (sku) => set((state) => ({
    cart: state.cart.filter((item) => item.sku !== sku)
  })),
  updateCartQuantity: (sku, quantity) => set((state) => {
    if (quantity <= 0) {
      return { cart: state.cart.filter((item) => item.sku !== sku) };
    }
    return {
      cart: state.cart.map((item) =>
        item.sku === sku ? { ...item, quantity } : item
      )
    };
  }),
  clearCart: () => set({ cart: [] }),

  arModalOpen: false,
  setArModalOpen: (open) => set({ arModalOpen: open }),

  baseImage: null,
  setBaseImage: (dataUrl) => set({ baseImage: dataUrl }),

  layers: [],
  selectedLayerId: null,
  isExtracting: false,

  addLayerAsync: async (product, canvasWidth = 800, canvasHeight = 600) => {
    set({ isExtracting: true });
    try {
      // 1. Extract Ornament (Remove Background)
      const extractedImageUrl = await removeBackground(product.image_url);
      
      const newLayer: ARLayer = {
        id: `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sku: product.sku,
        image_url: extractedImageUrl,
        name: product.name,
        category: product.category,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1
      };
      
      set((state) => ({ 
        layers: [...state.layers, newLayer],
        selectedLayerId: newLayer.id,
        isExtracting: false
      }));
    } catch (error) {
      console.error("Extraction Failed:", error);
      // Fallback: add without extraction if it fails
      const newLayer: ARLayer = {
        id: `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sku: product.sku,
        image_url: product.image_url,
        name: product.name,
        category: product.category,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1
      };
      set((state) => ({ 
        layers: [...state.layers, newLayer],
        selectedLayerId: newLayer.id,
        isExtracting: false
      }));
    }
  },

  removeLayer: (id) => set((state) => ({
    layers: state.layers.filter(layer => layer.id !== id),
    selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId
  })),

  updateLayer: (id, updates) => set((state) => ({
    layers: state.layers.map(layer => layer.id === id ? { ...layer, ...updates } : layer)
  })),

  setSelectedLayerId: (id) => set({ selectedLayerId: id }),

  clearLayers: () => set({ layers: [], selectedLayerId: null }),

  initialProduct: null,
  setInitialProduct: (product) => set({ initialProduct: product }),

  isIsolatedTryOn: false,
  setIsIsolatedTryOn: (isolated) => set({ isIsolatedTryOn: isolated }),

  arMode: null,
  setArMode: (mode) => set({ arMode: mode }),
  uploadedPhoto: null,
  setUploadedPhoto: (photo) => set({ uploadedPhoto: photo }),

  detectedFeatures: null,
  setDetectedFeatures: (features) => set({ detectedFeatures: features }),

  isGeneratingAI: false,
  generatedPortrait: null,
  
  generateAIPortrait: async (mergedImage: string) => {
    const stateVal = useStore.getState();
    const portraitImage = stateVal.uploadedPhoto || stateVal.baseImage;
    const activeLayer = stateVal.layers[0];
    
    if (!portraitImage || !activeLayer) {
      alert("Missing portrait or ornament data.");
      return;
    }

    set({ isGeneratingAI: true });
    try {
      const payload = {
        portraitImage,
        ornamentImage: activeLayer.image_url,
        mergedImage, // Perfectly matched fallback image from AR canvas
        transform: {
          posX: activeLayer.x,
          posY: activeLayer.y,
          scale: activeLayer.scaleX,
          rotation: activeLayer.rotation
        },
        category: activeLayer.category
      };

      const res = await fetch('/api/express/ai/generate-portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.url) {
        set({ generatedPortrait: data.url, isGeneratingAI: false });
      } else {
        throw new Error(data.error || "Failed to generate AI portrait");
      }
    } catch (e: any) {
      console.error(e);
      set({ isGeneratingAI: false });
      alert(e.message || "AI Generation failed. Check API key.");
    }
  },

  clearGeneratedPortrait: () => set({ generatedPortrait: null })
}));
