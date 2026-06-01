import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Filter,
  User,
  Users,
  Search,
  Home,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

/**
 * AdminCalendar component for displaying and managing classes, events, teachers, and branches
 * in a calendar interface with day, week, and month views.
 *
 * @purpose
 * - Provide an interactive calendar UI for administrators.
 * - Support scheduling classes with teachers and batches.
 * - Filter and view events by branch, type, or search query.
 * - Navigate between days, weeks, and months.
 *
 * @params
 * - `date`: The currently selected date for the calendar view.
 * - `view`: Calendar view mode ("day", "week", or "month").
 * - `isEventDialogOpen`: Controls the visibility of the schedule class dialog.
 * - `activeBranch`: Currently selected branch for filtering events.
 * - `eventFilter`: Currently selected event type for filtering.
 * - `searchQuery`: Search text for filtering events.
 * - `selectedDate`, `selectedTime`, `selectedEndTime`, `selectedTeacher`, `selectedBatch`: Form values for scheduling a class.
 *
 * @sideEffects
 * - Fetches branches from `/api/branches`.
 * - Fetches employees from `/api/employees` and filters only teachers.
 * - Fetches batches from `/api/batches`.
 * - Logs processed teachers to the console.
 * - Displays toast notifications when scheduling a class.
 *
 * @returns {JSX.Element} A calendar UI with filtering, event display, and scheduling functionalities.
 *
 * @throws {Error} Throws fetch errors if branches, teachers, or batches cannot be retrieved.
 * @throws {Error} Throws scheduling errors if the class cannot be scheduled due to network or validation issues.
 *
 * @example
 * ```tsx
 * import AdminCalendar from './AdminCalendar';
 *
 * export default function App() {
 *   return <AdminCalendar />;
 * }
 * ```
 */
