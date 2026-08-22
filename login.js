export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { password } = req.body;
  const correctPassword = process.env.GALLERY_PASSWORD;

  if (!password || password !== correctPassword) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  // Set an HTTP-only cookie (valid for 7 days)
  res.setHeader(
    "Set-Cookie",
    `gallery_auth=true; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax; Secure`
  );

  return res.status(200).json({ success: true });
}