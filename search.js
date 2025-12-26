const PAGES = [
  { title: "Concept", url: "index.html" },
  { title: "Patterns", url: "patterns.html" },
  { title: "Featured Scenario", url: "scenario.html" },
  { title: "Checklist", url: "checklist.html" },
  { title: "For Teams", url: "for-teams.html" },
  { title: "About", url: "about.html" },
  { title: "Scenarios", url: "scenarios/index.html" },
  { title: "Retry Storm → Outage", url: "scenarios/retry-storm.html" },
  { title: "Alert Fatigue → Too late", url: "scenarios/alert-fatigue.html" },
  { title: "Coupling Cascade", url: "scenarios/coupling-cascade.html" },
];

const q = document.getElementById("q");
const results = document.getElementById("results");

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
}

async function loadPageText(url) {
  const res = await fetch(url);
  if (!res.ok) return "";
  const html = await res.text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.toLowerCase();
}

let cache = null;

async function buildCache() {
  if (cache) return cache;
  cache = await Promise.all(
    PAGES.map(async (p) => ({
      ...p,
      text: await loadPageText(p.url),
    }))
  );
  return cache;
}

function render(items, query) {
  if (!query) {
    results.innerHTML = `<p class="muted">Type to search.</p>`;
    return;
  }
  if (!items.length) {
    results.innerHTML = `<p class="muted">No matches.</p>`;
    return;
  }
  results.innerHTML = items
    .map((p) => {
      const snippetIdx = p.text.indexOf(query);
      const snippet = snippetIdx >= 0 ? p.text.slice(Math.max(0, snippetIdx - 60), snippetIdx + 120) : "";
      return `
        <div class="card" style="margin-top:12px">
          <h3 style="margin:0 0 6px"><a href="${p.url}">${escapeHtml(p.title)}</a></h3>
          <p class="muted" style="margin:0">${escapeHtml(snippet)}${snippet ? "…" : ""}</p>
        </div>
      `;
    })
    .join("");
}

async function doSearch() {
  const query = q.value.trim().toLowerCase();
  const data = await buildCache();
  const items = data
    .filter((p) => p.text.includes(query) || p.title.toLowerCase().includes(query))
    .slice(0, 12);
  render(items, query);
}

q.addEventListener("input", () => {
  doSearch().catch(() => render([], q.value.trim().toLowerCase()));
});

render([], "");
