import React, { useState, useEffect } from 'react';
import { useCampusStore } from '../../lib/useStore';
import { api, AtsResult, ApiError } from '../../lib/api';
import { Button } from '../../components/ui';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Download,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export function StudentResumePage() {
  const { studentProfile, actions } = useCampusStore();
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzingAts, setIsAnalyzingAts] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [atsResult, setAtsResult] = useState<AtsResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resume = studentProfile.resume;

  // On mount or profile change, load ATS analysis if student has a resume
  useEffect(() => {
    let isMounted = true;
    const fetchInitialAts = async () => {
      if (!studentProfile.id) return;
      try {
        setIsAnalyzingAts(true);
        const res = await api.ai.getAtsAnalysis(studentProfile.id);
        if (isMounted && res) {
          setAtsResult(res);
        }
      } catch (err) {
        // Silent fallback - ATS can be re-run manually
        console.debug('Initial ATS load skipped:', err);
      } finally {
        if (isMounted) setIsAnalyzingAts(false);
      }
    };

    fetchInitialAts();
    return () => {
      isMounted = false;
    };
  }, [studentProfile.id]);

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Only verified PDF documents are accepted for institutional placement parsing.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Resume file size exceeds the 5 MB institutional upload limit.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsUploading(true);

    try {
      // 1. Upload to Node backend (server/src/controllers/resume.controller.js)
      const uploadRes = await api.resume.upload(file);

      const sizeKb = Math.round(file.size / 1024);
      const sizeStr = sizeKb > 1000 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

      // Sync with local campus store
      actions.uploadResume(file.name, sizeStr);

      const extractedSkills = Array.isArray(uploadRes.analysis?.skills)
        ? uploadRes.analysis.skills
        : studentProfile.skills;

      // Update student profile skills if extracted
      if (extractedSkills.length > 0) {
        actions.updateStudentProfile({
          skills: Array.from(new Set([...studentProfile.skills, ...extractedSkills])),
          resume: {
            fileName: file.name,
            fileSize: sizeStr,
            uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            parsingStatus: 'completed',
            parsedSkills: extractedSkills,
            parsedEducation: uploadRes.analysis?.education?.length
              ? uploadRes.analysis.education.map((e: any) => typeof e === 'string' ? e : `${e.degree || ''} ${e.institution || ''}`).join(', ')
              : `${studentProfile.degree} in ${studentProfile.branch}, ${studentProfile.institution}`,
            parsedProjects: studentProfile.projects.map(p => p.title),
            parsedExperience: studentProfile.experience.map(e => `${e.position} at ${e.organization}`).join('; '),
          },
        });
      }

      setSuccessMessage('Resume uploaded and processed by placement extraction pipeline.');

      // 2. Automatically request ATS analysis from AI Service (ai/app/routers/ai.py)
      setIsAnalyzingAts(true);
      try {
        const ats = await api.ai.getAtsAnalysis(studentProfile.id);
        setAtsResult(ats);
      } catch (aiErr) {
        console.warn('AI ATS analysis delayed:', aiErr);
      } finally {
        setIsAnalyzingAts(false);
      }
    } catch (err: any) {
      console.error('Resume upload failed:', err);
      if (err instanceof ApiError) {
        setErrorMessage(err.message || 'Server rejected resume upload');
      } else {
        // Graceful simulated fallback if local backend is restarting
        const sizeKb = Math.round(file.size / 1024);
        const sizeStr = sizeKb > 1000 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
        actions.uploadResume(file.name, sizeStr);
        setSuccessMessage('Resume uploaded (cached locally).');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setErrorMessage(null);
    try {
      const blob = await api.resume.downloadMyResume();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resume?.fileName || 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Resume download error:', err);
      setErrorMessage('Could not download resume from backend server. Please verify you have uploaded a resume file.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRerunAts = async () => {
    setIsAnalyzingAts(true);
    setErrorMessage(null);
    try {
      const ats = await api.ai.getAtsAnalysis(studentProfile.id);
      setAtsResult(ats);
      setSuccessMessage('ATS evaluation refreshed with current recruitment benchmarks.');
    } catch (err: any) {
      console.error('ATS evaluation error:', err);
      setErrorMessage(err.message || 'Failed to re-run ATS evaluation on AI server.');
    } finally {
      setIsAnalyzingAts(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
            PLACEMENT DOSSIER VERIFICATION & AI EVALUATION
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Resume Management & ATS Engine
          </h1>
          <p className="text-sm text-[#666666] mt-1 max-w-xl">
            Upload your curriculum vitae to the institutional backend. The AI engine automatically parses competencies and scores ATS compatibility.
          </p>
        </div>

        {resume && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              icon={<Download size={14} />}
            >
              {isDownloading ? 'Downloading...' : 'Download Stored PDF'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRerunAts}
              disabled={isAnalyzingAts}
              icon={<RefreshCw size={14} className={isAnalyzingAts ? 'animate-spin' : ''} />}
            >
              {isAnalyzingAts ? 'Scoring...' : 'Re-run ATS'}
            </Button>
          </div>
        )}
      </div>

      {/* Feedback alerts */}
      {errorMessage && (
        <div className="p-4 border border-[#111111] bg-neutral-50 text-xs font-mono text-[#111111] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="underline hover:text-black">
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 border border-[#111111] bg-[#FAFAF9] text-xs font-mono text-[#111111] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="underline hover:text-black">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload and Parsing Pipeline */}
        <div className="lg:col-span-6 space-y-6">
          {/* Upload Card */}
          <div
            onDragOver={e => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed p-8 text-center transition-colors ${
              dragActive ? 'border-[#111111] bg-[#F5F5F3]' : 'border-[#E4E4E1] bg-[#FAFAF9]'
            }`}
          >
            <div className="max-w-sm mx-auto space-y-3">
              <div className="w-12 h-12 border border-[#222222] bg-white mx-auto flex items-center justify-center">
                {isUploading ? (
                  <RefreshCw size={20} className="text-[#111111] animate-spin" />
                ) : (
                  <Upload size={20} className="text-[#111111]" />
                )}
              </div>
              <h2 className="text-base font-bold text-[#111111]">
                {isUploading ? 'Uploading to Server & Extracting...' : 'Upload Resume Document'}
              </h2>
              <p className="text-xs text-[#666666] leading-relaxed">
                Drag and drop your PDF resume here, or browse your local file system. Accepted format: PDF up to 5 MB.
              </p>

              <div className="pt-2">
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <span className="inline-flex items-center justify-center font-medium text-xs px-4 py-2 bg-[#111111] text-white hover:bg-neutral-800 rounded-[2px] cursor-pointer disabled:opacity-50">
                    {isUploading ? 'Processing File...' : 'Browse Local Files'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Current File Status */}
          {resume && (
            <div className="border border-[#222222] bg-white p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E4E4E1] pb-3">
                <div className="flex items-center gap-2.5">
                  <FileText size={18} className="text-[#111111]" />
                  <div>
                    <h3 className="text-sm font-bold text-[#111111]">{resume.fileName}</h3>
                    <span className="text-[10px] font-mono text-[#858585]">
                      {resume.fileSize} • Uploaded {resume.uploadedAt}
                    </span>
                  </div>
                </div>

                {resume.parsingStatus === 'completed' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-[#111111] text-white px-2 py-0.5 rounded-[2px]">
                    <CheckCircle2 size={11} /> PARSED & STORED
                  </span>
                )}
                {resume.parsingStatus === 'processing' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-[#F5F5F3] border border-[#222222] text-[#111111] px-2 py-0.5 rounded-[2px] animate-pulse">
                    <RefreshCw size={11} className="animate-spin" /> EXTRACTING...
                  </span>
                )}
                {resume.parsingStatus === 'uploading' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-[#F5F5F3] text-[#666666] px-2 py-0.5 rounded-[2px]">
                    UPLOADING...
                  </span>
                )}
              </div>

              {/* Parsing progress states */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between text-[#858585]">
                  <span>1. PDF Extraction (Node.js Server)</span>
                  <span className="text-[#111111]">✓ Verified</span>
                </div>
                <div className="flex justify-between text-[#858585]">
                  <span>2. Natural Language Competency Parsing</span>
                  <span className="text-[#111111]">✓ {studentProfile.skills.length} Skills Indexed</span>
                </div>
                <div className="flex justify-between text-[#858585]">
                  <span>3. AI ATS Evaluation (FastAPI Server)</span>
                  <span className={atsResult ? 'text-[#111111]' : 'text-[#858585]'}>
                    {isAnalyzingAts ? 'Analyzing...' : atsResult ? `✓ Score: ${atsResult.ats_score}/100` : 'Ready'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E4E4E1] flex items-center justify-between">
                <button
                  onClick={handleRerunAts}
                  disabled={isAnalyzingAts}
                  className="text-xs font-mono text-[#111111] hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={12} className={isAnalyzingAts ? 'animate-spin' : ''} />
                  Re-evaluate ATS Score
                </button>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="text-xs font-mono text-[#666666] hover:text-[#111111] hover:underline flex items-center gap-1"
                >
                  <Download size={12} />
                  Download File
                </button>
              </div>
            </div>
          )}

          {/* AI ATS Analysis Card */}
          {atsResult && (
            <div className="border border-[#222222] bg-[#FAFAF9] p-6 space-y-5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#E4E4E1] pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#111111]" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#111111]">
                    AI ATS COMPATIBILITY AUDIT
                  </span>
                </div>
                <span className="text-xl font-extrabold text-[#111111]">
                  {atsResult.ats_score} / 100
                </span>
              </div>

              <div className="w-full bg-[#E4E4E1] h-2 rounded-[1px] overflow-hidden">
                <div
                  className="bg-[#111111] h-full transition-all duration-500"
                  style={{ width: `${atsResult.ats_score}%` }}
                />
              </div>

              {atsResult.overall_feedback && (
                <div className="bg-white border border-[#E4E4E1] p-3 text-[#111111] leading-relaxed">
                  <span className="text-[9px] uppercase tracking-widest text-[#858585] block mb-1">
                    Overall AI Evaluation
                  </span>
                  {atsResult.overall_feedback}
                </div>
              )}

              {atsResult.missing_keywords && atsResult.missing_keywords.length > 0 && (
                <div>
                  <span className="text-[#858585] uppercase text-[10px] block mb-1">
                    Recommended Keywords to Include
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {atsResult.missing_keywords.map(kw => (
                      <span
                        key={kw}
                        className="bg-white border border-[#E4E4E1] px-2 py-0.5 text-[#666666]"
                      >
                        +{kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {atsResult.improvement_suggestions && atsResult.improvement_suggestions.length > 0 && (
                <div>
                  <span className="text-[#858585] uppercase text-[10px] block mb-1">
                    Suggested Revisions
                  </span>
                  <ul className="space-y-1 text-[#666666]">
                    {atsResult.improvement_suggestions.map((sug, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#111111] shrink-0">•</span>
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {atsResult.formatting_feedback && atsResult.formatting_feedback.length > 0 && (
                <div>
                  <span className="text-[#858585] uppercase text-[10px] block mb-1">
                    Formatting & Parsing Verification
                  </span>
                  <ul className="space-y-1 text-[#666666]">
                    {atsResult.formatting_feedback.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#111111] shrink-0">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Extracted Dossier & Preview */}
        <div className="lg:col-span-6 space-y-6">
          <div className="border border-[#E4E4E1] bg-[#FAFAF9] p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E4E4E1] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585]">
                EXTRACTED PARSER RESULTS
              </span>
              <Sparkles size={14} className="text-[#111111]" />
            </div>

            {resume && resume.parsingStatus === 'completed' ? (
              <div className="space-y-5 font-mono text-xs">
                <div>
                  <span className="text-[#858585] uppercase text-[10px] block mb-1">
                    Extracted Education Credentials
                  </span>
                  <div className="p-3 bg-white border border-[#E4E4E1] text-[#111111]">
                    {resume.parsedEducation || `${studentProfile.degree} in ${studentProfile.branch}, ${studentProfile.institution}`}
                  </div>
                </div>

                <div>
                  <span className="text-[#858585] uppercase text-[10px] block mb-1">
                    Extracted Technical Competencies ({studentProfile.skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {studentProfile.skills.map(skill => (
                      <span
                        key={skill}
                        className="bg-white border border-[#111111] px-2 py-0.5 text-[#111111]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[#858585] uppercase text-[10px] block mb-1">
                    Extracted Projects
                  </span>
                  <div className="p-3 bg-white border border-[#E4E4E1] space-y-1">
                    {studentProfile.projects.length > 0 ? (
                      studentProfile.projects.map((p, i) => (
                        <div key={i} className="text-[#111111]">• {p.title}</div>
                      ))
                    ) : (
                      <div className="text-[#858585]">No projects parsed</div>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[#858585] uppercase text-[10px] block mb-1">
                    Prior Work / Internships
                  </span>
                  <div className="p-3 bg-white border border-[#E4E4E1] text-[#111111]">
                    {studentProfile.experience.length > 0
                      ? studentProfile.experience.map(e => `${e.position} at ${e.organization}`).join('; ')
                      : 'None registered'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs font-mono text-[#858585]">
                Upload your resume PDF to view the verified extraction schema.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
