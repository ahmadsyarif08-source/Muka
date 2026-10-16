import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  filename: string;
  orientation?: 'portrait' | 'landscape';
  marginMm?: number;
  qualityScale?: number;
}

/**
 * Captures an HTML element (e.g. printed A4 report container)
 * and directly saves/downloads it as a clean PDF file.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: PdfExportOptions
): Promise<void> {
  const {
    filename,
    orientation = 'portrait',
    marginMm = 8,
    qualityScale = 2,
  } = options;

  // Temporarily ensure background colors are applied and dark mode is normalized for printable white paper
  const wasDark = document.documentElement.classList.contains('dark');
  if (wasDark) {
    document.documentElement.classList.remove('dark');
  }

  // Small delay to allow any styles to settle
  await new Promise((resolve) => setTimeout(resolve, 80));

  try {
    const canvas = await html2canvas(element, {
      scale: qualityScale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Standard A4 dimensions in mm
    const pdfWidth = orientation === 'landscape' ? 297 : 210;
    const pdfHeight = orientation === 'landscape' ? 210 : 297;

    const printableWidth = pdfWidth - marginMm * 2;
    const imgHeight = (canvas.height * printableWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: orientation === 'landscape' ? 'l' : 'p',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    let heightLeft = imgHeight;
    let position = marginMm;

    // First page
    pdf.addImage(imgData, 'JPEG', marginMm, position, printableWidth, imgHeight, undefined, 'FAST');
    heightLeft -= (pdfHeight - marginMm * 2);

    // Subsequent pages if content overflows single A4 page
    while (heightLeft > 5) {
      position = heightLeft - imgHeight + marginMm;
      pdf.addPage('a4', orientation === 'landscape' ? 'l' : 'p');
      pdf.addImage(imgData, 'JPEG', marginMm, position, printableWidth, imgHeight, undefined, 'FAST');
      heightLeft -= (pdfHeight - marginMm * 2);
    }

    const finalFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(finalFilename);
  } finally {
    // Restore dark mode if it was active
    if (wasDark) {
      document.documentElement.classList.add('dark');
    }
  }
}
