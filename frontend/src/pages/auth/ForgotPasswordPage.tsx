import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api-client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ForgotPasswordPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    setIsLoading(true);

    try {
      const res = await api.post<{ message: string; devResetToken?: string }>('/api/auth/forgot-password', {
        identifier,
      });
      setSubmitted(true);
      if (res.devResetToken) {
        setDevToken(res.devResetToken);
      }
    } catch {
      // Security standard: show generic success
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-corporate-600 flex items-center justify-center text-white shadow-elevated mb-3">
          <Building className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-navy-900">
          Reset Portal Password
        </h2>
        <p className="mt-1 text-xs text-navy-500">
          Enter your company email or employee ID to receive recovery instructions
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-2xl border border-navy-200">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy-900">Recovery Instructions Dispatched</h3>
              <p className="text-xs text-navy-600 leading-relaxed">
                If an active account corresponds to <span className="font-semibold text-navy-900">{identifier}</span>, a secure password reset link has been dispatched to your corporate email.
              </p>

              {devToken && (
                <div className="p-3 bg-corporate-50 border border-corporate-200 rounded-lg text-left text-xs">
                  <p className="font-semibold text-corporate-900 mb-1">Development Demo Token:</p>
                  <code className="bg-white px-2 py-1 rounded border border-corporate-200 font-mono text-corporate-800 text-xs block select-all">
                    {devToken}
                  </code>
                  <Link
                    to={`/reset-password?token=${devToken}`}
                    className="mt-2 text-xs font-semibold text-corporate-600 hover:underline block"
                  >
                    Proceed to Reset Form →
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link to="/login">
                  <Button variant="outline" size="md" className="w-full">
                    Return to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email or Employee ID"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. employee@corporate.com"
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isLoading}
                  className="w-full shadow-sm"
                >
                  Send Recovery Instructions
                </Button>
              </div>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-600 hover:text-navy-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
