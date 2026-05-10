const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const ADMIN_PASSWORD = "mitaoe_2026";
const MAX_IMAGE_SIZE_MB = 1.5;
const DEFAULT_MODE = "Online";
const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

const DB_KEYS = {
  admin: "hackfind_admin",
  hackathons: "hackfind_hackathons_content",
  localContests: "hackfind_local_contests",
  posters: "hackfind_posters_content",
  news: "hackfind_news_content"
};

const cacheStatus = document.getElementById("cacheStatus");
const lastSync = document.getElementById("lastSync");
const tabs = [...document.querySelectorAll(".tab")];
const panels = [...document.querySelectorAll(".tab-panel")];
const cpAdminPanel = document.getElementById("cpAdminPanel");
const adminToggle = document.getElementById("adminToggle");
const parserInput = document.getElementById("parserInput");
const parserPreview = document.getElementById("parserPreview");
const publishContestBtn = document.getElementById("publishContestBtn");
const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeModal = document.getElementById("closeModal");
const globalSearch = document.getElementById("globalSearch");
const modeFilter = document.getElementById("modeFilter");
const activeOnly = document.getElementById("activeOnly");
const hackathonCount = document.getElementById("hackathonCount");
const cpCount = document.getElementById("cpCount");
const clubCount = document.getElementById("clubCount");
const featuredGrid = document.getElementById("featuredGrid");
const newsFeed = document.getElementById("newsFeed");

const adminModal = document.getElementById("adminModal");
const closeAdminModal = document.getElementById("closeAdminModal");
const adminLoginView = document.getElementById("adminLoginView");
const adminDashboardView = document.getElementById("adminDashboardView");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminPassword = document.getElementById("adminPassword");
const adminError = document.getElementById("adminError");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");

const hackathonForm = document.getElementById("hackathonForm");
const hackathonId = document.getElementById("hackathonId");
const hackathonTitle = document.getElementById("hackathonTitle");
const hackathonOrganizer = document.getElementById("hackathonOrganizer");
const hackathonLocation = document.getElementById("hackathonLocation");
const hackathonPrize = document.getElementById("hackathonPrize");
const hackathonMode = document.getElementById("hackathonMode");
const hackathonRegion = document.getElementById("hackathonRegion");
const hackathonStart = document.getElementById("hackathonStart");
const hackathonEnd = document.getElementById("hackathonEnd");
const hackathonLink = document.getElementById("hackathonLink");
const hackathonFeatured = document.getElementById("hackathonFeatured");
const hackathonAdminList = document.getElementById("hackathonAdminList");

const posterForm = document.getElementById("posterForm");
const posterId = document.getElementById("posterId");
const posterTitle = document.getElementById("posterTitle");
const posterDescription = document.getElementById("posterDescription");
const posterCategory = document.getElementById("posterCategory");
const posterDeadline = document.getElementById("posterDeadline");
const posterStart = document.getElementById("posterStart");
const posterEnd = document.getElementById("posterEnd");
const posterLink = document.getElementById("posterLink");
const posterFeatured = document.getElementById("posterFeatured");
const posterUploader = document.getElementById("posterUploader");
const posterAdminList = document.getElementById("posterAdminList");

const newsForm = document.getElementById("newsForm");
const newsId = document.getElementById("newsId");
const newsTitle = document.getElementById("newsTitle");
const newsDescription = document.getElementById("newsDescription");
const newsLink = document.getElementById("newsLink");
const newsDate = document.getElementById("newsDate");
const newsFeatured = document.getElementById("newsFeatured");
const newsAdminList = document.getElementById("newsAdminList");
const featuredAdminList = document.getElementById("featuredAdminList");

const appState = {
  hackathons: [],
  cpContests: []
};

const backgroundRefreshInFlight = new Set();

const defaultHackathons = [
  { id: "h1", title: "Global AI Sprint", organizer: "Open Tech League", location: "Worldwide", prize: "$25,000", mode: "Online", startDate: "2026-05-12", endDate: "2026-05-14", link: "https://example.com/ai-sprint", region: "international", featured: true },
  { id: "h2", title: "Web3 Builders Cup", organizer: "ChainHub", location: "Worldwide", prize: "$30,000", mode: "Hybrid", startDate: "2026-05-19", endDate: "2026-05-21", link: "https://example.com/web3-builders", region: "international", featured: false },
  { id: "h3", title: "HealthTech Makers", organizer: "MediFuture", location: "Worldwide", prize: "$20,000", mode: "Online", startDate: "2026-05-26", endDate: "2026-05-28", link: "https://example.com/healthtech", region: "international", featured: false },
  { id: "h4", title: "CloudX Hack Open", organizer: "SkyLabs", location: "Worldwide", prize: "$18,000", mode: "Online", startDate: "2026-06-02", endDate: "2026-06-04", link: "https://example.com/cloudx", region: "international", featured: false },
  { id: "h5", title: "Cyber Defense Jam", organizer: "SecureLabs", location: "Worldwide", prize: "$22,000", mode: "Hybrid", startDate: "2026-06-07", endDate: "2026-06-08", link: "https://example.com/cyber-jam", region: "international", featured: true },
  { id: "h6", title: "India Innovate Hack", organizer: "Tech India Forum", location: "India", prize: "₹8,00,000", mode: "Hybrid", startDate: "2026-05-13", endDate: "2026-05-15", link: "https://example.com/india-innovate", region: "national", featured: false },
  { id: "h7", title: "Code Bharat Buildathon", organizer: "Dev Bharat", location: "India", prize: "₹5,00,000", mode: "Online", startDate: "2026-05-20", endDate: "2026-05-21", link: "https://example.com/code-bharat", region: "national", featured: false },
  { id: "h8", title: "Smart India Hack Push", organizer: "Campus Network", location: "India", prize: "₹12,00,000", mode: "Offline", startDate: "2026-05-29", endDate: "2026-05-31", link: "https://example.com/sih-push", region: "national", featured: true },
  { id: "h9", title: "MahaTech Pune Challenge", organizer: "Pune Dev Circle", location: "Pune", prize: "₹2,00,000", mode: "Offline", startDate: "2026-05-11", endDate: "2026-05-12", link: "https://example.com/mahatech", region: "maharashtra", featured: false },
  { id: "h10", title: "Mumbai Build Sprint", organizer: "Mumbai Innovators", location: "Mumbai", prize: "₹3,50,000", mode: "Hybrid", startDate: "2026-05-17", endDate: "2026-05-18", link: "https://example.com/mumbai-build", region: "maharashtra", featured: false },
  { id: "h11", title: "Nashik Future Tech", organizer: "Nashik Tech Hub", location: "Nashik", prize: "₹1,50,000", mode: "Offline", startDate: "2026-05-24", endDate: "2026-05-25", link: "https://example.com/nashik-future", region: "maharashtra", featured: false }
];

