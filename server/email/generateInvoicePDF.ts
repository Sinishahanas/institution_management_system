import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';

/**
 * Current file path of this module.
 * 
 * @purpose Stores the absolute path of the current module file.
 * 
 * @param None
 * @returns {string} Absolute file path
 * @throws None
 * @sideEffects None
 * 
 * @example
 * console.log(__filename); 
 * // Output: "/Users/you/project/src/pdfGenerator.js"
 */
const __filename = fileURLToPath(import.meta.url);

/**
 * Directory path of this module.
 * 
 * @purpose Stores the directory path of the current module file.
 * 
 * @param None
 * @returns {string} Directory path
 * @throws None
 * @sideEffects None
 * 
 * @example
 * console.log(__dirname); 
 * // Output: "/Users/you/project/src"
 */
const __dirname = path.dirname(__filename);

/**
 * Handlebars helper to check strict equality of two values.
 * 
 * @purpose Provides a template helper for comparing two values inside Handlebars templates.
 * 
 * @param {*} arg1 - First value to compare
 * @param {*} arg2 - Second value to compare
 * @returns {boolean} True if values are strictly equal, else false
 * @throws None
 * @sideEffects None
 * 
 * @example
 * // In a Handlebars template:
 * // {{#if (eq item.type "special")}}Special item{{/if}}
 */
Handlebars.registerHelper('eq', function(arg1, arg2) {
  return arg1 === arg2;
});

/**
 * Generates a PDF invoice using a Handlebars template and provided invoice data.
 * 
 * @purpose Reads images and a Handlebars template, merges with invoice data, renders HTML, and outputs a PDF as a Buffer.
 * 
 * @param {string} templateName - Name of the Handlebars template (without '.hbs' extension)
 * @param {Object} invoiceData - Object containing invoice details (e.g., customer info, items, totals)
 * @returns {Promise<Buffer>} PDF data as a Buffer
 * @throws {Error} If reading template or images fails, or PDF generation fails
 * @sideEffects Reads files from disk; launches a headless browser; may consume significant memory for large PDFs
 * 
 * @example
 * import { generateInvoicePDF } from './pdfGenerator.js';
 * 
 * const invoiceData = {
 *   customerName: 'John Doe',
 *   items: [
 *     { description: 'Product A', price: 50 },
 *     { description: 'Product B', price: 30 }
 *   ],
 *   total: 80
 * };
 * 
 * const pdfBuffer = await generateInvoicePDF('invoice', invoiceData);
 * fs.writeFileSync('invoice.pdf', pdfBuffer);
 */
export async function generateInvoicePDF(
  templateName: string,
  invoiceData: any
): Promise<Buffer> {
  // Read and convert header/footer images to Base64 Data URLs
  const headerPath = path.resolve(process.cwd(), 'client/public/header.png');
  const footerPath = path.resolve(process.cwd(), 'client/public/footer.png');
  
  const headerImageBuffer = fs.readFileSync(headerPath);
  const footerImageBuffer = fs.readFileSync(footerPath);
  
  const headerImageDataUrl = `data:image/png;base64,${headerImageBuffer.toString('base64')}`;
  const footerImageDataUrl = `data:image/png;base64,${footerImageBuffer.toString('base64')}`;

  // Read Handlebars template from 'templates' directory
  const templatePath = path.resolve(__dirname, 'templates', `${templateName}.hbs`);
  const templateHtml = fs.readFileSync(templatePath, 'utf-8');

  // Compile template with Handlebars and merge with invoice data
  const template = Handlebars.compile(templateHtml);
  const html = template({
    ...invoiceData,
    headerImageDataUrl,
    footerImageDataUrl
  });

  // Launch Puppeteer headless browser and render PDF
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set page content with HTML and wait until all network requests are idle
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Generate PDF with A4 format and print background images
  const pdfUint8Array = await page.pdf({ format: 'A4', printBackground: true });

  await browser.close();

  return Buffer.from(pdfUint8Array);
}
