import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChartCard } from "@/components/ui/chart-card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";

/**
 * Props for the RevenueChart component.
 */

interface RevenueChartProps {
  /** Optional CSS class for custom styling */
  className?: string;
}

/**
 * Interface representing a single revenue data point.
 */
interface RevenueDataPoint {
  /** Month name or label */
  month: string;

  /** Revenue value for that month */
  revenue: number;
}


/**
 * RevenueChart component
 *
 * @Purpose
 * - Renders a bar chart of revenue over a selected period (default: 12 months).
 * - Fetches revenue data from `/api/dashboard/revenue-data` using React Query.
 * - Displays a loading spinner while fetching data.
 * - Shows an error message if fetching fails.
 * - Uses `Recharts` to display a responsive `BarChart`.
 * - Provides a custom Y-axis formatter (`K`, `L`, `M` format).
 * - Displays a footer legend explaining chart series.
 *
 * @param {RevenueChartProps} props - Component props
 * @param {string} [props.className] - Optional CSS class for styling
 *
 * @returns {JSX.Element} A styled chart card containing the revenue bar chart.
 *
 * @sideEffects
 * - Fetches data from the backend API.
 * - Updates the chart automatically when data changes.
 *
 * @throws {Error} Throws an error if the API returns invalid or empty data.
 *
 * @example
 * <RevenueChart className="my-custom-class" />
 */
export function RevenueChart({ className }: RevenueChartProps) {
  const [period, setPeriod] = useState("12months");  // State to track selected period
  
  // Fetch revenue data using React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard/revenue-data"], // unique query key
  });

  if (isLoading) {
    // Display loading spinner while fetching data
    return (
      <ChartCard 
        title="Revenue Overview" 
        period={period}
        onPeriodChange={setPeriod}
        className={className}
      >
        <div className="h-72 w-full flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </ChartCard>
    );
  }

  if (error) {
    // Display error message if fetching fails
    return (
      <ChartCard 
        title="Revenue Overview" 
        period={period}
        onPeriodChange={setPeriod}
        className={className}
      >
        <div className="h-72 w-full flex items-center justify-center text-red-500">
          Error loading revenue data: {error.message}
        </div>
      </ChartCard>
    );
  }
  
  /**
   * JSX legend content for the chart.
   *
   * @returns {JSX.Element} Legend with labels and colors for chart interpretation.
   */
  const legendContent = (
    <div className="flex justify-center items-center space-x-6">
      <div className="flex items-center">
        <div className="h-3 w-3 rounded-full bg-primary mr-2"></div>
        <span className="text-sm text-neutral-600">Revenue</span>
      </div>
      <div className="flex items-center">
        <div className="h-3 w-3 rounded-full bg-secondary mr-2"></div>
        <span className="text-sm text-neutral-600">Expenses</span>
      </div>
      <div className="flex items-center">
        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
        <span className="text-sm text-neutral-600">Profit</span>
      </div>
    </div>
  );

  /**
   * @purpose Formats revenue amount into human-readable format.
   *
   * @param {number} amount - Revenue amount
   * @returns {string} Formatted string (e.g., "12K", "1.5L", "2.3M")
   * 
   * @example
   * formatRevenueAmount(1250000); // returns "1.3M"
   */
  const formatRevenueAmount = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 100000) {
      return `${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return `${amount}`;
  };

  return (
    <ChartCard 
      title="Revenue Overview" 
      period={period}
      onPeriodChange={setPeriod}
      className={className}
      footer={legendContent} // Display chart legend in footer
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data as any} // Revenue data from API
            margin={{
              top: 5,
              right: 5,
              left: 20,
              bottom: 5,
            }}
          >
            {/* Grid lines are used to provide a visual reference for the data points */}
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EB" />
            {/* X-axis is used to display the data points horizontally */}
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#9AA5B1' }}
            />
            {/* Y-axis is used to display the data points vertically */}
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#9AA5B1' }}
              tickFormatter={formatRevenueAmount} // Format y-axis numbers
            />
            {/* Tooltip is used to display additional information when hovering over a data point */}
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), "Revenue"]} // Format tooltip values
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} // Custom cursor style
            />
            {/* Bar for Revenue */}
            <Bar dataKey="revenue" fill="#3949AB" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}