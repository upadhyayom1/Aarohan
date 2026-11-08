import { z } from 'zod';

export const RoleEnum = z.enum(['student', 'recruiter']);

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, { message: 'Name must be at least 2 characters' }),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email({ message: 'Must be a valid email address' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' }),
  role: RoleEnum.default('student'),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email or username is required' })
    .trim()
    .min(1, { message: 'Email or username is required' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, { message: 'Password is required' }),
});

export const updateMeSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  organization: z.string().trim().max(120).optional(),
});

