import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Home, 
  CreditCard, 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Search,
  X
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";

/**
 * StudentPayments component
 *
 * @purpose
 * - Displays a student's payment history and upcoming payments.
 * - Allows filtering, viewing details, and visually identifying payment status.
 *
 * @param None
 * @returns {JSX.Element} A React component containing:
 *   - Tabs for "upcoming" and "history" payments.
 *   - Payment list/cards showing course, amount, due date, and status.
 *   - Status badges colored according to payment status.
 *   - Optional search/filter functionality.
 * @throws None
 * @sideEffects
 * - Uses `useAuth` hook to get the current user.
 * - Manages component state for active tab and search query.
 *
 * @example
 * <StudentPayments />
 */
export default function StudentPayments() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  
  /**
   * Payments records for a student.
   *
   * @purpose
   * - Provides a structured list of student payment history and upcoming payments.
   * @param None
   * @returns {Array<Object>} Array of payment objects:
   *   - `id` {string} Payment invoice ID.
   *   - `course` {string} Course name.
   *   - `amount` {number} Amount paid or due.
   *   - `status` {string} Payment status ("paid", "upcoming", etc.).
   *   - `date` {Date} Payment date.
   *   - `dueDate` {Date} Payment due date.
   *   - `paymentMethod` {string} Method used for payment.
   *   - `receiptUrl` {string} URL to payment receipt.
   * @throws None
   * @sideEffects None
   * @example
   * console.log(payments[0].id); // "INV-20230815"
   * console.log(payments[2].status); // "upcoming"
   */
  const payments = [
    {
      id: "INV-20230815",
      course: "Guitar Lessons",
      amount: 12000,
      status: "paid",
      date: new Date(2023, 7, 15), // August 15, 2023
      dueDate: new Date(2023, 7, 22),
      paymentMethod: "Credit Card",
      receiptUrl: "#"
    },
    {
      id: "INV-20230915",
      course: "Guitar Lessons",
      amount: 12000,
      status: "paid",
      date: new Date(2023, 8, 15), // September 15, 2023
      dueDate: new Date(2023, 8, 22),
      paymentMethod: "Bank Transfer",
      receiptUrl: "#"
    },
    {
      id: "INV-20231015",
      course: "Guitar Lessons",
      amount: 12000,
      status: "upcoming",
      date: new Date(2023, 9, 1), // October 1, 2023
      dueDate: new Date(2023, 9, 7),
      paymentMethod: "",
      receiptUrl: ""
    },
    {
      id: "INV-20230820",
      course: "Music Theory",
      amount: 5000,
      status: "paid",
      date: new Date(2023, 7, 20), // August 20, 2023
      dueDate: new Date(2023, 7, 27),
      paymentMethod: "Credit Card",
      receiptUrl: "#"
    },
    {
      id: "INV-20230920",
      course: "Music Theory",
      amount: 5000,
      status: "paid",
      date: new Date(2023, 8, 20), // September 20, 2023
      dueDate: new Date(2023, 8, 27),
      paymentMethod: "Credit Card",
      receiptUrl: "#"
    },
    {
      id: "INV-20231020",
      course: "Music Theory",
      amount: 5000,
      status: "overdue",
      date: new Date(2023, 9, 1), // October 1, 2023
      dueDate: new Date(2023, 9, 7),
      paymentMethod: "",
      receiptUrl: ""
    }
  ];

  /**
   * Returns a Tailwind CSS class string representing the background and text color for a given payment status.
   *
   * @purpose
   * - Provides consistent visual styling for payment status badges.
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
   * @purpose
   * - Provides a visual indicator for payment status in the UI.
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
   * Filters and sorts the payments list based on active tab and search query.
   *
   * @purpose
   * - Provides a dynamic view of student payments.
   * - Filters payments by status depending on the active tab ("upcoming" or "history").
   * - Allows searching by payment ID or course name.
   * - Sorts upcoming payments by due date and history payments by payment date.
   *
   * @param None (uses `payments`, `activeTab`, and `searchQuery` from component scope)
   * @returns {Array<Object>} Filtered and sorted array of payment objects.
   * @throws None
   * @sideEffects
   * - None; pure calculation based on current state and props.
   *
   * @example
   * const filteredPayments = payments
   *   .filter(payment => {
   *     if (activeTab === "upcoming" && payment.status !== "upcoming" && payment.status !== "overdue") return false;
   *     if (activeTab === "history" && (payment.status === "upcoming" || payment.status === "overdue")) return false;
   *     if (searchQuery && !payment.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
   *         !payment.course.toLowerCase().includes(searchQuery.toLowerCase())) return false;
   *     return true;
   *   })
   *   .sort((a, b) => activeTab === "upcoming" ? a.dueDate.getTime() - b.dueDate.getTime() : b.date.getTime() - a.date.getTime());
   */
  const filteredPayments = payments
    .filter(payment => {
      // Filter by tab
      if (activeTab === "upcoming" && payment.status !== "upcoming" && payment.status !== "overdue") {
        return false;
      }
      if (activeTab === "history" && (payment.status === "upcoming" || payment.status === "overdue")) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery && 
          !payment.id.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !payment.course.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      if (activeTab === "upcoming") {
        // Sort by due date for upcoming tab
        return a.dueDate.getTime() - b.dueDate.getTime();
      } else {
        // Sort by payment date (most recent first) for history tab
        return b.date.getTime() - a.date.getTime();
      }
    });

  /**
 * Calculates the total amount of paid payments.
 *
 * @purpose
 * - Computes the sum of all payments that have already been paid by the student.
 * @param None (uses `payments` from component scope)
 * @returns {number} Sum of amounts for payments with status "paid".
 * @throws None
 * @sideEffects None; pure computation
 *
 * @example
 * const totalPaid = payments
 *   .filter(p => p.status === "paid")
 *   .reduce((sum, p) => sum + p.amount, 0);
 */
  const totalPaid = payments
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  
  /**
   * Calculates the total amount of upcoming payments.
   *
   * @purpose
   * - Computes the sum of all payments that are scheduled but not yet paid.
   *
   * @param None (uses `payments` from component scope)
   * @returns {number} Sum of amounts for payments with status "upcoming".
   * @throws None
   * @sideEffects None; pure computation
   *
   * @example
   * const totalUpcoming = payments
   *   .filter(p => p.status === "upcoming")
   *   .reduce((sum, p) => sum + p.amount, 0);
   */
  const totalUpcoming = payments
    .filter(p => p.status === "upcoming")
    .reduce((sum, p) => sum + p.amount, 0);
  
  /**
   * Calculates the total amount of overdue payments.
   *
   * @purpose
   * - Computes the sum of all payments that were due but have not been paid yet.
   *
   * @param None (uses `payments` from component scope)
   * @returns {number} Sum of amounts for payments with status "overdue".
   * @throws None
   * @sideEffects None; pure computation
   *
   * @example
   * const totalOverdue = payments
   *   .filter(p => p.status === "overdue")
   *   .reduce((sum, p) => sum + p.amount, 0);
   */
  const totalOverdue = payments
    .filter(p => p.status === "overdue")
    .reduce((sum, p) => sum + p.amount, 0);

  /**
   * Breadcrumbs for the Student Payments page.
   *
   * @purpose
   * - Defines navigation path to display at the top of the page.
   *
   * @param None
   * @returns {Array<Object>} Array of breadcrumb items with:
   *   - `title` {string} Breadcrumb label
   *   - `href` {string} Optional URL
   *   - `icon` {JSX.Element} Optional icon component
   * @throws None
   * @sideEffects None
   *
   * @example
   * const breadcrumbs = [
   *   { title: "Home", href: "/student/dashboard", icon: <Home className="h-4 w-4" /> },
   *   { title: "Payments" }
   * ];
   */
  const breadcrumbs = [
    {
      title: "Home",
      href: "/student/dashboard",
      icon: <Home className="h-4 w-4" />
    },
    {
      title: "Payments"
    }
  ];

  return (
    // Appshell wraps the page content and provides a consistent layout with sidebar, and header
    <AppShell>
      {/* PageHeader component with title, description, and breadcrumbs */}
      <PageHeader 
        title="Payments" 
        description="Manage your course payments and invoices"
        breadcrumbs={breadcrumbs}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Paid Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Total Paid amount - formatted currency */}
            <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>
        
        {/* Upcoming Payments Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Upcoming Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Upcoming Payments amount - formatted currency */}
            <div className="text-2xl font-bold">{formatCurrency(totalUpcoming)}</div>
          </CardContent>
        </Card>
        
        {/* Overdue Amount Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Overdue Amount</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Overdue Amount - formatted currency */}
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOverdue)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          {/* Search icon */}
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          {/* Search input */}
          <Input 
            placeholder="Search by invoice number or course..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* Clear search button */}
          {searchQuery && (
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

      {/* Payment History Tabs */}
      <Card>
        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="pb-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <CardTitle>Payment History</CardTitle>
              <TabsList className="mt-3 md:mt-0">
                {/* Tabs for upcoming and history payments */}
                <TabsTrigger value="upcoming">
                  <Clock className="h-4 w-4 mr-2" />
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="history">
                  <FileText className="h-4 w-4 mr-2" />
                  Payment History
                </TabsTrigger>
              </TabsList>
            </div>
            <CardDescription className="mt-2">
              {/* If active tab is upcoming, show upcoming payments and due dates, otherwise show payment history */}
              {activeTab === "upcoming" 
                ? "View upcoming payments and due dates" 
                : "Track your past payment history"}
            </CardDescription>
          </CardHeader>
          <TabsContent value="upcoming">
            {/* Card content wrapper for spacing/background */}
            <CardContent>
              {/* Payment history table */}
              <Table>
                <TableHeader>
                  {/* Table header row (column titles) */}
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    {/* Right-aligned header for action buttons */}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* If there are payments, map over them and display them in a table row */}
                  {filteredPayments.length > 0 ? (
                    /* If there are payments after filtering, render rows */
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        {/* Invoice ID */}
                        <TableCell>{payment.id}</TableCell>
                        {/* Course */}
                        <TableCell>{payment.course}</TableCell>
                        {/* Format amount */}
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        {/* Due Date */}
                        <TableCell>{format(payment.dueDate, 'MMM d, yyyy')}</TableCell>
                        {/* Capitalized status */}
                        <TableCell>
                          <div className="flex items-center">
                            {getStatusIcon(payment.status)}
                            <Badge variant="outline" className={`ml-2 ${getStatusColor(payment.status)}`}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {/* If payment is upcoming or overdue, show pay now button, otherwise show paid button */}
                          {payment.status === "upcoming" || payment.status === "overdue" ? (
                            <Button size="sm">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pay Now
                            </Button>
                          ) : (
                            // If payment is paid, show paid button
                            <Button size="sm" variant="outline" disabled>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Paid
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    /* Empty state when there are no filtered payments */
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <FileText className="h-10 w-10 text-gray-300 mb-2" />
                          <h3 className="text-lg font-medium">No upcoming payments</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {searchQuery 
                              ? "Try a different search query" 
                              : "You don't have any pending payments at the moment"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </TabsContent>
          {/* Tab panel for payment history */}
          <TabsContent value="history">
            <CardContent>
              <Table>
                {/* Table header row (column titles) */}
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* If there are payments after filtering, render rows */}
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.id}</TableCell>
                        <TableCell>{payment.course}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{format(payment.date, 'MMM d, yyyy')}</TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell className="text-right">
                          {/* Conditionally show download button if receipt URL exists */}
                          {payment.receiptUrl && (
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    // Empty state when there are no filtered payments
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <FileText className="h-10 w-10 text-gray-300 mb-2" />
                          <h3 className="text-lg font-medium">No payment history</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {searchQuery 
                              ? "Try a different search query" 
                              : "You haven't made any payments yet"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </TabsContent>
          {/* Footer with pagination and action buttons */}
          <CardFooter className="border-t p-4 flex justify-between">
            <div className="text-sm text-gray-500">
              Showing {filteredPayments.length} of {payments.length} payments
            </div>
            {/* View all invoices button if history tab is active */}
            {activeTab === "history" && (
              <div className="text-sm">
                <Button variant="link" size="sm" className="text-primary">
                  View All Invoices
                </Button>
              </div>
            )}
          </CardFooter>
        </Tabs>
      </Card>
    </AppShell>
  );
}