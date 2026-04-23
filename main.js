import { maybeShowLanguageHint, getCurrentLanguage, loadLocale } from "./i18n.js";

const categoryMeta = {
  electrician: { icon: "ph ph-flashlight", label: "Electrician", color: "#FEF3C7", accent: "#CA8A04" },
  plumber: { icon: "ph ph-wrench", label: "Plumber", color: "#DBEAFE", accent: "#1D4ED8" },
  carpenter: { icon: "ph ph-hammer", label: "Carpenter", color: "#FDE68A", accent: "#92400E" },
  maid: { icon: "ph ph-broom", label: "Maid", color: "#EDE9FE", accent: "#6D28D9" },
  mechanic: { icon: "ph ph-gear-six", label: "Mechanic", color: "#E7E5E4", accent: "#57534E" },
  painter: { icon: "ph ph-paint-brush", label: "Painter", color: "#FCE7F3", accent: "#BE185D" },
  mason: { icon: "ph ph-buildings", label: "Mason", color: "#FFEDD5", accent: "#C2410C" },
  driver: { icon: "ph ph-car", label: "Driver", color: "#DCFCE7", accent: "#15803D" },
  cook: { icon: "ph ph-fork-knife", label: "Cook", color: "#FEE2E2", accent: "#B91C1C" },
  welder: { icon: "ph ph-fire", label: "Welder", color: "#D6D3D1", accent: "#1C1917" },
  labour: { icon: "ph ph-hard-hat", label: "Labour", color: "#FAE8D4", accent: "#A16207" },
  other: { icon: "ph ph-toolbox", label: "Other", color: "#F5F5F4", accent: "#44403C" }
};

const categoryLabelMap = {
  en: {
    electrician: "Electrician",
    plumber: "Plumber",
    carpenter: "Carpenter",
    maid: "Maid",
    mechanic: "Mechanic",
    painter: "Painter",
    mason: "Mason",
    driver: "Driver",
    cook: "Cook",
    welder: "Welder",
    labour: "Labour",
    other: "Other"
  },
  hi: {
    electrician: "इलेक्ट्रीशियन",
    plumber: "प्लंबर",
    carpenter: "बढ़ई",
    maid: "मेड",
    mechanic: "मैकेनिक",
    painter: "पेंटर",
    mason: "राजमिस्त्री",
    driver: "ड्राइवर",
    cook: "रसोइया",
    welder: "वेल्डर",
    labour: "मजदूर",
    other: "अन्य"
  }
};

function getCategoryLabel(categoryKey) {
  const lang = getCurrentLanguage();
  return categoryLabelMap[lang]?.[categoryKey] || categoryLabelMap.en[categoryKey] || categoryMeta.other.label;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function getRelativeDateLabel(isoOrDate) {
  const now = Date.now();
  const time = new Date(isoOrDate).getTime();
  const diff = now - time;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < hour) {
    const mins = Math.max(1, Math.round(diff / minute));
    return `${mins} min ago`;
  }
  if (diff < day) {
    const hours = Math.max(1, Math.round(diff / hour));
    return `${hours}h ago`;
  }
  const days = Math.max(1, Math.round(diff / day));
  if (days === 1) {
    return "Yesterday";
  }
  return `${days} days ago`;
}

function ensureToastRoot() {
  let root = document.querySelector(".toast-root");
  if (!root) {
    root = document.createElement("div");
    root.className = "toast-root";
    document.body.appendChild(root);
  }
  return root;
}

function showToast(message, type = "success") {
  const root = ensureToastRoot();
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: "ph ph-check-circle",
    error: "ph ph-x-circle",
    warning: "ph ph-warning-circle"
  };

  toast.innerHTML = `<i class="${iconMap[type] || "ph ph-info"}"></i><span>${message}</span>`;
  root.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add("hide");
    window.setTimeout(() => toast.remove(), 280);
  }, 3000);
}

function showLoading(text = "Loading...") {
  if (document.querySelector(".full-loader")) {
    return;
  }
  const loader = document.createElement("div");
  loader.className = "full-loader";
  loader.innerHTML = `
    <div class="spinner-lg"></div>
    <p>${text}</p>
  `;
  document.body.appendChild(loader);
}

