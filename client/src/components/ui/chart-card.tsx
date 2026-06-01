import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * ChartCardProps
 *
 * Props for the ChartCard component.
 * @property {string} title - Title of the card displayed in the header.
 * @property {React.ReactNode} children - Content of the card, usually a chart or visualization.
 * @property {string} [className] - Additional CSS classes for the Card wrapper.
 * @property {React.ReactNode} [actions] - Optional custom actions to display in the card header (overrides default menu).
 * @property {"30days" | "90days" | "12months" | "ytd"} [period] - Optional selected period for the chart.
 * @property {(value: string) => void} [onPeriodChange] - Callback when the selected period changes.
 * @property {React.ReactNode} [footer] - Optional footer content for the card.
 */

interface ChartCardProps {
  /**
   * Title displayed in the card header.
   */
  title: string;

   /**
   * Main content (chart, table, etc.) rendered inside the card.
   */
  children: ReactNode;

  /**
   * Optional additional class name(s) applied to the root card.
   */
  className?: string;

  /**
   * Optional custom action node(s) rendered in the header (e.g. buttons).
   * If not provided, a small default dropdown menu is shown.
   */
  actions?: ReactNode;

  /**
   * Optional currently selected period key (e.g. "30days", "12months").
   * When provided together with `onPeriodChange`, a period selector is shown.
   */
  period?: string;

  /**
   * Callback invoked when the period selection changes.
   *
   * @param value - selected period key.
   */
  onPeriodChange?: (value: string) => void;

  /**
   * Optional footer node rendered below the card content (e.g. legend).
   */
  footer?: ReactNode;
}


/**
 * ChartCard
 *
 * @purpose
 *   - Provides a standardized card wrapper for charts and related dashboard widgets.
 *   - Renders a Card with a header (title + actions/period selector), content area and optional footer.
 *   - If `period` and `onPeriodChange` are provided it shows a small Select dropdown to pick the time period.
 *   - If `actions` are not provided it renders a default DropdownMenu with a minimal action list.
 *   - Useful for presenting charts, metrics, and small dashboard components with consistent spacing and controls.
 *
 * @param {ChartCardProps} props - Props for the ChartCard component.
 * @param {string} props.title - Card title.
 * @param {ReactNode} props.children - Card body (chart or content).
 * @param {string} [props.className] - Optional extra class names.
 * @param {ReactNode} [props.actions] - Optional custom actions node shown in header.
 * @param {string} [props.period] - Optional currently selected period key.
 * @param {(value: string) => void} [props.onPeriodChange] - Optional callback for period changes.
 * @param {ReactNode} [props.footer] - Optional footer to render under content.
 * @returns {JSX.Element} A styled card wrapper suitable for charts and dashboard widgets.
 * @throws If used outside a <Chart /> provider
 * @sideEffects
 *   - Calls `onPeriodChange` when the user selects a different period.
 *   - No network calls or global state mutations performed by the component itself.
 *
 * @example
 * ```tsx
 * <ChartCard
 *   title="Revenue Overview"
 *   period="12months"
 *   onPeriodChange={(p) => console.log("New period:", p)}
 *   footer={<div>Legend / Summary</div>}
 * >
 *   <MyBarChart data={data} />
 * </ChartCard>
 * ```
 */
export function ChartCard({ 
  title, 
  children, 
  className, 
  actions,
  period,
  onPeriodChange,
  footer
}: ChartCardProps) {
  return (
    <Card className={cn(className)}>
      {/* Card Header */}
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold text-neutral-900">{title}</CardTitle>
        
        {/* Header actions and optional period selector */}
        <div className="flex items-center space-x-2">
          {/* Period selector dropdown */}
          {period && onPeriodChange && (
            <div className="relative">
              <Select value={period} onValueChange={onPeriodChange}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="12months">Last 12 months</SelectItem>
                  <SelectItem value="ytd">Year to date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Custom actions or default dropdown menu */}
          {actions ? (
            actions
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View details</DropdownMenuItem>
                <DropdownMenuItem>Download data</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      {/* Card Content */}
      <CardContent className={cn(footer ? "pb-2" : "")}>
        {children}
      </CardContent>
      
      {/* Optional footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-neutral-200">
          {footer}
        </div>
      )}
    </Card>
  );
}
