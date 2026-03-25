'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type UseMediaCarouselArgs = {
  itemCount: number
  isActive: boolean
}

/**
 * Carousel slide index, navigation, and video play/pause when the active slide changes.
 */
function useMediaCarousel({ itemCount, isActive }: UseMediaCarouselArgs): {
  index: number
  setIndex: (next: number) => void
  goToPrevious: () => void
  goToNext: () => void
  setVideoRef: (slideIndex: number, el: HTMLVideoElement | null) => void
} {
  const [currentIndex, setCurrentIndex] = useState(0)
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map())

  const maxIndex = Math.max(0, itemCount - 1)
  const index = Math.min(currentIndex, maxIndex)

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => {
      const clamped = Math.min(prev, maxIndex)
      return Math.max(0, clamped - 1)
    })
  }, [maxIndex])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const clamped = Math.min(prev, maxIndex)
      return Math.min(maxIndex, clamped + 1)
    })
  }, [maxIndex])

  const setIndex = useCallback((next: number) => {
    setCurrentIndex(next)
  }, [])

  const setVideoRef = useCallback((slideIndex: number, el: HTMLVideoElement | null) => {
    if (el) {
      videoRefs.current.set(slideIndex, el)
    } else {
      videoRefs.current.delete(slideIndex)
    }
  }, [])

  useEffect(() => {
    const refs = videoRefs.current
    refs.forEach((video, slideIndex) => {
      if (video) {
        if (isActive && slideIndex === index) {
          video.play().catch(() => {
            // Autoplay may be blocked by browser
          })
        } else {
          video.pause()
          video.currentTime = 0
        }
      }
    })
  }, [isActive, index])

  useEffect(() => {
    const refs = videoRefs.current
    return () => {
      refs.forEach((video) => {
        if (video) {
          video.pause()
        }
      })
    }
  }, [])

  return {
    index,
    setIndex,
    goToPrevious,
    goToNext,
    setVideoRef
  }
}

export { useMediaCarousel }
