export interface JobMatch {
  "Job Title Match": {
    job_percentage: number;
    job_title_rationale: string;
  };
  "Experience Match": {
    experience_percentage: number;
    experience_rationale: string;
  };
  "Skills Match": {
    skills_percentage: number;
    skills_rationale: string;
  };
  "Education Match": {
    education_percentage: number;
    education_rationale: string;
  };
  "Certifications Match": {
    certifications_percentage: number;
    certifications_rationale: string;
  };
  "Location Match": {
    location_percentage: number;
    location_rationale: string;
  };
  "Languages Match": {
    languages_percentage: number;
    languages_rationale: string;
  };
  "Salary Expectation Match": {
    salary_percentage: number;
    salary_rationale: string;
  };
  "Overall Match Score": {
    overall_percentage: number;
    overall_summary: string;
  };
}

export interface JobMatchData {
  match_data: {
    overall_percentage: number;
    skills_match: number;
    experience_match: number;
    education_match: number;
    location_match: number;
    salary_match: number;
    job_type_match: number;
  };
  skills_details: {
    matched: string[];
    missing: string[];
  };
  experience_details: {
    years_required: number;
    years_matched: number;
  };
  rationale: {
    overall: string;
    skills: string;
    experience: string;
    education: string;
    location: string;
    salary: string;
  };
}