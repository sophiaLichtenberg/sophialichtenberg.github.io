const base =
  "https://surfdrive.surf.nl/s/YS6PcXjL9Rs2c3J/download?files=";

let DATA = [];
let VIEW = [];

/* SAFE DOM */
function el(id){
  return document.getElementById(id);
}

const table = el("table");
const grid = el("grid");
const previewImg = el("previewImg");
const meta = el("meta");
const loader = el("loader");

const search = el("search");
const modelFilter = el("modelFilter");
const datasetFilter = el("datasetFilter");
const impairmentFilter = el("impairmentFilter");

/* TAB SWITCH */
window.switchTab = function(tab){
  const g = el("gridTab");
  const d = el("datasetTab");

  if(!g || !d) return;

  g.classList.toggle("active", tab === "grid");
  d.classList.toggle("active", tab === "dataset");
};

/* LOAD CSV */
async function loadCSV(){
  const res = await fetch("hashed_metadata_df.csv");
  const text = await res.text();

  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");

  DATA = lines.slice(1).map(line=>{
    const cols = line.split(",");
    let obj = {};
    headers.forEach((h,i)=>{
      obj[h.trim()] = (cols[i] || "").trim();
    });
    return obj;
  });

  buildFilters();
  applyFilters();
}

/* FILTERS */
function buildFilters(){
  fill(modelFilter, [...new Set(DATA.map(d=>d.model))]);
  fill(datasetFilter, [...new Set(DATA.map(d=>d.dataset_type))]);
  fill(impairmentFilter, [...new Set(DATA.map(d=>d.impairment).filter(Boolean))]);
}

function fill(select, values){
  if(!select) return;

  select.innerHTML = `<option value="">All</option>`;
  values.forEach(v=>{
    const o = document.createElement("option");
    o.value = v;
    o.textContent = v;
    select.appendChild(o);
  });
}

/* FILTER */
function applyFilters(){
  const s = (search?.value || "").toLowerCase();
  const m = modelFilter?.value;
  const d = datasetFilter?.value;
  const i = impairmentFilter?.value;

  VIEW = DATA.filter(x =>
    (!s || (x.prompt||"").toLowerCase().includes(s)) &&
    (!m || x.model===m) &&
    (!d || x.dataset_type===d) &&
    (!i || x.impairment===i)
  );

  renderGrid();
  renderTable();
}

/* GRID (NO IMAGES PRELOADED) */
function renderGrid(){
  if(!grid) return;

  grid.innerHTML = "";

  VIEW.forEach(item=>{
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="card-title">${item.model || ""}</div>
      <div class="card-sub">${item.dataset_type || ""}</div>
    `;

    card.onclick = () => show(item);

    grid.appendChild(card);
  });
}

/* TABLE */
function renderTable(){
  if(!table) return;

  table.innerHTML = "";

  VIEW.forEach(item=>{
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
}

/* IMAGE PREVIEW WITH LOADER */
function show(item){
  if(!previewImg || !loader || !meta) return;

  loader.style.display = "block";
  previewImg.style.opacity = "0";
  previewImg.src = "";

  const url = base + encodeURIComponent(item.file_name || "");

  previewImg.onload = () => {
    loader.style.display = "none";
    previewImg.style.opacity = "1";
  };

  previewImg.onerror = () => {
    loader.style.display = "none";
    previewImg.style.opacity = "1";
    previewImg.src =
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
          <rect width="100%" height="100%" fill="#111827"/>
          <text x="50%" y="50%" fill="#94a3b8"
            text-anchor="middle" font-size="14">
            Failed to load image
          </text>
        </svg>
      `);
  };

  previewImg.src = url;

  meta.innerHTML = `
    <b>Model:</b> ${item.model || ""}<br>
    <b>Prompt:</b> ${item.prompt || ""}<br>
    <b>Dataset:</b> ${item.dataset_type || ""}<br>
    <b>Impairment:</b> ${item.impairment || "None"}
  `;
}

/* EVENTS */
search?.addEventListener("input", applyFilters);
modelFilter?.addEventListener("change", applyFilters);
datasetFilter?.addEventListener("change", applyFilters);
impairmentFilter?.addEventListener("change", applyFilters);

/* INIT */
loadCSV();