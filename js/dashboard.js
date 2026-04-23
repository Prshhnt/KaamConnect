import { account, db, storage, client_, DB_ID, BUCKET_ID, Query } from "./appwrite.js";

const FALLBACK_BUCKET = "worker-photos";

const roleNav = {
  worker: {
    sections: [
      {
        label: "Main",
        items: [
          { href: "worker-dashboard.html", icon: "ph-house", text: "Overview" },
          { href: "worker-applications.html", icon: "ph-briefcase", text: "My Applications", badgeId: "pendingApps" },
          { href: "worker-jobs.html", icon: "ph-magnifying-glass", text: "Browse Jobs" }
        ]
      },
      {
        label: "My Profile",
        items: [
          { href: "worker-profile.html", icon: "ph-user", text: "My Profile" },
          { href: "worker-reviews.html", icon: "ph-star", text: "Reviews" },
          { href: "worker-earnings.html", icon: "ph-currency-inr", text: "Earnings" }
        ]
      },
      {
        label: "Account",
        items: [
          { href: "worker-settings.html", icon: "ph-gear", text: "Settings" },
          { href: "worker-settings.html#help", icon: "ph-question", text: "Help" }
        ]
      }
    ]
  },
  employer: {
    sections: [
      {
        label: "Main",
        items: [
          { href: "employer-dashboard.html", icon: "ph-house", text: "Overview" },
          { href: "employer-post-job.html", icon: "ph-plus-circle", text: "Post a Job" },
          { href: "employer-jobs.html", icon: "ph-list-bullets", text: "My Jobs", badgeId: "openJobs" },
          { href: "employer-applicants.html", icon: "ph-users", text: "Applicants", badgeId: "pendingApplicants" }
        ]
      },
      {
        label: "Workers",
        items: [
          { href: "employer-search.html", icon: "ph-magnifying-glass", text: "Find Workers" },
          { href: "employer-hired.html", icon: "ph-handshake", text: "Hired Workers" }
        ]
      },
      {
        label: "Account",
        items: [
          { href: "employer-profile.html", icon: "ph-user", text: "My Profile" },
          { href: "employer-reviews.html", icon: "ph-star", text: "Reviews" },
          { href: "employer-settings.html", icon: "ph-gear", text: "Settings" },
          { href: "employer-settings.html#help", icon: "ph-question", text: "Help" }
        ]
      }
    ]
  }
};

let unsubscribes = [];
const notificationStore = [];
const indexFontHref = "https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Hind:wght@300;400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap";

function icon(name) {
  return `<i class="ph ${name}"></i>`;
}

function initials(name) {
  const parts = String(name || "U").trim().split(/\s+/).slice(0, 2);
  return parts.map((item) => item[0]?.toUpperCase() || "").join("") || "U";
}

function ensureDashboardFonts() {
  const existing = document.querySelector(`link[href="${indexFontHref}"]`);
  if (existing) return;

  const preconnectGoogle = document.querySelector('link[rel="preconnect"][href="https://fonts.googleapis.com"]') || document.createElement("link");
  if (!preconnectGoogle.parentNode) {
    preconnectGoogle.rel = "preconnect";
    preconnectGoogle.href = "https://fonts.googleapis.com";
    document.head.appendChild(preconnectGoogle);
  }

  const preconnectStatic = document.querySelector('link[rel="preconnect"][href="https://fonts.gstatic.com"]') || document.createElement("link");
  if (!preconnectStatic.parentNode) {
    preconnectStatic.rel = "preconnect";
    preconnectStatic.href = "https://fonts.gstatic.com";
    preconnectStatic.crossOrigin = "anonymous";
    document.head.appendChild(preconnectStatic);
  }

  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href = indexFontHref;
  document.head.appendChild(fontLink);
}

function getRoleFromProfile(workerDoc, employerDoc) {
  if (workerDoc) return "worker";
  if (employerDoc) return "employer";
  return null;
}

