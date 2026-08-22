import { readdir } from "fs/promises";
import path from "path";
import Gallery from "./components/Gallery";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"];

async function getImages() {
  const imagesDir = path.join(process.cwd(), "public", "images");
  try {
    const files = await readdir(imagesDir);
    return files
      .filter((file) =>
        IMAGE_EXTENSIONS.some((ext) => file.toLowerCase().endsWith(ext))
      )
      .sort()
      .map((file) => `/images/${file}`);
  } catch {
    // Folder empty or missing — that's fine
    return [];
  }
}

export default async function Home() {
  const images = await getImages();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              My Photo Gallery
            </h1>
            <p className="mt-0.5 text-sm text-zinc-400">
              {images.length === 0
                ? "No photos yet"
                : `${images.length} photo${images.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {images.length === 0 ? (
          <EmptyState />
        ) : (
          <Gallery images={images} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-6 text-center text-sm text-zinc-500">
        Drop images into <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">public/images</code> and redeploy
      </footer>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 px-6 py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
        <svg
          className="h-8 w-8 text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
      </div>
      <h2 className="text-lg font-medium text-white">No photos yet</h2>
      <p className="mt-2 max-w-sm text-sm text-zinc-400">
        Add your pictures to the <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">public/images</code> folder,
        then push and redeploy on Vercel.
      </p>
      <div className="mt-6 rounded-lg bg-zinc-900 px-4 py-3 text-left text-xs text-zinc-400 font-mono">
        <p>1. Put .jpg / .png / .webp files in</p>
        <p className="text-zinc-300">   public/images/</p>
        <p className="mt-2">2. git add . && git commit -m &quot;add photos&quot;</p>
        <p>3. git push → Vercel auto-deploys</p>
      </div>
    </div>
  );
}
