import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * @constant SIDEBAR_COOKIE_NAME
 * @purpose Name of the cookie used to store the sidebar state.
 */
const SIDEBAR_COOKIE_NAME = "sidebar:state"

/**
 * @constant SIDEBAR_COOKIE_MAX_AGE
 * @purpose Maximum age of the cookie used to store the sidebar state.
 */
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

/**
 * @constant SIDEBAR_WIDTH
 * @purpose Default width of the expanded sidebar on desktop.
 */
const SIDEBAR_WIDTH = "16rem"

/**
 * @constant SIDEBAR_WIDTH_MOBILE
 * @purpose Default width of the sidebar on mobile devices.
 */
const SIDEBAR_WIDTH_MOBILE = "18rem"

/**
 * @constant SIDEBAR_WIDTH_ICON
 * @purpose Width of the sidebar when collapsed to icon-only mode.
 */
const SIDEBAR_WIDTH_ICON = "3rem"

/**
 * @constant SIDEBAR_KEYBOARD_SHORTCUT
 * @purpose Keyboard shortcut key to toggle sidebar visibility.
 */
const SIDEBAR_KEYBOARD_SHORTCUT = "b"


/**
 * @typedef SidebarContext
 * @property {"expanded" | "collapsed"} state - Current sidebar state (expanded or collapsed).
 * @property {boolean} open - Whether the sidebar is currently open on desktop.
 * @property {(open: boolean) => void} setOpen - Function to update `open` state on desktop.
 * @property {boolean} openMobile - Whether the sidebar is currently open on mobile.
 * @property {(open: boolean) => void} setOpenMobile - Function to update `openMobile` state on mobile.
 * @property {boolean} isMobile - Whether the current viewport is considered mobile.
 * @property {() => void} toggleSidebar - Toggles the sidebar open/collapsed state.
 */
type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

/**
 * @purpose React context providing sidebar state and control functions.
 * 
 * @param None
 * @returns {React.Context<SidebarContext | null>}
 * @sideEffects None. Consumers should use the provided state and functions within a `SidebarProvider`.
 * 
 * @example
 * const SidebarContext = React.createContext<SidebarContext | null>(null)
 */
const SidebarContext = React.createContext<SidebarContext | null>(null)


/**
 * @purpose Hook to access Sidebar context
 *
 * @param None
 * @returns {SidebarContext} Sidebar state and methods
 * @sideEffects None
 * @throws {Error} If used outside SidebarProvider
 * 
 * @example
 * const { toggleSidebar } = useSidebar()
 */
function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}


/**
 * SidebarProvider component
 *
 * @purpose Wraps the app and provides sidebar state context
 * 
 * @param {object} props - Props object.
 * @param {boolean} [props.defaultOpen=true] - Initial sidebar state.
 * @param {boolean} [props.open] - Controlled open state.
 * @param {(open: boolean) => void} [props.onOpenChange] - Callback when open state changes.
 * @returns {JSX.Element} Sidebar provider wrapper.
 * @returns JSX.Element
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <SidebarProvider defaultOpen={true}>
 *   <Sidebar>...</Sidebar>
 * </SidebarProvider>
 */
