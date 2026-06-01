import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FixedFooter } from "@/components/layout/footer";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  GraduationCap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
  BookOpen,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import {
  capitalizeFirstLetter,
  formatCurrency,
  getInitials,
} from "@/lib/utils";
import { useState } from "react";
import { Enrollment, Payment, Student } from "@shared/schema";

/**
 * ActiveEnrollmentsResponse interface
 *
 * @purpose Defines the structure of the response from the API endpoint `/api/parents/:id/active-enrollments`.
 *
 * @param {Object} ActiveEnrollmentsResponse - The response object.
 * @param {number} activeEnrollmentCount - The count of active enrollments for the parent.
 * @returns {ActiveEnrollmentsResponse} The response object.
 * @throws Throws an error if the API request fails.
 * @sideEffects Performs a GET request to `/api/parents/:id/active-enrollments`. Caches the response in React Query.
 *
 * @example
 * const { data: activeEnrollments, isLoading: isLoadingActiveEnrollments } = useQuery<ActiveEnrollmentsResponse>({
 *   queryKey: ["/api/parents/:id/active-enrollments", user?.id],
 *   enabled: !!user?.id,
 *   queryFn: async () => {
 *     const response = await fetch(`/api/parents/${user?.id}/active-enrollments`);
 *     if (!response.ok) throw new Error('Failed to fetch enrollments');
 *     return response.json();
 *   },
 * });
 */
interface ActiveEnrollmentsResponse {
  activeEnrollmentCount: number;
}

/**
 * ParentDashboard component
 *
 * @purpose The parent dashboard displays an overview of the parent's children and their enrollments.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.user - The authenticated user object.
 * @returns {JSX.Element} The parent dashboard component.
 * @throws Throws an error if the API request fails.
 * @sideEffects Performs a GET request to `/api/students-with-parents`.
 * - Caches the response in React Query.
 *
 * @example
 * const { data: children, isLoading: isLoadingChildren } = useQuery({
 *   queryKey: ["/api/students-with-parents", user?.id],
 *   enabled: !!user,
 * });
 */
