import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import prisma from '../config/db.js';
import { extractTextFromPdf, analyzeResumeText } from '../services/resume.service.js';
import { formatStudentProfile } from './student.controller.js';

export const uploadResume = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'No file uploaded',
      details: { file: 'PDF resume file is required' },
    });
  }

  try {
    // 1. Validate file size and existence
    if (!fs.existsSync(file.path) || file.size === 0) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({
        code: 'RESUME_UNREADABLE',
        message: 'Resume file is empty',
        details: {},
      });
    }

    // 2. Extract text from uploaded PDF with strict magic-byte validation
    let text;
    try {
      text = await extractTextFromPdf(file.path);
    } catch (parseErr) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({
        code: parseErr.code || 'INVALID_FILE_TYPE',
        message: parseErr.message || 'File is not a valid PDF or is unreadable',
        details: {},
      });
    }

    // Compute SHA-256 digest of the PDF file
    const fileBuffer = fs.readFileSync(file.path);
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // 3. Analyze extracted text
    const analysis = await analyzeResumeText(text);
    const enrichedAnalysis = {
      ...analysis,
      status: 'COMPLETED',
      sha256: fileHash,
      uploadedAt: new Date().toISOString(),
    };

    const resumeUrl = '/students/resume/file';

    // Fetch existing student profile if any
    const existingProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    // Clean up older resume file from disk if re-uploading
    if (existingProfile?.resumePath && existingProfile.resumePath !== file.path) {
      try {
        if (fs.existsSync(existingProfile.resumePath)) {
          fs.unlinkSync(existingProfile.resumePath);
        }
      } catch (cleanupErr) {
        console.warn('Failed to clean up old resume file:', cleanupErr.message);
      }
    }

    // Process Extracted Skills
    const parsedSkills = Array.isArray(analysis?.skills)
      ? analysis.skills.map((s) => String(s).trim()).filter(Boolean)
      : [];
    const mergedSkills = Array.from(
      new Set([...(parsedSkills.length > 0 ? parsedSkills : existingProfile?.skills || [])])
    );

    // Process Extracted Projects
    const parsedProjects = Array.isArray(analysis?.projects) ? analysis.projects : [];
    const formattedProjects = parsedProjects.map((p, idx) => ({
      id: p.id || `proj_${Date.now()}_${idx}`,
      title: typeof p === 'string' ? p : p.title || `Project ${idx + 1}`,
      description: typeof p === 'string' ? 'Extracted from resume' : p.description || 'Extracted from resume',
      techStack: Array.isArray(p?.tech_stack)
        ? p.tech_stack
        : Array.isArray(p?.techStack)
        ? p.techStack
        : [],
      githubUrl: p.githubUrl || '',
      projectUrl: p.projectUrl || '',
    }));

    const finalProjects = formattedProjects.length > 0 ? formattedProjects : (existingProfile?.projects || []);

    // Process Extracted Education (Branch, CGPA, Graduation Year)
    const firstEdu =
      Array.isArray(analysis?.education) && analysis.education.length > 0
        ? analysis.education[0]
        : null;

    let branch = existingProfile?.branch || 'OTHER';
    if (firstEdu?.branch) {
      const bLower = String(firstEdu.branch).toLowerCase();
      if (bLower.includes('computer') || bLower.includes('cse') || bLower.includes('cs')) branch = 'CSE';
      else if (bLower.includes('information') || bLower.includes('it')) branch = 'IT';
      else if (bLower.includes('electronics') || bLower.includes('ece') || bLower.includes('communication')) branch = 'ECE';
      else if (bLower.includes('electrical') || bLower.includes('ee')) branch = 'EE';
      else if (bLower.includes('mechanical') || bLower.includes('me')) branch = 'ME';
      else if (bLower.includes('civil') || bLower.includes('ce')) branch = 'CE';
      else if (bLower.includes('chemical') || bLower.includes('ch')) branch = 'CH';
      else if (bLower.includes('mca')) branch = 'MCA';
      else if (bLower.includes('mba')) branch = 'MBA';
      else if (bLower.includes('phd')) branch = 'PHD_CS';
    }

    let cgpa = existingProfile?.cgpa && existingProfile.cgpa > 0 ? existingProfile.cgpa : 0;
    if (firstEdu?.cgpa) {
      const parsedCgpa = typeof firstEdu.cgpa === 'number' ? firstEdu.cgpa : parseFloat(firstEdu.cgpa);
      if (!isNaN(parsedCgpa) && parsedCgpa > 0 && parsedCgpa <= 10) {
        cgpa = parsedCgpa;
      }
    }

    let graduationYear =
      existingProfile?.graduationYear && existingProfile.graduationYear > 2000
        ? existingProfile.graduationYear
        : new Date().getFullYear();
    if (firstEdu?.graduation_year) {
      const parsedYear =
        typeof firstEdu.graduation_year === 'number'
          ? firstEdu.graduation_year
          : parseInt(firstEdu.graduation_year, 10);
      if (!isNaN(parsedYear) && parsedYear >= 2000 && parsedYear <= 2035) {
        graduationYear = parsedYear;
      }
    }

    const isComplete = Boolean(
      (req.user.name || existingProfile?.name) &&
      branch !== 'OTHER' &&
      cgpa > 0 &&
      graduationYear &&
      mergedSkills.length > 0
    );

    // Update or create student profile with full parsed details
    const updatedProfile = await prisma.studentProfile.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        name: req.user.name,
        branch,
        cgpa,
        graduationYear,
        skills: mergedSkills,
        projects: finalProjects,
        resumeUploaded: true,
        resumeUrl,
        resumePath: file.path,
        resumeText: text,
        resumeAnalysis: enrichedAnalysis,
        profileComplete: isComplete,
      },
      update: {
        branch: branch !== 'OTHER' ? branch : (existingProfile?.branch || 'OTHER'),
        cgpa: cgpa > 0 ? cgpa : (existingProfile?.cgpa || 0),
        graduationYear: graduationYear > 2000 ? graduationYear : (existingProfile?.graduationYear || new Date().getFullYear()),
        skills: mergedSkills,
        projects: finalProjects,
        resumeUploaded: true,
        resumeUrl,
        resumePath: file.path,
        resumeText: text,
        resumeAnalysis: enrichedAnalysis,
        profileComplete: isComplete,
      },
      include: { user: true },
    });

    return res.status(200).json({
      message: 'Resume uploaded and analyzed successfully',
      resume_url: resumeUrl,
      resume_status: 'COMPLETED',
      analysis: enrichedAnalysis,
      profile: formatStudentProfile(updatedProfile, req.user.email),
    });
  } catch (error) {
    if (file?.path && fs.existsSync(file.path)) {
      try { fs.unlinkSync(file.path); } catch (_) {}
    }
    console.error('UploadResume error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to upload and analyze resume',
      details: {},
    });
  }
};

