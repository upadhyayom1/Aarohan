import prisma from '../config/prisma.js';
import {
  getAuditLogsQuerySchema,
  updateSettingsSchema,
} from '../validators/admin.validator.js';

export async function getAnalytics(req, res, next) {
  try {
    const [
      totalApplications,
      selectedCount,
      interviewCount,
      shortlistedCount,
      appliedCount,
      allApplications,
      activeJobs,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: 'selected' } }),
      prisma.application.count({ where: { status: 'interview_scheduled' } }),
      prisma.application.count({ where: { status: 'shortlisted' } }),
      prisma.application.count({ where: { status: 'applied' } }),
      prisma.application.findMany({
        include: {
          student: { select: { branch: true } },
        },
      }),
      prisma.job.findMany({
        where: { status: 'open' },
        select: { requiredSkills: true },
      }),
    ]);

    // Compute Department Performance
    const deptStats = {};
    for (const app of allApplications) {
      const b = app.student?.branch || 'OTHER';
      if (!deptStats[b]) {
        deptStats[b] = { applicants: 0, placed: 0 };
      }
      deptStats[b].applicants += 1;
      if (app.status === 'selected') {
        deptStats[b].placed += 1;
      }
    }

    const departmentPerformance = Object.entries(deptStats).map(([branch, data]) => ({
      branch,
      applicants: data.applicants,
      placed: data.placed,
      rate: data.applicants > 0 ? Number(((data.placed / data.applicants) * 100).toFixed(1)) : 0,
    }));

    // In-demand skills aggregation
    const skillCountMap = new Map();
    for (const job of activeJobs) {
      for (const skill of job.requiredSkills || []) {
        skillCountMap.set(skill, (skillCountMap.get(skill) || 0) + 1);
      }
    }

    const inDemandSkills = Array.from(skillCountMap.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const interviewConversion = totalApplications > 0
      ? Number((((interviewCount + selectedCount) / totalApplications) * 100).toFixed(1))
      : 0;

    const selectionConversion = (interviewCount + selectedCount) > 0
      ? Number(((selectedCount / (interviewCount + selectedCount)) * 100).toFixed(1))
      : 0;

    return res.status(200).json({
      kpis: {
        total_applications: totalApplications,
        interview_conversion_rate: interviewConversion,
        selection_conversion_rate: selectionConversion,
        department_breadth: Object.keys(deptStats).length,
      },
      department_performance: departmentPerformance,
      in_demand_skills: inDemandSkills,
      hiring_funnel: {
        applied: appliedCount,
        under_review: appliedCount,
        shortlisted: shortlistedCount,
        interview_scheduled: interviewCount,
        selected: selectedCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const query = getAuditLogsQuerySchema.parse(req.query);
    const { page, limit, role, search } = query;

    const where = {};
    if (role && role.toLowerCase() !== 'all') {
      where.actorRole = role.toLowerCase();
    }

    if (search) {
      where.OR = [
        { actor: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { entity: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, records] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const logs = records.map((log) => ({
      id: log.id,
      timestamp: log.createdAt.toISOString(),
      actor: log.actor,
      actor_role: log.actorRole,
      action: log.action,
      entity: log.entity,
      summary: log.summary,
      details: log.details || null,
    }));

    return res.status(200).json({
      total,
      page,
      limit,
      logs,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSettings(req, res, next) {
  try {
    let settings = await prisma.institutionalSettings.findFirst();
    if (!settings) {
      settings = await prisma.institutionalSettings.create({
        data: {
          id: 'default',
          placementYear: '2026–2027',
          defaultMinCgpa: 7.0,
          maxBacklogsAllowed: 0,
        },
      });
    }

    return res.status(200).json({
      placement_year: settings.placementYear,
      default_min_cgpa: settings.defaultMinCgpa,
      max_backlogs_allowed: settings.maxBacklogsAllowed,
      updated_at: settings.updatedAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const body = updateSettingsSchema.parse(req.body);

    const settings = await prisma.institutionalSettings.upsert({
      where: { id: 'default' },
      update: {
        placementYear: body.placement_year,
        defaultMinCgpa: body.default_min_cgpa,
        maxBacklogsAllowed: body.max_backlogs_allowed,
      },
      create: {
        id: 'default',
        placementYear: body.placement_year,
        defaultMinCgpa: body.default_min_cgpa,
        maxBacklogsAllowed: body.max_backlogs_allowed,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actor: req.user?.name || 'Administrator',
        actorRole: req.user?.role || 'admin',
        action: 'UPDATE_SETTINGS',
        entity: 'InstitutionalSettings:default',
        summary: `Updated placement policies for AY ${settings.placementYear}`,
        details: `Cutoff CGPA: ${settings.defaultMinCgpa}, Max backlogs: ${settings.maxBacklogsAllowed}`,
      },
    }).catch(() => {});

    return res.status(200).json({
      placement_year: settings.placementYear,
      default_min_cgpa: settings.defaultMinCgpa,
      max_backlogs_allowed: settings.maxBacklogsAllowed,
      updated_at: settings.updatedAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

export async function getCompanies(req, res, next) {
  try {
    const jobs = await prisma.job.findMany({
      select: {
        company: true,
        status: true,
        _count: {
          select: { applications: true },
        },
      },
    });

    const companyMap = new Map();
    for (const job of jobs) {
      if (!companyMap.has(job.company)) {
        companyMap.set(job.company, {
          name: job.company,
          active_jobs: 0,
          total_applicants: 0,
          status: 'Accredited Partner',
        });
      }
      const entry = companyMap.get(job.company);
      if (job.status === 'open') {
        entry.active_jobs += 1;
      }
      entry.total_applicants += job._count.applications;
    }

    const companies = Array.from(companyMap.values());

    return res.status(200).json({
      total: companies.length,
      companies,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRecruiterById(req, res, next) {
  try {
    const { id } = req.params;
    const recruiter = await prisma.user.findFirst({
      where: { id, role: 'recruiter' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        jobs: {
          select: {
            id: true,
            title: true,
            company: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!recruiter) {
      return res.status(404).json({
        code: 'RECRUITER_NOT_FOUND',
        message: 'Recruiter not found',
        details: {},
      });
    }

    return res.status(200).json({
      id: recruiter.id,
      name: recruiter.name,
      email: recruiter.email,
      role: recruiter.role,
      joined_date: recruiter.createdAt.toISOString(),
      jobs_posted_count: recruiter.jobs.length,
      jobs: recruiter.jobs.map((j) => ({
        id: j.id,
        title: j.title,
        company: j.company,
        status: j.status,
        created_at: j.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    next(error);
  }
}

export async function getStudentById(req, res, next) {
  try {
    const { id } = req.params;
    const student = await prisma.studentProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
      },
      include: {
        user: {
          select: { email: true, createdAt: true },
        },
        applications: {
          include: {
            job: {
              select: { id: true, title: true, company: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        code: 'STUDENT_NOT_FOUND',
        message: 'Student profile not found',
        details: {},
      });
    }

    return res.status(200).json({
      id: student.id,
      user_id: student.userId,
      name: student.name,
      email: student.user?.email || '',
      branch: student.branch,
      cgpa: student.cgpa,
      graduation_year: student.graduationYear,
      backlogs: student.backlogs,
      skills: student.skills,
      projects: student.projects,
      resume_uploaded: student.resumeUploaded,
      resume_url: student.resumeUrl,
      profile_complete: student.profileComplete,
      created_at: student.createdAt.toISOString(),
      applications: student.applications.map((a) => ({
        id: a.id,
        job_id: a.jobId,
        job_title: a.job?.title || 'Unknown Role',
        company: a.job?.company || 'Unknown Company',
        status: a.status,
        applied_date: a.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    next(error);
  }
}
