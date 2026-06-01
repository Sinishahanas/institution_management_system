import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

/**
 * AlertDialog (Root)
 *
 * @purpose 
 * - Root provider for alert dialogs using Radix UI primitives. Wraps dialog state.
 * - Accepts the same props as `@radix-ui/react-alert-dialog`'s `Root` component (e.g. children, modal).
 * 
 * @param {React.PropsWithChildren} props - Children elements and Radix props.
 * @returns {JSX.Element} AlertDialog root provider element.
 * @throws Will throw if `AlertDialogPrimitive.Root` is undefined.
 * @sideEffects None.
 * 
 * @example
 * ```tsx
 * <AlertDialog>
 *   <AlertDialogTrigger>Delete</AlertDialogTrigger>
 *   <AlertDialogContent>
 *     <AlertDialogHeader>
 *       <AlertDialogTitle>Confirm</AlertDialogTitle>
 *       <AlertDialogDescription>Are you sure?</AlertDialogDescription>
 *     </AlertDialogHeader>
 *     <AlertDialogFooter>
 *       <AlertDialogCancel>Cancel</AlertDialogCancel>
 *       <AlertDialogAction>Confirm</AlertDialogAction>
 *     </AlertDialogFooter>
 *   </AlertDialogContent>
 * </AlertDialog>
 * ```
 */
const AlertDialog = AlertDialogPrimitive.Root

/**
 * AlertDialogTrigger
 *
 * @purpose 
 * - Trigger element that opens the alert dialog. This is a thin wrapper around Radix's `Trigger`.
 * - Usage: Use this as a button or clickable element that should open the dialog.
 *
 * @param {React.PropsWithChildren} props - Children or custom trigger element.
 * @returns {JSX.Element} Trigger element that opens the dialog.
 * @throws Will throw if `AlertDialogPrimitive.Trigger` is undefined.
 * @sideEffects Opens the alert dialog when activated.
 * 
 * @example
 * ```tsx
 * <AlertDialog>
 *   <AlertDialogTrigger asChild>
 *     <button>Open</button>
 *   </AlertDialogTrigger>
 *   ...
 * </AlertDialog>
 * ```
 */
const AlertDialogTrigger = AlertDialogPrimitive.Trigger

/**
 * AlertDialogPortal
 *
 * @purpose 
 * - Portal wrapper used to render the dialog into a React portal (outside the document flow).
 * - Usage: Use this to wrap the dialog content to ensure it is rendered outside the document flow.
 *
 * @param {React.PropsWithChildren} props - Child elements.
 * @returns {JSX.Element} Portal container for the dialog.
 * @throws Will throw if `AlertDialogPrimitive.Portal` is undefined.
 * @sideEffects None.
 * 
 * @example
 * ```tsx
 * <AlertDialogPortal>
 *   <AlertDialogOverlay />
 *   <AlertDialogContent>...</AlertDialogContent>
 * </AlertDialogPortal>
 * ```
 */
const AlertDialogPortal = AlertDialogPrimitive.Portal

/**
 * AlertDialogOverlay
 *
 * @purpose 
 * - Full-screen overlay shown behind the dialog when open. Adds a backdrop and default animations.
 * - Usage: Use this to wrap the dialog content to ensure it is rendered outside the document flow.
 *
 * @param {string} [className] - Additional CSS classes to apply.
 * @param {React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>} props - Props forwarded to Radix Overlay.
 * @returns {JSX.Element} Overlay element.
 * @throws Will throw if `AlertDialogPrimitive.Overlay` is undefined.
 * @sideEffects Blocks interaction behind the overlay when the dialog is open.
 * 
 * @example:
 * ```tsx
 * <AlertDialogPortal>
 *   <AlertDialogOverlay className="custom-backdrop" />
 *   <AlertDialogContent>...</AlertDialogContent>
 * </AlertDialogPortal>
 * ```
 */
const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

/**
 * AlertDialogContent
 *
 * @purpose 
 * - The main dialog content container. Centers and constrains the dialog, applies styling and entrance/exit animations.
 * - Usage: Use this to wrap the dialog content to ensure it is rendered outside the document flow.
 *
 * @param {string} [className] - Additional CSS classes.
 * @param {React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>} props - Props forwarded to Radix Content.
 * @returns {JSX.Element} Rendered dialog content element.
 * @throws Will throw if `AlertDialogPrimitive.Content` is undefined.
 * @sideEffects Focus is trapped while dialog is open.
 * 
 * @example:
 * ```tsx
 * <AlertDialog>
 *   <AlertDialogContent>
 *     <AlertDialogHeader>...</AlertDialogHeader>
 *     <AlertDialogFooter>...</AlertDialogFooter>
 *   </AlertDialogContent>
 * </AlertDialog>
 * ```
 */
