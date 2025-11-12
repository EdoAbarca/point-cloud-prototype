# Point Cloud Prototype - AI Coding Agent Instructions

## Project Overview
This is a full-stack point cloud processing application with a Django REST API backend and React frontend. The system processes 3D point cloud data (LiDAR .pts files) and generates 3D meshes using various algorithms.

## Architecture

### Backend (Django REST API)
- **Location**: `django-backend/`
- **Tech Stack**: Django + Django REST Framework, Open3D, NumPy, Matplotlib
- **Key Components**:
  - `api/views.py`: Main API endpoints (`PointCloudBackendView`, `Mesh3DBackendView`)
  - `api/utils/point_cloud.py`: Point cloud processing utilities
  - `api/utils/mesh_3d.py`: 3D mesh generation algorithms
  - SQLite database (development)

### Frontend (React + Vite)
- **Location**: `react-frontend/`
- **Tech Stack**: React 18, Vite, TailwindCSS, React Three Fiber, React Router
- **Key Views**: `MainView`, `PointsView`, `MeshView`, `CreateMeshView`

## Critical Data Structures

### Point Cloud Format (.pts files)
- **Structure**: 7-column format: `[x, y, z, intensity, r, g, b]`
- **Processing**: First row contains metadata (skipped during loading)
- **Validation**: Must have exactly 7 columns, handled by `load_point_cloud()`

### Mesh Generation Algorithms
Three algorithms available via `algorithm` parameter:
- `"delaunay"`: Delaunay triangulation with alpha parameter
- `"poisson"`: Poisson surface reconstruction with radius/depth parameters  
- `"threshold"`: Threshold-based mesh generation with intensity normalization

## Development Workflows

### Running the Application
```bash
# Backend (Django)
cd django-backend
python manage.py runserver  # Runs on http://localhost:8000

# Frontend (React)
cd react-frontend
npm run dev  # Runs on http://localhost:5173
```

### API Testing
- Primary endpoints: `/api/point-cloud` (GET/POST), `/api/3d-mesh`
- Test endpoints: `/api/test/point-cloud`, `/api/test/3d-mesh`
- Use ThunderClient or similar for backend testing (mentioned in views.py comments)

## Project-Specific Patterns

### Error Handling
- Custom exceptions: `InvalidPointCloudError`, `UnsupportedFileFormatError`
- API returns detailed error messages with appropriate HTTP status codes
- File format validation through `is_point_cloud()` and `is_3d_mesh()` functions

### Point Cloud Processing Pipeline
1. **Load**: `load_point_cloud()` validates and loads .pts files
2. **Analyze**: `point_cloud_info()` extracts statistical information
3. **Visualize**: `generate_cloud()` creates Open3D point cloud with intensity-based coloring
4. **Mesh**: Algorithm-specific functions in `mesh_3d.py`

### Color Mapping Convention
- Intensity normalization: `(intensity - min) / (max - min)`
- Color palette: Matplotlib's "inferno" colormap for intensity visualization
- RGB extraction: `cmap(intensity)[:, :3]` (removes alpha channel)

### React Component Structure
- Route-based views in `src/views/`
- Main navigation through `App.jsx` with React Router
- TailwindCSS utility classes (dark theme: `bg-zinc-900`, `text-white`)
- React Three Fiber integration for 3D visualization

## Key Files for Understanding
- `django-backend/api/views.py`: Complete request/response flow
- `django-backend/api/utils/point_cloud.py`: Core data processing logic
- `react-frontend/src/App.jsx`: Frontend routing and navigation
- `react-frontend/package.json`: Frontend dependencies (Three.js ecosystem)

## Integration Points
- **CORS**: Not configured yet - add `django-cors-headers` for frontend communication
- **File Upload**: Frontend expects `/api/create-mesh` endpoint (referenced in `CreateMeshView.jsx`)
- **Environment**: Uses `python-dotenv` for configuration management
- **Visualization**: Open3D handles backend 3D rendering, React Three Fiber for frontend

## Common Gotchas
- Point cloud files must be .pts format with exactly 7 columns
- First row of .pts files contains metadata and is skipped
- Algorithm parameter is case-sensitive ("delaunay", "poisson", "threshold")
- Open3D visualization blocks execution (runs in separate window)
- Frontend assumes backend on `localhost:8000` (hardcoded in CreateMeshView)