function hideLoading() {
  const loader = document.querySelector(".full-loader");
  if (loader) {
    loader.remove();
  }
}

function showEmptyState({ container, iconClass = "ph ph-smiley-sad", title = "No data", message = "Try again", buttonText, onAction }) {
  if (!container) {
    return;
  }
  container.innerHTML = `
    <div class="empty-state card">
      <div class="empty-emoji"><i class="${iconClass}"></i></div>
      <h3>${title}</h3>
      <p>${message}</p>
      ${buttonText ? `<button class="btn btn-primary touch-target" data-empty-action>${buttonText}</button>` : ""}
    </div>
  `;
  if (buttonText && typeof onAction === "function") {
    container.querySelector("[data-empty-action]")?.addEventListener("click", onAction);
  }
}

function showError({ container, message = "Something went wrong. Please try again.", retryText = "Retry", onRetry }) {
  if (!container) {
    return;
  }
  container.innerHTML = `
    <div class="error-state card">
      <div class="empty-emoji"><i class="ph ph-wifi-x"></i></div>
      <h3>Oops!</h3>
      <p>${message}</p>
      <button class="btn btn-outline touch-target" data-error-retry>${retryText}</button>
    </div>
  `;
  container.querySelector("[data-error-retry]")?.addEventListener("click", () => {
    if (typeof onRetry === "function") {
      onRetry();
    }
  });
}

function renderWorkerCard(worker) {
  const category = categoryMeta[worker.category] || categoryMeta.other;
  const categoryLabel = getCategoryLabel(worker.category || "other");
  const statusClass = worker.available ? "available" : "busy";
  const statusLabel = getCurrentLanguage() === "hi" ? (worker.available ? "उपलब्ध" : "व्यस्त") : (worker.available ? "Available" : "Busy");
  const reviewsCount = Number(worker.reviewsCount || worker.reviews || 0);
  const ratingValue = Number(worker.rating || 0).toFixed(1);
  const yearsLabel = getCurrentLanguage() === "hi" ? "साल अनुभव" : "years experience";

  return `
    <article class="worker-card card list-item" style="--card-accent:${category.accent}">
      <div class="worker-top">
        <img src="${worker.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=60"}" alt="${worker.name}" class="worker-photo" loading="lazy">
        <div class="worker-meta">
          <div class="worker-headline">
            <h4>${worker.name}</h4>
            <span class="status-pill ${statusClass}"><span class="status-dot ${statusClass}"></span>${statusLabel}</span>
          </div>
          <p><i class="${category.icon}"></i> ${categoryLabel} · ${worker.distance ? `<i class="ph ph-map-pin"></i> ${worker.distance} km away` : (worker.city || "-")}</p>
          <p><i class="ph ph-star"></i> ${ratingValue} (${reviewsCount} ${getCurrentLanguage() === "hi" ? "रिव्यू" : "reviews"})</p>
          <p><i class="ph ph-currency-inr"></i> ${formatCurrency(worker.rate)}/day · ${worker.experience || 0} ${yearsLabel}</p>
        </div>
      </div>
      <div class="worker-actions">
        <a href="tel:${worker.phone || ""}" class="btn btn-primary touch-target"><i class="ph ph-phone"></i> ${getCurrentLanguage() === "hi" ? "संपर्क" : "Contact"}</a>
        <a href="worker-profile.html?id=${worker.$id || worker.id}" class="btn btn-outline touch-target"><i class="ph ph-eye"></i> ${getCurrentLanguage() === "hi" ? "प्रोफाइल देखें" : "View Profile"}</a>
      </div>
    </article>
  `;
}

