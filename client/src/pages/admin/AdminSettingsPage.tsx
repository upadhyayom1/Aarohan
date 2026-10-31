import React, { useState } from 'react';
import { useCampusStore } from '../../lib/useStore';
import { Button, Input, FormField } from '../../components/ui';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

export function AdminSettingsPage() {
  const { actions } = useCampusStore();
  const [defaultMinCgpa, setDefaultMinCgpa] = useState('7.0');
  const [maxBacklogsAllowed, setMaxBacklogsAllowed] = useState('0');
  const [placementYear, setPlacementYear] = useState('2026–2027');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="border-b border-[#E4E4E1] pb-6">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
          INSTITUTIONAL PLACEMENT POLICIES
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
          Platform & Governance Settings
        </h1>
        <p className="text-sm text-[#666666] mt-1 max-w-xl">
          Configure university placement bylaws, default eligibility thresholds, and academic year schedules.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 border border-[#111111] bg-[#FAFAF9] text-xs font-mono flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#111111]" />
          <span>Directorate placement bylaws updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-xl">
        <div className="border border-[#E4E4E1] bg-white p-6 sm:p-8 space-y-6">
          <FormField label="Academic Placement Year">
            <Input
              value={placementYear}
              onChange={e => setPlacementYear(e.target.value)}
            />
          </FormField>

          <FormField label="Standard Institutional Cutoff CGPA">
            <Input
              type="number"
              step="0.1"
              value={defaultMinCgpa}
              onChange={e => setDefaultMinCgpa(e.target.value)}
            />
          </FormField>

          <FormField label="Max Academic Backlogs Threshold">
            <Input
              type="number"
              value={maxBacklogsAllowed}
              onChange={e => setMaxBacklogsAllowed(e.target.value)}
            />
          </FormField>
        </div>

        <Button type="submit" variant="primary" size="md">
          Save Directorate Policies
        </Button>
      </form>
    </div>
  );
}
