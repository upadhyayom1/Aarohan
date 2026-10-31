import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../lib/api';
import { Input } from '../../components/ui';
import { Loader2, Briefcase } from 'lucide-react';

export function AdminRecruitersPage() {
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    async function fetchRecruiters() {
      try {
        setLoading(true);
        const res = await api.admin.getRecruiters();
        if (mounted && res?.recruiters) {
          setRecruiters(res.recruiters);
        }
      } catch (err) {
        console.warn('Backend recruiters fetch error:', err);
        if (mounted) setRecruiters([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchRecruiters();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return recruiters.filter(r => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (r.name || '').toLowerCase();
        const email = (r.email || '').toLowerCase();
        const company = (r.company || '').toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !company.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [recruiters, searchQuery]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
            CORPORATE PARTNERSHIP DIRECTORY
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Accredited Recruiters
          </h1>
          <p className="text-sm text-[#666666] mt-1 max-w-xl">
            Directory of verified corporate recruiters and talent acquisition partners registered in the system.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by recruiter name, email, or company..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-xs font-mono text-[#858585]">
          Total Recruiters: <strong className="text-[#111111]">{filtered.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#E4E4E1] bg-white">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-xs font-mono text-[#858585] gap-2">
            <Loader2 className="animate-spin text-[#111111]" size={18} />
            <span>Loading corporate recruiters from database...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs font-mono text-[#858585]">
            No corporate recruiters registered in database yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#FAFAF9] border-b border-[#E4E4E1] text-[#858585] uppercase">
                <tr>
                  <th className="py-3 px-4">Recruiter Name</th>
                  <th className="py-3 px-4">Corporate Email</th>
                  <th className="py-3 px-4">Organization / Company</th>
                  <th className="py-3 px-4 text-right">Job Openings Posted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E1]">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-[#F5F5F3]">
                    <td className="py-3.5 px-4 font-bold text-[#111111]">{r.name}</td>
                    <td className="py-3.5 px-4 text-[#666666]">{r.email}</td>
                    <td className="py-3.5 px-4 font-bold text-[#111111]">{r.company || '—'}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#111111]">
                      {r.jobs_posted ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
