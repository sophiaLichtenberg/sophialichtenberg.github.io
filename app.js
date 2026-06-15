const base =
  "https://surfdrive.surf.nl/s/YS6PcXjL9Rs2c3J/download?files=";

let DATA = [];
let VIEW = [];

document.addEventListener("DOMContentLoaded", () => {

  const table = document.getElementById("table");
  const gallery = document.getElementById("gallery");
  const meta = document.getElementById("meta");

  const search = document.getElementById("search");
  const modelFilter = document.getElementById("modelFilter");
  const datasetFilter = document.getElementById("datasetFilter");
  const impairmentFilter = document.getElementById("impairmentFilter");

  // =========================
  // LOAD CSV
  // =========================
  async function loadCSV() {

    const res = await fetch("hashed_metadata_df.csv");
    const text = await res.text();

    const lines = text.trim().split("\n");
    const headers = lines[0].split(",");

    DATA = lines.slice(1).map(line => {
      const cols = line.split(",");
      const obj = {};
      headers.forEach((h, i) => {
        obj[h.trim()] = (cols[i] || "").trim();
      });
      return obj;
    });

    buildFilters();
    applyFilters();
  }

  // =========================
  // FILTERS
  // =========================
  function buildFilters() {

    fill(modelFilter, [...new Set(DATA.map(d => d.model))]);
    fill(datasetFilter, [...new Set(DATA.map(d => d.dataset_type))]);
    fill(impairmentFilter, [...new Set(DATA.map(d => d.impairment || ""))].filter(Boolean));
  }

  function fill(select, arr) {
    select.innerHTML = `<option value="">All</option>`;
    arr.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      select.appendChild(opt);
    });
  }

  // =========================
  // FILTER LOGIC
  // =========================
  function applyFilters() {

    const s = search.value.toLowerCase();
    const m = modelFilter.value;
    const d = datasetFilter.value;
    const i = impairmentFilter.value;

    VIEW = DATA.filter(x =>
      (!s || (x.prompt || "").toLowerCase().includes(s)) &&
      (!m || x.model === m) &&
      (!d || x.dataset_type === d) &&
      (!i || (x.impairment || "") === i)
    );

    renderTable();
  }

  // =========================
  // TABLE
  // =========================
  function renderTable() {

    table.innerHTML = "";

    VIEW.forEach(item => {

      const row = document.createElement("div");
      row.className = "row";

      row.innerHTML = `
        <div>${item.model}</div>
        <div>${item.prompt}</div>
        <div>${item.dataset_type}</div>
      `;

      row.onclick = () => show(item);

      table.appendChild(row);
    });

    if (VIEW.length) show(VIEW[0]);
  }

  // =========================
  // IMAGE PREVIEW (FIXED)
  // =========================
  function show(item) {

    const url =
      base + item.hash_name + ".png";

    gallery.src = url;

    meta.innerHTML = `
      <b>Model:</b> ${item.model}<br>
      <b>Prompt:</b> ${item.prompt}<br>
      <b>Dataset:</b> ${item.dataset_type}<br>
      <b>Impairment:</b> ${item.impairment || "None"}
    `;
  }

  // =========================
  // EVENTS
  // =========================
  search.oninput = applyFilters;
  modelFilter.onchange = applyFilters;
  datasetFilter.onchange = applyFilters;
  impairmentFilter.onchange = applyFilters;

  loadCSV();

});