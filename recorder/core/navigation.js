import { formatTimestamp, generateId } from './utils.js';

export class NavigationTracker {
  constructor({ store, screenshotService }) {
    this.store = store;
    this.screenshotService = screenshotService;
    this.originalPushState = history.pushState;
    this.originalReplaceState = history.replaceState;
    this.currentUrl = window.location.href;
    this.pollTimer = null;
    this.active = false;
  }

  start() {
    if (this.active) {
      return;
    }
    this.active = true;
    this.patchHistory();
    window.addEventListener('popstate', this.handlePopState, true);
    this.startPolling();
  }

  stop() {
    if (!this.active) {
      return;
    }
    this.active = false;
    window.removeEventListener('popstate', this.handlePopState, true);
    if (this.originalPushState) {
      history.pushState = this.originalPushState;
    }
    if (this.originalReplaceState) {
      history.replaceState = this.originalReplaceState;
    }
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  startPolling() {
    this.pollTimer = setInterval(() => {
      if (this.currentUrl !== window.location.href) {
        this.handleNavigation(window.location.href, 'poll');
      }
    }, 1000);
  }

  patchHistory() {
    if (typeof this.originalPushState === 'function') {
      const tracker = this;
      history.pushState = function (...args) {
        tracker.originalPushState.apply(this, args);
        tracker.handleNavigation(window.location.href, 'pushState');
      };
    }

    if (typeof this.originalReplaceState === 'function') {
      const tracker = this;
      history.replaceState = function (...args) {
        tracker.originalReplaceState.apply(this, args);
        tracker.handleNavigation(window.location.href, 'replaceState');
      };
    }
  }

  handlePopState = () => {
    this.handleNavigation(window.location.href, 'popstate');
  };

  async handleNavigation(url, source) {
    if (url === this.currentUrl) {
      return;
    }

    this.currentUrl = url;
    const event = {
      id: generateId('nav'),
      timestamp: Date.now(),
      displayTime: formatTimestamp(),
      type: 'navigation',
      message: `Navigated to ${url}`,
      details: { source },
    };

    if (this.screenshotService) {
      event.screenshot = await this.screenshotService.requestCapture();
    }

    this.store.addEvent(event);
  }
}