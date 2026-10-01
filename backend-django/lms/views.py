from rest_framework import viewsets
from .models import TrainingCourse, CourseModule
from .serializers import TrainingCourseSerializer, CourseModuleSerializer

class TrainingCourseViewSet(viewsets.ModelViewSet):
    queryset = TrainingCourse.objects.all()
    serializer_class = TrainingCourseSerializer

class CourseModuleViewSet(viewsets.ModelViewSet):
    queryset = CourseModule.objects.all()
    serializer_class = CourseModuleSerializer
