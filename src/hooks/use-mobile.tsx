import * as React from "react"

const MOBILE_BREAKPOINT = 450
const DESKTOP_MEDIUM_BREAKPOINT = 1280

export type ScreenSize = 'mobile' | 'desktop-medium' | 'desktop-max'

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = React.useState<ScreenSize>('desktop-max')

  React.useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      if (width <= MOBILE_BREAKPOINT) {
        setScreenSize('mobile')
      } else if (width <= DESKTOP_MEDIUM_BREAKPOINT) {
        setScreenSize('desktop-medium')
      } else {
        setScreenSize('desktop-max')
      }
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  return screenSize
}
