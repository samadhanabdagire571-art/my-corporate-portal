import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, User as UserIcon, Building, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { success, error: toastError } = useToast();

  const [identifier, setIdentifier] = useState('admin@corporate.com');
  const [password, setPassword] = useState('Admin@123456');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const expired = searchParams.get('expired');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await login(identifier, password, rememberMe);
      success('Authentication Successful', `Welcome back, ${response.user.name}`);
      navigate(response.redirectUrl, { replace: true });
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please verify your credentials.';
      setErrorMessage(msg);
      toastError('Login Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-navy-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-corporate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <div className="mx-auto w-12 h-12 rounded-xl bg-corporate-600 flex items-center justify-center text-white shadow-elevated mb-3">
          <Building className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-navy-900">
          Nexus Global Workforce Portal
        </h2>
        <p className="mt-1 text-xs text-navy-500 font-medium">
          Enterprise Employee & Intern Work Management Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-2xl border border-navy-200">
          {expired && (
            <div className="mb-5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Your session has expired. Please authenticate to continue.</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {errorMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email or Employee ID"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. admin@corporate.com or EMP-ADM-001"
              leftIcon={<UserIcon className="w-4 h-4" />}
            />

            <div className="space-y-1.5">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-navy-400 hover:text-navy-600 focus:outline-none pointer-events-auto"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-navy-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-navy-300 text-corporate-600 focus:ring-corporate-500 w-4 h-4 cursor-pointer"
                />
                <span>Remember me for 30 days</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-corporate-600 hover:text-corporate-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full shadow-sm py-2.5"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Enterprise Portal
              </Button>
            </div>
          </form>

          {/* Quick Demo Logins Container */}
          <div className="mt-8 pt-6 border-t border-navy-100">
            <p className="text-[11px] font-bold text-navy-400 uppercase tracking-wider mb-2.5 text-center">
              Quick One-Click Demo Logins
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@corporate.com', 'Admin@123456')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  identifier === 'admin@corporate.com'
                    ? 'border-corporate-600 bg-corporate-50/60 font-semibold text-corporate-900'
                    : 'border-navy-200 hover:bg-navy-50 text-navy-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-corporate-700">Admin</span>
                  {identifier === 'admin@corporate.com' && <Check className="w-3.5 h-3.5 text-corporate-600" />}
                </div>
                <span className="text-[10px] text-navy-500 block truncate">admin@corporate.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('leader@corporate.com', 'Leader@123456')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  identifier === 'leader@corporate.com'
                    ? 'border-blue-600 bg-blue-50/60 font-semibold text-blue-900'
                    : 'border-navy-200 hover:bg-navy-50 text-navy-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-700">Team Leader</span>
                  {identifier === 'leader@corporate.com' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <span className="text-[10px] text-navy-500 block truncate">leader@corporate.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('employee@corporate.com', 'Employee@123456')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  identifier === 'employee@corporate.com'
                    ? 'border-teal-600 bg-teal-50/60 font-semibold text-teal-900'
                    : 'border-navy-200 hover:bg-navy-50 text-navy-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-teal-700">Employee</span>
                  {identifier === 'employee@corporate.com' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                </div>
                <span className="text-[10px] text-navy-500 block truncate">employee@corporate.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('intern@corporate.com', 'Intern@123456')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  identifier === 'intern@corporate.com'
                    ? 'border-cyan-600 bg-cyan-50/60 font-semibold text-cyan-900'
                    : 'border-navy-200 hover:bg-navy-50 text-navy-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-cyan-700">Intern</span>
                  {identifier === 'intern@corporate.com' && <Check className="w-3.5 h-3.5 text-cyan-600" />}
                </div>
                <span className="text-[10px] text-navy-500 block truncate">intern@corporate.com</span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-navy-400">
          Protected by Enterprise Role-Based Access Control (RBAC) & Bcrypt Security
        </p>
      </div>
    </div>
  );
};
