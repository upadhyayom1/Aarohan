import { z } from 'zod';

export const getDrivesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['Draft', 'Active', 'Completed', 'Cancelled']).optional(),
  search: z.string().trim().optional(),
});

export const createDriveSchema = z.object({
  name: z.string({ required_error: 'Drive name is required' }).trim().min(2, 'Drive name must be at least 2 characters'),
  companies: z.array(z.string().trim().min(1)).min(1, 'At least one participating company is required'),
  job_openings_count: z.coerce.number().int().min(0).default(0),
  registration_deadline: z.string().datetime({ message: 'Must be a valid ISO 8601 date string' }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  event_start_date: z.string().datetime({ message: 'Must be a valid ISO 8601 date string' }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  event_end_date: z.string().datetime({ message: 'Must be a valid ISO 8601 date string' }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  rounds: z.array(z.string().trim().min(1)).default([]),
  eligible_branches: z.array(z.string().trim().min(1)).default([]),
  min_cgpa: z.coerce.number().min(0).max(10).default(0),
  status: z.enum(['Draft', 'Active', 'Completed', 'Cancelled']).default('Active'),
  description: z.string().trim().optional(),
});

export const updateDriveSchema = createDriveSchema.partial();

export const updateDriveStatusSchema = z.object({
  status: z.enum(['Draft', 'Active', 'Completed', 'Cancelled']),
});

export const getApplicationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().trim().optional(),
  search: z.string().trim().optional(),
  job_id: z.string().trim().optional(),
  student_id: z.string().trim().optional(),
});

export const getPlacementsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  branch: z.string().trim().optional(),
  search: z.string().trim().optional(),
});

export const getAuditLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.string().trim().optional(),
  search: z.string().trim().optional(),
});

export const updateSettingsSchema = z.object({
  placement_year: z.string().trim().min(1).default('2026–2027'),
  default_min_cgpa: z.coerce.number().min(0).max(10).default(7.0),
  max_backlogs_allowed: z.coerce.number().int().min(0).default(0),
});
