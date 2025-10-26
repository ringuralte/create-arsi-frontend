import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

interface Props {
  message: string
  children: React.ReactNode
  className?: string
}

/**
 * A tooltip component that displays a message when hovered.
 * Use this over the tooltip component from shadcn
 *
 * @param message The message to display
 * @param children The element to display the tooltip for
 * @param className Optional className
 *
 * @example
 * <AppTooltip message="Hello World">
 *   <Button>Hover Me</Button>
 * </AppTooltip>
 */
export default function AppTooltip({ message, children, className }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className={className}>
        {message}
      </TooltipContent>
    </Tooltip>
  )
}
