import React, { useState } from 'react';
import { useRouter } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { Button, Input, Textarea, Select, FormField } from '../../components/ui';
import { ArrowLeft, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';

export function RecruiterNewJobPage() {
  const { navigate } = useRouter();
  const { currentUser, actions } = useCampusStore();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Cambridge, MA');
  const [workArrangement, setWorkArrangement] = useState<'On-site' | 'Hybrid' | 'Remote'>('Hybrid');
  const [employmentType, setEmploymentType] = useState<'Full-time' | 'Internship' | 'Co-op'>('Full-time');
  const [salaryRange, setSalaryRange] = useState('$115,000 – $130,000 / yr');
  const [deadline, setDeadline] = useState('2026-12-15');
  const [description, setDescription] = useState('');

  // Responsibilities & Qualifications
  const [responsibilitiesText, setResponsibilitiesText] = useState(
    'Architect and scale cloud backend APIs.\nCollaborate in peer code reviews and automated CI testing.\nParticipate in on-call site reliability rotations.'
  );
  const [qualificationsText, setQualificationsText] = useState(
    'Graduating Senior in Computer Science, Software Engineering, or related technical field.\nProficiency in modern TypeScript or Java.\nStrong command of data structures and algorithms.'
  );

  // Skills
  const [requiredSkills, setRequiredSkills] = useState(['React', 'TypeScript', 'Node.js', 'SQL']);
  const [newSkill, setNewSkill] = useState('');
  const [preferredSkills, setPreferredSkills] = useState(['Docker', 'AWS']);
  const [newPrefSkill, setNewPrefSkill] = useState('');

  // Eligibility
  const [minCgpa, setMinCgpa] = useState<number>(7.5);
  const [maxBacklogs, setMaxBacklogs] = useState<number>(0);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([
    'Computer Science & Engineering',
    'Information Technology',
  ]);
  const [gradYears, setGradYears] = useState<number[]>([2026]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableBranches = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electrical & Computer Engineering',
    'Data Science',
    'Mechanical Engineering',
    'Biomedical Engineering',
  ];

  const handleToggleBranch = (branch: string) => {
    if (selectedBranches.includes(branch)) {
      if (selectedBranches.length > 1) {
        setSelectedBranches(selectedBranches.filter(b => b !== branch));
      }
    } else {
      setSelectedBranches([...selectedBranches, branch]);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !requiredSkills.includes(newSkill.trim())) {
      setRequiredSkills([...requiredSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleAddPrefSkill = () => {
    if (newPrefSkill.trim() && !preferredSkills.includes(newPrefSkill.trim())) {
      setPreferredSkills([...preferredSkills, newPrefSkill.trim()]);
      setNewPrefSkill('');
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Role title is required.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Role description is required.');
      return;
    }
    if (requiredSkills.length === 0) {
      setErrorMessage('At least one required skill is mandatory.');
      return;
    }

    const newJob = actions.createJob({
      title: title.trim(),
      company: currentUser.organization || 'Apex Systems',
      companyInitials: (currentUser.organization || 'AS').slice(0, 2).toUpperCase(),
      location,
      workArrangement,
      employmentType,
      salaryRange,
      deadline,
      description: description.trim(),
      responsibilities: responsibilitiesText.split('\n').filter(s => s.trim()),
      requiredQualifications: qualificationsText.split('\n').filter(s => s.trim()),
      requiredSkills,
      preferredSkills,
      eligibleBranches: selectedBranches,
      eligibleGradYears: gradYears,
      minCgpa,
      maxBacklogs,
      status: 'Active',
      recruiterId: currentUser.id,
      recruiterName: currentUser.name,
      recruiterEmail: currentUser.email,
    });

    navigate(`/recruiter/jobs/${newJob.id}/applicants`);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button */}
      <button
        onClick={() => navigate('/recruiter/jobs')}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-[#666666] hover:text-[#111111] cursor-pointer"
      >
        <ArrowLeft size={14} />
        <span>Return to Vacancy List</span>
      </button>

      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
          CAMPUS RECRUITMENT CREATION
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
          Post New Campus Vacancy
        </h1>
        <p className="text-sm text-[#666666] mt-1 max-w-xl">
          Publish employment positions for student application, automatic eligibility filtering, and AI matching.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 border border-[#111111] bg-[#FAFAF9] text-xs font-mono text-[#111111] flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePublish} className="space-y-12 max-w-4xl">
        {/* SECTION A: BASIC INFORMATION */}
        <div className="border border-[#E4E4E1] bg-white p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#E4E4E1] pb-3">
            <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-[#111111]">
              Section A: Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <FormField label="Job / Role Title" required>
                <Input
                  placeholder="e.g. Software Development Engineer I"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </FormField>
            </div>

            <FormField label="Location">
              <Input
                placeholder="e.g. Cambridge, MA"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </FormField>

            <FormField label="Work Arrangement">
              <Select
                value={workArrangement}
                onChange={e => setWorkArrangement(e.target.value as any)}
              >
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
                <option value="Remote">Remote</option>
              </Select>
            </FormField>

            <FormField label="Employment Type">
              <Select
                value={employmentType}
                onChange={e => setEmploymentType(e.target.value as any)}
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Co-op">Co-op</option>
              </Select>
            </FormField>

            <FormField label="Compensation / Salary Range">
              <Input
                placeholder="e.g. $115,000 – $130,000 / yr"
                value={salaryRange}
                onChange={e => setSalaryRange(e.target.value)}
              />
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Role Overview / Description" required>
                <Textarea
                  rows={4}
                  placeholder="Describe the team, mission, and day-to-day engineering challenges..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* SECTION B: RESPONSIBILITIES & QUALIFICATIONS */}
        <div className="border border-[#E4E4E1] bg-white p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#E4E4E1] pb-3">
            <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-[#111111]">
              Section B: Responsibilities & Qualifications
            </h2>
            <p className="text-xs text-[#858585] mt-0.5">Enter one bullet per line.</p>
          </div>

          <div className="space-y-6">
            <FormField label="Key Responsibilities">
              <Textarea
                rows={3}
                value={responsibilitiesText}
                onChange={e => setResponsibilitiesText(e.target.value)}
              />
            </FormField>

            <FormField label="Required Qualifications">
              <Textarea
                rows={3}
                value={qualificationsText}
                onChange={e => setQualificationsText(e.target.value)}
              />
            </FormField>
          </div>
        </div>

        {/* SECTION C: SKILLS */}
        <div className="border border-[#E4E4E1] bg-white p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#E4E4E1] pb-3">
            <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-[#111111]">
              Section C: Technical Competencies
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <FormField label="Core Required Skills" required hint="Used directly for semantic AI match">
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add required skill (e.g. React, Python)..."
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" onClick={handleAddSkill}>
                    Add
                  </Button>
                </div>
              </FormField>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {requiredSkills.map(s => (
                  <span key={s} className="bg-white border border-[#111111] px-2.5 py-0.5 text-xs font-mono flex items-center gap-1.5">
                    {s}
                    <button type="button" onClick={() => setRequiredSkills(requiredSkills.filter(i => i !== s))}>✕</button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <FormField label="Preferred / Secondary Skills">
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add preferred skill (e.g. Docker, GraphQL)..."
                    value={newPrefSkill}
                    onChange={e => setNewPrefSkill(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPrefSkill();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" onClick={handleAddPrefSkill}>
                    Add
                  </Button>
                </div>
              </FormField>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {preferredSkills.map(s => (
                  <span key={s} className="bg-[#FAFAF9] border border-[#E4E4E1] text-[#666666] px-2.5 py-0.5 text-xs font-mono flex items-center gap-1.5">
                    {s}
                    <button type="button" onClick={() => setPreferredSkills(preferredSkills.filter(i => i !== s))}>✕</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION D: ELIGIBILITY */}
        <div className="border border-[#E4E4E1] bg-white p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#E4E4E1] pb-3">
            <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-[#111111]">
              Section D: Placement Eligibility Thresholds
            </h2>
            <p className="text-xs text-[#858585] mt-0.5">Enforced automatically upon candidate submission.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Minimum CGPA Cutoff" required hint="e.g. 7.50">
              <Input
                type="number"
                step="0.05"
                min="0"
                max="10"
                value={minCgpa}
                onChange={e => setMinCgpa(parseFloat(e.target.value) || 0)}
              />
            </FormField>

            <FormField label="Maximum Active Backlogs Permitted" required>
              <Input
                type="number"
                min="0"
                value={maxBacklogs}
                onChange={e => setMaxBacklogs(parseInt(e.target.value) || 0)}
              />
            </FormField>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#111111] block">
                Eligible Departments / Branches
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {availableBranches.map(branch => {
                  const checked = selectedBranches.includes(branch);
                  return (
                    <label key={branch} className="flex items-center gap-2 p-2 border border-[#E4E4E1] cursor-pointer bg-[#FAFAF9]">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleBranch(branch)}
                        className="accent-black"
                      />
                      <span>{branch}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION E: RECRUITMENT TIMELINE */}
        <div className="border border-[#E4E4E1] bg-white p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#E4E4E1] pb-3">
            <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-[#111111]">
              Section E: Recruitment Timeline
            </h2>
          </div>

          <div className="max-w-xs">
            <FormField label="Application Deadline" required>
              <Input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
              />
            </FormField>
          </div>
        </div>

        {/* SECTION F: REVIEW AND PUBLISH */}
        <div className="border-t border-[#E4E4E1] pt-6 flex items-center justify-end gap-3">
          <Button variant="secondary" size="md" onClick={() => navigate('/recruiter/jobs')}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit">
            Publish Campus Vacancy
          </Button>
        </div>
      </form>
    </div>
  );
}
