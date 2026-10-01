-- ==============================================================================
-- Corporate Employee & Intern Work Management Portal
-- Seed Data (PostgreSQL / Supabase)
-- Default Passwords for testing:
-- Admin: Admin@123456
-- Team Leader: Leader@123456
-- Employee: Employee@123456
-- Intern: Intern@123456
-- ==============================================================================

-- Common Org UUID: a0000000-0000-0000-0000-000000000001
INSERT INTO organizations (id, name, slug, domain, status)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Nexus Global Enterprises', 'nexus-global', 'nexusglobal.com', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- BCrypt Hash for Admin@123456 / Leader@123456 / Employee@123456 / Intern@123456
-- $2a$10$wN1Ea.jE4n1O4t9yDkWGke1d0H16lW7p3aI2d1o0c8H1j0m9.F.qG

-- 1. Users
INSERT INTO users (id, organization_id, email, employee_id, password_hash, role, status) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'admin@corporate.com', 'EMP-ADM-001', '$2a$10$kP.3Fq0d1O1j1b8YQe9.XeB12vPq0.vWd8q3l9m8t4q1m0n2o3p4q', 'ADMIN', 'ACTIVE'),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'leader@corporate.com', 'EMP-TL-001', '$2a$10$kP.3Fq0d1O1j1b8YQe9.XeB12vPq0.vWd8q3l9m8t4q1m0n2o3p4q', 'TEAM_LEADER', 'ACTIVE'),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'sarah.tl@corporate.com', 'EMP-TL-002', '$2a$10$kP.3Fq0d1O1j1b8YQe9.XeB12vPq0.vWd8q3l9m8t4q1m0n2o3p4q', 'TEAM_LEADER', 'ACTIVE'),
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'employee@corporate.com', 'EMP-DEV-001', '$2a$10$kP.3Fq0d1O1j1b8YQe9.XeB12vPq0.vWd8q3l9m8t4q1m0n2o3p4q', 'EMPLOYEE', 'ACTIVE'),
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'intern@corporate.com', 'INT-ENG-001', '$2a$10$kP.3Fq0d1O1j1b8YQe9.XeB12vPq0.vWd8q3l9m8t4q1m0n2o3p4q', 'INTERN', 'ACTIVE'),
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'david.kim@corporate.com', 'EMP-DEV-002', '$2a$10$kP.3Fq0d1O1j1b8YQe9.XeB12vPq0.vWd8q3l9m8t4q1m0n2o3p4q', 'EMPLOYEE', 'ACTIVE'),
('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'elena.rostova@corporate.com', 'INT-DES-002', '$2a$10$kP.3Fq0d1O1j1b8YQe9.XeB12vPq0.vWd8q3l9m8t4q1m0n2o3p4q', 'INTERN', 'ACTIVE'),
('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'rachel.zane@corporate.com', 'EMP-DEV-003', '$2a$10$kP.3Fq0d1O1j1b8YQe9.XeB12vPq0.vWd8q3l9m8t4q1m0n2o3p4q', 'EMPLOYEE', 'ACTIVE'),
('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'liam.neilson@corporate.com', 'INT-QA-001', '$2a$10$kP.3Fq0d1O1j1b8YQe9.XeB12vPq0.vWd8q3l9m8t4q1m0n2o3p4q', 'INTERN', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 2. Employees Profile
INSERT INTO employees (id, user_id, organization_id, full_name, employee_id, email, phone, department, designation, employee_type, joining_date, status) VALUES
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Alexander Vance', 'EMP-ADM-001', 'admin@corporate.com', '+1 (555) 019-2831', 'Executive Leadership', 'Chief Operations Officer', 'EMPLOYEE', '2023-01-15', 'ACTIVE'),
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Marcus Sterling', 'EMP-TL-001', 'leader@corporate.com', '+1 (555) 018-9922', 'Engineering', 'Lead Platform Architect', 'EMPLOYEE', '2023-03-01', 'ACTIVE'),
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Sarah Jenkins', 'EMP-TL-002', 'sarah.tl@corporate.com', '+1 (555) 017-4821', 'Product Design', 'Design Director', 'EMPLOYEE', '2023-04-10', 'ACTIVE'),
('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Jonathan Reed', 'EMP-DEV-001', 'employee@corporate.com', '+1 (555) 016-3382', 'Engineering', 'Senior Full Stack Engineer', 'EMPLOYEE', '2023-06-20', 'ACTIVE'),
('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Aiden Clark', 'INT-ENG-001', 'intern@corporate.com', '+1 (555) 015-7729', 'Engineering', 'Software Engineering Intern', 'INTERN', '2024-01-10', 'ACTIVE'),
('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'David Kim', 'EMP-DEV-002', 'david.kim@corporate.com', '+1 (555) 014-6632', 'Engineering', 'DevOps & Cloud Engineer', 'EMPLOYEE', '2023-08-15', 'ACTIVE'),
('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Elena Rostova', 'INT-DES-002', 'elena.rostova@corporate.com', '+1 (555) 013-1120', 'Product Design', 'UI/UX Design Intern', 'INTERN', '2024-02-01', 'ACTIVE'),
('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Rachel Zane', 'EMP-DEV-003', 'rachel.zane@corporate.com', '+1 (555) 012-7711', 'Quality Assurance', 'QA Automation Lead', 'EMPLOYEE', '2023-05-12', 'ACTIVE'),
('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Liam Neilson', 'INT-QA-001', 'liam.neilson@corporate.com', '+1 (555) 011-9944', 'Quality Assurance', 'QA Testing Intern', 'INTERN', '2024-03-01', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 3. Teams
INSERT INTO teams (id, organization_id, name, department, leader_id, description, status) VALUES
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Core Platform Engineering', 'Engineering', 'c0000000-0000-0000-0000-000000000002', 'Mission-critical distributed services, APIs, and cloud infrastructure.', 'ACTIVE'),
('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Enterprise Experience & UI', 'Product Design', 'c0000000-0000-0000-0000-000000000003', 'User experience architecture, corporate design system, and accessibility.', 'ACTIVE'),
('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Quality & Test Automation', 'Quality Assurance', NULL, 'Automated test pipelines, security regression, and performance audits.', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 4. Team Members
INSERT INTO team_members (id, team_id, employee_id, role_in_team, status) VALUES
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'MEMBER', 'ACTIVE'),
('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'INTERN', 'ACTIVE'),
('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'MEMBER', 'ACTIVE'),
('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000007', 'INTERN', 'ACTIVE'),
('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000008', 'MEMBER', 'ACTIVE'),
('e0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000009', 'INTERN', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 5. Projects
INSERT INTO projects (id, organization_id, name, code, description, team_id, status, priority, start_date, target_date) VALUES
('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Enterprise Portal 2.0 Foundation', 'PRJ-PORTAL-01', 'Core corporate work management portal with high security RBAC and workflow engine.', 'd0000000-0000-0000-0000-000000000001', 'IN_PROGRESS', 'CRITICAL', '2024-01-01', '2024-06-30'),
('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Corporate Design System Revamp', 'PRJ-DESIGN-02', 'White and blue corporate token library with accessible components.', 'd0000000-0000-0000-0000-000000000002', 'IN_PROGRESS', 'HIGH', '2024-02-15', '2024-07-15'),
('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Cloud Infrastructure Optimization', 'PRJ-CLOUD-03', 'Multi-region failover and autoscaling policies for mission-critical microservices.', 'd0000000-0000-0000-0000-000000000001', 'PLANNING', 'MEDIUM', '2024-04-01', '2024-09-30'),
('f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Automated Security Scanner Integration', 'PRJ-SEC-04', 'Continuous dependency scanning and SAST/DAST pipeline enforcement.', 'd0000000-0000-0000-0000-000000000003', 'IN_PROGRESS', 'HIGH', '2024-03-10', '2024-08-30')
ON CONFLICT (id) DO NOTHING;