const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        if (setOpenProp) {
          return setOpenProp?.(
            typeof value === "function" ? value(open) : value
          )
        }

        _setOpen(value)

        // This sets the cookie to keep the sidebar state.
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
      },
      [setOpenProp, open]
    )

    // Helper to toggle the sidebar.
    /**
     * Toggles the sidebar open or closed based on the device type.
     *
     * @purpose
     * - Manage the open/closed state of the sidebar for both mobile and desktop views.
     * - Uses `isMobile` to determine which state updater (`setOpenMobile` or `setOpen`) to call.
     *
     * @param {boolean} isMobile - Indicates whether the sidebar is in mobile mode.
     * @param {React.Dispatch<React.SetStateAction<boolean>>} setOpen - State setter for desktop sidebar open/closed state.
     * @param {React.Dispatch<React.SetStateAction<boolean>>} setOpenMobile - State setter for mobile sidebar open/closed state.
     *
     * @returns {void} Does not return a value; updates the sidebar state.
     * @throws {Error} Will throw if either `setOpen` or `setOpenMobile` are undefined (not passed properly).
     * @sideEffects
     * - Toggles the sidebar state by calling either `setOpen` or `setOpenMobile`.
     *
     * @example
     * // Toggle sidebar on a button click
     * <button onClick={toggleSidebar}>Toggle Sidebar</button>
     *
     * @example
     * // Inside a React component
     * const [isOpen, setOpen] = useState(false);
     * const [isMobileOpen, setOpenMobile] = useState(false);
     * const toggleSidebar = React.useCallback(() => {
     *   return isMobile ? setOpenMobile(open => !open) : setOpen(open => !open);
     * }, [isMobile, setOpen, setOpenMobile]);
     */
    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open)
        : setOpen((open) => !open)
    }, [isMobile, setOpen, setOpenMobile])

    // Adds a keyboard shortcut to toggle the sidebar.
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const state = open ? "expanded" : "collapsed"


    /**
     * Memoized context value for the SidebarContext.
     *
     * @purpose
     * - Provides a stable, memoized object to be passed as the value of `SidebarContext.Provider`.
     * - Contains all sidebar-related state and functions for both mobile and desktop.
     * - Prevents unnecessary re-renders by memoizing the context value unless dependencies change.
     *
     * @param {Object} state - The current state of the sidebar (e.g., expanded/collapsed sections).
     * @param {boolean} open - Indicates if the desktop sidebar is open.
     * @param {React.Dispatch<React.SetStateAction<boolean>>} setOpen - Function to set the desktop sidebar state.
     * @param {boolean} isMobile - Whether the sidebar is being displayed in mobile mode.
     * @param {boolean} openMobile - Indicates if the mobile sidebar is open.
     * @param {React.Dispatch<React.SetStateAction<boolean>>} setOpenMobile - Function to set the mobile sidebar state.
     * @param {() => void} toggleSidebar - Function to toggle the sidebar open or closed depending on device type.
     *
     * @returns {SidebarContext} Memoized object containing sidebar state and actions.
     * @throws {Error} Will throw if any of the required state setters or toggle function are undefined.
     * @sideEffects None directly; side effects occur only when `setOpen`, `setOpenMobile`, or `toggleSidebar` are called.
     *
     * @example
     * // Providing the context to a component tree
     * <SidebarContext.Provider value={contextValue}>
     *   <SidebarNav />
     * </SidebarContext.Provider>
     *
     * @example
     * // Accessing sidebar state in a child component
     * const { open, toggleSidebar } = useContext(SidebarContext);
     * <button onClick={toggleSidebar}>{open ? "Close" : "Open"} Sidebar</button>
     */
    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full text-sidebar-foreground has-[[data-variant=inset]]:bg-sidebar",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"


/**
 * Sidebar component
 *
 * @purpose Renders the sidebar panel for desktop or mobile with collapsible support
 * 
 * @param {object} props - Includes side, variant, collapsible, className, children
 * @returns JSX.Element
 * @throws None
 * @sideEffects None
 * @example
 * <Sidebar variant="floating" collapsible="icon">...</Sidebar>
 */
const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side={side}
          >
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <div
        ref={ref}
        className="group peer hidden md:block"
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
      >
        {/* This is what handles the sidebar gap on desktop */}
        <div
          className={cn(
            "duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear",
            "group-data-[collapsible=offcanvas]:w-0",
            "group-data-[side=right]:rotate-180",
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]"
          )}
        />
        <div
          className={cn(
            "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex",
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            // Adjust the padding for floating and inset variants.
            variant === "floating" || variant === "inset"
              ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
            className
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"


/**
 * SidebarTrigger
 *
 * @purpose
 * - Renders a button that toggles the sidebar open/closed state.
 * - Uses `useSidebar` context hook to call `toggleSidebar`.
 *
 * @param {React.ComponentProps<typeof Button>} props - Props to pass to the underlying Button component.
 * @param {string} [props.className] - Optional additional CSS classes.
 * @param {React.Ref} ref - Forwarded ref to the Button element.
 * @returns {JSX.Element} A Button element with a PanelLeft icon and click handler.
 * @sideEffects - Calls `toggleSidebar` when clicked.
 * @throws None
 *
 * @example
 * <SidebarTrigger />
 */
const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"


/**
 * SidebarRail
 *
 * @purpose Provides a draggable/interactive rail for toggling the sidebar.
 *
 * @param {React.ComponentProps<"button">} props - Props for the button element.
 * @param {React.Ref} ref - Forwarded ref to the button element.
 * @returns {JSX.Element} A button acting as a sidebar rail.
 * @sideEffects - Calls `toggleSidebar` when clicked.
 * @throws None
 *
 * @example
 * <SidebarRail />
 */
const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
})
SidebarRail.displayName = "SidebarRail"


