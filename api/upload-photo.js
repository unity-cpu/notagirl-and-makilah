import { put } from '@vercel/blob';
import Busboy from 'busboy';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileBuffer, fileMime, fileName } = await parseMultipartForm(req);
    if (!fileBuffer) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const timestamp = Date.now();
    const ext = fileName.split('.').pop();
    const filename = `uploads/${timestamp}.${ext}`;

    const blob = await put(filename, fileBuffer, {
      access: 'public',
      contentType: fileMime,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.status(200).json({ url: blob.url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Upload failed', details: error.message });
  }
}

function parseMultipartForm(req) {
  return new Promise((resolve, reject) => {
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
      file.on('error', (err) => {
        reject(err);
      });
    });

    busboy.on('error', (err) => {
      reject(err);
    });

    busboy.on('finish', () => {
      resolve({ fileBuffer, fileMime, fileName });
    });

    req.pipe(busboy);
  });
}