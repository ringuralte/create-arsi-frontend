import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { chunk, cn } from '~/lib/utils'
import { buttonVariants } from './button'

type ButtonVariant
  = | 'default'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'destructive'
    | 'secondary'
    | null
    | undefined

function YearPicker({
  onYearSelect,
  selectedYear,
  minYear,
  maxYear,
  disabledYears,
  callbacks,
  onDecadeBackward,
  onDecadeForward,
  variant,
}: React.HTMLAttributes<HTMLDivElement> & {
  onYearSelect?: (year: number) => void
  selectedYear?: number
  minYear?: number
  maxYear?: number
  disabledYears?: number[]
  callbacks?: {
    yearLabel?: (year: number) => string
  }
  onDecadeBackward?: () => void
  onDecadeForward?: () => void
  variant?: {
    calendar?: {
      main?: ButtonVariant
      selected?: ButtonVariant
    }
    chevrons?: ButtonVariant
  }
}) {
  const [year, setYear] = useState<number>(
    selectedYear ?? new Date().getFullYear(),
  )
  const [menuYear, setMenuYear] = useState<number>(year)

  if (minYear && maxYear && minYear > maxYear)
    minYear = maxYear

  const disabledYearsMapped = disabledYears?.map(y => y)

  const years = Array.from({ length: 12 }, (_, i) => menuYear - 6 + i)

  return (
    <>
      <div className="relative flex items-center justify-center pt-1">
        <div className="text-sm font-medium">
          {years[0]}
          {' '}
          -
          {years[11]}
        </div>
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => {
              setMenuYear(menuYear - 12)
              if (onDecadeBackward)
                onDecadeBackward()
            }}
            className={cn(
              buttonVariants({ variant: variant?.chevrons ?? 'outline' }),
              `
                absolute left-1 inline-flex h-7 w-7 items-center justify-center
                p-0
              `,
            )}
          >
            <ChevronLeft className="size-4 opacity-50" />
          </button>
          <button
            type="button"
            onClick={() => {
              setMenuYear(menuYear + 12)
              if (onDecadeForward)
                onDecadeForward()
            }}
            className={cn(
              buttonVariants({ variant: variant?.chevrons ?? 'outline' }),
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
          {chunk(years, 4).map((yearChunk, index) => (
            <tr key={index} className="mt-2 flex w-full">
              {yearChunk.map(y => (
                <td
                  key={y}
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
                    type="button"
                    onClick={() => {
                      setYear(y)
                      if (onYearSelect)
                        onYearSelect(y)
                    }}
                    disabled={
                      (maxYear ? y > maxYear : false)
                      || (minYear ? y < minYear : false)
                      || (disabledYearsMapped
                        ? disabledYearsMapped.includes(y)
                        : false)
                    }
                    className={cn(
                      buttonVariants({
                        variant:
                          year === y
                            ? (variant?.calendar?.selected ?? 'default')
                            : (variant?.calendar?.main ?? 'ghost'),
                      }),
                      `
                        hover:bg-vanglaini-red/90 hover:text-white
                        h-full w-full p-0 font-normal
                        aria-selected:opacity-100
                      `,
                      {
                        'bg-vanglaini-red': year === y,
                      },
                    )}
                  >
                    {callbacks?.yearLabel ? callbacks.yearLabel(y) : y}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

YearPicker.displayName = 'YearPicker'

export { YearPicker }
