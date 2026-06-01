import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, FileText, Download, Receipt, CheckCircle2, AlertCircle, CreditCard } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Payment, Student, Enrollment } from "@shared/schema";
import { formatCurrency, generateInvoiceId } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import React from "react";

/**
 * @purpose
 * - Display all student enrollments and payment details.
 * - Allow filtering by enrollment status: "all", "active", "inactive".
 * - Enable search functionality on invoice ID, student ID, and enrollment status.
 * - Provide a link to view printable invoice and an export button.
 *
 * @param {object} [props] - Currently unused, reserved for future props.
 * @returns {JSX.Element} The rendered student enrollments UI including tabs, search input, and a data table.
 * @sideEffects
 * - Fetches payments, students, and enrollments from APIs using React Query.
 * - Manages local state: `activeTab`, `searchQuery`.
 * - Uses `useMemo` to compute `filteredEnrollments`, `mergedPayments`, and `searchFilteredPayments` to avoid unnecessary re-renders.
 * @throws {Error} May throw a runtime error if API fetches fail or if the table tries to render undefined data.
 *
 * @example
 * import BranchAdminStudentEnrollments from "./BranchAdminStudentEnrollments";
 *
 * function BranchAdminDashboard() {
 *   return (
 *     <div className="p-6 bg-white rounded-lg shadow">
 *       <h2 className="text-xl font-bold mb-4">Student Management</h2>
 *       <BranchAdminStudentEnrollments />
 *     </div>
 *   );
 * }
 */
