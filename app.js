'use strict';

const CATEGORY_LABELS = {
  'conflict':          'Conflict & Security',
  'migration':         'Migration',
  'energy':            'Energy & Infrastructure',
  'transport':         'Transport & Aviation',
  'public-opinion':    'Public Opinion & Polling',
  'domestic-politics': 'Domestic Politics',
  'climate':           'Climate & Environment',
  'economics':         'Economics & Trade',
  'urban':             'Urban & Local',
  'culture':           'Culture & Media',
  'press-freedom':     'Press Freedom',
  'investigation':     'Investigations',
  'history':           'History',
  'education':         'Education',
  'inequality':        'Inequality',
};

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);

const ASSIGNMENT_LABELS = {
  'final-project': 'Final Project',
  'data-bit-1':    'Data Bit 1',
  'data-bit-2':    'Data Bit 2',
};

const AVATAR_PALETTE = [
  '#1d4ed8', '#7e22ce', '#15803d', '#b91c1c',
  '#0369a1', '#92400e', '#6d28d9', '#0f766e',
  '#b45309', '#1e40af', '#065f46', '#7c3aed',
];

function hashColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

function initials(authors) {
  const parts = authors[0].trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function projectHref(p) {
  return p.url || p.repo;
}

function avatarHTML(author) {
  const bg = hashColor(author);
  const text = initials([author]);
  return `<span class="avatar" style="background:${bg}">${text}</span>`;
}

// Global onerror handler for broken thumbnails
window.imgFallback = function (img, author) {
  img.parentNode.innerHTML = avatarHTML(author);
};

function thumbnailHTML(p) {
  const author = p.authors[0];
  if (p.thumbnail) {
    // JSON.stringify produces double-quoted strings; encode as &quot; so they
    // don't break the surrounding onerror="..." attribute.
    const authorJson = JSON.stringify(author).replace(/"/g, '&quot;');
    return `<img src="thumbnails/${esc(p.thumbnail)}" alt="${esc(author)}" loading="lazy" onerror="imgFallback(this,${authorJson})">`;
  }
  return avatarHTML(author);
}

function badgeHTML(p) {
  const label = ASSIGNMENT_LABELS[p.assignment] || p.assignment;
  return `<span class="badge badge-${esc(p.assignment)}">${esc(label)}</span>`;
}

function authorLine(authors) {
  return authors.map(esc).join(' &amp; ');
}

function pickCardHTML(p) {
  const href = esc(projectHref(p));
  return `
<article class="pick-card">
  <a class="pick-image-link" href="${href}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">
    <div class="pick-image">${thumbnailHTML(p)}</div>
  </a>
  <div class="pick-body">
    <div class="pick-badges">
      <span class="pick-gold">★ Editor's Pick</span>
      ${badgeHTML(p)}
    </div>
    <h3 class="pick-title">
      <a href="${href}" target="_blank" rel="noopener noreferrer">${esc(p.title)}</a>
    </h3>
    <p class="pick-subtitle">${esc(p.subtitle)}</p>
    <p class="pick-blurb">${esc(p.blurb)}</p>
    <p class="pick-authors">By ${authorLine(p.authors)}</p>
    <div class="pick-links">
      ${p.url
        ? `<a class="btn-primary" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Read the story →</a>`
        : ''}
      <a class="btn-secondary" href="${esc(p.repo)}" target="_blank" rel="noopener noreferrer">GitHub</a>
    </div>
  </div>
</article>`.trim();
}

function projectCardHTML(p) {
  const href = esc(projectHref(p));
  return `
<article class="project-card">
  <a class="proj-image-link" href="${href}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">
    <div class="proj-image">${thumbnailHTML(p)}</div>
  </a>
  <div class="proj-body">
    ${badgeHTML(p)}
    <h4 class="proj-title">
      <a href="${href}" target="_blank" rel="noopener noreferrer">${esc(p.title)}</a>
    </h4>
    <p class="proj-subtitle">${esc(p.subtitle)}</p>
    <p class="proj-authors">By ${authorLine(p.authors)}</p>
    <div class="proj-links">
      ${p.url
        ? `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Read →</a>`
        : ''}
      <a class="proj-gh" href="${esc(p.repo)}" target="_blank" rel="noopener noreferrer">GitHub</a>
    </div>
  </div>
</article>`.trim();
}

// ── Sticky category nav ──────────────────────────────────────────────────────

function buildCatNav(categoryKeys) {
  const navLinks = document.getElementById('cat-nav-links');
  navLinks.innerHTML = categoryKeys
    .map(key => `<a class="cat-nav-link" href="#cat-${key}" data-cat="${key}">${esc(CATEGORY_LABELS[key])}</a>`)
    .join('');

  // Smooth-scroll with sticky-nav offset on click
  navLinks.addEventListener('click', e => {
    const link = e.target.closest('.cat-nav-link');
    if (!link) return;
    e.preventDefault();
    const target = document.getElementById('cat-' + link.dataset.cat);
    if (!target) return;
    const navH = document.getElementById('cat-nav').offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navH - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  });

  // Highlight the nav link for the section currently in view
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const key = entry.target.dataset.category;
      navLinks.querySelectorAll('.cat-nav-link').forEach(l => l.classList.remove('active'));
      const active = navLinks.querySelector(`[data-cat="${key}"]`);
      if (active) {
        active.classList.add('active');
        // Keep the active link scrolled into view inside the nav
        active.scrollIntoView({ block: 'nearest', inline: 'center' });
      }
    });
  }, { rootMargin: '-5% 0px -75% 0px' });

  document.querySelectorAll('.category-section').forEach(s => observer.observe(s));
}

