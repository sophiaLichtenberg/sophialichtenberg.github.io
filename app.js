(() => {

/* =========================
   SAFE DOM BINDING LAYER
========================= */

function must(id) {
  const el = document.getElementById(id);
  if (!el) {
    console.error(`[FATAL] Missing DOM element: #${id}`);
  }
  return el;
}

/* Wait until DOM is ready */
document.addEventListener("DOMContentLoaded", init);

/* =========================
   STATE
========================= */

const state = {
  DATA: [],
  VIEW: []
};

/* =========================
   INIT
========================= */

function init() {

  const el = {
    grid: must("grid"),
    preview: must("preview"),
    meta: must("meta"),
    search: must("search"),
    model: must("modelFilter"),
    dataset: must("datasetFilter"),
    imp: must("impairmentFilter")
  };

  // If ANY critical DOM is missing → stop app safely
  if (!el.grid || !el.preview || !el.meta) {
    console.warn("App stopped safely due to missing DOM.");
    return;
  }

  bindEvents(el);
  loadCSV(el);
}

/* =========================
   CSV LOADER (SAFE)
========================= */

async function loadCSV(el) {
  try {

    const res = await fetch("hashed_metadata_df.csv");
    const text = await res.text();

    const lines = text.trim().split("\n");
    const headers = lines[0].split(",");

    state.DATA = lines.slice(1).map(line => {
      const cols = line.split(",");
      let obj = {};
      headers.forEach((h,i)=>{
        obj[h.trim()] = (cols[i] || "").trim();
      });
      return obj;
    });

    buildFilters(el);
    applyFilters(el);

  } catch (err) {
    console.error("CSV load failed", err);
  }
}

/* =========================
   FILTERS
========================= */

function buildFilters(el){

  fill(el.model, unique("model"));
  fill(el.dataset, unique("dataset_type"));
  fill(el.imp, unique("impairment", true));
}

function unique(key, skipEmpty=false){
  const vals = [...new Set(state.DATA.map(d => d[key]))];
  return skipEmpty ? vals.filter(Boolean) : vals;
}

function fill(select, values){
  if (!select) return;

  select.innerHTML = `<option value="">All</option>`;
  values.forEach(v=>{
    const o = document.createElement("option");
    o.value = v;
    o.textContent = v;
    select.appendChild(o);
  });
}

/* =========================
   FILTER ENGINE
========================= */

function applyFilters(el){

  const s = (el.search?.value || "").toLowerCase();
  const m = el.model?.value || "";
  const d = el.dataset?.value || "";
  const i = el.imp?.value || "";

  state.VIEW = state.DATA.filter(x =>
    (!s || (x.prompt||"").toLowerCase().includes(s)) &&
    (!m || x.model === m) &&
    (!d || x.dataset_type === d) &&
    (!i || x.impairment === i)
  );

  render(el);
}

/* =========================
   RENDER (GUARDED)
========================= */

function render(el){

  if (!el.grid) return;

  el.grid.innerHTML = "";

  state.VIEW.forEach(item => {

    const div = document.createElement("div");
    div.className = "tile";

    div.innerHTML = `
      <div class="img"></div>
      <div class="meta">${item.model}</div>
    `;

    div.onclick = () => show(item, el);

    el.grid.appendChild(div);
  });

  if (state.VIEW.length) show(state.VIEW[0], el);
}

/* =========================
   PREVIEW (SAFE)
========================= */

function show(item, el){

  if (!el.preview || !el.meta) return;

  const url =
    "https://surfdrive.surf.nl/s/YS6PcXjL9Rs2c3J/download?files="
    + encodeURIComponent(item.hash_name + ".png");

  el.preview.src = url;
  el.crossOrigin = "anonymous";

  el.meta.innerHTML = `
    <b>Model:</b> ${item.model || "-"}<br>
    <b>Prompt:</b> ${item.prompt || "-"}<br>
    <b>Dataset:</b> ${item.dataset_type || "-"}<br>
    <b>Impairment:</b> ${item.impairment || "None"}
  `;
}

/* =========================
   EVENTS (SAFE BIND)
========================= */

function bindEvents(el){

  el.search?.addEventListener("input", () => applyFilters(el));
  el.model?.addEventListener("change", () => applyFilters(el));
  el.dataset?.addEventListener("change", () => applyFilters(el));
  el.imp?.addEventListener("change", () => applyFilters(el));

  document.querySelectorAll("[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.tab;

      document.querySelectorAll(".tab")
        .forEach(t => t.style.display = "none");

      document.getElementById(id).style.display = "block";
    });
  });

  // default tab
  document.querySelectorAll(".tab")
    .forEach((t,i) => t.style.display = i === 0 ? "block" : "none");
}

})();