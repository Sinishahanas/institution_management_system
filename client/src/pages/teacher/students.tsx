import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Search,
  ChevronDown,
  Music,
  Calendar,
  Clock,
  PhoneCall,
  Mail,
  MapPin,
  Info,
  User
} from "lucide-react";
import { format } from "date-fns";
import { getInitials } from "@/lib/utils";

/**
 * @purpose
 * - Fetch and display batches assigned to a teacher.
 * - Fetch students for the selected batch.
 * - Allow filtering of students via a search query.
 * - Provide a modal or detailed view for individual student profiles.
 *
 * @param None
 * @returns {JSX.Element} The rendered Teacher Students UI component.
 * @throws None
 * @sideEffects
 * - Makes API requests to fetch batches and students using React Query.
 * - Updates component state (`useState`) for search, selection, and dialog visibility.
 *
 * @example
 * // Example usage within a route or page:
 * import TeacherStudents from "@/pages/teacher/TeacherStudents";
 *
 * export default function TeacherPage() {
 *   return <TeacherStudents />;
 * }
 */
export default function TeacherStudents() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isStudentDetailsOpen, setIsStudentDetailsOpen] = useState(false);

  /**
   * List of batches fetched for the currently authenticated teacher.
   *
   * @purpose To retrieve all batches assigned to the teacher for filtering students.
   * 
   * @param None
   * @returns {Array<any>} Array of batch objects.
   * @throws None
   * @sideEffects Initiates an API call through React Query when the user is authenticated.
   *
   * @example
   * // Access fetched batch list:
   * console.log(batches);
   */
  const { data: batches = [], isLoading: isLoadingBatches } = useQuery<any[]>({
    queryKey: ["/api/batches/teacher"],
    enabled: !!user,
  });

  /**
   * List of students fetched based on the currently selected batch.
   *
   * @purpose Retrieve students for display in the teacher’s view.
   * 
   * @param None
   * @returns {Array<any>} Array of student objects for the selected batch.
   * @throws None
   * @sideEffects Initiates a network request via React Query when both `user` and `selectedBatch` are set.
   *
   * @example
   * // Get list of students:
   * console.log(students);
   */
  const { data: students = [], isLoading: isLoadingStudents } = useQuery<any[]>({
    queryKey: ["/api/students", { batchId: selectedBatch !== "all" ? selectedBatch : undefined }],
    enabled: !!user && !!selectedBatch,
  });

  /**
   * Derived array of students filtered by the search query.
   *
   * @purpose To display only those students whose name or ID matches the current search term.
   * 
   * @param None
   * @returns {Array<any>} Array of students matching the search query.
   * @throws None
   * @sideEffects None (pure function)
   * 
   * @example
   * // Use in render:
   * {filteredStudents.map(student => (
   *   <StudentCard key={student.id} student={student} />
   * ))}
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
   * Opens the detailed student information dialog for the selected student.
   *
   * @purpose To allow teachers to view complete information about a specific student.
   * 
   * @param {any} student - The student object to display details for.
   * @returns {void}
   * @throws None
   * @sideEffects
   * - Updates `selectedStudent` state.
   * - Opens the student details modal by setting `isStudentDetailsOpen` to true.
   *
   * @example
   * // Example usage in JSX:
   * <Button onClick={() => handleViewStudent(student)}>View Details</Button>
   */
  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setIsStudentDetailsOpen(true);
  };

  return (
    // Appshell wraps the page with the header and sidebar
    <AppShell>
      {/* Page Header with title and description */}
      <PageHeader
        title="Students"
        description="Manage and view information about students in your batches"
      />

      {/* Main content area, organized in a grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Card for search and filter controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search input field */}
              <div className="relative flex-1">
                {/* Search icon positioned inside the input */}
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                  type="text"
                  placeholder="Search by name or ID..."
                  className="pl-9 w-full"
                  value={searchQuery} // Binds input to searchQuery state
                  onChange={(e) => setSearchQuery(e.target.value)} // Updates searchQuery on change
                />
              </div>
              {/* Dropdown for selecting a batch */}
              <div className="w-full md:w-1/3">
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" /> {/* Placeholder text */}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem> {/* Option to view all batches */}
                    {/* Maps over the 'batches' array to create a SelectItem for each batch */}
                    {batches.map((batch: any) => (
                      <SelectItem key={batch.id} value={batch.id.toString()}>
                        {batch.name} {/* Displays the batch name */}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card for displaying the students table */}
        <Card>
          {/* Header for the students list card */}
          <CardHeader className="pb-0">
            <CardTitle>Students List</CardTitle> {/* Title of the card */}
            <CardDescription>
              {/* Dynamic description based on whether a specific batch is selected */}
              {selectedBatch === "all"
                ? "All students enrolled in your batches"
                : `Students enrolled in ${batches.find((b: any) => b.id.toString() === selectedBatch)?.name || "selected batch"}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Conditional rendering: shows loading message if students are being fetched */}
            {isLoadingStudents ? (
              <div className="text-center py-10">
                Loading students...
              </div>
            ) : filteredStudents.length === 0 ? (
              // Conditional rendering: shows "no students found" if the filtered list is empty
              <div className="text-center py-10 text-neutral-500">
                No students found
              </div>
            ) : (
              // Renders the table if students are available
              <div className="border rounded-md mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>{/* Table header for Student ID */}
                      <TableHead>Student</TableHead>{/* Table header for Student Name */}
                      <TableHead>Contact</TableHead>{/* Table header for Contact Information */}
                      <TableHead>Batch</TableHead>{/* Table header for Batch */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Maps over the filteredStudents array to render a TableRow for each student */}
                    {filteredStudents.map((student: any) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.studentId}</TableCell>{/* Student ID cell */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-medium">
                                {student.firstName} {student.lastName}{/* Student's full name */}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {/* Student's phone number with icon */}
                            <div className="flex items-center text-sm">
                              <PhoneCall className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                              {student.phone || 'Not provided'}
                            </div>
                            {/* Student's email with icon */}
                            <div className="flex items-center text-sm">
                              <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                              {student.email || 'Not provided'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {/* Displays the batch name corresponding to the student's batch ID */}
                          {batches.find((b: any) => b.id.toString() === student.batch)?.name || 'Unknown'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog for displaying detailed student information */}
      <Dialog open={isStudentDetailsOpen} onOpenChange={setIsStudentDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Student Information</DialogTitle>       {/* Title of the dialog */}
            <DialogDescription>
              Detailed information about the student             {/* Description of the dialog */}
            </DialogDescription>
          </DialogHeader>

          {/* Conditional rendering: only shows content if a student is selected */}
          {selectedStudent && (
            <div className="mt-4">
              {/* Tabs component for organizing student details */}
              <Tabs defaultValue="overview">
                <TabsList className="w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>       {/* Tab for Overview */}
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>   {/* Tab for Attendance */}
                  <TabsTrigger value="performance">Performance</TabsTrigger> {/* Tab for Performance */}
                  <TabsTrigger value="notes">Notes</TabsTrigger>             {/* Tab for Notes */}
                </TabsList>

                {/* Content for the Overview tab */}
                <TabsContent value="overview" className="mt-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left section of the overview: student's profile */}
                    <div className="flex flex-col items-center md:w-1/3">
                      <Avatar className="h-24 w-24">
                        <AvatarFallback className="text-lg">
                          {getInitials(selectedStudent.name)} {/* Student's initials in avatar */}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-lg mt-3">{selectedStudent.name}</h3> {/* Student's name */}
                      <p className="text-sm text-neutral-500">Student ID: {selectedStudent.studentId}</p> {/* Student ID */}

                      {/* Badges for batch and course names */}
                      <div className="flex flex-col space-y-2 mt-4 w-full">
                        <Badge variant="outline" className="justify-center">
                          {selectedStudent.batchName} {/* Student's batch name */}
                        </Badge>
                        <Badge variant="outline" className="justify-center">
                          {selectedStudent.courseName} {/* Student's course name */}
                        </Badge>
                      </div>

                      {/* Button to send a message to the student */}
                      <Button variant="outline" className="mt-4 w-full">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </div>

                    {/* Right section of the overview: detailed information cards */}
                    <div className="md:w-2/3 space-y-4">
                      {/* Card for Contact Information */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Student's email with icon */}
                          <div className="flex">
                            <Mail className="h-4 w-4 mr-2 text-neutral-500" />
                            <span className="text-sm">{selectedStudent.email || "Email not provided"}</span>
                          </div>
                          {/* Student's phone number with icon */}
                          <div className="flex">
                            <PhoneCall className="h-4 w-4 mr-2 text-neutral-500" />
                            <span className="text-sm">{selectedStudent.phone || "Phone not provided"}</span>
                          </div>
                          {/* Student's address with icon */}
                          <div className="flex">
                            <MapPin className="h-4 w-4 mr-2 text-neutral-500" />
                            <span className="text-sm">{selectedStudent.address || "Address not provided"}</span>
                          </div>
                          {/* Parent's name with icon */}
                          <div className="flex">
                            <User className="h-4 w-4 mr-2 text-neutral-500" />
                            <span className="text-sm">Parent: {selectedStudent.parentName || "Not provided"}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card for Course Progress */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Course Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Overall Progress</span>
                              <span className="font-medium">{selectedStudent.progress || 0}%</span>
                            </div>
                            {/* Progress bar visual */}
                            <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${selectedStudent.progress || 0}%` }} // Sets width dynamically based on progress
                              ></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card for Schedule Information */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Schedule</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Class days with icon */}
                          <div className="flex">
                            <Calendar className="h-4 w-4 mr-2 text-neutral-500" />
                            <span className="text-sm">
                              {selectedStudent.classDays || "Schedule not available"}
                            </span>
                          </div>
                          {/* Class time with icon */}
                          <div className="flex">
                            <Clock className="h-4 w-4 mr-2 text-neutral-500" />
                            <span className="text-sm">
                              {selectedStudent.classTime || "Time not specified"}
                            </span>
                          </div>
                          {/* Instrument with icon */}
                          <div className="flex">
                            <Music className="h-4 w-4 mr-2 text-neutral-500" />
                            <span className="text-sm">
                              Instrument: {selectedStudent.instrument || "Not specified"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* Content for the Attendance tab */}
                <TabsContent value="attendance">
                  <Card>
                    <CardHeader>
                      <CardTitle>Attendance History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Displays overall attendance rate */}
                      <p className="text-sm text-neutral-500 mb-4">
                        Overall attendance rate: <strong>{selectedStudent.attendance?.rate || 0}%</strong>
                      </p>

                      {/* Placeholder for detailed attendance records */}
                      <div className="text-center py-8 text-neutral-500">
                        Detailed attendance records will be displayed here
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Content for the Performance tab */}
                <TabsContent value="performance">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Placeholder for performance metrics */}
                      <div className="text-center py-8 text-neutral-500">
                        Performance metrics and assessments will be displayed here
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Content for the Notes tab */}
                <TabsContent value="notes">
                  <Card>
                    <CardHeader>
                      <CardTitle>Teacher Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Placeholder for teacher notes */}
                      <div className="text-center py-8 text-neutral-500">
                        Notes and observations about the student will be displayed here
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}