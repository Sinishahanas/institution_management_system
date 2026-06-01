import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * MenubarMenu
 *
 * @purpose
 * - Wrapper component for a Menubar menu.
 * - Provides context for Menubar items and submenus.
 * 
 * @param props - Props passed to the menu component
 * @param props.children - Menu items or submenus
 * @param props.className - Optional additional CSS classes
 * @returns JSX.Element - Rendered Menubar menu
 * @throws None directly. May throw errors if MenubarPrimitive.Menu throws errors.
 * @sideEffects Provides context for child Menubar items
 * 
 * @example
 * ```tsx
 * <MenubarMenu>
 *   <MenubarItem>File</MenubarItem>
 * </MenubarMenu>
 * ```
 */
const MenubarMenu = MenubarPrimitive.Menu


/**
 * MenubarGroup
 *
 * @purpose
 * - Groups related Menubar items together.
 * - Useful for organizing items under a common heading.
 * 
 * @param props - Props passed to the group component
 * @param props.children - Menu items inside the group
 * @param props.className - Optional additional CSS classes
 * @returns JSX.Element - Rendered Menubar group
 * @throws None directly. May throw errors if MenubarPrimitive.Group throws errors.
 * @sideEffects None
 * 
 * @example
 * ```tsx
 * <MenubarGroup>
 *   <MenubarItem>File</MenubarItem>
 * </MenubarGroup>
 * ```
 */
const MenubarGroup = MenubarPrimitive.Group


/**
 * MenubarPortal
 *
 * @purpose
 * - Renders Menubar content outside the normal DOM hierarchy.
 * - Helps with positioning and overlay issues.
 * 
 * @param props - Props passed to the portal component
 * @param props.children - Content to render in the portal
 * @param props.className - Optional additional CSS classes
 * @returns JSX.Element - Rendered portal content
 * @throws None directly. May throw errors if MenubarPrimitive.Portal throws errors.
 * @sideEffects Renders content outside parent DOM hierarchy
 
 * @example
 * ```tsx
 * <MenubarPortal>
 *   <MenubarContent>
 *     <MenubarItem>File</MenubarItem>
 *   </MenubarContent>
 * </MenubarPortal>
 * ```
 */
const MenubarPortal = MenubarPrimitive.Portal


/**
 * MenubarSub
 *
 * @purpose
 * - Creates a submenu within a MenubarMenu.
 * - Can contain nested items or groups.
 *
 * @param props - Props passed to the submenu component
 * @param props.children - Menu items inside the submenu
 * @param props.className - Optional additional CSS classes
 * @returns JSX.Element - Rendered submenu
 * @throws None directly. May throw errors if MenubarPrimitive.Sub throws errors.
 * @sideEffects Provides context for nested items
 * 
 * @example
 * ```tsx
 * <MenubarSub>
 *   <MenubarItem>File</MenubarItem>
 * </MenubarSub>
 * ```
 */
const MenubarSub = MenubarPrimitive.Sub


/**
 * MenubarRadioGroup
 *
 * @purpose
 * - Group of radio Menubar items.
 * - Ensures only one item in the group can be selected at a time.
 * 
 * @param props - Props passed to the radio group component
 * @param props.children - Radio items in the group
 * @param props.value - Currently selected value
 * @param props.onValueChange - Callback triggered when selection changes
 * @param props.className - Optional additional CSS classes
 * @returns JSX.Element - Rendered radio group
 * @throws None directly. May throw errors if MenubarPrimitive.RadioGroup throws errors.
 * @sideEffects Manages selection state for child radio items
 * 
 * @example
 * ```tsx
 * <MenubarRadioGroup>
 *   <MenubarItem>File</MenubarItem>
 * </MenubarRadioGroup>
 * ```
 */
const MenubarRadioGroup = MenubarPrimitive.RadioGroup

/** 
 * @purpose Top-level menu bar for navigation or actions.
 * 
 * @param {object} props - Props for MenubarPrimitive.Root.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.ReactNode} props.children - Menu items or triggers.
 * @param {React.Ref} ref - Ref forwarded to MenubarPrimitive.Root.
 * 
 * @returns {JSX.Element} The rendered Menubar.
 * @throws None directly. May throw errors if MenubarPrimitive.Root throws errors.
 * @sideEffects None. Pure UI component.
 * 
 * @example
 * <Menubar>
 *   <MenubarMenu>
 *     <MenubarTrigger>File</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarItem>New</MenubarItem>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 */
const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      "flex h-10 items-center space-x-1 rounded-md border bg-background p-1",
      className
    )}
    {...props}
  />
))
Menubar.displayName = MenubarPrimitive.Root.displayName


/** 
 * @purpose Opens a menu when clicked.
 * 
 * @param {object} props - Props for MenubarPrimitive.Trigger.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.ReactNode} props.children - Trigger content.
 * @param {React.Ref} ref - Ref forwarded to MenubarPrimitive.Trigger.
 * 
 * @returns {JSX.Element} The rendered trigger.
 * @throws None directly. May throw errors if MenubarPrimitive.Trigger throws errors.
 * @sideEffects None internally; may call user-provided onClick handlers.
 * 
 * @example
 * <MenubarTrigger>File</MenubarTrigger>
 */
const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      className
    )}
    {...props}
  />
))
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName


/** 
 * @purpose Trigger for a submenu inside a MenubarMenu.
 * 
 * @param {object} props - Props for MenubarPrimitive.SubTrigger.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {boolean} [props.inset] - Adds left padding for nested alignment.
 * @param {React.ReactNode} props.children - Trigger content.
 * @param {React.Ref} ref - Ref forwarded to MenubarPrimitive.SubTrigger.
 * 
 * @returns {JSX.Element} The rendered submenu trigger.
 * @throws None directly. May throw errors if MenubarPrimitive.SubTrigger throws errors.
 * @sideEffects None internally; may call user-provided onClick handlers.
 * 
 * @example
 * <MenubarSubTrigger inset>More Options</MenubarSubTrigger>
 */
