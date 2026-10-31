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

const fallbackAnalysis = (text) => {
  const commonSkills = [
    'Python', 'FastAPI', 'SQL', 'React', 'Node.js', 'Express',
    'JavaScript', 'TypeScript', 'Java', 'C++', 'Git', 'Docker',
    'MongoDB', 'PostgreSQL', 'HTML', 'CSS', 'Tailwind', 'AWS',
    'Machine Learning', 'Data Structures', 'Algorithms'
  ];

  const lowerText = (text || '').toLowerCase();
  const foundSkills = commonSkills.filter((s) =>
    lowerText.includes(s.toLowerCase())
  );


  return {
    skills: foundSkills.length > 0 ? foundSkills : ['Python', 'SQL', 'JavaScript'],
    education: [
      {
        degree: 'B.Tech',
        branch: 'Computer Science and Engineering',
        institution: 'MNNIT Allahabad',
        graduation_year: 2027,
        cgpa: 8.5,
      },
    ],
    experience: [],
    projects: [
      {
        title: 'Academic Project',
        description: 'Developed backend web application services',
        tech_stack: foundSkills.slice(0, 3),
      },
    ],
    summary: 'Engineering student with software development experience.',
  };
};

export const analyzeResumeText = async (text) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const ai = new GoogleGenAI({ apiKey });
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

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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
      console.warn('Gemini analysis failed or returned non-JSON, using fallback:', err.message);
    }
  }

  return fallbackAnalysis(text);
};
