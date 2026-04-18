/*  Young Capital Advisory — minimal progressive enhancement.
 *  Reveal-on-scroll + a quiet shadow on the masthead once the
 *  page has been scrolled. No frameworks, no trackers. */

(function () {
  'use strict';

  // Tag sections for reveal (skip hero so the first paint is instant).
  const revealTargets = document.querySelectorAll(
    '.section, .index, .hero__plate'
  );
  revealTargets.forEach(function (el) { el.setAttribute('data-reveal', ''); });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  }
})();
