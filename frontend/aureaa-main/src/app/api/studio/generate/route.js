import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: 'REPLICATE_API_TOKEN is not configured.' }, { status: 500 });
    }

    // SDXL Image-to-Image approach
    // We use a low prompt_strength (0.35-0.45) to preserve the user's face exactly,
    // but allow the AI to "bake" the jewelry into the skin with realistic shadows and cinematic lighting.
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          image: image,
          prompt: "Photorealistic luxury jewellery portrait, cinematic lighting, editorial style, detailed gemstone, glowing metallic reflections, Vogue magazine cover, 8k resolution, highly detailed, realistic shadows",
          negative_prompt: "cartoon, illustration, mutated, deformed, ugly, bad anatomy, bad proportions, unnatural skin",
          prompt_strength: 0.35, 
          num_inference_steps: 30,
          guidance_scale: 7.5,
          refine: "expert_ensemble_refiner",
          high_noise_frac: 0.8
        }
      }
    );

    // output is typically an array of URLs for SDXL
    const generatedUrl = Array.isArray(output) ? output[0] : output;

    return NextResponse.json({ success: true, url: generatedUrl }, { status: 200 });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: 'Failed to generate AI portrait' }, { status: 500 });
  }
}
