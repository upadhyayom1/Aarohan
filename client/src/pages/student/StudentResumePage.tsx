import React, { useState } from 'react';
import { useCampusStore } from '../../lib/useStore';
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
} from 'lucide-react';

export function StudentResumePage() {
  const { studentProfile, actions } = useCampusStore();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const resume = studentProfile.resume;

  const handleSimulatedUpload = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Only verified PDF documents are accepted for institutional placement parsing.');
      return;
    }
    const sizeKb = Math.round(file.size / 1024);
    const sizeStr = sizeKb > 1000 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
    actions.uploadResume(file.name, sizeStr);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSimulatedUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSimulatedUpload(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
          PLACEMENT DOSSIER VERIFICATION
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
          Resume Management & Parsing
        </h1>
        <p className="text-sm text-[#666666] mt-1 max-w-xl">
          Upload your latest curriculum vitae for automatic competency extraction and recruiter verification.
        </p>
      </div>

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
                <Upload size={20} className="text-[#111111]" />
              </div>
              <h2 className="text-base font-bold text-[#111111]">
                Upload Resume Document
              </h2>
              <p className="text-xs text-[#666666] leading-relaxed">
                Drag and drop your PDF resume here, or browse your local file system. Accepted format: PDF up to 5 MB.
              </p>

              <div className="pt-2">
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span className="inline-flex items-center justify-center font-medium text-xs px-4 py-2 bg-[#111111] text-white hover:bg-neutral-800 rounded-[2px] cursor-pointer">
                    Browse Files
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
                    <CheckCircle2 size={11} /> PARSED
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
                  <span>1. Document Structure Verification</span>
                  <span>{resume.parsingStatus !== 'uploading' ? '✓ Passed' : 'In Progress'}</span>
                </div>
                <div className="flex justify-between text-[#858585]">
                  <span>2. Natural Language Entity Extraction</span>
                  <span>{resume.parsingStatus === 'completed' ? '✓ Extracted' : resume.parsingStatus === 'processing' ? 'Running' : 'Queued'}</span>
                </div>
                <div className="flex justify-between text-[#858585]">
                  <span>3. Skill & Project Indexing</span>
                  <span>{resume.parsingStatus === 'completed' ? '✓ Indexed' : 'Pending'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E4E4E1] flex items-center justify-between">
                <button
                  onClick={() => actions.uploadResume(resume.fileName, resume.fileSize)}
                  className="text-xs font-mono text-[#111111] hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Re-analyze Document
                </button>
              </div>
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
                    {resume.parsedEducation || 'B.Tech Computer Science & Engineering'}
                  </div>
                </div>

                <div>
                  <span className="text-[#858585] uppercase text-[10px] block mb-1">
                    Extracted Technical Competencies ({resume.parsedSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {resume.parsedSkills.map(skill => (
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
                    {resume.parsedProjects.map((p, i) => (
                      <div key={i} className="text-[#111111]">• {p}</div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[#858585] uppercase text-[10px] block mb-1">
                    Prior Work / Internships
                  </span>
                  <div className="p-3 bg-white border border-[#E4E4E1] text-[#111111]">
                    {resume.parsedExperience || 'Software Engineering Intern at Veritas Technologies'}
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
