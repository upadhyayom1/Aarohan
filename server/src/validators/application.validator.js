import { z } from 'zod';

export const applicationStatusEnum = z.enum([
  'applied',
  'shortlisted',
  'interview_scheduled',
  'selected',
  'rejected',
  'not_selected',
]);

export const applyJobSchema = z.object({
  job_id: z.string({ required_error: 'job_id is required' }).trim().min(1, 'job_id is required'),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum([
    'shortlisted',
    'rejected',
    'interview_scheduled',
    'selected',
    'not_selected',
  ], {
    required_error: 'status is required',
    invalid_type_error: 'Invalid application status',
  }),
});

