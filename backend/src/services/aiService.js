const openrouter = require('../config/openrouter');

const AI_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

// Strip markdown code fences and trailing text from AI responses before parsing JSON
function parseAIJson(content) {
  let cleaned = content.trim();
  // Remove ```json ... ``` or ``` ... ``` wrapping
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch {
    // AI may have added text after the JSON — extract the JSON object/array
    const startIdx = cleaned.search(/[\[{]/);
    if (startIdx === -1) throw new Error('No JSON found in AI response');
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = startIdx; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (escaped) { escaped = false; continue; }
      if (ch === '\\' && inString) { escaped = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === '{' || ch === '[') depth++;
      if (ch === '}' || ch === ']') {
        depth--;
        if (depth === 0) {
          return JSON.parse(cleaned.substring(startIdx, i + 1));
        }
      }
    }
    // JSON was truncated (token limit hit) — try to repair by closing open braces/brackets
    let truncated = cleaned.substring(startIdx);
    // Remove any trailing incomplete string value
    truncated = truncated.replace(/,\s*"[^"]*$/, '');
    truncated = truncated.replace(/,\s*"[^"]*":\s*"?[^",}\]]*$/, '');
    truncated = truncated.replace(/,\s*$/, '');
    // Count open braces/brackets and close them
    depth = 0;
    inString = false;
    escaped = false;
    const stack = [];
    for (let i = 0; i < truncated.length; i++) {
      const ch = truncated[i];
      if (escaped) { escaped = false; continue; }
      if (ch === '\\' && inString) { escaped = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === '{') stack.push('}');
      if (ch === '[') stack.push(']');
      if (ch === '}' || ch === ']') stack.pop();
    }
    // Close all unclosed braces/brackets
    const repaired = truncated + stack.reverse().join('');
    try {
      return JSON.parse(repaired);
    } catch {
      throw new Error('Could not parse AI response as JSON');
    }
  }
}

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
      return parseAIJson(content);
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
      return parseAIJson(content);
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
      return parseAIJson(content);
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
      return parseAIJson(content);
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
      return parseAIJson(content);
    } catch (error) {
      console.error('AI Interview Summary Error:', error);
      throw new Error('Failed to summarize interview');
    }
  }

  // Generate email content
  async generateEmail(templateType, candidateInfo, customContext = '') {
    try {
      const templates = {
        application_received: `Write a short "thank you for applying" email. The purpose is ONLY to confirm we received their application for the ${candidateInfo.position || 'the position'} role. Do NOT mention interviews, next steps, or scheduling. Simply thank them for their interest, confirm the application was received, and say the team will review it. Keep it brief (3-4 sentences).`,
        interview_invite: `Write an interview invitation email. The purpose is to invite the candidate to schedule an interview for the ${candidateInfo.position || 'the position'} role. Include: enthusiasm about their background, a request to schedule an interview, mention it will be a video/phone call, and ask them to reply with their availability. Do NOT just acknowledge their application — this is specifically an interview invite.`,
        rejection: `Write a respectful, encouraging rejection email for the ${candidateInfo.position || 'the position'} role. Thank them for their time, let them know you went with another candidate, encourage them to apply for future openings, and wish them well.`,
        offer: `Write an exciting job offer email for the ${candidateInfo.position || 'the position'} role. Congratulate them, express excitement about them joining the team, mention next steps (formal offer letter to follow), and ask them to confirm their interest.`,
        follow_up: `Write a follow-up email checking on the candidate's continued interest in the ${candidateInfo.position || 'the position'} role. Keep it brief and friendly — ask if they have any questions and reaffirm interest in their candidacy.`,
      };

      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert HR communications specialist. Write professional, warm, and clear emails. You MUST follow the specific email type instructions exactly — each email type has a distinct purpose. Always respond in valid JSON format only, no markdown.`,
          },
          {
            role: 'user',
            content: `EMAIL TYPE: ${templateType}

INSTRUCTIONS: ${templates[templateType] || 'Write a professional HR email.'}

Candidate name: ${candidateInfo.firstName} ${candidateInfo.lastName}
${customContext ? `Additional Context: ${customContext}` : ''}

Respond in this exact JSON format:
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
      return parseAIJson(content);
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
      return parseAIJson(content);
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
      return parseAIJson(content);
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
      return parseAIJson(content);
    } catch (error) {
      console.error('AI Assessment Generation Error:', error);
      throw new Error('Failed to generate assessment');
    }
  }

  // ==================== NEW HR AI FEATURES ====================

  // AI Bias Detector - Detect bias in text content
  async detectBias(content, contentType = 'job_description') {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert in detecting unconscious bias, discrimination, and non-inclusive language in HR communications. Analyze text for potential biases related to gender, age, race, disability, and other protected characteristics. Always respond in valid JSON format.`,
          },
          {
            role: 'user',
            content: `Analyze this ${contentType.replace('_', ' ')} for potential bias:

Content:
${content}

Provide your analysis in this exact JSON format:
{
  "biasScore": <number 0-100, where 0 is no bias and 100 is highly biased>,
  "biasTypes": [
    {
      "type": "<gender|age|race|disability|socioeconomic|education|other>",
      "severity": "<low|medium|high>",
      "examples": ["<problematic phrase or word>"],
      "explanation": "<why this is biased>"
    }
  ],
  "problematicPhrases": [
    {
      "original": "<original phrase>",
      "issue": "<what's wrong>",
      "suggestion": "<inclusive alternative>"
    }
  ],
  "overallAssessment": "<summary of bias analysis>",
  "inclusivityScore": <number 0-100>,
  "recommendations": ["<recommendation 1>", "<recommendation 2>"]
}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content_response = response.choices[0].message.content;
      return parseAIJson(content_response);
    } catch (error) {
      console.error('AI Bias Detection Error:', error);
      throw new Error('Failed to detect bias');
    }
  }

  // AI Employee Sentiment Analyzer
  async analyzeSentiment(content, source = 'feedback') {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert in analyzing employee sentiment and workplace psychology. Analyze text for emotional content, satisfaction levels, and underlying concerns. Always respond in valid JSON format.`,
          },
          {
            role: 'user',
            content: `Analyze the sentiment in this employee ${source}:

Content:
${content}

Provide your analysis in this exact JSON format:
{
  "sentimentScore": <number -100 to 100, where -100 is extremely negative and 100 is extremely positive>,
  "sentimentLabel": "<very_negative|negative|neutral|positive|very_positive>",
  "emotions": [
    {
      "emotion": "<happiness|sadness|anger|fear|surprise|disgust|trust|anticipation>",
      "intensity": <number 0-100>,
      "indicators": ["<phrase that indicates this emotion>"]
    }
  ],
  "themes": [
    {
      "theme": "<work_life_balance|management|compensation|career_growth|culture|workload|recognition|other>",
      "sentiment": "<positive|neutral|negative>",
      "details": "<specific feedback about this theme>"
    }
  ],
  "urgency": "<low|medium|high|critical>",
  "riskFactors": ["<potential concern>"],
  "positiveHighlights": ["<positive aspect>"],
  "actionItems": [
    {
      "action": "<recommended action>",
      "priority": "<low|medium|high>",
      "owner": "<HR|Manager|Leadership>"
    }
  ],
  "summary": "<2-3 sentence summary of the sentiment analysis>"
}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content_response = response.choices[0].message.content;
      return parseAIJson(content_response);
    } catch (error) {
      console.error('AI Sentiment Analysis Error:', error);
      throw new Error('Failed to analyze sentiment');
    }
  }

  // AI Culture Fit Scorer
  async scoreCultureFit(candidateInfo, companyValues, teamDynamics = null) {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert in organizational psychology and culture assessment. Evaluate candidates for cultural alignment while avoiding discriminatory practices. Focus on work styles, values, and professional behaviors. Always respond in valid JSON format.`,
          },
          {
            role: 'user',
            content: `Evaluate cultural fit for this candidate:

Candidate Information:
${JSON.stringify(candidateInfo, null, 2)}

Company Values & Culture:
${JSON.stringify(companyValues, null, 2)}

${teamDynamics ? `Team Dynamics:\n${JSON.stringify(teamDynamics, null, 2)}` : ''}

Provide your assessment in this exact JSON format:
{
  "overallScore": <number 0-100>,
  "recommendation": "<strong_fit|good_fit|moderate_fit|poor_fit>",
  "dimensions": {
    "workStyle": {
      "score": <0-100>,
      "assessment": "<evaluation>",
      "alignment": ["<aligned value>"]
    },
    "communication": {
      "score": <0-100>,
      "assessment": "<evaluation>",
      "alignment": ["<aligned value>"]
    },
    "teamwork": {
      "score": <0-100>,
      "assessment": "<evaluation>",
      "alignment": ["<aligned value>"]
    },
    "values": {
      "score": <0-100>,
      "assessment": "<evaluation>",
      "alignment": ["<aligned value>"]
    },
    "adaptability": {
      "score": <0-100>,
      "assessment": "<evaluation>",
      "alignment": ["<aligned value>"]
    }
  },
  "strengths": ["<cultural strength 1>", "<cultural strength 2>"],
  "potentialChallenges": ["<potential challenge 1>"],
  "onboardingRecommendations": ["<recommendation for successful integration>"],
  "summary": "<2-3 sentence summary of cultural fit assessment>"
}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content_response = response.choices[0].message.content;
      return parseAIJson(content_response);
    } catch (error) {
      console.error('AI Culture Fit Error:', error);
      throw new Error('Failed to score culture fit');
    }
  }

  // AI Performance Review Writer
  async generatePerformanceReview(employeeInfo, performanceData, reviewPeriod) {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert HR professional specializing in performance management. Write balanced, constructive, and actionable performance reviews. Always respond in valid JSON format.`,
          },
          {
            role: 'user',
            content: `Generate a performance review for this employee:

Employee:
${JSON.stringify(employeeInfo, null, 2)}

Performance Data:
${JSON.stringify(performanceData, null, 2)}

Review Period: ${reviewPeriod}

Provide the performance review in this exact JSON format:
{
  "overallRating": <number 1-5>,
  "ratingLabel": "<needs_improvement|meets_expectations|exceeds_expectations|outstanding>",
  "executiveSummary": "<2-3 sentence overall assessment>",
  "achievements": [
    {
      "achievement": "<specific achievement>",
      "impact": "<business impact>",
      "recognition": "<how to recognize>"
    }
  ],
  "competencyScores": {
    "technicalSkills": {"score": <1-5>, "comments": "<assessment>"},
    "communication": {"score": <1-5>, "comments": "<assessment>"},
    "teamwork": {"score": <1-5>, "comments": "<assessment>"},
    "leadership": {"score": <1-5>, "comments": "<assessment>"},
    "problemSolving": {"score": <1-5>, "comments": "<assessment>"},
    "initiative": {"score": <1-5>, "comments": "<assessment>"}
  },
  "strengthsAnalysis": ["<strength with example>"],
  "developmentAreas": [
    {
      "area": "<area for improvement>",
      "currentState": "<current performance>",
      "targetState": "<expected improvement>",
      "actionPlan": "<specific steps>"
    }
  ],
  "goals": [
    {
      "goal": "<SMART goal>",
      "timeline": "<timeframe>",
      "metrics": "<success measures>",
      "support": "<resources needed>"
    }
  ],
  "careerDevelopment": {
    "currentTrajectory": "<assessment>",
    "potentialRoles": ["<possible next role>"],
    "recommendedTraining": ["<training/development>"]
  },
  "managerRecommendations": ["<recommendation>"],
  "compensationRecommendation": "<no_change|merit_increase|promotion|bonus>"
}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 3000,
      });

      const content_response = response.choices[0].message.content;
      return parseAIJson(content_response);
    } catch (error) {
      console.error('AI Performance Review Error:', error);
      throw new Error('Failed to generate performance review');
    }
  }

  // AI Salary Benchmarker
  async benchmarkSalary(roleInfo, marketData = null) {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert compensation analyst with deep knowledge of salary trends across industries, locations, and experience levels. Provide data-driven salary recommendations. Always respond in valid JSON format.`,
          },
          {
            role: 'user',
            content: `Provide salary benchmarking analysis for:

Role Information:
${JSON.stringify(roleInfo, null, 2)}

${marketData ? `Market Data:\n${JSON.stringify(marketData, null, 2)}` : ''}

Provide your analysis in this exact JSON format:
{
  "marketAnalysis": {
    "min": <number - minimum market salary>,
    "percentile25": <number>,
    "median": <number>,
    "percentile75": <number>,
    "max": <number - maximum market salary>
  },
  "recommendedRange": {
    "min": <number>,
    "target": <number>,
    "max": <number>
  },
  "currentPositioning": {
    "percentile": <number 0-100 where current salary falls>,
    "competitiveness": "<below_market|at_market|above_market>",
    "gap": <number - difference from median>
  },
  "factors": [
    {
      "factor": "<location|experience|skills|industry|company_size>",
      "impact": "<positive|neutral|negative>",
      "adjustment": "<percentage or amount>",
      "explanation": "<why this factor matters>"
    }
  ],
  "trends": {
    "yearOverYear": "<percentage change>",
    "outlook": "<increasing|stable|decreasing>",
    "hotSkills": ["<skill premium>"]
  },
  "recommendations": [
    {
      "action": "<recommendation>",
      "rationale": "<why>",
      "timing": "<when to implement>"
    }
  ],
  "competitorAnalysis": [
    {
      "company": "<competitor type>",
      "range": "<salary range>",
      "notes": "<any notes>"
    }
  ],
  "summary": "<2-3 sentence summary of salary competitiveness>"
}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2500,
      });

      const content_response = response.choices[0].message.content;
      return parseAIJson(content_response);
    } catch (error) {
      console.error('AI Salary Benchmark Error:', error);
      throw new Error('Failed to benchmark salary');
    }
  }

  // AI Exit Interview Analyzer
  async analyzeExitInterview(exitData) {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert in employee retention and exit analysis. Analyze exit interview data to identify patterns, root causes, and actionable insights for improving employee retention. Always respond in valid JSON format.`,
          },
          {
            role: 'user',
            content: `Analyze this exit interview:

Exit Interview Data:
${JSON.stringify(exitData, null, 2)}

Provide your analysis in this exact JSON format:
{
  "sentimentScore": <number -100 to 100>,
  "primaryReasons": [
    {
      "reason": "<main reason for leaving>",
      "category": "<compensation|management|growth|culture|workload|personal|opportunity>",
      "preventable": <true|false>,
      "severity": "<low|medium|high>"
    }
  ],
  "keyThemes": [
    {
      "theme": "<identified theme>",
      "frequency": "<how often mentioned>",
      "sentiment": "<positive|neutral|negative>",
      "quotes": ["<relevant quote>"]
    }
  ],
  "managerFeedback": {
    "rating": <1-10>,
    "strengths": ["<positive>"],
    "issues": ["<concern>"]
  },
  "cultureFeedback": {
    "rating": <1-10>,
    "positives": ["<what worked>"],
    "negatives": ["<what didn't work>"]
  },
  "retentionOpportunities": {
    "couldHaveRetained": <true|false>,
    "whatWouldHaveHelped": ["<action that could have helped>"],
    "redFlags": ["<early warning signs>"]
  },
  "actionableInsights": [
    {
      "insight": "<specific insight>",
      "affectedArea": "<department|role|company-wide>",
      "recommendedAction": "<what to do>",
      "priority": "<low|medium|high|critical>",
      "owner": "<HR|Manager|Leadership>"
    }
  ],
  "benchmarkComparison": {
    "industryAverage": "<how this compares>",
    "concernLevel": "<low|moderate|high>"
  },
  "summary": "<comprehensive 3-4 sentence summary>",
  "confidentialNotes": "<any sensitive observations>"
}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2500,
      });

      const content_response = response.choices[0].message.content;
      return parseAIJson(content_response);
    } catch (error) {
      console.error('AI Exit Interview Analysis Error:', error);
      throw new Error('Failed to analyze exit interview');
    }
  }

  // AI Interview Scheduler - Smart scheduling suggestions
  async suggestInterviewSchedule(schedulingData) {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert at optimizing interview schedules. Consider interviewer availability, candidate preferences, time zones, and interview best practices. Always respond in valid JSON format.`,
          },
          {
            role: 'user',
            content: `Suggest optimal interview times:

Scheduling Request:
${JSON.stringify(schedulingData, null, 2)}

Provide your suggestions in this exact JSON format:
{
  "recommendedSlots": [
    {
      "rank": <1-5>,
      "dateTime": "<ISO date string>",
      "duration": <minutes>,
      "score": <0-100 optimality score>,
      "reasoning": "<why this time is good>",
      "interviewerAvailability": ["<interviewer who is available>"],
      "considerations": ["<any notes>"]
    }
  ],
  "conflicts": [
    {
      "type": "<scheduling|timezone|preference>",
      "description": "<what the conflict is>",
      "resolution": "<suggested resolution>"
    }
  ],
  "interviewerRecommendations": [
    {
      "interviewer": "<name or id>",
      "role": "<their role in interview>",
      "reasoning": "<why include them>"
    }
  ],
  "logistics": {
    "format": "<video|phone|onsite|panel>",
    "platform": "<Zoom|Teams|Meet|etc>",
    "preparations": ["<what to prepare>"]
  },
  "candidateExperience": {
    "tips": ["<how to make it positive>"],
    "communications": ["<what to send candidate>"]
  },
  "backupOptions": [
    {
      "dateTime": "<alternative time>",
      "notes": "<why this is backup>"
    }
  ],
  "summary": "<brief summary of scheduling recommendation>"
}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content_response = response.choices[0].message.content;
      return parseAIJson(content_response);
    } catch (error) {
      console.error('AI Interview Scheduling Error:', error);
      throw new Error('Failed to suggest interview schedule');
    }
  }

  // AI Org Chart Optimizer
  async optimizeOrgChart(orgData) {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert in organizational design and structure optimization. Analyze org charts for efficiency, span of control, reporting clarity, and growth scalability. Always respond in valid JSON format.`,
          },
          {
            role: 'user',
            content: `Analyze and optimize this organizational structure:

Organization Data:
${JSON.stringify(orgData, null, 2)}

Provide your analysis in this exact JSON format:
{
  "currentMetrics": {
    "totalEmployees": <number>,
    "totalManagers": <number>,
    "averageSpanOfControl": <number>,
    "hierarchyLevels": <number>,
    "managerToICRatio": "<ratio>"
  },
  "healthScore": <0-100>,
  "issues": [
    {
      "type": "<span_of_control|reporting_clarity|bottleneck|skill_gap|redundancy>",
      "severity": "<low|medium|high|critical>",
      "location": "<where in org>",
      "description": "<detailed issue>",
      "impact": "<business impact>"
    }
  ],
  "optimizations": [
    {
      "recommendation": "<specific change>",
      "type": "<restructure|merge|split|new_role|remove_layer>",
      "affectedRoles": ["<role>"],
      "benefits": ["<expected benefit>"],
      "risks": ["<potential risk>"],
      "effort": "<low|medium|high>",
      "priority": <1-10>
    }
  ],
  "spanOfControlAnalysis": {
    "overloaded": [{"manager": "<name>", "directReports": <number>, "recommendation": "<action>"}],
    "underutilized": [{"manager": "<name>", "directReports": <number>, "recommendation": "<action>"}],
    "optimal": [{"manager": "<name>", "directReports": <number>}]
  },
  "growthRecommendations": {
    "nextHires": ["<role to hire>"],
    "futureStructure": "<description of how org should evolve>",
    "headcountProjection": {
      "6months": <number>,
      "12months": <number>,
      "24months": <number>
    }
  },
  "skillGaps": [
    {
      "skill": "<missing skill>",
      "currentCoverage": "<how it's covered now>",
      "recommendation": "<hire|train|outsource>"
    }
  ],
  "benchmarks": {
    "industryComparison": "<how org compares>",
    "bestPractices": ["<relevant best practice>"]
  },
  "summary": "<comprehensive 3-4 sentence summary of org health and recommendations>"
}`,
          },
        ],
        temperature: 0.4,
        max_tokens: 4500,
      });

      const content_response = response.choices[0].message.content;
      return parseAIJson(content_response);
    } catch (error) {
      console.error('AI Org Chart Optimization Error:', error);
      throw new Error('Failed to optimize org chart');
    }
  }

  // AI Skills Assessor - Assess and validate skills
  async assessSkills(candidateInfo, requiredSkills) {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert technical recruiter and skills assessor. Evaluate candidate skills objectively based on their background, experience, and demonstrated abilities. Always respond in valid JSON format.`,
          },
          {
            role: 'user',
            content: `Assess the skills of this candidate:

Candidate Information:
${JSON.stringify(candidateInfo, null, 2)}

Required Skills:
${JSON.stringify(requiredSkills, null, 2)}

Provide your assessment in this exact JSON format:
{
  "overallScore": <0-100>,
  "skillsMatch": "<excellent|good|moderate|poor>",
  "skillAssessments": [
    {
      "skill": "<skill name>",
      "required": <true|false>,
      "candidateLevel": "<none|beginner|intermediate|advanced|expert>",
      "requiredLevel": "<beginner|intermediate|advanced|expert>",
      "score": <0-100>,
      "evidence": ["<where this skill is demonstrated>"],
      "gap": "<description of gap if any>",
      "recommendation": "<hire as is|provide training|significant gap>"
    }
  ],
  "technicalDepth": {
    "score": <0-100>,
    "assessment": "<evaluation>",
    "standoutAreas": ["<area>"]
  },
  "learningAgility": {
    "score": <0-100>,
    "assessment": "<evaluation>",
    "indicators": ["<evidence>"]
  },
  "skillGaps": [
    {
      "skill": "<missing or weak skill>",
      "importance": "<critical|important|nice_to_have>",
      "trainingTime": "<estimated time to develop>",
      "trainingApproach": "<how to develop>"
    }
  ],
  "hiddenStrengths": ["<skills not required but valuable>"],
  "verificationQuestions": [
    {
      "skill": "<skill to verify>",
      "question": "<technical question to ask>",
      "expectedAnswer": "<what to look for>"
    }
  ],
  "recommendation": "<strong_hire|hire|conditional_hire|do_not_hire>",
  "summary": "<2-3 sentence summary of skills assessment>"
}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2500,
      });

      const content_response = response.choices[0].message.content;
      return parseAIJson(content_response);
    } catch (error) {
      console.error('AI Skills Assessment Error:', error);
      throw new Error('Failed to assess skills');
    }
  }

  // AI Skills Gap Analysis - team-level skills gap given target capabilities
  async skillsGapAnalysis(teamSkills, targetCapabilities) {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: 'You are a workforce-planning AI. Analyze team skill inventories vs target capabilities and propose closure plans. Always respond in valid JSON.' },
          { role: 'user', content: `Team Skills:\n${JSON.stringify(teamSkills, null, 2)}\n\nTarget Capabilities:\n${JSON.stringify(targetCapabilities, null, 2)}\n\nReturn JSON: {coverage_score:0-100, critical_gaps:[{capability,severity,affected_initiatives}], moderate_gaps:[], surplus_skills:[], closure_plan:{hire:[{role,skills,priority}], train:[{employee_or_team,skill,duration,method}], outsource:[{capability,rationale}]}, summary}.` }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });
      return parseAIJson(response.choices[0].message.content);
    } catch (error) {
      console.error('AI Skills Gap Error:', error);
      throw new Error('Failed to analyze skills gap');
    }
  }

  // AI Interview Analysis - structured analysis of an interview transcript
  async analyzeInterview(transcript, jobDescription, candidateName) {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert interview analyst. Evaluate interview transcripts for content quality, communication signals, and fit. Always respond in valid JSON.' },
          { role: 'user', content: `Candidate: ${candidateName || 'unknown'}\n\nJob Description:\n${jobDescription || ''}\n\nTranscript:\n${transcript}\n\nReturn JSON: {overall_score:0-100, recommendation:"strong_hire|hire|consider|no_hire", topic_coverage:[{topic,covered:bool,depth:"shallow|moderate|deep"}], communication:{clarity:0-100,confidence:0-100,filler_words:number,pace:"too_slow|good|too_fast"}, technical_signals:[{signal,evidence,strength}], red_flags:[], green_flags:[], follow_up_questions:[], summary}.` }
        ],
        temperature: 0.3,
        max_tokens: 2500,
      });
      return parseAIJson(response.choices[0].message.content);
    } catch (error) {
      console.error('AI Interview Analysis Error:', error);
      throw new Error('Failed to analyze interview');
    }
  }

  // AI Retention Risk Prediction - flag hires likely to churn early
  async predictRetentionRisk(employeeProfile, contextSignals) {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: 'You are a retention-risk AI. Score early-tenure attrition risk using profile + signals. Avoid protected-class proxies. Always respond in valid JSON.' },
          { role: 'user', content: `Employee Profile:\n${JSON.stringify(employeeProfile, null, 2)}\n\nContext Signals:\n${JSON.stringify(contextSignals || {}, null, 2)}\n\nReturn JSON: {risk_score:0-100, risk_band:"low|medium|high|critical", horizon_months:number, top_risk_factors:[{factor,weight,evidence}], protective_factors:[], recommended_interventions:[{action,owner,timing,expected_impact}], confidence:0-1, summary}.` }
        ],
        temperature: 0.3,
        max_tokens: 1800,
      });
      return parseAIJson(response.choices[0].message.content);
    } catch (error) {
      console.error('AI Retention Risk Error:', error);
      throw new Error('Failed to predict retention risk');
    }
  }

  // Apply pass 4 (mechanical backlog) — Offer Letter Generator
  async generateOfferLetter(offerInput) {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: 'You are a precise HR assistant. Draft professional, legally-careful offer letters. Avoid promises beyond the supplied facts. Always respond in valid JSON.' },
          { role: 'user', content: `Draft an offer letter using these inputs:\n${JSON.stringify(offerInput, null, 2)}\n\nReturn JSON: {subject, greeting, body_paragraphs:[string], compensation_summary:{base_salary, bonus, equity, benefits_summary}, key_dates:{start_date, response_deadline}, signatures:{company_signatory, candidate_line}, formatted_letter:string, notes_to_recruiter:[string]}.` }
        ],
        temperature: 0.4,
        max_tokens: 2200,
      });
      return parseAIJson(response.choices[0].message.content);
    } catch (error) {
      console.error('AI Offer Letter Error:', error);
      throw new Error('Failed to generate offer letter');
    }
  }

  // Apply pass 4 (mechanical backlog) — DEI Metrics Aggregator
  async deiMetricsAggregate(workforceSnapshot, hiringFunnel) {
    try {
      const response = await openrouter.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: 'You are a DEI analytics AI. Aggregate workforce and hiring-funnel data into useful, privacy-aware DEI metrics. Avoid surfacing protected-class identities of individuals; only use aggregate counts/rates. Always respond in valid JSON.' },
          { role: 'user', content: `Workforce snapshot (aggregate):\n${JSON.stringify(workforceSnapshot || {}, null, 2)}\n\nHiring funnel (aggregate):\n${JSON.stringify(hiringFunnel || {}, null, 2)}\n\nReturn JSON: {representation:[{dimension,group,headcount,share_pct}], pay_equity:[{dimension,gap_pct,note}], hiring_funnel:[{stage,passthrough_rate_pct,by_group:[{group,passthrough_pct}]}], attrition:[{dimension,group,rate_pct}], opportunity_indicators:[{dimension,signal,direction:"positive|negative|neutral"}], top_actions:[{action,rationale,impact_estimate,owner}], summary, caveats:[string]}.` }
        ],
        temperature: 0.3,
        max_tokens: 2200,
      });
      return parseAIJson(response.choices[0].message.content);
    } catch (error) {
      console.error('AI DEI Metrics Error:', error);
      throw new Error('Failed to aggregate DEI metrics');
    }
  }
}

module.exports = new AIService();
