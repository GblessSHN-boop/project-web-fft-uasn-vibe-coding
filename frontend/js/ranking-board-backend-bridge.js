/* FFT_RANKING_BOARD_BACKEND_BRIDGE_20260607
   Penghubung resmi backend -> frontend untuk Papan Peringkat GPA.

   Cara pakai dari backend nanti:
   1. Render script sebelum ranking-board-backend-bridge.js:
      window.FFTRankingInitialData = {
        academicYear: "2025-2026",
        semesters: [
          {
            title: "GPA SEMESTER 1",
            entries: [
              { rank: 1, name: "Nama Mahasiswa", gpa: "4.00", photo: "../assets/images/orang.png" },
              { rank: 2, name: "Nama Mahasiswa", gpa: "3.98", movement: "up", change: 1 }
            ]
          },
          {
            title: "GPA SEMESTER 2",
            entries: []
          }
        ]
      };

   2. Atau panggil kapan saja:
      window.FFTRankingBackendBridge.render(payload);

   3. Atau kirim event:
      window.dispatchEvent(new CustomEvent("fft-ranking-data", { detail: payload }));

   Catatan:
   - File ini tidak fetch backend sendiri.
   - Backend bebas menentukan endpoint.
   - Layout tetap stabil karena HTML awal sudah pre-render.
*/
(function () {
  "use strict";

  var VERSION = "20260607";
  var DEFAULT_IMAGE = "../assets/images/orang.png";
  var TITLE_ICON = "../assets/icons/title/tittle-by-gland.png";
  var UP_ICON = "../assets/icons/movement/up-clean.png";
  var DOWN_ICON = "../assets/icons/movement/down-clean.png";

  function text(value, fallback) {
    if (value === null || value === undefined) {
      return fallback || "";
    }

    return String(value).trim() || fallback || "";
  }

  function number(value, fallback) {
    var parsed = parseInt(value, 10);

    if (Number.isNaN(parsed)) {
      return fallback;
    }

    return parsed;
  }

  function normalizeGpa(value) {
    var raw = text(value, "4.00").replace(",", ".");
    var parsed = parseFloat(raw);

    if (Number.isNaN(parsed)) {
      return raw;
    }

    return parsed.toFixed(2);
  }

  function normalizeEntry(entry, fallbackRank) {
    var item = entry || {};
    var rank = number(item.rank || item.position || item.peringkat, fallbackRank);

    return {
      rank: rank,
      name: text(item.name || item.nama || item.full_name || item.nama_lengkap, "NO NAME"),
      gpa: normalizeGpa(item.gpa || item.ipk || item.score || item.nilai || "4.00"),
      photo: text(item.photo || item.foto || item.image || item.avatar, rank === 1 ? DEFAULT_IMAGE : ""),
      movement: text(item.movement || item.trend || item.status, "up").toLowerCase() === "down" ? "down" : "up",
      change: number(item.change || item.delta || item.perubahan, 1)
    };
  }

  function normalizeSemester(rawSemester, index) {
    var source = rawSemester || {};
    var entries = Array.isArray(source.entries) ? source.entries :
      Array.isArray(source.rows) ? source.rows :
      Array.isArray(source.data) ? source.data :
      [];

    var normalizedEntries = entries.map(function (entry, entryIndex) {
      return normalizeEntry(entry, entryIndex + 1);
    });

    if (!normalizedEntries.length) {
      normalizedEntries.push(normalizeEntry({ rank: 1, name: "NO NAME", gpa: "4.00", photo: DEFAULT_IMAGE }, 1));

      for (var rank = 2; rank <= 10; rank += 1) {
        normalizedEntries.push(normalizeEntry({
          rank: rank,
          name: "NO NAME",
          gpa: "4.00",
          movement: rank === 4 || rank === 6 || rank === 9 ? "down" : "up",
          change: 1
        }, rank));
      }
    }

    normalizedEntries.sort(function (a, b) {
      return a.rank - b.rank;
    });

    return {
      title: text(source.title || source.label || source.semester_name, index === 0 ? "GPA SEMESTER 1" : "GPA SEMESTER 2"),
      entries: normalizedEntries
    };
  }

  function normalizePayload(payload) {
    var source = payload || {};
    var semesters = [];

    if (Array.isArray(source.semesters)) {
      semesters = source.semesters;
    } else if (source.semester1 || source.semester2) {
      semesters = [source.semester1 || {}, source.semester2 || {}];
    } else if (Array.isArray(source.data)) {
      semesters = [
        {
          title: "GPA SEMESTER 1",
          entries: source.data.filter(function (item) {
            return String(item.semester || item.semester_number || item.semester_id || "1") === "1";
          })
        },
        {
          title: "GPA SEMESTER 2",
          entries: source.data.filter(function (item) {
            return String(item.semester || item.semester_number || item.semester_id || "1") === "2";
          })
        }
      ];
    }

    return {
      academicYear: text(source.academicYear || source.academic_year || source.tahunAkademik || source.tahun_akademik, "2025-2026"),
      semesters: [
        normalizeSemester(semesters[0], 0),
        normalizeSemester(semesters[1], 1)
      ]
    };
  }

  function getBoard() {
    return document.getElementById("rankingBoard");
  }

  function createRow(entry) {
    var icon = entry.movement === "down" ? DOWN_ICON : UP_ICON;

    return [
      '<li class="gpa-row">',
      '<span class="gpa-row-rank">' + entry.rank + '</span>',
      '<span class="gpa-row-name" title="GPA ' + entry.gpa + '">',
      '<span class="gpa-row-name-text">' + entry.name + '</span>',
      '<span class="gpa-row-score-text">GPA ' + entry.gpa + '</span>',
      '</span>',
      '<span class="gpa-movement ' + entry.movement + '">',
      '<img class="gpa-movement-icon" src="' + icon + '" alt="' + entry.movement + '" width="16" height="16" />',
      '<span>' + entry.change + '</span>',
      '</span>',
      '</li>'
    ].join("");
  }

  function renderCard(card, semester) {
    if (!card || !semester) {
      return;
    }

    var entries = semester.entries || [];
    var topEntry = entries.find(function (entry) {
      return entry.rank === 1;
    }) || entries[0] || normalizeEntry({}, 1);

    var title = card.querySelector(".gpa-card-title");
    var rankTitle = card.querySelector(".gpa-rank-title");
    var featuredName = card.querySelector(".gpa-featured-name");
    var scoreBadge = card.querySelector(".gpa-score-badge");
    var image = card.querySelector(".gpa-featured-image");
    var imageLink = card.querySelector(".gpa-featured-image-link");
    var list = card.querySelector(".gpa-list");

    if (title) {
      title.textContent = semester.title;
    }

    if (rankTitle && !rankTitle.querySelector(".gpa-title-icon")) {
      rankTitle.innerHTML = '<span>#1</span><a class="gpa-title-icon-link" href="#" title="Tittle by Gland Siahaan" aria-label="Tittle by Gland Siahaan"><img class="gpa-title-icon" src="' + TITLE_ICON + '" alt="Tittle by Gland Siahaan" width="52" height="32" /></a>';
    }

    if (featuredName) {
      featuredName.textContent = topEntry.name;
    }

    if (scoreBadge) {
      scoreBadge.textContent = "GPA " + topEntry.gpa;
    }

    if (image) {
      image.src = topEntry.photo || DEFAULT_IMAGE;
      image.alt = topEntry.name;
    }

    if (imageLink) {
      imageLink.title = topEntry.name;
      imageLink.setAttribute("aria-label", topEntry.name);
    }

    if (list) {
      list.innerHTML = entries.filter(function (entry) {
        return entry.rank > 1;
      }).slice(0, 9).map(createRow).join("");
    }
  }

  function setMeta(selector, value) {
    var node = document.querySelector(selector);

    if (!node) {
      return;
    }

    if (node.tagName === "TITLE") {
      node.textContent = value;
      document.title = value;
      return;
    }

    node.setAttribute("content", value);
  }

  function updateSeo(payload, normalized) {
    var data = normalized || normalizePayload(payload);
    var year = data.academicYear;
    var topNames = data.semesters.map(function (semester) {
      var first = (semester.entries || []).find(function (entry) {
        return entry.rank === 1;
      });

      return first && first.name !== "NO NAME" ? first.name : "";
    }).filter(Boolean);

    var title = "Papan Peringkat GPA Semester 1 dan 2 " + year + " | Fakultas Filsafat Teologi UASN";
    var description = "Papan Peringkat GPA Fakultas Filsafat Teologi Universitas Advent Surya Nusantara untuk Semester 1 dan Semester 2 Tahun Akademik " + year + ".";

    if (topNames.length) {
      description = "Papan Peringkat GPA FFT UASN Tahun Akademik " + year + " dengan peringkat teratas: " + topNames.join(", ") + ".";
    }

    setMeta("#rankingSeoTitle", title);
    setMeta("#rankingSeoDescription", description);
    setMeta("#rankingSeoOgTitle", title);
    setMeta("#rankingSeoOgDescription", description);
    setMeta("#rankingSeoTwitterTitle", title);
    setMeta("#rankingSeoTwitterDescription", description);

    var jsonLd = document.getElementById("rankingSeoJsonLd");

    if (jsonLd) {
      jsonLd.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "description": description,
        "isPartOf": {
          "@type": "WebSite",
          "name": "Fakultas Filsafat Teologi UASN"
        },
        "about": {
          "@type": "EducationalOrganization",
          "name": "Fakultas Filsafat Teologi Universitas Advent Surya Nusantara"
        },
        "mainEntity": {
          "@type": "ItemList",
          "name": "Papan Peringkat GPA " + year,
          "itemListElement": data.semesters.flatMap(function (semester) {
            return semester.entries.slice(0, 10).map(function (entry) {
              return {
                "@type": "ListItem",
                "position": entry.rank,
                "name": semester.title + " - " + entry.name + " - GPA " + entry.gpa
              };
            });
          })
        }
      });
    }
  }

  function render(payload) {
    var board = getBoard();

    if (!board) {
      return false;
    }

    var data = normalizePayload(payload);
    var cards = board.querySelectorAll(".gpa-card");

    renderCard(cards[0], data.semesters[0]);
    renderCard(cards[1], data.semesters[1]);

    board.classList.add("ranking-poster", "gpa-mobile-ready", "gpa-exact-board-ready");
    board.setAttribute("data-gpa-static-board", "1");

    updateSeo(payload, data);

    return true;
  }

  window.FFTRankingBackendBridge = {
    version: VERSION,
    normalizePayload: normalizePayload,
    render: render,
    updateSeo: updateSeo
  };

  window.FFTRankingApplyBackendData = render;

  window.addEventListener("fft-ranking-data", function (event) {
    render(event.detail || {});
  });

  if (window.FFTRankingInitialData) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        render(window.FFTRankingInitialData);
      }, { once: true });
    } else {
      render(window.FFTRankingInitialData);
    }
  }
})();
/* /FFT_RANKING_BOARD_BACKEND_BRIDGE_20260607 */