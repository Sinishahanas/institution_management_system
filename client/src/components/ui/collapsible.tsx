import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

/**
 * @purpose
 *  - A wrapper around Radix UI's `Collapsible` component set.  
 *  - Collapsible allows toggling visibility of content with smooth transitions.
 *  - Useful for accordions, expandable sections, and hide/show UI patterns.  
 *
 * @param {object} props React component props for CollapsiblePrimitive.Root
 * @returns {JSX.Element}
 * @throws None
 * @sideEffects Manages internal open/close state and triggers re-renders when toggled.
 * 
 * @example
 * <Collapsible>
 *   <CollapsibleTrigger>Show details</CollapsibleTrigger>
 *   <CollapsibleContent>
 *     <p>Hidden content revealed when open.</p>
 *   </CollapsibleContent>
 * </Collapsible>
 */
const Collapsible = CollapsiblePrimitive.Root

/**
 * @purpose
 *  - The trigger button that toggles the collapsible state.
 *  - Trigger button for toggling the collapsible state.
 *  - Opens or closes the associated CollapsibleContent.
 * 
 * @param {object} props React component props for CollapsiblePrimitive.CollapsibleTrigger
 * @returns {JSX.Element}
 * @throws None
 * @sideEffects Toggles the open state of the parent Collapsible.
 * 
 * @example
 * <CollapsibleTrigger className="font-medium">Show details</CollapsibleTrigger>
 */
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

/**
 * @purpose
 *  - Content container shown or hidden based on Collapsible state.
 *  - Displays content when the Collapsible is open.
 * 
 * @param {object} props React component props for CollapsiblePrimitive.CollapsibleContent
 * @returns {JSX.Element}
 * @throws None
 * @sideEffects Renders content conditionally depending on open state.
 * 
 * @example
 * <CollapsibleContent className="mt-2">
 *   <p>This content appears when the collapsible is open.</p>
 * </CollapsibleContent>
 */
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }