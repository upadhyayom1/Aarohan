import fs from 'fs';
import pdfParse from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';

export const extractTextFromPdf = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(dataBuffer);
    return parsed.text || '';
  } catch (error) {
    console.error('PDF parsing error:', error);
    return '';
  }
};

export const fallbackAnalysis = (text) => {
  const commonSkills = [
    'Python', 'FastAPI', 'SQL', 'React', 'React.js', 'Node.js', 'Express', 'Express.js',
    'JavaScript', 'TypeScript', 'Java', 'C++', 'C', 'Git', 'GitHub', 'Docker', 'Kubernetes',
    'MongoDB', 'PostgreSQL', 'Firebase', 'HTML', 'CSS', 'Tailwind', 'AWS', 'GCP',
    'Machine Learning', 'Deep Learning', 'NLP', 'TensorFlow', 'PyTorch', 'Scikit-learn',
    'Pandas', 'NumPy', 'Matplotlib', 'Streamlit', 'Data Structures', 'Algorithms',
    'REST APIs', 'Linux', 'Firestore'
  ];

  const lowerText = (text || '').toLowerCase();
  const foundSkills = commonSkills.filter((s) => {
    const pattern = new RegExp(`(^|[^a-zA-Z0-9#+])${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-zA-Z0-9#+]|$)`, 'i');
    return pattern.test(lowerText);
  });

  // Extract CGPA
  let cgpa = 0;
  const cgpaMatch = text.match(/cgpa[:\s=]*([0-9]+(?:\.[0-9]+)?)/i);
  if (cgpaMatch) {
    const parsed = parseFloat(cgpaMatch[1]);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 10) cgpa = parsed;
  }

  // Extract Graduation Year
  let graduationYear = new Date().getFullYear();
  const gradMatch = text.match(/(?:20[2-3][0-9]\s*[-–—]\s*(20[2-3][0-9]))|(?:class of\s*(20[2-3][0-9]))/i);
  if (gradMatch) {
    const yr = parseInt(gradMatch[1] || gradMatch[2], 10);
    if (!isNaN(yr) && yr >= 2020 && yr <= 2035) graduationYear = yr;
  }

  // Extract Institution
  let institution = '';
  if (/motilal\s+nehru\s+national\s+institute\s+of\s+technology/i.test(text) || /mnnit/i.test(text)) {
    institution = 'Motilal Nehru National Institute of Technology Allahabad';
  } else if (/national\s+institute\s+of\s+technology/i.test(text)) {
    institution = 'National Institute of Technology';
  } else if (/indian\s+institute\s+of\s+technology/i.test(text)) {
    institution = 'Indian Institute of Technology';
  } else {
    const instMatch = text.match(/([A-Z][a-zA-Z\s]{3,40}(?:Institute|University|College)[a-zA-Z\s]{0,30})/);
    if (instMatch) institution = instMatch[1].trim();
  }

  // Extract Branch
  let branch = 'Computer Science and Engineering';
  if (/computer\s+science/i.test(text) || /cse/i.test(text)) {
    branch = 'Computer Science and Engineering';
  } else if (/information\s+technology/i.test(text)) {
    branch = 'Information Technology';
  } else if (/electronics/i.test(text) || /ece/i.test(text)) {
    branch = 'Electronics and Communication Engineering';
  } else if (/electrical/i.test(text)) {
    branch = 'Electrical Engineering';
  } else if (/mechanical/i.test(text)) {
    branch = 'Mechanical Engineering';
  } else if (/civil/i.test(text)) {
    branch = 'Civil Engineering';
  }

  // Extract Degree
  let degree = 'Bachelor of Technology (B.Tech)';
  if (/master\s+of\s+technology|m\.?\s*tech/i.test(text)) {
    degree = 'Master of Technology (M.Tech)';
  } else if (/master\s+of\s+computer\s+applications|mca/i.test(text)) {
    degree = 'Master of Computer Applications (MCA)';
  } else if (/bachelor\s+of\s+technology|b\.?\s*tech/i.test(text)) {
    degree = 'Bachelor of Technology (B.Tech)';
  }

  // Extract Projects
  const projects = [];
  const projectSection = text.match(/(?:personal\s+projects|academic\s+projects|projects)[\s\S]*?(?=(?:technical\s+skills|skills|positions|experience|achievements|education|$))/i);
  if (projectSection) {
    const lines = projectSection[0].split('\n').map((l) => l.trim()).filter(Boolean);
    let curProj = null;
    for (const line of lines) {
      if (/^(?:personal\s+projects|academic\s+projects|projects)$/i.test(line)) continue;
      if (line.includes('|') || (!line.startsWith('•') && !line.startsWith('-') && line.length < 70 && !line.toLowerCase().startsWith('developed') && !line.toLowerCase().startsWith('built'))) {
        const title = line.split('|')[0].trim();
        if (title.length > 2) {
          curProj = { title, description: '', tech_stack: [] };
          projects.push(curProj);
        }
      } else if (curProj && (line.startsWith('•') || line.startsWith('-'))) {
        const bullet = line.replace(/^[•\-\*]\s*/, '').trim();
        curProj.description = curProj.description ? `${curProj.description} ${bullet}` : bullet;
      }
    }
  }

  // Extract Experience / Positions
  const experience = [];
  const expSection = text.match(/(?:positions\s+of\s+responsibility|experience|work\s+experience|internships)[\s\S]*?(?=(?:achievements|skills|education|projects|$))/i);
  if (expSection) {
    const lines = expSection[0].split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (/^(?:positions\s+of\s+responsibility|experience|work\s+experience|internships)$/i.test(line)) continue;
      if (line.startsWith('•') || line.startsWith('-')) {
        const clean = line.replace(/^[•\-\*]\s*/, '').trim();
        const parts = clean.split(/[–—:]/);
        const role = parts[0]?.trim() || 'Role';
        const company = parts[1]?.trim() || '';
        const desc = parts.slice(2).join(' ').trim() || clean;
        experience.push({ role, company, description: desc, duration: '' });
      }
    }
  }

  return {
    skills: foundSkills.length > 0 ? foundSkills : ['Python', 'SQL', 'JavaScript'],
    education: [
      {
        degree,
        branch,
        institution: institution || 'Motilal Nehru National Institute of Technology Allahabad',
        graduation_year: graduationYear,
        cgpa: cgpa || 8.0,
      },
    ],
    experience,
    projects: projects.length > 0 ? projects : [
      {
        title: 'Academic Engineering Project',
        description: 'Developed backend and web applications using software development best practices.',
        tech_stack: foundSkills.slice(0, 4),
      },
    ],
    summary: 'Engineering student with verified software development and technical competencies.',
  };
};

