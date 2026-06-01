import { useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Book, Calendar, Clock, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";


/**
 * StudentCourses
 *
 * @purpose Display a list of all courses the logged-in student is enrolled in, 
 *          including course details such as schedule, duration, and assigned teacher. 
 *          It also handles loading, error, and empty states gracefully.
 *
 * @param None
 * @returns {JSX.Element} A fully rendered UI page displaying student course cards or fallback messages.
 * @throws {Error} Throws an error if the course data fails to fetch from `/api/student/courses`.
 * @sideEffects Displays a toast notification when a network or fetch error occurs.
 *
 * @example
 * // Usage inside a React Router route
 * import StudentCourses from "@/pages/student/courses";
 *
 * export default function App() {
 *   return (
 *     <Routes>
 *       <Route path="/student/courses" element={<StudentCourses />} />
 *     </Routes>
 *   );
 * }
 */
export default function StudentCourses() {
  const { toast } = useToast();

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
    isLoading: coursesLoading
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
        variant: "destructive"
      });
    }
  }, [coursesError, toast]);

  return (
    // Appshell wraps the page with the sidebar and header
    <AppShell>
      <div className="flex flex-col min-h-screen">
        {/* PageHeader with title, description, and breadcrumbs */}
        <PageHeader 
          title="My Courses" 
          description="View all your enrolled courses"
          breadcrumbs={[
            { title: "Dashboard", href: "/student/dashboard", icon: <Book className="h-4 w-4]" /> },
            { title: "My Courses", icon: <BookOpen className="h-4 w-4" /> }
          ]}
        />
        
        <div className="flex-1 space-y-4 p-6 pt-2">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Loading state: show skeleton cards while courses are being fetched */}
            {coursesLoading ? (
              Array(3).fill(0).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="h-44 w-full" /> {/* Placeholder for course image/banner */}
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" /> {/* Placeholder for course title */}
                    <Skeleton className="h-4 w-1/2" /> {/* Placeholder for teacher name */}
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" /> {/* Placeholder for course schedule */}
                    <Skeleton className="h-4 w-3/4 mb-2" /> {/* Placeholder for course duration */}
                    <Skeleton className="h-8 w-full mt-4" /> {/* Placeholder for button or extra info */}
                  </CardContent>
                </Card>
              ))
            ) : courses && courses.length > 0 ? (
              /* Courses loaded: render course cards */
              courses.map((course, index) => (
                <Card key={index} className="overflow-hidden">
                  {/* Course banner area */}
                  <div className="h-44 bg-primary/10 relative flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-primary/60" />
                    {course.category && (
                      <Badge className="absolute top-3 right-3">
                        {course.category || "Music"}
                      </Badge>
                    )}
                  </div>

                  {/* course header */}
                  <CardHeader>
                    <CardTitle>{course.name || "Guitar Fundamentals"}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Teacher: {course.teacherName || "John Doe"}
                    </div>
                  </CardHeader>

                  {/* course details */}
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{course.schedule || "Mon, Wed - 4:30 PM to 6:00 PM"}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{course.duration || "12 weeks"} • {course.progress || "Week 5"}</span>
                      </div>
                    </div>
                    {/* <Button className="w-full">View Details</Button> */}
                  </CardContent>
                </Card>
              ))
            ) : (
              /* No courses enrolled: fallback view */
              <div className="col-span-full flex flex-col items-center justify-center h-60 text-center">
                <Book className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No courses enrolled</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  You are not enrolled in any courses yet
                </p>
                <Button>Browse Available Courses</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}