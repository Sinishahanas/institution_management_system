import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/lib/utils"

/**
 * @purpose
 * - Provides a hoverable card component with additional content.
 * - Manages hover interactions and content alignment.
 * 
 * @type {import("@radix-ui/react-hover-card").HoverCard}
 * @param {import("@radix-ui/react-hover-card").HoverCardProps} props - Props passed to hover-card component
 * @returns {JSX.Element} A hoverable card component with additional content.
 * @throws {Error} If used outside a <HoverCard>
 * @sideEffects None.
 * 
 * @example
 * <HoverCard>
 *   <HoverCardTrigger>
 *     <button>Hover me</button>
 *   </HoverCardTrigger>
 *   <HoverCardContent>
 *     Additional information displayed on hover.
 *   </HoverCardContent>
 * </HoverCard>
 */
const HoverCard = HoverCardPrimitive.Root

/**
 * @purpose
 * - Trigger element for the HoverCard.
 * - When hovered, it shows the content defined in HoverCardContent.
 * 
 * @type {import("@radix-ui/react-hover-card").HoverCardTrigger}
 * @param {import("@radix-ui/react-hover-card").HoverCardTriggerProps} props - Props passed to hover-card trigger component
 * @returns {JSX.Element} A trigger element for the hoverable card.
 * @throws {Error} If used outside a <HoverCard>
 * @sideEffects None.
 *
 * @example
 * <HoverCardTrigger>
 *   <button>Hover me</button>
 * </HoverCardTrigger>
 */
const HoverCardTrigger = HoverCardPrimitive.Trigger


/**
 * @purpose
 * - Content displayed when the HoverCard is triggered (hovered).
 * - Supports alignment and offset customization.
 *
 * @type {import("@radix-ui/react-hover-card").HoverCardContent}
 * @param {import("@radix-ui/react-hover-card").HoverCardContentProps} props - Props passed to hover-card content component
 * @returns {JSX.Element} The rendered hover card content.
 * @throws {Error} If used outside a <HoverCard>
 * @sideEffects None.
 *
 * @example
 * <HoverCardContent align="start" sideOffset={8}>
 *   Custom aligned content.
 * </HoverCardContent>
 */
const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCard, HoverCardTrigger, HoverCardContent }
