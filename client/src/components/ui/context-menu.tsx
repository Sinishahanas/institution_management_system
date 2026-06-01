import * as React from "react"
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * @purpose Root container for a context menu.
 * 
 * @param {string} className Optional className
 * @returns {JSX.Element}
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `ContextMenuPrimitive.Root` or children and be handled by React's error boundaries.
 * @sideEffects Manages menu open/close state
 * 
 * @example
 * <ContextMenu>
 *   <ContextMenuTrigger><button>Right-click me</button></ContextMenuTrigger>
 *   <ContextMenuContent>
 *     <ContextMenuItem>Item 1</ContextMenuItem>
 *   </ContextMenuContent>
 * </ContextMenu>
 */
const ContextMenu = ContextMenuPrimitive.Root


/**
 * @purpose Trigger element for a context menu.
 * 
 * @param {string} className Optional className
 * @returns {JSX.Element}
 * @sideEffects Opens the ContextMenu on click or context menu event
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `ContextMenuPrimitive.Trigger` or children and be handled by React's error boundaries.
 * @example
 * <ContextMenuTrigger><button>Right-click me</button></ContextMenuTrigger>
 */
const ContextMenuTrigger = ContextMenuPrimitive.Trigger


/**
 * @purpose Group container for items inside the context menu
 * 
 * @param {string} className Optional className
 * @returns {JSX.Element}
 * @sideEffects None
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `ContextMenuPrimitive.Group` or children and be handled by React's error boundaries.
 * 
 * @example
 * <ContextMenuGroup>
 *   <ContextMenuItem>Item 1</ContextMenuItem>
 * </ContextMenuGroup>
 */
const ContextMenuGroup = ContextMenuPrimitive.Group


/** 
 * @purpose Portal to render context menu outside the DOM hierarchy 
 * 
 * @param {string} className Optional className
 * @returns {JSX.Element}
 * @sideEffects None
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `ContextMenuPrimitive.Portal` or children and be handled by React's error boundaries.
 * 
 * @example
 * <ContextMenuPortal>
 *   <ContextMenuContent>
 *     <ContextMenuItem>Item 1</ContextMenuItem>
 *   </ContextMenuContent>
 * </ContextMenuPortal>
*/
const ContextMenuPortal = ContextMenuPrimitive.Portal


/** 
 * @purpose Submenu container
 * 
 * @param {string} className Optional className
 * @returns {JSX.Element}
 * @sideEffects None
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `ContextMenuPrimitive.Sub` or children and be handled by React's error boundaries.
 * 
 * @example
 * <ContextMenuSub>
 *   <ContextMenuItem>Item 1</ContextMenuItem>
 * </ContextMenuSub>
*/
const ContextMenuSub = ContextMenuPrimitive.Sub


/** 
 * @purpose Radio group container
 * 
 * @param {string} className Optional className
 * @returns {JSX.Element}
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `ContextMenuPrimitive.RadioGroup` or children and be handled by React's error boundaries.
 * @sideEffects None
 * 
 * @example
 * <ContextMenuRadioGroup>
 *   <ContextMenuItem>Item 1</ContextMenuItem>
 * </ContextMenuRadioGroup>
*/
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup


/** 
 * @purpose Submenu trigger item.
 * 
 * @param {string} className Optional className
 * @param inset Optional boolean to add padding
 * @param children Menu label/content
 * @returns JSX.Element
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `ContextMenuPrimitive.SubTrigger` or children and be handled by React's error boundaries.
 * @sideEffects Opens a nested submenu on hover/click
 * 
 * @example
 * <ContextMenuSubTrigger inset>More Options</ContextMenuSubTrigger>
 */
const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </ContextMenuPrimitive.SubTrigger>
))
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName


/**
 * @purpose Content container for a submenu.
 * 
 * @param {string} className Optional className
 * @returns {JSX.Element}
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `ContextMenuPrimitive.SubContent` or children and be handled by React's error boundaries.
 * @sideEffects None
 * 
 * @example
 * <ContextMenuSubContent>
 *   <ContextMenuItem>Item 1</ContextMenuItem>
 * </ContextMenuSubContent>
*/
const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName


/**
 * @purpose Main content container for context menu items.
 * 
 * @param {string} className Optional className
 * @returns {JSX.Element}
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `ContextMenuPrimitive.Content` or children and be handled by React's error boundaries.
 * @sideEffects None
 * 
 * @example
 * <ContextMenuContent>
 *   <ContextMenuItem>Item 1</ContextMenuItem>
 * </ContextMenuContent>
*/
const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
))
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName


/**
 * @purpose Single clickable context menu item.
 * 
 * @param {string} className Optional className
 * @param inset Adds extra padding for alignment
 * @returns {JSX.Element}
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `ContextMenuPrimitive.Item` or children and be handled by React's error boundaries.
 * @sideEffects Can trigger actions on click
 * 
 * @example
 * <ContextMenuItem inset onSelect={() => alert('Clicked!')}>Item 1</ContextMenuItem>
 */
const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName


/**
 * @purpose Checkbox menu item for toggles.
 * 
 * @param {string} className Optional className
 * @param checked Boolean for checked state
 * @returns {JSX.Element}
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `ContextMenuPrimitive.CheckboxItem` or children and be handled by React's error boundaries.
 * @sideEffects Updates checked state on click
 * 
 * @example
 * <ContextMenuCheckboxItem checked onCheckedChange={setChecked}>Enable Feature</ContextMenuCheckboxItem>
 */
const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
))
ContextMenuCheckboxItem.displayName =
  ContextMenuPrimitive.CheckboxItem.displayName


/**
 * @purpose Radio menu item for single selection in a group.
 * 
 * @param {string} className Optional className
 * @returns {JSX.Element}
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `ContextMenuPrimitive.RadioItem` or children and be handled by React's error boundaries.
 * @sideEffects Updates selected value in ContextMenuRadioGroup
 * 
 * @example
 * <ContextMenuRadioItem value="option1">Option 1</ContextMenuRadioItem>
 */
const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
))
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName


/**
 * @purpose Menu label
 * 
 * @param {string} className Optional className
 * @param inset Optional boolean for padding
 * @returns {JSX.Element}
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `ContextMenuPrimitive.Label` or children and be handled by React's error boundaries.
 * @sideEffects None
 * 
 * @example
 * <ContextMenuLabel inset>Label</ContextMenuLabel>
 */
const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold text-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName


/**
 * @purpose Separator between context menu items.
 * 
 * @param {string} className Optional className
 * @returns {JSX.Element}
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `ContextMenuPrimitive.Separator` or children and be handled by React's error boundaries.
 * @sideEffects None
 * 
 * @example
 * <ContextMenuSeparator />
 */
const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
))
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName


/**
 * @purpose Shortcut label-Displays keyboard shortcuts.
 * 
 * @param {string} className Optional className
 * @returns {JSX.Element}
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `ContextMenuPrimitive.Shortcut` or children and be handled by React's error boundaries.
 * @sideEffects None
 * 
 * @example
 * <ContextMenuShortcut>Ctrl + A</ContextMenuShortcut>
 */
const ContextMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
ContextMenuShortcut.displayName = "ContextMenuShortcut"

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
  