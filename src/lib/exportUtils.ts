import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

export async function exportToImage(
  element: HTMLElement,
  format: 'png' | 'jpg' = 'png',
  fileName: string = 'note'
): Promise<void> {
  const scale = 2;
  const options = {
    quality: 0.95,
    pixelRatio: scale,
    backgroundColor: '#ffffff',
  };

  try {
    let dataUrl: string;
    if (format === 'png') {
      dataUrl = await toPng(element, options);
    } else {
      dataUrl = await toJpeg(element, options);
    }

    const link = document.createElement('a');
    link.download = `${fileName}.${format}`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

export async function exportToPDF(
  element: HTMLElement,
  fileName: string = 'note'
): Promise<void> {
  try {
    const scale = 2;
    const dataUrl = await toPng(element, {
      quality: 0.95,
      pixelRatio: scale,
      backgroundColor: '#ffffff',
    });

    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const pdf = new jsPDF({
      orientation: img.width > img.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [img.width / scale, img.height / scale],
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, img.width / scale, img.height / scale);
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
}
