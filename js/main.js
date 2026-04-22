// ============================================================
// r3tex.github.io — SPA-style panel switcher with lazy panel loading
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav a[data-section]');
  const panels   = document.querySelectorAll('.section[id]');
  const DEFAULT  = 'about';
  const loaded   = new Set();

  // ----------------------------------------------------------
  // Lazy panel loader
  // ----------------------------------------------------------
  async function ensurePanelLoaded(section) {
    const src = section.dataset.panel;
    if (!src || loaded.has(section.id)) return;
    try {
      const res = await fetch(src, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      section.innerHTML = html;
      loaded.add(section.id);
      wirePanelInteractions(section);
    } catch (err) {
      console.error(`panel load failed: ${src}`, err);
      section.innerHTML = `<p style="color:var(--red)">// failed to load ${src}</p>`;
    }
  }

  // ----------------------------------------------------------
  // Wire up panel-specific interactions after load
  // ----------------------------------------------------------
  function wirePanelInteractions(section) {
    // Filter chips — works for any panel with .filter buttons + [data-tags] items
    const filters = section.querySelectorAll('.filter');
    const items   = section.querySelectorAll('.t-entry, .art-item, [data-tags]');
    if (filters.length && items.length) {
      const applyFilter = (want) => {
        filters.forEach(f => f.classList.toggle('active', f.dataset.filter === want));
        items.forEach(e => {
          if (want === 'all') {
            e.classList.remove('hidden');
            return;
          }
          const tags = (e.dataset.tags || '').split(/\s+/);
          e.classList.toggle('hidden', !tags.includes(want));
        });
      };
      filters.forEach(btn => {
        btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
      });
      const initial = section.querySelector('.filter.active')?.dataset.filter;
      if (initial) applyFilter(initial);
    }

    // Lightbox — intercept thumbnail clicks
    section.querySelectorAll('.t-thumb').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        lightbox.open(a.getAttribute('href'));
      });
    });
  }

  // ----------------------------------------------------------
  // Lightbox — fullscreen image preview with history integration
  // Browser back (or X button / Escape) closes the preview.
  // ----------------------------------------------------------
  const lightbox = (() => {
    let el, imgEl, isOpen = false;

    function build() {
      el = document.createElement('div');
      el.className = 'lightbox';
      el.innerHTML = `
        <button class="lightbox-close" aria-label="Close preview">×</button>
        <img alt="">
      `;
      imgEl = el.querySelector('img');
      el.querySelector('.lightbox-close').addEventListener('click', close);
      el.addEventListener('click', (e) => { if (e.target === el) close(); });
      document.body.appendChild(el);
    }

    function open(src) {
      if (!el) build();
      imgEl.src = src;
      el.classList.add('open');
      document.body.classList.add('lightbox-open');
      isOpen = true;
      // Push a history entry so the back button closes the lightbox
      history.pushState({ lightbox: true }, '', location.href);
    }

    function close() {
      if (isOpen) history.back();
    }

    // Called by the global popstate handler when a lightbox is open
    function handlePop() {
      if (!isOpen) return false;
      el.classList.remove('open');
      document.body.classList.remove('lightbox-open');
      imgEl.src = '';
      isOpen = false;
      return true;
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) close();
    });

    return { open, close, handlePop, isOpen: () => isOpen };
  })();

  // ----------------------------------------------------------
  // Panel routing
  // ----------------------------------------------------------
  async function showPanel(id) {
    const target  = document.getElementById(id) ? id : DEFAULT;
    const section = document.getElementById(target);

    await ensurePanelLoaded(section);

    panels.forEach(p => p.classList.toggle('visible', p.id === target));
    navLinks.forEach(a => {
      a.classList.toggle('active', a.dataset.section === target);
    });

    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  navLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const id = a.dataset.section;
      if (location.hash !== `#${id}`) {
        history.pushState(null, '', `#${id}`);
      }
      showPanel(id);
    });
  });

  window.addEventListener('popstate', () => {
    // If a lightbox is open, closing it takes precedence over panel routing
    if (lightbox.handlePop()) return;
    showPanel(location.hash.slice(1) || DEFAULT);
  });

  // initial
  showPanel(location.hash.slice(1) || DEFAULT);
});
