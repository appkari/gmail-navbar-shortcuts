// Data.gs — Storage helpers using UserProperties (per-user, persistent across sessions)

const LINKS_KEY = 'quick_links';
const LABELS_KEY = 'custom_labels';
const MAX_LINKS = 100;

// ---- Quick Links ----

function getLinks() {
  const raw = PropertiesService.getUserProperties().getProperty(LINKS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveLinks(links) {
  PropertiesService.getUserProperties().setProperty(LINKS_KEY, JSON.stringify(links));
}

function addLink(title, url, labelName) {
  if (!title || !url) throw new Error('Title and URL are required');
  if (!isValidUrl(url)) throw new Error('Invalid URL format');

  const links = getLinks();
  const link = {
    id: Utilities.getUuid(),
    title: title.trim(),
    url: url.trim(),
    label: labelName ? labelName.trim() : '',
    createdAt: new Date().toISOString()
  };
  links.unshift(link);
  if (links.length > MAX_LINKS) links.length = MAX_LINKS;
  saveLinks(links);
  return link;
}

function removeLink(id) {
  saveLinks(getLinks().filter(function(l) { return l.id !== id; }));
}

function getLinksByLabel(labelName) {
  return getLinks().filter(function(l) { return l.label === labelName; });
}

function getUnlabeledLinks() {
  return getLinks().filter(function(l) { return !l.label; });
}

// ---- Custom Label Categories (for Chat/Meet context) ----

function getCustomLabels() {
  const raw = PropertiesService.getUserProperties().getProperty(LABELS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveCustomLabels(labels) {
  PropertiesService.getUserProperties().setProperty(LABELS_KEY, JSON.stringify(labels));
}

function addCustomLabel(name, color) {
  const labels = getCustomLabels();
  if (labels.some(function(l) { return l.name === name; })) return null;
  const label = { name: name.trim(), color: color || '#4A90D9' };
  labels.push(label);
  saveCustomLabels(labels);
  return label;
}

function removeCustomLabel(name) {
  saveCustomLabels(getCustomLabels().filter(function(l) { return l.name !== name; }));
  // Also clear label from any links using it
  const links = getLinks().map(function(l) {
    if (l.label === name) l.label = '';
    return l;
  });
  saveLinks(links);
}

// ---- Gmail Label Helpers ----

function getGmailLabels() {
  try {
    return GmailApp.getUserLabels().map(function(l) {
      return { id: l.getName(), name: l.getName() };
    });
  } catch (e) {
    return [];
  }
}

function applyGmailLabel(threadId, labelName) {
  let label = GmailApp.getUserLabelByName(labelName);
  if (!label) label = GmailApp.createLabel(labelName);
  const thread = GmailApp.getThreadById(threadId);
  thread.addLabel(label);
}

function removeGmailLabel(threadId, labelName) {
  const label = GmailApp.getUserLabelByName(labelName);
  if (!label) return;
  GmailApp.getThreadById(threadId).removeLabel(label);
}

function createGmailLabel(labelName) {
  const existing = GmailApp.getUserLabelByName(labelName);
  if (existing) return existing;
  return GmailApp.createLabel(labelName);
}

function getThreadLabels(threadId) {
  return GmailApp.getThreadById(threadId).getLabels().map(function(l) {
    return l.getName();
  });
}

// ---- Validation ----

function isValidUrl(str) {
  try {
    const url = str.trim();
    return url.startsWith('http://') || url.startsWith('https://');
  } catch (e) {
    return false;
  }
}
