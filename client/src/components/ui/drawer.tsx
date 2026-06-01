import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

/**
 * @purpose Wraps all Drawer elements and manages open/close state.
 * 
 * @param {object} props - Props passed to DrawerPrimitive.Root
 * @param {boolean} [props.shouldScaleBackground=true] - Whether to scale the background on open
 * @returns {JSX.Element}
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `DrawerPrimitive.Root` or children and be handled by React's error boundaries.
 * @sideEffects Uses internal Portal for overlay and content
 * 
 * @example
 * <Drawer>
 *   <DrawerTrigger>Open Drawer</DrawerTrigger>
 *   <DrawerContent>
 *     <DrawerHeader>
 *       <DrawerTitle>Drawer Title</DrawerTitle>
 *       <DrawerDescription>Optional description text.</DrawerDescription>
 *     </DrawerHeader>
 *     <div>Main content goes here.</div>
 *     <DrawerFooter>
 *       <button>Cancel</button>
 *       <button>Confirm</button>
 *     </DrawerFooter>
 *   </DrawerContent>
 * </Drawer>
 */
const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
)
Drawer.displayName = "Drawer"

/**
 * @purpose Renders a trigger element that opens the associated Drawer.
 * 
 * @param {DrawerTriggerProps} props - The properties to pass directly to the `DrawerPrimitive.Trigger` component.
 * @returns {JSX.Element} A React element that, when activated, opens the drawer.
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `DrawerPrimitive.Trigger` or children and be handled by React's error boundaries.
 * @sideEffects Inherits side effects from `DrawerPrimitive.Trigger`, primarily managing click/activation events to control the drawer's open state.
 * 
 * @example
 * // Within a Drawer setup:
 * <Drawer>
 *   <DrawerTrigger>Open Drawer</DrawerTrigger>
 *   <DrawerPortal>
 *     <DrawerOverlay />
 *     <DrawerContent>
 *       <DrawerHeader>Drawer Title</DrawerHeader>
 *       <DrawerBody>Drawer content goes here.</DrawerBody>
 *       <DrawerFooter><DrawerClose>Close</DrawerClose></DrawerFooter>
 *     </DrawerContent>
 *   </DrawerPortal>
 * </Drawer>
 */
const DrawerTrigger = DrawerPrimitive.Trigger



/**
 * @purpose Renders its children into a new DOM subtree outside the current component hierarchy.
 * 
 * @param {DrawerPortalProps} props - The properties to pass directly to the `DrawerPrimitive.Portal` component.
 * @returns {JSX.Element} A React element that portals its children to a different DOM location.
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `DrawerPrimitive.Portal` or children and be handled by React's error boundaries.
 * @sideEffects Inherits side effects from `DrawerPrimitive.Portal`, primarily managing the creation and removal of a new DOM element for portaling.
 * 
 * @example
 * Essential for proper drawer overlay and content display:
 * <Drawer>
 *   <DrawerTrigger>Open Drawer</DrawerTrigger>
 *   <DrawerPortal>
 *     <DrawerOverlay />
 *     <DrawerContent>
 *       <DrawerHeader>Drawer Title</DrawerHeader>
 *       <DrawerBody>Drawer content goes here.</DrawerBody>
 *       <DrawerFooter><DrawerClose>Close</DrawerClose></DrawerFooter>
 *     </DrawerContent>
 *   </DrawerPortal>
 * </Drawer>
 */
const DrawerPortal = DrawerPrimitive.Portal


/**
 * @purpose Renders a button or element that closes the associated Drawer when activated.
 *
 * @param {DrawerCloseProps} props - The properties to pass directly to the `DrawerPrimitive.Close` component.
 * @returns {JSX.Element} A React element that, when activated, closes the drawer.
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `DrawerPrimitive.Close` or children and be handled by React's error boundaries.
 * @sideEffects Inherits side effects from `DrawerPrimitive.Close`, primarily handling click/activation events to close the drawer.
 * 
 * @example
 * // Often used within the Drawer's content or footer:
 * <DrawerContent>
 *   <DrawerFooter>
 *     <DrawerClose asChild>
 *       <button>Close Drawer</button>
 *     </DrawerClose>
 *     <DrawerClose>X</DrawerClose>
 *   </DrawerFooter>
 * </DrawerContent>
 */
const DrawerClose = DrawerPrimitive.Close

/**
 * @purpose Overlay behind the Drawer content.
 * 
 * @param {object} props - Props for overlay
 * @param {string} [props.className] - Additional class names
 * @returns {JSX.Element}
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `DrawerPrimitive.Overlay` or children and be handled by React's error boundaries.
 * @sideEffects Uses internal Portal for overlay and content
 * 
 * @example
 * <DrawerOverlay />
 */
const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName


/**
 * @purpose Main content of the Drawer.
 *
 * @param {object} props - Props for drawer content
 * @param {React.ReactNode} props.children - Drawer children
 * @param {string} [props.className] - Additional classes
 * @returns {JSX.Element}
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `DrawerPrimitive.Content` or children and be handled by React's error boundaries.
 * @sideEffects Renders DrawerOverlay inside DrawerPortal
 * 
 * @example
 * <DrawerContent>
 *   <DrawerHeader>
 *     <DrawerTitle>Drawer Title</DrawerTitle>
 *     <DrawerDescription>Optional description text.</DrawerDescription>
 *   </DrawerHeader>
 *   <div>Main content goes here.</div>
 *   <DrawerFooter>
 *     <button>Cancel</button>
 *     <button>Confirm</button>
 *   </DrawerFooter>
 * </DrawerContent>
 */
const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = "DrawerContent"


/**
 * @purpose Typically contains DrawerTitle and DrawerDescription.
 *
 * @param {object} props - Props for the header container
 * @param {string} [props.className] - Additional classes for styling
 * @returns {JSX.Element}
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `DrawerPrimitive.Header` or children and be handled by React's error boundaries.
 * @sideEffects None
 * 
 * @example
 * <DrawerHeader>
 *   <DrawerTitle>Title</DrawerTitle>
 *   <DrawerDescription>Description text</DrawerDescription>
 * </DrawerHeader>
 */
const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"


/**
 * @purpose Typically contains action buttons or secondary controls.
 *
 * @param {object} props - Props for the footer container
 * @param {string} [props.className] - Additional classes for styling
 * @returns {JSX.Element}
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `DrawerPrimitive.Footer` or children and be handled by React's error boundaries.
 * @sideEffects None
 * 
 * @example
 * <DrawerFooter>
 *   <button>Cancel</button>
 *   <button>Confirm</button>
 * </DrawerFooter>
 */
const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"


/**
 * @purpose Title text of the Drawer.
 *
 * @param {object} props - Props for the title element
 * @param {string} [props.className] - Additional classes for styling
 * @returns {JSX.Element}
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `DrawerPrimitive.Title` or children and be handled by React's error boundaries.
 * @sideEffects None
 * 
 * @example
 * <DrawerTitle>Drawer Title</DrawerTitle>
 */
const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName


/**
 * @purpose Description text of the Drawer.
 *
 * @param {object} props - Props for the description element
 * @param {string} [props.className] - Additional classes for styling
 * @returns {JSX.Element}
 * @throws {Error} This component does not directly throw errors; runtime issues would originate from `DrawerPrimitive.Description` or children and be handled by React's error boundaries.
 * @sideEffects None
 * 
 * @example
 * <DrawerDescription>Optional description text</DrawerDescription>
 */
const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
