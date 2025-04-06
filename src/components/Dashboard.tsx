import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DashboardStats } from './dashboard/DashboardStats';
import { MatchDistributionChart } from './dashboard/MatchDistributionChart';
import { SalaryDistributionChart } from './dashboard/SalaryDistributionChart';
import { CityDistributionChart } from './dashboard/CityDistributionChart';
import { LatestJobs } from './dashboard/LatestJobs';
import { ProfileCompletion } from './dashboard/ProfileCompletion';
import { SkillsAnalysis } from './dashboard/SkillsAnalysis';
import { QuickJobSearch } from './dashboard/QuickJobSearch';
import { LoadingState } from './dashboard/LoadingState';
import { ErrorState } from './dashboard/ErrorState';
import { DashboardStats as Stats } from '../types/dashboard';
import { parseJobMatch } from '../utils/jobMatchUtils';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [requiredSkills, setRequiredSkills] = useState<{ [key: string]: number }>({});
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const fetchDashboardStats = async (retry = false) => {
    try {
      if (retry) {
        setLoading(true);
        setError(null);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch jobs data - only for the current user's runs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs_found')
        .select('*')
        .eq('id', user.id)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      // Fetch optimized resumes
      const { data: resumesData, error: resumesError } = await supabase
        .from('optimized_resumes')
        .select('*')
        .eq('user_id', user.id);

      if (resumesError) throw resumesError;

      // Fetch user's CV details for skills
      const { data: cvData, error: cvError } = await supabase
        .from('cv_details')
        .select('skills')
        .eq('uid', user.id)
        .single();

      if (cvError && cvError.code !== 'PGRST116') throw cvError;

      // Process user skills
      const processedUserSkills = cvData?.skills || [];
      setUserSkills(Array.isArray(processedUserSkills) 
        ? processedUserSkills 
        : typeof processedUserSkills === 'string'
          ? processedUserSkills.split(',').map(s => s.trim())
          : []
      );

      // Process required skills from metadata
      const skillsFrequency: { [key: string]: number } = {};
      resumesData?.forEach(resume => {
        if (resume.metadata) {
          try {
            const metadata = typeof resume.metadata === 'string' 
              ? JSON.parse(resume.metadata) 
              : resume.metadata;

            // Extract skills from different sections
            const hardSkills = metadata.hard_skills || [];
            const softSkills = metadata.soft_skills || [];
            const additionalSkills = metadata.additional_keywords || [];

            [...hardSkills, ...softSkills, ...additionalSkills].forEach(skill => {
              if (typeof skill === 'string') {
                const normalizedSkill = skill.toLowerCase().trim();
                skillsFrequency[normalizedSkill] = (skillsFrequency[normalizedSkill] || 0) + 1;
              }
            });
          } catch (e) {
            console.error('Error parsing resume metadata:', e);
          }
        }
      });

      setRequiredSkills(skillsFrequency);

      // Calculate stats
      const matchDistribution = {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0
      };

      const locationStats: { [key: string]: number } = {};
      const salaryRanges: { [key: string]: number } = {
        '0-50k': 0,
        '50k-100k': 0,
        '100k-150k': 0,
        '150k+': 0
      };

      let totalAtsScore = 0;
      let atsScoreCount = 0;

      jobsData?.forEach(job => {
        // Match distribution
        if (job.job_match) {
          const matchData = parseJobMatch(job.job_match);
          const matchScore = matchData?.match_data.overall_percentage;
          
          if (matchScore !== null && !isNaN(matchScore)) {
            if (matchScore >= 80) matchDistribution.excellent++;
            else if (matchScore >= 60) matchDistribution.good++;
            else if (matchScore >= 40) matchDistribution.fair++;
            else matchDistribution.poor++;
          }
        }

        // Location stats
        const location = job.city || 'Unknown';
        locationStats[location] = (locationStats[location] || 0) + 1;

        // Salary ranges
        const avgSalary = (job.salary_min + job.salary_max) / 2;
        if (avgSalary <= 50000) salaryRanges['0-50k']++;
        else if (avgSalary <= 100000) salaryRanges['50k-100k']++;
        else if (avgSalary <= 150000) salaryRanges['100k-150k']++;
        else salaryRanges['150k+']++;
      });

      resumesData?.forEach(resume => {
        if (resume.ats_score) {
          try {
            const atsData = typeof resume.ats_score === 'string' 
              ? JSON.parse(resume.ats_score) 
              : resume.ats_score;
            
            const score = atsData["Total Score"]?.["Achieved Score"];
            if (score) {
              totalAtsScore += parseFloat(score);
              atsScoreCount++;
            }
          } catch (e) {
            console.error('Error parsing ATS score:', e);
          }
        }
      });

      // Calculate profile completion
      const { data: profileData } = await supabase
        .from('cv_details')
        .select('*')
        .eq('uid', user.id)
        .single();

      const requiredFields = [
  'full_name',
  'email',
  'phone_number',
  'summary',
  'website_or_portfolio',
  'experience',
  'education', 'skills',
  'certifications',
  'activities'
];

      const missingFields = requiredFields.filter(field => {
        if (!profileData?.[field]) return true;
        if (Array.isArray(profileData[field]) && profileData[field].length === 0) return true;
        if (typeof profileData[field] === 'object' && Object.keys(profileData[field]).length === 0) return true;
        return false;
      });

      const profileCompletion = {
        percentage: ((requiredFields.length - missingFields.length) / requiredFields.length) * 100,
        missingFields
      };

      setStats({
        totalJobs: jobsData?.length || 0,
        optimizedResumes: resumesData?.length || 0,
        averageAtsScore: atsScoreCount ? (totalAtsScore / atsScoreCount) : 0,
        matchDistribution,
        locationStats,
        salaryRanges,
        latestJobs: jobsData?.slice(0, 5) || [],
        profileCompletion
      });

      setLoading(false);
      setRetryCount(0);
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchDashboardStats(true), 1000 * Math.pow(2, retryCount));
        return;
      }

      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => fetchDashboardStats(true)} />;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white p-8 pt-24">
      <div className="max-w-7xl mx-auto ml-20 space-y-8">
        <QuickJobSearch />
        
        <DashboardStats 
  totalJobs={stats.totalJobs}
  optimizedResumes={stats.optimizedResumes}
  averageAtsScore={stats.averageAtsScore}
  profileCompletion={stats.profileCompletion.percentage}
  missingFields={stats.profileCompletion.missingFields}
/>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MatchDistributionChart data={stats.matchDistribution} />
          <SalaryDistributionChart data={stats.salaryRanges} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CityDistributionChart data={stats.locationStats} />
          <SkillsAnalysis 
            requiredSkills={requiredSkills}
            userSkills={userSkills}
          />
        </div>

        <LatestJobs jobs={stats.latestJobs} />

        <ProfileCompletion 
          percentage={stats.profileCompletion.percentage}
          missingFields={stats.profileCompletion.missingFields}
        />
      </div>
    </div>
  );
}

export { Dashboard }