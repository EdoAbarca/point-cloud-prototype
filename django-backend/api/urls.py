from django.urls import path
from .views import PointCloudView, Mesh3DView

urlpatterns = [
  path("point-cloud", PointCloudView.as_view()),
	path("3d-mesh", Mesh3DView.as_view()),
  #path("send/point-cloud", PointCloudView.as_view()), # Envio de datos al frontend (T.B.A.)
]
