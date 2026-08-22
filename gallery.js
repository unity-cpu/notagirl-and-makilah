/**
 * ============================================
 *  GALLERY LOGIC (with uploads)
 * ============================================
 */

const STORAGE_KEY = "gallery_unlocked";

const passwordGate = document.getElementById("password-gate");
const passwordForm = document.getElementById("password-form");
const passwordInput = document.getElementById("password-input");
const passwordError = document.getElementById("password-error");
const app = document.getElementById("app");

const galleryEl = document.getElementById("gallery");
const emptyEl = document.getElementById("empty");
const countEl = document.getElementById("photo-count");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const counterEl = document.getElementById("lightbox-counter");
const closeBtn = document.getElementById("close-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

const uploadForm = document.getElementById("upload-form");
const fileInput = document.getElementById("file-input");
const uploadStatus = document.getElementById("upload-status");

let photos = [];          // Array of image URLs (filled by API)
let currentIndex = 0;

// ---------- Password ----------
function isUnlocked() {
  return sessionStorage.getItem(STORAGE_KEY) === "true";
}

function unlock() {
  sessionStorage.setItem(STORAGE_KEY, "true");
  passwordGate.classList.add("hidden");
  app.classList.remove("hidden");
  loadPhotos();
}

function showError() {
  passwordError.classList.remove("hidden");
  passwordInput.value = "";
  passwordInput.focus();
  passwordInput.style.borderColor = "#ff6b6b";
  setTimeout(() => {
    passwordInput.style.borderColor = "";
  }, 600);
}

passwordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const entered = passwordInput.value.trim();

  try {
    const res = await fetch("/api/check-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: entered }),
    });

    if (res.ok) {
      unlock();
    } else {
      showError();
    }
  } catch (err) {
    console.error("Password check failed:", err);
    showError();
  }
});

// ---------- Photo loading ----------
async function loadPhotos() {
  try {
    const res = await fetch("/api/list-photos");
    if (!res.ok) throw new Error("Failed to list photos");
    const data = await res.json();

    photos = data.photos.map(p => p.url);   // full URLs from Vercel Blob

    if (!photos.length) {
      emptyEl.classList.remove("hidden");
      countEl.textContent = "No photos yet";
      return;
    }

    emptyEl.classList.add("hidden");
    countEl.textContent = `${photos.length} photo${photos.length === 1 ? "" : "s"}`;

    galleryEl.innerHTML = "";

    photos.forEach((url, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", `View photo ${index + 1}`);

      const img = document.createElement("img");
      img.src = url;
      img.alt = `Photo ${index + 1}`;
      img.loading = index < 8 ? "eager" : "lazy";

      btn.appendChild(img);
      btn.addEventListener("click", () => openLightbox(index));
      galleryEl.appendChild(btn);
    });
  } catch (err) {
    console.error("Error loading photos:", err);
    emptyEl.classList.remove("hidden");
    countEl.textContent = "Failed to load photos";
  }
}

// ---------- Upload ----------
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = fileInput.files[0];
  if (!file) {
    uploadStatus.textContent = "Please choose a file.";
    return;
  }

  uploadStatus.textContent = "Uploading…";

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload-photo", {
      method: "POST",
      body: formData,
      // If you set UPLOAD_SECRET, add the header here:
      // headers: { "x-upload-secret": "your-secret-here" },
    });

    if (!res.ok) {
      throw new Error("Upload failed");
    }

    uploadStatus.textContent = "Uploaded successfully!";
    fileInput.value = "";
    await loadPhotos();        // reload the gallery
  } catch (err) {
    console.error(err);
    uploadStatus.textContent = "Upload failed. Please try again.";
  }
});

// ---------- Lightbox ----------
function openLightbox(index) {
  currentIndex = index;
  updateLightbox();
  lightbox.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.add("hidden");
  document.body.style.overflow = "";
}

function updateLightbox() {
  lightboxImg.src = photos[currentIndex];
  lightboxImg.alt = `Photo ${currentIndex + 1}`;
  counterEl.textContent = `${currentIndex + 1} / ${photos.length}`;
}

function goNext() {
  currentIndex = (currentIndex + 1) % photos.length;
  updateLightbox();
}

function goPrev() {
  currentIndex = (currentIndex - 1 + photos.length) % photos.length;
  updateLightbox();
}

// Lightbox controls
closeBtn.addEventListener("click", closeLightbox);
nextBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  goNext();
});
prevBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  goPrev();
});

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (e) => {
  if (lightbox.classList.contains("hidden")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") goNext();
  if (e.key === "ArrowLeft") goPrev();
});

// ---------- Start ----------
if (isUnlocked()) {
  unlock();
} else {
  passwordInput.focus();
}