async function listByUser(collectionId, user, limit = 1) {
  const queries = [
    Query.limit(limit)
  ];

  if (user?.$id) {
    queries.push(Query.equal("userId", user.$id));
  }

  try {
    const byUser = await db.listDocuments(DB_ID, collectionId, queries);
    if (byUser.documents.length) return byUser.documents;
  } catch {
    // ignore and fallback to email search
  }

  if (!user?.email) return [];
  try {
    const byEmail = await db.listDocuments(DB_ID, collectionId, [Query.equal("email", user.email), Query.limit(limit)]);
    return byEmail.documents;
  } catch {
    return [];
  }
}

async function requireAuth(expectedRole) {
  try {
    const user = await account.get();
    const [workerDocs, employerDocs] = await Promise.all([
      listByUser("workers", user),
      listByUser("employers", user)
    ]);

    const workerDoc = workerDocs[0] || null;
    const employerDoc = employerDocs[0] || null;
    const resolvedRole = getRoleFromProfile(workerDoc, employerDoc) || expectedRole;

    if (!workerDoc && !employerDoc) {
      const fallbackRole = resolvedRole || expectedRole || "worker";
      window.location.href = `quick-setup.html?role=${encodeURIComponent(fallbackRole)}`;
      return null;
    }

    if (expectedRole && resolvedRole !== expectedRole) {
      window.location.href = resolvedRole === "employer" ? "employer-dashboard.html" : "worker-dashboard.html";
      return null;
    }

    const profile = resolvedRole === "employer" ? employerDoc : workerDoc;
    return { user, profile, role: resolvedRole };
  } catch {
    window.location.href = "login.html";
    return null;
  }
}

function getProfileImage(profile) {
  const fileId = profile?.photoFileId || profile?.photo || profile?.avatarFileId || "";
  if (!fileId) return "";
  if (/^https?:\/\//i.test(String(fileId))) {
    return fileId;
  }
  try {
    return storage.getFilePreview(BUCKET_ID, fileId, 80, 80);
  } catch {
    try {
      return storage.getFilePreview(FALLBACK_BUCKET, fileId, 80, 80);
    } catch {
      return "";
    }
  }
}

function renderSidebar(role, userData) {
  const mount = document.getElementById("sidebarMount");
  if (!mount) return;
  const config = roleNav[role];
  if (!config) return;

  const profileImage = userData ? getProfileImage(userData.profile) : "";
  const roleText = role === "employer" ? "Employer" : "Worker";
  const displayName = userData?.profile?.name || userData?.user?.name || userData?.user?.email || "Loading...";
  const profileHref = userData?.role === "worker" ? "worker-profile.html" : "employer-profile.html";
  const settingsHref = userData?.role === "worker" ? "worker-settings.html" : "employer-settings.html";

  mount.innerHTML = `
    <aside class="sidebar" id="appSidebar" aria-label="Sidebar navigation">
      <div class="sidebar-logo">
        <div class="logo-icon"><i class="ph ph-toolbox"></i></div>
        <div class="logo-text">KaamConnect</div>
      </div>
      <div class="sidebar-nav">
        ${config.sections.map((section) => `
          <div class="nav-section-label">${section.label}</div>
          ${section.items.map((item) => `
            <a class="nav-item" href="${item.href}">
              ${icon(item.icon)}
              <span>${item.text}</span>
              ${item.badgeId ? `<span class="nav-badge" data-badge-id="${item.badgeId}">0</span>` : ""}
            </a>
          `).join("")}
        `).join("")}
      </div>
      <div class="sidebar-footer">
        <div class="sidebar-profile-card">
          <div class="sidebar-profile-top">
            ${profileImage ? `<img class="sidebar-profile-avatar" src="${profileImage}" alt="Profile" />` : `<div class="sidebar-profile-avatar">${initials(displayName)}</div>`}
            <div class="sidebar-profile-meta">
              <div class="sidebar-profile-name">${displayName}</div>
              <div class="sidebar-profile-role">${userData ? roleText : "Loading profile..."}</div>
            </div>
          </div>
          <div class="sidebar-profile-actions">
            <a class="sidebar-profile-link" href="${profileHref}"><i class="ph ph-user"></i><span>My Profile</span></a>
            <a class="sidebar-profile-link" href="${settingsHref}"><i class="ph ph-gear"></i><span>Settings</span></a>
          </div>
          <button class="sidebar-profile-logout" id="sidebarLogoutBtn" type="button">Logout</button>
        </div>
      </div>
    </aside>
  `;

  document.getElementById("sidebarLogoutBtn")?.addEventListener("click", async () => {
    await account.deleteSession("current");
    window.location.href = "login.html";
  });
}

