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
 * BranchAdminBatches — Admin interface for managing batches in a branch.
 *
 * @purpose Display all batches, enrollments, and provide actions to filter, view, and deactivate students.
 * @param None (component uses internal state, queries, and hooks)
 * @returns {JSX.Element} React component rendering the batches and enrollment tables
 * @throws None (handles errors internally with toast notifications)
 * @sideEffects
 *   - Fetches data via `useQuery` from `/api/batches`, `/api/brands`, `/api/courses`, `/api/branches`, `/api/departments`, `/api/enrollments/batch`
 *   - Uses React state to store filters, active tab, and selections
 *   - Triggers `toast` notifications for success/error messages
 * @example
 * <BranchAdminBatches />
 */

export default function BranchAdminBatches() {
  /**
   * `activeTab` - Tracks the currently active tab in the Branch Admin interface.
   *
   * @purpose
   *   Determines which tab is currently displayed to the user, e.g., "batches" or "enrollments".
   *
   * @type {string}
   * @default "batches"
   *
   * @example
   * const [activeTab, setActiveTab] = useState("batches");
   * setActiveTab("enrollments"); // Switches to the enrollments tab
   */
  const [activeTab, setActiveTab] = useState("batches");

  // Filters state - add selectedBatchId here
  /**
   * Filters state used to control which batches / enrollments are displayed.
   *
   * @property {string} name - Free-text filter for batch name.
   * @property {string} brandId - Selected brand id (string).
   * @property {string} courseId - Selected course id (string).
   * @property {string} branch - Selected branch name or id.
   * @property {number|null} selectedBatchId - If set, the component will fetch enrollments for this batch.
   *
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
   * Fetches all enrollments for the selected batch.
   *
   * @purpose
   *   Retrieve student enrollment information for the selected batch to display in the admin interface.
   *
   * @param filters.selectedBatchId {number | null} - The currently selected batch ID.
   *
   * @returns {any[]} Array of enrollment objects for the batch.
   * @throws {Error} Throws an error if the fetch request fails.
   * @sideEffects Sets `isLoadingEnrollments` while fetching and updates automatically when `filters.selectedBatchId` changes.
   *
   * @example
   * const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery({
   *   queryKey: ["/api/enrollments/batch", filters.selectedBatchId],
   *   queryFn: async () => {
   *     if (!filters.selectedBatchId) return [];
   *     const res = await fetch(`/api/enrollments/batch/${filters.selectedBatchId}`);
   *     if (!res.ok) throw new Error("Failed to fetch enrollments");
   *     return res.json();
   *   },
   *   enabled: !!filters.selectedBatchId,
   * });
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
   * sortedData — Enrollments sorted by active/inactive status.
   *
   * @purpose Keep active students on top and inactive at bottom in the UI table.
   * @param None (derived from enrollments query)
   * @returns {any[]} Sorted array of enrollment objects
   * @throws None
   * @sideEffects None
   * @example
   * sortedData.map(e => console.log(e.name));
   */
  const sortedData = enrollments.slice().sort((a: any, b: any) => {
    if (a.status === "inactive" && b.status !== "inactive") return 1;
    if (a.status !== "inactive" && b.status === "inactive") return -1;
    return 0;
  });

  /**
   * handleRemoveStudent — Remove/deactivate a student from a batch.
   *
   * @purpose Allows branch admin to mark a student inactive in a specific batch.
   * @param {any} enrollment — Object containing student_id and batch_id
   * @returns {Promise<void>}
   * @throws Shows toast notification if studentId or batchId missing or API fails
   * @sideEffects
   *   - Updates backend via PUT `/api/enrollments/deactivate`
   *   - Invalidates enrollments query cache
   *   - Displays success/error toast
   * @example
   * handleRemoveStudent({ student_id: 1, batch_id: 101 });
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
   * batchStrength — React component to fetch and display the student count of a batch.
   *
   * @purpose Show live batch strength in batches table
   * @param {{ row: any }} props — Row object containing batch info
   * @returns {JSX.Element | string} Student count or "Loading..."
   * @throws None
   * @sideEffects Fetches data from `/api/student-count?batchId=...` and updates internal state
   * @example
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
   * batchColumns — Column definitions for the batches table.
   *
   * @purpose Configure table headers, cell rendering, and sorting behavior
   * @param None (uses queries and memoized functions)
   * @returns {ColumnDef<any>[]} Column definitions
   * @throws None
   * @sideEffects None
   * @example
   * <Table columns={batchColumns} data={filteredBatches} />
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
      header: "Batch Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
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
   * enrollmentColumns — Column definitions for enrollment table of a batch.
   *
   * @purpose Configure headers, actions, and status display for each student in batch
   * @param None (uses queries, filteredData)
   * @returns {ColumnDef<any>[]} Column definitions
   * @throws None
   * @sideEffects None
   * @example
   * <Table columns={enrollmentColumns} data={sortedData} />
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
   * filteredBatches — Filter batches by name, brandId, courseId, branch.
   *
   * @purpose Provide filtered list of batches for display in table/dropdown.
   * @param None (reads `filters` state and query data)
   * @returns {any[]} Array of filtered batches
   * @throws None
   * @sideEffects None
   * @example
   * filteredBatches.forEach(batch => console.log(batch.name));
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
