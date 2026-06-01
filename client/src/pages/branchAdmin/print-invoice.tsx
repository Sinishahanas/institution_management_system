import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';

/**
 * BillTo — billing recipient details
 *
 * @purpose Represent the customer or entity being billed in the invoice.
 * @params
 *  - `name` — `string` — Recipient's full name or company name.
 *  - `address` — `string | null` — Billing address of the recipient; `null` if not provided.
 * @returns {BillTo} A structured object with customer billing details.
 * @throws None
 * @sideEffects None
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
 * @params
 *  - `si_no` — `number` — Serial number of the line item.
 *  - `description` — `string` — Short description of the item/service.
 *  - `quantity` — `number` — Number of units for the item.
 *  - `price` — `number` — Price per unit before discounts.
 *  - `discount` — `number` — Discount applied to this line item (value depends on discountType).
 *  - `discountType` — `string` — Whether discount is `"percentage"` or `"fixed"`.
 *  - `lineTotal` — `number` — Final total for this line after applying discount.
 * @returns {LineItem} A single invoice item entry.
 * @throws None
 * @sideEffects None
 * @example
 * ```ts
 * const lineItem: LineItem = {
 *   si_no: 1,
 *   description: "Bollywood",
 *   quantity: 2,
 *   price: 300,
 *   discount: 5,
 *   discountType: "percentage",
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
  discountType: string;
  lineTotal: number;
}


/**
 * Summary — totals and invoice calculations
 *
 * @purpose Capture invoice-level financial summary including discounts, VAT, and the final total.
 * @params
 *  - `totalPrice` — `number` — Sum of line totals before invoice-level discount or VAT.
 *  - `discount` — `number` — Total discount applied across invoice (if any).
 *  - `vatAmount` — `number` — VAT/GST tax applied on the invoice.
 *  - `grandTotal` — `number` — Final payable amount after discounts and VAT.
 * @returns {Summary} An object with invoice summary figures.
 * @throws None
 * @sideEffects None
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

// A simple utility to format currency
// const formatCurrency = (amount: number) => {
//   return amount.toFixed(2);
// };
/**
 * Format a number (or numeric string) as a currency string with two decimals.
 *
 * @purpose Convert numeric values (number|string|null|undefined) into a fixed 2-decimal string suitable for display in invoices.
 * @params
 *  - amount: number | string | null | undefined — the input numeric value to format.
 * @returns {string} A string with two decimal places (e.g. "123.45"). If the input is not a number, returns "0.00".
 * @throws None — this function swallows parse failures and returns "0.00".
 * @sideEffects None — pure function.
 * @example
 * // formatCurrency(123) -> "123.00"
 * // formatCurrency("45.6") -> "45.60"
 * // formatCurrency(null) -> "0.00"
 */
const formatCurrency = (amount: number | string | null | undefined): string => {
  const num = parseFloat(amount as any);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
};


/**
 * BranchAdminPrintInvoice React component
 *
 * @purpose Fetch invoice data (by route param invoiceId) and render a printable invoice page.
 * @param none (component reads the `:invoiceId` route param via `useRoute`).
 * @returns {JSX.Element} A React element containing the invoice view or loading/error states.
 * @throws Network errors are thrown inside the `useQuery` queryFn and surfaced via `error` (react-query).
 * @sideEffects
 *  - Triggers a network request to `/api/payments/invoice/:invoiceId` (react-query).
 *  - Calls `window.print()` when the user clicks the Print button (direct browser side-effect).
 * @example
 * // Mount this route in your router: <Route path="/admin/print-invoice/:invoiceId" component={BranchAdminPrintInvoice} />
 * // Visiting /admin/print-invoice/INV-123 will fetch /api/payments/invoice/INV-123 and render the invoice.
 */
export default function BranchAdminPrintInvoice() {
  const [, params] = useRoute('/admin/print-invoice/:invoiceId');
  const invoiceId = params?.invoiceId;

  /**
   * Fetch invoice data for the given invoiceId.
   *
   * @purpose Retrieve a single invoice from backend for printing.
   * @param none (uses invoiceId from the route).
   * @returns InvoiceData via react-query `data`.
   * @throws The queryFn throws an Error if invoiceId is missing or the fetch response is not ok.
   * @sideEffects Initiates an HTTP request to `/api/payments/invoice/${invoiceId}` when enabled.
   * @example
   * const { data: invoice, isLoading, error } = useQuery<InvoiceData>({
   *   queryKey: ['invoice', invoiceId],
   *   enabled: !!invoiceId
   * });
   */
  const { data: invoice, isLoading, error } = useQuery<InvoiceData>({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      if (!invoiceId) throw new Error("Invoice ID is required");
      const res = await fetch(`/api/payments/invoice/${invoiceId}`);
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
        {/* Header */}
        <div className="mb-8">
          <img 
            src="/header.png" 
            alt="Letterhead"
            className="w-full h-24"
          />
        </div>

        {/* Print Button - hidden in print */}
        <div className="print:hidden mb-4 flex justify-end">
          <button
            onClick={() => window.print()}
            className="bg-primary text-white px-5 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Print
          </button>
        </div>

        {/* Invoice Heading */}
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">PROFORMA INVOICE</h1>
        </div>
        
        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              {/* Billing Info */}
                <h3 className="text-gray-500 text-sm font-medium mb-1">BILL TO</h3>
                <p className="font-bold text-lg">{invoice.billTo.name}</p>
                <p className="text-gray-600">{invoice.billTo.address || ''}</p>
            </div>
            <div className='text-right'>
              {/* Invoice Info */}
                <p><span className="font-bold">INVOICE NO:</span> {invoice.invoiceNumber}</p>
                <p>
                    <span className="font-bold">ISSUE DATE:</span>{' '}
                    {new Date(invoice.issueDate).toLocaleDateString()}
                </p>
                <p>
                    <span className="font-bold">PAYMENT METHOD:</span>{' '}
                    {invoice.paymentMethod || 'N/A'}
                </p>
            </div>
        </div>

        {/* Invoice Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary text-white">
                {/* Table Headers */}
                <th className="text-left py-2 px-3">SI NO</th>
                <th className="text-left py-2 px-3">ITEM/DESCRIPTION</th>
                <th className="text-center py-2 px-3">QTY</th>
                <th className="text-right py-2 px-3">PRICE</th>
                <th className="text-right py-2 px-3">DISCOUNT</th>
                <th className="text-right py-2 px-3">LINE TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item) => (
                <tr key={item.si_no} className="border-b">
                  <td className="py-3 px-3">{item.si_no}</td>
                  <td className="py-3 px-3">{item.description}</td>
                  <td className="text-center py-3 px-3">{item.quantity}</td>
                  <td className="text-right py-3 px-3">{formatCurrency(item.price)}</td>
                  <td className="text-right py-3 px-3">{item.discount}</td>
                  {/* <td className="text-right py-3 px-3">
                    {item.discountType === 'percentage'
                      ? `${item.discount}%`
                      : formatCurrency(item.discount)}
                  </td> */}
                  <td className="text-right py-3 px-3 font-semibold">{formatCurrency(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Summary Totals */}
        <div className="flex justify-between">
            <div>
              {/* If remarks are present, display them */}
                {invoice.remarks && (
                    <>
                        <h3 className="text-gray-500 text-sm font-medium mb-2">Notes:</h3>
                        <p className="text-gray-600 border p-2 rounded max-w-xs">{invoice.remarks}</p>
                    </>
                )}
            </div>
            {/* final total and summary */}
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
        
        {/* Footer -image */}
        <div className="mt-12">
          <img 
            src="/footer.png" 
            alt="Footer" 
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}