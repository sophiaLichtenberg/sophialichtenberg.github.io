const base =
  "https://surfdrive.surf.nl/s/YS6PcXjL9Rs2c3J/download?files=";

let DATA = [];
let VIEW = [];

/* SAFE DOM HELPER (prevents ALL null crashes) */
function el(id){
  const node = document.getElementById(id);
  if(!node){
    console.warn(`Missing DOM element: ${id}`);
  }
  return node;
}

/* DOM */
const table = el("table");
const grid = el("grid");
const previewImg = el("previewImg");
const meta = el("meta");

const search = el("search");
const modelFilter = el("modelFilter");
const datasetFilter = el("datasetFilter");
const impairmentFilter = el("impairmentFilter");

/* TAB SYSTEM */
window.switchTab = function(tab){
  const gridTab = el("gridTab");
  const datasetTab = el("datasetTab");

  if(!gridTab || !datasetTab) return;

  gridTab.classList.remove("active");
  datasetTab.classList.remove("active");

  if(tab === "grid") gridTab.classList.add("active");
  if(tab === "dataset") datasetTab.classList.add("active");
};

/* CSV LOAD */
async function loadCSV(){
  try{
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

  } catch(e){
    console.error("CSV load failed", e);
  }
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
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
}

/* FILTER LOGIC */
function applyFilters(){

  const s = (search?.value || "").toLowerCase();
  const m = modelFilter?.value;
  const d = datasetFilter?.value;
  const i = impairmentFilter?.value;

  VIEW = DATA.filter(x => (
    (!s || (x.prompt||"").toLowerCase().includes(s)) &&
    (!m || x.model===m) &&
    (!d || x.dataset_type===d) &&
    (!i || x.impairment===i)
  ));

  renderGrid();
  renderTable();
}

/* GRID VIEW (NO BROKEN TILES) */
function renderGrid(){
  if(!grid) return;

  grid.innerHTML = "";

  VIEW.forEach(item=>{
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");

    const url = base + encodeURIComponent(item.file_name || "");

    img.src = url;
    img.loading = "lazy";

    /* prevent broken tiles */
    img.onerror = () => {
      img.src = "placeholder.png";
    };

    card.appendChild(img);

    card.onclick = () => show(item);

    grid.appendChild(card);
  });
}

/* TABLE VIEW */
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

/* PREVIEW */
function show(item){
  if(!previewImg || !meta) return;

  const url = base + encodeURIComponent(item.file_name || "");

  previewImg.src = url;
  previewImg.onerror = () => {
    previewImg.src = "placeholder.png";
  };

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