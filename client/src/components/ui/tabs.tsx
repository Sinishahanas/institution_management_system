import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

/**
 * Tabs
 *
 * @purpose
 * - Root container for a tabbed interface.
 * - Manages tab state and active panel.
 *
 * @param {object} props - Props from Radix UI's `TabsPrimitive.Root`.
 * @returns {JSX.Element} A controlled tabbed interface container.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <Tabs defaultValue="account">
 *   <TabsList>
 *     <TabsTrigger value="account">Account</TabsTrigger>
 *     <TabsTrigger value="settings">Settings</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="account">Account Content</TabsContent>
 *   <TabsContent value="settings">Settings Content</TabsContent>
 * </Tabs>
 */
const Tabs = TabsPrimitive.Root


/**
 * TabsList
 *
 * @purpose
 * - Wrapper that contains the tab triggers.
 * - Applies background and flexbox layout styling.
 *
 * @param {object} props - Props from Radix UI's `TabsPrimitive.List`.
 * @param {string} [props.className] - Additional custom classes.
 * @returns {JSX.Element} A styled `<div>` containing tab triggers.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <TabsList>
 *   <TabsTrigger value="profile">Profile</TabsTrigger>
 *   <TabsTrigger value="security">Security</TabsTrigger>
 * </TabsList>
 */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName


/**
 * TabsTrigger
 *
 * @purpose
 * - Button-like element that switches between tab panels when clicked.
 * - Provides focus styles, active state, and disabled handling.
 *
 * @param {object} props - Props from Radix UI's `TabsPrimitive.Trigger`.
 * @param {string} props.value - Unique value representing the tab.
 * @param {string} [props.className] - Optional custom classes.
 * @returns {JSX.Element} A styled tab trigger button.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <TabsTrigger value="notifications">Notifications</TabsTrigger>
 */
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName


/**
 * TabsContent
 *
 * @purpose
 * - Content panel associated with a specific tab trigger.
 * - Only visible when its corresponding trigger is active.
 *
 * @param {object} props - Props from Radix UI's `TabsPrimitive.Content`.
 * @param {string} props.value - Value matching the related trigger.
 * @param {string} [props.className] - Optional additional classes.
 * @returns {JSX.Element} A styled tab panel container.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <TabsContent value="profile">
 *   <p>Profile settings go here</p>
 * </TabsContent>
 */
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }

/**
 * Example showcasing all
 * @example
 * <Tabs defaultValue="general">
 *   <TabsList>
 *     <TabsTrigger value="general">General</TabsTrigger>
 *     <TabsTrigger value="advanced">Advanced</TabsTrigger>
 *   </TabsList>
 *
 *   <TabsContent value="general">
 *     <p>General settings go here.</p>
 *   </TabsContent>
 *
 *   <TabsContent value="advanced">
 *     <p>Advanced settings go here.</p>
 *   </TabsContent>
 * </Tabs>
 */