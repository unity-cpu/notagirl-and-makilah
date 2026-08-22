# My Photo Gallery

A simple, beautiful photo gallery you can deploy to **Vercel** for free.

People can view your photos. You just drop image files into a folder and redeploy.

---

## How to use

### 1. Add your photos

Put your pictures (`.jpg`, `.png`, `.webp`, `.gif`, etc.) into this folder:

```
public/images/
```

Example:
```
public/images/vacation1.jpg
public/images/family.png
public/images/sunset.webp
```

### 2. Deploy to Vercel (easiest way)

1. Create a free account at [vercel.com](https://vercel.com)
2. Push this project to a GitHub repository
3. Go to Vercel → **Add New Project** → Import your GitHub repo
4. Click **Deploy**

That's it. Every time you push new photos, Vercel will automatically update the site.

### Alternative: Deploy with Vercel CLI

```bash
npm i -g vercel
vercel
```

---

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Features

- Clean responsive grid
- Click any photo to open a full-screen lightbox
- Arrow keys / buttons to navigate
- ESC to close
- Works great on mobile

---

## Tips

- Use reasonably sized images (e.g. under 2–3 MB each) so the site loads fast
- Prefer `.webp` or compressed `.jpg` for best performance
- Rename files clearly if you want (they appear in alphabetical order)
