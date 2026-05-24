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

window.imgFallback = function (img, author) {
  img.parentNode.innerHTML = avatarHTML(author);
};

function thumbnailHTML(p) {
  const author = p.authors[0];
  if (p.thumbnail) {
    const authorJson = JSON.stringify(author).replace(/"/g, '&quot;');
    return `<img src="thumbnails/${esc(p.thumbnail)}" alt="${esc(author)}" loading="lazy" onerror="imgFallback(this,${authorJson})">`;
  }
  return avatarHTML(author);
}

function authorLine(authors) {
  return authors.map(esc).join(' &amp; ');
}

// ── Pick cards (featured section) ────────────────────────────────────────────

function pickCardHTML(p, index) {
  const href = esc(projectHref(p));
  const sizeClass = index === 0 ? 'pick-hero' : index < 3 ? 'pick-md' : 'pick-sm';
  const catLabel = CATEGORY_LABELS[p.category] || p.category;
  const tag = index === 0 ? 'h2' : index < 3 ? 'h3' : 'h4';
  const showSubtitle = index === 0;
  const showBlurb = index < 3;
  const codeLink = `<a href="${esc(p.repo)}" class="byline-code" target="_blank" rel="noopener noreferrer">Code ↗</a>`;
  const liveLink = p.url
    ? ` · <a href="${esc(p.url)}" class="byline-code" target="_blank" rel="noopener noreferrer">Story ↗</a>`
    : '';

  return `<article class="pick-card ${sizeClass}">
  <a class="card-image-wrap" href="${href}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">
    <div class="card-image">${thumbnailHTML(p)}</div>
  </a>
  <div class="card-body">
    <span class="card-section">${esc(catLabel)}</span>
    <${tag} class="card-headline"><a href="${href}" target="_blank" rel="noopener noreferrer">${esc(p.title)}</a></${tag}>
    ${showSubtitle ? `<p class="card-subtitle">${esc(p.subtitle)}</p>` : ''}
    ${showBlurb ? `<p class="card-blurb">${esc(p.blurb)}</p>` : ''}
    <p class="card-byline">${authorLine(p.authors)} · ${codeLink}${liveLink}</p>
  </div>
</article>`;
}

// ── Story cards (topic sections) ──────────────────────────────────────────────

function storyCardHTML(p) {
  const href = esc(projectHref(p));
  const assignLabel = ASSIGNMENT_LABELS[p.assignment] || p.assignment;
  const codeLink = `<a href="${esc(p.repo)}" class="byline-code" target="_blank" rel="noopener noreferrer">Code ↗</a>`;
  const liveLink = p.url
    ? ` · <a href="${esc(p.url)}" class="byline-code" target="_blank" rel="noopener noreferrer">Story ↗</a>`
    : '';

  return `<article class="story-card" data-title="${esc(p.title.toLowerCase())}" data-authors="${esc(p.authors.join(' ').toLowerCase())}">
  <a class="card-image-wrap" href="${href}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">
    <div class="card-image">${thumbnailHTML(p)}</div>
  </a>
  <div class="card-body">
    <h4 class="card-headline"><a href="${href}" target="_blank" rel="noopener noreferrer">${esc(p.title)}</a></h4>
    <p class="card-subtitle">${esc(p.subtitle)}</p>
    <p class="card-byline">${authorLine(p.authors)} · ${esc(assignLabel)} · ${codeLink}${liveLink}</p>
  </div>
</article>`;
}

// ── Sticky top nav ────────────────────────────────────────────────────────────

function buildNav(presentKeys) {
  const navLinks = document.getElementById('nav-links');

  const links = [
    { label: 'Featured', href: '#featured' },
    ...presentKeys.map(key => ({
      label: CATEGORY_LABELS[key],
      href: `#cat-${key}`,
      key,
    })),
    { label: 'About', href: '#about' },
  ];

  navLinks.innerHTML = links
    .map(l => `<a class="nav-link" href="${l.href}"${l.key ? ` data-cat="${l.key}"` : ''}>${esc(l.label)}</a>`)
    .join('');

  // Smooth scroll with nav-height offset
  navLinks.addEventListener('click', e => {
    const link = e.target.closest('.nav-link');
    if (!link) return;
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    const navH = document.getElementById('top-nav').offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });

  // Active link highlighting via IntersectionObserver
  const allAnchors = [
    document.getElementById('featured'),
    ...presentKeys.map(k => document.getElementById(`cat-${k}`)),
    document.getElementById('about'),
  ].filter(Boolean);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      const href = id === 'featured' || id === 'about' ? `#${id}` : `#cat-${entry.target.dataset.category}`;
      navLinks.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      const active = navLinks.querySelector(`[href="${href}"]`);
      if (active) {
        active.classList.add('active');
        active.scrollIntoView({ block: 'nearest', inline: 'center' });
      }
    });
  }, { rootMargin: '-5% 0px -75% 0px' });

  allAnchors.forEach(el => observer.observe(el));
}

// ── Search ────────────────────────────────────────────────────────────────────

function setupSearch() {
  const input    = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');
  const noResults = document.getElementById('no-results');

  function applyFilter() {
    const query = input.value.toLowerCase().trim();
    clearBtn.hidden = !query;

    let totalVisible = 0;

    for (const section of document.querySelectorAll('.category-section')) {
      let sectionVisible = 0;
      for (const card of section.querySelectorAll('.story-card')) {
        const match = !query
          || card.dataset.title.includes(query)
          || card.dataset.authors.includes(query);
        card.style.display = match ? '' : 'none';
        if (match) sectionVisible++;
      }
      section.style.display = sectionVisible > 0 ? '' : 'none';
      totalVisible += sectionVisible;
    }

    noResults.hidden = totalVisible > 0;
    if (!noResults.hidden) {
      noResults.textContent = `No stories match "${query}".`;
    }
  }

  input.addEventListener('input', applyFilter);
  clearBtn.addEventListener('click', () => {
    input.value = '';
    applyFilter();
  });
}

// ── Main render ───────────────────────────────────────────────────────────────

function render(projects) {
  // Editor's picks — up to 9, sized hero/md/sm by index
  const picks = projects.filter(p => p.editors_pick).slice(0, 9);
  document.getElementById('picks-grid').innerHTML = picks.map(pickCardHTML).join('\n');

  // Group all projects by category
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
    return `<section class="category-section" id="cat-${key}" data-category="${key}">
  <div class="cat-heading">
    <span class="cat-label">${label}</span>
    <span class="cat-rule" aria-hidden="true"></span>
    <span class="cat-count">${count}</span>
  </div>
  <div class="stories-grid">
    ${list.map(storyCardHTML).join('\n')}
  </div>
</section>`;
  });
  document.getElementById('categories').innerHTML = sections.join('\n');

  buildNav(presentKeys);
  setupSearch();
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
