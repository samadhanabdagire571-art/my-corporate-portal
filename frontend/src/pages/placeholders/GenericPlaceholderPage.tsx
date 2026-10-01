import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Send,
  GraduationCap,
  FileText,
  Megaphone,
  BarChart3,
  ShieldAlert,
  Settings,
  ArrowLeft,
  Layers,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export interface GenericPlaceholderProps {
  title?: string;
  subtitle?: string;
}

export const GenericPlaceholderPage: React.FC<GenericPlaceholderProps> = ({ title: propTitle, subtitle: propSubtitle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getModuleInfo = () => {
    const path = location.pathname;

    if (path.includes('tasks')) {
      return {
        title: 'Task Management Engine',
        subtitle: 'Enterprise task scheduling, ticket-less work units, and priority boards.',
        icon: CheckSquare,
        part: 'Scheduled for Part 2',
        color: 'text-corporate-600',
        bg: 'bg-corporate-50',
      };
    }
    if (path.includes('submissions')) {
      return {
        title: 'Work Submission & Review System',
        subtitle: 'Deliverable submissions, revision threads, and team leader sign-offs.',
        icon: Send,
        part: 'Scheduled for Part 2',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
      };
    }
    if (path.includes('lms')) {
      return {
        title: 'Training & LMS Platform (Django Powered)',
        subtitle: 'Corporate onboarding curriculum, intern learning tracks, and progress evaluation.',
        icon: GraduationCap,
        part: 'Scheduled for Part 3 (Django Integration)',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
      };
    }
    if (path.includes('cms')) {
      return {
        title: 'Corporate CMS & Resource Library (Django Powered)',
        subtitle: 'Organization policies, compliance documents, and documentation repository.',
        icon: FileText,
        part: 'Scheduled for Part 3 (Django Integration)',
        color: 'text-teal-600',
        bg: 'bg-teal-50',
      };
    }
    if (path.includes('announcements')) {
      return {
        title: 'Company Announcements & Broadcasts',
        subtitle: 'Executive notices, priority broadcasts, and department communications.',
        icon: Megaphone,
        part: 'Scheduled for Part 3',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
      };
    }
    if (path.includes('reports')) {
      return {
        title: 'Executive Analytics & Performance Reports',
        subtitle: 'Workforce productivity metrics, department velocities, and SLA compliance graphs.',
        icon: BarChart3,
        part: 'Scheduled for Part 3',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
      };
    }
    if (path.includes('audit-logs')) {
      return {
        title: 'Security & Audit Trails',
        subtitle: 'Immutable logs of authentication events, user status modifications, and permission shifts.',
        icon: ShieldAlert,
        part: 'Scheduled for Part 3',
        color: 'text-rose-600',
        bg: 'bg-rose-50',
      };
    }
    return {
      title: 'Enterprise Settings & System Preferences',
      subtitle: 'Organization domains, SSO SAML/OAuth bindings, and notification preferences.',
      icon: Settings,
      part: 'Foundation Active',
      color: 'text-navy-600',
      bg: 'bg-navy-50',
    };
  };

  const info = getModuleInfo();
  const IconComponent = info.icon;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <Card>
        <CardContent className="p-10 text-center space-y-4">
          <div className={`w-16 h-16 rounded-2xl ${info.bg} ${info.color} flex items-center justify-center mx-auto border border-navy-200 shadow-sm`}>
            <IconComponent className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-corporate-600 bg-corporate-50 px-2.5 py-1 rounded-full border border-corporate-200">
              {info.part}
            </span>
            <h2 className="text-2xl font-bold text-navy-900 tracking-tight pt-2">
              {info.title}
            </h2>
            <p className="text-xs text-navy-500 max-w-md mx-auto leading-relaxed">
              {info.subtitle}
            </p>
          </div>

          <div className="pt-4 max-w-lg mx-auto p-4 bg-navy-50 rounded-xl border border-navy-200 text-left space-y-2 text-xs text-navy-700">
            <div className="flex items-center gap-2 font-semibold text-navy-900">
              <Layers className="w-4 h-4 text-corporate-600" />
              <span>Part 1 Architectural Readiness:</span>
            </div>
            <p className="text-navy-600 leading-normal">
              The primary database schema, RBAC permissions, and sidebar navigation endpoints for this module are established in Part 1. Backend services (Node.js & Django REST Framework) are mapped and ready for Part 2/3 execution.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Return to Previous Screen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
