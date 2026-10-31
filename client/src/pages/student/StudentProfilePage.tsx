import React, { useState, useRef } from 'react';
import { useCampusStore } from '../../lib/useStore';
import { Button, Input, Textarea, FormField } from '../../components/ui';
import { CheckCircle2, Plus, Trash2, Save, Undo, Camera, Upload, User as UserIcon } from 'lucide-react';

export function StudentProfilePage() {
  const { studentProfile, actions } = useCampusStore();
  const [formData, setFormData] = useState(studentProfile);
  const [newSkill, setNewSkill] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(studentProfile);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, avatar: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    actions.updateStudentProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    setFormData(studentProfile);
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skillToRemove),
    });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
            ACADEMIC & PROFESSIONAL DOSSIER
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Student Profile
          </h1>
          <p className="text-sm text-[#666666] mt-1 max-w-xl">
            Maintain your official university records, technical competencies, and verified academic information for recruitment drives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isDirty && (
            <Button variant="secondary" size="sm" onClick={handleReset} icon={<Undo size={14} />}>
              Discard Changes
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!isDirty}
            icon={<Save size={14} />}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 border border-[#111111] bg-[#FAFAF9] text-xs font-mono flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#111111]" />
          <span>Profile dossier saved and synced with university placement registry.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-12">
        {/* Section 1: Personal Information */}
        <div className="border border-[#E4E4E1] bg-white p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#E4E4E1] pb-3">
            <h2 className="text-base font-bold uppercase font-mono tracking-wider text-[#111111]">
              01. Personal & Contact Information
            </h2>
            <p className="text-xs text-[#858585] mt-0.5">
              Contact channels verified for recruiter interview coordination.
            </p>
          </div>

          {/* Profile Photo Upload */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 border border-[#E4E4E1] bg-[#FAFAF9] rounded-[3px]">
            <div className="relative w-20 h-20 rounded-full border border-[#D1D1CE] overflow-hidden bg-white shrink-0 flex items-center justify-center">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt={formData.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon size={32} className="text-[#858585]" />
              )}
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                Candidate Profile Photo
              </div>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                Appears on your university dossier and sidebar avatar. Recommended: Square image, PNG, JPG, or WebP up to 5MB.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  icon={<Camera size={13} />}
                >
                  Upload New Photo
                </Button>
                {formData.avatar && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePhoto}
                    className="text-[#858585] hover:text-[#111111]"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label="Full Name" required>
              <Input
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              />
            </FormField>

            <FormField label="Institutional Email" required>
              <Input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </FormField>

            <FormField label="Telephone Number" required>
              <Input
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </FormField>

            <FormField label="Portfolio URL" hint="Optional">
              <Input
                value={formData.portfolioUrl || ''}
                onChange={e => setFormData({ ...formData, portfolioUrl: e.target.value })}
                placeholder="https://..."
              />
            </FormField>

            <FormField label="GitHub Repository" hint="Optional">
              <Input
                value={formData.githubUrl || ''}
                onChange={e => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/..."
              />
            </FormField>

            <FormField label="LinkedIn Profile" hint="Optional">
              <Input
                value={formData.linkedinUrl || ''}
                onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </FormField>

            <div className="md:col-span-3">
              <FormField label="Candidate Professional Summary" hint="Max 250 characters">
                <Textarea
                  rows={3}
                  value={formData.bio || ''}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Section 2: Academic Information */}
        <div className="border border-[#E4E4E1] bg-white p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#E4E4E1] pb-3">
            <h2 className="text-base font-bold uppercase font-mono tracking-wider text-[#111111]">
              02. Academic Information & Placement Eligibility
            </h2>
            <p className="text-xs text-[#858585] mt-0.5">
              Verified by Department Registrar. Determines automatic placement drive eligibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label="Institution">
              <Input
                value={formData.institution}
                onChange={e => setFormData({ ...formData, institution: e.target.value })}
              />
            </FormField>

            <FormField label="Degree Program">
              <Input
                value={formData.degree}
                onChange={e => setFormData({ ...formData, degree: e.target.value })}
              />
            </FormField>

            <FormField label="Branch / Discipline" required>
              <Input
                value={formData.branch}
                onChange={e => setFormData({ ...formData, branch: e.target.value })}
              />
            </FormField>

            <FormField label="Current Cumulative CGPA" required hint="Scale of 10.00">
              <Input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={e => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
              />
            </FormField>

            <FormField label="Graduation Cohort Year" required>
              <Input
                type="number"
                value={formData.graduationYear}
                onChange={e => setFormData({ ...formData, graduationYear: parseInt(e.target.value) || 2026 })}
              />
            </FormField>

            <FormField label="Active Academic Backlogs" required hint="0 for clear record">
              <Input
                type="number"
                min="0"
                value={formData.activeBacklogs}
                onChange={e => setFormData({ ...formData, activeBacklogs: parseInt(e.target.value) || 0 })}
              />
            </FormField>
          </div>
        </div>

        {/* Section 3: Technical Skills */}
        <div className="border border-[#E4E4E1] bg-white p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#E4E4E1] pb-3">
            <h2 className="text-base font-bold uppercase font-mono tracking-wider text-[#111111]">
              03. Verified Technical Competencies
            </h2>
            <p className="text-xs text-[#858585] mt-0.5">
              Used by the AI Matching Engine to calculate role suitability scores.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2 max-w-md">
              <Input
                placeholder="Add a technology or competency (e.g., Kubernetes, PyTorch)..."
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={addSkill} icon={<Plus size={14} />}>
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.skills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAFAF9] border border-[#222222] text-[#111111] font-mono text-xs rounded-[2px]"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-[#858585] hover:text-black ml-1 cursor-pointer"
                    aria-label={`Remove ${skill}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Projects */}
        <div className="border border-[#E4E4E1] bg-white p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#E4E4E1] pb-3">
            <h2 className="text-base font-bold uppercase font-mono tracking-wider text-[#111111]">
              04. Significant Technical Projects
            </h2>
            <p className="text-xs text-[#858585] mt-0.5">
              Highlighted in candidate review dossiers transmitted to recruiters.
            </p>
          </div>

          <div className="space-y-4">
            {formData.projects.map((proj, idx) => (
              <div key={proj.id} className="p-4 border border-[#E4E4E1] bg-[#FAFAF9] space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-sm text-[#111111]">{proj.title}</h3>
                  <div className="flex gap-1 font-mono text-[10px]">
                    {proj.techStack.map(t => (
                      <span key={t} className="bg-white border border-[#E4E4E1] px-1.5 py-0.5">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom save bar */}
        <div className="border-t border-[#E4E4E1] pt-6 flex justify-end gap-3">
          {isDirty && (
            <Button variant="secondary" size="md" onClick={handleReset}>
              Discard Changes
            </Button>
          )}
          <Button variant="primary" size="md" disabled={!isDirty} type="submit">
            Save Profile Dossier
          </Button>
        </div>
      </form>
    </div>
  );
}