export default function BranchAdminStudentEnrollments() {

  // Track the active tab: "all", "active", or "inactive"
  const [activeTab, setActiveTab] = useState("all");

  // Track search query string for filtering payments
  const [searchQuery, setSearchQuery] = useState("");

  // Toast notification
  const { toast } = useToast();

  /**
   * Fetches all payments.
   *
   * @purpose Provides the parent dashboard with payment history and summaries.
   *
   * @param None.
   * @returns
   * - `payments`: Array of payment objects.
   * - `isLoadingPayments`: Boolean indicating if the data is still loading.
   * @throws Throws an error if the query fails.
   * @sideEffects Performs a GET request to `/api/payments`. Caches the response in React Query.
   *
   * @example
   * const { data: payments, isLoading: isLoadingPayments } = useQuery({
   *   queryKey: ["/api/payments"],
   * });
   */
  const { data: payments = [], isLoading: isLoadingPayments } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
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
  const { data: students = [], isLoading: isLoadingStudents } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });


  /**
   * Fetch all enrollments.
   *
   * @purpose Retrieve all enrollments.
   * 
   * @param None
   * @returns {UseQueryResult<Enrollment[], Error>}
   * @throws React Query will surface network/fetch errors.
   * @sideEffects Performs network request to `/api/enrollments`.
   * @example
   * const { data: enrollments } = useQuery({ queryKey: ['/api/enrollments'] });
   */
  const { data: enrollments = [], isLoading: isLoadingEnrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments"],
  });

  // Filter enrollments based on active tab
  const filteredEnrollments = React.useMemo(() => {
    return activeTab === "all"
      ? enrollments
      : enrollments.filter(enrollment => enrollment.status === activeTab);
  }, [enrollments, activeTab]);

 
  /**
   * Returns the full name of a student by ID.
   *
   * @purpose Finds the student from the `students` array and returns their full name.
   *
   * @param studentId - The ID of the student (number or string).
   * @returns string - The full name of the student, or "Unknown" if not found.
   * @throws None.
   * @sideEffects None
   *
   * @example
   * ```ts
   * const name = getStudentName(3); // "John Doe"
   * ```
   */
  const getStudentName = (studentId: number): string => {
    const student = students.find((s: any) => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : `Student ${studentId}`;
  };


  /**
   * @purpose Extends a Payment object by including the enrollment status of the student.
   *
   * @param None (this is a type definition)
   * @returns {Payment & { enrollmentStatus?: string }} The type includes all properties of Payment
   *          plus an optional `enrollmentStatus` which reflects the student's enrollment status.
   * @throws None
   * @sideEffects None
   * @example
   * const payment: PaymentWithEnrollmentStatus = {
   *   id: 1,
   *   studentId: 101,
   *   amount: 500,
   *   invoiceId: "INV-001",
   *   enrollmentStatus: "active" // optional
   * };
   */
  type PaymentWithEnrollmentStatus = Payment & {
    enrollmentStatus?: string; // or better, exact union type from Enrollment.status
  };
  

  /**
   * @purpose Combines payments with their corresponding student's enrollment status.
   *
   * @param None (relies on React state/hooks: payments, filteredEnrollments, isLoadingPayments, isLoadingEnrollments)
   * @returns {PaymentWithEnrollmentStatus[]} Array of payments with added `enrollmentStatus` property.
   * @throws None explicitly. Returns an empty array if payments or enrollments are still loading.
   * @sideEffects Memoized using React.useMemo to avoid unnecessary recalculations.
   * @example
   * const merged = mergedPayments;
   * console.log(merged[0].enrollmentStatus); // 'active' | 'inactive' | 'unknown'
   */
  const mergedPayments = React.useMemo(() => {
    if (isLoadingPayments || isLoadingEnrollments) return [];

    return payments.map(payment => {
      const enrollment = filteredEnrollments.find(e => e.studentId === payment.studentId);
      return {
        ...payment,
        enrollmentStatus: enrollment?.status ?? "unknown",
      };
    });
  }, [payments, filteredEnrollments, isLoadingPayments, isLoadingEnrollments]);


  /**
   * @purpose Filters merged payments based on a search query that matches invoiceId, studentId, or enrollmentStatus.
   *
   * @param None (relies on React state/hooks: searchQuery, mergedPayments)
   * @returns {PaymentWithEnrollmentStatus[]} Array of payments matching the search query.
   * @throws None explicitly.
   * @sideEffects Memoized using React.useMemo to optimize performance when `searchQuery` or `mergedPayments` change.
   * @example
   * const filtered = searchFilteredPayments;
   * console.log(filtered.length); // Number of payments matching the search query
   */
  const searchFilteredPayments = React.useMemo(() => {
    if (!searchQuery) return mergedPayments;

    const query = searchQuery.toLowerCase();

    return mergedPayments.filter(payment =>
      payment.invoiceId.toLowerCase().includes(query) ||
      payment.studentId.toString().includes(query) ||
      payment.enrollmentStatus?.toLowerCase().includes(query)
    );
  }, [searchQuery, mergedPayments]);
  
  
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
  const paymentColumns: ColumnDef<PaymentWithEnrollmentStatus>[] = [
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
      accessorKey: "invoiceId",
      header: "Invoice ID",
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <Link to={`/admin/print-invoice/${invoice.invoiceId}`} className="text-primary hover:underline font-bold">
            {invoice.invoiceId}
          </Link>
        );
      },
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
    // {
    //   accessorKey: "dueDate",
    //   header: "Due Date",
    //   cell: ({ row }) => {
    //     return format(new Date(row.original.dueDate), "MMM dd, yyyy");
    //   },
    // },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.enrollmentStatus;
        let badgeVariant: "default" | "success" | "destructive" | "outline" | "secondary" = "outline";
        
        if (status === "active") {
          badgeVariant = "default";
        } else if (status === "inactive") {
          badgeVariant = "destructive";
        }
        
        return (
          <Badge variant={badgeVariant}>
            {status}
          </Badge>
        );
      },
    }
  ];

  return (
    <AppShell>
      {/* Page head with title and description */}
      <PageHeader 
        title="Student Enrollments" 
        description="Manage student enrollments"
      />
      
      {/* Filter and actions */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Tabs for filtering by status */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Search and export buttons */}
          <div className="flex gap-2">
            <Input
              placeholder="Search by invoice ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-[300px]"
            />
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>
      
      {/* Data table */}
      <DataTable 
        columns={paymentColumns}  // Column configure
        data={searchFilteredPayments}  // Data to display
        searchColumns={["invoiceId"]}  // Columns to search
        searchPlaceholder="Search payments..." // Search placeholder input
      />
    </AppShell>
  );
}
