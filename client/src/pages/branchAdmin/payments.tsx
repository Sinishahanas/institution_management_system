import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusCircle,
  FileText,
  Download,
  CheckCircle2,
  CreditCard,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { StudentPayment, Student, Receipt } from "@shared/schema";
import { extractMonth, formatCurrency } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { string, z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Link } from "wouter";
import SelectMultiple from "react-select";
import ReactSelect from "react-select";

/**
 * @purpose
 * Zod schema for validating payment form data.
 * Validates the required fields and constraints for creating or editing payment in the system.
 *
 * @schema paymentFormSchema
 * @property {string} paymentId - Unique ID for the payment.
 * @property {string[]} invoiceNumber - Array of invoice numbers being paid. Must contain at least one.
 * @property {number} studentId - ID of the student associated with the payment. Required.
 * @property {string} [invoiceAmount] - Optional total invoice amount as string.
 * @property {number} amount - Amount being paid. Must be greater than 0. Required.
 * @property {Date} paymentDate - Date of payment. Required.
 * @property {string} status - Payment status. Required.
 * @property {string} [paymentMethod] - Optional payment method.
 * @property {string} [remarks] - Optional remarks for the payment.
 * @throws {ZodError} Throws if validation fails.
 * @returns {ZodSchema<PaymentFormValues>} Returns a Zod schema object for validating payment form data.
 * @throws {ZodError} Throws a Zod validation error if any required field is missing
 *         or does not meet the defined constraints (e.g., amount < 1).
 *
 * @sideEffects None
 *
 * @example
 * const validPayment: PaymentFormValues = {
 *   paymentId: "pay_12345",
 *   invoiceNumber: ["INV001", "INV002"],
 *   studentId: 101,
 *   invoiceAmount: "500",
 *   amount: 500,
 *   paymentDate: new Date("2025-10-03"),
 *   status: "paid",
 *   paymentMethod: "Credit Card",
 *   remarks: "Payment received in full",
 * };
 *
 * paymentFormSchema.parse(validPayment); // Passes validation
 */
