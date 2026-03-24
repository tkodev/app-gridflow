'use client'

import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { PostMedia } from '@/types/post'
import { Icon } from '@/components/atoms/icon'
import { useMediaCarousel } from '@/hooks/use-media-carousel'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('relative overflow-hidden bg-black', {
    variants: {
      aspectRatio: {
        portrait: 'aspect-4/5',
        square: 'aspect-square'
      }
    },
    defaultVariants: {
      aspectRatio: 'portrait'
    }
  }),
  empty: cva('bg-muted relative flex items-center justify-center', {
    variants: {
      aspectRatio: {
        portrait: 'aspect-4/5',
        square: 'aspect-square'
      }
    },
    defaultVariants: {
      aspectRatio: 'portrait'
    }
  }),
  emptyLabel: cva('text-muted-foreground'),
  track: cva('flex h-full transition-transform duration-300 ease-out'),
  slide: cva('relative size-full shrink-0'),
  video: cva('size-full object-cover'),
  image: cva('object-cover'),
  navButton: cva(
    'absolute top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-opacity hover:bg-black/70'
  ),
  navButtonPrev: cva('left-2'),
  navButtonNext: cva('right-2'),
  dots: cva('absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5'),
  dot: cva('h-1.5 rounded-full transition-all', {
    variants: {
      active: {
        true: 'w-2.5 bg-white',
        false: 'w-1.5 bg-white/50 hover:bg-white/75'
      }
    },
    defaultVariants: {
      active: false
    }
  }),
  counter: cva(
    'absolute top-3 right-3 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white backdrop-blur-sm'
  )
}

// 2. types
type PostMediaCarouselProps = React.ComponentProps<'div'> &
  VariantProps<typeof styles.root> & {
    media: PostMedia[]
    aspectRatio?: 'square' | 'portrait'
    isActive?: boolean
    showControls?: boolean
  }

// 3. component
const PostMediaCarousel: React.FC<PostMediaCarouselProps> = (props) => {
  // a. props
  const {
    media,
    aspectRatio = 'portrait',
    isActive = true,
    showControls = true,
    className,
    ...rest
  } = props

  // b. hooks
  const { index, setIndex, goToPrevious, goToNext, setVideoRef } = useMediaCarousel({
    itemCount: media.length,
    isActive
  })

  // c. logic
  if (media.length === 0) {
    return (
      <div className={cn(styles.empty({ aspectRatio, className }))} {...rest}>
        <span className={styles.emptyLabel()}>No media</span>
      </div>
    )
  }

  const hasMultiple = media.length > 1
  const atStart = index <= 0
  const atEnd = index >= media.length - 1

  // d. component
  return (
    <div className={cn(styles.root({ aspectRatio, className }))} {...rest}>
      <div className={styles.track()} style={{ transform: `translateX(-${index * 100}%)` }}>
        {media.map((item, slideIndex) => (
          <div key={item.id} className={styles.slide()}>
            {item.media_type === 'video' ? (
              <video
                ref={(el) => {
                  setVideoRef(slideIndex, el)
                }}
                className={styles.video()}
                src={item.media_url}
                loop
                muted
                playsInline
              />
            ) : (
              <Image
                className={styles.image()}
                sizes="(max-width: 768px) 100vw, 28rem"
                alt=""
                src={item.media_url}
                fill
              />
            )}
          </div>
        ))}
      </div>

      {showControls && hasMultiple && (
        <>
          {!atStart && (
            <button
              className={cn(styles.navButton(), styles.navButtonPrev())}
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
            >
              <Icon icon={ChevronLeft} size="md" />
            </button>
          )}
          {!atEnd && (
            <button
              className={cn(styles.navButton(), styles.navButtonNext())}
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
            >
              <Icon icon={ChevronRight} size="md" />
            </button>
          )}
        </>
      )}

      {showControls && hasMultiple && (
        <div className={styles.dots()}>
          {media.map((_, dotIndex) => (
            <button
              key={dotIndex}
              className={styles.dot({ active: dotIndex === index })}
              aria-label={`Go to slide ${dotIndex + 1}`}
              onClick={(e) => {
                e.stopPropagation()
                setIndex(dotIndex)
              }}
            />
          ))}
        </div>
      )}

      {hasMultiple && (
        <div className={styles.counter()}>
          {index + 1}/{media.length}
        </div>
      )}
    </div>
  )
}

// 4. exports
export type { PostMediaCarouselProps }
export { PostMediaCarousel }
