"use client"

import { useState, useEffect, useRef } from "react"

interface UseScrollAnimationOptions {
  /**
   * The threshold value between 0 and 1 indicating the percentage that should be
   * visible before triggering the animation.
   * A value of 0 means as soon as even one pixel is visible, the callback will be run.
   * A value of 1.0 means the entire element must be visible before the callback runs.
   */
  threshold?: number

  /**
   * Root margin in pixels or percentage, similar to CSS margin property.
   * This set of values serves to grow or shrink each side of the root element's
   * bounding box before computing intersections.
   */
  rootMargin?: string

  /**
   * Whether to trigger the animation only once.
   */
  triggerOnce?: boolean
}

/**
 * A hook that detects when an element is visible in the viewport
 * and returns a ref and a boolean indicating if the element is in view.
 */
export function useScrollAnimation({
  threshold = 0.2,
  rootMargin = "0px",
  triggerOnce = true,
}: UseScrollAnimationOptions = {}) {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // If the element ref hasn't been set yet, return early
    if (!ref.current) return

    const currentRef = ref.current

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update state when the element enters the viewport
        if (entry.isIntersecting) {
          setIsInView(true)

          // If triggerOnce is true, disconnect the observer after triggering
          if (triggerOnce) {
            observer.disconnect()
          }
        } else if (!triggerOnce) {
          // If triggerOnce is false, set isInView to false when element leaves viewport
          setIsInView(false)
        }
      },
      {
        threshold,
        rootMargin,
      },
    )

    observer.observe(currentRef)

    return () => {
      observer.unobserve(currentRef)
    }
  }, [threshold, rootMargin, triggerOnce])

  return { ref, isInView }
}
