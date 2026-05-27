const sharp = require('sharp');
const path = require('path');

const imgPath = 'c:/Users/ALAN TOM/Documents/acadeni_int/aurea_jewl/frontend/aureaa-main/public/images/diamond_necklace.png';
const outputNecklacePath = 'c:/Users/ALAN TOM/Documents/acadeni_int/aurea_jewl/frontend/aureaa-main/public/images/test_necklace_split_v2.png';
const outputEarringPath = 'c:/Users/ALAN TOM/Documents/acadeni_int/aurea_jewl/frontend/aureaa-main/public/images/test_earring_split_v2.png';

async function run() {
  try {
    console.log("Analyzing image with v2 segmentation...");
    const image = sharp(imgPath);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    
    const width = info.width;
    const height = info.height;
    const channels = info.channels;
    
    // BFS on downscaled 256x256 image
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
    
    components.sort((a, b) => b.pixelCount - a.pixelCount);
    console.log(`Found ${components.length} components.`);
    
    if (components.length >= 3) {
      const scaleX = width / downscaledSize;
      const scaleY = height / downscaledSize;
      
      const mainComp = components[0]; // Necklace
      const earringComp1 = components[1];
      const earringComp2 = components[2];
      
      // Let's create an alpha buffer of the original image
      const alphaBuffer = Buffer.alloc(width * height * 4);
      
      for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        alphaBuffer[j] = r;
        alphaBuffer[j+1] = g;
        alphaBuffer[j+2] = b;
        
        if (r > 235 && g > 235 && b > 235) {
          alphaBuffer[j+3] = 0;
        } else if (r > 215 && g > 215 && b > 215) {
          alphaBuffer[j+3] = 100;
        } else {
          alphaBuffer[j+3] = 255;
        }
      }
      
      // Now, let's ERASE the earring components from this alpha buffer!
      // We will erase their bounding boxes in original image space
      const eraseBoxes = [earringComp1, earringComp2];
      for (const box of eraseBoxes) {
        const left = Math.max(0, Math.floor(box.minX * scaleX));
        const top = Math.max(0, Math.floor(box.minY * scaleY));
        const right = Math.min(width - 1, Math.ceil(box.maxX * scaleX));
        const bottom = Math.min(height - 1, Math.ceil(box.maxY * scaleY));
        
        console.log(`Erasing earring box: [${left}, ${top}] to [${right}, ${bottom}]`);
        
        for (let y = top; y <= bottom; y++) {
          for (let x = left; x <= right; x++) {
            const idx = (y * width + x) * 4;
            alphaBuffer[idx + 3] = 0; // Make 100% transparent!
          }
        }
      }
      
      // Now, let's find the tight bounding box of the remaining non-transparent pixels in the alpha buffer!
      let tightMinX = width, tightMaxX = 0, tightMinY = height, tightMaxY = 0;
      let remainingCount = 0;
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          if (alphaBuffer[idx + 3] > 0) {
            remainingCount++;
            if (x < tightMinX) tightMinX = x;
            if (x > tightMaxX) tightMaxX = x;
            if (y < tightMinY) tightMinY = y;
            if (y > tightMaxY) tightMaxY = y;
          }
        }
      }
      
      const tightWidth = tightMaxX - tightMinX + 1;
      const tightHeight = tightMaxY - tightMinY + 1;
      
      console.log(`Tight remaining necklace bounding box: [${tightMinX}, ${tightMinY}] to [${tightMaxX}, ${tightMaxY}], Size: ${tightWidth}x${tightHeight}, count: ${remainingCount}`);
      
      // Extract the tight bounding box from the alpha buffer
      const croppedNecklaceData = Buffer.alloc(tightWidth * tightHeight * 4);
      for (let y = tightMinY; y <= tightMaxY; y++) {
        const sourceRowOffset = (y * width + tightMinX) * 4;
        const targetRowOffset = ((y - tightMinY) * tightWidth) * 4;
        alphaBuffer.copy(croppedNecklaceData, targetRowOffset, sourceRowOffset, sourceRowOffset + tightWidth * 4);
      }
      
      await sharp(croppedNecklaceData, { raw: { width: tightWidth, height: tightHeight, channels: 4 } })
        .png()
        .toFile(outputNecklacePath);
        
      console.log(`Successfully saved tight cropped necklace to ${outputNecklacePath}!`);
      
      // Crop and save earring
      const earLeft = Math.max(0, Math.floor(earringComp1.minX * scaleX));
      const earTop = Math.max(0, Math.floor(earringComp1.minY * scaleY));
      const earWidth = Math.min(width - earLeft, Math.ceil(earringComp1.width * scaleX));
      const earHeight = Math.min(height - earTop, Math.ceil(earringComp1.height * scaleY));
      
      const earCropped = await sharp(imgPath)
        .extract({ left: earLeft, top: earTop, width: earWidth, height: earHeight })
        .toBuffer();
        
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
