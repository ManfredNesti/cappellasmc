/* Renders the agenda from js/events.js. Do not edit to add events (use events.js).
   Each event is type "concerto" (default) or "liturgia".
   Target containers, if present on the page:
     #ev-home / #ev-upcoming / #ev-archive   → concerts
     #lit-upcoming / #lit-archive            → liturgy
   A poster/photo click opens it in a lightbox; a program opens the PDF in a new tab. */
(function () {
  "use strict";
  var MESI = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];

  // Fixed set of the four ensembles (enum). Key → { tag: short chip, full: descriptive name }.
  var FORMATIONS = {
    corale:   { full: "Corale di Calice" },
    schola:   { full: "Schola Gregoriana del Sacro Monte Calvario" },
    convivio: { full: "Il Convivio Rinascimentale" },
    camerata: { full: "Camerata Strumentale di S. Quirico" }
  };

  function pad2(n){ n = String(n); return n.length < 2 ? "0" + n : n; }
  function esc(s){ return s; }

  function card(e) {
    var d = e._d;
    var isLit = e.type === "liturgy";

    // --- Groups section: full names (formations + guests) — no chips, for consistency ---
    var groupsLine = "";
    var fullNames = [];
    if (e.formations) e.formations.forEach(function (k) { fullNames.push(FORMATIONS[k] ? FORMATIONS[k].full : k); });
    if (e.guests) e.guests.forEach(function (g) { fullNames.push(g); });
    if (fullNames.length) {
      groupsLine = '<p class="event__groups">' + fullNames.join(' <span class="event__sep">·</span> ') + '</p>';
    }

    // --- People: inline flow, wrapping, separated by " | " ---
    var people = "";
    if (e.people && e.people.length) {
      people = '<p class="event__people">' + e.people.map(function (p) {
        var i = p.indexOf(':');
        return i > 0 ? '<b>' + p.slice(0, i).trim() + '</b> ' + p.slice(i + 1).trim() : p;
      }).join(' <span class="event__sep">·</span> ') + '</p>';
    }

    // --- Repertoire / notes ---
    var desc = e.desc ? '<p class="event__perf">' + e.desc + '</p>' : '';

    // --- Place (under the title); time goes in the date column ---
    var placeLine = e.place ? '<p class="event__place">' + e.place + '</p>' : '';

    // --- Right column: poster (image → lightbox) + program (PDF icon link) ---
    var media = "";
    if (e.poster) {
      media += '<button type="button" class="event__poster" data-full="assets/img/posters/' + e.poster + '" aria-label="Ingrandisci la locandina">' +
        '<img src="assets/img/posters/' + e.poster + '" alt="Locandina" loading="lazy" onerror="this.closest(\'.event__poster\').remove()"></button>';
    }
    if (e.program) {
      media += '<a class="event__doc" href="assets/programs/' + e.program + '" target="_blank" rel="noopener">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 6.5C10.3 5.4 7.6 4.9 5 5v12.5c2.6-.1 5.3.4 7 1.5 1.7-1.1 4.4-1.6 7-1.5V5c-2.6-.1-5.3.4-7 1.5z"/><path d="M12 6.5v12"/></svg>' +
        '<span>Programma</span></a>';
    }
    if (media) media = '<div class="event__media">' + media + '</div>';

    // --- Photos: thumbnail row below the text ---
    var photosBlock = "";
    if (e.photos && e.photos.length) {
      photosBlock = '<div class="event__photos">' + e.photos.map(function (ph) {
        return '<button type="button" class="event__poster event__poster--photo" data-full="assets/img/gallery/' + ph + '" aria-label="Ingrandisci la foto">' +
          '<img src="assets/img/gallery/' + ph + '" alt="Foto del concerto" loading="lazy" onerror="this.closest(\'.event__poster\').remove()"></button>';
      }).join('') + '</div>';
    }

    return '<article class="event">' +
        '<div class="event__date">' +
          '<div class="event__day">' + pad2(d.getDate()) + '</div>' +
          '<div class="event__mon">' + MESI[d.getMonth()] + '</div>' +
          '<div class="event__yr">' + d.getFullYear() + '</div>' +
          (e.time ? '<div class="event__time">ore ' + e.time + '</div>' : '') +
        '</div>' +
        '<div class="event__body">' +
          '<div class="event__text"><h3>' + e.title + '</h3>' + placeLine + groupsLine + people + desc + photosBlock + '</div>' +
          media +
        '</div>' +
      '</article>';
  }

  function agenda(list){ return '<div class="agenda">' + list.map(card).join('') + '</div>'; }
  function fill(id, html){ var el = document.getElementById(id); if (el) el.innerHTML = html; return el; }

  // Events older than this many years are hidden from the site (but kept in events.js).
  var ARCHIVE_YEARS = 2;

  document.addEventListener("DOMContentLoaded", function () {
    var evs = (window.CAPPELLA_EVENTS || []).filter(function (e) { return e && e.date && e.title; });
    evs.forEach(function (e) { e._d = new Date(e.date + "T00:00:00"); });

    var today = new Date(); today.setHours(0, 0, 0, 0);
    var cutoff = new Date(today); cutoff.setFullYear(cutoff.getFullYear() - ARCHIVE_YEARS);
    evs = evs.filter(function (e) { return e._d >= cutoff; }); // drop events older than ARCHIVE_YEARS
    var asc  = function (a, b) { return a._d - b._d; };
    var desc = function (a, b) { return b._d - a._d; };
    var isLit = function (e) { return e.type === "liturgy"; };

    var concerti = evs.filter(function (e) { return !isLit(e); });
    var liturgie = evs.filter(isLit);

    function split(list){
      return {
        up:   list.filter(function (e) { return e._d >= today; }).sort(asc),
        past: list.filter(function (e) { return e._d <  today; }).sort(desc)
      };
    }
    var c = split(concerti), l = split(liturgie);

    if (document.getElementById("ev-home")) {
      var hl = c.up.length ? c.up : concerti.slice().sort(desc);
      fill("ev-home", agenda(hl.slice(0, 3)));
    }
    fill("ev-upcoming", c.up.length ? '<h2 class="title" style="margin-bottom:var(--sp-3);">Prossimi appuntamenti</h2>' + agenda(c.up) : '');
    fill("ev-archive",  c.past.length ? '<h2 class="title" style="margin-top:var(--sp-6);margin-bottom:var(--sp-3);">Concerti passati</h2>' + agenda(c.past) : '');
    fill("lit-upcoming", l.up.length ? '<h2 class="title" style="margin-bottom:var(--sp-3);">Prossime celebrazioni</h2>' + agenda(l.up) : '');
    fill("lit-archive",  l.past.length ? '<h2 class="title" style="margin-top:var(--sp-6);margin-bottom:var(--sp-3);">Celebrazioni passate</h2>' + agenda(l.past) : '');

    // Poster/photo lightbox
    var box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML = '<button type="button" class="lightbox__close" aria-label="Chiudi">&times;</button><img alt="Immagine ingrandita">';
    document.body.appendChild(box);
    var boxImg = box.querySelector("img");
    function closeBox(){ box.removeAttribute("data-open"); boxImg.removeAttribute("src"); }
    document.addEventListener("click", function (ev) {
      var btn = ev.target.closest ? ev.target.closest(".event__poster") : null;
      if (btn && btn.tagName === "BUTTON") { boxImg.src = btn.getAttribute("data-full"); box.setAttribute("data-open", "true"); return; }
      if (ev.target === box || (ev.target.closest && ev.target.closest(".lightbox__close"))) closeBox();
    });
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") closeBox(); });
  });
})();
