import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PointsView from '../views/PointsView';

// Mock fetch
global.fetch = vi.fn();

// Mock PointCloudViewer component
vi.mock('../components/PointCloudViewer', () => ({
  default: ({ pointCloudId, onError }) => (
    <div data-testid="point-cloud-viewer">
      Point Cloud Viewer - ID: {pointCloudId}
    </div>
  ),
}));

// Mock MeshViewer component
vi.mock('../components/MeshViewer', () => ({
  default: ({ pointCloudId, onError }) => (
    <div data-testid="mesh-viewer">
      Mesh Viewer - ID: {pointCloudId}
    </div>
  ),
}));

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

    // Modal should display the cloud name and point cloud viewer
    await waitFor(() => {
      const allTitles = screen.getAllByText('Test Cloud 1');
      expect(allTitles.length).toBeGreaterThan(1); // One in card, one in modal
      expect(screen.getByTestId('point-cloud-viewer')).toBeInTheDocument();
    });
  });

  it('displays point cloud visualization in modal', async () => {
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

    // Verify the viewer component is rendered with correct ID
    await waitFor(() => {
      const viewer = screen.getByTestId('point-cloud-viewer');
      expect(viewer).toBeInTheDocument();
      expect(viewer).toHaveTextContent('Point Cloud Viewer - ID: 1');
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
      expect(screen.getByTestId('point-cloud-viewer')).toBeInTheDocument();
    });

    // Close button is an X icon button, click the modal close button area
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(btn => 
      btn.querySelector('path[d*="M6 18L18 6M6 6l12 12"]')
    );
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('point-cloud-viewer')).not.toBeInTheDocument();
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

  it('displays bounds metadata in detail modal when available', async () => {
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
      // Verify modal is open by checking for ID and Upload Date which are always shown
      expect(screen.getAllByText('ID:').length).toBeGreaterThan(1); // One in card, one in modal
      expect(screen.getAllByText('Upload Date:').length).toBeGreaterThan(0);
      
      // For Test Cloud 1, bounds should be displayed
      expect(screen.getByText('Bounds X:')).toBeInTheDocument();
      expect(screen.getByText('Bounds Y:')).toBeInTheDocument();
    });
  });

  it('displays algorithm selector with Delaunay and Poisson options', async () => {
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
      const algorithmSelect = screen.getByDisplayValue('Delaunay');
      expect(algorithmSelect).toBeInTheDocument();
      
      // Check that both options are available
      const options = within(algorithmSelect.parentElement).getAllByRole('option');
      expect(options.length).toBe(2);
      expect(options[0]).toHaveValue('delaunay');
      expect(options[1]).toHaveValue('poisson');
    });
  });

  it('shows Poisson parameters when Poisson algorithm is selected', async () => {
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
      const algorithmSelect = screen.getByDisplayValue('Delaunay');
      fireEvent.change(algorithmSelect, { target: { value: 'poisson' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Depth:')).toBeInTheDocument();
      expect(screen.getByText('Radius:')).toBeInTheDocument();
      expect(screen.getByText('Max NN:')).toBeInTheDocument();
    });
  });

  it('shows Alpha parameter when Delaunay algorithm is selected', async () => {
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
      // Delaunay is selected by default
      expect(screen.getByText('Alpha:')).toBeInTheDocument();
      expect(screen.queryByText('Depth:')).not.toBeInTheDocument();
    });
  });

  it('generates Poisson mesh successfully', async () => {
    const mockMeshResponse = {
      message: 'Poisson mesh generated successfully',
      data: {
        mesh_file: 'test_poisson.obj',
        vertices: 5000,
        triangles: 10000,
        processing_time: 2.5,
        algorithm: 'poisson',
        depth: 9,
        radius: 0.1,
        max_nn: 30,
        has_normals: true
      }
    };

    const mockUpdatedCloud = {
      ...mockPointClouds[0],
      mesh_file: '/media/pointclouds/test_poisson.obj',
      mesh_metadata: {
        algorithm: 'poisson',
        depth: 9,
        vertices: 5000,
        triangles: 10000,
        processing_time: 2.5
      }
    };

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockPointClouds })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMeshResponse
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockUpdatedCloud, mockPointClouds[1]] })
      });

    global.alert = vi.fn();

    renderWithRouter(<PointsView />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Cloud 1')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByText(/View Details/i);
    fireEvent.click(viewButtons[0]);

    // Wait for modal to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('point-cloud-viewer')).toBeInTheDocument();
    });

    // Change algorithm to Poisson
    const algorithmSelect = screen.getByDisplayValue('Delaunay');
    fireEvent.change(algorithmSelect, { target: { value: 'poisson' } });

    // Wait for Poisson parameters to appear
    await waitFor(() => {
      expect(screen.getByText('Depth:')).toBeInTheDocument();
    });

    // Find and click the generate button
    const generateButtons = screen.getAllByText(/Generate Mesh/i);
    fireEvent.click(generateButtons[generateButtons.length - 1]);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('Poisson mesh generated successfully')
      );
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('5,000')
      );
    });
  });

  it('generates Delaunay mesh successfully', async () => {
    const mockMeshResponse = {
      message: 'Delaunay mesh generated successfully',
      data: {
        mesh_file: 'test_delaunay.obj',
        vertices: 3000,
        triangles: 6000,
        processing_time: 1.2,
        algorithm: 'delaunay',
        alpha: 1.0
      }
    };

    const mockUpdatedCloud = {
      ...mockPointClouds[0],
      mesh_file: '/media/pointclouds/test_delaunay.obj',
      mesh_metadata: {
        algorithm: 'delaunay',
        alpha: 1.0,
        vertices: 3000,
        triangles: 6000,
        processing_time: 1.2
      }
    };

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockPointClouds })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMeshResponse
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockUpdatedCloud, mockPointClouds[1]] })
      });

    global.alert = vi.fn();

    renderWithRouter(<PointsView />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Cloud 1')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByText(/View Details/i);
    fireEvent.click(viewButtons[0]);

    // Wait for modal to be rendered by checking for point cloud viewer
    await waitFor(() => {
      expect(screen.getByTestId('point-cloud-viewer')).toBeInTheDocument();
    });

    // Find and click the generate button
    const generateButtons = screen.getAllByText(/Generate Mesh/i);
    // The one inside the modal is the second one
    fireEvent.click(generateButtons[generateButtons.length - 1]);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('Delaunay mesh generated successfully')
      );
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('3,000')
      );
    });
  });

  it('handles mesh generation error', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockPointClouds })
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to generate mesh' })
      });

    global.alert = vi.fn();

    renderWithRouter(<PointsView />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Cloud 1')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByText(/View Details/i);
    fireEvent.click(viewButtons[0]);

    // Wait for modal to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('point-cloud-viewer')).toBeInTheDocument();
    });

    // Find and click the generate button
    const generateButtons = screen.getAllByText(/Generate Mesh/i);
    fireEvent.click(generateButtons[generateButtons.length - 1]);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('Error generating mesh')
      );
    });
  });

  it('displays mesh metadata when mesh is generated', async () => {
    const mockCloudWithMesh = {
      ...mockPointClouds[0],
      mesh_file: '/media/pointclouds/test_poisson.obj',
      mesh_metadata: {
        algorithm: 'poisson',
        vertices: 5000,
        triangles: 10000
      }
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [mockCloudWithMesh] })
    });

    renderWithRouter(<PointsView />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Cloud 1')).toBeInTheDocument();
    });

    // Verify mesh button shows "View Mesh" instead of "Generate Mesh"
    const meshButtons = screen.getAllByText(/View Mesh/i);
    expect(meshButtons.length).toBeGreaterThan(0);

    // Open modal
    const viewButtons = screen.getAllByText(/View Details/i);
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      // Wait for modal to appear
      expect(screen.getByTestId('point-cloud-viewer')).toBeInTheDocument();
      
      // Check for mesh metadata in the modal
      expect(screen.getByText('Mesh Algorithm:')).toBeInTheDocument();
      expect(screen.getByText('poisson')).toBeInTheDocument();
      expect(screen.getByText('Mesh Vertices:')).toBeInTheDocument();
      expect(screen.getByText('5,000')).toBeInTheDocument();
    });
  });
});
