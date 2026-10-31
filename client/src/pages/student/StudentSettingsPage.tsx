import React, { useState } from 'react';
import { useCampusStore } from '../../lib/useStore';
import { Button } from '../../components/ui';
import { CheckCircle2, RotateCcw, Shield } from 'lucide-react';

export function StudentSettingsPage() {
  const { studentProfile, actions } = useCampusStore();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [interviewSms, setInterviewSms] = useState(true);
  const [sharePortfolio, setSharePortfolio] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
          PLACEMENT PREFERENCES & PRIVACY
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
          Student Preferences
        </h1>
        <p className="text-sm text-[#666666] mt-1 max-w-xl">
          Configure notification dispatch settings, institutional transcript visibility, and sandbox demo state.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 border border-[#111111] bg-[#FAFAF9] text-xs font-mono flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#111111]" />
          <span>Placement preference configuration saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8 max-w-2xl">
        {/* Recruitment Alerts */}
        <div className="border border-[#E4E4E1] bg-white p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-[#111111] border-b border-[#E4E4E1] pb-2">
            Placement Dispatch Notifications
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={e => setEmailAlerts(e.target.checked)}
                className="accent-black w-4 h-4 rounded-[2px]"
              />
              <span>Send immediate email advisories for application status updates</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={interviewSms}
                onChange={e => setInterviewSms(e.target.checked)}
                className="accent-black w-4 h-4 rounded-[2px]"
              />
              <span>Send SMS reminders 2 hours before scheduled technical rounds</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sharePortfolio}
                onChange={e => setSharePortfolio(e.target.checked)}
                className="accent-black w-4 h-4 rounded-[2px]"
              />
              <span>Allow participating recruiters to inspect GitHub & Portfolio links</span>
            </label>
          </div>
        </div>

        {/* Demo reset */}
        <div className="border border-[#222222] bg-[#FAFAF9] p-6 space-y-3 font-mono text-xs">
          <h2 className="text-sm font-bold uppercase text-[#111111] flex items-center gap-2">
            <RotateCcw size={15} /> Sandbox State Management
          </h2>
          <p className="text-xs text-[#666666] leading-relaxed">
            Reset all simulated interviews, modified student profile fields, newly created jobs, and submitted applications back to pristine institutional defaults.
          </p>
          <div className="pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                if (confirm('Reset all demo state to verified seed records?')) {
                  actions.resetToDefaults();
                  alert('Demo database reset to original institutional state.');
                }
              }}
            >
              Reset Sandbox to Factory Seed
            </Button>
          </div>
        </div>

        <Button type="submit" variant="primary" size="md">
          Save Settings
        </Button>
      </form>
    </div>
  );
}
