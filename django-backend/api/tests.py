from django.test import TestCase
from unittest.mock import patch, mock_open
import numpy as np

from .utils.mesh_3d import is_3d_mesh
from .utils.point_cloud import load_point_cloud, InvalidPointCloudError, UnsupportedFileFormatError

class TestIs3DMesh(TestCase):
	def test_is_3d_mesh_with_obj_file(self):
		"""Test that a file with .obj extension returns True."""
		file_path = "model.obj"
		result = is_3d_mesh(file_path)
		self.assertTrue(result)

	def test_is_3d_mesh_with_non_obj_file(self):
		"""Test that a file with a non-.obj extension returns False."""
		file_path = "image.png"
		result = is_3d_mesh(file_path)
		self.assertFalse(result)

	def test_is_3d_mesh_with_no_extension(self):
		"""Test that a file without an extension returns False."""
		file_path = "file_without_extension"
		result = is_3d_mesh(file_path)
		self.assertFalse(result)

class TestLoadPointCloud(TestCase):
	@patch("api.utils.point_cloud.is_point_cloud", return_value=True)
	@patch("numpy.loadtxt", return_value=np.array([[1, 2, 3, 0.5, 255, 255, 255]]))
	def test_load_point_cloud_valid_file(self, mock_loadtxt, mock_is_point_cloud):
		"""Test loading a valid point cloud file."""
		file_path = "valid_file.pts"
		result = load_point_cloud(file_path)
		# Verifica que se llamó a np.loadtxt con el archivo proporcionado
		mock_loadtxt.assert_called_once_with(file_path, skiprows=1)
		# Valida la salida
		self.assertEqual(result.shape, (1, 7))  # Una fila, siete columnas
		self.assertTrue((result == np.array([[1, 2, 3, 0.5, 255, 255, 255]])).all())

	@patch("api.utils.point_cloud.is_point_cloud", return_value=False)
	def test_load_point_cloud_unsupported_format(self, mock_is_point_cloud):
		"""Test loading a file with an unsupported format."""
		file_path = "invalid_format.txt"
		with self.assertRaises(UnsupportedFileFormatError):
			load_point_cloud(file_path)

	@patch("api.utils.point_cloud.is_point_cloud", return_value=True)
	@patch("builtins.open", new_callable=mock_open, read_data="x y z intensity r g b\n1 2")
	def test_load_point_cloud_invalid_data(self, mock_file, mock_is_point_cloud):
		"""Test loading a point cloud file with invalid data."""
		file_path = "invalid_data.txt"
		with self.assertRaises(InvalidPointCloudError):
			load_point_cloud(file_path)
