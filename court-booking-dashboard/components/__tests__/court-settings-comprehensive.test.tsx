import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../src/test/test-utils'
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

// Now import components after mocking
import { CourtContextMenu } from '../court-context-menu'
import { CourtSettingsModal } from '../court-settings-modal'
import { UnavailabilityForm } from '../unavailability-form'
import { PeakScheduleForm } from '../peak-schedule-form'
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

describe('Court Settings Management - Comprehensive Tests', () => {
  const mockCourt = createMockCourt()
  const mockSettings = createMockCourtSettings()

  beforeEach(() => {
    resetAllMocks()
    Object.values(mockApiCalls).forEach(mock => mock.mockReset())
    mockApiCalls.getCourtSettings.mockResolvedValue(mockSettings)
  })

  describe('CourtContextMenu', () => {
    const mockHandlers = {
      onSettingsClick: vi.fn(),
      onEditClick: vi.fn(),
      onScheduleClick: vi.fn(),
      onToggleStatus: vi.fn(),
      onDelete: vi.fn(),
      onOpenChange: vi.fn(),
    }

    beforeEach(() => {
      Object.values(mockHandlers).forEach(mock => mock.mockReset())
    })

    it('renders context menu with all options', async () => {
      render(
        <CourtContextMenu
          court={mockCourt}
          {...mockHandlers}
          open={true}
        >
          <div data-testid="trigger">Right click me</div>
        </CourtContextMenu>
      )

      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument()
        expect(screen.getByText('Edit Court')).toBeInTheDocument()
        expect(screen.getByText('View Schedule')).toBeInTheDocument()
        expect(screen.getByText('Deactivate Court')).toBeInTheDocument()
        expect(screen.getByText('Delete Court')).toBeInTheDocument()
      })
    })

    it('calls onSettingsClick when Settings is clicked', async () => {
      render(
        <CourtContextMenu
          court={mockCourt}
          {...mockHandlers}
          open={true}
        >
          <div data-testid="trigger">Right click me</div>
        </CourtContextMenu>
      )

      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Settings'))
      expect(mockHandlers.onSettingsClick).toHaveBeenCalledWith(mockCourt)
    })

    it('shows correct toggle text for inactive courts', async () => {
      const inactiveCourt = createMockCourt({ status: 'Inactive', isActive: false })
      
      render(
        <CourtContextMenu
          court={inactiveCourt}
          {...mockHandlers}
          open={true}
        >
          <div data-testid="trigger">Right click me</div>
        </CourtContextMenu>
      )

      await waitFor(() => {
        expect(screen.getByText('Activate Court')).toBeInTheDocument()
      })
    })
  })

  describe('CourtSettingsModal - Basic Functionality', () => {
    const mockProps = {
      isOpen: true,
      onClose: vi.fn(),
      court: mockCourt,
      onSettingsUpdate: vi.fn(),
    }

    beforeEach(() => {
      mockProps.onClose.mockReset()
      mockProps.onSettingsUpdate.mockReset()
    })

    it('renders modal when open', async () => {
      render(<CourtSettingsModal {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText(`Court Settings - ${mockCourt.name}`)).toBeInTheDocument()
      })
    })

    it('loads court settings on open', async () => {
      render(<CourtSettingsModal {...mockProps} />)

      await waitFor(() => {
        expect(mockApiCalls.getCourtSettings).toHaveBeenCalledWith(mockCourt.id)
      })
    })

    it('displays loading state', async () => {
      mockApiCalls.getCourtSettings.mockImplementation(() => new Promise(() => {})) // Never resolves
      
      render(<CourtSettingsModal {...mockProps} />)

      expect(screen.getByText('Loading settings...')).toBeInTheDocument()
    })

    it('displays error state when loading fails', async () => {
      const errorMessage = 'Failed to load settings'
      mockApiCalls.getCourtSettings.mockRejectedValue(new Error(errorMessage))

      render(<CourtSettingsModal {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
        expect(screen.getByText('Try Again')).toBeInTheDocument()
      })
    })

    it('displays all tabs', async () => {
      render(<CourtSettingsModal {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('Booking Limit')).toBeInTheDocument()
        expect(screen.getByText('Unavailabilities')).toBeInTheDocument()
        expect(screen.getByText('Peak Pricing')).toBeInTheDocument()
      })
    })
  })

  describe('Advanced Booking Limit Management', () => {
    const mockProps = {
      isOpen: true,
      onClose: vi.fn(),
      court: mockCourt,
      onSettingsUpdate: vi.fn(),
    }

    it('displays current booking limit', async () => {
      render(<CourtSettingsModal {...mockProps} />)

      await waitFor(() => {
        const input = screen.getByLabelText('Days in advance') as HTMLInputElement
        expect(input.value).toBe(mockSettings.advancedBookingLimit.toString())
      })
    })

    it('validates booking limit input', async () => {
      const user = userEvent.setup()
      render(<CourtSettingsModal {...mockProps} />)

      await waitFor(() => {
        const input = screen.getByLabelText('Days in advance')
        expect(input).toBeInTheDocument()
      })

      const input = screen.getByLabelText('Days in advance')
      await user.clear(input)
      await user.type(input, '400') // Invalid: > 365

      await waitFor(() => {
        expect(screen.getByText('Booking limit cannot exceed 365 days')).toBeInTheDocument()
      })
    })

    it('saves booking limit successfully', async () => {
      const user = userEvent.setup()
      mockApiCalls.updateAdvancedBookingLimit.mockResolvedValue(undefined)

      render(<CourtSettingsModal {...mockProps} />)

      await waitFor(() => {
        const input = screen.getByLabelText('Days in advance')
        expect(input).toBeInTheDocument()
      })

      const input = screen.getByLabelText('Days in advance')
      await user.clear(input)
      await user.type(input, '45')

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
    })
  })

  describe('UnavailabilityForm - Validation', () => {
    const mockProps = {
      isOpen: true,
      onClose: vi.fn(),
      onSubmit: vi.fn(),
      loading: false,
    }

    beforeEach(() => {
      mockProps.onClose.mockReset()
      mockProps.onSubmit.mockReset()
    })

    it('renders form when open', () => {
      render(<UnavailabilityForm {...mockProps} />)

      expect(screen.getByText('Add Unavailability')).toBeInTheDocument()
      expect(screen.getByLabelText('Date *')).toBeInTheDocument()
      expect(screen.getByLabelText('Reason *')).toBeInTheDocument()
    })

    it('validates required fields', async () => {
      const user = userEvent.setup()
      render(<UnavailabilityForm {...mockProps} />)

      const submitButton = screen.getByText('Create')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Date is required')).toBeInTheDocument()
        expect(screen.getByText('Reason is required')).toBeInTheDocument()
      })
    })

    it('validates reason length', async () => {
      const user = userEvent.setup()
      render(<UnavailabilityForm {...mockProps} />)

      const reasonInput = screen.getByLabelText('Reason *')
      await user.type(reasonInput, 'ab') // Too short

      const submitButton = screen.getByText('Create')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Reason must be at least 3 characters long')).toBeInTheDocument()
      })
    })

    it('shows character count', async () => {
      const user = userEvent.setup()
      render(<UnavailabilityForm {...mockProps} />)

      const reasonInput = screen.getByLabelText('Reason *')
      await user.type(reasonInput, 'Test reason')

      expect(screen.getByText('11/200')).toBeInTheDocument()
    })

    it('toggles time inputs based on all day checkbox', async () => {
      const user = userEvent.setup()
      render(<UnavailabilityForm {...mockProps} />)

      // Initially should show time inputs
      expect(screen.getByLabelText('Start Time *')).toBeInTheDocument()
      expect(screen.getByLabelText('End Time *')).toBeInTheDocument()

      // Check all day
      const allDayCheckbox = screen.getByLabelText('All day unavailability')
      await user.click(allDayCheckbox)

      // Time inputs should be hidden
      expect(screen.queryByLabelText('Start Time *')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('End Time *')).not.toBeInTheDocument()
    })
  })

  describe('PeakScheduleForm - Validation', () => {
    const mockProps = {
      isOpen: true,
      onClose: vi.fn(),
      onSubmit: vi.fn(),
      loading: false,
      existingSchedules: [],
    }

    beforeEach(() => {
      mockProps.onClose.mockReset()
      mockProps.onSubmit.mockReset()
    })

    it('renders form when open', () => {
      render(<PeakScheduleForm {...mockProps} />)

      expect(screen.getByText('Add Peak Schedule')).toBeInTheDocument()
      expect(screen.getByLabelText('Day of Week *')).toBeInTheDocument()
      expect(screen.getByLabelText('Start Time *')).toBeInTheDocument()
      expect(screen.getByLabelText('End Time *')).toBeInTheDocument()
      expect(screen.getByLabelText('Price (PKR) *')).toBeInTheDocument()
    })

    it('validates required fields', async () => {
      const user = userEvent.setup()
      render(<PeakScheduleForm {...mockProps} />)

      const submitButton = screen.getByText('Create Schedule')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Start time is required')).toBeInTheDocument()
        expect(screen.getByText('End time is required')).toBeInTheDocument()
        expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument()
      })
    })

    it('validates price range', async () => {
      const user = userEvent.setup()
      render(<PeakScheduleForm {...mockProps} />)

      const priceInput = screen.getByLabelText('Price (PKR) *')
      await user.type(priceInput, '200000') // Too high

      const submitButton = screen.getByText('Create Schedule')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Price cannot exceed PKR 100,000')).toBeInTheDocument()
      })
    })

    it('validates time range', async () => {
      const user = userEvent.setup()
      render(<PeakScheduleForm {...mockProps} />)

      const startTimeInput = screen.getByLabelText('Start Time *')
      await user.type(startTimeInput, '14:00')

      const endTimeInput = screen.getByLabelText('End Time *')
      await user.type(endTimeInput, '12:00') // Before start time

      const submitButton = screen.getByText('Create Schedule')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('End time must be after start time')).toBeInTheDocument()
      })
    })

    it('detects overlapping schedules', async () => {
      const user = userEvent.setup()
      const existingSchedules = [
        createMockPeakSchedule({ dayOfWeek: 1, startTime: '14:00', endTime: '16:00' })
      ]
      
      render(<PeakScheduleForm {...mockProps} existingSchedules={existingSchedules} />)

      // Select Monday
      const daySelect = screen.getByLabelText('Day of Week *')
      await user.click(daySelect)
      await user.click(screen.getByText('Monday'))

      // Set overlapping time
      const startTimeInput = screen.getByLabelText('Start Time *')
      await user.type(startTimeInput, '15:00')

      const endTimeInput = screen.getByLabelText('End Time *')
      await user.type(endTimeInput, '17:00')

      const priceInput = screen.getByLabelText('Price (PKR) *')
      await user.type(priceInput, '2000')

      const submitButton = screen.getByText('Create Schedule')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('This time slot overlaps with an existing peak schedule for Monday')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('displays API error messages', async () => {
      const errorMessage = 'Network error'
      mockApiCalls.getCourtSettings.mockRejectedValue(new Error(errorMessage))

      render(
        <CourtSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          court={mockCourt}
          onSettingsUpdate={vi.fn()}
        />
      )

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          type: 'error',
          title: 'Error',
          description: errorMessage,
        })
      })
    })

    it('handles form submission errors gracefully', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Validation failed'
      
      render(
        <UnavailabilityForm
          isOpen={true}
          onClose={vi.fn()}
          onSubmit={vi.fn().mockRejectedValue(new Error(errorMessage))}
          loading={false}
        />
      )

      // Fill form with valid data
      const reasonInput = screen.getByLabelText('Reason *')
      await user.type(reasonInput, 'Test reason')

      const submitButton = screen.getByText('Create')
      await user.click(submitButton)

      // Form should handle the error gracefully (error handling is in parent component)
      await waitFor(() => {
        expect(screen.getByText('Create')).toBeInTheDocument() // Form should still be open
      })
    })
  })

  describe('User Feedback', () => {
    it('shows loading states during operations', () => {
      render(
        <UnavailabilityForm
          isOpen={true}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
          loading={true}
        />
      )

      expect(screen.getByText('Creating...')).toBeInTheDocument()
      expect(screen.getByText('Creating...')).toBeDisabled()
    })

    it('shows success messages after operations', async () => {
      const user = userEvent.setup()
      mockApiCalls.updateAdvancedBookingLimit.mockResolvedValue(undefined)

      render(
        <CourtSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          court={mockCourt}
          onSettingsUpdate={vi.fn()}
        />
      )

      await waitFor(() => {
        const input = screen.getByLabelText('Days in advance')
        expect(input).toBeInTheDocument()
      })

      const input = screen.getByLabelText('Days in advance')
      await user.clear(input)
      await user.type(input, '45')

      const saveButton = screen.getByText('Save Changes')
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
})