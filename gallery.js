/**
 * ============================================
 *  SETTINGS — edit these
 * ============================================
 */

// List your photo filenames (they must be in the images/ folder)
const photos = [
  "01-selfie.jpg",
  "02-purple-tongue.jpg",
  "03-side-tongue.jpg",
  "04-peace-sign.png",
  "05-pink-tongue.jpg",
  "06-cheek-squeeze.jpg",
  "07-kissy.jpg",
  "08-two-friends.jpg",
  "09-purple-smile.jpg",
  "10-blue-duo.jpg",
  "11-facetime.jpg",
  "12-low-angle.jpg",
];

/**
 * ============================================
 *  Gallery + password logic
 *  (you usually don't need to touch below)
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

let currentIndex = 0;

// ---------- Password ----------
function isUnlocked() {
  return sessionStorage.getItem(STORAGE_KEY) === "true";
}

function unlock() {
  sessionStorage.setItem(STORAGE_KEY, "true");
  passwordGate.classList.add("hidden");
  app.classList.remove("hidden");
  initGallery();
}

function showError() {
  passwordError.classList.remove("hidden");
  passwordInput.value = "";
  passwordInput.focus();
  passwordInput.style.borderColor = "#f87171";
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

// ---------- Gallery ----------
function initGallery() {
  if (!photos.length) {
    emptyEl.classList.remove("hidden");
    countEl.textContent = "No photos yet";
    return;
  }

  emptyEl.classList.add("hidden");
  countEl.textContent = `${photos.length} photo${photos.length === 1 ? "" : "s"}`;

  galleryEl.innerHTML = "";

  photos.forEach((filename, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", `View photo ${index + 1}`);

    const img = document.createElement("img");
    img.src = `images/${filename}`;
    img.alt = `Photo ${index + 1}`;
    img.loading = index < 8 ? "eager" : "lazy";

    btn.appendChild(img);
    btn.addEventListener("click", () => openLightbox(index));
    galleryEl.appendChild(btn);
  });
}

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
  lightboxImg.src = `images/${photos[currentIndex]}`;
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