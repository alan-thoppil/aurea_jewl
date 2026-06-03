import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'NVIDIA_API_KEY is not configured.' }, { status: 500 });
    }

    // Convert base64 data URL to raw base64 string
    const base64Image = image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    try {
      const response = await fetch("https://ai.api.nvidia.com/v1/genai/stabilityai/sdxl-turbo", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: "Photorealistic luxury jewellery portrait, cinematic lighting, editorial style, high resolution, glowing metallic reflections, Vogue magazine cover, 8k, realistic shadows, natural fitting",
              weight: 1
            }
          ],
          init_image: base64Image,
          seed: 0,
          steps: 2
        })
      });

      if (!response.ok) {
        throw new Error(`NVIDIA API failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle base64 response
      if (data.artifacts && data.artifacts[0] && data.artifacts[0].base64) {
        const finalDataUrl = `data:image/png;base64,${data.artifacts[0].base64}`;
        return NextResponse.json({ success: true, url: finalDataUrl }, { status: 200 });
      } else {
        throw new Error("No image returned from NVIDIA API");
      }
    } catch (apiError) {
      console.warn("NVIDIA API failed, using fallback mock generation:", apiError);
      
      // Fallback: If the API key is invalid or unauthorized, return the original image 
      // so the user can still test the UI slider and generation flow without crashing.
      const fallbackUrl = `data:image/png;base64,${base64Image}`;
      return NextResponse.json({ success: true, url: fallbackUrl, warning: "Used fallback due to API error" }, { status: 200 });
    }
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: 'Failed to generate AI portrait' }, { status: 500 });
  }
}
