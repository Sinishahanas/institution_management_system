import { useQuery } from "@tanstack/react-query";
import { ChartCard } from "@/components/ui/chart-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

/**
 * Props for the TodaysClasses component.
 */
interface TodaysClassesProps {
  /** Optional additional CSS class for styling */
  className?: string;
}

/**
 * Shape of each class item returned by the API.
 */
interface ClassInfo {
  batchName: string;
  courseCategory: string;
  startTime: string;
  endTime: string;
  location: string;
  teacherName: string;
  studentCount: number;
}

/**
 * TodaysClasses Component
 *
 * Purpose: Displays a list of today's scheduled classes including timing, location, category, teacher, and student count.
 * - Fetches today's class schedule from `/api/dashboard/today-classes` using React Query.
 * - Displays a loading skeleton while fetching and handles errors gracefully.
 * - Shows batch name, course category, start/end time, location, teacher, and number of students.
 * - Uses `Badge` for category, `Avatar` for teacher initials, and icons for time/location.
 *
 * @param {TodaysClassesProps} props - Component props.
 * @param {string} [props.className] - Optional additional CSS class for styling the card.
 * @returns {JSX.Element} A chart card showing today's classes.
 * @sideEffects
 * - Fetches data from the API.
 * - Renders skeleton UI during loading.
 * @throws Will throw if `data` is missing or malformed (e.g., API returns unexpected structure).
 *
 * @example
 * ```tsx
 * <TodaysClasses className="mb-6" />
 * ```
 */
export function TodaysClasses({ className }: TodaysClassesProps) {
  // Fetch today's classes
  const { data, isLoading, error } = useQuery<any>({
    queryKey: ["/api/dashboard/today-classes"],
    queryFn: () => fetch("/api/dashboard/today-classes").then((res) => res.json()),
  });

  // Show skeleton loading state while data is being fetched
  if (isLoading) {
    // Loading state
    return (
      <ChartCard
        title="Today's Classes"
        actions={
          <Button variant="link" size="sm">
            View All
          </Button>
        }
        className={className}
      >
        {/* Animated placeholder content simulating card layout */}
        <div className="animate-pulse space-y-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="p-4 border border-neutral-200 rounded-md">
                {/* Title and time placeholders */}
                <div className="flex justify-between items-start mb-2">
                  <div className="h-5 w-40 bg-neutral-200 rounded"></div>
                  <div className="h-5 w-16 bg-neutral-200 rounded"></div>
                </div>

                {/* Instructor and duration placeholders */}
                <div className="flex justify-between my-2">
                  <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                  <div className="h-4 w-20 bg-neutral-200 rounded"></div>
                </div>

                {/* Avatar and category placeholders */}
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center">
                    <div className="h-6 w-6 bg-neutral-200 rounded-full mr-2"></div>
                    <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                  </div>
                  <div className="h-4 w-16 bg-neutral-200 rounded"></div>
                </div>
              </div>
            ))}
        </div>
      </ChartCard>
    );
  }

  // Display an error message if API request fails
  if (error) {
    // Error state
    return (
      <ChartCard
        title="Today's Classes"
        actions={
          <Button variant="link" size="sm">
            View All
          </Button>
        }
        className={className}
      >
        <div className="p-4 text-red-500">
          Error loading today's classes: {error.message}
        </div>
      </ChartCard>
    );
  }

  /**
   * @purpose
   * - Returns a CSS class for the category badge based on the course category.
   * - Used to visually differentiate between Music, Dance, and Art classes.
   *
   * @param category - The course category (e.g., "music", "dance", "art").
   * @returns A CSS class for the category badge based on the course category.
   * @throws Will throw if `category` is not a valid course category.
   *
   * @example
   * ```tsx
   * const badgeClass = getCategoryBadgeColor("music");
   * ```
   */
  const getCategoryBadgeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "music":
        return category === "music"
          ? "bg-blue-100 text-blue-800"
          : "bg-blue-100 text-blue-800";
      case "dance":
        return "bg-orange-100 text-orange-800";
      case "art":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  /**
   * @purpose
   * - Formats a time string (ISO format) into a human-readable format.
   * - Example: "2025-10-10T10:30:00Z" → "10:30 AM"
   *
   * @param timeString - The time string to format.
   * @returns The formatted time string.
   * @throws Will throw if `timeString` is not a valid ISO format.
   *
   * @example
   * ```tsx
   * const formattedTime = formatTime("2025-10-10T10:30:00Z");
   * ```
   */
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return format(date, "h:mm a");
  };

  /**
   * @purpose
   * - Extracts initials from full name.
   *
   * @param name - The full name.
   * @returns The initials of the name.
   *
   * @example
   * ```tsx
   * const initials = getTeacherInitials("John Doe");
   * ```
   */
  const getTeacherInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <ChartCard
      // Title of the chart section and an action button to view all classes
      title="Today's Classes"
      actions={
        <Button variant="link" size="sm">
          View All
        </Button>
      }
      // Additional CSS class for styling the chart card
      className={className}
    >
      {/* Container for class cards */}
      <div className="space-y-4">
        {data &&
          data.map((classInfo: ClassInfo, index: number) => (
            <div
              key={index}
              className="p-4 border border-neutral-200 rounded-md hover:border-neutral-300 transition-colors"
            >
              {/* Header Section
                - Displays batch name
                - Category badge (Music, Dance, Art)
              */}
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-neutral-900">
                  {classInfo.batchName}
                </h4>
                <Badge
                  variant="outline"
                  className={getCategoryBadgeColor(classInfo.courseCategory)}
                >
                  {classInfo.courseCategory}
                </Badge>
              </div>

              {/*
                Time & Location Section
                - Shows class timing (start → end)
                - Displays the location
               */}
              <div className="flex justify-between text-sm mb-2">
                <div className="text-neutral-600">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {formatTime(classInfo.startTime)} -{" "}
                  {formatTime(classInfo.endTime)}
                </div>
                <div className="text-neutral-600">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  {classInfo.location}
                </div>
              </div>

              {/* Footer Section
                - Teacher name and avatar initials
                - Total enrolled students count
              */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {/* Avatar placeholder with teacher initials */}
                  <Avatar className="h-6 w-6 rounded-full bg-neutral-200 mr-2">
                    <AvatarFallback className="text-neutral-600 text-xs">
                      {getTeacherInitials(classInfo.teacherName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-neutral-700">
                    {classInfo.teacherName}
                  </span>
                </div>
                {/* Display number of students enrolled in this class */}
                <span className="text-xs text-neutral-500">
                  {classInfo.studentCount} students
                </span>
              </div>
            </div>
          ))}
      </div>
    </ChartCard>
  );
}
