const base =
  "https://surfdrive.surf.nl/s/YS6PcXjL9Rs2c3J/download?files=";

let DATA = [];
let VIEW = [];
let index = 0;
const PAGE = 200;

// DOM
const table = document.getElementById("table");
const preview = document.getElementById("preview");
const meta = document.getElementById("meta");

const search = document.getElementById("search");
const modelFilter = document.getElementById("modelFilter");
const datasetFilter = document.getElementById("datasetFilter");

const stats = document.getElementById("stats");

// =====================
// LOAD CSV
// =====================

async function loadCSV(){

  const res = await fetch("./hashed_metadata_df.csv");
  const text = await res.text();

  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");

  DATA = lines.slice(1).map(line=>{
    const cols = line.split(",");
    let obj = {};
    headers.forEach((h,i)=>{
      obj[h.trim()] = cols[i]?.trim() || "";
    });
    return obj;
  });

  VIEW = DATA;

  buildDropdowns();
  render();
  updateStats();

  if(DATA.length) show(DATA[0]);
}

// =====================
// DROPDOWNS
// =====================

function buildDropdowns(){

  const models =
    [...new Set(DATA.map(d=>d.model))].sort();

  const datasets =
    [...new Set(DATA.map(d=>d.dataset_type))].sort();

  modelFilter.innerHTML =
    `<option value="">All models</option>` +
    models.map(m=>`<option>${m}</option>`).join("");

  datasetFilter.innerHTML =
    `<option value="">All datasets</option>` +
    datasets.map(d=>`<option>${d}</option>`).join("");
}

// =====================
// FILTERS
// =====================

function applyFilters(){

  const s = search.value.toLowerCase();
  const m = modelFilter.value;
  const d = datasetFilter.value;

  VIEW = DATA.filter(x=>{

    return (
      (x.prompt||"").toLowerCase().includes(s) &&
      (m === "" || x.model === m) &&
      (d === "" || x.dataset_type === d)
    );

  });

  index = 0;
  table.innerHTML = "";
  render();
  updateStats();
}

// =====================
// RENDER (VIRTUAL)
// =====================

function render(){

  const slice = VIEW.slice(index, index + PAGE);

  slice.forEach(item=>{

    const div = document.createElement("div");
    div.className = "row";

    div.innerHTML = `
      <div>${item.model}</div>
      <div>${item.prompt}</div>
      <div>${item.dataset_type}</div>
    `;

    div.onclick = ()=>show(item);

    table.appendChild(div);
  });

  index += PAGE;
}

// infinite scroll
document.querySelector(".table-wrap")
.addEventListener("scroll", e=>{

  if(e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 50){
    render();
  }
});

// =====================
// PREVIEW
// =====================

function show(item){

  preview.src =
    base + item.hash_name + ".png";

  meta.innerHTML = `
    <b>${item.model}</b><br>
    ${item.prompt}<br>
    ${item.dataset_type}<br>
    seed: ${item.seed || "—"}
  `;
}

// =====================
// STATS
// =====================

function updateStats(){
  stats.innerHTML =
    `Showing ${VIEW.length} / ${DATA.length}`;
}

// =====================
// EVENTS
// =====================

search.addEventListener("input", applyFilters);
modelFilter.addEventListener("change", applyFilters);
datasetFilter.addEventListener("change", applyFilters);

// =====================
// START
// =====================

loadCSV();