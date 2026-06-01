import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

/**
 * Props for the LocationSelector component.
 */

interface LocationSelectorProps {
  /**
   * @purpose Callback triggered when the user changes the selected location.
   * @param location - The new selected location value
   * @returns {void}
   * @sideEffects Updates state and triggers the `onLocationChange` callback if provided.
   * 
   * @example
   * // When a user selects "New York" from a dropdown:
   * handleLocationChange("New York");
   * // This sets the location state to "New York"
   * // and calls onLocationChange("New York") if the callback exists.
   */
  onLocationChange?: (location: string) => void;

  /**
   * @purpose Callback function called when the date range changes.
   * @param range - An object containing the start (`from`) and end (`to`) dates
   * @returns {void}
   * @sideEffects Updates state and triggers the `onDateRangeChange` callback with a month range.
   * 
   * @example
   * // When a user selects a date from the calendar:
   * handleDateSelect(new Date("2025-10-01"));
   * // This sets the date state to the selected date
   * // and calls onDateRangeChange({ from: new Date("2025-10-01"), to: new Date("2025-10-31") }) if the callback exists.
   */
  onDateRangeChange?: (range: { from: Date; to: Date }) => void;

  /**
   * @purpose Callback triggered when the user clicks the export button.
   * @param None.
   * @returns {void}
   * @sideEffects Calls the `onExport` callback if provided.
   * 
   * @example
   * // When a user clicks the export button:
   * handleExport();
   * // This calls onExport() if the callback exists.
   */
  onExport?: () => void;
}

/**
 * LocationSelector Component
 *
 * Purpose:
 * - A UI component for selecting a branch location, date range, and exporting data.
 * - Provides a dropdown for branch selection (All Branches, Al Nahda, Burjuman, International City).
 * - Provides a calendar popover to select a single date, which calculates the date range for the month.
 * - Includes an export button to trigger a data export action.
 * - Accepts optional callback props to notify parent components of location changes, date range selection, and export actions.
 * 
 * @param props - Component props
 * @param props.onLocationChange - Optional callback for location selection
 * @param props.onDateRangeChange - Optional callback for date range selection
 * @param props.onExport - Optional callback for export action
 *
 * @returns {JSX.Element} A React component containing a location dropdown, date selector, and export button.
 *
 * @sideEffects
 * - Updates internal component state (`location` and `date`) when selections are made.
 * - Triggers parent-provided callbacks (`onLocationChange`, `onDateRangeChange`, `onExport`) when applicable.
 *
 * @example
 * <LocationSelector
 *   onLocationChange={(loc) => console.log("Selected location:", loc)}
 *   onDateRangeChange={({ from, to }) => console.log("Date range:", from, to)}
 *   onExport={() => console.log("Export triggered")}
 * />
 */

export function LocationSelector({ 
  onLocationChange,
  onDateRangeChange,
  onExport
}: LocationSelectorProps) {
  const [location, setLocation] = useState("all");
  const [date, setDate] = useState<Date | undefined>(new Date());

   /**
   * @purpose Handles changes in location selection.
   *
   * @param value - The new selected location value
   * @returns {void}
   * @sideEffects Updates state and triggers the `onLocationChange` callback if provided.
   * 
   * @example
   * // When a user selects "New York" from a dropdown:
   * handleLocationChange("New York");
   * // This sets the location state to "New York"
   * // and calls onLocationChange("New York") if the callback exists.
   */

  const handleLocationChange = (value: string) => {
    setLocation(value);
    if (onLocationChange) {
      onLocationChange(value);
    }
  };

  /**
   * @purpose Handles date selection from the calendar.
   * @param selectedDate - The selected date from the calendar
   * @returns {void}
   * @sideEffects Updates state and triggers the `onDateRangeChange` callback with a month range.
   * 
   * @example
   * // When a user selects a date from the calendar:
   * handleDateSelect(new Date("2025-10-01"));
   * // This sets the date state to the selected date
   * // and calls onDateRangeChange({ from: new Date("2025-10-01"), to: new Date("2025-10-31") }) if the callback exists.
   */
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate && onDateRangeChange) {
      const from = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const to = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      onDateRangeChange({ from, to });
    }
  };

  /**
   * @purpose Handles the export button click.
   * 
   * @param None.
   * @returns {void}
   * @sideEffects Calls the `onExport` callback if provided.
   * 
   * @example
   * // When a user clicks the export button:
   * handleExport();
   * // This calls onExport() if the callback exists.
   */
  const handleExport = () => {
    if (onExport) {
      onExport();
    }
  };

 /**
   * @purpose Returns a formatted string for the currently selected month.
   *
   * @param None
   * @returns {string} Formatted month range string, e.g. "Sep 1 - Sep 30, 2025"
   * @sideEffects None
   * 
   * @example
   * // When a user selects a date from the calendar:
   * getFormattedDateRange();
   * // This returns a formatted string for the currently selected month.
   */
  const getFormattedDateRange = () => {
    if (!date) return "Select date range";
    
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    return `${format(startOfMonth, "MMM d")} - ${format(endOfMonth, "MMM d, yyyy")}`;
  };

  return (
    <div className="flex justify-between items-center mb-6">
      {/* Left section: Location selector */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-neutral-700">Location:</label>
        <div className="relative">
          <Select 
            value={location} // current selected location
            onValueChange={handleLocationChange} // updates state on change
           > 
            <SelectTrigger className="pl-3 pr-8 py-2 text-sm">
              <SelectValue placeholder="Select location" /> {/* Placeholder when no selection */}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              <SelectItem value="main">Al Nahda</SelectItem>
              <SelectItem value="north">Burjuman</SelectItem>
              <SelectItem value="south">International City</SelectItem>
              </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Right section: Date selector and export button */}
      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Calendar className="h-4 w-4 mr-2" /> {/* Calendar icon */}
              {getFormattedDateRange()}    {/* Display selected date */}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              mode="single"  //single date selection mode
              selected={date}  // currently selected date
              onSelect={handleDateSelect}  // callback when date changes
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <Button 
          className="bg-primary hover:bg-primary/90"
          size="sm"
          onClick={handleExport} // triggers export action
        >
          <Download className="h-4 w-4 mr-2" /> {/* Download Icon */}
          Export
        </Button>
      </div>
    </div>
  );
}
