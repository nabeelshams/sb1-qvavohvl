export interface JobTypePreferences {
  fullTime: string;
  partTime: string;
  remote: string;
}

export interface SalaryRange {
  min: number;
  max: number;
}

export interface JobSearchFormData {
  job_titles: string[];
  country: string;
  city: string;
  salary_range: SalaryRange;
  job_type_preferences: JobTypePreferences;
  email: string;
  notify_whatsapp?: string;
}