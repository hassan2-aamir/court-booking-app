# Implementation Plan

- [x] 1. Create backend DTOs for court settings management





  - Create DTOs for advanced booking limit, court unavailabilities, and peak schedules
  - Implement validation decorators for all input fields
  - Add proper TypeScript interfaces for type safety
  - _Requirements: 1.4, 2.2, 3.2, 5.4_

- [x] 2. Enhance courts service with settings management methods





  - Implement methods for retrieving court settings
  - Add CRUD operations for court unavailabilities
  - Add CRUD operations for peak schedules
  - Implement advanced booking limit update functionality
  - Add validation logic for time overlaps and conflicts
  - _Requirements: 1.1, 2.1, 2.7, 3.1, 3.6, 5.1_

- [x] 3. Extend courts controller with new settings endpoints





  - Add GET endpoint for retrieving court settings
  - Add PATCH endpoint for updating advanced booking limit
  - Add CRUD endpoints for court unavailabilities
  - Add CRUD endpoints for peak schedules
  - Implement proper error handling and response formatting
  - _Requirements: 1.1, 2.1, 3.1, 5.4_

- [x] 4. Create comprehensive unit tests for backend settings functionality





  - Write tests for all new service methods
  - Test validation logic for time overlaps and conflicts
  - Test error scenarios and edge cases
  - Verify proper database operations with Prisma
  - _Requirements: 1.5, 2.8, 3.7, 5.4_

- [x] 5. Extend frontend API client with settings endpoints





  - Add API functions for court settings retrieval
  - Implement functions for advanced booking limit management
  - Add API functions for unavailabilities CRUD operations
  - Add API functions for peak schedules CRUD operations
  - Implement proper error handling and TypeScript types
  - _Requirements: 1.1, 2.1, 3.1, 5.3_

- [x] 6. Create court context menu component





  - Implement right-click context menu functionality on court cards
  - Add settings option to context menu
  - Integrate with existing court actions (edit, schedule, toggle, delete)
  - Ensure proper event handling and positioning
  - _Requirements: 1.1, 4.1_

- [x] 7. Build court settings modal component structure





  - Create main settings modal component with tabs/sections
  - Implement modal opening/closing functionality
  - Add proper styling consistent with existing theme
  - Set up state management for settings data
  - _Requirements: 1.2, 4.1, 4.3, 5.3_

- [x] 8. Implement advanced booking limit settings section








  - Create input field for booking limit with validation
  - Add save functionality with API integration
  - Implement proper error handling and user feedback
  - Add confirmation messages for successful updates
  - _Requirements: 1.3, 1.4, 1.5, 5.5_

- [x] 9. Build court unavailabilities management section





  - Create list view for displaying existing unavailabilities
  - Implement add unavailability form with date, time, and reason fields
  - Add edit and delete functionality for existing unavailabilities
  - Handle recurring unavailabilities with proper UI indicators
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 2.8_

- [x] 10. Create peak schedules management section







  - Build day-organized view for displaying peak schedules
  - Implement add peak schedule form with day, time, and price fields
  - Add edit and delete functionality for existing schedules
  - Implement validation to prevent overlapping time slots
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7_

- [x] 11. Integrate settings modal with courts content component








  - Add right-click event handling to court cards
  - Connect context menu to settings modal opening
  - Implement settings data loading when modal opens
  - Add proper state updates after settings changes
  - _Requirements: 1.1, 1.2, 5.1, 5.2_

- [x] 12. Implement form validation and error handling




  - Add client-side validation for all form inputs
  - Implement proper error display for validation failures
  - Handle API errors with user-friendly messages
  - Add loading states during API operations
  - _Requirements: 1.4, 1.5, 2.8, 3.4, 5.4, 5.5_

- [x] 13. Create comprehensive frontend component tests



















  - Write tests for court context menu functionality
  - Test settings modal opening and data loading
  - Test form validation and submission
  - Test error handling and user feedback
  - _Requirements: 4.1, 4.2, 4.3, 5.4, 5.5_

- [ ] 14. Add integration tests for complete settings workflow




  - Test end-to-end settings management workflow
  - Verify API integration and data persistence
  - Test error scenarios and recovery
  - Ensure proper state management throughout the flow
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 15. Implement booking system integration with new settings
  - Update booking validation to respect advanced booking limits
  - Integrate unavailabilities into booking availability checks
  - Apply peak pricing during booking calculations
  - Ensure settings changes immediately affect booking system
  - _Requirements: 1.6, 2.6, 3.5, 5.2_