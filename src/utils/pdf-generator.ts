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