import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

/**
 * ScrollArea component.
 *
 * @purpose Provides a scrollable container with styled scrollbars and support for custom content.
 * 
 * @param {object} props - Props passed to the ScrollArea.
 * @param {string} [props.className] - Additional Tailwind class names for styling.
 * @param {React.ReactNode} props.children - Content to render inside the scrollable area.
 * @param {React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>} props - Other props forwarded to Radix ScrollArea.
 * @returns {JSX.Element} Rendered scrollable area.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <ScrollArea className="h-64 w-64">
 *   <div>Content that overflows and can be scrolled</div>
 * </ScrollArea>
 */
const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

/**
 * ScrollBar component.
 *
 * @purpose Renders a vertical or horizontal scrollbar for ScrollArea with custom styling.
 * 
 * @param {object} props - Props for the scrollbar.
 * @param {string} [props.className] - Additional Tailwind class names for styling.
 * @param {"vertical" | "horizontal"} [props.orientation="vertical"] - Scrollbar orientation.
 * @param {React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>} props - Other props forwarded to Radix ScrollAreaScrollbar.
 * @returns {JSX.Element} Rendered scrollbar.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <ScrollBar orientation="horizontal" />
 */
const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
