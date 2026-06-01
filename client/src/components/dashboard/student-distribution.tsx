import { useQuery } from "@tanstack/react-query";
import { ChartCard } from "@/components/ui/chart-card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

/**
 * Props for StudentDistribution component.
 */
interface StudentDistributionProps {
    /** Optional additional className for styling */
  className?: string;
}

/**
 * StudentDistribution component
 *
 * @purposes
 * - Displays a pie chart of student enrollment distribution across different courses.
 * - Fetches student distribution data from `/api/dashboard/student-distribution` using React Query.
 * - Shows a loading spinner while data is being fetched.
 * - Handles API errors and displays an error message.
 * - Renders a PieChart with percentage labels for Music, Dance, and Art courses.
 * - Displays a legend with actual numbers and percentages below the chart.
 *
 * @param {StudentDistributionProps} props - Component props
 * @param {string} [props.className] - Optional additional CSS class
 * @returns {JSX.Element} The chart card with the pie chart and legend
 * @sideEffects
 * - Fetches data from the API endpoint.
 * - Updates the chart and legend when data is received.
 * @throws Will throw if `data` is missing or not in the expected format (e.g., music, dance, art, total keys missing).
 *
 * @example
 * <StudentDistribution className="mb-6" />
 */
export function StudentDistribution({ className }: StudentDistributionProps) {
  // Fetch student distribution data
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard/student-distribution"],
    queryFn: () => fetch("/api/dashboard/student-distribution").then((res) => res.json()),
  });

  if (isLoading) {
    // Loading state
    return (
      <ChartCard title="Student Distribution" className={className}>
        <div className="h-52 w-full flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </ChartCard>
    );
  }

  if (error) {
    // Error state
    return (
      <ChartCard title="Student Distribution" className={className}>
        <div className="h-52 w-full flex items-center justify-center text-red-500">
          Error loading student distribution: {error.message}
        </div>
      </ChartCard>
    );
  }

  // Memoize chart data to avoid recalculation on every render
  const chartData = [
    { name: "Music Courses", value: data?.music || 0, color: "#3949AB" },
    { name: "Dance Courses", value: data?.dance || 0, color: "#F57C00" },
    { name: "Art Courses", value: data?.art || 0, color: "#48BB78" }
  ];

  /**
   * @purpose 
   * - Custom label renderer for pie chart slices.
   * - The props come from recharts — keep as any to avoid strict type friction.
   * 
   * @param {Object} params - Parameters for the label renderer
   * @param {number} params.cx - X coordinate of the center of the pie
   * @param {number} params.cy - Y coordinate of the center of the pie
   * @param {number} params.midAngle - Middle angle of the slice
   * @param {number} params.innerRadius - Inner radius of the pie
   * @param {number} params.outerRadius - Outer radius of the pie
   * @param {number} params.percent - Percentage of the slice
   * @returns {JSX.Element} The label element
   * @sideEffects None
   * 
   * @example
   * // Example usage in a Recharts Pie component:
   * <Pie
   *   data={data}
   *   cx="50%"
   *   cy="50%"
   *   labelLine={false}
   *   label={renderCustomizedLabel}
   *   outerRadius={100}
   *   dataKey="value"
   * >
   *   {data.map((entry, index) => (
   *     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
   *   ))}
   * </Pie>
   */
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };


  /**
   * @purpose 
   * - Calculates percentage of a course relative to total students.
   * 
   * @param {number} value - The value to calculate the percentage for
   * @returns {number} The percentage of the value relative to total students
   * @sideEffects None
   * 
   * @example
   * // Example usage:
   * const data = { total: 200 };
   * const result = calculatePercentage(50); 
   * // Returns: 25
   *
   * // If data.total is 0 or undefined:
   * const result = calculatePercentage(50);
   * // Returns: 0
   */
  const calculatePercentage = (value: number) => {
    return data?.total ? Math.round((value / data.total) * 100) : 0;
  };

  return (
    <ChartCard title="Student Distribution" className={className}>
      {/* Chart container */}
      <div className="h-52 w-full flex justify-center items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* Pie chart showing student distribution */}
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel} // Custom label showing percentage inside slices
              outerRadius={80}
              innerRadius={30}
              dataKey="value" // Data key used for chart values
            >
              {/* Render color segments for each course */}
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {/* Tooltip that shows student count when hovering */}
            <Tooltip formatter={(value: number) => [value, "Students"]} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend showing course labels, percentages, and counts */}
      <div className="space-y-3 mt-4">
        {/* Music courses legend item */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-primary mr-2"></div>
            <span className="text-sm text-neutral-600">Music Courses</span>
          </div>
          <span className="text-sm font-medium">{calculatePercentage(data?.music || 0)}% ({data?.music || 0})</span>
        </div>
        {/* Dance courses legend item */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-secondary mr-2"></div>
            <span className="text-sm text-neutral-600">Dance Courses</span>
          </div>
          <span className="text-sm font-medium">{calculatePercentage(data?.dance || 0)}% ({data?.dance || 0})</span>
        </div>
        {/* Art courses legend item */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm text-neutral-600">Art Courses</span>
          </div>
          <span className="text-sm font-medium">{calculatePercentage(data?.art || 0)}% ({data?.art || 0})</span>
        </div>
      </div>
    </ChartCard>
  );
}
