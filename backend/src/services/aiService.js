const openrouter = require('../config/openrouter');

const AI_MODEL = 'anthropic/claude-3-haiku';

class AIService {
  // Analyze resume and extract key information
  async analyzeResume(resumeText, jobDescription) {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert HR recruiter and resume analyst. Analyze resumes objectively and provide structured assessments. Always respond in valid JSON format.`,
          },
          {
            role: 'user',
            content: `Analyze this resume against the job description and provide a detailed assessment.

Job Description:
${jobDescription}

Resume:
${resumeText}

Provide your analysis in this exact JSON format:
{
  "score": <number 0-100>,
  "summary": "<2-3 sentence summary of the candidate>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "skills": ["<skill 1>", "<skill 2>", ...],
  "yearsExperience": <number>,
  "currentTitle": "<current job title>",
  "currentCompany": "<current company>",
  "education": [{"degree": "<degree>", "school": "<school>", "year": "<year>"}],
  "recommendation": "<hire/consider/reject>",
  "reasoning": "<brief explanation of recommendation>"
}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('AI Resume Analysis Error:', error);
      throw new Error('Failed to analyze resume with AI');
    }
  }

  // Generate screening questions for a job posting
  async generateScreeningQuestions(jobTitle, jobDescription, count = 5) {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert HR recruiter specializing in creating effective screening questions. Generate questions that help identify the best candidates. Always respond in valid JSON format.`,
          },
          {
            role: 'user',
            content: `Generate ${count} screening questions for this position:

Job Title: ${jobTitle}
Job Description: ${jobDescription}

Provide questions in this exact JSON format:
{
  "questions": [
    {
      "question": "<question text>",
      "type": "<text|multiple_choice|yes_no|rating>",
      "options": ["<option1>", "<option2>"] // only for multiple_choice
      "weight": <1-5 importance>,
      "purpose": "<what this question assesses>"
    }
  ]
}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('AI Question Generation Error:', error);
      throw new Error('Failed to generate screening questions');
    }
  }

  // Score a screening answer
  async scoreScreeningAnswer(question, answer, jobContext) {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert HR recruiter evaluating candidate responses. Score answers objectively. Always respond in valid JSON format.`,
          },
          {
            role: 'user',
            content: `Evaluate this screening answer:

Question: ${question}
Candidate's Answer: ${answer}
Job Context: ${jobContext}

Provide your evaluation in this exact JSON format:
{
  "score": <number 0-100>,
  "feedback": "<brief feedback on the answer>",
  "redFlags": ["<any concerns>"],
  "positives": ["<positive aspects>"]
}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('AI Answer Scoring Error:', error);
      throw new Error('Failed to score screening answer');
    }
  }

  // Generate interview questions based on resume and job
  async generateInterviewQuestions(candidateInfo, jobDescription, interviewType = 'general') {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert interviewer who creates insightful, role-specific interview questions. Always respond in valid JSON format.`,
          },
          {
            role: 'user',
            content: `Generate interview questions for this ${interviewType} interview:

Candidate Information:
${JSON.stringify(candidateInfo, null, 2)}

Job Description:
${jobDescription}

Generate 8-10 questions in this exact JSON format:
{
  "questions": [
    {
      "question": "<question text>",
      "category": "<technical|behavioral|situational|cultural>",
      "difficulty": "<easy|medium|hard>",
      "followUp": "<potential follow-up question>",
      "idealAnswer": "<key points to look for>"
    }
  ]
}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('AI Interview Questions Error:', error);
      throw new Error('Failed to generate interview questions');
    }
  }

  // Summarize interview feedback
  async summarizeInterview(interviewNotes, ratings) {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert HR analyst who summarizes interview feedback objectively. Always respond in valid JSON format.`,
          },
          {
            role: 'user',
            content: `Summarize this interview:

Interview Notes:
${interviewNotes}

Ratings:
${JSON.stringify(ratings, null, 2)}

Provide a summary in this exact JSON format:
{
  "summary": "<comprehensive 3-4 sentence summary>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "concerns": ["<concern 1>", "<concern 2>"],
  "recommendation": "<strong_hire|hire|consider|no_hire>",
  "nextSteps": ["<recommended next step>"]
}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 800,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('AI Interview Summary Error:', error);
      throw new Error('Failed to summarize interview');
    }
  }

  // Generate email content
  async generateEmail(templateType, candidateInfo, customContext = '') {
    try {
      const templates = {
        application_received: 'Write a professional email acknowledging receipt of a job application.',
        interview_invite: 'Write a warm, professional email inviting the candidate to an interview.',
        rejection: 'Write a respectful, encouraging rejection email.',
        offer: 'Write an exciting job offer email.',
        follow_up: 'Write a follow-up email to check on the candidate\'s interest.',
      };

      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert HR communications specialist. Write professional, warm, and clear emails. Always respond in valid JSON format.`,
          },
          {
            role: 'user',
            content: `${templates[templateType] || 'Write a professional HR email.'}

Candidate: ${candidateInfo.firstName} ${candidateInfo.lastName}
Position: ${candidateInfo.position || 'the position'}
${customContext ? `Additional Context: ${customContext}` : ''}

Provide the email in this exact JSON format:
{
  "subject": "<email subject line>",
  "body": "<full email body with proper formatting>",
  "tone": "<professional|warm|formal>"
}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('AI Email Generation Error:', error);
      throw new Error('Failed to generate email');
    }
  }

  // Generate job description
  async generateJobDescription(jobInfo) {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert HR professional who writes compelling, inclusive job descriptions. Always respond in valid JSON format.`,
          },
          {
            role: 'user',
            content: `Generate a comprehensive job description:

Job Title: ${jobInfo.title}
Department: ${jobInfo.department}
Location: ${jobInfo.location}
Type: ${jobInfo.type}
${jobInfo.notes ? `Additional Notes: ${jobInfo.notes}` : ''}

Provide the job description in this exact JSON format:
{
  "title": "<refined job title>",
  "summary": "<2-3 sentence role summary>",
  "responsibilities": ["<responsibility 1>", "<responsibility 2>", ...],
  "requirements": ["<requirement 1>", "<requirement 2>", ...],
  "niceToHave": ["<nice to have 1>", "<nice to have 2>", ...],
  "benefits": ["<benefit 1>", "<benefit 2>", ...],
  "salaryRange": {"min": <number>, "max": <number>}
}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('AI Job Description Error:', error);
      throw new Error('Failed to generate job description');
    }
  }

  // Rank candidates for a position
  async rankCandidates(candidates, jobDescription) {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert HR analyst who objectively ranks candidates. Always respond in valid JSON format.`,
          },
          {
            role: 'user',
            content: `Rank these candidates for the position:

Job Description:
${jobDescription}

Candidates:
${JSON.stringify(candidates.map(c => ({
  id: c.id,
  name: `${c.firstName} ${c.lastName}`,
  summary: c.aiSummary,
  score: c.aiScore,
  experience: c.yearsExperience,
  skills: c.skills,
})), null, 2)}

Provide rankings in this exact JSON format:
{
  "rankings": [
    {
      "candidateId": "<id>",
      "rank": <number>,
      "score": <0-100>,
      "reasoning": "<brief explanation>"
    }
  ],
  "topRecommendation": "<candidateId of top choice>",
  "summary": "<overall assessment of candidate pool>"
}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('AI Ranking Error:', error);
      throw new Error('Failed to rank candidates');
    }
  }

  // Generate assessment questions
  async generateAssessment(type, jobInfo, difficulty = 'medium') {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert at creating professional assessments. Generate challenging but fair questions. Always respond in valid JSON format.`,
          },
          {
            role: 'user',
            content: `Generate a ${type} assessment for:

Job: ${jobInfo.title}
Skills Required: ${jobInfo.skills || 'general'}
Difficulty: ${difficulty}

Generate 10 questions in this exact JSON format:
{
  "title": "<assessment title>",
  "description": "<brief description>",
  "timeLimit": <minutes>,
  "questions": [
    {
      "question": "<question text>",
      "type": "<multiple_choice|code|text>",
      "options": ["<option>"] // for multiple choice
      "correctAnswer": "<correct answer or key points>",
      "points": <number>,
      "explanation": "<explanation of correct answer>"
    }
  ]
}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2500,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('AI Assessment Generation Error:', error);
      throw new Error('Failed to generate assessment');
    }
  }
}

module.exports = new AIService();
