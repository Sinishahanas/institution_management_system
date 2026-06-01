import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { Dot } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * @purpose
 * - InputOTP is a wrapper around the OTPInput component.
 * - Provides a styled one-time password input field.
 *
 * @param {object} props - Props passed to the OTPInput component.
 * @param {string} [props.className] - Additional classes for each input box.
 * @param {string} [props.containerClassName] - Additional classes for the container of all inputs.
 * @param {React.Ref} ref - Ref forwarded to the underlying OTPInput component.
 *
 * @returns {JSX.Element} The rendered OTP input component.
 * @throws {Error} If used outside a <InputOTP>
 * @sideEffects May call user-provided `onChange` handlers when input changes.
 *
 * @example
 * <InputOTP length={6} value={otp} onChange={setOtp} />
 */
const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
))
InputOTP.displayName = "InputOTP"

/**
 * @purpose InputOTPGroup is a container for multiple OTP input slots.
 *
 * @param {object} props - Props passed to the div container.
 * @param {string} [props.className] - Additional CSS classes for styling.
 * @param {React.Ref} ref - Ref forwarded to the underlying div element.
 *
 * @returns {JSX.Element} The rendered container for OTP slots.
 * @throws {Error} If used outside a <InputOTPGroup>
 * @sideEffects None. Pure UI container.
 *
 * @example
 * <InputOTPGroup>
 *   <InputOTPSlot index={0} />
 *   <InputOTPSlot index={1} />
 * </InputOTPGroup>
 */
const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
))
InputOTPGroup.displayName = "InputOTPGroup"

/**
 * @purpose
 * - InputOTPSlot renders a single input box of the OTP input.
 * - Handles active state and caret animation.
 *
 * @param {object} props - Props for the slot.
 * @param {number} props.index - Index of the slot in the OTP input.
 * @param {string} [props.className] - Additional CSS classes for styling.
 * @param {React.Ref} ref - Ref forwarded to the div representing the slot.
 *
 * @returns {JSX.Element} The rendered OTP slot.
 * @throws {Error} If used outside a <InputOTPSlot>
 * @sideEffects None internally; may trigger updates in OTPInputContext.
 *
 * @example
 * <InputOTPSlot index={0} />
 */
const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-2 ring-ring ring-offset-background",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = "InputOTPSlot"

/**
 * @purpose
 * - InputOTPSeparator renders a visual separator (dot) between OTP input slots.
 *
 * @param {object} props - Props passed to the div container.
 * @param {string} [props.className] - Additional CSS classes for styling.
 * @param {React.Ref} ref - Ref forwarded to the div representing the separator.
 *
 * @returns {JSX.Element} The rendered separator element.
 * @throws {Error} If used outside a <InputOTPSeparator>
 * @sideEffects None. Pure UI component.
 *
 * @example
 * <InputOTPSlot index={0} />
 * <InputOTPSeparator />
 * <InputOTPSlot index={1} />
 */
const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Dot />
  </div>
))
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
