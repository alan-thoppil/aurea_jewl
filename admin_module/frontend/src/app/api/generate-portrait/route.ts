import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import sharp from 'sharp';

export const maxDuration = 60; // Allow long execution time for AI inference

export async function POST(req: Request) {
  try {
    const { portraitImage, ornamentImage, transform, category, mergedImage } = await req.json();

    if (!portraitImage || !ornamentImage) {
      return NextResponse.json({ error: 'Portrait and Ornament images are required' }, { status: 400 });
    }

    // Fast path: if Replicate Token is missing, instantly fallback to returning the EXACT matched merged canvas
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken || replicateToken === 'your-replicate-token' || replicateToken.trim() === '') {
      console.warn("REPLICATE_API_TOKEN is missing. Returning the exact frontend AR canvas match as a fallback.");
      return NextResponse.json({ success: true, url: mergedImage || portraitImage, warning: "Used exact frontend AR match due to missing Replicate token." }, { status: 200 });
    }

    // 4. Send to Replicate
    console.log("Sending composited image to Replicate...");
    
    // We use the 'mergedImage' (the perfect WebGL frontend snapshot) as the base for AI Inpainting,
    // because it already contains the true 3D spatial positioning, depth, and HDR lighting!
    // If mergedImage is somehow missing, we fallback to the raw portrait image.
    const replicateInputImage = mergedImage || portraitImage;

    const replicate = new Replicate({
      auth: replicateToken,
    });

    // Using SDXL Image-to-Image for realistic photorealistic blending
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          image: replicateInputImage,
          prompt: `Photorealistic luxury ${category || 'jewellery'} portrait. The person is naturally wearing the jewellery ornament. Preserve facial identity, preserve hairstyle, preserve clothing, realistic shadows, luxury cinematic lighting, Vogue magazine cover, 8k resolution, photorealistic`,
          negative_prompt: "cartoon, illustration, mutated, deformed, ugly, bad anatomy, bad proportions, unnatural skin, broken jewellery",
          prompt_strength: 0.35, // Low denoising strength to preserve the original face identity entirely
          num_inference_steps: 30,
          refine: "expert_ensemble_refiner",
          high_noise_frac: 0.8
        }
      }
    );

    // output is an array of URLs for SDXL
    if (Array.isArray(output) && output.length > 0) {
      return NextResponse.json({ success: true, url: output[0] }, { status: 200 });
    }

    throw new Error("Replicate generated no output");
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to generate AI portrait' }, { status: 500 });
  }
}
