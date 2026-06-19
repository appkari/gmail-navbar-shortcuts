// navbar-shortcuts.js
// Adds Alt+1 through Alt+9 shortcuts to Gmail's left navigation bar items.
// Visual badges overlay each item; pressing Alt+N clicks item N.

(function () {
  'use strict';

  if (location.hostname !== 'mail.google.com') return;

  const BADGE_CLASS = 'gns-nb';

  // Gmail changes its DOM frequently; try selectors in order, use the first
  // that yields at least 3 visible items.
  const SELECTORS = [
    '[role="navigation"] [role="treeitem"]',
    '[role="navigation"] li[role="listitem"]',
    '[role="navigation"] li',
    '.TO',   // Gmail's semi-stable internal class for nav rows
  ];

  function getNavItems() {
    for (const sel of SELECTORS) {
      try {
        const els = Array.from(document.querySelectorAll(sel)).filter(el => {
          const r = el.getBoundingClientRect();
          return r.height > 4 && r.width > 4 && el.textContent.trim();
        });
        if (els.length >= 3) return els;
      } catch (_) {}
    }
    return [];
  }

  // ---- Badge rendering ----

  function removeBadges() {
    document.querySelectorAll('.' + BADGE_CLASS).forEach(b => b.remove());
  }

  let observerPaused = false;

  function applyBadges() {
    observerPaused = true;
    removeBadges();
    const items = getNavItems();
    items.slice(0, 9).forEach((item, idx) => {
      const badge = document.createElement('span');
      badge.className = BADGE_CLASS;
      badge.textContent = idx + 1;
      badge.title = 'Alt+' + (idx + 1);
      item.appendChild(badge);
    });
    observerPaused = false;
  }

  // ---- Keyboard handler ----

  function handleKeydown(e) {
    if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

    // Use e.code so Alt+1 works on macOS (where e.key becomes '¡' etc.)
    const match = e.code && e.code.match(/^Digit([1-9])$/);
    if (!match) return;
    const n = parseInt(match[1], 10);

    const ae = document.activeElement;
    if (ae && (
      ae.tagName === 'INPUT' ||
      ae.tagName === 'TEXTAREA' ||
      ae.isContentEditable ||
      ae.getAttribute('role') === 'textbox' ||
      ae.getAttribute('contenteditable') === 'true'
    )) return;

    e.preventDefault();
    e.stopPropagation();

    const items = getNavItems();
    const target = items[n - 1];
    if (!target) return;

    const link = target.querySelector('a[href]') ||
                 target.querySelector('[role="link"]') ||
                 target;
    link.click();
    link.focus();
  }

  // ---- Scheduling ----

  let applyTimer = null;
  function scheduleBadges(delay) {
    clearTimeout(applyTimer);
    applyTimer = setTimeout(applyBadges, delay);
  }

  // ---- MutationObserver ----
  // Gmail is a heavy SPA; re-apply badges whenever its nav DOM changes.

  const observer = new MutationObserver(() => {
    if (observerPaused) return;
    if (!document.querySelector('.' + BADGE_CLASS)) {
      scheduleBadges(400);
    }
  });

  // ---- Init ----

  function init() {
    document.addEventListener('keydown', handleKeydown, true);
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });
    scheduleBadges(2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
