import React from 'react';
import { Link } from '../../lib/router';
import { Button, AarohanLogo } from '../ui';

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-[6px] border-b border-[#E4E4E1] transition-shadow">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand with Logo */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <AarohanLogo size={32} />
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold tracking-tight text-[#111111] uppercase font-mono group-hover:opacity-85 transition-opacity">
                Aarohan
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#858585] uppercase">
                Every career begins with a step
              </span>
            </div>
          </Link>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3">
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
      </div>
    </header>
  );
}
