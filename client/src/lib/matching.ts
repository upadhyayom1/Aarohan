import { StudentProfile, JobOpportunity, MatchResult } from '../types';

// Curated dictionary of related technologies for explainable semantic matching
const RELATED_SKILLS_MAP: Record<string, string[]> = {
  'React': ['Next.js', 'Vue.js', 'Redux', 'Frontend Development', 'JavaScript', 'HTML/CSS'],
  'TypeScript': ['JavaScript', 'Node.js', 'Backend Development'],
  'Node.js': ['Express', 'Backend Development', 'TypeScript', 'REST APIs', 'FastAPI'],
  'Python': ['Django', 'FastAPI', 'Machine Learning', 'Data Analysis', 'PyTorch', 'TensorFlow', 'Pandas'],
  'SQL': ['PostgreSQL', 'MySQL', 'Database Design', 'Relational Databases'],
  'PostgreSQL': ['SQL', 'Database Design', 'Prisma', 'TypeORM'],
  'Docker': ['Kubernetes', 'CI/CD', 'DevOps', 'Cloud Computing', 'Containerization'],
  'AWS': ['Cloud Computing', 'DevOps', 'GCP', 'Azure', 'Serverless'],
  'Machine Learning': ['Deep Learning', 'PyTorch', 'TensorFlow', 'NLP', 'Computer Vision', 'Data Science'],
  'Algorithms': ['Data Structures', 'Problem Solving', 'System Design', 'C++', 'Java'],
  'Java': ['Spring Boot', 'Object-Oriented Programming', 'Backend Development'],
  'C++': ['Algorithms', 'System Programming', 'Data Structures'],
  'Git': ['GitHub', 'GitLab', 'Version Control'],
  'REST APIs': ['GraphQL', 'API Design', 'HTTP Protocol', 'Backend Development'],
  'GraphQL': ['REST APIs', 'API Design'],
  'Figma': ['UI/UX Design', 'Design Systems', 'Wireframing', 'Prototyping'],
  'Cybersecurity': ['Network Security', 'Cryptography', 'Penetration Testing'],
};

export function checkEligibility(
  student: Pick<StudentProfile, 'cgpa' | 'branch' | 'activeBacklogs' | 'graduationYear'>,
  job: Pick<JobOpportunity, 'minCgpa' | 'eligibleBranches' | 'maxBacklogs' | 'eligibleGradYears'>
): { isEligible: boolean; reasons: { rule: string; passed: boolean; message: string }[] } {
  const reasons: { rule: string; passed: boolean; message: string }[] = [];

  // 1. CGPA Criterion
  const cgpaPassed = student.cgpa >= job.minCgpa;
  reasons.push({
    rule: 'Minimum CGPA',
    passed: cgpaPassed,
    message: cgpaPassed
      ? `Student CGPA (${student.cgpa.toFixed(2)}) meets or exceeds required minimum (${job.minCgpa.toFixed(2)})`
      : `Student CGPA (${student.cgpa.toFixed(2)}) is below the required cutoff of ${job.minCgpa.toFixed(2)}`,
  });

  // 2. Branch Criterion
  const branchNormalized = student.branch.trim().toLowerCase();
  const branchPassed = job.eligibleBranches.some(
    b => b.trim().toLowerCase() === branchNormalized || b.trim().toLowerCase() === 'all branches'
  );
  reasons.push({
    rule: 'Eligible Branch / Discipline',
    passed: branchPassed,
    message: branchPassed
      ? `Student branch (${student.branch}) is included in eligible departments`
      : `Branch ${student.branch} is not eligible. Required: ${job.eligibleBranches.join(', ')}`,
  });

  // 3. Backlogs Criterion
  const backlogsPassed = student.activeBacklogs <= job.maxBacklogs;
  reasons.push({
    rule: 'Active Backlog Limit',
    passed: backlogsPassed,
    message: backlogsPassed
      ? `Active backlogs (${student.activeBacklogs}) within maximum allowed (${job.maxBacklogs})`
      : `Active backlogs (${student.activeBacklogs}) exceed maximum allowed (${job.maxBacklogs})`,
  });

  // 4. Graduation Year
  const gradYearPassed =
    !job.eligibleGradYears ||
    job.eligibleGradYears.length === 0 ||
    job.eligibleGradYears.includes(student.graduationYear);
  reasons.push({
    rule: 'Graduation Cohort',
    passed: gradYearPassed,
    message: gradYearPassed
      ? `Graduation cohort (${student.graduationYear}) is eligible`
      : `Class of ${student.graduationYear} is not eligible for this drive. Eligible cohorts: ${job.eligibleGradYears.join(', ')}`,
  });

  const isEligible = reasons.every(r => r.passed);
  return { isEligible, reasons };
}

