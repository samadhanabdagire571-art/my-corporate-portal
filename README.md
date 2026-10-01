# Corporate Employee & Intern Work Management Portal (Part 1)

A production-ready enterprise workforce management platform featuring role-based access control, employee & intern directory management, team leadership governance, project tracking, and an executive administration dashboard.

Built strictly according to enterprise software design standards: **Enterprise-level architecture + extremely simple user experience.**

---

## 🏛️ Core Product Principles

- **Employee & Intern Experience**: `See Work → Do Work → Submit` (Zero bureaucratic complexity, clean workstation).
- **Team Leader Experience**: `Plan → Assign → Review` (Direct oversight over team projects and deliverables).
- **Admin Experience**: `Manage → Monitor → Control` (Complete organizational command center).

---

## 🎨 Corporate Design System

- **Corporate Palette**: Crisp white background (`#FFFFFF`, `#F8FAFC`), deep corporate blue (`#0267C7`, `#0352A1`), navy text typography (`#0F172A`, `#1E293B`), and soft light blue tint accents (`#EFF6FF`).
- **Visuals**: Clean card borders (`#E2E8F0`), subtle elevation (`shadow-card`), professional data tables, responsive layouts, and zero neon/gaming distractions.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    React + TypeScript SPA                   │
│        (Tailwind CSS, TanStack Query, React Router)         │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────┐  ┌─────────────────────────────┐
│    Node.js / NestJS API     │  │   Django REST Framework     │
│   (Auth, RBAC, Employees,   │  │   (CMS, LMS, Announcements, │
│     Team Leaders, Teams)    │  │   Administrative Services)  │
└──────────────┬──────────────┘  └─────────────┬───────────────┘
               │                               │
               └───────────────┬───────────────┘
                               ▼
            ┌────────────────────────────────────┐
            │       Supabase / PostgreSQL        │
            │   (UUIDs, Foreign Keys, Indexes,   │
            │   RLS Policies, Automated Triggers)│
            └────────────────────────────────────┘
```

---

## 🔑 Default Seed Credentials

All accounts come pre-configured with secure bcrypt-hashed passwords:

| Role | Email / Employee ID | Password | Landing Route |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@corporate.com` / `EMP-ADM-001` | `Admin@123456` | `/admin/dashboard` |
| **Team Leader** | `leader@corporate.com` / `EMP-TL-001` | `Leader@123456` | `/leader/dashboard` |
| **Employee** | `employee@corporate.com` / `EMP-DEV-001` | `Employee@123456` | `/employee/dashboard` |
| **Intern** | `intern@corporate.com` / `INT-ENG-001` | `Intern@123456` | `/employee/dashboard` |

> 💡 **Quick Demo Feature**: On the `/login` page, click any of the 4 **Quick One-Click Demo Logins** cards to automatically populate credentials and authenticate instantly!

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- Python 3.10+ (for secondary Django backend)

---

### Step 1: Run Primary Node.js / NestJS API

The backend comes with an **automatic high-performance seeded data store** that starts out-of-the-box without requiring external database setup. When `DATABASE_URL` is configured, it connects to PostgreSQL / Supabase automatically.

```bash
cd backend
npm install
npm run dev
```

API will be listening at: `http://localhost:4000`

---

### Step 2: Run React Frontend

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at: `http://localhost:5173`

---

### Step 3 (Optional): Run Secondary Django Backend (CMS / LMS)

```bash
cd backend-django
py -m venv venv
.\venv\Scripts\activate       # On Windows (or source venv/bin/activate on Linux/Mac)
pip install -r requirements.txt
py manage.py migrate
py manage.py runserver 8000
```

Django API available at: `http://localhost:8000/api/` and Admin at `http://localhost:8000/admin/`

---

## 💾 Database & Supabase Configuration

1. In Supabase, open the **SQL Editor**.
2. Run `database/schema.sql` to generate all tables, foreign keys, indexes, triggers, and Row Level Security (RLS) policies.
3. Run `database/seed.sql` to populate sample corporate data.
4. Add your Supabase connection string to `backend/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   ```
5. Refer to `database/supabase_setup.md` for complete details.

---

## 📦 Part 1 Module Breakdown

### 1. Authentication & Security
- [x] Login with Email or Employee ID, Password, and Remember Me (30-day token)
- [x] Role-based redirection:
  - Admin $\rightarrow$ `/admin/dashboard`
  - Team Leader $\rightarrow$ `/leader/dashboard`
  - Employee / Intern $\rightarrow$ `/employee/dashboard`
- [x] Protected route guards on both Frontend and Backend
- [x] Password recovery and administrative password reset
- [x] Bcrypt password hashing (never stored in plain text)

### 2. Admin Overview Dashboard
- [x] 6 KPI Overview Cards:
  - Total Employees
  - Total Interns
  - Total Team Leaders
  - Total Teams
  - Active Projects
  - Active Staff Members
- [x] Enterprise Project Progress Tracker (status, priority badges, progress bars)
- [x] Work Completion Rate Gauge (78.4% efficiency, tasks completed vs in-scope)
- [x] Department distribution progress bars
- [x] Live audit stream of organizational activities
- [x] Quick action shortcuts to core management areas

### 3. Employee & Intern Management
- [x] Paginated data table with server-side pagination, search, and filtering
- [x] Multi-field search (Full Name, Corporate Email, Employee ID)
- [x] Filter by Department (Engineering, Product Design, QA, Executive Leadership)
- [x] Filter by Status (Active, Inactive)
- [x] Filter by Type (Regular Employees, Interns)
- [x] Register New Employee / Intern modal with department, designation, and team assignment
- [x] Edit employee profile modal
- [x] Detailed employee drawer/modal view
- [x] One-click activate/deactivate account toggle
- [x] Administrative password reset with temporary password generator & copy button
- [x] Permanent deletion with cascade protection

### 4. Team Leader Management
- [x] Team leader table with assigned department supervision and teams led
- [x] Appoint new team leader modal
- [x] Edit leader profile & department assignment
- [x] Detailed profile inspection
- [x] Activate / deactivate team leader account

### 5. Team Management
- [x] Team roster table with leader info, member count, and department badge
- [x] Form new team modal with name, department, leader designation, and description
- [x] Edit team profile
- [x] Designate or change team leader modal
- [x] Manage team members modal: Add employees/interns and remove members
- [x] Team decommission confirmation modal

### 6. Full Sidebar & Roadmap Navigation
- [x] Dashboard
- [x] Employees
- [x] Team Leaders
- [x] Teams
- [x] Projects
- [x] Task Management (Roadmap Placeholder)
- [x] Submissions & Reviews (Roadmap Placeholder)
- [x] Training / LMS (Roadmap Placeholder)
- [x] CMS / Resources (Roadmap Placeholder)
- [x] Announcements (Roadmap Placeholder)
- [x] Reports & Analytics (Roadmap Placeholder)
- [x] Audit Logs (Roadmap Placeholder)
- [x] Settings (Roadmap Placeholder)
