const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

const cacheStatus = document.getElementById("cacheStatus");
const lastSync = document.getElementById("lastSync");
const tabs = [...document.querySelectorAll(".tab")];
const panels = [...document.querySelectorAll(".tab-panel")];
const cpAdminPanel = document.getElementById("cpAdminPanel");
const posterAdminPanel = document.getElementById("posterAdminPanel");
const adminToggle = document.getElementById("adminToggle");
const parserInput = document.getElementById("parserInput");
const parserPreview = document.getElementById("parserPreview");
const publishContestBtn = document.getElementById("publishContestBtn");
const posterUploader = document.getElementById("posterUploader");
const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeModal = document.getElementById("closeModal");
const globalSearch = document.getElementById("globalSearch");
const modeFilter = document.getElementById("modeFilter");
const activeOnly = document.getElementById("activeOnly");
const hackathonCount = document.getElementById("hackathonCount");
const cpCount = document.getElementById("cpCount");
const clubCount = document.getElementById("clubCount");

const DB_KEYS = {
  admin: "hackfind_admin",
  adminPassHash: "hackfind_admin_pass_hash",
  localContests: "hackfind_local_contests",
  posters: "hackfind_posters"
};
const DEFAULT_MODE = "Online";

const appState = {
  hackathons: [],
  cpContests: []
};
const backgroundRefreshInFlight = new Set();

