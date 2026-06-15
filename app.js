// =====================================================
// CONFIG
// =====================================================

const base =
  "https://surfdrive.surf.nl/s/YS6PcXjL9Rs2c3J/download?files=";

const PAGE_SIZE = 200;

// =====================================================
// STATE
// =====================================================

let DATA = [];
let VIEW = [];
let RENDER_INDEX = 0;

// =====================================================
// DOM
// =====================================================

const table = document.getElementById("table");
const preview = document.getElementById("preview");
const meta = document.getElementById("meta");

const search = document.getElementById("search");
const modelFilter = document.getElementById("modelFilter");
const datasetFilter = document.getElementById("datasetFilter");

const stats = document.getElementById("stats");

const modelDatalist = document.getElementById("models");
const datasetDatalist = document.getElementById("datasets");

// =====================================================
// LOAD CSV (GitHub Pages SAFE)
// =====================================================

async function loadCSV() {

  const res = await fetch("./hashed_metadata_df.csv");
  const text = await res.text();

  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");

  DATA = lines.slice(1).map(line => {
    const cols = line.split(",");
    let obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = (cols[i] || "").trim();
    });
    return obj;
  });

  VIEW = DATA;

  buildFilters();
  resetRender();
  renderNext();

  updateStats();

  if (DATA.length > 0) show(DATA[0]);
}

// =====================================================
// FILTER SYSTEM
// =====================================================

function applyFilters() {

  const s = search.value.toLowerCase();
  const m = modelFilter.value.toLowerCase();
  const d = datasetFilter.value.toLowerCase();

  VIEW = DATA.filter(x => {

    return (
      (x.prompt || "").toLowerCase().includes(s) &&
      (x.model || "").toLowerCase().includes(m) &&
      (x.dataset_type || "").toLowerCase().includes(d)
    );
  });

  resetRender();
  renderNext();
  updateStats();
}

// =====================================================
// RENDER (VIRTUAL SCROLL)
// =====================================================

function resetRender() {
  table.innerHTML = "";
  RENDER_INDEX = 0;
}

function renderNext() {

  const slice = VIEW.slice(RENDER_INDEX, RENDER_INDEX + PAGE_SIZE);

  slice.forEach(item => {

    const row = document.createElement("div");
    row.className = "row";

    row.innerHTML = `
      <div>${item.model}</div>
      <div>${item.prompt}</div>
      <div>${item.dataset_type}</div>
    `;

    row.addEventListener("click", () => show(item));

    table.appendChild(row);
  });

  RENDER_INDEX += PAGE_SIZE;
}

// Infinite scroll
document.querySelector(".table-wrap")
  .addEventListener("scroll", (e) => {

    const el = e.target;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      renderNext();
    }
  });

// =====================================================
// PREVIEW PANEL
// =====================================================

function show(item) {

  const imgUrl = base + item.hash_name + ".png";

  preview.src = imgUrl;

  meta.innerHTML = `
    <b>${item.model}</b><br>
    ${item.prompt}<br>
    ${item.dataset_type}<br><br>
    <small>seed: ${item.seed || "—"}</small>
  `;
}

// =====================================================
// FILTER DROPDOWNS
// =====================================================

function buildFilters() {

  const models = [...new Set(DATA.map(d => d.model))];
  const datasets = [...new Set(DATA.map(d => d.dataset_type))];

  modelDatalist.innerHTML =
    models.map(m => `<option value="${m}">`).join("");

  datasetDatalist.innerHTML =
    datasets.map(d => `<option value="${d}">`).join("");
}

// =====================================================
// STATS
// =====================================================

function updateStats() {

  stats.innerHTML = `
    Showing <b>${VIEW.length}</b> / ${DATA.length}
  `;
}

// =====================================================
// DEBOUNCE (IMPORTANT FOR PERFORMANCE)
// =====================================================

function debounce(fn, delay = 200) {

  let t;

  return (...args) => {

    clearTimeout(t);

    t = setTimeout(() => fn(...args), delay);
  };
}

// =====================================================
// EVENTS
// =====================================================

search.addEventListener("input", debounce(applyFilters));
modelFilter.addEventListener("input", debounce(applyFilters));
datasetFilter.addEventListener("input", debounce(applyFilters));

// =====================================================
// START
// =====================================================

loadCSV();