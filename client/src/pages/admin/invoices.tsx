import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { AppShell } from "@/components/layout/app-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PlusCircle,
  Download,
  Filter,
  Search,
  ArrowUpDown,
  FileText,
  CreditCard,
  Banknote,
  CheckCircle,
  XCircle,
  AlertCircle,
  Receipt,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Invoice, Student } from "@shared/schema";


/**
 * invoiceFormSchema — Zod schema for creating/editing invoices.
 *
 * @purpose Validate invoice creation/edit payloads in the UI. Ensures required fields are present and that `amount` and dates are valid.
 *
 * @param None
 * @returns {ZodType} A Zod object schema that validates invoice form values.
 * @throws None
 * @sideEffects None
 *
 * @example
 * // use with react-hook-form + zodResolver
 * const form = useForm({ resolver: zodResolver(invoiceFormSchema) });
 */
const invoiceFormSchema = z.object({
  studentId: z.number({
    required_error: "Please select a student",
  }),
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  status: z.string({
    required_error: "Please select a status",
  }),
  paymentMethod: z.string().optional(),
  paymentDate: z.date().optional(),
  remarks: z.string().optional(),
});


/**
 * StatusBadge — small presentational component that renders a badge for invoice/payment status.
 *
 * @purpose
 * - Display a styled badge for a given `status` string (e.g. "paid", "pending", "failed", "cancelled").
 * - Centralizes mapping between status values and UI variants/labels.
 *
 * @param {Object} props - Component props.
 * @param {string} props.status - Status string to display (case-sensitive keys used: "paid", "pending", "failed", "cancelled").
 * @returns {JSX.Element} A Badge component with the appropriate variant and label.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <StatusBadge status="paid" /> // renders Badge with label "Paid"
 */
const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<
    string,
    {
      variant: "default" | "destructive" | "outline" | "secondary";
      label: string;
    }
  > = {
    paid: { variant: "default", label: "Paid" },
    pending: { variant: "secondary", label: "Pending" },
    failed: { variant: "destructive", label: "Failed" },
    cancelled: { variant: "outline", label: "Cancelled" },
  };

  const { variant, label } = variants[status] || {
    variant: "outline",
    label: status,
  };

  return <Badge variant={variant}>{label}</Badge>;
};

/**
 * InvoicesPage Component
 *
 * @purpose
 * - Displays and manages student invoices.
 * - Features include:
 *    - Fetching invoices and student data from APIs.
 *    - Searching invoices by invoice ID or student name.
 *    - Filtering invoices by status (paid, pending, failed, cancelled).
 *    - Viewing invoice details via a link.
 *    - Cancelling invoices with a confirmation dialog.
 *    - Dashboard metrics like total invoices, pending/collected payments, collection rate.
 *    - Recent transaction and payment method distribution overview.
 * 
 * @param {} - This component does not accept any props.
 * @returns {JSX.Element} - The rendered invoices management page with tabs and tables.
 * @throws {Error} Throws an error if fetching invoices or students fails. Errors are displayed in the UI via `react-query` error handling.
 * @sideEffects
 * - Fetches invoices and student data using `useQuery`.
 * - Executes cancellation API via `useMutation`.
 * - Shows toast notifications on success/error.
 * - Invalidates queries after cancellation to refresh the table.
 * - Opens/closes dialogs and updates component state.
 *
 * @example
 * ```tsx
 * import { Route } from "wouter";
 * import InvoicesPage from "@/pages/admin/invoices";
 *
 * <Route path="/admin/invoices" component={InvoicesPage} />
 * ```
 */