const staticHackathons = [
  { title: "Global AI Sprint", organizer: "Open Tech League", location: "Worldwide", prize: "$25,000", mode: "Online", startDate: "2026-05-12", endDate: "2026-05-14", region: "international" },
  { title: "Web3 Builders Cup", organizer: "ChainHub", location: "Worldwide", prize: "$30,000", mode: "Hybrid", startDate: "2026-05-19", endDate: "2026-05-21", region: "international" },
  { title: "HealthTech Makers", organizer: "MediFuture", location: "Worldwide", prize: "$20,000", mode: "Online", startDate: "2026-05-26", endDate: "2026-05-28", region: "international" },
  { title: "CloudX Hack Open", organizer: "SkyLabs", location: "Worldwide", prize: "$18,000", mode: "Online", startDate: "2026-06-02", endDate: "2026-06-04", region: "international" },
  { title: "Cyber Defense Jam", organizer: "SecureLabs", location: "Worldwide", prize: "$22,000", mode: "Hybrid", startDate: "2026-06-07", endDate: "2026-06-08", region: "international" },
  { title: "GreenCompute Hack", organizer: "EcoStack", location: "Worldwide", prize: "$15,000", mode: "Online", startDate: "2026-06-10", endDate: "2026-06-12", region: "international" },
  { title: "FinTech Future Build", organizer: "PayGrid Labs", location: "Worldwide", prize: "$28,000", mode: "Hybrid", startDate: "2026-06-14", endDate: "2026-06-16", region: "international" },
  { title: "Quantum Dev Challenge", organizer: "QubitWorks", location: "Worldwide", prize: "$35,000", mode: "Online", startDate: "2026-06-20", endDate: "2026-06-22", region: "international" },
  { title: "India Innovate Hack", organizer: "Tech India Forum", location: "India", prize: "₹8,00,000", mode: "Hybrid", startDate: "2026-05-13", endDate: "2026-05-15", region: "national" },
  { title: "Code Bharat Buildathon", organizer: "Dev Bharat", location: "India", prize: "₹5,00,000", mode: "Online", startDate: "2026-05-20", endDate: "2026-05-21", region: "national" },
  { title: "Smart India Hack Push", organizer: "Campus Network", location: "India", prize: "₹12,00,000", mode: "Offline", startDate: "2026-05-29", endDate: "2026-05-31", region: "national" },
  { title: "MahaTech Pune Challenge", organizer: "Pune Dev Circle", location: "Pune", prize: "₹2,00,000", mode: "Offline", startDate: "2026-05-11", endDate: "2026-05-12", region: "maharashtra" },
  { title: "Mumbai Build Sprint", organizer: "Mumbai Innovators", location: "Mumbai", prize: "₹3,50,000", mode: "Hybrid", startDate: "2026-05-17", endDate: "2026-05-18", region: "maharashtra" },
  { title: "Nashik Future Tech", organizer: "Nashik Tech Hub", location: "Nashik", prize: "₹1,50,000", mode: "Offline", startDate: "2026-05-24", endDate: "2026-05-25", region: "maharashtra" }
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
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
  const normalized = new Date(`${candidate.slice(0, 10)}T00:00:00`);
  return normalized;
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
  return item.endDate || item.end_time || item.startDate || item.start_time || "";
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

function isUpcomingOrLive(item) {
  const endDate = toDate(getItemEnd(item));
  if (Number.isNaN(endDate.getTime())) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  return endDate >= today;
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
    item.prize
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
    if (mode !== "all" && String(item.mode || DEFAULT_MODE).toLowerCase() !== mode) return false;
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
  const filtered = applyCommonFilters(all);
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

function parseContestText(text) {
  const required = ["Platform", "Name", "Timing", "Duration", "Link"];
  const obj = {};

  for (const line of text.split("\n")) {
    const [rawFieldName, ...rest] = line.split(":");
    if (!rawFieldName || rest.length === 0) continue;
    obj[rawFieldName.trim()] = rest.join(":").trim();
  }

  if (!required.every((key) => obj[key])) return null;

  function durationToMs(duration) {
    if (!duration) return 0;
    const text = String(duration).toLowerCase();
    const parts = [...text.matchAll(/(\d+)\s*(day|days|d|hour|hours|hr|hrs|h|minute|minutes|min|mins|m)\b/g)];
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
  };
}

function renderClubContests() {
  const entries = load(DB_KEYS.localContests, []);
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
        const i = Number(btn.dataset.delContest);
        const next = load(DB_KEYS.localContests, []);
        next.splice(i, 1);
        save(DB_KEYS.localContests, next);
        renderClubContests();
        updateStats();
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

async function hashText(text) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto API is required for admin authentication.");
  }
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function ensureAdminPasscode() {
  if (load(DB_KEYS.adminPassHash, "")) return true;

  const first = prompt("Set a new admin passcode");
  if (!first) return false;
  const second = prompt("Confirm admin passcode");

  if (first !== second) {
    alert("Passcodes do not match");
    return false;
  }

  try {
    const hash = await hashText(first);
    save(DB_KEYS.adminPassHash, hash);
    alert("Admin passcode configured");
    return true;
  } catch {
    alert("This browser does not support secure admin authentication.");
    return false;
  }
}

function applyAdminState() {
  const enabled = isAdmin();
  cpAdminPanel.classList.toggle("hidden", !enabled);
  posterAdminPanel.classList.toggle("hidden", !enabled);
  adminToggle.textContent = enabled ? "Admin Logout" : "Admin Login";
  renderClubContests();
  renderPosters();
}

function updateStats() {
  const filteredHackathons = applyCommonFilters(appState.hackathons);
  const filteredCp = applyCommonFilters(appState.cpContests);
  const filteredClub = applyCommonFilters(load(DB_KEYS.localContests, []));

  if (hackathonCount) hackathonCount.textContent = String(filteredHackathons.length);
  if (cpCount) cpCount.textContent = String(filteredCp.length);
  if (clubCount) clubCount.textContent = String(filteredClub.length);
}

function refreshFeedViews() {
  renderHackathons(appState.hackathons);
  renderCPFeed(appState.cpContests);
  renderClubContests();
  updateStats();
}

adminToggle.addEventListener("click", async () => {
  if (isAdmin()) {
    save(DB_KEYS.admin, false);
    applyAdminState();
    return;
  }

  const configured = await ensureAdminPasscode();
  if (!configured) return;

  const code = prompt("Enter admin passcode");
  if (!code) return;

  try {
    const entered = await hashText(code);
    const expected = load(DB_KEYS.adminPassHash, "");
    if (entered === expected) {
      save(DB_KEYS.admin, true);
      applyAdminState();
    } else {
      alert("Incorrect passcode");
    }
  } catch {
    alert("This browser does not support secure admin authentication.");
  }
});

if (parserInput) {
  parserInput.addEventListener("input", () => {
    const parsed = parseContestText(parserInput.value);
    parserPreview.innerHTML = parsed ? cardTemplate(parsed) : `<p class="meta">Preview unavailable. Keep strict format.</p>`;
  });
}

publishContestBtn.addEventListener("click", () => {
  const parsed = parseContestText(parserInput.value);
  if (!parsed) {
    alert("Invalid format. Required: Platform, Name, Timing, Duration, Link");
    return;
  }

  const contests = load(DB_KEYS.localContests, []);
  contests.unshift(parsed);
  save(DB_KEYS.localContests, contests);
  parserInput.value = "";
  parserPreview.innerHTML = "";
  renderClubContests();
  updateStats();
});

async function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

posterUploader.addEventListener("change", async (e) => {
  const files = [...(e.target.files || [])];
  if (!files.length) return;

  const posters = load(DB_KEYS.posters, []);
  for (const file of files) {
    const src = await fileToDataUrl(file);
    posters.unshift({ src, name: file.name, ts: Date.now() });
  }

  save(DB_KEYS.posters, posters);
  posterUploader.value = "";
  renderPosters();
});

function renderPosters() {
  const posters = load(DB_KEYS.posters, []);
  const root = document.getElementById("posterGrid");

  if (!posters.length) {
    root.innerHTML = emptyState("No posters yet.");
    return;
  }

  root.innerHTML = posters
    .map(
      (poster, idx) => `<div class="poster glass">
          <img src="${poster.src}" alt="${escapeHtml(poster.name || "Poster")}" data-img="${poster.src}" />
          ${isAdmin() ? `<button class="btn-subtle" data-del-poster="${idx}">Delete</button>` : ""}
        </div>`
    )
    .join("");

  root.querySelectorAll("img[data-img]").forEach((img) => {
    img.addEventListener("click", () => {
      modalImage.src = img.dataset.img;
      modal.classList.remove("hidden");
    });
  });

  root.querySelectorAll("button[data-del-poster]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.delPoster);
      const next = load(DB_KEYS.posters, []);
      next.splice(idx, 1);
      save(DB_KEYS.posters, next);
      renderPosters();
    });
  });
}

closeModal.addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") modal.classList.add("hidden");
});

globalSearch?.addEventListener("input", refreshFeedViews);
modeFilter?.addEventListener("change", refreshFeedViews);
activeOnly?.addEventListener("change", refreshFeedViews);

(async function init() {
  try {
    appState.hackathons = await loadWithCache(
      "hackfind_hackathons",
      async () => staticHackathons,
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
    renderPosters();
    applyAdminState();
  } catch (error) {
    console.error("Initialization failed:", error);
    setCacheStatus("Offline mode");
    setLastSync(Date.now());
    appState.hackathons = staticHackathons;
    appState.cpContests = await fetchCPContests();
    refreshFeedViews();
    applyAdminState();
  }
})();
