import { z } from 'zod';
import { BranchEnum } from './student.validator.js';

export const jobStatusEnum = z.enum(['open', 'closed']);

export const createJobSchema = z.object({
  title: z
    .string({ required_error: 'Job title is required' })
    .trim()
    .min(2, 'Job title must be at least 2 characters'),
  company: z
    .string({ required_error: 'Company name is required' })
    .trim()
    .min(2, 'Company name must be at least 2 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(5, 'Description must be at least 5 characters'),
  required_skills: z
    .array(z.string().trim().min(1, 'Skill cannot be empty'))
    .min(1, 'At least one required skill is needed'),
  eligible_branches: z
    .array(BranchEnum)
    .min(1, 'At least one eligible branch is required'),
  min_cgpa: z.coerce
    .number({ required_error: 'Minimum CGPA is required' })
    .min(0.0, 'CGPA must be at least 0.0')
    .max(10.0, 'CGPA cannot exceed 10.0'),
  graduation_year: z.coerce
    .number({ required_error: 'Graduation year is required' })
    .int()
    .min(1900, 'Invalid graduation year')
    .max(2100, 'Invalid graduation year'),
  max_backlogs: z.coerce
    .number({ required_error: 'Max backlogs is required' })
    .int()
    .min(0, 'Max backlogs cannot be negative'),
  deadline: z
    .string({ required_error: 'Deadline is required' })
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid ISO 8601 date string' })
    .refine((val) => new Date(val) > new Date(), { message: 'Deadline must be a future date' }),
});

export const updateJobStatusSchema = z.object({
  status: jobStatusEnum,
});

