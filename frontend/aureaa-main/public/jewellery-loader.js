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

const keyOutBackground = (ctx, width, height) => {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 235 && g > 235 && b > 235) {
      data[i + 3] = 0;
    } else if (r > 215 && g > 215 && b > 215) {
      data[i + 3] = 100;
    }
  }
  ctx.putImageData(imgData, 0, 0);
};

const findConnectedComponents = (img) => {
  const downscaledSize = 256;
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = downscaledSize;
  tempCanvas.height = downscaledSize;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return [];

  tempCtx.drawImage(img, 0, 0, downscaledSize, downscaledSize);
  const imgData = tempCtx.getImageData(0, 0, downscaledSize, downscaledSize);
  const pixels = imgData.data;

  const visited = new Uint8Array(downscaledSize * downscaledSize);
  const components = [];

  const isBg = (x, y) => {
    const idx = (y * downscaledSize + x) * 4;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];
    return r > 235 && g > 235 && b > 235;
  };

  for (let y = 0; y < downscaledSize; y++) {
    for (let x = 0; x < downscaledSize; x++) {
      const idx = y * downscaledSize + x;
      if (visited[idx] || isBg(x, y)) continue;

      let minX = x, maxX = x, minY = y, maxY = y;
      const queue = [x, y];
      let head = 0;
      visited[idx] = 1;

      while (head < queue.length) {
        const cx = queue[head++];
        const cy = queue[head++];

        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        const neighbors = [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1]
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < downscaledSize && ny >= 0 && ny < downscaledSize) {
            const nIdx = ny * downscaledSize + nx;
            if (!visited[nIdx] && !isBg(nx, ny)) {
              visited[nIdx] = 1;
              queue.push(nx, ny);
            }
          }
        }
      }

      const cWidth = maxX - minX + 1;
      const cHeight = maxY - minY + 1;
      const pixelCount = queue.length / 2;

      if (pixelCount > 15) {
        components.push({
          minX,
          maxX,
          minY,
          maxY,
          width: cWidth,
          height: cHeight,
          pixelCount
        });
      }
    }
  }

  components.sort((a, b) => b.pixelCount - a.pixelCount);
  return components;
};

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
    console.log("AUREA Loader: Initializing luxury asset preloader with segmentation...");
    const promises = this.items.map(item => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; // Essential to avoid security errors on canvas.toDataURL()
        img.onload = () => {
          const components = findConnectedComponents(img);
          const category = item.category.toLowerCase();
          
          const scaleX = img.width / 256;
          const scaleY = img.height / 256;

          // Treat as a combo set ONLY if it has 3+ components AND the smaller components are symmetrical earrings.
          // This prevents multi-loop layered chains (e.g. Lightweight Chain) from being incorrectly split into earrings!
          const isComboSet = category.includes('necklace') && 
            components.length >= 3 && (() => {
              const center1 = (components[1].minX + components[1].maxX) / 2;
              const center2 = (components[2].minX + components[2].maxX) / 2;
              return (
                (center1 - 128) * (center2 - 128) < 0 &&
                Math.abs(Math.abs(center1 - 128) - Math.abs(center2 - 128)) < 12 &&
                Math.abs(components[1].minY - components[2].minY) < 12 &&
                Math.abs(components[1].width - components[2].width) < 10 &&
                Math.abs(components[1].height - components[2].height) < 10
              );
            })();

          const hasEarringPair = category.includes('earring') && 
            components.length >= 2 && (() => {
              const center0 = (components[0].minX + components[0].maxX) / 2;
              const center1 = (components[1].minX + components[1].maxX) / 2;
              return (center0 - 128) * (center1 - 128) < 0;
            })();

          if (isComboSet) {
            // Split into cropped necklace and earring textures
            const mainComp = components[0];
            const earringComp = components[1];

            // 1. Crop Necklace and erase earrings
            const neckCanvas = document.createElement("canvas");
            neckCanvas.width = img.width;
            neckCanvas.height = img.height;
            const neckCtx = neckCanvas.getContext("2d");
            if (neckCtx) {
              neckCtx.drawImage(img, 0, 0);
              keyOutBackground(neckCtx, img.width, img.height);
              for (let i = 1; i < components.length; i++) {
                const comp = components[i];
                const ex = Math.max(0, Math.floor(comp.minX * scaleX));
                const ey = Math.max(0, Math.floor(comp.minY * scaleY));
                const ew = Math.min(img.width - ex, Math.ceil(comp.width * scaleX));
                const eh = Math.min(img.height - ey, Math.ceil(comp.height * scaleY));
                neckCtx.clearRect(ex, ey, ew, eh);
              }

              // Recompute tight bounding box
              const neckData = neckCtx.getImageData(0, 0, img.width, img.height).data;
              let tightMinX = img.width, tightMaxX = 0, tightMinY = img.height, tightMaxY = 0;
              let hasNeckPixels = false;
              for (let y = 0; y < img.height; y++) {
                for (let x = 0; x < img.width; x++) {
                  const idx = (y * img.width + x) * 4;
                  if (neckData[idx + 3] > 0) {
                    hasNeckPixels = true;
                    if (x < tightMinX) tightMinX = x;
                    if (x > tightMaxX) tightMaxX = x;
                    if (y < tightMinY) tightMinY = y;
                    if (y > tightMaxY) tightMaxY = y;
                  }
                }
              }
              const tW = hasNeckPixels ? (tightMaxX - tightMinX + 1) : img.width;
              const tH = hasNeckPixels ? (tightMaxY - tightMinY + 1) : img.height;
              const tX = hasNeckPixels ? tightMinX : 0;
              const tY = hasNeckPixels ? tightMinY : 0;

              const finalNeckCanvas = document.createElement("canvas");
              finalNeckCanvas.width = tW;
              finalNeckCanvas.height = tH;
              const finalNeckCtx = finalNeckCanvas.getContext("2d");
              if (finalNeckCtx) {
                finalNeckCtx.drawImage(neckCanvas, tX, tY, tW, tH, 0, 0, tW, tH);
                this.cache.set(item.sku, finalNeckCanvas);
              }
            }

            // 2. Crop Earring
            const earX = Math.max(0, Math.floor(earringComp.minX * scaleX));
            const earY = Math.max(0, Math.floor(earringComp.minY * scaleY));
            const earW = Math.min(img.width - earX, Math.ceil(earringComp.width * scaleX));
            const earH = Math.min(img.height - earY, Math.ceil(earringComp.height * scaleY));

            const earCanvas = document.createElement("canvas");
            earCanvas.width = earW;
            earCanvas.height = earH;
            const earCtx = earCanvas.getContext("2d");
            if (earCtx) {
              earCtx.drawImage(img, earX, earY, earW, earH, 0, 0, earW, earH);
              keyOutBackground(earCtx, earW, earH);
              const sqSize = Math.max(earW, earH);
              const sqCanvas = document.createElement("canvas");
              sqCanvas.width = sqSize;
              sqCanvas.height = sqSize;
              const sqCtx = sqCanvas.getContext("2d");
              if (sqCtx) {
                const offsetX = (sqSize - earW) / 2;
                const offsetY = (sqSize - earH) / 2;
                sqCtx.drawImage(earCanvas, offsetX, offsetY);
                this.cache.set(item.sku + '_earring', sqCanvas);
              }
            }
          } else if (hasEarringPair) {
            // Crop single earring
            const earringComp = components[0];
            const earX = Math.max(0, Math.floor(earringComp.minX * scaleX));
            const earY = Math.max(0, Math.floor(earringComp.minY * scaleY));
            const earW = Math.min(img.width - earX, Math.ceil(earringComp.width * scaleX));
            const earH = Math.min(img.height - earY, Math.ceil(earringComp.height * scaleY));

            const earCanvas = document.createElement("canvas");
            earCanvas.width = earW;
            earCanvas.height = earH;
            const earCtx = earCanvas.getContext("2d");
            if (earCtx) {
              earCtx.drawImage(img, earX, earY, earW, earH, 0, 0, earW, earH);
              keyOutBackground(earCtx, earW, earH);
              const sqSize = Math.max(earW, earH);
              const sqCanvas = document.createElement("canvas");
              sqCanvas.width = sqSize;
              sqCanvas.height = sqSize;
              const sqCtx = sqCanvas.getContext("2d");
              if (sqCtx) {
                const offsetX = (sqSize - earW) / 2;
                const offsetY = (sqSize - earH) / 2;
                sqCtx.drawImage(earCanvas, offsetX, offsetY);
                this.cache.set(item.sku, sqCanvas);
              }
            }
          } else {
            // General single item: key out background and crop to tightest bounding box
            let minX = 255, maxX = 0, minY = 255, maxY = 0;
            if (components.length > 0) {
              components.forEach(c => {
                if (c.minX < minX) minX = c.minX;
                if (c.maxX > maxX) maxX = c.maxX;
                if (c.minY < minY) minY = c.minY;
                if (c.maxY > maxY) maxY = c.maxY;
              });
            } else {
              minX = 0; maxX = 255; minY = 0; maxY = 255;
            }
            const compWidth = maxX - minX + 1;
            const compHeight = maxY - minY + 1;
            const cX = Math.max(0, Math.floor(minX * scaleX));
            const cY = Math.max(0, Math.floor(minY * scaleY));
            const cW = Math.min(img.width - cX, Math.ceil(compWidth * scaleX));
            const cH = Math.min(img.height - cY, Math.ceil(compHeight * scaleY));

            const cropCanvas = document.createElement("canvas");
            cropCanvas.width = cW;
            cropCanvas.height = cH;
            const cropCtx = cropCanvas.getContext("2d");
            if (cropCtx) {
              cropCtx.drawImage(img, cX, cY, cW, cH, 0, 0, cW, cH);
              keyOutBackground(cropCtx, cW, cH);
              this.cache.set(item.sku, cropCanvas);
            }
          }

          console.log(`AUREA Loader: Preloaded & split/cropped SKU ${item.sku} (${item.name})`);
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