/**
 * SidebarInset
 *
 * @purpose Wrapper for the main content area when using an inset sidebar layout.
 *
 * @param {React.ComponentProps<"main">} props - Props for the main element.
 * @param {React.Ref} ref - Forwarded ref to the main element.
 * @returns {JSX.Element} Main element styled to accommodate the sidebar.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <SidebarInset>
 *   <Content />
 * </SidebarInset>
 */
const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"


/**
 * SidebarInput
 *
 * @purpose Input field designed for sidebar usage (e.g., search bar).
 *
 * @param {React.ComponentProps<typeof Input>} props - Props for the Input component.
 * @param {React.Ref} ref - Forwarded ref to the Input element.
 * @returns {JSX.Element} Input element styled for sidebar context.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <SidebarInput placeholder="Search..." />
 */
const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className
      )}
      {...props}
    />
  )
})
SidebarInput.displayName = "SidebarInput"


/**
 * SidebarHeader
 *
 * @purpose Container for the top section of the sidebar, e.g., logo or navigation header.
 *
 * @param {React.ComponentProps<"div">} props - Props for the div element.
 * @param {React.Ref} ref - Forwarded ref to the div element.
 * @returns {JSX.Element} Div element styled as sidebar header.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <SidebarHeader>
 *   <Logo />
 * </SidebarHeader>
 */
const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"


/**
 * SidebarFooter
 *
 * @purpose Container for the bottom section of the sidebar, e.g., logout or profile actions.
 *
 * @param {React.ComponentProps<"div">} props - Props for the div element.
 * @param {React.Ref} ref - Forwarded ref to the div element.
 * @returns {JSX.Element} Div element styled as sidebar footer.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <SidebarFooter>
 *   <LogoutButton />
 * </SidebarFooter>
 */
const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"


/**
 * SidebarSeparator
 *
 * @purpose Renders a visual separator (line) between sidebar sections.
 *
 * @param {React.ComponentProps<typeof Separator>} props - Props for the Separator component.
 * @param {React.Ref} ref - Forwarded ref to the Separator element.
 * @returns {JSX.Element} A styled Separator element.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <SidebarSeparator />
 */
const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"


/**
 * SidebarContent
 *
 * @purpose Container for the main content of the sidebar.
 * - Supports scrollable content and collapsible states for icon-only mode.
 *
 * @param {React.ComponentProps<"div">} props - Props for the div element.
 * @param {React.Ref} ref - Forwarded ref to the div element.
 * @returns {JSX.Element} A div element wrapping sidebar content.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <SidebarContent>
 *   <SidebarNav />
 * </SidebarContent>
 */
const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"


/**
 * SidebarGroup
 *
 * @purpose Wraps a group of related sidebar items.
 *
 * @param {React.ComponentProps<"div">} props - Props for the div element.
 * @param {React.Ref} ref - Forwarded ref to the div element.
 * @returns {JSX.Element} A div element representing a sidebar group.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <SidebarGroup>
 *   <SidebarGroupLabel>Management</SidebarGroupLabel>
 * </SidebarGroup>
 */
const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"


/**
 * SidebarGroupLabel
 *
 * @purpose Displays the label/title for a sidebar group.
 * - Supports `asChild` prop to render a different wrapper element.
 *
 * @param {React.ComponentProps<"div"> & { asChild?: boolean }} props - Props for the div element or custom element if `asChild` is true.
 * @param {React.Ref} ref - Forwarded ref to the element.
 * @returns {JSX.Element} A styled label for a sidebar group.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <SidebarGroupLabel>Management</SidebarGroupLabel>
 * <SidebarGroupLabel asChild><h3>Management</h3></SidebarGroupLabel>
 */
