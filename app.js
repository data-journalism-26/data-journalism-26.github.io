'use strict';

const CATEGORY_LABELS = {
  'conflict':          'Conflict & Security',
  'migration':         'Migration',
  'public-opinion':    'Public Opinion & Polling',
  'domestic-politics': 'Domestic Politics',
  'economics':         'Economics & Trade',
  'investigation':     'Investigations',
  'berlin':            'Dit is Berlin',
};

// Abbreviated labels shown in the two-row mobile nav
const CATEGORY_SHORT = {
  'conflict':          'Conflict',
  'migration':         'Migration',
  'public-opinion':    'Opinion',
  'domestic-politics': 'Politics',
  'economics':         'Economics',
  'investigation':     'Reports',
  'berlin':            'Berlin',
};

// Graffiti accent colour per category
const CATEGORY_ACCENT = {
  'conflict':          '#ff2d8b',
  'migration':         '#2ad4ff',
  'public-opinion':    '#c6ff3a',
  'domestic-politics': '#ff7a1a',
  'economics':         '#b06bff',
  'investigation':     '#ffe23d',
  'berlin':            '#00e0a8',
};

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);

const ASSIGNMENT_LABELS = {
  'final-project': 'Final Project',
  'data-bit-1':    'Short Take',
  'data-bit-2':    'Short Take',
};

// Author → photo + programme. Programme is a placeholder pending real data.
const AUTHORS = {
  'Elena Dreyer':               { thumb: 'elena-dreyer.png',               programme: 'Class of 2026' },
  'Giorgio Coppola':            { thumb: 'giorgio-coppola.png',            programme: 'Class of 2026' },
  'Sophia Hiss':                { thumb: 'sophia-hiss.png',                programme: 'Class of 2026' },
  'Luca Vellage':               { thumb: 'luca-verona-vellage.png',        programme: 'Class of 2026' },
  'Chirag Ramesh':              { thumb: 'chirag-ramesh.png',              programme: 'Class of 2026' },
  'Lou Caressa':                { thumb: 'emma-lou-caressa.png',           programme: 'Class of 2026' },
  'Oliver Pollex':              { thumb: 'oliver-pollex.png',              programme: 'Class of 2026' },
  'Aishwarya Sampath':          { thumb: 'aishwarya-sampath.png',          programme: 'Class of 2026' },
  'Leticia Figueiredo Collado': { thumb: 'leticia-figueiredo-collado.png', programme: 'Class of 2026' },
  'Xiaohan Wu':                 { thumb: 'xiaohan-wu.png',                 programme: 'Class of 2026' },
  'Bjarne Schinzel':            { thumb: 'bjarne-schinzel.png',            programme: 'Class of 2026' },
  'Elena Murray':               { thumb: 'elena-murray.png',               programme: 'Class of 2026' },
  'Daniel Boppert':             { thumb: 'daniel-boppert.png',             programme: 'Class of 2026' },
};

const DEFAULT_ACCENT = '#ff2d8b';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function projectHref(p) { return p.url || p.repo; }
function accentFor(cat) { return CATEGORY_ACCENT[cat] || DEFAULT_ACCENT; }
function authorLine(authors) { return authors.map(esc).join(' &amp; '); }

// ── Story images (big card slots) ─────────────────────────────────────────────
window.storyImgError = function (img) {
  const fb = (img.getAttribute('data-fb') || '').split('|').filter(Boolean);
  if (fb.length) {
    img.setAttribute('data-fb', fb.slice(1).join('|'));
    img.src = fb[0];
  } else {
    img.parentNode.classList.add('img-black');
    img.remove();
  }
};

function articleImgHTML(p, shape) {
  const chain = (shape === 'square')
    ? [p.image_square, p.image_pano, p.image]
    : [p.image_pano, p.image_square, p.image];
  const srcs = chain.filter(Boolean);
  if (!srcs.length) return '';
  const [primary, ...rest] = srcs;
  const fbAttr = rest.length ? ` data-fb="${esc(rest.join('|'))}"` : '';
  return `<img src="${esc(primary)}" alt="${esc(p.title)}" loading="lazy"${fbAttr} onerror="storyImgError(this)">`;
}

// ── Author photos ─────────────────────────────────────────────────────────────
window.authorThumbBlack = function (img) {
  const span = document.createElement('span');
  span.className = img.className + ' is-black';
  img.replaceWith(span);
};

