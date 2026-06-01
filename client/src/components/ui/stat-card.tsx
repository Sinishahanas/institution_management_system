import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";


/**
 * @interface StatCardProps
 * @description Props for the `StatCard` component.
 *
 * @property {string} title - Title or label of the statistic (e.g., “Total Users”).
 * @property {string | number} value - The numerical or textual value to display.
 * @property {LucideIcon} icon - A Lucide icon component to visually represent the metric.
 * @property {string} iconColor - Tailwind color class applied to the icon (e.g., "text-blue-500").
 * @property {string} iconBgColor - Tailwind color class for the icon’s background (e.g., "bg-blue-100").
 * @property {{ value: number; label: string; positive: boolean; }} [trend] - Optional trend indicator.
 * @property {number} trend.value - Percentage change in the metric.
 * @property {string} trend.label - Short label describing the trend (e.g., “since last week”).
 * @property {boolean} trend.positive - Whether the trend is positive (green) or negative (red).
 * @property {string} [className] - Optional additional class names for the card container.
 */
interface StatCardProps {
  /**
   * The title of the stat card.
   */
  title: string;

  /**
   * The main value to display.
   */
  value: string | number;

  /**
   * Icon component from lucide-react.
   */
  icon: LucideIcon;

  /**
   * CSS classes for the icon color.
   */
  iconColor: string;

  /**
   * CSS classes for the icon background color.
   */
  iconBgColor: string;

  /**
   * Optional trend information.
   */
  trend?: {

    /**
     * Numeric value for the trend.
     */
    value: number;

    /**
     * Label describing the trend (e.g., "since last week").
     */
    label: string;

    /**
     * Whether the trend is positive (true) or negative (false).
     */
    positive: boolean;
  };
  className?: string;
}


/**
 * StatCard component.
 *
 * @purpose
 * - Displays a statistic with a title, main value, optional trend info, and an icon.
 *
 * @param {StatCardProps} props - Props for the StatCard component which include title, value, icon, iconColor, iconBgColor, trend, and className.
 * @returns {JSX.Element} A styled card showing the statistic.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <StatCard
 *   title="Revenue"
 *   value={12500}
 *   icon={TrendingUpIcon}
 *   iconColor="text-white"
 *   iconBgColor="bg-green-500"
 *   trend={{ value: 12, label: "since last week", positive: true }}
 * />
 */
export function StatCard({ title, value, icon: Icon, iconColor, iconBgColor, trend, className }: StatCardProps) {
  return (
    // Outer container for the statistic card
    <div className={cn("bg-white rounded-lg shadow-sm p-6 border border-neutral-200", className)}>
      {/* Header section: title, value, and icon */}
      <div className="flex justify-between items-start mb-4">
        <div>
          {/* Label or descriptor for the metric */}
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          {/* Main value displayed in a large, bold font */}
          <h3 className={cn("text-2xl font-bold text-neutral-900", typeof value === "number" && "font-mono")}>
            {value}
          </h3>
        </div>
        {/* Icon container */}
        <div className={cn("rounded-full p-2", iconBgColor)}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
      </div>
      
      {/* Trend indicator (if provided) */}
      {trend && (
        <div className="flex items-center">
          <span 
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
              trend.positive 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            )}
          >
            {/* SVG icon for the trend indicator */}
            <svg 
              className="h-3 w-3 mr-1" 
              fill="currentColor" 
              viewBox="0 0 20 20" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {trend.positive ? (
                // Upward arrow for positive trend
                <path 
                  fillRule="evenodd" 
                  d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" 
                  clipRule="evenodd"
                />
              ) : (
                // Downward arrow for negative trend
                <path 
                  fillRule="evenodd" 
                  d="M12 13a1 1 0 100-2H7a1 1 0 100 2h5zm-7-8a1 1 0 100-2H5a1 1 0 000 2h2.586l6.293 6.293a1 1 0 001.414-1.414L8 6.586V5z" 
                  clipRule="evenodd"
                />
              )}
            </svg>
            {/* Trend percentage */}
            {trend.value}%
          </span>
          {/* Trend label */}
          <span className="text-xs text-neutral-500 ml-2">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
