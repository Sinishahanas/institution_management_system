import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { capitalizeFirstLetter, formatDateToDDMMYYYY } from "@/lib/utils";

/**
 * CreditNote — represents a credit note issued to a student or customer.
 *
 * @purpose Encapsulate all details of a credit note including student, applied invoice, amount, reason, and status.
 *
 * @params
 *  - `studentName` — `string` — Full name of the student/customer receiving the credit note.
 *  - `creditNoteNumber` — `string` — Unique identifier for the credit note.
 *  - `generatedMonth` — `string` — Month for which the credit note is generated (format: YYYY-MM).
 *  - `appliedInvoiceId` — `string` — Internal ID of the invoice to which this credit note is applied.
 *  - `invoiceNumber` — `string` — Display invoice number associated with this credit note.
 *  - `appliedToType` — `string` — Type of entity the credit note is applied to (e.g., "invoice", "advance").
 *  - `amount` — `string` — Amount credited (string to preserve currency formatting).
 *  - `reason` — `string` — Reason for issuing the credit note.
 *  - `status` — `string` — Current status of the credit note (e.g., "pending", "approved", "rejected").
 *  - `createdAt` — `string` — Date when the credit note was created (ISO format).
 * @returns {CreditNote} A fully structured credit note object.
 * @throws None
 * @sideEffects None
 *
 * @example
 * ```ts
 * const creditNote: CreditNote = {
 *   studentName: "John Doe",
 *   creditNoteNumber: "CN-2025-0456",
 *   generatedMonth: "2025-10",
 *   appliedInvoiceId: "INV-2025-1001",
 *   invoiceNumber: "INV-2025-1001",
 *   appliedToType: "invoice",
 *   amount: "500.00",
 *   reason: "Overpayment correction",
 *   status: "approved",
 *   createdAt: "2025-10-02T14:23:00Z"
 * };
 * ```
 */
interface CreditNote {
  studentName: string;
  creditNoteNumber: string;
  generatedMonth: string;
  appliedInvoiceId: string;
  invoiceNumber: string;
  appliedToType: string;
  amount: string;
  reason: string;
  status: string;
  createdAt: string;
}

/**
 * PrintCreditNote — React component to render a printable credit note.
 *
 * @purpose Displays a detailed credit note with student/customer, invoice, amount, reason, and status,
 *   with a print-friendly layout including a letterhead and footer.
 *
 * @param none
 * @returns JSX.Element — A printable credit note view.
 * @throws Renders error messages if fetching the credit note fails.
 * @sideEffects
 *  - Uses `useRoute` to extract the creditNoteNumber from multiple possible routes.
 *  - Uses `useQuery` to fetch the credit note data.
 *  - Provides a print button that triggers `window.print()`.
 *
 * @example
 * <PrintCreditNote />
 */