export function calculateMatch(
  student: StudentProfile,
  job: JobOpportunity
): MatchResult {
  const studentSkillsUpper = new Set(student.skills.map(s => s.trim().toLowerCase()));
  const matchedSkills: string[] = [];
  const missingRequiredSkills: string[] = [];
  const relatedSkills: { studentSkill: string; relatedTo: string }[] = [];

  // Match required skills
  for (const reqSkill of job.requiredSkills) {
    const norm = reqSkill.trim().toLowerCase();
    if (studentSkillsUpper.has(norm)) {
      matchedSkills.push(reqSkill);
    } else {
      // Check if student has a related skill
      let foundRelated = false;
      for (const [key, relatedList] of Object.entries(RELATED_SKILLS_MAP)) {
        if (key.toLowerCase() === norm) {
          for (const rel of relatedList) {
            if (studentSkillsUpper.has(rel.toLowerCase())) {
              relatedSkills.push({ studentSkill: rel, relatedTo: reqSkill });
              foundRelated = true;
              break;
            }
          }
        }
      }
      if (!foundRelated) {
        missingRequiredSkills.push(reqSkill);
      }
    }
  }

  // Calculate skill fit score (0 - 60 for required, 0 - 15 for preferred)
  const totalReq = job.requiredSkills.length || 1;
  const directMatchRatio = matchedSkills.length / totalReq;
  const relatedMatchRatio = (relatedSkills.length * 0.5) / totalReq;
  const reqSkillScore = Math.min(60, Math.round((directMatchRatio + relatedMatchRatio) * 60));

  // Preferred skills matching
  let preferredMatchCount = 0;
  for (const pref of job.preferredSkills || []) {
    if (studentSkillsUpper.has(pref.trim().toLowerCase())) {
      preferredMatchCount++;
    }
  }
  const totalPref = job.preferredSkills?.length || 1;
  const prefSkillScore = Math.min(15, Math.round((preferredMatchCount / totalPref) * 15));

  const skillFitScore = reqSkillScore + prefSkillScore;

  // Academic Fit Score (0 - 15)
  const eligibility = checkEligibility(student, job);
  let academicFitScore = eligibility.isEligible ? 15 : 5;
  if (student.cgpa >= job.minCgpa + 1.0) {
    academicFitScore = Math.min(15, academicFitScore + 2);
  }

  // Experience & Project Fit Score (0 - 10)
  let expScore = 0;
  if (student.projects && student.projects.length > 0) {
    expScore += Math.min(6, student.projects.length * 2);
  }
  if (student.experience && student.experience.length > 0) {
    expScore += 4;
  }
  const experienceFitScore = Math.min(10, expScore);

  const overallScore = Math.min(100, skillFitScore + academicFitScore + experienceFitScore);

  // Generate transparent human-readable explanation
  let matchExplanation = '';
  if (overallScore >= 80) {
    matchExplanation = `High alignment: You possess ${matchedSkills.length} of ${job.requiredSkills.length} required core competencies with strong academic qualification.`;
  } else if (overallScore >= 60) {
    matchExplanation = `Moderate alignment: Good foundational fit (${matchedSkills.length} direct matches). Enhancing skills in ${missingRequiredSkills.slice(0, 2).join(', ')} will significantly boost compatibility.`;
  } else {
    matchExplanation = `Developing alignment: Meets initial academic standards, but notable gaps exist in core technical requirements (${missingRequiredSkills.slice(0, 3).join(', ')}).`;
  }

  return {
    jobId: job.id,
    overallScore,
    isEligible: eligibility.isEligible,
    eligibilityReasons: eligibility.reasons,
    matchedSkills,
    relatedSkills,
    missingRequiredSkills,
    matchExplanation,
    breakdown: {
      skillFitScore,
      academicFitScore,
      experienceFitScore,
    },
  };
}
