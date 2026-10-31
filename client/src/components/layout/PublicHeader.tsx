import React, { useState } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { Button } from '../ui';

export function PublicHeader() {
  const { path } = useRouter();
  const { currentUser } = useCampusStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Opportunities', href: '/opportunities' },
    { label: 'For Students', href: '/student/dashboard' },
    { label: 'For Recruiters', href: '/recruiter/dashboard' },
    { label: 'About', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-[4px] border-b border-[#E4E4E1]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex flex-col group">
            <span className="text-lg font-bold tracking-tight text-[#111111] uppercase font-mono group-hover:opacity-80 transition-opacity">
              Aarohan
            </span>
            <span className="text-[9px] font-mono tracking-widest text-[#858585] uppercase">
              Every career begins with a step
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => {
            const isActive = path === link.href || (link.href !== '/' && path.startsWith(link.href));
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`text-xs uppercase tracking-wider font-mono transition-colors pb-0.5 ${isActive
                    ? 'text-[#111111] font-bold border-b border-[#111111]'
                    : 'text-[#666666] hover:text-[#111111]'
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 border border-[#E4E4E1] text-[#111111] rounded-[2px]"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E4E4E1] bg-white px-4 py-4 space-y-3">
          <div className="flex flex-col gap-2">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm font-mono uppercase tracking-wider text-[#111111] border-b border-[#F5F5F3]"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button variant="secondary" size="md" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button variant="primary" size="md" className="w-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
