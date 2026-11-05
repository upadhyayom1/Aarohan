import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Button, Input, FormField } from '../../components/ui';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function AdminSettingsPage() {
  const [defaultMinCgpa, setDefaultMinCgpa] = useState('7.0');
  const [maxBacklogsAllowed, setMaxBacklogsAllowed] = useState('0');
  const [placementYear, setPlacementYear] = useState('2026–2027');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchSettings() {
      try {
        setLoading(true);
        const res = await api.admin.getSettings();
        if (mounted && res) {
          if (res.placement_year) setPlacementYear(res.placement_year);
          if (res.default_min_cgpa !== undefined) setDefaultMinCgpa(res.default_min_cgpa.toString());
          if (res.max_backlogs_allowed !== undefined) setMaxBacklogsAllowed(res.max_backlogs_allowed.toString());
        }
      } catch (err) {
        console.warn('Backend settings fetch error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchSettings();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await api.admin.updateSettings({
        placement_year: placementYear.trim(),
        default_min_cgpa: parseFloat(defaultMinCgpa) || 7.0,
        max_backlogs_allowed: parseInt(maxBacklogsAllowed, 10) || 0,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      console.warn('Backend settings update error:', err);
      setError(err?.message || 'Failed to update institutional policies');
    } finally {
      setSaving(false);
    }
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
          <span>Directorate placement bylaws updated successfully and logged in audit registry.</span>
        </div>
      )}

      {error && (
        <div className="p-3 border border-red-500 bg-red-50 text-xs font-mono flex items-center gap-2 text-red-700">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-xs font-mono text-[#858585] gap-2">
          <Loader2 className="animate-spin text-[#111111]" size={18} />
          <span>Loading institutional policy parameters from database...</span>
        </div>
      ) : (
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
                min="0"
                max="10"
                value={defaultMinCgpa}
                onChange={e => setDefaultMinCgpa(e.target.value)}
              />
            </FormField>

            <FormField label="Max Academic Backlogs Threshold">
              <Input
                type="number"
                min="0"
                max="10"
                value={maxBacklogsAllowed}
                onChange={e => setMaxBacklogsAllowed(e.target.value)}
              />
            </FormField>
          </div>

          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? 'Updating Bylaws...' : 'Save Directorate Policies'}
          </Button>
        </form>
      )}
    </div>
  );
}
