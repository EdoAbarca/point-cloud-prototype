from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .models import PointCloud
from .serializers import PointCloudSerializer
from .utils.point_cloud import load_point_cloud, generate_cloud
from .utils.mesh_3d import create_delaunay_mesh, create_poisson_mesh, create_threshold_mesh, load_3d_mesh
from asgiref.sync import sync_to_async
import logging
import os
import time
import numpy as np

logger = logging.getLogger(__name__)


class PointCloudUploadView(APIView):
    """
    API endpoint for uploading point cloud files.
    
    POST: Upload a new point cloud file
    GET: List all uploaded point clouds
    """
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request):
        """
        Upload a point cloud file with automatic metadata extraction.
        
        Expected form data:
        - file: .pts file (required)
        - name: custom name (optional, defaults to filename)
        """
        try:
            logger.info(f"Received point cloud upload request")
            
            serializer = PointCloudSerializer(data=request.data)
            
            if serializer.is_valid():
                point_cloud = serializer.save()
                
                logger.info(f"Successfully uploaded point cloud: {point_cloud.name} with {point_cloud.num_points} points")
                
                return Response(
                    {
                        'message': 'Point cloud uploaded successfully',
                        'data': PointCloudSerializer(point_cloud).data
                    },
                    status=status.HTTP_201_CREATED
                )
            
            logger.warning(f"Point cloud upload validation failed: {serializer.errors}")
            return Response(
                {
                    'message': 'Validation failed',
                    'errors': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            logger.error(f"Point cloud upload failed: {str(e)}", exc_info=True)
            return Response(
                {
                    'message': 'Upload failed',
                    'error': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get(self, request):
        """
        List all uploaded point clouds with their metadata.
        """
        try:
            point_clouds = PointCloud.objects.all()
            serializer = PointCloudSerializer(point_clouds, many=True)
            
            return Response(
                {
                    'message': 'Point clouds retrieved successfully',
                    'count': point_clouds.count(),
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Failed to retrieve point clouds: {str(e)}", exc_info=True)
            return Response(
                {
                    'message': 'Failed to retrieve point clouds',
                    'error': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PointCloudDetailView(APIView):
    """
    API endpoint for retrieving a specific point cloud by ID.
    
    GET: Retrieve point cloud details
    DELETE: Delete a point cloud
    """
    
    def get(self, request, pk):
        """
        Retrieve a specific point cloud by ID.
        """
        try:
            point_cloud = PointCloud.objects.get(pk=pk)
            serializer = PointCloudSerializer(point_cloud)
            
            return Response(
                {
                    'message': 'Point cloud retrieved successfully',
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )
            
        except PointCloud.DoesNotExist:
            return Response(
                {
                    'message': 'Point cloud not found',
                    'error': f'No point cloud found with ID {pk}'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to retrieve point cloud {pk}: {str(e)}", exc_info=True)
            return Response(
                {
                    'message': 'Failed to retrieve point cloud',
                    'error': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request, pk):
        """
        Delete a specific point cloud by ID.
        """
        try:
            point_cloud = PointCloud.objects.get(pk=pk)
            name = point_cloud.name
            
            # Delete the file from storage
            if point_cloud.file:
                point_cloud.file.delete()
            
            point_cloud.delete()
            
            logger.info(f"Successfully deleted point cloud: {name}")
            
            return Response(
                {
                    'message': 'Point cloud deleted successfully',
                    'name': name
                },
                status=status.HTTP_200_OK
            )
            
        except PointCloud.DoesNotExist:
            return Response(
                {
                    'message': 'Point cloud not found',
                    'error': f'No point cloud found with ID {pk}'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to delete point cloud {pk}: {str(e)}", exc_info=True)
            return Response(
                {
                    'message': 'Failed to delete point cloud',
                    'error': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PointCloudDataView(APIView):
    """
    API endpoint for retrieving raw point cloud data for visualization.
    
    GET: Returns point cloud data as JSON array with [x, y, z, r, g, b] format
    """
    
    def get(self, request, pk):
        """
        Retrieve raw point cloud data for Three.js rendering.
        
        Query parameters:
        - sample: Optional sampling rate (e.g., 0.1 for 10% of points)
        """
        try:
            point_cloud = PointCloud.objects.get(pk=pk)
            
            # Load the point cloud data
            point_cloud_data = load_point_cloud(point_cloud.file.path)
            
            # Extract x, y, z, r, g, b columns (indices 0-2 for xyz, 4-6 for rgb)
            # Format: [x, y, z, intensity, r, g, b]
            positions = point_cloud_data[:, :3].tolist()  # x, y, z
            colors = point_cloud_data[:, 4:7].tolist()     # r, g, b
            
            # Optional: Sample the data for performance
            sample_rate = request.GET.get('sample', None)
            if sample_rate:
                try:
                    sample_rate = float(sample_rate)
                    if 0 < sample_rate < 1:
                        import numpy as np
                        num_samples = int(len(positions) * sample_rate)
                        indices = np.random.choice(len(positions), num_samples, replace=False)
                        positions = [positions[i] for i in indices]
                        colors = [colors[i] for i in indices]
                        logger.info(f"Sampled {num_samples} points from {point_cloud.num_points}")
                except ValueError:
                    pass  # Invalid sample rate, use all points
            
            return Response(
                {
                    'message': 'Point cloud data retrieved successfully',
                    'name': point_cloud.name,
                    'num_points': len(positions),
                    'data': {
                        'positions': positions,
                        'colors': colors
                    }
                },
                status=status.HTTP_200_OK
            )
            
        except PointCloud.DoesNotExist:
            return Response(
                {
                    'message': 'Point cloud not found',
                    'error': f'No point cloud found with ID {pk}'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to retrieve point cloud data {pk}: {str(e)}", exc_info=True)
            return Response(
                {
                    'message': 'Failed to retrieve point cloud data',
                    'error': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PointCloudTriangulateView(APIView):
    """
    API endpoint for generating a Delaunay triangulation mesh from a point cloud.
    
    POST: Generate Delaunay mesh with alpha shapes
    """
    
    def post(self, request, pk):
        """
        Generate Delaunay triangulation mesh from the point cloud.
        
        Request body (JSON):
        - alpha: Alpha value for alpha shapes (default: 1.0)
        """
        try:
            point_cloud = PointCloud.objects.get(pk=pk)
            
            # Get alpha parameter from request
            alpha = request.data.get('alpha', 1.0)
            try:
                alpha = float(alpha)
                if alpha <= 0:
                    raise ValueError("Alpha must be positive")
            except (ValueError, TypeError):
                return Response(
                    {
                        'message': 'Invalid alpha parameter',
                        'error': 'Alpha must be a positive number'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            logger.info(f"Starting Delaunay mesh generation for point cloud {pk} with alpha={alpha}")
            
            # Load the point cloud with Open3D
            import open3d as o3d
            pcd = o3d.io.read_point_cloud(point_cloud.file.path)
            
            if not pcd.has_points():
                return Response(
                    {
                        'message': 'Point cloud has no points',
                        'error': 'Cannot generate mesh from empty point cloud'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate Delaunay mesh
            start_time = time.time()
            delaunay_mesh, mesh_file_path = create_delaunay_mesh(pcd, point_cloud.file.path, alpha=alpha)
            processing_time = time.time() - start_time
            
            # Update the model with mesh information
            point_cloud.mesh_file = mesh_file_path
            point_cloud.mesh_metadata = {
                'algorithm': 'delaunay',
                'alpha': alpha,
                'vertices': len(delaunay_mesh.vertices),
                'triangles': len(delaunay_mesh.triangles),
                'processing_time': round(processing_time, 2)
            }
            point_cloud.save()
            
            logger.info(f"Successfully generated Delaunay mesh: {len(delaunay_mesh.vertices)} vertices, {len(delaunay_mesh.triangles)} triangles in {processing_time:.2f}s")
            
            return Response(
                {
                    'message': 'Delaunay mesh generated successfully',
                    'data': {
                        'mesh_file': os.path.basename(mesh_file_path),
                        'vertices': len(delaunay_mesh.vertices),
                        'triangles': len(delaunay_mesh.triangles),
                        'processing_time': round(processing_time, 2),
                        'algorithm': 'delaunay',
                        'alpha': alpha
                    }
                },
                status=status.HTTP_201_CREATED
            )
            
        except PointCloud.DoesNotExist:
            return Response(
                {
                    'message': 'Point cloud not found',
                    'error': f'No point cloud found with ID {pk}'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to generate Delaunay mesh for point cloud {pk}: {str(e)}", exc_info=True)
            return Response(
                {
                    'message': 'Failed to generate Delaunay mesh',
                    'error': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PointCloudPoissonReconstructView(APIView):
    """
    API endpoint for generating a Poisson surface reconstruction mesh from a point cloud.
    
    POST: Generate Poisson mesh with normal estimation
    """
    
    def post(self, request, pk):
        """
        Generate Poisson surface reconstruction mesh from the point cloud.
        
        Request body (JSON):
        - depth: Octree depth for reconstruction (default: 9, range: 5-12)
        - radius: Search radius for normal estimation (default: 0.1)
        - max_nn: Max neighbors for normal estimation (default: 30)
        """
        try:
            point_cloud = PointCloud.objects.get(pk=pk)
            
            # Get parameters from request with validation
            depth = request.data.get('depth', 9)
            radius = request.data.get('radius', 0.1)
            max_nn = request.data.get('max_nn', 30)
            
            try:
                depth = int(depth)
                if not 5 <= depth <= 12:
                    raise ValueError("Depth must be between 5 and 12")
                    
                radius = float(radius)
                if radius <= 0:
                    raise ValueError("Radius must be positive")
                    
                max_nn = int(max_nn)
                if max_nn <= 0:
                    raise ValueError("Max neighbors must be positive")
            except (ValueError, TypeError) as e:
                return Response(
                    {
                        'message': 'Invalid parameters',
                        'error': str(e)
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            logger.info(f"Starting Poisson reconstruction for point cloud {pk} with depth={depth}, radius={radius}, max_nn={max_nn}")
            
            # Load the point cloud with Open3D
            import open3d as o3d
            pcd = o3d.io.read_point_cloud(point_cloud.file.path)
            
            if not pcd.has_points():
                return Response(
                    {
                        'message': 'Point cloud has no points',
                        'error': 'Cannot generate mesh from empty point cloud'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if point cloud has sufficient points
            num_points = len(pcd.points)
            if num_points < 100:
                return Response(
                    {
                        'message': 'Insufficient points for Poisson reconstruction',
                        'error': f'Point cloud has only {num_points} points. At least 100 points required.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate Poisson mesh
            start_time = time.time()
            poisson_mesh, mesh_file_path, densities = create_poisson_mesh(
                pcd, 
                point_cloud.file.path, 
                radius=radius, 
                max_nn=max_nn, 
                depth=depth
            )
            processing_time = time.time() - start_time
            
            # Update the model with mesh information
            point_cloud.mesh_file = mesh_file_path
            point_cloud.mesh_metadata = {
                'algorithm': 'poisson',
                'depth': depth,
                'radius': radius,
                'max_nn': max_nn,
                'vertices': len(poisson_mesh.vertices),
                'triangles': len(poisson_mesh.triangles),
                'processing_time': round(processing_time, 2),
                'has_normals': poisson_mesh.has_vertex_normals()
            }
            point_cloud.save()
            
            logger.info(f"Successfully generated Poisson mesh: {len(poisson_mesh.vertices)} vertices, {len(poisson_mesh.triangles)} triangles in {processing_time:.2f}s")
            
            return Response(
                {
                    'message': 'Poisson mesh generated successfully',
                    'data': {
                        'mesh_file': os.path.basename(mesh_file_path),
                        'vertices': len(poisson_mesh.vertices),
                        'triangles': len(poisson_mesh.triangles),
                        'processing_time': round(processing_time, 2),
                        'algorithm': 'poisson',
                        'depth': depth,
                        'radius': radius,
                        'max_nn': max_nn,
                        'has_normals': poisson_mesh.has_vertex_normals()
                    }
                },
                status=status.HTTP_201_CREATED
            )
            
        except PointCloud.DoesNotExist:
            return Response(
                {
                    'message': 'Point cloud not found',
                    'error': f'No point cloud found with ID {pk}'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to generate Poisson mesh for point cloud {pk}: {str(e)}", exc_info=True)
            return Response(
                {
                    'message': 'Failed to generate Poisson mesh',
                    'error': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PointCloudMeshDataView(APIView):
    """
    API endpoint for retrieving generated mesh data for visualization.
    
    GET: Returns mesh data (vertices, faces, normals) as JSON
    """
    
    def get(self, request, pk):
        """
        Retrieve mesh data for Three.js rendering.
        
        Returns vertices, faces, and normals of the generated mesh.
        """
        try:
            point_cloud = PointCloud.objects.get(pk=pk)
            
            if not point_cloud.mesh_file:
                return Response(
                    {
                        'message': 'No mesh generated',
                        'error': 'Point cloud does not have a generated mesh. Please generate a mesh first.'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Load the mesh file
            mesh = load_3d_mesh(point_cloud.mesh_file.path)
            
            # Extract mesh data
            vertices = np.asarray(mesh.vertices).tolist()
            triangles = np.asarray(mesh.triangles).tolist()
            
            # Get normals if available
            normals = []
            if mesh.has_vertex_normals():
                normals = np.asarray(mesh.vertex_normals).tolist()
            
            # Get colors if available
            colors = []
            if mesh.has_vertex_colors():
                colors = np.asarray(mesh.vertex_colors).tolist()
            
            return Response(
                {
                    'message': 'Mesh data retrieved successfully',
                    'name': point_cloud.name,
                    'algorithm': point_cloud.mesh_metadata.get('algorithm', 'unknown'),
                    'data': {
                        'vertices': vertices,
                        'triangles': triangles,
                        'normals': normals,
                        'colors': colors,
                        'num_vertices': len(vertices),
                        'num_triangles': len(triangles)
                    },
                    'metadata': point_cloud.mesh_metadata
                },
                status=status.HTTP_200_OK
            )
            
        except PointCloud.DoesNotExist:
            return Response(
                {
                    'message': 'Point cloud not found',
                    'error': f'No point cloud found with ID {pk}'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to retrieve mesh data for point cloud {pk}: {str(e)}", exc_info=True)
            return Response(
                {
                    'message': 'Failed to retrieve mesh data',
                    'error': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PointCloudThresholdMeshView(APIView):
    """
    API endpoint for generating a threshold-based mesh from a point cloud.
    
    POST: Generate mesh by filtering sparse/noisy points based on density threshold
    """
    
    def post(self, request, pk):
        """
        Generate threshold-based mesh from the point cloud.
        
        Request body (JSON):
        - threshold: Density threshold for filtering (default: 0.5, range: 0-2)
                    Lower values = more points retained (less filtering)
                    Higher values = fewer points retained (more filtering)
        - alpha: Alpha value for alpha shapes (default: 1.0)
        """
        try:
            point_cloud = PointCloud.objects.get(pk=pk)
            
            # Get parameters from request with validation
            threshold = request.data.get('threshold', 0.5)
            alpha = request.data.get('alpha', 1.0)
            
            try:
                threshold = float(threshold)
                if not 0 <= threshold <= 2:
                    raise ValueError("Threshold must be between 0 and 2")
                    
                alpha = float(alpha)
                if alpha <= 0:
                    raise ValueError("Alpha must be positive")
            except (ValueError, TypeError) as e:
                return Response(
                    {
                        'message': 'Invalid parameters',
                        'error': str(e)
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            logger.info(f"Starting threshold mesh generation for point cloud {pk} with threshold={threshold}, alpha={alpha}")
            
            # Load the point cloud with Open3D
            import open3d as o3d
            pcd = o3d.io.read_point_cloud(point_cloud.file.path)
            
            if not pcd.has_points():
                return Response(
                    {
                        'message': 'Point cloud has no points',
                        'error': 'Cannot generate mesh from empty point cloud'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if point cloud has sufficient points
            num_points = len(pcd.points)
            if num_points < 10:
                return Response(
                    {
                        'message': 'Insufficient points for threshold mesh',
                        'error': f'Point cloud has only {num_points} points. At least 10 points required.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate threshold mesh
            start_time = time.time()
            try:
                threshold_mesh, mesh_file_path, num_filtered, num_original = create_threshold_mesh(
                    pcd, 
                    point_cloud.file.path, 
                    threshold=threshold, 
                    alpha=alpha
                )
            except ValueError as e:
                return Response(
                    {
                        'message': 'Mesh generation failed',
                        'error': str(e)
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            processing_time = time.time() - start_time
            
            # Calculate filtering statistics
            points_removed = num_original - num_filtered
            removal_percentage = (points_removed / num_original * 100) if num_original > 0 else 0
            
            # Update the model with mesh information
            point_cloud.mesh_file = mesh_file_path
            point_cloud.mesh_metadata = {
                'algorithm': 'threshold',
                'threshold': threshold,
                'alpha': alpha,
                'vertices': len(threshold_mesh.vertices),
                'triangles': len(threshold_mesh.triangles),
                'processing_time': round(processing_time, 2),
                'points_original': num_original,
                'points_filtered': num_filtered,
                'points_removed': points_removed,
                'removal_percentage': round(removal_percentage, 1)
            }
            point_cloud.save()
            
            logger.info(f"Successfully generated threshold mesh: {len(threshold_mesh.vertices)} vertices, "
                       f"{len(threshold_mesh.triangles)} triangles, filtered {points_removed}/{num_original} "
                       f"points ({removal_percentage:.1f}%) in {processing_time:.2f}s")
            
            return Response(
                {
                    'message': 'Threshold mesh generated successfully',
                    'data': {
                        'mesh_file': os.path.basename(mesh_file_path),
                        'vertices': len(threshold_mesh.vertices),
                        'triangles': len(threshold_mesh.triangles),
                        'processing_time': round(processing_time, 2),
                        'algorithm': 'threshold',
                        'threshold': threshold,
                        'alpha': alpha,
                        'filtering_stats': {
                            'points_original': num_original,
                            'points_filtered': num_filtered,
                            'points_removed': points_removed,
                            'removal_percentage': round(removal_percentage, 1)
                        }
                    }
                },
                status=status.HTTP_201_CREATED
            )
            
        except PointCloud.DoesNotExist:
            return Response(
                {
                    'message': 'Point cloud not found',
                    'error': f'No point cloud found with ID {pk}'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to generate threshold mesh for point cloud {pk}: {str(e)}", exc_info=True)
            return Response(
                {
                    'message': 'Failed to generate threshold mesh',
                    'error': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
