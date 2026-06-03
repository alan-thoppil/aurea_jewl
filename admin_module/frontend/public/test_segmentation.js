const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const imgPath = 'c:/Users/ALAN TOM/Documents/acadeni_int/aurea_jewl/frontend/aureaa-main/public/images/diamond_necklace.png';
const outputNecklacePath = 'c:/Users/ALAN TOM/Documents/acadeni_int/aurea_jewl/frontend/aureaa-main/public/images/test_necklace_split.png';
const outputEarringPath = 'c:/Users/ALAN TOM/Documents/acadeni_int/aurea_jewl/frontend/aureaa-main/public/images/test_earring_split.png';

async function run() {
  try {
    console.log("Analyzing image...");
    const image = sharp(imgPath);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    
    const width = info.width;
    const height = info.height;
    const channels = info.channels;
    
    console.log(`Dimensions: ${width}x${height}`);
    
    // We downscale to 256x256 to run connected component analysis
    const downscaledSize = 256;
    const downscaledBuffer = await sharp(imgPath)
      .resize(downscaledSize, downscaledSize, { fit: 'fill' })
      .raw()
      .toBuffer();
      
    function isBg(x, y) {
      const idx = (y * downscaledSize + x) * channels;
      const r = downscaledBuffer[idx];
      const g = downscaledBuffer[idx+1];
      const b = downscaledBuffer[idx+2];
      return (r > 235 && g > 235 && b > 235);
    }
    
    const visited = new Uint8Array(downscaledSize * downscaledSize);
    const components = [];
    
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
          components.push({ minX, maxX, minY, maxY, width: cWidth, height: cHeight, pixelCount });
        }
      }
    }
    
    console.log(`Found ${components.length} components.`);
    // Sort components by pixelCount descending
    components.sort((a, b) => b.pixelCount - a.pixelCount);
    
    if (components.length >= 3) {
      console.log("Detected set with necklace and earrings!");
      
      const scaleX = width / downscaledSize;
      const scaleY = height / downscaledSize;
      
      const mainComp = components[0]; // Necklace
      const earringComp1 = components[1]; // Left/Right Earring
      const earringComp2 = components[2]; // Right/Left Earring
      
      console.log(`Necklace: Box [${mainComp.minX}, ${mainComp.minY}] to [${mainComp.maxX}, ${mainComp.maxY}]`);
      console.log(`Earring 1: Box [${earringComp1.minX}, ${earringComp1.minY}] to [${earringComp1.maxX}, ${earringComp1.maxY}]`);
      console.log(`Earring 2: Box [${earringComp2.minX}, ${earringComp2.minY}] to [${earringComp2.maxX}, ${earringComp2.maxY}]`);
      
      // 1. Crop Necklace
      const neckLeft = Math.max(0, Math.floor(mainComp.minX * scaleX));
      const neckTop = Math.max(0, Math.floor(mainComp.minY * scaleY));
      const neckWidth = Math.min(width - neckLeft, Math.ceil(mainComp.width * scaleX));
      const neckHeight = Math.min(height - neckTop, Math.ceil(mainComp.height * scaleY));
      
      console.log(`Cropping necklace: left=${neckLeft}, top=${neckTop}, width=${neckWidth}, height=${neckHeight}`);
      
      const neckCropped = await sharp(imgPath)
        .extract({ left: neckLeft, top: neckTop, width: neckWidth, height: neckHeight })
        .toBuffer();
        
      // Apply alpha keying to remove background
      const neckMeta = await sharp(neckCropped).metadata();
      const { data: neckData } = await sharp(neckCropped).raw().toBuffer({ resolveWithObject: true });
      const neckAlphaData = Buffer.alloc(neckMeta.width * neckMeta.height * 4);
      
      for (let i = 0, j = 0; i < neckData.length; i += 3, j += 4) {
        const r = neckData[i];
        const g = neckData[i+1];
        const b = neckData[i+2];
        neckAlphaData[j] = r;
        neckAlphaData[j+1] = g;
        neckAlphaData[j+2] = b;
        
        if (r > 235 && g > 235 && b > 235) {
          neckAlphaData[j+3] = 0;
        } else if (r > 215 && g > 215 && b > 215) {
          neckAlphaData[j+3] = 100;
        } else {
          neckAlphaData[j+3] = 255;
        }
      }
      
      await sharp(neckAlphaData, { raw: { width: neckMeta.width, height: neckMeta.height, channels: 4 } })
        .png()
        .toFile(outputNecklacePath);
        
      console.log(`Saved necklace to ${outputNecklacePath}`);
      
      // 2. Crop Earring (Take the second largest)
      const earLeft = Math.max(0, Math.floor(earringComp1.minX * scaleX));
      const earTop = Math.max(0, Math.floor(earringComp1.minY * scaleY));
      const earWidth = Math.min(width - earLeft, Math.ceil(earringComp1.width * scaleX));
      const earHeight = Math.min(height - earTop, Math.ceil(earringComp1.height * scaleY));
      
      console.log(`Cropping earring: left=${earLeft}, top=${earTop}, width=${earWidth}, height=${earHeight}`);
      
      const earCropped = await sharp(imgPath)
        .extract({ left: earLeft, top: earTop, width: earWidth, height: earHeight })
        .toBuffer();
        
      // Apply alpha keying & place in transparent square canvas
      const earMeta = await sharp(earCropped).metadata();
      const { data: earData } = await sharp(earCropped).raw().toBuffer({ resolveWithObject: true });
      const earAlphaData = Buffer.alloc(earMeta.width * earMeta.height * 4);
      
      for (let i = 0, j = 0; i < earData.length; i += 3, j += 4) {
        const r = earData[i];
        const g = earData[i+1];
        const b = earData[i+2];
        earAlphaData[j] = r;
        earAlphaData[j+1] = g;
        earAlphaData[j+2] = b;
        
        if (r > 235 && g > 235 && b > 235) {
          earAlphaData[j+3] = 0;
        } else if (r > 215 && g > 215 && b > 215) {
          earAlphaData[j+3] = 100;
        } else {
          earAlphaData[j+3] = 255;
        }
      }
      
      const earAlphaBuffer = await sharp(earAlphaData, { raw: { width: earMeta.width, height: earMeta.height, channels: 4 } })
        .png()
        .toBuffer();
        
      const sqSize = Math.max(earMeta.width, earMeta.height) + 16;
      await sharp({
        create: {
          width: sqSize,
          height: sqSize,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      })
      .composite([{
        input: earAlphaBuffer,
        top: Math.floor((sqSize - earMeta.height) / 2),
        left: Math.floor((sqSize - earMeta.width) / 2)
      }])
      .png()
      .toFile(outputEarringPath);
      
      console.log(`Saved earring to ${outputEarringPath}`);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
