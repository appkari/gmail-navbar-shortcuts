observeDOMChanges();

function observeDOMChanges() {
  let observer = new MutationObserver(() => {
    if (document.readyState === "complete") {
      runOnDomComplete();
      observer.disconnect();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  if (document.readyState === "complete") {
    runOnDomComplete();
  } else {
    window.addEventListener("load", runOnDomComplete);
  }
}

var alreadyRun = false;
function runOnDomComplete() {
  if (alreadyRun === true) return;
  alreadyRun = true;
  getOptionsAndNavbarUpdate();
}

var getElementByXPath = function (xPath) {
  var xPathResult = document.evaluate(
    xPath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );
  return xPathResult.singleNodeValue;
};

async function getOptionsAndNavbarUpdate() {
  browser.storage.sync.get(
    {
      color: defaultColor,
      showTitles: defaultShowTitles,
      links: JSON.stringify(Array.from(defaultLinksMap.entries())),
    },
    (items) => {
      const color = items.color;
      const showTitles = items.showTitles;
      const linksMap = new Map(JSON.parse(items.links));
      navbarUpdate(color, showTitles, linksMap);
    }
  );
}

function getNavbar() {
  const xPaths = [
    "//*[normalize-space(.) = 'Mail']/ancestor::div[2]",
    "//*[normalize-space(.) = 'Mail']/ancestor::div[1]",
    "//*[normalize-space(.) = 'Mail']/ancestor::div[3]",
    "/html/body/div[7]/div[3]/div/div[2]/div[1]",
    "/html/body/div[8]/div[3]/div/div[2]/div[1]",
    "/html/body/div[6]/div[3]/div/div[2]/div[1]",
    "/html/body/div[9]/div[3]/div/div[2]/div[1]",
  ];

  for (let xpath of xPaths) {
    let navbar = getElementByXPath(xpath);
    if (navbar) {
      return navbar;
    }
  }

  return undefined;
}

function createDivider() {
  const divider = document.createElement("div");
  divider.classList.add("divider");
  return divider;
}

function createLinkElement(name, link, color, showTitles) {
  const div = document.createElement("div");
  let svg = svgs[name];
  if (!svg) {
    return null;
  }

  svg = svg.replace("fill:#000000;", `fill:${color}`);
  let s = `
    <div class='icon-wrapper'>
      <a href='${link.url}'>${svg}</a>
    </div>`;

  if (showTitles && link.title.trim() !== "") {
    s += `
    <div class='title-wrapper'>
      <a href='${link.url}' style='text-decoration:none;'>
        <span style='font-size:12px;color:${color};'>
          ${link.title}
        </span>
      </a>
    </div>`;
  }
  div.innerHTML = s;
  div.classList.add("link-wrapper");

  return div;
}

async function navbarUpdate(color, showTitles, links) {
  const navbar = getNavbar();
  if (!navbar) {
    return;
  }

  navbar.appendChild(createDivider());

  for (let [name, link] of links) {
    if (!link || !link.url || !link.show) continue;

    const linkElement = createLinkElement(name, link, color, showTitles);
    if (linkElement) {
      navbar.appendChild(linkElement);
    }
  }
}
