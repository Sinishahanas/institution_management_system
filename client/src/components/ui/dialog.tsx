import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * @purpose Wraps all Dialog elements and manages open/close state.
 * 
 * @param props - Props for the root dialog component
 * @param props.className - Optional additional CSS classes
 * @param props.children - Dialog content nodes
 * @returns JSX.Element
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <Dialog>
 *   <DialogTrigger>Open Dialog</DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Dialog Title</DialogTitle>
 *       <DialogDescription>Description text goes here.</DialogDescription>
 *     </DialogHeader>
 *     <div>
 *       Main content goes here.
 *     </div>
 *     <DialogFooter>
 *       <button>Cancel</button>
 *       <button>Confirm</button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 */
const Dialog = DialogPrimitive.Root


/**
 * @purpose Trigger button for opening the dialog.
 * 
 * @param props - Props for the trigger button
 * @param props.className - Optional additional CSS classes
 * @returns JSX.Element
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <DialogTrigger>Open Dialog</DialogTrigger>
 */
const DialogTrigger = DialogPrimitive.Trigger



/**
 * @purpose Dialog portal for rendering dialog content outside the DOM hierarchy.
 * 
 * @param props - Props for the portal component
 * @param props.className - Optional additional CSS classes
 * @returns JSX.Element
 * @throws None
 * @sideEffects None
 * 
 * @example
 * ```tsx
 * <DialogPortal>
 *   <DialogContent />
 * </DialogPortal>
 * ```
 */
const DialogPortal = DialogPrimitive.Portal



/**
 * @purpose Button to close the dialog.
 * 
 * @param props - Props for the close button
 * @param props.className - Optional additional CSS classes
 * @returns JSX.Element
 * @throws None
 * @sideEffects None
 * 
 * @example
 * ```tsx
 * <DialogClose>Close Dialog</DialogClose>
 * ```
 */
const DialogClose = DialogPrimitive.Close


/**
 * @purpose Overlay behind the dialog content
 * 
 * @param props - Standard props for HTML div element
 * @param props.className - Optional additional CSS classes
 * @returns JSX.Element
 * @throws None
 * @sideEffects Renders a semi-transparent overlay behind the dialog that prevents interaction with underlying content
 * 
 * @example
 * ```tsx
 * <DialogOverlay />
 * ```
 */
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName



/**
 * @purpose Main content of the dialog, includes close button
 * 
 * @param props - Props for the content container
 * @param props.className - Optional additional CSS classes
 * @param props.children - Dialog content nodes
 * @returns JSX.Element
 * @throws None
 * @sideEffects Renders the dialog content centered on the screen and attaches close functionality
 * 
 * @example
 * <DialogContent>
 *   <DialogHeader>
 *     <DialogTitle>Title</DialogTitle>
 *     <DialogDescription>Description</DialogDescription>
 *   </DialogHeader>
 *   <div>Main content</div>
 *   <DialogFooter>
 *     <button>Cancel</button>
 *     <button>Confirm</button>
 *   </DialogFooter>
 * </DialogContent>
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName


/**
 * @purpose Header container for Dialog content
 * 
 * @param props - Props for the header container
 * @param props.className - Optional additional CSS classes
 * @returns JSX.Element
 * @throws None
 * @sideEffects Provides a flex container for title and description
 * 
 * @example
 * <DialogHeader>
 *   <DialogTitle>Title</DialogTitle>
 *   <DialogDescription>Description</DialogDescription>
 * </DialogHeader>
 */
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"


/**
 * @purpose Footer container for Dialog actions (buttons)
 * 
 * @param props - Props for the footer container
 * @param props.className - Optional additional CSS classes
 * @returns JSX.Element
 * @throws None
 * @sideEffects Provides a container for dialog buttons with responsive layout
 * 
 * @example
 * <DialogFooter>
 *   <button>Cancel</button>
 *   <button>Confirm</button>
 * </DialogFooter>
 */
const DialogFooter = ({
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
DialogFooter.displayName = "DialogFooter"


/**
 * @purpose Title text of the dialog
 * 
 * @param props - Props for the title element
 * @param props.className - Optional additional CSS classes
 * @returns JSX.Element
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <DialogTitle>Dialog Title</DialogTitle>
 */
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName


/**
 * @purpose Description text of the dialog
 * 
 * @param props - Props for the description element
 * @param props.className - Optional additional CSS classes
 * @returns JSX.Element
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <DialogDescription>Optional description text</DialogDescription>
 */
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}