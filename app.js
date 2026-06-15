const base =
  "https://surfdrive.surf.nl/s/YS6PcXjL9Rs2c3J/download?files=";

let DATA = [];
let VIEW = [];

const grid = document.getElementById("grid");
const preview = document.getElementById("preview");
const meta = document.getElementById("meta");

const search = document.getElementById("search");
const modelFilter = document.getElementById("modelFilter");
const datasetFilter = document.getElementById("datasetFilter");
const impairmentFilter = document.getElementById("impairmentFilter");

/* =========================
   SAFE IMAGE LOADER
========================= */

function createImage(url){

  const wrap = document.createElement("div");
  wrap.className = "tile";

  const img = new Image();
  img.loading = "lazy";

  const label = document.createElement("div");
  label.className = "label";

  label.textContent = "loading...";

  // fallback image (never blank tile)
  const fallback =
    "https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg";

  let loaded = false;

  img.onload = () => {
    loaded = true;
    label.textContent = "ok";
  };

  img.onerror = () => {
    if (!loaded) {
      img.src = fallback;
      label.textContent = "failed → fallback";
    }
  };

  img.src = url;

  wrap.appendChild(img);
  wrap.appendChild(label);

  return wrap;
}

/* =========================
   RENDER GRID
========================= */

function render(){

  grid.innerHTML = "";

  VIEW.forEach(item => {

    const url =
      base + encodeURIComponent(item.hash_name + ".png");

    const tile = createImage(url);

    tile.onclick = () => show(item);

    grid.appendChild(tile);
  });

  if (VIEW.length) show(VIEW[0]);
}

/* =========================
   PREVIEW
========================= */

function show(item){

  const url =
    base + encodeURIComponent(item.hash_name + ".png");

  preview.src = url;

  meta.innerHTML = `
    <b>Model:</b> ${item.model}<br>
    <b>Prompt:</b> ${item.prompt}<br>
    <b>Dataset:</b> ${item.dataset_type}<br>
    <b>Impairment:</b> ${item.impairment || "None"}
  `;
}

/* =========================
   FILTERS (simple safe version)
========================= */

function applyFilters(){

  const s = (search.value || "").toLowerCase();

  VIEW = DATA.filter(x =>
    !s || (x.prompt || "").toLowerCase().includes(s)
  );

  render();
}

/* =========================
   LOAD CSV (safe)
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

  applyFilters();
}

/* EVENTS */
search.addEventListener("input", applyFilters);

loadCSV();