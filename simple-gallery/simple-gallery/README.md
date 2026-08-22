# My Photo Gallery (Password Protected)

A simple, beautiful photo gallery you can deploy to **Vercel** for free.

Visitors must enter a password before they can see your photos.

---

## Quick setup

### 1. Set your password

Open **`gallery.js`** and change this line:

```js
const PASSWORD = "changeme";
```

to whatever password you want (e.g. `"family2026"`).

### 2. Add your photos

1. Put your image files (`.jpg`, `.png`, `.webp`, …) into the **`images/`** folder.
2. List the filenames in `gallery.js`:

```js
const photos = [
  "vacation.jpg",
  "family.png",
  "sunset.webp"
];
```

### 3. Deploy to Vercel

1. Upload this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → import the repo → **Deploy**.

You’ll get a public link. Only people who know the password can see the photos.

---

## How the password works

- A lock screen appears first.
- After entering the correct password, the gallery unlocks for that browser session.
- Closing the tab / browser requires the password again (uses `sessionStorage`).
- This is **client-side** protection — good for casual privacy (friends & family). It is **not** strong cryptographic security. Anyone with technical knowledge could potentially bypass it by viewing the page source.

---

## Features

- Password lock screen
- Responsive photo grid
- Full-screen lightbox (click a photo)
- Arrow keys / buttons to navigate
- ESC to close lightbox
- Works on phones

---

## Tips

- Keep individual photos under ~2–3 MB for faster loading.
- Prefer `.webp` or compressed `.jpg`.
- Filenames are case-sensitive — match them exactly in `gallery.js`.
- To lock everyone out again, just change the password and redeploy.
