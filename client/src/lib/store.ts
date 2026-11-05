import {
  User,
  StudentProfile,
  JobOpportunity,
  Application,
  ApplicationStatus,
  ApplicationHistoryItem,
  Interview,
  PlacementDrive,
  NotificationItem,
  AuditLog,
  SkillResource,
  UserRole,
} from '../types';
import { api, getAuthToken, setAuthToken, clearAuthToken } from './api';

export const INITIAL_USER_STUDENT: User = {
  id: 'usr_student_adya',
  name: 'Adya Tripathi',
  email: 'adya.20253026@mnnit.ac.in',
  role: 'student',
  studentId: '20253026',
  organization: 'Motilal Nehru National Institute of Technology Allahabad',
};

export const INITIAL_USER_RECRUITER: User = {
  id: 'usr_recruiter_microsoft',
  name: 'Microsoft',
  email: 'microsoft@microsoft.com',
  role: 'recruiter',
  organization: 'Microsoft',
};

export const INITIAL_USER_ADMIN: User = {
  id: 'ace5b256-8177-4f44-b04b-0993e61f8c91',
  name: 'Directorate Central Administrator',
  email: 'admin@aarohan.edu',
  role: 'admin',
  organization: 'Office of Career Advancement & Placement',
};

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  id: 'stu_adya_tripathi',
  fullName: 'Adya Tripathi',
  email: 'adya.20253026@mnnit.ac.in',
  phone: '+91-9580367287',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  portfolioUrl: 'https://github.com/adya-tripathi',
  githubUrl: 'https://github.com/adya-tripathi',
  linkedinUrl: 'https://linkedin.com/in/adya-tripathi-83425b394/',
  bio: 'B.Tech student in Computer Science and Engineering at Motilal Nehru National Institute of Technology Allahabad (MNNIT). Passionate about Machine Learning, Deep Learning, NLP, Data Structures & Algorithms, and AI Systems with proven experience developing real-time intelligence platforms.',
  institution: 'Motilal Nehru National Institute of Technology Allahabad',
  degree: 'Bachelor of Technology (B.Tech)',
  branch: 'Computer Science & Engineering',
  currentSemester: 4,
  cgpa: 8.84,
  graduationYear: 2029,
  activeBacklogs: 0,
  skills: [
    'Python',
    'Java',
    'C',
    'Data Structures & Algorithms',
    'Machine Learning',
    'Deep Learning',
    'NLP',
    'Scikit-learn',
    'TensorFlow',
    'Keras',
    'NumPy',
    'Pandas',
    'Matplotlib',
    'Seaborn',
    'Git',
    'GitHub',
    'VS Code',
    'Streamlit',
    'Jupyter Notebook',
    'SQL',
    'FastAPI',
    'Docker',
    'REST APIs',
    'Algorithms',
    'React',
    'TypeScript',
  ],
  projects: [
    {
      id: 'proj_nagar_drishti',
      title: 'Nagar-Drishti — Smart Urban Traffic Intelligence System',
      description: 'AI-driven urban traffic intelligence system analyzing multi-camera vehicle movement data for congestion monitoring, trajectory analysis, anomaly alerts using Isolation Forest & DBSCAN, and traffic forecasting via Random Forest and Markov chains.',
      techStack: ['Python', 'Scikit-learn', 'Pandas', 'NumPy', 'Streamlit'],
      projectUrl: 'https://github.com/adya-tripathi/nagar-drishti',
      githubUrl: 'https://github.com/adya-tripathi/nagar-drishti',
    },
    {
      id: 'proj_jan_saarthi',
      title: 'Jan Saarthi AI — Government Opportunity Recommendation Platform',
      description: 'Centralized civic platform discovering government scholarships, jobs, internships, and welfare schemes. Features profile-based ML recommendation pipelines, Scikit-learn filtering models, and Random Forest probability classifiers with rule-based eligibility verification.',
      techStack: ['Python', 'Scikit-learn', 'Pandas', 'NumPy', 'NLP'],
      projectUrl: 'https://github.com/adya-tripathi/jan-saarthi-ai',
      githubUrl: 'https://github.com/adya-tripathi/jan-saarthi-ai',
    },
    {
      id: 'proj_microguard',
      title: 'MicroGuard — Real-Time Anomaly Detection from Scratch',
      description: 'Lightweight real-time anomaly detection system for IoT environments with strict memory constraints. Implemented Multivariate Gaussian model from scratch with incremental streaming pipeline and deployed interactive Streamlit monitoring dashboard.',
      techStack: ['Python', 'NumPy', 'Pandas', 'Streamlit'],
      projectUrl: 'https://github.com/adya-tripathi/microguard',
      githubUrl: 'https://github.com/adya-tripathi/microguard',
    },
    {
      id: 'proj_health_insurance',
      title: 'Health Insurance Premium Predictor',
      description: 'End-to-end machine learning system estimating healthcare premiums using demographic and lifestyle features. Evaluated Linear Regression, Decision Tree, and Random Forest models optimized via cross-validation and GridSearchCV.',
      techStack: ['Python', 'Scikit-Learn', 'NumPy', 'Pandas', 'Matplotlib', 'Seaborn', 'Streamlit'],
      projectUrl: 'https://github.com/adya-tripathi/insurance-predictor',
      githubUrl: 'https://github.com/adya-tripathi/insurance-predictor',
    },
  ],
  experience: [
    {
      id: 'exp_mnnit_lead',
      position: 'Machine Learning Researcher & Project Lead',
      organization: 'MNNIT Allahabad AI & Intelligent Systems Group',
      startDate: 'January 2026',
      endDate: 'Present',
      description: 'Spearheaded predictive ML pipelines, geospatial traffic telemetry analytics, and custom anomaly detection models for campus and smart-city research.',
    },
    {
      id: 'exp_open_source',
      position: 'Open Source Software Contributor',
      organization: 'AI & Data Science Community',
      startDate: 'June 2025',
      endDate: 'December 2025',
      description: 'Contributed modular machine learning utilities, unsupervised anomaly scoring implementations, and responsive Streamlit UI components.',
    },
  ],
  resume: {
    fileName: 'NIT_Allahabad_Resume_Adya_Tripathi.pdf',
    fileSize: '320 KB',
    uploadedAt: '2026-10-31 16:30',
    parsingStatus: 'completed',
    parsedSkills: [
      'Python',
      'Java',
      'C',
      'Data Structures & Algorithms',
      'Machine Learning',
      'Deep Learning',
      'NLP',
      'Scikit-learn',
      'TensorFlow',
      'Keras',
      'NumPy',
      'Pandas',
      'Matplotlib',
      'Seaborn',
      'Git',
      'Streamlit',
      'SQL',
    ],
    parsedEducation: 'B.Tech in Computer Science and Engineering, Motilal Nehru National Institute of Technology Allahabad (MNNIT) (CGPA: 8.84, Roll No: 20253026, 2025-2029)',
    parsedProjects: [
      'Nagar-Drishti — Smart Urban Traffic Intelligence System (Python, Scikit-learn, Pandas)',
      'Jan Saarthi AI — Government Opportunity Recommendation Platform (Scikit-learn, NLP)',
      'MicroGuard — Real-Time Anomaly Detection from Scratch (NumPy, Streamlit)',
      'Health Insurance Premium Predictor (Scikit-Learn, Streamlit)',
    ],
    parsedExperience: 'Machine Learning Researcher & Project Lead at MNNIT Allahabad AI & Intelligent Systems Group; Open Source Software Contributor',
  },
};

