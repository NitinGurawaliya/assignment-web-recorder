export class ControlPanel {
  constructor({ onStart, onStop, onExport, onClear }) {
    this.onStart = onStart;
    this.onStop = onStop;
    this.onExport = onExport;
    this.onClear = onClear;
    this.root = this.buildPanel();
    this.modal = this.buildModal();
    document.body.appendChild(this.root);
    document.body.appendChild(this.modal.overlay);
    this.setRecordingState(false);
  }

  buildPanel() {
    const panel = document.createElement('section');
    panel.className = 'recorder-panel';

    const controls = document.createElement('div');
    controls.className = 'recorder-panel__controls';

    this.startBtn = this.createButton('Start', 'start', this.handleStart);
    this.stopBtn = this.createButton('Stop', 'stop', this.handleStop);
    this.exportBtn = this.createButton('Export PDF', 'export', this.handleExport);
    this.clearBtn = this.createButton('Clear', 'clear', this.handleClear);

    controls.append(this.startBtn, this.stopBtn, this.exportBtn, this.clearBtn);

    const feed = document.createElement('div');
    feed.className = 'recorder-panel__feed recorder-feed';
    feed.dataset.feed = 'true';

    panel.append(controls, feed);
    return panel;
  }

  buildModal() {
    const overlay = document.createElement('div');
    overlay.className = 'recorder-modal';
    overlay.setAttribute('hidden', 'hidden');

    const content = document.createElement('div');
    content.className = 'recorder-modal__content';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'recorder-modal__close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this.hideModal());

    const img = document.createElement('img');
    img.className = 'recorder-modal__image';

    content.append(closeBtn, img);
    overlay.appendChild(content);

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        this.hideModal();
      }
    });

    return { overlay, img };
  }

  createButton(label, modifier, handler) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `recorder-panel__btn recorder-panel__btn--${modifier}`;
    button.textContent = label;
    button.addEventListener('click', handler);
    return button;
  }

  getFeedContainer() {
    return this.root.querySelector('.recorder-panel__feed');
  }

  getRoot() {
    return this.root;
  }

  getModalOverlay() {
    return this.modal.overlay;
  }

  showModal(imageUrl) {
    this.modal.img.src = imageUrl;
    this.modal.overlay.removeAttribute('hidden');
  }

  hideModal() {
    this.modal.overlay.setAttribute('hidden', 'hidden');
    this.modal.img.removeAttribute('src');
  }

  setRecordingState(recording) {
    this.startBtn.disabled = recording;
    this.stopBtn.disabled = !recording;
    this.clearBtn.disabled = recording;
    this.exportBtn.disabled = recording;
  }

  handleStart = () => {
    if (typeof this.onStart === 'function') {
      this.onStart();
    }
  };

  handleStop = () => {
    if (typeof this.onStop === 'function') {
      this.onStop();
    }
  };

  handleExport = () => {
    if (typeof this.onExport === 'function') {
      this.onExport();
    }
  };

  handleClear = () => {
    if (typeof this.onClear === 'function') {
      this.onClear();
    }
  };
}