import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';

/**
 * True AI Background Removal Engine
 * Extracts jewellery from ANY background using a browser-native WASM segmentation model.
 */
export async function removeBackground(imageUrl: string): Promise<string> {
  try {
    // Create a native HTML image element to bypass fetch() rate-limits or bot protections
    // Unsplash sometimes returns HTML for fetch() requests but allows standard image loads.
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error("Failed to load image securely"));
      img.src = imageUrl;
    });

    // Convert the image to a Blob via Canvas to guarantee a pure, supported format for imgly
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not get 2d context");
    ctx.drawImage(img, 0, 0);
    
    const sourceBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error("Canvas to Blob failed"));
      }, 'image/png');
    });

    // We use the WASM-based background removal which runs completely client-side.
    // Pass an empty config object {} to prevent internal destructuring bugs in 1.7.0.
    // @ts-ignore
    const imageBlob = await imglyRemoveBackground(sourceBlob, {});
    
    // Convert the returned Blob into a Base64 Data URL for Konva to render
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(imageBlob);
    });
  } catch (error) {
    console.error("AI Background Removal Failed:", error);
    throw error;
  }
}
