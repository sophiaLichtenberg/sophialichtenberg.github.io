const base =
  "https://surfdrive.surf.nl/s/YS6PcXjL9Rs2c3J/download?files=";

let DATA = [];
let VIEW = [];

const $ = (id) => document.getElementById(id);

let search, modelFilter, datasetFilter, impairmentFilter;
let gridView, table, tableView;
let previewImg, meta, loader;
let searchBtn;

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

  if (!gridView || !table || !previewImg) {
    console.error("Missing DOM elements");
    return;
  }

  searchBtn?.addEventListener("click", applyFilters);

  loadCSV();
  setView("grid");
});

/* CSV */
async function loadCSV(){
  try {
    const res = await fetch("hashed_metadata_df.csv");
    const text = await res.text();

    const lines = text.trim().split("\n");
    const headers = lines[0].split(",");

    DATA = lines.slice(1).map(line => {
      const cols = line.split(",");
      const obj = {};
      headers.forEach((h,i)=> obj[h.trim()] = (cols[i]||"").trim());
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

function uniq(k){
  return [...new Set(DATA.map(d=>d[k]))];
}

function fill(select, values){
  if(!select) return;
  select.innerHTML = `<option value="">All</option>`;
  values.forEach(v=>{
    const o=document.createElement("option");
    o.value=v;
    o.textContent=v;
    select.appendChild(o);
  });
}

/* SEARCH */
function applyFilters(){

  const s = (search?.value || "").toLowerCase();
  const m = modelFilter?.value;
  const d = datasetFilter?.value;
  const i = impairmentFilter?.value;

  VIEW = DATA.filter(x => {

    const prompt = (x.prompt || "").toLowerCase();

    return (
      (!s || prompt.includes(s)) &&
      (!m || x.model === m) &&
      (!d || x.dataset_type === d) &&
      (!i || x.impairment === i)
    );
  });

  renderGrid();
  renderTable();

  // optional: auto preview first result
  if (VIEW.length) show(VIEW[0]);
}

/* FIXED IMAGE URL */
function imgUrl(hash){
  if(!hash) return "";
  return base + encodeURIComponent(hash + ".png");
}

/* GRID */
function renderGrid(){

  if(!gridView) return;

  gridView.innerHTML = "";

  if(!VIEW.length){
    gridView.innerHTML = `<div style="padding:10px;">No results</div>`;
    return;
  }

  VIEW.forEach(item => {

    const hash = item.hash_name;
    if(!hash) return;

    const card = document.createElement("div");
    card.className = "card";

    // WRAPPER
    const thumb = document.createElement("div");
    thumb.className = "thumb";

    // LOADER (per image)
    const loader = document.createElement("div");
    loader.className = "img-loader";

    // IMAGE
    const img = document.createElement("img");
    img.src = imgUrl(hash);
    img.loading = "lazy";

    // start hidden until loaded
    img.style.opacity = "0";

    img.onload = () => {
      loader.remove();
      img.style.opacity = "1";
    };

    img.onerror = () => {
      loader.textContent = "❌";
    };

    thumb.appendChild(loader);
    thumb.appendChild(img);

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = item.model || "unknown";

    card.appendChild(thumb);
    card.appendChild(label);

    card.onclick = () => show(item);

    gridView.appendChild(card);
  });
}

/* TABLE */
function renderTable(){
  table.innerHTML = "";

  VIEW.forEach(item=>{
    const row=document.createElement("div");
    row.className="row";

    row.innerHTML=`
      <div>${item.model||""}</div>
      <div>${item.prompt||""}</div>
      <div>${item.dataset_type||""}</div>
    `;

    row.onclick=()=>show(item);
    table.appendChild(row);
  });
}

/* PREVIEW */
function show(item){

  const url = imgUrl(item.hash_name);

  loader?.classList.remove("hidden");

  previewImg.onload = () => loader?.classList.add("hidden");
  previewImg.onerror = () => loader?.classList.add("hidden");

  previewImg.src = url;

  if(meta){
    meta.innerHTML = `
      <b>Model:</b> ${item.model || "-"}<br>
      <b>Prompt:</b> ${item.prompt || "-"}<br>
      <b>Dataset:</b> ${item.dataset_type || "-"}<br>
      <b>Hash:</b> ${item.hash_name || "-"}
    `;
  }
}

/* VIEW SWITCH */
function setView(type){

  if(type==="grid"){
    gridView.style.display="grid";
    tableView.style.display="none";
  } else {
    gridView.style.display="none";
    tableView.style.display="block";
  }
}