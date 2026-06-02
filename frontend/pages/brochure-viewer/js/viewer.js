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
    pageFlip.on("flip", function () {
      updatePageInfo();
      window.dispatchEvent(new CustomEvent("fftViewerChange", { detail: getViewerState() }));
    });
    registerViewerPublicApi();

    updatePageInfo();
  } catch (error) {
    viewerLoading.textContent = "Brosur gagal dimuat. Cek nama file PDF.";
    console.error(error);
  }
}

/* FFT_VIEWER_PUBLIC_API_20260602 */
function getViewerTotalPages() {
  return brochure && Array.isArray(brochure.pages) ? brochure.pages.length : 1;
}

function normalizeViewerSpread(page) {
  const total = Math.max(1, getViewerTotalPages());
  let target = Math.max(1, Math.min(total, Number(page) || 1));

  if (target <= 1) {
    return 1;
  }

  if (target >= total) {
    return total % 2 === 0 ? total - 1 : total;
  }

  return target % 2 === 0 ? target - 1 : target;
}

function getViewerCurrentPage() {
  if (!pageFlip) {
    return 1;
  }

  return pageFlip.getCurrentPageIndex() + 1;
}

function getViewerState() {
  const total = getViewerTotalPages();
  const current = normalizeViewerSpread(getViewerCurrentPage());

  return {
    current: current,
    total: total,
    spreadStart: current,
    spreadEnd: Math.min(total, current + 1),
    isFirst: current <= 1,
    isLast: current >= normalizeViewerSpread(total)
  };
}

function goViewerPrevious() {
  if (!pageFlip) {
    return false;
  }

  pageFlip.flipPrev();
  return true;
}

function goViewerNext() {
  if (!pageFlip) {
    return false;
  }

  pageFlip.flipNext();
  return true;
}

function goViewerFirst() {
  if (!pageFlip) {
    return false;
  }

  const state = getViewerState();

  if (state.isFirst) {
    updatePageInfo();
    window.dispatchEvent(new CustomEvent("fftViewerChange", { detail: getViewerState() }));
    return true;
  }

  pageFlip.flipPrev();
  window.setTimeout(goViewerFirst, 520);
  return true;
}

function goViewerLast() {
  if (!pageFlip) {
    return false;
  }

  const state = getViewerState();

  if (state.isLast) {
    updatePageInfo();
    window.dispatchEvent(new CustomEvent("fftViewerChange", { detail: getViewerState() }));
    return true;
  }

  pageFlip.flipNext();
  window.setTimeout(goViewerLast, 520);
  return true;
}

function registerViewerPublicApi() {
  window.FFTBrochureViewer = {
    isReady: function () {
      return Boolean(pageFlip);
    },
    getState: getViewerState,
    previous: goViewerPrevious,
    next: goViewerNext,
    first: goViewerFirst,
    last: goViewerLast
  };

  window.dispatchEvent(new CustomEvent("fftViewerReady", { detail: getViewerState() }));
}
/* /FFT_VIEWER_PUBLIC_API_20260602 */

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
