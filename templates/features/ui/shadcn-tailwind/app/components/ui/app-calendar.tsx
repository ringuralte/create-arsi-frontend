import type {
  MonthChangeEventHandler,
} from 'react-day-picker'
import { format } from 'date-fns'
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
import {
  DayPicker,
  getDefaultClassNames,
} from 'react-day-picker'
import { Button, buttonVariants } from '~/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { cn } from '~/lib/utils'
import { MonthPicker } from './month-picker'

interface Props {
  buttonClassName?: string
  className?: string
  variant?: 'link'
  closeSheet?: () => void
}

export default function AppCalendar({
  className,
  buttonClassName,
  variant,
  closeSheet,
}: Props) {
  const [openCalendar, setOpenCalendar] = useState(false)
  const [date, setDate] = useQueryState('date')
  const [month, setMonth] = useState<Date>(() => new Date())
  const [mode, setMode] = useState<'month' | 'date'>('date')

  const calendarDate = date ? new Date(date) : new Date()

  const defaultClassNames = getDefaultClassNames()

  const handleMonthChange: MonthChangeEventHandler = (month) => {
    setMonth(month)
    if (mode === 'month') {
      setMode('date')
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd')
      setDate(formattedDate)
    }
    else {
      setDate(null)
    }
    setOpenCalendar(false)
    closeSheet && closeSheet()
  }

  useEffect(() => {
    if (calendarDate) {
      setMonth(calendarDate)
    }
  }, [])

  return (
    <Popover modal={true} open={openCalendar} onOpenChange={setOpenCalendar}>
      <PopoverTrigger asChild>
        <Button
          variant={variant ? 'link' : 'outline'}
          className={cn(
            `
              h-5/6 w-full justify-center text-left text-xs font-normal
              text-black
            `,
            !date && 'text-muted-foreground',
            buttonClassName,
          )}
        >
          {calendarDate
            ? (
                <>
                  <span className={`
                    hidden
                    lg:block
                  `}
                  >
                    {format(calendarDate, 'do MMMM yyyy')}
                  </span>
                  <span className="lg:hidden">
                    {format(calendarDate, 'do MMM yyyy')}
                  </span>
                </>
              )
            : (
                <span>Pick a date</span>
              )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        {mode === 'date'
          ? (
              <DayPicker
                // navLayout="around"
                showOutsideDays={false}
                mode="single"
                selected={calendarDate}
                onSelect={handleDateSelect}
                month={month}
                modifiers={{
                  disabled: [
                    { before: new Date('2015-01-01') },
                    { after: new Date() },
                  ],
                }}
                onMonthChange={handleMonthChange}
                className={cn('p-1', className)}
                classNames={{
                  months:
                'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                  month: 'space-y-4 flex flex-col w-full',
                  caption_label: 'text-sm font-medium',
                  nav: cn(
                    `
                      pointer-events-none absolute inset-x-0 top-0 flex w-full
                      items-center justify-between gap-1
                    `,
                    defaultClassNames.nav,
                  ),
                  button_previous: cn(
                    buttonVariants({ variant: 'outline' }),
                    `
                      pointer-events-auto m-1 h-7 w-7 bg-transparent p-0
                      text-black select-none
                      aria-disabled:opacity-50
                    `,
                    defaultClassNames.button_previous,
                  ),
                  button_next: cn(
                    buttonVariants({ variant: 'outline' }),
                    `
                      pointer-events-auto m-1 h-7 w-7 bg-transparent p-0
                      text-black select-none
                      aria-disabled:opacity-50
                    `,
                    defaultClassNames.button_next,
                  ),
                  month_caption: cn(
                    `
                      flex h-[--cell-size] w-full items-center justify-center
                      px-[--cell-size]
                    `,
                    defaultClassNames.month_caption,
                  ),
                  month_grid: 'w-full border-collapse space-y-1',
                  weekdays: 'flex',
                  weekday:
                'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                  week: 'flex w-full mt-2',
                  day: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                  day_button: cn(
                    buttonVariants({ variant: 'ghost' }),
                    `
                      h-9 w-9 p-0 font-normal
                      aria-selected:opacity-100
                    `,
                  ),
                  range_end: 'day-range-end',
                  selected:
                'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md',
                  today: 'bg-accent text-accent-foreground',
                  outside:
                'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
                  disabled: 'text-muted-foreground opacity-50',
                  range_middle:
                'aria-selected:bg-accent aria-selected:text-accent-foreground',
                  hidden: 'invisible',
                }}
                components={{
                  MonthCaption: ({ calendarMonth, ...props }) => {
                    return (
                      <div
                        role="button"
                        {...props}
                        className={cn(
                          `
                            flex h-7 w-full cursor-pointer items-center
                            justify-center rounded-md px-7
                          `,
                          defaultClassNames.month_caption,
                        )}
                        onClick={() => {
                          setMode('month')
                        }}
                      >
                        <span className="text-sm font-medium">
                          {format(calendarMonth.date, 'MMMM yyyy')}
                        </span>
                      </div>
                    )
                  },
                  NextMonthButton: props => (
                    <Button {...props}>
                      <ChevronRight className="size-4" />
                    </Button>
                  ),
                  PreviousMonthButton: props => (
                    <Button {...props}>
                      <ChevronLeft className="size-4" />
                    </Button>
                  ),
                }}
              />
            )
          : (
              <MonthPicker
                selectedMonth={month}
                onMonthSelect={handleMonthChange}
              />
            )}
      </PopoverContent>
    </Popover>
  )
}
