/**
 * ============================================
 *  GALLERY LOGIC (with uploads)
 * ============================================
 */

const STORAGE_KEY = "gallery_unlocked";

let photos = [];
let currentIndex = 0;

let passwordGate, passwordForm, passwordInput, passwordError, app;
let galleryEl, emptyEl, countEl, lightbox, lightboxImg, counterEl;
let closeBtn, prevBtn, nextBtn;
let uploadForm, fileInput, uploadStatus;

// ---------- Initialise after DOM is ready ----------
document.addEventListener("DOMContentLoaded", () => {
  // Grab all elements
  passwordGate = document.getElementById("password-gate");
  passwordForm = document.getElementById("password-form");
  passwordInput = document.getElementById("password-input");
  passwordError = document.getElementById("password-error");
  app = document.getElementById("app");

  galleryEl = document.getElementById("gallery");
  emptyEl = document.getElementById("empty");
  countEl = document.getElementById("photo-count");
  lightbox = document.getElementById("lightbox");
  lightboxImg = document.getElementById("lightbox-img");
  counterEl = document.getElementById("lightbox-counter");
  closeBtn = document.getElementById("close-btn");
  prevBtn = document.getElementById("prev-btn");
  nextBtn = document.getElementById("next-btn");

  uploadForm = document.getElementById("upload-form");
  fileInput = document.getElementById("file-input");
  uploadStatus = document.getElementById("upload-status");

  // Set up event listeners
  passwordForm.addEventListener("submit", handlePasswordSubmit);
  uploadForm.addEventListener("submit", handleUploadSubmit);

  closeBtn.addEventListener("click", closeLightbox);
  nextBtn.addEventListener("click", (e) => { e.stopPropagation(); goNext(); });
  prevBtn.addEventListener("click", (e) => { e.stopPropagation(); goPrev(); });

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (lightbox.classList.contains("hidden")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();
  });

  // Check if already unlocked
  if (isUnlocked()) {
    unlock();
  } else {
    passwordInput.focus();
  }
});

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

async function handlePasswordSubmit(e) {
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
}

// ---------- Photo loading ----------
async function loadPhotos() {
  // Guard against missing elements
  if (!emptyEl || !countEl || !galleryEl) {
    console.error("Required gallery elements not found.");
    return;
  }

  try {
    const res = await fetch("/api/list-photos");
    if (!res.ok) throw new Error(`List photos returned ${res.status}`);
    const data = await res.json();

    photos = data.photos.map(p => p.url);

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

  try {
    const res = await fetch("/api/upload-photo", {
      method: "POST",
      body: formData,
      // If you set UPLOAD_SECRET, uncomment the next line:
      // headers: { "x-upload-secret": "your-secret-here" },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.details || errorData.error || `Upload failed with status ${res.status}`);
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