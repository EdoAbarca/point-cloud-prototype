from django.urls import path
from .views import PointCloudView, Mesh3DView, PointCloudBackendView, Mesh3DBackendView

urlpatterns = [
  path("point-cloud", PointCloudBackendView.as_view()),
	path("3d-mesh", Mesh3DBackendView.as_view()),
  path("test/point-cloud", PointCloudView.as_view()),
  path("test/3d-mesh", Mesh3DView.as_view()),
]
