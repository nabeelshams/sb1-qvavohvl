export interface Experience {
  end_date: string;
  location: string;  // Changed from string | null to string
  job_title: string;
  start_date: string;
  description: string;
  company_name: string;
}

export interface Education {
  major: string;
  minor: string;  // Changed from string | null to string
  degree: string;
  additional_info: string;  // Changed from string | null to string
  graduation_year: string;
  institution_name: string;
}

export interface Certification {
  issue_date: string;
  expiry_date: string;
  certification: string;
  issuing_organization: string;
}

export interface Language {
  language: string;
  Proficiency: string;
}

export interface Activity {
  activity: string;
  description: string;
}

export interface Reference {
  Name: string;
  contact_info: string;
  company_or_affiliation: string;
}

export interface CVDetails {
  full_name: string;
  phone_number: string;
  email: string;
  address: string;
  website_or_portfolio: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  languages: Language[];
  activities: Activity[];
  reference_list: Reference[];
}