const defaultNews = [
  { id: "n1", title: "HackFind Live Content System Upgraded", description: "Hackathons, posters, and announcements are now managed dynamically for faster updates.", link: "", date: "2026-05-10", featured: true },
  { id: "n2", title: "Club Announcement Feed Expanded", description: "News now includes deadlines, featured priority, and admin editing workflows.", link: "", date: "2026-05-09", featured: false }
];

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function load(key, fallback = null) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function ensureSeedData() {
  if (!Array.isArray(load(DB_KEYS.hackathons))) save(DB_KEYS.hackathons, defaultHackathons);
  if (!Array.isArray(load(DB_KEYS.news))) save(DB_KEYS.news, defaultNews);
  if (!Array.isArray(load(DB_KEYS.posters))) save(DB_KEYS.posters, []);
  if (!Array.isArray(load(DB_KEYS.localContests))) save(DB_KEYS.localContests, []);
}

function readHackathons() {
  return load(DB_KEYS.hackathons, defaultHackathons);
}

function readNews() {
  return load(DB_KEYS.news, defaultNews);
}

function readPosters() {
  return load(DB_KEYS.posters, []);
}

function readLocalContests() {
  return load(DB_KEYS.localContests, []);
}

function updateCollection(key, updater) {
  if (!isAdmin()) return;
  const current = load(key, []);
  const next = updater(Array.isArray(current) ? current : []);
  save(key, next);
  refreshDynamicContent();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeUrl(value) {
  if (!value) return "";
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : "";
  } catch {
    return "";
  }
}

function toDate(value) {
  if (!value) return new Date(NaN);
  const candidate = String(value).trim();
  if (!candidate) return new Date(NaN);
  const direct = new Date(candidate);
  if (!Number.isNaN(direct.getTime())) return direct;
  return new Date(`${candidate.slice(0, 10)}T00:00:00`);
}

