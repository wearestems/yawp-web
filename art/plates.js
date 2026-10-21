// Plates 01–07: the app's seven scenes as they move, each played by first light, on a sheet of its own —
// day and night in turn. A 12 s loop plays while its sheet is in view; a tall cut on a phone. The film (08) too.
(function () {
  var P = [
    ['land', 'day'],
    ['figure', 'night'],
    ['mycelium', 'day'],
    ['pond', 'night'],
    ['passage', 'day'],
    ['room', 'night'],
    ['cell', 'day'],
  ];
  var root = document.getElementById('plates'), tall = matchMedia('(max-width: 640px)').matches, still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  P.forEach(function (p, i) {
    var s = document.createElement('figure');
    s.className = 'plate plate-' + p[1];
    var f = 'art/' + p[0] + '-' + p[1] + (tall ? '-tall' : '');
    s.innerHTML = '<video class="plate-v" src="' + f + '.mp4" poster="' + f + '.jpg" muted loop playsinline preload="none" aria-hidden="true"></video>' +
      '<figcaption class="cap label"><span class="dim">0' + (i + 1) + '</span> ' + p[0] +
      '</figcaption>';
    root.appendChild(s);
  });
  // a plate settles in as it arrives and moves only while it is in view
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) {
    var v = e.target.querySelector('.plate-v');
    if (e.isIntersecting) { e.target.classList.add('in'); if (v && !still) v.play().catch(function () {}); } else if (v) v.pause();
  }); }, { threshold: 0.25 });
  document.querySelectorAll('.plate').forEach(function (el) { io.observe(el); });
  var film = document.getElementById('film');
  new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) film.play().catch(function () {}); else film.pause(); }); }, { threshold: 0.4 }).observe(film);
  var snd = document.getElementById('film-sound');
  function sound() { film.muted = !film.muted; if (!film.muted) { film.currentTime = 0; film.play(); } snd.textContent = film.muted ? '→ Sound' : '■ Mute'; snd.setAttribute('aria-pressed', String(!film.muted)); }
  film.addEventListener('click', sound); snd.addEventListener('click', sound);
})();