export default function AdminCalendar() {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [activeBranch, setActiveBranch] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  // const { toast } = useToast();


  /**
   * Fetch branches list via React Query.
   *
   * @purpose Retrieve branch records from the backend for use across the calendar / UI.
   * 
   * @param None
   * @returns {UseQueryResult<any[], Error>} React Query result with `data: branches`.
   * @throws React Query will surface any network/fetch errors.
   * @sideEffects Performs network request to `/api/branches`.
   * 
   * @example
   * const { data: branches } = useQuery({ queryKey: ['/api/branches'] });
   */
  const { data: branches = [], isLoading: isLoadingBranches } = useQuery<any[]>({
    queryKey: ["/api/branches"],
  });

  
  /**
   * Fetch teachers from employees table and transform into a simplified teachers list.
   *
   * @purpose Load employees and filter/transform them into a `teachers` list used in filters/dropdowns.
   * 
   * @param None (the queryFn takes no explicit args; React Query provides context)
   * @returns {Promise<Array<{employeeId:string, fullName:string, position:string, role:string}>>}
   *   Resolves to an array of simplified teacher objects.
   * @throws Will throw if the fetch fails (caught inside queryFn and empty array returned).
   * @sideEffects Performs network request to `/api/employees`. Logs processed teachers to console on success.
   * 
   * @example
   * const { data: teachers } = useQuery({ queryKey: ['teachers'], queryFn });
   */
  const { data: teachers = [], isLoading: isLoadingTeachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/employees');
        if (!response.ok) {
          throw new Error('Failed to fetch teachers');
        }
        const data = await response.json();
        
        // Filter and transform teachers data
        const teachersList = data
          .filter((emp: any) => emp && (emp.position === 'teacher' || emp.role === 'teacher'))
          .map((teacher: any) => ({
            employeeId: teacher.employeeId,
            fullName: `${teacher.fullName}`,
            position: teacher.position,
            role: teacher.role
          }));
        
        console.log('Processed teachers:', teachersList);
        return teachersList;
      } catch (error) {
        console.error('Error fetching teachers:', error);
        return [];
      }
    },
  });

  
  /**
   * Debug effect that logs teachers when they change.
   *
   * @purpose Allow quick debugging to see teachers data when it's available.
   * 
   * @param None
   * @returns {void}
   * @throws None
   * @sideEffects Logs `teachers` to the browser console when `teachers` changes.
   * 
   * @example
   * // Automatically runs when `teachers` updates
   */
  useEffect(() => {
    if (teachers && teachers.length > 0) {
      console.log("Teachers data:", teachers);
    }
  }, [teachers]);

  
  /**
   * Fetch batches list via React Query.
   *
   * @purpose Retrieve batch records for filtering/scheduling UI.
   * 
   * @param None
   * @returns {UseQueryResult<any[], Error>}
   * @throws React Query will surface network/fetch errors.
   * @sideEffects Performs network request to `/api/batches`.
   * 
   * @example
   * const { data: batches } = useQuery({ queryKey: ['/api/batches'] });
   */
  const { data: batches = [], isLoading: isLoadingBatches } = useQuery<any[]>({
    queryKey: ["/api/batches"],
  });


  /**
   * branchOptions — Derived branch options to feed selects/filters.
   *
   * @purpose Provide a UI-friendly list including an "All Branches" option.
   * 
   * @param None
   * @returns {Array<{id:string, name:string}>} Branch option objects for select controls.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * <Select options={branchOptions} />
   */
  const branchOptions = [
    { id: "all", name: "All Branches" },
    ...branches.map(branch => ({
      id: branch.id.toString(),
      name: branch.name
    }))
  ];

  
  /**
   * eventCategories — Category meta used to map event types to colors etc.
   *
   * @purpose Provide lookups and display metadata for calendar event types.
   * 
   * @param None
   * @returns {Array<{id:string, name:string, color:string}>}
   * @throws None
   * @sideEffects None
   * 
   * @example
   * getEventColor('class') // 'bg-blue-500'
   */
  const eventCategories = [
    { id: "all", name: "All Events", color: "bg-gray-500" },
    { id: "class", name: "Regular Classes", color: "bg-blue-500" },
    { id: "exam", name: "Exams", color: "bg-red-500" },
    { id: "workshop", name: "Workshops", color: "bg-amber-500" },
    { id: "performance", name: "Performances", color: "bg-purple-500" },
    { id: "holiday", name: "Holidays", color: "bg-green-500" },
  ];


  /**
   * Static events sample data (UI mock).
   *
   * @purpose Provide example event objects for local calendar rendering while backend integration is pending.
   * 
   * @param None
   * @returns {Array<Object>} Array of event objects.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * getEventsForDay(new Date())
   */
  const events = [
    {
      id: 1,
      title: "Guitar Class - Beginners",
      date: new Date(2023, 3, 10, 10, 0),
      endTime: new Date(2023, 3, 10, 11, 30),
      type: "class",
      branch: "andheri",
      teacher: "John Smith",
      students: 8,
      room: "Studio 3",
    },
    {
      id: 2,
      title: "Piano Workshop",
      date: new Date(2023, 3, 12, 15, 0),
      endTime: new Date(2023, 3, 12, 17, 0),
      type: "workshop",
      branch: "bandra",
      teacher: "Maria Rodriguez",
      students: 12,
      room: "Main Hall",
    },
    {
      id: 3,
      title: "Drum Class - Intermediate",
      date: new Date(2023, 3, 15, 18, 0),
      endTime: new Date(2023, 3, 15, 19, 30),
      type: "class",
      branch: "powai",
      teacher: "Rahul Mehta",
      students: 6,
      room: "Studio 2",
    },
    {
      id: 4,
      title: "Annual Performance",
      date: new Date(2023, 3, 20, 17, 0),
      endTime: new Date(2023, 3, 20, 20, 0),
      type: "performance",
      branch: "andheri",
      teacher: "Multiple",
      students: 30,
      room: "Auditorium",
    },
    {
      id: 5,
      title: "Theory Exam",
      date: new Date(2023, 3, 22, 10, 0),
      endTime: new Date(2023, 3, 22, 12, 0),
      type: "exam",
      branch: "thane",
      teacher: "Priya Sharma",
      students: 15,
      room: "Classroom 1",
    },
    {
      id: 6,
      title: "Diwali Holiday",
      date: new Date(2023, 3, 25, 0, 0),
      endTime: new Date(2023, 3, 25, 23, 59),
      type: "holiday",
      branch: "all",
      teacher: "",
      students: 0,
      room: "",
    },
  ];


  /**
   * getEventColor — Return CSS color class for a given event type id.
   *
   * @purpose Map an event `type` to a CSS class used for badge/coloring in the calendar UI.
   * 
   * @params
   * - type: string — Event type identifier (e.g. 'class', 'workshop').
   * @returns {string} CSS class for color (e.g. 'bg-blue-500'). Falls back to 'bg-gray-500'.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * getEventColor('exam'); // -> 'bg-red-500'
   */
  const getEventColor = (type: string) => {
    const category = eventCategories.find((cat) => cat.id === type);
    return category ? category.color : "bg-gray-500";
  };

  
  /**
   * filteredEvents — Events filtered by branch, type and search query.
   *
   * @purpose Provide the calendar UI a filtered events list according to user controls.
   * 
   * @param None (reads activeBranch, eventFilter, searchQuery from closure)
   * @returns {Array<Object>} Filtered events list.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * // used directly in calendar rendering
   */
  const filteredEvents = events.filter((event) => {
    const matchesBranch = activeBranch === "all" || event.branch === activeBranch || event.branch === "all";
    const matchesType = eventFilter === "all" || event.type === eventFilter;
    const matchesSearch = !searchQuery ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.teacher.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesBranch && matchesType && matchesSearch;
  });

  
  /**
   * getDaysInMonth — Create a contiguous array of day objects for a calendar month view.
   *
   * @purpose Build an array containing the days to display in a month calendar view,
   *   including leading/trailing days from adjacent months to complete week rows.
   * 
   * @params
   * - year: number — 4-digit year (e.g. 2024).
   * - month: number — Zero-based month index (0 = January, 11 = December).
   * @returns {Array<{date: Date, isCurrentMonth: boolean}>} Array of day objects.
   * @throws None
   * @sideEffects None
   * 
   * @example
   *   const days = getDaysInMonth(2024, 0); // days for January 2024 including prev/next month overflow
   */
  const getDaysInMonth = (year: number, month: number) => {
    const startDate = new Date(year, month, 1);
    const days = [];
    
    // Add days from previous month to fill first week
    const startDay = startDate.getDay();
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDate - i),
        isCurrentMonth: false
      });
    }
    
      // Add days from current month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        days.push({
          date: new Date(year, month, i),
          isCurrentMonth: true
        });
      }
      
      // Add days from next month to fill last week
      const endDay = new Date(year, month, daysInMonth).getDay();
      for (let i = 1; i < 7 - endDay; i++) {
        days.push({
          date: new Date(year, month + 1, i),
          isCurrentMonth: false
        });
      }
    
    return days;
  };


  /**
   * days — Precomputed day objects for the current `date` month (used by the calendar UI).
   *
   * @purpose Provide the view with a ready-made array of day objects (date + isCurrentMonth).
   * 
   * @param None (reads `date` from closure)
   * @returns {Array<{date: Date, isCurrentMonth: boolean}>}
   * @throws None
   * @sideEffects None
   * 
   * @example
   * days.forEach(d => console.log(d.date, d.isCurrentMonth));
   */
  const days = getDaysInMonth(date.getFullYear(), date.getMonth());

  
  /**
   * getEventsForDay — Return events occurring on a specific calendar day.
   *
   * @purpose Filter `filteredEvents` to those that match the provided day (by year/month/date).
   * 
   * @param - day: Date — The day to query (only date portion is significant).
   * @returns {Array<Object>} Events happening on `day`.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * const eventsOn10th = getEventsForDay(new Date(2023, 3, 10));
   */
  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear();
    });
  };

  
  /**
   * formatDayName — Short weekday formatter.
   *
   * @purpose Return a short weekday label (e.g., "Mon", "Tue") for display in calendar headers.
   * 
   * @param - day: Date — Day to format.
   * @returns {string} 3-letter weekday abbreviation.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * formatDayName(new Date(2023,3,10)); // "Mon"
   */
  const formatDayName = (day: Date) => {
    return format(day, 'EEE');
  };

  
  /**
   * Format time to a human-readable string like "10:00 AM".
   *
   * @purpose Convert a Date object to a short 12-hour time string for UI display.
   * 
   * @params
   * - date: Date — The Date object to format.
   * @returns {string} Formatted time string (e.g. "10:00 AM").
   * @throws None
   * @sideEffects None
   * 
   * @example
   * const t = formatTime(new Date('2025-05-01T10:00:00')); // "10:00 AM"
   */
  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  
  /**
   * Navigate calendar month forward or backward.
   *
   * @purpose Update the component's `date` state to the previous or next month.
   * 
   * @param direction: 'prev' | 'next' — 'prev' to go one month back, 'next' to go one month forward.
   * @returns {void}
   * @throws None
   * @sideEffects
   * - Calls `setDate` to update the component state which will cause a re-render and update any dependent UI.
   * 
   * @example
   * navigateMonth('prev'); // moves calendar to previous month
   */
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(date);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setDate(newDate);
  };

  
  /**
   * Breadcrumb definitions for the page header/navigation.
   *
   * @purpose Provide structured breadcrumb items used by the page header component.
   * 
   * @param None
   * @returns {Array<{title: string; href?: string; icon?: JSX.Element}>} Breadcrumb objects to render.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * // Used by header: <Breadcrumb items={breadcrumbs} />
   */
  const breadcrumbs = [
    {
      title: "Home",
      href: "/admin/dashboard",
      icon: <Home className="h-4 w-4" />
    },
    {
      title: "Calendar"
    }
  ];

  // State for the form
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("17:00");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("18:00");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");


  /**
   * Schedule a class by sending start/end times, batch and teacher to the backend.
   *
   * @purpose Validate schedule form fields and create a class schedule record on the server.
   * 
   * @param None — reads required fields from closure: selectedBatch, selectedTeacher, selectedDate, selectedTime, selectedEndTime.
   * @returns {Promise<void>} Resolves when request completes (or rejects internally, handled by try/catch).
   * @throws None — errors are caught and surfaced via UI toast instead of being thrown to caller.
   * @sideEffects
   * - Performs a POST request to `/api/classes` with JSON body (network I/O).
   * - Shows success or error toasts via `toast`.
   * - Resets local form state (selectedBatch, selectedTeacher, selectedDate, selectedTime, selectedEndTime).
   * - Closes the event dialog by calling `setIsEventDialogOpen(false)`.
   *
   * @example
   * // Ensure necessary state is set, then:
   * await handleScheduleClass();
   */
  const handleScheduleClass = async () => {
    if (!selectedBatch || !selectedTeacher || !selectedDate || !selectedTime || !selectedEndTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Format the date and times
      const classDate = selectedDate;
      const [startHours, startMinutes] = selectedTime.split(':');
      const [endHours, endMinutes] = selectedEndTime.split(':');
      
      const startDateTime = new Date(classDate);
      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));
      
      const endDateTime = new Date(classDate);
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

      // Create the class schedule
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchId: selectedBatch,
          teacherId: selectedTeacher,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule class');
      }

      toast({
        title: "Success",
        description: "Class has been scheduled successfully.",
      });

      // Reset form and close dialog
      setSelectedBatch("");
      setSelectedTeacher("");
      setSelectedDate(new Date());
      setSelectedTime("09:00");
      setSelectedEndTime("10:00");
      setIsEventDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule the class. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppShell> {/* Main layout wrapper for the application */}
      {/* Page header with title, description, and optional breadcrumbs */}
      <PageHeader 
        title="Calendar" 
        description="Manage classes, events, and schedules across all branches"
        breadcrumbs={breadcrumbs}
      />

      {/* Calendar view and controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Branch Selection */}
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div>
            {/* Dropdown to select the active branch */}
            <Select value={activeBranch} onValueChange={setActiveBranch}>
              <SelectTrigger>
                <Home className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Branches</SelectLabel>
                  {isLoadingBranches ? (
                    <SelectItem value="loading" disabled>
                      Loading branches...
                    </SelectItem>
                  ) : branchOptions.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Calendar view tabs and Add Class button */}
        <div className="flex gap-2 items-center">
          <Tabs defaultValue="month" className="w-[300px]" onValueChange={(value) => setView(value as any)}>
            {/* Tabs to switch between day, week, and month views */}
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
            <TabsContent value="day"></TabsContent>
            <TabsContent value="week"></TabsContent>
            <TabsContent value="month"></TabsContent>
          </Tabs>

          {/* Dialog for adding a new class */}
          <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Class</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Form content inside the dialog */}
                
                {/* Branch Selection inside Add Class dialog */}
                <div className="grid gap-2">
                  <Label htmlFor="branch">Branch</Label>
                  {/* Dropdown to select the branch for the class */}
                  <Select name="branch">
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingBranches ? (
                        <SelectItem value="loading" disabled>
                          Loading branches...
                        </SelectItem>
                      ) : branchOptions.slice(1).map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Batch Selection inside Add Class dialog */}
                <div className="grid gap-2">
                  <Label htmlFor="batch">Batch</Label>
                  {/* Dropdown to select the batch for the class */}
                  <Select 
                    value={selectedBatch} 
                    onValueChange={setSelectedBatch}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingBatches ? (
                        <SelectItem value="loading" disabled>
                          Loading batches...
                        </SelectItem>
                      ) : batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id.toString()}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Teacher Selection inside Add Class dialog */}
                <div className="grid gap-2">
                  <Label htmlFor="teacher">Teacher</Label>
                  {/* Dropdown to select the teacher for the class */}
                  <Select 
                    value={selectedTeacher} 
                    onValueChange={setSelectedTeacher}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingTeachers ? (
                        <SelectItem value="loading" disabled>
                          Loading teachers...
                        </SelectItem>
                      ) : teachers && teachers.length > 0 ? (
                        teachers.map((teacher: any) => (
                          <SelectItem 
                            key={teacher.employeeId} 
                            value={teacher.employeeId}
                          >
                            {teacher.fullName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No teachers available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date and Time Selection inside Add Class dialog */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    {/* Calendar to select the date for the class */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            console.log("Selected date:", date);
                            setSelectedDate(date || undefined);
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Start Time</Label>
                      {/* Input to select the start time for the class */}
                      <Input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>End Time</Label>
                      {/* Input to select the end time for the class */}
                      <Input
                        type="time"
                        value={selectedEndTime}
                        onChange={(e) => setSelectedEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                {/* Button to schedule the class */}
                <Button onClick={handleScheduleClass}>
                  Schedule Class
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Month View */}
          {view === "month" && (
            <div className="bg-white rounded-lg overflow-hidden">
              {/* HeaderL Month Navigation */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center">
                  {/* Previous Month Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {/* Month Header */}
                  <h2 className="text-xl font-semibold mx-4">
                    {format(date, 'MMMM yyyy')}
                  </h2>
                  {/* Next Month Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {/* Day names header */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {days.map((day, i) => {
                  const eventsForDay = getEventsForDay(day.date);
                  const isToday = day.date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div
                      key={i}
                      className={`min-h-[120px] bg-white p-2 ${
                        day.isCurrentMonth ? "" : "text-gray-400"
                      } ${isToday ? "bg-blue-50" : ""}`}
                    >
                      {/* Date number and event count badge */}
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-medium ${isToday ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center" : ""}`}>
                          {day.date.getDate()}
                        </span>
                        {/* Event count badge */}
                        {eventsForDay.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {eventsForDay.length} event{eventsForDay.length > 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Events list - List events for this day (max 3)*/}
                      <div className="space-y-1 overflow-y-auto max-h-[80px]">
                        {eventsForDay.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded truncate ${getEventColor(event.type)} bg-opacity-20 border-l-2 ${getEventColor(event.type)}`}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="text-gray-600 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(event.date)}
                            </div>
                          </div>
                        ))}
                        {/* Show "+ N more" if more than 3 events */}
                        {eventsForDay.length > 3 && (
                          <div className="text-xs text-blue-600 font-medium">
                            + {eventsForDay.length - 3} more events
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Week View */}
          {view === "week" && (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Week header: Day names */}
                <div className="flex border-b">
                  <div className="w-20 p-4 border-r"></div> {/* Empty cell for time labels */}
                  {Array.from({ length: 7 }, (_, i) => {
                    const day = new Date(date);
                    day.setDate(date.getDate() - date.getDay() + i);
                    const isToday = day.toDateString() === new Date().toDateString();
                    
                    return (
                      <div
                        key={i}
                        className={`flex-1 p-4 text-center ${isToday ? "bg-blue-50" : ""}`}
                      >
                        <div className={`font-medium ${isToday ? "text-blue-600" : ""}`}>
                          {formatDayName(day)}
                        </div>
                        <div className={`text-2xl ${isToday ? "bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""}`}>
                          {day.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Week grid with hourly slots */}
                <div className="relative" style={{ height: "800px" }}>
                  {/* Time labels (9 AM - 9 PM) */}
                  <div className="absolute top-0 left-0 h-full w-20 border-r">
                    {Array.from({ length: 13 }, (_, i) => {
                      const hour = i + 9; // 9 AM to 9 PM
                      return (
                        <div key={hour} className="h-[100px] relative border-b">
                          <span className="absolute -top-2.5 left-2 text-xs text-gray-500">
                            {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Week grid */}
                  <div className="absolute top-0 left-20 right-0 h-full grid grid-cols-7 gap-px bg-gray-200">
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const day = new Date(date);
                      day.setDate(date.getDate() - date.getDay() + dayIndex);
                      const eventsForDay = getEventsForDay(day);
                      
                      return (
                        <div key={dayIndex} className="relative bg-white">
                          {/* Hour divisions */}
                          {Array.from({ length: 13 }, (_, hourIndex) => (
                            <div key={hourIndex} className="h-[100px] border-b"></div>
                          ))}
                          
                          {/* Render events with dynamic position and height */}
                          {eventsForDay.map((event) => {
                            const startHour = event.date.getHours();
                            const startMinute = event.date.getMinutes();
                            const endHour = event.endTime.getHours();
                            const endMinute = event.endTime.getMinutes();
                            
                            const topPosition = ((startHour - 9) * 100) + (startMinute / 60 * 100);
                            const height = ((endHour - startHour) * 100) + ((endMinute - startMinute) / 60 * 100);
                            
                            return (
                              <div
                                key={event.id}
                                className={`absolute left-1 right-1 rounded ${getEventColor(event.type)} bg-opacity-20 border-l-2 ${getEventColor(event.type)} p-2 overflow-hidden`}
                                style={{ top: `${topPosition}px`, height: `${height}px` }}
                              >
                                <div className="font-medium text-sm truncate">{event.title}</div>
                                <div className="text-xs text-gray-600 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatTime(event.date)} - {formatTime(event.endTime)}
                                </div>
                                {/* Additional event info if height allows */}
                                {height > 60 && (
                                  <div className="text-xs mt-1">
                                    {event.branch !== "all" && (
                                      <div className="truncate">{branches.find(b => b.id === event.branch)?.name}</div>
                                    )}
                                    {event.teacher && (
                                      <div className="flex items-center truncate">
                                        <User className="h-3 w-3 mr-1" />
                                        {event.teacher}
                                      </div>
                                    )}
                                    {event.students > 0 && (
                                      <div className="flex items-center truncate">
                                        <Users className="h-3 w-3 mr-1" />
                                        {event.students} students
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Day View */}
          {view === "day" && (
            <div>
              {/* Header: Day Navigation */}
              <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center">
                  {/* Previous Day Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newDate = new Date(date);
                      newDate.setDate(newDate.getDate() - 1);
                      setDate(newDate);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Display current day, month, and year */}
                  <h2 className="text-xl font-semibold mx-4">
                    {format(date, 'EEEE, MMMM d, yyyy')}
                  </h2>

                  {/* Next day button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newDate = new Date(date);
                      newDate.setDate(newDate.getDate() + 1); //go to next day
                      setDate(newDate);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Today button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDate(new Date())}
                >
                  Today
                </Button>
              </div>
              
              {/* Day schedule grid */}
              <div className="relative" style={{ height: "800px" }}>
                {/* Time labels column (9 AM - 9 PM) */}
                <div className="absolute top-0 left-0 h-full w-20 border-r">
                  {Array.from({ length: 13 }, (_, i) => {
                    const hour = i + 9; // 9 AM to 9 PM
                    return (
                      <div key={hour} className="h-[100px] relative border-b">
                        <span className="absolute -top-2.5 left-2 text-xs text-gray-500">
                          {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Day events */}
                <div className="absolute top-0 left-20 right-0 h-full bg-white">
                  {/* Hour divisions */}
                  {Array.from({ length: 13 }, (_, hourIndex) => (
                    <div key={hourIndex} className="h-[100px] border-b"></div>
                  ))}
                  
                  {/* Render events with dynamic position and height */}
                  {getEventsForDay(date).map((event) => {
                    const startHour = event.date.getHours();
                    const startMinute = event.date.getMinutes();
                    const endHour = event.endTime.getHours();
                    const endMinute = event.endTime.getMinutes();
                    
                    // Calculate top position and height based on start/end time
                    const topPosition = ((startHour - 9) * 100) + (startMinute / 60 * 100);
                    const height = ((endHour - startHour) * 100) + ((endMinute - startMinute) / 60 * 100);
                    
                    return (
                      <div
                        key={event.id}
                        className={`absolute left-2 right-2 md:left-[15%] md:right-[15%] rounded ${getEventColor(event.type)} bg-opacity-20 border-l-2 ${getEventColor(event.type)} p-3 overflow-hidden`}
                        style={{ top: `${topPosition}px`, height: `${height}px` }}
                      >
                        {/* Event title */}
                        <div className="font-medium text-sm md:text-base truncate">{event.title}</div>
                        
                        {/* Event time */}
                        <div className="text-xs md:text-sm text-gray-600 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(event.date)} - {formatTime(event.endTime)}
                        </div>
                        
                        {/* Additional info if event block is tall enough */}
                        {height > 60 && (
                          <div className="text-xs md:text-sm mt-2 space-y-1">
                            {event.branch !== "all" && (
                              <div className="truncate">
                                <Badge variant="outline" className="mr-2">Branch</Badge>
                                {branches.find(b => b.id === event.branch)?.name}
                              </div>
                            )}
                            
                            {/* Event teacher */}
                            {event.teacher && (
                              <div className="flex items-center truncate">
                                <Badge variant="outline" className="mr-2">Teacher</Badge>
                                {event.teacher}
                              </div>
                            )}
                            
                            {/* Event students */}
                            {event.students > 0 && (
                              <div className="flex items-center truncate">
                                <Badge variant="outline" className="mr-2">Students</Badge>
                                {event.students} students
                              </div>
                            )}
                            
                            {/* Event room */}
                            {event.room && (
                              <div className="flex items-center truncate">
                                <Badge variant="outline" className="mr-2">Room</Badge>
                                {event.room}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}