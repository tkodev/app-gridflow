'use client'

import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import * as React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { PostMedia } from '@/types/post'
import { cn } from '@/utils/tailwind'

type PostMediaCarouselProps = {
  /** Ordered by `position` ascending (same contract as `Post.media`). */
  media: PostMedia[]
  aspectRatio?: 'square' | 'portrait'
  isActive?: boolean // Controls video autoplay
  showControls?: boolean
  className?: string
}

export const PostMediaCarousel = ({
  media,
  aspectRatio = 'portrait',
  isActive = true,
  showControls = true,
  className
}: PostMediaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map())

  const maxIndex = Math.max(0, media.length - 1)
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

  // Handle video autoplay based on active state and current index
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

  // Cleanup on unmount
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

  if (media.length === 0) {
    return (
      <div
        className={cn(
          'bg-muted relative flex items-center justify-center',
          aspectRatio === 'portrait' ? 'aspect-[4/5]' : 'aspect-square',
          className
        )}
      >
        <span className="text-muted-foreground">No media</span>
      </div>
    )
  }

  const hasMultiple = media.length > 1
  const atStart = index <= 0
  const atEnd = index >= media.length - 1

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-black',
        aspectRatio === 'portrait' ? 'aspect-[4/5]' : 'aspect-square',
        className
      )}
    >
      {/* Media items */}
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {media.map((item, index) => (
          <div key={item.id} className="relative h-full w-full flex-shrink-0">
            {item.media_type === 'video' ? (
              <video
                ref={(el) => {
                  if (el) videoRefs.current.set(index, el)
                }}
                className="h-full w-full object-cover"
                src={item.media_url}
                loop
                muted
                playsInline
              />
            ) : (
              <Image
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 28rem"
                alt=""
                src={item.media_url}
                fill
              />
            )}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {showControls && hasMultiple && (
        <>
          {!atStart && (
            <button
              className="absolute top-1/2 left-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-opacity hover:bg-black/70"
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {!atEnd && (
            <button
              className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-opacity hover:bg-black/70"
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </>
      )}

      {/* Dots indicator */}
      {showControls && hasMultiple && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {media.map((_, dotIndex) => (
            <button
              key={dotIndex}
              className={cn(
                'h-1.5 w-1.5 rounded-full transition-all',
                dotIndex === index ? 'w-2.5 bg-white' : 'bg-white/50 hover:bg-white/75'
              )}
              aria-label={`Go to slide ${dotIndex + 1}`}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(dotIndex)
              }}
            />
          ))}
        </div>
      )}

      {/* Multiple media indicator (top right) */}
      {hasMultiple && (
        <div className="absolute top-3 right-3 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
          {index + 1}/{media.length}
        </div>
      )}
    </div>
  )
}
