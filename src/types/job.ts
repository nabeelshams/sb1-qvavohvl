export interface Job {
  id: string;
  job_id: string;
  title: string;
  job_type: string;
  company_name: string;
  company_url: string;
  company_logo_url: string;
  rating_count: number;
  rating: number;
  country: string;
  state: string;
  city: string;
  description: string;
  date_published: string;
  salary_max: number;
  salary_min: number;
  salary_type: string;
  benefits: string;
  attributes: string[];
  occupation: string[];
  remote_work_model: string | null;
  created_at: string;
  job_url: string;
  job_match?: any;
  run_id: string | null;
}