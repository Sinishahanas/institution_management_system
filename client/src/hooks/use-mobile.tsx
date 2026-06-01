import * as React from "react"

/** Default breakpoint to consider a screen as mobile */
const MOBILE_BREAKPOINT = 768


/**
 * @purpose Custom React hook to detect if the current viewport is considered "mobile".
 * 
 * @param {number} MOBILE_BREAKPOINT - The breakpoint to consider a screen as mobile (default: 768px).
 * @returns {boolean} `true` if the viewport width is less than `MOBILE_BREAKPOINT`, otherwise `false`.
 * @throws {Error} If `MOBILE_BREAKPOINT` is not a valid number.
 * @sideEffects Adds a `resize` event listener using `matchMedia` to update state when the viewport width crosses the mobile breakpoint.
 *
 *  @example
 * function MyComponent() {
 *   const isMobile = useIsMobile();
 *
 *   return (
 *     <div>
 *       {isMobile ? <MobileMenu /> : <DesktopMenu />}
 *     </div>
 *   )
 * }
 */
export function useIsMobile() {
  // Initialize state with undefined to handle initial render
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  // Add event listener to update state on window resize
  React.useEffect(() => {
    // Create a media query list to detect when the viewport width crosses the mobile breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    // Update state when the viewport width crosses the mobile breakpoint
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    // Update state with the initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    // Remove event listener on cleanup
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Return true if the viewport is mobile, false otherwise
  return !!isMobile
}
