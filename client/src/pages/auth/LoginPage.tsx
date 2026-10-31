import React, { useState } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { api, setAuthToken } from '../../lib/api';
import { UserRole } from '../../types';
import { Button, Input, FormField, AarohanLogo } from '../../components/ui';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const { navigate } = useRouter();
  const { actions } = useCampusStore();

  const [email, setEmail] = useState('dev.sharma@aarohan.edu');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.auth.login({ email: loginEmail, password: loginPass });
      setAuthToken(res.token, res.role);
      actions.setAuthSession({
        id: res.id,
        name: res.name,
        email: res.email,
        role: res.role as UserRole,
      }, res.token);

      if (res.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.role === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      const msg = err.message || 'Invalid credentials. Please verify your email and password.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const handleQuickLogin = async (role: 'student' | 'recruiter' | 'admin') => {
    let qEmail = 'dev.sharma@aarohan.edu';
    const qPass = 'Password@123';

    if (role === 'recruiter') {
      qEmail = 'recruiter@apexsystems.com';
    } else if (role === 'admin') {
      qEmail = 'admin@aarohan.edu';
    }

    setEmail(qEmail);
    setPassword(qPass);
    await performLogin(qEmail, qPass);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-white">
      {/* Left Institutional Editorial Panel */}
      <div className="lg:w-1/2 bg-[#FAFAF9] border-b lg:border-b-0 lg:border-r border-[#E4E4E1] p-8 sm:p-16 flex flex-col justify-between">
        <div className="space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white border border-[#E4E4E1] rounded-[2px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#111111] font-semibold">
              INSTITUTIONAL ACCESS PORTAL
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#111111] leading-tight">
            Central Placement Gateway.
          </h2>

          <p className="text-sm text-[#666666] leading-relaxed">
            Authorized sign in for enrolled students, verified corporate recruiters, and university placement administrators. Single sign-on credentials are encrypted and governed under institutional privacy bylaws.
          </p>
        </div>

        {/* Demo Fast-Switch Buttons */}
        <div className="pt-8 mt-8 border-t border-[#E4E4E1] space-y-3 font-mono text-xs">
          <span className="text-[10px] text-[#858585] uppercase tracking-widest block">
            DEMO SEEDED ONE-CLICK LOGIN
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin('student')}
              className="bg-white border border-[#222222] hover:bg-black hover:text-white px-3 py-1.5 rounded-[2px] transition-colors cursor-pointer disabled:opacity-50"
            >
              Sign In as Student (Dev Sharma)
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin('recruiter')}
              className="bg-white border border-[#222222] hover:bg-black hover:text-white px-3 py-1.5 rounded-[2px] transition-colors cursor-pointer disabled:opacity-50"
            >
              Sign In as Recruiter (Apex Systems)
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin('admin')}
              className="bg-white border border-[#222222] hover:bg-black hover:text-white px-3 py-1.5 rounded-[2px] transition-colors cursor-pointer disabled:opacity-50"
            >
              Sign In as Placement Dean (Admin)
            </button>
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="lg:w-1/2 p-8 sm:p-16 flex items-center justify-center bg-white">
        <div className="w-full max-w-md space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <AarohanLogo size={36} />
              <span className="font-mono text-sm font-bold uppercase tracking-widest text-[#858585]">
                Aarohan Portal
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
              Sign in to Aarohan
            </h1>
            <p className="text-xs font-mono text-[#666666] mt-1">
              Enter your institutional credentials or corporate partner email.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded-[2px] flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
              <div>
                <span className="font-bold">Authentication Failed:</span> {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField label="Institutional / Work Email" required>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@aarohan.edu"
                required
              />
            </FormField>

            <FormField label="Password" required>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#858585] hover:text-[#111111]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormField>

            <div className="flex items-center justify-between text-xs font-mono">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="accent-black rounded-[2px]"
                />
                <span>Remember this terminal</span>
              </label>

              <Link to="/forgot-password" className="text-[#858585] hover:text-[#111111] underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Portal'}
            </Button>
          </form>

          <div className="pt-6 border-t border-[#E4E4E1] flex items-center justify-between text-xs font-mono text-[#666666]">
            <span>Need an authorized account?</span>
            <Link to="/register" className="font-bold text-[#111111] hover:underline">
              Create an Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
