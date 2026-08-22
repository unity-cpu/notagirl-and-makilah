/**
 * ============================================
 *  GALLERY LOGIC (Cloudinary version, null-safe)
 * ============================================
 */

const STORAGE_KEY = "gallery_unlocked";

// ====== CLOUDINARY CONFIG (replace with your real values) ======
const CLOUD_NAME = "vrvrxg8g";
const UPLOAD_PRESET = "gallery_preset";
const PHOTO_TAG = "gallery"; // optional tag to list only your gallery photos
// ===============================================================

let photos = [];
let currentIndex = 0;

// DOM elements
let passwordGate, passwordForm, passwordInput, passwordError, app;
let galleryEl, emptyEl, countEl, lightbox, lightboxImg, counterEl;
let closeBtn, prevBtn, nextBtn;
let uploadForm, fileInput, uploadStatus;

document.addEventListener("DOMContentLoaded", () => {
  // Helper to safely get an element
  const get = (id) => {
    const el = document.getElementById(id);
    if (!el) console.error(`Element #${id} not found in HTML`);
    return el;
  };

  passwordGate = get("password-gate");
  passwordForm = get("password-form");
  passwordInput = get("password-input");
  passwordError = get("password-error");
  app = get("app");

  galleryEl = get("gallery");
  emptyEl = get("empty");
  countEl = get("photo-count");
  lightbox = get("lightbox");
  lightboxImg = get("lightbox-img");
  counterEl = get("lightbox-counter");
  closeBtn = get("close-btn");
  prevBtn = get("prev-btn");
  nextBtn = get("next-btn");

  uploadForm = get("upload-form");
  fileInput = get("file-input");
  uploadStatus = get("upload-status");

  // Set up event listeners (only if elements exist)
  if (passwordForm) passwordForm.addEventListener("submit", handlePasswordSubmit);
  if (uploadForm) uploadForm.addEventListener("submit", handleUploadSubmit);

  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); goNext(); });
  if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); goPrev(); });

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (!lightbox || lightbox.classList.contains("hidden")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();
  });

  if (isUnlocked()) {
    unlock();
  } else if (passwordInput) {
    passwordInput.focus();
  }
});

// ---------- Password ----------
function isUnlocked() {
  return sessionStorage.getItem(STORAGE_KEY) === "true";
}

function unlock() {
  sessionStorage.setItem(STORAGE_KEY, "true");
  if (passwordGate) passwordGate.classList.add("hidden");
  if (app) app.classList.remove("hidden");
  loadPhotos();
}

function showError() {
  if (!passwordError) return;
  passwordError.classList.remove("hidden");
  if (passwordInput) {
    passwordInput.value = "";
    passwordInput.focus();
    passwordInput.style.borderColor = "#ff6b6b";
    setTimeout(() => {
      passwordInput.style.borderColor = "";
    }, 600);
  }
}

async function handlePasswordSubmit(e) {
  e.preventDefault();
  const entered = passwordInput ? passwordInput.value.trim() : "";

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
}

// ---------- Photo loading (from Cloudinary) ----------
async function loadPhotos() {
  if (!galleryEl || !emptyEl || !countEl) {
    console.error("Gallery, empty, or count element missing");
    return;
  }

  try {
    const res = await fetch('/api/list-photos');
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.details || errorData.error || `List photos returned ${res.status}`);
    }

    const data = await res.json();
    photos = data.photos;   // <-- now photos is an array of URLs

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

// ---------- Upload (to Cloudinary) ----------
async function handleUploadSubmit(e) {
  e.preventDefault();
  if (!fileInput || !uploadStatus) return;

  const file = fileInput.files[0];
  if (!file) {
    uploadStatus.textContent = "Please choose a file.";
    return;
  }

  uploadStatus.textContent = "Uploading…";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("tags", PHOTO_TAG);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || `Upload failed with status ${res.status}`);
    }

    uploadStatus.textContent = "Uploaded successfully!";
    fileInput.value = "";
    await loadPhotos();
  } catch (err) {
    console.error("Upload error:", err);
    uploadStatus.textContent = `Upload failed: ${err.message}`;
  }
}

// ---------- Lightbox ----------
function openLightbox(index) {
  if (!lightbox || !lightboxImg || !counterEl) return;
  currentIndex = index;
  updateLightbox();
  lightbox.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.add("hidden");
  document.body.style.overflow = "";
}

function updateLightbox() {
  if (!lightboxImg || !counterEl) return;
  lightboxImg.src = photos[currentIndex];
  lightboxImg.alt = `Photo ${currentIndex + 1}`;
  counterEl.textContent = `${currentIndex + 1} / ${photos.length}`;
}

function goNext() {
  if (!photos.length) return;
  currentIndex = (currentIndex + 1) % photos.length;
  updateLightbox();
}

function goPrev() {
  if (!photos.length) return;
  currentIndex = (currentIndex - 1 + photos.length) % photos.length;
  updateLightbox();
}