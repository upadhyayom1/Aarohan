import { z } from 'zod';

export const educationItemSchema = z.object({
  degree: z.string().default(''),
  branch: z.string().default(''),
  institution: z.string().default(''),
  graduation_year: z.number().int().optional(),
  cgpa: z.number().optional(),
});

export const experienceItemSchema = z.object({
  company: z.string().default(''),
  role: z.string().default(''),
  duration: z.string().default(''),
  description: z.string().default(''),
});

export const resumeProjectItemSchema = z.object({
  title: z.string().default(''),
  description: z.string().default(''),
  tech_stack: z.array(z.string()).default([]),
});

export const resumeAnalysisSchema = z.object({
  skills: z.array(z.string()).default([]),
  education: z.array(educationItemSchema).default([]),
  experience: z.array(experienceItemSchema).default([]),
  projects: z.array(resumeProjectItemSchema).default([]),
  summary: z.string().default(''),
});

