import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  CalendarDays,
  Music,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { getInitials } from "@/lib/utils";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);

  // Hardcoded active classes
  const activeClasses = [
    {
      id: 1,
      batch: "Guitar",
      time: "05:00 PM - 06:00 PM",
      room: "103",
      students: 12,
      status: "ongoing"
    },
    // {
    //   id: 2,
    //   batch: "Music Theory - Batch MT01",
    //   time: "2:00 PM - 3:30 PM",
    //   room: "Room 102",
    //   students: 12,
    //   status: "upcoming"
    // },
    // {
    //   id: 3,
    //   batch: "Guitar Advanced - Batch G03",
    //   time: "4:00 PM - 5:30 PM",
    //   room: "Studio 2",
    //   students: 6,
    //   status: "upcoming"
    // }
  ];

  /**
   * Fetches the list of batches assigned to the currently authenticated teacher.
   *
   * @purpose Retrieve all class batches that belong to the logged-in teacher.
   * 
   * @param None (uses `user?.id` internally for the query key and authentication context)
   * @returns {UseQueryResult<any[], Error>} 
   * Returns a React Query object containing:
   *  - `data`: An array of batch objects (defaults to an empty array if not yet loaded)
   *  - `isLoading`: Boolean indicating whether the query is still loading
   *  - Other React Query metadata fields (e.g., `error`, `refetch`, etc.)
   * @throws {Error} Throws if fetching batches fails due to a network or API error.
   * @sideEffects None (purely data-fetching through React Query)
   * 
   * @example
   * const { data: batches = [], isLoading } = useQuery({
   *   queryKey: ["/api/batches/teacher", user?.id],
   *   enabled: !!user,
   * });
   *
   * // Usage:
   * if (isLoading) return <Spinner />;
   * return <BatchList batches={batches} />;
   */
  const { data: batches = [] } = useQuery<any[], Error>({
    queryKey: ["/api/batches/teacher", user?.id],
    enabled: !!user,
  });

  /**
   * Fetches the list of students enrolled in a specific batch.
   *
   * @purpose Retrieve students associated with the currently selected batch.
   * 
   * @param None (uses `selectedBatch` internally for the query key)
   * @returns {UseQueryResult<any[], Error>}
   * Returns a React Query object containing:
   *  - `data`: An array of student objects (defaults to an empty array if not yet loaded)
   *  - `isLoading`: Boolean indicating whether the query is in progress
   *  - Other React Query metadata (e.g., `error`, `refetch`, etc.)
   * @throws {Error} Throws if fetching enrollments fails due to a network or API error.
   * @sideEffects None (purely asynchronous data fetching)
   * 
   * @example
   * const { data: students = [], isLoading: isLoadingStudents } = useQuery({
   *   queryKey: ["/api/enrollments/batch", selectedBatch],
   *   enabled: !!selectedBatch,
   * });
   *
   * // Example usage:
   * if (isLoadingStudents) return <LoadingIndicator />;
   * return <StudentList students={students} />;
   */
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ["/api/enrollments/batch", selectedBatch],
    enabled: !!selectedBatch,
  });

  /**
   * Weekly schedule of classes for a student.
   *
   * @purpose
   * - Provides a structured schedule of classes for each day of the week.
   * - Useful for rendering weekly timetable views in dashboards or calendars.
   *
   * @param None - This is a constant array of objects.
   * @returns {Array<Object>} Array of day objects, each containing a list of classes.
   * @returns {string} day - Name of the day ("Monday", "Tuesday", etc.).
   * @returns {Array<Object>} classes - Array of class objects for that day.
   * @returns {string} classes[].time - Time slot of the class (e.g., "10:00 AM - 11:30 AM").
   * @returns {string} classes[].batch - Batch name.
   * @returns {string} classes[].room - Room or hall where class is conducted.
   * @returns {number} classes[].students - Number of students in the class.
   * @throws None
   * @sideEffects None - Does not modify any external state.
   * 
   * @example
   * console.log(weeklySchedule[0].day); // "Monday"
   * console.log(weeklySchedule[0].classes[1].batch); // "Guitar Advanced - Batch G03"
   */
  const weeklySchedule = [
    {
      day: "Monday",
      classes: [
        { time: "10:00 AM - 11:30 AM", batch: "Piano Basics - Batch P01", room: "Room 103", students: 12 },
        { time: "3:00 PM - 4:30 PM", batch: "Guitar Advanced - Batch G03", room: "Room 105", students: 8 }
      ]
    },
    {
      day: "Tuesday",
      classes: [
        { time: "11:00 AM - 12:30 PM", batch: "Piano Intermediate - Batch P02", room: "Room 103", students: 10 },
        { time: "4:00 PM - 5:30 PM", batch: "Drums Beginner - Batch D01", room: "Room 107", students: 6 }
      ]
    },
    {
      day: "Wednesday",
      classes: [
        { time: "10:00 AM - 11:30 AM", batch: "Piano Basics - Batch P01", room: "Room 103", students: 12 },
        { time: "2:00 PM - 3:30 PM", batch: "Piano Advanced - Batch P03", room: "Room 103", students: 7 }
      ]
    },
    {
      day: "Thursday",
      classes: [
        { time: "11:00 AM - 12:30 PM", batch: "Piano Intermediate - Batch P02", room: "Room 103", students: 10 },
        { time: "4:00 PM - 5:30 PM", batch: "Drums Beginner - Batch D01", room: "Room 107", students: 6 }
      ]
    },
    {
      day: "Friday",
      classes: [
        { time: "10:00 AM - 11:30 AM", batch: "Piano Basics - Batch P01", room: "Room 103", students: 12 },
        { time: "3:00 PM - 4:30 PM", batch: "Guitar Advanced - Batch G03", room: "Room 105", students: 8 }
      ]
    },
    {
      day: "Saturday",
      classes: [
        { time: "10:00 AM - 12:00 PM", batch: "Piano Workshop", room: "Hall 1", students: 15 },
        { time: "2:00 PM - 3:30 PM", batch: "Piano Advanced - Batch P03", room: "Room 103", students: 7 }
      ]
    },
    {
      day: "Sunday",
      classes: []
    }
  ];

  /**
   * Recent attendance records for student batches.
   *
   * @purpose
   * - Provides historical attendance information for recent classes.
   * - Can be used to calculate attendance percentages or display attendance reports.
   *
   * @param None - This is a constant array of objects.
   * @returns {Array<Object>} Array of attendance records.
   * @returns {string} date - Date of the class (YYYY-MM-DD format).
   * @returns {string} batch - Batch name.
   * @returns {number} total - Total number of students.
   * @returns {number} present - Number of students present.
   * @returns {number} absent - Number of students absent.
   * @returns {number} late - Number of students late.
   * @throws None - Does not throw any errors.
   * @sideEffects None - Does not affect any external state.
   * 
   * @example
   * console.log(recentAttendance[0].batch); // "Piano Basics - Batch P01"
   * console.log(recentAttendance[0].present); // 10
   */
  const recentAttendance = [
    { 
      date: "2023-07-21", 
      batch: "Piano Basics - Batch P01", 
      total: 12, 
      present: 10, 
      absent: 1, 
      late: 1 
    },
    { 
      date: "2023-07-20", 
      batch: "Piano Intermediate - Batch P02", 
      total: 10, 
      present: 9, 
      absent: 0, 
      late: 1 
    },
    { 
      date: "2023-07-19", 
      batch: "Piano Basics - Batch P01", 
      total: 12, 
      present: 11, 
      absent: 1, 
      late: 0 
    },
    { 
      date: "2023-07-18", 
      batch: "Piano Intermediate - Batch P02", 
      total: 10, 
      present: 8, 
      absent: 2, 
      late: 0 
    },
    { 
      date: "2023-07-17", 
      batch: "Piano Basics - Batch P01", 
      total: 12, 
      present: 10, 
      absent: 0, 
      late: 2 
    }
  ];

  /**
   * Filters and retrieves the schedule for the current day from the weekly schedule.
   *
   * @purpose Extracts all classes scheduled for the current day (e.g., Monday, Tuesday, etc.) from the `weeklySchedule` array and assigns them to `todaySchedule`.
   *
   * @param None
   * @returns {void} Updates the `todaySchedule` variable with an array of class objects for the current day. If no match is found, it remains an empty array.
   * @throws {Error} Throws if the `format()` function fails (e.g., invalid date object) or if `weeklySchedule` contains unexpected data.
   * @sideEffects 
   * - Mutates the local variable `todaySchedule`.
   * - Logs an error message to the console if date formatting fails.
   *
   * @example
   * // Example weekly schedule
   * const weeklySchedule = [
   *   { day: "Monday", classes: [{ id: 1, name: "Math" }] },
   *   { day: "Tuesday", classes: [{ id: 2, name: "Science" }] },
   * ];
   *
   * // Filter today's schedule (assuming today is Monday)
   * let todaySchedule: any[] = [];
   * try {
   *   const todayDay = format(new Date(), "EEEE");
   *   todaySchedule = weeklySchedule.find(day => day.day === todayDay)?.classes || [];
   * } catch (error) {
   *   console.error("Error formatting date:", error);
   * }
   *
   * // Result: [{ id: 1, name: "Math" }]
   */
  let todaySchedule: any[] = [];
  try {
    const todayDay = format(new Date(), "EEEE");
    todaySchedule = weeklySchedule.find(day => day.day === todayDay)?.classes || [];
  } catch (error) {
    console.error("Error formatting date:", error);
  }

  return (
    // Appshell component wraps the page content within the header and sidebar
    <AppShell>
      <div className="container py-6">
        {/* PageHeader component displays the page title and description */}
        <PageHeader 
          title="Teacher Dashboard"
          description="Welcome back! Here's an overview of your classes."
        />

        <div className="grid gap-4 md:grid-cols-3 mt-6">
          {/* Card to display the number of batches */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            {/* CardHeader component displays the card title */}
            <CardHeader className="pb-2">
              {/* CardTitle component displays the card title */}
              <CardTitle className="text-sm font-medium">My Batches</CardTitle>
            </CardHeader>
            {/* CardContent component displays the card content */}
            <CardContent>
              <div className="text-2xl font-bold">{batches.length}</div>
              <p className="text-xs text-muted-foreground">Active batches</p>
            </CardContent>
          </Card>

          {/* Card to display the number of classes scheduled for today */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
            {/* CardHeader component displays the card title */}
            <CardHeader className="pb-2">
              {/* CardTitle component displays the card title */}
              <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            </CardHeader>
            {/* CardContent component displays the card content */}
            <CardContent>
              <div className="text-2xl font-bold">{1}</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>

          {/* Card to display the number of students across all batches */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
            {/* CardHeader component displays the card title */}
            <CardHeader className="pb-2">
              {/* CardTitle component displays the card title */}
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            {/* CardContent component displays the card content */}
            <CardContent>
              <div className="text-2xl font-bold">
                {12}
              </div>
              <p className="text-xs text-muted-foreground">Across all batches</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Active Classes</h2>
          {/* Card to display the number of active classes */}
          <Card>
            {/* CardHeader component displays the card title */}
            <CardHeader className="pb-2">
              {/* CardTitle component displays the card title */}
              <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            </CardHeader>
            {/* CardContent component displays the card content */}
            <CardContent>
              <div className="text-2xl font-bold">{activeClasses.length}</div>
              <p className="text-xs text-muted-foreground">Classes scheduled for today</p>
              <div className="mt-4 space-y-3">
                {activeClasses.map((class_) => (
                  <div key={class_.id} className="flex items-start space-x-3 text-sm">
                    <div className={`w-2 h-2 mt-1.5 rounded-full ${
                      class_.status === "ongoing" ? "bg-green-500" : "bg-blue-500"
                    }`} />
                    <div>
                      {/* Class name */}
                      <div className="font-medium">{class_.batch}</div>
                      {/* Class time and location */}
                      <div className="text-muted-foreground">
                        {/* Class time */}
                        <span className="inline-flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {class_.time}
                        </span>
                        {/* Class location */}
                        <span className="inline-flex items-center ml-3">
                          <MapPin className="w-3.5 h-3.5 mr-1" />
                          {class_.room}
                        </span>
                        {/* Class students */}
                        <span className="inline-flex items-center ml-3">
                          <Users className="w-3.5 h-3.5 mr-1" />
                          {class_.students} students
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}