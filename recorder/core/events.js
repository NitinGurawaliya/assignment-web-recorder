import { describeElement, formatTimestamp, generateId, isSensitiveElement, safeText } from './utils.js';

const SPECIAL_KEYS = new Set(['Enter', 'Escape', 'Esc', 'Backspace', 'Tab', ' ', 'Space', 'Spacebar']);

export class EventsController {
  constructor({ store, screenshotService, panelRoot }) {
    this.store = store;
    this.screenshotService = screenshotService;
    this.panelNodes = panelRoot ? [panelRoot] : [];
    this.listeners = [];
    this.active = false;
  }

  setPanelRoot(root) {
    if (Array.isArray(root)) {
      this.panelNodes = root.filter(Boolean);
    } else if (root) {
      this.panelNodes = [root];
    } else {
      this.panelNodes = [];
    }
  }

  start() {
    if (this.active) {
      return;
    }
    this.active = true;
    this.attach('click', this.handleClick.bind(this), true);
    this.attach('keydown', this.handleKeydown.bind(this), true);
    this.attach('blur', this.handleBlur.bind(this), true);
    this.attach('submit', this.handleSubmit.bind(this), true);
  }

  stop() {
    if (!this.active) {
      return;
    }
    this.listeners.forEach(({ type, handler, options }) => {
      window.removeEventListener(type, handler, options);
    });
    this.listeners = [];
    this.active = false;
  }

  attach(type, handler, useCapture = false) {
    window.addEventListener(type, handler, useCapture);
    this.listeners.push({ type, handler, options: useCapture });
  }

  shouldSkip(target) {
    return isSensitiveElement(target, this.panelNodes);
  }

  async logEvent(type, message, { details = {}, includeScreenshot = true } = {}) {
    const eventPayload = {
      id: generateId(type),
      timestamp: Date.now(),
      displayTime: formatTimestamp(),
      type,
      message,
      details,
    };

    if (includeScreenshot && this.screenshotService) {
      eventPayload.screenshot = await this.screenshotService.requestCapture();
    }

    this.store.addEvent(eventPayload);
  }

  handleClick = (event) => {
    if (this.shouldSkip(event.target)) {
      return;
    }

    const description = describeElement(event.target);
    const coords = { x: event.clientX, y: event.clientY };

    this.logEvent('click', `Clicked ${description}`, {
      details: coords,
      includeScreenshot: true,
    });
  };

  handleKeydown = (event) => {
    if (this.shouldSkip(event.target) || event.metaKey || event.ctrlKey) {
      return;
    }

    const key = event.key === ' ' ? 'Space' : event.key;
    const isPrintable = key.length === 1;
    const targetDescription = describeElement(event.target);

    if (isPrintable) {
      this.logEvent('key', `Typed "${key}" in ${targetDescription}`, {
        includeScreenshot: false,
      });
      return;
    }

    const isSpecial = SPECIAL_KEYS.has(key);
    if (isSpecial) {
      if (key === 'Enter' && this.isCommitTarget(event.target) && !event.shiftKey) {
        this.captureInputCommit(event.target, 'Enter key commit');
      }
      this.logEvent('key', `${key} pressed in ${targetDescription}`, {
        includeScreenshot: true,
      });
    }
  };

  isCommitTarget(target) {
    if (!target) {
      return false;
    }
    const tag = target.tagName ? target.tagName.toLowerCase() : '';
    return tag === 'input' || tag === 'textarea';
  }

  handleBlur = (event) => {
    if (!this.isCommitTarget(event.target) || this.shouldSkip(event.target)) {
      return;
    }
    this.captureInputCommit(event.target, 'Input blur');
  };

  handleSubmit = (event) => {
    if (this.shouldSkip(event.target)) {
      return;
    }
    const description = describeElement(event.target);
    this.logEvent('form', `Form submitted ${description}`, { includeScreenshot: true });
  };

  async captureInputCommit(target, reason) {
    if (!target || target.type === 'password') {
      return;
    }
    const description = describeElement(target);
    const value = safeText(target.value || target.textContent);
    if (!value) {
      return;
    }
    await this.logEvent('input', `${reason} on ${description}`, {
      details: { value },
      includeScreenshot: true,
    });
  }
}