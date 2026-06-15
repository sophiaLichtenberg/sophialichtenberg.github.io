const base =
  "https://surfdrive.surf.nl/s/YS6PcXjL9Rs2c3J/download?files=";

let DATA = [];
let VIEW = [];

/* DOM (ALL MATCH HTML ABOVE) */
const grid = document.getElementById("grid");
const preview = document.getElementById("preview");
const meta = document.getElementById("meta");

const search = document.getElementById("search");
const modelFilter = document.getElementById("modelFilter");
const datasetFilter = document.getElementById("datasetFilter");
const impairmentFilter = document.getElementById("impairmentFilter");

/* SAFETY CHECK (prevents silent crashes) */
if (!grid || !preview || !meta) {
  console.error("Missing DOM elements. Check HTML IDs.");
}

/* =========================
   LOAD CSV
========================= */
async function loadCSV(){

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
  applyFilters();
}

/* =========================
   FILTERS
========================= */
function buildFilters(){

  fill(modelFilter, unique("model"));
  fill(datasetFilter, unique("dataset_type"));
  fill(impairmentFilter, unique("impairment", true));
}

function unique(key, skipEmpty=false){
  const vals = [...new Set(DATA.map(d => d[key]))];
  return skipEmpty ? vals.filter(Boolean) : vals;
}

function fill(select, values){
  select.innerHTML = `<option value="">All</option>`;
  values.forEach(v=>{
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
}

/* =========================
   FILTER APPLY
========================= */
function applyFilters(){

  const s = search.value.toLowerCase();
  const m = modelFilter.value;
  const d = datasetFilter.value;
  const i = impairmentFilter.value;

  VIEW = DATA.filter(x =>
    (!s || (x.prompt||"").toLowerCase().includes(s)) &&
    (!m || x.model === m) &&
    (!d || x.dataset_type === d) &&
    (!i || x.impairment === i)
  );

  renderGrid();
}

/* =========================
   GRID RENDER
========================= */
function renderGrid(){

  if (!grid) return;

  grid.innerHTML = "";

  VIEW.forEach(item => {

    const tile = document.createElement("div");
    tile.className = "tile";

    const imgUrl = base + encodeURIComponent(item.hash_name + ".png");

    tile.innerHTML = `
      <img src="${imgUrl}" loading="lazy">
      <div class="info">
        ${item.model}<br>
        ${item.dataset_type}
      </div>
    `;

    tile.onclick = () => show(item);

    grid.appendChild(tile);
  });

  if (VIEW.length > 0) show(VIEW[0]);
}

/* =========================
   PREVIEW
========================= */
function show(item){

  if (!preview || !meta) return;

  const imgUrl = base + encodeURIComponent(item.hash_name + ".png");

  preview.src = imgUrl;

  meta.innerHTML = `
    <b>Model:</b> ${item.model}<br>
    <b>Prompt:</b> ${item.prompt}<br>
    <b>Dataset:</b> ${item.dataset_type}<br>
    <b>Impairment:</b> ${item.impairment || "None"}
  `;
}

/* =========================
   EVENTS
========================= */
search?.addEventListener("input", applyFilters);
modelFilter?.addEventListener("change", applyFilters);
datasetFilter?.addEventListener("change", applyFilters);
impairmentFilter?.addEventListener("change", applyFilters);

/* START */
loadCSV();