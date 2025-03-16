import React, { createContext, useContext, useState, useEffect } from 'react';
import { JobSearchFormData, JobTypePreferences, SalaryRange } from '../../../types/jobSearch';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';

interface JobSearchContextType {
  formData: JobSearchFormData;
  loading: boolean;
  searching: boolean;
  countryCode: string;
  whatsappNumber: string;
  enableWhatsapp: boolean;
  setCountryCode: (value: string) => void;
  setWhatsappNumber: (value: string) => void;
  setEnableWhatsapp: (value: boolean) => void;
  updateFormData: (field: keyof JobSearchFormData, value: any) => void;
  updateJobTypePreference: (field: keyof JobTypePreferences, value: string) => void;
  updateSalaryRange: (field: keyof SalaryRange, value: number) => void;
  retryFetch: () => Promise<void>;
}

const JobSearchContext = createContext<JobSearchContextType | undefined>(undefined);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseWhatsAppNumber(notifyWhatsapp: string | null): { 
  countryCode: string; 
  number: string; 
  enabled: boolean 
} {
  if (!notifyWhatsapp) {
    return { countryCode: '+1', number: '', enabled: false };
  }

  const countryCodeMatch = notifyWhatsapp.match(/^\+\d+/);
  if (!countryCodeMatch) {
    return { countryCode: '+1', number: notifyWhatsapp, enabled: true };
  }

  const countryCode = countryCodeMatch[0];
  const number = notifyWhatsapp.slice(countryCode.length);

  return {
    countryCode,
    number,
    enabled: true
  };
}

function parseJobTitle(jobTitles: any): string {
  try {
    // If it's a string with quotes, remove them
    if (typeof jobTitles === 'string') {
      return jobTitles.replace(/^"|"$/g, '').trim();
    }
    // If it's an array, take the first item and remove quotes
    if (Array.isArray(jobTitles) && jobTitles.length > 0) {
      const firstTitle = jobTitles[0];
      return typeof firstTitle === 'string' ? firstTitle.replace(/^"|"$/g, '').trim() : '';
    }
    return '';
  } catch {
    return '';
  }
}

export function JobSearchProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [countryCode, setCountryCode] = useState('+1');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [enableWhatsapp, setEnableWhatsapp] = useState(false);
  const [formData, setFormData] = useState<JobSearchFormData>({
    job_title: '',
    country: '',
    city: '',
    salary_range: {
      min: 0,
      max: 100000
    },
    job_type_preferences: {
      fullTime: '',
      partTime: '',
      remote: ''
    },
    email: '',
    notify_whatsapp: ''
  });

  const fetchJobSearchRule = async (retryCount = 0) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Authentication error. Please sign in again.');
        return;
      }

      const { data, error } = await supabase
        .from('cv_details')
        .select('job_titles, country, city, salary_min, salary_max, notify_whatsapp, job_type_preferences, email')
        .eq('uid', user.id)
        .single();

      if (error) {
        if (retryCount < MAX_RETRIES) {
          await wait(RETRY_DELAY * Math.pow(2, retryCount));
          return fetchJobSearchRule(retryCount + 1);
        }
        throw error;
      }

      if (data) {
        // Parse WhatsApp number and settings
        const whatsappData = parseWhatsAppNumber(data.notify_whatsapp);
        setCountryCode(whatsappData.countryCode);
        setWhatsappNumber(whatsappData.number);
        setEnableWhatsapp(whatsappData.enabled);

        // Parse job type preferences
        const jobTypePrefs = data.job_type_preferences || {};

        setFormData({
          job_title: parseJobTitle(data.job_titles),
          country: data.country || '',
          city: data.city || '',
          salary_range: {
            min: data.salary_min || 0,
            max: data.salary_max || 100000
          },
          job_type_preferences: {
            fullTime: jobTypePrefs.fullTime || '',
            partTime: jobTypePrefs.partTime || '',
            remote: jobTypePrefs.remote || ''
          },
          email: data.email || '',
          notify_whatsapp: data.notify_whatsapp || ''
        });
      }
    } catch (error: any) {
      const errorMessage = error.message === 'Failed to fetch' 
        ? 'Connection error. Please check your internet connection.'
        : error.message;
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobSearchRule().catch(() => {
      // Error is already handled in fetchJobSearchRule
    });
  }, []);

  const updateFormData = (field: keyof JobSearchFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateJobTypePreference = (field: keyof JobTypePreferences, value: string) => {
    setFormData(prev => ({
      ...prev,
      job_type_preferences: {
        ...prev.job_type_preferences,
        [field]: value
      }
    }));
  };

  const updateSalaryRange = (field: keyof SalaryRange, value: number) => {
    setFormData(prev => ({
      ...prev,
      salary_range: {
        ...prev.salary_range,
        [field]: value
      }
    }));
  };

  const retryFetch = async () => {
    setLoading(true);
    await fetchJobSearchRule();
  };

  return (
    <JobSearchContext.Provider value={{
      formData,
      loading,
      searching,
      countryCode,
      whatsappNumber,
      enableWhatsapp,
      setCountryCode,
      setWhatsappNumber,
      setEnableWhatsapp,
      updateFormData,
      updateJobTypePreference,
      updateSalaryRange,
      retryFetch
    }}>
      {children}
    </JobSearchContext.Provider>
  );
}

export function useJobSearch() {
  const context = useContext(JobSearchContext);
  if (context === undefined) {
    throw new Error('useJobSearch must be used within a JobSearchProvider');
  }
  return context;
}