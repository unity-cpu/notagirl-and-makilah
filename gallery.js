const STORAGE_KEY = "gallery_unlocked";

let photos = [];
let currentIndex = 0;

let passwordGate, passwordForm, passwordInput, passwordError, app;
let galleryEl, emptyEl, countEl, lightbox, lightboxImg, counterEl;
let closeBtn, prevBtn, nextBtn;
let uploadForm, fileInput, uploadStatus;

document.addEventListener("DOMContentLoaded", () => {
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

  if (isUnlocked())