export const INITIAL_JOBS: JobOpportunity[] = [
  {
    id: 'job_apex_sde',
    title: 'Software Development Engineer I',
    company: 'Apex Systems',
    companyInitials: 'AS',
    location: 'Cambridge, MA',
    workArrangement: 'Hybrid',
    employmentType: 'Full-time',
    deadline: '2026-11-28',
    publishedDate: '2026-10-18',
    salaryRange: '$115,000 – $130,000 / yr',
    description: 'Join the Core Platform group engineering low-latency distributed transaction systems, developer platforms, and high-availability cloud APIs.',
    responsibilities: [
      'Design, implement, and maintain scalable web services and asynchronous event pipelines.',
      'Collaborate across cross-functional engineering teams adhering to rigorous code review and CI/CD standards.',
      'Participate in architectural reviews, incident retrospectives, and performance profiling.',
    ],
    requiredQualifications: [
      'Graduating senior in Computer Science, Software Engineering, or related technical field.',
      'Demonstrated fluency in typed languages (TypeScript, Java, C++, or Go).',
      'Solid foundations in data structures, algorithms, and relational database systems.',
    ],
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'SQL', 'Git'],
    preferredSkills: ['Docker', 'AWS', 'PostgreSQL', 'REST APIs'],
    eligibleBranches: ['Computer Science & Engineering', 'Information Technology', 'Electrical & Computer Engineering'],
    eligibleGradYears: [2026, 2027, 2028, 2029],
    minCgpa: 8.0,
    maxBacklogs: 0,
    applicantsCount: 42,
    shortlistedCount: 8,
    status: 'Active',
    recruiterId: 'usr_recruiter_1',
    recruiterName: 'Marcus Vance',
    recruiterEmail: 'm.vance@apexsystems.com',
  },
  {
    id: 'job_veritas_cloud',
    title: 'Cloud Infrastructure & DevOps Engineer',
    company: 'Veritas Technologies',
    companyInitials: 'VT',
    location: 'New York, NY',
    workArrangement: 'Hybrid',
    employmentType: 'Full-time',
    deadline: '2026-12-05',
    publishedDate: '2026-10-22',
    salaryRange: '$120,000 – $135,000 / yr',
    description: 'Build and operate high-reliability automated Kubernetes clusters, multi-region observability stacks, and infrastructure-as-code automation.',
    responsibilities: [
      'Maintain automated deployment pipelines across hybrid multi-region cloud infrastructures.',
      'Instrument telemetry, SLA monitors, and real-time incident alerting.',
      'Harden container images and audit security policies across runtime clusters.',
    ],
    requiredQualifications: [
      'Undergraduate or graduate degree in Computer Science, Systems Engineering, or equivalent.',
      'Practical familiarity with Linux systems internals, container runtimes, and networking.',
    ],
    requiredSkills: ['Docker', 'AWS', 'Python', 'Git', 'Linux'],
    preferredSkills: ['Kubernetes', 'CI/CD', 'TypeScript', 'SQL'],
    eligibleBranches: ['Computer Science & Engineering', 'Information Technology'],
    eligibleGradYears: [2026, 2027, 2028, 2029],
    minCgpa: 7.5,
    maxBacklogs: 0,
    applicantsCount: 28,
    shortlistedCount: 5,
    status: 'Active',
    recruiterId: 'usr_recruiter_vt',
    recruiterName: 'Sarah Lin',
    recruiterEmail: 's.lin@veritas.tech',
  },
  {
    id: 'job_crest_robotics',
    title: 'Embedded Systems & Firmware Engineer',
    company: 'Crest Robotics',
    companyInitials: 'CR',
    location: 'Pittsburgh, PA',
    workArrangement: 'On-site',
    employmentType: 'Full-time',
    deadline: '2026-11-25',
    publishedDate: '2026-10-14',
    salaryRange: '$105,000 – $120,000 / yr',
    description: 'Develop deterministic real-time firmware, motor controller drivers, and sensor communication protocols for next-generation automated warehouse robotics.',
    responsibilities: [
      'Author safety-critical C/C++ firmware running on ARM Cortex microcontrollers and RTOS.',
      'Interface with hardware sensors over CAN, SPI, I2C, and UART buses.',
      'Perform hardware-in-the-loop (HIL) validation and thermal stress testing.',
    ],
    requiredQualifications: [
      'Degree in Electrical Engineering, Robotics, Computer Engineering, or Mechatronics.',
      'Proficiency with C/C++, oscilloscope debugging, and microcontroller peripheral configuration.',
    ],
    requiredSkills: ['C++', 'Algorithms', 'Git'],
    preferredSkills: ['Python', 'Docker', 'Linux'],
    eligibleBranches: ['Electrical & Computer Engineering', 'Mechanical Engineering', 'Robotics Engineering'],
    eligibleGradYears: [2026, 2027, 2028, 2029],
    minCgpa: 7.8,
    maxBacklogs: 0,
    applicantsCount: 19,
    shortlistedCount: 4,
    status: 'Active',
    recruiterId: 'usr_recruiter_cr',
    recruiterName: 'Dave Kowalski',
    recruiterEmail: 'dkowalski@crestrobotics.com',
  },
  {
    id: 'job_meridian_data',
    title: 'Healthcare Informatics & Data Analyst',
    company: 'Meridian Health Informatics',
    companyInitials: 'MH',
    location: 'Chicago, IL',
    workArrangement: 'Remote',
    employmentType: 'Full-time',
    deadline: '2026-12-10',
    publishedDate: '2026-10-26',
    salaryRange: '$95,000 – $110,000 / yr',
    description: 'Transform longitudinal clinical registries, patient outcomes, and epidemiology datasets into validated statistical insights and executive reporting models.',
    responsibilities: [
      'Write robust SQL queries and ETL transformations against relational data warehouses.',
      'Collaborate with bioinformaticians and clinicians to validate analytical assumptions.',
      'Construct reproducible data pipelines adhering to HIPAA compliance standards.',
    ],
    requiredQualifications: [
      'Degree in Computer Science, Data Science, Biomedical Informatics, or Mathematics.',
      'Experience with SQL database querying and Python statistical modeling.',
    ],
    requiredSkills: ['SQL', 'Python', 'Data Analysis', 'REST APIs'],
    preferredSkills: ['PostgreSQL', 'Docker', 'Git'],
    eligibleBranches: ['Computer Science & Engineering', 'Information Technology', 'Biomedical Engineering', 'Data Science'],
    eligibleGradYears: [2026, 2027, 2028, 2029],
    minCgpa: 7.2,
    maxBacklogs: 1,
    applicantsCount: 31,
    shortlistedCount: 6,
    status: 'Active',
    recruiterId: 'usr_recruiter_mh',
    recruiterName: 'Elena Rostova',
    recruiterEmail: 'erostova@meridianhealth.org',
  },
  {
    id: 'job_horizon_ai',
    title: 'Machine Learning Research Engineer',
    company: 'Horizon AI Labs',
    companyInitials: 'HA',
    location: 'San Francisco, CA',
    workArrangement: 'Hybrid',
    employmentType: 'Full-time',
    deadline: '2026-12-01',
    publishedDate: '2026-10-20',
    salaryRange: '$140,000 – $165,000 / yr',
    description: 'Advance foundational model evaluation pipelines, multimodal embedding distillation, and real-time inferencing kernels on heterogeneous accelerators.',
    responsibilities: [
      'Implement evaluation benchmarks measuring reasoning fidelity, calibration, and latency.',
      'Profile memory bandwidth bottlenecks and execute distributed tensor parallelism.',
      'Convert novel research findings into production-grade modular inference APIs.',
    ],
    requiredQualifications: [
      'BS/MS in Computer Science, Artificial Intelligence, or Mathematics.',
      'Demonstrated research or project experience with PyTorch and deep learning architectures.',
    ],
    requiredSkills: ['Python', 'Machine Learning', 'Algorithms', 'Git'],
    preferredSkills: ['Docker', 'C++', 'SQL'],
    eligibleBranches: ['Computer Science & Engineering', 'Data Science', 'Electrical & Computer Engineering'],
    eligibleGradYears: [2026, 2027, 2028, 2029],
    minCgpa: 8.5,
    maxBacklogs: 0,
    applicantsCount: 56,
    shortlistedCount: 7,
    status: 'Active',
    recruiterId: 'usr_recruiter_ha',
    recruiterName: 'Dr. Kenji Sato',
    recruiterEmail: 'kenji@horizonlabs.ai',
  },
  {
    id: 'job_aurora_frontend',
    title: 'Frontend Systems Engineer',
    company: 'Aurora FinTech',
    companyInitials: 'AF',
    location: 'New York, NY',
    workArrangement: 'On-site',
    employmentType: 'Full-time',
    deadline: '2026-11-22',
    publishedDate: '2026-10-12',
    salaryRange: '$118,000 – $132,000 / yr',
    description: 'Craft ultra-fast real-time trading terminal interfaces, complex institutional order books, and accessible design system components.',
    responsibilities: [
      'Build responsive, zero-jank React client applications with WebSocket streaming feeds.',
      'Maintain an institutional design system ensuring WCAG AAA accessibility compliance.',
      'Write end-to-end integration tests and benchmark Web Vitals metrics.',
    ],
    requiredQualifications: [
      'Degree in Computer Science or related degree graduating in 2026-2029.',
      'Extensive mastery of modern JavaScript, TypeScript, and modern CSS frameworks.',
    ],
    requiredSkills: ['React', 'TypeScript', 'REST APIs', 'Git'],
    preferredSkills: ['SQL', 'Figma', 'Node.js'],
    eligibleBranches: ['Computer Science & Engineering', 'Information Technology'],
    eligibleGradYears: [2026, 2027, 2028, 2029],
    minCgpa: 7.8,
    maxBacklogs: 0,
    applicantsCount: 38,
    shortlistedCount: 9,
    status: 'Active',
    recruiterId: 'usr_recruiter_af',
    recruiterName: 'Chloe Bennett',
    recruiterEmail: 'cbennett@aurorafintech.com',
  },
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app_1',
    jobId: 'job_horizon_ai',
    jobTitle: 'Machine Learning Research Engineer',
    company: 'Horizon AI Labs',
    studentId: 'stu_adya_tripathi',
    studentName: 'Adya Tripathi',
    studentEmail: 'adya.20253026@mnnit.ac.in',
    studentBranch: 'Computer Science & Engineering',
    studentCgpa: 8.84,
    studentGradYear: 2029,
    appliedDate: '2026-10-24',
    status: 'Interview Scheduled',
    latestUpdateDate: '2026-10-30',
    matchScore: 96,
    recruiterNotes: 'Exceptional deep learning and ML architecture profile. Nagar-Drishti and Jan Saarthi AI demonstrate practical, end-to-end intelligence platform engineering with Scikit-learn and Streamlit.',
    history: [
      { stage: 'Applied', date: '2026-10-24', note: 'Application dossier submitted via Aarohan portal.' },
      { stage: 'Under Review', date: '2026-10-27', note: 'AI Research recruitment committee screened resume and MNNIT academic records.' },
      { stage: 'Shortlisted', date: '2026-10-29', note: 'Candidate shortlisted for technical round.' },
      { stage: 'Interview Scheduled', date: '2026-10-30', note: 'Round 1: Machine Learning Systems & Deep Learning Modeling confirmed.' },
    ],
  },
  {
    id: 'app_2',
    jobId: 'job_apex_sde',
    jobTitle: 'Software Development Engineer I',
    company: 'Apex Systems',
    studentId: 'stu_adya_tripathi',
    studentName: 'Adya Tripathi',
    studentEmail: 'adya.20253026@mnnit.ac.in',
    studentBranch: 'Computer Science & Engineering',
    studentCgpa: 8.84,
    studentGradYear: 2029,
    appliedDate: '2026-10-21',
    status: 'Interview Scheduled',
    latestUpdateDate: '2026-10-28',
    matchScore: 92,
    recruiterNotes: 'Strong computer science foundation, algorithms, and clean system design displayed in Nagar-Drishti and MicroGuard projects.',
    history: [
      { stage: 'Applied', date: '2026-10-21', note: 'Application submitted.' },
      { stage: 'Under Review', date: '2026-10-24', note: 'Profile and code samples reviewed.' },
      { stage: 'Shortlisted', date: '2026-10-26', note: 'Shortlisted for core technical round.' },
      { stage: 'Interview Scheduled', date: '2026-10-28', note: 'Round 1: Data Structures, Algorithms & System Concurrency confirmed.' },
    ],
  },
  {
    id: 'app_3',
    jobId: 'job_veritas_cloud',
    jobTitle: 'Cloud Infrastructure & DevOps Engineer',
    company: 'Veritas Technologies',
    studentId: 'stu_adya_tripathi',
    studentName: 'Adya Tripathi',
    studentEmail: 'adya.20253026@mnnit.ac.in',
    studentBranch: 'Computer Science & Engineering',
    studentCgpa: 8.84,
    studentGradYear: 2029,
    appliedDate: '2026-10-25',
    status: 'Under Review',
    latestUpdateDate: '2026-10-28',
    matchScore: 84,
    recruiterNotes: 'Reviewing systems streaming and container fundamentals.',
    history: [
      { stage: 'Applied', date: '2026-10-25', note: 'Application dossier received.' },
      { stage: 'Under Review', date: '2026-10-28', note: 'Department recruitment committee evaluating credentials.' },
    ],
  },
  {
    id: 'app_4',
    jobId: 'job_meridian_data',
    jobTitle: 'Healthcare Informatics & Data Analyst',
    company: 'Meridian Health Informatics',
    studentId: 'stu_adya_tripathi',
    studentName: 'Adya Tripathi',
    studentEmail: 'adya.20253026@mnnit.ac.in',
    studentBranch: 'Computer Science & Engineering',
    studentCgpa: 8.84,
    studentGradYear: 2029,
    appliedDate: '2026-10-28',
    status: 'Applied',
    latestUpdateDate: '2026-10-28',
    matchScore: 89,
    history: [
      { stage: 'Applied', date: '2026-10-28', note: 'Submission confirmed. Awaiting committee review.' },
    ],
  },
  // Additional student applicants for recruiter review workflow
  {
    id: 'app_recruiter_demo_1',
    jobId: 'job_apex_sde',
    jobTitle: 'Software Development Engineer I',
    company: 'Apex Systems',
    studentId: 'stu_adya_tripathi',
    studentName: 'Adya Tripathi',
    studentEmail: 'adya.20253026@mnnit.ac.in',
    studentBranch: 'Computer Science & Engineering',
    studentCgpa: 9.30,
    studentGradYear: 2026,
    appliedDate: '2026-10-20',
    status: 'Shortlisted',
    latestUpdateDate: '2026-10-26',
    matchScore: 94,
    recruiterNotes: 'Top 3% class rank. Strong competitive programming track record.',
    history: [
      { stage: 'Applied', date: '2026-10-20' },
      { stage: 'Under Review', date: '2026-10-22' },
      { stage: 'Shortlisted', date: '2026-10-26' },
    ],
  },
  {
    id: 'app_recruiter_demo_2',
    jobId: 'job_apex_sde',
    jobTitle: 'Software Development Engineer I',
    company: 'Apex Systems',
    studentId: 'stu_priya_nair',
    studentName: 'Priya Nair',
    studentEmail: 'priya.nair@campus.edu',
    studentBranch: 'Information Technology',
    studentCgpa: 8.42,
    studentGradYear: 2026,
    appliedDate: '2026-10-21',
    status: 'Under Review',
    latestUpdateDate: '2026-10-24',
    matchScore: 82,
    history: [
      { stage: 'Applied', date: '2026-10-21' },
      { stage: 'Under Review', date: '2026-10-24' },
    ],
  },
  {
    id: 'app_recruiter_demo_3',
    jobId: 'job_apex_sde',
    jobTitle: 'Software Development Engineer I',
    company: 'Apex Systems',
    studentId: 'stu_lucas_mendez',
    studentName: 'Lucas Mendez',
    studentEmail: 'lucas.mendez@campus.edu',
    studentBranch: 'Electrical & Computer Engineering',
    studentCgpa: 7.91,
    studentGradYear: 2026,
    appliedDate: '2026-10-22',
    status: 'Applied',
    latestUpdateDate: '2026-10-22',
    matchScore: 68,
    history: [
      { stage: 'Applied', date: '2026-10-22' },
    ],
  },
];

