import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

/**
 * Avatar Component
 *
 * @purpose 
 * - Container for displaying user avatars with fallback support.
 * - Provides a rounded container for images or fallback content.
 *
 * @param {object} props - Standard props for the Avatar container.
 * @param {string} [props.className] - Optional additional class names.
 * @returns {JSX.Element} Rendered avatar container.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <Avatar>
 *   <AvatarImage src="/user.jpg" alt="User Name" />
 *   <AvatarFallback>JZ</AvatarFallback>
 * </Avatar>
 */
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

/**
 * AvatarImage Component
 *
 * @purpose 
 * - Displays an image inside the Avatar container.
 * - Automatically scales and fills the container while maintaining aspect ratio.
 *
 * @param {object} props - Standard props for the Avatar image.
 * @param {string} [props.src] - Image source URL.
 * @param {string} [props.alt] - Alt text for the image.
 * @param {string} [props.className] - Optional additional class names.
 * @returns {JSX.Element} Rendered avatar image.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <Avatar>
 *   <AvatarImage src="/user.jpg" alt="User Name" />
 * </Avatar>
 */
const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

/**
 * AvatarFallback Component
 *
 * @purpose 
 * - Displays fallback content when AvatarImage fails to load.
 * - Can display initials, icons, or any React element.
 *
 * @param {object} props - Standard props for the Avatar fallback.
 * @param {string} [props.className] - Optional additional class names.
 * @param {React.ReactNode} [props.children] - Fallback content to display.
 * @returns {JSX.Element} Rendered avatar fallback element.
 * @throws None
 * @sideEffects None
 *
 * @example
 * <Avatar>
 *   <AvatarFallback>UN</AvatarFallback>
 * </Avatar>
 */
const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
