export interface ATSScoreSection {
  "Max Score": number;
  "Achieved Score": number;
  "Justification": string;
  "Suggestion": string;
}

export interface ATSScoreData {
  "Hard Skills": ATSScoreSection;
  "Soft Skills": ATSScoreSection;
  "Keyword Match": ATSScoreSection;
  "Relevant Work Experience": ATSScoreSection;
  "Job Title Match": ATSScoreSection;
  "Education": ATSScoreSection;
  "Certifications": ATSScoreSection;
  "Achievements": ATSScoreSection;
  "Quantifiable Achievements": ATSScoreSection;
  "Resume Formatting and Readability": ATSScoreSection;
  "Additional Keywords and Industry Terms": ATSScoreSection;
  "Total Score": ATSScoreSection;
}