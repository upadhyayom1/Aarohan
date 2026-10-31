import prisma from '../config/db.js';

const formatStudentProfile = (profile, userEmail) => ({
  id: profile.id,
  user_id: profile.userId,
  name: profile.name,
  email: userEmail || profile.user?.email || '',
  branch: profile.branch,
  cgpa: profile.cgpa,
  graduation_year: profile.graduationYear,
  backlogs: profile.backlogs,
  skills: profile.skills || [],
  projects: profile.projects || [],
  resume_uploaded: profile.resumeUploaded,
  resume_url: profile.resumeUrl,
  profile_complete: profile.profileComplete,
});

export const getMyProfile = async (req, res) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
      include: { user: true },
    });

    if (!profile) {
      return res.status(404).json({
        code: 'PROFILE_NOT_FOUND',
        message: 'Profile not yet created',
        details: {},
      });
    }

    return res.status(200).json(formatStudentProfile(profile, req.user.email));
  } catch (error) {
    console.error('GetMyProfile error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch student profile',
      details: {},
    });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const { name, branch, cgpa, graduation_year, backlogs, skills, projects } = req.body;

    const isComplete = Boolean(
      name &&
      branch &&
      typeof cgpa === 'number' &&
      graduation_year &&
      Array.isArray(skills) &&
      skills.length > 0
    );

    const profile = await prisma.studentProfile.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        name: name.trim(),
        branch,
        cgpa,
        graduationYear: graduation_year,
        backlogs: backlogs ?? 0,
        skills,
        projects: projects || [],
        profileComplete: isComplete,
      },
      update: {
        name: name.trim(),
        branch,
        cgpa,
        graduationYear: graduation_year,
        backlogs: backlogs ?? 0,
        skills,
        projects: projects || [],
        profileComplete: isComplete,
      },
      include: { user: true },
    });

    // Keep User name synced
    if (name && req.user.name !== name.trim()) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { name: name.trim() },
      });
    }

    return res.status(200).json(formatStudentProfile(profile, req.user.email));
  } catch (error) {
    console.error('UpdateMyProfile error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to update student profile',
      details: {},
    });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { student_id } = req.params;

    const profile = await prisma.studentProfile.findUnique({
      where: { id: student_id },
      include: { user: true },
    });

    if (!profile) {
      return res.status(404).json({
        code: 'STUDENT_NOT_FOUND',
        message: 'Student profile not found',
        details: {},
      });
    }

    return res.status(200).json(formatStudentProfile(profile, profile.user?.email));
  } catch (error) {
    console.error('GetStudentById error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch student details',
      details: {},
    });
  }
};

