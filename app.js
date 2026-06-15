const base =
  "https://surfdrive.surf.nl/s/YS6PcXjL9Rs2c3J/download?files=";

let DATA = [];
let VIEW = [];

/* SAFE DOM */
const el = (id) => document.getElementById(id);

let search, modelFilter, datasetFilter, impairmentFilter;
let table, gridView, tableView;
let previewImg, meta, loader;

/* INIT (100% SAFE) */
window.addEventListener("DOMContentLoaded", () => {

  search = el("search");
  modelFilter = el("modelFilter");
  datasetFilter = el("datasetFilter");
  impairmentFilter = el("impairmentFilter");

  table = el("table");
  gridView = el("gridView");
  tableView = el("tableView");

  previewImg = el("previewImg");
  meta = el("meta");
  loader = el("loader");

  const btn = el("searchBtn");

  if (!btn) {
    console.error("Search button missing");
    return;
  }

  btn.addEventListener("click", applyFilters);

  loadCSV();
});

/* LOAD CSV */
async function loadCSV(){

  try {
    const res = await fetch("hashed_metadata_df.csv");
    const text = await res.text();

    const lines = text.trim().split("\n");
    const headers = lines[0].split(",");

    DATA = lines.slice(1).map(line => {
      const cols = line.split(",");
      let obj = {};
      headers.forEach((h,i)=>{
        obj[h.trim()] = (cols[i] || "").trim();
      });
      return obj;
    });

    buildFilters();

  } catch (err) {
    console.error("CSV load error:", err);
  }
}

/* BUILD DROPDOWNS */
function buildFilters(){

  fill(modelFilter, [...new Set(DATA.map(d=>d.model))]);
  fill(datasetFilter, [...new Set(DATA.map(d=>d.dataset_type))]);
  fill(impairmentFilter, [...new Set(DATA.map(d=>d.impairment).filter(Boolean))]);
}

function fill(select, values){

  if(!select) return;

  select.innerHTML = `<option value="">All</option>`;

  values.forEach(v=>{
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
}

/* SEARCH BUTTON ONLY */
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

/* GRID VIEW */
function renderGrid(){

  if(!gridView) return;

  gridView.innerHTML = "";

  VIEW.forEach(item => {

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <b>${item.model || ""}</b><br/>
      <small>${item.dataset_type || ""}</small>
    `;

    card.onclick = () => show(item);

    gridView.appendChild(card);
  });
}

/* TABLE VIEW */
function renderTable(){

  if(!table) return;

  table.innerHTML = "";

  VIEW.forEach(item => {

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

/* IMAGE PREVIEW (LAZY SAFE) */
function show(item){

  if(loader) loader.classList.remove("hidden");

  const url = base + encodeURIComponent(item.file_name || "");

  previewImg.onload = () => {
    loader?.classList.add("hidden");
  };

  previewImg.onerror = () => {
    loader?.classList.add("hidden");
    console.warn("Image failed:", url);
  };

  previewImg.src = url;

  if(meta){
    meta.innerHTML = `
      <b>Model:</b> ${item.model}<br>
      <b>Prompt:</b> ${item.prompt}<br>
      <b>Dataset:</b> ${item.dataset_type}<br>
      <b>Impairment:</b> ${item.impairment || "None"}
    `;
  }
}

/* VIEW SWITCH */
function setView(type){

  if(!gridView || !tableView) return;

  if(type === "grid"){
    gridView.style.display = "grid";
    tableView.style.display = "none";
  } else {
    gridView.style.display = "none";
    tableView.style.display = "block";
  }
}