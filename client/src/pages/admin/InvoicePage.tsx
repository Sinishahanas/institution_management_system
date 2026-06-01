import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { extractMonth, formatDateToDDMMYYYY } from '@/lib/utils';

/**
 * BillTo — billing recipient details
 *
 * @purpose Represent the customer or entity being billed in the invoice.
 * 
 * @params
 *  - `name` — `string` — Recipient's full name or company name.
 *  - `address` — `string | null` — Billing address of the recipient; `null` if not provided.
 * @returns {BillTo} A structured object with customer billing details.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * ```ts
 * const billTo: BillTo = {
 *   name: "Mary Paul",
 *   address: "123 Business Centre, Al Karama, UAE"
 * };
 * ```
 */
interface BillTo {
  name: string;
  address: string | null;
}

/**
 * LineItem — single invoice row
 *
 * @purpose Represent one item or service included in the invoice.
 * 
 * @params
 *  - `si_no` — `number` — Serial number of the line item.
 *  - `description` — `string` — Short description of the item/service.
 *  - `quantity` — `number` — Number of units for the item.
 *  - `price` — `number` — Price per unit before discounts.
 *  - `discount` — `number` — Discount applied to this line item (value depends on discountType).
 *  - `discountType` — `string` — Whether discount is `"percentage"` or `"fixed"`.
 *  - `discountValue` — `number` — Discount amount (applies only if discountType is `"fixed"`).
 *  - `lineTotal` — `number` — Final total for this line after applying discount.
 * @returns {LineItem} A single invoice item entry.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * ```ts
 * const lineItem: LineItem = {
 *   si_no: 1,
 *   description: "Bollywood",
 *   quantity: 2,
 *   price: 300,
 *   discount: 5,
 *   discountType: "percentage",
 *   discountValue: 10,
 *   lineTotal: 285
 * };
 * ```
 */
interface LineItem {
  si_no: number;
  description: string;
  quantity: number;
  price: number;
  discount: number;
  discountType?: string;
  discountValue?: number;
  lineTotal: number;
}

/**
 * Summary — totals and invoice calculations
 *
 * @purpose Capture invoice-level financial summary including discounts, VAT, and the final total.
 * 
 * @params
 *  - `totalPrice` — `number` — Sum of line totals before invoice-level discount or VAT.
 *  - `discount` — `number` — Total discount applied across invoice (if any).
 *  - `vatAmount` — `number` — VAT/GST tax applied on the invoice.
 *  - `grandTotal` — `number` — Final payable amount after discounts and VAT.
 * @returns {Summary} An object with invoice summary figures.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * ```ts
 * const summary: Summary = {
 *   totalPrice: 300,
 *   discount: 15,
 *   vatAmount: ,
 *   grandTotal: 285
 * };
 * ```
 */
interface Summary {
  totalPrice: number;
  discount: number;
  vatAmount: number;
  grandTotal: number;
}


/**
 * InvoiceData — complete invoice structure
 *
 * @purpose Represent the entire invoice payload returned by API and used by UI/printing.
 * 
 * @params
 *  - `invoiceNumber` — `string` — Unique invoice identifier.
 *  - `issueDate` — `string` — Invoice issue date in ISO string format.
 *  - `paymentMethod` — `string | null` — Payment method used, or null if not provided.
 *  - `billTo` — `BillTo` — Billing recipient details.
 *  - `lineItems` — `LineItem[]` — List of all items/services billed.
 *  - `summary` — `Summary` — Invoice totals and calculations.
 *  - `status` — `"paid" | "pending" | "failed"` (optional) — Current invoice payment status.
 *  - `remarks` — `string | null` (optional) — Extra notes or comments about the invoice.
 * @returns {InvoiceData} A complete invoice object with header, details, and totals.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * ```ts
 * const invoice: InvoiceData = {
 *   invoiceNumber: "INV-2025-1001",
 *   issueDate: "2025-10-02",
 *   paymentMethod: "Credit Card",
 *   billTo: {
 *     name: "John Doe",
 *     address: "45 Green Street, Bangalore"
 *   },
 *   lineItems: [
 *     {
 *       si_no: 1,
 *       description: "Web Hosting Package",
 *       quantity: 1,
 *       price: 5000,
 *       discount: 500,
 *       discountType: "fixed",
 *       lineTotal: 4500
 *     },
 *     {
 *       si_no: 2,
 *       description: "Domain Registration",
 *       quantity: 1,
 *       price: 1200,
 *       discount: 0,
 *       discountType: "fixed",
 *       lineTotal: 1200
 *     }
 *   ],
 *   summary: {
 *     totalPrice: 6200,
 *     discount: 500,
 *     vatAmount: 918,
 *     grandTotal: 6618
 *   },
 *   status: "pending",
 *   remarks: "Payment due within 15 days."
 * };
 * ```
 */
interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  paymentMethod: string | null;
  billTo: BillTo;
  lineItems: LineItem[];
  summary: Summary;
  status?: 'paid' | 'pending' | 'failed';
  remarks?: string | null;
}

/**
 * Formats a given amount as a currency string with 2 decimal places.
 *
 * @purpose Convert numbers or numeric strings into a string with exactly 2 decimal places.
 * 
 * @param amount: number | string | null | undefined — The value to format. Can be a number, string, null, or undefined.
 * @returns A string representing the amount with 2 decimal places. Returns `'0.00'` if the input is not a valid number.
 * @throws None — invalid numbers are safely handled and converted to `'0.00'`.
 * @sideEffects None
 * 
 * @example
 * ```ts
 * formatCurrency(123);           // "123.00"
 * formatCurrency("45.678");      // "45.68"
 * formatCurrency(null);          // "0.00"
 * formatCurrency("abc");         // "0.00"
 * ```
 */
const formatCurrency = (amount: number | string | null | undefined): string => {
  const num = parseFloat(amount as any);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
};

/**
 * InvoicePage Component
 *
 * @purpose
 * - Displays a detailed invoice for an individual invoice ID.
 * - Supports multiple routes: admin, parent, and branch-admin.
 * - Allows printing the invoice in a clean format with a header/footer.
 *
 * @param None
 * @returns JSX.Element - The rendered invoice page.
 * @throws Throws error if invoice ID is missing or fetch fails.
 * @sideEffects
 * - Uses `useRoute` to extract invoiceId from URL.
 * - Fetches invoice data via `react-query`.
 * - Displays loading spinner while fetching.
 * - Displays error message if fetch fails or invoice not found.
 * - Provides a print button that triggers `window.print()`.
 *
 * @example
 * ```tsx
 * // Admin route
 * <Route path="/admin/invoice/:invoiceId" component={InvoicePage} />
 * ```
 */
