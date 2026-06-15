// =====================
// TAB SYSTEM
// =====================

document.querySelectorAll(".tab-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const tab = btn.dataset.tab;

    document.querySelectorAll(".tab-content")
      .forEach(t=>t.classList.remove("active"));

    document.querySelectorAll(".tab-btn")
      .forEach(b=>b.classList.remove("active"));

    document.getElementById(tab).classList.add("active");
    btn.classList.add("active");
  });
});

// =====================
// DATA
// =====================

const base =
"https://surfdrive.surf.nl/s/YS6PcXjL9Rs2c3J/download?files=";

const data = [
{
  hash:"11208126882101814974",
  model:"FLUX_schnell",
  prompt:"Photo of a Person",
  dataset:"No_Context_no_Bias"
},
{
  hash:"14082437164622650326",
  model:"FLUX_schnell",
  prompt:"Photo of a Person",
  dataset:"No_Context_no_Bias"
},
{
  hash:"10797990572701187062",
  model:"FLUX_schnell",
  prompt:"Photo of a Person",
  dataset:"No_Context_no_Bias"
}
];

// =====================
// DOM
// =====================

const grid = document.getElementById("grid");
const preview = document.getElementById("preview");
const info = document.getElementById("info");

const searchInput = document.getElementById("searchInput");
const modelFilter = document.getElementById("modelFilter");
const datasetFilter = document.getElementById("datasetFilter");

// =====================
// DROPDOWNS (TYPEABLE)
// =====================

function setupDropdowns(){

  const models = [...new Set(data.map(d=>d.model))];
  const datasets = [...new Set(data.map(d=>d.dataset))];

  const modelList = document.getElementById("modelList");
  const datasetList = document.getElementById("datasetList");

  models.forEach(m=>{
    const opt = document.createElement("option");
    opt.value = m;
    modelList.appendChild(opt);
  });

  datasets.forEach(d=>{
    const opt = document.createElement("option");
    opt.value = d;
    datasetList.appendChild(opt);
  });
}

// =====================
// RENDER
// =====================

function render(list){

  grid.innerHTML = "";

  list.forEach(item=>{

    const div = document.createElement("div");
    div.className = "dataset-card";

    div.innerHTML = `
      <img src="${base + item.hash + ".png"}">
      <small>${item.model}</small>
    `;

    div.onclick = ()=>{

      preview.src = base + item.hash + ".png";

      info.innerHTML = `
        <b>${item.model}</b><br>
        ${item.prompt}<br>
        ${item.dataset}
      `;
    };

    grid.appendChild(div);

  });
}

// =====================
// FILTER
// =====================

function applyFilters(){

  const s = searchInput.value.toLowerCase();
  const m = modelFilter.value.toLowerCase();
  const d = datasetFilter.value.toLowerCase();

  const filtered = data.filter(x=>
    x.prompt.toLowerCase().includes(s) &&
    x.model.toLowerCase().includes(m) &&
    x.dataset.toLowerCase().includes(d)
  );

  render(filtered);
}

// =====================
// EVENTS
// =====================

searchInput.addEventListener("input", applyFilters);
modelFilter.addEventListener("input", applyFilters);
datasetFilter.addEventListener("input", applyFilters);

// =====================
// INIT
// =====================

setupDropdowns();
render(data);

preview.src = base + data[0].hash + ".png";
info.innerHTML = data[0].model;