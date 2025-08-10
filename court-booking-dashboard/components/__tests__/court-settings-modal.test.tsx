import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../src/test/test-utils'
import userEvent from '@testing-library/user-event'
import { CourtSettingsModal } from '../court-settings-modal'
import { createMockCourt, createMockCourtSettings, mockApiCalls, mockAddToast, resetAllMocks } from '../../src/test/test-utils'

// Mock the API functions
vi.mock('../../lib/api/courts', () => ({
  getCourtSettings: mockApiCalls.getCourtSettings,
  updateAdvancedBookingLimit: mockApiCalls.updateAdvancedBookingLimit,
  createCourtUnavailability: mockApiCalls.createCourtUnavailability,
  updateCourtUnavailability: mockApiCalls.updateCourtUnavailability,
  deleteCourtUnavailability: mockApiCalls.deleteCourtUnavailability,
  createCourtPeakSchedule: mockApiCalls.createCourtPeakSchedule,
  updateCourtPeakSchedule: mockApiCalls.updateCourtPeakSchedule,
  deleteCourtPeakSchedule: mockApiCalls.deleteCourtPeakSchedule,
}))

// Mock the form components to prevent infinite loops
vi.mock('../unavailability-form', () => ({
  UnavailabilityForm: ({ isOpen, onSubmit, onClose }: any) => {
    if (!isOpen) return null
    return (
      <div data-testid="unavailability-form" data-open={isOpen}>
        <button onClick={() => onSubmit({ date: '2025-02-15', reason: 'Test' })}>
          Submit Unavailability
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    )
  },
}))

vi.mock('../peak-schedule-form', () => ({
  PeakScheduleForm: ({ isOpen, onSubmit, onClose }: any) => {
    if (!isOpen) return null
    return (
      <div data-testid="peak-schedule-form" data-open={isOpen}>
        <button onClick={() => onSubmit({ dayOfWeek: 1, startTime: '18:00', endTime: '20:00', price: 1500 })}>
          Submit Peak Schedule
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    )
  },
}))

