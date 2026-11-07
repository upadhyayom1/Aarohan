import React, { useState, useRef, useEffect } from "react";
import { useCampusStore } from "../../lib/useStore";
import { api, BuildResumeResult } from "../../lib/api";
import { Button, Input, Textarea, FormField } from "../../components/ui";
import {
  CheckCircle2,
  Plus,
  Save,
  Undo,
  Camera,
  User as UserIcon,
  Sparkles,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";

export function StudentProfilePage() {
  const { studentProfile, actions } = useCampusStore();

  // Form state
  const [formData, setFormData] = useState(studentProfile);
  const [newSkill, setNewSkill] = useState("");

  // Sync form state when store/backend profile is updated
  useEffect(() => {
    setFormData(studentProfile);
  }, [studentProfile]);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // AI Resume state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiResumeResult, setAiResumeResult] =
    useState<BuildResumeResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(studentProfile);

  // --------------------------------------------------
  // PHOTO UPLOAD
  // --------------------------------------------------

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Only PNG, JPG, and WebP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setFormData((prev) => ({
          ...prev,
          avatar: reader.result as string,
        }));
      }
    };

    reader.onerror = () => {
      alert("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({
      ...prev,
      avatar: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // --------------------------------------------------
  // SAVE PROFILE
  // --------------------------------------------------

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSaving || !isDirty) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      await api.students.updateMyProfile({
        name: formData.fullName,
        branch: formData.branch,
        cgpa: formData.cgpa,
        graduation_year: formData.graduationYear,
        backlogs: formData.activeBacklogs,
        skills: formData.skills,
        projects: formData.projects,
      });

      // Update global Zustand store only after API success
      actions.updateStudentProfile(formData);

      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to synchronize profile with the server.";

      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  // --------------------------------------------------
  // AI RESUME GENERATION
  // --------------------------------------------------

  const handleGenerateAiResume = async () => {
    setAiGenerating(true);
    setAiError(null);
    setAiResumeResult(null);
    setShowAiModal(true);

    try {
      const result = await api.ai.buildResume(studentProfile.id);

      setAiResumeResult(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "AI service temporarily unavailable.";

      setAiError(message);
    } finally {
      setAiGenerating(false);
    }
  };

  // --------------------------------------------------
  // RESET FORM
  // --------------------------------------------------

  const handleReset = () => {
    setFormData(studentProfile);
    setErrorMessage(null);
    setSaveSuccess(false);
    setNewSkill("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // --------------------------------------------------
  // SKILLS MANAGEMENT
  // --------------------------------------------------

  const addSkill = () => {
    const skill = newSkill.trim();

    if (!skill) return;

    const alreadyExists = formData.skills.some(
      (existingSkill) => existingSkill.toLowerCase() === skill.toLowerCase(),
    );

    if (alreadyExists) {
      setNewSkill("");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
    }));

    setNewSkill("");
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* HEADER */}

      <div className="border-b border-[#E4E4E1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
            ACADEMIC & PROFESSIONAL DOSSIER
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Student Profile
          </h1>

          <p className="text-sm text-[#666666] mt-1 max-w-xl">
            Maintain your official university records, technical competencies,
            and verified academic information for recruitment drives.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleGenerateAiResume}
            disabled={aiGenerating}
            icon={<Sparkles size={14} className="text-[#111111]" />}
          >
            {aiGenerating ? "AI Generating..." : "AI Dossier Builder"}
          </Button>

          {isDirty && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleReset}
              icon={<Undo size={14} />}
            >
              Discard Changes
            </Button>
          )}

          <Button
            type="submit"
            form="student-profile-form"
            variant="primary"
            size="sm"
            disabled={!isDirty || isSaving}
            icon={<Save size={14} />}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}

      {saveSuccess && (
        <div className="p-3 border border-[#111111] bg-[#FAFAF9] text-xs font-mono flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#111111]" />
          <span>Profile dossier saved and synchronized successfully.</span>
        </div>
      )}

      {/* ERROR MESSAGE */}

      {errorMessage && (
        <div className="p-3 border border-red-200 bg-red-50 text-red-700 text-xs font-mono flex items-center gap-2">
          <AlertCircle size={16} className="text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* PROFILE FORM */}

      <form
        id="student-profile-form"
        onSubmit={handleSave}
        className="space-y-12"
      >
        {/* SECTION 1: PERSONAL INFORMATION */}

        <div className="border border-[#E4E4E1] bg-white p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#E4E4E1] pb-3">
            <h2 className="text-base font-bold uppercase font-mono tracking-wider text-[#111111]">
              01. Personal & Contact Information
            </h2>

            <p className="text-xs text-[#858585] mt-0.5">
              Contact channels verified for recruiter interview coordination.
            </p>
          </div>

          {/* PROFILE PHOTO */}

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
                Appears on your university dossier and sidebar avatar.
                Recommended: Square image, PNG, JPG, or WebP up to 5MB.
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

          {/* PERSONAL DETAILS */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label="Full Name" required>
              <Input
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fullName: e.target.value,
                  })
                }
              />
            </FormField>

            <FormField label="Institutional Email" required>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
              />
            </FormField>

            <FormField label="Telephone Number" required>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value,
                  })
                }
              />
            </FormField>

            <FormField label="Portfolio URL" hint="Optional">
              <Input
                value={formData.portfolioUrl || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    portfolioUrl: e.target.value,
                  })
                }
                placeholder="https://..."
              />
            </FormField>

            <FormField label="GitHub Repository" hint="Optional">
              <Input
                value={formData.githubUrl || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    githubUrl: e.target.value,
                  })
                }
                placeholder="https://github.com/..."
              />
            </FormField>

            <FormField label="LinkedIn Profile" hint="Optional">
              <Input
                value={formData.linkedinUrl || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    linkedinUrl: e.target.value,
                  })
                }
                placeholder="https://linkedin.com/in/..."
              />
            </FormField>

            <div className="md:col-span-3">
              <FormField
                label="Candidate Professional Summary"
                hint="Max 250 characters"
              >
                <Textarea
                  rows={3}
                  value={formData.bio || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bio: e.target.value.slice(0, 250),
                    })
                  }
                />
                <p className="text-[10px] text-[#858585] text-right mt-1">
                  {(formData.bio || "").length}/250
                </p>
              </FormField>
            </div>
          </div>
        </div>

        {/* SECTION 2: ACADEMIC INFORMATION */}

        <div className="border border-[#E4E4E1] bg-white p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#E4E4E1] pb-3">
            <h2 className="text-base font-bold uppercase font-mono tracking-wider text-[#111111]">
              02. Academic Information & Placement Eligibility
            </h2>

            <p className="text-xs text-[#858585] mt-0.5">
              Verified by Department Registrar. Determines automatic placement
              drive eligibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label="Institution">
              <Input
                value={formData.institution}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    institution: e.target.value,
                  })
                }
              />
            </FormField>

            <FormField label="Degree Program">
              <Input
                value={formData.degree}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    degree: e.target.value,
                  })
                }
              />
            </FormField>

            <FormField label="Branch / Discipline" required>
              <Input
                value={formData.branch}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    branch: e.target.value,
                  })
                }
              />
            </FormField>

            <FormField
              label="Current Cumulative CGPA"
              required
              hint="Scale of 10.00"
            >
              <Input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cgpa: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </FormField>

            <FormField label="Graduation Cohort Year" required>
              <Input
                type="number"
                value={formData.graduationYear}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    graduationYear: parseInt(e.target.value) || 2026,
                  })
                }
              />
            </FormField>

            <FormField
              label="Active Academic Backlogs"
              required
              hint="0 for clear record"
            >
              <Input
                type="number"
                min="0"
                value={formData.activeBacklogs}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    activeBacklogs: Math.max(0, parseInt(e.target.value) || 0),
                  })
                }
              />
            </FormField>
          </div>
        </div>

        {/* SECTION 3: TECHNICAL SKILLS */}

        <div className="border border-[#E4E4E1] bg-white p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#E4E4E1] pb-3">
            <h2 className="text-base font-bold uppercase font-mono tracking-wider text-[#111111]">
              03. Verified Technical Competencies
            </h2>

            <p className="text-xs text-[#858585] mt-0.5">
              Used by the AI Matching Engine to calculate role suitability
              scores.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2 max-w-md">
              <Input
                placeholder="Add a technology or competency..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />

              <Button
                type="button"
                variant="secondary"
                onClick={addSkill}
                icon={<Plus size={14} />}
              >
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.skills.map((skill) => (
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

              {formData.skills.length === 0 && (
                <p className="text-xs text-[#858585]">
                  No technical skills added yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4: PROJECTS */}

        <div className="border border-[#E4E4E1] bg-white p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#E4E4E1] pb-3">
            <h2 className="text-base font-bold uppercase font-mono tracking-wider text-[#111111]">
              04. Significant Technical Projects
            </h2>

            <p className="text-xs text-[#858585] mt-0.5">
              Highlighted in candidate review dossiers transmitted to
              recruiters.
            </p>
          </div>

          <div className="space-y-4">
            {formData.projects.map((proj) => (
              <div
                key={proj.id}
                className="p-4 border border-[#E4E4E1] bg-[#FAFAF9] space-y-2"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-bold text-sm text-[#111111]">
                    {proj.title}
                  </h3>

                  <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                    {proj.techStack.map((t) => (
                      <span
                        key={t}
                        className="bg-white border border-[#E4E4E1] px-1.5 py-0.5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-[#666666] leading-relaxed">
                  {proj.description}
                </p>
              </div>
            ))}

            {formData.projects.length === 0 && (
              <p className="text-xs text-[#858585]">No projects added yet.</p>
            )}
          </div>
        </div>

        {/* BOTTOM SAVE BAR */}

        <div className="border-t border-[#E4E4E1] pt-6 flex justify-end gap-3">
          {isDirty && (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleReset}
            >
              Discard Changes
            </Button>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!isDirty || isSaving}
          >
            {isSaving ? "Saving..." : "Save Profile Dossier"}
          </Button>
        </div>
      </form>

      {/* AI RESUME MODAL */}

      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-md shadow-xl">
            {/* MODAL HEADER */}

            <div className="sticky top-0 bg-white border-b border-[#E4E4E1] p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles size={18} />

                  <h2 className="font-bold text-lg text-[#111111]">
                    AI Dossier Builder
                  </h2>
                </div>

                <p className="text-xs text-[#858585] mt-1">
                  AI-powered resume generation
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="p-2 hover:bg-[#F5F5F4] rounded"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="p-6">
              {aiGenerating && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 size={32} className="animate-spin text-[#111111]" />

                  <p className="text-sm font-medium">
                    Generating your professional dossier...
                  </p>

                  <p className="text-xs text-[#858585]">
                    Please wait while the AI processes your profile.
                  </p>
                </div>
              )}

              {aiError && (
                <div className="p-4 border border-red-200 bg-red-50 text-red-700 text-sm flex gap-3">
                  <AlertCircle size={18} className="shrink-0" />

                  <div>
                    <p className="font-semibold">Resume generation failed</p>

                    <p className="text-xs mt-1">{aiError}</p>
                  </div>
                </div>
              )}

              {aiResumeResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <CheckCircle2 size={18} />
                    Resume generated successfully
                  </div>

                  <pre className="whitespace-pre-wrap break-words text-xs bg-[#FAFAF9] border border-[#E4E4E1] p-4 rounded overflow-x-auto">
                    {JSON.stringify(aiResumeResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}

            <div className="border-t border-[#E4E4E1] p-4 flex justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAiModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
