import { useCallback, useRef } from 'react'

/**
 * Returns a ref callback to attach to a container element.
 * When the element is mounted or scrolled into view, `scroll-visible`
 * is added, triggering CSS scroll-reveal animations.
 *
 * Using a callback ref guarantees that dynamically mounted elements
 * (like after login or view changes) are always observed immediately.
 */
export function useScrollReveal({
  threshold = 0.05,
  rootMargin = '0px 0px 40px 0px'
} = {}) {
  const observerRef = useRef(null)

  const setRef = useCallback(
    (el) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }

      if (!el) return

      // If already revealed, do nothing
      if (el.classList.contains('scroll-visible')) return

      // Fallback: If IntersectionObserver is not supported, reveal immediately
      if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        el.classList.add('scroll-visible')
        return
      }

      // Check if element is already visible within the viewport
      const rect = el.getBoundingClientRect()
      const inView =
        rect.top < (window.innerHeight || document.documentElement.clientHeight) + 40 &&
        rect.bottom > -40

      if (inView) {
        el.classList.add('scroll-visible')
        return
      }

      // Otherwise observe for scroll into view
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              el.classList.add('scroll-visible')
              observer.disconnect()
            }
          })
        },
        { threshold, rootMargin }
      )

      observer.observe(el)
      observerRef.current = observer
    },
    [threshold, rootMargin]
  )

  return setRef
}