function makeId(prefix) {
  if (globalThis.crypto?.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
  if (globalThis.crypto?.getRandomValues) {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    const token = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
    return `${prefix}_${Date.now()}_${token}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const includesTime = String(value).includes(":") || String(value).includes("T");
  if (includesTime) {
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function getItemEnd(item) {
  return item.endDate || item.end_time || item.deadline || item.date || item.startDate || item.start_time || "";
}

function countdownLabel(endDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = toDate(endDate);
  if (Number.isNaN(target.getTime())) return "Upcoming";
  const targetDay = new Date(target);
  targetDay.setHours(0, 0, 0, 0);
  const days = Math.ceil((targetDay - today) / (1000 * 60 * 60 * 24));
  if (days < 0) return "Ended";
  if (days === 0) return "Live Today";
  return `${days} day${days > 1 ? "s" : ""} left`;
}

function timeRemainingLabel(endDate) {
  const target = toDate(endDate);
  if (Number.isNaN(target.getTime())) return "No deadline";
  const now = Date.now();
  const diff = target.getTime() - now;
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m left`;
}

function isUpcomingOrLive(item) {
  const endDate = toDate(getItemEnd(item));
  if (Number.isNaN(endDate.getTime())) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  return endDate >= today;
}

function isPosterActive(poster) {
  const now = Date.now();
  const start = toDate(poster.startDate).getTime();
  const end = toDate(poster.endDate).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
  return start <= now && end >= now;
}

function isPosterExpired(poster) {
  const end = toDate(poster.endDate).getTime();
  return Number.isFinite(end) ? end < Date.now() : false;
}

function getSearchQuery() {
  return (globalSearch?.value || "").trim().toLowerCase();
}

function matchesSearch(item, query) {
  if (!query) return true;
  const haystack = [
    item.title,
    item.name,
    item.organizer,
    item.site,
    item.platform,
    item.location,
    item.mode,
    item.prize,
    item.description,
    item.category
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function applyCommonFilters(items) {
  const query = getSearchQuery();
  const mode = (modeFilter?.value || "all").toLowerCase();
  const onlyActive = activeOnly?.checked === true;

  return items.filter((item) => {
    if (!matchesSearch(item, query)) return false;
    if (mode !== "all" && item.mode && String(item.mode).toLowerCase() !== mode) return false;
    if (onlyActive && !isUpcomingOrLive(item)) return false;
    return true;
  });
}

function cardTemplate(item) {
  const link = safeUrl(item.url || item.link);
  const title = escapeHtml(item.title || item.name || "Untitled Event");
  const organizer = escapeHtml(item.organizer || item.site || item.platform || "-");
  const location = escapeHtml(item.location || "Global");
  const prize = escapeHtml(item.prize || "N/A");
  const mode = escapeHtml(item.mode || DEFAULT_MODE);
  const startDate = escapeHtml(formatDate(item.startDate || item.start_time || "-"));
  const endDateRaw = item.endDate || item.end_time || "";
  const endDate = escapeHtml(formatDate(endDateRaw || "-"));
  const countdownBase = endDateRaw || item.startDate || item.start_time || "";

  return `<article class="card glass">
    <h3>${title}</h3>
    <p class="meta">Organizer/Platform: ${organizer}</p>
    <p class="meta">Location: ${location}</p>
    <p class="meta">Prize: ${prize}</p>
    <p class="meta">Mode: ${mode}</p>
    <p class="meta">Start: ${startDate}</p>
    <p class="meta">End: ${endDate}</p>
    <span class="countdown">${countdownLabel(countdownBase)}</span>
    ${link ? `<div class="card-actions"><a href="${link}" target="_blank" rel="noopener noreferrer">Open Link</a></div>` : ""}
  </article>`;
}

function emptyState(message) {
  return `<div class="empty">${escapeHtml(message)}</div>`;
}

function setCacheStatus(text) {
  if (cacheStatus) cacheStatus.textContent = text;
}

function setLastSync(timestamp = Date.now()) {
  if (!lastSync) return;
  const date = new Date(timestamp);
  lastSync.textContent = `Last sync: ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

async function loadWithCache(key, fetcher, onBackgroundRefresh) {
  const now = Date.now();
  const cached = load(key);

  if (cached?.data && now - cached.timestamp < CACHE_TTL_MS) {
    setCacheStatus("Cached • Fast mode");
    setLastSync(cached.timestamp);
    if (!backgroundRefreshInFlight.has(key)) {
      backgroundRefreshInFlight.add(key);
      fetcher()
        .then((fresh) => {
          save(key, { timestamp: Date.now(), data: fresh });
          onBackgroundRefresh?.(fresh);
          setCacheStatus("Live sync complete");
          setLastSync(Date.now());
        })
        .catch((error) => {
          console.warn("Background refresh failed:", error);
        })
        .finally(() => {
          backgroundRefreshInFlight.delete(key);
        });
    }
    return cached.data;
  }

  const fresh = await fetcher();
  save(key, { timestamp: now, data: fresh });
  setCacheStatus("Live sync complete");
  setLastSync(now);
  return fresh;
}

function isAdmin() {
  return load(DB_KEYS.admin, false) === true;
}

function requireAdmin() {
  if (!isAdmin()) {
    showAdminError("Admin access required.");
    return false;
  }
  return true;
}

function showAdminError(message) {
  if (!adminError) return;
  adminError.textContent = message;
  adminError.classList.remove("hidden");
}

function clearAdminError() {
  if (!adminError) return;
  adminError.textContent = "";
  adminError.classList.add("hidden");
}

function openAdminModal() {
  adminModal.classList.remove("hidden");
  renderAdminModalState();
}

function closeAdminPanel() {
  adminModal.classList.add("hidden");
  clearAdminError();
}

function renderAdminModalState() {
  const enabled = isAdmin();
  adminLoginView.classList.toggle("hidden", enabled);
  adminDashboardView.classList.toggle("hidden", !enabled);
  adminToggle.textContent = enabled ? "Admin Dashboard" : "Admin Login";
  cpAdminPanel.classList.toggle("hidden", !enabled);
  if (enabled) {
    renderAdminLists();
    clearAdminError();
  } else {
    adminPassword.value = "";
  }
  renderClubContests();
  renderPosters();
}

function activateTab(tab) {
  tabs.forEach((t) => {
    t.classList.remove("active");
    t.setAttribute("aria-selected", "false");
  });
  panels.forEach((p) => p.classList.remove("active"));

  tab.classList.add("active");
  tab.setAttribute("aria-selected", "true");
  const panel = document.getElementById(tab.dataset.tab);
  panel?.classList.add("active");
}

tabs.forEach((tab, idx) => {
  const safeTabKey = (tab.dataset.tab || `tab-${idx}`).replace(/[^a-zA-Z0-9_-]/g, "-");
  tab.id = `tab-${safeTabKey}`;
  tab.setAttribute("tabindex", idx === 0 ? "0" : "-1");
  tab.setAttribute("aria-controls", tab.dataset.tab);

  tab.addEventListener("click", () => {
    activateTab(tab);
    tabs.forEach((t) => t.setAttribute("tabindex", t === tab ? "0" : "-1"));
  });

  tab.addEventListener("keydown", (event) => {
    const current = tabs.indexOf(tab);
    if (event.key === "ArrowRight") {
      event.preventDefault();
      const next = tabs[(current + 1) % tabs.length];
      next.focus();
      next.click();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      const prev = tabs[(current - 1 + tabs.length) % tabs.length];
      prev.focus();
      prev.click();
    }
    if (event.key === "Home") {
      event.preventDefault();
      tabs[0].focus();
      tabs[0].click();
    }
    if (event.key === "End") {
      event.preventDefault();
      tabs[tabs.length - 1].focus();
      tabs[tabs.length - 1].click();
    }
  });
});

function renderHackathons(all) {
  const filtered = applyCommonFilters(all).sort((a, b) => toDate(a.startDate) - toDate(b.startDate));
  const intl = filtered.filter((h) => h.region === "international").slice(0, 8);
  const national = filtered.filter((h) => h.region === "national");
  const maha = filtered.filter((h) => h.region === "maharashtra");

  const internationalGrid = document.getElementById("internationalGrid");
  const nationalGrid = document.getElementById("nationalGrid");
  const maharashtraGrid = document.getElementById("maharashtraGrid");

  internationalGrid.innerHTML = intl.length ? intl.map(cardTemplate).join("") : emptyState("No matching international events.");
  nationalGrid.innerHTML = national.length ? national.map(cardTemplate).join("") : emptyState("No matching national events.");
  maharashtraGrid.innerHTML = maha.length ? maha.map(cardTemplate).join("") : emptyState("No matching Maharashtra events.");
}

function renderCPFeed(contests) {
  const root = document.getElementById("cpFeed");
  const filtered = applyCommonFilters(contests);
  root.innerHTML = filtered.length ? filtered.map(cardTemplate).join("") : emptyState("No matching CP contests.");
}

function renderNews() {
  const items = applyCommonFilters(readNews())
    .sort((a, b) => toDate(b.date) - toDate(a.date))
    .slice(0, 8);

  newsFeed.innerHTML = items.length
    ? items
        .map((item) => {
          const link = safeUrl(item.link);
          return `<article class="card glass news-card">
            <div class="news-head">
              <h3>${escapeHtml(item.title)}</h3>
              ${item.featured ? '<span class="mini-badge">Featured</span>' : ""}
            </div>
            <p class="meta">${escapeHtml(item.description)}</p>
            <p class="meta">Published: ${escapeHtml(formatDate(item.date))}</p>
            ${link ? `<a href="${link}" target="_blank" rel="noopener noreferrer">Read more</a>` : ""}
          </article>`;
        })
        .join("")
    : emptyState("No news updates yet.");
}

function normalizePoster(poster) {
  return {
    ...poster,
    featured: Boolean(poster.featured),
    title: String(poster.title || "").trim(),
    description: String(poster.description || "").trim(),
    category: String(poster.category || "General").trim(),
    startDate: String(poster.startDate || "").trim(),
    endDate: String(poster.endDate || "").trim(),
    deadline: String(poster.deadline || poster.endDate || "").trim(),
    link: safeUrl(poster.link),
    src: String(poster.src || "").trim()
  };
}

function posterSort(a, b) {
  if (Boolean(b.featured) !== Boolean(a.featured)) return Number(b.featured) - Number(a.featured);
  return toDate(a.endDate) - toDate(b.endDate);
}

function renderPosters() {
  const root = document.getElementById("posterGrid");
  const posters = readPosters().map(normalizePoster).filter((poster) => !isPosterExpired(poster));
  const searched = applyCommonFilters(posters);
  const activityFiltered = searched.filter((poster) => (activeOnly?.checked ? isPosterActive(poster) : true));
  const filtered = activityFiltered.sort(posterSort);

  if (!filtered.length) {
    root.innerHTML = emptyState("No active posters right now.");
    return;
  }

  root.innerHTML = filtered
    .map((poster) => {
      const safeLink = safeUrl(poster.link);
      return `<article class="poster-card glass">
        <div class="poster-image-wrap">
          <img src="${poster.src}" alt="${escapeHtml(poster.title || "Poster")}" data-img="${poster.src}" />
          <span class="time-badge">${escapeHtml(timeRemainingLabel(poster.endDate))}</span>
          ${poster.featured ? '<span class="feature-badge">Featured</span>' : ""}
        </div>
        <div class="poster-body">
          <h3>${escapeHtml(poster.title)}</h3>
          <p class="meta">${escapeHtml(poster.description)}</p>
          <p class="meta">Category: ${escapeHtml(poster.category)} • Deadline: ${escapeHtml(formatDate(poster.deadline))}</p>
          ${safeLink ? `<a class="poster-cta" href="${safeLink}" target="_blank" rel="noopener noreferrer">View Event</a>` : ""}
        </div>
      </article>`;
    })
    .join("");

  root.querySelectorAll("img[data-img]").forEach((img) => {
    img.addEventListener("click", () => {
      modalImage.src = img.dataset.img;
      modal.classList.remove("hidden");
    });
  });
}

function renderFeatured() {
  const featuredHackathons = readHackathons()
    .filter((item) => item.featured)
    .filter((item) => !activeOnly?.checked || isUpcomingOrLive(item))
    .map((item) => ({ type: "Hackathon", title: item.title, subtitle: `${item.organizer} • ${formatDate(item.endDate)}`, link: item.link, priorityDate: item.endDate }));

  const featuredPosters = readPosters()
    .map(normalizePoster)
    .filter((item) => item.featured && !isPosterExpired(item))
    .filter((item) => !activeOnly?.checked || isPosterActive(item))
    .map((item) => ({ type: "Poster", title: item.title, subtitle: `${item.category} • ${formatDate(item.deadline)}`, link: item.link, priorityDate: item.endDate }));

  const featuredNews = readNews()
    .filter((item) => item.featured)
    .map((item) => ({ type: "News", title: item.title, subtitle: formatDate(item.date), link: item.link, priorityDate: item.date }));

  const combined = [...featuredHackathons, ...featuredPosters, ...featuredNews]
    .filter((item) => matchesSearch(item, getSearchQuery()))
    .sort((a, b) => toDate(a.priorityDate) - toDate(b.priorityDate))
    .slice(0, 10);

  featuredGrid.innerHTML = combined.length
    ? combined
        .map((item) => {
          const link = safeUrl(item.link);
          return `<article class="feature-card glass">
              <p class="eyebrow">${escapeHtml(item.type)}</p>
              <h3>${escapeHtml(item.title)}</h3>
              <p class="meta">${escapeHtml(item.subtitle)}</p>
              ${link ? `<a href="${link}" target="_blank" rel="noopener noreferrer">Open</a>` : ""}
          </article>`;
        })
        .join("")
    : emptyState("No featured content available.");
}

function parseContestText(text) {
  const required = ["Platform", "Name", "Timing", "Duration", "Link"];
  const obj = {};

  for (const line of text.split("\n")) {
    const [rawFieldName, ...rest] = line.split(":");
    if (!rawFieldName || rest.length === 0) continue;
    obj[rawFieldName.trim()] = rest.join(":").trim();
  }

  if (!required.every((key) => obj[key])) {
    return { error: "Invalid format. Required: Platform, Name, Timing, Duration, Link" };
  }
  if (!safeUrl(obj.Link)) {
    return { error: "Link must be a valid HTTP/HTTPS URL." };
  }

  function durationToMs(duration) {
    const textValue = String(duration).toLowerCase();
    const parts = [...textValue.matchAll(/(\d+)\s*(day|days|d|hour|hours|hr|hrs|h|minute|minutes|min|mins|m)\b/g)];
    if (!parts.length) return 0;

    return parts.reduce((total, match) => {
      const value = Number(match[1]);
      const unit = match[2];
      if (Number.isNaN(value)) return total;
      if (["day", "days", "d"].includes(unit)) return total + value * 24 * 60 * 60 * 1000;
      if (["hour", "hours", "hr", "hrs", "h"].includes(unit)) return total + value * 60 * 60 * 1000;
      return total + value * 60 * 1000;
    }, 0);
  }

  function deriveEndTime(start, duration) {
    const startDate = toDate(start);
    if (Number.isNaN(startDate.getTime())) return start;
    const durationMs = durationToMs(duration);
    if (!durationMs) return start;
    return new Date(startDate.getTime() + durationMs).toISOString();
  }

  return {
    data: {
      id: makeId("cp"),
      platform: obj.Platform,
      name: obj.Name,
      start_time: obj.Timing,
      end_time: deriveEndTime(obj.Timing, obj.Duration),
      duration: obj.Duration,
      link: obj.Link,
      organizer: obj.Platform,
      location: "Global",
      prize: "N/A",
      mode: DEFAULT_MODE
    }
  };
}

function renderClubContests() {
  const entries = readLocalContests();
  const root = document.getElementById("clubContestFeed");

  const withIndex = entries.map((entry, idx) => ({ entry, idx }));
  const filtered = withIndex.filter(({ entry }) => applyCommonFilters([entry]).length > 0);

  if (!filtered.length) {
    root.innerHTML = emptyState(entries.length ? "No matching club contests." : "No club contests published yet.");
    return;
  }

  root.innerHTML = filtered
    .map(
      ({ entry, idx }) => `<div class="stack-entry">
        ${cardTemplate(entry)}
        ${isAdmin() ? `<button class="btn-subtle" data-del-contest="${idx}">Delete</button>` : ""}
      </div>`
    )
    .join("");

  if (isAdmin()) {
    root.querySelectorAll("button[data-del-contest]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!requireAdmin()) return;
        const i = Number(btn.dataset.delContest);
        updateCollection(DB_KEYS.localContests, (all) => {
          all.splice(i, 1);
          return all;
        });
      });
    });
  }
}

async function fetchCPContests() {
  try {
    const res = await fetch("https://kontests.net/api/v1/all");
    if (!res.ok) throw new Error("Fetch failed");

    const data = await res.json();
    return data
      .map((d) => ({
        ...d,
        title: d.name,
        organizer: d.site,
        location: "Global",
        mode: DEFAULT_MODE,
        prize: "N/A"
      }))
      .sort((a, b) => toDate(a.start_time) - toDate(b.start_time))
      .slice(0, 10);
  } catch {
    return [
      {
        title: "Fallback CP Contest",
        site: "Codeforces",
        start_time: "2026-05-10",
        end_time: "2026-05-10",
        url: "https://codeforces.com",
        location: "Global",
        mode: DEFAULT_MODE,
        prize: "N/A"
      }
    ];
  }
}

function updateStats() {
  const filteredHackathons = applyCommonFilters(appState.hackathons);
  const filteredCp = applyCommonFilters(appState.cpContests);
  const filteredClub = applyCommonFilters(readLocalContests());

  if (hackathonCount) hackathonCount.textContent = String(filteredHackathons.length);
  if (cpCount) cpCount.textContent = String(filteredCp.length);
  if (clubCount) clubCount.textContent = String(filteredClub.length);
}

function refreshFeedViews() {
  renderHackathons(appState.hackathons);
  renderCPFeed(appState.cpContests);
  renderClubContests();
  renderPosters();
  renderNews();
  renderFeatured();
  updateStats();
}

function refreshDynamicContent() {
  appState.hackathons = readHackathons();
  refreshFeedViews();
  renderAdminModalState();
}

function normalizeRequiredText(value, label, min = 2, max = 140) {
  const normalized = String(value || "").trim();
  if (!normalized || normalized.length < min || normalized.length > max) {
    throw new Error(`${label} must be between ${min} and ${max} characters.`);
  }
  return normalized;
}

function normalizeDate(value, label) {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} is invalid.`);
  return String(value);
}

function validateDateOrder(start, end, labels = ["Start date", "End date"]) {
  if (toDate(end).getTime() < toDate(start).getTime()) {
    throw new Error(`${labels[1]} must be on or after ${labels[0]}.`);
  }
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read the uploaded image file."));
    reader.readAsDataURL(file);
  });
}

function validateImageFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) throw new Error("Only image uploads are allowed.");
  const extension = String(file.name || "")
    .split(".")
    .pop()
    .toLowerCase();
  if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
    throw new Error("Allowed image formats: JPG, PNG, WEBP, GIF.");
  }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) throw new Error(`Image must be under ${MAX_IMAGE_SIZE_MB}MB.`);
}

