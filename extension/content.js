(function cortexRateBootstrap() {
  console.log("CortexRate content script loaded");

  const extensionConfig = globalThis.CORTEXRATE_EXTENSION_CONFIG;

  if (!extensionConfig?.baseUrl) {
    console.error("CortexRate extension config missing baseUrl");
    return;
  }

  const BADGE_ID = "cortexrate-extension-badge";
  const API_BASE_URL = extensionConfig.baseUrl;
  const RETRY_DELAY_MS = 800;
  const INITIAL_RETRY_DELAYS_MS = [250, 500, 800, 1200, 1800];

  let lastResolvedFingerprint = null;
  let pendingFingerprint = null;
  let scheduledRun = null;
  let linkedCanonicalItemId = null;
  let unresolvedObservedIdentityId = null;
  let currentUrl = window.location.href;
  let retryAttempt = 0;
  let lastStableBadgeState = null;

  const titleSelectors = [
    "main h1",
    "h1",
    "[data-testid*='title']",
    "[class*='title']",
    "[class*='name']",
    "main *"
  ];

  const creatorSelectors = [
    "[data-testid*='creator']",
    "[aria-label*='creator' i]",
    "[class*='creator']",
    "[class*='author']",
    "[class*='artist']",
    "[class*='name']",
    "a",
    "p",
    "span",
    "div"
  ];

  const typeSelectors = [
    "[data-testid*='type']",
    "[aria-label*='type' i]",
    "[class*='type']",
    "main",
    "body"
  ];

  const NOISE_PATTERNS = [
    /\blog(?:\s|-)?in\b/i,
    /\bsign(?:\s|-)?in\b/i,
    /\bsign(?:\s|-)?up\b/i,
    /\bsearch\b/i,
    /\bfilter\b/i,
    /\bmenu\b/i,
    /\bhome\b/i,
    /\bsettings\b/i,
    /\bprofile\b/i,
    /\blibrary\b/i,
    /\bnotification\b/i,
    /\baccount\b/i,
    /\bshare\b/i,
    /\bdownload\b/i,
    /\bupload\b/i,
    /\bdelete\b/i,
    /\bedit\b/i,
    /\bsave\b/i,
    /\bcortexrate\b/i
  ];

  const NON_CREATOR_PATTERNS = [
    /\bdownload(?:ed)?\b/i,
    /\bshare\b/i,
    /\bcapture type\b/i,
    /\bpreferred instrument\b/i,
    /\bgain\b/i,
    /\bcreated on\b/i,
    /\bupdated on\b/i,
    /\bamp\b/i,
    /\bguitar\b/i,
    /\bbass\b/i
  ];

  function isVisible(element) {
    if (!element) return false;

    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  function getCleanText(element) {
    if (!element || !isVisible(element)) {
      return null;
    }

    const text = element.textContent?.trim().replace(/\s+/g, " ");
    return text ? text : null;
  }

  function isLikelyNoise(text) {
    return NOISE_PATTERNS.some((pattern) => pattern.test(text));
  }

  function isBlockedCreatorLabel(text) {
    const collapsed = text.toLowerCase().replace(/\s+/g, "");

    return (
      NON_CREATOR_PATTERNS.some((pattern) => pattern.test(text)) ||
      collapsed.includes("download") ||
      collapsed.includes("share")
    );
  }

  function isPlausibleContentText(text) {
    if (!text) return false;
    if (text.length < 3 || text.length > 80) return false;
    if (isLikelyNoise(text)) return false;
    if (/^[0-9\s/|:.,-]+$/.test(text)) return false;
    return true;
  }

  function scoreTitleText(text, element) {
    let score = 0;

    if (!isPlausibleContentText(text)) {
      return -1;
    }

    score += Math.min(text.length, 40);

    if (/^[A-Z0-9][\w\s'&().,+-]+$/i.test(text)) {
      score += 10;
    }

    if (element.matches("h1")) {
      score += 50;
    }

    if (element.matches("[class*='title'], [class*='name'], [data-testid*='title']")) {
      score += 30;
    }

    if (element.closest("main")) {
      score += 15;
    }

    if (element.children.length === 0) {
      score += 10;
    }

    if (/^(by|creator\s*:)/i.test(text)) {
      score -= 40;
    }

    return score;
  }

  function queryAllInScope(scopeRoot, selector) {
    if (!scopeRoot || scopeRoot === document) {
      return Array.from(document.querySelectorAll(selector));
    }

    const matches = [];

    if (scopeRoot instanceof Element && scopeRoot.matches(selector)) {
      matches.push(scopeRoot);
    }

    matches.push(...scopeRoot.querySelectorAll(selector));

    return matches;
  }

  function getCloseButtonScore(container) {
    const closeSelectors = [
      "[aria-label*='close' i]",
      "[title*='close' i]",
      "button"
    ];

    for (const selector of closeSelectors) {
      const elements = queryAllInScope(container, selector);

      for (const element of elements) {
        const text = getCleanText(element);
        const ariaLabel = element.getAttribute?.("aria-label");
        const title = element.getAttribute?.("title");

        if (
          /close/i.test(ariaLabel || "") ||
          /close/i.test(title || "") ||
          text === "×" ||
          text === "✕" ||
          text === "x" ||
          text === "X"
        ) {
          return 45;
        }
      }
    }

    return 0;
  }

  function scoreDetailContainer(container) {
    if (!(container instanceof Element) || !isVisible(container)) {
      return -1;
    }

    const rect = container.getBoundingClientRect();

    if (rect.width < 320 || rect.height < 220) {
      return -1;
    }

    let score = 0;
    const style = window.getComputedStyle(container);
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    const containerCenterX = rect.left + rect.width / 2;
    const containerCenterY = rect.top + rect.height / 2;
    const centerDistance =
      Math.abs(viewportCenterX - containerCenterX) + Math.abs(viewportCenterY - containerCenterY);

    if (style.position === "fixed") {
      score += 55;
    } else if (style.position === "absolute" || style.position === "sticky") {
      score += 25;
    }

    if (rect.left >= 0 && rect.top >= 0 && rect.right <= window.innerWidth && rect.bottom <= window.innerHeight) {
      score += 10;
    }

    score += Math.max(0, 260 - centerDistance / 4);
    score += getCloseButtonScore(container);

    const containerText = getCleanText(container) || "";

    if (/\bdownload(?:ed)?\b/i.test(containerText)) {
      score += 12;
    }

    if (/\bshare\b/i.test(containerText)) {
      score += 12;
    }

    if (/\bpreset devices\b/i.test(containerText) || /\bscenes\b/i.test(containerText)) {
      score += 15;
    }

    if (/\bcapture type\b/i.test(containerText) || /\bpreferred instrument\b/i.test(containerText)) {
      score += 15;
    }

    if (queryAllInScope(container, "h1,[class*='title'],[class*='name'],[data-testid*='title']").length > 0) {
      score += 20;
    }

    return score;
  }

  function getActiveDetailContainer() {
    if (!isSupportedDetailPage()) {
      return document;
    }

    const candidateElements = [];
    const seenElements = new Set();

    function pushCandidate(element) {
      if (!(element instanceof Element) || seenElements.has(element)) {
        return;
      }

      seenElements.add(element);
      candidateElements.push(element);
    }

    const centerElement = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);

    let currentElement = centerElement;
    while (currentElement instanceof Element && currentElement !== document.body) {
      pushCandidate(currentElement);
      currentElement = currentElement.parentElement;
    }

    const detailContainerSelectors = [
      "[role='dialog']",
      "[aria-modal='true']",
      "[class*='modal']",
      "[class*='dialog']",
      "[class*='overlay']",
      "[class*='drawer']",
      "[class*='sheet']",
      "main section",
      "main article",
      "main > div",
      "body > div"
    ];

    for (const selector of detailContainerSelectors) {
      document.querySelectorAll(selector).forEach((element) => {
        pushCandidate(element);
      });
    }

    let bestMatch = null;

    for (const element of candidateElements) {
      const score = scoreDetailContainer(element);

      if (score > (bestMatch?.score ?? -1)) {
        bestMatch = { element, score };
      }
    }

    if (bestMatch && bestMatch.score > 80) {
      return bestMatch.element;
    }

    return document.querySelector("main") || document;
  }

  function findFirstTextCandidate(selectors, scopeRoot = document) {
    let bestMatch = null;

    for (const selector of selectors) {
      const elements = queryAllInScope(scopeRoot, selector);

      for (const element of elements) {
        const text = getCleanText(element);
        const score = scoreTitleText(text, element);

        if (score > (bestMatch?.score ?? -1)) {
          bestMatch = { text, score, element };
        }
      }
    }

    return bestMatch?.score > 0 ? bestMatch : null;
  }

  function findFirstText(selectors, scopeRoot = document) {
    return findFirstTextCandidate(selectors, scopeRoot)?.text ?? null;
  }

  function normalizeCandidateName(value) {
    const text = value?.trim().replace(/\s+/g, " ");

    if (!text || text.length < 3 || text.length > 50) {
      return null;
    }

    if (isLikelyNoise(text)) {
      return null;
    }

    if (isBlockedCreatorLabel(text)) {
      return null;
    }

    if (!/^[A-Za-z0-9][A-Za-z0-9 '&().,+-]*$/.test(text)) {
      return null;
    }

    return text;
  }

  function isLikelySimpleName(text) {
    if (!text) return false;

    if (!/^[A-Z][A-Za-z0-9'&.+-]*(?:\s+[A-Z][A-Za-z0-9'&.+-]*){0,3}$/.test(text)) {
      return false;
    }

    return text.length >= 4 && text.length <= 40;
  }

  function isLikelyGearModelLabel(text) {
    if (!text) return false;

    const normalized = text.startsWith("@") ? text.slice(1) : text;

    if (normalized.includes(" ")) {
      return false;
    }

    return (
      normalized.length >= 3 &&
      normalized.length <= 16 &&
      /^[A-Z0-9-]+$/.test(normalized) &&
      /[0-9]/.test(normalized)
    );
  }

  function isLikelyProfileName(text) {
    if (!text) return false;

    const normalized = text.startsWith("@") ? text.slice(1) : text;

    if (normalized.length < 6 || normalized.length > 40) {
      return false;
    }

    if (normalized.includes(" ")) {
      return false;
    }

    if (!/^[A-Za-z][A-Za-z0-9.-]*$/.test(normalized)) {
      return false;
    }

    if (isBlockedCreatorLabel(normalized) || isLikelyGearModelLabel(normalized)) {
      return false;
    }

    return /^[A-Z][a-z0-9]+(?:[A-Z][A-Za-z0-9]+)+$/.test(normalized);
  }

  function isLikelyHandleName(text) {
    if (!text) return false;

    const normalized = text.startsWith("@") ? text.slice(1) : text;
    const excludedValues = new Set([
      "amp",
      "capture",
      "preset",
      "guitar",
      "bass",
      "downloaded",
      "share"
    ]);

    if (normalized.length < 3 || normalized.length > 32) {
      return false;
    }

    if (!/^[A-Za-z0-9._-]+$/.test(normalized)) {
      return false;
    }

    if (!/[A-Za-z]/.test(normalized)) {
      return false;
    }

    if (excludedValues.has(normalized.toLowerCase())) {
      return false;
    }

    if (isLikelyGearModelLabel(normalized)) {
      return false;
    }

    return /[0-9._-]/.test(normalized) || /^[a-z]/.test(normalized);
  }

  function getTitleContainer(titleElement) {
    if (!titleElement) {
      return null;
    }

    return (
      titleElement.closest("article") ||
      titleElement.closest("section") ||
      titleElement.closest("[class*='card']") ||
      titleElement.closest("[class*='item']") ||
      titleElement.closest("[class*='container']") ||
      titleElement.parentElement
    );
  }

  function findCreatorTextInElements(elements) {
    let fallbackName = null;
    let fallbackProfileName = null;
    let fallbackHandle = null;

    for (const element of elements) {
      const text = getCleanText(element);

      if (!text) continue;

      const byMatch = text.match(/^by\s+(.+)$/i);
      if (byMatch?.[1]) {
        const candidate = normalizeCandidateName(byMatch[1]);
        if (candidate) return candidate;
      }

      const creatorMatch = text.match(/^creator\s*:\s*(.+)$/i);
      if (creatorMatch?.[1]) {
        const candidate = normalizeCandidateName(creatorMatch[1]);
        if (candidate) return candidate;
      }

      const normalizedText = normalizeCandidateName(text);

      if (!fallbackProfileName && normalizedText && isLikelyProfileName(normalizedText)) {
        fallbackProfileName = normalizedText;
      }

      if (!fallbackHandle && normalizedText && isLikelyHandleName(normalizedText)) {
        fallbackHandle = normalizedText;
      }

      if (!fallbackName && normalizedText && isLikelySimpleName(normalizedText)) {
        fallbackName = normalizedText;
      }
    }

    return fallbackProfileName ?? fallbackHandle ?? fallbackName;
  }

  function findCreatorTextDirectlyBelowTitle(titleElement, titleBlock) {
    const candidateElements = [];
    const seenElements = new Set();

    function pushCandidate(element) {
      if (!element || seenElements.has(element)) {
        return;
      }

      seenElements.add(element);
      candidateElements.push(element);
    }

    if (titleElement.nextElementSibling) {
      pushCandidate(titleElement.nextElementSibling);

      for (const selector of creatorSelectors) {
        titleElement.nextElementSibling.querySelectorAll(selector).forEach((element) => {
          pushCandidate(element);
        });
      }
    }

    if (titleBlock) {
      const children = Array.from(titleBlock.children);
      const titleIndex = children.indexOf(titleElement);

      if (titleIndex >= 0) {
        children.slice(titleIndex + 1).forEach((child) => {
          pushCandidate(child);

          for (const selector of creatorSelectors) {
            child.querySelectorAll(selector).forEach((element) => {
              pushCandidate(element);
            });
          }
        });
      }
    }

    return findCreatorTextInElements(candidateElements);
  }

  function findCreatorText(titleElement) {
    if (!titleElement) {
      return null;
    }

    const titleBlock = titleElement.parentElement;
    const titleContainer = getTitleContainer(titleElement);

    if (!titleContainer) {
      return null;
    }

    const directCreator = findCreatorTextDirectlyBelowTitle(titleElement, titleBlock);

    if (directCreator) {
      return directCreator;
    }

    const candidateElements = [];
    const seenElements = new Set();

    function pushCandidate(element) {
      if (!element || seenElements.has(element)) {
        return;
      }

      seenElements.add(element);
      candidateElements.push(element);
    }

    if (titleElement.previousElementSibling) {
      pushCandidate(titleElement.previousElementSibling);
    }

    if (titleBlock) {
      for (const selector of creatorSelectors) {
        titleBlock.querySelectorAll(selector).forEach((element) => {
          pushCandidate(element);
        });
      }
    }

    if (titleBlock?.nextElementSibling) {
      pushCandidate(titleBlock.nextElementSibling);
    }

    if (titleBlock?.previousElementSibling) {
      pushCandidate(titleBlock.previousElementSibling);
    }

    for (const selector of creatorSelectors) {
      titleContainer.querySelectorAll(selector).forEach((element) => {
        pushCandidate(element);
      });
    }

    return findCreatorTextInElements(candidateElements);
  }

  function detectTypeFromText(text) {
    if (!text) {
      return null;
    }

    if (/\bcaptures?\b/i.test(text) && !/\bpresets?\b/i.test(text)) {
      return "capture";
    }

    if (/\bpresets?\b/i.test(text) && !/\bcaptures?\b/i.test(text)) {
      return "preset";
    }

    return null;
  }

  function detectTypeFromPathname(pathname) {
    if (!pathname) {
      return null;
    }

    if (/\/cloud\/(?:[^/]+\/)*neural-capture\/view\/[^/]+/i.test(pathname)) {
      return "capture";
    }

    if (
      /\/cloud\/(?:[^/]+\/)*presets?(?:\/|$)/i.test(pathname) ||
      /\/presets?(?:\/|$)/i.test(pathname)
    ) {
      return "preset";
    }

    if (
      /\/cloud\/(?:[^/]+\/)*captures?(?:\/|$)/i.test(pathname) ||
      /\/captures?(?:\/|$)/i.test(pathname)
    ) {
      return "capture";
    }

    return null;
  }

  function findNearbyTypeText(titleText, creatorText) {
    const anchors = [titleText, creatorText].filter(Boolean);

    for (const anchorText of anchors) {
      const anchorElements = Array.from(document.querySelectorAll("main *, body *")).filter(
        (element) => getCleanText(element) === anchorText
      );

      for (const element of anchorElements) {
        const candidateElements = [
          element,
          element.parentElement,
          element.closest("article"),
          element.closest("section"),
          element.closest("[class*='card']"),
          element.closest("[class*='item']"),
          element.closest("[class*='preset']"),
          element.closest("[class*='capture']")
        ].filter(Boolean);

        for (const candidateElement of candidateElements) {
          const candidateText = getCleanText(candidateElement);

          if (!candidateText) continue;

          const candidateType = detectTypeFromText(candidateText);
          if (candidateType) {
            return candidateType;
          }
        }
      }
    }

    return null;
  }

  function findItemType(titleText, creatorText) {
    const pathname = window.location.pathname;
    const pathnameType = detectTypeFromPathname(pathname);
    if (pathnameType) {
      return pathnameType;
    }

    const titleType = detectTypeFromText(titleText);
    if (titleType) {
      return titleType;
    }

    const nearbyType = findNearbyTypeText(titleText, creatorText);
    if (nearbyType) {
      return nearbyType;
    }

    for (const selector of typeSelectors) {
      const elements = document.querySelectorAll(selector);

      for (const element of elements) {
        const text = getCleanText(element);

        if (!text) continue;

        const domType = detectTypeFromText(text);
        if (domType) {
          return domType;
        }
      }
    }

    return null;
  }

  function scrapeIdentity() {
    const scopeRoot = getActiveDetailContainer();
    const titleCandidate = findFirstTextCandidate(titleSelectors, scopeRoot);
    const title = titleCandidate?.text ?? null;
    const creator = findCreatorText(titleCandidate?.element ?? null);
    const type = findItemType(title, creator);

    console.log("CortexRate scrape result", { title, creator, type });

    if (!title || !creator || !type) {
      console.log("CortexRate scrape incomplete, skipping request", {
        title,
        creator,
        type
      });
      return null;
    }

    return { title, creator, type };
  }

  function buildFingerprint(identity) {
    return `${identity.type}::${identity.title.toLowerCase()}::${identity.creator.toLowerCase()}`;
  }

  function isSupportedDetailPage() {
    const pathname = window.location.pathname;
    const isPresetDetail = /\/cloud\/(?:[^/]+\/)*preset\/view\/[^/]+/i.test(pathname);
    const isCaptureDetail =
      /\/cloud\/(?:[^/]+\/)*capture\/view\/[^/]+/i.test(pathname) ||
      /\/cloud\/(?:[^/]+\/)*neural-capture\/view\/[^/]+/i.test(pathname);

    return isPresetDetail || isCaptureDetail;
  }

  function resetResolutionStateForUrlChange(nextUrl) {
    console.log("CortexRate resetting state for URL change", {
      previousUrl: currentUrl,
      nextUrl
    });

    currentUrl = nextUrl;
    lastResolvedFingerprint = null;
    pendingFingerprint = null;
    linkedCanonicalItemId = null;
    unresolvedObservedIdentityId = null;
    retryAttempt = 0;
    lastStableBadgeState = null;
  }

  function removeBadge() {
    const badge = document.getElementById(BADGE_ID);

    if (badge) {
      badge.remove();
      console.log("CortexRate badge removed on non-detail page");
    }
  }

  function isCortexRateOwnedNode(node) {
    if (!node) {
      return false;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      return isCortexRateOwnedNode(node.parentElement);
    }

    if (!(node instanceof Element)) {
      return false;
    }

    return node.id === BADGE_ID || Boolean(node.closest(`#${BADGE_ID}`));
  }

  function isCortexRateOwnedMutation(mutation) {
    if (mutation.type === "characterData") {
      return isCortexRateOwnedNode(mutation.target);
    }

    if (mutation.type === "attributes") {
      return isCortexRateOwnedNode(mutation.target);
    }

    const changedNodes = [...mutation.addedNodes, ...mutation.removedNodes];

    if (!changedNodes.length) {
      return isCortexRateOwnedNode(mutation.target);
    }

    return changedNodes.every((node) => isCortexRateOwnedNode(node));
  }

  function shouldIgnoreObserverMutations(mutations) {
    return mutations.length > 0 && mutations.every((mutation) => isCortexRateOwnedMutation(mutation));
  }

  function openBadgeTarget() {
    if (linkedCanonicalItemId) {
      window.open(`${API_BASE_URL}/items/${linkedCanonicalItemId}`, "_blank", "noopener,noreferrer");
      return;
    }

    if (unresolvedObservedIdentityId) {
      window.open(
        `${API_BASE_URL}/claim/observed/${unresolvedObservedIdentityId}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }

  function consumeBadgeInteraction(event, shouldOpenTarget = false) {
    event.preventDefault();
    event.stopPropagation();

    if (typeof event.stopImmediatePropagation === "function") {
      event.stopImmediatePropagation();
    }

    if (shouldOpenTarget) {
      console.log("CortexRate badge clicked", {
        linkedCanonicalItemId,
        unresolvedObservedIdentityId
      });
      openBadgeTarget();
    }
  }

  function syncBadgeClickableState() {
    const badge = document.getElementById(BADGE_ID);

    if (!badge) {
      return;
    }

    badge.dataset.clickable = linkedCanonicalItemId || unresolvedObservedIdentityId ? "true" : "false";
  }

  function setBadgeTargetState(canonicalItemId = null, observedIdentityId = null) {
    linkedCanonicalItemId = canonicalItemId;
    unresolvedObservedIdentityId = observedIdentityId;

    console.log("CortexRate badge target state updated", {
      linkedCanonicalItemId,
      unresolvedObservedIdentityId
    });

    syncBadgeClickableState();
  }

  function clearBadgeTargetState() {
    setBadgeTargetState(null, null);
  }

  function storeStableBadgeState(fingerprint, text, tone, canonicalItemId = null, observedIdentityId = null) {
    lastStableBadgeState = {
      fingerprint,
      text,
      tone,
      canonicalItemId,
      observedIdentityId
    };

    console.log("CortexRate stored stable badge state", lastStableBadgeState);
  }

  function restoreStableBadgeState(fingerprint) {
    if (!lastStableBadgeState || lastStableBadgeState.fingerprint !== fingerprint) {
      return false;
    }

    console.log("CortexRate restoring stable badge state", lastStableBadgeState);
    setBadgeTargetState(
      lastStableBadgeState.canonicalItemId,
      lastStableBadgeState.observedIdentityId
    );
    renderBadge(lastStableBadgeState.text, lastStableBadgeState.tone);
    return true;
  }

  function setBadgeTargetStateFromResolveResult(result) {
    if (result?.resolution?.status === "linked" && result.canonical_item?.id) {
      setBadgeTargetState(result.canonical_item.id, null);
      return;
    }

    if (
      (result?.resolution?.status === "unresolved" ||
        result?.resolution?.status === "created_unresolved") &&
      result.observed_identity?.id
    ) {
      setBadgeTargetState(null, result.observed_identity.id);
      return;
    }

    clearBadgeTargetState();
  }

  function ensureBadge() {
    let badge = document.getElementById(BADGE_ID);

    if (badge || !document.body) {
      return badge;
    }

    badge = document.createElement("div");
    badge.id = BADGE_ID;
    badge.className = "cortexrate-badge";
    badge.setAttribute("role", "status");

    const title = document.createElement("p");
    title.className = "cortexrate-badge__title";
    title.textContent = "CortexRate";

    const body = document.createElement("p");
    body.className = "cortexrate-badge__body";
    body.textContent = "Scanning...";

    badge.addEventListener("pointerdown", (event) => {
      consumeBadgeInteraction(event);
    });

    badge.addEventListener("mousedown", (event) => {
      consumeBadgeInteraction(event);
    });

    badge.addEventListener("mouseup", (event) => {
      consumeBadgeInteraction(event);
    });

    badge.addEventListener("click", (event) => {
      consumeBadgeInteraction(event, true);
    });

    badge.appendChild(title);
    badge.appendChild(body);
    document.body.appendChild(badge);
    syncBadgeClickableState();

    return badge;
  }

  function renderBadge(text, tone = "empty") {
    const badge = ensureBadge();

    if (!badge) return;

    const body = badge.querySelector(".cortexrate-badge__body");
    if (body) {
      body.textContent = text;
    }

    badge.dataset.tone = tone;
    syncBadgeClickableState();
  }

  function formatSummary(result) {
    if (result.resolution?.status === "linked" && result.rating_summary) {
      const averageRating = result.rating_summary.average_rating;
      const reviewCount = result.rating_summary.review_count ?? 0;
      const reviewLabel = reviewCount === 1 ? "review" : "reviews";

      if (averageRating !== null && averageRating !== undefined) {
        const roundedStars = Math.round(averageRating);
        const stars = "★".repeat(roundedStars) + "☆".repeat(5 - roundedStars);
        return `${stars} (${Number(averageRating).toFixed(1)}) · ${reviewCount} ${reviewLabel}`;
      }
    }

    return "No ratings yet";
  }

  async function resolveIdentity(identity) {
    console.log("CortexRate sending resolve request", identity);

    const response = await fetch(`${API_BASE_URL}/api/v1/identity/resolve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(identity)
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Identity resolve failed with status ${response.status}: ${text}`);
    }

    const payload = await response.json();
    console.log("CortexRate resolve response", payload);
    return payload.data ?? null;
  }

  async function run() {
    scheduledRun = null;

    if (window.location.href !== currentUrl) {
      resetResolutionStateForUrlChange(window.location.href);
      clearBadgeTargetState();
    }

    if (!isSupportedDetailPage()) {
      console.log("CortexRate skipping non-detail page", {
        pathname: window.location.pathname
      });
      clearBadgeTargetState();
      removeBadge();
      return;
    }

    ensureBadge();

    const identity = scrapeIdentity();

    if (!identity) {
      const nextDelay = INITIAL_RETRY_DELAYS_MS[retryAttempt] ?? null;

      console.log("CortexRate waiting for item data", {
        retryAttempt,
        nextDelay
      });
      renderBadge("Waiting for item data", "empty");

      if (nextDelay !== null) {
        retryAttempt += 1;
        scheduleRun(nextDelay);
      }

      return;
    }

    retryAttempt = 0;

    const fingerprint = buildFingerprint(identity);

    if (fingerprint === lastResolvedFingerprint) {
      console.log("CortexRate run skipping already-settled fingerprint", fingerprint);
      return;
    }

    if (lastStableBadgeState?.fingerprint === fingerprint) {
      console.log("CortexRate run restoring settled fingerprint", fingerprint);
      restoreStableBadgeState(fingerprint);
      lastResolvedFingerprint = fingerprint;
      return;
    }

    if (fingerprint === lastResolvedFingerprint || fingerprint === pendingFingerprint) {
      console.log("CortexRate skipping duplicate fingerprint", fingerprint);
      restoreStableBadgeState(fingerprint);
      return;
    }

    pendingFingerprint = fingerprint;
    renderBadge("Checking CortexRate...", "empty");

    try {
      const result = await resolveIdentity(identity);

      if (!result) {
        clearBadgeTargetState();
        storeStableBadgeState(fingerprint, "No ratings yet", "empty", null, null);
        renderBadge("No ratings yet", "empty");
        return;
      }

      const summaryText = formatSummary(result);
      const summaryTone = result.resolution?.status === "linked" ? "linked" : "empty";
      const canonicalItemId =
        result.resolution?.status === "linked" ? result.canonical_item?.id ?? null : null;
      const observedIdentityId =
        result.resolution?.status === "linked" ? null : result.observed_identity?.id ?? null;

      setBadgeTargetStateFromResolveResult(result);
      storeStableBadgeState(
        fingerprint,
        summaryText,
        summaryTone,
        canonicalItemId,
        observedIdentityId
      );
      renderBadge(summaryText, summaryTone);

      lastResolvedFingerprint = fingerprint;
    } catch (error) {
      console.error("CortexRate extension error", error);
      renderBadge("Request failed", "error");
    } finally {
      pendingFingerprint = null;
    }
  }

  function scheduleRun(delay = RETRY_DELAY_MS) {
    if (scheduledRun) {
      window.clearTimeout(scheduledRun);
    }

    console.log("CortexRate scheduling run", { delay });
    scheduledRun = window.setTimeout(run, delay);
  }

  function shouldScheduleObserverRun() {
    if (pendingFingerprint) {
      console.log("CortexRate observer skipping while request is pending", {
        pendingFingerprint
      });
      return false;
    }

    const identity = scrapeIdentity();

    if (!identity) {
      const nextDelay = INITIAL_RETRY_DELAYS_MS[retryAttempt] ?? null;

      if (nextDelay === null) {
        console.log("CortexRate observer not scheduling incomplete page beyond retry window");
        return false;
      }

      console.log("CortexRate observer scheduling incomplete page retry", {
        retryAttempt,
        nextDelay
      });
      return true;
    }

    const fingerprint = buildFingerprint(identity);

    if (fingerprint === lastResolvedFingerprint) {
      console.log("CortexRate observer skipping already-settled fingerprint", fingerprint);
      return false;
    }

    if (lastStableBadgeState?.fingerprint === fingerprint) {
      console.log("CortexRate observer skipping settled fingerprint", fingerprint);
      restoreStableBadgeState(fingerprint);
      lastResolvedFingerprint = fingerprint;
      return false;
    }

    console.log("CortexRate observer detected new fingerprint", fingerprint);
    return true;
  }

  scheduleRun();

  const observer = new MutationObserver((mutations) => {
    if (shouldIgnoreObserverMutations(mutations)) {
      return;
    }

    if (window.location.href !== currentUrl) {
      resetResolutionStateForUrlChange(window.location.href);
      clearBadgeTargetState();
    }

    if (!isSupportedDetailPage()) {
      console.log("CortexRate observer skipping non-detail page", {
        pathname: window.location.pathname
      });
      clearBadgeTargetState();
      removeBadge();
      return;
    }

    if (!shouldScheduleObserverRun()) {
      return;
    }

    scheduleRun();
  });

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();