export default function InvoicePage() {
  // Extract invoiceId from multiple possible routes
  const [, params] = useRoute('/admin/invoice/:invoiceId');
  const [, params2] = useRoute('/parent/invoice/:invoiceId');
  const [, params3] = useRoute('/branch-admin/invoice/:invoiceId');
  const invoiceId = params?.invoiceId || params2?.invoiceId || params3?.invoiceId;

  /**
   * Fetch invoice data for the given invoiceId.
   *
   * @purpose Retrieve a single invoice from backend for printing.
   * 
   * @param none (uses invoiceId from the route).
   * @returns InvoiceData via react-query `data`.
   * @throws The queryFn throws an Error if invoiceId is missing or the fetch response is not ok.
   * @sideEffects Initiates an HTTP request to `/api/payments/invoice/${invoiceId}` when enabled.
   * 
   * @example
   * ```tsx
   * const { data: invoice, isLoading, error } = useQuery<InvoiceData>({
   *   queryKey: ['invoice', invoiceId],
   *   enabled: !!invoiceId
   * });
   * ```
   */
  const { data: invoice, isLoading, error } = useQuery<InvoiceData>({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      if (!invoiceId) throw new Error("Invoice ID is required");
      const res = await fetch(`/api/invoices/${invoiceId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch invoice data');
      }
      return res.json();
    },
    enabled: !!invoiceId,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Error state
  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">
          {error ? error.message : "No invoice data found."}
        </p>
      </div>
    );
  }

  return (
    <div className="print:!block print:!m-0 print:!p-0 bg-gray-100 py-10">
      <div className="print-content max-w-4xl mx-auto pl-8 pr-8 bg-white shadow-lg print:shadow-none">
        {/* Header image */}
        <div className="mb-8">
          <img src="/header.png" alt="Letterhead" className="w-full h-24" />
        </div>

        {/* Print Button (hidden in print) */}
        <div className="print:hidden mb-4 flex justify-end">
          <button
            onClick={() => window.print()}
            className="bg-primary text-white px-5 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Print
          </button>
        </div>

        {/* Invoice Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">TAX INVOICE</h1>
        </div>

        {/* Billing & Invoice Info */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            {/* Billing Info */}
            <h3 className="text-gray-500 text-sm font-medium mb-1">BILL TO</h3>
            <p className="font-bold text-lg">{invoice.billTo?.name}</p>
            <p className="text-gray-600">{invoice.billTo?.address || ''}</p>
          </div>
          
          {/* Invoice Info */}
          <div className="text-right">
            <p><span className="font-bold">INVOICE NO:</span> {invoice.invoiceNumber}</p>
            <p>
              <span className="font-bold">INVOICE DATE:</span>{' '}
              {formatDateToDDMMYYYY(invoice.issueDate)}
            </p>
            <p>
              <span className="font-bold">Invoice Month:</span>{' '}
              {extractMonth(invoice.invoiceNumber).monthName}
            </p>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary text-white">
                <th className="text-left py-2 px-3">SI NO</th>
                <th className="text-left py-2 px-3">ITEM/DESCRIPTION</th>
                <th className="text-center py-2 px-3">QTY</th>
                <th className="text-right py-2 px-3">PRICE</th>
                <th className="text-right py-2 px-3">DISCOUNT</th>
                <th className="text-right py-2 px-3">LINE TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item) => {
                const isExtraDiscount = item.description === 'Extra Discount';
                return (
                <tr key={item.si_no} className="border-b">
                  <td className="py-3 px-3">{item.si_no}</td>
                  <td className="py-3 px-3">{item.description}</td>
                  <td className="text-center py-3 px-3">{isExtraDiscount ? '' : item.quantity}</td>
                  <td className="text-right py-3 px-3">{isExtraDiscount ? '' :formatCurrency(item.price)}</td>
                  {/* <td className="text-right py-3 px-3">
                    {item.discountType === 'percentage'
                      ? `${item.discount}%`
                      : (item.discount)}
                  </td> */}
                  <td className="text-right py-3 px-3">
                    {isExtraDiscount ? '' :formatCurrency(item.discountValue)}
                  </td>
                  <td className={`text-right py-3 px-3 font-semibold ${isExtraDiscount ? 'text-red-500' : ''}`}>
                    {isExtraDiscount ? `- ${formatCurrency(item.lineTotal)}` : formatCurrency(item.lineTotal)}
                  </td>
                </tr>
              )
              })}
            </tbody>
          </table>
        </div>

        {/* Summary Totals */}
        <div className="flex justify-between">
          <div>
            {invoice.remarks && (
              <>
              {/* If remarks are present, display them */}
                <h3 className="text-gray-500 text-sm font-medium mb-2">Notes:</h3>
                <p className="text-gray-600 border p-2 rounded max-w-xs">{invoice.remarks}</p>
              </>
            )}
          </div>

          {/* final total info */}
          <div className="w-1/3 text-right">
            <div className="flex justify-between mb-2">
              <span className="font-medium">TOTAL PRICE</span>
              <span>{formatCurrency(invoice.summary.totalPrice)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium text-red-500">DISCOUNT</span>
              <span className="text-red-500">- {formatCurrency(invoice.summary.discount)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">VAT INCLUSIVE</span>
              <span>({formatCurrency(invoice.summary.vatAmount)})</span>
            </div>
            <div className="flex justify-between mt-4 pt-2 border-t-2 border-gray-400">
              <span className="font-bold text-lg">GRAND TOTAL</span>
              <span className="font-bold text-lg">{formatCurrency(invoice.summary.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Footer Image */}
        <div className="mt-12">
          <img src="/footer.png" alt="Footer" className="w-full" />
        </div>
      </div>
    </div>
  );
}