export const INITIAL_INTERVIEWS: Interview[] = [
  {
    id: 'int_1',
    applicationId: 'app_1',
    jobId: 'job_horizon_ai',
    jobTitle: 'Machine Learning Research Engineer',
    company: 'Horizon AI Labs',
    studentId: 'stu_adya_tripathi',
    studentName: 'Adya Tripathi',
    studentEmail: 'adya.20253026@mnnit.ac.in',
    round: 'Round 1: Machine Learning Systems & Deep Learning Modeling',
    date: '2026-11-06',
    startTime: '02:00 PM',
    endTime: '03:15 PM',
    timezone: 'IST',
    mode: 'Video Call',
    locationOrLink: 'https://meet.google.com/aar-ml-eng-2026',
    status: 'Scheduled',
    notes: 'Please be prepared to walk through your Nagar-Drishti and Jan Saarthi AI pipelines and discuss custom anomaly scoring algorithms.',
  },
  {
    id: 'int_2',
    applicationId: 'app_2',
    jobId: 'job_apex_sde',
    jobTitle: 'Software Development Engineer I',
    company: 'Apex Systems',
    studentId: 'stu_adya_tripathi',
    studentName: 'Adya Tripathi',
    studentEmail: 'adya.20253026@mnnit.ac.in',
    round: 'Round 1: Data Structures, Algorithms & System Concurrency',
    date: '2026-11-10',
    startTime: '11:00 AM',
    endTime: '12:15 PM',
    timezone: 'IST',
    mode: 'Video Call',
    locationOrLink: 'https://meet.apexsystems.com/aarohan-adya-interview',
    status: 'Scheduled',
    notes: 'Live coding on dynamic programming and data structure optimization, followed by MicroGuard streaming architecture discussion.',
  },
];

