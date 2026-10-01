from rest_framework import viewsets
from .models import Announcement, ResourceDocument
from .serializers import AnnouncementSerializer, ResourceDocumentSerializer

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer

class ResourceDocumentViewSet(viewsets.ModelViewSet):
    queryset = ResourceDocument.objects.all()
    serializer_class = ResourceDocumentSerializer
