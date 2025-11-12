import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateMeshView from '../views/CreateMeshView';

// Mock fetch
global.fetch = vi.fn();

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('CreateMeshView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload form', () => {
    renderWithRouter(<CreateMeshView />);
    
    // "Upload Point Cloud" appears as both heading and button - check for both
    expect(screen.getByRole('heading', { name: 'Upload Point Cloud' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload Point Cloud/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Point Cloud Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Point Cloud File/i)).toBeInTheDocument();
  });

  it('disables submit button when no file is selected', () => {
    renderWithRouter(<CreateMeshView />);
    
    const submitButton = screen.getByRole('button', { name: /Upload Point Cloud/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows error when submitting without file', () => {
    renderWithRouter(<CreateMeshView />);
    
    const form = screen.getByRole('button', { name: /Upload Point Cloud/i }).closest('form');
    fireEvent.submit(form);
    
    // Button should still be disabled
    expect(screen.getByRole('button', { name: /Upload Point Cloud/i })).toBeDisabled();
  });

  it('enables submit button when file is selected', () => {
    renderWithRouter(<CreateMeshView />);
    
    const file = new File(['dummy content'], 'test.pts', { type: 'application/octet-stream' });
    const fileInput = screen.getByLabelText(/Point Cloud File/i);
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const submitButton = screen.getByRole('button', { name: /Upload Point Cloud/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('auto-fills name from filename', () => {
    renderWithRouter(<CreateMeshView />);
    
    const file = new File(['dummy content'], 'my-cloud.pts', { type: 'application/octet-stream' });
    const fileInput = screen.getByLabelText(/Point Cloud File/i);
    const nameInput = screen.getByLabelText(/Point Cloud Name/i);
    
    // Name should be empty initially
    expect(nameInput.value).toBe('');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Name should be auto-filled
    expect(nameInput.value).toBe('my-cloud');
  });

  it('shows loading state during upload', async () => {
    global.fetch.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({
          message: 'Success',
          data: {
            id: 1,
            name: 'test',
            num_points: 1000,
            upload_date: new Date().toISOString(),
            metadata: {}
          }
        })
      }), 100))
    );

    renderWithRouter(<CreateMeshView />);
    
    const file = new File(['dummy content'], 'test.pts', { type: 'application/octet-stream' });
    const fileInput = screen.getByLabelText(/Point Cloud File/i);
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const submitButton = screen.getByRole('button', { name: /Upload Point Cloud/i });
    fireEvent.click(submitButton);
    
    // Should show loading state - button changes to "Uploading..."
    expect(screen.getByRole('button', { name: /Uploading.../i })).toBeInTheDocument();
    expect(screen.getByText(/Uploading and processing point cloud.../i)).toBeInTheDocument();
  });

  it('shows success message on successful upload', async () => {
    const mockData = {
      message: 'Point cloud uploaded successfully',
      data: {
        id: 1,
        name: 'Test Cloud',
        num_points: 24000,
        upload_date: new Date().toISOString(),
        metadata: {}
      }
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    renderWithRouter(<CreateMeshView />);
    
    const file = new File(['dummy content'], 'test.pts', { type: 'application/octet-stream' });
    const fileInput = screen.getByLabelText(/Point Cloud File/i);
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const submitButton = screen.getByRole('button', { name: /Upload Point Cloud/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Success!/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Cloud.*uploaded successfully.*24000 points/i)).toBeInTheDocument();
    });
  });

  it('shows error message on upload failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Upload failed',
        error: 'File too large'
      })
    });

    renderWithRouter(<CreateMeshView />);
    
    const file = new File(['dummy content'], 'test.pts', { type: 'application/octet-stream' });
    const fileInput = screen.getByLabelText(/Point Cloud File/i);
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const submitButton = screen.getByRole('button', { name: /Upload Point Cloud/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      expect(screen.getByText(/File too large/i)).toBeInTheDocument();
    });
  });

  it('rejects non-.pts files', () => {
    renderWithRouter(<CreateMeshView />);
    
    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText(/Point Cloud File/i);
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const submitButton = screen.getByRole('button', { name: /Upload Point Cloud/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByText(/Only .pts files are supported/i)).toBeInTheDocument();
  });

  it('displays uploaded metadata after successful upload', async () => {
    const mockData = {
      message: 'Point cloud uploaded successfully',
      data: {
        id: 1,
        name: 'Test Cloud',
        num_points: 24000,
        upload_date: new Date().toISOString(),
        metadata: {
          bounds: {
            x: { min: -0.5, max: 0.5 },
            y: { min: -0.5, max: 0.5 },
            z: { min: -0.5, max: 0.5 }
          }
        }
      }
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    renderWithRouter(<CreateMeshView />);
    
    const file = new File(['dummy content'], 'test.pts', { type: 'application/octet-stream' });
    const fileInput = screen.getByLabelText(/Point Cloud File/i);
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const submitButton = screen.getByRole('button', { name: /Upload Point Cloud/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Uploaded Point Cloud Metadata/i)).toBeInTheDocument();
      // Test Cloud appears in both success message and metadata - use getAllByText
      const testCloudElements = screen.getAllByText(/Test Cloud/i);
      expect(testCloudElements.length).toBeGreaterThan(0);
      expect(screen.getByText(/24,000/i)).toBeInTheDocument();
    });
  });
});