// ── Search / category filter ─────────────────────────────────────────────────

function setupFilter(categoryKeys) {
  const select = document.getElementById('cat-filter');
  select.innerHTML =
    '<option value="">All categories</option>' +
    categoryKeys.map(k => `<option value="${k}">${esc(CATEGORY_LABELS[k])}</option>`).join('');

  const searchInput = document.getElementById('search-input');
  const clearBtn    = document.getElementById('filter-clear');
  const noResults   = document.getElementById('no-results');

  function applyFilter() {
    const query  = searchInput.value.toLowerCase().trim();
    const catKey = select.value;
    clearBtn.hidden = !query && !catKey;

    let totalVisible = 0;

    for (const section of document.querySelectorAll('.category-section')) {
      const sectionCat = section.dataset.category;
      const catMatch = !catKey || sectionCat === catKey;
      let sectionVisible = 0;

      for (const card of section.querySelectorAll('.project-card')) {
        const title  = card.querySelector('.proj-title')?.textContent.toLowerCase()   ?? '';
        const author = card.querySelector('.proj-authors')?.textContent.toLowerCase() ?? '';
        const textMatch = !query || title.includes(query) || author.includes(query);
        const show = catMatch && textMatch;
        card.style.display = show ? '' : 'none';
        if (show) sectionVisible++;
      }

      section.style.display = (catMatch && sectionVisible > 0) ? '' : 'none';
      totalVisible += sectionVisible;
    }

    noResults.hidden = totalVisible > 0;
    if (!noResults.hidden) {
      noResults.textContent = query
        ? `No projects match "${query}".`
        : 'No projects in this category.';
    }
  }

  searchInput.addEventListener('input', applyFilter);
  select.addEventListener('change', applyFilter);
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    select.value = '';
    applyFilter();
  });
}

// ── Main render ───────────────────────────────────────────────────────────────

function render(projects) {
  // Editor's picks
  const picks = projects.filter(p => p.editors_pick);
  document.getElementById('picks-grid').innerHTML = picks.map(pickCardHTML).join('\n');

  // Group all projects by category (picks also appear in their category section)
  const byCategory = {};
  for (const p of projects) {
    (byCategory[p.category] ??= []).push(p);
  }
  const presentKeys = CATEGORY_ORDER.filter(k => byCategory[k]);

  // Build category sections
  const sections = presentKeys.map(key => {
    const list  = byCategory[key];
    const label = esc(CATEGORY_LABELS[key]);
    const count = list.length;
    return `
<section class="category-section" id="cat-${key}" data-category="${key}">
  <h3 class="cat-heading">
    <span class="cat-label">${label}</span>
    <span class="cat-count-badge">${count}</span>
  </h3>
  <div class="projects-grid">
    ${list.map(projectCardHTML).join('\n')}
  </div>
</section>`.trim();
  });
  document.getElementById('categories').innerHTML = sections.join('\n');

  // Wire up sticky nav and search filter
  buildCatNav(presentKeys);
  setupFilter(presentKeys);
}

fetch('projects.json')
  .then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  })
  .then(render)
  .catch(err => {
    document.getElementById('picks-grid').innerHTML =
      `<p class="error">Could not load projects: ${esc(err.message)}</p>`;
  });
