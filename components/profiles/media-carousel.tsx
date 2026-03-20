"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostMedia } from "@/types/post";

interface MediaCarouselProps {
  media: PostMedia[];
  aspectRatio?: "square" | "portrait";
  isActive?: boolean; // Controls video autoplay
  showControls?: boolean;
  className?: string;
}

export function MediaCarousel({
  media,
  aspectRatio = "portrait",
  isActive = true,
  showControls = true,
  className,
}: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

  // Sort media by position
  const sortedMedia = [...media].sort((a, b) => a.position - b.position);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? sortedMedia.length - 1 : prev - 1));
  }, [sortedMedia.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === sortedMedia.length - 1 ? 0 : prev + 1));
  }, [sortedMedia.length]);

  // Handle video autoplay based on active state and current index
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (isActive && index === currentIndex) {
          video.play().catch(() => {
            // Autoplay may be blocked by browser
          });
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [isActive, currentIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      videoRefs.current.forEach((video) => {
        if (video) {
          video.pause();
        }
      });
    };
  }, []);

  if (sortedMedia.length === 0) {
    return (
      <div
        className={cn(
          "relative bg-muted flex items-center justify-center",
          aspectRatio === "portrait" ? "aspect-[4/5]" : "aspect-square",
          className
        )}
      >
        <span className="text-muted-foreground">No media</span>
      </div>
    );
  }

  const currentMedia = sortedMedia[currentIndex];
  const hasMultiple = sortedMedia.length > 1;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-black",
        aspectRatio === "portrait" ? "aspect-[4/5]" : "aspect-square",
        className
      )}
    >
      {/* Media items */}
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {sortedMedia.map((item, index) => (
          <div key={item.id} className="h-full w-full flex-shrink-0">
            {item.media_type === "video" ? (
              <video
                ref={(el) => {
                  if (el) videoRefs.current.set(index, el);
                }}
                src={item.media_url}
                className="h-full w-full object-cover"
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={item.media_url}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {showControls && hasMultiple && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-opacity hover:bg-black/70"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-opacity hover:bg-black/70"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {showControls && hasMultiple && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {sortedMedia.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all",
                index === currentIndex
                  ? "bg-white w-2.5"
                  : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Multiple media indicator (top right) */}
      {hasMultiple && (
        <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
          {currentIndex + 1}/{sortedMedia.length}
        </div>
      )}
    </div>
  );
}
