import React, { useState, useEffect } from 'react';
import { useCampusStore } from '../../lib/useStore';
import { api } from '../../lib/api';
import { Button, Input, FormField } from '../../components/ui';
import { Building, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

export function RecruiterSettingsPage() {
  const { currentUser, actions } = useCampusStore();
  const [orgName, setOrgName] = useState(currentUser.organization || currentUser.name || 'Corporate Partner');
  const [contactName, setContactName] = useState(currentUser.name);
  const [contactEmail, setContactEmail] = useState(currentUser.email);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchAuthMe = async () => {
      setIsLoadingAuth(true);
      try {
        const me = await api.auth.getMe();
        if (active && me) {
          if (me.name) {
            setContactName(me.name);
            setOrgName(currentUser.organization || me.name);
          }
          if (me.email) setContactEmail(me.email);
        }
      } catch (err) {
        console.debug('Auth me lookup offline fallback:', err);
      } finally {
        if (active) setIsLoadingAuth(false);
      }
    };

    fetchAuthMe();
    return () => {
      active = false;
    };
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    actions.setAuthSession({
      ...currentUser,
      organization: orgName,
      name: contactName,
      email: contactEmail,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="border-b border-[#E4E4E1] pb-6">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
          ORGANIZATION CREDENTIALS
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
          Company Profile & Recruiter Desk
        </h1>
        <p className="text-sm text-[#666666] mt-1 max-w-xl">
          Maintain verified campus partnership credentials and authorized recruitment contact details.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 border border-[#111111] bg-[#FAFAF9] text-xs font-mono flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#111111]" />
          <span>Organization settings saved and synced with placement directorate.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-xl">
        <div className="border border-[#E4E4E1] bg-white p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 text-xs font-mono text-[#858585] border-b border-[#E4E4E1] pb-3">
            <ShieldCheck size={16} className="text-[#111111]" />
            <span>Accredited Campus Recruitment Partner • Status: Verified</span>
          </div>

          <FormField label="Organization / Corporate Entity Name" required>
            <Input
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
            />
          </FormField>

          <FormField label="Lead Recruiter Officer" required>
            <Input
              value={contactName}
              onChange={e => setContactName(e.target.value)}
            />
          </FormField>

          <FormField label="Corporate Recruiting Email" required>
            <Input
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
            />
          </FormField>
        </div>

        <Button type="submit" variant="primary" size="md">
          Save Organization Profile
        </Button>
      </form>
    </div>
  );
}
