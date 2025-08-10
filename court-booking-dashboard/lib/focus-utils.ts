/**
 * Focus management utilities to prevent aria-hidden accessibility conflicts
 */

/**
 * Safely focuses an element after ensuring it's not hidden or inside an aria-hidden container
 */
export function safeFocus(element: HTMLElement | null, delay = 0) {
  if (!element) return

  const focusElement = () => {
    // Check if element is hidden or inside an aria-hidden container
    const isHidden = element.closest('[aria-hidden="true"]') !== null
    const isDisplayNone = getComputedStyle(element).display === 'none'
    const isVisibilityHidden = getComputedStyle(element).visibility === 'hidden'

    if (!isHidden && !isDisplayNone && !isVisibilityHidden) {
      element.focus()
    }
  }

  if (delay > 0) {
    setTimeout(focusElement, delay)
  } else {
    focusElement()
  }
}

/**
 * Manages focus restoration after modal/dropdown closes
 */
export function createFocusRestorer(triggerSelector: string) {
  return (event: Event) => {
    event.preventDefault()
    safeFocus(document.querySelector(triggerSelector) as HTMLElement, 50)
  }
}

/**
 * Clears any conflicting aria-hidden attributes that might prevent focus
 */
export function clearAriaHiddenConflicts(element: HTMLElement) {
  const ariaHiddenElements = element.querySelectorAll('[aria-hidden="true"]')
  ariaHiddenElements.forEach(el => {
    if (el.contains(document.activeElement)) {
      // Temporarily remove aria-hidden to allow focus
      el.removeAttribute('aria-hidden')
      // Restore it after a brief delay
      setTimeout(() => {
        if (!el.contains(document.activeElement)) {
          el.setAttribute('aria-hidden', 'true')
        }
      }, 100)
    }
  })
}
