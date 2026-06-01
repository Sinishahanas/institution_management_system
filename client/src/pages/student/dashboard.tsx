import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, CheckCircle, Clock, Music2, BookOpen, ArrowRight, AlertTriangle } from "lucide-react";
import { format, addDays } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

/**
 * StudentDashboard
 *
 * @purpose Displays the main student dashboard view, including an overview of the student’s courses, attendance statistics, upcoming classes, assignments, recent activities, and payments. This acts as the entry point for a student's daily academic summary.
 *
 * @param None
 * @returns {JSX.Element} A complete dashboard UI containing course summaries, attendance stats, recent activities, and pending tasks for the logged-in student.
 * @throws None directly, but dependent hooks (e.g., `useAuth`) may throw internally if authentication fails or context is missing.
 * @sideEffects 
 * - Reads authenticated user information via `useAuth()`.
 * - Manages React state for tab navigation (`activeTab`).
 * - Uses `date-fns` functions (`format`, `addDays`) to compute derived date values.
 *
 * @example
 * // Usage in routes:
 * import StudentDashboard from "@/pages/student/dashboard";
 *
 * export default function App() {
 *   return (
 *     <Routes>
 *       <Route path="/student/dashboard" element={<StudentDashboard />} />
 *     </Routes>
 *   );
 * }
 */
export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  /**
   * StudentDashboardData
   *
   * @purpose
   * - Provides structured student dashboard data including courses, progress, activities, upcoming classes, attendance, assignments, and payments.
   * @param None
   * @returns {Object} Student dashboard data:
   *   - `name` {string} Student's full name.
   *   - `progress` {Object} Overall and per-course progress percentages.
   *   - `courses` {Array<Object>} Enrolled courses (id, name, teacher, nextClass, progress, level, lastTopic, classroom).
   *   - `recentActivities` {Array<Object>} Recent activities (id, type, course, date, details).
   *   - `upcomingClasses` {Array<Object>} Upcoming classes (id, course, teacher, dateTime, duration, location).
   *   - `attendanceStats` {Object} Attendance summary (total, present, absent, leave, percentage).
   *   - `assignments` {Array<Object>} Assignments (id, title, course, dueDate, status).
   *   - `payments` {Array<Object>} Payment records (id, description, amount, dueDate, status).
   * @throws None
   * @sideEffects None
   * @example
   * console.log(studentData.name); // "Yatheen Kumar"
   * console.log(studentData.progress.overall); // 72
   */
  const studentData = {
    name: user?.fullName || "Yatheen Kumar",
    progress: {
      overall: 72,
      guitar: 68,
      musicTheory: 80
    },
    courses: [
      {
        id: 1,
        name: "Guitar Lessons",
        teacher: "John Smith",
        nextClass: new Date(new Date().setHours(16, 0, 0, 0)),
        progress: 68,
        level: "Intermediate",
        lastTopic: "String bending techniques",
        classroom: "Studio 3"
      },
      {
        id: 2,
        name: "Music Theory",
        teacher: "Sarah Wilson",
        nextClass: addDays(new Date().setHours(15, 0, 0, 0), 2),
        progress: 80,
        level: "Beginner",
        lastTopic: "Chord progressions",
        classroom: "Room 102"
      }
    ],
    recentActivities: [
      {
        id: 1,
        type: "class",
        course: "Guitar Lessons",
        date: new Date(new Date().setDate(new Date().getDate() - 2)),
        details: "Practiced fingerpicking patterns"
      },
      {
        id: 2,
        type: "assignment",
        course: "Music Theory",
        date: new Date(new Date().setDate(new Date().getDate() - 3)),
        details: "Submitted chord progression worksheet"
      },
      {
        id: 3,
        type: "practice",
        course: "Guitar Lessons",
        date: new Date(new Date().setDate(new Date().getDate() - 5)),
        details: "Practice session - 45 minutes"
      },
      {
        id: 4,
        type: "feedback",
        course: "Guitar Lessons",
        date: new Date(new Date().setDate(new Date().getDate() - 7)),
        details: "Received feedback on guitar technique"
      }
    ],
    upcomingClasses: [
      {
        id: 1,
        course: "Guitar Lessons",
        teacher: "John Smith",
        dateTime: new Date(new Date().setHours(16, 0, 0, 0)),
        duration: 90,
        location: "Studio 3"
      },
      {
        id: 2,
        course: "Music Theory",
        teacher: "Sarah Wilson",
        dateTime: addDays(new Date().setHours(15, 0, 0, 0), 2),
        duration: 60,
        location: "Room 102"
      },
      {
        id: 3,
        course: "Guitar Lessons",
        teacher: "John Smith",
        dateTime: addDays(new Date().setHours(16, 0, 0, 0), 7),
        duration: 90,
        location: "Studio 3"
      }
    ],
    attendanceStats: {
      total: 32,
      present: 28,
      absent: 2,
      leave: 2,
      percentage: 87.5
    },
    assignments: [
      {
        id: 1,
        title: "Guitar Practice - Scales",
        course: "Guitar Lessons",
        dueDate: addDays(new Date(), 3),
        status: "pending"
      },
      {
        id: 2,
        title: "Music Theory Worksheet",
        course: "Music Theory",
        dueDate: addDays(new Date(), 1),
        status: "urgent"
      },
      {
        id: 3,
        title: "Song Recording",
        course: "Guitar Lessons",
        dueDate: addDays(new Date(), 10),
        status: "pending"
      }
    ],
    payments: [
      {
        id: 1,
        description: "Guitar Lessons - June",
        amount: 12000,
        dueDate: addDays(new Date(), 5),
        status: "upcoming"
      }
    ]
  };

  /**
   * Returns a Tailwind CSS class string representing the background and text color for a given payment status.
   *
   * @purpose
   * - Provides consistent visual styling for payment status badges.
   *
   * @param {string} status - The status of the payment ("paid", "upcoming", "overdue", etc.).
   * @returns {string} Tailwind CSS classes for background and text color.
   * @throws None.
   * @sideEffects - None; pure function.
   *
   * @example
   * const colorClass = getStatusColor("paid"); // "bg-green-100 text-green-800"
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  /**
   * getActivityIcon
   *
   * @purpose
   * Used to visually distinguish different activities such as classes, assignments, practice sessions, and feedback in the student dashboard.
   * Returns a JSX icon component corresponding to the type of student activity.
   *
   * @param {string} type - The type of activity. Valid values: "class", "assignment", "practice", "feedback". Any other value defaults to a generic clock icon.
   * @returns {JSX.Element} A React icon component with appropriate size and color.
   * @throws None
   * @sideEffects None; pure function.
   *
   * @example
   * const icon = getActivityIcon("class"); // Returns a blue Music2 icon for class activities
   *
   * const icon2 = getActivityIcon("event"); // Returns a purple BookOpen icon for event activities
   */
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "class":
        return <Music2 className="h-3.5 w-3.5 text-blue-600" />;
      case "assignment":
        return <BookOpen className="h-3.5 w-3.5 text-purple-600" />;
      case "practice":
        return <Music2 className="h-3.5 w-3.5 text-green-600" />;
      case "feedback":
        return <CheckCircle className="h-3.5 w-3.5 text-amber-600" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-gray-600" />;
    }
  };

  return (
    // Appshell wraps the page content with the header and sidebar
    <AppShell>
      <div className="p-4 md:p-5 space-y-6">
        {/* Welcome section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            {/* Welcome message */}
            <h1 className="text-2xl font-bold tracking-tight">Hello, {studentData.name}! 👋</h1>
            <p className="text-muted-foreground">
              Welcome back to your student dashboard. Here's an overview of your learning journey.
            </p>
          </div>
          <div className="flex mt-4 md:mt-0 space-x-2">
            {/* Calendar button */}
            <Button variant="outline" className="hidden md:flex">
              <CalendarIcon className="mr-2 h-4 w-4" />
              View Calendar
            </Button>
            {/* Next class button */}
            <Button>
              Next Class
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Top cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Overall progress card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{studentData.progress.overall}%</div>
              <Progress value={studentData.progress.overall} className="h-2" />
            </CardContent>
          </Card>
          
          {/* Attendance rate card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                {/* Attendance percentage */}
                <div className="text-2xl font-bold">{studentData.attendanceStats.percentage}%</div>
                {/* Attendance status */}
                <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
                  Good
                </Badge>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <div>
                  <span className="text-green-600 font-medium">{studentData.attendanceStats.present}</span> Present
                </div>
                <div>
                  <span className="text-red-600 font-medium">{studentData.attendanceStats.absent}</span> Absent
                </div>
                <div>
                  <span className="text-amber-600 font-medium">{studentData.attendanceStats.leave}</span> Leave
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Upcoming or next class card */}
          <Card>
            <CardHeader className="pb-2">
              {/* Upcoming or next class title */}
              <CardTitle className="text-sm font-medium text-gray-500">Next Class</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Upcoming or next class content */}
              {studentData.upcomingClasses && studentData.upcomingClasses.length > 0 ? (
                <div>
                  <div className="text-lg font-semibold mb-1">
                    {studentData.upcomingClasses[0].course}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {format(studentData.upcomingClasses[0].dateTime, "EEE, MMM d • h:mm a")}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No upcoming classes scheduled</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              {/* Courses title and description */}
              <CardHeader>
                <CardTitle>Your Courses</CardTitle>
                <CardDescription>
                  Track your progress across enrolled courses
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Courses list */}
                <div className="divide-y">
                  {studentData.courses.map((course) => (
                    <div key={course.id} className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start">
                          <div className="rounded-full p-2 bg-primary/10 mr-4">
                            <Music2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            {/* Course name */}
                            <h3 className="font-semibold">{course.name}</h3>
                            {/* Teacher name */}
                            <div className="text-sm text-gray-500 mt-1">
                              Teacher: {course.teacher}
                            </div>
                          </div>
                        </div>
                        {/* Badge to show the level of the course */}
                        <Badge className="mt-2 md:mt-0" variant="outline">
                          Level: {course.level}
                        </Badge>
                      </div>
                      
                      <div className="mt-4">
                        {/* Progress bar */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Progress</div>
                          <div className="text-sm font-medium">{course.progress}%</div>
                        </div>
                        <Progress value={course.progress} className="h-2 mt-1" />
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Next class */}
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 text-gray-500 mr-2" />
                          <div>
                            <div className="text-xs text-gray-500">Next Class</div>
                            <div>{format(course.nextClass, "EEE, MMM d • h:mm a")}</div>
                          </div>
                        </div>
                        <div className="flex items-center text-sm">
                          <BookOpen className="h-4 w-4 text-gray-500 mr-2" />
                          <div>
                            <div className="text-xs text-gray-500">Last Topic</div>
                            <div>{course.lastTopic}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        {/* View course button */}
                        <Button variant="outline" size="sm">
                          View Course
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              {/* View all courses button */}
              <CardFooter className="border-t px-6 py-4">
                <Button variant="link" className="p-0 h-auto font-normal text-sm text-blue-600" asChild>
                  <span>View all courses</span>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Upcoming classes card */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Classes</CardTitle>
                <CardDescription>
                  Your scheduled classes for the next two weeks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Scheduled classes list - upcoming classes */}
                  {studentData.upcomingClasses.map((classItem) => (
                    <div key={classItem.id} className="flex items-start p-3 bg-muted rounded-lg">
                      <div className="p-2 rounded-full bg-primary/10 mr-3">
                        <Music2 className="h-5 w-5 text-primary" />
                      </div>
                      {/* Class details */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          {/* Class name */}
                          <h4 className="font-medium">{classItem.course}</h4>
                          {/* Class date and time */}
                          <div className="flex items-center mt-1 md:mt-0">
                            <CalendarIcon className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-xs text-gray-500">
                              {format(classItem.dateTime, "EEE, MMM d • h:mm a")}
                            </span>
                          </div>
                        </div>
                        <div className="mt-1 text-sm">
                          {/* Class teacher */}
                          <span className="text-gray-700">{classItem.teacher}</span>
                          <span className="mx-2">•</span>
                          {/* Class duration */}
                          <span className="text-gray-500">{classItem.duration} min</span>
                          <span className="mx-2">•</span>
                          {/* Class location */}
                          <span className="text-gray-500">{classItem.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              {/* View full schedule button */}
              <CardFooter className="border-t px-6 py-4">
                <Button variant="link" className="p-0 h-auto font-normal text-sm text-blue-600" asChild>
                  <span>View full schedule</span>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Right column - Pending Assignments */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                {/* Card title */}
                <CardTitle>Pending Assignments</CardTitle>
                {/* Card description */}
                <CardDescription>
                  Tasks that need your attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Assignments list */}
                {studentData.assignments.length > 0 ? (
                  <div className="space-y-3">
                    {/* Assignment item - map */}
                    {studentData.assignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-start border-l-2 pl-3 py-1" style={{ borderColor: assignment.status === 'urgent' ? '#ef4444' : '#f59e0b' }}>
                        {assignment.status === 'urgent' ? (
                          <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                        ) : (
                          <Clock className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                        )}
                        {/* Assignment details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{assignment.title}</h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">{assignment.course}</span>
                            {/* Assignment status */}
                            <Badge variant="outline" className={getStatusColor(assignment.status)}>
                              {assignment.status === 'urgent' ? 'Due Soon' : 'Pending'}
                            </Badge>
                          </div>
                          {/* Assignment due date */}
                          <div className="text-xs text-gray-500 mt-1">
                            Due {format(assignment.dueDate, "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No pending assignments</p>
                  </div>
                )}
              </CardContent>
              {/* View all assignments button */}
              <CardFooter className="border-t px-6 py-4">
                <Button variant="ghost" size="sm" className="ml-auto">
                  View All Assignments
                </Button>
              </CardFooter>
            </Card>
            
            {/* Recent activities card */}
            <Card>
              <CardHeader>
                {/* Card title */}
                <CardTitle>Recent Activities</CardTitle>
                {/* Card description */}
                <CardDescription>
                  Your latest learning activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative pl-6 border-l space-y-3">
                  {/* Recent activities list */}
                  {studentData.recentActivities.map((activity, idx) => (
                    <div key={activity.id} className="relative pb-3 last:pb-0">
                      <div className="absolute -left-[23px] top-[3px] flex items-center justify-center h-5 w-5">
                        <span className="absolute inset-0 w-full h-full rounded-full bg-white border-2 border-primary" />
                        <span className="relative z-10 flex items-center justify-center">
                          {getActivityIcon(activity.type)}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{activity.course}</span> - {activity.details}
                        <div className="text-xs text-gray-500 mt-1">
                          {format(activity.date, "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Upcoming payments card */}
            <Card>
              <CardHeader>
                {/* Card title */}
                <CardTitle>Upcoming Payments</CardTitle>
                {/* Card description */}
                <CardDescription>
                  Your pending tuition payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Payments list */}
                {studentData.payments.length > 0 ? (
                  <div className="space-y-3">
                    {studentData.payments.map(payment => (
                      <div key={payment.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-sm">{payment.description}</h4>
                          <Badge variant="outline" className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                        {/* Payment amount and due date */}
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-lg font-bold">₹{payment.amount / 100}</span>
                          <div className="text-xs text-gray-500">
                            Due: {format(payment.dueDate, "MMM d, yyyy")}
                          </div>
                        </div>
                        {/* Pay now button */}
                        <Button className="w-full mt-3" size="sm">
                          Pay Now
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No pending payments</p>
                  </div>
                )}
              </CardContent>
              {/* View payment history button */}
              <CardFooter className="border-t px-6 py-4">
                <Button variant="ghost" size="sm" className="ml-auto">
                  View Payment History
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}