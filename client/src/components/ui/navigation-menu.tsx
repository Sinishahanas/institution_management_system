import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cva } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * NavigationMenu Component
 *
 * @purpose Top-level navigation menu provider using Radix NavigationMenu primitive.
 *
 * @param {React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>} props Props to pass to Radix Root.
 * @param {React.Ref<React.ElementRef<typeof NavigationMenuPrimitive.Root>>} ref Forwarded ref.
 * @returns {JSX.Element} Navigation menu wrapper with children and viewport.
 * @throws {Error} If used outside NavigationMenuPrimitive.Root context.
 * @sideEffects Renders navigation menu internals and the viewport element. No external side effects.
 *
 * @example
 * ```tsx
 * <NavigationMenu>
 *   <NavigationMenuList>
 *     <NavigationMenuItem>
 *       <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
 *       <NavigationMenuContent>
 *         <NavigationMenuLink href="/dashboard">Dashboard</NavigationMenuLink>
 *       </NavigationMenuContent>
 *     </NavigationMenuItem>
 *   </NavigationMenuList>
 * </NavigationMenu>
 * ```
 */
const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
))
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName

/**
 * NavigationMenuList
 *
 * @purpose Semantic list container for navigation menu items.
 *
 * @param {React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>} props Props for Radix List.
 * @param {React.Ref<React.ElementRef<typeof NavigationMenuPrimitive.List>>} ref Forwarded ref.
 * @returns {JSX.Element} Flex container for menu items.
 * @throws {Error} If used outside NavigationMenuPrimitive.List context.
 * @sideEffects None (presentational).
 *
 * @example
 * ```tsx
 * <NavigationMenu>
 *   <NavigationMenuList>
 *     <NavigationMenuItem>...</NavigationMenuItem>
 *   </NavigationMenuList>
 * </NavigationMenu>
 * ```
 */
const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      "group flex flex-1 list-none items-center justify-center space-x-1",
      className
    )}
    {...props}
  />
))
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName

/**
 * NavigationMenuItem
 *
 * @purpose Re-export of Radix `NavigationMenuPrimitive.Item` for convenience.
 *
 * @param {React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Item>} props Props for Radix Item.
 * @param {React.Ref<React.ElementRef<typeof NavigationMenuPrimitive.Item>>} ref Forwarded ref.
 * @returns {JSX.Element} Navigation menu item.
 * @throws {Error} If used outside NavigationMenuPrimitive.Item context.
 * @sideEffects None
 * @type {typeof NavigationMenuPrimitive.Item}
 *
 * @example
 * ```tsx
 * <NavigationMenuList>
 *   <NavigationMenuItem>
 *     <NavigationMenuTrigger>Products</NavigationMenuTrigger>
 *     <NavigationMenuContent>...</NavigationMenuContent>
 *   </NavigationMenuItem>
 * </NavigationMenuList>
 * ```
 */
const NavigationMenuItem = NavigationMenuPrimitive.Item

/**
 * navigationMenuTriggerStyle
 *
 * @purpose Tailwind/CVA utility that returns base styles for a NavigationMenu trigger.
 *
 * @param {None}
 * @returns string (computed className) via CVA invocation when used.
 * @throws {Error} If cva is not used correctly.
 * @sideEffects None.
 *
 * @example
 * ```tsx
 * <button className={navigationMenuTriggerStyle()}>Menu</button>
 * ```
 */
const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
)

/**
 * NavigationMenuTrigger component.
 *
 * @purpose Button to toggle visibility of the submenu content.
 * 
 * @sideEffects Animates the dropdown open/close state.
 * @param {React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>} props Props to customize the trigger.
 * @param {React.Ref<React.ElementRef<typeof NavigationMenuPrimitive.Trigger>>} ref Forwarded ref.
 * @returns {JSX.Element} Trigger button for submenu.
 * @throws {Error} If used outside NavigationMenuPrimitive.Item context.
 *
 * @example
 * <NavigationMenuItem>
 *   <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
 *   <NavigationMenuContent>...</NavigationMenuContent>
 * </NavigationMenuItem>
 */
const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}{" "}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
))
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName

/**
 * NavigationMenuContent component.
 *
 * @purpose Displays submenu content.
 * 
 * @sideEffects Animates opening/closing of submenu.
 * @param {React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>} props Props to customize content panel.
 * @param {React.Ref<React.ElementRef<typeof NavigationMenuPrimitive.Content>>} ref Forwarded ref.
 * @returns {JSX.Element} Content panel shown when trigger is active.
 * @throws {Error} If used outside NavigationMenuPrimitive.Content context.
 *
 * @example
 * <NavigationMenuContent>
 *   <NavigationMenuLink href="/dashboard">Dashboard</NavigationMenuLink>
 * </NavigationMenuContent>
 */
const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto ",
      className
    )}
    {...props}
  />
))
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName

/**
 * @purpose Clickable link for menu items.
 * 
 * @param {React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Link>} props Props to customize link.
 * @param {React.Ref<React.ElementRef<typeof NavigationMenuPrimitive.Link>>} ref Forwarded ref.
 * @returns {JSX.Element} Link element for menu items.
 * @throws {Error} If used outside NavigationMenuPrimitive.Link context.
 * @sideEffects None.
 *
 * @example
 * <NavigationMenuLink href="/dashboard">Dashboard</NavigationMenuLink>
 */
const NavigationMenuLink = NavigationMenuPrimitive.Link

/**
 * @purpose Container for Radix viewport that positions the menu content.
 * 
 * @param {React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>} props Props for viewport customization.
 * @param {React.Ref<React.ElementRef<typeof NavigationMenuPrimitive.Viewport>>} ref Forwarded ref.
 * @returns {JSX.Element} Wrapper for viewport content panel.
 * @throws {Error} If used outside NavigationMenuPrimitive.Viewport context.
 * @sideEffects Positions submenu content and handles animations.
 *
 * @example
 * <NavigationMenuViewport />
 */
const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
        className
      )}
      ref={ref}
      {...props}
    />
  </div>
))
NavigationMenuViewport.displayName =
  NavigationMenuPrimitive.Viewport.displayName

/**
 * @purpose NavigationMenuIndicator component.
 *
 * @param {React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>} props Props to customize indicator.
 * @param {React.Ref<React.ElementRef<typeof NavigationMenuPrimitive.Indicator>>} ref Forwarded ref.
 * @returns {JSX.Element} Indicator element.
 * @throws {Error} If used outside NavigationMenuPrimitive.Indicator context.
 * @sideEffects Animates visibility state.
 *
 * @example
 * <NavigationMenuIndicator />
 */
const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
))
NavigationMenuIndicator.displayName =
  NavigationMenuPrimitive.Indicator.displayName

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
}
