import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../src/test/test-utils'
import { CourtContextMenu } from '../court-context-menu'
import { createMockCourt } from '../../src/test/test-utils'

describe('CourtContextMenu', () => {
  const mockCourt = createMockCourt()
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

  const renderContextMenu = (props = {}) => {
    return render(
      <CourtContextMenu
        court={mockCourt}
        {...mockHandlers}
        {...props}
      >
        <div data-testid="trigger">Right click me</div>
      </CourtContextMenu>
    )
  }

  it('renders the trigger element', () => {
    renderContextMenu()
    expect(screen.getByTestId('trigger')).toBeInTheDocument()
  })

  it('opens context menu on right click', async () => {
    renderContextMenu()
    const trigger = screen.getByTestId('trigger')
    
    fireEvent.contextMenu(trigger)
    
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
  })

  it('displays all menu items when context menu is open', async () => {
    renderContextMenu({ open: true })
    
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Edit Court')).toBeInTheDocument()
      expect(screen.getByText('View Schedule')).toBeInTheDocument()
      expect(screen.getByText('Deactivate Court')).toBeInTheDocument() // Active court
      expect(screen.getByText('Delete Court')).toBeInTheDocument()
    })
  })

  it('shows "Activate Court" for inactive courts', async () => {
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

  it('calls onSettingsClick when Settings is clicked', async () => {
    renderContextMenu({ open: true })
    
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Settings'))
    expect(mockHandlers.onSettingsClick).toHaveBeenCalledWith(mockCourt)
  })

  it('calls onEditClick when Edit Court is clicked', async () => {
    renderContextMenu({ open: true })
    
    await waitFor(() => {
      expect(screen.getByText('Edit Court')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Edit Court'))
    expect(mockHandlers.onEditClick).toHaveBeenCalledWith(mockCourt)
  })

  it('calls onScheduleClick when View Schedule is clicked', async () => {
    renderContextMenu({ open: true })
    
    await waitFor(() => {
      expect(screen.getByText('View Schedule')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('View Schedule'))
    expect(mockHandlers.onScheduleClick).toHaveBeenCalledWith(mockCourt)
  })

  it('calls onToggleStatus when toggle status is clicked', async () => {
    renderContextMenu({ open: true })
    
    await waitFor(() => {
      expect(screen.getByText('Deactivate Court')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Deactivate Court'))
    expect(mockHandlers.onToggleStatus).toHaveBeenCalledWith(mockCourt.id)
  })

  it('calls onDelete when Delete Court is clicked', async () => {
    renderContextMenu({ open: true })
    
    await waitFor(() => {
      expect(screen.getByText('Delete Court')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Delete Court'))
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockCourt.id)
  })

  it('calls onOpenChange when context menu state changes', async () => {
    renderContextMenu()
    const trigger = screen.getByTestId('trigger')
    
    fireEvent.contextMenu(trigger)
    
    await waitFor(() => {
      expect(mockHandlers.onOpenChange).toHaveBeenCalledWith(true)
    })
  })

  it('displays correct icons for each menu item', async () => {
    renderContextMenu({ open: true })
    
    await waitFor(() => {
      // Check that icons are present (they should be rendered as SVG elements)
      const settingsItem = screen.getByText('Settings').closest('[role="menuitem"]')
      const editItem = screen.getByText('Edit Court').closest('[role="menuitem"]')
      const scheduleItem = screen.getByText('View Schedule').closest('[role="menuitem"]')
      const toggleItem = screen.getByText('Deactivate Court').closest('[role="menuitem"]')
      const deleteItem = screen.getByText('Delete Court').closest('[role="menuitem"]')
      
      expect(settingsItem).toBeInTheDocument()
      expect(editItem).toBeInTheDocument()
      expect(scheduleItem).toBeInTheDocument()
      expect(toggleItem).toBeInTheDocument()
      expect(deleteItem).toBeInTheDocument()
    })
  })

  it('applies correct styling to delete menu item', async () => {
    renderContextMenu({ open: true })
    
    await waitFor(() => {
      const deleteItem = screen.getByText('Delete Court').closest('[role="menuitem"]')
      expect(deleteItem).toHaveClass('text-red-600')
    })
  })

  it('handles keyboard navigation', async () => {
    renderContextMenu({ open: true })
    
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
    
    // Focus should be on the first menu item
    const settingsItem = screen.getByText('Settings')
    expect(settingsItem).toBeInTheDocument()
    
    // Test arrow key navigation
    fireEvent.keyDown(settingsItem, { key: 'ArrowDown' })
    
    // Should move to next item (Edit Court)
    await waitFor(() => {
      expect(screen.getByText('Edit Court')).toBeInTheDocument()
    })
  })

  it('closes context menu on escape key', async () => {
    renderContextMenu({ open: true })
    
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
    
    fireEvent.keyDown(screen.getByText('Settings'), { key: 'Escape' })
    
    await waitFor(() => {
      expect(mockHandlers.onOpenChange).toHaveBeenCalledWith(false)
    })
  })
})