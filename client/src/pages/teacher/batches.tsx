import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  Music, 
  Users, 
  MapPin, 
  BookOpen, 
  Search,
  ChevronRight,
  Pencil,
  FileText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn, getInitials } from "@/lib/utils";

/**
 * TeacherBatches component
 *
 * @purpose Display a list of batches for the logged-in teacher, with search functionality
 *          and the ability to view details of a selected batch.
 *
 * @param None
 * @returns {JSX.Element} Renders the batches UI for the teacher.
 * @throws None
 * @sideEffects 
 * - Fetches batches from the API using `useQuery`.
 * - Updates component state when a batch is selected or when the search query changes.
 *
 * @example
 * <TeacherBatches />
 */
export default function TeacherBatches() {
  const { user } = useAuth();

  /**
   * @purpose Store the currently selected batch for viewing details.
   * 
   * @param None
   * @returns {any | null} The currently selected batch object or null.
   * @throws None
   * @sideEffects Updated when handleViewBatch is called.
   * 
   * @example
   * setSelectedBatch(batch);
   */
  const [selectedBatch, setSelectedBatch] = useState<any>(null);

   /**
   * @purpose Control the visibility of the batch details modal.
   * 
   * @param None
   * @returns {boolean} Whether the batch details modal is open.
   * @throws None
   * @sideEffects Updated when handleViewBatch is called or modal is closed.
   * 
   * @example
   * setIsBatchDetailsOpen(true);
   */
  const [isBatchDetailsOpen, setIsBatchDetailsOpen] = useState(false);

  /**
   * @purpose Store the search query for filtering batches.
   * 
   * @param None
   * @returns {string} The current search query.
   * @throws None
   * @sideEffects Updated when the search input changes.
   * 
   * @example
   * setSearchQuery("music");
   */
  const [searchQuery, setSearchQuery] = useState("");
  
  /**
   * @purpose Fetch batches for the logged-in teacher.
   * 
   * @param None
   * @returns {any[]} Array of batch objects.
   * @throws None (errors handled internally by React Query)
   * @sideEffects Triggers a network request to `/api/batches/teacher`.
   * 
   * @example
   * const { data: batches } = useQuery(["/api/batches/teacher"]);
   */
  const { data: batches = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/batches/teacher"],
    enabled: !!user,
  });

  /**
   * @purpose Filter batches based on searchQuery state.
   * 
   * @param None
   * @returns {any[]} Array of batches whose `name` or `courseName` contains the search query.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * filteredBatches; // Returns batches containing "math" in name or courseName
   */
  const filteredBatches = batches.filter((batch: any) => 
    batch.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    batch.courseName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /**
   * Open the batch details view for a selected batch.
   *
   * @purpose Set the selected batch and open the batch details modal.
   * 
   * @param {any} batch - The batch object for which to view details.
   * @returns {void}
   * @throws None
   * @sideEffects Updates `selectedBatch` and `isBatchDetailsOpen` state.
   * 
   * @example
   * handleViewBatch(batches[0]); // Opens details modal for the first batch
   */
  const handleViewBatch = (batch: any) => {
    setSelectedBatch(batch);
    setIsBatchDetailsOpen(true);
  };

  return (
    // Appshell wraps the content of the page with sidebar and header
    <AppShell>
      {/* PageHeader component for the page title and description */}
      <PageHeader
        title="My Batches"
        description="View and manage your assigned classes and student groups"
      />

      <div className="grid grid-cols-1 gap-6">
        {/* Search and Filter Bar for batches */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                {/* Search icon */}
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                {/* Search input - search batches */}
                <Input
                  type="text"
                  placeholder="Search batches..."
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Batch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Loading state */}
          {isLoading ? (
            <div className="col-span-full text-center py-10">
              Loading your batches...
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="col-span-full text-center py-10 text-neutral-500">
              No batches found
            </div>
          ) : (
            filteredBatches.map((batch: any) => (
              // Card for each batch
              <Card key={batch.id} className="overflow-hidden">
                <div 
                  className={cn(
                    "h-2 w-full",
                    batch.category === "music" && "bg-blue-500",
                    batch.category === "dance" && "bg-purple-500",
                    batch.category === "art" && "bg-orange-500",
                    !batch.category && "bg-primary"
                  )}
                ></div>
                {/* Batch Header */}
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      {/* Batch Name */}
                      <CardTitle>{batch.name}</CardTitle>
                      {/* Course Name */}
                      <CardDescription>{batch.courseName}</CardDescription>
                    </div>
                    {/* Batch Status */}
                    <Badge 
                      variant={batch.status === "active" ? "default" : "outline"}
                      className={batch.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                      {batch.status || "Active"}
                    </Badge>
                  </div>
                </CardHeader>
                {/* Batch Content */}
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {/* Batch Time */}
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{batch.time || `${batch.startTime} - ${batch.endTime}`}</span>
                    </div>
                    {/* Batch Days */}
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{batch.days || "Mon, Wed, Fri"}</span>
                    </div>
                    {/* Batch Branch */}
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{batch.branch || "Main Branch"}</span>
                    </div>
                    {/* Batch Student Count */}
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{batch.studentCount || "12"} students enrolled</span>
                    </div>
                  </div>
                </CardContent>
                {/* Batch Footer */}
                <CardFooter className="pt-0 flex justify-end">
                  {/* View Batch Details Button */}
                  <Button 
                    variant="outline"
                    onClick={() => handleViewBatch(batch)}
                  >
                    View Details
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Batch Details Dialog */}
      <Dialog open={isBatchDetailsOpen} onOpenChange={setIsBatchDetailsOpen}>
        {/* Dialog Content */}
        <DialogContent className="sm:max-w-[700px] overflow-y-auto max-h-[90vh]">
          {/* Dialog Header */}
          <DialogHeader>
            {/* Dialog Title */}
            <DialogTitle>Batch Details</DialogTitle>
            {/* Dialog Description */}
            <DialogDescription>
              {selectedBatch?.name} - {selectedBatch?.courseName}
            </DialogDescription>
          </DialogHeader>

          {/* Is selected batch is not null, display the details */}
          {selectedBatch && (
            <div className="mt-4">
              <Tabs defaultValue="details">
                <TabsList className="w-full">
                  {/* Details Tab */}
                  <TabsTrigger value="details">Details</TabsTrigger>
                  {/* Students Tab */}
                  <TabsTrigger value="students">Students</TabsTrigger>
                  {/* Attendance Tab */}
                  {/* <TabsTrigger value="attendance">Attendance</TabsTrigger> */}
                  {/* Syllabus Tab */}
                  {/* <TabsTrigger value="syllabus">Syllabus</TabsTrigger> */}
                </TabsList>

                {/* Details Tab Content */}
                <TabsContent value="details" className="mt-4">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      {/* Batch Name */}
                      <h3 className="text-lg font-semibold">{selectedBatch.name}</h3>
                      {/* Batch Status */}
                      <Badge 
                        variant={selectedBatch.status === "active" ? "default" : "outline"}
                        className={selectedBatch.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}
                      >
                        {selectedBatch.status || "Active"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Scheduled Batch Card */}
                      <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                          {/* Batch Schedule Information */}
                          <CardTitle className="text-sm">Schedule Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <div className="flex items-center">
                            {/* Batch Time */}
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Time: {selectedBatch.time || `${selectedBatch.startTime} - ${selectedBatch.endTime}`}</span>
                          </div>
                          <div className="flex items-center">
                            {/* Batch Days */}
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Days: {selectedBatch.days || "Mon, Wed, Fri"}</span>
                          </div>
                          <div className="flex items-center">
                            {/* Batch Branch */}
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Location: {selectedBatch.branch || "Main Branch"}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Batch Course Card */}
                      <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                          {/* Batch Course Information */}
                          <CardTitle className="text-sm">Course Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <div className="flex items-center">
                            {/* Batch Course */}
                            <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Course: {selectedBatch.courseName}</span>
                          </div>
                          <div className="flex items-center">
                            {/* Batch Course Type */}
                            <Music className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Type: {selectedBatch.category || "Music"}</span>
                          </div>
                          <div className="flex items-center">
                            {/* Batch Student Count */}
                            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Students: {selectedBatch.studentCount || "12"} enrolled</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* Students Tab Content */}
                <TabsContent value="students" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Students</h3>
                      {/* Batch Student Count */}
                      <div className="text-sm text-neutral-500">
                        {selectedBatch.studentCount || "12"} students enrolled
                      </div>
                      <div className="text-sm text-neutral-500">Attendance for this month</div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {/* Create an array with the number of students (from selectedBatch or default 12)
                      and iterate over it using map() */}
                      {Array.from({ length: selectedBatch.studentCount || 12 }).map((_, index) => (
                        <div key={index} className="border rounded-md p-3 flex items-center justify-between">
                          <div className="flex items-center">
                            {/* Avatar component with height/width 8 and right margin 3 */}
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarFallback>
                                {String.fromCharCode(65 + index % 26)}
                              </AvatarFallback>
                            </Avatar>
                            {/* Student Name */}
                            <div>
                              <div className="font-medium">Student {index + 1}</div>
                              <div className="text-xs text-neutral-500">ID: STU{(1000 + index).toString()}</div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {/* Badge component with variant outline */}
                            <Badge variant="outline">
                              {index % 2 === 0 ? "95%" : "85%"} attendance
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Attendance Tab */}
                <TabsContent value="attendance" className="mt-4">
                  {/* Placeholder text for the Attendance tab */}
                  <div className="text-center py-8 text-neutral-500">
                    Attendance records for this batch will be displayed here
                  </div>
                </TabsContent>

                {/* Syllabus Tab */}
                <TabsContent value="syllabus" className="mt-4">
                  {/* Placeholder text for the Syllabus tab */}
                  <div className="text-center py-8 text-neutral-500">
                    Syllabus and lesson plan details will be displayed here
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}