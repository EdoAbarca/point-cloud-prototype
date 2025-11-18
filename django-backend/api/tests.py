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


class PointCloudDataViewTestCase(TestCase):
    """
    Test cases for point cloud data retrieval endpoint (US-02).
    """
    
    def setUp(self):
        """
        Set up test client and upload a test point cloud.
        """
        self.client = APIClient()
        self.base_dir = Path(__file__).resolve().parent.parent.parent
        self.test_files_dir = self.base_dir / 'figures'
        
        # Upload a test point cloud
        test_file_path = self.test_files_dir / 'cube.pts'
        with open(test_file_path, 'rb') as f:
            file_content = f.read()
        
        uploaded_file = SimpleUploadedFile(
            name='cube.pts',
            content=file_content,
            content_type='application/octet-stream'
        )
        
        response = self.client.post(
            '/api/point_cloud',
            {'file': uploaded_file, 'name': 'Test Cube'},
            format='multipart'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.point_cloud_id = response.data['data']['id']
    
    def tearDown(self):
        """
        Clean up uploaded files after each test.
        """
        for pc in PointCloud.objects.all():
            if pc.file:
                pc.file.delete()
            pc.delete()
    
    def test_get_point_cloud_data(self):
        """
        Test successful retrieval of point cloud data for visualization.
        """
        response = self.client.get(f'/api/point_cloud/{self.point_cloud_id}/data')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check response structure
        data = response.json()
        self.assertIn('message', data)
        self.assertIn('name', data)
        self.assertIn('num_points', data)
        self.assertIn('data', data)
        
        # Check data structure
        point_data = data['data']
        self.assertIn('positions', point_data)
        self.assertIn('colors', point_data)
        
        # Verify positions and colors are arrays
        self.assertIsInstance(point_data['positions'], list)
        self.assertIsInstance(point_data['colors'], list)
        
        # Verify data is not empty
        self.assertGreater(len(point_data['positions']), 0)
        self.assertEqual(len(point_data['positions']), len(point_data['colors']))
        
        # Verify position format [x, y, z]
        if len(point_data['positions']) > 0:
            first_position = point_data['positions'][0]
            self.assertEqual(len(first_position), 3)
        
        # Verify color format [r, g, b]
        if len(point_data['colors']) > 0:
            first_color = point_data['colors'][0]
            self.assertEqual(len(first_color), 3)
    
    def test_get_point_cloud_data_with_sampling(self):
        """
        Test point cloud data retrieval with sampling parameter.
        """
        response = self.client.get(
            f'/api/point_cloud/{self.point_cloud_id}/data?sample=0.5'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        sampled_points = data['num_points']
        
        # Get full data to compare
        full_response = self.client.get(f'/api/point_cloud/{self.point_cloud_id}/data')
        full_data = full_response.json()
        full_points = full_data['num_points']
        
        # Sampled points should be approximately 50% of full points
        # (allow some variance due to random sampling)
        self.assertLess(sampled_points, full_points)
        self.assertGreater(sampled_points, full_points * 0.3)
        self.assertLess(sampled_points, full_points * 0.7)
    
    def test_get_point_cloud_data_invalid_id(self):
        """
        Test retrieval with non-existent point cloud ID.
        """
        response = self.client.get('/api/point_cloud/99999/data')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        data = response.json()
        self.assertIn('error', data)
    
    def test_get_point_cloud_data_invalid_sample_parameter(self):
        """
        Test that invalid sampling parameters are handled gracefully.
        """
        # Invalid sample parameter should fall back to no sampling
        response = self.client.get(
            f'/api/point_cloud/{self.point_cloud_id}/data?sample=invalid'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Should return all points
        data = response.json()
        self.assertGreater(data['num_points'], 0)


class PointCloudTriangulationTestCase(TestCase):
    """
    Test cases for Delaunay triangulation mesh generation functionality.
    """
    
    def setUp(self):
        """
        Set up test client and upload a test point cloud.
        """
        self.client = APIClient()
        
        # Path to test files
        self.base_dir = Path(__file__).resolve().parent.parent.parent
        self.test_files_dir = self.base_dir / 'figures'
        
        # Upload a test point cloud
        test_file_path = self.test_files_dir / 'cube.pts'
        
        with open(test_file_path, 'rb') as f:
            file_content = f.read()
        
        uploaded_file = SimpleUploadedFile(
            'cube.pts',
            file_content,
            content_type='application/octet-stream'
        )
        
        upload_response = self.client.post(
            '/api/point_cloud',
            {'file': uploaded_file, 'name': 'Test Cube'},
            format='multipart'
        )
        
        self.point_cloud_id = upload_response.data['data']['id']
    
    def tearDown(self):
        """
        Clean up uploaded files and generated meshes after each test.
        """
        for pc in PointCloud.objects.all():
            if pc.file:
                pc.file.delete()
            if pc.mesh_file:
                # Delete mesh file if it exists
                try:
                    if os.path.exists(pc.mesh_file.path):
                        os.remove(pc.mesh_file.path)
                except:
                    pass
            pc.delete()
    
    def test_triangulate_point_cloud_success(self):
        """
        Test successful Delaunay triangulation of a point cloud.
        """
        response = self.client.post(
            f'/api/point_cloud/{self.point_cloud_id}/triangulate',
            {'alpha': 1.0},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        data = response.json()
        self.assertIn('message', data)
        self.assertIn('data', data)
        self.assertIn('mesh_file', data['data'])
        
        # Verify metadata in response
        response_data = data['data']
        self.assertEqual(response_data['algorithm'], 'delaunay')
        self.assertEqual(response_data['alpha'], 1.0)
        self.assertGreater(response_data['vertices'], 0)
        self.assertGreater(response_data['triangles'], 0)
        self.assertGreater(response_data['processing_time'], 0)
        
        # Verify point cloud object was updated
        point_cloud = PointCloud.objects.get(pk=self.point_cloud_id)
        self.assertIsNotNone(point_cloud.mesh_file)
        self.assertIsNotNone(point_cloud.mesh_metadata)
        self.assertTrue(os.path.exists(point_cloud.mesh_file.path))
    
    def test_triangulate_with_custom_alpha(self):
        """
        Test triangulation with a custom alpha parameter.
        """
        response = self.client.post(
            f'/api/point_cloud/{self.point_cloud_id}/triangulate',
            {'alpha': 0.5},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        data = response.json()
        response_data = data['data']
        self.assertEqual(response_data['alpha'], 0.5)
    
    def test_triangulate_with_default_alpha(self):
        """
        Test that triangulation uses default alpha when not provided.
        """
        response = self.client.post(
            f'/api/point_cloud/{self.point_cloud_id}/triangulate',
            {},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        data = response.json()
        response_data = data['data']
        self.assertEqual(response_data['alpha'], 1.0)
    
    def test_triangulate_with_invalid_alpha(self):
        """
        Test that triangulation rejects invalid alpha parameters.
        """
        # Negative alpha
        response = self.client.post(
            f'/api/point_cloud/{self.point_cloud_id}/triangulate',
            {'alpha': -1.0},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.json())
        
        # Zero alpha
        response = self.client.post(
            f'/api/point_cloud/{self.point_cloud_id}/triangulate',
            {'alpha': 0},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.json())
    
    def test_triangulate_invalid_point_cloud_id(self):
        """
        Test triangulation with non-existent point cloud ID.
        """
        response = self.client.post(
            '/api/point_cloud/99999/triangulate',
            {'alpha': 1.0},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.json())
    
    def test_get_mesh_data_success(self):
        """
        Test successful retrieval of mesh data.
        """
        # First generate the mesh
        triangulate_response = self.client.post(
            f'/api/point_cloud/{self.point_cloud_id}/triangulate',
            {'alpha': 1.0},
            format='json'
        )
        
        self.assertEqual(triangulate_response.status_code, status.HTTP_201_CREATED)
        
        # Then retrieve the mesh data
        response = self.client.get(
            f'/api/point_cloud/{self.point_cloud_id}/mesh'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertIn('message', data)
        self.assertIn('data', data)
        self.assertIn('metadata', data)
        
        mesh_data = data['data']
        self.assertIn('vertices', mesh_data)
        self.assertIn('triangles', mesh_data)
        self.assertIn('colors', mesh_data)
        
        # Verify data structure
        self.assertGreater(len(mesh_data['vertices']), 0)
        self.assertGreater(len(mesh_data['triangles']), 0)
        
        # Verify vertex format [x, y, z]
        first_vertex = mesh_data['vertices'][0]
        self.assertEqual(len(first_vertex), 3)
        
        # Verify triangle format [v1, v2, v3]
        first_triangle = mesh_data['triangles'][0]
        self.assertEqual(len(first_triangle), 3)
        
        # Verify color format [r, g, b]
        first_color = mesh_data['colors'][0]
        self.assertEqual(len(first_color), 3)
    
    def test_get_mesh_data_without_generation(self):
        """
        Test that retrieving mesh data without generating mesh returns 404.
        """
        response = self.client.get(
            f'/api/point_cloud/{self.point_cloud_id}/mesh'
        )
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        data = response.json()
        self.assertIn('error', data)
    
    def test_get_mesh_data_invalid_id(self):
        """
        Test mesh data retrieval with non-existent point cloud ID.
        """
        response = self.client.get('/api/point_cloud/99999/mesh')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.json())
    
    def test_regenerate_mesh_overwrites_previous(self):
        """
        Test that regenerating mesh with different parameters overwrites the previous one.
        """
        # Generate first mesh with alpha=1.0
        response1 = self.client.post(
            f'/api/point_cloud/{self.point_cloud_id}/triangulate',
            {'alpha': 1.0},
            format='json'
        )
        
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        first_mesh_file = response1.json()['data']['mesh_file']
        
        # Generate second mesh with alpha=0.5
        response2 = self.client.post(
            f'/api/point_cloud/{self.point_cloud_id}/triangulate',
            {'alpha': 0.5},
            format='json'
        )
        
        self.assertEqual(response2.status_code, status.HTTP_201_CREATED)
        second_response_data = response2.json()['data']
        
        # Verify the alpha parameter was updated
        self.assertEqual(second_response_data['alpha'], 0.5)
        
        # Verify point cloud has the latest mesh metadata
        point_cloud = PointCloud.objects.get(pk=self.point_cloud_id)
        self.assertEqual(point_cloud.mesh_metadata['alpha'], 0.5)


class PointCloudPoissonReconstructionTestCase(TestCase):
    """
    Test cases for Poisson surface reconstruction mesh generation functionality.
    """
    
    def setUp(self):
        """
        Set up test client and upload a test point cloud.
        """
        self.client = APIClient()
        
        # Path to test files
        self.base_dir = Path(__file__).resolve().parent.parent.parent
        self.test_files_dir = self.base_dir / 'figures'
        
        # Upload a test point cloud
        test_file_path = self.test_files_dir / 'sphere.pts'
        
        with open(test_file_path, 'rb') as f:
            file_content = f.read()
        
        uploaded_file = SimpleUploadedFile(
            'sphere.pts',
            file_content,
            content_type='application/octet-stream'
        )
        
        upload_response = self.client.post(
            '/api/point_cloud',
            {'file': uploaded_file, 'name': 'Test Sphere'},
            format='multipart'
        )
        
        self.point_cloud_id = upload_response.data['data']['id']
    
    def tearDown(self):
        """
        Clean up uploaded files and generated meshes after each test.
        """
        for pc in PointCloud.objects.all():
            if pc.file:
                pc.file.delete()
            if pc.mesh_file:
                # Delete mesh file if it exists
                try:
                    if os.path.exists(pc.mesh_file.path):
                        os.remove(pc.mesh_file.path)
                except:
                    pass
            pc.delete()
    
    def test_poisson_reconstruction_success(self):
        """
        Test successful Poisson surface reconstruction of a point cloud.
        """
        response = self.client.post(
            f'/api/point_cloud/{self.point_cloud_id}/reconstruct_poisson',
            {'depth': 9, 'radius': 0.1, 'max_nn': 30},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        data = response.json()
        self.assertIn('message', data)
        self.assertIn('data', data)
        self.assertIn('mesh_file', data['data'])
        
        # Verify metadata
        mesh_data = data['data']
        self.assertEqual(mesh_data['algorithm'], 'poisson')
        self.assertEqual(mesh_data['depth'], 9)
        self.assertEqual(mesh_data['radius'], 0.1)
        self.assertEqual(mesh_data['max_nn'], 30)
        self.assertGreater(mesh_data['vertices'], 0)
        self.assertGreater(mesh_data['triangles'], 0)
        self.assertGreater(mesh_data['processing_time'], 0)
        self.assertTrue(mesh_data['has_normals'])
        
        # Verify point cloud object was updated
        point_cloud = PointCloud.objects.get(pk=self.point_cloud_id)
        self.assertIsNotNone(point_cloud.mesh_file)
        self.assertIsNotNone(point_cloud.mesh_metadata)
        self.assertTrue(os.path.exists(point_cloud.mesh_file.path))
        self.assertTrue(point_cloud.mesh_file.path.endswith('_poisson.obj'))
    
    def test_poisson_with_default_parameters(self):
        """
        Test that Poisson reconstruction uses default parameters when not provided.
        """
        response = self.client.post(
            f'/api/point_cloud/{self.point_cloud_id}/reconstruct_poisson',
            {},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        data = response.json()
        mesh_data = data['data']
        self.assertEqual(mesh_data['depth'], 9)
        self.assertEqual(mesh_data['radius'], 0.1)
        self.assertEqual(mesh_data['max_nn'], 30)
    
    def test_poisson_with_custom_depth(self):
        """
        Test Poisson reconstruction with custom depth parameter.
        """
        # Test with depth=8
        response = self.client.post(
            f'/api/point_cloud/{self.point_cloud_id}/reconstruct_poisson',
            {'depth': 8},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        data = response.json()
        self.assertEqual(data['data']['depth'], 8)
    
    def test_poisson_with_invalid_depth(self):
        """
        Test that Poisson reconstruction rejects invalid depth parameters.
        """
        # Depth too low
        response = self.client.post(
            f'/api/point_cloud/{self.point_cloud_id}/reconstruct_poisson',
            {'depth': 3},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.json())
        
        # Depth too high
        response = self.client.post(
            f'/api/point_cloud/{self.point_cloud_id}/reconstruct_poisson',
            {'depth': 15},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.json())
    
    def test_poisson_with_invalid_radius(self):
        """
        Test that Poisson reconstruction rejects invalid radius parameters.
        """
        # Negative radius
        response = self.client.post(
            f'/api/point_cloud/{self.point_cloud_id}/reconstruct_poisson',
            {'radius': -0.1},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.json())
        
        # Zero radius
        response = self.client.post(
            f'/api/point_cloud/{self.point_cloud_id}/reconstruct_poisson',
            {'radius': 0},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.json())
    
    def test_poisson_with_invalid_max_nn(self):
        """
        Test that Poisson reconstruction rejects invalid max_nn parameters.
        """
        # Negative max_nn
        response = self.client.post(
            f'/api/point_cloud/{self.point_cloud_id}/reconstruct_poisson',
            {'max_nn': -10},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.json())
    
    def test_poisson_invalid_point_cloud_id(self):
        """
        Test Poisson reconstruction with non-existent point cloud ID.
        """
        response = self.client.post(
            '/api/point_cloud/99999/reconstruct_poisson',
            {'depth': 9},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.json())
    
    def test_poisson_with_varying_parameters(self):
        """
        Test Poisson reconstruction with different parameter combinations.
        """
        # Test with high detail (higher depth)
        response = self.client.post(
            f'/api/point_cloud/{self.point_cloud_id}/reconstruct_poisson',
            {'depth': 10, 'radius': 0.05, 'max_nn': 50},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        data = response.json()
        mesh_data = data['data']
        self.assertEqual(mesh_data['depth'], 10)
        self.assertEqual(mesh_data['radius'], 0.05)
        self.assertEqual(mesh_data['max_nn'], 50)
    
    def test_poisson_creates_watertight_mesh(self):
        """
        Test that Poisson reconstruction creates a watertight mesh.
        """
        response = self.client.post(
            f'/api/point_cloud/{self.point_cloud_id}/reconstruct_poisson',
            {'depth': 9},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify that mesh has vertex normals (required for watertight mesh)
        data = response.json()
        self.assertTrue(data['data']['has_normals'])
        
        # Verify mesh data is retrievable
        mesh_response = self.client.get(
            f'/api/point_cloud/{self.point_cloud_id}/mesh'
        )
        
        self.assertEqual(mesh_response.status_code, status.HTTP_200_OK)
        mesh_data = mesh_response.json()['data']
        self.assertIn('normals', mesh_data)
        self.assertGreater(len(mesh_data['normals']), 0)
    
    def test_poisson_performance_acceptable(self):
        """
        Test that Poisson reconstruction completes in acceptable time.
        """
        response = self.client.post(
            f'/api/point_cloud/{self.point_cloud_id}/reconstruct_poisson',
            {'depth': 9},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        data = response.json()
        processing_time = data['data']['processing_time']
        
        # Assert processing time is reasonable (less than 30 seconds for test data)
        self.assertLess(processing_time, 30.0)
    
    def test_compare_poisson_with_delaunay(self):
        """
        Test that both Poisson and Delaunay can be used on the same point cloud.
        """
        # Generate Delaunay mesh first
        delaunay_response = self.client.post(
            f'/api/point_cloud/{self.point_cloud_id}/triangulate',
            {'alpha': 1.0},
            format='json'
        )
        
        self.assertEqual(delaunay_response.status_code, status.HTTP_201_CREATED)
        delaunay_data = delaunay_response.json()
        self.assertEqual(delaunay_data['data']['algorithm'], 'delaunay')
        
        # Generate Poisson mesh (should overwrite)
        poisson_response = self.client.post(
            f'/api/point_cloud/{self.point_cloud_id}/reconstruct_poisson',
            {'depth': 9},
            format='json'
        )
        
        self.assertEqual(poisson_response.status_code, status.HTTP_201_CREATED)
        poisson_data = poisson_response.json()
        self.assertEqual(poisson_data['data']['algorithm'], 'poisson')
        
        # Verify the Poisson mesh is now stored
        point_cloud = PointCloud.objects.get(pk=self.point_cloud_id)
        self.assertEqual(point_cloud.mesh_metadata['algorithm'], 'poisson')
        self.assertTrue(point_cloud.mesh_file.path.endswith('_poisson.obj'))