function renderTopbar(userData, pageTitle = "Dashboard") {
  const mount = document.getElementById("topbarMount");
  const overlay = document.getElementById("overlayMount");
  if (!mount || !overlay) return;

  const profileImage = userData ? getProfileImage(userData.profile) : "";
  const displayName = userData?.profile?.name || userData?.user?.name || "Account";

  overlay.innerHTML = `<div class="sidebar-overlay" id="sidebarOverlay"></div>`;

  mount.innerHTML = `
    <header class="dashboard-topbar">
      <button class="topbar-icon-btn" id="mobileMenuBtn" aria-label="Open menu">${icon("ph-list")}</button>
      <h1 class="topbar-title">${pageTitle}</h1>
      <div class="topbar-actions">
        <button class="notif-btn" id="notifBtn" aria-label="Notifications">${icon("ph-bell")}<span class="notif-dot" id="notifDot" hidden></span></button>
        <button class="topbar-icon-btn" id="languageBtn" aria-label="Language">${icon("ph-globe")}</button>
        <div style="position:relative">
          <button class="avatar-menu" id="avatarMenuBtn" aria-label="Open profile menu">
            ${profileImage ? `<img class="avatar" src="${profileImage}" alt="Avatar" />` : `<div class="avatar" style="display:grid;place-items:center">${initials(displayName)}</div>`}
            <span class="name">${displayName}</span>
            <i class="ph ph-caret-down chevron"></i>
          </button>
          <div class="avatar-dropdown" id="avatarDropdown">
            <a href="${userData?.role === "worker" ? "worker-profile.html" : "employer-profile.html"}">My Profile</a>
            <a href="${userData?.role === "worker" ? "worker-settings.html" : "employer-settings.html"}">Settings</a>
            <button id="logoutBtn">Logout</button>
          </div>
        </div>
        <div class="notifications-panel" id="notifPanel"></div>
      </div>
    </header>
  `;

  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await account.deleteSession("current");
    window.location.href = "login.html";
  });
}

function applyActiveNavItem() {
  const current = location.pathname.split("/").pop();
  document.querySelectorAll(".nav-item").forEach((el) => {
    if (el.getAttribute("href") === current) {
      el.classList.add("active");
    }
  });
}

function initMobileNav() {
  const sidebar = document.getElementById("appSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const menuBtn = document.getElementById("mobileMenuBtn");

  const open = () => {
    sidebar?.classList.add("mobile-open");
    overlay?.classList.add("open");
  };
  const close = () => {
    sidebar?.classList.remove("mobile-open");
    overlay?.classList.remove("open");
  };

  menuBtn?.addEventListener("click", open);
  overlay?.addEventListener("click", close);
}

function initAvatarDropdown() {
  const btn = document.getElementById("avatarMenuBtn");
  const dropdown = document.getElementById("avatarDropdown");
  if (!btn || !dropdown) return;

  btn.addEventListener("click", (event) => {
    event.stopPropagation();
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target) && !btn.contains(event.target)) {
      dropdown.classList.remove("open");
    }
  });
}

