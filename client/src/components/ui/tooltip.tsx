import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

/**
 * TooltipProvider
 *
 * @purpose
 * - Wraps your app or component tree to provide context for tooltips.
 * - Manages tooltip accessibility, positioning, and behavior.
 *
 * @param {Object} props - Props passed to Radix TooltipProvider.
 * @returns {JSX.Element} TooltipProvider element.
 * @throws {Error} None
 * @sideEffects None
 *
 * @example
 * <TooltipProvider>
 *   <Tooltip>
 *     <TooltipTrigger>Hover me</TooltipTrigger>
 *     <TooltipContent>Tooltip info</TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 */
const TooltipProvider = TooltipPrimitive.Provider


/**
 * Tooltip root component
 *
 * @purpose
 * - Provides a wrapper for TooltipTrigger and TooltipContent.
 * - Handles internal state and accessibility features.
 *
 * @param {Object} props - Props passed to Radix Tooltip.
 * @returns {JSX.Element} Tooltip element.
 * @throws {Error} None
 * @sideEffects None
 *
 * @example
 * <Tooltip>
 *   <TooltipTrigger>Hover me</TooltipTrigger>
 *   <TooltipContent>Tooltip info</TooltipContent>
 * </Tooltip>
 */
const Tooltip = TooltipPrimitive.Root


/**
 * TooltipTrigger component
 *
 * @purpose
 * - Element that triggers the tooltip on hover, focus, or touch.
 *
 * @param {Object} props - Props passed to Radix TooltipTrigger.
 * @returns {JSX.Element} TooltipTrigger element.
 * @throws {Error} None
 * @sideEffects None
 *
 * @example
 * <Tooltip>
 *   <TooltipTrigger>Hover me</TooltipTrigger>
 *   <TooltipContent>Tooltip info</TooltipContent>
 * </Tooltip>
 */
const TooltipTrigger = TooltipPrimitive.Trigger


/**
 * TooltipContent component
 *
 * @purpose
 * - Renders the content of the tooltip with proper positioning and animation.
 *
 * @param {object} props - Props passed to Radix TooltipContent.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {number} [props.sideOffset=4] - Offset distance from the trigger element.
 * @param {React.ReactNode} props.children - Tooltip content.
 * @returns {JSX.Element} Tooltip content element.
 * @throws {Error} None
 * @sideEffects None
 *
 * @example
 * <Tooltip>
 *   <TooltipTrigger>Hover me</TooltipTrigger>
 *   <TooltipContent sideOffset={8}>Tooltip info</TooltipContent>
 * </Tooltip>
 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
