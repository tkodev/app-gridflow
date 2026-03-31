'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { Switch } from '@/components/atoms/switch'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('space-y-3'),
  toggleRow: cva('flex items-center justify-between'),
  toggleText: cva('flex flex-col gap-0.5'),
  toggleLabel: cva('text-sm font-medium'),
  toggleHint: cva('text-muted-foreground text-xs'),
  dateTimeRow: cva('grid grid-cols-2 gap-2')
}

// 2. types
type SchedulePickerProps = {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  date: string
  onDateChange: (date: string) => void
  time: string
  onTimeChange: (time: string) => void
  disabled?: boolean
  className?: string
} & VariantProps<typeof styles.root>

// 3. component
const SchedulePicker: React.FC<SchedulePickerProps> = (props) => {
  // a. props
  const { enabled, onEnabledChange, date, onDateChange, time, onTimeChange, disabled, className } =
    props

  // d. component
  return (
    <div className={cn(styles.root({ className }))}>
      <div className={styles.toggleRow()}>
        <div className={styles.toggleText()}>
          <Label className={styles.toggleLabel()}>Schedule Post</Label>
          <p className={styles.toggleHint()}>Choose a future publishing time</p>
        </div>
        <Switch checked={enabled} onCheckedChange={onEnabledChange} disabled={disabled} />
      </div>
      {enabled ? (
        <div className={styles.dateTimeRow()}>
          <div>
            <Label htmlFor="schedule-date">Date</Label>
            <Input
              id="schedule-date"
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              disabled={disabled}
            />
          </div>
          <div>
            <Label htmlFor="schedule-time">Time</Label>
            <Input
              id="schedule-time"
              type="time"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

// 4. exports
export type { SchedulePickerProps }
export { SchedulePicker }
