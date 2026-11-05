import React, { useState } from 'react';
import { useRouter } from '../../lib/router';
import { api } from '../../lib/api';
import { Button, Input, Textarea, FormField } from '../../components/ui';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';

export function AdminNewDrivePage() {
  const { navigate } = useRouter();

  const [name, setName] = useState('');
  const [companiesText, setCompaniesText] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [minCgpa, setMinCgpa] = useState<number>(7.0);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Drive name is required.');
      return;
    }
    const companies = companiesText.split(',').map(s => s.trim()).filter(Boolean);
    if (companies.length === 0) {
      setError('At least one participating corporate partner is required.');
      return;
    }
    if (!registrationDeadline) {
      setError('Registration deadline is required.');
      return;
    }
    if (!eventStartDate || !eventEndDate) {
      setError('Event start and end dates are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await api.admin.createDrive({
        name: name.trim(),
        companies,
        job_openings_count: 0,
        registration_deadline: registrationDeadline,
        event_start_date: eventStartDate,
        event_end_date: eventEndDate,
        rounds: ['Assessment', 'Technical', 'HR'],
        eligible_branches: ['CSE', 'IT', 'ECE', 'EE', 'ME'],
        min_cgpa: minCgpa,
        status: 'Active',
        description: description.trim() || undefined,
      });

      navigate('/admin/drives');
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize placement drive');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <button
        onClick={() => navigate('/admin/drives')}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-[#666666] hover:text-[#111111] cursor-pointer"
      >
        <ArrowLeft size={14} />
        <span>Return to Drives Directory</span>
      </button>

      <div className="border-b border-[#E4E4E1] pb-6">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
          CAMPUS CONSORTIUM PROVISIONING
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
          Create Placement Drive
        </h1>
        <p className="text-sm text-[#666666] mt-1 max-w-xl">
          Coordinate partner employers, define registration windows, and set institutional participation criteria.
        </p>
      </div>

      {error && (
        <div className="p-3 border border-red-500 bg-red-50 text-xs font-mono flex items-center gap-2 text-red-700">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="border border-[#E4E4E1] bg-white p-6 sm:p-8 space-y-6">
          <FormField label="Placement Drive Name" required>
            <Input
              placeholder="e.g. Winter Technology & Systems Consortium 2026"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </FormField>

          <FormField label="Participating Corporate Partners" required hint="Comma separated">
            <Input
              placeholder="e.g. Google, Microsoft, Amazon"
              value={companiesText}
              onChange={e => setCompaniesText(e.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Registration Deadline" required>
              <Input
                type="date"
                value={registrationDeadline}
                onChange={e => setRegistrationDeadline(e.target.value)}
              />
            </FormField>

            <FormField label="Event Start Date" required>
              <Input
                type="date"
                value={eventStartDate}
                onChange={e => setEventStartDate(e.target.value)}
              />
            </FormField>

            <FormField label="Event End Date" required>
              <Input
                type="date"
                value={eventEndDate}
                onChange={e => setEventEndDate(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Institutional Minimum CGPA Threshold" required>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={minCgpa}
              onChange={e => setMinCgpa(parseFloat(e.target.value) || 0)}
            />
          </FormField>

          <FormField label="Consortium Description & Schedule Briefing">
            <Textarea
              rows={4}
              placeholder="Outline participation policies, interview schedule milestones, and company briefing requirements..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </FormField>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" size="md" disabled={submitting}>
            {submitting ? 'Publishing Placement Drive...' : 'Publish Placement Drive'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => navigate('/admin/drives')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
