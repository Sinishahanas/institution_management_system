import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

/**
 * TeacherAttendance Component
 *
 * @purpose
 * - Displays and manages teacher attendance for a selected batch and date.
 * - Fetches batch and student data and allows marking, viewing, and saving attendance.
 *
 * @params
 * - None directly (this is a React component).
 * @returns
 * - JSX.Element: A table UI displaying students and their attendance status, with controls to select batch, date, and search students.
 * @throws
 * - Network errors from `useQuery` calls for fetching batches, students, or attendance data.
 * @sideEffects
 * - Fetches batches when the component mounts.
 * - Fetches students when `selectedBatch` changes.
 * - Fetches existing attendance when `selectedBatch` changes.
 * - Updates local state (`attendance`, `selectedDate`, `viewDate`, `searchQuery`, `isSaved`) based on user actions.
 *
 * @example
 * ```tsx
 * <TeacherAttendance />
 * ```
 */
export default function TeacherAttendance() {
  // React hooks and state for TeacherAttendance component.
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(new Date());

  /**
   * Fetches all batches assigned to the logged-in teacher.
   *
   * @purpose Retrieve the list of batches so the teacher can select one for attendance.
   * 
   * @param None (uses `user` from context for authentication).
   * @returns `any[]` - Array of batch objects.
   * @throws Network error if the fetch fails.
   * @sideEffects Triggers a fetch when the component mounts and when `user` changes.
   * 
   * @example
   * const { data: batches = [], isLoading: isLoadingBatches } = useQuery<any[]>({
   *   queryKey: ["/api/batches/teacher"],
   *   enabled: !!user,
   * });
   */
  const { data: batches = [], isLoading: isLoadingBatches } = useQuery<any[]>({
    queryKey: ["/api/batches/teacher"],
    enabled: !!user,
  });

  /**
   * Fetches students for the currently selected batch.
   *
   * @purpose Populate the student list for marking attendance.
   * 
   * @param None (relies on `selectedBatch` state).
   * @returns `any[]` - Array of student objects for the selected batch.
   * @throws Network error if the fetch fails.
   * @sideEffects Fetch occurs whenever `selectedBatch` changes.
   * 
   * @example
   * const { data: students = [], isLoading: isLoadingStudents } = useQuery<any[]>({
   *   queryKey: ["/api/students", { batchId: selectedBatch }],
   *   enabled: !!selectedBatch,
   * });
   */
  const { data: students = [], isLoading: isLoadingStudents } = useQuery<any[]>({
    queryKey: ["/api/students", { batchId: selectedBatch }],
    enabled: !!selectedBatch,
  });

  /**
   * Fetches existing attendance records for the selected batch.
   *
   * @purpose Allows the teacher to view or edit previously recorded attendance for the batch.
   * 
   * @param None (relies on `selectedBatch` state).
   * @returns `any[]` - Array of attendance objects for the batch.
   * @throws Network error if the fetch fails.
   * @sideEffects Fetch occurs whenever `selectedBatch` changes.
   * 
   * @example
   * const { data: existingAttendance = [], isLoading: isLoadingAttendance } = useQuery<any[]>({
   *   queryKey: ["/api/attendance", { batchId: selectedBatch }],
   *   enabled: !!selectedBatch,
   * });
   */
  const { data: existingAttendance = [], isLoading: isLoadingAttendance } = useQuery<any[]>({
    queryKey: ["/api/attendance", { batchId: selectedBatch }],
    enabled: !!selectedBatch,
  });


  /**
   * Effect to initialize the attendance state whenever `existingAttendance` or `students` change.
   *
   * @purpose Populate the `attendance` state with either existing attendance records or default values.
   * 
   * @param None directly; depends on `existingAttendance` and `students`.
   * @returns void
   * @throws None
   * @sideEffects Updates the `attendance` and `isSaved` states.
   * 
   * @example
   * useEffect(() => {
   *   // Populate attendance state
   * }, [existingAttendance, students]);
   */
  useEffect(() => {
    if (existingAttendance && existingAttendance.length > 0) {
      const attendanceMap: Record<string, string> = {};
      existingAttendance.forEach((record: any) => {
        attendanceMap[record.studentId.toString()] = record.status;
      });
      setAttendance(attendanceMap);
      setIsSaved(true);
    } else {
      // Initialize with empty or default values if no existing attendance
      const initialAttendance: Record<string, string> = {};
      students.forEach((student: any) => {
        initialAttendance[student.id.toString()] = "present"; // Default to present
      });
      setAttendance(initialAttendance);
      setIsSaved(false);
    }
  }, [existingAttendance, students]);

  /**
   * Filters the list of students based on the search query.
   *
   * @purpose Allow the teacher to search for students by first name, last name, or student ID.
   * 
   * @param None directly; depends on `students` and `searchQuery` state.
   * @returns Array of filtered student objects.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * const filteredStudents = students.filter(student => // search logic here
 *   student.firstName.includes('John'));
   */
  const filteredStudents = students.filter((student: any) => {
    const searchString = searchQuery.toLowerCase();
    return (
      student.firstName?.toLowerCase().includes(searchString) ||
      student.lastName?.toLowerCase().includes(searchString) ||
      student.studentId?.toLowerCase().includes(searchString)
    );
  });

  /**
   * Mutation to save attendance records to the server.
   *
   * @purpose Persist the attendance data for a batch on a specific date.
   * 
   * @param attendanceRecords - Array of objects containing studentId and status.
   * @returns Promise resolving to the server response.
   * @throws Error if the network request fails or the server returns a non-OK status.
   * @sideEffects Updates `isSaved` state and shows a toast notification on success or error.
   * 
   * @example
   * saveAttendanceMutation.mutate([
   *   { studentId: "1", status: "present" },
   *   { studentId: "2", status: "absent" }
   * ]);
   */
  const saveAttendanceMutation = useMutation({
    mutationFn: async (attendanceRecords: any[]) => {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          batchId: selectedBatch,
          date: selectedDate,
          records: attendanceRecords,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to save attendance");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Attendance saved",
        description: "The attendance has been recorded successfully.",
      });
      setIsSaved(true);
    },
    onError: () => {
      toast({
        title: "Error saving attendance",
        description: "There was a problem saving the attendance. Please try again.",
        variant: "destructive",
      });
    },
  });

  /**
   * Update the attendance status for a single student.
   *
   * @purpose Update the `attendance` state and mark the form as unsaved.
   * 
   * @param studentId - The unique ID of the student whose status is being updated.
   * @param status - The new attendance status ("present", "absent", "leave", etc.).
   * @returns void
   * @throws None
   * @sideEffects Updates the `attendance` state and sets `isSaved` to false.
   * 
   * @example
   * handleAttendanceChange("1", "absent");
   */
  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
    setIsSaved(false);
  };

  /**
   * Save the current attendance for the selected batch and date.
   *
   * @purpose Persist all attendance records to the server via `saveAttendanceMutation`.
   * 
   * @param None directly; depends on `selectedBatch`, `selectedDate`, and `attendance` state.
   * @throws If no batch is selected or if the mutation fails.
   * @returns Promise<void>
   * @sideEffects Calls the mutation, shows toast notifications, and updates `isSaved` state.
   * 
   * @example
   * await handleSaveAttendance();
   */
  const handleSaveAttendance = async () => {
    if (!selectedBatch) {
      toast({
        title: "No batch selected",
        description: "Please select a batch before saving attendance.",
        variant: "destructive",
      });
      return;
    }

    // Create attendance records to save
    const attendanceRecords = Object.entries(attendance).map(([studentId, status]) => ({
      studentId: parseInt(studentId),
      batchId: parseInt(selectedBatch),
      date: selectedDate,
      status
    }));

    await saveAttendanceMutation.mutateAsync(attendanceRecords);
  };

  /**
   * Mark all students in the current batch as present.
   *
   * @purpose Update the `attendance` state to mark all students as present and mark the form as unsaved.
   * 
   * @param None
   * @returns void
   * @throws None
   * @sideEffects Updates the `attendance` state and sets `isSaved` to false.
   * 
   * @example
   * markAllPresent();
   */
  const markAllPresent = () => {
    const newAttendance: Record<string, string> = {};
    filteredStudents.forEach((student: any) => {
      newAttendance[student.id.toString()] = "present";
    });
    setAttendance(newAttendance);
    setIsSaved(false);
  };

  /**
   * Get a badge element representing the attendance status.
   *
   * @purpose Display a visual indicator of the attendance status.
   *
   * @param status - The attendance status to display.
   * @returns JSX.Element - A badge component with the appropriate color and text.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * getStatusBadge("absent"); // Returns a red "Absent" badge
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-500">Present</Badge>;
      case "absent":
        return <Badge className="bg-red-500">Absent</Badge>;
      case "leave":
        return <Badge className="bg-yellow-500">Leave</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    // Appshell wraps the page content with header and sidebar
    <AppShell>
      {/* Page Header with title and description */}
      <PageHeader
        title="Attendance Management"
        description="Record and manage student attendance for your batches"
      />

      <div className="grid grid-cols-1 gap-6">
        {/* Attendance Management Card */}
        <Card>
          <CardContent className="p-4">
            {/* Tabs for Mark and View Attendance */}
            <Tabs defaultValue="mark" className="w-full">
              <TabsList className="mt-6">
                <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
                <TabsTrigger value="view">View Attendance</TabsTrigger>
              </TabsList>

              <TabsContent value="mark">
                {/* Batch Selector and Date Picker for Mark Attendance tab*/}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  {/* Batch Selector */}
                  <div className="w-full md:w-1/2">
                    <label className="text-sm font-medium block mb-1">Select Batch</label>
                    <Select value={selectedBatch || ""} onValueChange={setSelectedBatch}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Batch Selector Options - list of batches */}
                        {batches.map((batch: any) => (
                          <SelectItem key={batch.id} value={batch.id.toString()}>
                            {batch.name} ({batch.courseName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Picker */}
                  <div className="w-full md:w-1/2">
                    <label className="text-sm font-medium block mb-1">Select Date</label>
                    {/* Popover Component */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        {/* Calendar Component */}
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Attendance Marking Table */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="relative w-64">
                      {/* Search Icon */}
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                      {/* Search Input - for searching students */}
                      <Input
                        type="text"
                        placeholder="Search students..."
                        className="pl-9 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    {/* Buttons - Mark All Present and Save Attendance */}
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={markAllPresent}>
                        Mark All Present
                      </Button>
                      <Button
                        onClick={handleSaveAttendance}
                        disabled={isSaved || saveAttendanceMutation.isPending}
                      >
                        {saveAttendanceMutation.isPending ? "Saving..." : isSaved ? "Saved" : "Save Attendance"}
                      </Button>
                    </div>
                  </div>

                  {/* Attendance Table */}
                  {!selectedBatch ? (
                    <div className="text-center py-10 text-neutral-500">
                      Please select a batch to view students
                    </div>
                  ) : isLoadingStudents || isLoadingAttendance ? (
                    <div className="text-center py-10">Loading students...</div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-10 text-neutral-500">
                      No students found in this batch
                    </div>
                  ) : (
                    <Table>
                      {/* Table Header */}
                      <TableHeader>
                        <TableRow>
                          {/* Table Headers */}
                          <TableHead>Student ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead className="text-center">Current Status</TableHead>
                          <TableHead className="text-center">Present</TableHead>
                          <TableHead className="text-center">Absent</TableHead>
                          <TableHead className="text-center">Leave</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Filtered students list */}
                        {filteredStudents.map((student: any) => (
                          // Table Rows
                          <TableRow key={student.id}>
                            {/* Student ID */}
                            <TableCell>{student.studentId}</TableCell>
                            {/* Student Name */}
                            <TableCell>
                              <div className="font-medium">
                                {student.firstName} {student.lastName}
                              </div>
                            </TableCell>
                            {/* Current Status */}
                            <TableCell className="text-center">
                              {getStatusBadge(attendance[student.id] || "pending")}
                            </TableCell>
                            {/* Present Button */}
                            <TableCell className="text-center">
                              <Button
                                variant={attendance[student.id] === "present" ? "default" : "outline"}
                                size="sm"
                                className={cn(
                                  "w-20",
                                  attendance[student.id] === "present" && "bg-green-500 hover:bg-green-600"
                                )}
                                onClick={() => handleAttendanceChange(student.id.toString(), "present")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Present
                              </Button>
                            </TableCell>
                            {/* Absent Button */}
                            <TableCell className="text-center">
                              <Button
                                variant={attendance[student.id] === "absent" ? "default" : "outline"}
                                size="sm"
                                className={cn(
                                  "w-20",
                                  attendance[student.id] === "absent" && "bg-red-500 hover:bg-red-600"
                                )}
                                onClick={() => handleAttendanceChange(student.id.toString(), "absent")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Absent
                              </Button>
                            </TableCell>
                            {/* Leave Button */}
                            <TableCell className="text-center">
                              <Button
                                variant={attendance[student.id] === "leave" ? "default" : "outline"}
                                size="sm"
                                className={cn(
                                  "w-20",
                                  attendance[student.id] === "leave" && "bg-yellow-500 hover:bg-yellow-600"
                                )}
                                onClick={() => handleAttendanceChange(student.id.toString(), "leave")}
                              >
                                <Clock className="h-4 w-4 mr-1" />
                                Leave
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>

              {/* View Attendance Tab */}
              <TabsContent value="view">
                <div className="space-y-6">
                  {/* Batch Selector */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="w-full md:w-1/2">
                      <label className="text-sm font-medium block mb-1">Select Batch</label>
                      <Select value={selectedBatch || ""} onValueChange={setSelectedBatch}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a batch" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* batch options - list of batches */}
                          {batches.map((batch: any) => (
                            <SelectItem key={batch.id} value={batch.id.toString()}>
                              {batch.name} ({batch.courseName})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Selector */}
                    <div className="w-full md:w-1/2">
                      <label className="text-sm font-medium block mb-1">Select Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {viewDate ? format(viewDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={viewDate}
                            onSelect={(date) => date && setViewDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Attendance Summary */}
                  {selectedBatch && (
                    <div className="grid gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Attendance Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4">
                            {/* Present */}
                            <div className="text-center p-4 bg-green-100 rounded-lg">
                              <div className="text-2xl font-bold text-green-700">
                                {filteredStudents.filter(s => attendance[s.id] === "present").length}
                              </div>
                              <div className="text-sm text-green-600">Present</div>
                            </div>
                            {/* Absent */}
                            <div className="text-center p-4 bg-red-100 rounded-lg">
                              <div className="text-2xl font-bold text-red-700">
                                {filteredStudents.filter(s => attendance[s.id] === "absent").length}
                              </div>
                              <div className="text-sm text-red-600">Absent</div>
                            </div>
                            {/* Leave */}
                            <div className="text-center p-4 bg-yellow-100 rounded-lg">
                              <div className="text-2xl font-bold text-yellow-700">
                                {filteredStudents.filter(s => attendance[s.id] === "leave").length}
                              </div>
                              <div className="text-sm text-yellow-600">Leave</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Attendance Records Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Attendance Records</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="relative w-64 mb-4">
                            {/* Search Icon*/}
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                            {/* Search Input - Student Name*/}
                            <Input
                              type="text"
                              placeholder="Search students..."
                              className="pl-9 w-full"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>

                          {/* Attendance Records Table */}
                          <Table>
                            {/* Table Header */}
                            <TableHeader>
                              {/* Table headers */}
                              <TableRow>
                                <TableHead>Student ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead>Last Updated</TableHead>
                              </TableRow>
                            </TableHeader>
                            {/* Table Body */}
                            <TableBody>
                              {/* Table Rows */}
                              {filteredStudents.map((student: any) => (
                                <TableRow key={student.id}>
                                  {/* Student ID */}
                                  <TableCell>{student.studentId}</TableCell>
                                  {/* Student Name */}
                                  <TableCell>
                                    <div className="font-medium">
                                      {student.firstName} {student.lastName}
                                    </div>
                                  </TableCell>
                                  {/* Status */}
                                  <TableCell className="text-center">
                                    {getStatusBadge(attendance[student.id] || "pending")}
                                  </TableCell>
                                  {/* Last Updated */}
                                  <TableCell>
                                    {selectedDate ? format(selectedDate, "PPP") : "-"}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}