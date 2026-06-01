import { GripVertical } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

/**
 * ResizablePanelGroup component.
 *
 * @purpose Provides a container to manage multiple resizable panels, either horizontally or vertically.
 * 
 * @param {object} props - Props passed to the panel group.
 * @param {string} [props.className] - Additional Tailwind class names for styling.
 * @param {React.ComponentProps<typeof ResizablePrimitive.PanelGroup>} props - Other props forwarded to Radix PanelGroup.
 * @returns {JSX.Element} Rendered panel group.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <ResizablePanelGroup direction="horizontal">
 *   <ResizablePanel>Left</ResizablePanel>
 *   <ResizableHandle withHandle />
 *   <ResizablePanel>Right</ResizablePanel>
 * </ResizablePanelGroup>
 */
const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
)

/**
 * ResizablePanel component.
 *
 * @purpose Represents a single resizable panel within a ResizablePanelGroup.
 * 
 * @param {object} props - Props forwarded to the panel.
 * @param {React.ComponentProps<typeof ResizablePrimitive.Panel>} props - Other props passed to Radix Panel.
 * @returns {JSX.Element} Rendered panel.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <ResizablePanel>Content</ResizablePanel>
 */
const ResizablePanel = ResizablePrimitive.Panel


/**
 * ResizableHandle component.
 *
 * @purpose Provides a handle to resize adjacent panels. Can optionally display a grip icon.
 * 
 * @param {object} props - Props for the handle.
 * @param {boolean} [props.withHandle=false] - Whether to display a visual grip handle.
 * @param {string} [props.className] - Additional Tailwind class names for styling.
 * @param {React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle>} props - Other props forwarded to Radix PanelResizeHandle.
 * @returns {JSX.Element} Rendered resize handle.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <ResizableHandle withHandle />
 */
const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
