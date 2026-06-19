function waitForElement(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}

function saveOptions() {
  var color = document.getElementById("color").value;
  var showTitles = document.getElementById("showTitles").checked;

  if (!color) color = defaultColor;

  var links = new Map();
  for (let i in iconNames) {
    var iconName = iconNames[i];
    links.set(iconName, {
      url: document.getElementById(iconName + "IconURL").value.trim(),
      title: document.getElementById(iconName + "IconTitle").value.trim(),
      show: document.getElementById(iconName + "IconShow").checked,
    });
  }
  let linksSerialMap = JSON.stringify(Array.from(links.entries()));

  browser.storage.sync.set(
    { color: color, showTitles: showTitles, links: linksSerialMap },
    () => {
      const status = document.getElementById("status");
      status.textContent = "Options saved.";
      setTimeout(() => {
        status.textContent = "";
      }, 750);
    }
  );
}

function restoreOptions() {
  browser.storage.sync.get(
    {
      color: defaultColor,
      showTitles: defaultShowTitles,
      links: JSON.stringify(Array.from(defaultLinksMap.entries())),
    },
    (items) => {
      document.getElementById("color").value = items.color;
      setColorBoxBackgroundColor();
      document.getElementById("showTitles").checked = items.showTitles;

      let linksMap = new Map(JSON.parse(items.links));

      for (let [name, link] of linksMap) {
        document.getElementById(name + "IconURL").value = link.url;
        document.getElementById(name + "IconTitle").value = link.title;
        document.getElementById(name + "IconShow").checked = link.show;
      }
    }
  );
}

function insertIconsOptions() {
  var iconsSubContainer = document.createElement("div");

  for (let i in iconNames) {
    const icon = iconNames[i];
    const div = document.createElement("div");
    let svgData = svgs[icon];

    svgData = svgData.replace("fill:#000000;", "fill:" + defaultColor);
    svgData = svgData.replace("<svg ", "<svg width='20px' ");
    div.innerHTML = `<div class="row">
      ${svgData}
      <input type="checkbox" name="${icon}IconShow" id="${icon}IconShow"/>
      <input type="text" name="${icon}IconURL" id="${icon}IconURL" class="urlTextbox" placeholder="url like https://mail.google.com/mail/u/0/#...">
      <input type="text" name="${icon}IconTitle" id="${icon}IconTitle" placeholder='Title'/>
    </div>
    `;

    iconsSubContainer.append(div);
  }

  waitForElement("#iconsContainer")
    .then((element) => {
      element.append(iconsSubContainer);
    })
    .catch((error) => {
      console.error("Error appending to element iconsContainer:", error);
    });
}

function resetOptions() {
  document.getElementById("color").value = defaultColor;
  document.getElementById("showTitles").checked = defaultShowTitles;

  for (let [name, link] of defaultLinksMap) {
    document.getElementById(name + "IconURL").value = link.url;
    document.getElementById(name + "IconTitle").value = link.title;
    document.getElementById(name + "IconShow").checked = link.show;
  }
}

function addListeners() {
  const elements = [
    { selector: "#save", event: "click", handler: saveOptions },
    { selector: "#reset", event: "click", handler: resetOptions },
    { selector: "#grey-box", event: "click", handler: () => setColor("#444746") },
    { selector: "#black-box", event: "click", handler: () => setColor("#000000") },
    { selector: "#white-box", event: "click", handler: () => setColor("#ffffff") },
    { selector: "#color", event: "change", handler: () => setColorBoxBackgroundColor() },
  ];

  elements.forEach(({ selector, event, handler }) => {
    waitForElement(selector)
      .then((element) => {
        element.addEventListener(event, handler);
      })
      .catch((error) => {
        console.error(`Error appending to element ${selector}:`, error);
      });
  });
}

function setColor(color) {
  waitForElement("#color").then((element) => {
    element.value = color;
    setColorBoxBackgroundColor();
  });
}

function setColorBoxBackgroundColor() {
  waitForElement("#color").then((element) => {
    element.style.backgroundColor = element.value;
  });
}

function createElements() {
  insertIconsOptions();
  restoreOptions();
  addListeners();
}

document.addEventListener("DOMContentLoaded", () => {
  createElements();
});
