import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  MapPin,
  Music
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth, isSameDay, isToday } from "date-fns";
import { cn } from "@/lib/utils";


/**
 * @purpose Defines the structure of an Event object used for managing scheduled items like classes, exams, concerts, or meetings.
 * 
 * @param {number} id - Unique identifier of the event.
 * @param {string} title - The name or title of the event.
 * @param {Date} date - The calendar date when the event occurs.
 * @param {string} startTime - The time (HH:mm) when the event starts.
 * @param {string} endTime - The time (HH:mm) when the event ends.
 * @param {number} batchId - The unique ID of the batch assigned to the event.
 * @param {string} batchName - The name of the batch (e.g., "Batch A").
 * @param {string} courseName - The name of the course linked to the event.
 * @param {string} branch - The department or branch organizing the event.
 * @param {number} studentCount - The number of students associated with this event.
 * @param {"class" | "exam" | "concert" | "meeting"} type - Specifies the event category.
 *
 * @returns {Event} Returns an Event type definition that can be used for creating or validating event objects.
 * @throws {TypeError} May throw a type error during runtime validation or when incorrect data types are assigned to properties in strict type-checking contexts.
 * @sideEffects None. This interface only defines structure — it doesn’t modify data or state.
 *
 * @example
 * // Example of creating an Event object:
 * const event: Event = {
 *   id: 5,
 *   title: "Chemistry Lab",
 *   date: new Date("2025-10-21"),
 *   startTime: "14:00",
 *   endTime: "16:00",
 *   batchId: 102,
 *   batchName: "Batch B",
 *   courseName: "Chemistry 201",
 *   branch: "Science",
 *   studentCount: 25,
 *   type: "class"
 * };
 */
interface Event {
  id: number;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  batchId: number;
  batchName: string;
  courseName: string;
  branch: string;
  studentCount: number;
  type: "class" | "exam" | "concert" | "meeting";
}


/**
 * TeacherCalendar component
 *
 * @purpose Display a teacher's calendar with month/week/day views, showing events
 *          (classes, exams, concerts, meetings) for their batches.
 *
 * @param None
 * @returns {JSX.Element} Renders the calendar UI with navigation and event details.
 * @throws None
 * @sideEffects 
 * - Fetches teacher batches from the API using `useQuery`.
 * - Updates state when user selects a date, event, or changes view mode.
 *
 * @example
 * <TeacherCalendar />
 */
