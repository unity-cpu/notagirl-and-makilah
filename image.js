import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  // Auth check
  const { gallery_auth } = req.cookies || {};
  if (gallery_auth !== "true") {
    return res.status(401).send("Unauthorized");
  }

  // Get filename from query parameter: /api/image?name=01-selfie.jpg
  const { name } = req.query;
  if (!name) {
    return res.status(400).send("Missing image name");
  }

  // Prevent path traversal attacks
  const safeName = path.basename(name);
  const imagePath = path.join(process.cwd(), "private-images", safeName);

  if (!fs.existsSync(imagePath)) {
    return res.status(404).send("Image not found");
  }

  // Determine content type based on extension
  const ext = path.extname(safeName).toLowerCase();
  const contentTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  const contentType = contentTypes[ext] || "application/octet-stream";

  // Read the file and send it
  const imageBuffer = fs.readFileSync(imagePath);
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(imageBuffer);
}