function renderJobCard(job) {
  const locationLabel = job.location || job.city || "-";
  return `
    <article class="job-card card list-item">
      <div class="job-top">
        <h4>${job.title}</h4>
        <span class="badge ${job.status || "pending"}">${String(job.status || "pending").toUpperCase()}</span>
      </div>
      <p><i class="ph ph-map-pin"></i> ${locationLabel} · ${formatCurrency(job.rate)}/day</p>
      <p><i class="ph ph-clock"></i> ${job.duration} · Posted ${getRelativeDateLabel(job.createdAt)}</p>
      <div class="worker-actions">
        <button class="btn btn-outline touch-target" data-job-view="${job.$id || job.id}"><i class="ph ph-eye"></i> ${getCurrentLanguage() === "hi" ? "देखें" : "View"}</button>
        <button class="btn btn-primary touch-target" data-job-apply="${job.$id || job.id}"><i class="ph ph-paper-plane-tilt"></i> ${getCurrentLanguage() === "hi" ? "आवेदन" : "Apply"}</button>
      </div>
    </article>
  `;
}

function renderSkeletonCards(container, count = 3) {
  if (!container) {
    return;
  }
  container.innerHTML = "";
  for (let i = 0; i < count; i += 1) {
    const item = document.createElement("div");
    item.className = "card skeleton-card";
    item.innerHTML = `
      <div class="skeleton" style="height:20px;width:55%;margin-bottom:12px"></div>
      <div class="skeleton" style="height:14px;width:85%;margin-bottom:10px"></div>
      <div class="skeleton" style="height:14px;width:75%;margin-bottom:16px"></div>
      <div class="skeleton" style="height:52px;width:100%"></div>
    `;
    container.appendChild(item);
  }
}

function animateCounter(node, target) {
  const start = 0;
  const duration = 1200;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(start + (target - start) * eased);
    node.textContent = String(value);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function initAnimatedCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = Number(entry.target.getAttribute("data-counter"));
        animateCounter(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach((node) => observer.observe(node));
}

async function reverseGeocode(lat, lon) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    const data = await response.json();
    return data?.address?.city || data?.address?.town || data?.address?.state_district || data?.display_name || "";
  } catch {
    return "";
  }
}

async function requestCityFromLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve("");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const city = await reverseGeocode(position.coords.latitude, position.coords.longitude);
      resolve(city);
    }, () => resolve(""), {
      enableHighAccuracy: true,
      timeout: 8000
    });
  });
}

function setupPullToRefresh(callback) {
  let startY = 0;
  let pulling = false;

  window.addEventListener("touchstart", (event) => {
    if (window.scrollY === 0) {
      startY = event.touches[0].clientY;
      pulling = true;
    }
  });

  window.addEventListener("touchmove", (event) => {
    if (!pulling) {
      return;
    }
    const deltaY = event.touches[0].clientY - startY;
    if (deltaY > 90 && typeof callback === "function") {
      pulling = false;
      callback();
    }
  });

  window.addEventListener("touchend", () => {
    pulling = false;
  });
}

function setupMobileMenu() {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const drawer = document.querySelector("[data-drawer]");
  const close = document.querySelector("[data-drawer-close]");
  const backdrop = document.querySelector("[data-drawer-backdrop]");

  if (!menuButton || !drawer || !backdrop) {
    return;
  }

  const open = () => {
    drawer.classList.add("open");
    backdrop.classList.add("open");
    document.body.classList.add("no-scroll");
  };

  const hide = () => {
    drawer.classList.remove("open");
    backdrop.classList.remove("open");
    document.body.classList.remove("no-scroll");
  };

  menuButton.addEventListener("click", open);
  close?.addEventListener("click", hide);
  backdrop.addEventListener("click", hide);
}

function setupSearchExpand() {
  const trigger = document.querySelector("[data-search-expand]");
  const overlay = document.querySelector("[data-search-overlay]");
  const close = document.querySelector("[data-search-close]");

  if (!trigger || !overlay || !close) {
    return;
  }

  trigger.addEventListener("click", () => overlay.classList.add("open"));
  close.addEventListener("click", () => overlay.classList.remove("open"));
}

function setupConnectionHint() {
  const hint = document.querySelector("[data-connection-hint]");
  if (!hint) {
    return;
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!connection) {
    return;
  }

  const slow = ["slow-2g", "2g"].includes(connection.effectiveType);
  if (slow) {
    hint.classList.add("visible");
  }
}