function authorThumbHTML(p) {
  if (!p.thumbnail) return '<span class="byline-thumb is-black"></span>';
  return `<img class="byline-thumb" src="thumbnails-authors/${esc(p.thumbnail)}" alt="${esc(p.authors[0])}" loading="lazy" onerror="authorThumbBlack(this)">`;
}

function authorPhotoHTML(p) {
  if (!p.thumbnail) return '';
  return `<img src="thumbnails-authors/${esc(p.thumbnail)}" alt="${esc(p.authors[0])}" loading="lazy" onerror="this.remove()">`;
}

// ── Featured picks grid ───────────────────────────────────────────────────────

function pickCardHTML(p, index) {
  const href      = esc(projectHref(p));
  const sizeClass = index === 0 ? 'pick-hero' : index < 3 ? 'pick-md' : 'pick-sm';
  const shape     = index < 3 ? 'pano' : 'square';
  const catLabel  = CATEGORY_LABELS[p.category] || p.category;
  const tag       = index === 0 ? 'h2' : index < 3 ? 'h3' : 'h4';
  const showSub   = index === 0;
  const showBlurb = index < 3;

  return `<article class="pick-card ${sizeClass}" style="--accent:${accentFor(p.category)}">
  <div class="card-image">${articleImgHTML(p, shape)}</div>
  <div class="card-body">
    <span class="card-section">${esc(catLabel)}</span>
    <${tag} class="card-headline"><a class="card-cover-link" href="${href}" target="_blank" rel="noopener noreferrer">${esc(p.title)}</a></${tag}>
    ${showSub   ? `<p class="card-subtitle">${esc(p.subtitle)}</p>` : ''}
    ${showBlurb ? `<p class="card-blurb">${esc(p.blurb)}</p>` : ''}
    <p class="card-byline">${authorThumbHTML(p)}${authorLine(p.authors)}</p>
  </div>
</article>`;
}

// ── Category sections: lead + rail ───────────────────────────────────────────

function leadCardHTML(p) {
  const href = esc(projectHref(p));
  return `<article class="story-lead"
    data-title="${esc(p.title.toLowerCase())}"
    data-authors="${esc(p.authors.join(' ').toLowerCase())}">
  <div class="card-image">${articleImgHTML(p, 'pano')}</div>
  <div class="card-body">
    <h3 class="card-headline"><a class="card-cover-link" href="${href}" target="_blank" rel="noopener noreferrer">${esc(p.title)}</a></h3>
    <p class="card-subtitle">${esc(p.subtitle)}</p>
    <p class="card-byline">${authorThumbHTML(p)}${authorLine(p.authors)}</p>
  </div>
</article>`;
}

function sideCardHTML(p) {
  const href        = esc(projectHref(p));
  const assignLabel = ASSIGNMENT_LABELS[p.assignment] || p.assignment;
  return `<article class="story-side"
    data-title="${esc(p.title.toLowerCase())}"
    data-authors="${esc(p.authors.join(' ').toLowerCase())}">
  <div class="side-thumb">${authorPhotoHTML(p)}</div>
  <div class="side-body">
    <h4 class="card-headline"><a class="card-cover-link" href="${href}" target="_blank" rel="noopener noreferrer">${esc(p.title)}</a></h4>
    <p class="card-byline">${authorLine(p.authors)} · ${esc(assignLabel)}</p>
  </div>
</article>`;
}

function renderCategorySection(key, list) {
  const label = esc(CATEGORY_LABELS[key]);
  const count = list.length;
  const lead  = list.find(p => p.lead) || list[0];
  const sides = list.filter(p => p !== lead);
  const solo  = sides.length === 0;
  const rail  = sides.length > 0
    ? `<div class="story-rail">${sides.map(sideCardHTML).join('\n')}</div>`
    : '';

  return `<section class="category-section" id="cat-${key}" data-category="${key}" style="--accent:${accentFor(key)}">
  <div class="cat-heading">
    <span class="cat-label">${label}</span>
    <span class="cat-rule" aria-hidden="true"></span>
    <span class="cat-count">${count}</span>
  </div>
  <div class="cat-grid${solo ? ' cat-grid--solo' : ''}">
    ${leadCardHTML(lead)}
    ${rail}
  </div>
</section>`;
}

// ── Authors ───────────────────────────────────────────────────────────────────

