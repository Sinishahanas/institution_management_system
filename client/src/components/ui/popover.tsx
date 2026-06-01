import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

/**
 * Popover root component.
 *
 * @purpose Provides a container for popover trigger and content.
 * @param {React.ComponentProps<typeof PopoverPrimitive.Root>} props - Props for the popover root.
 * @returns {JSX.Element} Popover container element.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <Popover>
 *   <PopoverTrigger>Open</PopoverTrigger>
 *   <PopoverContent>Content here</PopoverContent>
 * </Popover>
 */
const Popover = PopoverPrimitive.Root

/**
 * PopoverTrigger component.
 *
 * @purpose Acts as the interactive element that opens the popover content.
 * @param {React.ComponentProps<typeof PopoverPrimitive.Trigger>} props - Props for the popover trigger.
 * @returns {JSX.Element} Popover trigger element.
 * @throws None
 * @sideEffects Opens/closes the Popover on user interaction.
 * 
 * @example
 * <Popover>
 *   <PopoverTrigger>Click me</PopoverTrigger>
 *   <PopoverContent>Popover content</PopoverContent>
 * </Popover>
 */
const PopoverTrigger = PopoverPrimitive.Trigger

/**
 * PopoverContent component.
 *
 * @purpose Displays the content of the popover when triggered.
 * @param {object} props
 * @param {string} [props.align="center"] - Alignment of the popover relative to trigger.
 * @param {number} [props.sideOffset=4] - Offset distance from the trigger.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>} props - Other Popover content props.
 * @returns {JSX.Element} Popover content element rendered in a portal.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <Popover>
 *   <PopoverTrigger>Open</PopoverTrigger>
 *   <PopoverContent align="start" sideOffset={8}>
 *     This is the popover content
 *   </PopoverContent>
 * </Popover>
 */
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
