const sharp = require('sharp');
const path = require('path');

const imgPath = 'c:/Users/ALAN TOM/Documents/acadeni_int/aurea_jewl/frontend/aureaa-main/public/images/diamond_necklace.png';
const imgPath2 = 'c:/Users/ALAN TOM/Documents/acadeni_int/aurea_jewl/frontend/aureaa-main/public/images/kundan_choker.png';

async function analyze(filePath) {
  console.log(`\nAnalyzing ${path.basename(filePath)}...`);
  try {
    const { data, info } = await sharp(filePath)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;
    const channels = info.channels;

    console.log(`Dimensions: ${width}x${height}, channels: ${channels}`);

    const visited = new Uint8Array(width * height);
    const components = [];

    // Helper to check if pixel is "white/background"
    function isBg(x, y) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      // White threshold
      return (r > 235 && g > 235 && b > 235);
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (visited[idx]) continue;

        if (!isBg(x, y)) {
          // Found a non-background pixel! BFS
          let minX = x, maxX = x, minY = y, maxY = y;
          const queue = [[x, y]];
          visited[idx] = 1;
          let pixelCount = 0;

          while (queue.length > 0) {
            const [cx, cy] = queue.shift();
            pixelCount++;

            if (cx < minX) minX = cx;
            if (cx > maxX) maxX = cx;
            if (cy < minY) minY = cy;
            if (cy > maxY) maxY = cy;

            // Check 4 neighbors
            const neighbors = [
              [cx + 1, cy],
              [cx - 1, cy],
              [cx, cy + 1],
              [cx, cy - 1]
            ];

            for (const [nx, ny] of neighbors) {
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIdx = ny * width + nx;
                if (!visited[nIdx]) {
                  if (!isBg(nx, ny)) {
                    visited[nIdx] = 1;
                    queue.push([nx, ny]);
                  }
                }
              }
            }
          }

          // Filter out very small noise components
          if (pixelCount > 100) {
            components.push({
              minX, maxX, minY, maxY,
              width: maxX - minX + 1,
              height: maxY - minY + 1,
              pixelCount
            });
          }
        }
      }
    }

    console.log(`Found ${components.length} components:`);
    components.forEach((c, idx) => {
      console.log(`Component ${idx + 1}: Bounding Box [${c.minX}, ${c.minY}] to [${c.maxX}, ${c.maxY}], Size ${c.width}x${c.height}, Pixel Count: ${c.pixelCount}`);
    });

  } catch (err) {
    console.error(err);
  }
}

async function run() {
  await analyze(imgPath);
  await analyze(imgPath2);
}

run();
