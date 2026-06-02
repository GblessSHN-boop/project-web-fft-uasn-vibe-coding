(function () {
  "use strict";

  /* FFT_VIEWER_BACKEND_READY_BROCHURE_DATA_20260602 */
  var defaultPdf = "assets/brosur/konten-belum-tersedia-fft/konten-belum-tersedia-fft.pdf";
  var defaultDescription = "Baca brosur digital dalam tampilan buku interaktif.";

  var defaultPages = [
    "assets/brosur/konten-belum-tersedia-fft/cover.pdf",
    "assets/brosur/konten-belum-tersedia-fft/hal-1.pdf",
    "assets/brosur/konten-belum-tersedia-fft/hal-2.pdf",
    "assets/brosur/konten-belum-tersedia-fft/hal-3.pdf",
    "assets/brosur/konten-belum-tersedia-fft/hal-4.pdf",
    "assets/brosur/konten-belum-tersedia-fft/hal-5.pdf",
    "assets/brosur/konten-belum-tersedia-fft/hal-6.pdf",
    "assets/brosur/konten-belum-tersedia-fft/back-cover.pdf"
  ];

  function clonePages(pages) {
    return Array.isArray(pages) ? pages.slice() : [];
  }

  function defineBrochure(config) {
    var pages = clonePages(config.pages);
    var pdfUrl = config.pdfUrl || config.pdf || config.source || defaultPdf;
    var downloadUrl = config.downloadUrl || config.download || pdfUrl;

    var brochure = {
      id: config.id || config.slug,
      slug: config.slug || config.id,
      title: config.title || "Preview Brosur Digital",
      subtitle: config.subtitle || "",
      description: config.description || defaultDescription,
      sourceType: config.sourceType || "pages",
      pdfUrl: pdfUrl,
      downloadUrl: downloadUrl,
      pages: pages,
      pageCount: pages.length,
      totalPages: pages.length,

      /* kompatibilitas kode lama */
      pdf: pdfUrl,
      source: pdfUrl,
      download: downloadUrl
    };

    brochure.files = brochure.pages;
    brochure.pageFiles = brochure.pages;
    brochure.pdfPages = brochure.pages;

    return brochure;
  }

  var brochures = {
    "utama": defineBrochure({
      id: "utama",
      slug: "utama",
      title: "Brosur Utama Fakultas Filsafat Teologi",
      subtitle: "Konten belum tersedia",
      description: "Konten brosur ini sedang disiapkan dan akan diperbarui melalui backend atau admin dashboard.",
      sourceType: "pages",
      pdfUrl: "assets/brosur/konten-belum-tersedia-fft/konten-belum-tersedia-fft.pdf",
      downloadUrl: "assets/brosur/konten-belum-tersedia-fft/konten-belum-tersedia-fft.pdf",
      pages: defaultPages
    }),
    "dosen": defineBrochure({
      id: "dosen",
      slug: "dosen",
      title: "Brosur Dosen dan Tenaga Pendidik",
      subtitle: "Konten belum tersedia",
      description: "Konten brosur ini sedang disiapkan dan akan diperbarui melalui backend atau admin dashboard.",
      sourceType: "pages",
      pdfUrl: "assets/brosur/konten-belum-tersedia-fft/konten-belum-tersedia-fft.pdf",
      downloadUrl: "assets/brosur/konten-belum-tersedia-fft/konten-belum-tersedia-fft.pdf",
      pages: defaultPages
    }),
    "pendaftaran": defineBrochure({
      id: "pendaftaran",
      slug: "pendaftaran",
      title: "Panduan Pendaftaran Mahasiswa Baru",
      subtitle: "Konten belum tersedia",
      description: "Konten brosur ini sedang disiapkan dan akan diperbarui melalui backend atau admin dashboard.",
      sourceType: "pages",
      pdfUrl: "assets/brosur/konten-belum-tersedia-fft/konten-belum-tersedia-fft.pdf",
      downloadUrl: "assets/brosur/konten-belum-tersedia-fft/konten-belum-tersedia-fft.pdf",
      pages: defaultPages
    }),
    "program-studi": defineBrochure({
      id: "program-studi",
      slug: "program-studi",
      title: "Informasi Program Studi",
      subtitle: "Konten belum tersedia",
      description: "Konten brosur ini sedang disiapkan dan akan diperbarui melalui backend atau admin dashboard.",
      sourceType: "pages",
      pdfUrl: "assets/brosur/konten-belum-tersedia-fft/konten-belum-tersedia-fft.pdf",
      downloadUrl: "assets/brosur/konten-belum-tersedia-fft/konten-belum-tersedia-fft.pdf",
      pages: defaultPages
    })
  };

  var brochureList = Object.keys(brochures).map(function (key) {
    return brochures[key];
  });

  window.FFT_BROCHURES = brochures;
  window.FFT_BROCHURE_DATA = brochures;
  window.BROCHURES = brochures;
  window.BROCHURE_DATA = brochures;
  window.brochures = brochureList;
  window.brochureData = brochures;
  window.FFT_BROCHURE_LIST = brochureList;
  /* /FFT_VIEWER_BACKEND_READY_BROCHURE_DATA_20260602 */
}());
