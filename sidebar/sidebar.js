// sidebar.js

let allLinks  = [];
let allLabels = [];
let activeLabel = '';   // '' = All
let searchQuery = '';

// ---- Boot ----

async function init() {
  [allLinks, allLabels] = await Promise.all([GNS.getLinks(), GNS.getLabels()]);
  populateLabelSelect();
  renderLabelTabs();
  renderLinks();
  bindEvents();

  // Re-render when storage changes (e.g. content script added a link)
  browser.storage.onChanged.addListener(function(changes) {
    if (changes.gns_links)  allLinks  = changes.gns_links.newValue  || [];
    if (changes.gns_labels) allLabels = changes.gns_labels.newValue || [];
    populateLabelSelect();
    renderLabelTabs();
    renderLinks();
  });
}

// ---- Render ----

function renderLabelTabs() {
  const container = document.getElementById('label-tabs');
  container.innerHTML = '';

  const all = makeTab('All', '', activeLabel === '');
  container.appendChild(all);

  allLabels.forEach(function(lbl) {
    container.appendChild(makeTab(lbl.name, lbl.name, activeLabel === lbl.name, lbl.color));
  });
}

function makeTab(display, value, isActive, color) {
  const btn = document.createElement('button');
  btn.className = 'label-tab' + (isActive ? ' active' : '');
  btn.dataset.label = value;

  if (color && !isActive) {
    const dot = document.createElement('span');
    dot.className = 'label-tab-dot';
    dot.style.background = color;
    btn.appendChild(dot);
  }
  btn.appendChild(document.createTextNode(display));
  return btn;
}

function renderLinks() {
  const container = document.getElementById('links-list');
  container.innerHTML = '';

  const q = searchQuery.toLowerCase();
  const filtered = allLinks.filter(function(l) {
    const matchLabel  = activeLabel === '' || l.label === activeLabel;
    const matchSearch = !q || l.title.toLowerCase().includes(q) || l.url.toLowerCase().includes(q);
    return matchLabel && matchSearch;
  });

  if (filtered.length === 0) {
    container.appendChild(buildEmptyState());
    return;
  }

  filtered.forEach(function(link) {
    container.appendChild(buildLinkItem(link));
  });
}

function buildLinkItem(link) {
  const item = document.createElement('div');
  item.className = 'link-item';

  // Favicon
  const favicon = document.createElement('div');
  favicon.className = 'link-favicon';
  try {
    const origin = new URL(link.url).origin;
    const img = document.createElement('img');
    img.src = origin + '/favicon.ico';
    img.alt = '';
    img.onerror = function() { favicon.textContent = link.title.charAt(0).toUpperCase(); };
    favicon.appendChild(img);
  } catch (e) {
    favicon.textContent = link.title.charAt(0).toUpperCase();
  }

  // Info
  const info = document.createElement('div');
  info.className = 'link-info';

  const title = document.createElement('div');
  title.className = 'link-title';
  title.textContent = link.title;

  const url = document.createElement('div');
  url.className = 'link-url';
  url.textContent = link.url;

  info.appendChild(title);
  info.appendChild(url);

  if (link.label) {
    const lbl = allLabels.find(function(l) { return l.name === link.label; });
    const badge = document.createElement('span');
    badge.className = 'link-label-badge';
    badge.textContent = link.label;
    badge.style.background = lbl ? lbl.color : '#4A90D9';
    info.appendChild(badge);
  }

  // Delete button
  const del = document.createElement('button');
  del.className = 'link-delete-btn';
  del.title = 'Remove';
  del.dataset.id = link.id;
  del.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>';

  item.appendChild(favicon);
  item.appendChild(info);
  item.appendChild(del);

  // Open link on click (but not delete button)
  item.addEventListener('click', function(e) {
    if (e.target.closest('.link-delete-btn')) return;
    browser.tabs.create({ url: link.url });
  });

  return item;
}

function buildEmptyState() {
  const div = document.createElement('div');
  div.className = 'empty-state';
  div.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
    '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>' +
    '<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>' +
    '</svg>' +
    '<p>No links' + (activeLabel ? ' in <b>' + escHtml(activeLabel) + '</b>' : '') + '</p>' +
    '<small>Click <b>+</b> to add one</small>';
  return div;
}

function populateLabelSelect() {
  const sel = document.getElementById('new-link-label');
  const current = sel.value;
  sel.innerHTML = '<option value="">No label</option>';
  allLabels.forEach(function(lbl) {
    const opt = document.createElement('option');
    opt.value = lbl.name;
    opt.textContent = lbl.name;
    if (lbl.name === current) opt.selected = true;
    sel.appendChild(opt);
  });
}

