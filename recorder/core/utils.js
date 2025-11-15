const DOMAIN_DENYLIST = [];
const SENSITIVE_TYPES = ['password'];

export function isDeniedDomain(hostname = window.location.hostname) {
  return DOMAIN_DENYLIST.includes(hostname);
}

export function throttle(fn, wait) {
  let lastCall = 0;
  let timeoutId = null;
  let lastArgs;

  const invoke = () => {
    lastCall = Date.now();
    timeoutId = null;
    fn.apply(null, lastArgs);
  };

  return (...args) => {
    lastArgs = args;
    const elapsed = Date.now() - lastCall;
    if (elapsed >= wait) {
      invoke();
      return;
    }
    if (!timeoutId) {
      timeoutId = setTimeout(invoke, wait - elapsed);
    }
  };
}

export function formatTimestamp(date = new Date()) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function describeElement(element) {
  if (!element || element === document.body) {
    return 'document body';
  }

  const parts = [element.tagName.toLowerCase()];

  if (element.id) {
    parts.push(`#${element.id}`);
  }

  if (element.className && typeof element.className === 'string') {
    const classList = element.className.trim().split(/\s+/).filter(Boolean);
    if (classList.length) {
      parts.push(`.${classList.join('.')}`);
    }
  }

  if (element.getAttribute && element.getAttribute('name')) {
    parts.push(`[name="${element.getAttribute('name')}"]`);
  }

  if (element.textContent) {
    const snippet = element.textContent.trim().slice(0, 30);
    if (snippet) {
      parts.push(`"${snippet}${element.textContent.trim().length > 30 ? '…' : ''}"`);
    }
  }

  return parts.join('');
}

export function isSensitiveElement(element, panelRoot) {
  if (!element) {
    return false;
  }

  const panelNodes = Array.isArray(panelRoot) ? panelRoot.filter(Boolean) : panelRoot ? [panelRoot] : [];

  if (panelNodes.some((node) => node.contains(element))) {
    return true;
  }

  if (element.closest && element.closest('input, textarea')) {
    const input = element.closest('input, textarea');
    if (SENSITIVE_TYPES.includes(input.type)) {
      return true;
    }
  }

  if (element.type && SENSITIVE_TYPES.includes(element.type)) {
    return true;
  }

  return false;
}

export function safeText(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.replace(/\s+/g, ' ').trim();
}

let eventCounter = 0;
export function generateId(prefix = 'evt') {
  eventCounter += 1;
  return `${prefix}-${Date.now()}-${eventCounter}`;
}