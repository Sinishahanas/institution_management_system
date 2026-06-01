import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Home, User, Calendar as CalendarIcon, CheckCircle, XCircle, Info, Clock, AlarmCheck, CalendarCheck, XCircleIcon, ClockIcon, CheckCircle2, AlertCircle, MapPin, Users, Stethoscope, Plane, GraduationCap, Receipt, FileCheck, Wallet } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { FixedFooter } from "@/components/layout/footer";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";


/**
 * ParentAttendance — React component that renders the parent-facing attendance view.
 *
 * @purpose
 * - Renders UI for parents to view attendance of their children for a selected month.
 * - Fetches child/student data, attendance data for the selected student, and renders calendar and summary information.
 *
 * @param None
 * @returns {JSX.Element} The rendered Parent Attendance page/component.
 * @throws None
 * @sideEffects
 * - Calls `useQuery` to fetch children (students associated with the parent) and attendance via the parent-specific API endpoints.
 * - Updates React state (`selectedStudent`, `selectedMonth`) and triggers re-renders.
 *
 * @example
 * <ParentAttendance />
 */
export default function ParentAttendance() {
  const { user } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  /**
 * Fetch children (students) associated with the logged-in parent user.
 *
 * @purpose Use React Query to fetch a list of children for the current parent. The query is enabled only when `user` is available. Each child object includes metadata and nested course/performance data.
 *
 * @params None (the query depends on `user?.id` captured from outer scope)
 * @returns List of children with course and performance data.
 * @throws {Error} If the underlying network request fails or the API returns a non-OK response.
 * @sideEffects
 * - Performs a network request to `/api/students-with-parents` with the parent's user ID.
 * - Triggers React Query caching, retries, and re-renders of components that use this data.
  *
  * @example
  * const { data: children } = useQuery([...]);
  */
  const { data: children = [], isLoading: isLoadingChildren } = useQuery<{ id: number; name: string; age: number; avatarUrl: string; courses: { id: number; name: string; level: string; teacher: string; progress: number; nextClass: Date; achievements: { id: number; name: string; date: Date; icon: React.ReactNode }[]; assignments: { id: number; name: string; dueDate: Date; completed: boolean }[]; notes: { id: number; date: Date; text: string }[] }[]; performance: { attendance: number; participation: number; progress: number; recentAchievements: number } }[]>({
    queryKey: ["/api/students-with-parents", user?.id],
    enabled: !!user,
  });

  /**
   * Mock courses data for the ParentAttendance component
   *
   * @purpose Provides example course enrollment and attendance data for students.
   * 
   * @param None
   * @returns {Array<Object>} Array of course objects with the following structure:
   *   - `id` {number} Unique identifier for the course
   *   - `name` {string} Name of the course
   *   - `student` {string} ID of the enrolled student
   *   - `teacher` {string} Name of the course instructor
   *   - `schedule` {string} Course schedule (days and time)
   *   - `classes` {number} Total number of classes in the course
   *   - `attendedClasses` {number} Number of classes attended by the student
   *   - `missedClasses` {number} Number of classes missed by the student
   * @throws None
   * @sideEffects None
   * 
   * @example
   * const firstCourseName = courses[0].name; 
   * // "Guitar Lessons"
   * const missedCount = courses[1].missedClasses; 
   * // 0
   */
  const courses = [
    {
      id: 1,
      name: "Guitar Lessons",
      student: "1", // Riya
      teacher: "John Smith",
      schedule: "Monday and Thursday, 4:00 PM - 5:30 PM",
      classes: 8,
      attendedClasses: 7,
      missedClasses: 1
    },
    {
      id: 2,
      name: "Piano Basics",
      student: "2", // Arjun
      teacher: "Maria Rodriguez",
      schedule: "Tuesday and Friday, 5:00 PM - 6:30 PM",
      classes: 8,
      attendedClasses: 8,
      missedClasses: 0
    }
  ];

  /**
 * Fetches attendance data for a parent’s selected student.
 *
 * @purpose Retrieve attendance records for the logged-in parent and chosen student.
 * 
 * @param {Object} user - The logged-in parent user object.
 * @param {string} selectedStudent - The ID of the selected student.
 * @returns Attendance data array, loading and error states from React Query.
 * @throws {Error} If the fetch request fails or returns a non-OK response.
 * @sideEffects Sends a GET request to `/api/attendance/parent` and logs errors.
 * 
 * @example
 * const { data, isLoading } = useQuery({ queryKey: ["/api/attendance/parent", user?.id, selectedStudent] });
 */
  const {
    data: attendanceData = [],
    isLoading: isLoadingAttendance,
    error: attendanceError,
    isError: isAttendanceError,
  } = useQuery({
    queryKey: ["/api/attendance/parent", user?.id, selectedStudent],
    queryFn: async () => {
      try {
        // console.log('Fetching attendance data for:', { userId: user?.id, studentId: selectedStudent });
        const res = await fetch(`/api/attendance/parent?userId=${user?.id}${selectedStudent ? `&studentId=${selectedStudent}` : ''}`);
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Failed to fetch attendance data');
        }
        const data = await res.json();
        // console.log('Fetched attendance data:', data);
        return data;
      } catch (error) {
        console.error('Error fetching attendance:', error);
        throw error;
      }
    },
    enabled: !!user && !!selectedStudent,
    retry: false, // Don't retry on error
  });

  /**
   * Filter attendanceData for the currently selected month.
   *
   * @purpose Produce an array of attendance records belonging to `selectedMonth`.
   * 
   * @param None (reads `attendanceData` and `selectedMonth` from closure).
   * @returns {any[]} Filtered attendance records for the selected month.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * // filteredAttendance now contains only records for the month shown in the UI
   * const filtered = filteredAttendance;
   */
  const filteredAttendance = attendanceData.filter((record: any) => {
    if (!record || !record.date) return false;
    const recordDate = new Date(record.date);
    return recordDate.getMonth() === selectedMonth.getMonth() &&
      recordDate.getFullYear() === selectedMonth.getFullYear();
  });


  /**
   * Get courses for the currently selected student.
   *
   * @purpose Return all course objects that belong to `selectedStudent`.
   * 
   * @param None (reads `courses` and `selectedStudent` from closure).
   * @returns {any[]} Array of course objects for the selected student.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * // show each course in the UI
   * const courses = studentCourses;
   */
  const studentCourses = courses.filter(course => course.student === selectedStudent);

  /**
   * Total number of classes across all student courses.
   *
   * @purpose Sum the `classes` field across `studentCourses`.
   * 
   * @param None (reads `studentCourses` from closure).
   * @returns {number} Sum of classes for the selected student's courses.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * // used to compute attendance percentage
   * const total = totalClasses;
   */
  const totalClasses = studentCourses.reduce((sum, course) => sum + course.classes, 0);


  /**
   * Total number of classes attended across all student courses.
   *
   * @purpose Sum the `attendedClasses` field across `studentCourses`.
   * 
   * @param None (reads `studentCourses` from closure).
   * @returns {number} Sum of attended classes for the selected student's courses.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * // used to compute attendance percentage
   * const attended = attendedClasses;
   */
  const attendedClasses = studentCourses.reduce((sum, course) => sum + course.attendedClasses, 0);

  /**
   * Attendance rate (percentage) for the selected student and month.
   *
   * @purpose Compute attendance rate as (attended / total) * 100.
   * 
   * @param None (reads `totalClasses` and `attendedClasses` from closure).
   * @returns {number} Attendance percentage (0-100). Returns 0 if no classes.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * // Display as badge: `${Math.round(attendanceRate)}%`
   */
  const attendanceRate = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;


  /**
   * Navigate the selectedMonth forward or backward by one month.
   *
   * @purpose Change `selectedMonth` to previous or next month for the calendar view.
   * 
   * @param {('prev'|'next')} direction - 'prev' moves to previous month, 'next' to next month.
   * @returns {void}
   * @throws None
   * @sideEffects Updates component state `selectedMonth`.
   * 
   * @example
   * navigateMonth('prev'); // show previous month in calendar
   */
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedMonth(subMonths(selectedMonth, 1));
    } else {
      setSelectedMonth(addMonths(selectedMonth, 1));
    }
  };


  /**
   * Return a small JSX Badge describing an attendance status.
   *
   * @purpose Map a status string to a styled Badge JSX element used in the UI.
   * 
   * @param {string} status - One of: 'present','absent','late','leave','cancelled','holiday' or other.
   * @returns {JSX.Element} A Badge element representing the provided status.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * getStatusBadge('present'); // returns a green "Present" Badge element
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge variant="default" className="flex items-center gap-2 bg-green-500 text-white"><CheckCircle className="h-4 w-4" /> Present</Badge>;
      case "absent":
        return <Badge variant="destructive" className="flex items-center gap-2"><XCircleIcon className="h-4 w-4" /> Absent</Badge>;
      case "late":
        return <Badge variant="outline" className="flex items-center gap-2"><ClockIcon className="h-4 w-4" /> Late</Badge>;
      case "leave":
        return <Badge variant="default" className="flex items-center gap-2 bg-yellow-500 text-white"><AlarmCheck className="h-4 w-4" /> Leave</Badge>;
      case "cancelled":
        return <Badge variant="default" className="flex items-center gap-2 bg-orange-600 text-white border-none"><XCircle className="h-4 w-4" /> Class Cancelled</Badge>;
      case "holiday":
        return <Badge variant="default" className="flex items-center gap-2 bg-blue-600 text-white border-none"><CalendarCheck className="h-4 w-4" /> Holiday</Badge>;
      default:
        return <Badge variant="outline" className="flex items-center gap-2"><Clock className="h-4 w-4" /> Not Marked</Badge>;
    }
  };

  /**
   * Breadcrumb links for the Attendance page.
   *
   * @purpose Define navigation hierarchy for PageHeader.
   * 
   * @param None
   * @returns {Array<{title: string, href?: string, icon?: JSX.Element}>} Breadcrumb items for navigation.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * // Used in PageHeader component
   * <PageHeader breadcrumbs={breadcrumbs} />
   */
  const breadcrumbs = [
    {
      title: "Home",
      href: "/parent/dashboard",
      icon: <Home className="h-4 w-4" />
    },
    {
      title: "Attendance"
    }
  ];


  /**
   * Renders the Attendance page layout.
   *
   * @purpose Display attendance summary and interactive info cards (Leave, Absent, Compensation).
   * 
   * @param None
   * @returns {JSX.Element} The complete Attendance page UI.
   * @throws None
   * @sideEffects Renders visual components and triggers UI interactions.
   * 
   * @example
   * return <AttendancePage />; // Displays attendance summary cards
   */
  return (
    //Appshell wraps the page with a sidebar and header
    <AppShell>
      {/* PageHeader is a component that displays the page title, description, and breadcrumbs */}
      <PageHeader
        title="Attendance"
        description="Track your students' class attendance"
        breadcrumbs={breadcrumbs}
      />

      {/* Card wrapper for attendance summary */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Summary</CardTitle> {/* title of the card */}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* HoverCard for Leave - shows extra info on hover */}
            <HoverCard>
              <HoverCardTrigger>
                {/* Card acting as the trigger (click/hover area) */}
                <Card className="bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      {/* Leave label */}
                      <p className="text-sm font-medium text-blue-600">Leave</p>
                    </div>
                    {/* Alert icon */}
                    <AlertCircle className="h-8 w-8 text-blue-500" />
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              {/* HoverCardContent for Leave */}
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-500" />
                    <h4 className="text-sm font-semibold">Leave</h4>
                  </div>
                  <p className="text-sm text-muted-foreground ml-7">
                    Only when a student misses 2 or more consecutive classes with prior email notice, a credit note will be issued and the fee will be adjusted in the next month.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
            <HoverCard>
              <HoverCardTrigger>
                {/* Card acting as the trigger (click/hover area) */}
                <Card className="bg-red-50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      {/* Absent label */}
                      <p className="text-sm font-medium text-red-600">Absent</p>
                    </div>
                    {/* X circle icon */}
                    <XCircle className="h-8 w-8 text-red-500" />
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              {/* HoverCardContent for Absent */}
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <h4 className="text-sm font-semibold">Absent</h4>
                  </div>
                  <p className="text-sm text-muted-foreground ml-7">
                    Class missed without notice. No credit or compensation.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
            {/* HoverCard for Compensation */}
            <HoverCard>
              <HoverCardTrigger>
                {/* Card acting as the trigger (click/hover area) */}
                <Card className="bg-purple-50 cursor-pointer hover:bg-purple-100 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      {/* Compensation label */}
                      <p className="text-sm font-medium text-purple-600">Compensation</p>
                    </div>
                    {/* Check circle icon */}
                    <CheckCircle2 className="h-8 w-8 text-purple-500" />
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              {/* HoverCardContent for Compensation */}
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-500" />
                    <h4 className="text-sm font-semibold">Compensation</h4>
                  </div>
                  <p className="text-sm text-muted-foreground ml-7">
                    A make-up class offered for a missed session.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </CardContent>
      </Card>

      {/* Student selection dropdown */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 mt-3">
        <div className="flex-grow">
          {/* Select component to choose a child/student */}
          <Select
            value={selectedStudent}
            onValueChange={(value) => {
              // console.log('Selected student:', value);
              // Reset any previous errors
              setSelectedStudent(value);
            }}>
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="Select child" /> {/* placeholder shown when none selected */}
            </SelectTrigger>
            <SelectContent>
              {/* Map children array to SelectItem options */}
              {children.map((child: any) => (
                <SelectItem key={child.studentIds} value={child.studentIds.toString()}>
                  <div className="flex items-center">
                    {/* User icon */}
                    <User className="h-4 w-4 mr-2" />
                    {/* Student name */}
                    {child.studentFirstName} {child.studentMiddleName} {child.studentLastName}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid of course cards for the selected student */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {studentCourses.map((course) => (
          <Card key={course.id}>
            <CardHeader className="pb-2">
              {/* Course name */}
              <CardTitle className="text-lg">{course.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Row: Attendance Rate label and badge */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Attendance Rate</span>
                  {/* Attendance rate badge */}
                  <Badge variant="outline" className={
                    course.attendedClasses / course.classes >= 0.9
                      ? "bg-green-100 text-green-800"
                      : course.attendedClasses / course.classes >= 0.8
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }>
                    {Math.round((course.attendedClasses / course.classes) * 100)}%
                  </Badge>
                </div>
                {/* Attendance progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(course.attendedClasses / course.classes) * 100}%` }}
                  ></div>
                </div>
                {/* Attendance details */}
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    {/* Classes attended */}
                    <span>Classes Attended</span>
                    <span className="font-medium">{course.attendedClasses} of {course.classes}</span>
                  </div>
                  <div className="flex justify-between">
                    {/* Classes missed */}
                    <span>Classes Missed</span>
                    <span className="font-medium">{course.missedClasses}</span>
                  </div>
                  <div className="flex justify-between">
                    {/* Teacher */}
                    <span>Teacher</span>
                    <span className="font-medium">{course.teacher}</span>
                  </div>
                </div>
                {/* Schedule text */}
                <div className="text-xs text-gray-500">
                  <span className="block font-medium">Schedule:</span>
                  {course.schedule}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedStudent && ( // Only render the following section if a student is selected
        <div className="space-y-6">
          {/* Main card container for attendance details */}
          <Card>
            <CardHeader>
              {/* Header section with title and month navigation buttons */}
              <div className="flex justify-between items-center">
                <CardTitle>Attendance Details</CardTitle>
                <div className="flex items-center gap-4">
                  {/* Previous month button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateMonth('prev')}
                  >
                    <CalendarIcon className="h-4 w-4 rotate-180" />
                  </Button>
                  {/* Selected month display */}
                  <div className="text-sm text-gray-500 min-w-[100px] text-center">
                    {format(selectedMonth, 'MMMM yyyy')}
                  </div>
                  {/* Next month button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateMonth('next')}
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {/* Card content section */}
            <CardContent>
              {isLoadingAttendance ? (  // If attendance data is still loading
              // Show loading message
                <div className="text-center py-8 text-gray-500">
                  Loading attendance data...
                </div>
                // If there’s an error fetching attendance
              ) : isAttendanceError ? (
                // Info icon for visual cue
                <div className="text-center py-8 text-red-500 flex items-center justify-center">
                  <Info className="h-4 w-4 mr-2" />
                  {attendanceError instanceof Error
                    ? attendanceError.message
                    // Show error message
                    : 'Failed to load attendance data'}
                </div>
              ) : (  // If attendance data is available
                <Table> 
                  {/* Table to display attendance details */}
                  <TableHeader>
                    <TableRow>
                      <TableHead>SL No.</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Status</TableHead>
                      {/* <TableHead>Action</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  {/* Table body section */}
                  <TableBody>
                    {filteredAttendance.length > 0 ? (
                      filteredAttendance
                        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((record: any, index: number) => (
                          <TableRow key={`${record.id}-${record.date}`}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{format(new Date(record.date), 'MMM d, yyyy')}</TableCell>
                            <TableCell>{record.batchName}</TableCell>
                            <TableCell>
                              {getStatusBadge(record.status)}
                            </TableCell>
                          </TableRow>
                        ))
                    ) : ( // If no data found
                      <TableRow>
                        {/* Message for empty data */}
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          No attendance records found for this month
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {/* Footer component fixed at the bottom */}
      <FixedFooter user={user} />
    </AppShell>
  );
}