import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    PlusCircle,
    CalendarRange,
    Download,
    FileText,
    Eye,
    Check,
    CreditCard,
    Calculator,
    TrendingUp,
    ArrowUpDown,
    Minus
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Payroll, Employee, CreditNote, Student, creditNotes } from "@shared/schema";
import { capitalizeFirstLetter, extractMonth, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import ReactSelect from "react-select";
import SelectMultiple from "react-select";
import { Link } from "wouter";

/**
 * Zod schema for validating a Credit Note form.
 *
 * @purpose Validates the required fields and constraints for creating or editing a credit note in the system.
 *
 * @property {string} creditNoteNumber - Unique identifier for the credit note.
 * @property {number} studentId - ID of the student the credit note applies to.
 * @property {number} [appliedInvoiceId] - Optional ID of the invoice the credit note applies to.
 * @property {number} amount - Amount of the credit note. Must be greater than 0.
 * @property {string} generatedMonth - Month in "YYYY-MM" format when the credit note is generated.
 * @property {string} [appliedToType] - Optional type describing what the credit note is applied to.
 * @property {string} reason - Reason for issuing the credit note.
 * @property {string} status - Status of the credit note (e.g., "pending", "approved").
 * @throws {ZodError} Throws a Zod validation error if any required field is missing
 *         or does not meet the defined constraints (e.g., amount < 1).
 * @sideEffects None
 *
 * @example
 * const creditNoteData: CreditNoteFormValues = {
 *   creditNoteNumber: "CN-001",
 *   studentId: 123,
 *   amount: 500,
 *   generatedMonth: "2025-10",
 *   reason: "Fee adjustment",
 *   status: "pending",
 * };
 * 
 * creditNoteForm.reset(creditNoteData);
 */
const creditNoteFormSchema = z.object({
    creditNoteNumber: z.string(),
    studentId: z.number({
        required_error: "Please select a student",
    }),
    appliedInvoiceId: z.number().optional(),
    amount: z.number({
        required_error: "Amount is required",
    }).min(1, "Amount must be greater than 0"),
    generatedMonth: z.string({
        required_error: "Generated month is required",
    }),
    appliedToType: z.string().optional(),
    reason: z.string({
        required_error: "Reason is required",
    }),
    status: z.string({
        required_error: "Status is required",
    }),
});


/**
 * Type inference for the Credit Note form values based on the schema.
 */
type CreditNoteFormValues = z.infer<typeof creditNoteFormSchema>;

/**
 * BranchAdminCreditNotes Component
 *
 * @purpose
 * Handles display, creation, and management of credit notes for students.
 * Fetches students, invoices, and credit notes via React Query. Provides a form for creating new credit notes with validation using Zod.
 *
 * @param None
 * @returns JSX.Element - The rendered credit notes management UI.
 * @throws None
 * @sideEffects
 * - Fetches data from `/api/students`, `/api/invoicesByStudent/:studentId`, and `/api/creditNotes`.
 * - Updates query cache when a new credit note is created.
 * - Updates the credit note number automatically based on existing notes.
 *
 * @example
 * ```tsx
 * <CreditNotes />
 * ```
 */
export default function BranchAdminCreditNotes() {
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
    const [activeTab, setActiveTab] = useState("all");
    const [isViewDialog, setIsViewDialog] = useState(false);
    const [isCreateDialog, setIsCreateDialog] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
    const { toast } = useToast();

    /**
     * @purpose Fetches all credit notes from the API.
     *
     * @param None
     * @returns
     * - `data`: Array of `CreditNote` objects (`creditNotes`), defaults to empty array.
     * - `isLoading`: Boolean indicating whether the query is currently loading.
     *
     * @throws None (API errors are handled internally by React Query)
     *
     * @sideEffects
     * - Sends an HTTP GET request to `/api/creditNotes`.
     * - Caches results in React Query under the key `["/api/creditNotes"]`.
     *
     * @example
     * const { data: creditNotes, isLoading } = useQuery<CreditNote[]>({
     *   queryKey: ["/api/creditNotes"],
     * });
     */
    const { data: creditNotes = [], isLoading } = useQuery<CreditNote[]>({
        queryKey: ["/api/creditNotes"],
    });


    /**
     * @purpose Fetches all students from the API.
     *
     * @param None
     * @returns
     * - `data`: Array of `Student` objects (`students`), defaults to empty array.
     * - `isLoading`: Boolean indicating whether the query is currently loading.
     *
     * @throws None (API errors are handled internally by React Query)
     *
     * @sideEffects
     * - Sends an HTTP GET request to `/api/students`.
     * - Caches results in React Query under the key `["/api/students"]`.
     *
     * @example
     * const { data: students, isLoading: studentsLoading } = useQuery<Student[]>({
     *   queryKey: ["/api/students"],
     * });
     */
    const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
        queryKey: ["/api/students"],
    });


    /**
     * @purpose Credit Note form instance for creating or editing credit notes.
     *
     * @param None (form configuration is defined in options)
     * @returns
     * - `creditNoteForm`: React Hook Form instance with default values and validation.
     *
     * @throws None
     *
     * @sideEffects
     * - Tracks form state for credit note creation/editing.
     * - Provides validation using `zodResolver` with `creditNoteFormSchema`.
     *
     * @example
     * const appliedToType = creditNoteForm.watch("appliedToType");
     * creditNoteForm.setValue("amount", 100);
     */
    const creditNoteForm = useForm<CreditNoteFormValues>({
        resolver: zodResolver(creditNoteFormSchema),
        defaultValues: {
            creditNoteNumber: "",
            studentId: 0,
            amount: 0,
            generatedMonth: format(new Date(), "yyyy-MM"),
            appliedInvoiceId: 0,
            appliedToType: "",
            reason: "",
            status: "",
        },
    });

    const appliedToType = creditNoteForm.watch("appliedToType");

    /**
     * Watches the selected student ID from the form.
     *
     * @purpose
     * Tracks which student is selected in the form in order to fetch related invoices.
     *
     * @returns number - Currently selected student ID.
     *
     * @sideEffects None
     *
     * @example
     * ```ts
     * const studentId = selectedStudentId;
     * ```
     */
    const selectedStudentId = useWatch({
        control: creditNoteForm.control,
        name: "studentId",
    });

    /**
     * @purpose Fetches invoices for a selected student using React Query.
     *
     * @param selectedStudentId The ID of the student whose invoices are being fetched.
     * @returns
     * - `data`: Array of invoices (`invoices`), empty array if no student is selected.
     * - `isLoading`: Boolean indicating if the query is currently loading.
     *
     * @throws None (API errors are not thrown; they can be handled in the `onError` callback if needed)
     *
     * @sideEffects
     * - Triggers an HTTP GET request to `/api/invoicesByStudent/${selectedStudentId}` when `selectedStudentId` is truthy.
     * - Caches results under the query key `["invoices", selectedStudentId]` in React Query.
     *
     */
    const {
        data: invoices = [],
        isLoading: isLoadingInvoices,
    } = useQuery({
        queryKey: ["invoices", selectedStudentId],
        queryFn: async () => {
            if (!selectedStudentId) return [];
            const res = await fetch(`/api/invoicesByStudent/${selectedStudentId}`);
            return res.json();
        },
        enabled: !!selectedStudentId,
    });


    /**
     * Returns the full name of a student by ID.
     *
     * @purpose
     * Finds the student from the `students` array and returns their full name.
     *
     * @param studentId - The ID of the student (number or string).
     *
     * @returns string - The full name of the student, or "Unknown" if not found.
     * 
     * @throws None.
     *
     * @sideEffects None
     *
     * @example
     * ```ts
     * const name = getStudentName(3); // "John Doe"
     * ```
     */
    const getStudentName = (studentId: number | string): string => {
        const student = students?.find((s) => s.id === Number(studentId));
        return student ? `${student.firstName} ${student.lastName}` : "Unknown";
    };

    /**
     * List of months in the current year.
     *
     * @purpose
     * Provides options for the credit note generation month dropdown.
     *
     * @param None
     * @returns string[] - Array of month strings in the format "Month-YYYY".
     * @throws None
     * @sideEffects None
     *
     * @example
     * ```ts
     * monthsOfYear = ["January-2025", "February-2025", ...];
     * ```
     */
    const currentYear = new Date().getFullYear();
    const monthsOfYear = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ].map((month) => `${month}-${currentYear}`);


    /**
     * Credit note table columns configuration.
     *
     * @purpose
     * Defines the columns for displaying credit notes in a table.
     * Each column includes header, accessor, cell renderer, and optional settings such as sorting.
     *
     * @param None
     * @returns ColumnDef<CreditNote>[] - Array of column definitions for the credit note table.
     * @throws None
     * @sideEffects None
     *
     * @example
     * ```ts
     * <DataTable columns={columns} data={creditNotes} />
     * ```
     */
    const columns: ColumnDef<CreditNote>[] = [
        {
            id: "serial",
            header: "SL.No.",
            /**
             * Renders the serial number based on the sorted row index.
             *
             * @param table - Table instance provided by the react-table library.
             * @param row - Current row object.
             * @returns JSX.Element - Serial number element.
             *
             * @sideEffects None
             *
             * @example
             * ```tsx
             * <div>1</div>
             * ```
             */
            cell: ({ table, row }) => {
                const sortedRows = table.getSortedRowModel().rows;
                const index = sortedRows.findIndex((r) => r.id === row.id);
                return <div>{index + 1}</div>;
            },
            enableSorting: false,
        },
        {
            accessorKey: "creditNoteNumber",
            header: "Credit Note Number",
            /**
             * Renders the credit note number as a clickable link to print the note.
             *
             * @param row - Current row object.
             * @returns JSX.Element - Link to the credit note print page.
             *
             * @sideEffects None
             *
             * @example
             * ```tsx
             * <Link href="/admin/print-credit-note/CN-101">CN-101</Link>
             * ```
             */
            cell: ({ row }) => {
                const creditNoteNumber = row.getValue("creditNoteNumber") as string;
                return (
                    <Link
                        href={`/branch-admin/print-credit-note/${creditNoteNumber}`}
                        className="text-blue-600 hover:underline"
                    >
                        {creditNoteNumber}
                    </Link>
                );
            },
        },
        {
            accessorKey: "studentId",
            header: "Student",
            /**
             * Renders the student name based on `studentId`.
             *
             * @param row - Current row object.
             * @returns JSX.Element - Full name of the student or "Unknown" if not found.
             *
             * @sideEffects Uses `getStudentName` helper.
             *
             * @example
             * ```tsx
             * <div>John Doe</div>
             * ```
             */
            cell: ({ row }) => {
                const student = students.find((student) => student.id === row.original.studentId);
                return student ?
                    <div>{getStudentName(student.id)}</div> :
                    <div>Unknown</div>;
            },
        },
        {
            accessorKey: "appliedToType",
            header: "Applied To Type",
            /**
             * Renders the type of application for the credit note, capitalized.
             *
             * @param row - Current row object.
             * @returns string - Capitalized applied type.
             *
             * @sideEffects Uses `capitalizeFirstLetter` helper.
             *
             * @example
             * ```tsx
             * Tuition
             * ```
             */
            cell: ({ row }) => {
                return capitalizeFirstLetter(row.original.appliedToType || "");
            },
        },
        {
            accessorKey: "appliedInvoiceId",
            header: "Applied Invoice",
            /**
             * Renders the invoice number linked to the credit note.
             *
             * @param row - Current row object.
             * @returns JSX.Element - Invoice number or "Unknown".
             *
             * @sideEffects None
             *
             * @example
             * ```tsx
             * <div className="font-medium">INV-1001</div>
             * ```
             */
            cell: ({ row }) => {
                const invoice = invoices.find((invoice: any) => invoice.id === row.original.appliedInvoiceId);
                return invoice ?
                    <div className="font-medium">{invoice.invoiceNumber}</div> :
                    <div>Unknown</div>;
            },
        },
        {
            accessorKey: "amount",
            header: "Amount",
            /**
             * Renders the credit note amount formatted as currency.
             *
             * @param row - Current row object.
             * @returns string - Formatted currency string.
             *
             * @sideEffects Uses `formatCurrency` helper.
             *
             * @example
             * ```ts
             * $1,500.00
             * ```
             */
            cell: ({ row }) => {
                return formatCurrency(Number(row.original.amount));
            },
        },
        {
            accessorKey: "generatedMonth",
            header: "Generated Month",
            /**
             * Renders the generated month of the credit note.
             *
             * @param row - Current row object.
             * @returns string - Generated month.
             *
             * @sideEffects None
             *
             * @example
             * ```ts
             * September-2025
             * ```
             */
            cell: ({ row }) => {
                return row.original.generatedMonth;
            },
        },
        {
            accessorKey: "reason",
            header: "Reason",
            /**
             * Renders the reason for the credit note.
             *
             * @param row - Current row object.
             * @returns string - Reason text.
             *
             * @sideEffects None
             *
             * @example
             * ```ts
             * Overpayment adjustment
             * ```
             */
            cell: ({ row }) => {
                return row.original.reason;
            },
        },
        {
            accessorKey: "createdAt",
            header: "Created At",
            /**
             * Renders the creation date of the credit note.
             *
             * @param row - Current row object.
             * @returns JSX.Element - Formatted date or "-" if unavailable.
             *
             * @sideEffects Uses `format` from date-fns.
             *
             * @example
             * ```ts
             * Sep 02, 2025
             * ```
             */
            cell: ({ row }) => {
                const date = row.original.createdAt;
                return date ? format(new Date(date), "MMM dd, yyyy") : "-";
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            /**
             * Renders the status of the credit note with a badge.
             *
             * @param row - Current row object.
             * @returns JSX.Element - Badge with status text.
             *
             * @sideEffects Uses `Badge` component.
             *
             * @example
             * ```tsx
             * <Badge variant="secondary">Open</Badge>
             * ```
             */
            cell: ({ row }) => {
                const status = row.original.status;
                let badgeVariant: "default" | "success" | "secondary" | "destructive" | "outline" | null | undefined = "default";

                if (status === "open") {
                    badgeVariant = "secondary";
                } else if (status === "applied") {
                    badgeVariant = "default";
                }

                return (
                    <Badge variant={badgeVariant}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            /**
             * Renders action buttons for each credit note row.
             *
             * @param row - Current row object.
             * @returns JSX.Element - Buttons for view and status actions.
             *
             * @sideEffects Calls `handleViewPayroll` when the view button is clicked.
             *
             * @example
             * ```tsx
             * <Button onClick={() => handleViewPayroll(row.original)}>...</Button>
             * ```
             */
            cell: ({ row }) => {
                const payroll = row.original;

                return (
                    <div className="flex space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            // onClick={() => handleViewPayroll(payroll)}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        {payroll.status === "processed" && (
                            <Button variant="ghost" size="icon" className="text-green-600">
                                <Check className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    /**
     * Handles submission of the credit note form.
     *
     * @purpose
     * Validates the form data and sends a POST request to create a new credit note.
     * Updates the query cache and shows notifications.
     *
     * @param data - The validated credit note form values of type `CreditNoteFormValues`.
     *
     * @returns Promise<void>
     *
     * @sideEffects
     * - Calls `apiRequest` to create a credit note.
     * - Resets the credit note form.
     * - Invalidates React Query caches for `/api/creditNotes` and `allCreditNotesData`.
     * - Shows success or error toast notifications.
     *
     * @throws Error if the API request fails.
     *
     * @example
     * ```ts
     * onSubmitCreditNoteForm({
     *   creditNoteNumber: "CN-101",
     *   studentId: 1,
     *   appliedInvoiceId: 5,
     *   amount: 1500,
     *   generatedMonth: "September-2025",
     *   appliedToType: "tuition",
     *   reason: "Overpayment adjustment",
     *   status: "approved",
     * });
     * ```
     */
    const onSubmitCreditNoteForm = async (data: CreditNoteFormValues) => {
        if (!data.reason || data.reason.trim().length < 5) {
            toast({
                title: "Validation Error",
                description: "Please provide a valid reason.",
                variant: "destructive",
            });
            return;
        }

        try {
            const creditNoteData = {
                ...data,
                creditNoteNumber: data.creditNoteNumber,
                studentId: data.studentId,
                appliedInvoiceId: data.appliedInvoiceId,
                amount: data.amount,
                generatedMonth: data.generatedMonth,
                reason: data.reason,
                status: "approved",
            };
            await apiRequest("POST", "/api/creditNotes", creditNoteData);
            queryClient.invalidateQueries({ queryKey: ["/api/creditNotes"] });

            setIsCreateDialog(false);
            creditNoteForm.reset();
            toast({
                title: "Success",
                description: "Credit note created successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create credit note.",
                variant: "destructive",
            });
        }
    };

    //   const handleViewCreditNote = (creditNote: CreditNote) => {
    //     setSelectedCreditNote(creditNote);
    //     setIsViewDialog(true);
    //   };


    /**
     * React useEffect hook to set the next credit note number.
     *
     * @purpose
     * - Calculates the next credit note number based on existing credit notes
     * - Sets the default value in the form.
     * 
     * @param {Array<{ creditNoteNumber?: string }>} creditNotes - List of existing credit notes, each with an optional `creditNoteNumber` string like "CN-101".
     * @sideEffects
     * - Calls `creditNoteForm.setValue()` to update the "creditNoteNumber" field in the form.
     * - Runs whenever the `creditNotes` array changes.
     * @returns {void} This effect does not return any value.
     * @throws {Error} May throw an error if `creditNoteNumber` contains a non-numeric value that cannot be parsed by `parseInt`.
     *
     * @example
     * // Suppose creditNotes = [{ creditNoteNumber: "CN-105" }, { creditNoteNumber: "CN-108" }]
     * // The form will automatically set creditNoteNumber to "CN-109"
     *
     * @example
     * // If creditNotes = []
     * // The form will automatically set creditNoteNumber to "CN-101"
     */
    useEffect(() => {
        if (creditNotes.length > 0) {
            const lastNote = creditNotes
                .map(note => parseInt(note.creditNoteNumber?.replace("CN-", "") || "0"))
                .sort((a, b) => b - a)[0];

            const nextNumber = lastNote + 1 || 101;
            creditNoteForm.setValue("creditNoteNumber", `CN-${nextNumber}`);
        } else {
            creditNoteForm.setValue("creditNoteNumber", "CN-101");
        }
    }, [creditNotes]);

    return (
        <AppShell> {/* Main app container providing consistent layout for the admin dashboard */}

            {/* Page header with title, description, and action buttons */}
            <PageHeader
                title="Credit Notes"
                description="Manage credit notes for students."
                actions={
                    <Button onClick={() => setIsCreateDialog(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        New Credit Note
                    </Button>
                }
            />

            {/* Data table to display credit notes */}
            <DataTable
                columns={columns} // Column definitions for the data table
                data={creditNotes} // Data array to be displayed in the table
                searchColumns={["studentId"]} // Columns to be used for searching
                searchPlaceholder="Search credit note..." // Placeholder for search input
            />

            {/* Create Credit Note Dialog */}
            <Dialog
                open={isCreateDialog} // Controls open/close state of the dialog
                onOpenChange={(open) => {
                    setIsCreateDialog(open); // Update the dialog state when the dialog is opened or closed
                    if (!open) {
                        creditNoteForm.reset(); // Reset the form if dialog is closed
                    }
                }}>

                {/* Dialog content */}
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Credit Note</DialogTitle>
                        <DialogDescription>
                            Create a new credit note for a student.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Form to create a new credit note */}
                    <Form {...creditNoteForm}>
                        <form onSubmit={creditNoteForm.handleSubmit(onSubmitCreditNoteForm)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={creditNoteForm.control}
                                    name="creditNoteNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Credit Note Number</FormLabel>
                                            <Input {...field} readOnly />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Student selection - MultiSelect */}
                                <FormField
                                    control={creditNoteForm.control}
                                    name="studentId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Student</FormLabel>
                                            <ReactSelect
                                                options={students.map((student: any) => ({
                                                    label: `${getStudentName(student.id)}`,
                                                    value: student.id.toString(),
                                                }))}
                                                onChange={(option: any) => field.onChange(parseInt(option?.value || "0"))}
                                                value={students
                                                    .map((student: any) => ({
                                                        label: `${getStudentName(student.id)}`,
                                                        value: student.id.toString(),
                                                    }))
                                                    .find(opt => opt.value === field.value?.toString())}
                                                isSearchable
                                                placeholder="Select a student"
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* AppliedToType selection - SingleSelect */}
                                <FormField
                                    control={creditNoteForm.control}
                                    name="appliedToType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Applied To Type</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="against invoice">Against Invoice</SelectItem>
                                                    <SelectItem value="own account">Own Account</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {appliedToType === "against invoice" && (
                                    <FormField
                                        control={creditNoteForm.control}
                                        name="appliedInvoiceId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Invoice</FormLabel>
                                                <ReactSelect
                                                    options={invoices.map((invoice: any) => ({
                                                        label: `${invoice.invoiceNumber}`,
                                                        value: invoice.id.toString(),
                                                    }))}
                                                    onChange={(option: any) => field.onChange(parseInt(option?.value || "0"))}
                                                    value={invoices
                                                        .map((invoice: any) => ({
                                                            label: `${invoice.invoiceNumber}`,
                                                            value: invoice.id.toString(),
                                                        }))
                                                        .find((opt: any) => opt.value === field.value?.toString())}
                                                    isSearchable
                                                    placeholder="Select an invoice"
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {/* Amount input */}
                                <FormField
                                    control={creditNoteForm.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount</FormLabel>
                                            <Input {...field} type="number" value={field.value}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Generated Month selection */}
                                <FormField
                                    control={creditNoteForm.control}
                                    name="generatedMonth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Generated Month</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a month" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {monthsOfYear.map((monthYear) => {
                                                        const [month, year] = monthYear.split("-");
                                                        return (
                                                            <SelectItem key={monthYear} value={monthYear}>
                                                                {month} {year}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Reason input */}
                                <FormField
                                    control={creditNoteForm.control}
                                    name="reason"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reason</FormLabel>
                                            <Input {...field} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateDialog(false)}>Cancel</Button>
                                <Button type="submit">Create Credit Note</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </AppShell>
    );
}
