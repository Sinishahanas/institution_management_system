import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

/**
 * AspectRatio Component
 *
 * @purpose
 * - Maintains a consistent width-to-height ratio for its child content.
 * - Useful for images, videos, or any content that needs a consistent width-to-height ratio.
 * 
 * @param {AspectRatioPrimitive.AspectRatioProps} props - Radix AspectRatio props.
 * @returns {JSX.Element} Rendered container maintaining the specified aspect ratio.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <AspectRatio ratio={16 / 9}>
 *   <img src="video-thumbnail.jpg" alt="Video Thumbnail" />
 * </AspectRatio>
 */
const AspectRatio = AspectRatioPrimitive.Root

export { AspectRatio }
