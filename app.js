const base =
  "https://surfdrive.surf.nl/s/YS6PcXjL9Rs2c3J/download?files=";

let DATA = [];
let VIEW = [];

/* SAFE DOM ACCESS (prevents ALL crashes) */
const $ = (id) => document.getElementById(id);

/* elements */
let search, modelFilter, datasetFilter, impairmentFilter;
let gridView, table, tableView;
let previewImg, meta, loader;
let searchBtn;

/* INIT SAFELY */
window.addEventListener("DOMContentLoaded", () => {

  search = $("search");
  modelFilter = $("modelFilter");
  datasetFilter = $("datasetFilter");
  impairmentFilter = $("impairmentFilter");

  gridView = $("gridView");
  table = $("table");
  tableView = $("tableView");

  previewImg = $("previewImg");
  meta = $("meta");
  loader = $("loader");
  searchBtn = $("searchBtn");

  /* HARD SAFETY CHECKS */
  if(!gridView || !table || !previewImg){
    console.error("Missing DOM elements - check HTML IDs");
    return;
  }

  searchBtn?.addEventListener("click", applyFilters);

  loadCSV();

  setView("grid"); // default view
});

/* LOAD CSV */
async function loadCSV(){
  try {
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

  } catch(e){
    console.error("CSV error", e);
  }
}

/* FILTERS */
function buildFilters(){
  fill(modelFilter, uniq("model"));
  fill(datasetFilter, uniq("dataset_type"));
  fill(impairmentFilter, uniq("impairment").filter(Boolean));
}

function uniq(key){
  return [...new Set(DATA.map(d=>d[key]))];
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

/* SEARCH */
function applyFilters(){

  const s = (search?.value || "").toLowerCase();
  const m = modelFilter?.value;
  const d = datasetFilter?.value;
  const i = impairmentFilter?.value;

  VIEW = DATA.filter(x =>
    (!s || (x.prompt||"").toLowerCase().includes(s)) &&
    (!m || x.model === m) &&
    (!d || x.dataset_type === d) &&
    (!i || x.impairment === i)
  );

  renderGrid();
  renderTable();
}

/* GRID */
function renderGrid(){
  if(!gridView) return;

  gridView.innerHTML = "";

  VIEW.forEach(item=>{
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = `${item.model || ""}`;

    div.onclick = () => show(item);

    gridView.appendChild(div);
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

/* IMAGE PREVIEW (SAFE LAZY LOAD) */
function show(item){

  const url = base + encodeURIComponent(item.hash_name || "");

  if(loader) loader.classList.remove("hidden");

  previewImg.onload = () => {
    loader?.classList.add("hidden");
    previewImg.style.display = "block";
  };

  previewImg.onerror = () => {
    loader?.classList.add("hidden");
    console.warn("Broken image:", url);
  };

  previewImg.src = url;

  if(meta){
    meta.innerHTML = `
      <b>Model:</b> ${item.model || "-"}<br>
      <b>Prompt:</b> ${item.prompt || "-"}<br>
      <b>Dataset:</b> ${item.dataset_type || "-"}<br>
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