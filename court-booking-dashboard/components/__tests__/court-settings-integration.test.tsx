import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '../../src/test/test-utils'
import userEvent from '@testing-library/user-event'

// Mock API calls
vi.mock('../../lib/api/courts', () => ({
  getCourtSettings: vi.fn(),
  updateAdvancedBookingLimit: vi.fn(),
  createCourtUnavailability: vi.fn(),
  updateCourtUnavailability: vi.fn(),
  deleteCourtUnavailability: vi.fn(),
  createCourtPeakSchedule: vi.fn(),
  updateCourtPeakSchedule: vi.fn(),
  deleteCourtPeakSchedule: vi.fn(),
}))

// Import mocked API functions
import * as courtsApi from '../../lib/api/courts'

// Import components
import { CourtContextMenu } from '../court-context-menu'
import { CourtSettingsModal } from '../court-settings-modal'
import { 
  createMockCourt, 
  createMockCourtSettings, 
  createMockUnavailability,
  createMockPeakSchedule,
  mockAddToast, 
  resetAllMocks 
} from '../../src/test/test-utils'

// Cast to mocked functions
const mockApiCalls = courtsApi as any

describe('Court Settings Management - Integration Tests', () => {
  const mockCourt = createMockCourt()
  const mockSettings = createMockCourtSettings()

  beforeEach(() => {
    resetAllMocks()
    Object.values(mockApiCalls).forEach(mock => mock.mockReset())
    mockApiCalls.getCourtSettings.mockResolvedValue(mockSettings)
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Complete Settings Workflow - End to End', () => {
    it('should complete full settings management workflow', async () => {
      const user = userEvent.setup()
      const mockHandlers = {
        onSettingsClick: vi.fn(),
        onEditClick: vi.fn(),
        onScheduleClick: vi.fn(),
        onToggleStatus: vi.fn(),
        onDelete: vi.fn(),
        onOpenChange: vi.fn(),
      }
      const mockSettingsProps = {
        isOpen: false,
        onClose: vi.fn(),
        court: mockCourt,
        onSettingsUpdate: vi.fn(),
      }

      // Step 1: Render context menu and settings modal
      const { rerender } = render(
        <div>
          <CourtContextMenu
            court={mockCourt}
            {...mockHandlers}
            open={true}
          >
            <div data-testid="trigger">Right click me</div>
          </CourtContextMenu>
          <CourtSettingsModal {...mockSettingsProps} />
        </div>
      )

      // Step 2: Click settings from context menu
      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Settings'))
      expect(mockHandlers.onSettingsClick).toHaveBeenCalledWith(mockCourt)

      // Step 3: Open settings modal
      rerender(
        <div>
          <CourtContextMenu
            court={mockCourt}
            {...mockHandlers}
            open={false}
          >
            <div data-testid="trigger">Right click me</div>
          </CourtContextMenu>
          <CourtSettingsModal {...mockSettingsProps} isOpen={true} />
        </div>
      )

      // Step 4: Verify settings load
      await waitFor(() => {
        expect(mockApiCalls.getCourtSettings).toHaveBeenCalledWith(mockCourt.id)
        expect(screen.getByText(`Court Settings - ${mockCourt.name}`)).toBeInTheDocument()
      })

      // Step 5: Update advanced booking limit
      mockApiCalls.updateAdvancedBookingLimit.mockResolvedValue(undefined)
      
      await waitFor(() => {
        const input = screen.getByLabelText('Days in advance')
        expect(input).toBeInTheDocument()
      })

      const bookingLimitInput = screen.getByLabelText('Days in advance')
      await user.clear(bookingLimitInput)
      await user.type(bookingLimitInput, '45')

      // Wait for the save button to show "Save Changes" (indicating unsaved changes)
      await waitFor(() => {
        expect(screen.getByText('Save Changes')).toBeInTheDocument()
      })

      const saveButton = screen.getByText('Save Changes')
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockApiCalls.updateAdvancedBookingLimit).toHaveBeenCalledWith(mockCourt.id, 45)
        expect(mockAddToast).toHaveBeenCalledWith({
          type: 'success',
          title: 'Success',
          description: 'Advanced booking limit updated successfully',
        })
      })

      // Step 6: Switch to unavailabilities tab and add unavailability
      const unavailabilitiesTab = screen.getByText('Unavailabilities')
      await user.click(unavailabilitiesTab)

      const addUnavailabilityButton = screen.getByText('Add Unavailability')
      await user.click(addUnavailabilityButton)

      // Fill unavailability form
      const newUnavailability = createMockUnavailability({
        id: 'new-unavail-1',
        date: '2025-03-01',
        reason: 'Maintenance work'
      })
      mockApiCalls.createCourtUnavailability.mockResolvedValue(newUnavailability)

      await waitFor(() => {
        expect(screen.getByText('Add Unavailability')).toBeInTheDocument()
      })

      const dateInput = screen.getByLabelText('Date *')
      await user.type(dateInput, '2025-03-01')

      const reasonInput = screen.getByLabelText('Reason *')
      await user.type(reasonInput, 'Maintenance work')

      const createButton = screen.getByText('Create')
      await user.click(createButton)

      await waitFor(() => {
        expect(mockApiCalls.createCourtUnavailability).toHaveBeenCalledWith(mockCourt.id, {
          date: '2025-03-01',
          startTime: '',
          endTime: '',
          reason: 'Maintenance work',
          isRecurring: false,
        })
      })

      // Step 7: Switch to peak schedules tab and add peak schedule
      const peakSchedulesTab = screen.getByText('Peak Pricing')
      await user.click(peakSchedulesTab)

      const addPeakScheduleButton = screen.getByText('Add Peak Schedule')
      await user.click(addPeakScheduleButton)

      // Fill peak schedule form
      const newPeakSchedule = createMockPeakSchedule({
        id: 'new-peak-1',
        dayOfWeek: 2,
        startTime: '19:00',
        endTime: '21:00',
        price: 2000
      })
      mockApiCalls.createCourtPeakSchedule.mockResolvedValue(newPeakSchedule)

      await waitFor(() => {
        expect(screen.getByText('Add Peak Schedule')).toBeInTheDocument()
      })

      const daySelect = screen.getByLabelText('Day of Week *')
      await user.click(daySelect)
      await user.click(screen.getByText('Tuesday'))

      const startTimeInput = screen.getByLabelText('Start Time *')
      await user.type(startTimeInput, '19:00')

      const endTimeInput = screen.getByLabelText('End Time *')
      await user.type(endTimeInput, '21:00')

      const priceInput = screen.getByLabelText('Price (PKR) *')
      await user.type(priceInput, '2000')

      const createScheduleButton = screen.getByText('Create Schedule')
      await user.click(createScheduleButton)

      await waitFor(() => {
        expect(mockApiCalls.createCourtPeakSchedule).toHaveBeenCalledWith(mockCourt.id, {
          dayOfWeek: 2,
          startTime: '19:00',
          endTime: '21:00',
          price: 2000,
        })
      })

      // Step 8: Verify settings update callback
      expect(mockSettingsProps.onSettingsUpdate).toHaveBeenCalled()
    })

    it('should handle complete workflow with all CRUD operations', async () => {
      const user = userEvent.setup()
      const settingsWithData = createMockCourtSettings({
        unavailabilities: [
          createMockUnavailability({ id: 'unavail-1', reason: 'Original reason' }),
          createMockUnavailability({ id: 'unavail-2', reason: 'Second unavailability' })
        ],
        peakSchedules: [
          createMockPeakSchedule({ id: 'peak-1', dayOfWeek: 1, price: 1500 }),
          createMockPeakSchedule({ id: 'peak-2', dayOfWeek: 2, price: 1800 })
        ]
      })

      mockApiCalls.getCourtSettings.mockResolvedValue(settingsWithData)

      render(
        <CourtSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          court={mockCourt}
          onSettingsUpdate={vi.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(`Court Settings - ${mockCourt.name}`)).toBeInTheDocument()
      })

      // Test unavailability CRUD operations
      const unavailabilitiesTab = screen.getByText('Unavailabilities')
      await user.click(unavailabilitiesTab)

      await waitFor(() => {
        expect(screen.getByText('Original reason')).toBeInTheDocument()
        expect(screen.getByText('Second unavailability')).toBeInTheDocument()
      })

      // Edit first unavailability
      const editButtons = screen.getAllByText('Edit')
      mockApiCalls.updateCourtUnavailability.mockResolvedValue({
        ...settingsWithData.unavailabilities[0],
        reason: 'Updated reason'
      })

      await user.click(editButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Edit Unavailability')).toBeInTheDocument()
      })

      const reasonInput = screen.getByLabelText('Reason *')
      await user.clear(reasonInput)
      await user.type(reasonInput, 'Updated reason')

      const updateButton = screen.getByText('Update')
      await user.click(updateButton)

      await waitFor(() => {
        expect(mockApiCalls.updateCourtUnavailability).toHaveBeenCalledWith(
          mockCourt.id,
          'unavail-1',
          expect.objectContaining({
            reason: 'Updated reason'
          })
        )
      })

      // Delete second unavailability
      const deleteButtons = screen.getAllByText('Delete')
      mockApiCalls.deleteCourtUnavailability.mockResolvedValue(undefined)

      await user.click(deleteButtons[1])

      await waitFor(() => {
        expect(mockApiCalls.deleteCourtUnavailability).toHaveBeenCalledWith(
          mockCourt.id,
          'unavail-2'
        )
      })

      // Test peak schedule CRUD operations
      const peakSchedulesTab = screen.getByText('Peak Pricing')
      await user.click(peakSchedulesTab)

      await waitFor(() => {
        expect(screen.getByText('Monday')).toBeInTheDocument()
        expect(screen.getByText('Tuesday')).toBeInTheDocument()
      })

      // Edit first peak schedule
      const peakEditButtons = screen.getAllByText('Edit')
      mockApiCalls.updateCourtPeakSchedule.mockResolvedValue({
        ...settingsWithData.peakSchedules[0],
        price: 2000
      })

      await user.click(peakEditButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Edit Peak Schedule')).toBeInTheDocument()
      })

      const peakPriceInput = screen.getByLabelText('Price (PKR) *')
      await user.clear(peakPriceInput)
      await user.type(peakPriceInput, '2000')

      const updateScheduleButton = screen.getByText('Update Schedule')
      await user.click(updateScheduleButton)

      await waitFor(() => {
        expect(mockApiCalls.updateCourtPeakSchedule).toHaveBeenCalledWith(
          mockCourt.id,
          'peak-1',
          expect.objectContaining({
            price: 2000
          })
        )
      })

      // Delete second peak schedule
      const peakDeleteButtons = screen.getAllByText('Delete')
      mockApiCalls.deleteCourtPeakSchedule.mockResolvedValue(undefined)

      await user.click(peakDeleteButtons[1])

      await waitFor(() => {
        expect(mockApiCalls.deleteCourtPeakSchedule).toHaveBeenCalledWith(
          mockCourt.id,
          'peak-2'
        )
      })
    })
  })

  describe('API Integration and Data Persistence', () => {
    it('should persist data correctly across operations', async () => {
      const user = userEvent.setup()
      let currentSettings = { ...mockSettings }

      // Mock API to simulate data persistence
      mockApiCalls.getCourtSettings.mockImplementation(() => Promise.resolve(currentSettings))
      mockApiCalls.updateAdvancedBookingLimit.mockImplementation((courtId: string, limit: number) => {
        currentSettings.advancedBookingLimit = limit
        return Promise.resolve()
      })
      mockApiCalls.createCourtUnavailability.mockImplementation((courtId: string, data: any) => {
        const newUnavailability = { ...data, id: `unavail-${Date.now()}`, courtId }
        currentSettings.unavailabilities.push(newUnavailability)
        return Promise.resolve(newUnavailability)
      })

      render(
        <CourtSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          court={mockCourt}
          onSettingsUpdate={vi.fn()}
        />
      )

      // Wait for initial load
      await waitFor(() => {
        expect(mockApiCalls.getCourtSettings).toHaveBeenCalledWith(mockCourt.id)
      })

      // Update booking limit
      const bookingLimitInput = screen.getByLabelText('Days in advance')
      await user.clear(bookingLimitInput)
      await user.type(bookingLimitInput, '60')

      const saveButton = screen.getByText('Save Changes')
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockApiCalls.updateAdvancedBookingLimit).toHaveBeenCalledWith(mockCourt.id, 60)
        expect(currentSettings.advancedBookingLimit).toBe(60)
      })

      // Add unavailability
      const unavailabilitiesTab = screen.getByText('Unavailabilities')
      await user.click(unavailabilitiesTab)

      const addUnavailabilityButton = screen.getByText('Add Unavailability')
      await user.click(addUnavailabilityButton)

      await waitFor(() => {
        expect(screen.getByText('Add Unavailability')).toBeInTheDocument()
      })

      const dateInput = screen.getByLabelText('Date *')
      await user.type(dateInput, '2025-04-01')

      const reasonInput = screen.getByLabelText('Reason *')
      await user.type(reasonInput, 'Persistent test')

      const createButton = screen.getByText('Create')
      await user.click(createButton)

      await waitFor(() => {
        expect(mockApiCalls.createCourtUnavailability).toHaveBeenCalled()
        expect(currentSettings.unavailabilities).toHaveLength(2) // Original + new
        expect(currentSettings.unavailabilities.some(u => u.reason === 'Persistent test')).toBe(true)
      })
    })

    it('should handle concurrent API operations correctly', async () => {
      const user = userEvent.setup()
      
      // Simulate slow API responses
      mockApiCalls.updateAdvancedBookingLimit.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )
      mockApiCalls.createCourtUnavailability.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(createMockUnavailability()), 150))
      )

      render(
        <CourtSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          court={mockCourt}
          onSettingsUpdate={vi.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(`Court Settings - ${mockCourt.name}`)).toBeInTheDocument()
      })

      // Start booking limit update
      const bookingLimitInput = screen.getByLabelText('Days in advance')
      await user.clear(bookingLimitInput)
      await user.type(bookingLimitInput, '90')

      const saveButton = screen.getByText('Save Changes')
      await user.click(saveButton)

      // Immediately switch to unavailabilities and try to add one
      const unavailabilitiesTab = screen.getByText('Unavailabilities')
      await user.click(unavailabilitiesTab)

      const addUnavailabilityButton = screen.getByText('Add Unavailability')
      await user.click(addUnavailabilityButton)

      await waitFor(() => {
        expect(screen.getByText('Add Unavailability')).toBeInTheDocument()
      })

      const dateInput = screen.getByLabelText('Date *')
      await user.type(dateInput, '2025-05-01')

      const reasonInput = screen.getByLabelText('Reason *')
      await user.type(reasonInput, 'Concurrent test')

      const createButton = screen.getByText('Create')
      await user.click(createButton)

      // Both operations should complete successfully
      await waitFor(() => {
        expect(mockApiCalls.updateAdvancedBookingLimit).toHaveBeenCalledWith(mockCourt.id, 90)
        expect(mockApiCalls.createCourtUnavailability).toHaveBeenCalled()
      }, { timeout: 3000 })
    })
  })

  describe('Error Scenarios and Recovery', () => {
    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup()
      
      // Simulate network error
      mockApiCalls.getCourtSettings.mockRejectedValue(new Error('Network error'))

      render(
        <CourtSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          court={mockCourt}
          onSettingsUpdate={vi.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
        expect(screen.getByText('Try Again')).toBeInTheDocument()
      })

      // Test retry functionality
      mockApiCalls.getCourtSettings.mockResolvedValue(mockSettings)
      
      const retryButton = screen.getByText('Try Again')
      await user.click(retryButton)

      await waitFor(() => {
        expect(mockApiCalls.getCourtSettings).toHaveBeenCalledTimes(2)
        expect(screen.getByText(`Court Settings - ${mockCourt.name}`)).toBeInTheDocument()
      })
    })

    it('should handle API validation errors', async () => {
      const user = userEvent.setup()

      render(
        <CourtSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          court={mockCourt}
          onSettingsUpdate={vi.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(`Court Settings - ${mockCourt.name}`)).toBeInTheDocument()
      })

      // Simulate validation error from API
      mockApiCalls.updateAdvancedBookingLimit.mockRejectedValue(
        new Error('Booking limit must be between 1 and 365 days')
      )

      const bookingLimitInput = screen.getByLabelText('Days in advance')
      await user.clear(bookingLimitInput)
      await user.type(bookingLimitInput, '500') // Invalid value

      const saveButton = screen.getByText('Save Changes')
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          type: 'error',
          title: 'Error',
          description: 'Booking limit must be between 1 and 365 days',
        })
      })

      // Form should remain in editable state
      expect(bookingLimitInput).toBeInTheDocument()
      expect(bookingLimitInput).not.toBeDisabled()
    })

    it('should handle partial failures in batch operations', async () => {
      const user = userEvent.setup()

      render(
        <CourtSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          court={mockCourt}
          onSettingsUpdate={vi.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(`Court Settings - ${mockCourt.name}`)).toBeInTheDocument()
      })

      // Simulate successful booking limit update
      mockApiCalls.updateAdvancedBookingLimit.mockResolvedValue(undefined)

      const bookingLimitInput = screen.getByLabelText('Days in advance')
      await user.clear(bookingLimitInput)
      await user.type(bookingLimitInput, '45')

      const saveButton = screen.getByText('Save Changes')
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          type: 'success',
          title: 'Success',
          description: 'Advanced booking limit updated successfully',
        })
      })

      // Now simulate failure in unavailability creation
      const unavailabilitiesTab = screen.getByText('Unavailabilities')
      await user.click(unavailabilitiesTab)

      const addUnavailabilityButton = screen.getByText('Add Unavailability')
      await user.click(addUnavailabilityButton)

      mockApiCalls.createCourtUnavailability.mockRejectedValue(
        new Error('Unavailability conflicts with existing booking')
      )

      await waitFor(() => {
        expect(screen.getByText('Add Unavailability')).toBeInTheDocument()
      })

      const dateInput = screen.getByLabelText('Date *')
      await user.type(dateInput, '2025-06-01')

      const reasonInput = screen.getByLabelText('Reason *')
      await user.type(reasonInput, 'Conflicting unavailability')

      const createButton = screen.getByText('Create')
      await user.click(createButton)

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          type: 'error',
          title: 'Error',
          description: 'Unavailability conflicts with existing booking',
        })
      })

      // Previous successful operation should remain intact
      const bookingTab = screen.getByText('Booking Limit')
      await user.click(bookingTab)

      await waitFor(() => {
        const updatedInput = screen.getByLabelText('Days in advance') as HTMLInputElement
        expect(updatedInput.value).toBe('45')
      })
    })

    it('should recover from authentication errors', async () => {
      const user = userEvent.setup()

      render(
        <CourtSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          court={mockCourt}
          onSettingsUpdate={vi.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(`Court Settings - ${mockCourt.name}`)).toBeInTheDocument()
      })

      // Simulate authentication error
      mockApiCalls.updateAdvancedBookingLimit.mockRejectedValue(
        new Error('Authentication required. Please log in again.')
      )

      const bookingLimitInput = screen.getByLabelText('Days in advance')
      await user.clear(bookingLimitInput)
      await user.type(bookingLimitInput, '30')

      const saveButton = screen.getByText('Save Changes')
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          type: 'error',
          title: 'Error',
          description: 'Authentication required. Please log in again.',
        })
      })

      // After re-authentication, operation should work
      mockApiCalls.updateAdvancedBookingLimit.mockResolvedValue(undefined)
      
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          type: 'success',
          title: 'Success',
          description: 'Advanced booking limit updated successfully',
        })
      })
    })
  })

  describe('State Management Throughout Flow', () => {
    it('should maintain consistent state across tab switches', async () => {
      const user = userEvent.setup()

      render(
        <CourtSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          court={mockCourt}
          onSettingsUpdate={vi.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(`Court Settings - ${mockCourt.name}`)).toBeInTheDocument()
      })

      // Modify booking limit but don't save
      const bookingLimitInput = screen.getByLabelText('Days in advance')
      await user.clear(bookingLimitInput)
      await user.type(bookingLimitInput, '75')

      // Switch to unavailabilities tab
      const unavailabilitiesTab = screen.getByText('Unavailabilities')
      await user.click(unavailabilitiesTab)

      // Switch back to booking limit tab
      const bookingTab = screen.getByText('Booking Limit')
      await user.click(bookingTab)

      // Value should be preserved
      await waitFor(() => {
        const preservedInput = screen.getByLabelText('Days in advance') as HTMLInputElement
        expect(preservedInput.value).toBe('75')
      })
    })

    it('should handle optimistic updates correctly', async () => {
      const user = userEvent.setup()
      const onSettingsUpdate = vi.fn()

      render(
        <CourtSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          court={mockCourt}
          onSettingsUpdate={onSettingsUpdate}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(`Court Settings - ${mockCourt.name}`)).toBeInTheDocument()
      })

      // Mock successful API call with delay
      mockApiCalls.updateAdvancedBookingLimit.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 200))
      )

      const bookingLimitInput = screen.getByLabelText('Days in advance')
      await user.clear(bookingLimitInput)
      await user.type(bookingLimitInput, '120')

      const saveButton = screen.getByText('Save Changes')
      await user.click(saveButton)

      // Should show loading state immediately
      expect(screen.getByText('Saving...')).toBeInTheDocument()
      expect(saveButton).toBeDisabled()

      // After API completes
      await waitFor(() => {
        expect(screen.getByText('Save Changes')).toBeInTheDocument()
        expect(saveButton).not.toBeDisabled()
        expect(onSettingsUpdate).toHaveBeenCalled()
      }, { timeout: 1000 })
    })

    it('should rollback optimistic updates on failure', async () => {
      const user = userEvent.setup()
      const originalLimit = mockSettings.advancedBookingLimit

      render(
        <CourtSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          court={mockCourt}
          onSettingsUpdate={vi.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(`Court Settings - ${mockCourt.name}`)).toBeInTheDocument()
      })

      // Mock API failure
      mockApiCalls.updateAdvancedBookingLimit.mockRejectedValue(
        new Error('Server error')
      )

      const bookingLimitInput = screen.getByLabelText('Days in advance')
      await user.clear(bookingLimitInput)
      await user.type(bookingLimitInput, '200')

      const saveButton = screen.getByText('Save Changes')
      await user.click(saveButton)

      // After failure, should rollback to original value
      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          type: 'error',
          title: 'Error',
          description: 'Server error',
        })
      })

      // Value should be rolled back
      await waitFor(() => {
        const rolledBackInput = screen.getByLabelText('Days in advance') as HTMLInputElement
        expect(rolledBackInput.value).toBe(originalLimit.toString())
      })
    })

    it('should maintain form state during modal close/reopen', async () => {
      const user = userEvent.setup()
      let isOpen = true
      const onClose = vi.fn(() => { isOpen = false })

      const { rerender } = render(
        <CourtSettingsModal
          isOpen={isOpen}
          onClose={onClose}
          court={mockCourt}
          onSettingsUpdate={vi.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(`Court Settings - ${mockCourt.name}`)).toBeInTheDocument()
      })

      // Modify form
      const bookingLimitInput = screen.getByLabelText('Days in advance')
      await user.clear(bookingLimitInput)
      await user.type(bookingLimitInput, '150')

      // Close modal
      const closeButton = screen.getByLabelText('Close')
      await user.click(closeButton)

      expect(onClose).toHaveBeenCalled()

      // Rerender with modal closed
      rerender(
        <CourtSettingsModal
          isOpen={false}
          onClose={onClose}
          court={mockCourt}
          onSettingsUpdate={vi.fn()}
        />
      )

      // Reopen modal
      rerender(
        <CourtSettingsModal
          isOpen={true}
          onClose={onClose}
          court={mockCourt}
          onSettingsUpdate={vi.fn()}
        />
      )

      // Should reload fresh data, not maintain unsaved changes
      await waitFor(() => {
        expect(mockApiCalls.getCourtSettings).toHaveBeenCalledTimes(2)
        const freshInput = screen.getByLabelText('Days in advance') as HTMLInputElement
        expect(freshInput.value).toBe(mockSettings.advancedBookingLimit.toString())
      })
    })
  })

  describe('Performance and Resource Management', () => {
    it('should debounce rapid API calls', async () => {
      const user = userEvent.setup()
      
      render(
        <CourtSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          court={mockCourt}
          onSettingsUpdate={vi.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(`Court Settings - ${mockCourt.name}`)).toBeInTheDocument()
      })

      const bookingLimitInput = screen.getByLabelText('Days in advance')
      
      // Rapid changes
      await user.clear(bookingLimitInput)
      await user.type(bookingLimitInput, '100')
      
      await user.clear(bookingLimitInput)
      await user.type(bookingLimitInput, '110')
      
      await user.clear(bookingLimitInput)
      await user.type(bookingLimitInput, '120')

      const saveButton = screen.getByText('Save Changes')
      await user.click(saveButton)

      // Should only make one API call with final value
      await waitFor(() => {
        expect(mockApiCalls.updateAdvancedBookingLimit).toHaveBeenCalledTimes(1)
        expect(mockApiCalls.updateAdvancedBookingLimit).toHaveBeenCalledWith(mockCourt.id, 120)
      })
    })

    it('should cleanup resources on unmount', async () => {
      const { unmount } = render(
        <CourtSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          court={mockCourt}
          onSettingsUpdate={vi.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(`Court Settings - ${mockCourt.name}`)).toBeInTheDocument()
      })

      // Unmount component
      unmount()

      // Any pending API calls should be cancelled (this is implementation dependent)
      // At minimum, no new API calls should be made after unmount
      const initialCallCount = mockApiCalls.getCourtSettings.mock.calls.length

      // Wait a bit to ensure no additional calls are made
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(mockApiCalls.getCourtSettings.mock.calls.length).toBe(initialCallCount)
    })
  })
})