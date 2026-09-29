import { useEffect, useRef } from 'react'

/**
 * Returns a ref to attach to a container element.
 * When that element enters the viewport, the class `scroll-visible`
 * is added, triggering CSS scroll-reveal animations.
 *
 * @param {object} options - IntersectionObserver options
 * @param {number} options.threshold - 0–1, how much must be visible (default 0.12)
 * @param {string} options.rootMargin - margin around viewport (default '0px 0px -40px 0px')
 */
export function useScrollReveal({
  threshold = 0.12,
  rootMargin = '0px 0px -40px 0px'
} = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('scroll-visible')
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return ref
}
