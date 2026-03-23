'use client'

import { MoreHorizontal, Music, X } from 'lucide-react'
import * as React from 'react'
import { useCallback, useRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { useInView } from 'framer-motion'
import type { Post, PostMedia } from '@/types/post'
import type { Profile } from '@/types/profile'
import { Status } from '@/components/atoms/status'
import { PostMediaCarousel } from '@/components/molecules/post-media-carousel'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar'
import { Button } from '@/components/atoms/button'
import { Icon } from '@/components/atoms/icon'
import { getPostDateLabel } from '@/utils/post-dates'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva(''),
  header: cva('flex items-center gap-3 p-3'),
  avatar: cva('h-8 w-8'),
  avatarFallback: cva('text-xs'),
  headerMeta: cva('min-w-0 flex-1'),
  username: cva('truncate text-sm font-semibold'),
  subtitleRow: cva('text-muted-foreground flex items-center gap-1 text-xs'),
  subtitleText: cva('truncate'),
  toolbarButton: cva('h-8 w-8 shrink-0'),
  srOnly: cva('sr-only'),
  footer: cva('flex flex-col gap-3 p-3'),
  captionBlock: cva(''),
  captionText: cva('text-sm'),
  captionUser: cva('mr-1.5 font-semibold'),
  captionBody: cva('text-foreground/90'),
  metaRow: cva('flex flex-wrap items-center gap-x-2 gap-y-1'),
  dateLabel: cva('text-muted-foreground text-[10px] tracking-wide uppercase')
}

// 2. types
type PostPreviewItemProps = VariantProps<typeof styles.root> & {
  post: Post
  profile: Profile
  onEditClick: (post: Post) => void
  onClose?: () => void
  /** When set, overrides scroll-based visibility for video autoplay */
  isActive?: boolean
  as?: 'article' | 'div'
  className?: string
}

// 3. component
const PostPreviewItem = React.forwardRef<HTMLElement, PostPreviewItemProps>(
  function PostPreviewItem(props, ref) {
    // a. props
    const {
      post,
      profile,
      onEditClick,
      onClose,
      isActive: isActiveProp,
      as: Root = 'div',
      className,
      ...rest
    } = props

    // b. hooks
    const innerRef = useRef<HTMLElement | null>(null)
    const isInView = useInView(innerRef, { amount: 0.6 })
    const isActive = isActiveProp !== undefined ? isActiveProp : isInView

    const setRef = useCallback(
      (node: HTMLElement | null) => {
        innerRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ;(ref as React.MutableRefObject<HTMLElement | null>).current = node
        }
      },
      [ref]
    )

    // c. logic
    const dateLabel = getPostDateLabel(post)

    const media: PostMedia[] = post.media

    // d. component
    return (
      <Root
        ref={setRef as React.Ref<HTMLDivElement> & React.Ref<HTMLElement>}
        className={cn(styles.root({ className }))}
        {...rest}
      >
        <div className={styles.header()}>
          <Avatar className={styles.avatar()}>
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className={styles.avatarFallback()}>
              {profile.username[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className={styles.headerMeta()}>
            <p className={styles.username()}>{profile.username}</p>
            {post.subtitle && (
              <div className={styles.subtitleRow()}>
                <Icon icon={Music} size="sm" />
                <span className={styles.subtitleText()}>{post.subtitle}</span>
              </div>
            )}
          </div>
          <Button
            type="button"
            className={styles.toolbarButton()}
            size="icon"
            variant="ghost"
            onClick={() => onEditClick(post)}
          >
            <Icon icon={MoreHorizontal} size="md" />
            <span className={styles.srOnly()}>Edit post</span>
          </Button>
          {onClose && (
            <Button
              type="button"
              className={styles.toolbarButton()}
              size="icon"
              variant="ghost"
              onClick={onClose}
            >
              <Icon icon={X} size="sm" />
              <span className={styles.srOnly()}>Close</span>
            </Button>
          )}
        </div>

        <PostMediaCarousel
          aspectRatio="portrait"
          isActive={isActive}
          media={media}
          showControls={true}
        />

        <div className={styles.footer()}>
          {post.caption && (
            <div className={styles.captionBlock()}>
              <p className={styles.captionText()}>
                <span className={styles.captionUser()}>{profile.username}</span>
                <span className={styles.captionBody()}>{post.caption}</span>
              </p>
            </div>
          )}
          <div className={styles.metaRow()}>
            <span className={styles.dateLabel()}>{dateLabel}</span>
            <Status status={post.status} />
          </div>
        </div>
      </Root>
    )
  }
)
PostPreviewItem.displayName = 'PostPreviewItem'

// 4. exports
export { PostPreviewItem }
