import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"


/**
 * Sheet (Drawer) component for displaying side, top, or bottom panels.
 *
 * @purpose Provides a flexible sliding panel for modals, drawers, or contextual content.
 * 
 * @param {object} props - Props passed to the Sheet.
 * @param {string} [props.className] - Additional CSS classes for custom styling.
 * @param {"horizontal"|"vertical"} [props.orientation="horizontal"] - Orientation of the separator.
 * @param {boolean} [props.decorative=true] - Marks the separator as decorative for accessibility.
 * @returns {JSX.Element} A styled separator line.
 * @sideEffects Adds overlay and sliding animation to the document.
 * @throws None
 *
 * @example
 * <Sheet>
 *   <SheetTrigger>Open Panel</SheetTrigger>
 *   <SheetContent side="right">
 *     <SheetHeader>
 *       <SheetTitle>Panel Title</SheetTitle>
 *       <SheetDescription>Optional description text</SheetDescription>
 *     </SheetHeader>
 *     <div>Content goes here</div>
 *     <SheetFooter>
 *       <button>Cancel</button>
 *       <button>Save</button>
 *     </SheetFooter>
 *   </SheetContent>
 * </Sheet>
 */
const Sheet = SheetPrimitive.Root

/**
 * SheetTrigger component
 *
 * @purpose Triggers opening of the Sheet when clicked
 * 
 * @param {object} props - Props passed to the SheetTrigger.
 * @param {string} [props.className] - Additional CSS classes for custom styling.
 * @returns {JSX.Element} A styled separator line.
 * @sideEffects Opens the sheet panel
 * @throws None
 *
 * @example
 * <SheetTrigger>Open Panel</SheetTrigger>
 */
const SheetTrigger = SheetPrimitive.Trigger

/**
 * SheetClose component
 *
 * @purpose Provides a built-in way to close the Sheet
 * 
 * @param {object} props - Props passed to the SheetClose.
 * @param {string} [props.className] - Additional CSS classes for custom styling.
 * @returns {JSX.Element} A styled separator line.
 * @sideEffects Closes the sheet panel when clicked
 * @throws None
 *
 * @example
 * <SheetClose>Close Panel</SheetClose>
 */
const SheetClose = SheetPrimitive.Close

/**
 * SheetPortal component
 *
 * @purpose Renders Sheet content in a React Portal
 * 
 * @param {object} props - Props passed to the SheetPortal.
 * @param {string} [props.className] - Additional CSS classes for custom styling.
 * @returns {JSX.Element} A styled separator line.
 * @sideEffects Moves DOM nodes outside of the parent container
 * @throws None
 *
 * @example
 * <SheetPortal>
 *   <SheetContent side="right">
 *     <SheetHeader>
 *       <SheetTitle>Panel Title</SheetTitle>
 *       <SheetDescription>Optional description text</SheetDescription>
 *     </SheetHeader>
 *     <div>Content goes here</div>
 *     <SheetFooter>
 *       <button>Cancel</button>
 *       <button>Save</button>
 *     </SheetFooter>
 *   </SheetContent>
 * </SheetPortal>
 */
const SheetPortal = SheetPrimitive.Portal

/**
 * SheetOverlay component
 *
 * @purpose Renders a semi-transparent overlay behind the Sheet content
 * 
 * @param {object} props - Props for Radix SheetOverlay
 * @param {string} className - Additional classes for styling
 * @returns JSX.Element
 * @throws None
 * @sideEffects Animates overlay in/out on Sheet open/close
 * 
 * @example
 * 
 * <SheetOverlay />
 */
const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

/**
 * @purpose
 * - Provide a reusable and type-safe way to apply Tailwind CSS classes to sheet components.
 * - Support side-based positioning and animation variants.
 * - Reduce repetitive class strings in React/JSX components.
 *
 * @param {Object} [options] - Optional variant options.
 * @param {('top'|'bottom'|'left'|'right')} [options.side='right']
 * @returns {string} A concatenated string of Tailwind CSS classes for the sheet component.
 * @throws {TypeError} If an invalid side variant is provided (not 'top', 'bottom', 'left', or 'right').
 * @sideEffects No side effects. Pure function: returns class strings without modifying state.
 * 
 * @example
 * // Using default variant (right)
 * const classes = sheetVariants();
 * // returns: "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out ... right-side classes"
 *
 * @example
 * // Using top variant
 * const classes = sheetVariants({ side: 'top' });
 * // returns: "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out ... top-side classes"
 *
 * @example
 * // Applying to a React component
 * <div className={sheetVariants({ side: 'left' })}>
 *   Slide-in sheet content
 * </div>
 */
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

    /**
 * SheetContent component
 *
 * @purpose Renders the sliding panel content with optional close button
 * 
 * @param {SheetContentProps} props - Props including children and side variant
 * @param {React.Ref} ref - Ref to the content element
 * @returns JSX.Element
 * @throws None
 * @sideEffects Animates content in/out and adds overlay
 * 
 * @example
 * <SheetContent side="left">
 *   <SheetHeader>
 *     <SheetTitle>Title</SheetTitle>
 *     <SheetDescription>Description</SheetDescription>
 *   </SheetHeader>
 *   Content goes here
 *   <SheetFooter>
 *     <button>Cancel</button>
 *     <button>Save</button>
 *   </SheetFooter>
 * </SheetContent>
 */
const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName


/**
 * SheetHeader component
 *
 * @purpose Container for header content (title, description)
 * 
 * @param {object} props - Standard div props
 * @returns JSX.Element
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <SheetHeader>
 *   <SheetTitle>Header Title</SheetTitle>
 * </SheetHeader>
 */
const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"


/**
 * SheetFooter component
 *
 * @purpose Container for footer actions (buttons)
 * 
 * @param {object} props - Standard div props
 * @returns JSX.Element
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <SheetFooter>
 *   <button>Cancel</button>
 *   <button>Save</button>
 * </SheetFooter>
 */
const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"


/**
 * SheetTitle component
 *
 * @purpose Renders the title inside the Sheet
 * 
 * @param {object} props - Standard div props
 * @param {React.Ref} ref - Ref to the title element
 * @returns JSX.Element
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <SheetTitle>Sheet Title</SheetTitle>
 */
const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName


/**
 * SheetDescription component
 *
 * @purpose Renders a description inside the Sheet
 * 
 * @param {object} props - Standard div props
 * @param {React.Ref} ref - Ref to the description element
 * @returns JSX.Element
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <SheetDescription>Description</SheetDescription>
 */
const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
