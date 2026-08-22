import { put } from '@vercel/blob';
import Busboy from 'busboy';

export const config = {
  api: {
    bodyParser: false, // We parse the body ourselves
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const busboy = Busboy({ headers: req.headers });

    let fileBuffer = null;
    let fileMime = '';
    let fileName = '';

    busboy.on('file', (fieldname, file, info) => {
      const chunks = [];
      file.on('data', (chunk) => {
        chunks.push(chunk);
      });
      file.on('end', () => {
        fileBuffer = Buffer.concat(chunks);
        fileMime = info.mimeType;
        fileName = info.filename;
      });
    });

    busboy.on('finish', async () => {
      if (!fileBuffer) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Create a unique filename
      const timestamp = Date.now();
      const ext = fileName.split('.').pop();
      const filename = `uploads/${timestamp}.${ext}`;

      // Upload to Vercel Blob using a Blob object
      const blob = await put(filename, fileBuffer, {
        access: 'public',
        contentType: fileMime,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return res.status(200).json({ url: blob.url });
    });

    busboy.on('error', (err) => {
      console.error(err);
      return res.status(500).json({ error: 'Upload failed', details: err.message });
    });

    req.pipe(busboy);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Upload failed', details: error.message });
  }
}