export const INITIAL_DRIVES: PlacementDrive[] = [
  {
    id: 'drv_autumn_2026',
    name: 'Autumn Technology & Engineering Placement Drive 2026',
    companies: ['Apex Systems', 'Veritas Technologies', 'Aurora FinTech', 'Horizon AI Labs'],
    jobOpeningsCount: 14,
    registrationDeadline: '2026-11-15',
    eventStartDate: '2026-11-20',
    eventEndDate: '2026-12-05',
    rounds: ['Online Assessment', 'Technical Round 1', 'Systems Architecture', 'HR & Dean Briefing'],
    eligibleBranches: ['Computer Science & Engineering', 'Information Technology', 'Electrical & Computer Engineering', 'Data Science'],
    minCgpa: 7.5,
    status: 'Active',
    description: 'Premier annual campus recruitment drive organized by the Central Placement Directorate for graduating engineering seniors.',
  },
  {
    id: 'drv_health_informatics_2026',
    name: 'Interdisciplinary Health & Bio-Informatics Recruitment Initiative',
    companies: ['Meridian Health Informatics', 'BioCompute Research'],
    jobOpeningsCount: 6,
    registrationDeadline: '2026-11-30',
    eventStartDate: '2026-12-06',
    eventEndDate: '2026-12-14',
    rounds: ['Domain Assessment', 'Panel Interview'],
    eligibleBranches: ['Biomedical Engineering', 'Computer Science & Engineering', 'Data Science'],
    minCgpa: 7.2,
    status: 'Active',
    description: 'Specialized hiring consortium connecting quantitative and engineering students with leading research and clinical hospital systems.',
  },
  {
    id: 'drv_spring_hardware_2027',
    name: 'Spring Robotics & Hardware Systems Drive',
    companies: ['Crest Robotics', 'Apex Hardware Labs'],
    jobOpeningsCount: 8,
    registrationDeadline: '2027-01-15',
    eventStartDate: '2027-02-01',
    eventEndDate: '2027-02-15',
    rounds: ['Hardware Schematic Test', 'Firmware Live Coding', 'On-campus Lab Assessment'],
    eligibleBranches: ['Electrical & Computer Engineering', 'Mechanical Engineering', 'Robotics Engineering'],
    minCgpa: 7.8,
    status: 'Draft',
    description: 'Targeted drive for embedded systems, autonomous robotics, and mechatronics engineers.',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    userId: 'usr_student_adya',
    title: 'Round 1 AI Research Interview Confirmed',
    message: 'Horizon AI Labs has confirmed your Technical Architecture & Deep Learning interview for November 6, 2026 at 02:00 PM IST.',
    category: 'interview',
    read: false,
    timestamp: '2026-10-31 16:45',
    link: '/student/interviews',
  },
  {
    id: 'notif_2',
    userId: 'usr_student_adya',
    title: 'Core Systems Interview Scheduled',
    message: 'Apex Systems has scheduled your Data Structures, Algorithms & System Concurrency interview for November 10, 2026 at 11:00 AM IST.',
    category: 'interview',
    read: false,
    timestamp: '2026-10-31 16:40',
    link: '/student/interviews',
  },
  {
    id: 'notif_3',
    userId: 'usr_student_adya',
    title: 'Autumn Placement Drive Registration Open',
    message: 'Registration is now open for the Autumn Technology & Engineering Placement Drive 2026. MNNIT Allahabad B.Tech CSE cohort is verified eligible.',
    category: 'drive',
    read: true,
    timestamp: '2026-10-30 09:00',
    link: '/opportunities',
  },
  {
    id: 'notif_4',
    userId: 'usr_student_adya',
    title: 'Resume Parsing Completed',
    message: 'Your official resume NIT_Allahabad_Resume_Adya_Tripathi.pdf was successfully parsed with 17 technical skills and 4 projects verified.',
    category: 'system',
    read: true,
    timestamp: '2026-10-31 16:30',
    link: '/student/resume',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud_1',
    timestamp: '2026-10-31 16:45',
    actor: 'Dr. Kenji Sato',
    actorRole: 'recruiter',
    action: 'SCHEDULE_INTERVIEW',
    entity: 'Application app_1 (Adya Tripathi)',
    summary: 'Scheduled Round 1 Machine Learning Systems & Deep Learning Modeling interview for 2026-11-06.',
  },
  {
    id: 'aud_2',
    timestamp: '2026-10-31 16:40',
    actor: 'Marcus Vance',
    actorRole: 'recruiter',
    action: 'SCHEDULE_INTERVIEW',
    entity: 'Application app_2 (Adya Tripathi)',
    summary: 'Scheduled Round 1 Data Structures, Algorithms & System Concurrency interview for 2026-11-10.',
  },
  {
    id: 'aud_3',
    timestamp: '2026-10-29 14:00',
    actor: 'Dr. Eleanor Hayes',
    actorRole: 'admin',
    action: 'PUBLISH_DRIVE',
    entity: 'Placement Drive drv_autumn_2026',
    summary: 'Approved and published Autumn Technology & Engineering Placement Drive 2026.',
  },
  {
    id: 'aud_4',
    timestamp: '2026-10-20 09:45',
    actor: 'Marcus Vance',
    actorRole: 'recruiter',
    action: 'CREATE_JOB',
    entity: 'Job job_apex_sde (Software Development Engineer I)',
    summary: 'Created and published new campus vacancy with 8.0 CGPA requirement.',
  },
  {
    id: 'aud_5',
    timestamp: '2026-10-15 14:00',
    actor: 'Dr. Eleanor Hayes',
    actorRole: 'admin',
    action: 'VERIFY_RECRUITER',
    entity: 'Recruiter Marcus Vance (Apex Systems)',
    summary: 'Verified institutional employer credentials and approved campus recruiter access.',
  },
];

