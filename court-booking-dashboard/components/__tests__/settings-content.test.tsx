import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SettingsContent } from '../settings-content'
import { settingsApi } from '@/lib/api/settings'

// Mock the settings API
jest.mock('@/lib/api/settings', () => ({
  settingsApi: {
    getBusinessSettings: jest.fn(),
    createBusinessSettings: jest.fn(),
    updateBusinessSettings: jest.fn(),
  },
}))

// Mock the toast provider
const mockAddToast = jest.fn()
jest.mock('@/components/toast-provider', () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
}))

const mockSettingsApi = settingsApi as jest.Mocked<typeof settingsApi>

describe('SettingsContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    mockSettingsApi.getBusinessSettings.mockImplementation(() => new Promise(() => {}))
    
    render(<SettingsContent />)
    
    expect(screen.getByText('Loading settings...')).toBeInTheDocument()
  })

  it('loads existing settings successfully', async () => {
    const mockSettings = {
      businessName: 'Test Business',
      phone: '+1234567890',
      email: 'test@example.com',
      businessHours: { start: '09:00', end: '18:00' },
      maxBookingsPerUser: 3,
      defaultDuration: '1',
      advanceBookingLimit: 30,
    }

    mockSettingsApi.getBusinessSettings.mockResolvedValue(mockSettings)

    render(<SettingsContent />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Business')).toBeInTheDocument()
      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument()
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
    })
  })

  it('handles settings not found gracefully', async () => {
    mockSettingsApi.getBusinessSettings.mockRejectedValue(new Error('Settings not found'))

    render(<SettingsContent />)

    await waitFor(() => {
      // Should show default values
      expect(screen.getByDisplayValue('CourtBook Sports Complex')).toBeInTheDocument()
      expect(screen.getByDisplayValue('+92 300 1234567')).toBeInTheDocument()
      expect(screen.getByDisplayValue('info@courtbook.com')).toBeInTheDocument()
    })

    // Should not show error toast for settings not found
    expect(mockAddToast).not.toHaveBeenCalled()
  })

  it('creates new settings when none exist', async () => {
    mockSettingsApi.getBusinessSettings.mockRejectedValue(new Error('Settings not found'))
    mockSettingsApi.createBusinessSettings.mockResolvedValue({
      businessName: 'New Business',
      phone: '+1111111111',
      email: 'new@example.com',
      businessHours: { start: '08:00', end: '20:00' },
      maxBookingsPerUser: 3,
      defaultDuration: '1',
      advanceBookingLimit: 30,
    })

    render(<SettingsContent />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('CourtBook Sports Complex')).toBeInTheDocument()
    })

    // Change business name
    const businessNameInput = screen.getByDisplayValue('CourtBook Sports Complex')
    fireEvent.change(businessNameInput, { target: { value: 'New Business' } })

    // Click save
    const saveButton = screen.getByText('Save Changes')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockSettingsApi.createBusinessSettings).toHaveBeenCalled()
      expect(mockAddToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Settings created successfully',
      })
    })
  })

  it('updates existing settings', async () => {
    const existingSettings = {
      businessName: 'Existing Business',
      phone: '+1234567890',
      email: 'existing@example.com',
      businessHours: { start: '09:00', end: '18:00' },
      maxBookingsPerUser: 3,
      defaultDuration: '1',
      advanceBookingLimit: 30,
    }

    mockSettingsApi.getBusinessSettings.mockResolvedValue(existingSettings)
    mockSettingsApi.updateBusinessSettings.mockResolvedValue({
      ...existingSettings,
      businessName: 'Updated Business',
    })

    render(<SettingsContent />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Business')).toBeInTheDocument()
    })

    // Change business name
    const businessNameInput = screen.getByDisplayValue('Existing Business')
    fireEvent.change(businessNameInput, { target: { value: 'Updated Business' } })

    // Click save
    const saveButton = screen.getByText('Save Changes')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockSettingsApi.updateBusinessSettings).toHaveBeenCalled()
      expect(mockAddToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Settings updated successfully',
      })
    })
  })
})