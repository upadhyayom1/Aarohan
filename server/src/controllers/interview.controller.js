import prisma from '../config/db.js';

const formatInterview = (interview) => ({
  id: interview.id,
  application_id: interview.applicationId,
  job: {
    id: interview.application.job.id,
    title: interview.application.job.title,
    company: interview.application.job.company,
  },
  student: {
    id: interview.application.student.id,
    name: interview.application.student.name,
    email: interview.application.student.user?.email || '',
  },
  scheduled_at: interview.scheduledAt.toISOString(),
  mode: interview.mode,
  location: interview.location,
  notes: interview.notes || '',
  created_at: interview.createdAt.toISOString(),
});

export const scheduleInterview = async (req, res) => {
  try {
    const { application_id, scheduled_at, mode, location, notes } = req.body;

    const scheduledDate = new Date(scheduled_at);

    // 1. Check if date is in the past
    if (scheduledDate <= new Date()) {
      return res.status(400).json({
        code: 'PAST_DATE',
        message: 'scheduled_at is in the past',
        details: {},
      });
    }

    // 2. Fetch application with job and student
    const application = await prisma.application.findUnique({
      where: { id: application_id },
      include: {
        job: true,
        student: { include: { user: true } },
        interview: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        code: 'APPLICATION_NOT_FOUND',
        message: 'Application not found',
        details: {},
      });
    }

    // 3. Ownership check: Must be the recruiter who owns the job or admin
    if (req.user.role !== 'admin' && application.job.recruiterId !== req.user.id) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Not the recruiter who owns the job',
        details: {},
      });
    }

    // 4. Duplicate interview check
    if (application.interview) {
      return res.status(400).json({
        code: 'INTERVIEW_ALREADY_SCHEDULED',
        message: 'Interview exists for this application',
        details: {},
      });
    }

    // 5. Create interview & update application status to 'interview_scheduled'
    const [interview] = await prisma.$transaction([
      prisma.interview.create({
        data: {
          applicationId: application_id,
          scheduledAt: scheduledDate,
          mode,
          location,
          notes: notes || '',
        },
        include: {
          application: {
            include: {
              job: true,
              student: { include: { user: true } },
            },
          },
        },
      }),
      prisma.application.update({
        where: { id: application_id },
        data: { status: 'interview_scheduled' },
      }),
    ]);

    return res.status(201).json(formatInterview(interview));
  } catch (error) {
    console.error('ScheduleInterview error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to schedule interview',
      details: {},
    });
  }
};

export const listMyInterviews = async (req, res) => {
  try {
    const { upcoming, past } = req.query;

    const where = {};

    if (req.user.role === 'student') {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
      });
      if (!student) {
        return res.status(200).json({ interviews: [] });
      }
      where.application = { studentId: student.id };
    } else if (req.user.role === 'recruiter') {
      where.application = { job: { recruiterId: req.user.id } };
    }
    // If admin, no recruiter/student restriction

    if (upcoming === 'true') {
      where.scheduledAt = { gt: new Date() };
    } else if (past === 'true') {
      where.scheduledAt = { lte: new Date() };
    }

    const interviews = await prisma.interview.findMany({
      where,
      include: {
        application: {
          include: {
            job: true,
            student: { include: { user: true } },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return res.status(200).json({
      interviews: interviews.map(formatInterview),
    });
  } catch (error) {
    console.error('ListMyInterviews error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to retrieve interviews',
      details: {},
    });
  }
};

export const rescheduleInterview = async (req, res) => {
  try {
    const { interview_id } = req.params;
    const { scheduled_at, mode, location, notes } = req.body;

    const interview = await prisma.interview.findUnique({
      where: { id: interview_id },
      include: {
        application: {
          include: {
            job: true,
            student: { include: { user: true } },
          },
        },
      },
    });

    if (!interview) {
      return res.status(404).json({
        code: 'INTERVIEW_NOT_FOUND',
        message: 'Interview not found',
        details: {},
      });
    }

    if (req.user.role !== 'admin' && interview.application.job.recruiterId !== req.user.id) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Not authorized to reschedule this interview',
        details: {},
      });
    }

    let parsedDate = undefined;
    if (scheduled_at) {
      parsedDate = new Date(scheduled_at);
      if (parsedDate <= new Date()) {
        return res.status(400).json({
          code: 'PAST_DATE',
          message: 'scheduled_at is in the past',
          details: {},
        });
      }
    }

    const updated = await prisma.interview.update({
      where: { id: interview_id },
      data: {
        ...(parsedDate ? { scheduledAt: parsedDate } : {}),
        ...(mode ? { mode } : {}),
        ...(location ? { location } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
      include: {
        application: {
          include: {
            job: true,
            student: { include: { user: true } },
          },
        },
      },
    });

    return res.status(200).json(formatInterview(updated));
  } catch (error) {
    console.error('RescheduleInterview error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to reschedule interview',
      details: {},
    });
  }
};

export const cancelInterview = async (req, res) => {
  try {
    const { interview_id } = req.params;

    const interview = await prisma.interview.findUnique({
      where: { id: interview_id },
      include: {
        application: {
          include: { job: true },
        },
      },
    });

    if (!interview) {
      return res.status(404).json({
        code: 'INTERVIEW_NOT_FOUND',
        message: 'Interview not found',
        details: {},
      });
    }

    if (req.user.role !== 'admin' && interview.application.job.recruiterId !== req.user.id) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Not authorized to cancel this interview',
        details: {},
      });
    }

    await prisma.$transaction([
      prisma.interview.delete({
        where: { id: interview_id },
      }),
      prisma.application.update({
        where: { id: interview.applicationId },
        data: { status: 'shortlisted' },
      }),
    ]);

    return res.status(200).json({
      message: 'Interview cancelled successfully',
      interview_id,
    });
  } catch (error) {
    console.error('CancelInterview error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to cancel interview',
      details: {},
    });
  }
};

