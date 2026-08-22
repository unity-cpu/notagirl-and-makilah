import { list } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    const { blobs } = await list();
    const photos = blobs
      .filter(blob => blob.pathname.startsWith('uploads/'))
      .map(blob => ({
        url: blob.url,
        pathname: blob.pathname,
      }))
      .sort((a, b) => a.pathname.localeCompare(b.pathname));
    res.status(200).json({ photos });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list photos' });
  }
}