async function verifyImageDataUrl(dataUrl) {
  await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) reject(new Error("Uploaded image appears to be corrupted."));
      else resolve();
    };
    img.onerror = () => reject(new Error("Uploaded image is invalid or corrupted."));
    img.src = dataUrl;
  });
}

async function submitHackathon(event) {
  event.preventDefault();
  if (!requireAdmin()) return;

  try {
    const normalizedHackathonLink = String(hackathonLink.value || "").trim();
    const validatedHackathonLink = normalizedHackathonLink ? safeUrl(normalizedHackathonLink) : "";
    if (normalizedHackathonLink && !validatedHackathonLink) {
      throw new Error("Hackathon link must be a valid HTTP/HTTPS URL.");
    }

    const payload = {
      id: hackathonId.value || makeId("hack"),
      title: normalizeRequiredText(hackathonTitle.value, "Title"),
      organizer: normalizeRequiredText(hackathonOrganizer.value, "Organizer"),
      location: normalizeRequiredText(hackathonLocation.value, "Location"),
      prize: normalizeRequiredText(hackathonPrize.value, "Prize", 1, 60),
      mode: normalizeRequiredText(hackathonMode.value, "Mode", 3, 10),
      region: normalizeRequiredText(hackathonRegion.value, "Region", 4, 20),
      startDate: normalizeDate(hackathonStart.value, "Start date"),
      endDate: normalizeDate(hackathonEnd.value, "End date"),
      link: validatedHackathonLink,
      featured: Boolean(hackathonFeatured.checked)
    };

    validateDateOrder(payload.startDate, payload.endDate);

    updateCollection(DB_KEYS.hackathons, (all) => {
      const idx = all.findIndex((item) => item.id === payload.id);
      if (idx >= 0) all[idx] = payload;
      else all.unshift(payload);
      return all;
    });

    hackathonForm.reset();
    hackathonId.value = "";
  } catch (error) {
    showAdminError(error.message || "Unable to save hackathon.");
  }
}

