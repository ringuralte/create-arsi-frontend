import { ChevronLeft, ChevronRight } from 'lucide-react'
import * as React from 'react'
import { cn } from '~/lib/utils'
import { buttonVariants } from './button'
import { YearPicker } from './year-picker'

interface Month {
  number: number
  name: string
}

const MONTHS: Month[][] = [
  [
    { number: 0, name: 'Jan' },
    { number: 1, name: 'Feb' },
    { number: 2, name: 'Mar' },
    { number: 3, name: 'Apr' },
  ],
  [
    { number: 4, name: 'May' },
    { number: 5, name: 'Jun' },
    { number: 6, name: 'Jul' },
    { number: 7, name: 'Aug' },
  ],
  [
    { number: 8, name: 'Sep' },
    { number: 9, name: 'Oct' },
    { number: 10, name: 'Nov' },
    { number: 11, name: 'Dec' },
  ],
]

interface MonthCalProps {
  selectedMonth?: Date
  onMonthSelect?: (date: Date) => void
  onYearForward?: () => void
  onYearBackward?: () => void
  callbacks?: {
    yearLabel?: (year: number) => string
    monthLabel?: (month: Month) => string
  }
  variant?: {
    calendar?: {
      main?: ButtonVariant
      selected?: ButtonVariant
    }
    chevrons?: ButtonVariant
  }
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  onLabelClick?: () => void
  year: number
  setYear: React.Dispatch<React.SetStateAction<number>>
  menuYear: number
  setMenuYear: React.Dispatch<React.SetStateAction<number>>
}

type ButtonVariant
  = | 'default'
    | 'outline-solid'
    | 'ghost'
    | 'link'
    | 'destructive'
    | 'secondary'
    | null
    | undefined

function MonthPicker({
  onMonthSelect,
  selectedMonth,
  minDate,
  maxDate,
  disabledDates,
  callbacks,
  onYearBackward,
  onYearForward,
  variant,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & Partial<MonthCalProps>) {
  const [year, setYear] = React.useState<number>(
    selectedMonth?.getFullYear() ?? new Date().getFullYear(),
  )
  const [menuYear, setMenuYear] = React.useState<number>(year)
  const [mode, setMode] = React.useState<'month' | 'year'>('month')

  const handleLabelClick = () => {
    setMode('year')
  }

  const handleYearSelect = (year: number) => {
    setMenuYear(year)
    setMode('month')
  }

  return (
    <div className={cn('w-[200px] min-w-[200px] p-1', className)} {...props}>
      <div className={`
        flex flex-col space-y-4
        sm:flex-row sm:space-y-0 sm:space-x-4
      `}
      >
        <div className="w-full space-y-4">
          {mode === 'month'
            ? (
                <MonthCal
                  onMonthSelect={onMonthSelect}
                  callbacks={callbacks}
                  selectedMonth={selectedMonth}
                  onYearBackward={onYearBackward}
                  onYearForward={onYearForward}
                  variant={variant}
                  minDate={minDate}
                  maxDate={maxDate}
                  disabledDates={disabledDates}
                  onLabelClick={handleLabelClick}
                  year={year}
                  setYear={setYear}
                  menuYear={menuYear}
                  setMenuYear={setMenuYear}
                >
                </MonthCal>
              )
            : (
                <YearPicker
                  selectedYear={menuYear}
                  onYearSelect={handleYearSelect}
                  maxYear={new Date().getFullYear()}
                />
              )}
        </div>
      </div>
    </div>
  )
}

function MonthCal({
  selectedMonth,
  onMonthSelect,
  callbacks,
  variant,
  minDate,
  maxDate,
  disabledDates,
  onYearBackward,
  onYearForward,
  onLabelClick,
  year,
  setYear,
  menuYear,
  setMenuYear,
}: MonthCalProps) {
  const [month, setMonth] = React.useState<number>(
    selectedMonth?.getMonth() ?? new Date().getMonth(),
  )

  if (minDate && maxDate && minDate > maxDate)
    minDate = maxDate

  const disabledDatesMapped = disabledDates?.map((d) => {
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  return (
    <>
      <div className="relative flex items-center justify-center pt-1">
        <button onClick={onLabelClick} className="text-sm font-medium">
          {callbacks?.yearLabel ? callbacks?.yearLabel(menuYear) : menuYear}
        </button>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => {
              setMenuYear(menuYear - 1)
              if (onYearBackward)
                onYearBackward()
            }}
            className={cn(
              buttonVariants({ variant: variant?.chevrons ?? 'outline-solid' }),
              `
                absolute left-1 inline-flex h-7 w-7 items-center justify-center
                p-0
              `,
            )}
          >
            <ChevronLeft className="size-4 opacity-50" />
          </button>
          <button
            onClick={() => {
              setMenuYear(menuYear + 1)
              if (onYearForward)
                onYearForward()
            }}
            className={cn(
              buttonVariants({ variant: variant?.chevrons ?? 'outline-solid' }),
              `
                absolute right-1 inline-flex h-7 w-7 items-center justify-center
                p-0
              `,
            )}
          >
            <ChevronRight className="size-4 opacity-50" />
          </button>
        </div>
      </div>
      <table className="w-full border-collapse space-y-1">
        <tbody>
          {MONTHS.map((monthRow, a) => {
            return (
              <tr key={`row-${a}`} className="mt-2 flex w-full">
                {monthRow.map((m) => {
                  return (
                    <td
                      key={m.number}
                      className={`
                        relative h-10 w-1/4 p-0 text-center text-sm
                        focus-within:relative focus-within:z-20
                        [&:has([aria-selected])]:bg-accent
                        first:[&:has([aria-selected])]:rounded-l-md
                        last:[&:has([aria-selected])]:rounded-r-md
                        [&:has([aria-selected].day-outside)]:bg-accent/50
                        [&:has([aria-selected].day-range-end)]:rounded-r-md
                      `}
                    >
                      <button
                        onClick={() => {
                          setMonth(m.number)
                          setYear(menuYear)
                          if (onMonthSelect)
                            onMonthSelect(new Date(menuYear, m.number))
                        }}
                        disabled={
                          (maxDate
                            ? menuYear > maxDate?.getFullYear()
                            || (menuYear == maxDate?.getFullYear()
                              && m.number > maxDate.getMonth())
                            : false)
                          || (minDate
                            ? menuYear < minDate?.getFullYear()
                            || (menuYear == minDate?.getFullYear()
                              && m.number < minDate.getMonth())
                            : false)
                          || (disabledDatesMapped
                            ? disabledDatesMapped?.some(
                                d => d.year == menuYear && d.month == m.number,
                              )
                            : false)
                        }
                        className={cn(
                          buttonVariants({
                            variant:
                              month == m.number && menuYear == year
                                ? (variant?.calendar?.selected ?? 'default')
                                : (variant?.calendar?.main ?? 'ghost'),
                          }),
                          `
                            hover:bg-vanglaini-red/90 hover:text-white
                            h-full w-full p-0 font-normal
                            aria-selected:opacity-100
                          `,
                          {
                            'bg-vanglaini-red':
                              month == m.number && menuYear == year,
                          },
                        )}
                      >
                        {callbacks?.monthLabel
                          ? callbacks.monthLabel(m)
                          : m.name}
                      </button>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

MonthPicker.displayName = 'MonthPicker'

export { MonthPicker }
