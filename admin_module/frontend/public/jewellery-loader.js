/**
 * AUREA × JewelPro - Premium AR Jewellery Image Loader
 * Handles preloading, caching, and CORS management of transparent luxury ornaments.
 */

const JEWELLERY_ITEMS = [
  {
    sku: 'N1',
    name: 'AUREA Royal Diamond Drop',
    category: 'necklace',
    price: '₹1,25,000',
    description: 'High-carat brilliant diamonds set on an elegant eighteen-karat white gold chain.',
    imageUrl: '/images/diamond_necklace.png'
  },
  {
    sku: 'N2',
    name: 'Kundan Bridal Choker',
    category: 'necklace',
    price: '₹2,50,000',
    description: 'Traditional heritage Indian choker set with raw uncut diamonds and rich enamel detailing.',
    imageUrl: '/images/kundan_choker.png'
  },
  {
    sku: 'N3',
    name: 'Rose Gold Minimal Chain',
    category: 'necklace',
    price: '₹45,000',
    description: 'Charming daily-wear solid rose gold link chain, displaying subtle and elegant craftsmanship.',
    imageUrl: '/images/rose_gold_chain.png'
  },
  {
    sku: 'E1',
    name: 'Diamond Chandelier Cascades',
    category: 'earring',
    price: '₹85,000',
    description: 'Luxurious hanging chandelier earrings layered with hand-cut premium crystals and diamonds.',
    imageUrl: '/images/diamond_chandelier_earrings.png'
  },
  {
    sku: 'E2',
    name: 'Gold Star Studs',
    category: 'earring',
    price: '₹15,000',
    description: 'Symmetrical five-point star ornaments forged in twenty-two-karat BIS hallmarked yellow gold.',
    imageUrl: '/images/gold_star_studs.png'
  },
  {
    sku: 'E3',
    name: 'Classic Pearl Studs',
    category: 'earring',
    price: '₹28,000',
    description: 'Flawlessly spherical white freshwater pearls paired with white gold push-back anchors.',
    imageUrl: '/images/pearl_studs.png'
  },
  {
    sku: 'R1',
    name: 'Empress Sapphire Ring',
    category: 'ring',
    price: '₹95,000',
    description: 'Deep royal blue oval-cut sapphire bordered by a halo of brilliant micro-pave diamonds.',
    imageUrl: '/images/ring.png'
  },
  {
    sku: 'B1',
    name: 'Kundan Heritage Bangle',
    category: 'bangle',
    price: '₹1,80,000',
    description: 'BIS hallmarked heavy traditional Rajasthani bangle adorned with red-green gemstone inlay.',
    imageUrl: '/images/bangle.png'
  },
  {
    sku: 'B2',
    name: 'Silver Charm Bracelet',
    category: 'bangle',
    price: '₹35,000',
    description: 'Modern sterling silver chain link bracelet decorated with luxury geometric charms.',
    imageUrl: '/images/silver_charm_bracelet.png'
  }
];

class JewelleryLoader {
  constructor() {
    this.cache = new Map();
    this.items = JEWELLERY_ITEMS;
  }

  /**
   * Preload all registered jewellery images concurrently.
   * Returns a Promise that resolves when all assets are loaded and cached.
   */
  preloadAll() {
    console.log("AUREA Loader: Initializing luxury asset preloader...");
    const promises = this.items.map(item => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; // Essential to avoid security errors on canvas.toDataURL()
        img.onload = () => {
          this.cache.set(item.sku, img);
          console.log(`AUREA Loader: Preloaded SKU ${item.sku} (${item.name})`);
          resolve({ sku: item.sku, success: true });
        };
        img.onerror = (err) => {
          console.error(`AUREA Loader: Failed to preload SKU ${item.sku} from ${item.imageUrl}`, err);
          // Resolve anyway to prevent blocking the entire app start if one image fails
          resolve({ sku: item.sku, success: false });
        };
        img.src = item.imageUrl;
      });
    });

    return Promise.all(promises);
  }

  /**
   * Retrieve preloaded Image element for a SKU.
   */
  getImage(sku) {
    return this.cache.get(sku) || null;
  }

  /**
   * Get metadata details for a SKU.
   */
  getDetails(sku) {
    return this.items.find(item => item.sku === sku) || null;
  }

  /**
   * Get all items grouped by category.
   */
  getItemsByCategory(category) {
    return this.items.filter(item => item.category === category);
  }
}

// Export a singleton instance globally for simple direct loading
window.jewelleryLoader = new JewelleryLoader();
