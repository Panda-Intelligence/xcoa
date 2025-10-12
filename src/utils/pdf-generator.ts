import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerOrganization?: string;
  customerAddress?: string;
  customerVatNumber?: string;
  customerCountry?: string;
  paymentMethod?: string;
  paidAt?: string;
  teamName?: string;
}

export const generateInvoicePDF = async (invoice: Invoice): Promise<void> => {
  try {
    // Create a temporary div for the invoice content
    const invoiceElement = document.createElement('div');
    invoiceElement.style.width = '210mm'; // A4 width
    invoiceElement.style.minHeight = '297mm'; // A4 height
    invoiceElement.style.padding = '20mm';
    invoiceElement.style.backgroundColor = 'white';
    invoiceElement.style.fontFamily = 'Arial, sans-serif';
    invoiceElement.style.fontSize = '12px';
    invoiceElement.style.lineHeight = '1.4';
    invoiceElement.style.color = '#000';

    // Build the invoice HTML content
    invoiceElement.innerHTML = `
      <div style="margin-bottom: 40px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px;">
          <div>
            <h1 style="color: #2563eb; font-size: 28px; font-weight: bold; margin: 0 0 10px 0;">xCOA Platform</h1>
            <p style="font-size: 11px; color: #6b7280; margin: 0; line-height: 1.3;">
              Professional eCOA Solutions<br/>
              Unit 13, Freeland Park<br/>
              Wareham Road, Poole, UK BH16 6FH<br/>
              Email: support@openecoa.com
            </p>
          </div>
          <div style="text-align: right;">
            <h2 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">INVOICE</h2>
            <p style="font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">${invoice.invoiceNumber}</p>
            <p style="font-size: 11px; color: #6b7280; margin: 0; line-height: 1.3;">
              Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}<br/>
              Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <!-- Customer Info -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
          <div style="width: 48%;">
            <h3 style="font-weight: 600; margin: 0 0 10px 0; font-size: 14px;">Bill To:</h3>
            <div style="font-size: 11px; color: #374151; line-height: 1.4;">
              <p style="font-weight: 500; margin: 0 0 5px 0;">${invoice.customerName}</p>
              ${invoice.customerOrganization ? `<p style="margin: 0 0 5px 0;">${invoice.customerOrganization}</p>` : ''}
              ${invoice.customerAddress ? `<p style="margin: 0 0 5px 0; white-space: pre-line;">${invoice.customerAddress}</p>` : ''}
              <p style="margin: 0 0 5px 0;">Email: ${invoice.customerEmail}</p>
              ${invoice.customerVatNumber ? `<p style="margin: 0;">VAT Number: ${invoice.customerVatNumber}</p>` : ''}
            </div>
          </div>
          <div style="width: 48%;">
            <h3 style="font-weight: 600; margin: 0 0 10px 0; font-size: 14px;">Invoice Status:</h3>
            <div style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500;
              ${invoice.status === 'paid' ? 'background-color: #dcfce7; color: #166534;' :
        invoice.status === 'sent' ? 'background-color: #dbeafe; color: #1d4ed8;' :
          invoice.status === 'overdue' ? 'background-color: #fee2e2; color: #dc2626;' :
            'background-color: #f3f4f6; color: #374151;'}">
              ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </div>
            ${invoice.paidAt ? `<p style="font-size: 11px; color: #6b7280; margin: 10px 0 0 0;">Paid on: ${new Date(invoice.paidAt).toLocaleDateString()}</p>` : ''}
          </div>
        </div>

        <!-- Services Table -->
        <div style="margin-bottom: 40px;">
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d5db;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-size: 12px; font-weight: 600;">Description</th>
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: right; font-size: 12px; font-weight: 600;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 12px; font-size: 11px;">${invoice.description}</td>
                <td style="border: 1px solid #d1d5db; padding: 12px; text-align: right; font-size: 11px;">$${invoice.subtotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
          <div style="width: 250px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 11px;">
              <span>Subtotal:</span>
              <span>$${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 11px;">
              <span>Tax (10%):</span>
              <span>$${invoice.taxAmount.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #d1d5db; font-weight: bold; font-size: 16px;">
              <span>Total:</span>
              <span>$${invoice.totalAmount.toFixed(2)} ${invoice.currency}</span>
            </div>
          </div>
        </div>

        <!-- Payment Info -->
        <div style="border-top: 1px solid #d1d5db; padding-top: 20px; font-size: 11px; color: #6b7280;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div style="width: 48%;">
              <h3 style="font-weight: 600; margin: 0 0 10px 0; color: #000;">Payment Information:</h3>
              <p style="margin: 0 0 5px 0;">Payment Method: ${invoice.paymentMethod || 'Pending'}</p>
              <p style="margin: 0;">Currency: ${invoice.currency}</p>
            </div>
            <div style="width: 48%;">
              <h3 style="font-weight: 600; margin: 0 0 10px 0; color: #000;">Terms & Conditions:</h3>
              <p style="margin: 0 0 5px 0;">Payment due within 30 days</p>
              <p style="margin: 0;">Late payments subject to 1.5% monthly charge</p>
            </div>
          </div>
          <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 15px;">
            <p style="margin: 0 0 5px 0; color: #000;">Thank you for your business with xCOA Platform!</p>
            <p style="font-size: 10px; margin: 0;">Questions about this invoice? Contact us at billing@openecoa.com</p>
          </div>
        </div>
      </div>
    `;

    // Temporarily add to body for rendering
    invoiceElement.style.position = 'absolute';
    invoiceElement.style.left = '-9999px';
    invoiceElement.style.top = '0';
    document.body.appendChild(invoiceElement);

    // Generate canvas from HTML
    const canvas = await html2canvas(invoiceElement, {
      scale: 2, // Higher quality
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123 // A4 height in pixels at 96 DPI
    });

    // Remove temporary element
    document.body.removeChild(invoiceElement);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Download the PDF
    pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('PDF generation failed');
  }
};

