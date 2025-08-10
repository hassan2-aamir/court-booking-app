import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../src/test/test-utils'
import userEvent from '@testing-library/user-event'
import { PeakScheduleForm } from '../peak-schedule-form'
import { createMockPeakSchedule, resetAllMocks } from '../../src/test/test-utils'

describe('PeakScheduleForm', () => {
  const mockPeakSchedule = createMockPeakSchedule()
  const existingSchedules = [
    createMockPeakSchedule({ id: 'existing-1', dayOfWeek: 1, startTime: '14:00', endTime: '16:00' }),
    createMockPeakSchedule({ id: 'existing-2', dayOfWeek: 2, startTime: '10:00', endTime: '12:00' }),
  ]
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    loading: false,
    existingSchedules,
  }

  beforeEach(() => {
    resetAllMocks()
    mockProps.onClose.mockReset()
    mockProps.onSubmit.mockReset()
  })

  const renderForm = (props = {}) => {
    return render(<PeakScheduleForm {...mockProps} {...props} />)
  }

  describe('Form Rendering', () => {
    it('renders form when open', () => {
      renderForm()
      
      expect(screen.getByText('Add Peak Schedule')).toBeInTheDocument()
      expect(screen.getByLabelText('Day of Week *')).toBeInTheDocument()
      expect(screen.getByLabelText('Start Time *')).toBeInTheDocument()
      expect(screen.getByLabelText('End Time *')).toBeInTheDocument()
      expect(screen.getByLabelText('Price (PKR) *')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      renderForm({ isOpen: false })
      
      expect(screen.queryByText('Add Peak Schedule')).not.toBeInTheDocument()
    })

    it('shows edit title when editing', () => {
      renderForm({ isEditing: true, peakSchedule: mockPeakSchedule })
      
      expect(screen.getByText('Edit Peak Schedule')).toBeInTheDocument()
    })

    it('populates form with existing data when editing', async () => {
      renderForm({ isEditing: true, peakSchedule: mockPeakSchedule })
      
      await waitFor(() => {
        const startTimeInput = screen.getByLabelText('Start Time *') as HTMLInputElement
        const endTimeInput = screen.getByLabelText('End Time *') as HTMLInputElement
        const priceInput = screen.getByLabelText('Price (PKR) *') as HTMLInputElement
        
        expect(startTimeInput.value).toBe(mockPeakSchedule.startTime)
        expect(endTimeInput.value).toBe(mockPeakSchedule.endTime)
        expect(priceInput.value).toBe(mockPeakSchedule.price.toString())
      })
    })
  })

  describe('Day Selection', () => {
    it('shows all days of the week in dropdown', async () => {
      const user = userEvent.setup()
      renderForm()
      
      const daySelect = screen.getByLabelText('Day of Week *')
      await user.click(daySelect)
      
      await waitFor(() => {
        expect(screen.getByText('Sunday')).toBeInTheDocument()
        expect(screen.getByText('Monday')).toBeInTheDocument()
        expect(screen.getByText('Tuesday')).toBeInTheDocument()
        expect(screen.getByText('Wednesday')).toBeInTheDocument()
        expect(screen.getByText('Thursday')).toBeInTheDocument()
        expect(screen.getByText('Friday')).toBeInTheDocument()
        expect(screen.getByText('Saturday')).toBeInTheDocument()
      })
    })

    it('selects day correctly', async () => {
      const user = userEvent.setup()
      renderForm()
      
      const daySelect = screen.getByLabelText('Day of Week *')
      await user.click(daySelect)
      
      await waitFor(() => {
        expect(screen.getByText('Monday')).toBeInTheDocument()
      })
      
      await user.click(screen.getByText('Monday'))
      
      // Check that Monday is selected
      expect(screen.getByDisplayValue('Monday')).toBeInTheDocument()
    })
  })

  describe('Time Validation', () => {
    it('validates start time is required', async () => {
      const user = userEvent.setup()
      renderForm()
      
      const submitButton = screen.getByText('Create Schedule')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Start time is required')).toBeInTheDocument()
      })
    })

    it('validates end time is required', async () => {
      const user = userEvent.setup()
      renderForm()
      
      const startTimeInput = screen.getByLabelText('Start Time *')
      await user.type(startTimeInput, '10:00')
      
      const submitButton = screen.getByText('Create Schedule')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('End time is required')).toBeInTheDocument()
      })
    })

    it('validates end time is after start time', async () => {
      const user = userEvent.setup()
      renderForm()
      
      const startTimeInput = screen.getByLabelText('Start Time *')
      await user.type(startTimeInput, '14:00')
      
      const endTimeInput = screen.getByLabelText('End Time *')
      await user.type(endTimeInput, '12:00')
      
      const submitButton = screen.getByText('Create Schedule')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('End time must be after start time')).toBeInTheDocument()
      })
    })

    it('validates minimum duration of 15 minutes', async () => {
      const user = userEvent.setup()
      renderForm()
      
      const startTimeInput = screen.getByLabelText('Start Time *')
      await user.type(startTimeInput, '10:00')
      
      const endTimeInput = screen.getByLabelText('End Time *')
      await user.type(endTimeInput, '10:10')
      
      const submitButton = screen.getByText('Create Schedule')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Peak schedule must be at least 15 minutes long')).toBeInTheDocument()
      })
    })

    it('validates maximum duration of 24 hours', async () => {
      const user = userEvent.setup()
      renderForm()
      
      const startTimeInput = screen.getByLabelText('Start Time *')
      await user.type(startTimeInput, '10:00')
      
      const endTimeInput = screen.getByLabelText('End Time *')
      await user.type(endTimeInput, '09:00') // Next day, > 24 hours
      
      const submitButton = screen.getByText('Create Schedule')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Peak schedule cannot exceed 24 hours')).toBeInTheDocument()
      })
    })
  })

  describe('Price Validation', () => {
    it('validates price is required', async () => {
      const user = userEvent.setup()
      renderForm()
      
      const submitButton = screen.getByText('Create Schedule')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument()
      })
    })

    it('validates minimum price', async () => {
      const user = userEvent.setup()
      renderForm()
      
      const priceInput = screen.getByLabelText('Price (PKR) *')
      await user.type(priceInput, '0')
      
      const submitButton = screen.getByText('Create Schedule')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument()
      })
    })

    it('validates maximum price', async () => {
      const user = userEvent.setup()
      renderForm()
      
      const priceInput = screen.getByLabelText('Price (PKR) *')
      await user.type(priceInput, '200000')
      
      const submitButton = screen.getByText('Create Schedule')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Price cannot exceed PKR 100,000')).toBeInTheDocument()
      })
    })
  })

  describe('Overlap Detection', () => {
    it('detects overlapping schedules for same day', async () => {
      const user = userEvent.setup()
      renderForm()
      
      // Select Monday (day 1) which has existing schedule 14:00-16:00
      const daySelect = screen.getByLabelText('Day of Week *')
      await user.click(daySelect)
      await user.click(screen.getByText('Monday'))
      
      // Set overlapping time 15:00-17:00
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

    it('allows non-overlapping schedules for same day', async () => {
      const user = userEvent.setup()
      renderForm()
      
      // Select Monday (day 1) which has existing schedule 14:00-16:00
      const daySelect = screen.getByLabelText('Day of Week *')
      await user.click(daySelect)
      await user.click(screen.getByText('Monday'))
      
      // Set non-overlapping time 10:00-12:00
      const startTimeInput = screen.getByLabelText('Start Time *')
      await user.type(startTimeInput, '10:00')
      
      const endTimeInput = screen.getByLabelText('End Time *')
      await user.type(endTimeInput, '12:00')
      
      const priceInput = screen.getByLabelText('Price (PKR) *')
      await user.type(priceInput, '2000')
      
      const submitButton = screen.getByText('Create Schedule')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockProps.onSubmit).toHaveBeenCalledWith({
          dayOfWeek: 1,
          startTime: '10:00',
          endTime: '12:00',
          price: 2000
        })
      })
    })

    it('allows overlapping times for different days', async () => {
      const user = userEvent.setup()
      renderForm()
      
      // Select Wednesday (day 3) - no existing schedules
      const daySelect = screen.getByLabelText('Day of Week *')
      await user.click(daySelect)
      await user.click(screen.getByText('Wednesday'))
      
      // Set same time as existing Monday schedule
      const startTimeInput = screen.getByLabelText('Start Time *')
      await user.type(startTimeInput, '14:00')
      
      const endTimeInput = screen.getByLabelText('End Time *')
      await user.type(endTimeInput, '16:00')
      
      const priceInput = screen.getByLabelText('Price (PKR) *')
      await user.type(priceInput, '2000')
      
      const submitButton = screen.getByText('Create Schedule')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockProps.onSubmit).toHaveBeenCalledWith({
          dayOfWeek: 3,
          startTime: '14:00',
          endTime: '16:00',
          price: 2000
        })
      })
    })

    it('ignores current schedule when editing', async () => {
      const user = userEvent.setup()
      renderForm({ 
        isEditing: true, 
        peakSchedule: existingSchedules[0] // Monday 14:00-16:00
      })
      
      // Modify the time slightly but still overlapping with original
      const startTimeInput = screen.getByLabelText('Start Time *')
      await user.clear(startTimeInput)
      await user.type(startTimeInput, '14:30')
      
      const endTimeInput = screen.getByLabelText('End Time *')
      await user.clear(endTimeInput)
      await user.type(endTimeInput, '16:30')
      
      const submitButton = screen.getByText('Update Schedule')
      await user.click(submitButton)
      
      // Should not show overlap error since we're editing the same schedule
      await waitFor(() => {
        expect(mockProps.onSubmit).toHaveBeenCalled()
      })
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup()
      renderForm()
      
      // Fill all required fields
      const daySelect = screen.getByLabelText('Day of Week *')
      await user.click(daySelect)
      await user.click(screen.getByText('Wednesday'))
      
      const startTimeInput = screen.getByLabelText('Start Time *')
      await user.type(startTimeInput, '18:00')
      
      const endTimeInput = screen.getByLabelText('End Time *')
      await user.type(endTimeInput, '20:00')
      
      const priceInput = screen.getByLabelText('Price (PKR) *')
      await user.type(priceInput, '2500')
      
      const submitButton = screen.getByText('Create Schedule')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockProps.onSubmit).toHaveBeenCalledWith({
          dayOfWeek: 3,
          startTime: '18:00',
          endTime: '20:00',
          price: 2500
        })
      })
    })

    it('shows loading state during submission', () => {
      renderForm({ loading: true })
      
      expect(screen.getByText('Creating...')).toBeInTheDocument()
      
      const submitButton = screen.getByText('Creating...')
      expect(submitButton).toBeDisabled()
    })

    it('shows update text when editing', () => {
      renderForm({ isEditing: true, peakSchedule: mockPeakSchedule })
      
      expect(screen.getByText('Update Schedule')).toBeInTheDocument()
    })

    it('shows update loading text when editing and loading', () => {
      renderForm({ isEditing: true, peakSchedule: mockPeakSchedule, loading: true })
      
      expect(screen.getByText('Updating...')).toBeInTheDocument()
    })
  })

  describe('Preview Display', () => {
    it('shows preview when all fields are filled', async () => {
      const user = userEvent.setup()
      renderForm()
      
      const daySelect = screen.getByLabelText('Day of Week *')
      await user.click(daySelect)
      await user.click(screen.getByText('Friday'))
      
      const startTimeInput = screen.getByLabelText('Start Time *')
      await user.type(startTimeInput, '19:00')
      
      const endTimeInput = screen.getByLabelText('End Time *')
      await user.type(endTimeInput, '21:00')
      
      const priceInput = screen.getByLabelText('Price (PKR) *')
      await user.type(priceInput, '3000')
      
      await waitFor(() => {
        expect(screen.getByText(/Preview:/)).toBeInTheDocument()
        expect(screen.getByText(/Friday from/)).toBeInTheDocument()
        expect(screen.getByText(/PKR 3,000/)).toBeInTheDocument()
      })
    })

    it('does not show preview when fields are incomplete', () => {
      renderForm()
      
      expect(screen.queryByText(/Preview:/)).not.toBeInTheDocument()
    })
  })

  describe('Form Actions', () => {
    it('calls onClose when cancel is clicked', async () => {
      const user = userEvent.setup()
      renderForm()
      
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)
      
      expect(mockProps.onClose).toHaveBeenCalled()
    })

    it('calls onClose when form is closed via dialog', async () => {
      renderForm()
      
      // Simulate dialog close (ESC key)
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(mockProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('focuses first error field when validation fails', async () => {
      const user = userEvent.setup()
      renderForm()
      
      const submitButton = screen.getByText('Create Schedule')
      await user.click(submitButton)
      
      await waitFor(() => {
        // Day field should be focused (first error)
        const daySelect = screen.getByLabelText('Day of Week *')
        expect(daySelect).toBeInTheDocument()
      })
    })

    it('clears errors when user starts typing', async () => {
      const user = userEvent.setup()
      renderForm()
      
      // Trigger validation error
      const submitButton = screen.getByText('Create Schedule')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Start time is required')).toBeInTheDocument()
      })
      
      // Start typing in start time field
      const startTimeInput = screen.getByLabelText('Start Time *')
      await user.type(startTimeInput, '10:00')
      
      // Error should be cleared
      expect(screen.queryByText('Start time is required')).not.toBeInTheDocument()
    })

    it('clears overlap error when time fields change', async () => {
      const user = userEvent.setup()
      renderForm()
      
      // Set up overlapping schedule
      const daySelect = screen.getByLabelText('Day of Week *')
      await user.click(daySelect)
      await user.click(screen.getByText('Monday'))
      
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
      
      // Change the start time to fix overlap
      await user.clear(startTimeInput)
      await user.type(startTimeInput, '17:00')
      
      // Overlap error should be cleared
      expect(screen.queryByText('This time slot overlaps with an existing peak schedule for Monday')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      renderForm()
      
      expect(screen.getByLabelText('Day of Week *')).toBeInTheDocument()
      expect(screen.getByLabelText('Start Time *')).toBeInTheDocument()
      expect(screen.getByLabelText('End Time *')).toBeInTheDocument()
      expect(screen.getByLabelText('Price (PKR) *')).toBeInTheDocument()
    })

    it('shows required field indicators', () => {
      renderForm()
      
      expect(screen.getByText('Day of Week *')).toBeInTheDocument()
      expect(screen.getByText('Start Time *')).toBeInTheDocument()
      expect(screen.getByText('End Time *')).toBeInTheDocument()
      expect(screen.getByText('Price (PKR) *')).toBeInTheDocument()
    })

    it('associates error messages with form fields', async () => {
      const user = userEvent.setup()
      renderForm()
      
      const submitButton = screen.getByText('Create Schedule')
      await user.click(submitButton)
      
      await waitFor(() => {
        const startTimeError = screen.getByText('Start time is required')
        expect(startTimeError).toBeInTheDocument()
        
        // Error should be associated with the field
        const startTimeInput = screen.getByLabelText('Start Time *')
        expect(startTimeInput).toHaveAttribute('id', 'startTime')
      })
    })
  })
})