import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddBookingModal } from '../add-booking-modal'
import * as courtsApi from '@/lib/api/courts'

// Mock the courts API
jest.mock('@/lib/api/courts')
const mockGetAvailableSlots = courtsApi.getAvailableSlots as jest.MockedFunction<typeof courtsApi.getAvailableSlots>

// Mock other dependencies
jest.mock('@/lib/api/bookings')
jest.mock('@/lib/api/users')

const mockCourt = {
  id: 'court-1',
  name: 'Test Court',
  type: 'Tennis',
  pricePerHour: 100,
  isActive: true,
  availability: [
    {
      startTime: '10:00',
      endTime: '22:00',
      dayOfWeek: 1, // Monday
    }
  ]
}

const mockProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSuccess: jest.fn(),
  courts: [mockCourt],
  booking: undefined,
  isEditMode: false
}

describe('Peak Pricing Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should display peak pricing correctly when API returns peak time slots', async () => {
    // Mock API response with peak pricing
    const mockApiResponse = [
      {
        startTime: "10:00",
        endTime: "12:00",
        isAvailable: true,
        price: 500, // Peak price
        isPeakTime: true
      },
      {
        startTime: "12:00",
        endTime: "14:00",
        isAvailable: true,
        price: 100, // Regular price
        isPeakTime: false
      }
    ]

    mockGetAvailableSlots.mockResolvedValue(mockApiResponse)

    const user = userEvent.setup()
    render(<AddBookingModal {...mockProps} />)

    // Select a court first
    const courtSelect = screen.getByRole('combobox')
    await user.click(courtSelect)
    
    const courtOption = screen.getByText('Test Court')
    await user.click(courtOption)

    // Select a date (assuming there's a date picker)
    // This would need to be adjusted based on your actual date picker implementation
    
    // Wait for slots to load
    await waitFor(() => {
      // Check that peak time slot shows higher price
      expect(screen.getByText(/PKR 500/)).toBeInTheDocument()
      
      // Check that regular time slot shows regular price
      expect(screen.getByText(/PKR 100/)).toBeInTheDocument()
      
      // Check that peak time indicator is shown
      expect(screen.getByText('Peak')).toBeInTheDocument()
      
      // Check that peak time slot has the "(Peak)" indicator
      expect(screen.getByText('(Peak)')).toBeInTheDocument()
    })

    // Verify API was called correctly
    expect(mockGetAvailableSlots).toHaveBeenCalledWith('court-1', expect.any(String))
  })

  it('should fallback to court price when API does not return price', async () => {
    // Mock API response without price information (backward compatibility)
    const mockApiResponse = [
      {
        startTime: "10:00",
        endTime: "12:00",
        isAvailable: true
        // No price or isPeakTime fields
      }
    ]

    mockGetAvailableSlots.mockResolvedValue(mockApiResponse)

    const user = userEvent.setup()
    render(<AddBookingModal {...mockProps} />)

    // Select a court
    const courtSelect = screen.getByRole('combobox')
    await user.click(courtSelect)
    
    const courtOption = screen.getByText('Test Court')
    await user.click(courtOption)

    // Wait for slots to load
    await waitFor(() => {
      // Should show court's default price
      expect(screen.getByText(/PKR 100/)).toBeInTheDocument()
      
      // Should not show peak indicators
      expect(screen.queryByText('Peak')).not.toBeInTheDocument()
      expect(screen.queryByText('(Peak)')).not.toBeInTheDocument()
    })
  })
})