async function submitPoster(event) {
  event.preventDefault();
  if (!requireAdmin()) return;

  try {
    const file = posterUploader.files?.[0];
    validateImageFile(file);
    const editingId = posterId.value;
    const existing = readPosters().find((item) => item.id === editingId);
    const nextSrc = file ? await fileToDataUrl(file) : existing?.src;
    if (file && nextSrc) await verifyImageDataUrl(nextSrc);
    if (!nextSrc) throw new Error("Poster image is required.");

    const normalizedPosterLink = normalizeRequiredText(posterLink.value, "Event link", 1, 300);
    const validatedPosterLink = safeUrl(normalizedPosterLink);
    if (!validatedPosterLink) throw new Error("Event link must be a valid HTTP/HTTPS URL.");

    const payload = {
      id: editingId || makeId("poster"),
      title: normalizeRequiredText(posterTitle.value, "Poster title"),
      description: normalizeRequiredText(posterDescription.value, "Description", 8, 320),
      category: normalizeRequiredText(posterCategory.value, "Category", 2, 40),
      deadline: normalizeDate(posterDeadline.value, "Deadline"),
      startDate: normalizeDate(posterStart.value, "Start date"),
      endDate: normalizeDate(posterEnd.value, "End date"),
      link: validatedPosterLink,
      featured: Boolean(posterFeatured.checked),
      src: nextSrc,
      ts: Date.now()
    };

    validateDateOrder(payload.startDate, payload.endDate);
    validateDateOrder(payload.startDate, payload.deadline, ["Start date", "Deadline"]);
    validateDateOrder(payload.deadline, payload.endDate, ["Deadline", "End date"]);

    updateCollection(DB_KEYS.posters, (all) => {
      const idx = all.findIndex((item) => item.id === payload.id);
      if (idx >= 0) all[idx] = payload;
      else all.unshift(payload);
      return all;
    });

    posterForm.reset();
    posterId.value = "";
  } catch (error) {
    showAdminError(error.message || "Unable to save poster.");
  }
}

