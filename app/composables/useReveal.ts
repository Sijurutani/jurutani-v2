import { onMounted, onUnmounted } from 'vue'

interface UseRevealOptions {
    /**
     * The selector for the elements to reveal.
     * @default '.app-reveal'
     */
    selector?: string
    /**
     * The class to add to the elements when they are visible.
     * @default 'is-visible'
     */
    visibleClass?: string
    /**
     * The root element for the IntersectionObserver.
     * @default null
     */
    root?: Element | null
    /**
     * The margin around the root.
     * @default '0px 0px -10% 0px'
     */
    rootMargin?: string
    /**
     * The threshold for the IntersectionObserver.
     * @default 0
     */
    threshold?: number
}

/**
 * A lightweight composable to reveal elements on scroll using IntersectionObserver.
 * Replaces the GSAP-based .app-reveal animation.
 *
 * @param options - Configuration for the IntersectionObserver.
 */
export function useReveal(options: UseRevealOptions = {}) {
    const {
        selector = '.app-reveal',
        visibleClass = 'is-visible',
        root = null,
        rootMargin = '0px 0px -10% 0px', // Triggers when the element is 10% into the viewport from the bottom
        threshold = 0,
    } = options

    let observer: IntersectionObserver

    const init = () => {
        if (typeof window === 'undefined') return

        observer = new IntersectionObserver(
            (entries, obs) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        // Add the visible class
                        entry.target.classList.add(visibleClass)
                        // Stop observing the element once it's visible
                        obs.unobserve(entry.target)
                    }
                }
            },
            {
                root,
                rootMargin,
                threshold,
            },
        )

        // Use a timeout to ensure the DOM is ready, especially on client-side navigation
        setTimeout(() => {
            const elementsToReveal = document.querySelectorAll(selector)
            for (const el of elementsToReveal) {
                observer.observe(el)
            }
        }, 100) // A small delay can help ensure elements are registered
    }

    const cleanup = () => {
        if (observer) {
            observer.disconnect()
        }
    }

    onMounted(init)
    onUnmounted(cleanup)

    // Return a re-trigger function for manual use after new content is loaded
    return {
        trigger: init,
    }
}
