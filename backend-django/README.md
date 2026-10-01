# Secondary Backend: Django REST Framework (CMS & LMS)

This is the secondary backend module dedicated to **CMS (Announcements, Documents, Resources)** and **LMS (Training Courses, Modules, Intern Learning Tracks)**.

### Architectural Principle:
- **No Duplicated Business Logic**: Primary employee/team/work/auth workflows are handled by the Node.js / NestJS API.
- **Shared Data Plane**: In production, Django connects to the same PostgreSQL / Supabase database.
- **Admin-Heavy Workflows**: Leverages Django's built-in Admin (`/admin`) for content moderators and learning managers.

### Setup Instructions:

1. **Create Virtual Environment**:
   ```bash
   cd backend-django
   py -m venv venv
   .\venv\Scripts\activate   # On Windows
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Migrate & Run**:
   ```bash
   py manage.py migrate
   py manage.py runserver 8000
   ```

4. **Available Endpoints**:
   - `GET /api/cms/announcements/`
   - `GET /api/cms/documents/`
   - `GET /api/lms/courses/`
   - `GET /api/lms/modules/`