async function submitNews(event) {
  event.preventDefault();
  if (!requireAdmin()) return;

  try {
    const normalizedNewsLink = String(newsLink.value || "").trim();
    const validatedNewsLink = normalizedNewsLink ? safeUrl(normalizedNewsLink) : "";
    if (normalizedNewsLink && !validatedNewsLink) {
      throw new Error("News link must be a valid HTTP/HTTPS URL.");
    }

    const payload = {
      id: newsId.value || makeId("news"),
      title: normalizeRequiredText(newsTitle.value, "News title"),
      description: normalizeRequiredText(newsDescription.value, "News description", 8, 320),
      link: validatedNewsLink,
      date: normalizeDate(newsDate.value, "News date"),
      featured: Boolean(newsFeatured.checked)
    };

    updateCollection(DB_KEYS.news, (all) => {
      const idx = all.findIndex((item) => item.id === payload.id);
      if (idx >= 0) all[idx] = payload;
      else all.unshift(payload);
      return all;
    });

    newsForm.reset();
    newsId.value = "";
  } catch (error) {
    showAdminError(error.message || "Unable to save news item.");
  }
}

function renderAdminLists() {
  if (!isAdmin()) return;

  const hItems = readHackathons().sort((a, b) => toDate(a.startDate) - toDate(b.startDate));
  hackathonAdminList.innerHTML = hItems.length
    ? hItems
        .map(
          (item) => `<article class="card admin-row glass">
              <div>
                <h4>${escapeHtml(item.title)}</h4>
                <p class="meta">${escapeHtml(item.region)} • ${escapeHtml(formatDate(item.startDate))} → ${escapeHtml(formatDate(item.endDate))}</p>
              </div>
              <div class="inline-actions">
                <button type="button" class="btn-subtle" data-edit-hack="${item.id}">Edit</button>
                <button type="button" class="btn-subtle" data-delete-hack="${item.id}">Delete</button>
              </div>
            </article>`
        )
        .join("")
    : emptyState("No hackathons configured.");

  const pItems = readPosters().map(normalizePoster).sort(posterSort);
  posterAdminList.innerHTML = pItems.length
    ? pItems
        .map(
          (item) => `<article class="card admin-row glass">
            <div>
              <h4>${escapeHtml(item.title)}</h4>
              <p class="meta">${escapeHtml(item.category)} • ${escapeHtml(formatDate(item.endDate))} • ${isPosterExpired(item) ? "Expired" : "Active"}</p>
            </div>
            <div class="inline-actions">
              <button type="button" class="btn-subtle" data-edit-poster="${item.id}">Edit</button>
              <button type="button" class="btn-subtle" data-delete-poster="${item.id}">Delete</button>
            </div>
          </article>`
        )
        .join("")
    : emptyState("No posters added.");

  const nItems = readNews().sort((a, b) => toDate(b.date) - toDate(a.date));
  newsAdminList.innerHTML = nItems.length
    ? nItems
        .map(
          (item) => `<article class="card admin-row glass">
            <div>
              <h4>${escapeHtml(item.title)}</h4>
              <p class="meta">${escapeHtml(formatDate(item.date))}</p>
            </div>
            <div class="inline-actions">
              <button type="button" class="btn-subtle" data-edit-news="${item.id}">Edit</button>
              <button type="button" class="btn-subtle" data-delete-news="${item.id}">Delete</button>
            </div>
          </article>`
        )
        .join("")
    : emptyState("No news updates.");

  const featuredItems = [
    ...hItems.map((item) => ({ ...item, type: "hackathon" })),
    ...pItems.map((item) => ({ ...item, type: "poster" })),
    ...nItems.map((item) => ({ ...item, type: "news" }))
  ];

  featuredAdminList.innerHTML = featuredItems.length
    ? featuredItems
        .map(
          (item) => `<article class="card admin-row glass">
              <div>
                <h4>${escapeHtml(item.title || item.name)}</h4>
                <p class="meta">${escapeHtml(item.type)}</p>
              </div>
              <div class="inline-actions">
                <button type="button" class="btn-subtle" data-toggle-featured="${item.type}:${item.id}">${item.featured ? "Unfeature" : "Feature"}</button>
              </div>
            </article>`
        )
        .join("")
    : emptyState("Nothing to feature yet.");

  wireAdminListActions();
}

