export class RecorderStore {
  constructor() {
    this.events = [];
    this.recording = false;
    this.subscribers = new Set();
  }

  setRecording(state) {
    this.recording = state;
    this.notify({ type: 'state', recording: state });
  }

  isRecording() {
    return this.recording;
  }

  addEvent(event) {
    this.events.push(event);
    this.notify({ type: 'event', event });
  }

  getEvents() {
    return [...this.events];
  }

  clear() {
    this.events = [];
    this.notify({ type: 'clear' });
  }

  subscribe(handler) {
    this.subscribers.add(handler);
    return () => this.subscribers.delete(handler);
  }

  notify(payload) {
    this.subscribers.forEach((handler) => handler(payload));
  }
}