// ============================================
// Report PDF Generation
// ============================================

interface ReportData {
  id: string;
  scaleName: string;
  scaleDescription?: string;
  totalScore: number;
  maxScore: number;
  completionRate: number;
  dimensionScores: Record<string, any>;
  interpretation?: string;
  severity?: string;
  recommendations?: string[];
  generatedAt: Date | string;
  sessionId: string;
  metadata?: Record<string, any>;
}

export class PDFReportGenerator {
  private doc: jsPDF;
  private currentY: number;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
  }

  /**
   * Generate PDF report
   */
  generateReport(data: ReportData): jsPDF {
    this.addHeader(data);
    this.addScoreSummary(data);
    this.addDimensionScores(data);
    this.addInterpretation(data);
    this.addRecommendations(data);
    this.addMetadata(data);
    this.addFooter();

    return this.doc;
  }

  /**
   * Add header section
   */
  private addHeader(data: ReportData) {
    // Title
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('eCOA评估报告', this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 15;

    // Scale name
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(data.scaleName, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 10;

    // Date
    this.doc.setFontSize(10);
    this.doc.setTextColor(128, 128, 128);
    const dateStr = new Date(data.generatedAt).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    this.doc.text(`生成日期: ${dateStr}`, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 15;

    // Divider line
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;

    this.doc.setTextColor(0, 0, 0); // Reset color
  }

  /**
   * Add score summary section
   */
  private addScoreSummary(data: ReportData) {
    const percentage = data.maxScore > 0 ? (data.totalScore / data.maxScore) * 100 : 0;

    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('评分概要', this.margin, this.currentY);
    this.currentY += 10;

    // Score box
    const boxY = this.currentY;
    this.doc.setDrawColor(59, 130, 246); // blue
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(this.margin, boxY, this.pageWidth - 2 * this.margin, 30, 3, 3);

    // Total score
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`总分: ${data.totalScore.toFixed(1)} / ${data.maxScore}`, this.margin + 5, boxY + 8);
    this.doc.text(`得分率: ${percentage.toFixed(1)}%`, this.margin + 5, boxY + 16);
    this.doc.text(`完成率: ${data.completionRate.toFixed(1)}%`, this.margin + 5, boxY + 24);

    // Interpretation
    if (data.interpretation) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`评估结果: ${data.interpretation}`, this.pageWidth / 2, boxY + 16, { align: 'center' });
    }

    this.currentY = boxY + 35;
  }

  /**
   * Add dimension scores section
   */
  private addDimensionScores(data: ReportData) {
    if (!data.dimensionScores || Object.keys(data.dimensionScores).length <= 1) {
      return;
    }

    this.checkPageBreak(60);

    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('维度得分', this.margin, this.currentY);
    this.currentY += 10;

    // Table
    this.doc.setFontSize(10);
    const startY = this.currentY;
    const rowHeight = 8;

    // Header
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, startY, this.pageWidth - 2 * this.margin, rowHeight, 'F');
    this.doc.text('维度', this.margin + 2, startY + 5);
    this.doc.text('得分', this.margin + 60, startY + 5);
    this.doc.text('满分', this.margin + 90, startY + 5);
    this.doc.text('得分率', this.margin + 120, startY + 5);

    this.currentY = startY + rowHeight;

    // Rows
    this.doc.setFont('helvetica', 'normal');
    for (const [dimension, scores] of Object.entries(data.dimensionScores)) {
      const dimScore = scores as any;
      this.doc.text(dimension, this.margin + 2, this.currentY + 5);
      this.doc.text(dimScore.score.toFixed(1), this.margin + 60, this.currentY + 5);
      this.doc.text(dimScore.maxScore.toFixed(1), this.margin + 90, this.currentY + 5);
      this.doc.text(`${dimScore.percentage.toFixed(1)}%`, this.margin + 120, this.currentY + 5);

      this.doc.setDrawColor(220, 220, 220);
      this.doc.line(this.margin, this.currentY + rowHeight, this.pageWidth - this.margin, this.currentY + rowHeight);

      this.currentY += rowHeight;
    }

    this.currentY += 5;
  }

  /**
   * Add interpretation section
   */
  private addInterpretation(data: ReportData) {
    if (!data.interpretation) return;

    this.checkPageBreak(40);

    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('结果解读', this.margin, this.currentY);
    this.currentY += 10;

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    const lines = this.doc.splitTextToSize(data.interpretation, this.pageWidth - 2 * this.margin);
    this.doc.text(lines, this.margin, this.currentY);
    this.currentY += lines.length * 6 + 10;
  }

  /**
   * Add recommendations section
   */
  private addRecommendations(data: ReportData) {
    if (!data.recommendations || data.recommendations.length === 0) return;

    this.checkPageBreak(60);

    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('专业建议', this.margin, this.currentY);
    this.currentY += 10;

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');

    for (let i = 0; i < data.recommendations.length; i++) {
      const rec = data.recommendations[i];
      const prefix = `${i + 1}. `;
      const lines = this.doc.splitTextToSize(rec, this.pageWidth - 2 * this.margin - 10);

      this.checkPageBreak(lines.length * 6 + 5);

      this.doc.text(prefix, this.margin, this.currentY);
      this.doc.text(lines, this.margin + 10, this.currentY);
      this.currentY += lines.length * 6 + 2;
    }

    this.currentY += 5;
  }

  /**
   * Add metadata section
   */
  private addMetadata(data: ReportData) {
    this.checkPageBreak(30);

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('报告信息', this.margin, this.currentY);
    this.currentY += 8;

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);

    this.doc.text(`报告ID: ${data.id}`, this.margin, this.currentY);
    this.currentY += 5;
    this.doc.text(`Session ID: ${data.sessionId}`, this.margin, this.currentY);
    this.currentY += 5;
    if (data.metadata?.scoringMethod) {
      this.doc.text(`计分方法: ${data.metadata.scoringMethod}`, this.margin, this.currentY);
      this.currentY += 5;
    }

    this.doc.setTextColor(0, 0, 0);
  }

  /**
   * Add footer to all pages
   */
  private addFooter() {
    const pageCount = this.doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(150, 150, 150);

      // Disclaimer
      const disclaimer = '本报告由 OpeneCOA 系统自动生成，仅供参考。具体诊断和治疗方案请咨询专业医师。';
      this.doc.text(disclaimer, this.pageWidth / 2, this.pageHeight - 15, { align: 'center' });

      // Page number
      this.doc.text(
        `第 ${i} 页 / 共 ${pageCount} 页`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );

      // Generated by
      this.doc.text('Generated by OpeneCOA', this.pageWidth - this.margin, this.pageHeight - 10, { align: 'right' });

      this.doc.setTextColor(0, 0, 0);
    }
  }

  /**
   * Check if need to add new page
   */
  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - 30) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  /**
   * Save PDF to file
   */
  savePDF(filename: string) {
    this.doc.save(filename);
  }

  /**
   * Get PDF as blob
   */
  getPDFBlob(): Blob {
    return this.doc.output('blob');
  }

  /**
   * Get PDF as buffer (for server-side)
   */
  getPDFBuffer(): ArrayBuffer {
    return this.doc.output('arraybuffer');
  }

  /**
   * Get PDF as data URL
   */
  getPDFDataURL(): string {
    return this.doc.output('dataurlstring');
  }
}

/**
 * Generate PDF from report data
 */
export function generateReportPDF(data: ReportData): PDFReportGenerator {
  const generator = new PDFReportGenerator();
  generator.generateReport(data);
  return generator;
}