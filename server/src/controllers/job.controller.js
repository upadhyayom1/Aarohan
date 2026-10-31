import prisma from '../config/db.js';

const formatJob = (job) => ({
  id: job.id,
  title: job.title,
  company: job.company,
  description: job.description,
  required_skills: job.requiredSkills || [],
  eligible_branches: job.eligibleBranches || [],
  min_cgpa: job.minCgpa,
  graduation_year: job.graduationYear,
  max_backlogs: job.maxBacklogs,
  deadline: job.deadline.toISOString(),
  status: job.status,
  recruiter_id: job.recruiterId,
  recruiter_name: job.recruiter?.name || '',
  applicant_count: job.applicantCount ?? 0,
  created_at: job.createdAt.toISOString(),
  updated_at: job.updatedAt ? job.updatedAt.toISOString() : undefined,
});

export const listJobs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const { branch } = req.query;
    const openOnly = req.query.open_only === 'false' ? false : true;

    const where = {};
    if (openOnly) {
      where.status = 'open';
    }
    if (branch) {
      where.eligibleBranches = { has: branch };
    }

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          recruiter: {
            select: { name: true },
          },
        },
      }),
    ]);

    return res.status(200).json({
      total,
      page,
      limit,
      jobs: jobs.map(formatJob),
    });
  } catch (error) {
    console.error('ListJobs error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to retrieve jobs',
      details: {},
    });
  }
};

export const getJobById = async (req, res) => {
  try {
    const { job_id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: job_id },
      include: {
        recruiter: {
          select: { name: true },
        },
      },
    });

    if (!job) {
      return res.status(404).json({
        code: 'JOB_NOT_FOUND',
        message: 'Job not found',
        details: {},
      });
    }

    return res.status(200).json(formatJob(job));
  } catch (error) {
    console.error('GetJobById error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to retrieve job details',
      details: {},
    });
  }
};

export const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      required_skills,
      eligible_branches,
      min_cgpa,
      graduation_year,
      max_backlogs,
      deadline,
    } = req.body;

    const job = await prisma.job.create({
      data: {
        title: title.trim(),
        company: company.trim(),
        description: description.trim(),
        requiredSkills: required_skills,
        eligibleBranches: eligible_branches,
        minCgpa: min_cgpa,
        graduationYear: graduation_year,
        maxBacklogs: max_backlogs,
        deadline: new Date(deadline),
        status: 'open',
        recruiterId: req.user.id,
      },
      include: {
        recruiter: {
          select: { name: true },
        },
      },
    });

    return res.status(201).json(formatJob(job));
  } catch (error) {
    console.error('CreateJob error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to create job',
      details: {},
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { job_id } = req.params;

    const existingJob = await prisma.job.findUnique({
      where: { id: job_id },
    });

    if (!existingJob) {
      return res.status(404).json({
        code: 'JOB_NOT_FOUND',
        message: 'Job not found',
        details: {},
      });
    }

    // Must be owner or admin
    if (req.user.role !== 'admin' && existingJob.recruiterId !== req.user.id) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Not the owner',
        details: {},
      });
    }

    const {
      title,
      company,
      description,
      required_skills,
      eligible_branches,
      min_cgpa,
      graduation_year,
      max_backlogs,
      deadline,
    } = req.body;

    const updated = await prisma.job.update({
      where: { id: job_id },
      data: {
        title: title.trim(),
        company: company.trim(),
        description: description.trim(),
        requiredSkills: required_skills,
        eligibleBranches: eligible_branches,
        minCgpa: min_cgpa,
        graduationYear: graduation_year,
        maxBacklogs: max_backlogs,
        deadline: new Date(deadline),
      },
      include: {
        recruiter: {
          select: { name: true },
        },
      },
    });

    return res.status(200).json(formatJob(updated));
  } catch (error) {
    console.error('UpdateJob error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to update job',
      details: {},
    });
  }
};

export const updateJobStatus = async (req, res) => {
  try {
    const { job_id } = req.params;
    const { status } = req.body;

    const existingJob = await prisma.job.findUnique({
      where: { id: job_id },
    });

    if (!existingJob) {
      return res.status(404).json({
        code: 'JOB_NOT_FOUND',
        message: 'Job not found',
        details: {},
      });
    }

    // Must be owner or admin
    if (req.user.role !== 'admin' && existingJob.recruiterId !== req.user.id) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Not the owner',
        details: {},
      });
    }

    const updated = await prisma.job.update({
      where: { id: job_id },
      data: { status },
      include: {
        recruiter: {
          select: { name: true },
        },
      },
    });

    return res.status(200).json(formatJob(updated));
  } catch (error) {
    console.error('UpdateJobStatus error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to update job status',
      details: {},
    });
  }
};

