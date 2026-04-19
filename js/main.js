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
  }

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
    showPanel(location.hash.slice(1) || DEFAULT);
  });

  // initial
  showPanel(location.hash.slice(1) || DEFAULT);
});