const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"


/**
 * SidebarGroupAction
 *
 * @purpose Renders an action button for a sidebar group (e.g., collapse/expand).
 * - Supports `asChild` prop to render a different element.
 *
 * @param {React.ComponentProps<"button"> & { asChild?: boolean }} props - Props for the button element or custom element if `asChild` is true.
 * @param {React.Ref} ref - Forwarded ref to the element.
 * @returns {JSX.Element} A styled button for sidebar group actions.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <SidebarGroupAction onClick={toggleCollapse}>
 *   <ChevronIcon />
 * </SidebarGroupAction>
 */
const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"


/**
 * SidebarGroupContent
 *
 * @purpose Container for the actual items of a sidebar group.
 *
 * @param {React.ComponentProps<"div">} props - Props for the div element.
 * @param {React.Ref} ref - Forwarded ref to the div element.
 * @returns {JSX.Element} A div wrapping sidebar group content.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <SidebarGroupContent>
 *   <SidebarNavItem title="Dashboard" />
 * </SidebarGroupContent>
 */
const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn("w-full text-sm", className)}
    {...props}
  />
))
SidebarGroupContent.displayName = "SidebarGroupContent"


/**
 * SidebarMenu
 *
 * @purpose Renders a container `<ul>` for sidebar menu items.
 *
 * @param {React.ComponentProps<"ul">} props - Standard `<ul>` props.
 * @param {React.Ref} ref - Forwarded ref to the `<ul>` element.
 * @returns {JSX.Element} A `<ul>` wrapping sidebar menu items.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <SidebarMenu>
 *   <SidebarMenuItem>Item 1</SidebarMenuItem>
 * </SidebarMenu>
 */
const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-1", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"


/**
 * SidebarMenuItem
 *
 * @purpose Wraps a single sidebar menu item `<li>`.
 *
 * @param {React.ComponentProps<"li">} props - Standard `<li>` props.
 * @param {React.Ref} ref - Forwarded ref to the `<li>` element.
 * @returns {JSX.Element} A `<li>` element representing a menu item.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <SidebarMenuItem>
 *   <SidebarMenuButton>Dashboard</SidebarMenuButton>
 * </SidebarMenuItem>
 */
const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

/**
 * @purpose Defines variants for the sidebar menu button.
 *
 * @param {Object} props - Props for the button element.
 * @param {string} [props.variant="default"] - Button variant (default, outline).
 * @param {string} [props.size="default"] - Button size (default, sm, lg).
 * @returns {JSX.Element} A styled button for sidebar menu items.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <sidebarMenuButtonVariants variant="default" size="default">Dashboard</sidebarMenuButtonVariants>
 */
const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)


/**
 * SidebarMenuButton
 *
 * @purpose
 * - Renders a clickable button for a sidebar menu item.
 * - Supports active state, tooltips, variants, sizes, and `asChild` rendering.
 *
 * @param {Object} props - Props for the button element.
 * @param {boolean} [props.asChild=false] - Render as a custom child element using Slot.
 * @param {boolean} [props.isActive=false] - Sets the active state styling.
 * @param {string | TooltipContent} [props.tooltip] - Tooltip content or props.
 * @param {string} [props.variant] - Visual variant (`default` | `outline`).
 * @param {string} [props.size] - Button size (`default` | `sm` | `lg`).
 * @param {React.Ref} ref - Forwarded ref to the button element.
 * @returns {JSX.Element} A styled sidebar menu button.
 * @throws None.
 * @sideEffects May render a Tooltip if the `tooltip` prop is provided.
 *
 * @example
 * <SidebarMenuButton isActive tooltip="Dashboard">Dashboard</SidebarMenuButton>
 */
const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { isMobile, state } = useSidebar()

    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      />
    )

    if (!tooltip) {
      return button
    }

    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip,
      }
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={state !== "collapsed" || isMobile}
          {...tooltip}
        />
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"


