import prisma from '../config/prisma.js';
import {
  getDrivesQuerySchema,
  createDriveSchema,
  updateDriveSchema,
  updateDriveStatusSchema,
} from '../validators/admin.validator.js';

function formatDrive(drive) {
  return {
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
  };
}

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

    const drives = records.map(formatDrive);

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

export async function getDriveById(req, res, next) {
  try {
    const { id } = req.params;
    const drive = await prisma.placementDrive.findUnique({
      where: { id },
    });

    if (!drive) {
      return res.status(404).json({
        code: 'DRIVE_NOT_FOUND',
        message: 'Placement drive not found',
        details: {},
      });
    }

    return res.status(200).json(formatDrive(drive));
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

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actor: req.user?.name || 'Administrator',
        actorRole: req.user?.role || 'admin',
        action: 'CREATE_DRIVE',
        entity: `PlacementDrive:${drive.id}`,
        summary: `Created placement drive "${drive.name}"`,
        details: `Configured ${drive.companies.length} partner employers and min CGPA ${drive.minCgpa}.`,
      },
    }).catch(() => {});

    return res.status(201).json(formatDrive(drive));
  } catch (error) {
    next(error);
  }
}

export async function updateDrive(req, res, next) {
  try {
    const { id } = req.params;
    const body = updateDriveSchema.parse(req.body);

    const existing = await prisma.placementDrive.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        code: 'DRIVE_NOT_FOUND',
        message: 'Placement drive not found',
        details: {},
      });
    }

    const data = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.companies !== undefined) data.companies = body.companies;
    if (body.job_openings_count !== undefined) data.jobOpeningsCount = body.job_openings_count;
    if (body.registration_deadline !== undefined) data.registrationDeadline = new Date(body.registration_deadline);
    if (body.event_start_date !== undefined) data.eventStartDate = new Date(body.event_start_date);
    if (body.event_end_date !== undefined) data.eventEndDate = new Date(body.event_end_date);
    if (body.rounds !== undefined) data.rounds = body.rounds;
    if (body.eligible_branches !== undefined) data.eligibleBranches = body.eligible_branches;
    if (body.min_cgpa !== undefined) data.minCgpa = body.min_cgpa;
    if (body.status !== undefined) data.status = body.status;
    if (body.description !== undefined) data.description = body.description;

    const updated = await prisma.placementDrive.update({
      where: { id },
      data,
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actor: req.user?.name || 'Administrator',
        actorRole: req.user?.role || 'admin',
        action: 'UPDATE_DRIVE',
        entity: `PlacementDrive:${id}`,
        summary: `Updated placement drive "${updated.name}"`,
        details: `Modified fields: ${Object.keys(data).join(', ')}.`,
      },
    }).catch(() => {});

    return res.status(200).json(formatDrive(updated));
  } catch (error) {
    next(error);
  }
}

export async function patchDriveStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = updateDriveStatusSchema.parse(req.body);

    const existing = await prisma.placementDrive.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        code: 'DRIVE_NOT_FOUND',
        message: 'Placement drive not found',
        details: {},
      });
    }

    const updated = await prisma.placementDrive.update({
      where: { id },
      data: { status },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actor: req.user?.name || 'Administrator',
        actorRole: req.user?.role || 'admin',
        action: 'UPDATE_DRIVE_STATUS',
        entity: `PlacementDrive:${id}`,
        summary: `Changed drive "${updated.name}" status to ${status}`,
      },
    }).catch(() => {});

    return res.status(200).json(formatDrive(updated));
  } catch (error) {
    next(error);
  }
}
