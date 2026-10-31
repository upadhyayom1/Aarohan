import React, { useState } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { Button, Input, FormField, Select } from '../../components/ui';

export function RegisterPage() {
  const { navigate } = useRouter();
  const { actions } = useCampusStore();

  const [role, setRole] = useState<'student' | 'recruiter'>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [extraField, setExtraField] = useState('2026'); // grad year or org

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    actions.switchRole(role);
    if (role === 'student') {
      actions.updateStudentProfile({
        fullName,
        email,
        graduationYear: parseInt(extraField) || 2026,
      });
      navigate('/student/dashboard');
    } else {
      navigate('/recruiter/dashboard');
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Full Legal Name" required>
              <Input
                placeholder="e.g. Jane Doe"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Email Address" required hint={role === 'student' ? 'Use @campus.edu' : 'Company domain'}>
              <Input
                type="email"
                placeholder={role === 'student' ? 'j.doe@campus.edu' : 'recruiting@company.com'}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Password" required>
              <Input
                type="password"
                placeholder="Create secure password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
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

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2">
              Complete Registration
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
