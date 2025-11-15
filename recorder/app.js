import { RecorderStore } from './core/store.js';
import { EventsController } from './core/events.js';
import { ScreenshotService } from './core/screenshot.js';
import { NavigationTracker } from './core/navigation.js';
import { VisibilityTracker } from './core/visibility.js';
import { ControlPanel } from './ui/panel.js';
import { ChatFeed } from './ui/chat.js';
import { PdfExporter } from './export/pdf.js';
import { isDeniedDomain, formatTimestamp, generateId } from './core/utils.js';

document.addEventListener('DOMContentLoaded', () => {
  if (isDeniedDomain()) {
    console.warn('Session recorder disabled on this domain.');
    return;
  }

  const store = new RecorderStore();
  const screenshotService = new ScreenshotService();
  const eventsController = new EventsController({ store, screenshotService });
  const navigationTracker = new NavigationTracker({ store, screenshotService });
  const visibilityTracker = new VisibilityTracker({ store, screenshotService });
  const pdfExporter = new PdfExporter({ store });

  const panel = new ControlPanel({
    onStart: startRecording,
    onStop: stopRecording,
    onExport: () => pdfExporter.export(),
    onClear: () => {
      store.clear();
      logSystemMessage('Session cleared');
    },
  });

  const uiNodes = [panel.getRoot(), panel.getModalOverlay()];
  screenshotService.setIgnoredNodes(uiNodes);
  eventsController.setPanelRoot(uiNodes);

  const feed = new ChatFeed({
    container: panel.getFeedContainer(),
    onImageClick: (src) => panel.showModal(src),
  });

  store.subscribe((payload) => {
    if (payload.type === 'event' && payload.event) {
      feed.addEvent(payload.event);
    }
    if (payload.type === 'clear') {
      feed.reset();
    }
  });

  function startRecording() {
    if (store.isRecording()) {
      return;
    }
    eventsController.start();
    navigationTracker.start();
    visibilityTracker.start();
    store.setRecording(true);
    panel.setRecordingState(true);
    logSystemMessage('Recording started');
  }

  function stopRecording() {
    if (!store.isRecording()) {
      return;
    }
    eventsController.stop();
    navigationTracker.stop();
    visibilityTracker.stop();
    store.setRecording(false);
    panel.setRecordingState(false);
    logSystemMessage('Recording stopped');
  }

  function logSystemMessage(message) {
    const event = {
      id: generateId('system'),
      timestamp: Date.now(),
      displayTime: formatTimestamp(),
      type: 'system',
      message,
      details: {},
    };
    store.addEvent(event);
  }
});