const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

/**
 * AlertDialogHeader
 *
 * @purpose 
 * - Small presentational wrapper that provides consistent spacing and text alignment for dialog headers.
 * - Usage: Use this to wrap the dialog content to ensure it is rendered outside the document flow.
 *
 * @param {string} [className] - Additional CSS classes.
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Props forwarded to div.
 * @returns {JSX.Element} Header container element.
 * @throws Will throw if `AlertDialogHeader` is undefined.
 * @sideEffects None.
 *
 * @example
 * ```tsx
 * <AlertDialogHeader>
 *   <AlertDialogTitle>Delete item</AlertDialogTitle>
 *   <AlertDialogDescription>Are you sure?</AlertDialogDescription>
 * </AlertDialogHeader>
 * ```
 */
const AlertDialogHeader = ({
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
AlertDialogHeader.displayName = "AlertDialogHeader"

/**
 * AlertDialogFooter
 *
 * @purpose 
 * - Layout wrapper for dialog actions (buttons). By default it stacks on small screens and aligns actions to the end on larger screens.
 *
 * @param {string} [className] - Additional CSS classes.
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Props forwarded to div.
 * @returns {JSX.Element} Footer container element.
 * @throws Will throw if `AlertDialogFooter` is undefined.
 * @sideEffects None.
 * 
 * @example
 * ```tsx
 * <AlertDialogFooter>
 *   <AlertDialogCancel>Cancel</AlertDialogCancel>
 *   <AlertDialogAction>Delete</AlertDialogAction>
 * </AlertDialogFooter>
 * ```
 */
const AlertDialogFooter = ({
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
AlertDialogFooter.displayName = "AlertDialogFooter"

/**
 * AlertDialogTitle
 *
 * @purpose 
 * - Title element for the dialog. Renders an accessible heading via Radix's Title primitive.
 *
 * @param {string} [className] - Additional CSS classes.
 * @param {React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>} props - Props forwarded to Radix Title.
 * @returns {JSX.Element} Title element.
 * @throws Will throw if `AlertDialogPrimitive.Title` is undefined.
 * @sideEffects None.
 *
 * @example
 * ```tsx
 * <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
 * ```
 */
const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName


/**
 * AlertDialogDescription
 *
 * @purpose 
 * - Description element for the dialog. Used to provide context/subtext for the title.
 *
 * @param {string} [className] - Additional CSS classes.
 * @param {React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>} props - Props forwarded to Radix Description.
 * @returns {JSX.Element} Description element.
 * @throws Will throw if `AlertDialogPrimitive.Description` is undefined.
 * @sideEffects None.
 *
 * @example
 * ```tsx
 * <AlertDialogDescription>
 *   This action cannot be undone.
 * </AlertDialogDescription>
 * ```
 */
const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName


/**
 * AlertDialogAction
 *
 * @purpose 
 * - Primary action button inside the dialog (e.g., Confirm/Delete). Wraps Radix's `Action` primitive and applies button styles.
 *
 * @param {string} [className] - Additional CSS classes.
 * @param {React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>} props - Props forwarded to Radix Action.
 * @returns {JSX.Element} Action button element.
 * @throws Will throw if `AlertDialogPrimitive.Action` is undefined.
 * @sideEffects Executes any onClick handler or action side effects.
 * 
 * @example
 * ```tsx
 * <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
 * ```
 */
const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

/**
 * AlertDialogCancel
 *
 * @purpose 
 * - Secondary action that cancels/declines the dialog (e.g., Close/Cancel). Wraps Radix's `Cancel` primitive and applies outline button styles.
 *
 * @param {string} [className] - Additional CSS classes.
 * @param {React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>} props - Props forwarded to Radix Cancel.
 * @returns {JSX.Element} Cancel button element.
 * @throws Will throw if `AlertDialogPrimitive.Cancel` is undefined.
 * @sideEffects None.
 * 
 * @example
 * ```tsx
 * <AlertDialogCancel>Cancel</AlertDialogCancel>
 * ```
 */
const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
