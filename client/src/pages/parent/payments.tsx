import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Home, Search, ArrowDown, ArrowUp, Download, CreditCard, FileText, CheckCircle, AlertCircle, Clock, X } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { capitalizeFirstLetter, formatCurrency } from "@/lib/utils";
import { FixedFooter } from "@/components/layout/footer";
import { useQuery } from "@tanstack/react-query";
import { Student } from "@shared/schema";
import { Link } from "wouter";


/**
 * ParentPayments component displays a list of payment invoices for the parent's children.
 *
 * @purpose
 * - Fetch student data associated with the logged-in parent.
 * - Fetch payment invoices for the parent's children.
 * - Filter payments by student, search query, and tab (upcoming/history).
 * - Sort payments by column and direction.
 * - Display visual indicators (colors/icons) for payment status.
 * 
 * @param None
 * @returns {JSX.Element} The rendered payments dashboard.
 * @throws {Error} Throws if fetching students or invoices fails.
 * @sideEffects
 * - Fetches data using `useQuery` from endpoints:
 *    - `/api/students-with-parents`
 *    - `/api/invoices/parent`
 * - Updates component state when user interacts with filters, tabs, or sorting.
 *
 * @example
 * <ParentPayments />
 */
export default function ParentPayments() {
  const { user } = useAuth();
  const [tab, setTab] = useState("upcoming");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  /**
   * Fetches the list of students associated with the logged-in parent.
   *
   * @purpose
   * - Fetches student data using `useQuery` from `/api/students-with-parents`.
   *
   * @param {number | undefined} user?.id - The ID of the logged-in parent.
   * @returns {Student[]} An array of `Student` objects; defaults to empty array if no data.
   * @throws {Error} Throws if the API call fails (handled internally by React Query).
   * @sideEffects
   * - Sends a GET request to `/api/students-with-parents`.
   * - React Query caches the result for subsequent calls.
   *
   * @example
   * const { data: students, isLoading } = useQuery<Student[]>(["/api/students-with-parents", user?.id], { enabled: !!user });
   */
  const { data: students = [], isLoading: isLoadingStudents } = useQuery<Student[]>({
    queryKey: ["/api/students-with-parents", user?.id],
    enabled: !!user,
  });

  /**
   * Fetches the payment invoices for the parent's children.
   *
   * @purpose
   * - Fetches invoice data using `useQuery` from `/api/invoices/parent/${user?.id}?status=paid,partially_paid,unpaid`.
   *
   * @param {number | undefined} user?.id - The ID of the logged-in parent.
   * @returns {Invoice[]} An array of invoice objects; defaults to empty array if no data.
   * @throws {Error} Throws if the API request fails.
   * @sideEffects
   * - Sends a GET request to `/api/invoices/parent/${user?.id}?status=paid,partially_paid,unpaid`.
   * - React Query caches the result for subsequent calls.
   *
   * @example
   * const { data: payments, isLoading } = useQuery(["/api/invoices/parent", user?.id], {
   *   enabled: !!user,
   *   queryFn: async () => {
   *     const response = await fetch(`/api/invoices/parent/${user?.id}?status=paid,partially_paid,unpaid`);
   *     if (!response.ok) throw new Error("Failed to fetch invoices");
   *     return response.json();
   *   },
   * });
   */
  const { data: payments = [] } = useQuery({
    queryKey: ["/api/invoices/parent", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // const statusQuery = tab === "history" ? "paid" : "unpaid,partially_paid";
      // const response = await fetch(`/api/invoices/parent/${user?.id}?status=${statusQuery}`);
      const response = await fetch(`/api/invoices/parent/${user?.id}?status=paid,partially_paid,unpaid`);
      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }
      return response.json();
    },
  });

  /**
   * Returns a Tailwind CSS class string representing the background and text color for a given payment status.
   *
   * @purpose Provides consistent visual styling for payment status badges.
   *
   * @param {string} status - The status of the payment ("paid", "upcoming", "overdue", etc.).
   * @returns {string} Tailwind CSS classes for background and text color.
   * @throws None.
   * @sideEffects - None; pure function.
   *
   * @example
   * const colorClass = getStatusColor("paid"); // "bg-green-100 text-green-800"
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  /**
   * Returns a React icon component corresponding to a payment status.
   *
   * @purpose Provides a visual indicator for payment status in the UI.
   *
   * @param {string} status - The status of the payment ("paid", "upcoming", "overdue", etc.).
   * @returns {React.ReactNode | null} JSX element representing the icon, or null if no icon.
   * @throws None.
   * @sideEffects - None; pure function.
   *
   * @example
   * const icon = getStatusIcon("upcoming"); // <Clock className="h-4 w-4 text-blue-600" />
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "upcoming":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  /**
   * Maps raw payment data to a simplified structure for table display.
   *
   * @purpose Normalizes and flattens invoice and student data for easier consumption in the UI table.
   *
   * @param {any[]} payments - Array of raw payment objects fetched from API.
   * @throws Assumes `payments` array contains valid invoice and student data; does not explicitly throw.
   * @returns {Array<{id: number, studentName: string, invoiceNumber: string, amount: number, amountPaid: number, issueDate: string, dueDate: string, status: string}>} 
   * - Array of mapped payment objects.
   * @sideEffects None. Pure function derived via `useMemo`.
   * 
   * @example
   * // Example output:
   * [
   *   {
   *     id: 101,
   *     studentName: "Riya Sharma",
   *     invoiceNumber: "INV-001",
   *     amount: 1000,
   *     amountPaid: 500,
   *     issueDate: "2025-10-01",
   *     dueDate: "2025-10-15",
   *     status: "partially_paid"
   *   }
   * ]
   */
  const mappedPayments = useMemo(() => payments.map((p: any) => ({
    id: p.invoices.id,
    studentName: `${p.firstName} ${p.middleName} ${p.lastName}`,
    invoiceNumber: p.invoices.invoiceNumber,
    amount: Number(p.invoices.totalAmount),
    amountPaid: Number(p.invoices.amountPaid),
    issueDate: p.invoices.issueDate,
    dueDate: p.invoices.dueDate,
    status: p.invoices.status
  })), [payments]);

  /**
   * Filters `mappedPayments` based on the active tab (upcoming or history).
   *
   * @purpose Provides only the relevant subset of payments for display based on status.
   *
   * @param {string} tab - Current tab, either "upcoming" or "history".
   * @throws None. Assumes `mappedPayments` is a valid array.
   * @returns {Array<any>} - Filtered array of payments.
   * @sideEffects None. Pure function via `useMemo`.
   *
   * @example
   * // If tab === "upcoming", returns all payments with status "unpaid".
   * filteredPayments;
   */
  const filteredPayments = useMemo(() => {
    if (tab === "upcoming") {
      return mappedPayments.filter((p: any) => p.status === "unpaid");
    } else {
      return mappedPayments.filter((p: any) => p.status === "paid" || p.status === "partially_paid");
    }
  }, [mappedPayments, tab]);

  
  /**
   * Calculates the total amount paid by the selected student or all students.
   *
   * @purpose Provides a numeric summary of completed or partial payments.
   *
   * @param {any[]} payments - Raw payments array.
   * @param {string} selectedStudent - Student ID or "all".
   * @throws Assumes `payments` contains numeric strings for `amountPaid`; non-numeric values are treated as 0.
   * @returns {number} - Total amount paid.
   * @sideEffects None.
   *
   * @example
   * // Total paid for a student
   * totalPaid; // e.g., 1500
   */
  const totalPaid = payments
  .filter(
    (p: any) =>
      (p.invoices.status === "paid" || p.invoices.status === "partially_paid") &&
      (selectedStudent === "all" || p.studentId === selectedStudent)
  )
  .reduce((sum: number, p: any) => {
    const amountPaid = parseFloat(p.invoices.amountPaid || "0");
    return sum + (isNaN(amountPaid) ? 0 : amountPaid);
  }, 0);

