import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MeshViewer from '../components/MeshViewer';

// Mock the Three.js Canvas component
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
  useThree: () => ({
    camera: {
      position: { set: vi.fn() },
      lookAt: vi.fn(),
      updateProjectionMatrix: vi.fn(),
    },
    gl: { setClearColor: vi.fn() },
  }),
  useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
}));

describe('MeshViewer', () => {
  const mockMeshData = {
    data: {
      vertices: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
      triangles: [[0, 1, 2]],
      colors: [[0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5]],
    },
    metadata: {
      algorithm: 'delaunay',
      vertices: 3,
      triangles: 1,
      alpha: 1.0,
      processing_time: 0.5,
    },
  };

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('renders loading state initially', () => {
    global.fetch.mockImplementation(() =>
      new Promise(() => {}) // Never resolves
    );

    render(<MeshViewer pointCloudId={1} />);
    
    expect(screen.getByText('Loading mesh...')).toBeInTheDocument();
  });

  it('fetches and displays mesh data successfully', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockMeshData,
    });

    render(<MeshViewer pointCloudId={1} />);

    await waitFor(() => {
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
    });

    expect(screen.getByText(/Mesh Information/i)).toBeInTheDocument();
    expect(screen.getByText(/delaunay/i)).toBeInTheDocument();
  });

  it('displays error when mesh is not found', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Mesh not found' }),
    });

    render(<MeshViewer pointCloudId={1} />);

    await waitFor(() => {
      expect(screen.getByText(/Mesh not found/i)).toBeInTheDocument();
    });
  });

  it('handles network errors gracefully', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));

    render(<MeshViewer pointCloudId={1} />);

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  it('calls onError callback when error occurs', async () => {
    const onErrorMock = vi.fn();
    
    global.fetch.mockRejectedValue(new Error('Test error'));

    render(<MeshViewer pointCloudId={1} onError={onErrorMock} />);

    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalledWith('Test error');
    });
  });

  it('displays mesh metadata correctly', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockMeshData,
    });

    render(<MeshViewer pointCloudId={1} />);

    await waitFor(() => {
      expect(screen.getByText(/Mesh Information/i)).toBeInTheDocument();
      expect(screen.getByText(/delaunay/i)).toBeInTheDocument();
      expect(screen.getByText(/Algorithm:/i)).toBeInTheDocument();
      expect(screen.getByText(/Vertices:/i)).toBeInTheDocument();
      expect(screen.getByText(/Triangles:/i)).toBeInTheDocument();
    });
  });

  it('displays reset view button', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockMeshData,
    });

    render(<MeshViewer pointCloudId={1} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Reset View/i })).toBeInTheDocument();
    });
  });

  it('displays view mode toggle buttons', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockMeshData,
    });

    render(<MeshViewer pointCloudId={1} />);

    await waitFor(() => {
      expect(screen.getByText(/Display Mode/i)).toBeInTheDocument();
      expect(screen.getByText('Mesh')).toBeInTheDocument();
      expect(screen.getByText('Points')).toBeInTheDocument();
      expect(screen.getByText('Both')).toBeInTheDocument();
    });
  });

  it('toggles view mode when clicking buttons', async () => {
    const mockPointCloudData = {
      data: {
        positions: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
        colors: [[128, 128, 128], [128, 128, 128], [128, 128, 128]],
      },
    };

    global.fetch.mockImplementation((url) => {
      if (url.includes('/mesh')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockMeshData,
        });
      } else if (url.includes('/data')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockPointCloudData,
        });
      }
    });

    render(<MeshViewer pointCloudId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Mesh')).toBeInTheDocument();
    });

    const pointsButton = screen.getByText('Points');
    fireEvent.click(pointsButton);

    // Verify button is now active
    expect(pointsButton.className).toContain('bg-blue-600');
  });

  it('displays helper toggle buttons for grid and axes', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockMeshData,
    });

    render(<MeshViewer pointCloudId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Grid')).toBeInTheDocument();
      expect(screen.getByText('Axes')).toBeInTheDocument();
    });
  });

  it('toggles grid visibility when clicking grid button', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockMeshData,
    });

    render(<MeshViewer pointCloudId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Grid')).toBeInTheDocument();
    });

    const gridButton = screen.getByText('Grid');
    const initialClass = gridButton.className;
    
    fireEvent.click(gridButton);
    
    // Verify button state changed
    expect(gridButton.className).not.toBe(initialClass);
  });

  it('displays keyboard shortcuts help', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockMeshData,
    });

    render(<MeshViewer pointCloudId={1} />);

    await waitFor(() => {
      expect(screen.getByText(/Shortcuts:/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Reset view/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/View mode/i)).toBeInTheDocument();
    });
  });

  it('handles keyboard shortcuts for view mode', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockMeshData,
    });

    render(<MeshViewer pointCloudId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Mesh')).toBeInTheDocument();
    });

    // Simulate pressing 'p' key
    fireEvent.keyDown(window, { key: 'p' });
    
    // Verify the point cloud button becomes active
    const pointsButton = screen.getByText('Points');
    await waitFor(() => {
      expect(pointsButton.className).toContain('bg-blue-600');
    });
  });

  it('calls onBack when back button is clicked', async () => {
    const onBackMock = vi.fn();
    
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockMeshData,
    });

    render(<MeshViewer pointCloudId={1} onBack={onBackMock} />);

    await waitFor(() => {
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    expect(onBackMock).toHaveBeenCalled();
  });

  it('fetches both mesh and point cloud data on mount', async () => {
    const mockPointCloudData = {
      data: {
        positions: [[0, 0, 0]],
        colors: [[128, 128, 128]],
      },
    };

    const fetchSpy = vi.fn((url) => {
      if (url.includes('/mesh')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockMeshData,
        });
      } else if (url.includes('/data')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockPointCloudData,
        });
      }
    });

    global.fetch = fetchSpy;

    render(<MeshViewer pointCloudId={1} />);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/mesh'));
      expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/data'));
    });
  });

  it('gracefully handles missing point cloud data', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/mesh')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockMeshData,
        });
      } else if (url.includes('/data')) {
        return Promise.resolve({
          ok: false,
          status: 404,
        });
      }
    });

    render(<MeshViewer pointCloudId={1} />);

    await waitFor(() => {
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
    });

    // Component should still render mesh even if point cloud data fails
    expect(screen.getByText('Mesh')).toBeInTheDocument();
    
    // Points and Both buttons should be disabled
    const pointsButton = screen.getByText('Points');
    const bothButton = screen.getByText('Both');
    expect(pointsButton).toBeDisabled();
    expect(bothButton).toBeDisabled();
  });
});
