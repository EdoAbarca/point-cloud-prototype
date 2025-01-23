from django.urls import path
from .views import PointCloudView

urlpatterns = [
  path("point-cloud", PointCloudView.as_view()),
  #path("send/point-cloud", PointCloudView.as_view()),
]
