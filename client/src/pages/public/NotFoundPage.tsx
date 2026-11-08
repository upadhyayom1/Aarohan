import React from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { Button } from '../../components/ui';
import { ArrowLeft, Compass, Home, ShieldAlert } from 'lucide-react';

export function NotFoundPage() {
  const { path, navigate } = useRouter();
  const { currentUser } = useCampusStore();

  const getDashboardPath = () => {
    if (currentUser.role === 'admin') return '/admin/dashboard';
    if (currentUser.role === 'recruiter') return '/recruiter/dashboard';
    if (currentUser.role === 'student') return '/student/dashboard';
    return '/';
  };

  return (
    <div className="min-h-[75vh] flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="max-w-md w-full space-y-6">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAFAF9] border border-[#E4E4E1] rounded-[2px] text-xs font-mono text-[#858585]">
          <span className="w-2 h-2 rounded-full bg-[#111111]" aria-hidden="true" />
          <span>HTTP 404 • DIRECTORY RESOLUTION FAILURE</span>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Page Not Located
          </h1>
          <p className="text-sm text-[#666666] leading-relaxed">
            The requested institutional path <code className="px-1.5 py-0.5 bg-[#F5F5F3] border border-[#E4E4E1] text-[#111111] font-mono text-xs rounded-[2px]">{path}</code> could not be found in the campus placement registry.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate(getDashboardPath())}
            icon={<Home size={15} />}
          >
            {currentUser.role !== 'student' && currentUser.name ? 'Return to Dashboard' : 'Return to Portal Home'}
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/opportunities')}
            icon={<Compass size={15} />}
          >
            Explore Opportunities
          </Button>
        </div>

        {/* Quick Help Links */}
        <div className="pt-8 border-t border-[#E4E4E1] text-xs font-mono text-[#858585] space-y-2">
          <span className="uppercase tracking-widest block text-[10px]">Institutional Navigation Shortcuts</span>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/" className="hover:text-[#111111] underline underline-offset-4">Homepage</Link>
            <Link to="/about" className="hover:text-[#111111] underline underline-offset-4">Placement Policies</Link>
            <Link to="/opportunities" className="hover:text-[#111111] underline underline-offset-4">Active Vacancies</Link>
            <Link to="/login" className="hover:text-[#111111] underline underline-offset-4">Portal Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

