(function initSite() {
  const menuButton = document.querySelector(".menu-button");
  const siteNav = document.querySelector("#site-nav");

  if (menuButton && siteNav) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      document.body.classList.toggle("nav-open", !isOpen);
    });
  }

  initInstallGuide();

  const categoryNames = {
    accounting: "Accounting",
    "banks-fr": "French banks",
    "banks-global": "Global banks",
    "big-tech": "Big tech",
    commerce: "Commerce",
    "consumer-credit-fr": "French credit providers",
    crypto: "Crypto",
    delivery: "Delivery",
    developer: "Developer platforms",
    events: "Events and tickets",
    forms: "Forms and scheduling",
    "government-fr": "French public services",
    "government-global": "Global public services",
    "health-fr": "Healthcare France",
    "hr-finance-ops": "HR and finance operations",
    "insurance-fr": "French insurance",
    "mail-providers": "Mail providers",
    "media-gaming": "Media and gaming",
    payments: "Payments",
    "site-builders": "Site builders",
    "telecom-utilities-fr": "French telecom and utilities",
    "telecom-utilities-global": "Global telecom and utilities",
    travel: "Travel"
  };

  const data = window.BYEBYEFISHING_RULES;
  const catalog = document.querySelector("[data-rules-catalog]");
  if (!data || !catalog) return;

  const searchInput = document.querySelector("[data-rule-search]");
  const categoryFilter = document.querySelector("[data-category-filter]");
  const countTarget = document.querySelector("[data-rule-count]");
  const versionTarget = document.querySelector("[data-rule-version]");

  if (countTarget) {
    countTarget.textContent = `${data.count} rules`;
  }

  if (versionTarget) {
    versionTarget.textContent = `Catalog version ${data.version}`;
  }

  if (categoryFilter) {
    const categories = [...new Set(data.rules.map((rule) => rule.category))].sort((a, b) => {
      return getCategoryLabel(a).localeCompare(getCategoryLabel(b));
    });

    for (const category of categories) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = getCategoryLabel(category);
      categoryFilter.append(option);
    }
  }

  function getCategoryLabel(category) {
    return categoryNames[category] || category.replaceAll("-", " ");
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function createTextElement(tagName, text, className) {
    const element = document.createElement(tagName);
    element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  function createRuleCard(rule) {
    const article = document.createElement("article");
    article.className = "catalog-card";

    const heading = document.createElement("div");
    heading.className = "catalog-card-heading";
    heading.append(createTextElement("h3", rule.name));
    heading.append(createTextElement("span", getCategoryLabel(rule.category)));
    article.append(heading);

    if (rule.aliases.length) {
      const aliases = createTextElement("p", `Aliases: ${rule.aliases.join(", ")}`, "catalog-aliases");
      article.append(aliases);
    }

    const domainList = document.createElement("ul");
    domainList.className = "domain-list";
    for (const domain of rule.allowedDomains) {
      const item = document.createElement("li");
      item.textContent = domain;
      domainList.append(item);
    }
    article.append(domainList);

    if (rule.senderDomains && rule.senderDomains.length) {
      const sender = createTextElement(
        "p",
        `Known sender domains: ${rule.senderDomains.join(", ")}`,
        "sender-domains"
      );
      article.append(sender);
    }

    return article;
  }

  function ruleMatches(rule, query, category) {
    if (category && rule.category !== category) return false;
    if (!query) return true;

    const haystack = [
      rule.name,
      rule.category,
      ...rule.aliases,
      ...rule.allowedDomains,
      ...(rule.senderDomains || [])
    ]
      .map(normalize)
      .join(" ");

    return haystack.includes(query);
  }

  function renderCatalog() {
    const query = normalize(searchInput ? searchInput.value.trim() : "");
    const category = categoryFilter ? categoryFilter.value : "";
    const matches = data.rules.filter((rule) => ruleMatches(rule, query, category));

    catalog.replaceChildren();

    if (!matches.length) {
      catalog.append(
        createTextElement(
          "p",
          "No rules match that search yet. Try a brand name, domain, or broader category.",
          "empty-state"
        )
      );
      return;
    }

    const fragment = document.createDocumentFragment();
    for (const rule of matches) {
      fragment.append(createRuleCard(rule));
    }
    catalog.append(fragment);
  }

  searchInput?.addEventListener("input", renderCatalog);
  categoryFilter?.addEventListener("change", renderCatalog);
  renderCatalog();

  function initInstallGuide() {
    const guide = document.querySelector("[data-install-guide]");
    const platformOptions = document.querySelector("#platform-options");
    const cards = [...document.querySelectorAll("[data-platform]")];
    if (!guide || !platformOptions || !cards.length) return;

    const platforms = {
      chrome: {
        kicker: "Chrome detected",
        title: "Install the Chrome package first.",
        copy:
          "Download the Chrome/Edge ZIP, unzip it, then load it from chrome://extensions with Developer mode enabled.",
        primaryText: "Download Chrome/Edge ZIP",
        primaryHref: "downloads/byebyefishing-0.1.0-chrome.zip",
        secondaryText: "Open Chrome steps",
        secondaryHref: "#platform-chrome"
      },
      edge: {
        kicker: "Edge detected",
        title: "Use the Chrome-compatible package for Edge.",
        copy:
          "Download the Chrome/Edge ZIP, unzip it, then load it from edge://extensions with Developer mode enabled.",
        primaryText: "Download Chrome/Edge ZIP",
        primaryHref: "downloads/byebyefishing-0.1.0-chrome.zip",
        secondaryText: "Open Edge steps",
        secondaryHref: "#platform-edge"
      },
      firefox: {
        kicker: "Firefox detected",
        title: "Install with the Firefox package.",
        copy:
          "Download the Firefox ZIP, unzip it, then load manifest.json from about:debugging while the store listing is pending.",
        primaryText: "Download Firefox ZIP",
        primaryHref: "downloads/byebyefishing-0.1.0-firefox-android.zip",
        secondaryText: "Open Firefox steps",
        secondaryHref: "#platform-firefox"
      },
      "firefox-android": {
        kicker: "Firefox Android detected",
        title: "Use Firefox webmail on Android.",
        copy:
          "Install Firefox for Android, add the extension from Mozilla Add-ons once approved, then open webmail in Firefox.",
        primaryText: "Download Firefox ZIP",
        primaryHref: "downloads/byebyefishing-0.1.0-firefox-android.zip",
        secondaryText: "Open Android steps",
        secondaryHref: "#platform-firefox-android"
      },
      safari: {
        kicker: "Safari detected",
        title: "Safari support uses an App Store wrapper.",
        copy:
          "Safari Web Extensions ship inside an app. Use the Safari steps below while the App Store release is prepared.",
        primaryText: "Open Safari steps",
        primaryHref: "#platform-safari",
        secondaryText: "Download Firefox ZIP",
        secondaryHref: "downloads/byebyefishing-0.1.0-firefox-android.zip"
      }
    };

    const fallback = {
      kicker: "Choose your browser",
      title: "Pick the browser you use for webmail.",
      copy:
        "Chrome, Edge, Firefox, Firefox Android, Safari, and source-build instructions are all available below.",
      primaryText: "Download Chrome/Edge ZIP",
      primaryHref: "downloads/byebyefishing-0.1.0-chrome.zip",
      secondaryText: "Download Firefox ZIP",
      secondaryHref: "downloads/byebyefishing-0.1.0-firefox-android.zip"
    };

    const detectedKey = detectBrowser();
    const config = platforms[detectedKey] || fallback;
    const detectedCard = detectedKey ? cards.find((card) => card.dataset.platform === detectedKey) : null;

    setText("[data-install-kicker]", config.kicker);
    setText("[data-install-title]", config.title);
    setText("[data-install-copy]", config.copy);
    setLink("[data-install-primary]", config.primaryText, config.primaryHref);
    setLink("[data-install-secondary]", config.secondaryText, config.secondaryHref);

    for (const card of cards) {
      const isMatch = card === detectedCard;
      card.toggleAttribute("open", isMatch);
      card.classList.toggle("is-detected", isMatch);
    }

    if (detectedCard && platformOptions.firstElementChild !== detectedCard) {
      platformOptions.prepend(detectedCard);
    }

    function setText(selector, text) {
      const element = guide.querySelector(selector);
      if (element) element.textContent = text;
    }

    function setLink(selector, text, href) {
      const element = guide.querySelector(selector);
      if (!element) return;
      element.textContent = text;
      element.setAttribute("href", href);
    }

    function detectBrowser() {
      const ua = navigator.userAgent || "";
      const brands = navigator.userAgentData?.brands || [];
      const brandNames = brands.map((brand) => brand.brand).join(" ");
      const source = `${ua} ${brandNames}`;

      if (/Firefox\/\d+/i.test(ua) && /Android/i.test(ua)) return "firefox-android";
      if (/FxiOS|Firefox\/\d+/i.test(ua)) return "firefox";
      if (/EdgA|EdgiOS|Edg\//i.test(ua) || /Microsoft Edge/i.test(brandNames)) return "edge";
      if (/CriOS|Chrome\/\d+|Chromium/i.test(source) && !/OPR\/|Opera|SamsungBrowser|Edg\//i.test(source)) {
        return "chrome";
      }
      if (/Safari/i.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|Edg/i.test(ua)) return "safari";
      return "";
    }
  }
})();
