import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      tags: true,
      max_results: 100,
    });

    // Filter to only those with the 'gallery' tag
    const photos = result.resources
      .filter(r => r.tags && r.tags.includes('gallery'))
      .map(r => r.secure_url);

    return res.status(200).json({ photos });
  } catch (error) {
    console.error('Error listing photos:', error);
    return res.status(500).json({ error: 'Failed to list photos', details: error.message });
  }
}