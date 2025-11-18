import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PointCloudViewer from '../components/PointCloudViewer';

// Mock fetch
global.fetch = vi.fn();

// Mock Three.js and React Three Fiber components
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, onCreated }) => {
    // Simulate canvas creation
    if (onCreated) {
      onCreated({ 
        gl: { 
          setClearColor: vi.fn(),
          render: vi.fn(),
        },
        scene: {},
        camera: {},
      });
    }
    return <div data-testid="canvas">{children}</div>;
  },
  useThree: () => ({
    camera: {
      position: { set: vi.fn() },
      lookAt: vi.fn(),
      updateProjectionMatrix: vi.fn(),
    },
    gl: {
      render: vi.fn(),
    },
  }),
  useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: ({ ref }) => {
    // Mock OrbitControls with a reset method
    if (ref && typeof ref === 'object') {
      ref.current = { reset: vi.fn() };
    }
    return <div data-testid="orbit-controls" />;
  },
}));

vi.mock('three', () => ({
  BufferGeometry: class BufferGeometry {
    setAttribute = vi.fn();
    computeBoundingSphere = vi.fn();
    dispose = vi.fn();
    boundingSphere = {
      center: { x: 0, y: 0, z: 0 },
      radius: 1,
    };
  },
  BufferAttribute: class BufferAttribute {
    constructor(array, itemSize) {
      this.array = array;
      this.itemSize = itemSize;
    }
  },
  Float32Array: Float32Array,
}));

const mockPointCloudData = {
  message: 'Point cloud data retrieved successfully',
  name: 'Test Cloud',
  num_points: 1000,
  data: {
    positions: [
      [0, 0, 0],
      [1, 1, 1],
      [2, 2, 2],
    ],
    colors: [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
    ],
  },
};

describe('PointCloudViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<PointCloudViewer pointCloudId={1} />);
    
    expect(screen.getByText(/Loading point cloud.../i)).toBeInTheDocument();
  });

  it('fetches and displays point cloud data', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPointCloudData,
    });

    render(<PointCloudViewer pointCloudId={1} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
    });

    // Verify fetch was called with correct URL
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:8000/api/point_cloud/1/data')
    );
  });

  it('displays error message on fetch failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<PointCloudViewer pointCloudId={999} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error loading point cloud/i)).toBeInTheDocument();
    });
  });

  it('calls onError callback when error occurs', async () => {
    const onErrorMock = vi.fn();
    
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<PointCloudViewer pointCloudId={1} onError={onErrorMock} />);
    
    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalled();
    });
  });

  it('renders canvas after data loads', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPointCloudData,
    });

    render(<PointCloudViewer pointCloudId={1} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
    });
  });

  it('includes orbit controls in rendered scene', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPointCloudData,
    });

    render(<PointCloudViewer pointCloudId={1} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
    });
  });

  it('handles empty point cloud data gracefully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockPointCloudData,
        data: {
          positions: [],
          colors: [],
        },
      }),
    });

    render(<PointCloudViewer pointCloudId={1} />);
    
    await waitFor(() => {
      expect(screen.getByText(/No point cloud data available/i)).toBeInTheDocument();
    });
  });

  it('applies sampling parameter to API request', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPointCloudData,
    });

    render(<PointCloudViewer pointCloudId={1} />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('sample=0.5')
      );
    });
  });
});
