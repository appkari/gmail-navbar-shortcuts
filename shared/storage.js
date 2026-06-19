// shared/storage.js — CRUD helpers over browser.storage.sync
// Loaded in both the sidebar page and content scripts.

const GNS = (function() {
  const LINKS_KEY  = 'gns_links';
  const LABELS_KEY = 'gns_labels';
  const MAX_LINKS  = 100;

  function uuid() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, function(c) {
      return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
    });
  }

  function isValidUrl(url) {
    return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));
  }

  // ---- Links ----

  async function getLinks() {
    const result = await browser.storage.sync.get(LINKS_KEY);
    return result[LINKS_KEY] || [];
  }

  async function setLinks(links) {
    await browser.storage.sync.set({ [LINKS_KEY]: links });
  }

  async function addLink(title, url, labelName) {
    if (!title || !title.trim()) throw new Error('Title is required');
    if (!isValidUrl(url))        throw new Error('URL must start with http:// or https://');

    const links = await getLinks();
    const link  = {
      id:        uuid(),
      title:     title.trim(),
      url:       url.trim(),
      label:     labelName ? labelName.trim() : '',
      createdAt: Date.now()
    };
    links.unshift(link);
    if (links.length > MAX_LINKS) links.length = MAX_LINKS;
    await setLinks(links);
    return link;
  }

  async function removeLink(id) {
    const links = await getLinks();
    await setLinks(links.filter(function(l) { return l.id !== id; }));
  }

  // ---- Labels ----

  async function getLabels() {
    const result = await browser.storage.sync.get(LABELS_KEY);
    return result[LABELS_KEY] || [];
  }

  async function setLabels(labels) {
    await browser.storage.sync.set({ [LABELS_KEY]: labels });
  }

  async function addLabel(name, color) {
    if (!name || !name.trim()) throw new Error('Label name is required');
    const labels = await getLabels();
    if (labels.some(function(l) { return l.name === name.trim(); })) {
      throw new Error('Label "' + name + '" already exists');
    }
    const label = { name: name.trim(), color: color || '#4A90D9' };
    labels.push(label);
    await setLabels(labels);
    return label;
  }

  async function removeLabel(name) {
    const labels = await getLabels();
    await setLabels(labels.filter(function(l) { return l.name !== name; }));
    // Detach label from links
    const links = await getLinks();
    await setLinks(links.map(function(l) {
      if (l.label === name) l.label = '';
      return l;
    }));
  }

  return { getLinks, addLink, removeLink, getLabels, addLabel, removeLabel, isValidUrl };
})();
