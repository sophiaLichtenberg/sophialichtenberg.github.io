const base =
  "https://surfdrive.surf.nl/s/YS6PcXjL9Rs2c3J/download?files=";

let DATA = [];

const $ = (id) => document.getElementById(id);

let searchA, searchB;
let gridA, gridB;

let previewImg, meta, loader;

/* INIT */
window.addEventListener("DOMContentLoaded", async () => {

  searchA = $("searchA");
  searchB = $("searchB");

  gridA = $("gridA");
  gridB = $("gridB");

  previewImg = $("previewImg");
  meta = $("meta");
  loader = $("loader");

  $("btnA").onclick = () => runSearch("A");
  $("btnB").onclick = () => runSearch("B");

  await loadCSV();
});

/* CSV */
async function loadCSV(){
  const res = await fetch("hashed_metadata_df.csv");
  const text = await res.text();

  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");

  DATA = lines.slice(1).map(line => {
    const cols = line.split(",");
    const obj = {};
    headers.forEach((h,i)=> obj[h.trim()] = (cols[i]||"").trim());
    return obj;
  });
}

/* SEARCH */
function runSearch(side){

  const q = (side === "A" ? searchA : searchB)?.value?.toLowerCase();
  const grid = side === "A" ? gridA : gridB;

  const results = DATA.filter(x =>
    !q || (x.prompt || "").toLowerCase().includes(q)
  );

  renderGrid(grid, results);
}

/* IMAGE URL */
function imgUrl(hash){
  return base + encodeURIComponent(hash + ".png");
}

/* GRID RENDER */
function renderGrid(container, items){

  container.innerHTML = "";

  items.slice(0, 200).forEach(item => {

    const hash = item.hash_name;
    if(!hash) return;

    const card = document.createElement("div");
    card.className = "card";

    const thumb = document.createElement("div");
    thumb.className = "thumb";

    const loaderEl = document.createElement("div");
    loaderEl.className = "img-loader";
    loaderEl.textContent = "⏳";

    const img = new Image();
    const url = imgUrl(hash);

    img.style.opacity = "0";

    let done = false;

    img.onload = () => {
      if(done) return;
      done = true;
      loaderEl.remove();
      img.style.opacity = "1";
    };

    img.onerror = () => {
      if(done) return;
      done = true;
      loaderEl.textContent = "❌";
    };

    thumb.appendChild(loaderEl);
    thumb.appendChild(img);

    requestAnimationFrame(() => {
      img.src = url;
    });

    const label = document.createElement("div");
    label.className = "label";
    label.textContent =
      `${item.model || ""} | ${item.bias_subtype || ""}`;

    card.appendChild(thumb);
    card.appendChild(label);

    card.onclick = () => show(item);

    container.appendChild(card);
  });
}

/* PREVIEW */
function show(item){

  const url = imgUrl(item.hash_name);

  loader.classList.remove("hidden");

  previewImg.onload = () => loader.classList.add("hidden");
  previewImg.onerror = () => loader.classList.add("hidden");

  previewImg.src = url;

  meta.innerHTML = `
    <b>Model:</b> ${item.model || "-"}<br>
    <b>Prompt:</b> ${item.prompt || "-"}<br>
    <b>Dataset:</b> ${item.dataset_type || "-"}<br>
    <b>Bias:</b> ${item.bias_subtype || "-"}<br>
    <b>Context:</b> ${item.context_value || "-"}<br>
    <b>Hash:</b> ${item.hash_name || "-"}
  `;
}