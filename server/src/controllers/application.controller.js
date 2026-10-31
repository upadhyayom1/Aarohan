import prisma from '../config/db.js';

export const applyForJob = async (req, res) => {
  try {
    const { job_id } = req.body;

    // 1. Get student profile for current user
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!student) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Please complete your student profile before applying for jobs',
        details: {},
      });
    }

    // 2. Get Job details
    const job = await prisma.job.findUnique({
      where: { id: job_id },
    });

    if (!job) {
      return res.status(404).json({
        code: 'JOB_NOT_FOUND',
        message: 'Job not found',
        details: {},
      });
    }

    // 3. Check if job is closed or deadline passed
    if (job.status === 'closed' || new Date(job.deadline) < new Date()) {
      return res.status(400).json({
        code: 'JOB_CLOSED',
        message: 'Job is closed or application deadline has passed',
        details: {},
      });
    }

    // 4. Check for duplicate application
    const existingApp = await prisma.application.findUnique({
      where: {
        jobId_studentId: {
          jobId: job.id,
          studentId: student.id,
        },
      },
    });

    if (existingApp) {
      return res.status(400).json({
        code: 'ALREADY_APPLIED',
        message: 'You have already applied for this job',
        details: {},
      });
    }

    // 5. Check Eligibility
    const eligibilityReasons = [];

    if (student.cgpa < job.minCgpa) {
      eligibilityReasons.push(
        `Your CGPA (${student.cgpa}) is below the required minimum (${job.minCgpa})`
      );
    }

    if (!job.eligibleBranches.includes(student.branch)) {
      eligibilityReasons.push(
        `Your branch (${student.branch}) is not eligible for this role`
      );
    }

    if (student.backlogs > job.maxBacklogs) {
      eligibilityReasons.push(
        `Your backlogs count (${student.backlogs}) exceeds the maximum allowed (${job.maxBacklogs})`
      );
    }

    if (student.graduationYear !== job.graduationYear) {
      eligibilityReasons.push(
        `Your graduation year (${student.graduationYear}) does not match the required year (${job.graduationYear})`
      );
    }

    if (eligibilityReasons.length > 0) {
      return res.status(422).json({
        code: 'NOT_ELIGIBLE',
        message: 'You do not meet the eligibility criteria for this job.',
        eligibility_reasons: eligibilityReasons,
      });
    }

    // 6. Calculate Match Result
    const studentSkills = (student.skills || []).map((s) => s.toLowerCase().trim());
    const matchedSkills = (job.requiredSkills || []).filter((reqSkill) =>
      studentSkills.includes(reqSkill.toLowerCase().trim())
    );
    const missingSkills = (job.requiredSkills || []).filter(
      (reqSkill) => !matchedSkills.includes(reqSkill)
    );

    const matchScore =
      job.requiredSkills.length > 0
        ? Math.round((matchedSkills.length / job.requiredSkills.length) * 100)
        : 100;

    const matchResult = {
      match_score: matchScore,
      matched_skills: matchedSkills,
      missing_skills: missingSkills,
      explanation:
        missingSkills.length === 0
          ? 'Strong match for all required skills.'
          : `Matched ${matchedSkills.length} of ${job.requiredSkills.length} required skills. Missing: ${missingSkills.join(', ')}.`,
      eligible: true,
      eligibility_reasons: [],
    };

    // 7. Create Application
    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        studentId: student.id,
        status: 'applied',
        eligible: true,
        eligibilityReasons: [],
        matchResult,
      },
    });

    return res.status(201).json({
      id: application.id,
      job_id: application.jobId,
      student_id: application.studentId,
      status: application.status,
      eligible: application.eligible,
      eligibility_reasons: application.eligibilityReasons,
      match_result: application.matchResult,
      applied_at: application.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('ApplyForJob error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to submit application',
      details: {},
    });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!student) {
      return res.status(200).json({ applications: [] });
    }

    const applications = await prisma.application.findMany({
      where: { studentId: student.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            deadline: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      applications: applications.map((app) => ({
        id: app.id,
        job: {
          id: app.job.id,
          title: app.job.title,
          company: app.job.company,
          deadline: app.job.deadline.toISOString(),
        },
        status: app.status,
        match_result: app.matchResult,
        interview: null,
        applied_at: app.createdAt.toISOString(),
        updated_at: app.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('GetMyApplications error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to retrieve applications',
      details: {},
    });
  }
};

export const getJobApplicants = async (req, res) => {
  try {
    const { job_id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: job_id },
    });

    if (!job) {
      return res.status(404).json({
        code: 'JOB_NOT_FOUND',
        message: 'Job not found',
        details: {},
      });
    }

    if (req.user.role !== 'admin' && job.recruiterId !== req.user.id) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Not the owner',
        details: {},
      });
    }

    const { status, eligible_only, sort_by = 'match_score', order = 'desc' } = req.query;

    const where = { jobId: job_id };
    if (status) {
      where.status = status;
    }
    if (eligible_only === 'true') {
      where.eligible = true;
    }

    let applications = await prisma.application.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
      orderBy: { createdAt: order === 'asc' ? 'asc' : 'desc' },
    });

    // In-memory sorting for fields like match_score / cgpa
    if (sort_by === 'match_score') {
      applications.sort((a, b) => {
        const scoreA = a.matchResult?.match_score ?? 0;
        const scoreB = b.matchResult?.match_score ?? 0;
        return order === 'asc' ? scoreA - scoreB : scoreB - scoreA;
      });
    } else if (sort_by === 'cgpa') {
      applications.sort((a, b) => {
        const cgpaA = a.student.cgpa;
        const cgpaB = b.student.cgpa;
        return order === 'asc' ? cgpaA - cgpaB : cgpaB - cgpaA;
      });
    }

    return res.status(200).json({
      job_id,
      total: applications.length,
      applicants: applications.map((app) => ({
        application_id: app.id,
        student: {
          id: app.student.id,
          name: app.student.name,
          email: app.student.user?.email || '',
          branch: app.student.branch,
          cgpa: app.student.cgpa,
          graduation_year: app.student.graduationYear,
          backlogs: app.student.backlogs,
          skills: app.student.skills,
          resume_url: `/students/${app.student.id}/resume`,
        },
        status: app.status,
        eligible: app.eligible,
        match_result: app.matchResult,
        applied_at: app.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('GetJobApplicants error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to retrieve job applicants',
      details: {},
    });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const { application_id } = req.params;

    const application = await prisma.application.findUnique({
      where: { id: application_id },
      include: {
        job: true,
        student: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({
        code: 'APPLICATION_NOT_FOUND',
        message: 'Application not found',
        details: {},
      });
    }

    if (req.user.role !== 'admin' && application.job.recruiterId !== req.user.id) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Not the owner',
        details: {},
      });
    }

    return res.status(200).json({
      id: application.id,
      job: {
        id: application.job.id,
        title: application.job.title,
        company: application.job.company,
      },
      student: {
        id: application.student.id,
        name: application.student.name,
        email: application.student.user?.email || '',
        branch: application.student.branch,
        cgpa: application.student.cgpa,
        graduation_year: application.student.graduationYear,
        backlogs: application.student.backlogs,
        skills: application.student.skills,
        projects: application.student.projects,
        resume_url: `/students/${application.student.id}/resume`,
      },
      status: application.status,
      eligible: application.eligible,
      match_result: application.matchResult,
      ats_result: application.atsResult,
      interview: null,
      applied_at: application.createdAt.toISOString(),
      updated_at: application.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('GetApplicationById error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to retrieve application details',
      details: {},
    });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { application_id } = req.params;
    const { status } = req.body;

    const application = await prisma.application.findUnique({
      where: { id: application_id },
      include: { job: true },
    });

    if (!application) {
      return res.status(404).json({
        code: 'APPLICATION_NOT_FOUND',
        message: 'Application not found',
        details: {},
      });
    }

    if (req.user.role !== 'admin' && application.job.recruiterId !== req.user.id) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Not the owner',
        details: {},
      });
    }

    // Check invalid status transition: cannot reject an already-selected candidate
    if (application.status === 'selected' && status === 'rejected') {
      return res.status(400).json({
        code: 'INVALID_STATUS_TRANSITION',
        message: 'Cannot reject an already-selected candidate',
        details: {},
      });
    }

    const updated = await prisma.application.update({
      where: { id: application_id },
      data: { status },
    });

    return res.status(200).json({
      id: updated.id,
      status: updated.status,
      updated_at: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('UpdateApplicationStatus error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to update application status',
      details: {},
    });
  }
};

