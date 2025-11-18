from rest_framework import serializers
from .models import PointCloud
from .utils.point_cloud import load_point_cloud, point_cloud_info
import os


class PointCloudSerializer(serializers.ModelSerializer):
    """
    Serializer for PointCloud model with automatic metadata extraction.
    """
    file = serializers.FileField(write_only=True)
    name = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = PointCloud
        fields = ['id', 'name', 'file', 'upload_date', 'num_points', 'metadata']
        read_only_fields = ['id', 'upload_date', 'num_points', 'metadata']
    
    def validate_file(self, value):
        """
        Validate that the uploaded file is a .pts file.
        """
        if not value.name.endswith('.pts'):
            raise serializers.ValidationError("Only .pts files are supported.")
        
        # Validate file size (max 100MB)
        max_size = 100 * 1024 * 1024  # 100MB in bytes
        if value.size > max_size:
            raise serializers.ValidationError(f"File size exceeds maximum allowed size of 100MB.")
        
        return value
    
    def create(self, validated_data):
        """
        Create PointCloud instance with extracted metadata.
        """
        file = validated_data.get('file')
        
        # Extract name from filename if not provided
        name = validated_data.get('name', os.path.splitext(file.name)[0])
        
        # Initialize with placeholder values that will be updated after metadata extraction
        instance = PointCloud(
            name=name,
            file=file,
            num_points=0,  # Temporary value
            metadata={}    # Temporary value
        )
        instance.save()
        
        try:
            # Load point cloud data to extract metadata
            point_cloud_data = load_point_cloud(instance.file.path)
            
            # Extract metadata
            info = point_cloud_info(point_cloud_data)
            
            # Update instance with extracted metadata
            instance.num_points = info['numero_puntos']
            instance.metadata = {
                'bounds': {
                    'x': {'min': float(info['rango_x'][0]), 'max': float(info['rango_x'][1])},
                    'y': {'min': float(info['rango_y'][0]), 'max': float(info['rango_y'][1])},
                    'z': {'min': float(info['rango_z'][0]), 'max': float(info['rango_z'][1])},
                },
                'intensity': {
                    'min': float(info['rango_intensidad'][0]),
                    'max': float(info['rango_intensidad'][1]),
                    'mean': float(info['media_intensidad']),
                    'std': float(info['desviacion_estandar_intensidad']),
                },
                'color_channels': {
                    'r': {'min': float(info['rango_r'][0]), 'max': float(info['rango_r'][1])},
                    'g': {'min': float(info['rango_g'][0]), 'max': float(info['rango_g'][1])},
                    'b': {'min': float(info['rango_b'][0]), 'max': float(info['rango_b'][1])},
                }
            }
            instance.save()
        except Exception as e:
            # If metadata extraction fails, delete the instance and raise error
            instance.delete()
            raise serializers.ValidationError(f"Failed to process point cloud file: {str(e)}")
        
        return instance
