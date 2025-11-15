import { formatTimestamp, generateId } from './utils.js';

export class VisibilityTracker {
  constructor({ store, screenshotService }) {
    this.store = store;
    this.screenshotService = screenshotService;
    this.active = false;
  }

  start() {
    if (this.active) {
      return;
    }
    this.active = true;
    document.addEventListener('visibilitychange', this.handleChange, true);
  }

  stop() {
    if (!this.active) {
      return;
    }
    this.active = false;
    document.removeEventListener('visibilitychange', this.handleChange, true);
  }

  handleChange = async () => {
    const state = document.visibilityState;
    const hidden = state === 'hidden';
    const event = {
      id: generateId('visibility'),
      timestamp: Date.now(),
      displayTime: formatTimestamp(),
      type: 'visibility',
      message: hidden ? 'Tab hidden' : 'Tab visible',
      details: { state },
    };

    if (!hidden && this.screenshotService) {
      event.screenshot = await this.screenshotService.requestCapture();
    }

    this.store.addEvent(event);
  };
}