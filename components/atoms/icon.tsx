'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Copy,
  CreditCard,
  Eye,
  Filter,
  FolderPlus,
  Grid3X3,
  Image as ImageIcon,
  ImagePlus,
  Key,
  Layers,
  LayoutGrid,
  Lightbulb,
  List,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  MoreHorizontal,
  MoveVertical,
  Music,
  Palette,
  Pencil,
  Play,
  Plus,
  Settings,
  Share2,
  Sparkles,
  Sun,
  Tags,
  Trash2,
  Upload,
  UserCircle,
  UserPlus,
  UserRound,
  X,
  Zap
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const icons = {
  alertCircle: AlertCircle,
  alertTriangle: AlertTriangle,
  arrowRight: ArrowRight,
  barChart3: BarChart3,
  camera: Camera,
  check: Check,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  circle: Circle,
  copy: Copy,
  creditCard: CreditCard,
  eye: Eye,
  filter: Filter,
  folderPlus: FolderPlus,
  grid3x3: Grid3X3,
  image: ImageIcon,
  imagePlus: ImagePlus,
  key: Key,
  layers: Layers,
  layoutGrid: LayoutGrid,
  lightbulb: Lightbulb,
  list: List,
  logIn: LogIn,
  logOut: LogOut,
  mail: Mail,
  mapPin: MapPin,
  moreHorizontal: MoreHorizontal,
  moveVertical: MoveVertical,
  music: Music,
  palette: Palette,
  pencil: Pencil,
  play: Play,
  plus: Plus,
  settings: Settings,
  share2: Share2,
  sparkles: Sparkles,
  sun: Sun,
  tags: Tags,
  trash2: Trash2,
  upload: Upload,
  userCircle: UserCircle,
  userPlus: UserPlus,
  userRound: UserRound,
  x: X,
  zap: Zap
} as const satisfies Record<string, LucideIcon>

const styles = {
  root: cva('shrink-0', {
    variants: {
      size: {
        xs: 'size-2',
        sm: 'size-4',
        md: 'size-6',
        lg: 'size-8',
        xl: 'size-12'
      },
      tone: {
        default: '',
        muted: 'text-muted-foreground',
        destructive: 'text-destructive',
        inverse: 'text-white',
        inverseElevated: 'text-white drop-shadow-md'
      }
    },
    defaultVariants: {
      size: 'md',
      tone: 'default'
    }
  })
}

// 2. types
type IconName = keyof typeof icons
type IconProps = VariantProps<typeof styles.root> &
  Omit<React.ComponentPropsWithoutRef<LucideIcon>, 'size'> & {
    name: IconName
  }

// 3. component
const Icon = React.forwardRef<SVGSVGElement, IconProps>(function Icon(props, ref) {
  const {
    name,
    size = 'sm',
    tone = 'default',
    className,
    'aria-hidden': ariaHidden,
    ...rest
  } = props

  const IconComponent = icons[name]

  return (
    <IconComponent
      ref={ref}
      className={cn(styles.root({ size, tone }), className)}
      aria-hidden={ariaHidden ?? true}
      {...rest}
    />
  )
})
Icon.displayName = 'Icon'

// 4. exports
export type { IconName, IconProps }
export { Icon }
