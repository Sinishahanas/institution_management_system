import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  Minus,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Payroll, Employee } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

/**
 * AdminPayroll React component
 *
 * @purpose Render and manage the payroll admin UI: fetch payrolls & employees,
 *          provide filters by month/status, show payroll summary and table.
 * 
 * @param none - uses hooks and queries from within component scope.
 * @returns {JSX.Element} The payroll admin page (JSX).
 * @throws Will not throw synchronously. Network/query errors are handled by react-query.
 * @sideEffects
 *  - Calls react-query `useQuery` to fetch `/api/payrolls` and `/api/employees`.
 *  - Updates local component state via React hooks.
 *  - May display toast notifications via `useToast`.
 * 
 * @example
 * <AdminPayroll />
 */
export default function AdminPayroll() {
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [activeTab, setActiveTab] = useState("all");
  const [isViewPayrollDialog, setIsViewPayrollDialog] = useState(false);
  const [isCreatePayrollDialog, setIsCreatePayrollDialog] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const { toast } = useToast();

  /**
   * Fetch payroll data from the backend API.
   *
   * @purpose Retrieve the list of payrolls from `/api/payrolls` for use in the admin payroll table.
   
   * @param none - queryKey is fixed as ["/api/payrolls"].
   * @returns {{
   *   data: Payroll[];
   *   isLoading: boolean;
   *   error?: unknown;
   * }}
   *  - `data`: Array of payroll objects (default empty array if no data yet).
   *  - `isLoading`: Loading state flag.
   *  - `error`: Optional error object if the query fails.
   * @throws Network/HTTP errors encountered while fetching data are caught by react-query and exposed as `error`.
   * @sideEffects
   *  - Triggers a network request to `/api/payrolls`.
   *  - Subscribes to react-query’s cache for this key.
   * 
   * @example
   * const { data: payrolls = [], isLoading } = useQuery({
   *   queryKey: ["/api/payrolls"],
   * });
   */
  const { data: payrolls = [], isLoading } = useQuery<Payroll[]>({
    queryKey: ["/api/payrolls"],
  });

  
  /**
   * Fetch employee data from the backend API.
   *
   * @purpose Retrieve the list of employees from `/api/employees` to map payrolls to employees.
   * 
   * @param none - queryKey is fixed as ["/api/employees"].
   * @returns {{
   *   data: Employee[];
   *   isLoading: boolean;
   *   error?: unknown;
   * }}
   *  - `data`: Array of employee objects (default empty array if no data yet).
   *  - `isLoading`: Loading state flag.
   *  - `error`: Optional error object if the query fails.
   * @throws Network/HTTP errors encountered while fetching data are caught by react-query and exposed as `error`.
   * @sideEffects
   *  - Triggers a network request to `/api/employees`.
   *  - Subscribes to react-query’s cache for this key.
   * 
   * @example
   * const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
   *   queryKey: ["/api/employees"],
   * });
   */
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  /**
   * Open the payroll details view for a specific payroll.
   *
   * @purpose Set the selected payroll and open the payroll view dialog.
   * 
   * @param {Payroll} payroll - Payroll object selected by the user.
   * @returns {void}
   * @throws None
   * @sideEffects Updates `selectedPayroll` and `isViewPayrollDialog` state which affects the UI.
   * 
   * @example
   * handleViewPayroll(payrollRow);
   */
  const handleViewPayroll = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setIsViewPayrollDialog(true);
  };

  /**
   * Filter payrolls by currently selected month and active tab (status).
   *
   * @purpose Produce the list of payrolls shown in the table according to UI filters.
   * 
   * @params
   *  - payrolls: Payroll[] (closed over from useQuery)
   *  - selectedMonth: string (closed over)
   *  - activeTab: string (closed over)
   * @returns {Payroll[]} Filtered payroll array.
   * @throws None (pure filter)
   * @sideEffects None
   * 
   * @example
   * // If selectedMonth === "2025-10" and activeTab === "paid" returns payrolls for that month with status "paid".
   */
  const filteredPayrolls = payrolls.filter((payroll: Payroll) => {
    const matchesMonth = payroll.month === selectedMonth;
    const matchesStatus = activeTab === "all" || payroll.status === activeTab;
    return matchesMonth && matchesStatus;
  });

  /**
   * Get employee details by employee id.
   *
   * @purpose Return the Employee object for display in the payroll table.
   * 
   * @param {number} employeeId - id of the employee to lookup.
   * @returns {Employee | undefined} The employee object if found, otherwise undefined.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * const emp = getEmployeeDetails(12);
   * // emp?.employeeId -> shows on payroll table
   */
  const getEmployeeDetails = (employeeId: number): Employee | undefined => {
    return employees.find((employee: Employee) => employee.id === employeeId);
  };

  /**
   * Calculate payroll summary metrics for the currently filtered payrolls.
   *
   * @purpose Compute totals and counts (total payroll, paid/pending amounts and counts, processed count).
   * 
   * @param None
   * @returns {{
   *   totalPayroll: number;
   *   paidAmount: number;
   *   pendingAmount: number;
   *   paidCount: number;
   *   pendingCount: number;
   *   processedCount: number;
   * }}
   * @throws None
   * @sideEffects None
   * 
   * @example
   * const summary = calculateSummary();
   * // summary.totalPayroll -> number
   */
  const calculateSummary = () => {
    const totalPayroll = filteredPayrolls.reduce(
      (sum: number, payroll: Payroll) => sum + Number(payroll.netSalary),
      0
    );
    const paidAmount = filteredPayrolls
      .filter((payroll: any) => payroll.status === "paid")
      .reduce((sum: number, payroll: Payroll) => sum + Number(payroll.netSalary), 0);
    const pendingAmount = filteredPayrolls
      .filter((payroll: any) => payroll.status === "pending")
      .reduce((sum: number, payroll: Payroll) => sum + Number(payroll.netSalary), 0);

    return {
      totalPayroll,
      paidAmount,
      pendingAmount,
      paidCount: filteredPayrolls.filter((payroll: any) => payroll.status === "paid")
        .length,
      pendingCount: filteredPayrolls.filter(
        (payroll: any) => payroll.status === "pending"
      ).length,
      processedCount: filteredPayrolls.filter(
        (payroll: any) => payroll.status === "processed"
      ).length,
    };
  };

  const summary = calculateSummary();

  /**
   * Build month selection options (last 12 months).
   *
   * @purpose Provide a list of `{ value, label }` objects for month dropdown so user can pick payroll month.
   * 
   * @param None
   * @returns {{ value: string; label: string }[]} Array of month option objects covering current and previous 11 months.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * const options = getMonthOptions();
   * // options[0] => { value: "2025-10", label: "October 2025" } (example)
   */
  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const value = format(date, "yyyy-MM");
      const label = format(date, "MMMM yyyy");
      options.push({ value, label });
    }

    return options;
  };

  /**
   * Column definitions for payroll DataTable.
   *
   * @purpose Describe how payroll rows are rendered in the table.
   * 
   * @param None.
   * @returns {ColumnDef<Payroll>[]} Column definitions consumed by the table component.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * const columns = getColumns();
   * // columns[0] => { accessorKey: "employeeId", header: "Employee" } (example)
   */
  const columns: ColumnDef<Payroll>[] = [
    {
      accessorKey: "employeeId",
      header: "Employee",
      cell: ({ row }) => {
        const employee = getEmployeeDetails(row.original.employeeId);
        return employee ? (
          <div className="font-medium">{employee.employeeId}</div>
        ) : (
          <div>Unknown</div>
        );
      },
    },
    {
      accessorKey: "basicSalary",
      header: "Basic Salary",
      cell: ({ row }) => {
        return formatCurrency(Number(row.original.basicSalary));
      },
    },
    {
      accessorKey: "incentives",
      header: "Incentives",
      cell: ({ row }) => {
        return formatCurrency(Number(row.original.incentives));
      },
    },
    {
      accessorKey: "deductions",
      header: "Deductions",
      cell: ({ row }) => {
        return formatCurrency(Number(row.original.deductions));
      },
    },
    {
      accessorKey: "netSalary",
      header: "Net Salary",
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {formatCurrency(Number(row.original.netSalary))}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        let badgeVariant: "default" | "success" | "secondary" | "destructive" =
          "default";

        if (status === "paid") {
          badgeVariant = "success";
        } else if (status === "pending") {
          badgeVariant = "secondary";
        } else if (status === "processed") {
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
      accessorKey: "paymentDate",
      header: "Payment Date",
      cell: ({ row }) => {
        const date = row.original.paymentDate;
        return date ? format(new Date(date), "MMM dd, yyyy") : "-";
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const payroll = row.original;

        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleViewPayroll(payroll)}
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

  return (
    // Appshell is used to provide a consistent layout with header, sidebar, and footer.
    <AppShell>
      {/* Page Header with title, description and action button */}
      <PageHeader
        title="Payroll Management"
        description="Manage employee salaries, incentives, and payments."
        actions={
          <Button onClick={() => setIsCreatePayrollDialog(true)}>
            <PlusCircle className="h-4 w-4 mr-2" /> {/* Icon in the button */}
            Generate Payroll {/* Button label */}
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Payroll Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Total payroll amount formatted */}
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalPayroll)}
            </div>
            {/* Number of employees and selected month */}
            <p className="text-xs text-muted-foreground">
              {filteredPayrolls.length} employees for {selectedMonth}
            </p>
          </CardContent>
        </Card>

        {/* Paid Amount Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Paid amount formatted */}
            <div className="text-2xl font-bold">
              {formatCurrency(summary.paidAmount)}
            </div>
            {/* Number of employees paid */}
            <p className="text-xs text-muted-foreground">
              {summary.paidCount} employees paid
            </p>
          </CardContent>
        </Card>

        {/* Pending Amount Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Pending amount formatted */}
            <div className="text-2xl font-bold">
              {formatCurrency(summary.pendingAmount)}
            </div>
            {/* Number of employees pending and processed */}
            <p className="text-xs text-muted-foreground">
              {summary.pendingCount} employees pending +{" "}
              {summary.processedCount} processed
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Controls: month selector, status tabs, export button */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
        {/* Month selector */}
        <div className="w-full sm:w-auto">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <CalendarRange className="h-4 w-4 mr-2" /> {/* Calendar icon */}
              <SelectValue placeholder="Select month" /> {/* Placeholder */}
            </SelectTrigger>
            <SelectContent>
              {/* Map month options */}
              {getMonthOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs for payroll filters (all/pending/processed/paid) */}
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Tabs to filter payroll */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Tabs list */}
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processed">Processed</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Export button */}
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> {/* Download icon */}
            Export
          </Button>
        </div>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns} //Column definition
            data={filteredPayrolls} //Filtered payroll data
            searchColumns={["employeeId"]} //Columns to search
            searchPlaceholder="Search payroll..." //Search placeholder
          />
        </CardContent>
      </Card>

      {/* View Payroll Dialog */}
      <Dialog open={isViewPayrollDialog} onOpenChange={setIsViewPayrollDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Payroll Details</DialogTitle>
            <DialogDescription>
              View detailed payroll information for this employee.
            </DialogDescription>
          </DialogHeader>
          
          {/* Only show details when a payroll is selected */}
          {selectedPayroll && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  {/* Show employee id or fallback text */}
                  <h3 className="text-lg font-semibold">
                    {(() => {
                      const employee = getEmployeeDetails(
                        selectedPayroll.employeeId
                      );
                      return employee
                        ? employee.employeeId
                        : "Unknown Employee";
                    })()}
                  </h3>
                  {/* Month label */}
                  <p className="text-sm text-muted-foreground">
                    For{" "}
                    {format(
                      new Date(`${selectedPayroll.month}-01`),
                      "MMMM yyyy"
                    )}
                  </p>
                </div>
                {/* Status badge */}
                <Badge
                  variant={
                    selectedPayroll.status === "paid"
                      ? "success"
                      : selectedPayroll.status === "processed"
                      ? "default"
                      : "secondary"
                  }
                >
                  {selectedPayroll.status.toUpperCase()}
                </Badge>
              </div>

              {/* Salary components table */}
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      {/* Component column */}
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Component
                      </th>
                      {/* Amount column */}
                      <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900">
                        <div className="flex items-center">
                          <Calculator className="h-4 w-4 text-neutral-500 mr-2" /> {/* Icon */}
                          Basic Salary {/**Component Name */}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-neutral-900 font-mono">
                        {formatCurrency(Number(selectedPayroll.basicSalary))}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-2" /> {/* Icon */}
                          Incentives {/*Component Name */}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600 font-mono">
                        +{formatCurrency(Number(selectedPayroll.incentives))}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900">
                        <div className="flex items-center">
                          <Minus className="h-4 w-4 text-red-500 mr-2" /> {/* Icon */}
                          Deductions {/*Component Name */}
                        </div>
                      </td>
                      {/* Deductions (negative) */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-600 font-mono">
                        -{formatCurrency(Number(selectedPayroll.deductions))}
                      </td>
                    </tr>
                    {/* Net Salary row highlighted */}
                    <tr className="bg-neutral-50 font-medium">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900">
                        <div className="flex items-center">
                          <ArrowUpDown className="h-4 w-4 text-neutral-500 mr-2" /> {/* Icon */}
                          Net Salary {/*Component Name */}
                        </div>
                      </td>
                      {/* Net Salary Amount */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-neutral-900 font-bold font-mono">
                        {formatCurrency(Number(selectedPayroll.netSalary))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    Payment Details
                  </h4>
                  <div className="text-sm">
                    {/* Status row */}
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium capitalize">
                        {selectedPayroll.status}
                      </span>
                    </div>
                    {/* Payment date row */}
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">
                        Payment Date:
                      </span>
                      <span className="font-medium">
                        {selectedPayroll.paymentDate
                          ? format(
                              new Date(selectedPayroll.paymentDate),
                              "MMM dd, yyyy" // Format date if present
                            )
                          : "Not paid yet"} {/* Fallback when not paid */}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Conditionally render remarks column only when remarks exist */}
                {selectedPayroll.remarks && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Remarks</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedPayroll.remarks}
                    </p> {/* Remarks text */}
                  </div>
                )}
              </div>

              {/* Action buttons: Generate Slip and conditional Mark as Paid */}
              <div className="flex justify-end space-x-3 mt-4">
                {/* Generate payroll slip / payslip */}
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Slip
                </Button>
                {/* Mark as paid button only visible if not already paid */}
                {selectedPayroll.status !== "paid" && (
                  <Button variant="default">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Mark as Paid
                  </Button>
                )}
              </div>
            </div>
          ) /* end selectedPayroll conditional render */ 
          } 
        </DialogContent>
      </Dialog>

      {/* Create Payroll Dialog */}
      <Dialog
        open={isCreatePayrollDialog}
        onOpenChange={setIsCreatePayrollDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            {/* Dialog title */}
            <DialogTitle>Generate Payroll</DialogTitle>
            {/* Dialog description */}
            <DialogDescription>
              Generate payroll for the selected month and employees.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Month selection */}
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select defaultValue={format(new Date(), "yyyy-MM")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {/* Map month options */}
                  {getMonthOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Employee selection */}
            <div className="space-y-2">
              <Label>Select Employees</Label>
              <div className="border rounded-md p-4 space-y-2 max-h-[200px] overflow-y-auto">
                {/* Scrollable list of employees with checkboxes */}
                {employees.map((employee: Employee) => (
                  <div key={employee.id} className="flex items-center">
                    <Input
                      type="checkbox"
                      id={`employee-${employee.id}`}
                      className="h-4 w-4 mr-2"
                    />
                    <Label
                      htmlFor={`employee-${employee.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {employee.employeeId} (₹
                      {formatCurrency(Number(employee.salary))}) {/* Employee id + salary */}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Remarks input */}
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Input id="remarks" placeholder="Add any notes or remarks" />
            </div>
          </div>

          {/* Dialog footer with cancel and submit buttons */}
          <DialogFooter>
            {/* Cancel button */}
            <Button
              variant="outline"
              onClick={() => setIsCreatePayrollDialog(false)}
            >
              Cancel
            </Button>
            {/* Submit button */}
            <Button type="submit">Generate Payroll</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
