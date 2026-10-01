# Supabase & PostgreSQL Infrastructure Setup Guide

This guide describes how to configure Supabase and PostgreSQL for the **Corporate Employee & Intern Work Management Portal**.

---

## 1. Quick Supabase Setup

1. **Create a Supabase Project**:
   - Go to [https://supabase.com](https://supabase.com) and log in.
   - Click **New Project** and name it e.g. `corporate-work-portal`.
   - Select your preferred region and set a strong database password.

2. **Execute Database Migrations**:
   - In your Supabase dashboard, navigate to the **SQL Editor** tab.
   - Open and copy the contents of `database/schema.sql`.
   - Paste it into the SQL editor and click **Run**.
   - Verify that tables (`organizations`, `users`, `employees`, `teams`, `team_members`, `projects`) are created.

3. **Insert Seed Data**:
   - In the **SQL Editor**, open and copy the contents of `database/seed.sql`.
   - Paste into the SQL editor and click **Run**.

4. **Retrieve Connection Credentials**:
   - Go to **Project Settings** -> **Database**.
   - Copy the **Connection String** (`URI` or `Transaction Pooler`).
   - Format: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
   - Copy your **Project URL** and **anon / service_role** keys from **Project Settings** -> **API**.

---

## 2. Configure Node.js Backend

Create `.env` in `backend/`:

```env
PORT=4000
NODE_ENV=development
JWT_SECRET=super-secure-corporate-jwt-secret-key-2025-token
JWT_EXPIRES_IN=7d

# Supabase / PostgreSQL Direct Connection:
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Or Supabase API credentials:
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

> **Note**: The backend includes an **intelligent fallback provider**: If no database credentials are supplied, it automatically runs in high-performance in-memory mode initialized with all enterprise demo seed data! Once `DATABASE_URL` is set, it connects directly to PostgreSQL / Supabase.

---

## 3. Configure Secondary Backend (Django CMS/LMS)

In `django-cms-lms/core/settings.py` or `.env`:

```env
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
SECRET_KEY=corporate-django-cms-secret-key-39182
DEBUG=True
```

Django connects to the exact same PostgreSQL database, allowing seamless administration and future CMS/LMS extensions without duplicating business data!

---

## 4. Default Seed Credentials

| Role | Email / Employee ID | Password | Access Route |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@corporate.com` / `EMP-ADM-001` | `Admin@123456` | `/admin/dashboard` |
| **Team Leader** | `leader@corporate.com` / `EMP-TL-001` | `Leader@123456` | `/leader/dashboard` |
| **Employee** | `employee@corporate.com` / `EMP-DEV-001` | `Employee@123456` | `/employee/dashboard` |
| **Intern** | `intern@corporate.com` / `INT-ENG-001` | `Intern@123456` | `/employee/dashboard` |
