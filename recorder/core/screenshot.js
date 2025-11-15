import { throttle } from './utils.js';

export class ScreenshotService {
  constructor({ panelRoot = null, interval = 700 } = {}) {
    this.interval = interval;
    this.pendingResolves = [];
    this.ignoredNodes = panelRoot ? [panelRoot] : [];
    this.processQueue = throttle(() => this.flushQueue(), this.interval);
  }

  setPanelRoot(root) {
    this.setIgnoredNodes(root ? [root] : []);
  }

  setIgnoredNodes(nodes = []) {
    this.ignoredNodes = nodes.filter(Boolean);
  }

  requestCapture() {
    return new Promise((resolve) => {
      this.pendingResolves.push(resolve);
      this.processQueue();
    });
  }

  async flushQueue() {
    if (!this.pendingResolves.length) {
      return;
    }

    const resolvers = [...this.pendingResolves];
    this.pendingResolves = [];

    if (!window.html2canvas) {
      resolvers.forEach((resolve) => resolve(null));
      return;
    }

    try {
      const canvas = await window.html2canvas(document.body, {
        backgroundColor: '#ffffff',
        ignoreElements: (element) => this.shouldIgnore(element),
      });

      const full = canvas.toDataURL('image/png');
      const payload = {
        full,
        thumbnail: full,
      };

      resolvers.forEach((resolve) => resolve(payload));
    } catch (error) {
      console.error('Screenshot capture failed', error);
      resolvers.forEach((resolve) => resolve(null));
    }
  }

  shouldIgnore(element) {
    if (!element || !this.ignoredNodes.length) {
      return false;
    }
    return this.ignoredNodes.some((node) => node && node.contains(element));
  }
}