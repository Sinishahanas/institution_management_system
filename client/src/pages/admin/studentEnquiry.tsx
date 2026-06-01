import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import ReactSelect from "react-select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    UserPlus
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Student, InsertStudent, User, Branch } from "@shared/schema";
import { format } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";


/**
 * StudentFormData — Type for student form input fields.
 *
 * @purpose Defines form data structure for creating or editing a student.
 * 
 * @param None
 * @returns None
 * @throws None
 * @sideEffects None
 */
interface StudentFormData extends Omit<InsertStudent, 'age' | 'branch' | 'course' | 'parentId'> {
    age?: string;
    course?: string | undefined;
    branch?: string | undefined;
    parentId?: number;
    isReRegistering?: string;
    registrationFee?: string;
    registrationDate?: string;
}

/**
 * StudentEnquiry — React component for managing student enquiries.
 *
 * @purpose 
 * - Displays a list of not-joined students, allows creating, viewing, and editing students.
 * - Provides form state and dialog controls for student management.
 *
 * @param None
 * @returns {JSX.Element} The rendered student enquiry interface.
 * @throws None
 * @sideEffects
 * - Fetches students, users, courses, and branches via React Query.
 * - Uses useToast for notifications.
 * - Updates URL to remove `openDialog` parameter if present.
 *
 * @example
 * <StudentEnquiry />
 */
