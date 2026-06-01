import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusCircle,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  UserCog,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  BadgeIndianRupee,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Employee, User } from "@shared/schema";
import { getInitials, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

/**
 * BranchAdminEmployees Component
 *
 * @purpose
 * Renders the Employees management dashboard. Provides functionalities to:
 * - View all employees filtered by role or status.
 * - Add new employees via a dialog form.
 * - View detailed employee information in a modal.
 * - Edit or delete employees.
 *
 * @returns JSX.Element - The rendered Admin Employees page.
 *
 * @sideEffects
 * - Uses `useQuery` to fetch employees and users data.
 * - Uses `useState` to manage dialog states and active tab selection.
 * - Displays toast notifications for user feedback.
 *
 * @throws None - The component itself does not throw errors.
 *
 * @example
 * ```tsx
 * <BranchAdminEmployees />
 * ```
 */
export default function BranchAdminEmployees() {
  /**
   * Currently active tab filter.
   *
   * @sideEffects Controls which employees are displayed in the table.
   */
  const [activeTab, setActiveTab] = useState("all");

  /**
   * State to control the visibility of the view employee dialog.
   *
   * @sideEffects Opens or closes the employee details modal.
   */
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  /**
   * State to control the visibility of the create employee dialog.
   *
   * @sideEffects Opens or closes the create employee modal.
   */
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  /**
   * Currently selected employee for viewing details.
   *
   * @sideEffects Populates the View Employee dialog with data.
   */
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  /**
   * Toast hook for showing notifications.
   */
  const { toast } = useToast();

  /**
   * @purpose Fetches all employees from the API.
   *
   * @param none.
   * @returns Array<Employee> - List of employees.
   * @sideEffects None
   * @throws None
   *
   * @example
   * ```ts
   * const { data: employees = [], isLoading } = useQuery({
   *   queryKey: ["/api/employees"],
   * });
   * ```
   */
  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  /**
   * @purpose Fetches all users to get detailed employee info.
   *
   * @param None
   * @returns Array<User> - List of users.
   * @throws None
   * @sideEffects None
   *
   * @example
   * ```ts
   * const { data: users = [], isLoading: isLoadingUsers } = useQuery({
   *   queryKey: ["/api/users"],
   * });
   * ```
   */
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  /**
   * @purpose Opens the employee view dialog and sets the selected employee.
   *
   * @param employee - The employee object to view.
   * @returns void
   * @throws None
   * @sideEffects Updates the `selectedEmployee` state and opens the view dialog.
   * @example
   * ```ts
   * handleViewEmployee({ id: 1, firstName: "John", lastName: "Doe", position: "Teacher" });
   * ```
   */
  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewDialogOpen(true);
  };

  /**
   * @purpose Filters employees based on active tab selection.
   *
   * @param None
   * @returns Array<Employee> - Filtered employee list.
   * @throws None
   * @sideEffects None
   *
   * @example
   * ```ts
   * const activeEmployees = filteredEmployees;
   * ```
   */
  const filteredEmployees = employees.filter((employee: Employee) => {
    if (activeTab === "all") return true;
    if (activeTab === employee.position) return true;
    if (activeTab === employee.status) return true;
    return false;
  });

  /**
   * @purpose Retrieves the user details associated with a given user ID.
   *
   * @param userId - The ID of the user to look up.
   * @returns The `User` object if found, otherwise `undefined`.
   * @throws None
   * @sideEffects None
   * @example
   * ```ts
   * const user = getUserDetails(123);
   * if (user) {
   *   console.log(user.fullName);
   * }
   * ```
   */
  const getUserDetails = (userId: number): User | undefined => {
    return users.find((user: User) => user.id === userId);
  };

  /**
   * @purpose Columns definition for the employees data table.
   *
   * @param table - Table instance provided by the react-table library.
   * @returns JSX.Element - Serial number element.
   * @throws None
   * @type ColumnDef<Employee>[]
   * @sideEffects Uses helper functions `getInitials`, `formatCurrency`, and `format` to render data.
   *
   * @example
   * ```ts
   * <DataTable columns={columns} data={filteredEmployees} />
   * ```
   */
  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "employeeId",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const employee = row.original;
        const user = getUserDetails(employee.userId);

        return (
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback>
                {user ? getInitials(user.fullName) : "??"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user?.fullName || "Unknown"}</div>
              <div className="text-xs text-muted-foreground">
                {user?.email || ""}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => {
        const position = row.original.position;
        return (
          <Badge variant="outline" className="capitalize">
            {position}
          </Badge>
        );
      },
    },
    {
      accessorKey: "joiningDate",
      header: "Joining Date",
      cell: ({ row }) => {
        return format(new Date(row.original.joiningDate), "MMM dd, yyyy");
      },
    },
    {
      accessorKey: "salary",
      header: "Salary",
      cell: ({ row }) => {
        return formatCurrency(Number(row.original.salary));
      },
    },
    {
      accessorKey: "branch",
      header: "Branch",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        let badgeVariant: "default" | "success" | "destructive" | "outline" =
          "outline";

        if (status === "active") {
          badgeVariant = "success";
        } else if (status === "inactive") {
          badgeVariant = "destructive";
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
      cell: ({ row }) => {
        const employee = row.original;

        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleViewEmployee(employee)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <AppShell>
      {/* Page Header with title, description, and breadcrumbs */}
      <PageHeader
        title="Employees"
        description="Manage teachers and staff across all branches."
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        }
      />

      {/* Tabs for filtering employees */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="teacher">Teachers</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        {/* Employee Data Table */}
        <TabsContent value={activeTab} className="mt-6">
          <DataTable
            columns={columns}
            data={filteredEmployees}
            searchColumns={["employeeId"]}
            searchPlaceholder="Search employees..."
          />
        </TabsContent>
      </Tabs>

      {/* View Employee Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        {/* Dialog content */}
        <DialogContent className="sm:max-w-[600px]">
          {/* Dialog header */}
          <DialogHeader>
            {/* Dialog title */}
            <DialogTitle>Employee Details</DialogTitle>
            {/* Dialog description */}
            <DialogDescription>
              View comprehensive information about the employee.
            </DialogDescription>
          </DialogHeader>

          {/* Employee details */}
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <Avatar className="h-14 w-14 mr-4">
                    <AvatarFallback className="text-lg">
                      {getUserDetails(selectedEmployee.userId)?.fullName
                        ? getInitials(
                            getUserDetails(selectedEmployee.userId)!.fullName,
                          )
                        : "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    {/* Employee name */}
                    <h3 className="text-lg font-semibold">
                      {getUserDetails(selectedEmployee.userId)?.fullName ||
                        "Unknown"}
                    </h3>
                    {/* Employee ID and position */}
                    <p className="text-sm text-muted-foreground">
                      {selectedEmployee.employeeId} ·{" "}
                      {selectedEmployee.position}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    selectedEmployee.status === "active"
                      ? "success"
                      : "destructive"
                  }
                >
                  {selectedEmployee.status.toUpperCase()}
                </Badge>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold mb-3">
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      {/* Email section */}
                      <div className="flex items-start">
                        <MailIcon className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">
                            {getUserDetails(selectedEmployee.userId)?.email ||
                              "N/A"}
                          </p>
                        </div>
                      </div>
                      {/* Phone section */}
                      <div className="flex items-start">
                        <PhoneIcon className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Phone</p>
                          <p className="text-sm text-muted-foreground">
                            {getUserDetails(selectedEmployee.userId)?.phone ||
                              "N/A"}
                          </p>
                        </div>
                      </div>
                      {/* Address section */}
                      <div className="flex items-start">
                        <MapPinIcon className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Address</p>
                          <p className="text-sm text-muted-foreground">
                            {getUserDetails(selectedEmployee.userId)?.address ||
                              "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Employment Details */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold mb-3">
                      Employment Details
                    </h4>
                    <div className="space-y-3">
                      {/* Joining Date section */}
                      <div className="flex items-start">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Joining Date</p>
                          <p className="text-sm text-muted-foreground">
                            {format(
                              new Date(selectedEmployee.joiningDate),
                              "MMMM dd, yyyy",
                            )}
                          </p>
                        </div>
                      </div>
                      {/* Salary section */}
                      <div className="flex items-start">
                        <BadgeIndianRupee className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Salary</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(Number(selectedEmployee.salary))}{" "}
                            per month
                          </p>
                        </div>
                      </div>
                      {/* Branch section */}
                      <div className="flex items-start">
                        <MapPinIcon className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Branch</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedEmployee.branch}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bank Details */}
              {selectedEmployee.bankAccount && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold mb-2">Bank Details</h4>
                    <p className="text-sm">{selectedEmployee.bankAccount}</p>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-4">
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
                </Button>
                <Button variant="default">
                  <UserCog className="mr-2 h-4 w-4" />
                  View Payroll
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Employee Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        {/* Dialog content */}
        <DialogContent className="sm:max-w-[600px]">
          {/* Dialog header */}
          <DialogHeader>
            {/* Dialog title */}
            <DialogTitle>Add New Employee</DialogTitle>
            {/* Dialog description */}
            <DialogDescription>
              Fill in the details to add a new employee to Institutiontution
              Management.
            </DialogDescription>
          </DialogHeader>

          {/* Form grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" placeholder="Enter full name" />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>

              {/* Position */}
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {/* Joining Date */}
              <div className="space-y-2">
                <Label htmlFor="joiningDate">Joining Date</Label>
                <Input id="joiningDate" type="date" />
              </div>

              {/* Salary */}
              <div className="space-y-2">
                <Label htmlFor="salary">Salary (₹)</Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="Enter monthly salary"
                />
              </div>

              {/* Bank Account */}
              <div className="space-y-2">
                <Label htmlFor="bankAccount">Bank Account</Label>
                <Input
                  id="bankAccount"
                  placeholder="Enter bank account details"
                />
              </div>

              {/* Branch */}
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Branch">Main Branch</SelectItem>
                    <SelectItem value="North Campus">North Campus</SelectItem>
                    <SelectItem value="South Campus">South Campus</SelectItem>
                    <SelectItem value="East Campus">East Campus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Dialog footer */}
          <DialogFooter>
            {/* Cancel button */}
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            {/* Submit button */}
            <Button type="submit">Add Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
