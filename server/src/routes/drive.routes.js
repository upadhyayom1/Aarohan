import { Router } from 'express';
import prisma from '../config/prisma.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/v1/drives - List active/upcoming placement drives for students and recruiters
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    } else if (req.user.role === 'student') {
      // Students see Active drives
      where.status = 'Active';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { companies: { has: search } },
      ];
    }

    const drives = await prisma.placementDrive.findMany({
      where,
      orderBy: { eventStartDate: 'asc' },
    });

    return res.status(200).json({
      total: drives.length,
      drives: drives.map((d) => ({
        id: d.id,
        name: d.name,
        companies: d.companies,
        job_openings_count: d.jobOpeningsCount,
        registration_deadline: d.registrationDeadline.toISOString(),
        event_start_date: d.eventStartDate.toISOString(),
        event_end_date: d.eventEndDate.toISOString(),
        rounds: d.rounds,
        eligible_branches: d.eligibleBranches,
        min_cgpa: d.minCgpa,
        status: d.status,
        description: d.description || '',
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/drives/:id - Get single placement drive
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const drive = await prisma.placementDrive.findUnique({
      where: { id: req.params.id },
    });

    if (!drive) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Placement drive not found',
      });
    }

    return res.status(200).json({
      id: drive.id,
      name: drive.name,
      companies: drive.companies,
      job_openings_count: drive.jobOpeningsCount,
      registration_deadline: drive.registrationDeadline.toISOString(),
      event_start_date: drive.eventStartDate.toISOString(),
      event_end_date: drive.eventEndDate.toISOString(),
      rounds: drive.rounds,
      eligible_branches: drive.eligibleBranches,
      min_cgpa: drive.minCgpa,
      status: drive.status,
      description: drive.description || '',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