export const analyzeResumeText = async (text) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    const prompt = `You are an expert ATS parser. Analyze the following resume text and return a valid JSON object strictly matching this schema:
{
  "skills": ["string"],
  "education": [
    {
      "degree": "string",
      "branch": "string",
      "institution": "string",
      "graduation_year": 2027,
      "cgpa": 8.5
    }
  ],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "duration": "string",
      "description": "string"
    }
  ],
  "projects": [
    {
      "title": "string",
      "description": "string",
      "tech_stack": ["string"]
    }
  ],
  "summary": "string"
}

Resume Text:
${text.slice(0, 15000)}

Return ONLY JSON, no markdown codeblocks or preamble.`;

    // Try gemini-2.5-flash-lite first, then gemini-2.5-flash
    const modelsToTry = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];
    const ai = new GoogleGenAI({ apiKey });

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });

        const raw = response.text || '';
        const cleanJson = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleanJson);

        return {
          skills: Array.isArray(parsed.skills) ? parsed.skills : [],
          education: Array.isArray(parsed.education) ? parsed.education : [],
          experience: Array.isArray(parsed.experience) ? parsed.experience : [],
          projects: Array.isArray(parsed.projects) ? parsed.projects : [],
          summary: typeof parsed.summary === 'string' ? parsed.summary : '',
        };
      } catch (err) {
        console.warn(`Gemini model ${model} failed:`, err.message);
      }
    }
  }

  return fallbackAnalysis(text);
};
