import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Accordion (Root)
 *
 * @purpose
 *   Root provider for an accordion — manages accordion state and behaviour using Radix UI primitives.
 *
 * @param {React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>} props - Props for the accordion root.
 * @returns {JSX.Element} React element providing accordion context for AccordionItem, AccordionTrigger, and AccordionContent.
 * @sideEffects Manages focus-trap and keyboard interaction per Radix behaviour.
 * @throws Will throw if children are not AccordionItem components (Radix may log warnings or behave unexpectedly).
 *
 * @example
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>Section 1</AccordionTrigger>
 *     <AccordionContent>Content for section 1</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 */
const Accordion = AccordionPrimitive.Root

/**
 * AccordionItem
 *
 * @purpose
 *   Represents a single collapsible section inside the Accordion.
 *
 * @param {React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>} props - Props forwarded to Radix Item.
 * @param {React.Ref} ref - Ref forwarded to the underlying Radix Item element.
 * @returns {JSX.Element} Single accordion item element.
 * @sideEffects None (Radix manages open state and events).
 * @throws Will throw if `value` prop is missing when `type="single"` or `type="multiple"` is used, as required by Radix for controlled state.
 *
 * @example
 * <AccordionItem value="item-1">
 *   <AccordionTrigger>Title</AccordionTrigger>
 *   <AccordionContent>Details...</AccordionContent>
 * </AccordionItem>
 */
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

/**
 * AccordionTrigger
 *
 * @purpose
 *   Clickable trigger that expands/collapses its AccordionItem.
 *
 * @param {React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>} props - Props for Radix Trigger, expects children as the trigger label.
 * @param {React.Ref} ref - Ref forwarded to the underlying Radix Trigger element.
 * @returns {JSX.Element} Trigger element that toggles the corresponding accordion item.
 * @sideEffects Toggles open/closed state of the item (managed by Radix).
 * @throws Will throw if used outside of an AccordionItem.
 *
 * @example
 * <AccordionItem value="item-1">
 *   <AccordionTrigger>Click me</AccordionTrigger>
 *   <AccordionContent>...</AccordionContent>
 * </AccordionItem>
 */
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

/**
 * AccordionContent
 *
 * Purpose:
 *   The content panel that is shown/hidden when its AccordionItem is toggled open/closed.
 *   Wraps Radix's `Accordion.Content` and provides animation-friendly classes and padding.
 *
 * @param {React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>} props - Props for Radix Content, children contain content to display.
 * @param {React.Ref} ref - Ref forwarded to the underlying Radix Content element.
 * @returns {JSX.Element} Accordion content panel element.
 * @sideEffects Visibility is controlled by Radix.
 * @throws Will throw if used outside of an AccordionItem.
 *  
 * @example
 * ```tsx
 * <AccordionItem value="item-1">
 *   <AccordionTrigger>Title</AccordionTrigger>
 *   <AccordionContent>
 *     <p>Hidden details here</p>
 *   </AccordionContent>
 * </AccordionItem>
 * ```
 */
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
