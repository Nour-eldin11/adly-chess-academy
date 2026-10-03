// Movement follows scroll position, in both directions; no timed entrance.
(() => {
  const main = document.querySelector('main');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!main) return;
  const selector = [
    '.home-hero-inner', '.home-proof > div', '.section-heading > *',
    '.pathway', '.home-story-inner > *', '.event-feature > *',
    '.shop-teaser > *', '.home-final > *',
    '.page-hero > *', '.text-hero > *', '.metric-strip > *',
    '.editorial-grid > *', '.story-photo', '.purpose > article', '.value-list > li',
    '.team-section > h2', '.person', '.event-card', '.gallery-cover', '.gallery-item',
    '.contact-layout > *', '.map-panel', '.branch', '.steps > article',
    '.hero > *', '.section-title > *', '.toolbar', '.product', '.closing > *',
  ].join(', ');
  const blocks = new Map();
  let frame = 0;

  function register(element) {
    if (blocks.has(element)) return;
    const ancestor = element.parentElement.closest(selector);
    if (ancestor && main.contains(ancestor)) return;
    const siblings = Array.from(element.parentElement.children).filter(node => node.matches(selector));
    blocks.set(element, {
      y: 0, progress: null, column: Math.max(0, siblings.indexOf(element)) % 4,
      transform: element.style.transform, opacity: element.style.opacity,
      transition: element.style.transition,
    });
  }

  function draw() {
    frame = 0;
    const height = window.innerHeight;
    const desktop = window.innerWidth >= 761;
    const distance = desktop ? 72 : 48;
    const updates = [];
    // Read all positions before writing styles to avoid repeated layout work.
    for (const [element, state] of blocks) {
      if (!element.isConnected) { blocks.delete(element); continue; }
      const top = element.getBoundingClientRect().top - state.y;
      const start = height * 0.98 - (desktop ? state.column * 18 : 0);
      const end = height * 0.55 - (desktop ? state.column * 18 : 0);
      const raw = Math.max(0, Math.min(1, (start - top) / (start - end)));
      const progress = reducedMotion.matches || element.contains(document.activeElement)
        ? 1 : raw * raw * (3 - 2 * raw);
      if (state.progress !== null && Math.abs(progress - state.progress) < 0.0001) continue;
      updates.push({ element, state, progress, y: -distance * (1 - progress) });
    }
    for (const { element, state, progress, y } of updates) {
      state.progress = progress;
      state.y = y;
      if (progress === 1) {
        element.style.transform = state.transform;
        element.style.opacity = state.opacity;
        element.style.transition = state.transition;
      } else {
        element.style.transition = 'none';
        element.style.transform = `translate3d(0, ${y}px, 0) ${state.transform}`;
        element.style.opacity = String(progress);
      }
    }
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(draw);
  }
  main.querySelectorAll(selector).forEach(register);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('pageshow', schedule);
  main.addEventListener('focusin', schedule);
  main.addEventListener('focusout', schedule);
  main.addEventListener('load', schedule, true);
  main.addEventListener('toggle', schedule, true);
  reducedMotion.addEventListener('change', schedule);
  document.fonts?.ready.then(schedule);

  const products = main.querySelector('#products');
  if (products) new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) {
      if (node instanceof Element && node.matches('.product')) register(node);
    }
    schedule();
  }).observe(products, { childList: true });
  schedule();
})();
