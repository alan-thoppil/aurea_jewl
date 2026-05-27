const sharp = require('sharp');
const path = require('path');

const imgPath = 'c:/Users/ALAN TOM/Documents/acadeni_int/aurea_jewl/frontend/aureaa-main/public/images/diamond_chandelier_earrings.png';

async function check() {
  try {
    const metadata = await sharp(imgPath).metadata();
    console.log("Metadata:", metadata);
    
    // Let's check some pixels to see if it's completely white or has content
    const { data } = await sharp(imgPath).raw().toBuffer({ resolveWithObject: true });
    
    let nonWhiteCount = 0;
    let nonTransparentCount = 0;
    
    for (let i = 0; i < data.length; i += metadata.channels) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      const a = metadata.channels === 4 ? data[i+3] : 255;
      
      if (!(r > 240 && g > 240 && b > 240)) {
        nonWhiteCount++;
      }
      if (a > 10) {
        nonTransparentCount++;
      }
    }
    
    console.log(`Total pixels: ${metadata.width * metadata.height}`);
    console.log(`Non-white pixels: ${nonWhiteCount}`);
    console.log(`Non-transparent pixels: ${nonTransparentCount}`);
    
  } catch (err) {
    console.error("Error:", err);
  }
}

check();