export const INITIAL_SKILL_RESOURCES: SkillResource[] = [
  {
    id: 'res_1',
    title: 'Distributed Systems & Microservice Architecture',
    provider: 'MIT OpenCourseWare (6.824)',
    relevantSkill: 'Docker',
    resourceType: 'Course',
    duration: '14 Lectures (Self-Paced)',
    url: 'https://ocw.mit.edu',
    isSaved: true,
  },
  {
    id: 'res_2',
    title: 'Designing Data-Intensive Applications Core Principles',
    provider: 'University Career Library',
    relevantSkill: 'PostgreSQL',
    resourceType: 'Documentation',
    duration: '6 Modules',
    url: 'https://library.campus.edu',
    isSaved: false,
  },
  {
    id: 'res_3',
    title: 'Production Kubernetes Cluster Management Fundamentals',
    provider: 'Cloud Native Computing Foundation (CNCF)',
    relevantSkill: 'Docker',
    resourceType: 'Tutorial',
    duration: '4 Hours',
    url: 'https://cncf.io',
    isSaved: false,
  },
  {
    id: 'res_4',
    title: 'High-Performance Graph APIs with GraphQL',
    provider: 'GraphQL Foundation Training',
    relevantSkill: 'REST APIs',
    resourceType: 'Practice',
    duration: '3 Hours',
    url: 'https://graphql.org',
    isSaved: true,
  },
  {
    id: 'res_5',
    title: 'Advanced System Design & Concurrency Patterns',
    provider: 'Association for Computing Machinery (ACM)',
    relevantSkill: 'Algorithms',
    resourceType: 'Course',
    duration: '8 Modules',
    url: 'https://acm.org',
    isSaved: false,
  },
];

// In-memory + LocalStorage reactive state store
class CampusStore {
  private currentUser: User = INITIAL_USER_STUDENT;
  private studentProfile: StudentProfile = INITIAL_STUDENT_PROFILE;
  private jobs: JobOpportunity[] = INITIAL_JOBS;
  private applications: Application[] = INITIAL_APPLICATIONS;
  private interviews: Interview[] = INITIAL_INTERVIEWS;
  private drives: PlacementDrive[] = INITIAL_DRIVES;
  private notifications: NotificationItem[] = INITIAL_NOTIFICATIONS;
  private auditLogs: AuditLog[] = INITIAL_AUDIT_LOGS;
  private skillResources: SkillResource[] = INITIAL_SKILL_RESOURCES;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      const data = {
        version: 3,
        currentUser: this.currentUser,
        studentProfile: this.studentProfile,
        jobs: this.jobs,
        applications: this.applications,
        interviews: this.interviews,
        drives: this.drives,
        notifications: this.notifications,
        auditLogs: this.auditLogs,
        skillResources: this.skillResources,
      };
      localStorage.setItem('aarohan_state', JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('aarohan_state') || localStorage.getItem('campuslink_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        // If stored state is from previous dummy student "Aditi Rao" or older version, reset to Adya Tripathi
        if (
          !parsed.version ||
          parsed.version < 3 ||
          parsed.currentUser?.name === 'Aditi Rao' ||
          parsed.studentProfile?.fullName === 'Aditi Rao' ||
          parsed.studentProfile?.id === 'stu_aditi_rao'
        ) {
          this.currentUser = INITIAL_USER_STUDENT;
          this.studentProfile = INITIAL_STUDENT_PROFILE;
          this.jobs = INITIAL_JOBS;
          this.applications = INITIAL_APPLICATIONS;
          this.interviews = INITIAL_INTERVIEWS;
          this.drives = INITIAL_DRIVES;
          this.notifications = INITIAL_NOTIFICATIONS;
          this.auditLogs = INITIAL_AUDIT_LOGS;
          this.skillResources = INITIAL_SKILL_RESOURCES;
          this.saveToStorage();
          return;
        }

        if (parsed.currentUser) this.currentUser = parsed.currentUser;
        if (parsed.studentProfile) this.studentProfile = parsed.studentProfile;
        if (parsed.jobs) this.jobs = parsed.jobs;
        if (parsed.applications) this.applications = parsed.applications;
        if (parsed.interviews) this.interviews = parsed.interviews;
        if (parsed.drives) this.drives = parsed.drives;
        if (parsed.notifications) this.notifications = parsed.notifications;
        if (parsed.auditLogs) this.auditLogs = parsed.auditLogs;
        if (parsed.skillResources) this.skillResources = parsed.skillResources;
      }
    } catch {
      // fallback to initial
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach(fn => fn());
  }

