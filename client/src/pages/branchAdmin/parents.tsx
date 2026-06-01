import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { faker } from "@faker-js/faker";
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
  Users,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { User, Student, Parent } from "@shared/schema";
import { getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateParentSchema,
  CreateParentType,
} from "@/schema/createParentSchema";
import { apiRequest, queryClient } from "@/lib/queryClient";

/**
 * BranchAdminParents Component
 *
 * @component
 * @purpose Manage parent users in the application (view, create, edit, delete).
 *
 * @param {Object} props - The component props.
 * @returns {JSX.Element} Renders the Parents page in Branch Admin portal with dialogs, tables, and forms.
 * @sideEffects Fetches users, parents, and students from API, manages dialogs and form states.
 * @throws None.
 * @example
 * <Route path="/admin/parents" component={AdminParents} />
 */
export default function BranchAdminParents() {
  const [activeTab, setActiveTab] = useState("all");

  /**
   * Check URL query parameters at mount to optionally open the create dialog.
   *
   * @purpose If the URL contains ?openDialog=create, open the create parent dialog and remove the param.
   * @returns {void}
   * @sideEffects Sets `isCreateDialogOpen` to true and modifies browser history (removes query param).
   * @throws None.
   * @example
   * // If URL is /admin/parents?openDialog=create, this effect will open the create dialog automatically.
   */
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("openDialog") === "create") {
      setIsCreateDialogOpen(true);
      // Remove the query parameter
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // const [selectedParent, setSelectedParent] = useState<User | null>(null);
  const { toast } = useToast();

  // hook form
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateParentType>({
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      username: "",
      password: "",
      phone: "",
      whatsapp_no: "",
      email: "",
      street: "",
      community: "",
      residence_address: "",
      flat_no: "",
      status: "active",
    },
    resolver: zodResolver(CreateParentSchema),
  });

  /**
   * Fetch all users.
   *
   * @purpose Retrieve user list for looking up parent users (role === 'parent').
   * @returns {object} react-query result with `data: users` and `isLoading`.
   * @sideEffects Initiates a network request to `/api/users` via react-query.
   * @example
   * const { data: users } = useQuery({ queryKey: ["/api/users"] });
   */
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  /**
   * Fetches the list of parents from the API.
   *
   * @purpose Retrieve server-side parent records for table display.
   * @param queryKey: ["/api/parents"] — Unique key to identify and cache this query.
   * @returns {object} react-query result with `data: parentsData`.
   * @throws Errors from the fetch request will be caught internally by React Query; they do not throw directly here.
   * @sideEffects Initiates a network request to `/api/parents` via react-query.
   *
   * @example
   * const { data: parentsData = [] } = useQuery({
   *   queryKey: ["/api/parents"],
   * });
   */
  const { data: parentsData = [] } = useQuery({
    queryKey: ["/api/parents"],
  });

  // Filter only parent users
  const parents = users?.filter((user: User) => user.role === "parent");

  /**
   * Fetch students to find children for parents.
   *
   * @purpose Retrieve student records so we can compute which students belong to which parent.
   * @param queryKey: ["/api/students"] — Unique key to identify and cache this query
   * @returns {object} react-query result with `data: students`.
   * @throws Errors from the fetch request will be caught internally by React Query; they do not throw directly here.
   * @sideEffects Initiates a network request to `/api/students` via react-query.
   *
   * @example
   * const { data: students = [] } = useQuery({
   *   queryKey: ["/api/students"],
   * });
   */
  const { data: students = [], isLoading: isLoadingStudents } = useQuery<
    Student[]
  >({
    queryKey: ["/api/students"],
  });

  /**
   * Open the view dialog for a parent.
   * @purpose Display a read-only dialog containing parent contact and branch info and their children.
   *
   * @param {User} parent - The parent object whose details should be shown.
   * @returns {void}
   * @sideEffects Updates local state: `selectedParent` and `isViewDialogOpen`.
   * @example
   * handleViewParent(parentRecord);
   */
  const handleViewParent = (parent: User) => {
    setSelectedParent(parent);
    setIsViewDialogOpen(true);
  };

  /**
   * Retrieves children of a parent.
   *
   * @purpose Return an array of Student objects whose `parentId` matches.
   * @param {number} parentId - ID of the parent.
   * @returns {Student[]} An array of students linked to the parent.
   * @throws None.
   * @sideEffects None.
   * @example
   * const children = getChildrenForParent(1);
   */
  const getChildrenForParent = (parentId: number): Student[] => {
    return students?.filter(
      (student: Student) => student.parentId === parentId,
    );
  };

  /**
   * Handles creating a new parent.
   *
   * @purpose Send a POST request to create a parent on the server and refresh local cache/UI.
   * @param {CreateParentType} data - Data submitted through the form.
   * @returns {Promise<void>} Resolves when the API call and subsequent UI updates complete.
   * @throws Throws if the API request fails (error is caught and a toast is shown).
   * @sideEffects Calls `apiRequest("POST", "/api/parents", payload)`; invalidates react-query cache for `"/api/parents"`; resets form; closes dialog; shows toast; may redirect if `from=student-enquiry`.
   * @example
   * await handleCreateParent({
   *   first_name: "John",
   *   last_name: "Doe",
   *   email: "john.doe@example.com",
   *   ...
   * });
   */
  const handleCreateParent = async (data: CreateParentType) => {
    console.log("Creating parent...", data);
    try {
      const payload = {
        firstName: data.first_name,
        middleName: data.middle_name,
        lastName: data.last_name,
        username: data.username,
        password: data.password,
        phone: data.phone,
        whatsappNo: data.whatsapp_no,
        email: data.email,
        street: data.street,
        community: data.community,
        residenceAddress: data.residence_address,
        flatNo: data.flat_no,
        status: data.status,
      };
      console.log("Sending API request with payload:", payload);
      const response = await apiRequest("POST", "/api/parents", payload);
      console.log("API response:", response);

      await queryClient.invalidateQueries({
        queryKey: ["/api/parents"],
      });
      console.log("Query cache invalidated");

      reset();
      setIsCreateDialogOpen(false);

      toast({
        title: "Success",
        description: "Parent created successfully",
      });

      // Check if we should redirect
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("from") === "student-enquiry") {
        console.log("Redirecting to student enquiry...");
        const baseUrl = window.location.origin;
        const redirectUrl = `${baseUrl}/admin/student-enquiry?openDialog=create`;
        console.log("Redirect URL:", redirectUrl);
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.error("Parent creation error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create parent",
        variant: "destructive",
      });
    }
  };

  /**
   * Handles updating an existing parent.
   *
   * @param {CreateParentType} data - Values from the edit-parent form.
   * @purpose Send a PUT request to update an existing parent and refresh local cache/UI.
   * @returns {Promise<void>} Resolves when the API call and subsequent UI updates complete.
   * @throws Throws if the API request fails (error is caught and a toast is shown).
   * @sideEffects Calls `apiRequest("PUT", "/api/parents/:id", payload)`; invalidates react-query cache for `"/api/parents"`; resets form; closes dialog; shows toast.
   * @example
   * await handleUpdateParent({
   *   first_name: "John",
   *   last_name: "Doe",
   *   ...
   * });
   */
  const handleUpdateParent = async (data: CreateParentType) => {
    if (!selectedParent) return;
    try {
      const payload = {
        firstName: data.first_name,
        middleName: data.middle_name,
        lastName: data.last_name,
        username: data.username,
        password: data.password,
        phone: data.phone,
        whatsappNo: data.whatsapp_no,
        email: data.email,
        street: data.street,
        community: data.community,
        residenceAddress: data.residence_address,
        flatNo: data.flat_no,
        status: data.status,
      };
      await apiRequest("PUT", `/api/parents/${selectedParent.id}`, payload);
      await queryClient.invalidateQueries({ queryKey: ["/api/parents"] });
      setSelectedParent(null);
      reset();
      toast({
        title: "Parent updated",
        description: "The parent has been updated successfully.",
      });

      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to Update parent",
        variant: "destructive",
      });
    }
  };

  /**
   * Delete the currently selected parent.
   *
   * @purpose Send a DELETE request to remove the currently selected parent and refresh local cache/UI.
   * @returns {Promise<void>} Resolves when the API call and subsequent UI updates complete.
   * @throws Throws if the API request fails (error is caught and a toast is shown).
   * @sideEffects Calls `apiRequest("DELETE", "/api/parents/:id")`; invalidates react-query cache for `"/api/parents"`; resets selection; closes dialog; shows toast.
   * @example
   * // After calling handleDeleteParent(parent) to open dialog:
   * await deleteParent();
   */
  const deleteParent = async () => {
    if (!selectedParent) return;
    try {
      await apiRequest("DELETE", `/api/parents/${selectedParent.id}`);
      await queryClient.invalidateQueries({ queryKey: ["/api/parents"] });

      setSelectedParent(null);
      toast({
        title: "Parent deleted",
        description: "The parent has been deleted successfully.",
      });

      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete parent",
        variant: "destructive",
      });
    }
  };

  /**
   * Table column definitions for the main parents table.
   *
   * @purpose Provide ColumnDef<User>[] to DataTable for rendering columns and actions.
   * @param {ColumnDef<User>[]} parentColumns - Array of column definitions for the parents table.
   * @returns {ColumnDef<User>[]} Table column definitions.
   * @throws None.
   * @sideEffects None (data-driven UI config).
   * @example
   * <DataTable columns={parentColumns} data={parentsData} />
   */
  const parentColumns: ColumnDef<Parent>[] = [
    {
      id: "serial",
      header: "SL. No.",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const parent = row.original;
        return `${parent.firstName} ${parent.middleName} ${parent.lastName}`;
      },
    },
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded text-white ${
            row.getValue("status") === "active" ? "bg-green-500" : "bg-gray-500"
          }`}
        >
          {row.getValue("status")}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return date.toLocaleDateString();
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            size="sm"
            onClick={() => handleEditParent(row.original)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white bg-red-600 hover:bg-red-300"
            onClick={() => handleDeleteParent(row.original)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  /**
   * Prepare to delete a parent by opening the confirmation dialog.
   *
   * @param {any} data - Parent record to delete (typically row.original).
   * @purpose Select the parent to delete and show confirmation dialog.
   * @returns {void}
   * @throws None.
   * @sideEffects Updates `selectedParent` and opens `isDeleteDialogOpen`.
   * @example
   * handleDeleteParent(parentRow);
   */
  const handleDeleteParent = (data: any) => {
    setSelectedParent(data);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Prepare to edit a parent by pre-filling edit form and opening dialog.
   *
   * @param {any} data - Parent record to edit (typically row.original).
   * @purpose Populate the edit form with existing parent values and open the edit dialog.
   * @returns {void}
   * @throws None.
   * @sideEffects Updates `selectedParent`, uses `reset()` to fill form values, opens `isEditDialogOpen`.
   * @example
   * handleEditParent(parentRow);
   */
  const handleEditParent = (data: any) => {
    setSelectedParent(data);
    reset({
      first_name: data.firstName,
      middle_name: data.middleName,
      last_name: data.lastName,
      username: data.username,
      password: data.password,
      phone: data.phone,
      whatsapp_no: data.whatsappNo,
      email: data.email,
      street: data.street,
      community: data.community,
      residence_address: data.residenceAddress,
      flat_no: data.flatNo,
      status: data.status,
    });

    setIsEditDialogOpen(true);
  };

  /**
   * Auto-generate username and password when `email`, `first_name` and `last_name` are filled.
   *
   * @purpose Convenience: automatically set `username` (to email) and `password` (generated) during form entry.
   * @returns {void}
   * @throws None.
   * @sideEffects Updates form fields `username` and `password` via `setValue`.
   * @example
   * // When the user fills first_name, last_name and email, username and password are auto-created.
   * handleEditParent(parentRow);
   */
  useEffect(() => {
    const email = watch("email");
    const firstName = watch("first_name");
    const lastName = watch("last_name");

    if (email && firstName && lastName) {
      setValue("username", email);
      const generatedPassword =
        firstName.slice(0, 2).toLowerCase() +
        lastName.slice(-2).toLowerCase() +
        faker.number.int({ min: 100, max: 999 });

      setValue("password", generatedPassword);
    }
  }, [watch("email"), watch("first_name"), watch("last_name"), setValue]);

  /**
   * Reset edit form when the edit dialog is closed.
   *
   * @purpose Ensure the edit form is cleared when dialog closes to avoid stale values.
   * @returns {void}
   * @sideEffects Calls `reset()` to clear form fields.
   * @example
   * // Triggered automatically when `isEditDialogOpen` toggles to false.
   */
  useEffect(() => {
    if (!isEditDialogOpen) {
      reset({
        first_name: "",
        middle_name: "",
        last_name: "",
        username: "",
        password: "",
        phone: "",
        whatsapp_no: "",
        email: "",
        street: "",
        community: "",
        residence_address: "",
        flat_no: "",
        status: "active",
      });
    }
  }, [isEditDialogOpen, reset]);

  /**
   * Reset create form when the create dialog is closed.
   *
   * @purpose Ensure the create form is cleared when dialog closes to avoid stale values.
   * @returns {void}
   * @throws None.
   * @sideEffects Calls `reset()` to clear form fields.
   * @example
   * // Triggered automatically when `isCreateDialogOpen` toggles to false.
   */
  useEffect(() => {
    if (!isCreateDialogOpen) {
      reset({
        first_name: "",
        middle_name: "",
        last_name: "",
        username: "",
        password: "",
        phone: "",
        whatsapp_no: "",
        email: "",
        street: "",
        community: "",
        residence_address: "",
        flat_no: "",
        status: "active",
      });
    }
  }, [isCreateDialogOpen, reset]);

  return (
    <AppShell>
      {/* Appshell wraps the entire page and provides a consistent layout and navigation structure. */}

      {/*Page heading with title, description and action buttons */}
      <PageHeader
        title="Parents"
        description="Manage parents of students enrolled at Institution."
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Parent
          </Button>
        }
      />

      {/*Tabs for filtering parents */}
      {/* Tab container controlling which tab is active */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          {/* List of tab triggers */}
          <TabsTrigger value="all">All Parents</TabsTrigger>
          <TabsTrigger value="active">With Active Students</TabsTrigger>
        </TabsList>

        {/* Tabs content area, shows data according to activeTab */}
        <TabsContent value={activeTab} className="mt-6">
          <DataTable
            columns={parentColumns} // columns configuration for the parent table
            data={Array.isArray(parentsData) ? parentsData : []} // Ensure we pass an array to the table
            searchColumns={["firstName", "middleName", "lastName"]} // columns to search by
            searchPlaceholder="Search parents..." // placeholder for the search input
          />
        </TabsContent>
      </Tabs>

      {/* Dialog to view parent details */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Parent Details</DialogTitle>
            <DialogDescription>
              View comprehensive information about the parent.
            </DialogDescription>
          </DialogHeader>

          {/* Show parent details if a parent is selected */}
          {selectedParent && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="flex items-center">
                  {/* Avatar displaying parent's initials or image */}
                  <Avatar className="h-14 w-14 mr-4">
                    <AvatarFallback className="text-lg">
                      {getInitials(selectedParent.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedParent.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Parent · ID: {selectedParent.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                {/* Contact Information Card */}
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
                          <p className="text-sm text-muted-foreground">
                            {selectedParent.email || "N/A"}
                          </p>
                        </div>
                      </div>
                      {/* Phone */}
                      <div className="flex items-start">
                        <PhoneIcon className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Phone</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedParent.phone || "N/A"}
                          </p>
                        </div>
                      </div>
                      {/* Address */}
                      <div className="flex items-start">
                        <MapPinIcon className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Address</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedParent.address || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Branch Card */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold mb-3">Branch</h4>
                    <div className="space-y-3">
                      {/* Registered Branch */}
                      <div className="flex items-start">
                        <MapPinIcon className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium">
                            Registered Branch
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedParent.branch || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Children Section */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-semibold">Children</h4>
                    <Button variant="outline" size="sm">
                      <PlusCircle className="h-3.5 w-3.5 mr-1" />
                      Add Child
                    </Button>
                  </div>

                  {/* Children List */}
                  {getChildrenForParent(selectedParent.id).length > 0 ? (
                    // Check if the selected parent has children
                    <div className="space-y-3">
                      {getChildrenForParent(selectedParent.id).map(
                        (child, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-muted/50 rounded-md"
                          >
                            <div className="flex items-center">
                              {/* Child avatar */}
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback>
                                  {getInitials(
                                    `${child.firstName} ${child.lastName}`,
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                {/* Child name */}
                                <div className="font-medium">
                                  {child.firstName} {child.lastName}
                                </div>
                                {/* Child ID */}
                                <div className="text-xs text-muted-foreground">
                                  ID: {child.studentId}
                                </div>
                              </div>
                            </div>
                            {/* View Child Button */}
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    // Show this if no children are registered
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                      <Users className="h-10 w-10 mb-2 opacity-20" />
                      <p className="text-sm">No children registered</p>
                      <p className="text-xs">
                        Add children using the button above
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Container for action buttons */}
              <div className="flex justify-end space-x-3 mt-4">
                {/* Button to edit parent details */}
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog to create a new parent */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            reset(); //Reset form
          }
        }}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            {/* title */}
            <DialogTitle>Add New Parent</DialogTitle>
            {/* description */}
            <DialogDescription>
              Fill in the details to add a new parent to Institutiontution
              Management.
            </DialogDescription>
          </DialogHeader>

          {/* Form to create a new parent */}
          <form
            onSubmit={handleSubmit(handleCreateParent)}
            className="grid grid-cols-3 max-sm:grid-cols-1 gap-4"
          >
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Controller
                name={"first_name"}
                defaultValue=""
                control={control}
                render={({ field }) => <Input id="first_name" {...field} />}
              />
              {errors?.first_name && (
                <p className="text-sm text-red-500">
                  {errors.first_name?.message}
                </p>
              )}
            </div>

            {/* Middle Name */}
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>

              <Controller
                name={"middle_name"}
                defaultValue=""
                control={control}
                render={({ field }) => <Input id="middleName" {...field} />}
              />
              {errors?.middle_name && (
                <p className="text-sm text-red-500">
                  {errors.middle_name?.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>

              <Controller
                name={"last_name"}
                defaultValue=""
                control={control}
                render={({ field }) => <Input id="lastName" {...field} />}
              />

              {errors?.last_name && (
                <p className="text-sm text-red-500">
                  {errors.last_name?.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Controller
                name={"email"}
                defaultValue=""
                control={control}
                render={({ field }) => (
                  <Input id="email" {...field} type="email" />
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
                name={"username"}
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Input id="username" disabled type="text" {...field} />
                )}
              />

              {/* {errors?.username && (
                  <p className="text-sm text-red-500">
                    {errors.username?.message}
                  </p>
                )} */}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <Controller
                name={"password"}
                defaultValue=""
                control={control}
                render={({ field }) => (
                  <Input id="password" disabled type="password" {...field} />
                )}
              />
              {/* {errors?.password && (
                  <p className="text-sm text-red-500">
                    {errors.password?.message}
                  </p>
                )} */}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Controller
                defaultValue=""
                name={"phone"}
                control={control}
                render={({ field }) => <Input id="phone" {...field} />}
              />
              {errors?.phone && (
                <p className="text-sm text-red-500">{errors.phone?.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Whatsapp</Label>
              <Controller
                name={"whatsapp_no"}
                defaultValue=""
                control={control}
                render={({ field }) => <Input id="whatsapp" {...field} />}
              />

              {errors?.whatsapp_no && (
                <p className="text-sm text-red-500">
                  {errors.whatsapp_no?.message}
                </p>
              )}
            </div>

            {/* Residence Address */}
            <div className="space-y-2">
              <Label htmlFor="residence_address">Residence Address</Label>

              <Controller
                name={"residence_address"}
                defaultValue=""
                control={control}
                render={({ field }) => (
                  <Input id="residence_address" {...field} />
                )}
              />

              {errors?.residence_address && (
                <p className="text-sm text-red-500">
                  {errors.residence_address?.message}
                </p>
              )}
            </div>

            {/* Street */}
            <div className="space-y-2">
              <Label htmlFor="street">Street</Label>

              <Controller
                name={"street"}
                defaultValue=""
                control={control}
                render={({ field }) => <Input id="street" {...field} />}
              />
              {errors?.street && (
                <p className="text-sm text-red-500">{errors.street?.message}</p>
              )}
            </div>

            {/* Community */}
            <div className="space-y-2">
              <Label htmlFor="community">Community</Label>
              <Controller
                name={"community"}
                defaultValue=""
                control={control}
                render={({ field }) => <Input id="community" {...field} />}
              />
              {errors?.community && (
                <p className="text-sm text-red-500">
                  {errors.community?.message}
                </p>
              )}
            </div>

            {/* Flat No */}
            <div className="space-y-2">
              <Label htmlFor="flatNo">Flat No</Label>

              <Controller
                name={"flat_no"}
                defaultValue=""
                control={control}
                render={({ field }) => <Input id="flatNo" {...field} />}
              />

              {errors?.flat_no && (
                <p className="text-sm text-red-500">
                  {errors.flat_no?.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="flatNo">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    // id="status"
                    value={field.value}
                    onValueChange={field.onChange}
                  >
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
              {errors.status && (
                <p style={{ color: "red" }}>{errors.status.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="col-span-3 flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Add Parent</Button>
            </div>
          </form>

          {/* <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Parent</Button>
            </DialogFooter> */}
        </DialogContent>
      </Dialog>

      {/* Dialog to edit parent */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            {/* title */}
            <DialogTitle>Update Parent</DialogTitle>
            {/* description */}
            <DialogDescription>
              Fill in the details to update parent to Institutiontution
              Management.
            </DialogDescription>
          </DialogHeader>

          {/* Form to update parent */}
          <form
            onSubmit={handleSubmit(handleUpdateParent)}
            className="grid grid-cols-3 max-sm:grid-cols-1 gap-4"
          >
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Controller
                name={"first_name"}
                control={control}
                render={({ field }) => <Input id="first_name" {...field} />}
              />
              {errors?.first_name && (
                <p className="text-sm text-red-500">
                  {errors.first_name?.message}
                </p>
              )}
            </div>

            {/* Middle Name */}
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>

              <Controller
                name={"middle_name"}
                control={control}
                render={({ field }) => <Input id="middleName" {...field} />}
              />
              {errors?.middle_name && (
                <p className="text-sm text-red-500">
                  {errors.middle_name?.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>

              <Controller
                name={"last_name"}
                control={control}
                render={({ field }) => <Input id="lastName" {...field} />}
              />

              {errors?.last_name && (
                <p className="text-sm text-red-500">
                  {errors.last_name?.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Controller
                name={"email"}
                control={control}
                render={({ field }) => (
                  <Input id="email" {...field} type="email" />
                )}
              />
              {errors?.email && (
                <p className="text-sm text-red-500">{errors.email?.message}</p>
              )}
            </div>

            {/* Username field */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>

              <Controller
                name={"username"}
                control={control}
                render={({ field }) => (
                  <Input id="username" type="text" disabled {...field} />
                )}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <Controller
                name={"password"}
                control={control}
                render={({ field }) => (
                  <Input id="password" disabled type="password" {...field} />
                )}
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Controller
                name={"phone"}
                control={control}
                render={({ field }) => <Input id="phone" {...field} />}
              />
              {errors?.phone && (
                <p className="text-sm text-red-500">{errors.phone?.message}</p>
              )}
            </div>

            {/* Whatsapp */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Whatsapp</Label>
              <Controller
                name={"whatsapp_no"}
                control={control}
                render={({ field }) => <Input id="whatsapp" {...field} />}
              />

              {errors?.whatsapp_no && (
                <p className="text-sm text-red-500">
                  {errors.whatsapp_no?.message}
                </p>
              )}
            </div>

            {/* Residence Address */}
            <div className="space-y-2">
              <Label htmlFor="residence_address">Residence Address</Label>

              <Controller
                name={"residence_address"}
                control={control}
                render={({ field }) => (
                  <Input
                    id="residence_address"
                    {...field}
                    placeholder="Enter address"
                  />
                )}
              />

              {errors?.residence_address && (
                <p className="text-sm text-red-500">
                  {errors.residence_address?.message}
                </p>
              )}
            </div>

            {/* Street */}
            <div className="space-y-2">
              <Label htmlFor="street">Street</Label>

              <Controller
                name={"street"}
                control={control}
                render={({ field }) => (
                  <Input id="street" {...field} placeholder="Enter street" />
                )}
              />
              {errors?.street && (
                <p className="text-sm text-red-500">{errors.street?.message}</p>
              )}
            </div>

            {/* Community */}
            <div className="space-y-2">
              <Label htmlFor="community">Community</Label>
              <Controller
                name={"community"}
                control={control}
                render={({ field }) => <Input id="community" {...field} />}
              />
              {errors?.community && (
                <p className="text-sm text-red-500">
                  {errors.community?.message}
                </p>
              )}
            </div>

            {/* Flat No */}
            <div className="space-y-2">
              <Label htmlFor="flatNo">Flat No</Label>

              <Controller
                name={"flat_no"}
                control={control}
                render={({ field }) => <Input id="flatNo" {...field} />}
              />

              {errors?.flat_no && (
                <p className="text-sm text-red-500">
                  {errors.flat_no?.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="flatNo">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    // id="status"
                    value={field.value}
                    onValueChange={field.onChange}
                  >
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
              {errors.status && (
                <p style={{ color: "red" }}>{errors.status.message}</p>
              )}
            </div>

            {/* Cancel and Update buttons */}
            <div className="col-span-3 flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Parent</Button>
            </div>
          </form>

          {/* <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Parent</Button>
            </DialogFooter> */}
        </DialogContent>
      </Dialog>

      {/* Delete Parent Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        {/* Dialog content */}
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete Parent</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this parent? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {/* Action buttons to delete parent */}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteParent}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
