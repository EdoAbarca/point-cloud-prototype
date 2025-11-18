from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .models import PointCloud
from .serializers import PointCloudSerializer
from .utils.point_cloud import load_point_cloud
from asgiref.sync import sync_to_async
import logging

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
