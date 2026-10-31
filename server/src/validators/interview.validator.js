import { z } from 'zod';

export const interviewModeEnum = z.enum(['online', 'on_campus'], {
  required_error: 'mode is required',
  invalid_type_error: 'mode must be online or on_campus',
});

export const scheduleInterviewSchema = z.object({
  application_id: z
    .string({ required_error: 'application_id is required' })
    .trim()
    .min(1, 'application_id is required'),
  scheduled_at: z
    .string({ required_error: 'scheduled_at is required' })
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid ISO 8601 date string' }),
  mode: interviewModeEnum,
  location: z
    .string({ required_error: 'location is required' })
    .trim()
    .min(1, 'location is required'),
  notes: z.string().optional().default(''),
});

