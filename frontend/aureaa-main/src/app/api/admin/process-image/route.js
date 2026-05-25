import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No valid image file provided.' }, { status: 400 });
    }

    const removeBgApiKey = process.env.REMOVE_BG_API_KEY;
    if (!removeBgApiKey) {
      return NextResponse.json({ error: 'Remove.bg API key not configured.' }, { status: 500 });
    }

    // Prepare FormData for Remove.bg API
    const removeBgFormData = new FormData();
    removeBgFormData.append('image_file', file);
    removeBgFormData.append('size', 'auto'); // Auto size for best quality
    removeBgFormData.append('format', 'png'); // Require transparent PNG output

    // Call Remove.bg API
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': removeBgApiKey,
      },
      body: removeBgFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Remove.bg error:', errorText);
      return NextResponse.json({ error: 'Failed to process image with Remove.bg' }, { status: response.status });
    }

    // Get the transparent image buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary using a Promise wrapper
    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'aurea_jewellery',
            resource_type: 'image',
            format: 'png', // ensure PNG
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(buffer);
      });
    };

    const cloudinaryResult = await uploadToCloudinary(buffer);

    return NextResponse.json({
      success: true,
      url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
    }, { status: 200 });

  } catch (error) {
    console.error('Image processing error:', error);
    return NextResponse.json({ error: 'Internal server error processing image.' }, { status: 500 });
  }
}
