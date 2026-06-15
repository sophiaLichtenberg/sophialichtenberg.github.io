document.addEventListener("DOMContentLoaded", () => {

const base =
  "https://surfdrive.surf.nl/s/YS6PcXjL9Rs2c3J/download?files=";

let DATA = [];
let VIEW = [];
let index = 0;
const PAGE_SIZE = 200;

// DOM
const table = document.getElementById("table");
const preview = document.getElementById("preview");
const meta = document.getElementById("meta");

const search = document.getElementById("search");
const modelFilter = document.getElementById("modelFilter");
const datasetFilter = document.getElementById("datasetFilter");
const impairmentFilter = document.getElementById("impairmentFilter");

const stats = document.getElementById("stats");

// LOAD CSV
async function load(){

  const res = await fetch("./hashed_metadata_df.csv");
  const text = await res.text();

  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");

  DATA = lines.slice(1).map(line => {
    const cols = line.split(",");
    const obj = {};
    headers.forEach((h,i)=>{
      obj[h.trim()] = (cols[i]||"").trim();
    });
    return obj;
  });

  buildFilters();
  apply();
}

// FILTER OPTIONS
function buildFilters(){

  const models = [...new Set(DATA.map(d=>d.model))];
  const datasets = [...new Set(DATA.map(d=>d.dataset_type))];
  const impairments = [...new Set(DATA.map(d=>d.impairment || "None"))];

  fill(modelFilter, models);
  fill(datasetFilter, datasets);
  fill(impairmentFilter, impairments);
}

function fill(select, arr){
  select.innerHTML = `<option value="">All</option>`;
  arr.forEach(v=>{
    const o=document.createElement("option");
    o.value=v;
    o.textContent=v;
    select.appendChild(o);
  });
}

// FILTER LOGIC
function apply(){

  const s = search.value.toLowerCase();
  const m = modelFilter.value;
  const d = datasetFilter.value;
  const i = impairmentFilter.value;

  VIEW = DATA.filter(x => (
    (!s || (x.prompt||"").toLowerCase().includes(s)) &&
    (!m || x.model===m) &&
    (!d || x.dataset_type===d) &&
    (!i || (x.impairment||"None")===i)
  ));

  reset();
  render();
  stats.textContent = `${VIEW.length} / ${DATA.length}`;
}

// TABLE RENDER
function render(){

  const slice = VIEW.slice(index, index + PAGE_SIZE);

  slice.forEach(item=>{
    const div = document.createElement("div");
    div.className="row";

    div.innerHTML=`
      <div>${item.model}</div>
      <div>${item.prompt}</div>
      <div>${item.dataset_type}</div>
    `;

    div.onclick=()=>show(item);

    table.appendChild(div);
  });

  index += PAGE_SIZE;
}

function reset(){
  table.innerHTML="";
  index=0;
}

// SCROLL
document.querySelector(".table-wrap")
.addEventListener("scroll",(e)=>{

  const el=e.target;
  if(el.scrollTop+el.clientHeight>=el.scrollHeight-50){
    render();
  }

});

// SHOW GALLERY (FIXED)
function show(item){

  preview.innerHTML="";

  const url =
    base + encodeURIComponent(item.file_name);

  const img = document.createElement("img");
  img.src = url;
  img.loading = "lazy";

  preview.appendChild(img);

  meta.innerHTML = `
    <b>Model:</b> ${item.model}<br>
    <b>Prompt:</b> ${item.prompt}<br>
    <b>Dataset:</b> ${item.dataset_type}<br>
    <b>Impairment:</b> ${item.impairment || "None"}<br>
  `;
}

// EVENTS
search.addEventListener("input", apply);
modelFilter.addEventListener("change", apply);
datasetFilter.addEventListener("change", apply);
impairmentFilter.addEventListener("change", apply);

// START
load();

});