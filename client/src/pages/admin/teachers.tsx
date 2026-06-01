import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
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
import { Employee, User, Course, Branch } from "@shared/schema";
import { getInitials, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { Controller, useForm } from "react-hook-form";
import { TeacherFormValues, TeacherSchema } from "@/schema/teacherSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { it } from "@faker-js/faker/.";

/**
 * AdminTeachers — page component for managing teacher employees.
 *
 * @purpose Render teacher list, provide create/edit/view flows and perform CRUD-like updates for teacher records.
 *
 * @param None
 * @returns {JSX.Element} React component for the Admin Teachers page.
 * @throws None
 * @sideEffects Uses react-query to fetch employees, users, courses and branches.
 *
 * @example
 * <AdminTeachers />
 */
export default function AdminTeachers() {
  const [activeTab, setActiveTab] = useState("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Employee | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Hook form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeacherFormValues>({
    resolver: zodResolver(TeacherSchema),
    defaultValues: {
      employeeId: "",
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      phoneNumber: 0,
      whatsappNumber: 0,
      joiningDate: new Date().toISOString().split("T")[0],
      salary: "",
      bankAccount: "",
      ifscIbanBsb: "",
      branch: [],
      specialization: "",
      residenceAddress: "",
      street: "",
      community: "",
      flatNumber: "",
      status: "active",
    },
  });

  /**
   * React Query hook to fetch all employees from the backend API.
   *
   * @purpose Retrieves the complete employee list from `/api/employees` and exposes it to the component.
   *
   * @param None
   * @returns
   * - {Object} - Returns an object containing:
   * - data {Employee[]} The list of employees (default empty array).
   * - isLoading {boolean} Indicates if the query is still loading.
   * @throws Will throw an error if the API call fails internally within React Query.
   * @sideEffects
   * - Initiates a background fetch from the server.
   * - Automatically caches the employee list in React Query's cache for reuse.
   *
   * @example
   * ```tsx
   * const { data: employees = [], isLoading } = useQuery<Employee[]>({
   *   queryKey: ["/api/employees"],
   * });
   * ```
   */
  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  /**
   * Memoized selector that filters and sorts teachers from the full employee list.
   *
   * @purpose Extracts only employees with `position === "teacher"` and sorts them in descending order based on their numeric Employee ID (removing the "TCR" prefix).
   *
   * @param employees {Employee[]} - The list of employees fetched via useQuery.
   * @returns {Employee[]} - Sorted list of teacher employees by Employee ID (highest first).
   * @throws None
   * @sideEffects None (pure function with memoization).
   *
   * @example
   * ```tsx
   * const teachers = useMemo(() => {
   *   return employees
   *     .filter((employee: Employee) => employee.position === "teacher")
   *     .sort((a, b) => {
   *       const numA = parseInt(a.employeeId.replace('TCR', ''));
   *       const numB = parseInt(b.employeeId.replace('TCR', ''));
   *       return numB - numA;
   *     });
   * }, [employees]);
   * ```
   */
  const teachers = useMemo(() => {
    return employees
      .filter((employee: Employee) => employee.position === "teacher")
      .sort((a, b) => {
        const numA = parseInt(a.employeeId.replace("TCR", ""));
        const numB = parseInt(b.employeeId.replace("TCR", ""));
        return numB - numA;
      });
  }, [employees]);

  /**
   * nextTeacherId — compute next teacher id based on existing teacher list
   *
   * @purpose Provide a next sequential employeeId (e.g. "TCR101") for UI display.
   *
   * @param None
   * @returns {string} Next teacher id. If no teachers exist returns "TCR100".
   * @throws None
   * @sideEffects None
   *
   * @example
   * const id = nextTeacherId; // "TCR101"
   */
  const nextTeacherId = useMemo(() => {
    if (!teachers || teachers.length === 0) return "TCR100";
    const lastIdNumber = parseInt(teachers[0].employeeId.replace("TCR", ""));
    return `TCR${lastIdNumber + 1}`;
  }, [teachers]);

  /**
   * generateNextTeacherId — generate next teacher id synchronously
   *
   * @purpose Returns a new employeeId string based on the highest current teacher id.
   *
   * @param None
   * @returns {string} Newly generated teacher id (e.g., "TCR101").
   * @throws None
   * @sideEffects None
   *
   * @example
   * const newId = generateNextTeacherId();
   */
  const generateNextTeacherId = () => {
    if (teachers.length === 0) {
      return "TCR100"; // Starting ID if no teachers exist
    }
    const lastTeacher = teachers[0];
    const lastIdNumber = parseInt(lastTeacher.employeeId.replace("TCR", ""));
    return `TCR${lastIdNumber + 1}`;
  };

  /**
   * React Query hook to fetch all users from the backend API.
   *
   * @purpose Retrieves all users, including those linked to teachers, from `/api/users`.
   *
   * @param None
   * @returns
   * - {Object} Returns an object containing:
   * - data {User[]} The list of users (default empty array).
   * - isLoading {boolean} Indicates if the query is currently loading.
   * @throws Throws an internal error if the `/api/users` request fails.
   * @sideEffects
   * - Initiates an API request to the server.
   * - Stores results in React Query cache for reusability and background refetching.
   *
   * @example
   * ```tsx
   * const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
   *   queryKey: ["/api/users"],
   * });
   * ```
   */
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  /**
   * React Query hook to fetch all courses from the backend API.
   *
   * @purpose Retrieves the complete list of courses from `/api/courses` to be used for teacher specialization options.
   *
   * @param None
   * @returns {Object} Returns data {Course[]} The list of courses (default empty array).
   * @throws Will throw internally if the `/api/courses` request fails.
   * @sideEffects
   * - Executes an API request to fetch course data.
   * - Populates React Query cache for reuse in other components.
   *
   * @example
   * ```tsx
   * const { data: courses = [] } = useQuery<Course[]>({
   *   queryKey: ["/api/courses"],
   * });
   * ```
   */
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  /**
   * React Query hook to fetch all branches from the backend API.
   *
   * @purpose Retrieves the full list of branches from `/api/branches` to associate teachers with one or more branches.
   *
   * @params None
   * @returns {Object} Returns data {Branch[]} The list of branches (default empty array).
   * @throws Will throw internally if the `/api/branches` request fails.
   * @sideEffects
   * - Makes a server request for branch data.
   * - Stores fetched results in React Query cache.
   *
   * @example
   * ```tsx
   * const { data: branches = [] } = useQuery<Branch[]>({
   *   queryKey: ["/api/branches"],
   * });
   * ```
   */
  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

  /**
   * coursesByCategory — grouped courses map by their category
   *
   * @purpose Helper used by UI to render specialization options grouped by category.
   *
   * @param None
   * @returns {{ [key: string]: Course[] }} Object keyed by category with arrays of courses.
   * @throws None
   * @sideEffects None
   *
   * @example
   * const grouped = coursesByCategory; // { "Guitar": [..], "Piano": [..] }
   */
  const coursesByCategory = courses.reduce(
    (acc: { [key: string]: Course[] }, course: Course) => {
      if (!acc[course.category]) {
        acc[course.category] = [];
      }
      acc[course.category].push(course);
      return acc;
    },
    {},
  );

  /**
   * handleViewTeacher — open teacher view dialog
   *
   * @purpose Sets the selected teacher and opens the view dialog.
   *
   * @param {Employee} teacher - The teacher object to view.
   * @returns {void}
   * @throws None
   * @sideEffects
   *  - Calls setSelectedTeacher and opens `isViewDialogOpen`.
   *
   * @example
   * handleViewTeacher(teacherObj);
   */
  const handleViewTeacher = (teacher: Employee) => {
    setSelectedTeacher(teacher);
    setIsViewDialogOpen(true);
  };

  /**
   * getUserDetails — find user object from users list by id
   *
   * @purpose Retrieve the associated user record for a teacher by userId.
   *
   * @param {number} userId - The user's numeric id.
   * @returns {User | undefined} The User object or undefined if not found.
   * @throws None
   * @sideEffects None
   *
   * @example
   * const user = getUserDetails(12);
   */
  const getUserDetails = (userId: number): User | undefined => {
    return users.find((user: User) => user.id === userId);
  };

  /**
   * getBranchName — get branch name by id
   *
   * @purpose Convert branch id to human-readable branch name.
   *
   * @param {string | number} branchId - Branch id (string or number).
   * @returns {string} Branch name or 'Unknown' when not found.
   * @throws None
   * @sideEffects None
   *
   * @example
   * const name = getBranchName(3); // "Downtown Branch"
   */
  const getBranchName = (branchId: string) => {
    // const branch = branches.find((b: any) => b.id.toString() === branchId);
    const branch = branches.find((b: any) => Number(b.id) === Number(branchId));
    return branch ? branch.name : "Unknown";
  };

  /**
   * formatSalaryWithoutSymbol — format numeric salary to two decimals without currency symbol
   *
   * @purpose Format salary for display (locale grouping & two decimals).
   *
   * @param {number} salary - Numeric salary value.
   * @returns {string} Localized formatted string e.g., "1,500.00".
   * @throws None
   * @sideEffects None
   *
   * @example
   * formatSalaryWithoutSymbol(1500) // "1,500.00"
   */
  const formatSalaryWithoutSymbol = (salary: number) => {
    return salary.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /**
   * handleEditTeacher — populate form and open edit dialog
   *
   * @purpose Populate the react-hook-form with an existing teacher's data for editing.
   *
   * @param {Employee} teacher - Teacher object to edit.
   * @returns {void}
   * @throws None
   * @sideEffects
   *  - Calls `reset` from react-hook-form to fill values.
   *  - Sets `selectedTeacher` and opens `isEditDialogOpen`.
   *
   * @example
   * handleEditTeacher(selectedTeacherObj);
   */
  const handleEditTeacher = (teacher: Employee) => {
    setIsViewDialogOpen(false);
    setSelectedTeacher(teacher);
    reset({
      employeeId: teacher.employeeId,
      firstName: teacher.firstName,
      middleName: teacher.middleName || "",
      lastName: teacher.lastName,
      email: teacher.email || "",
      username: teacher.userName,
      password: teacher.password,
      phoneNumber: teacher.phoneNumber || 0,
      whatsappNumber: teacher.whatsappNumber || 0,
      joiningDate: new Date(teacher.joiningDate).toISOString().split("T")[0],
      salary: teacher.salary.toString(),
      bankAccount: teacher.bankAccount || "",
      ifscIbanBsb: teacher.ifscIbanBsb || "",
      branch: Array.isArray(teacher.branch)
        ? teacher.branch
        : teacher.branch.split(",").map((b) => b.trim()),
      specialization: teacher.specialization || "",
      residenceAddress: teacher.residenceAddress || "",
      street: teacher.street || "",
      community: teacher.community || "",
      flatNumber: teacher.flatNumber || "",
      // status: teacher.status,
    });
    setIsEditDialogOpen(true);
  };

  /**
   * updateTeacherMutation — react-query mutation to update teacher
   *
   * @purpose Update teacher details on backend and refresh local cache on success.
   *
   * @param {TeacherFormValues} data - Data object from the form used to update teacher.
   * @returns {Promise<any>} The server response (parsed JSON).
   * @throws When API response is not ok an Error is thrown with message from server if available.
   * @sideEffects
   *  - Calls apiRequest("PUT", `/api/employees/${selectedTeacher?.id}`, teacherData).
   *  - On success invalidates `"/api/employees"` cache and closes edit dialog.
   *  - On error displays toast with error message.
   *
   * @example
   * updateTeacherMutation.mutateAsync(formValues);
   */
  const updateTeacherMutation = useMutation({
    mutationFn: async (data: TeacherFormValues) => {
      const teacherData = {
        employeeId: data.employeeId,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        userName: data.username,
        password: data.password,
        phoneNumber: data.phoneNumber,
        whatsappNumber: data.whatsappNumber,
        joiningDate: data.joiningDate,
        email: data.email,
        salary: Number(data.salary),
        bankAccount: data.bankAccount,
        ifscIbanBsb: data.ifscIbanBsb,
        status: data.status,
        branch: data.branch,
        residenceAddress: data.residenceAddress,
        street: data.street,
        community: data.community,
        flatNumber: data.flatNumber,
        specialization: data.specialization || null,
      };

      const res = await apiRequest(
        "PUT",
        `/api/employees/${selectedTeacher?.id}`,
        teacherData,
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Teacher updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update teacher: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  /**
   * handleUpdateTeacher — wrapper to trigger teacher update mutation.
   *
   * @purpose Calls the `updateTeacherMutation` to persist teacher changes.
   *
   * @params
   *  - data: TeacherFormValues — The validated form values for a teacher.
   * @returns {void}
   * @throws None (mutation handles server errors)
   * @sideEffects
   *  - Invokes the react-query mutation `updateTeacherMutation.mutate`.
   *  - May update UI via mutation callbacks (invalidate queries, toast).
   *
   * @example
   * handleUpdateTeacher({ employeeId: "TCR101", firstName: "John", ... });
   */
  const handleUpdateTeacher = (data: TeacherFormValues) => {
    updateTeacherMutation.mutate(data);
  };

  /**
   * deleteTeacher — Deletes the currently selected teacher via fetch.
   *
   * @purpose Remove the selected teacher resource from the backend and update UI.
   *
   * @param None (uses `selectedTeacher` captured from component state)
   * @returns {Promise<void>}
   * @throws Throws (and will be caught internally) if fetch/network fails or response is unexpected.
   * @sideEffects
   *  - Sends an HTTP DELETE request to the employees API.
   *  - Invalidates the react-query cache for employees on success.
   *  - Shows success/error toasts and toggles dialog UI state.
   *  - Logs debug info to the console.
   *
   * @example
   * // ensure setSelectedTeacher(teacher) called first
   * await deleteTeacher();
   */
  const deleteTeacher = async () => {
    if (!selectedTeacher) return;

    try {
      // Add debug logging
      console.log("Attempting to delete teacher ID:", selectedTeacher.id);

      const response = await fetch(
        `http://localhost:5000/api/employees/${selectedTeacher.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include", // If using cookies
        },
      );

      console.log("Delete response:", response);

      if (response.status === 204) {
        await queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
        setSelectedTeacher(null);
        toast({
          title: "Teacher deleted",
          description: "The teacher has been deleted successfully.",
        });
        setIsDeleteDialogOpen(false);
      } else {
        const text = await response.text();
        console.error("Unexpected response:", text);
        throw new Error(`Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete teacher",
        variant: "destructive",
      });
    }
  };

  /**
   * Column definitions for rendering the Teachers table.
   *
   * @purpose
   * - Defines the structure, headers, and cell renderers for displaying employee data (teachers only) in a table.
   * - This configuration works with TanStack Table (or similar) to render columns dynamically.
   *
   * @params None
   * @returns {ColumnDef<Employee>[]}
   * @throws None
   * @sideEffects
   * - Uses helper functions `getUserDetails`, `formatSalaryWithoutSymbol`, and `getBranchName`.
   * - Renders React components (Badge, Button, JSX).
   *
   * @example
   * ```tsx
   * <DataTable columns={columns} data={teachers} />
   * ```
   */
  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "employeeId",
      header: "ID",
      /**
       * @purpose Displays the unique employee ID of the teacher.
       * @param None
       * @returns {string} Employee ID (e.g., "TCR101").
       * @throws None
       * @sideEffects None
       * @example
       * Row shows: `TCR101`
       */
    },
    {
      accessorKey: "firstName",
      header: "Name",
      /**
       * @purpose Renders the teacher's full name and email.
       *
       * @params
       * - row: Row<Employee> → Contains the teacher record.
       * @returns {JSX.Element} React fragment with teacher's name and email.
       * @throws None
       * @sideEffects Uses `getUserDetails` internally to retrieve user info.
       *
       * @example
       * Renders:
       * ```
       * John A Doe
       * john.doe@example.com
       * ```
       */
      cell: ({ row }) => {
        const teacher = row.original;
        const user = getUserDetails(teacher.userId);

        return (
          <div className="flex items-center">
            <div>
              <div className="font-medium">
                {teacher.firstName} {teacher.middleName}
                {teacher.lastName}
              </div>
              <div className="text-xs text-muted-foreground">
                {teacher.email || ""}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "joiningDate",
      header: "Joining Date",
      /**
       * @purpose Displays the formatted joining date of the teacher.
       *
       * @params
       * - row: Row<Employee> → Contains the teacher record.
       * @returns {string} Formatted date string in `"MMM dd, yyyy"` format.
       * @throws None
       * @sideEffects Uses `date-fns` format function.
       *
       * @example
       * `Jan 05, 2024`
       */
      cell: ({ row }) => {
        return format(new Date(row.original.joiningDate), "MMM dd, yyyy");
      },
    },
    {
      accessorKey: "salary",
      header: "Basic Salary",
      /**
       * @purpose Displays the teacher's salary formatted as a number string without currency symbol.
       *
       * @params
       * - row: Row<Employee> → Contains the teacher record.
       * @returns {string} Formatted salary (e.g., `5,000.00`).
       * @throws None
       * @sideEffects Uses `formatSalaryWithoutSymbol` helper.
       *
       * @example
       * `6,000.00`
       */
      cell: ({ row }) => {
        return formatSalaryWithoutSymbol(Number(row.original.salary));
      },
    },
    // {
    //   accessorKey: "branch",
    //   header: "Branch",
    //   cell: ({ row }) => {
    //     return getBranchName(row.original.branch);
    //   },
    // },
    // CORRECTED AND MORE ROBUST VERSION
    {
      accessorKey: "branch",
      header: "Branch",
      /**
       * @purpose Displays branch names associated with the teacher.
       *
       * @params
       * - row: Row<Employee> → Contains the teacher record, with `branch` as either an array or comma-separated string.
       * @returns {string | JSX.Element} Branch names joined by commas, or `N/A` if none.
       * @throws None
       * @sideEffects Uses `getBranchName` helper to map IDs to names.
       *
       * @example
       * `"Downtown, North Campus"`
       */
      cell: ({ row }) => {
        // This variable might be a string like "1,5" or an array [1, 5]
        const branchData = row.original.branch;

        // Handle cases where data is null, undefined, or an empty string
        if (!branchData) {
          return <span className="text-muted-foreground">N/A</span>;
        }

        // This is the crucial part:
        // 1. Check if the data is already an array.
        // 2. If it's not, assume it's a string and use .split(',') to create an array.
        const branchIds = Array.isArray(branchData)
          ? branchData
          : String(branchData).split(",");

        // Now, branchIds is guaranteed to be an array, so we can map it safely.
        const branchNames = branchIds
          .map((id) => getBranchName(String(id).trim())) // .trim() is added for safety
          .join(", ");

        return <div>{branchNames}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      /**
       * @purpose Displays the teacher's status with a badge.
       *
       * @params
       * - row: Row<Employee> → Contains the teacher record.
       * @returns {JSX.Element} Badge component showing "Active" or "Inactive".
       * @throws None
       * @sideEffects Renders `Badge` UI component with variant.
       *
       * @example
       * `<Badge variant="success">Active</Badge>`
       */
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
      /**
       * @purpose Provides action buttons (Delete, View) for each teacher.
       *
       * @params
       * - row: Row<Employee> → Contains the teacher record.
       * @returns {JSX.Element} Buttons for managing teacher actions.
       * @throws None
       * @sideEffects Calls `handleDeleteTeacher` and `handleViewTeacher` when buttons are clicked.
       *
       * @example
       * Buttons: [Delete] [View]
       */
      cell: ({ row }) => (
        <div className="flex space-x-2">
          {/* <Button
            variant="ghost"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            size="sm"
            onClick={() => handleEditTeacher(row.original)}
          >
            Edit
          </Button> */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white bg-red-600 hover:bg-red-300"
            onClick={() => handleDeleteTeacher(row.original)}
          >
            Delete
          </Button>
          <Button
            variant="ghost"
            className="bg-gray-500 hover:bg-gray-600 text-white"
            size="sm"
            onClick={() => handleViewTeacher(row.original)}
            title="View Details"
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  /**
   * handleDeleteTeacher — Prepare and open delete dialog for a teacher.
   *
   * @purpose Set the selected teacher and open the delete confirmation dialog.
   *
   * @params
   *  - teacher: Employee — The teacher record to delete (selected from table row).
   * @returns {void}
   * @throws None
   * @sideEffects
   *  - Updates component state: `selectedTeacher`, `isDeleteDialogOpen`.
   *
   * @example
   * handleDeleteTeacher(teacherRow);
   */
  const handleDeleteTeacher = (teacher: Employee) => {
    setSelectedTeacher(teacher);
    setIsDeleteDialogOpen(true);
  };

  // state form data
  const [formData, setFormData] = useState({
    employeeId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    userId: "",
    position: "",
    userName: "",
    password: "",
    phoneNumber: "",
    whatsappNumber: "",
    specialization: "",
    residenceAddress: "",
    street: "",
    community: "",
    flatNumber: "",
    joiningDate: new Date().toISOString().split("T")[0],
    salary: "",
    bankAccount: "",
    ifscIbanBsb: "",
    branch: [],
    status: "active",
  });

  /**
   * generateUsername — Generates a sanitized username for a teacher from their first name.
   *
   * @purpose Create a default username if the admin doesn't supply one.
   *
   * @params
   *  - firstName: string — Teacher's first name.
   * @returns {string} A sanitized username (prefixed with `t.`).
   * @throws None
   * @sideEffects None
   *
   * @example
   * const username = generateUsername("John"); // "t.john"
   */
  const generateUsername = (firstName: string) => {
    const sanitizedName = firstName.toLowerCase().replace(/[^a-z]/g, "");
    return `t.${sanitizedName}`;
  };

  /**
   * generatePassword — Generate a random alpha-numeric password.
   *
   * @purpose Provide a one-off suggested password for a new teacher.
   *
   * @param None
   * @returns {string} Randomly generated password (default 8 chars).
   * @throws None
   * @sideEffects None
   *
   * @example
   * const pw = generatePassword(); // "aB3k2Yz9"
   */
  const generatePassword = () => {
    const length = 8;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  /**
   * handleInputChange — Generic input change handler used for teacher creation form.
   *
   * @purpose Update local `formData` state when form inputs change. Also auto-generates
   *          username/password from firstName or email where appropriate.
   *
   * @params
   *  - e: React.ChangeEvent<HTMLInputElement> — The input change event.
   * @returns {void}
   * @throws None
   * @sideEffects
   *  - Updates component local `formData` state.
   *  - May auto-generate `userName` and `password` if email or firstName are provided.
   *
   * @example
   * <input name="email" onChange={handleInputChange} />
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Generate username from email when email changes
      if (name === "email" && value) {
        newData.userName = value; // Set username to be the same as email
        // Only generate password if it's not already set
        if (!newData.password) {
          newData.password = generatePassword();
        }
      }

      // Keep the existing firstName logic if you still need it
      if (name === "firstName" && value && !newData.email) {
        newData.userName = generateUsername(value);
        if (!newData.password) {
          newData.password = generatePassword();
        }
      }

      return newData;
    });
  };

  /**
   * Handle select change for form fields.
   *
   * @purpose Updates the local `formData` state for a named select/input field.
   *
   * @params
   * - name: string — Name of the form field to update.
   * - value: string — New value for the form field.
   * @returns {void}
   * @throws None
   * @sideEffects Updates React state via `setFormData`.
   *
   * @example
   * handleSelectChange("branch", "3");
   */
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * parseBranchId — Normalizes branch id(s) into an array of string ids.
   *
   * @purpose Accepts an input that may be a string, an array of strings, or objects(sometimes coming from DB representations like `"{1,2}"`) and returns a flat array of string IDs suitable for mapping and display.
   *
   * @params items: any — Input representing branch ids. May be a string (e.g. `"{1,2}"`), a comma-separated string like `"1,2"`, an array of such values, or other types.
   * @returns {string[]} Flattened array of branch id strings. Example: `["1","2"]`.
   * @throws None — function is defensive and returns empty strings for unknown values.
   * @sideEffects Logs the intermediate parsing steps to console for debugging.
   *
   * @example
   * const parsed = parseBranchId('{1,2}'); // ['1','2']
   * const parsed2 = parseBranchId(['{1,2}', '3']); // ['1','2','3']
   */
  const parseBranchId = (items: any): string[] => {
    const result: string[] = [];

    // Make sure we have an array
    const values = Array.isArray(items) ? items : [items];

    values.forEach((item) => {
      if (typeof item === "string") {
        // Remove curly braces and quotes, then split by comma
        const cleaned = item.replace(/[{}"]/g, "");
        const parts = cleaned
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean);
        console.log("Parsed from item:", item, "=>", parts);
        result.push(...parts);
      } else {
        result.push(item?.toString() || "");
      }
    });

    console.log("Final flattened result:", result);
    return result;
  };

  /**
   * filteredTeachers — Normalized and filtered list of teachers.
   *
   * @purpose Normalize `branch` property on each teacher (ensures it's an array of strings) and filter teachers based on current `activeTab`.
   *
   * @param None (reads from `teachers` and `activeTab` in enclosing scope)
   * @returns {typeof teachers} Array of teacher objects with `branch` guaranteed to be string[].
   * @throws None
   * @sideEffects None (pure transformation)
   *
   * @example
   * // used directly in component render as data source for table
   * <DataTable data={filteredTeachers} ... />
   */
  const filteredTeachers = teachers
    .map((teacher) => ({
      ...teacher,
      // Normalize the branch data to always be an array of strings
      branch: parseBranchId(teacher.branch),
    }))
    .filter((teacher) => {
      if (activeTab === "all") return true;
      if (activeTab === teacher.status) return true;
      return false;
    });

  /**
   * createTeacherMutation — React Query mutation to create a teacher (and user).
   *
   * @purpose Creates both a user account (in `/api/users`) and an employee record (in `/api/employees`) in a single flow. If user creation succeeds but employee creation fails, attempts to roll back the created user.
   *
   * @param None directly (mutationFn receives `data` when mutation is triggered)
   * @returns {Promise<any>} Resolves to the created teacher record returned by the API.
   * @throws Will rethrow errors encountered while creating user/employee.
   *   If a user was created but teacher creation fails, it attempts to delete the user
   *   (best-effort rollback) and then rethrows the original error.
   * @sideEffects
   * - Calls `apiRequest("POST", "/api/users", ...)` to create user.
   * - Calls `apiRequest("POST", "/api/employees", ...)` to create employee.
   * - On failure, may call `apiRequest("DELETE", /api/users/${userId})` to rollback.
   * - On success, invalidates `"/api/employees"` query via `queryClient.invalidateQueries`.
   * - Resets local `formData` and closes the create dialog (via `setIsCreateDialogOpen(false)`).
   *
   * @example
   * createTeacherMutation.mutate({
   *   employeeId: "TCR101",
   *   firstName: "Jane",
   *   lastName: "Smith",
   *   userName: "j.smith",
   *   password: "Secret123",
   *   branch: ["1"],
   *   salary: "50000",
   *   email: "jane@example.com",
   *   ...
   * });
   */
  const createTeacherMutation = useMutation({
    mutationFn: async (data: any) => {
      let userId = null;
      try {
        // First create the user account
        const userResponse = await apiRequest("POST", "/api/users", {
          username: data.userName,
          password: data.password,
          role: "teacher",
          fullName: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phoneNumber,
          address: data.residenceAddress,
        });

        const user = await userResponse.json();
        userId = user.id; // Store the user ID for potential rollback

        // Then create the teacher record with the updated schema
        const teacherData = {
          employeeId: data.employeeId,
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          userId: user.id,
          position: "teacher",
          userName: data.userName,
          password: data.password,
          phoneNumber: data.phoneNumber,
          whatsappNumber: data.whatsappNumber,
          joiningDate: data.joiningDate,
          email: data.email,
          salary: Number(data.salary),
          bankAccount: data.bankAccount,
          ifscIbanBsb: data.ifscIbanBsb,
          status: data.status,
          branch: data.branch,
          residenceAddress: data.residenceAddress,
          street: data.street,
          community: data.community,
          flatNumber: data.flatNumber,
          specialization: data.specialization || null,
        };

        const res = await apiRequest("POST", "/api/employees", teacherData);
        const teacher = await res.json();

        return teacher;
      } catch (error) {
        console.error("Error creating teacher:", error);

        // If we created a user but failed to create teacher, delete the user
        if (userId) {
          try {
            await apiRequest("DELETE", `/api/users/${userId}`);
            console.log(
              "Rolled back user creation due to teacher creation failure",
            );
          } catch (deleteError) {
            console.error("Failed to rollback user creation:", deleteError);
          }
        }

        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Teacher created successfully with login credentials",
      });
      // Reset form
      setFormData({
        employeeId: "",
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        userId: "",
        position: "",
        userName: "",
        phoneNumber: "",
        whatsappNumber: "",
        residenceAddress: "",
        street: "",
        community: "",
        flatNumber: "",
        specialization: "",
        joiningDate: new Date().toISOString().split("T")[0],
        salary: "",
        bankAccount: "",
        ifscIbanBsb: "",
        branch: [],
        password: "",
        status: "active",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create teacher: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  /**
   * handleCreateTeacher — Handles the create teacher form submission.
   *
   * @purpose Validates required fields, shows validation toasts if needed, and triggers
   *   `createTeacherMutation` to persist the teacher and user.
   *
   * @params
   * - e: React.FormEvent — Form submit event.
   * @returns {Promise<void>} Resolves once mutation is triggered or validations fail.
   * @throws None (errors from mutation are handled by the mutation callbacks)
   * @sideEffects
   * - Shows `toast` messages for validation errors.
   * - Calls `createTeacherMutation.mutate` to perform side-effectful API calls.
   *
   * @example
   * <form onSubmit={handleCreateTeacher}>...</form>
   */
  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = [
      "employeeId",
      "firstName",
      "lastName",
      "email",
      "specialization",
      "branch",
      "salary",
    ];
    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData],
    );

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    createTeacherMutation.mutate(formData);
  };

  return (
    // AppShell is used to provide a consistent layout with header, sidebar, and footer
    <AppShell>
      {/* Page header with title, description and action button */}
      <PageHeader
        title="Teachers"
        description="Manage music teachers across all branches."
        actions={
          <Button
            onClick={() => {
              const nextTeacherId = generateNextTeacherId(); // Safely generated at click time
              setFormData((prev) => ({
                ...prev,
                employeeId: nextTeacherId,
                joiningDate: new Date().toISOString().split("T")[0],
                status: "active", // default status
                // Optional: reset other fields here
              }));
              setIsCreateDialogOpen(true);
            }}
          >
            {/* Add teacher button with icon */}
            <UserPlus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        }
      />

      {/* Tab content containing the data table */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <DataTable
            columns={columns} //column definitions
            data={filteredTeachers} //data to display
            searchColumns={["employeeId"]} //columns to search by
            searchPlaceholder="Search teachers..." //placeholder for search input
          />
        </TabsContent>
      </Tabs>

      {/* View Teacher Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            {/* Dialog title */}
            <DialogTitle>Teacher Details</DialogTitle>
            {/* Dialog description */}
            <DialogDescription>
              View comprehensive information about the teacher.
            </DialogDescription>
          </DialogHeader>

          {/* Render when a teacher is selected */}
          {selectedTeacher && (
            <div className="space-y-4">
              {/* Header: avatar, name and role badge */}
              <div className="flex justify-between">
                <div className="flex items-center">
                  {/* Avatar with fallback initials */}
                  <Avatar className="h-14 w-14 mr-4">
                    <AvatarFallback className="text-lg">
                      {getUserDetails(selectedTeacher.userId)?.fullName
                        ? // Show initials if user's full name exists
                          getInitials(
                            getUserDetails(selectedTeacher.userId)!.fullName,
                          )
                        : "??"}
                    </AvatarFallback>
                  </Avatar>
                  {/* Name and role */}
                  <div>
                    {/* Name */}
                    <h3 className="text-lg font-semibold">
                      {getUserDetails(selectedTeacher.userId)?.fullName ||
                        "Unknown"}
                    </h3>
                    {/* Employee id and role label */}
                    <p className="text-sm text-muted-foreground">
                      {selectedTeacher.employeeId} · Teacher
                    </p>
                  </div>
                </div>
                {/* Status badge */}
                <Badge
                  variant={
                    selectedTeacher.status === "active"
                      ? "success"
                      : "destructive"
                  }
                >
                  {selectedTeacher.status.toUpperCase()}
                </Badge>
              </div>

              {/* Two-column grid: Contact info + Employment details */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                {/* Contact info card */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold mb-3">
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      {/* Email */}
                      <div className="flex items-start">
                        <MailIcon className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Email</p>
                          {/* Email address with icon */}
                          <p className="text-sm text-muted-foreground">
                            {getUserDetails(selectedTeacher.userId)?.email ||
                              "N/A"}
                          </p>
                        </div>
                      </div>
                      {/* Phone */}
                      <div className="flex items-start">
                        <PhoneIcon className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Phone</p>
                          {/* Phone number with icon */}
                          <p className="text-sm text-muted-foreground">
                            {getUserDetails(selectedTeacher.userId)?.phone ||
                              "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Address row with icon */}
                      <div className="flex items-start">
                        <MapPinIcon className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Address</p>
                          <p className="text-sm text-muted-foreground">
                            {getUserDetails(selectedTeacher.userId)?.address ||
                              "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Employment details card */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold mb-3">
                      Employment Details
                    </h4>
                    <div className="space-y-3">
                      {/* Joining date */}
                      <div className="flex items-start">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Joining Date</p>
                          <p className="text-sm text-muted-foreground">
                            {format(
                              new Date(selectedTeacher.joiningDate),
                              "MMMM dd, yyyy",
                            )}
                          </p>
                        </div>
                      </div>
                      {/* Basic salary */}
                      <div className="flex items-start">
                        <BadgeIndianRupee className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Basic Salary</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(Number(selectedTeacher.salary))} per
                            month
                          </p>
                        </div>
                      </div>
                      {/* Branch */}
                      <div className="flex items-start">
                        <MapPinIcon className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Branch</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedTeacher.branch
                              ? branches
                                  .filter((branch: Branch) =>
                                    parseBranchId(
                                      selectedTeacher.branch,
                                    ).includes(branch.id.toString()),
                                  )
                                  .map((branch: Branch) => branch.name)
                                  .join(", ")
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bank details card */}
              {selectedTeacher.bankAccount && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold mb-2">Bank Details</h4>
                    <p className="text-sm">{selectedTeacher.bankAccount}</p>
                  </CardContent>
                </Card>
              )}

              {/* Action buttons */}
              <div className="flex justify-end space-x-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => handleEditTeacher(selectedTeacher)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
                </Button>

                {/* <Button variant="default">
                  <UserCog className="mr-2 h-4 w-4" />
                  View Payroll
                </Button> */}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Teacher Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        {/* Dialog content */}
        <DialogContent className="sm:max-w-[950px] max-h-[90vh] flex flex-col gap-5">
          <DialogHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              {/* Dialog title */}
              <DialogTitle>Add New Teacher</DialogTitle>
              {/* Dialog description */}
              <DialogDescription>
                Fill in the details to add a new teacher to Institutiontution
                Management.
              </DialogDescription>
            </div>
            {/* Teacher ID */}
            <div className="flex items-center w-1/3">
              <Label
                htmlFor="studentId"
                className="whitespace-nowrap font-semibold text-lg"
              >
                Teacher ID:
              </Label>
              <div
                id="studentId"
                className="flex-1 px-3 py-2 text-gray-700 font-bold"
              >
                {nextTeacherId}
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleCreateTeacher}>
              {/* <div className="mb-4 p-3 bg-gray-100 rounded-md">
                <p className="text-sm font-medium">Teacher ID: <span className="font-bold">{nextTeacherId}</span></p>
              </div> */}
              <div className="grid grid-cols-3 gap-4 pb-4">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    // placeholder="Enter first name"
                    required
                  />
                </div>
                {/* Middle Name */}
                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    // placeholder="Enter middle name"
                  />
                </div>
                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    // placeholder="Enter last name"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    // placeholder="Enter email address"
                    required
                  />
                </div>
                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">
                    Username<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.userName}
                    // placeholder="Auto-generated"
                    readOnly
                    disabled
                    required
                  />
                </div>
                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="text"
                    value={formData.password}
                    // placeholder="Auto-generated"
                    readOnly
                    disabled
                    required
                  />
                </div>

                {/* Joining Date */}
                <div className="space-y-2">
                  <Label htmlFor="joiningDate">
                    Joining Date<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="joiningDate"
                    name="joiningDate"
                    type="date"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    // placeholder="Enter phone number"
                  />
                </div>
                {/* Whatsapp Number */}
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">Whatsapp Number</Label>
                  <Input
                    id="whatsappNumber"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleInputChange}
                    // placeholder="Enter whatsapp number"
                  />
                </div>

                {/* Branch */}
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  {/* Branch selection */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {formData.branch && formData.branch.length > 0
                          ? branches
                              .filter((branch) =>
                                formData.branch.includes(branch.id),
                              )
                              .map((branch) => branch.name)
                              .join(", ")
                          : "Select Branch"}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] max-h-60 overflow-auto p-2">
                      {branches.map((branch) => {
                        const isChecked = formData.branch.includes(branch.id);
                        return (
                          <div
                            key={branch.id}
                            className="flex items-center space-x-2 cursor-pointer rounded-md p-2 hover:bg-accent"
                            onClick={() => {
                              const selectedIds = formData.branch || [];
                              const newValue = isChecked
                                ? selectedIds.filter((id) => id !== branch.id)
                                : [...selectedIds, branch.id];
                              handleSelectChange("branch", newValue);
                            }}
                          >
                            <Checkbox
                              checked={isChecked}
                              id={`branch-${branch.id}`}
                            />
                            <label
                              htmlFor={`branch-${branch.id}`}
                              className="cursor-pointer"
                            >
                              {branch.name}
                            </label>
                          </div>
                        );
                      })}
                    </PopoverContent>
                  </Popover>
                </div>
                {/* Course */}
                <div className="space-y-2">
                  <Label htmlFor="specialization">Course</Label>
                  {/* Course selection */}
                  <Select
                    name="specialization"
                    value={formData.specialization}
                    onValueChange={(value) =>
                      handleSelectChange("specialization", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course: Course) => (
                        <SelectItem key={course.id} value={course.name}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Basic Salary */}
                <div className="space-y-2">
                  <Label htmlFor="salary">
                    Basic Salary<span className="text-red-500">*</span>
                  </Label>

                  <Input
                    id="salary"
                    name="salary"
                    type="number"
                    value={formData.salary}
                    onChange={handleInputChange}
                    // placeholder="Enter monthly salary"
                    required
                  />
                </div>

                {/* Residential Address */}
                <div className="space-y-2">
                  <Label htmlFor="residenceAddress">Residential Address</Label>
                  <Input
                    id="residenceAddress"
                    name="residenceAddress"
                    value={formData.residenceAddress}
                    onChange={handleInputChange}
                    // placeholder="Enter residential address"
                  />
                </div>
                {/* Street */}
                <div className="space-y-2">
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    // placeholder="Enter Street"
                  />
                </div>
                {/* Community */}
                <div className="space-y-2">
                  <Label htmlFor="community">Community</Label>
                  <Input
                    id="community"
                    name="community"
                    value={formData.community}
                    onChange={handleInputChange}
                    // placeholder="Enter community"
                  />
                </div>

                {/* Flat Number */}
                <div className="space-y-2">
                  <Label htmlFor="flatNumber">Flat Number</Label>
                  <Input
                    id="flatNumber"
                    name="flatNumber"
                    value={formData.flatNumber}
                    onChange={handleInputChange}
                    // placeholder="Enter flat number"
                  />
                </div>
                {/* Bank Account */}
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Bank Account</Label>
                  <Input
                    id="bankAccount"
                    name="bankAccount"
                    value={formData.bankAccount}
                    onChange={handleInputChange}
                    // placeholder="Enter bank account details"
                  />
                </div>
                {/* IFSC/IBAN/BSB */}
                <div className="space-y-2">
                  <Label htmlFor="ifscIbanBsb">IFSC/IBAN/BSB</Label>
                  <Input
                    id="ifscIbanBsb"
                    name="ifscIbanBsb"
                    value={formData.ifscIbanBsb}
                    onChange={handleInputChange}
                    // placeholder="Enter IFSC/IBAN/BSB"
                  />
                </div>
              </div>

              {/* Dialog Footer with Cancel and Submit buttons */}
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createTeacherMutation.isPending}
                >
                  {createTeacherMutation.isPending
                    ? "Creating..."
                    : "Add Teacher"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit teacher dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[950px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Teacher</DialogTitle>
            <DialogDescription>
              Update the details for this teacher at Institutiontution
              Management.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(handleUpdateTeacher)}
            className="grid grid-cols-3 max-sm:grid-cols-1 gap-4"
          >
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => <Input id="firstName" {...field} />}
              />
              {errors?.firstName && (
                <p className="text-sm text-red-500">
                  {errors.firstName?.message}
                </p>
              )}
            </div>
            {/* Middle Name */}
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Controller
                name="middleName"
                control={control}
                render={({ field }) => <Input id="middleName" {...field} />}
              />
              {errors?.middleName && (
                <p className="text-sm text-red-500">
                  {errors.middleName?.message}
                </p>
              )}
            </div>
            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => <Input id="lastName" {...field} />}
              />
              {errors?.lastName && (
                <p className="text-sm text-red-500">
                  {errors.lastName?.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input id="email" type="email" {...field} />
                )}
              />
              {errors?.email && (
                <p className="text-sm text-red-500">{errors.email?.message}</p>
              )}
            </div>
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <Input id="username" disabled {...field} />
                )}
              />
            </div>
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input id="password" type="password" disabled {...field} />
                )}
              />
            </div>

            {/* Joining Date */}
            <div className="space-y-2">
              <Label htmlFor="joiningDate">Joining Date</Label>
              <Controller
                name="joiningDate"
                control={control}
                render={({ field }) => (
                  <Input id="joiningDate" type="date" {...field} />
                )}
              />
              {errors?.joiningDate && (
                <p className="text-sm text-red-500">
                  {errors.joiningDate?.message}
                </p>
              )}
            </div>
            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => <Input id="phone" {...field} />}
              />
              {errors?.phoneNumber && (
                <p className="text-sm text-red-500">
                  {errors.phoneNumber?.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">Whatsapp Number</Label>
              <Controller
                name="whatsappNumber"
                control={control}
                render={({ field }) => <Input id="whatsapp" {...field} />}
              />
              {errors?.whatsappNumber && (
                <p className="text-sm text-red-500">
                  {errors.whatsappNumber?.message}
                </p>
              )}
            </div>

            {/* Branch */}
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Controller
                name="branch"
                control={control}
                render={({ field }) => (
                  // Branch selection with Popover
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {field.value && (field.value as string[]).length > 0
                          ? branches
                              .filter((branch: Branch) =>
                                (field.value as string[]).some((item: string) =>
                                  parseBranchId(item).includes(
                                    branch.id.toString(),
                                  ),
                                ),
                              )
                              .map((branch: Branch) => branch.name)
                              .join(", ")
                          : "Select branches..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] max-h-60 overflow-auto p-2">
                      {branches.map((branch) => {
                        // Use the same parsing logic as in the display
                        const isChecked = field.value?.some((item: string) =>
                          parseBranchId(item).includes(branch.id.toString()),
                        );

                        return (
                          <div
                            key={branch.id}
                            className="flex items-center space-x-2 cursor-pointer rounded-md p-2 hover:bg-accent"
                            onClick={() => {
                              // Parse all current values to get clean IDs
                              const currentIds = field.value
                                ? (field.value as string[]).flatMap((item) =>
                                    parseBranchId(item),
                                  )
                                : [];

                              const newValue = isChecked
                                ? currentIds.filter(
                                    (id) => id !== branch.id.toString(),
                                  )
                                : [...currentIds, branch.id.toString()];

                              field.onChange(newValue);
                            }}
                          >
                            <Checkbox
                              checked={isChecked}
                              id={`branch-${branch.id}`}
                            />
                            <label
                              htmlFor={`branch-${branch.id}`}
                              className="cursor-pointer"
                            >
                              {branch.name}
                            </label>
                          </div>
                        );
                      })}
                    </PopoverContent>
                  </Popover>
                )}
              />
              {/* Branch Error */}
              {errors?.branch && (
                <p className="text-sm text-red-500">{errors.branch?.message}</p>
              )}
            </div>
            {/* Specialization */}
            <div className="space-y-2">
              <Label htmlFor="specialization">Course</Label>
              <Controller
                name="specialization"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(coursesByCategory).map(
                        ([category, courses]) => (
                          <div key={category}>
                            <SelectItem
                              value={category}
                              disabled
                              className="font-semibold"
                            >
                              {category.charAt(0).toUpperCase() +
                                category.slice(1)}
                            </SelectItem>
                            {courses.map((course: Course) => (
                              <SelectItem key={course.id} value={course.name}>
                                {course.name}
                              </SelectItem>
                            ))}
                          </div>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {/* Specialization Error */}
              {errors?.specialization && (
                <p className="text-sm text-red-500">
                  {errors.specialization?.message}
                </p>
              )}
            </div>
            {/* Basic Salary */}
            <div className="space-y-2">
              <Label htmlFor="salary">Basic Salary</Label>
              <Controller
                name="salary"
                control={control}
                render={({ field }) => (
                  <Input id="salary" type="number" {...field} />
                )}
              />
              {/* Basic Salary Error */}
              {errors?.salary && (
                <p className="text-sm text-red-500">{errors.salary?.message}</p>
              )}
            </div>

            {/* Residential Address */}
            <div className="space-y-2">
              <Label htmlFor="residenceAddress">Residential Address</Label>
              <Controller
                name="residenceAddress"
                control={control}
                render={({ field }) => (
                  <Input id="residenceAddress" {...field} />
                )}
              />
              {/* Residential Address Error */}
              {errors?.residenceAddress && (
                <p className="text-sm text-red-500">
                  {errors.residenceAddress?.message}
                </p>
              )}
            </div>
            {/* Street */}
            <div className="space-y-2">
              <Label htmlFor="street">Street</Label>
              <Controller
                name="street"
                control={control}
                render={({ field }) => <Input id="street" {...field} />}
              />
              {/* Street Error */}
              {errors?.street && (
                <p className="text-sm text-red-500">{errors.street?.message}</p>
              )}
            </div>
            {/* Community */}
            <div className="space-y-2">
              <Label htmlFor="community">Community</Label>
              <Controller
                name="community"
                control={control}
                render={({ field }) => <Input id="community" {...field} />}
              />
              {/* Community Error */}
              {errors?.community && (
                <p className="text-sm text-red-500">
                  {errors.community?.message}
                </p>
              )}
            </div>

            {/* Flat Number */}
            <div className="space-y-2">
              <Label htmlFor="flatNumber">Flat Number</Label>
              <Controller
                name="flatNumber"
                control={control}
                render={({ field }) => <Input id="flatNumber" {...field} />}
              />
              {/* Flat Number Error */}
              {errors?.flatNumber && (
                <p className="text-sm text-red-500">
                  {errors.flatNumber?.message}
                </p>
              )}
            </div>
            {/* Bank Account */}
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Bank Account</Label>
              <Controller
                name="bankAccount"
                control={control}
                render={({ field }) => <Input id="bankAccount" {...field} />}
              />
              {/* Bank Account Error */}
              {errors?.bankAccount && (
                <p className="text-sm text-red-500">
                  {errors.bankAccount?.message}
                </p>
              )}
            </div>
            {/* IFSC/IBAN/BSB */}
            <div className="space-y-2">
              <Label htmlFor="ifscIbanBsb">IFSC/IBAN/BSB</Label>
              <Controller
                name="ifscIbanBsb"
                control={control}
                render={({ field }) => <Input id="ifscIbanBsb" {...field} />}
              />
              {/* IFSC/IBAN/BSB Error */}
              {errors?.ifscIbanBsb && (
                <p className="text-sm text-red-500">
                  {errors.ifscIbanBsb?.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {/* Status Error */}
              {errors?.status && (
                <p className="text-sm text-red-500">{errors.status?.message}</p>
              )}
            </div>

            {/* Cancel & Submit Button */}
            <div className="col-span-3 flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateTeacherMutation.isPending}>
                {updateTeacherMutation.isPending
                  ? "Updating..."
                  : "Update Teacher"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Teacher Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete Teacher</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this teacher? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {/* Cancel & Delete Button */}
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteTeacher}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
