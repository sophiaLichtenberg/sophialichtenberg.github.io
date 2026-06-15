const base =
  "https://surfdrive.surf.nl/s/YS6PcXjL9Rs2c3J/download?files=";

let DATA = [];
let VIEW = [];

const $ = (id) => document.getElementById(id);

let search, modelFilter, datasetFilter, biasFilter, contextFilter, impairmentFilter;
let gridView, table, tableView;
let previewImg, meta, loader;
let searchBtn;

/* =========================
   INIT
========================= */
window.addEventListener("DOMContentLoaded", () => {

  search = $("search");
  modelFilter = $("modelFilter");
  datasetFilter = $("datasetFilter");
  biasFilter = $("biasFilter");
  contextFilter = $("contextFilter");
  impairmentFilter = $("impairmentFilter");

  gridView = $("gridView");
  table = $("table");
  tableView = $("tableView");

  previewImg = $("previewImg");
  meta = $("meta");
  loader = $("loader");
  searchBtn = $("searchBtn");

  if (!gridView || !table || !previewImg) {
    console.error("Missing DOM elements");
    return;
  }

  searchBtn?.addEventListener("click", applyFilters);

  loadCSV();
  setView("grid");
});

/* =========================
   CSV LOAD
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

  } catch(e){
    console.error("CSV error", e);
  }
}

/* =========================
   FILTERS
========================= */
function buildFilters(){
  fill(modelFilter, uniq("model"));
  fill(datasetFilter, uniq("dataset_type"));
  fill(biasFilter, uniq("bias_subtype"));
  fill(contextFilter, uniq("context_value"));
  fill(impairmentFilter, uniq("impairment").filter(Boolean));
}

function uniq(k){
  return [...new Set(DATA.map(d => d[k]))];
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

/* =========================
   SEARCH
========================= */
function applyFilters(){

  const s = (search?.value || "").toLowerCase();
  const m = modelFilter?.value;
  const d = datasetFilter?.value;
  const b = biasFilter?.value;
  const c = contextFilter?.value;
  const i = impairmentFilter?.value;

  VIEW = DATA.filter(x => {
    const prompt = (x.prompt || "").toLowerCase();

    return (
      (!s || prompt.includes(s)) &&
      (!m || x.model === m) &&
      (!d || x.dataset_type === d) &&
      (!b || x.bias_subtype === b) &&
      (!c || x.context_value === c) &&
      (!i || x.impairment === i)
    );
  });

  renderGrid();
  renderTable();

  if (VIEW.length) show(VIEW[0]);
}

/* =========================
   IMAGE URL
========================= */
function imgUrl(hash){
  if(!hash) return "";
  return base + encodeURIComponent(hash + ".png");
}

/* =========================
   GRID (FAST + LOADER + SAFE)
========================= */
function renderGrid() {

  if (!gridView) return;

  gridView.innerHTML = "";

  if (!VIEW.length) {
    gridView.innerHTML = `<div style="padding:10px;opacity:0.6;">No results</div>`;
    return;
  }

  const seen = new Set();

  VIEW.forEach(item => {

    const hash = item.hash_name;
    if (!hash) return;

    /* OPTIONAL: collapse duplicates */
    const key = hash.replace(/_\d+$/, "");
    if (seen.has(key)) return;
    seen.add(key);

    const card = document.createElement("div");
    card.className = "card";

    const thumb = document.createElement("div");
    thumb.className = "thumb";

    const loaderEl = document.createElement("div");
    loaderEl.className = "img-loader";
    loaderEl.textContent = "⏳";

    const img = new Image();
    const url = imgUrl(hash);

    img.style.opacity = "0";
    img.decoding = "async";
    img.loading = "lazy";

    let done = false;

    img.onload = () => {
      if (done) return;
      done = true;
      loaderEl.remove();
      img.style.opacity = "1";
    };

    img.onerror = () => {
      if (done) return;
      done = true;
      loaderEl.textContent = "❌";
      img.style.display = "none";
    };

    thumb.appendChild(loaderEl);
    thumb.appendChild(img);

    requestAnimationFrame(() => {
      img.src = url;
    });

    const label = document.createElement("div");
    label.className = "label";

    label.innerHTML = `
      <div>${item.model || "unknown"}</div>
      <div>${item.impairment || ""}</div>
      <div>${item.bias_subtype || ""}</div>
      <div>${item.context_value || ""}</div>
    `;

    card.appendChild(thumb);
    card.appendChild(label);

    card.onclick = () => show(item);

    gridView.appendChild(card);
  });
}

/* =========================
   TABLE (CLEAN FIX)
========================= */
function renderTable(){

  if (!table) return;

  table.innerHTML = "";

  VIEW.forEach(item => {

    const row = document.createElement("div");
    row.className = "row";

    row.innerHTML = `
      <div>${item.model || ""}</div>
      <div>${item.prompt || ""}</div>
      <div>${item.dataset_type || ""}</div>
      <div>${item.bias_subtype || ""}</div>
    `;

    row.onclick = () => show(item);

    table.appendChild(row);
  });
}

/* =========================
   PREVIEW (LOADER FIXED)
========================= */
function show(item){

  const url = imgUrl(item.hash_name);

  if (loader) loader.classList.remove("hidden");

  previewImg.onload = () => {
    loader?.classList.add("hidden");
  };

  previewImg.onerror = () => {
    loader?.classList.add("hidden");
  };

  previewImg.src = url;

  if (meta) {
    meta.innerHTML = `
      <b>Model:</b> ${item.model || "-"}<br>
      <b>Prompt:</b> ${item.prompt || "-"}<br>
      <b>Dataset:</b> ${item.dataset_type || "-"}<br>
      <b>Context:</b> ${item.context_value || "-"}<br>
      <b>Bias:</b> ${item.bias_subtype || "-"}<br>
      <b>Hash:</b> ${item.hash_name || "-"}
    `;
  }
}

/* =========================
   VIEW SWITCH
========================= */
function setView(type){

  if (!gridView || !tableView) return;

  if (type === "grid") {
    gridView.style.display = "grid";
    tableView.style.display = "none";
  } else {
    gridView.style.display = "none";
    tableView.style.display = "block";
  }
}