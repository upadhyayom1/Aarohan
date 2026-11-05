import React, { useState } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { api, setAuthToken } from '../../lib/api';
import { UserRole } from '../../types';
import { Button, Input, FormField, Select, AarohanLogo } from '../../components/ui';
import { AlertCircle } from 'lucide-react';

export function RegisterPage() {
  const { navigate } = useRouter();
  const { actions } = useCampusStore();

  const [role, setRole] = useState<'student' | 'recruiter'>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [extraField, setExtraField] = useState('2026'); // grad year or org
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.auth.register({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      setAuthToken(res.token, res.role);
      actions.setAuthSession(
        {
          id: res.id,
          name: res.name,
          email: res.email,
          role: res.role as UserRole,
          organization: role === 'recruiter' ? extraField : undefined,
        },
        res.token
      );

      if (role === 'student') {
        actions.updateStudentProfile({
          fullName: res.name,
          email: res.email,
          graduationYear: parseInt(extraField, 10) || 2026,
        });
        navigate('/student/dashboard');
      } else {
        navigate('/recruiter/dashboard');
      }
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please check your details and try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-white">
      {/* Left Institutional Editorial Panel */}
      <div className="lg:w-1/2 bg-[#FAFAF9] border-b lg:border-b-0 lg:border-r border-[#E4E4E1] p-8 sm:p-16 flex flex-col justify-between">
        <div className="space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white border border-[#E4E4E1] rounded-[2px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#111111] font-semibold">
              ACCREDITATION & REGISTRATION
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#111111] leading-tight">
            Join the Campus Network.
          </h2>

          <p className="text-sm text-[#666666] leading-relaxed">
            Register your student candidacy dossier or request employer accreditation for upcoming campus recruitment drives. Accounts are validated against institutional records.
          </p>
        </div>

        <div className="pt-8 text-xs font-mono text-[#858585]">
          Placement Directorate Governance Policy • AY 2026–2027
        </div>
      </div>

      {/* Right Registration Form */}
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
              Create an Account
            </h1>
            <p className="text-xs font-mono text-[#666666] mt-1">
              Select your participation classification below.
            </p>
          </div>

          {/* Account type radio pill */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAFAF9] border border-[#E4E4E1] rounded-[2px] font-mono text-xs">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`py-2 text-center rounded-[2px] transition-colors cursor-pointer ${
                role === 'student' ? 'bg-[#111111] text-white font-bold' : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              Enrolled Student
            </button>
            <button
              type="button"
              onClick={() => setRole('recruiter')}
              className={`py-2 text-center rounded-[2px] transition-colors cursor-pointer ${
                role === 'recruiter' ? 'bg-[#111111] text-white font-bold' : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              Corporate Recruiter
            </button>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded-[2px] flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
              <div>
                <span className="font-bold">Registration Error:</span> {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Full Legal Name" required>
              <Input
                placeholder="e.g. Jane Doe"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Email Address" required hint={role === 'student' ? 'Use @aarohan.edu or campus email' : 'Company domain'}>
              <Input
                type="email"
                placeholder={role === 'student' ? 'j.doe@aarohan.edu' : 'recruiting@company.com'}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Password" required hint="Minimum 8 characters">
              <Input
                type="password"
                placeholder="Create secure password (min 8 chars)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </FormField>

            <FormField label="Confirm Password" required>
              <Input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </FormField>

            {role === 'student' ? (
              <FormField label="Graduation Cohort Year" required>
                <Select
                  value={extraField}
                  onChange={e => setExtraField(e.target.value)}
                >
                  <option value="2026">Class of 2026 (Final Year Senior)</option>
                  <option value="2027">Class of 2027 (Pre-final Year)</option>
                </Select>
              </FormField>
            ) : (
              <FormField label="Employer / Organization Name" required>
                <Input
                  placeholder="e.g. Apex Systems"
                  value={extraField}
                  onChange={e => setExtraField(e.target.value)}
                  required
                />
              </FormField>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
            </Button>
          </form>

          <div className="pt-6 border-t border-[#E4E4E1] flex items-center justify-between text-xs font-mono text-[#666666]">
            <span>Already have an account?</span>
            <Link to="/login" className="font-bold text-[#111111] hover:underline">
              Sign In Instead →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
