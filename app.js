const base =
  "https://surfdrive.surf.nl/s/YS6PcXjL9Rs2c3J/download?files=";

let DATA = [];
let VIEW = [];

// DOM
const table = document.getElementById("table");
const gallery = document.getElementById("gallery");
const meta = document.getElementById("meta");

const search = document.getElementById("search");
const modelFilter = document.getElementById("modelFilter");
const datasetFilter = document.getElementById("datasetFilter");
const impairmentFilter = document.getElementById("impairmentFilter");

// ------------------------
// CSV PARSER
// ------------------------
function parseCSV(text){

  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");

  return lines.slice(1).map(line => {

    const cols = line.split(",");

    const obj = {};

    headers.forEach((h,i)=>{
      obj[h.trim()] = (cols[i] || "").trim();
    });

    return obj;
  });
}

// ------------------------
// LOAD CSV
// ------------------------
async function loadCSV(){

  const res = await fetch("hashed_metadata_df.csv");
  const text = await res.text();

  DATA = parseCSV(text);

  buildFilters();
  applyFilters();
}

// ------------------------
// FILTERS
// ------------------------
function buildFilters(){

  fill(modelFilter,
    [...new Set(DATA.map(d => d.model))]
  );

  fill(datasetFilter,
    [...new Set(DATA.map(d => d.dataset_type))]
  );

  fill(impairmentFilter,
    [...new Set(DATA.map(d => d.impairment).filter(Boolean))]
  );
}

function fill(select, values){

  select.innerHTML = `<option value="">All</option>`;

  values.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
}

// ------------------------
// APPLY FILTERS
// ------------------------
function applyFilters(){

  const s = (search.value || "").toLowerCase();
  const m = modelFilter.value;
  const d = datasetFilter.value;
  const i = impairmentFilter.value;

  VIEW = DATA.filter(x => (
    (!s || (x.prompt || "").toLowerCase().includes(s)) &&
    (!m || x.model === m) &&
    (!d || x.dataset_type === d) &&
    (!i || x.impairment === i)
  ));

  renderTable();
}

// ------------------------
// TABLE
// ------------------------
function renderTable(){

  table.innerHTML = "";

  VIEW.forEach(item => {

    const row = document.createElement("div");
    row.className = "row";

    row.innerHTML = `
      <div><b>${item.model}</b></div>
      <div>${item.prompt}</div>
      <div>${item.dataset_type}</div>
    `;

    row.onclick = () => show(item);

    table.appendChild(row);
  });
}

// ------------------------
// IMAGE PREVIEW (FIXED)
// ------------------------
function show(item){

  const file =
    item.hash_name
      ? item.hash_name + ".png"
      : item.file_name.split("/").pop();

  const url = base + file;

  gallery.src = url;

  meta.innerHTML = `
    <p><b>Model:</b> ${item.model}</p>
    <p><b>Prompt:</b> ${item.prompt}</p>
    <p><b>Dataset:</b> ${item.dataset_type}</p>
    <p><b>Impairment:</b> ${item.impairment || "None"}</p>
  `;
}

// ------------------------
// EVENTS
// ------------------------
search.addEventListener("input", applyFilters);
modelFilter.addEventListener("change", applyFilters);
datasetFilter.addEventListener("change", applyFilters);
impairmentFilter.addEventListener("change", applyFilters);

// ------------------------
// START
// ------------------------
loadCSV();