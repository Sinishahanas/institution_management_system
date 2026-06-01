import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { capitalizeFirstLetter, formatDateToDDMMYYYY } from "@/lib/utils";

/**
 * Represents a payment receipt for a student.
 *
 * @purpose Defines the structure of a receipt object used in the system to display or print student payment information.
 *
 * @param studentName - Full name of the student who made the payment.
 * @param receiptNumber - Unique identifier for this receipt.
 * @param paymentId - ID of the payment associated with this receipt.
 * @param receiptDate - Date when the receipt was generated (ISO string).
 * @param invoiceDate - Date of the related invoice (ISO string).
 * @param amount - Amount paid (string formatted, e.g., "1000.00").
 * @param paymentMethod - Method of payment used (e.g., "cash", "card").
 * @param remarks - Optional remarks or notes about the payment.
 * @param createdAt - Timestamp when the receipt was created (ISO string).
 * @returns Receipt object with all relevant details.
 * @throws Not applicable directly — used as a type/interface.
 * @sideEffects None — this interface is purely a type definition.
 *
 * @example
 * ```ts
 * const myReceipt: Receipt = {
 *   studentName: "John Doe",
 *   receiptNumber: "RCPT-2025-001",
 *   paymentId: "PAY-12345",
 *   receiptDate: "2025-10-02T10:15:00.000Z",
 *   invoiceDate: "2025-09-30",
 *   amount: "1500.00",
 *   paymentMethod: "cash",
 *   remarks: "Paid in full",
 *   createdAt: "2025-10-02T10:20:00.000Z"
 * };
 * ```
 */
interface Receipt {
  studentName: string;
  receiptNumber: string;
  paymentId: string;
  receiptDate: string;
  invoiceDate: string;
  amount: string;
  paymentMethod: string;
  remarks?: string;
  createdAt: string;
}

/**
 * PrintReceipt — React component to display a printable receipt.
 *
 * @purpose Fetches a receipt by its `receiptNumber` from the backend and renders a print-friendly receipt with a letterhead, footer, and relevant details.
 *
 * @param none
 * @returns JSX.Element — A printable receipt view.
 * @throws Renders an error message if fetching the receipt fails or no data is found.
 * @sideEffects
 *  - Uses `useRoute` from `wouter` to extract the receiptNumber from multiple route variants.
 *  - Uses `useQuery` from `@tanstack/react-query` to fetch the receipt from `/api/receipts/:receiptNumber`.
 *  - Provides a print button that triggers `window.print()`.
 *
 * @example
 * <PrintReceipt />
 */
export default function PrintReceipt() {
  const [, params] = useRoute("/admin/print-receipt/:receiptNumber");
  const [, params2] = useRoute("/branch-admin/print-receipt/:receiptNumber");
  const receiptNumber = params?.receiptNumber || params2?.receiptNumber;

  /**
   * Fetches a receipt based on the `receiptNumber` from either admin or branch-admin routes and manages loading and error states.
   *
   * @purpose Retrieves receipt data from the backend API (`/api/receipts/:receiptNumber`) for displaying or printing a student payment receipt.
   *
   * @param receiptNumber
   *   Extracted from the route parameters using `useRoute` from `wouter`.
   *   Can come from either:
   *   - `/admin/print-receipt/:receiptNumber`
   *   - `/branch-admin/print-receipt/:receiptNumber`
   * @returns
   *   - `receipt`: The fetched `Receipt` object containing payment details.
   *   - `isLoading`: Boolean flag indicating if the query is still loading.
   *   - `error`: Any error encountered while fetching the receipt.
   * @throws
   *   - Throws an error if `receiptNumber` is not provided.
   *   - Throws an error if the fetch response is not OK.
   * @sideEffects
   *   - Uses `useRoute` to read route parameters.
   *   - Uses `useQuery` from `@tanstack/react-query` to fetch data asynchronously.
   *   - Logs the receipt number to the console when fetching.
   *
   * @example
   * ```tsx
   * const { data: receipt, isLoading, error } = useQuery<Receipt>({
   *   queryKey: ['receipt', receiptNumber],
   *   queryFn: async () => {
   *     if (!receiptNumber) throw new Error("Receipt Number is required");
   *     const res = await fetch(`/api/receipts/${receiptNumber}`);
   *     if (!res.ok) throw new Error('Failed to fetch receipt data');
   *     return res.json();
   *   },
   *   enabled: !!receiptNumber,
   * });
   *
   * if (isLoading) return <LoadingSpinner />;
   * if (error || !receipt) return <ErrorMessage message={error?.message || "No receipt data found."} />;
   * ```
   */
  const {
    data: receipt,
    isLoading,
    error,
  } = useQuery<Receipt>({
    queryKey: ["receipt", receiptNumber],
    queryFn: async () => {
      console.log("Fetching receipt for:", receiptNumber);
      if (!receiptNumber) throw new Error("Receipt Number is required");
      const res = await fetch(`/api/receipts/${receiptNumber}`);
      if (!res.ok) throw new Error("Failed to fetch receipt data");
      return res.json();
    },
    enabled: !!receiptNumber,
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
  if (error || !receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">
          {error ? error.message : "No receipt data found."}
        </p>
      </div>
    );
  }

  // Render receipt
  return (
    <div className="bg-gray-100 py-10 print:!bg-white">
      <div className="print-content max-w-3xl mx-auto pl-8 pr-8 bg-white border-2 border-gray-300 shadow-md print:shadow-none text-sm font-sans">
        {/* Header - Letterhead */}
        <div className="mb-8">
          <img src="/header.png" alt="Letterhead" className="w-full h-24" />
        </div>
        {/* Print Button - Hidden in print view */}
        <div className="print:hidden mt-6 flex justify-end">
          <button
            onClick={() => window.print()}
            className="bg-primary text-white px-5 py-2 rounded-md hover:bg-primary/90 transition"
          >
            Print
          </button>
        </div>
        {/* Heading - Receipt */}
        <div className="text-center mb-4 mt-4">
          {/* Receipt title centered */}
          <h1 className="text-3xl font-bold text-primary">RECEIPT</h1>
        </div>

        {/* Receipt header: right-aligned number + date */}
        <div className="flex justify-between items-start mt-4 mb-4">
          <div className="ml-auto text-right">
            {/* Receipt number */}
            <h2 className="text-lg font-semibold">
              Receipt No. {receipt.receiptNumber}
            </h2>
            {/* Formatted Receipt date */}
            <p>Date: {formatDateToDDMMYYYY(receipt.receiptDate)}</p>
          </div>
        </div>

        <hr className="border border-dashed my-4" />

        {/* Receipt details table */}
        <table className="w-full text-sm border border-gray-300 mt-6">
          <tbody>
            {/* Row for 'Received From' field */}
            <tr className="border-b border-gray-300">
              <td className="font-semibold px-3 py-2 w-1/4 bg-gray-100">
                Received From
              </td>
              <td className="px-3 py-2">{receipt.studentName}</td>
            </tr>
            {/* Row for 'For' field */}
            <tr className="border-b border-gray-300">
              <td className="font-semibold px-3 py-2 bg-gray-100">For</td>
              <td className="px-3 py-2">Course Payment / Fee</td>
            </tr>
            {/* Row for 'Amount' field */}
            <tr className="border-b border-gray-300">
              <td className="font-semibold px-3 py-2 bg-gray-100">Amount</td>
              <td className="px-3 py-2">AED {receipt.amount}</td>
            </tr>
            {/* Row for 'Payment ID' field */}
            <tr className="border-b border-gray-300">
              <td className="font-semibold px-3 py-2 bg-gray-100">
                Payment ID
              </td>
              <td className="px-3 py-2">{receipt.paymentId}</td>
            </tr>
            {/* Row for 'Payment Method' field */}
            <tr className="border-b border-gray-300">
              <td className="font-semibold px-3 py-2 bg-gray-100">
                Payment Method
              </td>
              <td className="px-3 py-2">
                {capitalizeFirstLetter(receipt.paymentMethod)}
              </td>
            </tr>
            {/* Row for 'Invoice Date' field */}
            <tr className="border-b border-gray-300">
              <td className="font-semibold px-3 py-2 bg-gray-100">
                Invoice Date
              </td>
              <td className="px-3 py-2">
                {formatDateToDDMMYYYY(receipt.invoiceDate)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Remarks */}
        {receipt.remarks && (
          <div className="mt-6">
            <p className="text-xs text-gray-600">
              <strong>Remarks:</strong> {receipt.remarks}
            </p>
          </div>
        )}

        {/* <div className="flex justify-between mt-10">
          <div className="text-xs text-gray-500">
            <p>📧Institution@gmail.com</p>
            <p>📞 +971-555-555555</p>
            <p>📍 Dubai, UAE</p>
          </div>
        </div> */}

        {/* Footer */}
        <div className="mt-12">
          <img src="/footer.png" alt="Footer" className="w-full" />
        </div>
      </div>
    </div>
  );
}
