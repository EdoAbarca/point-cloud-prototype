from django.urls import path
from .views import PointCloudView

urlpatterns = [
    path('visualize', PointCloudView.as_view()),
]