/**
 * SidebarMenuAction
 *
 * @purpose
 * - Renders a button for additional actions on a menu item (e.g., collapse, settings).
 * - Can optionally appear only on hover (`showOnHover`).
 *
 * @param {Object} props - Props for the button element.
 * @param {boolean} [props.asChild=false] - Render as custom element using Slot.
 * @param {boolean} [props.showOnHover=false] - Show only on hover/focus.
 * @param {React.Ref} ref - Forwarded ref to the button element.
 * @returns {JSX.Element} A styled action button for a menu item.
 * @throws None.
 * @sideEffects None.
 *
 * @example
 * <SidebarMenuAction showOnHover onClick={handleAction}><Icon /></SidebarMenuAction>
 */
const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"


/**
 * SidebarMenuBadge
 *
 * @purpose Displays a badge or count on a sidebar menu item.
 *
 * @param {React.ComponentProps<"div">} props - Standard `<div>` props.
 * @param {React.Ref} ref - Forwarded ref to the div element.
 * @returns {JSX.Element} A styled badge element.
 * @throws None.
 * @sideEffects None.
 *
 * @example
 * <SidebarMenuBadge>3</SidebarMenuBadge>
 */
const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="menu-badge"
    className={cn(
      "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none",
      "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
      "peer-data-[size=sm]/menu-button:top-1",
      "peer-data-[size=default]/menu-button:top-1.5",
      "peer-data-[size=lg]/menu-button:top-2.5",
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
))
SidebarMenuBadge.displayName = "SidebarMenuBadge"


/**
 * SidebarMenuSkeleton
 *
 * @purpose Displays a loading skeleton for a sidebar menu item, optionally with an icon.
 *
 * @param {Object} props - Props for the div element.
 * @param {boolean} [props.showIcon=false] - Whether to render an icon skeleton.
 * @param {React.Ref} ref - Forwarded ref to the div element.
 * @returns {JSX.Element} A loading skeleton for sidebar items.
 * @throws None.
 * @sideEffects Random width is calculated for text skeleton on render.
 *
 * @example
 * <SidebarMenuSkeleton showIcon />
 */
const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean
  }
>(({ className, showIcon = false, ...props }, ref) => {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("rounded-md h-8 flex gap-2 px-2 items-center", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 flex-1 max-w-[--skeleton-width]"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"


/**
 * SidebarMenuSub
 *
 * @purpose Container for nested submenu items inside a sidebar menu.
 *
 * @param {React.ComponentProps<"ul">} props - Standard `<ul>` props.
 * @param {React.Ref} ref - Forwarded ref to the `<ul>` element.
 * @returns {JSX.Element} A nested `<ul>` for sub-menu items.
 * @throws None.
 * @sideEffects None.
 *
 * @example
 * <SidebarMenuSub>
 *   <SidebarMenuSubItem>Sub Item</SidebarMenuSubItem>
 * </SidebarMenuSub>
 */
const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu-sub"
    className={cn(
      "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
))
SidebarMenuSub.displayName = "SidebarMenuSub"


/**
 * SidebarMenuSubItem
 *
 * @purpose Wraps a single submenu item `<li>`.
 *
 * @param {React.ComponentProps<"li">} props - Standard `<li>` props.
 * @param {React.Ref} ref - Forwarded ref to the `<li>` element.
 * @returns {JSX.Element} A `<li>` element for a submenu item.
 * @throws None.
 * @sideEffects None.
 *
 * @example
 * <SidebarMenuSubItem>
 *   <SidebarMenuSubButton href="/sub">Sub Item</SidebarMenuSubButton>
 * </SidebarMenuSubItem>
 */
const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ ...props }, ref) => <li ref={ref} {...props} />)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"


/**
 * @purpose Wraps a single submenu item `<a>`.
 *
 * @param {React.ComponentProps<"a">} props - Standard `<a>` props.
 * @param {React.Ref} ref - Forwarded ref to the `<a>` element.
 * @returns {JSX.Element} A `<a>` element for a submenu item.
 * @throws None.
 * @sideEffects None.
 *
 * @example
 * <SidebarMenuSubButton href="/sub">Sub Item</SidebarMenuSubButton>
 */
const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean
    size?: "sm" | "md"
    isActive?: boolean
  }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