export default function TeacherCalendar() {
  const { user } = useAuth();

  /**
   * @purpose Track the currently displayed month in the calendar.
   * 
   * @param None
   * @returns {Date} The first day of the currently displayed month.
   * @throws None
   * @sideEffects Affects which days and events are rendered.
   * 
   * @example
   * setCurrentMonth(new Date(2025, 9, 1)); // Show October 2025
   */
  const [currentMonth, setCurrentMonth] = useState(new Date());

  /**
   * @purpose Store the currently selected date in the calendar.
   * 
   * @param None
   * @returns {Date} The selected day.
   * @throws None
   * @sideEffects Used to highlight the selected day and show events.
   * 
   * @example
   * setSelectedDate(new Date(2025, 9, 4));
   */
  const [selectedDate, setSelectedDate] = useState(new Date());

  /**
   * @purpose Store the currently selected event (if any) for viewing details.
   * 
   * @param None
   * @returns {Event | null} The selected event or null if none is selected.
   * @throws None
   * @sideEffects Used to open event dialog.
   * 
   * @example
   * setSelectedEvent(events[0]);
   */
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  /**
   * @purpose Control visibility of the event details dialog.
   * 
   * @param None
   * @returns {boolean} True if the event dialog is open, false otherwise.
   * @throws None
   * @sideEffects Shows or hides the event details modal.
   * 
   * @example
   * setIsEventDialogOpen(true);
   */
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  
  /**
   * @purpose Store the current view mode of the calendar ("month", "week", or "day").
   * 
   * @param None
   * @returns {"month" | "week" | "day"} The current calendar view mode.
   * @throws None
   * @sideEffects Determines how the calendar days and events are rendered.
   * 
   * @example
   * setViewMode("week");
   */
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  /**
   * @purpose Fetch batches/classes for the logged-in teacher.
   *
   * @param None
   * @returns {any[]} Array of batch objects assigned to the teacher.
   * @throws None (errors handled internally by React Query)
   * @sideEffects Triggers a network request to `/api/batches/teacher`.
   * 
   * @example
   * const { data: batches } = useQuery(["/api/batches/teacher"]);
   */
  const { data: batches = [] } = useQuery<any[]>({
    queryKey: ["/api/batches/teacher"],
    enabled: !!user,
  });

  /**
   * Events state
   *
   * @purpose Store all calendar events for the teacher, including classes, concerts, etc.
   * 
   * @param None
   * @returns {Event[]} Array of events for rendering in the calendar.
   * @throws None
   * @sideEffects Updated via useEffect whenever `batches` change.
   * 
   * @example
   * setEvents([...events, newEvent]);
   */
  const [events, setEvents] = useState<Event[]>([]);

  /**
   * Initialize events based on batches
   *
   * @purpose Generate calendar events (classes, concerts) for each batch within
   *          a date range (previous month to next month).
   * @param None
   * @returns Void
   * @throws None
   * @sideEffects Updates `events` state with generated events.
   * 
   * @example
   * // Automatically runs on batches change
   * useEffect(() => {...}, [batches]);
   */
  useEffect(() => {
    if (batches.length) {
      const generatedEvents: Event[] = [];
      
      // Generate regular class events for each batch
      batches.forEach((batch: any) => {
        // Assuming batch contains schedule information like days of week
        const days = batch.schedule?.days || ["Monday", "Wednesday", "Friday"];
        const dayMap: Record<string, number> = {
          "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, 
          "Thursday": 4, "Friday": 5, "Saturday": 6
        };
        
        const today = new Date();
        const startDate = startOfMonth(subMonths(today, 1)); // Previous month
        const endDate = endOfMonth(addMonths(today, 1)); // Next month
        
        // Generate events for each day in the range
        eachDayOfInterval({ start: startDate, end: endDate }).forEach(date => {
          // Check if this date's day of week matches batch schedule
          if (days.includes(Object.keys(dayMap).find(key => dayMap[key] === getDay(date)))) {
            generatedEvents.push({
              id: Math.floor(Math.random() * 10000),
              title: `${batch.name} Class`,
              date,
              startTime: batch.startTime || "15:00",
              endTime: batch.endTime || "16:30",
              batchId: batch.id,
              batchName: batch.name,
              courseName: batch.courseName || "Music Course",
              branch: batch.branch || "Main Branch",
              studentCount: batch.studentCount || 12,
              type: "class"
            });
          }
        });
      });
      
      // Add a few extra events
      generatedEvents.push({
        id: Math.floor(Math.random() * 10000),
        title: "End of Term Concert",
        date: addMonths(new Date(), 1),
        startTime: "18:00",
        endTime: "20:00",
        batchId: -1,
        batchName: "All Batches",
        courseName: "All Courses",
        branch: "Main Branch",
        studentCount: 50,
        type: "concert"
      });
      
      setEvents(generatedEvents);
    }
  }, [batches]);

  /**
   * Navigate to previous month in the calendar
   *
   * @purpose Update the currentMonth state to show the previous month.
   * 
   * @param None
   * @returns Void
   * @throws None
   * @sideEffects Changes calendar view.
   * 
   * @example
   * handlePreviousMonth();
   */
  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  /**
   * Navigate to next month in the calendar
   *
   * @purpose Update the currentMonth state to show the next month.
   * 
   * @param None
   * @returns Void
   * @throws None
   * @sideEffects Changes calendar view.
   * 
   * @example
   * handleNextMonth();
   */
  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  /**
   * Select a date on the calendar
   *
   * @purpose Update selectedDate state when a user clicks a calendar day.
   * 
   * @param {Date} date - The date that was clicked.
   * @returns Void
   * @throws None
   * @sideEffects Highlights the selected day and can trigger event filtering.
   * 
   * @example
   * handleDateClick(new Date(2025, 9, 5));
   */
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  /**
   * Open event details dialog for a clicked event
   *
   * @purpose Set the selectedEvent state and open the event dialog.
   * 
   * @param {Event} event - The event that was clicked.
   * @returns Void
   * @throws None
   * @sideEffects Opens modal dialog showing event details.
   * 
   * @example
   * handleEventClick(events[0]);
   */
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  
  /**
   * Get all days in the current month for calendar rendering
   *
   * @purpose Generate an array of dates for the calendar month view,
   *          filling the first row with previous month's dates to align weekdays.
   * 
   * @param None
   * @returns {Date[]} Array of Date objects including previous month's days for alignment.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * const days = daysInMonth();
   */
  const daysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = getDay(start);
    
    // Add days from the previous month to fill the first row
    const previousMonthDays = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      previousMonthDays.push(subMonths(start, 1));
    }
    
    return [...previousMonthDays, ...days];
  };

  /**
   * Get events for a specific date
   *
   * @purpose Filter all calendar events that occur on the provided date.
   * 
   * @param {Date} date - The date for which to retrieve events.
   * @returns {Event[]} Array of Event objects scheduled on the given date.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * const todayEvents = getEventsForDate(new Date());
   */
  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  /**
   * Format a time string for display
   *
   * @purpose Convert a time string into a formatted display string (optional formatting can be applied here).
   * 
   * @param {string} time - The time string to format (e.g., "15:00").
   * @returns {string} Formatted time string.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * const formatted = formatTime("15:30"); // "15:30"
   */
  const formatTime = (time: string) => {
    return time;
    // You could format this better if needed
  };

  return (
    // AppShell component wraps the page content with a layout shell (header, sidebar, etc.)
    <AppShell>
      {/* PageHeader component displays a page header with a title and description */}
      <PageHeader
        title="Calendar"
        description="View and manage your schedule and upcoming events"
      />

      {/* Grid layout for the calendar content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Calendar Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Previous month button */}
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handlePreviousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {/* Current month display */}
                <h2 className="text-xl font-semibold">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
                {/* Next month button */}
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* View mode selector dropdown */}
                <Select value={viewMode} onValueChange={(value: "month" | "week" | "day") => setViewMode(value)}>
                  {/* Trigger element showing current selection */}
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  {/* Dropdown options */}
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                  </SelectContent>
                </Select>
                {/* Button to navigate to today's date */}
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Today
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Card Wrapper */}
        <Card>
          <CardContent className="p-4">
            {/* Render calendar depending on current view mode */}
            {viewMode === "month" && (
              <div className="grid grid-cols-7 gap-2">
                {/* Day of Week Headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center py-2 font-medium text-sm">
                    {day}
                  </div>
                ))}
                
                {/* Render each day cell for the current month grid */}
                {daysInMonth().map((day, i) => {
                  const dayEvents = getEventsForDate(day); // Get events for the current day
                  const isCurrentMonth = isSameMonth(day, currentMonth); // Check if the day is in the current month
                  const isSelected = isSameDay(day, selectedDate); // Check if the day is selected
                  const isCurrentDay = isToday(day); // Check if the day is today
                  
                  return (
                    <div
                      key={i}
                      className={cn(
                        "h-28 border border-border rounded-md p-1 overflow-hidden",
                        !isCurrentMonth && "opacity-40 bg-neutral-50", // Dim out non-current month days
                        isSelected && "border-primary border-2",       // Highlight selected date
                        isCurrentDay && "bg-primary/5"                 // Light background for today
                      )}
                      onClick={() => handleDateClick(day)}              // Click selects the day
                    >
                      {/* Top-right date number */}
                      <div className="text-right">
                        <span 
                          className={cn(
                            "inline-block rounded-full w-6 h-6 text-xs flex items-center justify-center",
                            isCurrentDay && "bg-primary text-white"     // Today gets colored circle
                          )}
                        >
                          {format(day, "d")}  {/* Show day number */}
                        </span>
                      </div>
        
                      {/* Events list inside the day box */}
                      <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(100%-20px)]">
                        {/* Show events for the day */}
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              "text-xs px-1 py-0.5 rounded truncate cursor-pointer",
                              event.type === "class" && "bg-blue-100 text-blue-800",
                              event.type === "exam" && "bg-orange-100 text-orange-800",
                              event.type === "concert" && "bg-purple-100 text-purple-800",
                              event.type === "meeting" && "bg-green-100 text-green-800"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();      // Prevent triggering parent (date) click
                              handleEventClick(event);  // Open event details or modal
                            }}
                          >
                            {/* Show event time and title */}
                            {formatTime(event.startTime)} - {event.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        
            {viewMode === "week" && (
              /* Week View Placeholder */
              <div className="text-center py-10 text-muted-foreground">
                Week view will be implemented here
              </div>
            )}
        
            {viewMode === "day" && (
              /* Day View Placeholder */
              <div className="text-center py-10 text-muted-foreground">
                Day view will be implemented here
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card wrapper for the selected day's schedule */}
        <Card>
          <CardHeader>
            {/* Display selected date in "Month day, year" format */}
            <CardTitle className="text-lg">
              Schedule for {format(selectedDate, "MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getEventsForDate(selectedDate).length === 0 ? (
              // If no events exist for the selected date
              <div className="text-center py-10 text-neutral-500">
                No events scheduled for this day
              </div>
            ) : (
              // If events exist for the selected date
              <div className="space-y-4">
                {getEventsForDate(selectedDate).map((event) => (
                  <div 
                    key={event.id} 
                    className="border rounded-md p-4 hover:bg-neutral-50 cursor-pointer"
                    onClick={() => handleEventClick(event)} // Click opens event details dialog
                  >
                    <div className="flex justify-between items-start">
                      {/* Event title and time */}
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <div className="text-sm text-neutral-500">
                          {event.startTime} - {event.endTime}
                        </div>
                      </div>
                      {/* Event type badge */}
                      <Badge 
                        className={cn(
                          event.type === "class" && "bg-blue-100 text-blue-800 hover:bg-blue-200",
                          event.type === "exam" && "bg-orange-100 text-orange-800 hover:bg-orange-200",
                          event.type === "concert" && "bg-purple-100 text-purple-800 hover:bg-purple-200",
                          event.type === "meeting" && "bg-green-100 text-green-800 hover:bg-green-200"
                        )}
                      >
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {/* Batch name */}
                      {event.batchName && (
                        <div className="flex items-center text-xs text-neutral-500">
                          <Music className="h-3 w-3 mr-1" />
                          {event.batchName}
                        </div>
                      )}
                      {/* Branch name */}
                      {event.branch && (
                        <div className="flex items-center text-xs text-neutral-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.branch}
                        </div>
                      )}
                      {/* Student count */}
                      {event.studentCount > 0 && (
                        <div className="flex items-center text-xs text-neutral-500">
                          <Users className="h-3 w-3 mr-1" />
                          {event.studentCount} students
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            {/* Event title */}
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            {/* Event description */}
            <DialogDescription>
              Event details and information
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4 mt-4">
              {/* Event main info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {/* Icon */}
                  <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                  {/* Date */}
                  <span>{format(new Date(selectedEvent.date), "MMMM d, yyyy")}</span>
                </div>
                {/* Event type */}
                <Badge 
                  className={cn(
                    selectedEvent.type === "class" && "bg-blue-100 text-blue-800",
                    selectedEvent.type === "exam" && "bg-orange-100 text-orange-800",
                    selectedEvent.type === "concert" && "bg-purple-100 text-purple-800",
                    selectedEvent.type === "meeting" && "bg-green-100 text-green-800"
                  )}
                >
                  {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                </Badge>
              </div>
              
              {/* Event time */}
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-primary" />
                <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
              </div>
              
              {/* Event course and batch */}
              <div className="flex items-center">
                <Music className="h-4 w-4 mr-2 text-primary" />
                <span>{selectedEvent.courseName} ({selectedEvent.batchName})</span>
              </div>
              
              {/* Event branch */}
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                <span>{selectedEvent.branch}</span>
              </div>
              
              {/* Event student count */}
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-primary" />
                <span>{selectedEvent.studentCount} students</span>
              </div>
              
              {/* Event students */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Students</h4>
                <div className="flex flex-wrap gap-2">
                  {/* Student avatars */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Avatar key={i} className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {String.fromCharCode(65 + i)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {selectedEvent.studentCount > 5 && (
                    <div className="h-8 w-8 rounded-full bg-neutral-100 text-xs flex items-center justify-center">
                      +{selectedEvent.studentCount - 5}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Event actions */}
              <div className="flex justify-end space-x-2 pt-4">
                {/* View Batch button */}
                <Button variant="outline">View Batch</Button>
                {/* Take Attendance button*/}
                <Button>Take Attendance</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}