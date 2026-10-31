import React, { useState } from 'react';
import { useRouter, Link } from '../../lib/router';
import { Button, Input, FormField } from '../../components/ui';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-[#FAFAF9]">
      <div className="w-full max-w-md bg-white border border-[#222222] p-8 sm:p-10 space-y-6">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#666666] hover:text-[#111111]">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
            ACCOUNT RECOVERY
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
            Reset Password
          </h1>
          <p className="text-xs font-mono text-[#666666] mt-1">
            Enter your institutional email address to receive password reset authorization instructions.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 border border-[#111111] bg-[#FAFAF9] font-mono text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#111111]">
              <CheckCircle2 size={16} /> Recovery Link Dispatched
            </div>
            <p className="text-[#666666]">
              If an active dossier exists for <strong className="text-black">{email}</strong>, a secure reset token has been transmitted to your inbox.
            </p>
            <div className="pt-2">
              <Button variant="secondary" size="sm" onClick={() => navigate('/login')}>
                Return to Login
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Institutional Email" required>
              <Input
                type="email"
                placeholder="name@campus.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </FormField>

            <Button type="submit" variant="primary" size="md" className="w-full">
              Send Password Reset Link
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
