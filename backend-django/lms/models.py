import uuid
from django.db import models

class TrainingCourse(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100, default='ONBOARDING')
    target_role = models.CharField(max_length=50, default='INTERN')
    estimated_hours = models.IntegerField(default=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class CourseModule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(TrainingCourse, on_delete=models.CASCADE, related_name='modules')
    order = models.IntegerField(default=1)
    title = models.CharField(max_length=255)
    content = models.TextField()
    resource_url = models.URLField(max_length=500, blank=True, null=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"
