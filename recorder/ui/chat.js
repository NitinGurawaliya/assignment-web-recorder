export class ChatFeed {
  constructor({ container, onImageClick }) {
    this.container = container;
    this.onImageClick = onImageClick;
  }

  reset() {
    this.container.innerHTML = '';
  }

  addEvent(event) {
    const node = this.createEventNode(event);
    this.container.appendChild(node);
    this.container.scrollTop = this.container.scrollHeight;
  }

  createEventNode(event) {
    const item = document.createElement('article');
    item.className = `recorder-feed__item recorder-feed__item--${event.type}`;

    const header = document.createElement('div');
    header.className = 'recorder-feed__header';

    const timestamp = document.createElement('span');
    timestamp.className = 'recorder-feed__time';
    timestamp.textContent = event.displayTime;

    const type = document.createElement('span');
    type.className = 'recorder-feed__type';
    type.textContent = event.type.toUpperCase();

    header.append(timestamp, type);

    const message = document.createElement('p');
    message.className = 'recorder-feed__message';
    message.textContent = event.message;

    item.append(header, message);

    const detailsNode = this.renderDetails(event.details);
    if (detailsNode) {
      item.appendChild(detailsNode);
    }

    if (event.screenshot && (event.screenshot.thumbnail || event.screenshot.full)) {
      const thumb = document.createElement('img');
      thumb.className = 'recorder-feed__thumbnail';
      thumb.src = event.screenshot.thumbnail || event.screenshot.full;
      thumb.alt = 'Screenshot thumbnail';
      thumb.addEventListener('click', () => {
        if (typeof this.onImageClick === 'function') {
          this.onImageClick(event.screenshot.full || event.screenshot.thumbnail);
        }
      });
      item.appendChild(thumb);
    }

    return item;
  }

  renderDetails(details = {}) {
    const entries = [];
    if (typeof details.value === 'string') {
      entries.push({ label: 'Text', value: details.value });
    }
    if (typeof details.x === 'number' && typeof details.y === 'number') {
      entries.push({ label: 'Coords', value: `X: ${details.x}, Y: ${details.y}` });
    }
    if (details.source) {
      entries.push({ label: 'Source', value: details.source });
    }
    if (details.state) {
      entries.push({ label: 'State', value: details.state });
    }
    if (entries.length) {
      const list = document.createElement('ul');
      list.className = 'recorder-feed__details';
      entries.forEach((entry) => {
        const li = document.createElement('li');
        const label = document.createElement('strong');
        label.textContent = `${entry.label}: `;
        const value = document.createElement('span');
        value.textContent = entry.value;
        li.append(label, value);
        list.appendChild(li);
      });
      return list;
    }
    return null;
  }
}