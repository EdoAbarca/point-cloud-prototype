import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PointsView from '../views/PointsView';

// Mock fetch
global.fetch = vi.fn();

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

const mockPointClouds = [
  {
    id: 1,
    name: 'Test Cloud 1',
    num_points: 24000,
    upload_date: '2025-01-15T10:30:00Z',
    file: '/media/pointclouds/test1.pts',
    metadata: {
      bounds: {
        x: { min: -0.5, max: 0.5 },
        y: { min: -0.5, max: 0.5 },
        z: { min: -0.5, max: 0.5 }
      }
    }
  },
  {
    id: 2,
    name: 'Test Cloud 2',
    num_points: 50000,
    upload_date: '2025-01-14T09:00:00Z',
    file: '/media/pointclouds/test2.pts',
    metadata: {}
  }
];

describe('PointsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithRouter(<PointsView />);
    
    expect(screen.getByText(/Loading point clouds.../i)).toBeInTheDocument();
  });

  it('fetches and displays point clouds', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockPointClouds })
    });

    renderWithRouter(<PointsView />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Cloud 1')).toBeInTheDocument();
      expect(screen.getByText('Test Cloud 2')).toBeInTheDocument();
    });

    // Points are displayed as formatted numbers (24,000 and 50,000)
    expect(screen.getByText('24,000')).toBeInTheDocument();
    expect(screen.getByText('50,000')).toBeInTheDocument();
  });

  it('shows empty state when no point clouds exist', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] })
    });

    renderWithRouter(<PointsView />);
    
    await waitFor(() => {
      expect(screen.getByText(/No point clouds uploaded yet/i)).toBeInTheDocument();
    });
  });

  it('shows error message on fetch failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Failed to fetch point clouds' })
    });

    renderWithRouter(<PointsView />);
    
    await waitFor(() => {
      // Error appears twice - "Error:" label and "Error: [status] - [message]" message
      const errorElements = screen.getAllByText(/Error:/i);
      expect(errorElements.length).toBeGreaterThan(0);
      expect(screen.getByText(/undefined - undefined/i)).toBeInTheDocument();
    });
  });

  it('opens detail modal when clicking view details button', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockPointClouds })
    });

    renderWithRouter(<PointsView />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Cloud 1')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByText(/View Details/i);
    fireEvent.click(viewButtons[0]);

    // Modal should display the cloud name and "Number of Points" label
    await waitFor(() => {
      const allTitles = screen.getAllByText('Test Cloud 1');
      expect(allTitles.length).toBeGreaterThan(1); // One in card, one in modal
      expect(screen.getByText(/Number of Points:/i)).toBeInTheDocument();
    });
  });

  it('closes detail modal when clicking close button', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockPointClouds })
    });

    renderWithRouter(<PointsView />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Cloud 1')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByText(/View Details/i);
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Number of Points:/i)).toBeInTheDocument();
    });

    // Close button is an X icon button, click the modal close button area
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(btn => 
      btn.querySelector('path[d*="M6 18L18 6M6 6l12 12"]')
    );
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText(/Number of Points:/i)).not.toBeInTheDocument();
    });
  });

  it('deletes point cloud when clicking delete button', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockPointClouds })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Deleted successfully' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockPointClouds[1]] })
      });

    // Mock window.confirm
    global.confirm = vi.fn(() => true);

    renderWithRouter(<PointsView />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Cloud 1')).toBeInTheDocument();
    });

    // Delete button is an SVG icon with title="Delete"
    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(global.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this point cloud?'
    );

    await waitFor(() => {
      expect(screen.queryByText('Test Cloud 1')).not.toBeInTheDocument();
      expect(screen.getByText('Test Cloud 2')).toBeInTheDocument();
    });
  });

  it('does not delete when cancel is clicked in confirmation', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockPointClouds })
    });

    // Mock window.confirm to return false
    global.confirm = vi.fn(() => false);

    renderWithRouter(<PointsView />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Cloud 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(global.confirm).toHaveBeenCalled();

    // Cloud should still be there
    expect(screen.getByText('Test Cloud 1')).toBeInTheDocument();
  });

  it('shows error message when delete fails', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockPointClouds })
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Failed to delete' })
      });

    // Mock window.alert
    global.alert = vi.fn();
    global.confirm = vi.fn(() => true);

    renderWithRouter(<PointsView />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Cloud 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('Failed to delete')
      );
    });
  });

  it('formats dates correctly', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockPointClouds })
    });

    renderWithRouter(<PointsView />);
    
    await waitFor(() => {
      // Should display formatted date (will vary based on locale)
      expect(screen.getByText(/1\/15\/2025|15\/01\/2025/i)).toBeInTheDocument();
    });
  });

  it('displays metadata in detail modal', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockPointClouds })
    });

    renderWithRouter(<PointsView />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Cloud 1')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByText(/View Details/i);
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Metadata')).toBeInTheDocument();
      // Check that the metadata object structure is rendered
      const modalContent = screen.getByText('Metadata').closest('div').parentElement;
      expect(modalContent.textContent).toContain('bounds');
    });
  });
});
