import { formatDateForAPI } from '../utils'

describe('formatDateForAPI', () => {
  it('should format date correctly without timezone issues', () => {
    // Test with a specific date
    const testDate = new Date(2024, 7, 16) // August 16, 2024 (month is 0-indexed)
    const result = formatDateForAPI(testDate)
    
    expect(result).toBe('2024-08-16')
  })

  it('should handle different timezones consistently', () => {
    // Create a date that would be problematic with toISOString()
    // This represents August 16, 2024 at 11:30 PM in a timezone ahead of UTC
    const testDate = new Date(2024, 7, 16, 23, 30, 0) // August 16, 2024 23:30
    const result = formatDateForAPI(testDate)
    
    // Should still be August 16th regardless of timezone
    expect(result).toBe('2024-08-16')
  })

  it('should pad single digit months and days with zeros', () => {
    const testDate = new Date(2024, 0, 5) // January 5, 2024
    const result = formatDateForAPI(testDate)
    
    expect(result).toBe('2024-01-05')
  })

  it('should handle end of month correctly', () => {
    const testDate = new Date(2024, 1, 29) // February 29, 2024 (leap year)
    const result = formatDateForAPI(testDate)
    
    expect(result).toBe('2024-02-29')
  })

  // Demonstrate the problem with toISOString().split('T')[0]
  it('demonstrates the timezone issue with toISOString approach', () => {
    // Create a date that represents August 16th in a timezone ahead of UTC
    // When converted to UTC, it might become August 15th
    const testDate = new Date('2024-08-16T23:30:00+05:00') // August 16, 11:30 PM in UTC+5
    
    // The problematic approach (what was causing the bug)
    const problematicResult = testDate.toISOString().split('T')[0]
    
    // The correct approach (our fix)
    const correctResult = formatDateForAPI(testDate)
    
    // In some timezones, these might be different
    // The problematic approach might return '2024-08-15' while correct approach returns '2024-08-16'
    console.log('Problematic result:', problematicResult)
    console.log('Correct result:', correctResult)
    
    // Our function should always use the local date components
    expect(correctResult).toBe('2024-08-16')
  })
})