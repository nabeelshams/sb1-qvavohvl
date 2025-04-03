interface Job {
  job_id: string;
  title: string;
  company_name: string;
  company_logo_url: string;
  city: string;
  state: string;
  country: string;
  job_match?: any;
}

export interface DashboardStats {
  totalJobs: number;
  optimizedResumes: number;
  averageAtsScore: number;
  matchDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  locationStats: {
    [key: string]: number;
  };
  jobTypeStats: {
    remote: number;
    onsite: number;
    hybrid: number;
  };
  salaryRanges: {
    [key: string]: number;
  };
  latestJobs: Job[];
  profileCompletion: {
    percentage: number;
    missingFields: string[];
  };
}