export default function InvoicesPage() {
  const { toast } = useToast();

  /** Search term for filtering invoices */
  const [searchTerm, setSearchTerm] = useState("");

  /** Status filter for invoices: all, paid, pending, failed, cancelled */
  const [statusFilter, setStatusFilter] = useState("all");

  /** Controls the cancel invoice dialog visibility */
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  /** Holds the ID of the selected invoice to cancel */
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(
    null
  );

  /**
   * useQuery — Fetch invoices from `/api/invoices`.
   *
   * @purpose Retrieve invoices list for display, filtering, and aggregation.
   *
   * @param None (query key: ["/api/invoices"])
   * @returns {Object} React Query object with:
   *   - data: Invoice[] | undefined
   *   - isLoading: boolean
   *   - error: any
   * @throws None (errors are captured in `error` instead of thrown).
   * @sideEffects Initiates a fetch request to `/api/invoices`.
   *
   * @example
   * const { data: invoices } = useQuery({ queryKey: ["/api/invoices"] });
   */
  const {
    data: invoices,
    isLoading: invoicesLoading,
    error: invoicesError,
  } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
    retry: false,
  });

  /**
   * useQuery — Fetch students from `/api/students`.
   *
   * @purpose Retrieve the student list for mapping student details to invoices.
   *
   * @param None (query key: ["/api/students"])
   * @returns {Object} React Query object with:
   *   - data: Student[] | undefined
   *   - isLoading: boolean
   * @throws None (errors are captured internally).
   * @sideEffects Initiates a fetch request to `/api/students`.
   *
   * @example
   * const { data: students } = useQuery({ queryKey: ["/api/students"] });
   */
  const { data: students, isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
    retry: false,
  });

  /**
   * Cancel Invoice Mutation
   *
   * @purpose Sends a PUT request to cancel a specific invoice, shows toast notifications for success or failure, and updates the invoices query cache.
   *
   * @param {number} invoiceId - The unique ID of the invoice to cancel.
   * @returns {Promise<any>} Resolves with the API response on success.
   * @throws {Error} Throws if the network request fails or if the API responds with an error.
   * @sideEffects
   * - Displays toast notifications for success or error.
   * - Invalidates `/api/invoices` query to refresh invoice data.
   * - Closes the cancel dialog after completion.
   *
   * @example
   * ```tsx
   * const { mutate: cancelInvoice } = cancelInvoiceMutation;
   * cancelInvoice(123); // Cancels invoice with ID 123
   * ```
   */
  const cancelInvoiceMutation = useMutation({
    // The order of arguments has been corrected here
    mutationFn: (invoiceId: number) =>
      apiRequest("PUT", `/api/invoices/cancel/${invoiceId}`),

    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Invoice has been cancelled successfully.",
      });
      // Invalidate and refetch the invoices query to update the list
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    },
    onError: (error: any) => {
      // It's good practice to parse the error message from the server if available
      const errorMessage =
        error?.response?.data?.error ||
        error.message ||
        "An unexpected error occurred.";
      toast({
        variant: "destructive",
        title: "Error Cancelling Invoice",
        description: errorMessage,
      });
    },
    onSettled: () => {
      // Close the dialog whether the mutation succeeds or fails
      setIsCancelDialogOpen(false);
      setSelectedInvoiceId(null);
    },
  });

  /**
   * Opens the cancel confirmation dialog for a specific invoice.
   *
   * @purpose Stores the selected invoice ID and opens the cancel dialog modal.
   *
   * @param {number} invoiceId - The unique ID of the invoice to cancel.
   * @returns {void}
   * @sideEffects
   * - Updates component state by setting the selected invoice ID.
   * - Opens the invoice cancellation confirmation dialog.
   * @throws {Error} Throws if state updates fail or if `invoiceId` is invalid.
   *
   * @example
   * handleOpenCancelDialog(42); // Opens the cancel dialog for invoice with ID 42
   */
  const handleOpenCancelDialog = (invoiceId: number) => {
    setSelectedInvoiceId(invoiceId);
    setIsCancelDialogOpen(true);
  };

  /**
   * Handle Confirm Cancel
   *
   * @purpose Confirms the cancellation of the selected invoice by triggering the cancel mutation.
   *
   * @param None
   * @returns void
   * @throws None (directly) Any errors that occur during the mutation are handled in the mutation's `onError` callback.
   * @sideEffects
   * - Sends a cancel request for the selected invoice via `cancelInvoiceMutation`.
   * - May trigger toast notifications, query invalidation, and dialog closure depending on mutation callbacks.
   * 
   * @example
   * handleConfirmCancel(); // Cancels the currently selected invoice if an ID is set
   */
  const handleConfirmCancel = () => {
    if (selectedInvoiceId) {
      cancelInvoiceMutation.mutate(selectedInvoiceId);
    }
  };

  /**
   * filteredInvoices — Derived list of invoices matching search + status filter.
   *
   * @purpose Provide a client-side filtered invoice array for display in the UI.
   *
   * @param None (depends on `invoices`, `searchTerm`, `statusFilter`).
   * @returns {Invoice[]} Filtered list of invoices.
   * @throws None
   * @sideEffects None (pure computation).
   *
   * @example
   * filteredInvoices.map(i => <InvoiceRow key={i.id} {...i} />);
   */
  const filteredInvoices = invoices
    ? invoices.filter((invoice: any) => {
        const matchesSearch = invoice.invoiceNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        // ||
        // (invoice.studentId && invoice.studentId().includes(searchTerm.toLowerCase()));

        const matchesStatus =
          statusFilter === "all" || invoice.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
    : [];

  /**
   * invoiceStats — Aggregated counts of invoices by status.
   *
   * @purpose Provides the total count of invoices for each status category (paid, pending, failed, cancelled) and the overall total.
   *
   * @param None (depends only on `invoices` array).
   * @returns {Object} An object containing:
   *   - paid {number} — Count of paid invoices
   *   - pending {number} — Count of pending invoices
   *   - failed {number} — Count of failed invoices
   *   - cancelled {number} — Count of cancelled invoices
   *   - total {number} — Total number of invoices
   * @throws None
   * @sideEffects None (pure computation).
   *
   * @example
   * console.log(invoiceStats.total); // e.g., 15
   */
  const invoiceStats = {
    paid: invoices
      ? invoices.filter((i: any) => i.status === "paid").length
      : 0,
    pending: invoices
      ? invoices.filter((i: any) => i.status === "pending").length
      : 0,
    failed: invoices
      ? invoices.filter((i: any) => i.status === "failed").length
      : 0,
    cancelled: invoices
      ? invoices.filter((i: any) => i.status === "cancelled").length
      : 0,
    total: invoices ? invoices.length : 0,
  };


  /**
   * totalPending — Total outstanding amount from all pending invoices.
   *
   * @purpose Computes the sum of `amount` fields from invoices where `status` is "pending".
   *
   * @param None (depends only on `invoices` array).
   * @returns {number} The numeric total of pending invoice amounts.
   * @throws None
   * @sideEffects None (pure computation).
   *
   * @example
   * console.log(totalPending); // e.g., 4200
   */
  const totalPending = invoices
    ? invoices
        .filter((i: any) => i.status === "pending")
        .reduce((sum: number, i: any) => sum + parseFloat(i.amount || 0), 0)
    : 0;

  
  /**
   * totalCollected — Total revenue collected from paid invoices.
   *
   * @purpose Computes the sum of `amount` fields from invoices where `status` is "paid".
   *
   * @param None (depends only on `invoices` array).
   * @returns {number} The numeric total of collected invoice amounts.
   * @throws None
   * @sideEffects None (pure computation).
   *
   * @example
   * console.log(totalCollected); // e.g., 10800
   */
  const totalCollected = invoices
    ? invoices
        .filter((i: any) => i.status === "paid")
        .reduce((sum: number, i: any) => sum + parseFloat(i.amount || 0), 0)
    : 0;

  return (
    // Appshell component provides the main application layout with a header, sidebar, and responsive behavior
    <AppShell>
      <div className="flex flex-col min-h-screen">
        {/* Page Heading with title and description */}
        <PageHeader title="Invoices" description="Manage student invoices" />

        <div>
          {/* Tabs for different invoice views */}
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Invoices</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            </TabsList>

            {/* All Invoices Tab Content */}
            <TabsContent value="all" className="space-y-4">
              <Card>
                {/* Card Header with title */}
                <CardHeader className="pb-3">
                  <CardTitle>Invoice Management</CardTitle>
                </CardHeader>
                {/* Card Content */}
                <CardContent>
                  {/* Search and Filter Section */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      {/* Search Icon */}
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      {/* Search Input */}
                      <Input
                        type="search"
                        placeholder="Search by invoice ID or student name..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    {/* Status Filter */}
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Status</SelectLabel>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Loading State */}
                  {invoicesLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    // Error State
                  ) : invoicesError ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Error loading invoices.
                    </div>
                  ) : filteredInvoices.length === 0 ? (
                    // No Invoices Found
                    <div className="text-center py-10 text-muted-foreground">
                      <FileText className="mx-auto h-10 w-10 mb-2 text-muted-foreground/60" />
                      <p className="mb-2">No invoices found</p>
                      <p className="text-sm text-muted-foreground/60">
                        Try changing the filters or create a new invoice.
                      </p>
                    </div>
                  ) : (
                    // Table Data
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>SL No</TableHead>
                            <TableHead className="w-[170px]">
                              Invoice ID
                            </TableHead>
                            {/* Table Headers */}
                            <TableHead>Student</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Issue Date</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[130px]">
                              Amount Paid
                            </TableHead>
                            <TableHead className="w-[130px]">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        {/* Table Body starts here */}
                        <TableBody>
                          {/* Filtered Invoices */}
                          {filteredInvoices.map(
                            (invoice: any, index: number) => {
                              const student = students?.find(
                                (s: any) => s.id === invoice.studentId
                              );
                              return (
                                <TableRow key={invoice.id}>
                                  {/* Serial Number */}
                                  <TableCell>{index + 1}</TableCell>
                                  {/* Invoice ID */}
                                  <TableCell className="font-medium">
                                    <Link
                                      to={`/admin/invoice/${invoice.id}`}
                                      className="text-primary hover:underline"
                                    >
                                      {invoice.invoiceNumber}
                                    </Link>
                                  </TableCell>
                                  {/* Student Name */}
                                  <TableCell>
                                    {student?.firstName +
                                      " " +
                                      student?.middleName +
                                      " " +
                                      student?.lastName}
                                  </TableCell>
                                  {/* Amount */}
                                  <TableCell className="font-bold">
                                    {invoice.totalAmount}
                                  </TableCell>
                                  {/* Issue Date */}
                                  <TableCell>
                                    {invoice.issueDate
                                      ? format(
                                          new Date(invoice.issueDate),
                                          "MMM dd, yyyy"
                                        )
                                      : "-"}
                                  </TableCell>
                                  {/* Due Date */}
                                  <TableCell
                                    className={cn(
                                      new Date(invoice.dueDate) < new Date() &&
                                        invoice.status === "pending"
                                        ? "text-red-500"
                                        : ""
                                    )}
                                  >
                                    {format(
                                      new Date(invoice.dueDate),
                                      "MMM dd, yyyy"
                                    )}
                                  </TableCell>
                                  {/* Status */}
                                  <TableCell>
                                    <StatusBadge status={invoice.status} />
                                  </TableCell>
                                  {/* Amount Paid */}
                                  <TableCell className="font-bold text-center">
                                    {invoice.amountPaid || "-"}
                                  </TableCell>
                                  {/* Action */}
                                  <TableCell className="text-center">
                                    {invoice.status !== "cancelled" && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700"
                                        onClick={() =>
                                          handleOpenCancelDialog(invoice.id)
                                        }
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Cancel
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            }
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dashboard Tab Content */}
            <TabsContent value="dashboard" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Invoices Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Invoices
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {invoicesLoading ? (
                        <Skeleton className="h-8 w-20" />
                      ) : (
                        invoiceStats.total
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      All-time total invoices
                    </p>
                  </CardContent>
                </Card>

                {/* Pending Payment Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pending Payment
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-500">
                      {invoicesLoading ? (
                        <Skeleton className="h-8 w-24" />
                      ) : (
                        `${totalPending.toLocaleString()}`
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {invoiceStats.pending} pending invoice(s)
                    </p>
                  </CardContent>
                </Card>

                {/* Collected Payment Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Collected Payment
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    {/* Collected Payment Card */}
                    <div className="text-2xl font-bold text-green-500">
                      {invoicesLoading ? (
                        <Skeleton className="h-8 w-24" />
                      ) : (
                        `${totalCollected.toLocaleString()}`
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {invoiceStats.paid} paid invoice(s)
                    </p>
                  </CardContent>
                </Card>

                {/* Collection Rate Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Collection Rate
                    </CardTitle>
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {invoicesLoading ? (
                        <Skeleton className="h-8 w-20" />
                      ) : invoiceStats.total > 0 ? (
                        `${Math.round(
                          (invoiceStats.paid / invoiceStats.total) * 100
                        )}%`
                      ) : (
                        "0%"
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Payment collection rate
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>
                      Latest 5 payment transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                  {/* Loading state: show skeleton placeholders while invoices fetch */}
                    {invoicesLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : invoices && invoices.length > 0 ? (
                      // When invoices exist: render up to 5 recent invoice rows
                      <div className="space-y-4">
                        {invoices.slice(0, 5).map((invoice: any) => (
                          <div
                            key={invoice.id}
                            className="flex items-center space-x-4 border-b pb-3"
                          >
                            {/* Status icon circle — background color depends on invoice status */}
                            <div
                              className={cn(
                                "h-9 w-9 rounded-full flex items-center justify-center",
                                invoice.status === "paid"
                                  ? "bg-green-100"
                                  : invoice.status === "pending"
                                  ? "bg-amber-100"
                                  : invoice.status === "failed"
                                  ? "bg-red-100"
                                  : "bg-gray-100"
                              )}
                            >
                              {/* Icon inside circle — changes by status */}
                              {invoice.status === "paid" ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : invoice.status === "pending" ? (
                                <AlertCircle className="h-5 w-5 text-amber-500" />
                              ) : invoice.status === "failed" ? (
                                <XCircle className="h-5 w-5 text-red-500" />
                              ) : (
                                <CreditCard className="h-5 w-5 text-gray-500" />
                              )}
                            </div>

                            {/* Main info: student name (or fallback) + small meta row */}
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium">
                                {invoice.studentName ||
                                  `Student #${invoice.studentId}`}
                              </p>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <span>{invoice.invoiceId}</span>
                                <span className="mx-1">•</span>
                                <span>
                                  {format(
                                    new Date(
                                      invoice.paymentDate || invoice.dueDate
                                    ),
                                    "MMM dd, yyyy"
                                  )}
                                </span>
                              </div>
                            </div>
                            {/* Amount on the right, formatted with locale-aware separators */}
                            <div className="font-medium">
                              {parseFloat(invoice.amount).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 text-center">
                        <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No transactions found
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Methods Distribution */}
                <Card>
                  {/* Card Header */}
                  <CardHeader>
                    <CardTitle>Payment Methods Distribution</CardTitle>
                    <CardDescription>
                      Overview of payment methods used
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {invoicesLoading ? (
                      // Loading state: show skeletons while invoices are being fetched
                      <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : invoices &&
                      invoices.filter((i: any) => i.status === "paid").length >
                        0 ? (
                          // When there are paid invoices: compute distribution for each method
                      <div className="space-y-4">
                        {["cash", "card", "bank transfer", "upi"].map(
                          (method) => {
                            const count = invoices.filter(
                              (i: any) =>
                                i.status === "paid" &&
                                i.paymentMethod?.toLowerCase() === method
                            ).length;

                            // total number of paid invoices
                            const total = invoices.filter(
                              (i: any) => i.status === "paid"
                            ).length;
                            const percentage =
                              total > 0 ? Math.round((count / total) * 100) : 0;

                            return (
                              <div key={method} className="space-y-2">
                                {/* Row with icon + method name and percentage label */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    {/* Choose icon per method */}
                                    {method === "cash" ? (
                                      <Banknote className="h-4 w-4 mr-2 text-green-500" />
                                    ) : method === "card" ? (
                                      <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
                                    ) : method === "bank transfer" ? (
                                      <FileText className="h-4 w-4 mr-2 text-purple-500" />
                                    ) : (
                                      <CreditCard className="h-4 w-4 mr-2 text-orange-500" />
                                    )}
                                    <span className="text-sm capitalize">
                                      {method}
                                      {/* Method label */}
                                    </span>
                                  </div>
                                  <span className="text-sm font-medium">
                                    {percentage}%
                                    {/* Percentage text */}
                                  </span>
                                </div>
                                {/* Progress bar background */}
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  {/* Progress fill: color depends on method, width = percentage */}
                                  <div
                                    className={cn(
                                      "h-full rounded-full",
                                      method === "cash"
                                        ? "bg-green-500"
                                        : method === "card"
                                        ? "bg-blue-500"
                                        : method === "bank transfer"
                                        ? "bg-purple-500"
                                        : "bg-orange-500"
                                    )}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    ) : (
                      // Empty state: no paid invoices / no data
                      <div className="flex flex-col items-center justify-center h-40 text-center">
                        <CreditCard className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No payment method data
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Cancel Invoice Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          {/* Dialog Header */}
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently cancel the
              invoice.
            </DialogDescription>
          </DialogHeader>
          {/* Dialog Footer */}
          <DialogFooter>
            {/* Dialog Close Button */}
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              Close
            </Button>
            {/* Dialog Confirm Button */}
            <Button
              variant="destructive"
              disabled={cancelInvoiceMutation.isPending}
              onClick={handleConfirmCancel}
            >
              {cancelInvoiceMutation.isPending
                ? "Cancelling..."
                : "Confirm Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