function wireAdminListActions() {
  hackathonAdminList.querySelectorAll("[data-edit-hack]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = readHackathons().find((entry) => entry.id === btn.dataset.editHack);
      if (!item) return;
      hackathonId.value = item.id;
      hackathonTitle.value = item.title || "";
      hackathonOrganizer.value = item.organizer || "";
      hackathonLocation.value = item.location || "";
      hackathonPrize.value = item.prize || "";
      hackathonMode.value = item.mode || DEFAULT_MODE;
      hackathonRegion.value = item.region || "international";
      hackathonStart.value = item.startDate || "";
      hackathonEnd.value = item.endDate || "";
      hackathonLink.value = item.link || "";
      hackathonFeatured.checked = Boolean(item.featured);
    });
  });

  hackathonAdminList.querySelectorAll("[data-delete-hack]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!requireAdmin()) return;
      const id = btn.dataset.deleteHack;
      updateCollection(DB_KEYS.hackathons, (all) => all.filter((item) => item.id !== id));
    });
  });

  posterAdminList.querySelectorAll("[data-edit-poster]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = readPosters().find((entry) => entry.id === btn.dataset.editPoster);
      if (!item) return;
      posterId.value = item.id;
      posterTitle.value = item.title || "";
      posterDescription.value = item.description || "";
      posterCategory.value = item.category || "";
      posterDeadline.value = item.deadline || "";
      posterStart.value = item.startDate || "";
      posterEnd.value = item.endDate || "";
      posterLink.value = item.link || "";
      posterFeatured.checked = Boolean(item.featured);
      posterUploader.value = "";
    });
  });

  posterAdminList.querySelectorAll("[data-delete-poster]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!requireAdmin()) return;
      const id = btn.dataset.deletePoster;
      updateCollection(DB_KEYS.posters, (all) => all.filter((item) => item.id !== id));
    });
  });

  newsAdminList.querySelectorAll("[data-edit-news]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = readNews().find((entry) => entry.id === btn.dataset.editNews);
      if (!item) return;
      newsId.value = item.id;
      newsTitle.value = item.title || "";
      newsDescription.value = item.description || "";
      newsLink.value = item.link || "";
      newsDate.value = item.date || "";
      newsFeatured.checked = Boolean(item.featured);
    });
  });

  newsAdminList.querySelectorAll("[data-delete-news]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!requireAdmin()) return;
      const id = btn.dataset.deleteNews;
      updateCollection(DB_KEYS.news, (all) => all.filter((item) => item.id !== id));
    });
  });

  featuredAdminList.querySelectorAll("[data-toggle-featured]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!requireAdmin()) return;
      const [type, id] = String(btn.dataset.toggleFeatured || "").split(":");
      const keyMap = { hackathon: DB_KEYS.hackathons, poster: DB_KEYS.posters, news: DB_KEYS.news };
      const dbKey = keyMap[type];
      if (!dbKey) return;
      updateCollection(dbKey, (all) => all.map((item) => (item.id === id ? { ...item, featured: !item.featured } : item)));
    });
  });
}

