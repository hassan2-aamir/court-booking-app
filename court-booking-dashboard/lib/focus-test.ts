/**
 * Test script to check for focus management issues
 */

// This can be run in the browser console to test focus management
export function testFocusManagement() {
  console.log('Testing focus management...')
  
  // Check for elements with aria-hidden that might have focused descendants
  const ariaHiddenElements = document.querySelectorAll('[aria-hidden="true"]')
  const focusConflicts: Array<{ element: Element; focusedChild: Element }> = []
  
  ariaHiddenElements.forEach(element => {
    const focusedChildren = element.querySelectorAll(':focus')
    if (focusedChildren.length > 0) {
      focusedChildren.forEach(focusedChild => {
        focusConflicts.push({ element, focusedChild })
      })
    }
  })
  
  if (focusConflicts.length > 0) {
    console.warn('Found focus conflicts:', focusConflicts)
    return false
  }
  
  console.log('No focus conflicts found!')
  return true
}

// Auto-run focus conflict detection
if (typeof window !== 'undefined') {
  // Run test when DOM changes
  const observer = new MutationObserver(() => {
    // Debounce the test
    clearTimeout((window as any).focusTestTimeout)
    ;(window as any).focusTestTimeout = setTimeout(testFocusManagement, 500)
  })
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-hidden', 'data-state']
  })
}
