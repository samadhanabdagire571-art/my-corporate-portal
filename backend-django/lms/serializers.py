# pyrefly: ignore [missing-import]
from rest_framework import serializers
from .models import TrainingCourse, CourseModule

class CourseModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseModule
        fields = '__all__'

class TrainingCourseSerializer(serializers.ModelSerializer):
    modules = CourseModuleSerializer(many=True, read_only=True)

    class Meta:
        model = TrainingCourse
        fields = '__all__'