if (parserInput) {
  parserInput.addEventListener("input", () => {
    const result = parseContestText(parserInput.value);
    parserPreview.innerHTML = result?.data ? cardTemplate(result.data) : `<p class="meta">${escapeHtml(result?.error || "Preview unavailable. Keep strict format.")}</p>`;
  });
}

publishContestBtn.addEventListener("click", () => {
  if (!requireAdmin()) return;

  const result = parseContestText(parserInput.value);
  if (!result?.data) {
    showAdminError(result?.error || "Invalid format. Required: Platform, Name, Timing, Duration, Link");
    return;
  }

  updateCollection(DB_KEYS.localContests, (contests) => [result.data, ...contests]);
  parserInput.value = "";
  parserPreview.innerHTML = "";
  clearAdminError();
});

adminToggle.addEventListener("click", () => {
  if (isAdmin()) {
    openAdminModal();
    return;
  }
  openAdminModal();
});

adminLoginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const entered = String(adminPassword.value || "");

  if (entered === ADMIN_PASSWORD) {
    save(DB_KEYS.admin, true);
    clearAdminError();
    renderAdminModalState();
    refreshDynamicContent();
  } else {
    save(DB_KEYS.admin, false);
    showAdminError("Access denied. Incorrect admin password.");
  }
});

adminLogoutBtn.addEventListener("click", () => {
  save(DB_KEYS.admin, false);
  renderAdminModalState();
  refreshDynamicContent();
});

closeAdminModal.addEventListener("click", closeAdminPanel);
adminModal.addEventListener("click", (event) => {
  if (event.target === adminModal) closeAdminPanel();
});

hackathonForm.addEventListener("submit", submitHackathon);
posterForm.addEventListener("submit", submitPoster);
newsForm.addEventListener("submit", submitNews);

closeModal.addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    modal.classList.add("hidden");
    closeAdminPanel();
  }
});

globalSearch?.addEventListener("input", refreshFeedViews);
modeFilter?.addEventListener("change", refreshFeedViews);
activeOnly?.addEventListener("change", refreshFeedViews);

(async function init() {
  ensureSeedData();

  try {
    appState.hackathons = await loadWithCache(
      "hackfind_hackathons",
      async () => readHackathons(),
      (fresh) => {
        appState.hackathons = fresh;
        refreshFeedViews();
      }
    );

    appState.cpContests = await loadWithCache("hackfind_cp", fetchCPContests, (fresh) => {
      appState.cpContests = fresh;
      refreshFeedViews();
    });

    refreshFeedViews();
    renderAdminModalState();
  } catch (error) {
    console.error("Initialization failed:", error);
    setCacheStatus("Offline mode");
    setLastSync(Date.now());
    appState.hackathons = readHackathons();
    appState.cpContests = await fetchCPContests();
    refreshFeedViews();
    renderAdminModalState();
  }
})();
