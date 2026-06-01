import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Music, 
  Music2,
  BookOpen,
  Users
} from "lucide-react";
import { format, isSameDay, addMonths, subMonths, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

/**
 * StudentCalendar — React component showing a student's calendar of events.
 *
 * @purpose Render a calendar UI for students to view their events, filter by course, and search events. Manages view mode (day/week/month) and selected date.
 * 
 * @param None
 * @returns {JSX.Element} The calendar UI containing controls (date, view, student selector, filters) and the event grid/list for the chosen month/week/day.
 * @throws None
 * @sideEffects
 * - Reads authenticated user via `useAuth()` (may affect what's shown).
 * - Manages local React state (date, view, filters).
 * - May trigger renders of child components that perform fetches (not in this snippet).
 *
 * @example
 * // Render the calendar inside your app layout:
 * <AppShell>
 *   <StudentCalendar />
 * </AppShell>
 */
export default function StudentCalendar() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  
  /**
   * List of courses for filtering or selection in the Student UI
   *
   * @purpose
   * - Provides a static list of courses including an "All Courses" option.
   * - Used for dropdowns, filters, or selection menus in the UI.
   *
   * @param None
   * @returns {Array<Object>} Array of course objects with the following structure:
   *   - `id` {string} Unique identifier for the course or special value like "all"
   *   - `name` {string} Display name of the course
   * @throws None
   * @sideEffects None
   * @example
   * const guitarCourse = courses.find(course => course.id === "guitar");
   * // { id: "guitar", name: "Guitar Lessons" }
   * const allCourses = courses[0];
   * // { id: "all", name: "All Courses" }
   */
  const courses = [
    { id: "all", name: "All Courses" },
    { id: "guitar", name: "Guitar Lessons" },
    { id: "music-theory", name: "Music Theory" }
  ];

  /**
   * eventCategories — Category meta used to map event types to colors etc.
   *
   * @purpose Provide lookups and display metadata for calendar event types.
   * @param None
   * @returns {Array<{id:string, name:string, color:string}>}
   * @throws None
   * @sideEffects None
   * @example
   * getEventColor('class') // 'bg-blue-500'
   */
  const eventCategories = [
    { id: "class", name: "Regular Classes", color: "bg-blue-500" },
    { id: "exam", name: "Exams", color: "bg-red-500" },
    { id: "practice", name: "Practice Sessions", color: "bg-green-500" },
    { id: "performance", name: "Performances", color: "bg-purple-500" },
    { id: "holiday", name: "Holidays", color: "bg-amber-500" }
  ];

  /**
   * Static events sample data (UI mock).
   *
   * @purpose Provide example event objects for local calendar rendering while backend integration is pending.
   * @param None
   * @returns {Array<Object>} Array of event objects.
   * @throws None
   * @sideEffects None
   * @example
   * getEventsForDay(new Date())
   */
  const events = [
    {
      id: 1,
      title: "Guitar Lesson",
      date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 16, 0),
      endTime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 17, 30),
      type: "class",
      course: "guitar",
      location: "Studio 3",
      teacher: "John Smith",
      notes: "Bring your guitar and practice book"
    },
    {
      id: 2,
      title: "Music Theory Class",
      date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 3, 15, 0),
      endTime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 3, 16, 0),
      type: "class",
      course: "music-theory",
      location: "Room 102",
      teacher: "Sarah Wilson",
      notes: "Focus on chord progressions"
    },
    {
      id: 3,
      title: "Guitar Practice Session",
      date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 5, 18, 0),
      endTime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 5, 19, 0),
      type: "practice",
      course: "guitar",
      location: "Practice Room 4",
      teacher: "",
      notes: "Open practice time, instructor available for questions"
    },
    {
      id: 4,
      title: "Music Theory Exam",
      date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 10, 14, 0),
      endTime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 10, 15, 30),
      type: "exam",
      course: "music-theory",
      location: "Main Hall",
      teacher: "Sarah Wilson",
      notes: "Covers material from modules 1-4"
    },
    {
      id: 5,
      title: "School Concert",
      date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 15, 18, 0),
      endTime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 15, 20, 0),
      type: "performance",
      course: "all",
      location: "Auditorium",
      teacher: "Multiple",
      notes: "Arrival time is 17:00, formal attire required"
    },
    {
      id: 6,
      title: "Diwali Holiday",
      date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 20, 0, 0),
      endTime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 20, 23, 59),
      type: "holiday",
      course: "all",
      location: "School Closed",
      teacher: "",
      notes: "No classes on this day"
    }
  ];

  /**
   * getEventColor — Get CSS background color for an event type.
   * @purpose Provide a consistent color for each type of calendar event for UI display.
   * 
   * @param {string} type - Event type ID (e.g., "class", "exam", "holiday").
   * @returns {string} - Tailwind CSS class string for the background color.
   * @throws None
   * @sideEffects None
   *
   * @example
   * const color = getEventColor("exam"); // "bg-red-500"
   */
  const getEventColor = (type: string) => {
    const category = eventCategories.find(cat => cat.id === type);
    return category ? category.color : "bg-gray-500";
  };

   /**
   * filteredEvents — Array of events filtered by student, type, and search query.
   *
   * @purpose Dynamically filter events for display in the calendar based on user selections.
   * 
   * @sideEffects Reads component state: selectedStudent, eventType, searchQuery.
   * @returns {Array<Object>} Array of filtered event objects.
   * @throws None
   * @example
   * const results = filteredEvents; // Only events matching filters
   */
  const filteredEvents = events.filter(event => {
    return courseFilter === "all" || event.course === courseFilter || event.course === "all";
  });

  /**
   * getDaysInMonth — Generate all days to display in a month calendar view, including overflow days from previous month to fill the first week.
   * 
   * @purpose Prepare data structure for rendering a full month view calendar grid.
   * 
   * @param {number} year - Calendar year.
   * @param {number} month - Calendar month (0-11).
   * @returns {Array<{ date: Date; isCurrentMonth: boolean }>} Array of day objects.
   * @throws None
   * @sideEffects None
   *
   * @example
   * const days = getDaysInMonth(2025, 9); // All days for October 2025, including overflow
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
   * days — Array of Date objects representing all days in the current calendar month view.
   *
   * @purpose Prepare the month grid for rendering, including overflow days from previous/next month.
   * 
   * @param {Date} date - Date object representing the current month.
   * @returns {Array<{ date: Date; isCurrentMonth: boolean }>} Array of day objects.
   * @throws None
   * @sideEffects None
   *
   * @example
   * const days = getDaysInMonth(date.getFullYear(), date.getMonth());
   */
  const days = getDaysInMonth(date.getFullYear(), date.getMonth());

  /**
   * getEventsForDay — Get all events occurring on a specific day.
   *
   * @purpose Display daily events in the calendar view.
   * 
   * @param {Date} day - Date object representing the day to filter events for.
   * @returns {Array} Array of events occurring on the given day.
   * @throws None
   * @sideEffects Reads component state: filteredEvents
   *
   * @example
   * const eventsToday = getEventsForDay(new Date());
   */
  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter(event => 
      isSameDay(new Date(event.date), day)
    );
  };

  /**
   * formatTime — Format a Date object to a time string.
   *
   * @purpose Format a Date object to a time string.
   *
   * @param {Date} date - Date object to format.
   * @returns {string} Time string, e.g., "14:30".
   * @throws None
   * @sideEffects None
   *
   * @example
   * const time = formatTime(new Date());
   */
  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  /**
   * formatDayName — Format a Date object to a short day name.
   *
   * @purpose Display the day label in the calendar grid.
   * 
   * @param {Date} day - Date object to format.
   * @returns {string} Short day name, e.g., "Mon", "Tue".
   * @throws None
   * @sideEffects None
   *
   * @example
   * const dayName = formatDayName(new Date()); // "Wed"
   */
  const formatDayName = (day: Date) => {
    return format(day, 'EEE');
  };

  /**
   * navigateMonth — Move calendar to previous or next month.
   *
   * @purpose Enable month-to-month navigation in the calendar UI.
   * 
   * @param {'prev' | 'next'} direction - Direction to navigate the calendar.
   * @returns None
   * @throws None
   * @sideEffects Updates component state: date
   *
   * @example
   * navigateMonth('next'); // Moves calendar to next month
   */
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(date);
    if (direction === 'prev') {
      setDate(subMonths(newDate, 1));
    } else {
      setDate(addMonths(newDate, 1));
    }
  };

  /**
   * upcomingEvents
   *
   * @purpose Extract and sort the next three upcoming events from the filtered event list.
   * @param None
   * @returns {Event[]} An array containing up to the next three upcoming event objects.
   * @throws None
   * @sideEffects None
   * @example
   * // Example: Assuming filteredEvents includes multiple past and future events
   * const upcomingEvents = filteredEvents
   *   .filter(event => event.date > new Date())
   *   .sort((a, b) => a.date.getTime() - b.date.getTime())
   *   .slice(0, 3);
   *
   * // Result:
   * // [
   * //   { id: 5, title: "Guitar Class", date: 2025-10-06T15:00:00Z },
   * //   { id: 8, title: "Piano Lesson", date: 2025-10-08T14:00:00Z },
   * //   { id: 9, title: "Vocal Workshop", date: 2025-10-09T16:00:00Z }
   * // ]
   */
  const upcomingEvents = filteredEvents
    .filter(event => event.date > new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);

  /**
   * Breadcrumb links for the Calendar page.
   *
   * @purpose Define navigation hierarchy for PageHeader.
   * @param None
   * @returns {Array<{title: string, href?: string, icon?: JSX.Element}>} Breadcrumb items for navigation.
   * @throws None
   * @sideEffects None
   * @example
   * // Used in PageHeader component
   * <PageHeader breadcrumbs={breadcrumbs} />
   */
  const breadcrumbs = [
    {
      title: "Home",
      href: "/student/dashboard",
      icon: <Home className="h-4 w-4" />
    },
    {
      title: "Calendar"
    }
  ];

  return (
    // Appshell wraps the page content and provides a consistent layout
    <AppShell>
      {/* PageHeader component with title, description, and breadcrumbs */}
      <PageHeader 
        title="Calendar" 
        description="View your class schedule, exams, and important events"
        breadcrumbs={breadcrumbs}
      />

      {/* Calendar grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Left column: Calendar */}
        <div className="md:col-span-2">
          <Card>
            {/* Card header with title */}
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            {/* Card content */}
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="flex items-start p-3 bg-muted rounded-lg">
                      <div className={`p-2 rounded-full ${getEventColor(event.type)} bg-opacity-20 mr-3`}>
                        {event.type === "class" && <Music2 className="h-5 w-5 text-blue-600" />}
                        {event.type === "exam" && <BookOpen className="h-5 w-5 text-red-600" />}
                        {event.type === "practice" && <Music className="h-5 w-5 text-green-600" />}
                        {event.type === "performance" && <Users className="h-5 w-5 text-purple-600" />}
                        {event.type === "holiday" && <CalendarIcon className="h-5 w-5 text-amber-600" />}
                      </div>
                      
                      {/* Event details */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <h4 className="font-medium text-sm md:text-base">{event.title}</h4>
                          <div className="flex items-center mt-1 md:mt-0">
                            <Clock className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-xs text-gray-500">
                              {format(event.date, 'EEE, MMM d')} • {formatTime(event.date)}
                            </span>
                          </div>
                        </div>
                        {/* Event location and teacher */}
                        <div className="mt-1 text-sm text-gray-600">
                          {event.location} {event.teacher && `• ${event.teacher}`}
                        </div>
                        {/* Event notes */}
                        {event.notes && (
                          <div className="mt-1 text-xs text-gray-500">
                            {event.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No upcoming events</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Course Filter */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Course Filter</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Dropdown to select a course */}
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {/* Dropdown options for courses */}
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Event Categories / Types */}
              <div className="mt-4 space-y-3">
                <h4 className="text-sm font-medium">Event Types</h4>
                <div className="grid grid-cols-1 gap-2">
                  {/* Event type filter */}
                  {eventCategories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${category.color} mr-2`}></div>
                      <span className="text-sm">{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar View Tabs */}
              <div className="mt-4">
                <Tabs defaultValue="month" className="w-full" onValueChange={(value) => setView(value as "day" | "week" | "month")}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="day">Day</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                  </TabsList>
                  {/* Tabs content for different views */}
                  <TabsContent value="day"></TabsContent>
                  <TabsContent value="week"></TabsContent>
                  <TabsContent value="month"></TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Calendar Display */}
      <Card>
        <CardContent className="p-0">
          {view === "month" && (
            <div className="bg-white rounded-lg overflow-hidden">
              {/* Calendar header: month navigation */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center">
                  {/* Previous month button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {/* Month display */}
                  <h2 className="text-xl font-semibold mx-4">
                    {format(date, 'MMMM yyyy')}
                  </h2>
                  {/* Next month button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateMonth('next')}
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
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {/* Day names */}
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
                      {/* Day number and event count badge */}
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-medium ${isToday ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center" : ""}`}>
                          {day.date.getDate()}
                        </span>
                        {eventsForDay.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {eventsForDay.length} {eventsForDay.length === 1 ? 'event' : 'events'}
                          </Badge>
                        )}
                      </div>

                      {/* Display events (max 3, with +N more) */}
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
                        {eventsForDay.length > 3 && (
                          <div className="text-xs text-blue-600 font-medium">
                            + {eventsForDay.length - 3} more
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
                <div className="flex border-b">
                  {/* Time labels */}
                  <div className="w-20 p-4 border-r"></div>
                  {Array.from({ length: 7 }, (_, i) => {
                    const day = new Date(date);
                    day.setDate(date.getDate() - date.getDay() + i);
                    const isToday = day.toDateString() === new Date().toDateString();
                    
                    return (
                      <div
                        key={i}
                        className={`flex-1 p-4 text-center ${isToday ? "bg-blue-50" : ""}`}
                      >
                        {/* Day name */}
                        <div className={`font-medium ${isToday ? "text-blue-600" : ""}`}>
                          {formatDayName(day)}
                        </div>
                        {/* Day number */}
                        <div className={`text-2xl ${isToday ? "bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""}`}>
                          {day.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Time labels */}
                <div className="relative" style={{ height: "800px" }}>
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
                          
                          {/* Events */}
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
                                {height > 60 && (
                                  <div className="text-xs mt-1">
                                    {event.location && (
                                      <div className="truncate">{event.location}</div>
                                    )}
                                    {event.teacher && (
                                      <div className="truncate">{event.teacher}</div>
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
              <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center">
                  {/* Previous day button */}
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
                  {/* Day display */}
                  <h2 className="text-xl font-semibold mx-4">
                    {format(date, 'EEEE, MMMM d, yyyy')}
                  </h2>
                  {/* Next day button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newDate = new Date(date);
                      newDate.setDate(newDate.getDate() + 1);
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
              
              {/* Time labels */}
              <div className="relative" style={{ height: "800px" }}>
                {/* Time labels */}
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
                  {Array.from({ length: 13 }, (_, hourIndex) => (
                    <div key={hourIndex} className="h-[100px] border-b"></div>
                  ))}
                  
                  {getEventsForDay(date).map((event) => {
                    const startHour = event.date.getHours();
                    const startMinute = event.date.getMinutes();
                    const endHour = event.endTime.getHours();
                    const endMinute = event.endTime.getMinutes();
                    
                    const topPosition = ((startHour - 9) * 100) + (startMinute / 60 * 100);
                    const height = ((endHour - startHour) * 100) + ((endMinute - startMinute) / 60 * 100);
                    
                    return (
                      <div
                        key={event.id}
                        className={`absolute left-2 right-2 md:left-[15%] md:right-[15%] rounded ${getEventColor(event.type)} bg-opacity-20 border-l-2 ${getEventColor(event.type)} p-3 overflow-hidden`}
                        style={{ top: `${topPosition}px`, height: `${height}px` }}
                      >
                        <div className="font-medium text-sm md:text-base truncate">{event.title}</div>
                        <div className="text-xs md:text-sm text-gray-600 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(event.date)} - {formatTime(event.endTime)}
                        </div>
                        {/* Event details */}
                        {height > 60 && (
                          // Event location
                          <div className="text-xs md:text-sm mt-2 space-y-1">
                            {event.location && (
                              <div className="flex items-center truncate">
                                <Badge variant="outline" className="mr-2">Location</Badge>
                                {event.location}
                              </div>
                            )}
                            {/* Event teacher */}
                            {event.teacher && (
                              <div className="flex items-center truncate">
                                <Badge variant="outline" className="mr-2">Teacher</Badge>
                                {event.teacher}
                              </div>
                            )}
                            {/* Event notes */}
                            {event.notes && (
                              <div className="flex items-start mt-1">
                                <Badge variant="outline" className="mr-2 mt-0.5">Notes</Badge>
                                <span className="flex-1">{event.notes}</span>
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