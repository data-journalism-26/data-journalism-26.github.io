'use strict';

const CATEGORY_LABELS = {
  'conflict':          'Conflict & Security',
  'migration':         'Migration',
  'public-opinion':    'Public Opinion & Polling',
  'domestic-politics': 'Domestic Politics',
  'economics':         'Economics & Trade',
  'investigation':     'Investigations',
  'eagle-hills':       'The Eagle Hills Files',
  'berlin':            'Dit is Berlin',
  'america':           'Oh, America',
};

// Abbreviated labels shown in the two-row mobile nav
const CATEGORY_SHORT = {
  'conflict':          'Conflict',
  'migration':         'Migration',
  'public-opinion':    'Opinion',
  'domestic-politics': 'Politics',
  'economics':         'Economics',
  'investigation':     'Reports',
  'eagle-hills':       'Eagle Hills',
  'berlin':            'Berlin',
  'america':           'America',
};

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);

const ASSIGNMENT_LABELS = {
  'final-project': 'Final Project',
  'data-bit-1':    'Short Take',
  'data-bit-2':    'Short Take',
};

const AVATAR_PALETTE = [
  '#1a3550', '#1e4d6e', '#1e5874', '#0d3a4a',
  '#164060', '#254060', '#2a5568', '#1a4555',
  '#0e2a3e', '#1a5a6e', '#0c1d2e', '#163a5a',
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

function projectHref(p) { return p.url || p.repo; }

function avatarHTML(author, extraClass) {
  const bg   = hashColor(author);
  const text = initials([author]);
  return `<span class="avatar${extraClass ? ' ' + extraClass : ''}" style="background:${bg}">${text}</span>`;
}

// Fallbacks for small author thumbnails (side cards + sidebar)
window.sideThumbFallback = function (img, author) {
  img.parentNode.innerHTML = avatarHTML(author);
};

window.sidebarThumbFallback = function (img, author) {
  img.parentNode.innerHTML = avatarHTML(author);
};

// Article image for big card-image slots. Falls back to initials avatar.
window.articleImgFallback = function (img, author) {
  img.parentNode.innerHTML = avatarHTML(author);
};

function articleImgHTML(p) {
  const author = p.authors[0];
  if (p.image) {
    const authorJson = JSON.stringify(author).replace(/"/g, '&quot;');
    return `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" onerror="articleImgFallback(this,${authorJson})">`;
  }
  return avatarHTML(author);
}

// Small circular author photo for bylines (picks + lead cards).
// Falls back to nothing on error — the text byline still shows.
function authorThumbHTML(p) {
  const author = p.authors[0];
  if (!p.thumbnail) return '';
  return `<img class="byline-thumb" src="thumbnails/${esc(p.thumbnail)}" alt="${esc(author)}" loading="lazy" onerror="this.style.display='none'">`;
}

function authorLine(authors) {
  return authors.map(esc).join(' &amp; ');
}

// ── Featured picks grid ───────────────────────────────────────────────────────
// The whole card is clickable: the headline link carries a stretched ::after
// overlay (see .card-cover-link in CSS), so a click anywhere opens the story.

function pickCardHTML(p, index) {
  const href      = esc(projectHref(p));
  const sizeClass = index === 0 ? 'pick-hero' : index < 3 ? 'pick-md' : 'pick-sm';
  const catLabel  = CATEGORY_LABELS[p.category] || p.category;
  const tag       = index === 0 ? 'h2' : index < 3 ? 'h3' : 'h4';
  const showSub   = index === 0;
  const showBlurb = index < 3;

  return `<article class="pick-card ${sizeClass}">
  <div class="card-image">${articleImgHTML(p)}</div>
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
  <div class="card-image">${articleImgHTML(p)}</div>
  <div class="card-body">
    <h3 class="card-headline"><a class="card-cover-link" href="${href}" target="_blank" rel="noopener noreferrer">${esc(p.title)}</a></h3>
    <p class="card-subtitle">${esc(p.subtitle)}</p>
    <p class="card-byline">${authorThumbHTML(p)}${authorLine(p.authors)}</p>
  </div>
</article>`;
}

function sideCardHTML(p) {
  const href        = esc(projectHref(p));
  const author      = p.authors[0];
  const assignLabel = ASSIGNMENT_LABELS[p.assignment] || p.assignment;

  let thumbInner;
  if (p.thumbnail) {
    const authorJson = JSON.stringify(author).replace(/"/g, '&quot;');
    thumbInner = `<img src="thumbnails/${esc(p.thumbnail)}" alt="${esc(author)}" loading="lazy" onerror="sideThumbFallback(this,${authorJson})">`;
  } else {
    thumbInner = avatarHTML(author);
  }

  return `<article class="story-side"
    data-title="${esc(p.title.toLowerCase())}"
    data-authors="${esc(p.authors.join(' ').toLowerCase())}">
  <div class="side-thumb">${thumbInner}</div>
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

  return `<section class="category-section" id="cat-${key}" data-category="${key}">
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

// ── Sidebar (Short Takes) ─────────────────────────────────────────────────────

function sidebarItemHTML(p) {
  const href        = esc(projectHref(p));
  const author      = p.authors[0];
  const assignLabel = ASSIGNMENT_LABELS[p.assignment] || p.assignment;

  let thumbInner;
  if (p.thumbnail) {
    const authorJson = JSON.stringify(author).replace(/"/g, '&quot;');
    thumbInner = `<img src="thumbnails/${esc(p.thumbnail)}" alt="${esc(author)}" loading="lazy" onerror="sidebarThumbFallback(this,${authorJson})">`;
  } else {
    thumbInner = avatarHTML(author);
  }

  return `<a class="sidebar-item" href="${href}" target="_blank" rel="noopener noreferrer">
  <div class="sidebar-thumb">${thumbInner}</div>
  <div class="sidebar-body">
    <span class="sidebar-type">${esc(assignLabel)}</span>
    <span class="sidebar-headline">${esc(p.title)}</span>
    <span class="sidebar-byline">${authorLine(p.authors)}</span>
  </div>
</a>`;
}

function buildSidebar(projects) {
  const sidebar = document.getElementById('short-takes-sidebar');
  if (!sidebar) return;
  const shortTakes = projects.filter(p => p.assignment !== 'final-project');
  sidebar.innerHTML = `
<div class="sidebar-header">
  <span class="sidebar-label">Short Takes</span>
  <p class="sidebar-desc">Quick reads, one idea each</p>
</div>
${shortTakes.map(sidebarItemHTML).join('\n')}`;
}

// ── Sticky top nav ────────────────────────────────────────────────────────────

function buildNav(presentKeys) {
  const navLinks = document.getElementById('nav-links');

  // Nav uses concise labels (the full names still appear as section
  // headings) so all sections fit without horizontal scrolling.
  const links = [
    { label: 'Featured', href: '#featured' },
    ...presentKeys.map(key => ({
      label: CATEGORY_SHORT[key] || CATEGORY_LABELS[key],
      href:  `#cat-${key}`,
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
    const top  = target.getBoundingClientRect().top + window.scrollY - navH - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });

  // Active link highlighting
  const allAnchors = [
    document.getElementById('featured'),
    ...presentKeys.map(k => document.getElementById(`cat-${k}`)),
    document.getElementById('about'),
  ].filter(Boolean);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id   = entry.target.id;
      const href = (id === 'featured' || id === 'about')
        ? `#${id}`
        : `#cat-${entry.target.dataset.category}`;
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
    if (!noResults.hidden) {
      noResults.textContent = `No stories match "${query}".`;
    }
  }

  input.addEventListener('input', applyFilter);
  clearBtn.addEventListener('click', () => { input.value = ''; applyFilter(); });
}

// ── Main render ───────────────────────────────────────────────────────────────

function render(projects) {
  // Editor's picks (up to 9, indexed hero/md/sm)
  const picks = projects.filter(p => p.editors_pick).slice(0, 9);
  document.getElementById('picks-grid').innerHTML = picks.map(pickCardHTML).join('\n');

  // Group by category in defined order
  const byCategory = {};
  for (const p of projects) {
    (byCategory[p.category] ??= []).push(p);
  }
  const presentKeys = CATEGORY_ORDER.filter(k => byCategory[k]);

  // Render category sections
  document.getElementById('categories').innerHTML =
    presentKeys.map(key => renderCategorySection(key, byCategory[key])).join('\n');

  // Short Takes sidebar
  buildSidebar(projects);

  // Nav + search
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
