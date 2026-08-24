(function initSite() {
  document.documentElement.classList.add("js");

  const menuButton = document.querySelector(".menu-button");
  const siteNav = document.querySelector("#site-nav");

  if (menuButton && siteNav) {
    const closeMenu = () => {
      menuButton.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    };

    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      document.body.classList.toggle("nav-open", !isOpen);
    });

    siteNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
        closeMenu();
        menuButton.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (
        document.body.classList.contains("nav-open") &&
        !siteNav.contains(event.target) &&
        !menuButton.contains(event.target)
      ) {
        closeMenu();
      }
    });

    const desktopNav = globalThis.matchMedia("(min-width: 761px)");
    const handleDesktopNav = (event) => {
      if (event.matches) closeMenu();
    };
    if (desktopNav.addEventListener) {
      desktopNav.addEventListener("change", handleDesktopNav);
    } else {
      desktopNav.addListener?.(handleDesktopNav);
    }
  }

  initInstallGuide();

  const categoryNames = {
    accounting: "Accounting",
    ai: "AI platforms",
    "banks-fr": "French banks",
    "banks-global": "Global banks",
    "big-tech": "Big tech",
    commerce: "Commerce",
    "consumer-credit-fr": "French credit providers",
    crypto: "Crypto",
    "data-analytics": "Data and analytics",
    delivery: "Delivery",
    developer: "Developer platforms",
    devices: "Devices and electronics",
    events: "Events and tickets",
    education: "Education",
    "food-local": "Food, grocery, and local services",
    forms: "Forms and scheduling",
    "government-fr": "French public services",
    "government-global": "Global public services",
    "health-fr": "Healthcare France",
    "health-global": "Global healthcare and insurance",
    "hr-finance-ops": "HR and finance operations",
    "insurance-fr": "French insurance",
    "jobs-real-estate": "Jobs and real estate",
    "mail-providers": "Mail providers",
    maps: "Maps",
    "media-gaming": "Media and gaming",
    "news-reference": "News and reference",
    payments: "Payments",
    "privacy-security": "Privacy, VPN, and security",
    "regional-social": "Regional portals and social",
    "sales-marketing": "Sales and marketing",
    "site-builders": "Site builders",
    "sports-entertainment": "Sports, tickets, and entertainment",
    "telecom-utilities-fr": "French telecom and utilities",
    "telecom-utilities-global": "Global telecom and utilities",
    "toll-roads-fr": "French toll roads",
    travel: "Travel",
    "weather-emergency": "Weather and emergency info",
    "workplace-saas": "Workplace SaaS"
  };

  const data = window.BYEBYEFISHING_RULES;
  const catalog = document.querySelector("[data-rules-catalog]");
  if (!data || !catalog) return;
  document.documentElement.classList.add("catalog-ready");

  const searchInput = document.querySelector("[data-rule-search]");
  const categoryFilter = document.querySelector("[data-category-filter]");
  const countTarget = document.querySelector("[data-rule-count]");
  const versionTarget = document.querySelector("[data-rule-version]");
  const resultsSummary = document.querySelector("[data-rule-results-summary]");
  const loadMoreButton = document.querySelector("[data-rule-load-more]");
  const RESULTS_PER_PAGE = 24;
  const indexedRules = data.rules.map((rule) => ({
    rule,
    searchText: [
      rule.name,
      rule.category,
      ...rule.aliases,
      ...rule.allowedDomains,
      ...(rule.senderDomains || []),
      ...(rule.brandLinkDomains || []),
      ...(rule.controlPlaneDomains || [])
    ]
      .map(normalize)
      .join(" ")
  }));
  let renderFrame = 0;
  let visibleRuleLimit = RESULTS_PER_PAGE;

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
        "catalog-domain-note"
      );
      article.append(sender);
    }

    if (rule.brandLinkDomains && rule.brandLinkDomains.length) {
      article.append(
        createTextElement(
          "p",
          `Additional known link domains: ${rule.brandLinkDomains.join(", ")}`,
          "catalog-domain-note"
        )
      );
    }

    if (rule.controlPlaneDomains && rule.controlPlaneDomains.length) {
      article.append(
        createTextElement(
          "p",
          `Exact trusted control domains: ${rule.controlPlaneDomains.join(", ")}`,
          "catalog-domain-note"
        )
      );
    }

    if (rule.hostedPlatform || rule.userContentPlatform) {
      article.append(
        createTextElement(
          "p",
          "Customer-created pages are checked as shared content, not treated as proof of the publisher.",
          "catalog-domain-note"
        )
      );
    }

    return article;
  }

  function ruleMatches(record, query, category) {
    const { rule, searchText } = record;
    if (category && rule.category !== category) return false;
    if (!query) return true;

    return searchText.includes(query);
  }

  function renderCatalog() {
    const query = normalize(searchInput ? searchInput.value.trim() : "");
    const category = categoryFilter ? categoryFilter.value : "";
    const matches = indexedRules
      .filter((record) => ruleMatches(record, query, category))
      .map((record) => record.rule);

    catalog.replaceChildren();

    if (!matches.length) {
      if (resultsSummary) resultsSummary.textContent = "No matching rules";
      if (loadMoreButton) loadMoreButton.hidden = true;
      catalog.append(
        createTextElement(
          "p",
          "No rules match that search yet. Try a brand name, domain, or broader category.",
          "empty-state"
        )
      );
      return;
    }

    const visibleRules = matches.slice(0, visibleRuleLimit);
    if (resultsSummary) {
      resultsSummary.textContent = visibleRules.length < matches.length
        ? `Showing ${visibleRules.length} of ${matches.length} matching rules`
        : `Showing ${matches.length} ${matches.length === 1 ? "rule" : "rules"}`;
    }
    if (loadMoreButton) {
      loadMoreButton.hidden = visibleRules.length >= matches.length;
    }

    const fragment = document.createDocumentFragment();
    for (const rule of visibleRules) {
      fragment.append(createRuleCard(rule));
    }
    catalog.append(fragment);
  }

  function scheduleRenderCatalog() {
    if (renderFrame) {
      cancelAnimationFrame(renderFrame);
    }
    renderFrame = requestAnimationFrame(() => {
      renderFrame = 0;
      renderCatalog();
    });
  }

  function resetCatalogView() {
    visibleRuleLimit = RESULTS_PER_PAGE;
    scheduleRenderCatalog();
  }

  searchInput?.addEventListener("input", resetCatalogView);
  categoryFilter?.addEventListener("change", resetCatalogView);
  loadMoreButton?.addEventListener("click", () => {
    visibleRuleLimit += RESULTS_PER_PAGE;
    renderCatalog();
  });
  renderCatalog();

  function initInstallGuide() {
    const guide = document.querySelector("[data-install-guide]");
    const platformOptions = document.querySelector("#platform-options");
    const cards = [...document.querySelectorAll("[data-platform]")];
    if (!guide || !platformOptions || !cards.length) return;

    const platforms = {
      chrome: {
        kicker: "Chrome detected",
        title: "Test the Chrome build locally.",
        copy:
          "Download the Chrome/Edge ZIP, unzip it, then load it from chrome://extensions with Developer mode enabled.",
        primaryText: "Download Chrome/Edge ZIP",
        primaryHref: "downloads/byebyefishing-0.1.0-chrome.zip?v=7c02ed60f0",
        secondaryText: "Open Chrome steps",
        secondaryHref: "#platform-chrome"
      },
      edge: {
        kicker: "Edge detected",
        title: "Test the Chrome-compatible Edge build.",
        copy:
          "Download the Chrome/Edge ZIP, unzip it, then load it from edge://extensions with Developer mode enabled.",
        primaryText: "Download Chrome/Edge ZIP",
        primaryHref: "downloads/byebyefishing-0.1.0-chrome.zip?v=7c02ed60f0",
        secondaryText: "Open Edge steps",
        secondaryHref: "#platform-edge"
      },
      firefox: {
        kicker: "Firefox detected",
        title: "Test the Firefox build locally.",
        copy:
          "Download the Firefox ZIP, unzip it, then load manifest.json from about:debugging while the store listing is pending.",
        primaryText: "Download Firefox ZIP",
        primaryHref: "downloads/byebyefishing-0.1.0-firefox-android.zip?v=598781f8b9",
        secondaryText: "Open Firefox steps",
        secondaryHref: "#platform-firefox"
      },
      "firefox-android": {
        kicker: "Firefox Android detected",
        title: "Install from Mozilla Add-ons when approved.",
        copy:
          "The ZIP is for source review and developer testing, not normal Android installation. Use the Mozilla Add-ons listing once it is approved.",
        primaryText: "Open Android steps",
        primaryHref: "#platform-firefox-android",
        secondaryText: "Developer testing ZIP",
        secondaryHref: "downloads/byebyefishing-0.1.0-firefox-android.zip?v=598781f8b9"
      },
      safari: {
        kicker: "Safari detected",
        title: "Safari support is not released yet.",
        copy:
          "Safari Web Extensions ship inside an app. Use the Safari steps below while the App Store release is prepared.",
        primaryText: "Open Safari steps",
        primaryHref: "#platform-safari",
        secondaryText: "See supported webmail",
        secondaryHref: "#supported-webmail"
      },
      ios: {
        kicker: "iPhone or iPad detected",
        title: "The iOS release is not available yet.",
        copy:
          "Every iOS browser uses the same App Store extension path. Review the Safari steps while that release is prepared.",
        primaryText: "Open iPhone and iPad steps",
        primaryHref: "#platform-safari",
        secondaryText: "See supported webmail",
        secondaryHref: "#supported-webmail"
      },
      mobile: {
        kicker: "Android browser detected",
        title: "The Android store release is still pending.",
        copy:
          "Chrome and Edge on Android cannot load the desktop ZIP. Review the Firefox Android path instead.",
        primaryText: "Open Firefox Android steps",
        primaryHref: "#platform-firefox-android",
        secondaryText: "See supported webmail",
        secondaryHref: "#supported-webmail"
      }
    };

    const fallback = {
      kicker: "Desktop developer preview",
      title: "Choose the browser you use for webmail.",
      copy:
        "Chrome, Edge, Firefox, Firefox Android, Safari, and source-build instructions are all available below.",
      primaryText: "Download Chrome/Edge ZIP",
      primaryHref: "downloads/byebyefishing-0.1.0-chrome.zip?v=7c02ed60f0",
      secondaryText: "Firefox testing ZIP",
      secondaryHref: "downloads/byebyefishing-0.1.0-firefox-android.zip?v=598781f8b9"
    };

    const detectedKey = detectBrowser();
    const config = platforms[detectedKey] || fallback;
    const detectedPlatform = detectedKey === "ios" ? "safari" : detectedKey;
    const detectedCard = detectedPlatform
      ? cards.find((card) => card.dataset.platform === detectedPlatform)
      : null;

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

    function revealPlatform(hash = globalThis.location.hash) {
      if (!hash.startsWith("#platform-")) return;
      const target = document.getElementById(hash.slice(1));
      if (!(target instanceof HTMLDetailsElement)) return;
      target.open = true;
      requestAnimationFrame(() => target.querySelector("summary")?.focus({ preventScroll: true }));
    }

    document.addEventListener("click", (event) => {
      const link = event.target.closest?.('a[href^="#platform-"]');
      if (link) setTimeout(() => revealPlatform(link.hash), 0);
    });
    globalThis.addEventListener("hashchange", () => revealPlatform());
    revealPlatform();

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
      const isAndroid = /Android/i.test(ua);
      const isIOS = /iPhone|iPad|iPod/i.test(ua) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

      if (isIOS) return "ios";
      if (/Firefox\/\d+/i.test(ua) && isAndroid) return "firefox-android";
      if (isAndroid) return "mobile";
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
