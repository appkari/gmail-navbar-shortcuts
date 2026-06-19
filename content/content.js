// content.js — injects a floating "Shortcuts" button into Gmail, Chat, and Meet

(function() {
  'use strict';

  const BTN_ID = 'gns-fab';

  function getHostApp() {
    const h = location.hostname;
    if (h === 'mail.google.com') return 'gmail';
    if (h === 'chat.google.com') return 'chat';
    if (h === 'meet.google.com') return 'meet';
    return null;
  }

  function injectFab() {
    if (document.getElementById(BTN_ID)) return;

    const fab = document.createElement('button');
    fab.id = BTN_ID;
    fab.title = 'Gmail Shortcuts (Ctrl+Shift+Y)';
    fab.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>' +
      '<line x1="7" y1="7" x2="7.01" y2="7"/>' +
      '</svg>';

    fab.addEventListener('click', function() {
      browser.runtime.sendMessage({ action: 'toggle-sidebar' });
    });

    document.body.appendChild(fab);
  }

  // Wait for body to be ready
  if (document.body) {
    injectFab();
  } else {
    document.addEventListener('DOMContentLoaded', injectFab);
  }

  // Re-inject after SPA navigations (Gmail, Chat are SPAs)
  let lastUrl = location.href;
  const observer = new MutationObserver(function() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (!document.getElementById(BTN_ID)) injectFab();
    }
  });
  observer.observe(document.documentElement, { subtree: true, childList: true });
})();