function renderLabelsManageList() {
  const container = document.getElementById('labels-list');
  container.innerHTML = '';

  if (allLabels.length === 0) {
    const p = document.createElement('p');
    p.style.cssText = 'font-size:12px;color:var(--muted);padding:4px 0 8px';
    p.textContent = 'No labels yet.';
    container.appendChild(p);
    return;
  }

  allLabels.forEach(function(lbl) {
    const count = allLinks.filter(function(l) { return l.label === lbl.name; }).length;
    const row = document.createElement('div');
    row.className = 'label-row';

    const dot = document.createElement('span');
    dot.className = 'label-row-dot';
    dot.style.background = lbl.color;

    const name = document.createElement('span');
    name.className = 'label-row-name';
    name.textContent = lbl.name;

    const cnt = document.createElement('span');
    cnt.className = 'label-row-count';
    cnt.textContent = count + ' link' + (count !== 1 ? 's' : '');

    const del = document.createElement('button');
    del.className = 'label-row-del';
    del.title = 'Delete label';
    del.textContent = '×';
    del.dataset.name = lbl.name;

    row.appendChild(dot);
    row.appendChild(name);
    row.appendChild(cnt);
    row.appendChild(del);
    container.appendChild(row);
  });
}

// ---- Event binding ----

function bindEvents() {
  // Label tabs
  document.getElementById('label-tabs').addEventListener('click', function(e) {
    const tab = e.target.closest('.label-tab');
    if (!tab) return;
    activeLabel = tab.dataset.label;
    renderLabelTabs();
    renderLinks();
  });

  // Search
  document.getElementById('search-input').addEventListener('input', function(e) {
    searchQuery = e.target.value;
    renderLinks();
  });

  // Add link panel toggle
  document.getElementById('btn-add-link').addEventListener('click', function() {
    togglePanel('add-link-panel');
  });

  // Manage labels panel toggle
  document.getElementById('btn-manage-labels').addEventListener('click', function() {
    renderLabelsManageList();
    togglePanel('manage-labels-panel');
  });

  // Close panel buttons
  document.querySelectorAll('.close-panel-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      closePanel(btn.dataset.target);
    });
  });

  // Save link
  document.getElementById('save-link-btn').addEventListener('click', async function() {
    const title = document.getElementById('new-link-title').value;
    const url   = document.getElementById('new-link-url').value;
    const label = document.getElementById('new-link-label').value;
    const errEl = document.getElementById('add-link-error');

    try {
      await GNS.addLink(title, url, label);
      document.getElementById('new-link-title').value = '';
      document.getElementById('new-link-url').value   = '';
      document.getElementById('new-link-label').value = '';
      errEl.classList.add('hidden');
      closePanel('add-link-panel');
      // storage.onChanged will re-render
    } catch (e) {
      errEl.textContent = e.message;
      errEl.classList.remove('hidden');
    }
  });

  // Delete link (delegated from links-list)
  document.getElementById('links-list').addEventListener('click', async function(e) {
    const btn = e.target.closest('.link-delete-btn');
    if (!btn) return;
    e.stopPropagation();
    await GNS.removeLink(btn.dataset.id);
  });

  // Save label
  document.getElementById('save-label-btn').addEventListener('click', async function() {
    const name  = document.getElementById('new-label-name').value;
    const color = document.getElementById('new-label-color').value;
    const errEl = document.getElementById('add-label-error');

    try {
      await GNS.addLabel(name, color);
      document.getElementById('new-label-name').value = '';
      errEl.classList.add('hidden');
      renderLabelsManageList();
    } catch (e) {
      errEl.textContent = e.message;
      errEl.classList.remove('hidden');
    }
  });

  // Delete label (delegated from labels-list)
  document.getElementById('labels-list').addEventListener('click', async function(e) {
    const btn = e.target.closest('.label-row-del');
    if (!btn) return;
    await GNS.removeLabel(btn.dataset.name);
    if (activeLabel === btn.dataset.name) activeLabel = '';
    renderLabelsManageList();
  });

  // Enter key shortcuts
  document.getElementById('new-link-url').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('save-link-btn').click();
  });
  document.getElementById('new-label-name').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('save-label-btn').click();
  });
}

// ---- Helpers ----

function togglePanel(id) {
  const panel = document.getElementById(id);
  if (panel.classList.contains('hidden')) {
    // Close any other open panel first
    document.querySelectorAll('.bottom-panel').forEach(function(p) {
      p.classList.add('hidden');
    });
    panel.classList.remove('hidden');
  } else {
    panel.classList.add('hidden');
  }
}

function closePanel(id) {
  const panel = document.getElementById(id);
  if (panel) panel.classList.add('hidden');
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ---- Start ----
init();
