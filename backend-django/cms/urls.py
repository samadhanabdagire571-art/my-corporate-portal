from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnnouncementViewSet, ResourceDocumentViewSet

router = DefaultRouter()
router.register(r'announcements', AnnouncementViewSet)
router.register(r'documents', ResourceDocumentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
