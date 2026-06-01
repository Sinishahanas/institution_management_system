import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"


/**
 * CarouselApi
 *
 * Type alias for the Embla Carousel API instance.
 */
type CarouselApi = UseEmblaCarouselType[1]

/**
 * UseCarouselParameters
 * 
 * Type for parameters passed to useEmblaCarousel hook.
 */
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>

/**
 * CarouselOptions
 * 
 * Carousel configuration options passed to useEmblaCarousel.
 */
type CarouselOptions = UseCarouselParameters[0]

/**
 * CarouselPlugin
 * 
 * Optional plugins for Embla carousel functionality.
 */
type CarouselPlugin = UseCarouselParameters[1]


/**
 * CarouselProps
 *
 * @purpose 
 * - Props for the main Carousel component.
 *
 * @property {CarouselOptions} [opts] - Options passed to the Embla carousel instance.
 * @property {CarouselPlugin} [plugins] - Plugins to enhance Embla functionality.
 * @property {"horizontal" | "vertical"} [orientation] - Carousel scroll direction.
 * @property {(api: CarouselApi) => void} [setApi] - Callback to receive Embla API instance.
 */
type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}


/**
 * CarouselContextProps - Internal context values shared across Carousel components.
 *
 * @property {ReturnType<typeof useEmblaCarousel>[0]} carouselRef - Ref for Embla viewport.
 * @property {CarouselApi} api - Embla API instance.
 * @property {() => void} scrollPrev - Scroll to previous slide.
 * @property {() => void} scrollNext - Scroll to next slide.
 * @property {boolean} canScrollPrev - Indicates if previous slide exists.
 * @property {boolean} canScrollNext - Indicates if next slide exists.
 * @extends CarouselProps
 */
type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)


/**
 * useCarousel
 *
 * @purpose Hook to access carousel context.
 *
 * @param None
 * @returns {CarouselContextProps} Carousel context object.
 * @throws If used outside a <Carousel /> provider
 * @sideEffects None
 * 
 * @example
 * const { api, scrollPrev, scrollNext } = useCarousel()
 */
function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

/**
 * Carousel
 *
 * @purpose 
 * - Main carousel wrapper component.
 * - Initializes Embla carousel, provides context to child components,
 * - Supports horizontal or vertical scrolling, keyboard navigation, and API access.
 *
 * @param {React.HTMLAttributes<HTMLDivElement> & CarouselProps} props - Props for the component.
 * @param {React.Ref<HTMLDivElement>} ref - Ref forwarded to the root div.
 * @returns {JSX.Element} Carousel provider and wrapper.
 * @throws If used outside a <Carousel /> provider
 * @sideEffects Initializes Embla carousel, attaches event listeners, provides context.
 * 
 * @example
 * <Carousel>
 *   <CarouselContent>
 *     <CarouselItem>Slide 1</CarouselItem>
 *     <CarouselItem>Slide 2</CarouselItem>
 *     <CarouselItem>Slide 3</CarouselItem>
 *   </CarouselContent>
 * </Carousel>
 */
const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)

    // Update prev/next button availability
    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return
      }

      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }, [])

    // Scroll controls
    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    // Keyboard navigation
    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    //Provide API instance via callback
    React.useEffect(() => {
      if (!api || !setApi) {
        return
      }

      setApi(api)
    }, [api, setApi])

    //Attach event listeners
    React.useEffect(() => {
      if (!api) {
        return
      }

      onSelect(api)
      api.on("reInit", onSelect)
      api.on("select", onSelect)

      return () => {
        api?.off("select", onSelect)
      }
    }, [api, onSelect])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

/**
 * CarouselContent
 *
 * @purpose 
 * - Wrapper for carousel slides.
 * - Applies Embla viewport and flex layout based on orientation.
 * 
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Props forwarded to the inner flex container.
 * @param {React.Ref<HTMLDivElement>} ref - Ref forwarded to the inner container.
 * @returns {JSX.Element} Carousel viewport with slide content.
 * @throws If used outside a <Carousel /> provider
 * @sideEffects None
 * 
 * @example
 * <Carousel>
 *   <CarouselContent>
 *     <CarouselItem>Slide 1</CarouselItem>
 *     <CarouselItem>Slide 2</CarouselItem>
 *     <CarouselItem>Slide 3</CarouselItem>
 *   </CarouselContent>
 * </Carousel>
 */
const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

/**
 * CarouselItem
 *
 * @purpose 
 * - Individual carousel slide item.
 * - Adjusts spacing depending on orientation, supports accessibility roles.
 * 
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Props forwarded to the slide container.
 * @param {React.Ref<HTMLDivElement>} ref - Ref forwarded to the slide div.
 * @returns {JSX.Element} Single carousel slide.
 * @throws If used outside a <Carousel /> provider
 * @sideEffects None
 * 
 * @example
 * <Carousel>
 *   <CarouselContent>
 *     <CarouselItem>Slide 1</CarouselItem>
 *     <CarouselItem>Slide 2</CarouselItem>
 *     <CarouselItem>Slide 3</CarouselItem>
 *   </CarouselContent>
 * </Carousel>
 */
const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"


/**
 * CarouselPrevious
 *
 * @purpose 
 * - Button to scroll to the previous slide.
 * - Uses Embla API to navigate and disables when no previous slide exists.
 * 
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Props forwarded to the slide container.
 * @param {React.Ref<HTMLDivElement>} ref - Ref forwarded to the slide div.
 * @returns {JSX.Element} Single carousel slide.
 * @throws If used outside a <Carousel /> provider
 * @sideEffects None
 * 
 * @example
 * <Carousel>
 *   <CarouselContent>
 *     <CarouselItem>Slide 1</CarouselItem>
 *     <CarouselItem>Slide 2</CarouselItem>
 *     <CarouselItem>Slide 3</CarouselItem>
 *   </CarouselContent>
 * </Carousel>
 */
const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute  h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"


/**
 * CarouselNext
 *
 * @purpose 
 * - Button to scroll to the next slide.
 * - Uses Embla API to navigate and disables when no next slide exists.
 * 
 * @param {React.ComponentProps<typeof Button>} props - Props forwarded to the Button component.
 * @param {React.Ref<HTMLButtonElement>} ref - Ref forwarded to the button.
 * @returns {JSX.Element} Button to navigate to next slide.
 * @throws If used outside a <Carousel /> provider
 * @sideEffects Uses Embla API to scroll and disables button if no next slide exists.
 * 
 * @example
 * <Carousel>
 *   <CarouselContent>
 *     <CarouselItem>Slide 1</CarouselItem>
 *     <CarouselItem>Slide 2</CarouselItem>
 *     <CarouselItem>Slide 3</CarouselItem>
 *   </CarouselContent>
 * </Carousel>
 */
const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
