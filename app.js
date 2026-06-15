const base =
  "https://surfdrive.surf.nl/s/YS6PcXjL9Rs2c3J/download?files=";

let DATA = [];
let VIEW = [];

// DOM
const grid = document.getElementById("grid");
const preview = document.getElementById("preview");
const meta = document.getElementById("meta");

const search = document.getElementById("search");
const modelFilter = document.getElementById("modelFilter");
const datasetFilter = document.getElementById("datasetFilter");
const impairmentFilter = document.getElementById("impairmentFilter");

// -------------------- CSV --------------------
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

// -------------------- LOAD --------------------
async function load(){

  const res = await fetch("hashed_metadata_df.csv");
  const text = await res.text();

  DATA = parseCSV(text);

  buildFilters();
  apply();
}

// -------------------- FILTERS --------------------
function buildFilters(){

  fill(modelFilter, [...new Set(DATA.map(d=>d.model))]);
  fill(datasetFilter, [...new Set(DATA.map(d=>d.dataset_type))]);
  fill(impairmentFilter,
    [...new Set(DATA.map(d=>d.impairment).filter(Boolean))]
  );
}

function fill(sel, arr){

  sel.innerHTML = `<option value="">All</option>`;

  arr.forEach(v=>{
    const o = document.createElement("option");
    o.value = v;
    o.textContent = v;
    sel.appendChild(o);
  });
}

// -------------------- FILTER LOGIC --------------------
function apply(){

  const s = search.value?.toLowerCase() || "";
  const m = modelFilter.value;
  const d = datasetFilter.value;
  const i = impairmentFilter.value;

  VIEW = DATA.filter(x =>
    (!s || (x.prompt||"").toLowerCase().includes(s)) &&
    (!m || x.model===m) &&
    (!d || x.dataset_type===d) &&
    (!i || x.impairment===i)
  );

  renderGrid();
}

// -------------------- GRID --------------------
function renderGrid(){

  grid.innerHTML = "";

  VIEW.forEach(item => {

    const file =
      (item.hash_name ? item.hash_name + ".png"
                      : item.file_name.split("/").pop());

    const url = base + file;

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <img src="${url}" loading="lazy"/>
      <div class="cardText">
        <b>${item.model}</b><br>
        <span>${item.dataset_type}</span>
      </div>
    `;

    div.onclick = () => show(item);

    grid.appendChild(div);
  });
}

// -------------------- DETAILS PANEL --------------------
function show(item){

  const file =
    item.hash_name
      ? item.hash_name + ".png"
      : item.file_name.split("/").pop();

  const url = base + file;

  preview.src = url;

  meta.innerHTML = `
    <h3>Details</h3>

    <p><b>Model:</b> ${item.model}</p>
    <p><b>Prompt:</b> ${item.prompt}</p>
    <p><b>Dataset:</b> ${item.dataset_type}</p>
    <p><b>Impairment:</b> ${item.impairment || "None"}</p>
    <p><b>File:</b> ${file}</p>
  `;
}

// -------------------- EVENTS --------------------
search.addEventListener("input", apply);
modelFilter.addEventListener("change", apply);
datasetFilter.addEventListener("change", apply);
impairmentFilter.addEventListener("change", apply);

// START
load();