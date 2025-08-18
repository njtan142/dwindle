import * as React from "react"
import { UseMobileReturn } from "@/types"

const MOBILE_BREAKPOINT = 768

/**
 * A hook that detects if the user is on a mobile device
 * @returns {UseMobileReturn} Object containing isMobile boolean
 */
export function useMobile(): UseMobileReturn {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Return early if window is not defined (SSR)
    if (typeof window === 'undefined') {
      setIsMobile(false)
      return
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Add event listener
    mql.addEventListener("change", onChange)
    
    // Cleanup function
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return { isMobile: !!isMobile }
}
