import { useState } from "react"

/**
 * Hook for managing a boolean state and its toggling.
 * @returns An object containing the current state and a function to toggle it.
 * @example
 * const { isOpen, toggle } = useBoolean()
 *
 */
export default function useBoolean() {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = (open?: boolean) => {
    if (open) {
      setIsOpen(open);
    } else {
      setIsOpen((prev) => !prev)
    }
  }

  return { isOpen, toggle }
}