export default function PrintCreditNote() {
  const [, params] = useRoute("/admin/print-credit-note/:creditNoteNumber");
  const [, params2] = useRoute("/parent/print-credit-note/:creditNoteNumber");
  const [, params3] = useRoute(
    "/branch-admin/print-credit-note/:creditNoteNumber",
  );
  const creditNoteNumber =
    params?.creditNoteNumber ||
    params2?.creditNoteNumber ||
    params3?.creditNoteNumber;

  /**
   * Fetches a single credit note by its creditNoteNumber.
   *
   * @purpose Retrieve a specific credit note from the backend API for printing.
   *
   * @param none - The queryKey is dynamically composed using the creditNoteNumber from the route.
   * @returns {{
   *   data: CreditNote | undefined;
   *   isLoading: boolean;
   *   error?: unknown;
   * }}
   *  - `data`: The credit note object fetched from `/api/creditNotes/:creditNoteNumber`.
   *  - `isLoading`: Boolean indicating if the query is still in progress.
   *  - `error`: Optional error object if the fetch fails.
   * @throws Throws an error if creditNoteNumber is undefined or fetch fails.
   * @sideEffects
   *  - Makes an HTTP request to `/api/creditNotes/:creditNoteNumber` to retrieve the credit note.
   *  - Subscribes to react-query cache for the key `['creditNote', creditNoteNumber]`.
   *
   * @example
   * const { data: creditNote, isLoading, error } = useQuery<CreditNote>({
   *   queryKey: ['creditNote', creditNoteNumber],
   *   queryFn: async () => {
   *     if (!creditNoteNumber) throw new Error("Credit Note Number is required");
   *     const res = await fetch(`/api/creditNotes/${creditNoteNumber}`);
   *     if (!res.ok) throw new Error('Failed to fetch credit note data');
   *     return res.json();
   *   },
   *   enabled: !!creditNoteNumber,
   * });
   */
  const {
    data: creditNote,
    isLoading,
    error,
  } = useQuery<CreditNote>({
    queryKey: ["creditNote", creditNoteNumber],
    queryFn: async () => {
      //   console.log('Fetching credit note for:', creditNoteNumber);
      if (!creditNoteNumber) throw new Error("Credit Note Number is required");
      const res = await fetch(`/api/creditNotes/${creditNoteNumber}`);
      if (!res.ok) throw new Error("Failed to fetch credit note data");
      return res.json();
    },
    enabled: !!creditNoteNumber,
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
  if (error || !creditNote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">
          {error ? error.message : "No credit note data found."}
        </p>
      </div>
    );
  }

  // Render credit note
  return (
    <div className="bg-gray-100 py-10 print:!bg-white">
      <div className="print-content max-w-3xl mx-auto pl-8 pr-8 bg-white border-2 border-gray-300 shadow-md print:shadow-none text-sm font-sans">
        {/* Letterhead */}
        <div className="mb-8">
          <img src="/header.png" alt="Letterhead" className="w-full h-24" />
        </div>
        {/* Print Button - hidden */}
        <div className="print:hidden mt-6 flex justify-end">
          <button
            onClick={() => window.print()}
            className="bg-primary text-white px-5 py-2 rounded-md hover:bg-primary/90 transition"
          >
            Print
          </button>
        </div>
        {/* Credit note header */}
        <div className="text-center mb-4 mt-4">
          <h1 className="text-3xl font-bold text-primary">CREDIT NOTE</h1>
        </div>
        {/* Credit note details */}
        <div className="flex justify-between items-start mt-4 mb-4">
          <div className="ml-auto text-right">
            <h2 className="text-lg font-semibold">
              Credit Note No. {creditNote.creditNoteNumber}
            </h2>
            <p>Date: {formatDateToDDMMYYYY(creditNote.createdAt)}</p>
          </div>
        </div>

        {/* Credit note table */}
        <hr className="border border-dashed my-4" />
        {/* Table container with full width, small text, and a border */}
        <table className="w-full text-sm border border-gray-300 mt-6">
          <tbody>
            {/* Row for 'Issued To' field */}
            <tr className="border-b border-gray-300">
              <td className="font-semibold px-3 py-2 w-1/4 bg-gray-100">
                Issued To
              </td>
              {/* Display the student name from the creditNote object */}
              <td className="px-3 py-2">{creditNote.studentName}</td>
            </tr>
            {/* Row for 'For' field */}
            <tr className="border-b border-gray-300">
              <td className="font-semibold px-3 py-2 bg-gray-100">For</td>
              {/* Display the reason from the creditNote object */}
              <td className="px-3 py-2">{creditNote.reason}</td>
            </tr>
            {/* Row for 'Amount' field */}
            <tr className="border-b border-gray-300">
              <td className="font-semibold px-3 py-2 bg-gray-100">Amount</td>
              {/* Display the amount from the creditNote object */}
              <td className="px-3 py-2">AED {creditNote.amount}</td>
            </tr>
            {/* Row for 'Applied To' field */}
            <tr className="border-b border-gray-300">
              <td className="font-semibold px-3 py-2 bg-gray-100">
                Applied To
              </td>
              {/* Row for 'Applied To' field, formatted with capitalized text */}
              <td className="px-3 py-2">
                {capitalizeFirstLetter(creditNote.appliedToType)}
              </td>
            </tr>
            {/* Row for 'Against' field */}
            <tr className="border-b border-gray-300">
              <td className="font-semibold px-3 py-2 bg-gray-100">Against</td>
              <td className="px-3 py-2">{creditNote.invoiceNumber}</td>
            </tr>
            {/* Row for 'Generated Month' field */}
            <tr className="border-b border-gray-300">
              <td className="font-semibold px-3 py-2 bg-gray-100">
                Generated Month
              </td>
              {/* Display the generatedMonth from the creditNote object */}
              <td className="px-3 py-2">{creditNote.generatedMonth}</td>
            </tr>
            {/* Row for 'Status' field - capitalized text */}
            <tr className="border-b border-gray-300">
              <td className="font-semibold px-3 py-2 bg-gray-100">Status</td>
              <td className="px-3 py-2">
                {capitalizeFirstLetter(creditNote.status)}
              </td>
            </tr>
          </tbody>
        </table>

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
