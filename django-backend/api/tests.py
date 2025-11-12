from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from .models import PointCloud
import os
from pathlib import Path


class HelloWorldTestCase(TestCase):
	def test_hello_world(self):
		response = self.client.get('/api/hello')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json(), {'message': 'Hello, World!'})


class PointCloudUploadTestCase(TestCase):
    """
    Test cases for point cloud file upload functionality.
    """
    
    def setUp(self):
        """
        Set up test client and test data.
        """
        self.client = APIClient()
        self.upload_url = '/api/point_cloud'
        
        # Path to test files
        self.base_dir = Path(__file__).resolve().parent.parent.parent
        self.test_files_dir = self.base_dir / 'figures'
    
    def tearDown(self):
        """
        Clean up uploaded files after each test.
        """
        # Delete all point cloud instances and their files
        for pc in PointCloud.objects.all():
            if pc.file:
                pc.file.delete()
            pc.delete()
    
    def test_upload_valid_pts_file(self):
        """
        Test successful upload of a valid .pts file.
        """
        # Load a test .pts file
        test_file_path = self.test_files_dir / 'cube.pts'
        
        with open(test_file_path, 'rb') as f:
            file_content = f.read()
        
        uploaded_file = SimpleUploadedFile(
            'cube.pts',
            file_content,
            content_type='application/octet-stream'
        )
        
        response = self.client.post(
            self.upload_url,
            {'file': uploaded_file, 'name': 'Test Cube'},
            format='multipart'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertIn('data', response.data)
        self.assertEqual(response.data['data']['name'], 'Test Cube')
        self.assertGreater(response.data['data']['num_points'], 0)
        
        # Verify the point cloud was saved to database
        self.assertEqual(PointCloud.objects.count(), 1)
        point_cloud = PointCloud.objects.first()
        self.assertEqual(point_cloud.name, 'Test Cube')
        self.assertIsNotNone(point_cloud.metadata)
        self.assertIn('bounds', point_cloud.metadata)
    
    def test_upload_without_name_uses_filename(self):
        """
        Test that uploading without a name uses the filename.
        """
        test_file_path = self.test_files_dir / 'sphere.pts'
        
        with open(test_file_path, 'rb') as f:
            file_content = f.read()
        
        uploaded_file = SimpleUploadedFile(
            'sphere.pts',
            file_content,
            content_type='application/octet-stream'
        )
        
        response = self.client.post(
            self.upload_url,
            {'file': uploaded_file},
            format='multipart'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['data']['name'], 'sphere')
    
    def test_upload_invalid_file_type(self):
        """
        Test that uploading a non-.pts file is rejected.
        """
        uploaded_file = SimpleUploadedFile(
            'test.txt',
            b'This is not a point cloud file',
            content_type='text/plain'
        )
        
        response = self.client.post(
            self.upload_url,
            {'file': uploaded_file},
            format='multipart'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('errors', response.data)
        self.assertEqual(PointCloud.objects.count(), 0)
    
    def test_upload_without_file(self):
        """
        Test that uploading without a file is rejected.
        """
        response = self.client.post(
            self.upload_url,
            {'name': 'Test without file'},
            format='multipart'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('errors', response.data)
        self.assertEqual(PointCloud.objects.count(), 0)
    
    def test_list_point_clouds(self):
        """
        Test retrieving list of all point clouds.
        """
        # Upload multiple files
        for filename in ['cube.pts', 'sphere.pts', 'pyramid.pts']:
            test_file_path = self.test_files_dir / filename
            
            with open(test_file_path, 'rb') as f:
                file_content = f.read()
            
            uploaded_file = SimpleUploadedFile(
                filename,
                file_content,
                content_type='application/octet-stream'
            )
            
            self.client.post(
                self.upload_url,
                {'file': uploaded_file},
                format='multipart'
            )
        
        # Get list
        response = self.client.get(self.upload_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertEqual(response.data['count'], 3)
        self.assertEqual(len(response.data['data']), 3)
    
    def test_get_point_cloud_detail(self):
        """
        Test retrieving a specific point cloud by ID.
        """
        # Upload a file
        test_file_path = self.test_files_dir / 'cube.pts'
        
        with open(test_file_path, 'rb') as f:
            file_content = f.read()
        
        uploaded_file = SimpleUploadedFile(
            'cube.pts',
            file_content,
            content_type='application/octet-stream'
        )
        
        upload_response = self.client.post(
            self.upload_url,
            {'file': uploaded_file, 'name': 'Test Cube'},
            format='multipart'
        )
        
        point_cloud_id = upload_response.data['data']['id']
        
        # Get detail
        detail_url = f'/api/point_cloud/{point_cloud_id}'
        response = self.client.get(detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertEqual(response.data['data']['name'], 'Test Cube')
    
    def test_delete_point_cloud(self):
        """
        Test deleting a point cloud.
        """
        # Upload a file
        test_file_path = self.test_files_dir / 'cube.pts'
        
        with open(test_file_path, 'rb') as f:
            file_content = f.read()
        
        uploaded_file = SimpleUploadedFile(
            'cube.pts',
            file_content,
            content_type='application/octet-stream'
        )
        
        upload_response = self.client.post(
            self.upload_url,
            {'file': uploaded_file, 'name': 'Test Cube'},
            format='multipart'
        )
        
        point_cloud_id = upload_response.data['data']['id']
        
        # Delete
        delete_url = f'/api/point_cloud/{point_cloud_id}'
        response = self.client.delete(delete_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(PointCloud.objects.count(), 0)
    
    def test_metadata_extraction(self):
        """
        Test that metadata is correctly extracted from uploaded file.
        """
        test_file_path = self.test_files_dir / 'cube.pts'
        
        with open(test_file_path, 'rb') as f:
            file_content = f.read()
        
        uploaded_file = SimpleUploadedFile(
            'cube.pts',
            file_content,
            content_type='application/octet-stream'
        )
        
        response = self.client.post(
            self.upload_url,
            {'file': uploaded_file},
            format='multipart'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        metadata = response.data['data']['metadata']
        
        # Check that all required metadata fields are present
        self.assertIn('bounds', metadata)
        self.assertIn('intensity', metadata)
        self.assertIn('color_channels', metadata)
        
        # Check bounds structure
        self.assertIn('x', metadata['bounds'])
        self.assertIn('y', metadata['bounds'])
        self.assertIn('z', metadata['bounds'])
        
        # Check intensity structure
        self.assertIn('min', metadata['intensity'])
        self.assertIn('max', metadata['intensity'])
        self.assertIn('mean', metadata['intensity'])
        
        # Check color channels structure
        self.assertIn('r', metadata['color_channels'])
        self.assertIn('g', metadata['color_channels'])
        self.assertIn('b', metadata['color_channels'])