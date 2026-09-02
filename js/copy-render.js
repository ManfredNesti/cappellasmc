(function () {
  var nodes = document.querySelectorAll('[data-copy]');
  Array.prototype.forEach.call(nodes, function (el) {
    fetch('content/' + el.getAttribute('data-copy') + '.txt')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (t) {
        el.innerHTML = t.trim().split(/\n\s*\n+/).map(function (p) {
          return '<p>' + p.trim() + '</p>';
        }).join('');
      })
      .catch(function () {});
  });
})();
