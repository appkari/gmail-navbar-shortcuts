// background.js — toggles sidebar when browser_action button is clicked

browser.browserAction.onClicked.addListener(function() {
  browser.sidebarAction.toggle();
});
