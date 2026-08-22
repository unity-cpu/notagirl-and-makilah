import { list } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const photos = blobs
      .filter(blob => blob.pathname.startsWith('uploads/'))
      .map(blob => ({
        url: blob.url,
        pathname: blob.pathname,
      }))
      .sort((a, b) => a.pathname.localeCompare(b.pathname));

    return res.status(200).json({ photos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to list photos', details: error.message });
  }
}