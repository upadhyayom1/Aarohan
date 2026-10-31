import React, { useState } from 'react';
import { useRouter } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { api, ApiError } from '../../lib/api';
import { Button, Input, Textarea, Select, FormField } from '../../components/ui';
import { ArrowLeft, CheckCircle2, AlertCircle, Plus, Trash2, RefreshCw } from 'lucide-react';

const BRANCH_CODE_MAP: Record<string, string> = {
  'Computer Science & Engineering': 'CSE',
  'Information Technology': 'IT',
  'Electrical & Computer Engineering': 'ECE',
  'Mechanical Engineering': 'ME',
  'Data Science': 'CSE',
  'Biomedical Engineering': 'OTHER',
  'CSE': 'CSE',
  'IT': 'IT',
  'ECE': 'ECE',
  'EE': 'EE',
  'ME': 'ME',
  'CE': 'CE',
  'CH': 'CH',
  'MCA': 'MCA',
  'MBA': 'MBA',
  'PHD_CS': 'PHD_CS',
  'OTHER': 'OTHER',
};

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
  const [isPublishing, setIsPublishing] = useState(false);

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

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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

    // Map branches to validated enum codes
    const mappedBranches = Array.from(
      new Set(
        selectedBranches
          .map(b => BRANCH_CODE_MAP[b] || 'CSE')
          .filter(Boolean)
      )
    );

    setIsPublishing(true);

    const companyName = currentUser.organization || 'Apex Systems';

    const payload = {
      title: title.trim(),
      company: companyName,
      description: description.trim(),
      required_skills: requiredSkills,
      eligible_branches: mappedBranches.length > 0 ? mappedBranches : ['CSE'],
      min_cgpa: Number(minCgpa),
      graduation_year: Number(gradYears[0] || 2026),
      max_backlogs: Number(maxBacklogs),
      deadline: new Date(deadline).toISOString(),
    };

    try {
      // 1. Create on Node.js backend
      const createdJob = await api.jobs.create(payload);

      // 2. Add to store
      actions.createJob({
        title: createdJob.title || title.trim(),
        company: createdJob.company || companyName,
        companyInitials: (createdJob.company || companyName).slice(0, 2).toUpperCase(),
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

      await actions.loadRecruiterPortalData();
      navigate(`/recruiter/jobs/${createdJob.id}/applicants`);
    } catch (err: any) {
      console.warn('Backend job creation error:', err);
      if (err instanceof ApiError) {
        setErrorMessage(err.message || 'Server rejected job creation');
      } else {
        // Fallback for demo mode
        const localJob = actions.createJob({
          title: title.trim(),
          company: companyName,
          companyInitials: companyName.slice(0, 2).toUpperCase(),
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
        navigate(`/recruiter/jobs/${localJob.id}/applicants`);
      }
    } finally {
      setIsPublishing(false);
    }
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
          CAMPUS RECRUITMENT CREATION (NODE.JS BACKEND)
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
        {/* SECTION A: BASIC ROLE ATTRIBUTES */}
        <div className="border border-[#E4E4E1] bg-white p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#E4E4E1] pb-3">
            <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-[#111111]">
              Section A: Basic Opportunity Specifications
            </h2>
          </div>

          <div className="space-y-4">
            <FormField label="Position Title" required>
              <Input
                placeholder="e.g. Associate Software Engineer — Core Platform"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Hiring Organization" required>
                <Input
                  value={currentUser.organization || 'Apex Systems'}
                  disabled
                  className="bg-[#F5F5F3]"
                />
              </FormField>

              <FormField label="Work Location / Region" required>
                <Input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Work Arrangement" required>
                <Select
                  value={workArrangement}
                  onChange={e => setWorkArrangement(e.target.value as any)}
                >
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                </Select>
              </FormField>

              <FormField label="Employment Type" required>
                <Select
                  value={employmentType}
                  onChange={e => setEmploymentType(e.target.value as any)}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Co-op">Co-op</option>
                </Select>
              </FormField>

              <FormField label="Annual Compensation Range">
                <Input
                  value={salaryRange}
                  onChange={e => setSalaryRange(e.target.value)}
                />
              </FormField>
            </div>

            <FormField label="Role Summary & Department Overview" required>
              <Textarea
                rows={4}
                placeholder="Detail the core missions, tech stack, and responsibilities for this opening..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </FormField>
          </div>
        </div>

        {/* SECTION B: RESPONSIBILITIES & QUALIFICATIONS */}
        <div className="border border-[#E4E4E1] bg-white p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#E4E4E1] pb-3">
            <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-[#111111]">
              Section B: Candidate Expectations
            </h2>
          </div>

          <div className="space-y-4">
            <FormField label="Core Responsibilities (One per line)">
              <Textarea
                rows={4}
                value={responsibilitiesText}
                onChange={e => setResponsibilitiesText(e.target.value)}
              />
            </FormField>

            <FormField label="Required Qualifications (One per line)">
              <Textarea
                rows={4}
                value={qualificationsText}
                onChange={e => setQualificationsText(e.target.value)}
              />
            </FormField>
          </div>
        </div>

        {/* SECTION C: TECHNICAL COMPETENCIES */}
        <div className="border border-[#E4E4E1] bg-white p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#E4E4E1] pb-3">
            <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-[#111111]">
              Section C: Technical Skill Match Indexing
            </h2>
          </div>

          <div className="space-y-6">
            {/* Required skills */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-[#111111] block">
                Mandatory Required Skills ({requiredSkills.length})
              </span>
              <div className="flex flex-wrap gap-2 mb-3">
                {requiredSkills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#111111] text-[#111111] font-mono text-xs rounded-[2px]"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => setRequiredSkills(requiredSkills.filter(s => s !== skill))}
                      className="hover:text-red-600"
                    >
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 max-w-sm">
                <Input
                  placeholder="Add skill (e.g. Python, Docker)..."
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleAddSkill}>
                  Add
                </Button>
              </div>
            </div>

            {/* Preferred skills */}
            <div className="space-y-2 pt-4 border-t border-[#E4E4E1]">
              <span className="text-xs font-mono font-bold text-[#666666] block">
                Preferred / Nice-to-Have Skills ({preferredSkills.length})
              </span>
              <div className="flex flex-wrap gap-2 mb-3">
                {preferredSkills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAFAF9] border border-[#E4E4E1] text-[#666666] font-mono text-xs rounded-[2px]"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => setPreferredSkills(preferredSkills.filter(s => s !== skill))}
                      className="hover:text-red-600"
                    >
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 max-w-sm">
                <Input
                  placeholder="Add preferred skill..."
                  value={newPrefSkill}
                  onChange={e => setNewPrefSkill(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPrefSkill();
                    }
                  }}
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleAddPrefSkill}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION D: ELIGIBILITY & ACADEMIC FILTERS */}
        <div className="border border-[#E4E4E1] bg-white p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#E4E4E1] pb-3">
            <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-[#111111]">
              Section D: Institutional Eligibility Rules
            </h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Minimum Cumulative GPA" required>
                <Input
                  type="number"
                  step="0.1"
                  min="0.0"
                  max="10.0"
                  value={minCgpa}
                  onChange={e => setMinCgpa(parseFloat(e.target.value) || 0)}
                />
              </FormField>

              <FormField label="Maximum Allowed Active Backlogs" required>
                <Input
                  type="number"
                  min="0"
                  value={maxBacklogs}
                  onChange={e => setMaxBacklogs(parseInt(e.target.value) || 0)}
                />
              </FormField>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-[#858585] block">
                Eligible Engineering & Academic Departments:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                {availableBranches.map(branch => {
                  const checked = selectedBranches.includes(branch);
                  return (
                    <label
                      key={branch}
                      className={`flex items-center gap-2 p-3 border cursor-pointer transition-colors ${
                        checked ? 'border-[#111111] bg-[#FAFAF9]' : 'border-[#E4E4E1]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleBranch(branch)}
                        className="accent-black"
                      />
                      <span className={checked ? 'text-[#111111] font-medium' : 'text-[#666666]'}>
                        {branch}
                      </span>
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
          <Button variant="primary" size="md" type="submit" disabled={isPublishing}>
            {isPublishing ? (
              <span className="inline-flex items-center gap-1.5">
                <RefreshCw size={14} className="animate-spin" /> Publishing...
              </span>
            ) : (
              'Publish Campus Vacancy'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