/**
 * Calculates the total pending amount for unpaid invoices.
 *
 * @purpose Provides numeric summary of unpaid invoices for UI display.
 *
 * @param {any[]} payments - Raw payments array.
 * @param {string} selectedStudent - Student ID or "all".
 * @throws Assumes `payments` contains numeric strings for `totalAmount`.
 * @returns {number} - Total pending amount.
 * @sideEffects None.
 *
 * @example
 * // Total unpaid invoices
 * totalPending; // e.g., 2500
 */
const totalPending = payments
  .filter(
    (p: any) =>
      p.invoices.status === "unpaid" &&
      (selectedStudent === "all" || p.studentId === selectedStudent)
  )
  .reduce((sum: any, p: any) => sum + parseFloat(p.invoices.totalAmount), 0);

  /**
   * Calculates the total overdue amount for invoices past their due date.
   *
   * @purpose Provides numeric summary of overdue invoices for highlighting in UI.
   *
   * @param {any[]} payments - Raw payments array.
   * @param {string} selectedStudent - Student ID or "all".
   * @throws Assumes `payments` contains valid `dueDate` strings.
   * @returns {number} - Total overdue amount.
   * @sideEffects None.
   * 
   * @example
   * // Total overdue invoices
   * totalOverdue; // e.g., 500
   */
  const today = new Date();

  const totalOverdue = payments
    .filter((p: any) => {
      const dueDate = new Date(p.invoices.dueDate);
      return (
        p.invoices.status === "unpaid" &&
        dueDate < today && // due date passed => overdue
        (selectedStudent === "all" || p.studentId === selectedStudent)
      );
    })
    .reduce((sum: number, p: any) => sum + parseFloat(p.invoices.totalAmount), 0);

  
  /**
   * Handles sorting of a table column by toggling the sort direction.
   *
   * @purpose Updates the current sorting column and direction for a payments table.
   *
   * @param {string} column - The column key to sort by.
   * @throws Does not throw, but assumes `column` is a valid key present in the table data.
   * @returns {void}
   * @sideEffects Updates component state `sortColumn` and `sortDirection`.
   *
   * @example
   * // User clicks the "Amount" column header:
   * handleSort("amount");
   * // If already sorted ascending, it toggles to descending.
   * // If a different column, sets that column as sortColumn and defaults to descending.
   */
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };


  /**
   * Returns a sort icon component based on the current column sort state.
   *
   * @purpose Displays an arrow icon indicating the sort direction for the specified column.
   *
   * @param {{ column: string }} props - Object containing the column key.
   * @param {string} props.column - Column key to check if it's currently sorted.
   * @throws Does not throw. Assumes `sortColumn` and `sortDirection` are valid component state values.
   * @returns {JSX.Element | null} Returns an up or down arrow icon if the column is sorted, otherwise null.
   * @sideEffects None.
   *
   * @example
   * <SortIcon column="amount" />
   * // If "amount" is the currently sorted column:
   * //   - Returns ArrowUp icon if sortDirection === "asc"
   * //   - Returns ArrowDown icon if sortDirection === "desc"
   * // If "amount" is not the current sort column, returns null.
   */
  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) {
      return null;
    }
    return sortDirection === "asc"
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  
  /**
  * Defines breadcrumbs for the payments page.
  *
  * @purpose To provide a navigational trail in the UI for user orientation.
  * 
  * @param None
  * @returns {Array<Object>} Array of breadcrumb objects with `title`, `href`, and optional `icon`.
  * @throws None
  * @sideEffects None
  * 
  * @example
  * <Breadcrumbs items={breadcrumbs} />
  */
  const breadcrumbs = [
    {
      title: "Home",
      href: "/parent/dashboard",
      icon: <Home className="h-4 w-4" />
    },
    {
      title: "Payments"
    }
  ];

  return (
    // Appshell wraps the page content with sidebar and header
    <AppShell>
      {/* Page Header with title, description, and breadcrumbs */}
      <PageHeader
        title="Payments"
        description="View student invoices"
        breadcrumbs={breadcrumbs}
      />

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Paid Card */}
        <Card>
          <CardHeader className="pb-2">
            {/* Card Title */}
            <CardTitle className="text-sm font-medium text-gray-500">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Card Content */}
            <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>

        {/* Pending Payments Card */}
        <Card>
          <CardHeader className="pb-2">
            {/* Card Title */}
            <CardTitle className="text-sm font-medium text-gray-500">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Card Content */}
            <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
          </CardContent>
        </Card>

        {/* Overdue Amount Card */}
        <Card>
          <CardHeader className="pb-2">
            {/* Card Title */}
            <CardTitle className="text-sm font-medium text-gray-500">Overdue Amount</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Card Content */}
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOverdue)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          {/* Student Select */}
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select child" />
            </SelectTrigger>
            {/* Select Content */}
            <SelectContent>
              {/* Map students */}
              {students.map((student: any) => (
                <SelectItem key={student.studentId} value={student.studentId}>
                  {student.studentFirstName} {student.studentMiddleName} {student.studentLastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by invoice number or course..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              // Clear Search Button
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1.5 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Payment History Tabs */}
      <Card>
        <Tabs defaultValue="upcoming" value={tab} onValueChange={setTab}>
          <CardHeader className="pb-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <CardTitle>Payment History</CardTitle>
              <TabsList className="mt-3 md:mt-0">
                {/* Upcoming Payments Tab */}
                <TabsTrigger value="upcoming">
                  <Clock className="h-4 w-4 mr-2" />
                  Upcoming
                </TabsTrigger>
                {/* Payment History Tab */}
                <TabsTrigger value="history">
                  <FileText className="h-4 w-4 mr-2" />
                  Payment History
                </TabsTrigger>
              </TabsList>
            </div>
            <CardDescription className="mt-2">
              {tab === "upcoming"
                ? "Manage upcoming payments and due dates"
                : "View your past payment history"}
            </CardDescription>
          </CardHeader>
          <TabsContent value="upcoming">
            {/* Upcoming Payments Table */}
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* Table Headers */}
                    <TableHead>SL NO.</TableHead>
                    <TableHead>STUDENT</TableHead>
                    <TableHead className="hidden md:table-cell">INVOICE NO.</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("amount")}
                    >
                      {/* Amount Column Header */}
                      <div className="flex items-center">
                        AMOUNT
                        <SortIcon column="amount" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("dueDate")}
                    >
                      {/* Issue Date Column Header */}
                      <div className="flex items-center">
                        ISSUE DATE
                        <SortIcon column="dueDate" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("dueDate")}
                    >
                      {/* Due Date Column Header */}
                      <div className="flex items-center">
                        DUE DATE
                        <SortIcon column="dueDate" />
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                {/* Table Body */}
                <TableBody>
                  {/* If payments are available */}
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment: any, index: number) => (
                      <TableRow key={payment.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{payment.studentName}</TableCell>
                        <TableCell><Link className="hover:underline font-medium" href={`/parent/invoice/${payment.id}`}>{payment.invoiceNumber || "-"}</Link></TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{payment.dueDate}</TableCell>
                        <TableCell>{payment.issueDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getStatusIcon(payment.status)}
                            <Badge variant="outline" className={`ml-2 ${getStatusColor(payment.status)}`}>
                              {capitalizeFirstLetter(payment.status)}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    // No Payments Found
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <FileText className="h-10 w-10 text-gray-300 mb-2" />
                          <h3 className="text-lg font-medium">No payments found</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {searchQuery
                              ? "Try a different search query"
                              : "There are no upcoming payments scheduled"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </TabsContent>

          {/* Payment History Tab */}
          <TabsContent value="history">
            <CardContent>
              {/* Payment History Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* Table Headers */}
                    <TableHead>SL NO.</TableHead>
                    <TableHead>STUDENT</TableHead>
                    <TableHead className="hidden md:table-cell">INVOICE NO.</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("amount")}
                    >
                      <div className="flex items-center">
                        AMOUNT
                        <SortIcon column="amount" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("dueDate")}
                    >
                      <div className="flex items-center">
                        ISSUE DATE
                        <SortIcon column="dueDate" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("dueDate")}
                    >
                      <div className="flex items-center">
                        DUE DATE
                        <SortIcon column="dueDate" />
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                {/* Table Body */}
                <TableBody>
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment: any, index: number) => (
                      <TableRow key={payment.id}>
                        {/* Table Data */}
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{payment.studentName}</TableCell>
                        <TableCell><Link className="hover:underline font-medium" href={`/parent/invoice/${payment.id}`}>{payment.invoiceNumber || "-"}</Link></TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{payment.dueDate}</TableCell>
                        <TableCell>{payment.issueDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getStatusIcon(payment.status)}
                            <Badge variant="outline" className={`ml-2 ${getStatusColor(payment.status)}`}>
                              {capitalizeFirstLetter(payment.status)}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    // No Payments Found
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <FileText className="h-10 w-10 text-gray-300 mb-2" />
                          <h3 className="text-lg font-medium">No payments found</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {searchQuery
                              ? "Try a different search query"
                              : "There are no upcoming payments scheduled"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Fixed Footer is a component that is always visible at the bottom of the page */}
      <FixedFooter user={user} />
    </AppShell>
  );
}