import prisma from '../config/prisma.js';
import { getDrivesQuerySchema, createDriveSchema } from '../validators/admin.validator.js';

export async function getDrives(req, res, next) {
  try {
    const query = getDrivesQuerySchema.parse(req.query);
    const { page, limit, status, search } = query;

    const where = {};
    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, records] = await Promise.all([
      prisma.placementDrive.count({ where }),
      prisma.placementDrive.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { eventStartDate: 'desc' },
      }),
    ]);

    const drives = records.map(drive => ({
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
      description: drive.description || null,
      created_at: drive.createdAt.toISOString(),
      updated_at: drive.updatedAt.toISOString(),
    }));

    return res.status(200).json({
      total,
      page,
      limit,
      drives,
    });
  } catch (error) {
    next(error);
  }
}

export async function createDrive(req, res, next) {
  try {
    const body = createDriveSchema.parse(req.body);

    const drive = await prisma.placementDrive.create({
      data: {
        name: body.name,
        companies: body.companies,
        jobOpeningsCount: body.job_openings_count,
        registrationDeadline: new Date(body.registration_deadline),
        eventStartDate: new Date(body.event_start_date),
        eventEndDate: new Date(body.event_end_date),
        rounds: body.rounds,
        eligibleBranches: body.eligible_branches,
        minCgpa: body.min_cgpa,
        status: body.status,
        description: body.description,
      },
    });

    return res.status(201).json({
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
      description: drive.description || null,
      created_at: drive.createdAt.toISOString(),
      updated_at: drive.updatedAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

