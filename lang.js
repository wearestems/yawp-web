// English or Japanese, remembered per visitor. Japanese browsers open in
// Japanese; everyone else in English. Pages mark text with .t-en / .t-ja.
(function () {
  var KEY = 'yawp-site-lang';
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  var first = saved || ((navigator.language || '').toLowerCase().indexOf('ja') === 0 ? 'ja' : 'en');

  function set(lang) {
    root.lang = lang;
    var buttons = document.querySelectorAll('.lang button');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', String(buttons[i].getAttribute('data-l') === lang));
    }
    var t = document.querySelector('title[data-' + lang + ']');
    if (t) document.title = t.getAttribute('data-' + lang);
  }

  set(first);
  document.addEventListener('DOMContentLoaded', function () {
    set(root.lang);
    var buttons = document.querySelectorAll('.lang button');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (e) {
        var lang = e.currentTarget.getAttribute('data-l');
        try { localStorage.setItem(KEY, lang); } catch (err) {}
        set(lang);
      });
    }
  });
})();
