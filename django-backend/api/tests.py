from django.test import TestCase
from .utils.mesh_3d import is_3d_mesh

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

