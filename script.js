const ADMIN_PASSCODE = "hackfind-admin";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

const cacheStatus = document.getElementById("cacheStatus");
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

const DB_KEYS = {
  admin: "hackfind_admin",
  localContests: "hackfind_local_contests",
  posters: "hackfind_posters"
};

const staticHackathons = [
  { title: "Global AI Sprint", organizer: "Open Tech League", location: "Worldwide", prize: "$25,000", mode: "Online", startDate: "2026-05-12", endDate: "2026-05-14", region: "international" },
  { title: "Web3 Builders Cup", organizer: "ChainHub", location: "Worldwide", prize: "$30,000", mode: "Hybrid", startDate: "2026-05-19", endDate: "2026-05-21", region: "international" },
  { title: "HealthTech Makers", organizer: "MediFuture", location: "Worldwide", prize: "$20,000", mode: "Online", startDate: "2026-05-26", endDate: "2026-05-28", region: "international" },
  { title: "CloudX Hack Open", organizer: "SkyLabs", location: "Worldwide", prize: "$18,000", mode: "Online", startDate: "2026-06-02", endDate: "2026-06-04", region: "international" },
  { title: "Cyber Defense Jam", organizer: "SecureLabs", location: "Worldwide", prize: "$22,000", mode: "Hybrid", startDate: "2026-06-07", endDate: "2026-06-08", region: "international" },
  { title: "India Innovate Hack", organizer: "Tech India Forum", location: "India", prize: "₹8,00,000", mode: "Hybrid", startDate: "2026-05-13", endDate: "2026-05-15", region: "national" },
  { title: "Code Bharat Buildathon", organizer: "Dev Bharat", location: "India", prize: "₹5,00,000", mode: "Online", startDate: "2026-05-20", endDate: "2026-05-21", region: "national" },
  { title: "Smart India Hack Push", organizer: "Campus Network", location: "India", prize: "₹12,00,000", mode: "Offline", startDate: "2026-05-29", endDate: "2026-05-31", region: "national" },
  { title: "MahaTech Pune Challenge", organizer: "Pune Dev Circle", location: "Pune", prize: "₹2,00,000", mode: "Offline", startDate: "2026-05-11", endDate: "2026-05-12", region: "maharashtra" },
  { title: "Mumbai Build Sprint", organizer: "Mumbai Innovators", location: "Mumbai", prize: "₹3,50,000", mode: "Hybrid", startDate: "2026-05-17", endDate: "2026-05-18", region: "maharashtra" },
  { title: "Nashik Future Tech", organizer: "Nashik Tech Hub", location: "Nashik", prize: "₹1,50,000", mode: "Offline", startDate: "2026-05-24", endDate: "2026-05-25", region: "maharashtra" }
];

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    panels.forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

function toDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`);
}

function countdownLabel(endDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = toDate(endDate);
  const days = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  if (days < 0) return "Ended";
  if (days === 0) return "Live Today";
  return `${days} day${days > 1 ? "s" : ""} left`;
}

function cardTemplate(item) {
  return `<article class="card glass">
    <h3>${item.title || item.name}</h3>
    <p class="meta">Organizer/Platform: ${item.organizer || item.site || item.platform || "-"}</p>
    <p class="meta">Location: ${item.location || "Global"}</p>
    <p class="meta">Prize: ${item.prize || "N/A"}</p>
    <p class="meta">Mode: ${item.mode || "Online"}</p>
    <p class="meta">Start: ${item.startDate || item.start_time || "-"}</p>
    <p class="meta">End: ${item.endDate || item.end_time || "-"}</p>
    <span class="countdown">${countdownLabel(item.endDate || item.end_time?.slice(0,10) || new Date().toISOString().slice(0,10))}</span>
    ${item.url || item.link ? `<p><a href="${item.url || item.link}" target="_blank" rel="noopener">Open Link</a></p>` : ""}
  </article>`;
}

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

async function loadWithCache(key, fetcher) {
  const now = Date.now();
  const cached = load(key);
  if (cached?.data && now - cached.timestamp < CACHE_TTL_MS) {
    cacheStatus.textContent = "Cached • Fast mode";
    fetcher().then((fresh) => save(key, { timestamp: Date.now(), data: fresh })).catch(() => null);
    return cached.data;
  }
  const fresh = await fetcher();
  save(key, { timestamp: now, data: fresh });
  cacheStatus.textContent = "Live sync complete";
  return fresh;
}

function renderHackathons(all) {
  const intl = all.filter((h) => h.region === "international").slice(0, 8);
  const national = all.filter((h) => h.region === "national");
  const maha = all.filter((h) => h.region === "maharashtra");
  document.getElementById("internationalGrid").innerHTML = intl.map(cardTemplate).join("");
  document.getElementById("nationalGrid").innerHTML = national.map(cardTemplate).join("");
  document.getElementById("maharashtraGrid").innerHTML = maha.map(cardTemplate).join("");
}

function parseContestText(text) {
  const required = ["Platform", "Name", "Timing", "Duration", "Link"];
  const obj = {};
  for (const line of text.split("\n")) {
    const [k, ...rest] = line.split(":");
    if (!k || rest.length === 0) continue;
    obj[k.trim()] = rest.join(":").trim();
  }
  if (!required.every((k) => obj[k])) return null;
  return {
    platform: obj.Platform,
    name: obj.Name,
    start_time: obj.Timing,
    end_time: obj.Timing,
    duration: obj.Duration,
    link: obj.Link,
    location: "Global",
    prize: "N/A",
    mode: "Online"
  };
}

function renderClubContests() {
  const entries = load(DB_KEYS.localContests, []);
  const root = document.getElementById("clubContestFeed");
  if (!entries.length) {
    root.innerHTML = `<p class="meta">No club contests published yet.</p>`;
    return;
  }
  root.innerHTML = entries
    .map((entry, idx) => `${cardTemplate(entry)}${isAdmin() ? `<button data-del-contest="${idx}">Delete</button>` : ""}`)
    .join("");

  if (isAdmin()) {
    root.querySelectorAll("button[data-del-contest]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.delContest);
        const next = load(DB_KEYS.localContests, []);
        next.splice(i, 1);
        save(DB_KEYS.localContests, next);
        renderClubContests();
      });
    });
  }
}

async function fetchCPContests() {
  try {
    const res = await fetch("https://kontests.net/api/v1/all");
    if (!res.ok) throw new Error("Fetch failed");
    const data = await res.json();
    return data.slice(0, 10).map((d) => ({ ...d, title: d.name, organizer: d.site, mode: "Online" }));
  } catch {
    return [
      { title: "Fallback CP Contest", site: "Codeforces", start_time: "2026-05-10", end_time: "2026-05-10", url: "https://codeforces.com", location: "Global", mode: "Online", prize: "N/A" }
    ];
  }
}

function renderCPFeed(contests) {
  document.getElementById("cpFeed").innerHTML = contests.map(cardTemplate).join("");
}

function isAdmin() {
  return load(DB_KEYS.admin, false) === true;
}

function applyAdminState() {
  const enabled = isAdmin();
  cpAdminPanel.classList.toggle("hidden", !enabled);
  posterAdminPanel.classList.toggle("hidden", !enabled);
  adminToggle.textContent = enabled ? "Admin Logout" : "Admin Login";
  renderClubContests();
  renderPosters();
}

adminToggle.addEventListener("click", () => {
  if (isAdmin()) {
    save(DB_KEYS.admin, false);
    applyAdminState();
    return;
  }
  const code = prompt("Enter admin passcode");
  if (code === ADMIN_PASSCODE) {
    save(DB_KEYS.admin, true);
    applyAdminState();
  } else if (code) {
    alert("Incorrect passcode");
  }
});

parserInput.addEventListener("input", () => {
  const parsed = parseContestText(parserInput.value);
  parserPreview.innerHTML = parsed ? cardTemplate(parsed) : `<p class="meta">Preview unavailable. Keep strict format.</p>`;
});

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
    root.innerHTML = `<p class="meta">No posters yet.</p>`;
    return;
  }
  root.innerHTML = posters
    .map((p, idx) => `<div class="poster glass">
        <img src="${p.src}" alt="${p.name || "Poster"}" data-img="${p.src}" />
        ${isAdmin() ? `<button data-del-poster="${idx}">Delete</button>` : ""}
      </div>`)
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

(async function init() {
  const hackathons = await loadWithCache("hackfind_hackathons", async () => staticHackathons);
  renderHackathons(hackathons);

  const cp = await loadWithCache("hackfind_cp", fetchCPContests);
  renderCPFeed(cp);

  renderClubContests();
  renderPosters();
  applyAdminState();
})();