const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
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
  </MenubarPrimitive.SubTrigger>
))
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName


/** 
 * @purpose Content container for items in a submenu.
 * 
 * @param {object} props - Props for MenubarPrimitive.SubContent.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.ReactNode} props.children - Submenu items.
 * @param {React.Ref} ref - Ref forwarded to MenubarPrimitive.SubContent.
 * 
 * @returns {JSX.Element} The rendered submenu content.
 * @throws None directly. May throw errors if MenubarPrimitive.SubContent throws errors.
 * @sideEffects None. Pure UI component.
 * 
 * @example
 * <MenubarSubContent>
 *   <MenubarItem>Option 1</MenubarItem>
 * </MenubarSubContent>
 */
const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName


/** 
 * @purpose Contains menu items for a MenubarMenu.
 * 
 * @param {object} props - Props for MenubarPrimitive.Content.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {'start'|'center'|'end'} [props.align] - Alignment of the content.
 * @param {number} [props.alignOffset] - Offset for alignment.
 * @param {number} [props.sideOffset] - Offset from the trigger.
 * @param {React.ReactNode} props.children - Menu items.
 * @param {React.Ref} ref - Ref forwarded to MenubarPrimitive.Content.
 * 
 * @returns {JSX.Element} The rendered menu content.
 * @throws None directly. May throw errors if MenubarPrimitive.Content throws errors.
 * @sideEffects None. Pure UI component.
 * 
 * @example
 * <MenubarContent>
 *   <MenubarItem>New</MenubarItem>
 * </MenubarContent>
 */
const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(
  (
    { className, align = "start", alignOffset = -4, sideOffset = 8, ...props },
    ref
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
)
MenubarContent.displayName = MenubarPrimitive.Content.displayName

/** 
 * @purpose 
 * - Menu item component for use within a Menubar.
 * - Wraps `MenubarPrimitive.Item` and allows optional inset styling.
 * 
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {boolean} [props.inset] - Adds extra left padding.
 * @param {React.ReactNode} props.children - Menu item content.
 * @param {React.Ref} ref - Ref forwarded to MenubarPrimitive.Item.
 * 
 * @returns {JSX.Element} The rendered menu item.
 * @throws None directly. May throw errors if MenubarPrimitive.Item throws errors.
 * @sideEffects None internally; may call user-provided onClick handlers.
 * 
 * @example
 * <MenubarItem inset onClick={() => console.log('Clicked')}>
 *   Menu Item
 * </MenubarItem>
 */
const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
MenubarItem.displayName = MenubarPrimitive.Item.displayName



/** 
 * @purpose Checkbox menu item that can be toggled.
 * 
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {boolean} [props.checked] - Whether the checkbox is checked.
 * @param {React.ReactNode} props.children - Label for the checkbox.
 * @param {React.Ref} ref - Ref forwarded to MenubarPrimitive.CheckboxItem.
 * 
 * @returns {JSX.Element} The rendered checkbox item.
 * @throws None directly. May throw errors if MenubarPrimitive.CheckboxItem throws errors.
 * @sideEffects None internally; may call user-provided onChange handlers.
 * 
 * @example
 * <MenubarCheckboxItem checked={true}>Show Sidebar</MenubarCheckboxItem>
 */
const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
))
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName



/** 
 * @purpose Radio menu item for exclusive selection.
 * 
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.ReactNode} props.children - Label for the radio item.
 * @param {React.Ref} ref - Ref forwarded to MenubarPrimitive.RadioItem.
 * 
 * @returns {JSX.Element} The rendered radio item.
 * @throws None directly. May throw errors if MenubarPrimitive.RadioItem throws errors.
 * @sideEffects None internally; may call user-provided onValueChange handlers.
 * 
 * @example
 * <MenubarRadioItem value="option1">Option 1</MenubarRadioItem>
 */
const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
))
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName



/** 
 * @purpose Label inside a menu or submenu.
 * 
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {boolean} [props.inset] - Adds extra left padding.
 * @param {React.ReactNode} props.children - Label content.
 * @param {React.Ref} ref - Ref forwarded to MenubarPrimitive.Label.
 * 
 * @returns {JSX.Element} The rendered label.
 * @throws None directly. May throw errors if MenubarPrimitive.Label throws errors.
 * @sideEffects None. Pure UI component.
 * 
 * @example
 * <MenubarLabel inset>Options</MenubarLabel>
 */
const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
MenubarLabel.displayName = MenubarPrimitive.Label.displayName



/** 
 * @purpose Divider between menu items.
 * 
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.Ref} ref - Ref forwarded to MenubarPrimitive.Separator.
 * 
 * @returns {JSX.Element} The rendered separator.
 * @throws None directly. May throw errors if MenubarPrimitive.Separator throws errors.
 * @sideEffects None. Pure UI component.
 * 
 * @example
 * <MenubarSeparator />
 */
const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName



/** 
 * @purpose Display keyboard shortcut next to menu item.
 * 
 * @param {object} props - HTML span props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.ReactNode} props.children - Shortcut text.
 * 
 * @returns {JSX.Element} The rendered shortcut span.
 * @throws None directly. May throw errors if MenubarPrimitive.Shortcut throws errors.
 * @sideEffects None. Pure UI component.
 * 
 * @example
 * <MenubarShortcut>⌘N</MenubarShortcut>
 */
const MenubarShortcut = ({
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
MenubarShortcut.displayname = "MenubarShortcut"

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
}
