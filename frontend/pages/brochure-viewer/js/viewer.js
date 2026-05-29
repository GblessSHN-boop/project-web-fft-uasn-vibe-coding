pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const brochures = window.BROCHURES || [];
const brochure = brochures.find((item) => item.id === id) || brochures[0];

const bookElement = document.getElementById("book");
const viewerLoading = document.getElementById("viewerLoading");
const pageInfo = document.getElementById("pageInfo");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const viewerTitle = document.getElementById("viewerTitle");
const viewerDesc = document.getElementById("viewerDesc");
const downloadPdf = document.getElementById("downloadPdf");

let pageFlip = null;
let pageWidth = 420;
let pageHeight = 594;

if (brochure) {
  document.title = `${brochure.title} | PDF Flipbook A4`;
  viewerTitle.textContent = brochure.title;
  viewerDesc.textContent = brochure.description;
  downloadPdf.href = brochure.download;
}

async function getPageMetric(pdfFile) {
  const pdf = await pdfjsLib.getDocument(encodeURI(pdfFile)).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1 });

  return {
    baseWidth: viewport.width,
    baseHeight: viewport.height
  };
}

async function renderPdfPage(pdfFile, scaleValue) {
  const pdf = await pdfjsLib.getDocument(encodeURI(pdfFile)).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: scaleValue });
  const outputScale = 4;

  const wrapper = document.createElement("div");
  wrapper.className = "page";
  wrapper.style.width = pageWidth + "px";
  wrapper.style.height = pageHeight + "px";

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: false });

  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = pageWidth + "px";
  canvas.style.height = pageHeight + "px";

  await page.render({
    canvasContext: context,
    viewport: viewport,
    transform: [outputScale, 0, 0, outputScale, 0, 0]
  }).promise;

  wrapper.appendChild(canvas);
  return wrapper;
}

async function loadBook() {
  if (!brochure || !brochure.pages || !brochure.pages.length) {
    viewerLoading.textContent = "Data brosur belum tersedia.";
    return;
  }

  try {
    const metric = await getPageMetric(brochure.pages[0]);
    const targetHeight = Math.min(680, Math.max(560, window.innerHeight - 190));
    const scaleValue = targetHeight / metric.baseHeight;

    pageHeight = Math.round(metric.baseHeight * scaleValue);
    pageWidth = Math.round(metric.baseWidth * scaleValue);

    bookElement.style.width = (pageWidth * 2) + "px";
    bookElement.style.height = pageHeight + "px";

    for (const file of brochure.pages) {
      const renderedPage = await renderPdfPage(file, scaleValue);
      bookElement.appendChild(renderedPage);
    }

    viewerLoading.style.display = "none";
    bookElement.style.display = "block";

    pageFlip = new St.PageFlip(bookElement, {
      width: pageWidth,
      height: pageHeight,
      size: "fixed",
      minWidth: pageWidth,
      maxWidth: pageWidth,
      minHeight: pageHeight,
      maxHeight: pageHeight,
      showCover: false,
      usePortrait: true,
      mobileScrollSupport: false,
      flippingTime: 850,
      maxShadowOpacity: 0.25,
      drawShadow: true,
      autoSize: false
    });

    pageFlip.loadFromHTML(document.querySelectorAll(".page"));
    pageFlip.on("flip", updatePageInfo);

    updatePageInfo();
  } catch (error) {
    viewerLoading.textContent = "Brosur gagal dimuat. Cek nama file PDF.";
    console.error(error);
  }
}

function updatePageInfo() {
  if (!pageFlip) {
    pageInfo.textContent = `Halaman 1 dari ${brochure.pages.length}`;
    return;
  }

  const currentPage = pageFlip.getCurrentPageIndex() + 1;
  pageInfo.textContent = `Halaman ${currentPage} dari ${brochure.pages.length}`;
}

prevBtn.addEventListener("click", () => {
  if (pageFlip) pageFlip.flipPrev();
});

nextBtn.addEventListener("click", () => {
  if (pageFlip) pageFlip.flipNext();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" && pageFlip) pageFlip.flipPrev();
  if (event.key === "ArrowRight" && pageFlip) pageFlip.flipNext();
});

loadBook();