function renderNotificationPanel() {
  const panel = document.getElementById("notifPanel");
  if (!panel) return;

  if (!notificationStore.length) {
    panel.innerHTML = `
      <div class="notification-item">
        <strong>Notifications</strong>
        <p style="margin-top:6px;color:var(--text-muted)">You are all caught up!</p>
      </div>
    `;
    return;
  }

  panel.innerHTML = `
    <div class="notification-item" style="display:flex;justify-content:space-between;align-items:center">
      <strong>Notifications</strong>
      <button id="markAllReadBtn" style="border:none;background:transparent;color:var(--primary);cursor:pointer">Mark all as read</button>
    </div>
    ${notificationStore.map((item) => `
      <div class="notification-item">
        <div style="display:flex;justify-content:space-between;gap:8px">
          <span>${item.message}</span>
          <small style="color:var(--text-muted)">${timeAgo(item.createdAt)}</small>
        </div>
      </div>
    `).join("")}
  `;

  document.getElementById("markAllReadBtn")?.addEventListener("click", () => {
    notificationStore.length = 0;
    updateNotifBadge();
    renderNotificationPanel();
  });
}

function initNotificationUI() {
  const btn = document.getElementById("notifBtn");
  const panel = document.getElementById("notifPanel");
  if (!btn || !panel) return;

  btn.addEventListener("click", (event) => {
    event.stopPropagation();
    panel.classList.toggle("open");
    renderNotificationPanel();
  });

  document.addEventListener("click", (event) => {
    if (!panel.contains(event.target) && !btn.contains(event.target)) {
      panel.classList.remove("open");
    }
  });
}

function updateNotifBadge() {
  const dot = document.getElementById("notifDot");
  if (!dot) return;
  dot.hidden = notificationStore.length === 0;
}

function addNotification(message, createdAt = new Date().toISOString()) {
  notificationStore.unshift({ message, createdAt });
  if (notificationStore.length > 30) notificationStore.pop();
  updateNotifBadge();
}

function initNotifSubscription(userId) {
  unsubscribes.forEach((unsub) => {
    if (typeof unsub === "function") unsub();
  });
  unsubscribes = [];

  try {
    const unsubApps = client_.subscribe([`databases.${DB_ID}.collections.applications.documents`], (event) => {
      const payload = event?.payload || {};
      if (payload.workerId === userId || payload.employerId === userId) {
        addNotification("Application status updated", payload.$updatedAt || payload.$createdAt || new Date().toISOString());
      }
    });
    unsubscribes.push(unsubApps);
  } catch {
    // realtime is optional
  }

  try {
    const unsubReviews = client_.subscribe([`databases.${DB_ID}.collections.reviews.documents`], (event) => {
      const payload = event?.payload || {};
      if (payload.targetId === userId || payload.workerId === userId || payload.employerId === userId) {
        addNotification("New review activity", payload.$updatedAt || payload.$createdAt || new Date().toISOString());
      }
    });
    unsubscribes.push(unsubReviews);
  } catch {
    // realtime is optional
  }
}

function applyLanguageToggle() {
  const btn = document.getElementById("languageBtn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const current = localStorage.getItem("lang") || "en";
    const next = current === "en" ? "hi" : "en";
    localStorage.setItem("lang", next);
    window.location.reload();
  });
}

export async function initDashboard(role, pageTitle = "Dashboard") {
  ensureDashboardFonts();
  renderSidebar(role, null);
  renderTopbar(null, pageTitle);

  const userData = await requireAuth(role);
  if (!userData) return null;

  renderSidebar(role, userData);
  renderTopbar(userData, pageTitle);
  initMobileNav();
  initAvatarDropdown();
  initNotificationUI();
  initNotifSubscription(userData.user.$id);
  applyActiveNavItem();
  applyLanguageToggle();
  await preloadBadges(userData);

  return userData;
}

