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
        `Official sender domains: ${rule.senderDomains.join(", ")}`,
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
})();
