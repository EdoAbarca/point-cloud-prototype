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
      
      // Check that all algorithm options are available (Delaunay, Poisson, Threshold)
      const options = within(algorithmSelect.parentElement).getAllByRole('option');
      expect(options.length).toBe(3);
      expect(options[0]).toHaveValue('delaunay');
      expect(options[1]).toHaveValue('poisson');
      expect(options[2]).toHaveValue('threshold');
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

  it('displays threshold algorithm option in algorithm selector', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockPointClouds })
    });

    renderWithRouter(<PointsView />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Cloud 1')).toBeInTheDocument();
    });

    // Open modal
    const viewButtons = screen.getAllByText(/View Details/i);
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('point-cloud-viewer')).toBeInTheDocument();
    });

    // Find algorithm selector (it's a select without proper htmlFor association)
    const selects = screen.getAllByRole('combobox');
    const algorithmSelector = selects.find(select => select.value === 'delaunay' || select.value === 'poisson' || select.value === 'threshold');
    expect(algorithmSelector).toBeInTheDocument();

    // Check if threshold option is available
    const thresholdOption = within(algorithmSelector).getByText('Threshold');
    expect(thresholdOption).toBeInTheDocument();
  });

  it('shows threshold parameter controls when threshold algorithm is selected', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockPointClouds })
    });

    renderWithRouter(<PointsView />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Cloud 1')).toBeInTheDocument();
    });

    // Open modal
    const viewButtons = screen.getAllByText(/View Details/i);
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('point-cloud-viewer')).toBeInTheDocument();
    });

    // Select threshold algorithm
    const selects = screen.getAllByRole("combobox"); const algorithmSelector = selects[0];
    fireEvent.change(algorithmSelector, { target: { value: 'threshold' } });

    await waitFor(() => {
      // Check for threshold-specific controls
      const thresholdInputs = screen.getAllByRole("slider"); expect(thresholdInputs.length).toBeGreaterThan(0);
      
      // Check that both Alpha and Threshold controls are present
      const alphaLabels = screen.getAllByText(/Alpha:/i);
      expect(alphaLabels.length).toBeGreaterThan(0);
    });
  });

  it('successfully generates threshold mesh with default parameters', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockPointClouds })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Threshold mesh generated successfully',
          data: {
            mesh_file: 'test_threshold.obj',
            vertices: 3500,
            triangles: 7000,
            processing_time: 2.5,
            algorithm: 'threshold',
            threshold: 0.5,
            alpha: 1.0,
            filtering_stats: {
              points_original: 24000,
              points_filtered: 18000,
              points_removed: 6000,
              removal_percentage: 25.0
            }
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          data: [{
            ...mockPointClouds[0],
            mesh_file: '/media/pointclouds/test_threshold.obj',
            mesh_metadata: {
              algorithm: 'threshold',
              vertices: 3500,
              triangles: 7000
            }
          }]
        })
      });

    global.alert = vi.fn();

    renderWithRouter(<PointsView />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Cloud 1')).toBeInTheDocument();
    });

    // Open modal
    const viewButtons = screen.getAllByText(/View Details/i);
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('point-cloud-viewer')).toBeInTheDocument();
    });

    // Select threshold algorithm
    const selects = screen.getAllByRole("combobox"); const algorithmSelector = selects[0];
    fireEvent.change(algorithmSelector, { target: { value: 'threshold' } });

    await waitFor(() => {
      const thresholdInputs = screen.getAllByRole("slider"); expect(thresholdInputs.length).toBeGreaterThan(0);
    });

    // Click generate mesh button
    const generateButtons = screen.getAllByText(/Generate Mesh/i);
    fireEvent.click(generateButtons[generateButtons.length - 1]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/point_cloud/1/threshold',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            threshold: 0.5,
            alpha: 1.0
          })
        })
      );
    });

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('Threshold mesh generated successfully')
      );
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('Filtering Stats')
      );
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('Original Points: 24,000')
      );
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('Removed: 6,000 (25%)')
      );
    });
  });

  it('allows adjusting threshold parameter via slider', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockPointClouds })
    });

    renderWithRouter(<PointsView />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Cloud 1')).toBeInTheDocument();
    });

    // Open modal
    const viewButtons = screen.getAllByText(/View Details/i);
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('point-cloud-viewer')).toBeInTheDocument();
    });

    // Select threshold algorithm
    const selects = screen.getAllByRole("combobox"); const algorithmSelector = selects[0];
    fireEvent.change(algorithmSelector, { target: { value: 'threshold' } });

    await waitFor(() => {
      const thresholdInputs = screen.getAllByRole("slider"); expect(thresholdInputs.length).toBeGreaterThan(0);
    });

    // Find and adjust the threshold slider
    const thresholdSlider = screen.getByRole("slider");
    fireEvent.change(thresholdSlider, { target: { value: '1.2' } });

    await waitFor(() => {
      // Check that the value display updated
      expect(screen.getByText('1.2')).toBeInTheDocument();
    });
  });

  it('generates threshold mesh with custom parameters', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockPointClouds })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Threshold mesh generated successfully',
          data: {
            mesh_file: 'test_threshold.obj',
            vertices: 2500,
            triangles: 5000,
            processing_time: 1.8,
            algorithm: 'threshold',
            threshold: 1.5,
            alpha: 2.0,
            filtering_stats: {
              points_original: 24000,
              points_filtered: 12000,
              points_removed: 12000,
              removal_percentage: 50.0
            }
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockPointClouds })
      });

    global.alert = vi.fn();

    renderWithRouter(<PointsView />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Cloud 1')).toBeInTheDocument();
    });

    // Open modal
    const viewButtons = screen.getAllByText(/View Details/i);
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('point-cloud-viewer')).toBeInTheDocument();
    });

    // Select threshold algorithm
    const selects = screen.getAllByRole("combobox"); const algorithmSelector = selects[0];
    fireEvent.change(algorithmSelector, { target: { value: 'threshold' } });

    await waitFor(() => {
      const thresholdInputs = screen.getAllByRole("slider"); expect(thresholdInputs.length).toBeGreaterThan(0);
    });

    // Set custom threshold value
    const thresholdSlider = screen.getByRole("slider");
    fireEvent.change(thresholdSlider, { target: { value: '1.5' } });

    // Set custom alpha value
    const alphaInputs = screen.getAllByRole("spinbutton"); // number inputs
    const thresholdAlphaInput = alphaInputs[alphaInputs.length - 1];
    fireEvent.change(thresholdAlphaInput, { target: { value: '2.0' } });

    // Click generate mesh button
    const generateButtons = screen.getAllByText(/Generate Mesh/i);
    fireEvent.click(generateButtons[generateButtons.length - 1]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/point_cloud/1/threshold',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            threshold: 1.5,
            alpha: 2.0
          })
        })
      );
    });
  });

  it('displays threshold mesh metadata including filtering statistics', async () => {
    const mockCloudWithThresholdMesh = {
      ...mockPointClouds[0],
      mesh_file: '/media/pointclouds/test_threshold.obj',
      mesh_metadata: {
        algorithm: 'threshold',
        vertices: 3500,
        triangles: 7000,
        threshold: 0.8,
        alpha: 1.2,
        points_original: 24000,
        points_filtered: 18000,
        points_removed: 6000,
        removal_percentage: 25.0
      }
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [mockCloudWithThresholdMesh] })
    });

    renderWithRouter(<PointsView />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Cloud 1')).toBeInTheDocument();
    });

    // Open modal
    const viewButtons = screen.getAllByText(/View Details/i);
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      // Check for threshold-specific metadata
      expect(screen.getByText('Mesh Algorithm:')).toBeInTheDocument();
      expect(screen.getByText('threshold')).toBeInTheDocument();
      expect(screen.getByText('Points Filtered:')).toBeInTheDocument();
      expect(screen.getByText('Removed:')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();
    });
  });

  it('switches to mesh view after successful threshold mesh generation', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockPointClouds })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Threshold mesh generated successfully',
          data: {
            mesh_file: 'test_threshold.obj',
            vertices: 3500,
            triangles: 7000,
            processing_time: 2.5,
            algorithm: 'threshold',
            threshold: 0.5,
            alpha: 1.0,
            filtering_stats: {
              points_original: 24000,
              points_filtered: 18000,
              points_removed: 6000,
              removal_percentage: 25.0
            }
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          data: [{
            ...mockPointClouds[0],
            mesh_file: '/media/pointclouds/test_threshold.obj',
            mesh_metadata: {
              algorithm: 'threshold',
              vertices: 3500,
              triangles: 7000
            }
          }]
        })
      });

    global.alert = vi.fn();

    renderWithRouter(<PointsView />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Cloud 1')).toBeInTheDocument();
    });

    // Open modal
    const viewButtons = screen.getAllByText(/View Details/i);
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('point-cloud-viewer')).toBeInTheDocument();
    });

    // Select threshold algorithm
    const selects = screen.getAllByRole("combobox"); const algorithmSelector = selects[0];
    fireEvent.change(algorithmSelector, { target: { value: 'threshold' } });

    await waitFor(() => {
      const thresholdInputs = screen.getAllByRole("slider"); expect(thresholdInputs.length).toBeGreaterThan(0);
    });

    // Generate mesh
    const generateButtons = screen.getAllByText(/Generate Mesh/i);
    fireEvent.click(generateButtons[generateButtons.length - 1]);

    // Wait for mesh to be generated and view to switch
    await waitFor(() => {
      expect(screen.getByTestId('mesh-viewer')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  describe('View Toggle Functionality (US-06)', () => {
    it('displays toggle buttons for point cloud and mesh views', async () => {
      const mockCloudWithMesh = {
        ...mockPointClouds[0],
        mesh_file: '/media/pointclouds/test_mesh.obj',
        mesh_metadata: {
          algorithm: 'delaunay',
          vertices: 1000,
          triangles: 2000
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

      // Open modal
      const viewButtons = screen.getAllByText(/View Details/i);
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Point Cloud')).toBeInTheDocument();
        expect(screen.getByText('Mesh View')).toBeInTheDocument();
      });
    });

    it('starts with point cloud view by default', async () => {
      const mockCloudWithMesh = {
        ...mockPointClouds[0],
        mesh_file: '/media/pointclouds/test_mesh.obj',
        mesh_metadata: {
          algorithm: 'delaunay',
          vertices: 1000,
          triangles: 2000
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

      const viewButtons = screen.getAllByText(/View Details/i);
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('point-cloud-viewer')).toBeInTheDocument();
        expect(screen.queryByTestId('mesh-viewer')).not.toBeInTheDocument();
      });
    });

    it('toggles from point cloud to mesh view when mesh exists', async () => {
      const mockCloudWithMesh = {
        ...mockPointClouds[0],
        mesh_file: '/media/pointclouds/test_mesh.obj',
        mesh_metadata: {
          algorithm: 'delaunay',
          vertices: 1000,
          triangles: 2000
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

      const viewButtons = screen.getAllByText(/View Details/i);
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('point-cloud-viewer')).toBeInTheDocument();
      });

      // Click Mesh View toggle button
      const meshViewButton = screen.getByText('Mesh View');
      fireEvent.click(meshViewButton);

      await waitFor(() => {
        expect(screen.getByTestId('mesh-viewer')).toBeInTheDocument();
        expect(screen.queryByTestId('point-cloud-viewer')).not.toBeInTheDocument();
      });
    });

    it('toggles back from mesh to point cloud view', async () => {
      const mockCloudWithMesh = {
        ...mockPointClouds[0],
        mesh_file: '/media/pointclouds/test_mesh.obj',
        mesh_metadata: {
          algorithm: 'delaunay',
          vertices: 1000,
          triangles: 2000
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

      const viewButtons = screen.getAllByText(/View Details/i);
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('point-cloud-viewer')).toBeInTheDocument();
      });

      // Toggle to mesh view
      const meshViewButton = screen.getByText('Mesh View');
      fireEvent.click(meshViewButton);

      await waitFor(() => {
        expect(screen.getByTestId('mesh-viewer')).toBeInTheDocument();
      });

      // Toggle back to point cloud view
      const pointCloudButton = screen.getByText('Point Cloud');
      fireEvent.click(pointCloudButton);

      await waitFor(() => {
        expect(screen.getByTestId('point-cloud-viewer')).toBeInTheDocument();
        expect(screen.queryByTestId('mesh-viewer')).not.toBeInTheDocument();
      });
    });

    it('disables mesh view button when no mesh has been generated', async () => {
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
        const meshViewButton = screen.getByText('Mesh View');
        expect(meshViewButton).toBeDisabled();
      });
    });

    it('mesh view button is disabled when no mesh is generated', async () => {
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
        const meshViewButton = screen.getByText('Mesh View');
        expect(meshViewButton).toBeDisabled();
        expect(meshViewButton).toHaveClass('opacity-50', 'cursor-not-allowed');
      });
    });

    it('displays mesh immediately after generation without page reload', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockPointClouds })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            message: 'Delaunay mesh generated successfully',
            data: {
              mesh_file: 'test_delaunay.obj',
              vertices: 1000,
              triangles: 2000,
              processing_time: 1.5,
              algorithm: 'delaunay'
            }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            data: [{
              ...mockPointClouds[0],
              mesh_file: '/media/pointclouds/test_delaunay.obj',
              mesh_metadata: {
                algorithm: 'delaunay',
                vertices: 1000,
                triangles: 2000
              }
            }]
          })
        });

      global.alert = vi.fn();

      renderWithRouter(<PointsView />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Cloud 1')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByText(/View Details/i);
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('point-cloud-viewer')).toBeInTheDocument();
      });

      // Generate mesh
      const generateButtons = screen.getAllByText(/Generate Mesh/i);
      fireEvent.click(generateButtons[generateButtons.length - 1]);

      // Should automatically switch to mesh view after generation
      await waitFor(() => {
        expect(screen.getByTestId('mesh-viewer')).toBeInTheDocument();
        expect(screen.queryByTestId('point-cloud-viewer')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('maintains toggle state when switching between multiple point clouds', async () => {
      const mockCloudWithMesh1 = {
        ...mockPointClouds[0],
        mesh_file: '/media/pointclouds/test_mesh1.obj',
        mesh_metadata: {
          algorithm: 'delaunay',
          vertices: 1000,
          triangles: 2000
        }
      };

      const mockCloudWithMesh2 = {
        ...mockPointClouds[1],
        mesh_file: '/media/pointclouds/test_mesh2.obj',
        mesh_metadata: {
          algorithm: 'poisson',
          vertices: 1500,
          triangles: 3000
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockCloudWithMesh1, mockCloudWithMesh2] })
      });

      renderWithRouter(<PointsView />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Cloud 1')).toBeInTheDocument();
        expect(screen.getByText('Test Cloud 2')).toBeInTheDocument();
      });

      // Open first cloud
      const viewButtons = screen.getAllByText(/View Details/i);
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('point-cloud-viewer')).toBeInTheDocument();
      });

      // Toggle to mesh view
      const meshViewButton = screen.getByText('Mesh View');
      fireEvent.click(meshViewButton);

      await waitFor(() => {
        expect(screen.getByTestId('mesh-viewer')).toBeInTheDocument();
      });

      // Close modal
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find(btn => 
        btn.querySelector('path[d*="M6 18L18 6M6 6l12 12"]')
      );
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('mesh-viewer')).not.toBeInTheDocument();
      });

      // Open second cloud - should start with point cloud view (default)
      const newViewButtons = screen.getAllByText(/View Details/i);
      fireEvent.click(newViewButtons[1]);

      await waitFor(() => {
        expect(screen.getByTestId('point-cloud-viewer')).toBeInTheDocument();
        expect(screen.queryByTestId('mesh-viewer')).not.toBeInTheDocument();
      });
    });
  });
});
