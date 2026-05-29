const grid = document.getElementById("brochureGrid");
const mainDownload = document.getElementById("mainDownload");

function slugUrl(id) {
  return "brochure-viewer.html?id=" + encodeURIComponent(id);
}

function renderBrochures() {
  const brochures = window.BROCHURES || [];

  if (!grid) {
    console.error("Element brochureGrid tidak ditemukan.");
    return;
  }

  grid.innerHTML = "";

  if (!brochures.length) {
    grid.innerHTML = "<p>Belum ada data brosur.</p>";
    return;
  }

  if (mainDownload) {
    mainDownload.href = brochures[0].download;
  }

  brochures.forEach(function (item) {
    const card = document.createElement("article");
    card.className = "brochure-card";

    const coverLink = document.createElement("a");
    coverLink.className = "cover-link";
    coverLink.href = slugUrl(item.id);
    coverLink.setAttribute("aria-label", "Lihat " + item.title);

    const coverFrame = document.createElement("div");
    coverFrame.className = "cover-frame";

    const iframe = document.createElement("iframe");
    iframe.src = item.cover + "#toolbar=0&navpanes=0&scrollbar=0";
    iframe.title = "PDF Cover Preview";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "0";
    iframe.style.display = "block";
    iframe.style.pointerEvents = "none";

    coverFrame.appendChild(iframe);
    coverLink.appendChild(coverFrame);

    const info = document.createElement("div");
    info.className = "brochure-info";

    const title = document.createElement("h3");
    title.textContent = item.title;

    const desc = document.createElement("p");
    desc.textContent = item.description;

    const actionRow = document.createElement("div");
    actionRow.className = "action-row";

    const viewButton = document.createElement("a");
    viewButton.className = "view-button";
    viewButton.href = slugUrl(item.id);
    viewButton.textContent = "Lihat Brosur";

    const downloadButton = document.createElement("a");
    downloadButton.className = "download-button";
    downloadButton.href = item.download;
    downloadButton.setAttribute("download", "");
    downloadButton.textContent = "Download";

    actionRow.appendChild(viewButton);
    actionRow.appendChild(downloadButton);

    info.appendChild(title);
    info.appendChild(desc);
    info.appendChild(actionRow);

    card.appendChild(coverLink);
    card.appendChild(info);

    grid.appendChild(card);
  });
}

renderBrochures();