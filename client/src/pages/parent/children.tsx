import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";
import {
 Home,
 User,
 Calendar,
 Music2,
 BookOpen,
 Trophy,
 Clock,
 Star,
 ArrowRight,
 BarChart,
 Disc3,
 Heart,
 CheckCircle,
 XCircle
} from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { FixedFooter } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";


/**
 * ParentChildren Component
 *
 * @purpose Display a parent's children with tabs for overview, progress, and activities.
 * 
 * @param None
 * @returns {JSX.Element} Renders tabs and children list for the parent.
 * @sideEffects Fetches children data from API and manages active tab state.
 * @throws {Error} If fetching children fails.
 * 
 * @example
 * <ParentChildren />
 */
export default function ParentChildren() {
 const [activeTab, setActiveTab] = useState("overview");
 const { user } = useAuth();

 /**
 * Fetches the list of children associated with the logged-in parent.
 *
 * @purpose To provide parent components with the children data for UI display.
 * 
 * @param None directly. Uses the API endpoint `/api/students-with-parents`.
 * @returns {Array<Object>} Array of children objects.
 * @throws {Error} Throws an error if the API request fails.
 * @sideEffects Performs an asynchronous API call to fetch children data.
 * 
 * @example
 * const { data: children, isLoading } = useQuery(['/api/students-with-parents'], fetchChildren);
 * if (!isLoading) {
 *   children.forEach(child => console.log(child.name));
 * }
 */
 const { data: children = [], isLoading: isLoadingChildren } = useQuery({
  queryKey: ['/api/students-with-parents'],
  queryFn: async () => {
   const response = await fetch('/api/students-with-parents');
   if (!response.ok) {
    throw new Error('Failed to fetch children');
   }
   return response.json();
  }
 });


 /**
  * Fetches the list of courses associated with the parent’s children.
  *
  * @purpose To provide parent components with courses data for UI display.
  * 
  * @param None directly. Uses the API endpoint `/api/students/course`.
  * @returns {Array<Object>} Array of course objects.
  * @throws {Error} Throws an error if the API request fails.
  * @sideEffects Performs an asynchronous API call to fetch courses data.
  * 
  * @example
  * const { data: courses, isLoading } = useQuery(['/api/students/course'], fetchCourses);
  * if (!isLoading) {
  *   courses.forEach(course => console.log(course.name));
  * }
  */
 const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
  queryKey: ['/api/students/course'],
  queryFn: async () => {
   const response = await fetch('/api/students/course');
   if (!response.ok) {
    throw new Error('Failed to fetch courses');
   }
   return response.json();
  }
 });

 /**
 * Generates initials from a first name and last name.
 *
 * @purpose To display user initials, e.g., in avatars or profile placeholders.
 * 
 * @param {string} [firstName=''] - The first name of the user.
 * @param {string} [lastName=''] - The last name of the user.
 * @returns {string} Uppercase initials combining the first letters of the first and last name.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * getInitials("Riya", "Sharma"); // Returns "RS"
 * getInitials("Arjun"); // Returns "A"
 * getInitials(); // Returns ""
 */
 const getInitials = (firstName = '', lastName = '') => {
  const firstInitial = firstName ? firstName[0] : '';
  const lastInitial = lastName ? lastName[0] : '';
  return `${firstInitial}${lastInitial}`.toUpperCase();
 };

 /**
  * Defines breadcrumbs for the parent children page.
  *
  * @purpose To provide a navigational trail in the UI for user orientation.
  * 
  * @param None
  * @returns {Array<Object>} Array of breadcrumb objects with `title`, `href`, and optional `icon`.
  * @throws None
  * @sideEffects None
  * 
  * @example
  * <Breadcrumbs items={breadcrumbs} />
  */
 const breadcrumbs = [
  {
   title: "Home",
   href: "/parent/dashboard",
   icon: <Home className="h-4 w-4" />
  },
  {
   title: "Children"
  }
 ];

 return (
  // Appshell wraps the page content and provides a consistent layout, sidebar
  <AppShell>
    {/* Pahe head with title, description and breadcrumbs */}
   <PageHeader
    title="My Students"
    description="Manage your children's profiles and monitor their progress"
    breadcrumbs={breadcrumbs}
   />

   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    {/* Map through children and display them in cards */}
    {children.map((child: any) => (
     <Card key={child.studentIds} className="flex flex-col overflow-hidden">
      <CardHeader className="pb-0 pt-6">
       <div className="flex items-center">
        <Avatar className="h-16 w-16 mr-4">
         {/* AvatarFallback provides a fallback image if the avatarUrl is not available */}
         <AvatarFallback className="text-lg bg-primary text-primary-foreground">
          {getInitials(child.studentFirstName, child.studentLastName)}
         </AvatarFallback>
         {/* AvatarImage displays the avatar image if available */}
         {child.avatarUrl && (
          // Conditionally render AvatarImage only if child has an avatar URL
          <AvatarImage
           src={child.avatarUrl}
           alt={`${child.studentFirstName} ${child.studentLastName}`}
          />
         )}
        </Avatar>
        <div>
          {/* Display student’s full name */}
         <CardTitle className="text-xl">
          {child.studentFirstName} {child.studentMiddleName} {child.studentLastName}
         </CardTitle>
         {/* Display student’s ID and age */}
         <CardDescription className="mt-1 font-semibold">
          {child.studentId} • {child.studentAge} years old
          {/* You can add course count here if needed */}
         </CardDescription>
        </div>
       </div>
      </CardHeader>

      {/* Card content with enrolled courses */}
      <CardContent className="pt-4 flex-grow">
       <div className="space-y-4">
        <div>
         <h4 className="text-sm font-medium mb-2">Enrolled Courses</h4>
         <div className="space-y-2">
          <div>
           {/* Map through courses and display them in cards */}
           {(() => {
            const matchedStudent = courses.find(
             (entry: any) => entry.studentId === child.studentIds
            );
            const enrolledCourses = matchedStudent?.courses ?? [];

            return enrolledCourses.length > 0 ? (
              // If student has courses, list them
             enrolledCourses.map((course: any, index: number) => (
              <div
               key={index}
               className="flex items-center justify-between p-2 bg-muted rounded-lg"
              >
                {/* Display course name and batch name */}
               <div className="flex items-center">
                {/* Display course icon */}
                <Music2 className="h-5 w-5 mr-2 text-primary" />
                <div>
                 {/* Display course name */}
                 <div className="font-medium">{course.courseName}</div>
                 {/* Display batch name */}
                 <div className="text-xs text-gray-500">{course.batchName}</div>
                </div>
               </div>
              </div>
             ))
            ) : (
              // if no courses enrolled, display this message
             <div className="text-sm text-muted-foreground">No courses enrolled.</div>
            );
           })()}
          </div>
         </div>
        </div>
       </div>
      </CardContent>

      {/* Card footer with view details button */}
      <CardFooter className="border-t bg-muted/50 pt-4">
       <Button className="w-full" variant="outline" asChild>
        <a href={`#child-${child.studentId}`} onClick={() => setActiveTab("overview")}>
         View Details
         <ArrowRight className="ml-2 h-4 w-4" />
        </a>
       </Button>
      </CardFooter>
     </Card>
    ))}
   </div>

   {/* Student details section - separate for each student */}
   {children.map((child: any) => (
    <div key={child.studentId} id={`child-${child.studentId}`} className="mb-10">
     <Card>
      {/* Card header with student's name and avatar */}
      <CardHeader>
       <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
         <Avatar className="h-10 w-10 mr-4">
          <AvatarFallback className="bg-primary text-primary-foreground">
           {getInitials(child.studentFirstName, child.studentLastName)}
          </AvatarFallback>
          {child.avatarUrl && <AvatarImage src={child.avatarUrl} alt={child.studentFirstName} />}
         </Avatar>
         <CardTitle>{child.studentFirstName} {child.studentMiddleName} {child.studentLastName}'s Progress</CardTitle>
        </div>

        {/* Tabs for different child sections (Overview, Assignments, Notes) */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto md:mt-0 mt-4">
         <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="overview">
           {/* Overview tab icon */}
           <BarChart className="h-4 w-4 mr-2" />
           Overview
          </TabsTrigger>
         </TabsList>
         {/* Placeholder content for each tab */}
         <TabsContent value="overview"></TabsContent>
         <TabsContent value="assignments"></TabsContent>
         <TabsContent value="notes"></TabsContent>
        </Tabs>
       </div>
      </CardHeader>

      {/* Card content with student's performance metrics */}
      <CardContent>
        {/* Render Overview tab content when activeTab is "overview" */}
       {activeTab === "overview" && (
        <div className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Attendance card */}
          <Card>
           <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium text-gray-500">Attendance</CardTitle>
           </CardHeader>
           <CardContent>
            <div className="flex items-center">
             {/* <div className="text-2xl font-bold">{child.performance.attendance}%</div> */}
             <div className="ml-auto p-2 bg-green-100 rounded-full">
              <User className="h-5 w-5 text-green-600" />
             </div>
            </div>
           </CardContent>
          </Card>

          {/* Participation card */}
          <Card>
           <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium text-gray-500">Participation</CardTitle>
           </CardHeader>
           <CardContent>
            <div className="flex items-center">
             {/* <div className="text-2xl font-bold">{child.performance.participation}%</div> */}
             <div className="ml-auto p-2 bg-blue-100 rounded-full">
              <Heart className="h-5 w-5 text-blue-600" />
             </div>
            </div>
           </CardContent>
          </Card>

          {/* Progress card */}
          <Card>
           <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium text-gray-500">Progress</CardTitle>
           </CardHeader>
           <CardContent>
            <div className="flex items-center">
             {/* <div className="text-2xl font-bold">{child.performance.progress}%</div> */}
             <div className="ml-auto p-2 bg-purple-100 rounded-full">
              <BarChart className="h-5 w-5 text-purple-600" />
             </div>
            </div>
           </CardContent>
          </Card>

          {/* Achievements card */}
          <Card>
           <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium text-gray-500">Achievements</CardTitle>
           </CardHeader>
           <CardContent>
            <div className="flex items-center">
             {/* <div className="text-2xl font-bold">{child.performance.recentAchievements}</div> */}
             <div className="ml-auto p-2 bg-yellow-100 rounded-full">
              <Trophy className="h-5 w-5 text-yellow-600" />
             </div>
            </div>
           </CardContent>
          </Card>
         </div>

         {/* Enrolled Courses section */}
         <div>
          <h3 className="text-lg font-semibold mb-3">Enrolled Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          </div>
         </div>
        </div>
       )}

       {/* Assignments tab content */}
       {activeTab === "assignments" && (
        <div className="space-y-6">
         <div className="rounded-lg border">
          {/* Header: Current Assignments with pending count badge */}
          <div className="flex items-center justify-between p-4 border-b">
           <h3 className="text-lg font-semibold">Current Assignments</h3>
           {/* Count pending assignments across all courses */}
           <Badge variant="outline" className="bg-blue-100 text-blue-800">
            {child.courses.flatMap((c: any) => c.assignments).filter((a: any) => !a.completed).length} Pending
           </Badge>
          </div>
          {/* Scrollable area for assignments */}
          <ScrollArea className="h-[300px]">
           <div className="p-4">
            {child.courses.flatMap((course: any) =>
             course.assignments
              .filter((assignment: any) => !assignment.completed)
              .map((assignment: any) => (
               <div key={assignment.id} className="flex items-start p-3 border-b last:border-0">
                {/* Assignment icon */}
                <div className="p-2 rounded-full bg-blue-100 mr-3">
                 <Clock className="h-5 w-5 text-blue-600" />
                </div>
                {/* Assignment details */}
                <div className="flex-1">
                 <div className="flex justify-between items-start">
                  <div>
                   <div className="font-medium">{assignment.name}</div>
                   <div className="text-sm text-gray-500">
                    {course.name} • Due {format(assignment.dueDate, 'MMM d, yyyy')}
                   </div>
                  </div>
                  {/* View button */}
                  <Button variant="outline" size="sm">View</Button>
                 </div>
                </div>
               </div>
              ))
            )}
            {/* No pending assignments' message */}
            {child.courses.flatMap((c: any) => c.assignments).filter((a: any) => !a.completed).length === 0 && (
             <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No pending assignments at the moment</p>
             </div>
            )}
           </div>
          </ScrollArea>
         </div>

         {/* Completed Assignments section */}
         <div className="rounded-lg border">
          <div className="flex items-center justify-between p-4 border-b">
           <h3 className="text-lg font-semibold">Completed Assignments</h3>
           {/* Count completed assignments across all courses */}
           <Badge variant="outline" className="bg-green-100 text-green-800">
            {child.courses.flatMap((c: any) => c.assignments).filter((a: any) => a.completed).length} Completed
           </Badge>
          </div>
          <ScrollArea className="h-[200px]">
           <div className="p-4">
            {child.courses.flatMap((course: any) =>
             course.assignments
              .filter((assignment: any) => assignment.completed)
              .map((assignment: any) => (
               <div key={assignment.id} className="flex items-start p-3 border-b last:border-0">
                {/* Completed assignment icon */}
                <div className="p-2 rounded-full bg-green-100 mr-3">
                 <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                {/* Completed assignment details */}
                <div className="flex-1">
                 <div className="flex justify-between items-start">
                  <div>
                   <div className="font-medium">{assignment.name}</div>
                   <div className="text-sm text-gray-500">
                    {course.name} • Completed
                   </div>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                 </div>
                </div>
               </div>
              ))
            )}
            {/* Empty state when no completed assignments */}
            {child.courses.flatMap((c: any) => c.assignments).filter((a: any) => a.completed).length === 0 && (
             <div className="text-center py-8 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No completed assignments yet</p>
             </div>
            )}
           </div>
          </ScrollArea>
         </div>
        </div>
       )}

       {/* Notes tab content */}
       {activeTab === "notes" && (
        <div className="space-y-4">
         <h3 className="text-lg font-semibold">Teacher Feedback & Notes</h3>
         <div className="rounded-lg border">
          <ScrollArea className="h-[400px]">
           <div className="p-4 space-y-3">
            {/* map through courses */}
            {child.courses.map((course: any) => (
             <div key={course.id} className="space-y-3">
              <h4 className="font-medium flex items-center">
               <Music2 className="h-4 w-4 mr-2" />
               {course.name}
              </h4>
              
              {/* map through notes */}
              {course.notes.map((note: any) => (
               <div key={note.id} className="ml-6 p-3 bg-muted rounded-lg">
                <div className="text-sm text-gray-500 mb-1">
                 {format(note.date, 'MMMM d, yyyy')}
                </div>
                {/* note text */}
                <p>{note.text}</p>
               </div>
              ))}

              <Separator className="my-4" />
             </div>
            ))}
           </div>
          </ScrollArea>
         </div>
        </div>
       )}
      </CardContent>
     </Card>
    </div>
   ))}
   {/* fixed footer component with user prop*/}
   <FixedFooter user={user} />
  </AppShell>
 );
}