function buildAuthors(projects) {
  const grid = document.getElementById('authors-grid');
  if (!grid) return;

  const byAuthor = new Map();
  for (const p of projects) {
    for (const name of p.authors) {
      if (!byAuthor.has(name)) byAuthor.set(name, []);
      byAuthor.get(name).push({ title: p.title, href: projectHref(p) });
    }
  }

  const names = [...byAuthor.keys()].sort((a, b) => a.localeCompare(b));

  grid.innerHTML = names.map(name => {
    const meta  = AUTHORS[name] || {};
    const prog  = meta.programme || 'Class of 2026';
    const thumb = meta.thumb
      ? `<img src="thumbnails-authors/${esc(meta.thumb)}" alt="${esc(name)}" loading="lazy" onerror="this.remove()">`
      : '';
    const pieces = byAuthor.get(name)
      .map(pc => `<a href="${esc(pc.href)}" target="_blank" rel="noopener noreferrer">${esc(pc.title)}</a>`)
      .join('');
    return `<div class="author-card">
  <div class="author-thumb">${thumb}</div>
  <div class="author-info">
    <div class="author-name">${esc(name)}</div>
    <div class="author-prog">${esc(prog)}</div>
    <div class="author-pieces">${pieces}</div>
  </div>
</div>`;
  }).join('\n');
}

// ── Sticky top nav ────────────────────────────────────────────────────────────

function buildNav(presentKeys) {
  const navLinks = document.getElementById('nav-links');

  const links = [
    { label: 'Featured', href: '#featured' },
    ...presentKeys.map(key => ({
      label: CATEGORY_SHORT[key] || CATEGORY_LABELS[key],
      href:  `#cat-${key}`,
      key,
    })),
    { label: 'Authors', href: '#authors' },
    { label: 'About',   href: '#about' },
  ];

  navLinks.innerHTML = links
    .map(l => `<a class="nav-link" href="${l.href}"${l.key ? ` data-cat="${l.key}"` : ''}>${esc(l.label)}</a>`)
    .join('');

  navLinks.addEventListener('click', e => {
    const link = e.target.closest('.nav-link');
    if (!link) return;
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    const navH = document.getElementById('top-nav').offsetHeight;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });

  const allAnchors = [
    document.getElementById('featured'),
    ...presentKeys.map(k => document.getElementById(`cat-${k}`)),
    document.getElementById('authors'),
    document.getElementById('about'),
  ].filter(Boolean);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id   = entry.target.id;
      const href = id.startsWith('cat-') ? `#${id}` : `#${id}`;
      navLinks.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      const active = navLinks.querySelector(`[href="${href}"]`);
      if (active) active.classList.add('active');
    });
  }, { rootMargin: '-5% 0px -75% 0px' });

  allAnchors.forEach(el => observer.observe(el));
}

// ── Search filter ─────────────────────────────────────────────────────────────

function setupSearch() {
  const input     = document.getElementById('search-input');
  const clearBtn  = document.getElementById('search-clear');
  const noResults = document.getElementById('no-results');

  function applyFilter() {
    const query = input.value.toLowerCase().trim();
    clearBtn.hidden = !query;
    let totalVisible = 0;

    for (const section of document.querySelectorAll('.category-section')) {
      const cards = [...section.querySelectorAll('[data-title]')];
      const match = !query || cards.some(c =>
        c.dataset.title.includes(query) || c.dataset.authors.includes(query)
      );
      section.style.display = match ? '' : 'none';
      if (match) totalVisible++;
    }

    noResults.hidden = totalVisible > 0;
    if (!noResults.hidden) noResults.textContent = `No stories match "${query}".`;
  }

  input.addEventListener('input', applyFilter);
  clearBtn.addEventListener('click', () => { input.value = ''; applyFilter(); });
}

// ── Main render ───────────────────────────────────────────────────────────────

function render(projects) {
  const picks = projects.filter(p => p.editors_pick).slice(0, 9);
  document.getElementById('picks-grid').innerHTML = picks.map(pickCardHTML).join('\n');

  const byCategory = {};
  for (const p of projects) (byCategory[p.category] ??= []).push(p);
  const presentKeys = CATEGORY_ORDER.filter(k => byCategory[k]);

  document.getElementById('categories').innerHTML =
    presentKeys.map(key => renderCategorySection(key, byCategory[key])).join('\n');

  buildAuthors(projects);
  buildNav(presentKeys);
  setupSearch();
}

fetch('projects.json')
  .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
  .then(render)
  .catch(err => {
    document.getElementById('picks-grid').innerHTML =
      `<p class="error">Could not load projects: ${esc(err.message)}</p>`;
  });
