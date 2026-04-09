const supportedLanguages = ["en", "hi", "mr"];
const languageLabelMap = {
  en: "English",
  hi: "हिंदी",
  mr: "मराठी"
};

const localeCache = new Map();
let currentLanguage = localStorage.getItem("lang") || "en";
if (!supportedLanguages.includes(currentLanguage)) {
  currentLanguage = "en";
}

async function loadLocale(lang) {
  if (localeCache.has(lang)) {
    return localeCache.get(lang);
  }

  const response = await fetch(`./locales/${lang}.json`);
  const data = await response.json();
  localeCache.set(lang, data);
  return data;
}

function getByPath(object, path) {
  return path.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), object);
}

async function applyTranslations(lang = currentLanguage) {
  const dictionary = await loadLocale(lang);
  document.documentElement.lang = lang === "en" ? "en" : "hi";

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    const translated = getByPath(dictionary, key);
    if (translated) {
      node.textContent = translated;
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node.getAttribute("data-i18n-placeholder");
    const translated = getByPath(dictionary, key);
    if (translated) {
      node.setAttribute("placeholder", translated);
    }
  });

  document.querySelectorAll("[data-lang-label]").forEach((node) => {
    node.classList.add("fade-out");
    window.setTimeout(() => {
      node.textContent = languageLabelMap[lang] || languageLabelMap.en;
      node.classList.remove("fade-out");
    }, 120);
  });

  localStorage.setItem("lang", lang);
  currentLanguage = lang;
}

function getCurrentLanguage() {
  return currentLanguage;
}

function getNextLanguage() {
  const currentIndex = supportedLanguages.indexOf(currentLanguage);
  const nextIndex = (currentIndex + 1) % supportedLanguages.length;
  return supportedLanguages[nextIndex];
}

async function cycleLanguage() {
  const next = getNextLanguage();
  await applyTranslations(next);
  return next;
}

function setupLanguageSwitcher(selector = "[data-language-switcher]") {
  const switchers = document.querySelectorAll(selector);
  switchers.forEach((button) => {
    button.addEventListener("click", async () => {
      await cycleLanguage();
    });
  });
}

function maybeShowLanguageHint() {
  const seen = localStorage.getItem("language_hint_seen");
  if (seen) {
    return;
  }

  const hint = document.querySelector("[data-language-hint]");
  if (!hint) {
    return;
  }

  hint.classList.add("visible");
  hint.addEventListener("click", () => {
    hint.classList.remove("visible");
    localStorage.setItem("language_hint_seen", "1");
  });

  window.setTimeout(() => {
    hint.classList.remove("visible");
    localStorage.setItem("language_hint_seen", "1");
  }, 6000);
}

export {
  supportedLanguages,
  languageLabelMap,
  loadLocale,
  applyTranslations,
  getCurrentLanguage,
  cycleLanguage,
  setupLanguageSwitcher,
  maybeShowLanguageHint
};