const paymentFormSchema = z.object({
  paymentId: z.string(),
  invoiceNumber: z.array(z.string()).min(1, {
    message: "You must select at least one invoice to pay.",
  }),
  studentId: z.number({
    required_error: "Please select a student",
  }),
  invoiceAmount: z.string().optional(),
  amount: z
    .number({
      required_error: "Amount is required",
    })
    .min(1, "Amount must be greater than 0"),
  paymentDate: z.date({
    required_error: "Payment date is required",
  }),
  status: z.string({
    required_error: "Status is required",
  }),
  paymentMethod: z.string().optional(),
  remarks: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

/**
 * @purpose Zod schema for validating receipt form data.
 *
 * @schema receiptFormSchema
 * @property {string} receiptNumber - Unique receipt number. Required.
 * @property {string} paymentId - ID of the associated payment. Required.
 * @property {Date} receiptDate - Date when the receipt was issued. Required.
 * @property {string} invoiceDate - Date of the invoice associated with the payment. Required.
 * @property {number} amount - Payment amount. Must be greater than 0. Required.
 * @property {string} paymentMethod - Method used for the payment. Required.
 * @property {string} [remarks] - Optional remarks for the receipt.
 *
 * @throws {ZodError} Throws if validation fails.
 * @returns {ZodSchema<ReceiptFormValues>} Returns a Zod schema object for validating receipt form data.
 *
 * @example
 * const validReceipt: ReceiptFormValues = {
 *   receiptNumber: "RCPT001",
 *   paymentId: "pay_12345",
 *   receiptDate: new Date("2025-10-03"),
 *   invoiceDate: "2025-10-01",
 *   amount: 500,
 *   paymentMethod: "Credit Card",
 *   remarks: "Payment received in full",
 * };
 *
 * receiptFormSchema.parse(validReceipt); // Passes validation
 */
const receiptFormSchema = z.object({
  receiptNumber: z.string({
    required_error: "Receipt number is required",
  }),
  paymentId: z.string({
    required_error: "Payment ID is required",
  }),
  receiptDate: z.date({
    required_error: "Receipt date is required",
  }),
  invoiceDate: z.string({
    required_error: "Invoice date is required",
  }),
  amount: z
    .number({
      required_error: "Amount is required",
    })
    .min(1, "Amount must be greater than 0"),
  paymentMethod: z.string({
    required_error: "Payment method is required",
  }),
  remarks: z.string().optional(),
});

type ReceiptFormValues = z.infer<typeof receiptFormSchema>;

interface DashboardStats {
  totalRevenue: number;
  pendingPayments: number;
  activeStudents: number;
  activeBatches: number;
}

/**
 * BranchAdminPayments Component
 *
 * @purpose Manage student payments and receipts within a branch (view, create, and track).
 *
 * @states
 * - `activeTab` - Current tab for payments filtering.
 * - `activeTabReceipts` - Current tab for receipts filtering.
 * - `isNewPaymentDialogOpen` - Controls visibility of the new payment dialog.
 * - `isNewReceiptDialogOpen` - Controls visibility of the new receipt dialog.
 * - `isViewPaymentDialogOpen` - Controls visibility of the view payment dialog.
 * - `selectedPayment` - Stores the currently selected payment for viewing or editing.
 * - `searchQuery` - Holds the search input value.
 * - `paymentId` - Currently selected payment ID.
 * - `receiptId` - Currently selected receipt ID.
 *
 * @queries
 * - Fetches all student payments from `/api/studentPayments`.
 * - Fetches all receipts from `/api/receipts`.
 *
 * @throws {ZodError | Error} Throws if API fetching fails or if any payment/receipt validation fails.
 *
 * @returns {JSX.Element} Renders the payments and receipts page with tables, dialogs, and forms.
 *
 * @example
 * <BranchAdminPayments />
 *
 * // The component automatically fetches payments and receipts and allows viewing,
 * // creating, and searching them through the UI.
 */
export default function BranchAdminPayments() {
  const [activeTab, setActiveTab] = useState("all");
  const [activeTabReceipts, setActiveTabReceipts] = useState("payments");
  const [isNewPaymentDialogOpen, setIsNewPaymentDialogOpen] = useState(false);
  const [isNewReceiptDialogOpen, setIsNewReceiptDialogOpen] = useState(false);
  const [isViewPaymentDialogOpen, setIsViewPaymentDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<StudentPayment | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [paymentId, setPaymentId] = useState("");
  const [receiptId, setReceiptId] = useState("");

  /**
   * Fetch payments (react-query)
   *
   * @purpose Retrieve student payments for table display.
   * @returns {object} react-query result object. `data` will be StudentPayment[] when resolved.
   * @sideEffects Triggers an HTTP request to the configured backend (via react-query's fetcher).
   * @example
   * const { data: payments } = useQuery<StudentPayment[]>({ queryKey: ["/api/studentPayments"] });
   */
  const { data: payments = [], isLoading } = useQuery<StudentPayment[]>({
    queryKey: ["/api/studentPayments"],
  });

  /**
   * Fetch receipts (react-query)
   *
   * @purpose Retrieve receipts to manage/print/inspect receipts.
   * @param {object} react-query result object. `data` will be Receipt[] when resolved.
   * @returns {object} react-query result object. `data` will be Receipt[] when resolved.
   * @sideEffects Triggers an HTTP request to the configured backend (via react-query's fetcher).
   * @example
   * const { data: receipts } = useQuery<Receipt[]>({ queryKey: ["/api/receipts"] });
   */
  const { data: receipts = [], isLoading: isLoadingReceipts } = useQuery<
    Receipt[]
  >({
    queryKey: ["/api/receipts"],
  });

  /**
   * Fetch students (react-query)
   *
   * @purpose Retrieve students used to select payer and look up unpaid invoices.
   * @param {object} react-query result object. `data` will be Student[] when resolved.
   * @returns {object} react-query result object. `data` will be Student[] when resolved.
   * @sideEffects Triggers an HTTP request to the configured backend (via react-query's fetcher).
   * @example
   * const { data: students } = useQuery<Student[]>({ queryKey: ["/api/students"] });
   */
  const { data: students = [], isLoading: isLoadingStudents } = useQuery<
    Student[]
  >({
    queryKey: ["/api/students"],
  });

  /**
   * Fetch dashboard statistics (react-query)
   *
   * @purpose Retrieve a small set of summary stats used in the payments dashboard.
   * @param {object} react-query result with `data` typed as DashboardStats.
   * @returns {object} react-query result with `data` typed as DashboardStats.
   * @sideEffects Triggers an HTTP request and caches results for `staleTime`.
   * @example
   * const { data: stats } = useQuery<DashboardStats>({ queryKey: ["/api/dashboard/stats"], staleTime: 300000 });
   */
  const {
    data: stats,
    isLoading: isLoadingStats,
    error,
  } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    staleTime: 5 * 60 * 1000,
  });

  /**
   * paymentForm (react-hook-form)
   *
   * @purpose Manage state and validation for creating/updating payments.
   * @param None
   * @returns {UseFormReturn<PaymentFormValues>} Standard react-hook-form object.
   * @sideEffects Validation runs via zodResolver on submit/field changes.
   *
   * @example
   * const paymentForm = useForm<PaymentFormValues>({...});
   */
  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      invoiceNumber: [],
      studentId: undefined,
      invoiceAmount: undefined,
      amount: 0,
      paymentDate: new Date(),
      status: "",
      paymentMethod: undefined,
      remarks: "",
    },
  });

  /**
   * receiptForm (react-hook-form)
   *
   * @purpose Manage state and validation for creating receipts.
   * @param None
   * @returns {UseFormReturn<ReceiptFormValues>} Standard react-hook-form object.
   * @sideEffects Validation runs via zodResolver on submit/field changes.
   *
   * @example
   * const receiptForm = useForm<ReceiptFormValues>({...});
   */
  const receiptForm = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: {
      receiptNumber: "",
      paymentId: "",
      receiptDate: new Date(),
      invoiceDate: "",
      amount: 0,
      paymentMethod: "",
      remarks: "",
    },
  });

  /**
   * Watch selected student ID from payment form.
   *
   * @purpose Reactively track which student is selected so we can fetch unpaid invoices for that student.
   * @param None
   * @returns {number | undefined} The currently selected studentId (or undefined).
   * @sideEffects None by itself; used by the unpaidInvoices query (enabled when truthy).
   *
   * @example
   * const selectedStudentId = useWatch({ control: paymentForm.control, name: "studentId" });
   */
  const selectedStudentId = useWatch({
    control: paymentForm.control,
    name: "studentId",
  });

  /**
   * Query unpaid invoices for the selected student.
   *
   * @purpose When a student is selected in the payment form, fetch unpaid invoices for that student so user can apply payments to invoices.
   * @param None.
   * @returns {object} react-query result with `data` being an array of unpaid invoices (any[] default).
   * @throws This query's fn will throw if the network fetch fails (react-query will surface the error).
   * @sideEffects When `selectedStudentId` changes (and is truthy), triggers a network request to `/api/unpaidInvoicesByStudent/:id`.
   * @example
   * const { data: unpaidInvoices } = useQuery({ queryKey: ["unpaidInvoicesByStudent", selectedStudentId], enabled: !!selectedStudentId, queryFn: async () => {...} });
   */
  const { data: unpaidInvoices = [], isLoading: isLoadingUnpaidInvoices } =
    useQuery({
      queryKey: ["unpaidInvoicesByStudent", selectedStudentId],
      queryFn: async () => {
        if (!selectedStudentId) return [];
        const res = await fetch(
          `/api/unpaidInvoicesByStudent/${selectedStudentId}`,
        );
        return res.json();
      },
      enabled: !!selectedStudentId,
    });

  /**
   * Watch selected invoice IDs (array) from payment form.
   *
   * @purpose Track which invoice(s) user selected in the multi-select so UI can display invoice totals or validate.
   * @param None.
   * @returns {string[] | undefined} The selected invoiceNumber array (or undefined).
   * @sideEffects None (pure watch).
   * @example
   * const selectedInvoiceId = useWatch({ control: paymentForm.control, name: "invoiceNumber" });
   */
  const selectedInvoiceId = useWatch({
    control: paymentForm.control,
    name: "invoiceNumber",
  });

  /**
   * Recompute and set the combined invoiceAmount whenever the selected
   * invoice list or the unpaid invoices list changes.
   *
   * @purpose Calculate the total amount for all selected unpaid invoices and
   *          write that value (formatted) into the payment form's `invoiceAmount`.
   * @params
   *   - selectedInvoiceId: string[] | undefined (read via closure from useWatch)
   *   - unpaidInvoices: any[] (read via closure from query result)
   *   - paymentForm: UseFormReturn<PaymentFormValues> (closure)
   * @returns {void}
   * @throws Will not intentionally throw — any invalid numbers are treated as 0.
   * @sideEffects Calls `paymentForm.setValue("invoiceAmount", ...)`, causing form state to update.
   * @example
   * // When user selects invoices ["INV-101", "INV-102"], unpaidInvoices
   * // contains those invoice objects and this effect writes the sum into the form.
   */
  useEffect(() => {
    if (Array.isArray(selectedInvoiceId) && unpaidInvoices.length) {
      const selectedInvoices = unpaidInvoices.filter((inv: any) =>
        selectedInvoiceId.includes(inv.invoiceNumber),
      );

      const totalAmount = selectedInvoices.reduce((sum: any, inv: any) => {
        const amount = Number(inv.totalAmount) || 0;
        return sum + amount;
      }, 0);

      paymentForm.setValue("invoiceAmount", formatCurrency(totalAmount));
    }
  }, [selectedInvoiceId, unpaidInvoices]);

  /**
   * Watch selectedPaymentId from receiptForm.
   *
   * @purpose Track which payment was selected in the receipt form so we can auto-fill the receipt amount.
   * @param {Control} object from receiptForm.
   * @param {string} name of the field to watch.
   * @returns {string | undefined} The selected payment id (via useWatch).
   * @sideEffects None by itself; used by the following effect to set receipt form values.
   * @example
   * const selectedPaymentId = useWatch({ control: receiptForm.control, name: "paymentId" });
   */
  const selectedPaymentId = useWatch({
    control: receiptForm.control,
    name: "paymentId",
  });

  /**
   * When a paymentId is selected in the receipt form, find the corresponding
   * payment and set the receipt amount automatically.
   *
   * @purpose Auto-fill `receiptForm.amount` from the selected payment.
   * @params
   *  - selectedPaymentId: string | undefined (from useWatch)
   *  - payments: StudentPayment[] (closure)
   *  - receiptForm: UseFormReturn<ReceiptFormValues> (closure)
   * @returns {void}
   * @throws Will not intentionally throw. If payment lookup fails, no value is set.
   * @sideEffects Calls `receiptForm.setValue("amount", Number(selected.amount))`.
   * @example
   * // If user picks payment id "PAY-123", this effect sets receipt amount to that payment's amount.
   */
  useEffect(() => {
    if (selectedPaymentId) {
      const selected = payments.find(
        (payment: any) => payment.paymentId === selectedPaymentId,
      );
      if (selected) {
        receiptForm.setValue("amount", Number(selected.amount));
      }
    }
  }, [selectedPaymentId, payments, receiptForm]);

  /**
   * Generate a new payment id when the "New Payment" dialog opens and
   * then set it into the payment form and local state.
   *
   * @purpose Ensure every new payment form gets a generated unique paymentId
   * @params
   *  - isNewPaymentDialogOpen: boolean (closure)
   * @returns {void}
   * @throws Will not deliberately throw; network errors are unhandled here (promise rejection).
   * @sideEffects
   *  - performs a fetch to `/api/generate-payment-id`
   *  - sets local state via `setPaymentId`
   *  - calls `paymentForm.reset(...)` to update the form's `paymentId` field
   * @example
   * // When user clicks "New Payment", the dialog opens and this effect fetches and populates paymentId.
   */
  useEffect(() => {
    if (isNewPaymentDialogOpen) {
      fetch("/api/generate-payment-id")
        .then((res) => res.json())
        .then((data) => {
          setPaymentId(data.paymentId);
          paymentForm.reset({
            ...paymentForm.getValues(),
            paymentId: data.paymentId,
          });
        });
    }
  }, [isNewPaymentDialogOpen]);

  /**
   * Generate a new receipt number when the "New Receipt" dialog opens and
   * then set it into the receipt form and local state.
   *
   * @purpose Provide an auto-generated receipt number for new receipts.
   * @params
   *  - isNewReceiptDialogOpen: boolean (closure)
   * @returns {void}
   * @throws Will not deliberately throw; network errors are unhandled here (promise rejection).
   * @sideEffects
   *  - performs a fetch to `/api/generate-receipt-number`
   *  - sets local state via `setReceiptId`
   *  - calls `receiptForm.reset(...)` to update the form's `receiptNumber` field
   * @example
   * // When user clicks "New Receipt", the dialog opens and this effect fetches and populates receiptNumber.
   */
  useEffect(() => {
    if (isNewReceiptDialogOpen) {
      fetch("/api/generate-receipt-number")
        .then((res) => res.json())
        .then((data) => {
          setReceiptId(data.receiptNumber);
          receiptForm.reset({
            ...receiptForm.getValues(),
            receiptNumber: data.receiptNumber,
          });
        });
    }
  }, [isNewReceiptDialogOpen]);

  /**
   * Create a human-friendly label for an invoice select option.
   *
   * @purpose Build the label shown in invoice selectors by combining invoice number and month name.
   * @param {any} invoice - The invoice object (must include invoiceNumber).
   * @returns {string} Friendly label like "INV-101, January".
   * @throws Will not throw — catches internal parsing errors and falls back to invoice.invoiceNumber.
   * @sideEffects None (pure function).
   * @example
   * createLabel({ invoiceNumber: "INV-101" }) // => "INV-101, January"
   */
  const createLabel = (invoice: any) => {
    try {
      const { monthName } = extractMonth(invoice.invoiceNumber);
      return `${invoice.invoiceNumber}, ${monthName}`;
    } catch {
      return invoice.invoiceNumber; // fallback for invalid format
    }
  };

  /**
   * Open the payment details view for a specific payment.
   *
   * @purpose Show the payment detail dialog for inspection/printing.
   * @param {StudentPayment} payment - Payment object selected by the user.
   * @returns {void}
   * @throws None
   * @sideEffects Updates `selectedPayment` and `isViewPaymentDialogOpen` which opens the dialog UI.
   * @example
   * handleViewPayment(paymentRow);
   */
  const handleViewPayment = (payment: StudentPayment) => {
    setSelectedPayment(payment);
    setIsViewPaymentDialogOpen(true);
  };

  /**
   * Submit payment form handler.
   *
   * This function supports two modes:
   *  - Distribute payment across selected unpaid invoices.
   *  - Record the payment as an advance (when no invoices selected).
   *
   * @purpose Create payment(s), update invoices, create paymentItems and receipts as required.
   * @param {PaymentFormValues} data - Values validated by zod/react-hook-form.
   * @returns {Promise<void>} Resolves when all network operations complete.
   * @throws Throws an Error when validation fails (invalid amount) or when API calls fail.
   * @sideEffects
   *  - POSTs to /api/studentPayments (creates payment record)
   *  - PATCHes /api/invoices/:invoiceNumber to update amount_paid and status
   *  - POSTs /api/paymentItems for each invoice allocation
   *  - Calls /api/generate-receipt-number and POSTs /api/receipts for each allocation
   *  - Invalidates react-query caches via `queryClient.invalidateQueries`
   *  - Updates UI: closes the new payment dialog and resets the payment form
   * @example
   * await onSubmitPaymentForm({
   *   studentId: 12,
   *   invoiceNumber: ["INV-101", "INV-102"],
   *   amount: 1500,
   *   paymentMethod: "Cash",
   *   remarks: "Payment on 2025-10-02",
   *   paymentDate: new Date(),
   *   status: "paid"
   * });
   */
  const onSubmitPaymentForm = async (data: PaymentFormValues) => {
    try {
      const isPayingAgaInstitutionnvoices =
        Array.isArray(data.invoiceNumber) && data.invoiceNumber.length > 0;
      let paymentId = "";
      const totalPaymentAmount = Number(data.amount);
      let remainingPayment = totalPaymentAmount;

      if (isNaN(remainingPayment) || remainingPayment <= 0) {
        throw new Error("Invalid payment amount.");
      }

      if (isPayingAgaInstitutionnvoices) {
        toast({
          title: "Processing Payment",
          description: `Distributing ${remainingPayment} across ${data.invoiceNumber.length} invoice(s)...`,
        });

        const invoiceUpdates = data.invoiceNumber.map((singleInvoice) => {
          const invoiceDetails = unpaidInvoices.find(
            (inv: any) => inv.invoiceNumber === singleInvoice,
          );
          if (!invoiceDetails) {
            throw new Error(
              `Invoice ${singleInvoice} not found. Please refresh.`,
            );
          }

          const alreadyPaid = Number(invoiceDetails.amountPaid) || 0;
          const invoiceTotal = Number(invoiceDetails.totalAmount);

          return {
            invoiceNumber: singleInvoice,
            alreadyPaid,
            invoiceTotal,
          };
        });

        const paymentResponse = await apiRequest(
          "POST",
          "/api/studentPayments",
          {
            studentId: data.studentId,
            amount: totalPaymentAmount,
            paymentDate: new Date(),
            paymentMethod: data.paymentMethod || "Cash",
            remarks: data.remarks,
            status: "paid",
            advanceAmount: 0,
            state: "active",
          },
        );

        const paymentJson = await paymentResponse.json();
        paymentId = paymentJson.paymentId;
        if (!paymentId) throw new Error("Payment creation failed.");

        for (const invoice of invoiceUpdates) {
          const { invoiceNumber, alreadyPaid, invoiceTotal } = invoice;
          const amountDue = invoiceTotal - alreadyPaid;

          if (amountDue <= 0) continue;

          const allocatedAmount = Math.min(remainingPayment, amountDue);
          const newAmountPaid = alreadyPaid + allocatedAmount;
          const newStatus =
            newAmountPaid >= invoiceTotal ? "paid" : "partially_paid";

          await apiRequest("PATCH", `/api/invoices/${invoiceNumber}`, {
            amount_paid: newAmountPaid,
            status: newStatus,
          });

          await apiRequest("POST", "/api/paymentItems", {
            paymentId,
            invoiceNumber,
            amount: allocatedAmount,
          });

          const receiptResponse = await fetch("/api/generate-receipt-number");
          const receiptData = await receiptResponse.json();

          await apiRequest("POST", "/api/receipts", {
            receiptNumber: receiptData.receiptNumber,
            paymentId,
            invoiceNumber,
            receiptDate: new Date(),
            invoiceDate: new Date().toISOString().slice(0, 10),
            amount: allocatedAmount,
            paymentMethod: data.paymentMethod || "Cash",
            remarks: data.remarks,
          });

          remainingPayment -= allocatedAmount;
          if (remainingPayment <= 0) break;
        }
      } else {
        const advanceResponse = await apiRequest(
          "POST",
          "/api/studentPayments",
          {
            studentId: data.studentId,
            amount: totalPaymentAmount,
            paymentDate: new Date(),
            paymentMethod: data.paymentMethod || "Cash",
            remarks: data.remarks,
            status: "paid",
            advanceAmount: totalPaymentAmount,
            state: "active",
          },
        );

        const advanceJson = await advanceResponse.json();
        paymentId = advanceJson.paymentId;
        if (!paymentId) throw new Error("Advance payment creation failed.");

        const receiptResponse = await fetch("/api/generate-receipt-number");
        const receiptData = await receiptResponse.json();

        await apiRequest("POST", "/api/receipts", {
          receiptNumber: receiptData.receiptNumber,
          paymentId,
          invoiceNumber: null,
          receiptDate: new Date(),
          invoiceDate: new Date().toISOString().slice(0, 10),
          amount: totalPaymentAmount,
          paymentMethod: data.paymentMethod || "Cash",
          remarks: data.remarks,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/studentPayments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/receipts"] });

      setIsNewPaymentDialogOpen(false);
      paymentForm.reset();

      toast({
        title: "Payment Success",
        description: "The payment and receipts have been created successfully.",
      });
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  /**
   * Submit receipt form handler.
   *
   * @purpose Create a receipt record on the server for the selected payment/invoice.
   * @param {ReceiptFormValues} data - Values validated by zod/react-hook-form.
   * @returns {Promise<void>} Resolves once the receipt is created and cache invalidated.
   * @throws Will propagate errors thrown by apiRequest.
   * @sideEffects
   *  - POSTs to /api/receipts with the provided receipt payload
   *  - invalidates react-query receipts cache
   *  - closes the new receipt dialog and resets the receipt form
   *  - displays a success or error toast
   * @example
   * await onSubmitReceiptForm({
   *   receiptNumber: "R-1001",
   *   paymentId: "PAY-123",
   *   receiptDate: new Date(),
   *   invoiceDate: "2025-10-02",
   *   amount: 500,
   *   paymentMethod: "Cash",
   *   remarks: "Manual receipt"
   * });
   */
  const onSubmitReceiptForm = async (data: ReceiptFormValues) => {
    console.log("Form submitted with data:", data);
    try {
      const receiptData = {
        ...data,
        paymentId: data.paymentId,
        receiptNumber: data.receiptNumber,
        receiptDate: data.receiptDate,
        invoiceDate: data.invoiceDate,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        remarks: data.remarks,
      };

      await apiRequest("POST", "/api/receipts", receiptData);
      queryClient.invalidateQueries({ queryKey: ["/api/receipts"] });

      setIsNewReceiptDialogOpen(false);
      receiptForm.reset();
      toast({
        title: "Receipt created",
        description: "The receipt has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * Filter payments based on activeTab and searchQuery.
   *
   * @purpose Produce a filtered array of payments for display based on the current UI filters.
   * @params
   *  - payments: StudentPayment[] | undefined (closed over from outer scope via react-query)
   *  - activeTab: string (closed over; expected values: "all", "paid", "partially_paid")
   *  - searchQuery: string (closed over)
   * @returns {StudentPayment[] | undefined} Array of payments matching the status & search filters.
   * @throws None (pure filtering). If `payments` is undefined, result will be undefined.
   * @sideEffects None — pure computation.
   * @example
   * // If activeTab === "paid" and searchQuery === "pay-123", returns only paid payments that match "pay-123".
   */
  const filteredPayments = payments?.filter((payment) => {
    const matchesStatus =
      activeTab === "all" ||
      (activeTab === "paid" && payment.status === "paid") ||
      (activeTab === "partially_paid" && payment.status === "partially_paid");

    const matchesSearch =
      searchQuery === "" ||
      (payment.paymentId &&
        payment.paymentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (payment.studentId && payment.studentId.toString().includes(searchQuery));

    return matchesStatus && matchesSearch;
  });

  /**
   * Filter receipts by searchQuery.
   *
   * @purpose Produce a filtered list of receipts for display based on the search query.
   * @params
   *  - receipts: Receipt[] | undefined (closed over)
   *  - searchQuery: string (closed over)
   * @returns {Receipt[] | undefined} Receipts that match the searchQuery; otherwise all receipts when searchQuery is empty.
   * @throws None — pure filtering.
   * @sideEffects None.
   * @example
   * // searchQuery = "pay-123" => returns receipts whose paymentId contains "pay-123"
   */
  const filteredReceipts = receipts?.filter((receipt) => {
    const matchesSearch =
      searchQuery === "" ||
      (receipt.paymentId &&
        receipt.paymentId.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  /**
   * Get student full name by id.
   *
   * @purpose Lookup student first and last name from the `students` array and return a display name.
   * @params
   *  - studentId: number | string — the id to search for (can be numeric or string).
   * @returns {string} The full name in the format "First Last" if found, otherwise "Unknown".
   * @throws None.
   * @sideEffects None.
   * @example
   * // getStudentName(12) => "Priya Sharma" or "Unknown" if student not present
   */
  const getStudentName = (studentId: number | string): string => {
    const student = students?.find((s) => s.id === Number(studentId));
    return student ? `${student.firstName} ${student.lastName}` : "Unknown";
  };

  /**
   * Payment table column definitions for DataTable (TANStack).
   *
   * @purpose Describe columns and rendering logic for the payments data table.
   * @param None (closes over helpers like getStudentName, formatCurrency, format).
   * @returns {ColumnDef<StudentPayment>[]} Column definitions array consumed by DataTable.
   * @throws None.
   * @sideEffects None (pure definitions).
   * @example
   * <DataTable columns={paymentColumns} data={filteredPayments} />
   */
  const paymentColumns: ColumnDef<StudentPayment>[] = [
    {
      id: "serial",
      header: "SL.No.",
      cell: ({ table, row }) => {
        const sortedRows = table.getSortedRowModel().rows;
        const index = sortedRows.findIndex((r) => r.id === row.id);
        return <div>{index + 1}</div>;
      },
      enableSorting: false,
    },
    {
      accessorKey: "paymentId",
      header: "Payment ID",
    },
    {
      accessorKey: "studentId",
      header: "Student",
      cell: ({ row }) => {
        const studentId = row.original.studentId;
        return getStudentName(studentId);
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        return formatCurrency(Number(row.original.amount));
      },
    },
    {
      accessorKey: "paymentDate",
      header: "Payment Date",
      cell: ({ row }) => {
        return format(new Date(row.original.paymentDate), "MMM dd, yyyy");
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        let badgeVariant:
          | "default"
          | "success"
          | "destructive"
          | "outline"
          | "secondary" = "outline";

        if (status === "paid") {
          badgeVariant = "default";
        } else if (status === "pending") {
          badgeVariant = "secondary";
        } else if (status === "failed") {
          badgeVariant = "destructive";
        } else if (status === "partially_paid") {
          badgeVariant = "outline";
        }

        return (
          <Badge variant={badgeVariant}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
      cell: ({ row }) => {
        return row.original.paymentMethod || "-";
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const payment = row.original;

        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewPayment(payment)}
          >
            <FileText className="h-4 w-4 mr-2" />
            View
          </Button>
        );
      },
    },
  ];

  /**
   * Receipt table column definitions for DataTable (TANStack).
   *
   * @purpose Describe columns and rendering logic for the receipts data table.
   * @param None (closes over Link, formatCurrency).
   * @returns {ColumnDef<Receipt>[]} Column definitions array consumed by DataTable.
   * @throws None.
   * @sideEffects None.
   * @example
   * <DataTable columns={receiptColumns} data={filteredReceipts} />
   */
  const receiptColumns: ColumnDef<Receipt>[] = [
    {
      id: "serial",
      header: "SL.No.",
      cell: ({ table, row }) => {
        const sortedRows = table.getSortedRowModel().rows;
        const index = sortedRows.findIndex((r) => r.id === row.id);
        return <div>{index + 1}</div>;
      },
      enableSorting: false,
    },
    {
      accessorKey: "receiptNumber",
      header: "Receipt Number",
      cell: ({ row }) => {
        const receiptNumber = row.getValue("receiptNumber") as string;
        return (
          <Link
            href={`/branch-admin/print-receipt/${receiptNumber}`}
            className="text-blue-600 hover:underline"
          >
            {receiptNumber}
          </Link>
        );
      },
    },
    {
      accessorKey: "paymentId",
      header: "Payment ID",
    },
    {
      accessorKey: "receiptDate",
      header: "Date",
    },
    {
      accessorKey: "invoiceDate",
      header: "Invoice Date",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(Number(row.original.amount)),
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            window.print();
          }}
        ></Button>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page head with title and description */}
        <PageHeader
          title="Payments & Receipts"
          description="Manage student payments and receipts"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Card showing total revenue */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Display total revenue formatted as currency */}
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.totalRevenue || 0)}
              </div>
              {/* Display percentage change from last month */}
              <p className="text-xs text-muted-foreground">
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          {/* Card showing pending payments */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Display pending payments formatted as currency */}
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.pendingPayments || 0)}
              </div>
              {/* Display number of pending invoices */}
              <p className="text-xs text-muted-foreground">
                35 pending invoices
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="mb-6">
            <div className="flex flex-col gap-4">
              {/* Tabs for payments and receipts */}
              <Tabs
                value={activeTabReceipts}
                onValueChange={setActiveTabReceipts}
                className="w-full"
              >
                <TabsList>
                  <TabsTrigger value="payments" className="flex-1">
                    Payments
                  </TabsTrigger>
                  <TabsTrigger value="receipts" className="flex-1">
                    Receipts
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {activeTabReceipts === "payments" ? (
                // Show payment-specific actions
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="paid">Paid</TabsTrigger>
                      <TabsTrigger value="partially_paid">
                        Partially Paid
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="flex gap-2">
                    {/* Button to open dialog for creating a new payment */}
                    <Button onClick={() => setIsNewPaymentDialogOpen(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      New Payment
                    </Button>
                  </div>
                </div>
              ) : (
                // Placeholder for receipts tab actions
                <div className="flex justify-end">
                  {/* <Button onClick={() => setIsNewReceiptDialogOpen(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      New Receipt
                    </Button> */}
                  {/* <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Receipts
                    </Button> */}
                </div>
              )}
            </div>
          </div>

          {/* DataTable showing either payments or receipts based on the active tab */}
          {activeTabReceipts === "payments" ? (
            <DataTable
              columns={paymentColumns} // Column definitions for payments
              data={filteredPayments} // Data for payments
              searchColumns={["paymentId", "studentId"]} // Columns to search by for payments
              searchPlaceholder="Search payments..." // Placeholder for search input
            />
          ) : (
            <DataTable
              columns={receiptColumns} // Column definitions for receipts
              data={filteredReceipts} // Data for receipts
              searchColumns={["receiptNumber", "paymentId"]} // Columns to search by for receipts
              searchPlaceholder="Search receipts..." // Placeholder for search input
            />
          )}

          {/* Dialog to create a new payment */}
          <Dialog
            open={isNewPaymentDialogOpen}
            onOpenChange={(open) => {
              setIsNewPaymentDialogOpen(open);
              if (!open) {
                paymentForm.reset(); // reset form
              }
            }}
          >
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Payment</DialogTitle>
                <DialogDescription>
                  Create a new payment record for a student.
                </DialogDescription>
              </DialogHeader>

              <Form {...paymentForm}>
                {/* Form to create a new payment */}
                <form
                  onSubmit={paymentForm.handleSubmit(onSubmitPaymentForm)}
                  className="space-y-4"
                >
                  {/* Payment ID field */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={paymentForm.control}
                      name="paymentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment ID</FormLabel>
                          <FormControl>
                            <Input
                              // placeholder="Enter payment ID"
                              {...field}
                              readOnly
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Student field */}
                    <FormField
                      control={paymentForm.control}
                      name="studentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student</FormLabel>
                          <ReactSelect
                            options={students.map((student: any) => ({
                              label: `${student.firstName} ${student.middleName} ${student.lastName} (${student.studentId})`,
                              value: student.id.toString(),
                            }))}
                            onChange={(option: any) =>
                              field.onChange(parseInt(option?.value || "0"))
                            }
                            value={students
                              .map((student: any) => ({
                                label: `${student.firstName} ${student.middleName} ${student.lastName} (${student.studentId})`,
                                value: student.id.toString(),
                              }))
                              .find(
                                (opt) => opt.value === field.value?.toString(),
                              )}
                            isSearchable
                            placeholder="Select a student"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Invoice Number field */}
                    <FormField
                      control={paymentForm.control}
                      name="invoiceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Invoice Numbers</FormLabel>
                          <FormControl>
                            <Controller
                              control={paymentForm.control}
                              name="invoiceNumber"
                              render={({ field: controllerField }) => (
                                <SelectMultiple
                                  isMulti
                                  options={unpaidInvoices.map(
                                    (invoice: any) => ({
                                      label: createLabel(invoice),
                                      value: invoice.invoiceNumber,
                                    }),
                                  )}
                                  value={unpaidInvoices
                                    .filter((inv: any) =>
                                      controllerField.value?.includes(
                                        inv.invoiceNumber,
                                      ),
                                    )
                                    .map((inv: any) => ({
                                      label: createLabel(inv),
                                      value: inv.invoiceNumber,
                                    }))}
                                  onChange={(selected) =>
                                    controllerField.onChange(
                                      selected.map((item) => item.value),
                                    )
                                  }
                                  placeholder="Select invoices"
                                />
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Invoice Amount field */}
                    <FormField
                      control={paymentForm.control}
                      name="invoiceAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Invoice Amount</FormLabel>
                          <FormControl>
                            <Input
                              // type="number"
                              readOnly
                              // placeholder="Enter invoice amount"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Received Amount field */}
                    <FormField
                      control={paymentForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Received Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Payment Date field */}
                    <FormField
                      control={paymentForm.control}
                      name="paymentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={
                                field.value
                                  ? format(new Date(field.value), "yyyy-MM-dd")
                                  : ""
                              }
                              onChange={(e) =>
                                field.onChange(new Date(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Payment Status field */}
                    <FormField
                      control={paymentForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="partially_paid">
                                Partially Paid
                              </SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                              <SelectItem value="cancelled">
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Payment Method field */}
                    <FormField
                      control={paymentForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                              <SelectItem value="bank transfer">
                                Bank Transfer
                              </SelectItem>
                              <SelectItem value="cheque">Cheque</SelectItem>
                              <SelectItem value="stripe">Stripe</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Remarks field */}
                    <FormField
                      control={paymentForm.control}
                      name="remarks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Remarks</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Additional notes or remarks"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Button to submit the form */}
                  <DialogFooter>
                    <Button type="submit">Create Payment</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* View Payment Dialog */}
          {selectedPayment && (
            // Only render the dialog if a payment is selected
            <Dialog
              open={isViewPaymentDialogOpen}
              onOpenChange={setIsViewPaymentDialogOpen}
            >
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Payment Details</DialogTitle>
                  <DialogDescription>
                    View and manage payment information.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Header section: Payment ID and Status */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">
                        {selectedPayment.paymentId}
                      </h3>
                      {/* Payment Date */}
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(selectedPayment.paymentDate),
                          "MMMM dd, yyyy",
                        )}
                      </p>
                    </div>
                    {/* Badge showing payment status with color variants */}
                    <Badge
                      variant={
                        selectedPayment.status === "paid"
                          ? "success"
                          : selectedPayment.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-sm"
                    >
                      {selectedPayment.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 my-4">
                    <div>
                      {/* Billed To section */}
                      <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                        Billed To
                      </h4>
                      <p className="font-medium">
                        {getStudentName(selectedPayment.studentId)}
                      </p>
                      <p className="text-sm">
                        Student ID:{" "}
                        {students.find(
                          (s: any) => s.id === selectedPayment.studentId,
                        )?.studentId || "-"}
                      </p>
                    </div>
                    {/* Payment Info section */}
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                        Payment Info
                      </h4>
                      <p className="text-sm">
                        <span className="font-medium">Payment Date:</span>{" "}
                        {format(
                          new Date(selectedPayment.paymentDate),
                          "MMMM dd, yyyy",
                        )}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Method:</span>{" "}
                        {selectedPayment.paymentMethod || "Not specified"}
                      </p>
                    </div>
                  </div>

                  {/* Payment Amount table */}
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-200">
                        {/* <tr>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-900">
                              Course Fee
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-neutral-900 font-mono">
                              {formatCurrency(Number(selectedPayment.amount))}
                            </td>
                          </tr> */}
                        {/* Total Amount row */}
                        <tr className="bg-neutral-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-neutral-900">
                            Total
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-neutral-900 font-mono">
                            {formatCurrency(Number(selectedPayment.amount))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Optional remarks section */}
                  {selectedPayment.remarks && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-1">Remarks</h4>
                      <p className="text-sm p-2 bg-neutral-50 rounded border">
                        {selectedPayment.remarks}
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex justify-end space-x-3 mt-4">
                    {selectedPayment.status === "pending" && (
                      <Button
                        variant="outline"
                        className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark as Paid
                      </Button>
                    )}
                    {/* Additional actions like download invoice can be added here */}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Dialog to create new receipt */}
          <Dialog
            open={isNewReceiptDialogOpen}
            onOpenChange={setIsNewReceiptDialogOpen}
          >
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                {/* Dialog title */}
                <DialogTitle>Create New Receipt</DialogTitle>
                {/* Dialog description */}
                <DialogDescription>Add a new receipt.</DialogDescription>
              </DialogHeader>
              {/* Form */}
              <Form {...receiptForm}>
                <form
                  onSubmit={receiptForm.handleSubmit(onSubmitReceiptForm)} // Submit handler
                  className="space-y-4"
                >
                  {/* Receipt Number */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={receiptForm.control}
                      name="receiptNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Receipt Number</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />{" "}
                            {/* Auto-generated / read-only */}
                          </FormControl>
                          <FormMessage /> {/* Validation errors */}
                        </FormItem>
                      )}
                    />
                    {/* Receipt Date */}
                    <FormField
                      control={receiptForm.control}
                      name="receiptDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Receipt Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={
                                field.value
                                  ? format(new Date(field.value), "yyyy-MM-dd")
                                  : ""
                              }
                              onChange={
                                (e) => field.onChange(new Date(e.target.value)) // Convert input back to Date
                              }
                            />
                          </FormControl>
                          <FormMessage /> {/* Validation errors */}
                        </FormItem>
                      )}
                    />
                    {/* Invoice Date */}
                    <FormField
                      control={receiptForm.control}
                      name="invoiceDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Invoice Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value ? field.value : ""}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage /> {/* Validation errors */}
                        </FormItem>
                      )}
                    />
                    {/* Payment ID */}
                    <FormField
                      control={receiptForm.control}
                      name="paymentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment ID</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange} // Update selected value
                              value={field.value} //Current value
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Payment ID" />
                              </SelectTrigger>
                              <SelectContent>
                                {payments.map((payment) => (
                                  <SelectItem
                                    key={payment.id}
                                    value={String(payment.paymentId)}
                                  >
                                    {payment.paymentId}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Amount */}
                    <FormField
                      control={receiptForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />{" "}
                            {/* Number input */}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Payment Method */}
                    <FormField
                      control={receiptForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Payment Method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                              <SelectItem value="online">
                                Online Transfer
                              </SelectItem>
                              <SelectItem value="cheque">Cheque</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Remarks */}
                    <FormField
                      control={receiptForm.control}
                      name="remarks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Remarks</FormLabel>
                          <FormControl>
                            <Input {...field} /> {/* Free Text input */}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* Dialog footer - submit button of form */}
                  <DialogFooter>
                    <Button type="submit">Create Receipt</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AppShell>
  );
}
