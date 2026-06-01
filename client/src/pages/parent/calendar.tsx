import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Clock, ChevronLeft, ChevronRight, Home, Search, X } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { useAuth } from "@/hooks/use-auth";


/**
 * ParentCalendar — React component showing a parent's calendar of student events.
 *
 * @purpose Render a calendar UI for parents to view children, filter by student/event type, and search events. Manages view mode (day/week/month) and selected date.
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
 *   <ParentCalendar />
 * </AppShell>
 */
export default function ParentCalendar() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [eventType, setEventType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  /**
   * List of students for filtering or selection in the Student UI
   *
   * @purpose
   * - Provides a static list of students including an "All Students" option.
   * - Used for dropdowns, filters, or selection menus in the UI.
   *
   * @param None
   * @returns {Array<Object>} Array of student objects with the following structure:
   *   - `id` {string} Unique identifier for the student or special value like "all"
   *   - `name` {string} Display name of the student
   * @throws None
   * @sideEffects None
   * 
   * @example
   * const riyaStudent = students.find(student => student.id === "1");
   * // { id: "1", name: "Riya Sharma" }
   * const allStudents = students[0];
   * // { id: "all", name: "All Students" }
   */
  const students = [
    { id: "all", name: "All Children" },
    { id: "1", name: "Riya Sharma" },
    { id: "2", name: "Arjun Sharma" }
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
    { id: "performance", name: "Performances", color: "bg-purple-500" },
    { id: "holiday", name: "Holidays", color: "bg-green-500" }
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
      title: "Guitar Class",
      date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 15, 0),
      endTime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 16, 30),
      type: "class",
      location: "Studio 3",
      teacher: "John Smith",
      student: "1", // Riya
      description: "Regular weekly guitar class"
    },
    {
      id: 2,
      title: "Piano Exam",
      date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 3, 10, 0),
      endTime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 3, 12, 0),
      type: "exam",
      location: "Auditorium",
      teacher: "Maria Rodriguez",
      student: "2", // Arjun
      description: "End of term examination"
    },
    {
      id: 3,
      title: "Annual Recital",
      date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 7, 18, 0),
      endTime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 7, 20, 0),
      type: "performance",
      location: "Main Hall",
      teacher: "Multiple",
      student: "all", // All children
      description: "Year-end performance showcase"
    },
    {
      id: 4,
      title: "Diwali Holiday",
      date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 14, 0, 0),
      endTime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 14, 23, 59),
      type: "holiday",
      location: "All Branches",
      teacher: "",
      student: "all",
      description: "School closed for Diwali"
    },
    {
      id: 5,
      title: "Violin Lesson",
      date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 2, 16, 0),
      endTime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 2, 17, 0),
      type: "class",
      location: "Studio 2",
      teacher: "Sarah Wilson",
      student: "2", // Arjun
      description: "Regular weekly violin lesson"
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
   * @param {Array<Object>} events - The array of event objects to filter.
   * @param {string} selectedStudent - The currently selected student identifier. Use "all" to include events for all students.
   * @param {string} eventType - The type of event to filter by. Use "all" to include all event types.
   * @param {string} [searchQuery] - Optional search term to filter events by title, teacher, or description.
   * @returns {Array<Object>} A new array containing events that match all filtering criteria.
   * @throws {TypeError} Throws if the `events` parameter is not an array or contains invalid event objects.
   * @sideEffects None - This function does not modify the original `events` array or any external variables.
   *
   * @example
   * const events = [
   *   { title: "Math Class", teacher: "John", description: "Algebra lesson", student: "S1", type: "class" },
   *   { title: "Science Fair", teacher: "Mary", description: "Annual competition", student: "S2", type: "event" },
   *   { title: "Parent Meeting", teacher: "Admin", description: "Discuss progress", student: "all", type: "meeting" }
   * ];
   * const results = filteredEvents; // Only events matching filters
   */
  const filteredEvents = events.filter(event => {
    const matchesStudent = selectedStudent === "all" || event.student === "all" || event.student === selectedStudent;
    const matchesType = eventType === "all" || event.type === eventType;
    const matchesSearch = !searchQuery ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStudent && matchesType && matchesSearch;
  });


  /**
   * getDaysInMonth — Generate all days to display in a month calendar view, including overflow days from previous month to fill the first week.
   * @purpose Prepare data structure for rendering a full month view calendar grid.
   * 
   * @param {number} year - Calendar year.
   * @param {number} month - Calendar month (0-11).
   * @returns {Array<{ date: Date; isCurrentMonth: boolean }>} - Array of day objects.
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
   * @param {Date} date - The date object from which the year and month are extracted.
   * @returns {Array<{ date: Date; isCurrentMonth: boolean }>} Array of day objects.
   * @throws {TypeError} Throws if the provided `date` is not a valid Date object.
   * @sideeffects None - This function does not modify the input date or any external state.
   *
   * @example
   * const date = new Date(2025, 1); // February 2025
   * const days = getDaysInMonth(date.getFullYear(), date.getMonth());
   * console.log(days); // 28
   */
  const days = getDaysInMonth(date.getFullYear(), date.getMonth());

  /**
   * getEventsForDay — Get all events occurring on a specific day.
   *
   * @purpose Display daily events in the calendar view.
   *
   * @param {Date} day - Date object representing the day to filter events for.
   * @returns {Array} - Array of events occurring on the given day.
   * @throws {TypeError} Throws if the provided `day` is not a valid Date object.
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
   * @purpose Display the time in the calendar grid.
   *
   * @param {Date} date - Date object to format.
   * @returns {string} - Time string, e.g., "10:30 AM".
   * @throws {TypeError} Throws if the provided `date` is not a valid Date object.
   * @sideEffects None - This function does not modify the input date or any external state.
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
   * @returns {string} - Short day name, e.g., "Mon", "Tue".
   * @throws {TypeError} Throws if the provided `day` is not a valid Date object.
   * @sideEffects None - This function does not modify the input date or any external state.
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
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setDate(newDate);
  };

  /**
   * Breadcrumb links for the Calendar page.
   *
   * @purpose Define navigation hierarchy for PageHeader.
   * 
   * @param None
   * @returns {Array<{title: string, href?: string, icon?: JSX.Element}>} Breadcrumb items for navigation.
   * @throws None
   * @sideEffects None
   * 
   * @example
   * // Used in PageHeader component
   * <PageHeader breadcrumbs={breadcrumbs} />
   */
  const breadcrumbs = [
    {
      title: "Home",
      href: "/parent/dashboard",
      icon: <Home className="h-4 w-4" />
    },
    {
      title: "Calendar"
    }
  ];

  return (
    // Appshell wraps the page content and provides a consistent layout and navigation structure, sidebars, headers, and footers
    <AppShell>
      {/* PageHeader with title, description, and breadcrumbs */}
      <PageHeader
        title="Calendar"
        description={`View ${selectedStudent === "all" ? "all children's" : students.find(s => s.id === selectedStudent)?.name + "'s"} classes and events`}
        breadcrumbs={breadcrumbs}
      />

      {/* Calendar grid */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          {/* Select component for student selection */}
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select child" />
            </SelectTrigger>
            <SelectContent>
              {/* Map students to SelectItem components */}
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Select component for event type selection */}
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Event type" />
            </SelectTrigger>
            <SelectContent>
              {/* Map event categories to SelectItem components */}
              {eventCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${category.color} mr-2`}></div>
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search input with icon and clear button */}
          <div className="relative flex-1">
            {/* Search icon */}
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            {/* Input field for search */}
            <Input
              placeholder="Search events..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* Clear button */}
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1.5 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tabs for calendar view selection */}
        <div className="flex-shrink-0">
          <Tabs defaultValue="month" className="w-[230px]" onValueChange={(value) => setView(value as "day" | "week" | "month")}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
            <TabsContent value="day"></TabsContent>
            <TabsContent value="week"></TabsContent>
            <TabsContent value="month"></TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Calendar content */}
      <Card>
        {/* If view is month, render month view */}
        <CardContent className="p-0">
          {view === "month" && (
            <div className="bg-white rounded-lg overflow-hidden">
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
                  {/* Month and year display */}
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

              {/* Month view grid: 7 columns for Sun-Sat */}
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {/* Day names */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}

                {/* Calendar day cells */}
                {days.map((day, i) => {
                  // Get events for the day
                  const eventsForDay = getEventsForDay(day.date);
                  // Check if the day is today
                  const isToday = day.date.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={i}
                      className={`min-h-[120px] bg-white p-2 ${day.isCurrentMonth ? "" : "text-gray-400"
                        } ${isToday ? "bg-blue-50" : ""}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-medium ${isToday ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center" : ""}`}>
                          {day.date.getDate()}
                        </span>
                        {/* Badge showing number of events for the day (if any) */}
                        {eventsForDay.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {eventsForDay.length} {eventsForDay.length === 1 ? 'event' : 'events'}
                          </Badge>
                        )}
                      </div>

                      {/* Events list container (scrollable, limits height) */}
                      <div className="space-y-1 overflow-y-auto max-h-[80px]">
                        {/* Render up to 3 events as a preview */}
                        {eventsForDay.slice(0, 3).map((event) => {
                          // Find the student name
                          const studentName = event.student === "all"
                            ? "All Children"
                            : students.find(s => s.id === event.student)?.name.split(' ')[0] || '';

                          return (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded truncate ${getEventColor(event.type)} bg-opacity-20 border-l-2 ${getEventColor(event.type)}`}
                            >
                              {/* Event title */}
                              <div className="font-medium truncate">{event.title}</div>
                              {/* Event time and student name */}
                              <div className="text-gray-600 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(event.date)}
                                {studentName !== "All Children" && (
                                  <span className="ml-1">• {studentName}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {/* If more than 3 events, show "+ N more" hint */}
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

          {/* Week view */}
          {view === "week" && (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="flex border-b">
                  <div className="w-20 p-4 border-r"></div>
                  {/* Seven day columns for the week */}
                  {Array.from({ length: 7 }, (_, i) => {
                    const day = new Date(date);
                    day.setDate(date.getDate() - date.getDay() + i); // compute day for column
                    const isToday = day.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={i}
                        className={`flex-1 p-4 text-center ${isToday ? "bg-blue-50" : ""}`}
                      >
                        {/* Day name (Mon, Tue, etc.) */}
                        <div className={`font-medium ${isToday ? "text-blue-600" : ""}`}>
                          {formatDayName(day)}
                        </div>
                        {/* Big date number, highlighted if today */}
                        <div className={`text-2xl ${isToday ? "bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""}`}>
                          {day.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Main week grid with time slots */}
                <div className="relative" style={{ height: "800px" }}>
                  {/* Time labels */}
                  <div className="absolute top-0 left-0 h-full w-20 border-r">
                    {Array.from({ length: 13 }, (_, i) => {
                      const hour = i + 9; // 9 AM to 9 PM
                      return (
                        <div key={hour} className="h-[100px] relative border-b">
                          {/* Label for the hour */}
                          <span className="absolute -top-2.5 left-2 text-xs text-gray-500">
                            {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Week columns placed to the right of the time labels */}
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

                            const studentName = event.student === "all"
                              ? "All Children"
                              : students.find(s => s.id === event.student)?.name.split(' ')[0] || '';

                            return (
                              <div
                                key={event.id}
                                className={`absolute left-1 right-1 rounded ${getEventColor(event.type)} bg-opacity-20 border-l-2 ${getEventColor(event.type)} p-2 overflow-hidden`}
                                style={{ top: `${topPosition}px`, height: `${height}px` }}
                              >
                                {/* Event title */}
                                <div className="font-medium text-sm truncate">{event.title}</div>
                                {/* Event time and student name */}
                                <div className="text-xs text-gray-600 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatTime(event.date)} - {formatTime(event.endTime)}
                                </div>
                                {/* Student name and location */}
                                {height > 60 && (
                                  <div className="text-xs mt-1">
                                    {studentName !== "All Children" && (
                                      <div className="truncate">{studentName}</div>
                                    )}
                                    {event.location && (
                                      <div className="truncate">{event.location}</div>
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

          {/* Day view */}
          {view === "day" && ( //Check if the current view is 'day'; only then render this section
            <div>
              <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center">
                  {/* Previous day button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newDate = new Date(date);
                      newDate.setDate(newDate.getDate() - 1); // Go 1 day back
                      setDate(newDate);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {/* Day title */}
                  <h2 className="text-xl font-semibold mx-4">
                    {format(date, 'EEEE, MMMM d, yyyy')}
                  </h2>
                  {/* Next day button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newDate = new Date(date);
                      newDate.setDate(newDate.getDate() + 1); // Go 1 day forward
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

                  {/* Map events to the day */}
                  {getEventsForDay(date).map((event) => {
                    const startHour = event.date.getHours();
                    const startMinute = event.date.getMinutes();
                    const endHour = event.endTime.getHours();
                    const endMinute = event.endTime.getMinutes();

                    const topPosition = ((startHour - 9) * 100) + (startMinute / 60 * 100);
                    const height = ((endHour - startHour) * 100) + ((endMinute - startMinute) / 60 * 100);

                    const studentName = event.student === "all"
                      ? "All Children"
                      : students.find(s => s.id === event.student)?.name.split(' ')[0] || '';

                    return (
                      <div
                        key={event.id}
                        className={`absolute left-2 right-2 md:left-[15%] md:right-[15%] rounded ${getEventColor(event.type)} bg-opacity-20 border-l-2 ${getEventColor(event.type)} p-3 overflow-hidden`}
                        style={{ top: `${topPosition}px`, height: `${height}px` }}
                      >
                        {/* Event title */}
                        <div className="font-medium text-sm md:text-base truncate">{event.title}</div>
                        {/* Event time and student name */}
                        <div className="text-xs md:text-sm text-gray-600 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(event.date)} - {formatTime(event.endTime)}
                        </div>
                        {/* Student name and location */}
                        {height > 60 && (
                          <div className="text-xs md:text-sm mt-2 space-y-1">
                            {studentName !== "All Children" && (
                              <div className="flex items-center truncate">
                                <Badge variant="outline" className="mr-2">Student</Badge>
                                {studentName}
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center truncate">
                                <Badge variant="outline" className="mr-2">Location</Badge>
                                {event.location}
                              </div>
                            )}
                            {/* Teacher name */}
                            {event.teacher && (
                              <div className="flex items-center truncate">
                                <Badge variant="outline" className="mr-2">Teacher</Badge>
                                {event.teacher}
                              </div>
                            )}
                            {/* Event description */}
                            {event.description && (
                              <div className="flex items-start mt-1">
                                <Badge variant="outline" className="mr-2 mt-0.5">Notes</Badge>
                                <span className="flex-1">{event.description}</span>
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