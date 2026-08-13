/* ==========================================================================
   Slide-reveal — vis børn af en "build"-container ét ad gangen
   Brug: tilføj klassen "build" til den container, der skal bygges op
   (fx <ul class="slide-list build"> eller en anden liste/tabel-wrapper),
   og inkludér denne fil før </body>. Sæt data-build="true" på slidets
   linje i deck-viewer.html, så vieweren venter med at skifte slide.
   Containerens egne styles (fx .slide-list) er ikke påkrævet — kun
   klassen "build", plus CSS for ".pending" på det element, der bygges.
   ========================================================================== */

(function () {
  const pending = [];

  document.querySelectorAll('.build').forEach(list => {
    [...list.children].forEach((li, i) => {
      if (i > 0) {
        li.classList.add('pending');
        pending.push(li);
      }
    });
  });

  function revealNext() {
    const next = pending.shift();
    if (!next) return false;
    next.classList.remove('pending');
    return true;
  }

  // Styret fra deck-viewer.html, når sliden vises i en iframe
  window.addEventListener('message', e => {
    if (e.data && e.data.type === 'try-advance') {
      if (!revealNext()) {
        parent.postMessage({ type: 'advance-slide' }, '*');
      }
    }
  });

  // Fungerer også hvis filen åbnes direkte, uden deck-viewer
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      revealNext();
    }
  });
})();