export default function ParentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  /**
   * Fetches the list of children (students) associated with the logged-in parent.
   *
   * @purpose Provides the parent with their linked children for selection and dashboard display.
   *
   * @param `user?.id`: ID of the currently logged-in parent (from `useAuth()`).
   * @returns
   * - `children`: Array of student objects associated with the parent.
   * - `isLoadingChildren`: Boolean indicating if the data is still loading.
   * @throws Throws an error if the API request fails.
   * @sideEffects Performs a GET request to `/api/students-with-parents`.
   * - Caches the response in React Query.
   *
   * @example
   * const { data: children, isLoading: isLoadingChildren } = useQuery({
   *   queryKey: ["/api/students-with-parents", user?.id],
   *   enabled: !!user,
   * });
   */
  const { data: children = [], isLoading: isLoadingChildren } = useQuery<
    Student[]
  >({
    queryKey: ["/api/students-with-parents", user?.id],
    enabled: !!user,
  });

  /**
   * Fetches the total count of children linked to all parents (or for analytics purposes).
   *
   * @purpose Provides a summary count of children for dashboard metrics.
   *
   * @param None directly.
   * @returns
   * - `childrenCount`: Number of children.
   * - `isLoadingChildrenCount`: Boolean indicating if the data is still loading.
   * @throws Throws an error if the fetch request fails.
   * @sideEffects Performs a GET request to `/api/student-parents`.
   * - Caches the response in React Query.
   *
   * @example
   * const { data: childrenCount, isLoading: isLoadingChildrenCount } = useQuery({
   *   queryKey: ['/api/student-parents'],
   *   queryFn: async () => {
   *     const response = await fetch('/api/student-parents');
   *     if (!response.ok) throw new Error('Failed to fetch children');
   *     return response.json();
   *   }
   * });
   */
  const { data: childrenCount, isLoading: isLoadingChildrenCount } = useQuery({
    queryKey: ["/api/student-parents"],
    queryFn: async () => {
      const response = await fetch("/api/student-parents");
      if (!response.ok) {
        throw new Error("Failed to fetch children");
      }
      return response.json();
    },
  });

  /**
   * Fetches enrollment details for the selected child.
   *
   * @purpose Provides the parent's dashboard with enrollment information for a chosen student.
   *
   * @param `selectedChild`: ID of the currently selected child.
   * @returns
   * - `enrollments`: Array of enrollment objects for the selected child.
   * - `isLoadingEnrollments`: Boolean indicating if the data is still loading.
   * @throws Throws an error if the query fails (handled internally by React Query).
   * @sideEffects
   * - Performs a GET request to `/api/enrollments/student/{selectedChild}`.
   * - Caches the response in React Query.
   *
   * @example
   * const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery<Enrollment[]>({
   *   queryKey: ["/api/enrollments/student", selectedChild],
   *   enabled: !!selectedChild,
   * });
   */
  const { data: enrollments = [], isLoading: isLoadingEnrollments } = useQuery<
    Enrollment[]
  >({
    queryKey: ["/api/enrollments/student", selectedChild],
    enabled: !!selectedChild,
  });

  /**
   * Fetches all active enrollments for the logged-in parent.
   *
   * @purpose Displays active courses that the parent's children are enrolled in.
   *
   * @param `user?.id`: ID of the currently logged-in parent.
   * @returns
   * - `activeEnrollments`: Array of enrollment objects that are active.
   * - `isLoadingActiveEnrollments`: Boolean indicating if the data is loading.
   * @throws Throws an error if the API request fails.
   * @sideEffects Performs a GET request to `/api/parents/{userId}/active-enrollments`. Caches the response in React Query.
   *
   * @example
   * const { data: activeEnrollments, isLoading: isLoadingActiveEnrollments } = useQuery<Enrollment[]>({
   *   queryKey: ["/api/parents/:id/active-enrollments", user?.id],
   *   enabled: !!user?.id,
   *   queryFn: async () => {
   *     const response = await fetch(`/api/parents/${user?.id}/active-enrollments`);
   *     if (!response.ok) throw new Error('Failed to fetch enrollments');
   *     return response.json();
   *   },
   * });
   */
  const { data: activeEnrollments, isLoading: isLoadingActiveEnrollments } =
    useQuery<ActiveEnrollmentsResponse>({
      queryKey: ["/api/parents/:id/active-enrollments", user?.id],
      enabled: !!user?.id,
      queryFn: async () => {
        const response = await fetch(
          `/api/parents/${user?.id}/active-enrollments`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch enrollments");
        }
        return response.json();
      },
    });

  /**
   * Fetches all available courses.
   *
   * @purpose Provides the parent dashboard with course information for reference and reporting.
   *
   * @param None.
   * @returns
   * - `courses`: Array of course objects.
   * - `isLoadingCourses`: Boolean indicating if the data is still loading.
   * @throws Throws an error if the fetch request fails.
   * @sideEffects
   * - Performs a GET request to `/api/students/course`.
   * - Caches the response in React Query.
   *
   * @example
   * const { data: courses, isLoading: isLoadingCourses } = useQuery({
   *   queryKey: ['/api/students/course'],
   *   queryFn: async () => {
   *     const response = await fetch('/api/students/course');
   *     if (!response.ok) throw new Error('Failed to fetch courses');
   *     return response.json();
   *   }
   * });
   */
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ["/api/students/course"],
    queryFn: async () => {
      const response = await fetch("/api/students/course");
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      return response.json();
    },
  });

  /**
   * Fetches all payments.
   *
   * @purpose Provides the parent dashboard with payment history and summaries.
   *
   * @param None.
   * @returns
   * - `payments`: Array of payment objects.
   * - `isLoadingPayments`: Boolean indicating if the data is still loading.
   * @throws Throws an error if the query fails.
   * @sideEffects Performs a GET request to `/api/payments`. Caches the response in React Query.
   *
   * @example
   * const { data: payments, isLoading: isLoadingPayments } = useQuery({
   *   queryKey: ["/api/payments"],
   * });
   */
  const { data: payments = [], isLoading: isLoadingPayments } = useQuery<
    Payment[]
  >({
    queryKey: ["/api/payments"],
  });

  /**
   * Fetches parent profile data for the logged-in user.
   *
   * @purpose Provides the parent dashboard with user profile information.
   *
   * @param `user?.id`: ID of the currently logged-in parent.
   * @returns
   * - `parent`: Parent object containing profile details.
   * - `isLoading`: Boolean indicating if the data is still loading.
   * - `error`: Any error encountered during fetch.
   * @throws Throws an error if the API request fails.
   * @sideEffects Performs a GET request to `/api/parents/user/{userId}`. Logs any fetch failure to console. Caches the response in React Query.
   *
   * @example
   * const { data: parent, isLoading, error } = useQuery({
   *   queryKey: ["/api/parents/user", user?.id],
   *   enabled: !!user?.id,
   *   queryFn: async () => {
   *     const res = await fetch(`/api/parents/user/${user?.id}`);
   *     if (!res.ok) throw new Error("Failed to fetch parent");
   *     return res.json();
   *   },
   * });
   */
  const {
    data: parent = null,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/parents/user", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await fetch(`/api/parents/user/${user?.id}`);
      if (!res.ok) {
        const text = await res.text();
        console.error("Fetch failed:", text);
        throw new Error("Failed to fetch parent");
      }
      return res.json();
    },
  });

  /**
   * Filters payments for the currently selected child.
   *
   * @purpose Retrieves only the payments that belong to the selected student.
   *
   * @params
   * - `selectedChild`: string | null — ID of the selected child.
   * - `payments`: Array of payment objects.
   * @returns `childPayments`: Array of payments for the selected child. Returns empty array if no child is selected.
   * @throws None (filtering does not throw errors).
   * @sideEffects None.
   *
   * @example
   * const childPayments = selectedChild ?
   *   payments.filter(payment => payment.studentId.toString() === selectedChild) :
   *   [];
   */
  const childPayments = selectedChild
    ? payments.filter(
        (payment: any) => payment.studentId.toString() === selectedChild,
      )
    : [];

  /**
   * Retrieves the selected student's data from the courses array.
   *
   * @purpose Gets the full student object including enrolled courses for display and processing.
   *
   * @params
   * - `selectedChild`: string | null — ID of the selected child.
   * - `courses`: Array of student course objects.
   * @returns `selectedStudentData`: Object containing student data or null if no child is selected.
   * @throws None.
   * @sideEffects None.
   *
   * @example
   * const selectedStudentData = selectedChild ?
   *   courses.find(student => student.studentId.toString() === selectedChild) :
   *   null;
   */
  const selectedStudentData = selectedChild
    ? courses.find(
        (student: any) =>
          student.studentId === parseInt(selectedChild) ||
          student.studentId.toString() === selectedChild,
      )
    : null;

  /**
   * Retrieves the courses for the selected student.
   *
   * @purpose Provides the Overview section with all courses the student is enrolled in.
   *
   * @param selectedStudentData Object containing the student's data (including courses).
   * @returns studentCourses: Array of course objects. Returns empty array if no student is selected.
   * @throws None.
   * @sideEffects None.
   *
   * @example
   * const studentCourses = selectedStudentData ? selectedStudentData.courses : [];
   */
  const studentCourses = selectedStudentData ? selectedStudentData.courses : [];

  /**
   * Aggregates all schedules for the selected student across courses and batches.
   *
   * @purpose Provides a structured view of class schedules for the Classes section.
   *
   * @param selectedStudentData Object containing the student's data including courses and batch schedules.
   * @returns Array of schedule objects grouped by course and batch. Each object contains:
   *   - `courseName`: string
   *   - `batchName`: string
   *   - `schedules`: Array of schedule entries { day, startTime, endTime }
   * @throws None.
   * @sideEffects None.
   *
   * @example
   * const schedules = getStudentSchedules();
   */
  const getStudentSchedules = () => {
    if (!selectedStudentData) return [];

    const scheduleMap: Record<string, any> = {};

    selectedStudentData.courses.forEach((course: any) => {
      course.batches.forEach((batch: any) => {
        const key = `${course.courseName}-${batch.batchName}`;
        if (!scheduleMap[key]) {
          scheduleMap[key] = {
            courseName: course.courseName,
            batchName: batch.batchName,
            schedules: [],
          };
        }

        batch.schedule.forEach((schedule: any) => {
          scheduleMap[key].schedules.push({
            day: schedule.day,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
          });
        });
      });
    });

    return Object.values(scheduleMap);
  };

  /**
   * Formats a time string (HH:mm) into a readable 12-hour format (h:mm a).
   *
   * @purpose Converts military time or 24-hour time to a user-friendly display format.
   *
   * @param timeString string — Time in "HH:mm" format.
   * @returns string — Formatted time, e.g., "2:30 PM".
   * @throws May throw error if `timeString` is not valid.
   * @sideEffects Creates a Date object to parse time.
   *
   * @example
   * const formattedTime = formatTime("14:30"); // "2:30 PM"
   */
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, "h:mm a");
  };

  return (
    // AppShell wraps the page content and provides a consistent layout with a sidebar and header
    <AppShell>
      {/* PageHeader with title and description */}
      <PageHeader
        title="Parent Dashboard"
        description={`Welcome, ${parent?.firstName + " " + parent?.middleName + " " + parent?.lastName || "Parent"}. Manage your children's activities and progress.`}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Card with children count */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Children</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {/* Icon */}
              <GraduationCap className="h-6 w-6 text-primary mr-2" />
              {/* Text */}
              <div className="text-2xl font-bold">{childrenCount || 0}</div>
            </div>
            <p className="text-xs text-muted-foreground">
              Enrolled in Institution
            </p>
          </CardContent>
        </Card>

        {/* Card with active enrollments count */}
        <Card>
          <CardHeader className="pb-2">
            {/* Title */}
            <CardTitle className="text-sm font-medium">
              Active Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-indigo-500 mr-2" />
              <div className="text-2xl font-bold">
                {activeEnrollments?.activeEnrollmentCount || 0}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>

        {/* Card with upcoming payments count */}
        <Card>
          <CardHeader className="pb-2">
            {/* Title */}
            <CardTitle className="text-sm font-medium">
              Upcoming Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {/* Icon */}
              <CreditCard className="h-6 w-6 text-amber-500 mr-2" />
              {/* Text */}
              <div className="text-2xl font-bold">
                {childPayments.filter((p: any) => p.status === "pending")
                  .length || 0}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Due in the next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Card with students list */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>My Students</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingChildrenCount ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : childrenCount === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                {/* Icon */}
                <GraduationCap className="h-10 w-10 text-muted-foreground mb-2" />
                {/* Text */}
                <h3 className="text-lg font-medium">No Students</h3>
                {/* Text */}
                <p className="text-sm text-muted-foreground mt-1">
                  No students are associated with your account.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {/* Map children */}
                {children.map((child: any) => (
                  <div
                    key={child.studentIds}
                    className={`p-4 cursor-pointer hover:bg-neutral-50 transition-colors ${
                      selectedChild === child.studentIds.toString()
                        ? "bg-neutral-50"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedChild(child.studentIds.toString())
                    }
                  >
                    {/* Avatar */}
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>
                          {getInitials(
                            `${child.studentFirstName} ${child.studentLastName}`,
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        {/* Text */}
                        <div className="font-medium">
                          {child.studentFirstName} {child.studentMiddleName}{" "}
                          {child.studentLastName}
                        </div>
                        {/* Text */}
                        <div className="text-xs text-muted-foreground">
                          ID: {child.studentId}
                        </div>
                      </div>
                    </div>
                    {/* Badge */}
                    <div className="mt-2 text-xs">
                      <Badge
                        variant={
                          child.studentStatus === "Active"
                            ? "default"
                            : "default"
                        }
                        className="mt-1"
                      >
                        {/* capitalize status */}
                        {capitalizeFirstLetter(child.studentStatus)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overview and Classes Tabs */}
        <Card className="md:col-span-3">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="classes">Classes</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {/* if selectedChild is not selected */}
            {!selectedChild ? (
              <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-md">
                <GraduationCap className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">Select a Child</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Please select a child from the list to view their details.
                </p>
              </div>
            ) : (
              <>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsContent value="overview" className="mt-0">
                    <div className="space-y-6">
                      {/* Enrolled Courses */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">
                          Enrolled Courses
                        </h3>
                        {isLoadingCourses ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                          </div>
                        ) : !studentCourses || studentCourses.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No active enrollments found.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Map studentCourses */}
                            {studentCourses.map(
                              (course: any, index: number) => (
                                <div
                                  key={index}
                                  className="border rounded-md p-4"
                                >
                                  {/* Course Name */}
                                  <div className="font-medium text-lg mb-2">
                                    {course.courseName}
                                  </div>
                                  {/* Batches */}
                                  <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">
                                      Batches:
                                    </div>
                                    {/* Map batches */}
                                    {course.batches.map(
                                      (batch: any, batchIndex: number) => (
                                        <div
                                          key={batchIndex}
                                          className="pl-2 border-l-2 border-blue-200"
                                        >
                                          <div className="text-sm font-medium">
                                            {batch.batchName}
                                          </div>
                                          <div className="text-xs text-muted-foreground mt-1">
                                            {batch.schedule.length} class
                                            {batch.schedule.length > 1
                                              ? "es"
                                              : ""}{" "}
                                            per week
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Class Schedule Tab */}
                  <TabsContent value="classes" className="mt-0">
                    <div className="space-y-6">
                      {/* Class Schedule details */}
                      <h3 className="text-lg font-medium mb-3">
                        Class Schedule
                      </h3>
                      {isLoadingCourses ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      ) : getStudentSchedules().length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No class schedules found.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {/* Map class schedules */}
                          {getStudentSchedules().map(
                            (entry: any, index: number) => (
                              <div
                                key={index}
                                className="p-4 border rounded-md hover:border-neutral-300 transition-colors"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-semibold text-neutral-900 text-lg">
                                      {entry.courseName}
                                    </h4>
                                    <div className="text-sm text-muted-foreground">
                                      Batch: {entry.batchName}
                                    </div>
                                  </div>
                                </div>

                                {/* Map schedules */}
                                {entry.schedules.map(
                                  (schedule: any, i: number) => (
                                    <div key={i} className="mb-2">
                                      <div className="flex justify-between items-center text-sm text-neutral-600">
                                        <div className="flex items-center">
                                          <Clock className="h-4 w-4 mr-1" />
                                          {formatTime(
                                            schedule.startTime,
                                          )} - {formatTime(schedule.endTime)}
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className="bg-blue-100 text-blue-800"
                                        >
                                          {schedule.day}
                                        </Badge>
                                      </div>
                                    </div>
                                  ),
                                )}

                                {/* View Details Button */}
                                <div className="mt-3 flex justify-end">
                                  <Button size="sm" variant="secondary">
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fixed Footer with user prop*/}
      <FixedFooter user={user} />
    </AppShell>
  );
}
