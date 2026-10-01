from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/cms/', include('cms.urls')),
    path('api/lms/', include('lms.urls')),
]
