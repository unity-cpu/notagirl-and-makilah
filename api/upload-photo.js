import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false, // Important for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Basic security: check a shared secret (optional but recommended)
  if (process.env.UPLOAD_SECRET && req.headers['x-upload-secret'] !== process.env.UPLOAD_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create a unique filename
    const timestamp = Date.now();
    const ext = file.name.split('.').pop();
    const filename = `uploads/${timestamp}.${ext}`;

    const blob = await put(filename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.status(200).json({ url: blob.url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}