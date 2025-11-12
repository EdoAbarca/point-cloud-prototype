from django.db import models


class PointCloud(models.Model):
    """
    Model to store uploaded point cloud files and their metadata.
    """
    name = models.CharField(max_length=255, help_text="Original filename of the point cloud")
    file = models.FileField(upload_to='pointclouds/', help_text="Path to the uploaded .pts file")
    upload_date = models.DateTimeField(auto_now_add=True, help_text="Timestamp when the file was uploaded")
    num_points = models.IntegerField(help_text="Total number of points in the cloud")
    metadata = models.JSONField(default=dict, blank=True, help_text="Additional metadata (bounds, intensity range, etc.)")
    
    class Meta:
        ordering = ['-upload_date']
        verbose_name = "Point Cloud"
        verbose_name_plural = "Point Clouds"
    
    def __str__(self):
        return f"{self.name} ({self.num_points} points)"
