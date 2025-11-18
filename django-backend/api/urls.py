from django.urls import path
from .views import PointCloudView, Mesh3DView, PointCloudBackendView, Mesh3DBackendView, HelloWorldView
from .views_pointcloud import (
    PointCloudUploadView, 
    PointCloudDetailView, 
    PointCloudDataView,
    PointCloudTriangulateView,
    PointCloudMeshDataView
)

urlpatterns = [
    # Point Cloud Upload/List API (User Story 1)
    path("point_cloud", PointCloudUploadView.as_view(), name='point-cloud-upload'),
    path("point_cloud/<int:pk>", PointCloudDetailView.as_view(), name='point-cloud-detail'),
    path("point_cloud/<int:pk>/data", PointCloudDataView.as_view(), name='point-cloud-data'),
    
    # Point Cloud Mesh Generation API (User Story 3)
    path("point_cloud/<int:pk>/triangulate", PointCloudTriangulateView.as_view(), name='point-cloud-triangulate'),
    path("point_cloud/<int:pk>/mesh", PointCloudMeshDataView.as_view(), name='point-cloud-mesh-data'),
    
    # Legacy endpoints (to be refactored)
    path("point-cloud", PointCloudBackendView.as_view()),
    path("3d-mesh", Mesh3DBackendView.as_view()),
    path("test/point-cloud", PointCloudView.as_view()),
    path("test/3d-mesh", Mesh3DView.as_view()),
    path("hello", HelloWorldView.as_view()),
]
