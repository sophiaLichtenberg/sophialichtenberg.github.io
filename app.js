const base =
  "https://surfdrive.surf.nl/s/YS6PcXjL9Rs2c3J/download?files=";

let DATA = [];
let VIEW = [];

/* SAFE DOM (prevents ALL null errors) */
const el = (id) => document.getElementById(id);

const table = el("table");
const search = el("search");
const modelFilter = el("modelFilter");
const datasetFilter = el("datasetFilter");
const impairmentFilter = el("impairmentFilter");

const previewImg = el("previewImg");
const meta = el("meta");
const loader = el("loader");

const searchBtn = el("searchBtn");

/* =========================
   INIT SAFETY WRAPPER
========================= */
document.addEventListener("DOMContentLoaded", () => {

  if (!search || !table || !previewImg) {
    console.error("Missing DOM elements — check HTML IDs");
    return;
  }

  searchBtn?.addEventListener("click", applyFilters);

  loadCSV();
});

/* =========================
   LOAD CSV
========================= */
async function loadCSV(){

  try {
    const res = await fetch("hashed_metadata_df.csv");
    const text = await res.text();

    const lines = text.trim().split("\n");
    const headers = lines[0].split(",");

    DATA = lines.slice(1).map(line => {
      const cols = line.split(",");
      const obj = {};
      headers.forEach((h,i)=>{
        obj[h.trim()] = (cols[i] || "").trim();
      });
      return obj;
    });

    buildFilters();

  } catch (e) {
    console.error("CSV load failed", e);
  }
}

/* =========================
   FILTERS
========================= */
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

/* =========================
   APPLY FILTERS (ONLY ON BUTTON)
========================= */
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

  renderTable();
}

/* =========================
   TABLE (GRID)
========================= */
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

/* =========================
   IMAGE VIEW (LAZY + LOADER)
========================= */
function show(item){

  if(!previewImg || !loader) return;

  loader.classList.remove("hidden");
  previewImg.style.opacity = "0";

  const url = base + encodeURIComponent(item.file_name || "");

  previewImg.onload = () => {
    loader.classList.add("hidden");
    previewImg.style.opacity = "1";
  };

  previewImg.onerror = () => {
    loader.classList.add("hidden");
    console.warn("Image failed:", url);
  };

  previewImg.src = url;

  if(meta){
    meta.innerHTML = `
      <b>Model:</b> ${item.model || ""}<br>
      <b>Prompt:</b> ${item.prompt || ""}<br>
      <b>Dataset:</b> ${item.dataset_type || ""}<br>
      <b>Impairment:</b> ${item.impairment || "None"}
    `;
  }
}

/* =========================
   TAB SYSTEM (FIXED)
========================= */
function switchTab(tab){

  document.querySelectorAll(".tab").forEach(t=>{
    t.classList.remove("active");
  });

  const elTab = document.getElementById(tab);
  if(elTab) elTab.classList.add("active");
}