function initGoogleTranslate() {
  const switchers = [...document.querySelectorAll("[data-language-switcher]")];
  if (!switchers.length) {
    return;
  }

  const stateKey = "google_translate_lang";
  let currentTranslateLang = localStorage.getItem(stateKey) || "en";

  function updateLangLabels() {
    const text = currentTranslateLang === "hi" ? "हिंदी" : "English";
    document.querySelectorAll("[data-lang-label]").forEach((node) => {
      node.textContent = text;
    });
  }

  function applyLanguage(lang) {
    const combo = document.querySelector(".goog-te-combo");
    if (!combo) {
      showToast("Translator is loading. Please try again.", "warning");
      return;
    }

    if (lang === "hi") {
      combo.value = "hi";
      combo.dispatchEvent(new Event("change"));
      currentTranslateLang = "hi";
      localStorage.setItem(stateKey, "hi");
      updateLangLabels();
      return;
    }

    const hasEnglishOption = Array.from(combo.options).some((option) => option.value === "en");
    if (hasEnglishOption) {
      combo.value = "en";
    } else {
      combo.selectedIndex = 0;
    }
    combo.dispatchEvent(new Event("change"));
    currentTranslateLang = "en";
    localStorage.setItem(stateKey, "en");
    updateLangLabels();
  }

  let shell = document.getElementById("google_translate_element");
  if (!shell) {
    shell = document.createElement("div");
    shell.id = "google_translate_element";
    shell.style.display = "none";
    document.body.appendChild(shell);
  }

  updateLangLabels();
  switchers.forEach((button) => button.addEventListener("click", () => {
    applyLanguage(currentTranslateLang === "hi" ? "en" : "hi");
  }));

  if (window.google?.translate?.TranslateElement || document.querySelector('script[src*="translate.google.com/translate_a/element.js"]')) {
    return;
  }

  window.googleTranslateElementInit = () => {
    new window.google.translate.TranslateElement(
      {
        pageLanguage: "en",
        autoDisplay: false,
        includedLanguages: "en,hi"
      },
      "google_translate_element"
    );

    if (currentTranslateLang === "hi") {
      window.setTimeout(() => applyLanguage("hi"), 120);
    }
  };

  const script = document.createElement("script");
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.head.appendChild(script);
}

function showSuccessOverlay(message = "Success!") {
  const overlay = document.createElement("div");
  overlay.className = "success-overlay";
  overlay.innerHTML = `
    <div class="success-card">
      <div class="checkmark"><i class="ph ph-check-circle"></i></div>
      <h3>${message}</h3>
      <p>You are all set.</p>
    </div>
  `;
  document.body.appendChild(overlay);

  window.setTimeout(() => {
    overlay.classList.add("hide");
    window.setTimeout(() => overlay.remove(), 400);
  }, 1600);
}

async function getText(key, fallback = "") {
  try {
    const locale = await loadLocale(getCurrentLanguage());
    return key.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), locale) || fallback;
  } catch {
    return fallback;
  }
}

function initBottomSheet(triggerSelector, sheetSelector, closeSelector) {
  const trigger = document.querySelector(triggerSelector);
  const sheet = document.querySelector(sheetSelector);
  const close = document.querySelector(closeSelector);

  if (!trigger || !sheet) {
    return;
  }

  const open = () => sheet.classList.add("open");
  const hide = () => sheet.classList.remove("open");

  trigger.addEventListener("click", open);
  close?.addEventListener("click", hide);
  sheet.querySelector(".sheet-backdrop")?.addEventListener("click", hide);
}

async function initCommonUI() {
  initGoogleTranslate();
  maybeShowLanguageHint();
  setupMobileMenu();
  setupSearchExpand();
  setupConnectionHint();
  initAnimatedCounters();
}

export {
  categoryMeta,
  getCategoryLabel,
  formatCurrency,
  showToast,
  showLoading,
  hideLoading,
  showEmptyState,
  showError,
  renderWorkerCard,
  renderJobCard,
  renderSkeletonCards,
  requestCityFromLocation,
  setupPullToRefresh,
  initBottomSheet,
  showSuccessOverlay,
  initCommonUI,
  getText
};
