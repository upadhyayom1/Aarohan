import fs from 'fs';
import path from 'path';
import prisma from '../config/db.js';
import { extractTextFromPdf, analyzeResumeText } from '../services/resume.service.js';

export const uploadResume = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'No file uploaded',
        details: { file: 'PDF resume file is required' },
      });
    }

    // Extract text from uploaded PDF
    const text = await extractTextFromPdf(file.path);

    // Analyze extracted text
    const analysis = await analyzeResumeText(text);

    const resumeUrl = '/students/resume/file';

    // Update or create student profile with resume details
    await prisma.studentProfile.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        name: req.user.name,
        branch: 'OTHER',
        cgpa: 0,
        graduationYear: new Date().getFullYear(),
        skills: analysis.skills || [],
        resumeUploaded: true,
        resumeUrl,
        resumePath: file.path,
        resumeText: text,
        resumeAnalysis: analysis,
        profileComplete: false,
      },
      update: {
        resumeUploaded: true,
        resumeUrl,
        resumePath: file.path,
        resumeText: text,
        resumeAnalysis: analysis,
      },
    });

    return res.status(200).json({
      message: 'Resume uploaded and analyzed successfully',
      resume_url: resumeUrl,
      analysis,
    });
  } catch (error) {
    console.error('UploadResume error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to upload and analyze resume',
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

