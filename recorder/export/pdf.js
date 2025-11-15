export class PdfExporter {
  constructor({ store }) {
    this.store = store;
  }

  getJsPdf() {
    if (window.jspdf && window.jspdf.jsPDF) {
      return window.jspdf.jsPDF;
    }
    if (window.jsPDF) {
      return window.jsPDF;
    }
    return null;
  }

  export() {
    const events = this.store.getEvents();
    if (!events.length) {
      alert('No events to export yet.');
      return;
    }

    const JsPDF = this.getJsPdf();
    if (!JsPDF) {
      console.error('jsPDF is not available.');
      return;
    }

    const doc = new JsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth() - 80;
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(20);
    doc.text('Session Recording', 40, 80);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 110);
    doc.addPage();

    let y = 60;
    doc.setFontSize(12);

    events.forEach((event) => {
      if (y > pageHeight - 120) {
        doc.addPage();
        y = 60;
      }

      doc.setFontSize(10);
      doc.text(`${event.displayTime} • ${event.type.toUpperCase()}`, 40, y);
      y += 16;
      doc.setFontSize(12);
      doc.text(event.message, 40, y);
      y += 18;

      const detailLines = this.buildDetailLines(event.details);
      detailLines.forEach((line) => {
        doc.setFontSize(10);
        doc.text(line, 50, y);
        y += 14;
      });

      if (event.screenshot && event.screenshot.full) {
        try {
          const props = doc.getImageProperties(event.screenshot.full);
          const ratio = props.height / props.width;
          const imgWidth = pageWidth;
          const imgHeight = imgWidth * ratio;
          if (y + imgHeight > pageHeight - 60) {
            doc.addPage();
            y = 60;
          }
          doc.addImage(event.screenshot.full, 'PNG', 40, y, imgWidth, imgHeight);
          y += imgHeight + 20;
        } catch (error) {
          console.warn('Failed to embed screenshot in PDF', error);
          doc.setFontSize(10);
          doc.text('(screenshot unavailable)', 40, y);
          y += 20;
        }
      } else {
        doc.setFontSize(10);
        doc.text('(screenshot unavailable)', 40, y);
        y += 20;
      }

      y += 10;
    });

    doc.save(`session-recording-${Date.now()}.pdf`);
  }

  buildDetailLines(details = {}) {
    const lines = [];
    if (details.value) {
      lines.push(`Text: ${details.value}`);
    }
    if (typeof details.x === 'number' && typeof details.y === 'number') {
      lines.push(`Coords: X ${details.x}, Y ${details.y}`);
    }
    if (details.source) {
      lines.push(`Source: ${details.source}`);
    }
    if (details.state) {
      lines.push(`State: ${details.state}`);
    }
    return lines;
  }
}