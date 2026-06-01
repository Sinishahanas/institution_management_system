import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Select root component.
 *
 * @purpose Provides a fully accessible, styled dropdown select component.
 * 
 * @param {object} props - Props passed to Radix SelectRoot.
 * @returns {JSX.Element} Rendered select root.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <Select>
 *   <SelectTrigger>Choose option</SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="1">Option 1</SelectItem>
 *     <SelectItem value="2">Option 2</SelectItem>
 *   </SelectContent>
 * </Select>
 */
const Select = SelectPrimitive.Root

/**
 * SelectGroup component.
 *
 * @purpose Groups related options in the select dropdown.
 * 
 * @param {object} props - Props passed to Radix SelectGroup.
 * @returns {JSX.Element} Rendered select group.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <SelectGroup>
 *   <SelectItem value="1">Option 1</SelectItem>
 *   <SelectItem value="2">Option 2</SelectItem>
 * </SelectGroup>
 */
const SelectGroup = SelectPrimitive.Group

/**
 * SelectValue component.
 *
 * @purpose Displays the currently selected value in the select dropdown.
 * 
 * @param {object} props - Props passed to Radix SelectValue.
 * @returns {JSX.Element} Rendered select value.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <SelectValue>Selected option</SelectValue>
 */
const SelectValue = SelectPrimitive.Value

/**
 * SelectTrigger component.
 *
 * @purpose Displays the currently selected value and triggers the dropdown.
 * 
 * @param {object} props - Props passed to Radix SelectTrigger.
 * @param {string} [props.className] - Additional styling classes.
 * @param {React.ReactNode} props.children - Trigger content (usually SelectValue).
 * @returns {JSX.Element} Trigger element.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <SelectTrigger>Choose option</SelectTrigger>
 */
const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName


/**
 * SelectScrollUpButton component.
 *
 * @purpose
 * - Provides a scroll-up button inside the select dropdown.
 * - Allows users to scroll the dropdown content upward when there are many items.
 *
 * @param {object} props - Props passed to Radix SelectPrimitive.ScrollUpButton.
 * @param {string} [props.className] - Additional styling classes.
 * @returns {JSX.Element} Scroll-up button element.
 * @sideEffects None
 * @throws None
 *
 * @example
 * <SelectContent>
 *   <SelectScrollUpButton />
 *   <SelectItem value="1">Option 1</SelectItem>
 *   <SelectItem value="2">Option 2</SelectItem>
 *   <SelectScrollDownButton />
 * </SelectContent>
 */
const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName


/**
 * SelectScrollDownButton component.
 *
 * @purpose
 * - Provides a scroll-down button inside the select dropdown.
 * - Allows users to scroll the dropdown content downward when there are many items.
 *
 * @param {object} props - Props passed to Radix SelectPrimitive.ScrollDownButton.
 * @param {string} [props.className] - Additional styling classes.
 * @returns {JSX.Element} Scroll-down button element.
 * @sideEffects None
 * @throws None
 *
 * @example
 * <SelectContent>
 *   <SelectScrollUpButton />
 *   <SelectItem value="1">Option 1</SelectItem>
 *   <SelectItem value="2">Option 2</SelectItem>
 *   <SelectScrollDownButton />
 * </SelectContent>
 */
const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

/**
 * SelectContent component.
 *
 * @purpose Renders the dropdown content area for the select with scroll buttons.
 * 
 * @param {object} props - Props passed to Radix SelectContent.
 * @param {string} [props.className] - Additional styling classes.
 * @param {React.ReactNode} props.children - Options and groups inside the dropdown.
 * @param {"popper"|"item-aligned"} [props.position="popper"] - Positioning strategy for dropdown.
 * @returns {JSX.Element} Dropdown content.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <SelectContent>
 *   <SelectItem value="1">Option 1</SelectItem>
 *   <SelectItem value="2">Option 2</SelectItem>
 * </SelectContent>
 */
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName


/**
 * SelectLabel component.
 *
 * @purpose Provides a label for grouped items inside the select dropdown.
 *
 * @param {object} props - Props passed to Radix SelectLabel.
 * @param {string} [props.className] - Additional styling classes.
 * @returns {JSX.Element} Label element.
 * @sideEffects None
 * @throws None
 *
 * @example
 * <SelectLabel>Category</SelectLabel>
 */
const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

/**
 * SelectItem component.
 *
 * @purpose Represents an individual selectable option inside SelectContent.
 * 
 * @param {object} props - Props passed to Radix SelectItem.
 * @param {string} [props.className] - Additional styling classes.
 * @param {React.ReactNode} props.children - Option content text.
 * @returns {JSX.Element} Select option.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <SelectItem value="1">Option 1</SelectItem>
 */
const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName


/**
 * SelectSeparator component.
 *
 * @purpose Adds a horizontal divider between items or groups inside the dropdown.
 *
 * @param {object} props - Props passed to Radix SelectSeparator.
 * @param {string} [props.className] - Additional styling classes.
 * @returns {JSX.Element} Separator element.
 * @sideEffects None
 * @throws None
 *
 * @example
 * <SelectSeparator />
 */
const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