  // Getters
  public getCurrentUser(): User {
    return this.currentUser;
  }
  public getStudentProfile(): StudentProfile {
    return this.studentProfile;
  }
  public getJobs(): JobOpportunity[] {
    return this.jobs;
  }
  public getApplications(): Application[] {
    return this.applications;
  }
  public getInterviews(): Interview[] {
    return this.interviews;
  }
  public getDrives(): PlacementDrive[] {
    return this.drives;
  }
  public getNotifications(): NotificationItem[] {
    return this.notifications;
  }
  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }
  public getSkillResources(): SkillResource[] {
    return this.skillResources;
  }

  // Set User Role / Identity
  public async switchRole(role: UserRole) {
    if (role === 'student') {
      this.currentUser = INITIAL_USER_STUDENT;
      try {
        const res = await api.auth.login({ email: 'adya.20253026@mnnit.ac.in', password: 'paswoerd12345' });
        if (res && res.token) {
          this.setAuthSession({ id: res.id, name: res.name, email: res.email, role: 'student' }, res.token);
          await this.loadStudentPortalData();
        }
      } catch {
        // Fallback
      }
    } else if (role === 'recruiter') {
      this.currentUser = INITIAL_USER_RECRUITER;
      try {
        const res = await api.auth.login({ email: 'microsoft', password: 'password123' });
        if (res && res.token) {
          this.setAuthSession({ id: res.id, name: res.name, email: res.email, role: 'recruiter', organization: 'Microsoft' }, res.token);
          await this.loadRecruiterPortalData();
        }
      } catch {
        // Fallback
      }
    } else if (role === 'admin') {
      this.currentUser = INITIAL_USER_ADMIN;
      try {
        const res = await api.auth.login({ email: 'admin@aarohan.edu', password: 'Password@123' });
        if (res && res.token) {
          this.setAuthSession({ id: res.id, name: res.name, email: res.email, role: 'admin' }, res.token);
        }
      } catch {
        // Fallback
      }
    }
    this.notify();
  }

  // Authentication & Session Management
  public setAuthSession(user: Partial<User> & { role: UserRole }, token?: string) {
    if (token) {
      setAuthToken(token, user.role);
    }

    let base = INITIAL_USER_STUDENT;
    if (user.role === 'recruiter') base = INITIAL_USER_RECRUITER;
    else if (user.role === 'admin') base = INITIAL_USER_ADMIN;

    const org = user.organization || (user.role === 'recruiter' ? user.name || base.organization : base.organization);

    this.currentUser = {
      ...base,
      ...user,
      id: user.id || base.id,
      name: user.name || base.name,
      email: user.email || base.email,
      role: user.role,
      organization: org,
    };

    if (user.role === 'student') {
      this.studentProfile = {
        ...this.studentProfile,
        fullName: user.name || this.studentProfile.fullName,
        email: user.email || this.studentProfile.email,
      };
    }

    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      'AUTH_LOGIN',
      `Session ${this.currentUser.email}`,
      'Authenticated successfully into portal session.'
    );

    this.notify();
  }

  public clearAuthSession() {
    clearAuthToken();
    this.currentUser = INITIAL_USER_STUDENT;
    this.notify();
  }

  public async checkAuthSession(): Promise<User | null> {
    const token = getAuthToken();
    if (token) {
      try {
        const me = await api.auth.getMe();
        if (me && me.role) {
          this.setAuthSession({
            id: me.id,
            name: me.name,
            email: me.email,
            role: me.role as UserRole,
          }, token);
          return this.currentUser;
        }
      } catch {
        clearAuthToken();
      }
    }

    // Auto-authenticate default demo session based on portal route
    try {
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      let qEmail = 'adya.20253026@mnnit.ac.in';
      let qPass = 'paswoerd12345';
      let qRole: UserRole = 'student';

      if (path.startsWith('/recruiter')) {
        qEmail = 'microsoft';
        qPass = 'password123';
        qRole = 'recruiter';
      } else if (path.startsWith('/admin')) {
        qEmail = 'admin@aarohan.edu';
        qPass = 'Password@123';
        qRole = 'admin';
      }

      const res = await api.auth.login({ email: qEmail, password: qPass });
      if (res && res.token) {
        this.setAuthSession({
          id: res.id,
          name: res.name,
          email: res.email,
          role: res.role as UserRole,
          organization: qRole === 'recruiter' ? 'Microsoft' : undefined,
        }, res.token);

        if (res.role === 'student') {
          await this.loadStudentPortalData();
        } else if (res.role === 'recruiter') {
          await this.loadRecruiterPortalData();
        }
        return this.currentUser;
      }
    } catch (e) {
      console.warn('Auto demo authentication failed:', e);
    }

    return null;
  }

  public login(user: Partial<User> & { role: UserRole }, token: string) {
    this.setAuthSession(user, token);
  }

  public logout() {
    this.clearAuthSession();
  }

  // Live Sync with Backend Server
  public syncStudentProfile(backendProfile: any) {
    if (!backendProfile) return;
    this.studentProfile = {
      ...this.studentProfile,
      id: backendProfile.id || this.studentProfile.id,
      fullName: backendProfile.name || this.studentProfile.fullName,
      email: backendProfile.email || this.studentProfile.email,
      branch: backendProfile.branch || this.studentProfile.branch,
      cgpa: typeof backendProfile.cgpa === 'number' ? backendProfile.cgpa : this.studentProfile.cgpa,
      graduationYear: backendProfile.graduation_year || this.studentProfile.graduationYear,
      activeBacklogs: typeof backendProfile.backlogs === 'number' ? backendProfile.backlogs : this.studentProfile.activeBacklogs,
      skills: Array.isArray(backendProfile.skills) && backendProfile.skills.length > 0 ? backendProfile.skills : this.studentProfile.skills,
      projects: Array.isArray(backendProfile.projects) && backendProfile.projects.length > 0 ? backendProfile.projects : this.studentProfile.projects,
      resume: backendProfile.resume_uploaded
        ? {
            fileName: backendProfile.resume_url ? backendProfile.resume_url.split('/').pop() || 'resume.pdf' : 'resume.pdf',
            fileSize: 'Uploaded PDF',
            uploadedAt: 'Verified by Directorate',
            parsingStatus: 'completed',
            parsedSkills: backendProfile.skills || [],
            parsedEducation: `${backendProfile.branch || 'Engineering'}, Class of ${backendProfile.graduation_year || 2027}`,
            parsedProjects: (backendProfile.projects || []).map((p: any) => typeof p === 'string' ? p : p.title || 'Project'),
            parsedExperience: 'Verified Experience',
          }
        : this.studentProfile.resume,
    };
    this.notify();
  }

  public syncJobs(backendJobs: any[]) {
    if (!Array.isArray(backendJobs) || backendJobs.length === 0) return;
    const mapped: JobOpportunity[] = backendJobs.map((j) => {
      const existing = this.jobs.find((orig) => orig.id === j.id);
      return {
        id: j.id,
        title: j.title || 'Software Engineer',
        company: j.company || 'Partner Enterprise',
        companyInitials: (j.company || 'PE').slice(0, 2).toUpperCase(),
        location: existing?.location || 'Campus / Multiple Locations',
        workArrangement: existing?.workArrangement || 'Hybrid',
        employmentType: existing?.employmentType || 'Full-time',
        deadline: j.deadline ? new Date(j.deadline).toISOString().split('T')[0] : '2026-12-31',
        publishedDate: j.created_at ? new Date(j.created_at).toISOString().split('T')[0] : '2026-09-01',
        salaryRange: existing?.salaryRange || 'Competitive',
        description: j.description || '',
        responsibilities: existing?.responsibilities || ['Develop technical solutions', 'Collaborate across teams'],
        requiredQualifications: existing?.requiredQualifications || [`Min CGPA ${j.min_cgpa || 7.0}`],
        requiredSkills: Array.isArray(j.required_skills) ? j.required_skills : [],
        preferredSkills: existing?.preferredSkills || [],
        eligibleBranches: Array.isArray(j.eligible_branches) ? j.eligible_branches : ['CSE', 'IT'],
        eligibleGradYears: [j.graduation_year || 2026],
        minCgpa: j.min_cgpa ?? 7.0,
        maxBacklogs: j.max_backlogs ?? 0,
        applicantsCount: j.applicant_count ?? existing?.applicantsCount ?? 0,
        shortlistedCount: existing?.shortlistedCount || 0,
        status: (j.status === 'open' ? 'Active' : 'Closed') as any,
        recruiterId: j.recruiter_id,
      };
    });

    this.jobs = mapped;
    this.notify();
  }

  public syncApplications(backendApps: any[]) {
    if (!Array.isArray(backendApps)) return;
    const mapped: Application[] = backendApps.map((a) => {
      const existing = this.applications.find((orig) => orig.id === a.id);
      const statusTitle: ApplicationStatus =
        a.status === 'interview_scheduled'
          ? 'Interview Scheduled'
          : a.status === 'shortlisted'
          ? 'Shortlisted'
          : a.status === 'selected'
          ? 'Selected'
          : a.status === 'rejected' || a.status === 'not_selected'
          ? 'Rejected'
          : a.status === 'withdrawn'
          ? 'Withdrawn'
          : 'Under Review';

      const updateDate = a.updated_at ? new Date(a.updated_at).toISOString().split('T')[0] : (existing?.latestUpdateDate || '2026-10-01');

      return {
        id: a.id,
        jobId: a.job_id || a.jobId,
        studentId: a.student_id || a.studentId || this.studentProfile.id,
        studentName: a.student?.name || this.studentProfile.fullName,
        studentEmail: a.student?.user?.email || this.studentProfile.email,
        studentBranch: a.student?.branch || this.studentProfile.branch,
        studentCgpa: a.student?.cgpa ?? this.studentProfile.cgpa,
        studentGradYear: a.student?.graduationYear ?? this.studentProfile.graduationYear,
        studentSkills: a.student?.skills || a.studentSkills || [],
        jobTitle: a.job?.title || a.job_title || existing?.jobTitle || 'Role Candidacy',
        company: a.job?.company || a.company || existing?.company || 'Enterprise',
        appliedDate: a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : (existing?.appliedDate || '2026-10-01'),
        status: statusTitle,
        matchScore: a.matchResult?.match_score ?? a.match_score ?? existing?.matchScore ?? 85,
        latestUpdateDate: updateDate,
        history: existing?.history || [
          {
            stage: statusTitle,
            date: updateDate,
            note: a.matchResult?.explanation || 'Status recorded in campus registry.',
          },
        ],
        recruiterNotes: a.notes || a.recruiterNotes,
        rejectionReason: a.rejectionReason,
      };
    });

    if (mapped.length > 0) {
      this.applications = mapped;
      this.notify();
    }
  }

  public syncInterviews(backendInterviews: any[]) {
    if (!Array.isArray(backendInterviews)) return;
    const mapped: Interview[] = backendInterviews.map((iv) => {
      const modeVal: 'Video Call' | 'In-person' | 'Phone' =
        iv.mode === 'on_campus' ? 'In-person' : 'Video Call';

      return {
        id: iv.id,
        applicationId: iv.application_id || iv.applicationId || '',
        jobId: iv.application?.job_id || iv.jobId || '',
        studentId: iv.student_id || iv.studentId || this.studentProfile.id,
        studentName: iv.student?.name || this.studentProfile.fullName,
        studentEmail: iv.student?.user?.email || this.studentProfile.email,
        jobTitle: iv.application?.job?.title || 'Technical Interview',
        company: iv.application?.job?.company || 'Partner Enterprise',
        round: 'Technical Assessment',
        date: iv.scheduled_at ? new Date(iv.scheduled_at).toISOString().split('T')[0] : '2026-11-15',
        startTime: iv.scheduled_at ? new Date(iv.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM',
        endTime: '11:00 AM',
        timezone: 'EST',
        mode: modeVal,
        locationOrLink: iv.location || 'Building 4, Placement Hall',
        status: 'Scheduled',
        notes: iv.notes,
      };
    });

    if (mapped.length > 0) {
      this.interviews = mapped;
      this.notify();
    }
  }

  public async loadStudentPortalData() {
    const token = getAuthToken();
    if (!token) return;

    try {
      const [prof, jobsRes, appsRes, ivRes] = await Promise.all([
        api.students.getMyProfile().catch(() => null),
        api.jobs.list({ open_only: true }).catch(() => null),
        api.applications.getMy().catch(() => null),
        api.interviews.getMy().catch(() => null),
      ]);

      if (prof) this.syncStudentProfile(prof);
      if (jobsRes && Array.isArray(jobsRes.jobs)) this.syncJobs(jobsRes.jobs);
      if (appsRes && Array.isArray(appsRes.applications)) this.syncApplications(appsRes.applications);
      if (ivRes && Array.isArray(ivRes.interviews)) this.syncInterviews(ivRes.interviews);
    } catch (e) {
      console.warn('loadStudentPortalData error:', e);
    }
  }

  public async loadRecruiterPortalData() {
    const token = getAuthToken();
    if (!token) return;

    try {
      const [jobsRes, ivRes] = await Promise.all([
        api.jobs.list({ open_only: false }).catch(() => null),
        api.interviews.getMy().catch(() => null),
      ]);

      if (jobsRes && Array.isArray(jobsRes.jobs)) {
        this.syncJobs(jobsRes.jobs);

        const currentRecruiterId = this.currentUser.id;
        const recruiterCompany = (this.currentUser.organization || this.currentUser.name || '').toLowerCase();

        const relevantJobs = jobsRes.jobs.filter((j: any) => {
          if (this.currentUser.role === 'admin') return true;
          if (currentRecruiterId && (j.recruiter_id === currentRecruiterId || j.recruiterId === currentRecruiterId)) {
            return true;
          }
          if (recruiterCompany && j.company.toLowerCase() === recruiterCompany) {
            return true;
          }
          return false;
        });

        if (relevantJobs.length > 0) {
          const allApps: any[] = [];
          await Promise.all(
            relevantJobs.map(async (job: any) => {
              try {
                const appRes = await api.jobs.getApplicants(job.id);
                if (appRes && Array.isArray(appRes.applicants)) {
                  appRes.applicants.forEach((app: any) => {
                    allApps.push({
                      id: app.application_id,
                      job_id: job.id,
                      jobTitle: job.title,
                      company: job.company,
                      student_id: app.student.id,
                      student: app.student,
                      status: app.status,
                      created_at: app.applied_at,
                      matchResult: app.match_result,
                      match_score: app.match_result?.match_score,
                    });
                  });
                }
              } catch {
                // Ignore per-job applicant lookup errors
              }
            })
          );

          if (allApps.length > 0) {
            this.syncApplications(allApps);
          }
        }
      }

      if (ivRes && Array.isArray(ivRes.interviews)) {
        this.syncInterviews(ivRes.interviews);
      }
    } catch (e) {
      console.warn('loadRecruiterPortalData error:', e);
    }
  }

  // Student Profile Updates
  public updateStudentProfile(updates: Partial<StudentProfile>) {
    this.studentProfile = { ...this.studentProfile, ...updates };
    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      'UPDATE_PROFILE',
      `Student ${this.studentProfile.fullName}`,
      'Updated student academic and personal dossier information.'
    );
    this.notify();
  }

  // Resume Parsing Simulation
  public uploadResume(fileName: string, fileSize: string) {
    this.studentProfile.resume = {
      fileName,
      fileSize,
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      parsingStatus: 'uploading',
      parsedSkills: [],
      parsedEducation: '',
      parsedProjects: [],
      parsedExperience: '',
    };
    this.notify();

    setTimeout(() => {
      if (this.studentProfile.resume) {
        this.studentProfile.resume.parsingStatus = 'processing';
        this.notify();
      }

      setTimeout(() => {
        if (this.studentProfile.resume) {
          this.studentProfile.resume.parsingStatus = 'completed';
          this.studentProfile.resume.parsedSkills = [...this.studentProfile.skills];
          this.studentProfile.resume.parsedEducation = `${this.studentProfile.degree} in ${this.studentProfile.branch}, ${this.studentProfile.institution} (CGPA: ${this.studentProfile.cgpa})`;
          this.studentProfile.resume.parsedProjects = this.studentProfile.projects.map(p => p.title);
          this.studentProfile.resume.parsedExperience = this.studentProfile.experience.map(e => `${e.position} at ${e.organization}`).join('; ');

          this.addNotification({
            userId: this.currentUser.id,
            title: 'Resume Processing Completed',
            message: `File ${fileName} was parsed. Found ${this.studentProfile.skills.length} technical skills and 3 projects.`,
            category: 'system',
            link: '/student/resume',
          });

          this.addAuditLog(
            this.currentUser.name,
            this.currentUser.role,
            'PARSE_RESUME',
            `Resume ${fileName}`,
            'Completed resume document extraction and verification.'
          );
          this.notify();
        }
      }, 900);
    }, 600);
  }

  // Applications
  public applyToJob(jobId: string, matchScore: number): { success: boolean; message: string } {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return { success: false, message: 'Job not found.' };

    const existing = this.applications.find(
      a => a.jobId === jobId && a.studentId === this.studentProfile.id && a.status !== 'Withdrawn'
    );
    if (existing) {
      return { success: false, message: 'You have already submitted an application for this position.' };
    }

    const newApp: Application = {
      id: `app_${Date.now()}`,
      jobId,
      jobTitle: job.title,
      company: job.company,
      studentId: this.studentProfile.id,
      studentName: this.studentProfile.fullName,
      studentEmail: this.studentProfile.email,
      studentBranch: this.studentProfile.branch,
      studentCgpa: this.studentProfile.cgpa,
      studentGradYear: this.studentProfile.graduationYear,
      appliedDate: new Date().toISOString().slice(0, 10),
      status: 'Applied',
      latestUpdateDate: new Date().toISOString().slice(0, 10),
      matchScore,
      history: [
        {
          stage: 'Applied',
          date: new Date().toISOString().slice(0, 10),
          note: 'Application dossier transmitted via Aarohan.',
        },
      ],
    };

    this.applications.unshift(newApp);
    job.applicantsCount += 1;

    this.addNotification({
      userId: this.studentProfile.id,
      title: 'Application Transmitted',
      message: `Your application for ${job.title} at ${job.company} has been received.`,
      category: 'application',
      link: `/student/applications/${newApp.id}`,
    });

    this.addAuditLog(
      this.studentProfile.fullName,
      'student',
      'SUBMIT_APPLICATION',
      `Application ${newApp.id} (${job.title})`,
      `Submitted formal campus placement application.`
    );

    this.notify();
    return { success: true, message: 'Application submitted successfully.' };
  }

  public updateApplicationStatus(
    applicationId: string,
    newStatus: Application['status'],
    notes?: string,
    rejectionReason?: string
  ) {
    const app = this.applications.find(a => a.id === applicationId);
    if (!app) return;

    app.status = newStatus;
    app.latestUpdateDate = new Date().toISOString().slice(0, 10);
    if (notes) app.recruiterNotes = notes;
    if (rejectionReason) app.rejectionReason = rejectionReason;

    app.history.push({
      stage: newStatus,
      date: new Date().toISOString().slice(0, 10),
      note: notes || `Application moved to ${newStatus}.`,
    });

    // Notify student
    this.addNotification({
      userId: app.studentId,
      title: `Application Status: ${newStatus}`,
      message: `Your application for ${app.jobTitle} at ${app.company} is now ${newStatus}.`,
      category: newStatus === 'Shortlisted' ? 'shortlist' : 'application',
      link: `/student/applications/${app.id}`,
    });

    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      'UPDATE_APPLICATION_STATUS',
      `Application ${app.id} (${app.studentName})`,
      `Updated status to ${newStatus}. Notes: ${notes || 'None'}`
    );

    this.notify();
  }

  public withdrawApplication(applicationId: string) {
    const app = this.applications.find(a => a.id === applicationId);
    if (!app) return;
    app.status = 'Withdrawn';
    app.latestUpdateDate = new Date().toISOString().slice(0, 10);
    app.history.push({
      stage: 'Withdrawn',
      date: new Date().toISOString().slice(0, 10),
      note: 'Candidate voluntarily withdrew application dossier.',
    });
    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      'WITHDRAW_APPLICATION',
      `Application ${app.id}`,
      'Voluntary candidate withdrawal.'
    );
    this.notify();
  }

  // Job Creation (Recruiter)
  public createJob(jobData: Omit<JobOpportunity, 'id' | 'applicantsCount' | 'shortlistedCount' | 'publishedDate'>): JobOpportunity {
    const initials = jobData.company
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'UN';

    const newJob: JobOpportunity = {
      ...jobData,
      id: `job_${Date.now()}`,
      companyInitials: initials,
      publishedDate: new Date().toISOString().slice(0, 10),
      applicantsCount: 0,
      shortlistedCount: 0,
    };

    this.jobs.unshift(newJob);

    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      'CREATE_JOB',
      `Job ${newJob.id} (${newJob.title})`,
      `Published new recruitment posting for ${newJob.company}.`
    );

    this.notify();
    return newJob;
  }

  // Interview Management
  public scheduleInterview(interviewData: Omit<Interview, 'id' | 'status'>): Interview {
    const newInterview: Interview = {
      ...interviewData,
      id: `int_${Date.now()}`,
      status: 'Scheduled',
    };

    this.interviews.unshift(newInterview);

    // Update application status if needed
    const app = this.applications.find(a => a.id === interviewData.applicationId);
    if (app && app.status !== 'Interview Scheduled') {
      this.updateApplicationStatus(
        app.id,
        'Interview Scheduled',
        `Interview scheduled for ${interviewData.date} at ${interviewData.startTime}.`
      );
    }

    this.addNotification({
      userId: interviewData.studentId,
      title: 'Interview Scheduled',
      message: `${interviewData.company} scheduled your ${interviewData.round} on ${interviewData.date} at ${interviewData.startTime}.`,
      category: 'interview',
      link: '/student/interviews',
    });

    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      'SCHEDULE_INTERVIEW',
      `Interview ${newInterview.id} (${interviewData.studentName})`,
      `Scheduled ${interviewData.round} with ${interviewData.company}.`
    );

    this.notify();
    return newInterview;
  }

  public rescheduleInterview(interviewId: string, newDate: string, newStartTime: string, newEndTime: string) {
    const item = this.interviews.find(i => i.id === interviewId);
    if (!item) return;

    item.date = newDate;
    item.startTime = newStartTime;
    item.endTime = newEndTime;
    item.status = 'Rescheduled';

    this.addNotification({
      userId: item.studentId,
      title: 'Interview Rescheduled',
      message: `Your ${item.round} with ${item.company} has been rescheduled to ${newDate} at ${newStartTime}.`,
      category: 'interview',
      link: '/student/interviews',
    });

    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      'RESCHEDULE_INTERVIEW',
      `Interview ${item.id}`,
      `Rescheduled interview to ${newDate} at ${newStartTime}.`
    );

    this.notify();
  }

  public cancelInterview(interviewId: string, reason?: string) {
    const item = this.interviews.find(i => i.id === interviewId);
    if (!item) return;
    item.status = 'Cancelled';
    if (reason) item.notes = `Cancelled: ${reason}`;

    this.addNotification({
      userId: item.studentId,
      title: 'Interview Cancelled',
      message: `Your interview with ${item.company} was cancelled. ${reason ? `Reason: ${reason}` : ''}`,
      category: 'interview',
      link: '/student/interviews',
    });

    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      'CANCEL_INTERVIEW',
      `Interview ${item.id}`,
      `Cancelled interview. Reason: ${reason || 'N/A'}`
    );

    this.notify();
  }

  // Drives (Admin)
  public createDrive(driveData: Omit<PlacementDrive, 'id'>): PlacementDrive {
    const newDrive: PlacementDrive = {
      ...driveData,
      id: `drv_${Date.now()}`,
    };
    this.drives.unshift(newDrive);

    this.addAuditLog(
      this.currentUser.name,
      'admin',
      'CREATE_DRIVE',
      `Placement Drive ${newDrive.name}`,
      `Created placement drive across ${driveData.companies.length} companies.`
    );

    this.notify();
    return newDrive;
  }

  // Notifications
  public addNotification(notif: Omit<NotificationItem, 'id' | 'read' | 'timestamp'>) {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    this.notifications.unshift(newNotif);
    this.notify();
  }

  public markNotificationAsRead(id: string) {
    const n = this.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      this.notify();
    }
  }

  public markAllNotificationsAsRead() {
    this.notifications.forEach(n => (n.read = true));
    this.notify();
  }

  // Audit Logs
  public addAuditLog(actor: string, actorRole: UserRole, action: string, entity: string, summary: string) {
    const log: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      actor,
      actorRole,
      action,
      entity,
      summary,
    };
    this.auditLogs.unshift(log);
  }

  // Skill Resources
  public toggleSaveSkillResource(id: string) {
    const res = this.skillResources.find(r => r.id === id);
    if (res) {
      res.isSaved = !res.isSaved;
      this.notify();
    }
  }

  public toggleCompleteSkillResource(id: string) {
    const res = this.skillResources.find(r => r.id === id);
    if (res) {
      res.isCompleted = !res.isCompleted;
      this.notify();
    }
  }

  // Reset to seed defaults
  public resetToDefaults() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aarohan_state');
      localStorage.removeItem('campuslink_state');
    }
    this.currentUser = INITIAL_USER_STUDENT;
    this.studentProfile = INITIAL_STUDENT_PROFILE;
    this.jobs = INITIAL_JOBS;
    this.applications = INITIAL_APPLICATIONS;
    this.interviews = INITIAL_INTERVIEWS;
    this.drives = INITIAL_DRIVES;
    this.notifications = INITIAL_NOTIFICATIONS;
    this.auditLogs = INITIAL_AUDIT_LOGS;
    this.skillResources = INITIAL_SKILL_RESOURCES;
    this.notify();
  }
}

export const campusStore = new CampusStore();
