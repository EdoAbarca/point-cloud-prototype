import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
});
