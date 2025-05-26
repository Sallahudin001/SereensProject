"use client"

import { useInView } from "framer-motion"
import { useRef } from "react"

type ScrollAnimationProps = {
  threshold?: number
  once?: boolean
  margin?: string
}

export function useScrollAnimation({ threshold = 0.2, once = true, margin = "-100px 0px" }: ScrollAnimationProps = {}) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once,
    amount: threshold,
    margin,
  })

  return { ref, isInView }
}
