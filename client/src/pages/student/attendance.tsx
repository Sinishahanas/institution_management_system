import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  CalendarIcon,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  Users,
  Stethoscope,
  Plane,
  GraduationCap,
  Receipt,
  FileCheck,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

/**
 * StudentAttendance
 *
 * @purpose Manage a student's attendance UI: view records, submit leave requests, and schedule compensation classes.
 * @param None
 * @returns {JSX.Element} The Student Attendance UI (select course, view records, open forms).
 * @throws None
 * @sideEffects
 * - Initiates data fetching via React Query for courses, attendance and available batches.
 * - Manages local React state (selectedCourse, date, modal flags, uploadedDocument).
 * - Triggers mutations that post to server endpoints and show toasts.
 * @example
 * // used in a parent route
 * <StudentAttendance />
 */
export default function StudentAttendance() {
  // STATE //
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showCompensationForm, setShowCompensationForm] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);

  /**
   * useQuery ["student-courses"]
   *
   * @purpose Fetch the list of courses associated with the current student.
   * @param None (query depends on server session / auth)
   * @returns {Promise<any[]>} Resolves to an array of course objects.
   * @throws {Error} Throws when the fetch response is not ok (e.g. network/server error).
   * @sideEffects
   * - Performs a GET request to `/api/student/courses`.
   * - Populates the `courses` React Query cache and component state via the hook.
   * @example
   * const { data: courses } = useQuery(["student-courses"], ...);
   */
  const {
    data: courses,
    error: coursesError,
    isLoading: coursesLoading,
  } = useQuery<any[]>({
    queryKey: ["student-courses"],
    queryFn: async () => {
      const response = await fetch("/api/student/courses");
      if (!response.ok) throw new Error("Failed to fetch courses");
      return response.json();
    },
    retry: false,
  });

  /**
   * useQuery ["student-attendance", selectedCourse]
   *
   * @purpose Fetch attendance records for the selected course.
   * @param selectedCourse - string | undefined course id used to filter attendance.
   * @returns {Promise<any[]>} Resolves to an array of attendance records.
   * @throws {Error} Throws when the fetch response is not ok.
   * @sideEffects
   * - Performs a GET request to `/api/student/attendance?courseId=${selectedCourse}`.
   * - Updates React Query cache and enables component to render attendance.
   * @example
   * const { data: attendance } = useQuery(["student-attendance", selectedCourse], ...);
   */
  const {
    data: attendance,
    error: attendanceError,
    isLoading: attendanceLoading,
    refetch: refetchAttendance,
  } = useQuery<any[]>({
    queryKey: ["student-attendance", selectedCourse],
    queryFn: async () => {
      const response = await fetch(
        `/api/student/attendance?courseId=${selectedCourse}`,
      );
      if (!response.ok) throw new Error("Failed to fetch attendance");
      return response.json();
    },
    retry: false,
  });

  /**
   * useQuery ["available-batches", selectedCourse]
   *
   * @purpose Fetch batches available for scheduling a compensation class for the given course.
   * @param selectedCourse - string id of the course.
   * @returns {Promise<any[]>} Resolves to an array of available batch objects.
   * @throws {Error} Throws when the fetch response is not ok.
   * @sideEffects
   * - Performs a GET request to `/api/student/available-batches?courseId=${selectedCourse}`.
   * - Only runs when `selectedCourse` is set and `showCompensationForm` is true (enabled flag).
   * @example
   * const { data: availableBatches } = useQuery(["available-batches", selectedCourse], { enabled: !!selectedCourse && showCompensationForm });
   */
  const { data: availableBatches } = useQuery<any[]>({
    queryKey: ["available-batches", selectedCourse],
    queryFn: async () => {
      const response = await fetch(
        `/api/student/available-batches?courseId=${selectedCourse}`,
      );
      if (!response.ok) throw new Error("Failed to fetch available batches");
      return response.json();
    },
    enabled: !!selectedCourse && showCompensationForm,
  });

  /**
   * createLeaveRequestMutation (useMutation)
   *
   * @purpose Submit a student leave request (with optional uploaded document).
   * @param (data: FormData) - FormData must include fields expected by the endpoint (e.g. courseId, missedDate, reason, file).
   * @returns {Promise<any>} Server response JSON on success.
   * @throws {Error} Throws when the POST response is not ok.
   * @sideEffects
   * - POSTs FormData to `/api/student/leave-requests`.
   * - Shows a toast on success and closes the leave form.
   * - Calls `refetchAttendance()` to refresh attendance after success.
   * @example
   * const formData = new FormData(); formData.append("courseId", "1"); ...
   * createLeaveRequestMutation.mutate(formData);
   */
  const createLeaveRequestMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/student/leave-requests", {
        method: "POST",
        body: data,
      });
      if (!response.ok) throw new Error("Failed to submit leave request");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Leave request submitted",
        description: "Your leave request has been submitted for approval.",
      });
      setShowLeaveForm(false);
      // Refresh attendance data
      refetchAttendance();
    },
  });

  /**
   * scheduleCompensationMutation (useMutation)
   *
   * @purpose Schedule a compensation (make-up) class for a missed date.
   * @param {{
   *   courseId: string;
   *   missedDate: Date;
   *   compensationBatchId: string;
   *   compensationDate: Date;
   * }} data - Payload sent to server.
   * @returns {Promise<any>} Server response JSON on success.
   * @throws {Error} Throws when the POST response is not ok.
   * @sideEffects
   * - POSTs JSON to `/api/student/compensation-classes`.
   * - Shows a toast on success and closes the compensation form.
   * - Calls `refetchAttendance()` to refresh attendance after success.
   * @example
   * scheduleCompensationMutation.mutate({
   *   courseId: "12",
   *   missedDate: new Date("2025-09-01"),
   *   compensationBatchId: "34",
   *   compensationDate: new Date("2025-09-10")
   * });
   */
  const scheduleCompensationMutation = useMutation({
    mutationFn: async (data: {
      courseId: string;
      missedDate: Date;
      compensationBatchId: string;
      compensationDate: Date;
    }) => {
      const response = await fetch("/api/student/compensation-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok)
        throw new Error("Failed to schedule compensation class");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Compensation class scheduled",
        description: "Your compensation class has been scheduled successfully.",
      });
      setShowCompensationForm(false);
      // Refresh attendance data
      refetchAttendance();
    },
  });

  /**
   * markLeaveMutation (useMutation)
   *
   * @purpose Mark attendance records as "leave" for specific dates.
   * @param {Object} data - The leave marking payload.
   * @param {string[]} data.dates - Array of date strings (e.g., ["2025-04-29"]).
   * @param {string} data.status - The attendance status to mark (e.g., "leave").
   * @returns {Promise<any>} The server's response in JSON format.
   * @throws {Error} Throws if the API response is not OK (HTTP error).
   * @sideEffects
   * - Sends a POST request to `/api/student/attendance/mark-leave`.
   * - Displays a success toast upon completion.
   * - Refetches attendance data to refresh the UI.
   * @example
   * markLeaveMutation.mutate({
   *   dates: ["2025-04-29", "2025-04-30"],
   *   status: "leave"
   * });
   */
  const markLeaveMutation = useMutation({
    mutationFn: async (data: { dates: string[]; status: string }) => {
      const response = await fetch("/api/student/attendance/mark-leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to mark leave");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Leave marked successfully",
        description: "Your attendance has been updated.",
      });
      refetchAttendance();
    },
  });

  /**
   * calculateStats
   *
   * @purpose Compute attendance statistics (percentage) for each attendance category.
   * @param {any[]} attendanceData - Array of attendance record objects (each with a `status` field).
   * @returns {Object} Object with percentages for each category: present, absent, class_cancel, compensation, leave.
   * @throws None
   * @sideEffects None
   * @example
   * const stats = calculateStats(attendance);
   * // => { present: 75, absent: 10, leave: 15, ... }
   */
  const calculateStats = (attendanceData: any[] = []) => {
    const total = attendanceData.length || 1; // Avoid division by zero
    const stats = {
      present: 0,
      absent: 0,
      class_cancel: 0,
      compensation: 0,
      leave: 0,
    };

    attendanceData?.forEach((record) => {
      if (stats.hasOwnProperty(record.status)) {
        stats[record.status as keyof typeof stats]++;
      }
    });

    return {
      present: Math.round((stats.present / total) * 100),
      absent: Math.round((stats.absent / total) * 100),
      class_cancel: Math.round((stats.class_cancel / total) * 100),
      compensation: Math.round((stats.compensation / total) * 100),
      leave: Math.round((stats.leave / total) * 100),
    };
  };

  const stats = calculateStats(attendance);

  /**
   * useEffect (Error Toast Handler)
   *
   * @purpose Display error toasts if fetching courses or attendance fails.
   * @param None
   * @returns Void
   * @throws None
   * @sideEffects
   * - Triggers toast notifications when `coursesError` or `attendanceError` changes.
   * @example
   * // Automatically runs when query errors occur
   * useEffect(() => { ... }, [coursesError, attendanceError]);
   */
  useEffect(() => {
    if (coursesError) {
      toast({
        title: "Error loading courses",
        description: "Please try again later",
        variant: "destructive",
      });
    }

    if (attendanceError) {
      toast({
        title: "Error loading attendance records",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  }, [coursesError, attendanceError, toast]);

  /**
   * useEffect (Auto Mark Leave)
   *
   * @purpose Automatically mark leave for predefined dates when the component mounts.
   * @param None
   * @returns Void
   * @throws None
   * @sideEffects
   * - Calls `markLeaveMutation.mutate()` once during component mount.
   * - Sends leave data for the specified hardcoded dates.
   * @example
   * // Runs on mount
   * useEffect(() => {
   *   markLeaveMutation.mutate({ dates: ["2025-04-29"], status: "leave" });
   * }, []);
   */
  useEffect(() => {
    const dates = ["2025-04-29", "2025-04-30"];
    markLeaveMutation.mutate({
      dates,
      status: "leave",
    });
  }, []);

  /**
   * getStatusIcon
   *
   * @purpose Return a corresponding icon component for a given attendance status.
   * @param {string} status - The attendance status ("present", "absent", "leave", etc.).
   * @returns {JSX.Element | null} The icon element representing the status, or null if unknown.
   * @throws None
   * @sideEffects None
   * @example
   * const icon = getStatusIcon("present"); // ✅ Green check icon
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "absent":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "class_cancel":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "compensation":
        return <Clock className="h-5 w-5 text-purple-500" />;
      case "leave":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  /**
   * getStatusText
   *
   * @purpose Return human-readable text for a given attendance status.
   * @param {string} status - The internal attendance status code.
   * @returns {string} The corresponding readable status text.
   * @throws None
   * @sideEffects None
   * @example
   * getStatusText("class_cancel"); // => "Class Cancelled"
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case "present":
        return "Present";
      case "absent":
        return "Absent";
      case "class_cancel":
        return "Class Cancelled";
      case "compensation":
        return "Compensation";
      case "leave":
        return "Leave";
      default:
        return status;
    }
  };

  /**
   * handleLeaveRequest
   *
   * @purpose Open the leave request form for a specific course and date.
   * @param {string} courseId - ID of the course for which leave is being requested.
   * @param {Date} date - The date of the missed class.
   * @returns Void
   * @throws None
   * @sideEffects
   * - Updates local state (`selectedCourse`, `date`).
   * - Opens the leave request modal by setting `showLeaveForm` to true.
   * @example
   * handleLeaveRequest("101", new Date("2025-10-05"));
   */
  const handleLeaveRequest = (courseId: string, date: Date) => {
    setSelectedCourse(courseId);
    setDate(date);
    setShowLeaveForm(true);
  };

  /**
   * handleCompensationRequest
   *
   * @purpose Open the compensation class form for a specific course and date.
   * @param {string} courseId - ID of the course for which compensation is being requested.
   * @param {Date} date - The date of the missed class to be compensated.
   * @returns Void
   * @throws None
   * @sideEffects
   * - Updates local state (`selectedCourse`, `date`).
   * - Opens the compensation form modal by setting `showCompensationForm` to true.
   * @example
   * handleCompensationRequest("102", new Date("2025-10-10"));
   */
  const handleCompensationRequest = (courseId: string, date: Date) => {
    setSelectedCourse(courseId);
    setDate(date);
    setShowCompensationForm(true);
  };

  return (
    // Appshell wraps the page content and provides a consistent layout with sidebar, and header
    <AppShell>
      <div className="flex flex-col min-h-screen">
        {/* PageHeader with title, description, and breadcrumbs */}
        <PageHeader
          title="My Attendance"
          description="Track your attendance across all courses"
          breadcrumbs={[
            {
              title: "Dashboard",
              href: "/student/dashboard",
              icon: <Clock className="h-4 w-4" />,
            },
            { title: "Attendance", icon: <Clock className="h-4 w-4" /> },
          ]}
        />

        {/* Main content area */}
        <div className="flex-1 space-y-4 p-6 pt-2">
          {/* Attendance Summary Card */}
          <Card>
            {/* Card Header */}
            <CardHeader>
              {/* Card Title */}
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            {/* Card Content */}
            <CardContent>
              {/* Attendance Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                {/* Present Card */}
                <Card className="bg-green-50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">
                        Present
                      </p>
                      <h3 className="text-2xl font-bold text-green-700">
                        {attendanceLoading ? (
                          <Skeleton className="h-8 w-12" />
                        ) : (
                          `${stats.present}%`
                        )}
                      </h3>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </CardContent>
                </Card>

                {/* Absent Card */}
                <Card className="bg-red-50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Absent</p>
                      <h3 className="text-2xl font-bold text-red-700">
                        {attendanceLoading ? (
                          <Skeleton className="h-8 w-12" />
                        ) : (
                          `${stats.absent}%`
                        )}
                      </h3>
                    </div>
                    <XCircle className="h-8 w-8 text-red-500" />
                  </CardContent>
                </Card>

                {/* Class Cancelled Card */}
                <Card className="bg-amber-50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-600">
                        Class Cancelled
                      </p>
                      <h3 className="text-2xl font-bold text-amber-700">
                        {attendanceLoading ? (
                          <Skeleton className="h-8 w-12" />
                        ) : (
                          `${stats.class_cancel}%`
                        )}
                      </h3>
                    </div>
                    <AlertCircle className="h-8 w-8 text-amber-500" />
                  </CardContent>
                </Card>

                {/* Compensation Hover Card */}
                <HoverCard>
                  <HoverCardTrigger>
                    <Card className="bg-purple-50 cursor-pointer hover:bg-purple-100 transition-colors">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">
                            Compensation
                          </p>
                          <h3 className="text-2xl font-bold text-purple-700">
                            {attendanceLoading ? (
                              <Skeleton className="h-8 w-12" />
                            ) : (
                              `${stats.compensation}%`
                            )}
                          </h3>
                        </div>
                        <Clock className="h-8 w-8 text-purple-500" />
                      </CardContent>
                    </Card>
                  </HoverCardTrigger>
                  {/* Compensation Hover Card Content - display content when hovering over the card*/}
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">
                        Compensation Class Rules
                      </h4>
                      <ul className="text-sm space-y-3">
                        <li className="flex items-start">
                          {/* Clock icon */}
                          <Clock className="h-4 w-4 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>
                            Can only be taken within the same month of absence
                          </span>
                        </li>
                        <li className="flex items-start">
                          {/* Map Pin icon */}
                          <MapPin className="h-4 w-4 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>
                            Must be at same brand but from diiferent locations
                          </span>
                        </li>
                        <li className="flex items-start">
                          {/* Users icon */}
                          <Users className="h-4 w-4 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>
                            Student's batch will not be changed—no duplication
                            or swap
                          </span>
                        </li>
                        <li className="flex items-start">
                          {/* Check Circle icon */}
                          <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>
                            Attendance must be verified before marking
                            compensation
                          </span>
                        </li>
                      </ul>
                      {/* Compensation How to Request */}
                      <div className="mt-3 bg-purple-50 p-2 rounded text-sm">
                        <p className="font-medium text-purple-700">
                          How to Request:
                        </p>
                        <ol className="list-decimal ml-5 mt-1 text-purple-600 space-y-1">
                          <li>Inform administration about absence</li>
                          <li>Choose available compensation slot</li>
                          <li>Wait for verification and confirmation</li>
                        </ol>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>

                {/* Leave Card - display content when hovering over the card*/}
                <HoverCard>
                  <HoverCardTrigger>
                    <Card className="bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">
                            Leave
                          </p>
                          <h3 className="text-2xl font-bold text-blue-700">
                            {attendanceLoading ? (
                              <Skeleton className="h-8 w-12" />
                            ) : (
                              `${stats.leave}%`
                            )}
                          </h3>
                        </div>
                        {/* Alert Circle icon */}
                        <AlertCircle className="h-8 w-8 text-blue-500" />
                      </CardContent>
                    </Card>
                  </HoverCardTrigger>
                  {/* Leave Card Hover Content - display content when hovering over the card*/}
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                        <h4 className="text-sm font-semibold">
                          Leave of Absence & Refund Policy
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground ml-7">
                        The following types of leave are eligible for refund
                        when informed in advance:
                      </p>
                      <ul className="text-sm space-y-3 ml-7">
                        <li className="flex items-start">
                          {/* Stethoscope icon */}
                          <Stethoscope className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <span className="text-blue-600">Medical Leave</span>
                            <p className="text-muted-foreground text-xs mt-1">
                              Must provide medical certificate or documentation
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          {/* Plane icon */}
                          <Plane className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <span className="text-blue-600">
                              Vacation Leave
                            </span>
                            <p className="text-muted-foreground text-xs mt-1">
                              Minimum 1 week advance notice required
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          {/* Graduation Cap icon */}
                          <GraduationCap className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <span className="text-blue-600">
                              Academic Exams
                            </span>
                            <p className="text-muted-foreground text-xs mt-1">
                              Provide exam schedule from educational
                              Institutiontution
                            </p>
                          </div>
                        </li>
                      </ul>
                      {/* How to Request a Refund - content displayed when hovering over the card */}
                      <div className="text-sm bg-blue-50 p-3 rounded mt-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Receipt className="h-4 w-4 text-blue-600" />
                          <p className="font-medium text-blue-700">
                            How to Request a Refund:
                          </p>
                        </div>
                        <ol className="list-none space-y-2 ml-6">
                          <li className="flex items-center gap-2 text-blue-600">
                            <FileCheck className="h-4 w-4 flex-shrink-0" />
                            <span>
                              Submit leave request with supporting documents
                            </span>
                          </li>
                          <li className="flex items-center gap-2 text-blue-600">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>Approval will be processed shortly</span>
                          </li>
                          <li className="flex items-center gap-2 text-blue-600">
                            <Wallet className="h-4 w-4 flex-shrink-0" />
                            <span>
                              Refund will be credited in next billing cycle
                            </span>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>

              {/* Select Course */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Select Course
                  </label>
                  <Select
                    defaultValue={selectedCourse}
                    onValueChange={(value) => {
                      setSelectedCourse(value);
                      refetchAttendance();
                    }}
                    disabled={coursesLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Courses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Courses</SelectLabel>
                        <SelectItem value="all">All Courses</SelectItem>
                        {/* map over courses */}
                        {courses?.map((course) => (
                          <SelectItem
                            key={course.id}
                            value={course.id.toString()}
                          >
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Select Month */}
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Select Month
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          "w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        )}
                      >
                        {date ? format(date, "MMMM yyyy") : "Select month"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Attendance Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {/* Table Headers */}
                      <TableHead className="w-[150px]">Date</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  {/* Attendance Table Body */}
                  <TableBody>
                    {attendanceLoading ? (
                      Array(5)
                        .fill(0)
                        .map((_, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Skeleton className="h-5 w-20" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-40" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-24" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Skeleton className="h-5 w-20 mx-auto" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-32" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-20" />
                            </TableCell>
                          </TableRow>
                        ))
                    ) : attendance && attendance.length > 0 ? (
                      attendance.map((record, index) => (
                        <TableRow key={index}>
                          {/* Date */}
                          <TableCell className="font-medium">
                            {record.date
                              ? format(new Date(record.date), "dd MMM yyyy")
                              : "15 Apr 2023"}
                          </TableCell>
                          {/* Course */}
                          <TableCell>
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                              {record.courseName || "Guitar Fundamentals"}
                            </div>
                          </TableCell>
                          {/* Teacher */}
                          <TableCell>
                            {record.teacherName || "John Doe"}
                          </TableCell>
                          {/* Status */}
                          <TableCell className="text-center">
                            {record.date === "2025-04-29" ||
                            record.date === "2025-04-30" ? (
                              <div className="flex items-center justify-center text-blue-500">
                                <Clock className="h-4 w-4 mr-1" />
                                Leave
                              </div>
                            ) : (
                              // Original status display
                              <div
                                className={cn(
                                  "flex items-center justify-center",
                                  {
                                    "text-green-500":
                                      record.status === "present",
                                    "text-red-500": record.status === "absent",
                                    "text-yellow-500": record.status === "late",
                                    "text-blue-500": record.status === "leave",
                                    "text-purple-500":
                                      record.status === "compensation",
                                  },
                                )}
                              >
                                {getStatusIcon(record.status)}
                                {record.status.charAt(0).toUpperCase() +
                                  record.status.slice(1)}
                              </div>
                            )}
                          </TableCell>
                          {/* Remarks */}
                          <TableCell className="text-muted-foreground">
                            {record.status === "compensation" &&
                            record.compensationDetails ? (
                              <HoverCard>
                                <HoverCardTrigger>
                                  <span className="text-purple-600 cursor-help">
                                    {record.remarks || "Compensation class"}
                                  </span>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">
                                      Compensation Class Details
                                    </h4>
                                    <div className="text-sm space-y-1">
                                      <p>
                                        <span className="font-medium">
                                          Original Class:
                                        </span>{" "}
                                        {format(
                                          new Date(
                                            record.compensationDetails
                                              .originalClassDate,
                                          ),
                                          "dd MMM yyyy",
                                        )}
                                      </p>
                                      <p>
                                        <span className="font-medium">
                                          Original Batch:
                                        </span>{" "}
                                        {
                                          record.compensationDetails
                                            .originalBatchId
                                        }
                                      </p>
                                      <p>
                                        <span className="font-medium">
                                          Compensation at:
                                        </span>{" "}
                                        {record.compensationDetails.branch}
                                      </p>
                                    </div>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            ) : (
                              record.remarks || "-"
                            )}
                          </TableCell>
                          {/* Action buttons to request leave and compensation */}
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleLeaveRequest(
                                    record.courseId,
                                    new Date(record.date),
                                  )
                                }
                              >
                                <Receipt className="w-4 h-4 mr-2" />
                                Request Leave
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleCompensationRequest(
                                    record.courseId,
                                    new Date(record.date),
                                  )
                                }
                              >
                                <FileCheck className="w-4 h-4 mr-2" />
                                Schedule Compensation
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      // No attendance records found
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">
                              No attendance records found
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Leave Request Dialog */}
      {showLeaveForm && (
        // Leave Request Dialog
        <Dialog open={showLeaveForm} onOpenChange={setShowLeaveForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Leave Request</DialogTitle>
              <DialogDescription>
                Submit your leave request with supporting documents for approval
                and possible refund.
              </DialogDescription>
            </DialogHeader>
            {/* Leave Request Form submission logic */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData();
                formData.append("courseId", selectedCourse);
                formData.append("date", date?.toISOString() || "");
                formData.append("leaveType", selectedLeaveType);
                if (uploadedDocument) {
                  formData.append("document", uploadedDocument);
                }
                createLeaveRequestMutation.mutate(formData);
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  {/* Leave Type */}
                  <Label>Leave Type</Label>
                  <Select
                    value={selectedLeaveType}
                    onValueChange={setSelectedLeaveType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical">
                        <div className="flex items-center">
                          <Stethoscope className="w-4 h-4 mr-2" />
                          Medical Leave
                        </div>
                      </SelectItem>
                      <SelectItem value="vacation">
                        <div className="flex items-center">
                          <Plane className="w-4 h-4 mr-2" />
                          Vacation
                        </div>
                      </SelectItem>
                      <SelectItem value="exam">
                        <div className="flex items-center">
                          <GraduationCap className="w-4 h-4 mr-2" />
                          Exam
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Supporting Document */}
                <div className="grid gap-2">
                  <Label>Supporting Document</Label>
                  <Input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setUploadedDocument(e.target.files[0]);
                      }
                    }}
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload relevant documents for refund eligibility
                  </p>
                </div>
              </div>

              {/* Dialog Footer - Submit Button */}
              <DialogFooter>
                <Button type="submit" disabled={!selectedLeaveType}>
                  Submit Request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Compensation Class Dialog */}
      {showCompensationForm && (
        <Dialog
          open={showCompensationForm}
          onOpenChange={setShowCompensationForm}
        >
          <DialogContent>
            {/* Dialog Header */}
            <DialogHeader>
              <DialogTitle>Schedule Compensation Class</DialogTitle>
              <DialogDescription>
                Schedule a compensation class for your missed session. Must be
                taken within the same month.
              </DialogDescription>
            </DialogHeader>

            {/* Compensation Class Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!date || !selectedBatch) return;

                scheduleCompensationMutation.mutate({
                  courseId: selectedCourse,
                  missedDate: date,
                  compensationBatchId: selectedBatch,
                  compensationDate: new Date(), // This should be selected by the student
                });
              }}
            >
              <div className="grid gap-4 py-4">
                {/* Available Batches */}
                <div className="grid gap-2">
                  <Label>Available Batches</Label>
                  <Select
                    value={selectedBatch}
                    onValueChange={setSelectedBatch}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* map available batches */}
                      {availableBatches?.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            {batch.name} - {batch.location}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Compensation Date */}
                <div className="grid gap-2">
                  <Label>Compensation Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => {
                          // Disable dates outside current month
                          const now = new Date();
                          return (
                            date < new Date() ||
                            date.getMonth() !== now.getMonth() ||
                            date.getFullYear() !== now.getFullYear()
                          );
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Dialog Footer - Submit Button */}
              <DialogFooter>
                <Button type="submit" disabled={!selectedBatch || !date}>
                  Schedule Compensation
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </AppShell>
  );
}
