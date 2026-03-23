import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  wrapper: cva('relative w-full overflow-auto'),
  table: cva('w-full caption-bottom text-sm'),
  header: cva('[&_tr]:border-b'),
  body: cva('[&_tr:last-child]:border-0'),
  footer: cva('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0'),
  row: cva('hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors'),
  head: cva(
    'text-muted-foreground h-12 px-4 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0'
  ),
  cell: cva('p-4 align-middle [&:has([role=checkbox])]:pr-0'),
  caption: cva('text-muted-foreground mt-4 text-sm')
}

// 2. types
type TableProps = React.HTMLAttributes<HTMLTableElement> & VariantProps<typeof styles.table>
type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement> &
  VariantProps<typeof styles.header>
type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement> &
  VariantProps<typeof styles.body>
type TableFooterProps = React.HTMLAttributes<HTMLTableSectionElement> &
  VariantProps<typeof styles.footer>
type TableRowProps = React.HTMLAttributes<HTMLTableRowElement> & VariantProps<typeof styles.row>
type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement> &
  VariantProps<typeof styles.head>
type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> &
  VariantProps<typeof styles.cell>
type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement> &
  VariantProps<typeof styles.caption>

// 3. component
const Table = React.forwardRef<HTMLTableElement, TableProps>(({ className, ...props }, ref) => (
  <div className={styles.wrapper()}>
    <table ref={ref} className={cn(styles.table({ className }))} {...props} />
  </div>
))
Table.displayName = 'Table'

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn(styles.header({ className }))} {...props} />
  )
)
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn(styles.body({ className }))} {...props} />
  )
)
TableBody.displayName = 'TableBody'

const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn(styles.footer({ className }))} {...props} />
  )
)
TableFooter.displayName = 'TableFooter'

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn(styles.row({ className }))} {...props} />
  )
)
TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => (
    <th ref={ref} className={cn(styles.head({ className }))} {...props} />
  )
)
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn(styles.cell({ className }))} {...props} />
  )
)
TableCell.displayName = 'TableCell'

const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn(styles.caption({ className }))} {...props} />
  )
)
TableCaption.displayName = 'TableCaption'

// 4. exports
export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow }
