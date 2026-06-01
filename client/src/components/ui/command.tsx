import * as React from "react"
import { type DialogProps } from "@radix-ui/react-dialog"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

/**
 * @purpose 
 *  - Provides a flexible container for search, commands, and items.
 *  - Base Command component using `cmdk` primitives.
 * 
 * @param {string} className Optional className for styling
 * @returns {JSX.Element}
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <Command>
 *   <CommandInput placeholder="Search..." />
 *   <CommandList>
 *     <CommandItem>Item 1</CommandItem>
 *   </CommandList>
 * </Command>
 */
const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName


/**
 * @purpose Encapsulates a Command inside a modal dialog using Radix Dialog.
 * 
 * @param {JSX.Element} children JSX elements representing the command content
 * @param {DialogProps} props DialogProps for Radix Dialog
 * @returns JSX.Element
 * @throws None
 * @sideEffects Opens a modal dialog when triggered
 * 
 * @example
 * <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
 *   <CommandInput placeholder="Search..." />
 *   <CommandList>
 *     <CommandItem>Option 1</CommandItem>
 *   </CommandList>
 * </CommandDialog>
 */
interface CommandDialogProps extends DialogProps {}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

/**
 * @purpose Input for the command menu, includes a search icon.
 * 
 * @param {string} className Optional className
 * @returns {JSX.Element}
 * @throws None
 * @sideEffects Updates the Command input state
 * 
 * @example
 * <CommandInput placeholder="Search..." />
 */
const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
))

CommandInput.displayName = CommandPrimitive.Input.displayName


/**
 * @purpose List container for command items
 * 
 * @param {string} className Optional className
 * @returns {JSX.Element}
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <CommandList>
 *   <CommandItem>Item 1</CommandItem>
 * </CommandList>
 */
const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
))

CommandList.displayName = CommandPrimitive.List.displayName


/**
 * @purpose Empty state component when no results are available
 * 
 * @param {string} className Optional className
 * @returns {JSX.Element}
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <CommandEmpty>No results found.</CommandEmpty>
 */
const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
))

CommandEmpty.displayName = CommandPrimitive.Empty.displayName


/**
 * @purpose Groups command items with an optional heading
 * 
 * @param {string} className Optional className
 * @returns {JSX.Element}
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <CommandGroup heading="Group 1">
 *   <CommandItem>Item 1</CommandItem>
 * </CommandGroup>
 */
const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    )}
    {...props}
  />
))

CommandGroup.displayName = CommandPrimitive.Group.displayName

/**
 * @purpose Separator between groups or items
 * 
 * @param {string} className Optional className
 * @returns {JSX.Element}
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <CommandSeparator />
 */
const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName


/**
 * @purpose Individual command item
 * 
 * @param {string} className Optional className
 * @returns {JSX.Element}
 * @throws None
 * @sideEffects Can trigger command actions on click
 * 
 * @example
 * <CommandItem onSelect={() => alert('Selected!')}>Item 1</CommandItem>
 */
const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50",
      className
    )}
    {...props}
  />
))

CommandItem.displayName = CommandPrimitive.Item.displayName


/**
 * @purpose Shortcut indicator text for a command item
 * 
 * @param {string} className Optional className
 * @returns {JSX.Element}
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <CommandItem>
 *   Save
 *   <CommandShortcut>⌘S</CommandShortcut>
 * </CommandItem>
 */
const CommandShortcut = ({
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
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
