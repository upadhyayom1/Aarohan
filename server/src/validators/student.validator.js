import { z } from 'zod';

export const BranchEnum = z.enum([
  'CSE',
  'IT',
  'ECE',
  'EE',
  'ME',
  'CE',
  'CH',
  'MCA',
  'MBA',
  'PHD_CS',
  'OTHER',
]);

export const projectSchema = z.object({
  title: z.string({ required_error: 'Project title is required' }).min(1, 'Project title is required'),
  description: z.string().optional().default(''),
  tech_stack: z.array(z.string()).optional().default([]),
});

export const updateStudentProfileSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).trim().min(2, 'Name must be at least 2 characters'),
  branch: BranchEnum,
  cgpa: z.coerce.number({ required_error: 'CGPA is required' }).min(0.0, 'CGPA must be at least 0.0').max(10.0, 'CGPA cannot exceed 10.0'),
  graduation_year: z.coerce.number({ required_error: 'Graduation year is required' }).int().min(1900, 'Invalid graduation year').max(2100, 'Invalid graduation year'),
  backlogs: z.coerce.number({ required_error: 'Backlogs count is required' }).int().min(0, 'Backlogs cannot be negative').default(0),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  projects: z.array(projectSchema).optional().default([]),
});