export const getResumeStatus = async (req, res) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile || !profile.resumeUploaded) {
      return res.status(200).json({
        status: 'NOT_UPLOADED',
        resume_uploaded: false,
        has_file: false,
      });
    }

    const analysis = profile.resumeAnalysis;
    const status = analysis?.status || 'COMPLETED';

    return res.status(200).json({
      status,
      resume_uploaded: profile.resumeUploaded,
      has_file: Boolean(profile.resumePath && fs.existsSync(profile.resumePath)),
      uploaded_at: analysis?.uploadedAt || profile.updatedAt,
      version: analysis?.sha256 || null,
    });
  } catch (error) {
    console.error('GetResumeStatus error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to retrieve resume status',
      details: {},
    });
  }
};

export const getMyResumeFile = async (req, res) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile || !profile.resumeUploaded || !profile.resumePath || !fs.existsSync(profile.resumePath)) {
      return res.status(404).json({
        code: 'RESUME_NOT_FOUND',
        message: 'No resume uploaded yet',
        details: {},
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    return res.sendFile(path.resolve(profile.resumePath));
  } catch (error) {
    console.error('GetMyResumeFile error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to retrieve resume file',
      details: {},
    });
  }
};

export const getStudentResumeFile = async (req, res) => {
  try {
    const { student_id } = req.params;

    const profile = await prisma.studentProfile.findUnique({
      where: { id: student_id },
    });

    if (!profile || !profile.resumeUploaded || !profile.resumePath || !fs.existsSync(profile.resumePath)) {
      return res.status(404).json({
        code: 'RESUME_NOT_FOUND',
        message: 'No resume uploaded yet',
        details: {},
      });
    }

    if (req.user.role === 'recruiter') {
      const hasApplication = await prisma.application.findFirst({
        where: {
          studentId: profile.id,
          job: { recruiterId: req.user.id },
        },
      });
      if (!hasApplication) {
        return res.status(403).json({
          code: 'FORBIDDEN',
          message: 'You can only download resumes of students who applied to your job postings',
          details: {},
        });
      }
    } else if (req.user.role === 'student' && profile.userId !== req.user.id) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You can only download your own resume',
        details: {},
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    return res.sendFile(path.resolve(profile.resumePath));
  } catch (error) {
    console.error('GetStudentResumeFile error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to retrieve student resume file',
      details: {},
    });
  }
};