export default function StudentEnquiry() {
    // =============================
    // State and hooks
    // =============================
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [dialogExtraInfo, setDialogExtraInfo] = useState<{ courseNames: string; branchNames: string } | null>(null);
    const [activeTab, setActiveTab] = useState("all");
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Form state for creating a new student
    const [formData, setFormData] = useState<StudentFormData>({
        studentId: "",
        firstName: "",
        middleName: "",
        lastName: "",
        dateOfBirth: "",
        age: "",
        gender: "",
        email: "",
        phone: "",
        whatsappNo: "",
        street: "",
        community: "",
        residenceAddress: "",
        flatNo: "",
        status: "not_joined",
        parentId: 0,
        isReRegistering: "yes",
        registrationFee: "0",
        registrationDate: new Date().toISOString().split('T')[0],
        course: "",
        branch: "",
    });

    /**
     * Fetches students who have not joined using React Query.
     *
     * @purpose Retrieve a list of students from the `/api/students/not-joined` endpoint.
     *
     * @param None
     * @returns {Object} React Query result object
     * @returns {Student[]} returns.data - Array of students (empty array by default if no data).
     * @returns {boolean} returns.isLoading - Loading state while fetching.
     * @throws {Error} Throws if the fetch request fails (non-OK response).
     * @sideEffects Initiates a network request to `/api/students/not-joined`.
     *
     * @example
     * const { data: students = [], isLoading } = useQuery<Student[]>({
     *   queryKey: ["/api/students/not-joined"],
     *   queryFn: async () => {
     *     const res = await fetch("/api/students/not-joined");
     *     if (!res.ok) throw new Error("Failed to fetch students");
     *     return res.json();
     *   },
     * });
     */
    const { data: students = [], isLoading } = useQuery<Student[]>({
        queryKey: ["/api/students/not-joined"],
        queryFn: async () => {
            const res = await fetch("/api/students/not-joined");
            if (!res.ok) throw new Error("Failed to fetch students");
            return res.json();
        },
    });

    /**
     * @purpose Fetches all users for parent selection.
     *
     * @param None
     * @returns {Object} React Query result object
     * @returns {User[]} returns.data - Array of users (empty array by default if no data).
     * @throws None
     * @sideEffects Initiates a network request to `/api/users`.
     *
     * @example
     * const { data: users = [] } = useQuery<User[]>({
     *   queryKey: ["/api/users"],
     * });
     */
    const { data: users = [] } = useQuery<User[]>({
        queryKey: ["/api/users"],
    });

    /**
     * @purpose Fetches all courses.
     *
     * @param None
     * @returns {Object} React Query result object
     * @returns {any[]} returns.data - Array of courses (empty array by default if no data).
     * @throws None
     * @sideEffects Initiates a network request to `/api/courses`.
     *
     * @example
     * const { data: courses = [] } = useQuery<any[]>({
     *   queryKey: ["/api/courses"],
     * });
     */
    const { data: courses = [] } = useQuery<any[]>({
        queryKey: ["/api/courses"],
    });


    /**
     * @purpose Fetches all branches.
     *
     * @param None
     * @returns {Object} React Query result object
     * @returns {Branch[]} returns.data - Array of branches (empty array by default if no data).
     * @throws None
     * @sideEffects Initiates a network request to `/api/branches`.
     *
     * @example
     * const { data: branches = [] } = useQuery<Branch[]>({
     *   queryKey: ["/api/branches"],
     * });
     */
    const { data: branches = [] } = useQuery<Branch[]>({
        queryKey: ["/api/branches"],
    });


    /**
     * @purpose Filter all users to return only parents for dropdown selection.
     *
     * @param {User[]} users - Array of users to filter.
     * @returns {User[]} Array of users with role 'parent'.
     * @throws None
     * @sideEffects None
     *
     * @example
     * const parents = users.filter((user: User) => user.role === "parent");
     */
    const parents = users.filter((user: any) => user.role === "parent");


    /**
     * @purpose Generates the next sequential student ID.
     *
     * @param None
     * @returns {string} The generated student ID (e.g., "ST-01").
     * @throws None
     * @sideEffects None
     *
     * @example
     * const newId = generateStudentId(); // "ST-12"
     */
    const generateStudentId = () => {
        const prefix = "ST";

        // Get existing student IDs that start with the prefix
        const existingIds = students
            ?.filter(student => student.studentId?.startsWith(prefix))
            .map(student => {
                const numericPart = student.studentId?.split("-")[1];
                return numericPart ? parseInt(numericPart) : 0;
            })
            .filter(num => !isNaN(num));

        // Default to 1 if no existing IDs
        let nextNumber = 1;

        if (existingIds && existingIds.length > 0) {
            const highestNumber = Math.max(...existingIds);
            nextNumber = highestNumber + 1;
        }

        // Pad number with leading zeros (e.g., 01, 02, ..., 10, 11, ...)
        const paddedNumber = String(nextNumber).padStart(2, "0");

        return `${prefix}-${paddedNumber}`;
    };

    /**
     * @purpose Opens the create dialog if URL contains `openDialog=create`.
     *
     * @param None
     * @returns None
     * @throws None
     * @sideEffects
     * - Opens create student dialog.
     * - Updates browser URL to remove query parameter.
     *
     * @example
     * // If URL is /students?openDialog=create
     * // The create dialog will open automatically.
     */
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('openDialog') === 'create') {
            setIsCreateDialogOpen(true);
            // Remove the query parameter
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);


    /**
     * @purpose Auto-generate student ID when create dialog opens.
     *
     * @param None
     * @returns None
     * @throws None
     * @sideEffects Updates formData.studentId
     *
     * @example
     * // Opens create dialog -> studentId is generated automatically.
     */
    useEffect(() => {
        if (isCreateDialogOpen) {
            const newId = generateStudentId();
            setFormData(prev => ({ ...prev, studentId: newId }));
        }
    }, [isCreateDialogOpen]);

    /**
     * @purpose calculateAge — Calculates age from date of birth.
     *
     * @params
     * - dateOfBirth {string} — Date of birth in YYYY-MM-DD format.
     * @returns {string} Age in years as string.
     * @throws None
     * @sideEffects None
     *
     * @example
     * const age = calculateAge("2005-05-01"); // "18"
     */
    const calculateAge = (dateOfBirth: string) => {
        if (!dateOfBirth) return "";
        const dob = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        return age.toString();
    };


    /**
     * @purpose handleDateOfBirthChange — Updates date of birth and auto-calculates age.
     *
     * @params
     * - e {React.ChangeEvent<HTMLInputElement>} — Input change event
     * @returns None
     * @throws None
     * @sideEffects Updates formData.dateOfBirth and formData.age
     *
     * @example
     * <input type="date" onChange={handleDateOfBirthChange} />
     */
    const handleDateOfBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dob = e.target.value;
        setFormData(prev => ({
            ...prev,
            dateOfBirth: dob,
            age: calculateAge(dob)
        }));
    };

    /**
     * @purpose handleFieldChange — Updates a specific form field.
     *
     * @params
     * - field {string} — Field name
     * - value {string} — Field value
     * @returns None
     * @throws None
     * @sideEffects Updates formData and recalculates age if dateOfBirth changes
     *
     * @example
     * handleFieldChange("firstName", "John");
     */
    const handleFieldChange = (field: string, value: string) => {
        setFormData(prev => {
            const updates: Partial<StudentFormData> = { [field]: value };

            // Calculate age when date of birth changes
            if (field === 'dateOfBirth' && value) {
                updates.age = calculateAge(value).toString();
            }

            return { ...prev, ...updates };
        });
    };

    /**
     * @purpose handleCourseChange — Updates selected course in formData.
     *
     * @params
     * - value {string} — Selected course ID
     * @returns None
     * @throws None
     * @sideEffects Updates formData.course
     *
     * @example
     * handleCourseChange("course-001");
     */
    const handleCourseChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            course: value,
        }));
    };

    /**
     * @purpose 
     * - Mutation to create a new student record.
     * 
     * @param {StudentFormData} data - The student form data to be submitted.
     * @returns {Promise<Student>} Resolves with the created student object from the API.
     * @throws {Error} Throws an error if the API request fails.
     * @sideEffects
     * - Sends a POST request to `/api/students` with the student data.
     * - Invalidates the `["/api/students/not-joined"]` query to refetch the list.
     * - Updates local component state by closing the create dialog and resetting the form.
     * - Displays success or error toast messages.
     *
     * @example
     * createStudentMutation.mutate({
     *   studentId: "ST-01",
     *   firstName: "John",
     *   lastName: "Doe",
     *   dateOfBirth: "2005-06-15",
     *   age: "18",
     *   gender: "Male",
     *   email: "john@example.com",
     *   phone: "1234567890",
     *   parentId: 1,
     *   registrationFee: "100.00",
     *   registrationDate: "2025-10-03",
     *   course: 2,
     *   branch: 1,
     *   ....
     * });
     */
    const createStudentMutation = useMutation({
        mutationFn: async (data: StudentFormData) => {
            // Create student record
            const studentData: InsertStudent = {
                ...data,
                // userId: userData.id,
                age: parseInt(data.age || "0"),
                dateOfBirth: data.dateOfBirth || "",
                registrationFee: data.registrationFee || "0.00",
                registrationDate: data.registrationDate || new Date().toISOString().split('T')[0],
                parentId: data.parentId ?? 0,
                status: "not_joined",
                course: data.course,
                branch: data.branch,
            };

            const studentResponse = await apiRequest("POST", "/api/students", studentData);
            const student = await studentResponse.json();

            return student;
        },
        onSuccess: async (student) => {
            queryClient.invalidateQueries({ queryKey: ["/api/students/not-joined"] });
            setIsCreateDialogOpen(false);

            // Show success toast
            toast({
                title: "Success",
                description: "Student created successfully",
            });

            // Reset form data
            setFormData({
                studentId: "",
                firstName: "",
                middleName: "",
                lastName: "",
                dateOfBirth: "",
                age: "",
                gender: "",
                email: "",
                phone: "",
                whatsappNo: "",
                parentId: 0,
                street: "",
                community: "",
                residenceAddress: "",
                flatNo: "",
                registrationFee: "",
                registrationDate: new Date().toISOString().split('T')[0],
                course: undefined,
                branch: undefined,
            });
            toast({
                title: "Success",
                description: "Student created successfully",
            });
            queryClient.invalidateQueries({ queryKey: ['allEnquiriesData'] });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to create student",
                variant: "destructive",
            });
        },
    });


    /**
     * @purpose Mutation to update an existing student.
     * Uses `useMutation` from React Query to update a student record via a PUT request.
     * Updates the query cache and shows toast notifications on success or error.
     *
     * @param {Object} param0
     * @param {number} param0.id - The ID of the student to update.
     * @param {Partial<Student>} param0.data - Partial student data to update.
     * @returns {Promise<Student>} Resolves with the updated student object.
     * @throws {Error} Throws an error if the API request fails.
     * @sideEffects
     * - Sends a PUT request to `/api/students/${id}`.
     * - Invalidates the `["/api/students"]` query.
     * - Closes the edit dialog on success.
     * - Displays toast notifications on success or failure.
     *
     * @example
     * updateStudentMutation.mutate({
     *   id: 1,
     *   data: { firstName: "Jane", lastName: "Doe" }
     * });
     */
    const updateStudentMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number, data: Partial<Student> }) => {
            const res = await apiRequest("PUT", `/api/students/${id}`, data);
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/students"] });
            setIsEditDialogOpen(false);
            toast({
                title: "Success",
                description: "Student updated successfully",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: `Failed to update student: ${error.message}`,
                variant: "destructive",
            });
        }
    });

    /**
     * @purpose handleViewStudent — Opens a dialog to view student details.
     *
     * @params
     * - student {Student} — The student object to view
     * @returns None
     * @throws None
     * @sideEffects
     * - Sets selectedStudent state with formatted course and branch names
     * - Opens the view student dialog
     *
     * @example
     * handleViewStudent(studentObject);
     */
    const handleViewStudent = (student: Student) => {
        const courseIds = student.course ? student.course.toString().split(',') : [];
        const courseNames = courseIds
            .map(id => courses.find(c => c.id === Number(id))?.name)
            .filter(name => name)
            .join(", ");

        const branchIds = student.branch ? student.branch.toString().split(',') : [];
        const branchNames = branchIds
            .map(id => branches.find(b => b.id === Number(id))?.name)
            .filter(name => name)
            .join(", ");

        const registrationFee = student.registrationFee;

        // Set the selected student with updated information
        setSelectedStudent({
            ...student,
            registrationFee: registrationFee,
        });

        setIsViewDialogOpen(true);
        setDialogExtraInfo({ courseNames, branchNames });
    };

    /**
     * @purpose handleEditStudent — Opens edit dialog and populates form with student data.
     *
     * @param {Student} student - The student object to edit.
     * @returns None
     * @throws None
     * @sideEffects
     * - Sets selectedStudent state
     * - Populates formData with student information
     * - Opens edit student dialog
     *
     * @example
     * handleEditStudent(studentObject);
     */
    const handleEditStudent = (student: Student) => {
        setSelectedStudent(student);
        setFormData({
            studentId: student.studentId,
            firstName: student.firstName,
            middleName: student.middleName || "",
            lastName: student.lastName,
            dateOfBirth: student.dateOfBirth || "",
            age: student.age?.toString() || "",
            gender: student.gender || "",
            email: student.email || "",
            phone: student.phone || "",
            whatsappNo: student.whatsappNo || "",
            street: student.street || "",
            community: student.community || "",
            residenceAddress: student.residenceAddress || "",
            flatNo: student.flatNo || "",
            status: student.status,
            parentId: student.parentId,
            registrationFee: student.registrationFee || "",
            registrationDate: student.registrationDate || "",
            course: student.course?.toString() || "",
            branch: student.branch?.toString() || "",
        });
        setIsEditDialogOpen(true);
    };

    
    /**
     * @purpose handleSubmit — Handles form submission for creating a student.
     *
     * @param {React.FormEvent} e - The form submission event.
     * @returns {Promise<void>}
     * @throws None
     * @sideEffects
     * - Validates required fields
     * - Shows toast notifications for validation errors
     * - Calls createStudentMutation.mutateAsync to create student
     *
     * @example
     * <form onSubmit={handleSubmit}></form>
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.firstName || !formData.lastName) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        if (!formData.dateOfBirth) {
            toast({
              title: "Error",
              description: "Please choose date of birth",
              variant: "destructive",
            });
            return;
          }
      
          if (!formData.phone) {
            toast({
              title: "Error",
              description: "Please enter phone number",
              variant: "destructive",
            });
            return;
          }
      
          if (!formData.branch) {
            toast({
              title: "Error",
              description: "Please select at least one branch",
              variant: "destructive",
            });
            return;
          }
          if (!formData.course) {
            toast({
              title: "Error",
              description: "Please select at least one course",
              variant: "destructive",
            });
            return;
          }

        try {
            await createStudentMutation.mutateAsync(formData);
        } catch (error) {
            console.error("Failed to create student:", error);
        }
    };

    /**
     * @purpose handleEditStudentSubmit — Handles form submission for editing a student.
     *
     * @param {React.FormEvent} e — Form submit event
     * @returns {void}
     * @throws None
     * @sideEffects
     * - Calls updateStudentMutation.mutate to update student record
     *
     * @example
     * <form onSubmit={handleEditStudentSubmit}></form>
     */
    const handleEditStudentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStudent) {
            updateStudentMutation.mutate({
                id: selectedStudent.id,
                data: {
                    ...formData,
                    age: Number(formData.age || 0),
                }
            });
        }
    };

    const [, setLocation] = useLocation();

    /**
     * @purpose handlePrintInvoice — Navigates to invoice print page.
     *
     * @params
     * - invoiceId {string} — ID of the invoice to print
     * @returns None
     * @throws None
     * @sideEffects Updates URL location to print page
     *
     * @example
     * handlePrintInvoice("INV-001");
     */
    const handlePrintInvoice = (invoiceId: string) => {
        setLocation(`/admin/print-invoice/${invoiceId}`);
    };

    /**
     * @purpose filteredStudents — Filters students based on the active tab (status).
     *
     * @param None (uses `students` and `activeTab` state)
     * @returns {Student[]} Array of filtered students
     * @throws None
     * @sideEffects None
     *
     * @example
     * const activeStudents = filteredStudents;
     */
    const filteredStudents = students.filter((student: Student) => {
        if (activeTab === "all") return true;
        return student.status === activeTab;
    });

    
    /**
     * @purpose columns — Defines the columns for the student table.
     *
     * @param None
     * @returns {ColumnDef<Student>[]} Array of column definitions for use in a table component
     * @throws None
     * @sideEffects None
     *
     * @example
     * <DataTable columns={columns} data={filteredStudents} />
     */
    const columns: ColumnDef<Student>[] = [
        {
            id: "serial",
            header: "SL.No.",
            cell: ({ table, row }) => {
                const sortedRows = table.getSortedRowModel().rows;
                const index = sortedRows.findIndex(r => r.id === row.id);
                return <div>{index + 1}</div>;
            },
            enableSorting: false,
        },
        {
            accessorKey: "studentId",
            header: ({ column }) => {
                return (
                    <div
                        className="cursor-pointer select-none flex items-center gap-1"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Student ID
                        {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
                    </div>
                );
            },
            sortingFn: (rowA, rowB) => {
                const a = rowA.original.studentId || '';
                const b = rowB.original.studentId || '';
                return b.localeCompare(a); // Descending order
            }
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => {
                const student = row.original;
                return `${student.firstName} ${student.middleName} ${student.lastName}`;
            },
        },
        {
            accessorKey: "dateOfBirth",
            header: "Date of Birth",
            cell: ({ row }) => {
                const dateOfBirth = row.original.dateOfBirth;
                if (!dateOfBirth) return "-";
                const date = new Date(dateOfBirth);
                return format(date, "MMM dd, yyyy");
            },
        },
        {
            accessorKey: "gender",
            header: "Gender",
            cell: ({ row }) => {
                const gender = row.original.gender;
                return gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : "-";
            },
        },
        {
            accessorKey: "branches",
            header: "Branches",
            cell: ({ row }) => {
                const student = row.original;
                const branchIds = student.branch ? student.branch.toString().split(',') : [];
                if (branchIds.length === 0) return "-";

                const branchNames = branchIds
                    .map(id => branches.find(b => b.id === Number(id))?.name)
                    .filter(name => name)
                    .join(", ");

                return branchNames || "-";
            },
        },
        {
            accessorKey: "course",
            header: "Courses",
            cell: ({ row }) => {
                const student = row.original;
                const courseIds = student.course ? student.course.toString().split(',') : [];
                if (courseIds.length === 0) return "-";

                const courseNames = courseIds
                    .map(id => courses.find(c => c.id === Number(id))?.name)
                    .filter(name => name)
                    .join(", ");

                return courseNames || "-";
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                let badgeVariant: "default" | "outline" | "secondary" = "outline";

                if (status === "active") {
                    badgeVariant = "default";
                } else if (status === "inactive") {
                    badgeVariant = "secondary";
                } else if (status === "alumni") {
                    badgeVariant = "outline";
                }

                return (
                    status && (
                        <Badge variant={badgeVariant}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                    )
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const student = row.original;

                return (
                    <div className="flex space-x-2">
                        <Button
                            variant="ghost"
                            className="bg-gray-500 hover:bg-gray-600 text-white"
                            size="sm"
                            onClick={() => handleViewStudent(student)}
                            title="View Details"
                        >
                            View
                        </Button>
                        <Button
                            variant="ghost"
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                            size="sm"
                            onClick={() => handleEditStudent(student)}
                        >
                            Edit
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        // Appshell component used for layout with header, sidebar and footer
        <AppShell>
            {/* Page Head with title and action button */}
            <PageHeader
                title="Student Enquiry"
                // description="New Student Enquiry"
                actions={
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        New
                    </Button>
                }
            />

            {/* Student Enquiry Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                <TabsList>
                    <TabsTrigger value="all">All Students</TabsTrigger>
                    {/* <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Discontinued</TabsTrigger>
                    <TabsTrigger value="alumni">Outbreak</TabsTrigger> */}
                </TabsList>

                {/* Student Enquiry Table */}
                <TabsContent value={activeTab} className="mt-6">
                    <DataTable
                        columns={columns} // Student Enquiry Table Columns
                        data={filteredStudents} // Student Enquiry Table Data
                        searchColumns={["firstName","middleName","lastName", "studentId"]} // Student Enquiry Table Search Columns
                        searchPlaceholder="Search by name..." // Student Enquiry Table Search Placeholder
                        initialSorting={[
                            {
                                id: "studentId",
                                desc: true
                            }
                        ]} // Student Enquiry Table Initial Sorting
                    />
                </TabsContent>
            </Tabs>

            {/* Student View Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Student Details</DialogTitle>
                        <DialogDescription>
                            Comprehensive information about the student.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {/* Render only if a student is selected */}
                    {selectedStudent && (
                        <div className="space-y-6">
                            {/* Header with Student Name and Status */}
                            <div className="flex justify-between items-start border-b pb-4">
                                <div>
                                    {/* Display full student name */}
                                    <h3 className="text-xl font-semibold">
                                        {selectedStudent.firstName} {selectedStudent.middleName} {selectedStudent.lastName}
                                    </h3>
                                    {/* Display student ID */}
                                    <p className="text-sm text-neutral-500 font-bold">Student ID: {selectedStudent.studentId}</p>
                                </div>
                                {/* Badge showing student status with variant based on status */}
                                <Badge variant={selectedStudent.status === "active" ? "default" : (selectedStudent.status === "inactive" ? "secondary" : "outline")}>
                                    {/* Capitalize first letter of status */}
                                    {selectedStudent?.status ? selectedStudent.status.charAt(0).toUpperCase() + selectedStudent?.status?.slice(1) : "-"}
                                </Badge>
                            </div>

                            {/* Main Content Grid: 2 columns for Personal & Address info */}
                            <div className="grid grid-cols-2 gap-6">
                                {/* Personal Information card */}
                                <Card>
                                    <CardContent className="p-4">
                                        {/* Card header */}
                                        <h4 className="text-sm font-semibold mb-3">Personal Information</h4>
                                        <div className="space-y-2">
                                            {/* Map over personal info fields */}
                                            <div className="flex justify-between">
                                                {/* Date of Birth */}
                                                <span className="text-sm text-neutral-500">Date of Birth</span>
                                                <span className="text-sm">
                                                    {selectedStudent.dateOfBirth
                                                        ? format(new Date(selectedStudent.dateOfBirth), "MMM dd, yyyy")
                                                        : "-"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                {/* Age */}
                                                <span className="text-sm text-neutral-500">Age</span>
                                                <span className="text-sm">{selectedStudent.age || "-"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                {/* Gender */}
                                                <span className="text-sm text-neutral-500">Gender</span>
                                                <span className="text-sm">{selectedStudent.gender ? selectedStudent.gender.charAt(0).toUpperCase() + selectedStudent.gender.slice(1) : "-"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                {/* Email */}
                                                <span className="text-sm text-neutral-500">Email</span>
                                                <span className="text-sm">{selectedStudent.email || "-"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                {/* Phone */}
                                                <span className="text-sm text-neutral-500">Phone</span>
                                                <span className="text-sm">{selectedStudent.phone || "-"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                {/* WhatsApp */}
                                                <span className="text-sm text-neutral-500">WhatsApp</span>
                                                <span className="text-sm">{selectedStudent.whatsappNo || "-"}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Address Information */}
                                <Card>
                                    <CardContent className="p-4">
                                        <h4 className="text-sm font-semibold mb-3">Address Information</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                {/* Residence */}
                                                <span className="text-sm text-neutral-500">Residence</span>
                                                <span className="text-sm">{selectedStudent.residenceAddress || "-"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                {/* Street */}
                                                <span className="text-sm text-neutral-500">Street</span>
                                                <span className="text-sm">{selectedStudent.street || "-"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                {/* Community */}
                                                <span className="text-sm text-neutral-500">Community</span>
                                                <span className="text-sm">{selectedStudent.community || "-"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                {/* Flat No */}
                                                <span className="text-sm text-neutral-500">Flat No</span>
                                                <span className="text-sm">{selectedStudent.flatNo || "-"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                {/* Course */}
                                                <span className="text-sm text-neutral-500">Course</span>
                                                <span className="text-sm">{dialogExtraInfo?.courseNames || "-"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                {/* Branch */}
                                                <span className="text-sm text-neutral-500">Branch</span>
                                                <span className="text-sm">{dialogExtraInfo?.branchNames || "-"}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create Student Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                {/* Dialog Content */}
                <DialogContent className="sm:max-w-[1400px] max-h-[90vh] flex flex-col gap-4">
                    {/* <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 p-0 rounded-none flex flex-col gap-4"> */}
                    <DialogHeader className="flex flex-row items-center justify-between gap-4">
                        <div>
                            {/* Dialog Title */}
                            <DialogTitle>Create New Student</DialogTitle>
                            {/* Dialog Description */}
                            <DialogDescription>
                                Fill in the student details below
                            </DialogDescription>
                        </div>
                        <div className="flex items-center w-1/3">
                            {/* Student ID */}
                            <Label htmlFor="studentId" className="whitespace-nowrap font-semibold text-lg">Student ID :</Label>
                            <div
                                id="studentId"
                                className="flex-1 px-3 py-2 text-gray-700 font-bold"
                            >
                                {formData.studentId}
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto">
                        <form onSubmit={handleSubmit}>
                            {/* <div className="space-y-4"> */}
                            <div className="grid grid-cols-5 gap-4 pb-4 pl-2">
                                <div className="space-y-4 pt-4">
                                    {/* New registration? */}
                                    <Label htmlFor="isReRegistering">New registration?</Label>
                                    <select
                                        id="isReRegistering"
                                        name="isReRegistering"
                                        value={formData.isReRegistering}
                                        onChange={(e) =>
                                            handleFieldChange('isReRegistering', e.target.value)
                                        }
                                        className="bg-gray-100 p-2 rounded"
                                    >
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    {/* Registration Date */}
                                    <Label htmlFor="registrationDate">Registration Date</Label>
                                    <Input
                                        type="date"
                                        id="registrationDate"
                                        name="registrationDate"
                                        value={formData.registrationDate}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            registrationDate: e.target.value,
                                        })}
                                        required
                                        // readOnly
                                        // disabled
                                        className="bg-gray-100"
                                    />
                                </div>

                                {/* Show Registration Fee input only if NOT re-registering */}
                                {formData.isReRegistering === "yes" && (
                                    <div className="space-y-2">
                                        {/* Registration Fee */}
                                        <Label htmlFor="registrationFee">Registration Fee</Label>
                                        <Input
                                            type="number"
                                            id="registrationFee"
                                            name="registrationFee"
                                            value={formData.registrationFee}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    registrationFee: e.target.value,
                                                })
                                            }
                                            required
                                            className="bg-gray-100"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-5 gap-4 pb-4 pl-2 pr-2">
                                <div className="space-y-2">
                                    {/* First Name */}
                                    <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        // placeholder="Enter first name"
                                        onChange={(e) => handleFieldChange('firstName', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    {/* Middle Name */}
                                    <Label htmlFor="middleName">Middle Name</Label>
                                    <Input
                                        id="middleName"
                                        name="middleName"
                                        value={formData.middleName ?? ""}
                                        onChange={(e) => handleFieldChange('middleName', e.target.value)}
                                    // placeholder="Enter middle name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    {/* Last Name */}
                                    <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName ?? ""}
                                        // placeholder="Enter last name"
                                        onChange={(e) => handleFieldChange('lastName', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    {/* Date of Birth */}
                                    <Label htmlFor="dateOfBirth">Date of Birth <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="dateOfBirth"
                                        name="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth ?? ""}
                                        onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    {/* Age */}
                                    <Label htmlFor="age">Age</Label>
                                    <Input
                                        id="age"
                                        name="age"
                                        type="text"
                                        value={formData.age}
                                        readOnly
                                        className="bg-gray-50"
                                    // placeholder="Age will be calculated automatically"
                                    />
                                </div>
                                <div className="space-y-2">
                                    {/* Gender */}
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select
                                        name="gender"
                                        value={formData.gender ?? ""}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, gender: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    {/* Email */}
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email ?? ""}
                                        onChange={(e) => handleFieldChange('email', e.target.value)}
                                    // placeholder="Enter email address"
                                    />
                                </div>

                                <div className="space-y-2">
                                    {/* Phone Number */}
                                    <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone ?? ""}
                                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                                        required
                                    // placeholder="Enter phone number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    {/* WhatsApp Number */}
                                    <Label htmlFor="whatsappNo">WhatsApp Number</Label>
                                    <Input
                                        id="whatsappNo"
                                        name="whatsappNo"
                                        value={formData.whatsappNo ?? ""}
                                        onChange={(e) => handleFieldChange('whatsappNo', e.target.value)}
                                    // placeholder="Enter WhatsApp number"
                                    />
                                </div>
                                
                                {/* Parent */}
                                <div className="space-y-2">
                                  <Label htmlFor="parentId">Parent</Label>
                                  <Select
                                    name="parentId"
                                    value={(formData.parentId ?? "").toString()}
                                    onValueChange={(value) => {
                                      if (value === "create_new") {
                                        window.location.href = "/admin/parents?openDialog=create&from=student-enquiry";
                                        return;
                                      }
                                      setFormData({ ...formData, parentId: parseInt(value) || 0 });
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select parent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {parents.map((parent: any) => (
                                        <SelectItem key={parent.id} value={parent.id.toString()}>
                                          {parent.fullName}
                                        </SelectItem>
                                      ))}
                                      
                                      {/* Divider and Create New option */}
                                      <div className="border-t my-1" />
                                      <SelectItem value="create_new" className="text-blue-600 hover:bg-blue-50 cursor-pointer">
                                        + Create New Parent
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Residence Address */}
                                <div className="space-y-2">
                                    <Label htmlFor="residenceAddress">Residence Address</Label>
                                    <Input
                                        id="residenceAddress"
                                        name="residenceAddress"
                                        value={formData.residenceAddress ?? ""}
                                        onChange={(e) => handleFieldChange('residenceAddress', e.target.value)}
                                    // placeholder="Enter residence address"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="street">Street</Label>
                                    <Input
                                        id="street"
                                        name="street"
                                        value={formData.street ?? ""}
                                        onChange={(e) => handleFieldChange('street', e.target.value)}
                                    // placeholder="Enter street"
                                    />
                                </div>

                                {/* Community */}
                                <div className="space-y-2">
                                    <Label htmlFor="community">Community</Label>
                                    <Input
                                        id="community"
                                        name="community"
                                        value={formData.community ?? ""}
                                        onChange={(e) => handleFieldChange('community', e.target.value)}
                                    // placeholder="Enter community"
                                    />
                                </div>

                                {/* Flat No/ House No */}
                                <div className="space-y-2">
                                    <Label htmlFor="flatNo">Flat No/ House No</Label>
                                    <Input
                                        id="flatNo"
                                        name="flatNo"
                                        value={formData.flatNo ?? ""}
                                        onChange={(e) => handleFieldChange('flatNo', e.target.value)}
                                    // placeholder="Enter flat number"
                                    />
                                </div>

                                {/* Branch */}
                                <div className="space-y-2">
                                    <Label htmlFor="branch"> Branch <span className="text-red-500">*</span></Label>
                                    {(() => {
                                        const options = branches.map((branch) => ({
                                            label: branch.name,
                                            value: String(branch.id),
                                        }));

                                        const selectedValues = formData.branch ? formData.branch.split(',').map(Number) : [];
                                        const selected = options.filter(opt => selectedValues.includes(parseInt(opt.value)));

                                        return (
                                            <ReactSelect
                                                className="text-sm"
                                                options={options}
                                                value={selected}
                                                onChange={(options) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        branch: options ? options.map(opt => opt.value).join(',') : ''
                                                    }));
                                                }}
                                                // placeholder="Select branch"
                                                isClearable
                                                isSearchable
                                                isMulti
                                                required
                                            />
                                        );
                                    })()}
                                </div>

                                {/* Course */}
                                <div className="space-y-2">
                                    <Label htmlFor="course">Course <span className="text-red-500">*</span></Label>
                                    {(() => {
                                        const options = courses.map((course) => ({
                                            label: course.name,
                                            value: String(course.id),
                                        }));

                                        const selectedValues = formData.course ? formData.course.split(',').map(Number) : [];
                                        const selected = options.filter(opt => selectedValues.includes(parseInt(opt.value)));

                                        return (
                                            <ReactSelect
                                                className="text-sm"
                                                options={options}
                                                value={selected}
                                                onChange={(options) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        course: options ? options.map(opt => opt.value).join(',') : ''
                                                    }));
                                                }}
                                                // placeholder="Select course"
                                                isClearable
                                                isSearchable
                                                isMulti
                                                required
                                            />
                                        );
                                    })()}
                                </div>
                            </div>
                            
                            {/* Cancel and Create buttons */}
                            <DialogFooter className="pb-4 pr-6">
                                <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-primary text-white hover:bg-primary/80" disabled={createStudentMutation.isPending}>
                                    {createStudentMutation.isPending ? "Creating..." : "Create Student"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Student Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                {/* Dialog content */}
                <DialogContent className="sm:max-w-[1400px] max-h-[90vh] flex flex-col gap-4">
                    {/* Dialog header */}
                    <DialogHeader className="flex flex-row items-center justify-between gap-4">
                        <div>
                            {/* Dialog title */}
                            <DialogTitle>Edit Student</DialogTitle>
                            {/* Dialog description */}
                            <DialogDescription>
                                Edit the student's information.
                            </DialogDescription>
                        </div>
                        <div className="flex items-center w-1/3">
                            <Label htmlFor="studentId" className="whitespace-nowrap font-semibold text-lg">Student ID :</Label>
                            <div
                                id="studentId"
                                className="flex-1 px-3 py-2 text-gray-700 font-bold"
                            >
                                {/* Student ID */}
                                {formData.studentId}
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto">
                        {selectedStudent && (
                            <form onSubmit={handleEditStudentSubmit}>
                                <div className="grid grid-cols-5 gap-4 pb-4">
                                    <div className="space-y-4 pt-4">
                                        <Label htmlFor="isReRegistering">New Registration?</Label>
                                        <select
                                            id="isReRegistering"
                                            name="isReRegistering"
                                            value={formData.isReRegistering}
                                            onChange={(e) =>
                                                handleFieldChange('isReRegistering', e.target.value)
                                            }
                                            className="bg-gray-100 p-2 rounded"
                                        >
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                    </div>

                                    {/* Registration Date */}
                                    <div className="space-y-2">
                                        <Label htmlFor="registrationDate">Registration Date</Label>
                                        <Input
                                            type="date"
                                            id="registrationDate"
                                            name="registrationDate"
                                            value={formData.registrationDate ?? ""}
                                            required
                                            readOnly
                                        />
                                    </div>

                                    {/* Registration Fee */}
                                    <div className="space-y-2">
                                        <Label htmlFor="registrationFee">Registration Fee</Label>
                                        <Input
                                            type="number"
                                            id="registrationFee"
                                            name="registrationFee"
                                            value="100"
                                            required
                                            readOnly
                                        />
                                    </div>
                                </div>

                                {/* First Name */}
                                <div className="grid grid-cols-5 gap-4 pb-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={(e) => handleFieldChange('firstName', e.target.value)}
                                            placeholder="Enter first name"
                                            required
                                        />
                                    </div>

                                    {/* Middle Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="middleName">Middle Name</Label>
                                        <Input
                                            id="middleName"
                                            name="middleName"
                                            value={formData.middleName ?? ""}
                                            onChange={(e) => handleFieldChange('middleName', e.target.value)}
                                            placeholder="Enter middle name"
                                            required
                                        />
                                    </div>
                                    
                                    {/* Last Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName ?? ""}
                                            onChange={(e) => handleFieldChange('lastName', e.target.value)}
                                            placeholder="Enter last name"
                                            required
                                        />
                                    </div>

                                    {/* Date of Birth */}
                                    <div className="space-y-2">
                                        <Label htmlFor="dateOfBirth">Date of Birth <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="dateOfBirth"
                                            name="dateOfBirth"
                                            type="date"
                                            value={formData.dateOfBirth ?? ""}
                                            onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                                        />
                                    </div>

                                    {/* Age */}
                                    <div className="space-y-2">
                                        <Label htmlFor="age">Age</Label>
                                        <Input
                                            id="age"
                                            name="age"
                                            type="text"
                                            value={formData.age}
                                            readOnly
                                            className="bg-gray-50"
                                            placeholder="Age will be calculated automatically"
                                        />
                                    </div>

                                    {/* Gender */}
                                    <div className="space-y-2">
                                        <Label htmlFor="gender">Gender</Label>
                                        <Select
                                            name="gender"
                                            value={formData.gender || ""}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, gender: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email || ""}
                                            onChange={(e) => handleFieldChange('email', e.target.value)}
                                            placeholder="Enter email address"
                                        />
                                    </div>

                                    {/* Phone Number */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={formData.phone || ""}
                                            onChange={(e) => handleFieldChange('phone', e.target.value)}
                                            placeholder="Enter phone number"
                                        />
                                    </div>

                                    {/* WhatsApp Number */}
                                    <div className="space-y-2">
                                        <Label htmlFor="whatsappNo">WhatsApp Number</Label>
                                        <Input
                                            id="whatsappNo"
                                            name="whatsappNo"
                                            value={formData.whatsappNo || ""}
                                            onChange={(e) => handleFieldChange('whatsappNo', e.target.value)}
                                            placeholder="Enter WhatsApp number"
                                        />
                                    </div>

                                    {/* Parent */}
                                    <div className="space-y-2">
                                        <Label htmlFor="parentId">Parent</Label>
                                        <Select
                                            name="parentId"
                                            value={formData.parentId?.toString() ?? ""}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, parentId: parseInt(value) })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select parent" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {parents.map((parent) => (
                                                    <SelectItem key={parent.id} value={parent.id.toString()}>
                                                        {parent.fullName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    {/* Street */}
                                    <div className="space-y-2">
                                        <Label htmlFor="street">Street</Label>
                                        <Input
                                            id="street"
                                            name="street"
                                            value={formData.street || ""}
                                            onChange={(e) => handleFieldChange('street', e.target.value)}
                                            placeholder="Enter street"
                                        />
                                    </div>

                                    {/* Community */}
                                    <div className="space-y-2">
                                        <Label htmlFor="community">Community</Label>
                                        <Input
                                            id="community"
                                            name="community"
                                            value={formData.community || ""}
                                            onChange={(e) => handleFieldChange('community', e.target.value)}
                                            placeholder="Enter community"
                                        />
                                    </div>

                                    {/* Residence Address */}
                                    <div className="space-y-2">
                                        <Label htmlFor="residenceAddress">Residence Address</Label>
                                        <Input
                                            id="residenceAddress"
                                            name="residenceAddress"
                                            value={formData.residenceAddress || ""}
                                            onChange={(e) => handleFieldChange('residenceAddress', e.target.value)}
                                            placeholder="Enter residence address"
                                        />
                                    </div>
                                    
                                    {/* Flat No/House No */}
                                    <div className="space-y-2">
                                        <Label htmlFor="flatNo">Flat No/House No</Label>
                                        <Input
                                            id="flatNo"
                                            name="flatNo"
                                            value={formData.flatNo || ""}
                                            onChange={(e) => handleFieldChange('flatNo', e.target.value)}
                                            placeholder="Enter flat number"
                                        />
                                    </div>

                                    {/* Branch */}
                                    <div className="space-y-2">
                                        <Label htmlFor="branch">Branch <span className="text-red-500">*</span></Label>
                                        {(() => {
                                            const options = branches.map((branch) => ({
                                                label: branch.name,
                                                value: String(branch.id),
                                            }));

                                            const selectedValues = formData.branch ? formData.branch.split(',').map(Number) : [];
                                            const selected = options.filter(opt => selectedValues.includes(parseInt(opt.value)));

                                            return (
                                                <ReactSelect
                                                    className="text-sm"
                                                    options={options}
                                                    value={selected}
                                                    onChange={(options) => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            branch: options ? options.map(opt => opt.value).join(',') : ''
                                                        }));
                                                    }}
                                                    // placeholder="Select branch"
                                                    isClearable
                                                    isSearchable
                                                    isMulti
                                                />
                                            );
                                        })()}
                                    </div>

                                    {/* Course */}
                                    <div className="space-y-2">
                                        <Label htmlFor="course">Course <span className="text-red-500">*</span></Label>
                                        {(() => {
                                            const options = courses.map((course) => ({
                                                label: course.name,
                                                value: String(course.id),
                                            }));

                                            const selectedValues = formData.course ? formData.course.split(',').map(Number) : [];
                                            const selected = options.filter(opt => selectedValues.includes(parseInt(opt.value)));

                                            return (
                                                <ReactSelect
                                                    className="text-sm"
                                                    options={options}
                                                    value={selected}
                                                    onChange={(options) => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            course: options ? options.map(opt => opt.value).join(',') : ''
                                                        }));
                                                    }}
                                                    // placeholder="Select course"
                                                    isClearable
                                                    isSearchable
                                                    isMulti
                                                />
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Dialog Footer - Update Student button */}
                                <DialogFooter>
                                    {/* Cancel button */}
                                    <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    {/* Update Student button */}
                                    <Button type="submit" disabled={updateStudentMutation.isPending}>
                                        {updateStudentMutation.isPending ? "Updating..." : "Update Student"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AppShell>
    );
}