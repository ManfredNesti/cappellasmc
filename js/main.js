/* Mobile menu toggle + footer year (progressive enhancement).
   The site works without JavaScript. */
(function () {
  "use strict";

  // Mobile menu
  var nav = document.querySelector("[data-nav]");
  var toggle = document.querySelector("[data-nav-toggle]");
  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      toggle.setAttribute("aria-expanded", String(!open));
    });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.setAttribute("data-open", "false");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // --- Anno corrente nel footer ---
  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
