import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import ReactSelect from "react-select";
import React, { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Course } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/ui/page-header";
import { capitalizeFirstLetter } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

/**
 * AdminBatches Component
 *
 * @purpose
 * - Provides an admin UI for viewing and managing batches and their enrollments.
 * - Exposes filtering controls (name, brand, course, branch, selectedBatchId) and shows enrollment details for the selected batch.
 *
 * @param {Object} props - Component props.
 * @param {string} props.activeTab - Active tab ("batches" or "enrollments").
 * @returns {JSX.Element} The rendered admin batches UI.
 * @throws {Error} If the fetch response is not OK, the queryFn throws an Error which React Query will surface.
 * @sideEffects
 * - Uses React Query to fetch backend data (`/api/batches`, `/api/brands`, `/api/courses`, `/api/branches`, `/api/departments`, `/api/enrollments/batch/:id`).
 * - Updates component state via `setFilters`.
 *
 * @example
 * ```tsx
 * // Render the AdminBatches component in an admin route
 * <AdminBatches />
 * ```
 */
export default function AdminBatches() {
  /**
   * `activeTab` - Tracks the currently active tab in the Branch Admin interface.
   *
   * @purpose Determines which tab is currently displayed to the user, e.g., "batches" or "enrollments".
   *
   * @type {string}
   * @default "batches"
   *
   * @param {string} activeTab - The currently active tab.
   * @returns {JSX.Element} The rendered admin batches UI.
   * @throws {Error} If the fetch response is not OK, the queryFn throws an Error which React Query will surface.
   * @sideEffects
   * - Uses React Query to fetch backend data (`/api/batches`, `/api/brands`, `/api/courses`, `/api/branches`, `/api/departments`, `/api/enrollments/batch/:id`).
   * - Updates component state via `setFilters`.
   *
   * @example
   * const [activeTab, setActiveTab] = useState("batches");
   * setActiveTab("enrollments"); // Switches to the enrollments tab
   */
  const [activeTab, setActiveTab] = useState("batches");

  // Filters state - add selectedBatchId here
  /**
   * @purpose Filters state used to control which batches / enrollments are displayed.
   *
   * @property {string} name - Free-text filter for batch name.
   * @property {string} brandId - Selected brand id (string).
   * @property {string} courseId - Selected course id (string).
   * @property {string} branch - Selected branch name or id.
   * @property {number|null} selectedBatchId - If set, the component will fetch enrollments for this batch.
   * @returns {Object} The filters state.
   * @throws {Error} If the fetch response is not OK, the queryFn throws an Error which React Query will surface.
   * @sideEffects
   * - Changing `filters.selectedBatchId` will trigger the enrollments query (see enrollments useQuery).
   *
   * @example
   * // Select a batch to load enrollments
   * setFilters(prev => ({ ...prev, selectedBatchId: 12 }));
   */
  const [filters, setFilters] = useState({
    name: "",
    brandId: "",
    courseId: "",
    branch: "",
    selectedBatchId: null as number | null,
  });

  /**
   * Fetch batches list via React Query.
   *
   * @purpose Retrieve batch records for filtering/scheduling UI.
   *
   * @param None
   * @returns {UseQueryResult<any[], Error>}
   * @throws React Query will surface network/fetch errors.
   * @sideEffects Performs network request to `/api/batches`.
   *
   * @example
   * const { data: batches } = useQuery({ queryKey: ['/api/batches'] });
   */
  const { data: batches = [], isLoading: isLoadingBatches } = useQuery<any[]>({
    queryKey: ["/api/batches"],
  });

  /**
   * Fetch brands list via React Query.
   *
   * @purpose Retrieve brand records for filtering/scheduling UI.
   *
   * @param None
   * @returns {UseQueryResult<any[], Error>}
   * @throws React Query will surface network/fetch errors.
   * @sideEffects Performs network request to `/api/brands`.
   *
   * @example
   * const { data: brands } = useQuery({ queryKey: ['/api/brands'] });
   */
  const { data: brands = [], isLoading: isLoadingBrands } = useQuery<any[]>({
    queryKey: ["/api/brands"],
  });

  /**
   * Fetch courses list via React Query.
   *
   * @purpose Retrieve course records for filtering/scheduling UI.
   *
   * @param None
   * @returns {UseQueryResult<Course[], Error>}
   * @throws React Query will surface network/fetch errors.
   * @sideEffects Performs network request to `/api/courses`.
   *
   * @example
   * const { data: courses } = useQuery({ queryKey: ['/api/courses'] });
   */
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<
    Course[]
  >({
    queryKey: ["/api/courses"],
  });

  /**
   * Fetches the list of branches from the API.
   *
   * @purpose
   * - Uses React Query to fetch branch data from the endpoint `/api/branches`.
   * - Provides reactive data (`branches`) and loading state (`isLoadingBranches`) for the component.
   *
   * @param {Array<any>} queryKey - The unique key identifying this query in React Query's cache.
   * @returns {UseQueryResult<any[], Error>} An object containing the fetched branches and loading state.
   * @throws {Error} Throws indirectly if the network request fails. Errors are handled by React Query.
   * @sideEffects
   * - Performs a network request to `/api/branches`.
   * - Caches the result in React Query's internal cache keyed by `["/api/branches"]`.
   *
   * @example
   * const { data: branches, isLoading: isLoadingBranches } = useQuery<any[]>({
   *   queryKey: ["/api/branches"],
   * });
   *
   * if (isLoadingBranches) return <Loader />;
   * return <BranchList branches={branches} />;
   */
  const { data: branches = [], isLoading: isLoadingBranches } = useQuery<any[]>(
    {
      queryKey: ["/api/branches"],
    },
  );

  /**
   * Fetches the list of departments from the API.
   *
   * @purpose
   * - Uses React Query to fetch department data from the endpoint `/api/departments`.
   * - Provides reactive data (`departments`) and loading state (`isLoadingDepartments`) for the component.
   *
   * @param {Array<any>} queryKey - The unique key identifying this query in React Query's cache.
   * @returns {UseQueryResult<any[], Error>} An object containing the fetched departments and loading state.
   * @throws {Error} Throws indirectly if the network request fails. Errors are handled by React Query.
   * @sideEffects
   * - Performs a network request to `/api/departments`.
   * - Caches the result in React Query's internal cache keyed by `['/api/departments']`.
   *
   * @example
   * const { data: departments, isLoading: isLoadingDepartments } = useQuery<any[]>({
   *   queryKey: ['/api/departments'],
   * });
   *
   * if (isLoadingDepartments) return <Loader />;
   * return <DepartmentList departments={departments} />;
   */
  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery<
    any[]
  >({
    queryKey: ["/api/departments"],
  });

  /**
   * Query: enrollments for a selected batch
   *
   * @purpose
   * - When `filters.selectedBatchId` is set, fetch enrollment records for that batch.
   *
   * @param (closure)
   * - filters.selectedBatchId: number | null — ID of the batch to fetch enrollments for.
   * @returns {Object[]} Array of enrollment records for the selected batch (defaults to []).
   * @throws {Error} If the fetch response is not OK, the queryFn throws an Error which React Query will surface.
   * @sideEffects
   * - Performs a GET request to `/api/enrollments/batch/:id`.
   * - React Query will cache and manage loading/error states for this data.
   *
   * @example
   * // When a user selects a batch id:
   * setFilters(prev => ({ ...prev, selectedBatchId: 5 }));
   * // React Query will run the queryFn and `enrollments` will contain the results.
   */
  const { data: enrollments = [], isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ["/api/enrollments/batch", filters.selectedBatchId],
    queryFn: async () => {
      if (!filters.selectedBatchId) return [];
      const res = await fetch(
        `/api/enrollments/batch/${filters.selectedBatchId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch enrollments");
      return res.json();
    },
    enabled: !!filters.selectedBatchId,
  });

  /**
   * Derived: sorted enrollment data
   *
   * @purpose
   * - Sort enrollments so that active (non-"inactive") records appear first, and "inactive" records are pushed to the end.
   *
   * @param - enrollments: Array<any> — The array of enrollments to sort.
   * @returns {Object[]} A shallow-copied and sorted array of enrollments.
   * @throws {Error} If the sort comparison fails, the function will throw an Error.
   * @sideEffects None (pure computation).
   *
   * @example
   * const display = sortedData;
   * // `display` will have non-inactive enrollments before inactive ones.
   */
  const sortedData = enrollments.slice().sort((a: any, b: any) => {
    if (a.status === "inactive" && b.status !== "inactive") return 1;
    if (a.status !== "inactive" && b.status === "inactive") return -1;
    return 0;
  });

  /**
   * Removes a student from a batch by deactivating their enrollment.
   *
   * @purpose
   * - Sends a PUT request to deactivate a student's enrollment in a specific batch.
   * - Updates cache via React Query and shows toast notifications for success or failure.
   *
   * @param {Object} enrollment - The enrollment object of the student to remove.
   * @param {number} enrollment.student_id - The ID of the student.
   * @param {number} enrollment.batch_id - The ID of the batch.
   * @returns {Promise<void>} Resolves when the server request completes and state is updated.
   * @throws {Error} Throws an error if the server responds with an error or student/batch ID is missing.
   * @sideEffects
   * - Sends a PUT request to `/api/enrollments/deactivate`.
   * - Shows toast notifications for success or error.
   * - Invalidates the React Query cache for `/api/enrollments/batch`.
   *
   * @example
   * // Remove a student from a batch
   * await handleRemoveStudent({ student_id: 42, batch_id: 10 });
   */
  const handleRemoveStudent = async (enrollment: any) => {
    const studentId = enrollment.student_id;
    const batchId = enrollment.batch_id;

    if (!studentId || !batchId) {
      toast({
        title: "Error",
        description: "Missing student ID or batch ID",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("/api/enrollments/deactivate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, batchId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update enrollments");
      }

      toast({
        title: "Student Removed",
        description:
          "All enrollments for this student in the batch are now inactive.",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/enrollments/batch"] });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  /**
   * React component that displays the number of students in a batch.
   *
   * @purpose Fetches the student count for a batch from the server and displays it in the table.
   *
   * @param {Object} props - Component props.
   * @param {any} props.row - The row object from the table, containing batch info.
   * @throws {Error} If the fetch response is not OK, the queryFn throws an Error which React Query will surface.
   * @returns {JSX.Element | string} A JSX element showing the count, or "Loading..." while fetching.
   * @sideEffects
   * - Sends a GET request to `/api/student-count?batchId={id}`.
   * - Updates local state `count` with the student count.
   *
   * @example
   * // Usage inside a table cell
   * <batchStrength row={row} />
   */
  const batchStrength: React.FC<{ row: any }> = ({ row }) => {
    const [count, setCount] = React.useState<number | null>(null);

    React.useEffect(() => {
      const batchId = row.original.id;
      fetch(`/api/student-count?batchId=${batchId}`)
        .then((res) => res.json())
        .then((data) => setCount(data.studentCount))
        .catch(() => setCount(0));
    }, [row.original.id]);

    return count !== null ? count : "Loading...";
  };

  /**
   * Columns configuration for the Batches table.
   *
   * @purpose
   * - Defines how each column in the Batches table should render, sort, and display data.
   * - Used with a table component like `react-table` or similar.
   *
   * @param {string} id - Unique identifier for the column (e.g., "serial").
   * @param {string | function} header - Column header text or render function for the header.
   * @param {function} cell - Function that renders the content of each cell.
   * @param {boolean} [enableSorting] - Optional flag to enable or disable sorting for this column.
   * @param {function} [sortingFn] - Optional custom sorting function for the column.
   * @returns {ColumnDef<any>[]} Array of column definitions compatible with React Table.
   * @throws {Error} If `row.original` is undefined or malformed during cell rendering.
   * @sideEffects
   * - Uses `batchStrength` component for fetching and displaying batch student count.
   * - Uses `departments` and `courses` arrays to display names instead of IDs.
   *
   * @example
   * // Usage inside a table component:
   * <Table columns={batchColumns} data={batches} />
   */
  const batchColumns: ColumnDef<any>[] = [
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
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div
            className="cursor-pointer select-none flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Batch Name
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
                ? " ↓"
                : ""}
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.name || "";
        const b = rowB.original.name || "";
        return b.localeCompare(a);
      },
    },
    {
      accessorKey: "strength",
      header: "Strength",
      cell: batchStrength,
    },
    {
      accessorKey: "branch",
      header: "Branch",
      cell: ({ row }) => <div>{row.getValue("branch")}</div>,
    },
    {
      accessorKey: "category",
      header: "Department",
      cell: ({ row }) => {
        const departmentId = parseInt(row.getValue("category") as string, 10);
        const department = departments.find((d: any) => d.id === departmentId);
        return department ? department.name : "Unknown Department";
      },
    },
    {
      accessorKey: "courseId",
      header: "Course",
      cell: ({ row }) => {
        const courseId = row.getValue("courseId") as number;
        const course = courses.find((c) => c.id === courseId);
        return course ? course.name : "Unknown Course";
      },
    },
  ];

  /**
   * Columns configuration for the Enrollments table.
   *
   * @purpose
   * - Defines the structure and behavior of each column in the Enrollments table.
   * - Used to render student data with actions like removing a student from a batch.
   *
   * @params
   * - `id` / `accessorKey`: Unique key or accessor for the column.
   * - `header`: Defines column header content; can be a string or render function.
   * - `cell`: Defines how each cell should render.
   * - `enableSorting`: Whether the column can be sorted.
   * @returns {ColumnDef<any>[]} Array of column definitions compatible with React Table.
   * @throws {Error} If `row.original` is undefined or malformed during cell rendering.
   * @sideEffects
   * - Calls `handleRemoveStudent` when the Remove button is clicked.
   * - Uses `Badge` component to visually represent student status.
   * - Accesses `row.original` for raw data like `first_name`, `status`.
   *
   * @example
   * // Usage inside a table component:
   * <Table columns={enrollmentColumns} data={enrollments} />
   */
  const enrollmentColumns: ColumnDef<any>[] = [
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
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const first = row.original.first_name || "";
        const middle = row.original.middle_name || "";
        const last = row.original.last_name || "";

        const fullName = [first, middle, last].filter(Boolean).join(" ");
        return <span>{fullName}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let badgeVariant: "default" | "destructive" | "outline" | "secondary" =
          "outline";

        if (status === "active") badgeVariant = "secondary";
        else if (status === "inactive") badgeVariant = "destructive";
        else if (status === "completed") badgeVariant = "default";

        return (
          <Badge variant={badgeVariant}>{capitalizeFirstLetter(status)}</Badge>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const status = row.original.status;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="bg-red-700 text-white"
              size="sm"
              onClick={() => handleRemoveStudent(row.original)}
              disabled={status === "inactive"}
              title={
                status === "inactive"
                  ? "Student already inactive"
                  : "Remove Student"
              }
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>
        );
      },
    },
  ];

  /**
   * Filters the list of batches based on the selected filters.
   *
   * @purpose
   * - Filters batches by name, brand, course, and branch using the provided `filters` object.
   * - Useful for displaying only relevant batches in a table or dropdown.
   *
   * @param {Array<Batch>} batches - Array of all batch objects to filter.
   * @param {Array<Branch>} branches - Array of branch objects to resolve branch names.
   * @param {Array<Course>} courses - Array of course objects to resolve brandId.
   * @param {Object} filters - Object containing filter values.
   * @param {string} [filters.name] - Filter by batch name.
   * @param {string} [filters.brandId] - Filter by brand ID (as string).
   * @param {string|number} [filters.courseId] - Filter by course ID.
   * @param {string} [filters.branch] - Filter by branch ID (as string).
   * @returns {Array<Batch>} Array of batches that match all provided filters.
   * @throws {Error} If the fetch response is not OK, the queryFn throws an Error which React Query will surface.
   * @sideEffects
   * - Uses `console.log` to output debug information for filters and filtered results.
   *
   * @example
   * const filters = { name: "Batch A", brandId: "1", courseId: "2", branch: "3" };
   * const filtered = batches.filter((batch) => { ... });
   */
  const filteredBatches = batches.filter((batch) => {
    const selectedBranch = branches.find(
      (b) => b.id.toString() === filters.branch,
    )?.name;
    const course = courses.find((c) => c.id === batch.courseId);
    const derivedBrandId = course?.brandId?.toString() || null;

    const matchesName = !filters.name || batch.name === filters.name;
    const matchesBrand = !filters.brandId || derivedBrandId === filters.brandId;
    const matchesCourse =
      !filters.courseId || batch.courseId === Number(filters.courseId);
    const matchesBranch = !filters.branch || batch.branch === selectedBranch;
    return matchesName && matchesBrand && matchesCourse && matchesBranch;
  });

  console.log("filters.brandId:", filters.brandId);
  console.log("batches:", batches);
  console.log(
    "filteredBatches:",
    batches.filter((batch) => batch.brandId?.toString() === filters.brandId),
  );

  return (
    <AppShell>
      {" "}
      {/* AppShell provides the overall layout wrapper for the page */}
      {/* PageHeader displays the page title and a description below it */}
      <PageHeader
        title="All Batches"
        description="Manage batches offered by Institution."
      />
      {/* Tabs component for tabbed interface; controlled via activeTab state */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        {/* TabsContent renders the content of the currently active tab ("batches") */}
        <TabsContent value="batches" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-2">
            {/* Batch name select - sets filters.name & selectedBatchId */}
            {/* Batch Selection dropdown */}
            <ReactSelect
              /* Shows current selected batch name or empty if none selected */
              value={
                filters.name
                  ? { label: filters.name, value: filters.name }
                  : null
              }
              onChange={(selectedOption) => {
                const batchName = selectedOption?.value || "";
                const batch = batches.find((b) => b.name === batchName);
                /* Updates the filters state when a batch is selected; stores name & ID */
                setFilters({
                  ...filters,
                  name: batchName,
                  selectedBatchId: batch ? batch.id : null,
                });
              }}
              /* Options array: first "All Batches", then unique batch names dynamically generated */
              options={[
                { label: "All Batches", value: "" },
                ...[...new Set(batches.map((b) => b.name))].map((name) => ({
                  label: name,
                  value: name,
                })),
              ]}
              /* Allows clearing the selection */
              isClearable
              placeholder="Select Batch"
              className="w-full text-sm"
            />

            {/* Brand select - sets filters.brandId */}
            {/* Brand Selection dropdown */}
            <ReactSelect
              value={
                filters.brandId
                  ? {
                      label: brands.find(
                        (b) => b.id.toString() === filters.brandId,
                      )?.name,
                      value: filters.brandId,
                    }
                  : null
              }
              onChange={(selectedOption) =>
                setFilters({ ...filters, brandId: selectedOption?.value || "" })
              }
              options={[
                { label: "All Brands", value: "" },
                ...brands.map((b) => ({
                  label: b.name,
                  value: b.id.toString(),
                })),
              ]}
              isClearable
              placeholder="Select Brand"
              className="w-full text-sm"
            />

            {/* Branch select - sets filters.branch */}
            {/* Branch Selection dropdown */}
            <ReactSelect
              value={
                filters.branch
                  ? {
                      label: branches.find(
                        (b) => b.id.toString() === filters.branch,
                      )?.name,
                      value: filters.branch,
                    }
                  : null
              }
              onChange={(selectedOption) =>
                setFilters({ ...filters, branch: selectedOption?.value || "" })
              }
              options={[
                { label: "All Branches", value: "" },
                ...branches.map((b) => ({
                  label: b.name,
                  value: b.id.toString(),
                })),
              ]}
              isClearable
              placeholder="Select Branch"
              className="w-full text-sm"
            />

            {/* Course select - sets filters.courseId */}
            {/* Course Selection dropdown */}
            <ReactSelect
              value={
                filters.courseId
                  ? {
                      label: courses.find(
                        (c) => c.id === Number(filters.courseId),
                      )?.name,
                      value: filters.courseId,
                    }
                  : null
              }
              onChange={(selectedOption) =>
                setFilters({
                  ...filters,
                  courseId: selectedOption?.value || "",
                })
              }
              options={[
                { label: "All Courses", value: "" },
                ...courses.map((c) => ({
                  label: c.name,
                  value: c.id.toString(),
                })),
              ]}
              isClearable
              placeholder="Select Course"
              className="w-full text-sm"
            />
          </div>

          {/* Batches DataTable */}
          <DataTable
            columns={batchColumns}
            data={filteredBatches}
            searchPlaceholder="Search batches..."
            initialSorting={[{ id: "name", desc: true }]}
          />

          {/* Enrollments DataTable - only if a batch is selected */}
          {filters.selectedBatchId && (
            <div className="mt-10">
              {/* Heading showing the selected batch name. If not found, defaults to empty string */}
              <h3 className="text-lg font-semibold mb-3">
                Enrollments for batch:{" "}
                {batches.find((b) => b.id === filters.selectedBatchId)?.name ||
                  ""}
              </h3>

              {/* Loading state */}
              {isLoadingEnrollments ? (
                <p>Loading enrollments...</p>
              ) : enrollments.length === 0 ? (
                <p>No enrollments found for this batch.</p>
              ) : (
                /* Conditional rendering:
                                - If enrollments are loading, show "Loading enrollments..."
                                - If no enrollments exist, show a message indicating none found
                                - Otherwise, render a DataTable with the enrollments:
                                    - columns: defined in enrollmentColumns
                                    - data: sortedData
                                    - searchPlaceholder: input placeholder for searching
                                    - initialSorting: default sorting by "name" ascending
                                */
                <DataTable
                  columns={enrollmentColumns}
                  data={sortedData}
                  searchPlaceholder="Search enrollments..."
                  initialSorting={[{ id: "name", desc: false }]}
                />
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
