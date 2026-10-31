import React from 'react';
import { useRouter, Link } from '../../lib/router';
import { Button } from '../../components/ui';
import { ShieldCheck, GraduationCap, Award, Building, ArrowRight } from 'lucide-react';

export function AboutPage() {
  const { navigate } = useRouter();

  return (
    <div className="bg-white text-[#111111]">
      {/* Hero */}
      <section className="border-b border-[#E4E4E1] py-16 sm:py-24 bg-[#FAFAF9]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white border border-[#E4E4E1] rounded-[2px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#111111] font-semibold">
              INSTITUTIONAL CHARTER
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#111111] leading-tight">
            Connecting academic excellence with meaningful industry careers.
          </h1>

          <p className="text-base sm:text-lg text-[#666666] leading-relaxed">
            CampusLink was established by the university Directorate of Career Development & Corporate Relations to establish a transparent, objective, and explainable placement ecosystem.
          </p>
        </div>
      </section>

      {/* Principles */}
      <section className="py-20 border-b border-[#E4E4E1]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-2">
              CORE TENETS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
              Architectural principles of our recruitment platform.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-[#E4E4E1] p-6 sm:p-8 space-y-3 bg-white">
              <span className="font-mono text-2xl font-bold text-[#111111] block">01</span>
              <h3 className="text-lg font-bold text-[#111111]">Explainable AI, Not Black Boxes</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                We believe students have a right to understand why and how they match specific roles. Our matching algorithms provide dimensional breakdowns across core skills, academic cutoffs, and project alignment.
              </p>
            </div>

            <div className="border border-[#E4E4E1] p-6 sm:p-8 space-y-3 bg-white">
              <span className="font-mono text-2xl font-bold text-[#111111] block">02</span>
              <h3 className="text-lg font-bold text-[#111111]">Human Agency in Hiring</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                CampusLink does not automatically reject candidate applications. Similarity scores are advisory tools that empower recruiters to discover non-obvious engineering talent and evaluate students holistically.
              </p>
            </div>

            <div className="border border-[#E4E4E1] p-6 sm:p-8 space-y-3 bg-white">
              <span className="font-mono text-2xl font-bold text-[#111111] block">03</span>
              <h3 className="text-lg font-bold text-[#111111]">Equal Opportunity & Integrity</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                All placement drives enforce strict departmental eligibility and academic threshold transparency. Audit trails guarantee that every status update, interview invite, and placement outcome is verifiable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="bg-[#111111] text-white py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to participate in campus recruitment?</h2>
          <div className="flex justify-center gap-4 pt-2">
            <Link to="/opportunities">
              <Button variant="secondary" size="md">
                Browse Active Opportunities
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="md" className="text-white border border-neutral-600 hover:border-white">
                Access Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
