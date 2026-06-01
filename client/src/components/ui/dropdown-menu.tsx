import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * @purpose Wraps all DropdownMenu elements and manages open/close state.
 * 
 * @param {object} props - Props for DropdownMenu
 * @param {string} [props.className] - Additional classes
 * @returns {JSX.Element}
 * @throws {Error} Does not directly throw errors; runtime issues would originate from `DropdownMenuPrimitive.Root` or children and be handled by React's error boundaries.
 * @sideEffects None
 * 
 * @example
 * <DropdownMenu>Dropdown Menu Items</DropdownMenu>
 */
const DropdownMenu = DropdownMenuPrimitive.Root

/** 
 * @purpose Trigger element to open the Dropdown Menu 
 * 
 * @param {object} props - Props for DropdownMenuTrigger
 * @param {string} [props.className] - Additional classes
 * @returns {JSX.Element}
 * @throws {Error} Does not directly throw errors; runtime issues would originate from `DropdownMenuPrimitive.Trigger` or children and be handled by React's error boundaries.
 * @sideEffects None
 * 
 * @example
 * <DropdownMenuTrigger>Trigger Element</DropdownMenuTrigger>
 */
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger


/** 
 * @purpose Group wrapper for DropdownMenu items 
 * 
 * @param {object} props - Props for DropdownMenuGroup
 * @param {string} [props.className] - Additional classes
 * @returns {JSX.Element}
 * @throws {Error} Does not directly throw errors; runtime issues would originate from `DropdownMenuPrimitive.Group` or children and be handled by React's error boundaries.
 * @sideEffects None
 * 
 * @example
 * <DropdownMenuGroup>Dropdown Menu Items</DropdownMenuGroup>
 */
const DropdownMenuGroup = DropdownMenuPrimitive.Group


/** 
 * @purpose Portal for rendering DropdownMenu content outside DOM hierarchy 
 * 
 * @param {object} props - Props for DropdownMenuPortal
 * @param {string} [props.className] - Additional classes
 * @returns {JSX.Element}
 * @throws {Error} Does not directly throw errors; runtime issues would originate from `DropdownMenuPrimitive.Portal` or children and be handled by React's error boundaries.
 * @sideEffects None
 * 
 * @example
 * <DropdownMenuPortal>Dropdown Menu Items</DropdownMenuPortal>
 */
const DropdownMenuPortal = DropdownMenuPrimitive.Portal


/** 
 * @purpose Submenu wrapper 
 * 
 * @param {object} props - Props for DropdownMenuSub
 * @param {string} [props.className] - Additional classes
 * @returns {JSX.Element}
 * @throws {Error} Does not directly throw errors; runtime issues would originate from `DropdownMenuPrimitive.Sub` or children and be handled by React's error boundaries.
 * @sideEffects None
 * 
 * @example
 * <DropdownMenuSub>Dropdown Menu Items</DropdownMenuSub>
 */
const DropdownMenuSub = DropdownMenuPrimitive.Sub


/** 
 * @purpose Radio group wrapper for DropdownMenuRadioItem 
 * 
 * @param {object} props - Props for DropdownMenuRadioGroup
 * @param {string} [props.className] - Additional classes
 * @returns {JSX.Element}
 * @throws {Error} Does not directly throw errors; runtime issues would originate from `DropdownMenuPrimitive.RadioGroup` or children and be handled by React's error boundaries.
 * @sideEffects None
 * 
 * @example
 * <DropdownMenuRadioGroup>Dropdown Menu Items</DropdownMenuRadioGroup>
 */
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

/** 
 * @purpose
 * - Trigger for opening a Submenu.
 * - Adds optional inset and a ChevronRight icon.
 *
 * @param {object} props - Props for SubTrigger
 * @param {boolean} [props.inset] - If true, adds padding-left for inset styling
 * @returns {JSX.Element}
 * @throws {Error} Does not directly throw errors; runtime issues would originate from `DropdownMenuPrimitive.SubTrigger` or children and be handled by React's error boundaries.
 * @sideEffects None
 * 
 * @example
 * <DropdownMenuSubTrigger inset>Dropdown Menu Items</DropdownMenuSubTrigger>
 */
const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
))


/** 
 * @purpose Content of a Submenu.
 *
 * @param {object} props - Props passed to SubContent
 * @param {string} [props.className] - Additional classes
 * @returns {JSX.Element}
 * @throws {Error} Does not directly throw errors; runtime issues would originate from `DropdownMenuPrimitive.SubContent` or children and be handled by React's error boundaries.
 * @sideEffects Uses Radix Portal internally
 * 
 * @example
 * <DropdownMenuSubContent>Submenu Items</DropdownMenuSubContent>
 */
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))

DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

/**
 * @purpose Main content container for the DropdownMenu.
 *
 * @param {object} props - Content props
 * @param {number} [props.sideOffset=4] - Offset in pixels between trigger and content
 * @returns {JSX.Element}
 * @throws {Error} Does not directly throw errors; runtime issues would originate from `DropdownMenuPrimitive.Content` or children and be handled by React's error boundaries.
 * @sideEffects Uses Portal to render outside normal DOM flow
 * 
 * @example
 * <DropdownMenuContent>Dropdown Menu Items</DropdownMenuContent>
 */
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName


/** 
 * @purpose Individual item in the DropdownMenu
 *
 * @param {object} props - Item props
 * @param {boolean} [props.inset] - If true, adds padding-left for inset styling
 * @returns {JSX.Element}
 * @throws {Error} Does not directly throw errors; runtime issues would originate from `DropdownMenuPrimitive.Item` or children and be handled by React's error boundaries.
 * @sideEffects None.
 * 
 * @example
 * <DropdownMenuItem>Dropdown Menu Item</DropdownMenuItem>
 */
const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

/** 
 * @purpose Checkbox item in the DropdownMenu.
 *
 * @param {object} props - Checkbox item props
 * @param {React.ReactNode} props.children - Content of the item
 * @param {boolean} [props.checked] - If true, item is checked
 * @param {string} [props.className] - Additional classes
 * @returns {JSX.Element}
 * @throws {Error} Does not directly throw errors; runtime issues would originate from `DropdownMenuPrimitive.CheckboxItem` or children and be handled by React's error boundaries.
 * @sideEffects None.
 * 
 * @example
 * <DropdownMenuCheckboxItem checked>Enable Notifications</DropdownMenuCheckboxItem>
 */
const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName


/** 
 * @purpose Radio item in the DropdownMenu.
 *
 * @param {object} props - Radio item props
 * @param {React.ReactNode} props.children - Content of the item
 * @param {string} [props.className] - Additional classes
 * @returns {JSX.Element}
 * @throws {Error} Does not directly throw errors; runtime issues would originate from `DropdownMenuPrimitive.RadioItem` or children and be handled by React's error boundaries.
 * @sideEffects None.
 * 
 * @example
 * <DropdownMenuRadioItem value="asc">Sort Ascending</DropdownMenuRadioItem>
 */
const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

/** 
 * @purpose Label in the DropdownMenu.
 *
 * @param {object} props - Label props
 * @param {boolean} [props.inset] - Adds left padding for inset
 * @param {string} [props.className] - Additional classes
 * @returns {JSX.Element}
 * @throws {Error} Does not directly throw errors; runtime issues would originate from `DropdownMenuPrimitive.Label` or children and be handled by React's error boundaries.
 * @sideEffects None.
 * 
 * @example
 * <DropdownMenuLabel inset>Settings</DropdownMenuLabel>
 */
const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName


/**
 * @purpose Separator line in the DropdownMenu.
 *
 * @param {object} props - Separator props
 * @param {string} [props.className] - Additional classes
 * @returns {JSX.Element}
 * @throws {Error} Does not directly throw errors; runtime issues would originate from `DropdownMenuPrimitive.Separator` or children and be handled by React's error boundaries.
 * @sideEffects None.
 * 
 * @example
 * <DropdownMenuSeparator />
 */
const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

/**
 * @purpose Shortcut text for a DropdownMenu item.
 *
 * @param {object} props - HTML span attributes
 * @param {string} [props.className] - Additional classes
 * @returns {JSX.Element}
 * @throws {Error} Does not directly throw errors; runtime issues would originate from `DropdownMenuPrimitive.Shortcut` or children and be handled by React's error boundaries.
 * @sideEffects None.
 * 
 * @example
 * <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
 */
const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

/**
 * @example
 * <DropdownMenu>
 *   <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuItem>Profile</DropdownMenuItem>
 *     <DropdownMenuCheckboxItem checked>Enable Notifications</DropdownMenuCheckboxItem>
 *     <DropdownMenuRadioGroup value="asc">
 *       <DropdownMenuRadioItem value="asc">Sort Ascending</DropdownMenuRadioItem>
 *       <DropdownMenuRadioItem value="desc">Sort Descending</DropdownMenuRadioItem>
 *     </DropdownMenuRadioGroup>
 *     <DropdownMenuSeparator />
 *     <DropdownMenuLabel>Settings</DropdownMenuLabel>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 */

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