describe('CourtSettingsModal', () => {
  const mockCourt = createMockCourt()
  const mockSettings = createMockCourtSettings()
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    court: mockCourt,
    onSettingsUpdate: vi.fn(),
  }

  beforeEach(() => {
    resetAllMocks()
    mockProps.onClose.mockReset()
    mockProps.onSettingsUpdate.mockReset()
    mockApiCalls.getCourtSettings.mockResolvedValue(mockSettings)
  })

  const renderModal = (props = {}) => {
    return render(<CourtSettingsModal {...mockProps} {...props} />)
  }

  describe('Modal Opening and Data Loading', () => {
    it('renders modal when open', async () => {
      renderModal()
      
      await waitFor(() => {
        expect(screen.getByText(`Court Settings - ${mockCourt.name}`)).toBeInTheDocument()
      })
    })

    it('does not render when closed', () => {
      renderModal({ isOpen: false })
      
      expect(screen.queryByText(`Court Settings - ${mockCourt.name}`)).not.toBeInTheDocument()
    })

    it('loads court settings when modal opens', async () => {
      renderModal()
      
      await waitFor(() => {
        expect(mockApiCalls.getCourtSettings).toHaveBeenCalledWith(mockCourt.id)
      })
    })

    it('displays loading state while fetching settings', async () => {
      mockApiCalls.getCourtSettings.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      renderModal()
      
      expect(screen.getByText('Loading settings...')).toBeInTheDocument()
    })

    it('displays error state when loading fails', async () => {
      const errorMessage = 'Failed to load settings'
      mockApiCalls.getCourtSettings.mockRejectedValue(new Error(errorMessage))
      
      renderModal()
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
        expect(screen.getByText('Try Again')).toBeInTheDocument()
      })
    })

    it('retries loading when Try Again is clicked', async () => {
      mockApiCalls.getCourtSettings.mockRejectedValueOnce(new Error('Network error'))
      mockApiCalls.getCourtSettings.mockResolvedValueOnce(mockSettings)
      
      renderModal()
      
      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByText('Try Again'))
      
      await waitFor(() => {
        expect(mockApiCalls.getCourtSettings).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Tab Navigation', () => {
    it('displays all tabs', async () => {
      renderModal()
      
      await waitFor(() => {
        expect(screen.getByText('Booking Limit')).toBeInTheDocument()
        expect(screen.getByText('Unavailabilities')).toBeInTheDocument()
        expect(screen.getByText('Peak Pricing')).toBeInTheDocument()
      })
    })

    it('switches between tabs', async () => {
      const user = userEvent.setup()
      renderModal()
      
      await waitFor(() => {
        expect(screen.getByText('Booking Limit')).toBeInTheDocument()
      })
      
      // Click on Unavailabilities tab
      await user.click(screen.getByText('Unavailabilities'))
      
      await waitFor(() => {
        expect(screen.getByText('Court Unavailabilities')).toBeInTheDocument()
      })
      
      // Click on Peak Pricing tab
      await user.click(screen.getByText('Peak Pricing'))
      
      await waitFor(() => {
        expect(screen.getByText('Peak Pricing Schedules')).toBeInTheDocument()
      })
    })
  })

  describe('Advanced Booking Limit', () => {
    it('displays current booking limit', async () => {
      renderModal()
      
      await waitFor(() => {
        const input = screen.getByLabelText('Days in advance') as HTMLInputElement
        expect(input.value).toBe(mockSettings.advancedBookingLimit.toString())
      })
    })

    it('updates booking limit value when input changes', async () => {
      const user = userEvent.setup()
      renderModal()
      
      await waitFor(() => {
        const input = screen.getByLabelText('Days in advance')
        expect(input).toBeInTheDocument()
      })
      
      const input = screen.getByLabelText('Days in advance')
      await user.clear(input)
      await user.type(input, '45')
      
      expect((input as HTMLInputElement).value).toBe('45')
    })

    it('validates booking limit input', async () => {
      const user = userEvent.setup()
      renderModal()
      
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

    it('saves booking limit when save button is clicked', async () => {
      const user = userEvent.setup()
      mockApiCalls.updateAdvancedBookingLimit.mockResolvedValue(undefined)
      
      renderModal()
      
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

    it('handles booking limit save error', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Failed to update'
      mockApiCalls.updateAdvancedBookingLimit.mockRejectedValue(new Error(errorMessage))
      
      renderModal()
      
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
          type: 'error',
          title: 'Error',
          description: errorMessage,
        })
      })
    })
  })

  describe('Unavailabilities Management', () => {
    it('displays unavailabilities list', async () => {
      renderModal()
      
      await waitFor(() => {
        const unavailabilitiesTab = screen.getByText('Unavailabilities')
        fireEvent.click(unavailabilitiesTab)
      })
      
      await waitFor(() => {
        expect(screen.getByText('Court Unavailabilities')).toBeInTheDocument()
        expect(screen.getByText('(1 items)')).toBeInTheDocument()
        expect(screen.getByText('Maintenance')).toBeInTheDocument()
      })
    })

    it('opens add unavailability form', async () => {
      const user = userEvent.setup()
      renderModal()
      
      await waitFor(() => {
        const unavailabilitiesTab = screen.getByText('Unavailabilities')
        fireEvent.click(unavailabilitiesTab)
      })
      
      await waitFor(() => {
        const addButton = screen.getByText('Add Unavailability')
        expect(addButton).toBeInTheDocument()
      })
      
      await user.click(screen.getByText('Add Unavailability'))
      
      await waitFor(() => {
        const form = screen.getByTestId('unavailability-form')
        expect(form).toHaveAttribute('data-open', 'true')
        expect(form).toHaveAttribute('data-editing', 'false')
      })
    })

    it('creates new unavailability', async () => {
      const user = userEvent.setup()
      const newUnavailability = { id: 'new-unavail', courtId: mockCourt.id, date: '2025-02-15', reason: 'Test', isRecurring: false }
      mockApiCalls.createCourtUnavailability.mockResolvedValue(newUnavailability)
      
      renderModal()
      
      await waitFor(() => {
        const unavailabilitiesTab = screen.getByText('Unavailabilities')
        fireEvent.click(unavailabilitiesTab)
      })
      
      await user.click(screen.getByText('Add Unavailability'))
      
      await waitFor(() => {
        const submitButton = screen.getByText('Submit Unavailability')
        expect(submitButton).toBeInTheDocument()
      })
      
      await user.click(screen.getByText('Submit Unavailability'))
      
      await waitFor(() => {
        expect(mockApiCalls.createCourtUnavailability).toHaveBeenCalledWith(
          mockCourt.id,
          { date: '2025-02-15', reason: 'Test' }
        )
        expect(mockAddToast).toHaveBeenCalledWith({
          type: 'success',
          title: 'Unavailability Created',
          description: 'The unavailability has been created successfully',
        })
      })
    })

    it('deletes unavailability', async () => {
      const user = userEvent.setup()
      mockApiCalls.deleteCourtUnavailability.mockResolvedValue(undefined)
      
      renderModal()
      
      await waitFor(() => {
        const unavailabilitiesTab = screen.getByText('Unavailabilities')
        fireEvent.click(unavailabilitiesTab)
      })
      
      await waitFor(() => {
        // Find delete button (trash icon)
        const deleteButtons = screen.getAllByRole('button')
        const deleteButton = deleteButtons.find(button => 
          button.querySelector('svg') && button.getAttribute('title') === null
        )
        expect(deleteButton).toBeInTheDocument()
      })
      
      const deleteButtons = screen.getAllByRole('button')
      const deleteButton = deleteButtons.find(button => 
        button.querySelector('svg') && !button.textContent?.includes('Add') && !button.textContent?.includes('Refresh')
      )
      
      if (deleteButton) {
        await user.click(deleteButton)
        
        await waitFor(() => {
          expect(mockApiCalls.deleteCourtUnavailability).toHaveBeenCalledWith(
            mockCourt.id,
            mockSettings.unavailabilities[0].id
          )
        })
      }
    })
  })

  describe('Peak Schedules Management', () => {
    it('displays peak schedules list', async () => {
      renderModal()
      
      await waitFor(() => {
        const peakPricingTab = screen.getByText('Peak Pricing')
        fireEvent.click(peakPricingTab)
      })
      
      await waitFor(() => {
        expect(screen.getByText('Peak Pricing Schedules')).toBeInTheDocument()
        expect(screen.getByText('(1 items)')).toBeInTheDocument()
        expect(screen.getByText('Monday')).toBeInTheDocument()
      })
    })

    it('opens add peak schedule form', async () => {
      const user = userEvent.setup()
      renderModal()
      
      await waitFor(() => {
        const peakPricingTab = screen.getByText('Peak Pricing')
        fireEvent.click(peakPricingTab)
      })
      
      await waitFor(() => {
        const addButton = screen.getByText('Add Peak Schedule')
        expect(addButton).toBeInTheDocument()
      })
      
      await user.click(screen.getByText('Add Peak Schedule'))
      
      await waitFor(() => {
        const form = screen.getByTestId('peak-schedule-form')
        expect(form).toHaveAttribute('data-open', 'true')
        expect(form).toHaveAttribute('data-editing', 'false')
      })
    })

    it('creates new peak schedule', async () => {
      const user = userEvent.setup()
      const newPeakSchedule = { id: 'new-peak', courtId: mockCourt.id, dayOfWeek: 1, startTime: '18:00', endTime: '20:00', price: 1500 }
      mockApiCalls.createCourtPeakSchedule.mockResolvedValue(newPeakSchedule)
      
      renderModal()
      
      await waitFor(() => {
        const peakPricingTab = screen.getByText('Peak Pricing')
        fireEvent.click(peakPricingTab)
      })
      
      await user.click(screen.getByText('Add Peak Schedule'))
      
      await waitFor(() => {
        const submitButton = screen.getByText('Submit Peak Schedule')
        expect(submitButton).toBeInTheDocument()
      })
      
      await user.click(screen.getByText('Submit Peak Schedule'))
      
      await waitFor(() => {
        expect(mockApiCalls.createCourtPeakSchedule).toHaveBeenCalledWith(
          mockCourt.id,
          { dayOfWeek: 1, startTime: '18:00', endTime: '20:00', price: 1500 }
        )
        expect(mockAddToast).toHaveBeenCalledWith({
          type: 'success',
          title: 'Peak Schedule Created',
          description: 'The peak schedule has been created successfully',
        })
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error toast when API calls fail', async () => {
      const errorMessage = 'Network error'
      mockApiCalls.getCourtSettings.mockRejectedValue(new Error(errorMessage))
      
      renderModal()
      
      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          type: 'error',
          title: 'Error',
          description: errorMessage,
        })
      })
    })

    it('handles unavailability creation error', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Validation failed'
      mockApiCalls.createCourtUnavailability.mockRejectedValue(new Error(errorMessage))
      
      renderModal()
      
      await waitFor(() => {
        const unavailabilitiesTab = screen.getByText('Unavailabilities')
        fireEvent.click(unavailabilitiesTab)
      })
      
      await user.click(screen.getByText('Add Unavailability'))
      await user.click(screen.getByText('Submit Unavailability'))
      
      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          type: 'error',
          title: 'Creation Failed',
          description: errorMessage,
        })
      })
    })

    it('handles peak schedule creation error', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Overlap detected'
      mockApiCalls.createCourtPeakSchedule.mockRejectedValue(new Error(errorMessage))
      
      renderModal()
      
      await waitFor(() => {
        const peakPricingTab = screen.getByText('Peak Pricing')
        fireEvent.click(peakPricingTab)
      })
      
      await user.click(screen.getByText('Add Peak Schedule'))
      await user.click(screen.getByText('Submit Peak Schedule'))
      
      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          type: 'error',
          title: 'Creation Failed',
          description: errorMessage,
        })
      })
    })
  })

  describe('Modal Cleanup', () => {
    it('resets state when modal closes', async () => {
      const { rerender } = renderModal()
      
      await waitFor(() => {
        expect(screen.getByText(`Court Settings - ${mockCourt.name}`)).toBeInTheDocument()
      })
      
      // Close modal
      rerender(<CourtSettingsModal {...mockProps} isOpen={false} />)
      
      // Reopen modal
      rerender(<CourtSettingsModal {...mockProps} isOpen={true} />)
      
      await waitFor(() => {
        expect(mockApiCalls.getCourtSettings).toHaveBeenCalledTimes(2)
      })
    })

    it('calls onClose when modal is closed', async () => {
      renderModal()
      
      await waitFor(() => {
        expect(screen.getByText(`Court Settings - ${mockCourt.name}`)).toBeInTheDocument()
      })
      
      // Find and click close button (X button in dialog)
      const closeButton = screen.getByRole('button', { name: /close/i }) || 
                         document.querySelector('[data-radix-dialog-close]')
      
      if (closeButton) {
        fireEvent.click(closeButton)
        expect(mockProps.onClose).toHaveBeenCalled()
      }
    })
  })
})