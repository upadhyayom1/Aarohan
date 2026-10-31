import test from 'node:test';
import assert from 'node:assert/strict';
import { checkEligibility, calculateMatch } from './matching';
import { StudentProfile, JobOpportunity } from '../types';

test('checkEligibility correctly evaluates pass criteria', () => {
  const student = {
    cgpa: 8.75,
    branch: 'Computer Science & Engineering',
    activeBacklogs: 0,
    graduationYear: 2026,
  };

  const job = {
    minCgpa: 7.5,
    eligibleBranches: ['Computer Science & Engineering', 'Information Technology'],
    maxBacklogs: 0,
    eligibleGradYears: [2026, 2027],
  };

  const result = checkEligibility(student, job);
  assert.equal(result.isEligible, true);
  assert.equal(result.reasons.length, 4);
  assert.equal(result.reasons.every(r => r.passed), true);
});

test('checkEligibility correctly rejects low CGPA or ineligible branch', () => {
  const studentLowCgpa = {
    cgpa: 6.8,
    branch: 'Mechanical Engineering',
    activeBacklogs: 1,
    graduationYear: 2026,
  };

  const job = {
    minCgpa: 7.5,
    eligibleBranches: ['Computer Science & Engineering'],
    maxBacklogs: 0,
    eligibleGradYears: [2026],
  };

  const result = checkEligibility(studentLowCgpa, job);
  assert.equal(result.isEligible, false);

  const cgpaCheck = result.reasons.find(r => r.rule === 'Minimum CGPA');
  assert.equal(cgpaCheck?.passed, false);

  const branchCheck = result.reasons.find(r => r.rule === 'Eligible Branch / Discipline');
  assert.equal(branchCheck?.passed, false);

  const backlogCheck = result.reasons.find(r => r.rule === 'Active Backlog Limit');
  assert.equal(backlogCheck?.passed, false);
});

test('calculateMatch returns high score when required skills directly match', () => {
  const student: StudentProfile = {
    id: 's-1',
    fullName: 'Aditi Rao',
    email: 'aditi.rao@univ.edu',
    phone: '+1 555-0192',
    institution: 'State Institute of Technology',
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    currentSemester: 7,
    cgpa: 9.1,
    graduationYear: 2026,
    activeBacklogs: 0,
    skills: ['React', 'TypeScript', 'Node.js', 'SQL', 'Git'],
    projects: [
      {
        id: 'p-1',
        title: 'Aarohan Portal',
        description: 'University placement system',
        techStack: ['React', 'TypeScript'],
      },
    ],
    experience: [
      {
        id: 'e-1',
        position: 'Software Engineering Intern',
        organization: 'Veritas Labs',
        startDate: 'June 2025',
        endDate: 'August 2025',
        description: 'Frontend optimizations',
      },
    ],
  };

  const job: JobOpportunity = {
    id: 'j-1',
    title: 'Software Development Engineer',
    company: 'Apex Systems',
    companyInitials: 'AS',
    location: 'Boston, MA',
    workArrangement: 'Hybrid',
    employmentType: 'Full-time',
    deadline: '2026-11-20',
    publishedDate: '2026-10-15',
    description: 'Build robust cloud applications',
    responsibilities: ['Develop clean code'],
    requiredQualifications: ['BS in Computer Science'],
    requiredSkills: ['React', 'TypeScript', 'Node.js'],
    preferredSkills: ['SQL', 'Docker'],
    eligibleBranches: ['Computer Science & Engineering'],
    eligibleGradYears: [2026],
    minCgpa: 8.0,
    maxBacklogs: 0,
    applicantsCount: 12,
    shortlistedCount: 3,
    status: 'Active',
  };

  const match = calculateMatch(student, job);
  assert.ok(match.overallScore >= 80, `Expected score >= 80, got ${match.overallScore}`);
  assert.equal(match.isEligible, true);
  assert.equal(match.matchedSkills.length, 3);
  assert.equal(match.missingRequiredSkills.length, 0);
});
