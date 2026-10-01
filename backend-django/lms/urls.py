from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrainingCourseViewSet, CourseModuleViewSet

router = DefaultRouter()
router.register(r'courses', TrainingCourseViewSet)
router.register(r'modules', CourseModuleViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
