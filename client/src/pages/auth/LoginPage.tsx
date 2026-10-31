import React, { useState } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { Button, Input, FormField } from '../../components/ui';
import { Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const { navigate } = useRouter();
  const { actions } = useCampusStore();

  const [email, setEmail] = useState('aditi.rao@campus.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Auto-route based on email entered
      if (email.includes('apex') || email.includes('recruiter')) {
        actions.switchRole('recruiter');
        navigate('/recruiter/dashboard');
      } else if (email.includes('dean') || email.includes('admin')) {
        actions.switchRole('admin');
        navigate('/admin/dashboard');
      } else {
        actions.switchRole('student');
        navigate('/student/dashboard');
      }
    }, 400);
  };

  const handleQuickLogin = (role: 'student' | 'recruiter' | 'admin') => {
    actions.switchRole(role);
    if (role === 'student') navigate('/student/dashboard');
    else if (role === 'recruiter') navigate('/recruiter/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
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
            DEMO SANDBOX QUICK LOGIN
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickLogin('student')}
              className="bg-white border border-[#222222] hover:bg-black hover:text-white px-3 py-1.5 rounded-[2px] transition-colors cursor-pointer"
            >
              Sign In as Student (Aditi Rao)
            </button>
            <button
              onClick={() => handleQuickLogin('recruiter')}
              className="bg-white border border-[#222222] hover:bg-black hover:text-white px-3 py-1.5 rounded-[2px] transition-colors cursor-pointer"
            >
              Sign In as Recruiter (Apex Systems)
            </button>
            <button
              onClick={() => handleQuickLogin('admin')}
              className="bg-white border border-[#222222] hover:bg-black hover:text-white px-3 py-1.5 rounded-[2px] transition-colors cursor-pointer"
            >
              Sign In as Placement Dean
            </button>
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="lg:w-1/2 p-8 sm:p-16 flex items-center justify-center bg-white">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
              Sign in to CampusLink
            </h1>
            <p className="text-xs font-mono text-[#666666] mt-1">
              Enter your institutional credentials or corporate partner email.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField label="Institutional / Work Email" required>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@campus.edu"
                required
              />
            </FormField>

            <FormField label="Password" required>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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
