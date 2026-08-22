import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  // Check if the auth cookie is present
  const { gallery_auth } = req.cookies || {};
  if (gallery_auth !== "true") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Read the list of image filenames from the private-images folder
  const imagesDir = path.join(process.cwd(), "private-images");
  try {
    const files = fs.readdirSync(imagesDir);
    // Optional: filter only image files
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const photos = files.filter((file) =>
      allowedExtensions.includes(path.extname(file).toLowerCase())
    );
    return res.status(200).json({ photos });
  } catch (error) {
    return res.status(500).json({ error: "Could not read images" });
  }
}