async function preloadBadges(userData) {
  const badgePendingApps = document.querySelector('[data-badge-id="pendingApps"]');
  if (badgePendingApps) {
    try {
      const docs = await db.listDocuments(DB_ID, "applications", [Query.equal("workerId", userData.user.$id), Query.equal("status", "pending"), Query.limit(200)]);
      badgePendingApps.textContent = String(docs.total || docs.documents.length || 0);
    } catch {
      badgePendingApps.textContent = "0";
    }
  }

  const badgeOpenJobs = document.querySelector('[data-badge-id="openJobs"]');
  if (badgeOpenJobs) {
    try {
      const docs = await db.listDocuments(DB_ID, "jobs", [Query.equal("employerId", userData.user.$id), Query.equal("status", "open"), Query.limit(200)]);
      badgeOpenJobs.textContent = String(docs.total || docs.documents.length || 0);
    } catch {
      badgeOpenJobs.textContent = "0";
    }
  }

  const badgePendingApplicants = document.querySelector('[data-badge-id="pendingApplicants"]');
  if (badgePendingApplicants) {
    try {
      const jobs = await db.listDocuments(DB_ID, "jobs", [Query.equal("employerId", userData.user.$id), Query.limit(200)]);
      const jobIds = jobs.documents.map((item) => item.$id);
      if (!jobIds.length) {
        badgePendingApplicants.textContent = "0";
        return;
      }
      const applications = await db.listDocuments(DB_ID, "applications", [Query.equal("jobId", jobIds), Query.equal("status", "pending"), Query.limit(200)]);
      badgePendingApplicants.textContent = String(applications.total || applications.documents.length || 0);
    } catch {
      badgePendingApplicants.textContent = "0";
    }
  }
}

export function animateCounter(el, target, duration = 1200) {
  const start = performance.now();
  const from = 0;
  const end = Number(target || 0);

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = Math.round(from + (end - from) * eased);
    el.textContent = String(val);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

export function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const min = Math.floor(diff / 60000);
  if (Number.isNaN(min)) return "-";
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(isoString).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

export function showSkeletons(containerId, count = 3) {
  const container = typeof containerId === "string" ? document.getElementById(containerId) : containerId;
  if (!container) return;
  container.setAttribute("aria-busy", "true");
  container.innerHTML = Array.from({ length: count }).map(() => `
    <div class="skeleton-card">
      <div class="skeleton" style="height:18px;width:55%;margin-bottom:10px"></div>
      <div class="skeleton" style="height:12px;width:85%;margin-bottom:8px"></div>
      <div class="skeleton" style="height:12px;width:65%"></div>
    </div>
  `).join("");
}

export function hideSkeletons(containerId) {
  const container = typeof containerId === "string" ? document.getElementById(containerId) : containerId;
  if (!container) return;
  container.removeAttribute("aria-busy");
}

export function showToast(message, type = "success") {
  const root = document.querySelector(".toast-root") || (() => {
    const node = document.createElement("div");
    node.className = "toast-root";
    document.body.appendChild(node);
    return node;
  })();

  const toast = document.createElement("div");
  toast.className = `toast toast-${type === "error" ? "error" : type === "warning" ? "warning" : "success"}`;
  toast.innerHTML = `${icon(type === "error" ? "ph-x-circle" : type === "warning" ? "ph-warning-circle" : "ph-check-circle")}<span>${message}</span>`;
  root.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

export function showConfirm(title, message, onConfirm) {
  const modal = document.createElement("div");
  modal.className = "confirm-modal";
  modal.innerHTML = `
    <div class="confirm-box" role="dialog" aria-modal="true" aria-label="Confirmation">
      <h3 style="font-family:var(--font-display);margin-bottom:8px">${title}</h3>
      <p style="color:var(--text-body)">${message}</p>
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px">
        <button class="btn btn-outline" id="confirmCancelBtn">Cancel</button>
        <button class="btn btn-primary" id="confirmOkBtn">Confirm</button>
      </div>
    </div>
  `;

  modal.querySelector("#confirmCancelBtn")?.addEventListener("click", () => modal.remove());
  modal.querySelector("#confirmOkBtn")?.addEventListener("click", async () => {
    try {
      await onConfirm?.();
    } finally {
      modal.remove();
    }
  });

  document.body.appendChild(modal);
}
