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
let index = 0;

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

// =====================================================
// LOAD CSV (GitHub Pages safe)
// =====================================================

async function loadCSV(){

  const res = await fetch("./hashed_metadata_df.csv");
  const text = await res.text();

  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");

  DATA = lines.slice(1).map(line => {
    const cols = line.split(",");
    const obj = {};

    headers.forEach((h, i) => {
      obj[h.trim()] = (cols[i] || "").trim();
    });

    return obj;
  });

  VIEW = DATA;

  buildDropdowns();
  applyFilters();
  updateStats();

  if (DATA.length) show(DATA[0]);
}

// =====================================================
// DROPDOWNS
// =====================================================

function buildDropdowns(){

  const models = [...new Set(DATA.map(d => d.model))].sort();
  const datasets = [...new Set(DATA.map(d => d.dataset_type))].sort();

  // MODEL DROPDOWN
  modelFilter.innerHTML = `<option value="">All models</option>`;
  models.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    modelFilter.appendChild(opt);
  });

  // DATASET DROPDOWN
  datasetFilter.innerHTML = `<option value="">All datasets</option>`;
  datasets.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    datasetFilter.appendChild(opt);
  });
}

// =====================================================
// FILTERING
// =====================================================

function applyFilters(){

  const s = search.value.toLowerCase();
  const m = modelFilter.value;
  const d = datasetFilter.value;

  VIEW = DATA.filter(x => {

    return (
      (!s || (x.prompt || "").toLowerCase().includes(s)) &&
      (!m || x.model === m) &&
      (!d || x.dataset_type === d)
    );

  });

  resetRender();
  render();
  updateStats();
}

// =====================================================
// RENDER (VIRTUAL SCROLL)
// =====================================================

function render(){

  const slice = VIEW.slice(index, index + PAGE_SIZE);

  slice.forEach(item => {

    const row = document.createElement("div");
    row.className = "row";

    row.innerHTML = `
      <div>${item.model || ""}</div>
      <div>${item.prompt || ""}</div>
      <div>${item.dataset_type || ""}</div>
    `;

    row.onclick = () => show(item);

    table.appendChild(row);
  });

  index += PAGE_SIZE;
}

// reset table
function resetRender(){
  table.innerHTML = "";
  index = 0;
}

// infinite scroll
document.querySelector(".table-wrap")
.addEventListener("scroll", (e) => {

  const el = e.target;

  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
    render();
  }

});

// =====================================================
// PREVIEW PANEL
// =====================================================

function show(item){

  const imgUrl =
    base + item.hash_name + ".png";

  preview.src = imgUrl;

  meta.innerHTML = `
    <b>Model:</b> ${item.model || "-"}<br>
    <b>Prompt:</b> ${item.prompt || "-"}<br>
    <b>Dataset:</b> ${item.dataset_type || "-"}<br>
    <b>Seed:</b> ${item.seed || "-"}<br>
    <b>Hash:</b> ${item.hash_name || "-"}
  `;
}

// =====================================================
// STATS
// =====================================================

function updateStats(){
  stats.textContent =
    `Showing ${VIEW.length} / ${DATA.length}`;
}

// =====================================================
// EVENTS
// =====================================================

search.addEventListener("input", applyFilters);
modelFilter.addEventListener("change", applyFilters);
datasetFilter.addEventListener("change", applyFilters);

// =====================================================
// INIT
// =====================================================

loadCSV();