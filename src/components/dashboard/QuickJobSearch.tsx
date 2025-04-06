import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { startJobSearch } from '../../components/jobSearch/services/jobSearchService';
import toast from 'react-hot-toast';

export function QuickJobSearch() {
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchJobTitle = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('cv_details')
          .select('job_titles')
          .eq('uid', user.id)
          .single();

        if (error) throw error;
        if (data?.job_titles) {
          setJobTitle(data.job_titles);
        }
      } catch (error) {
        console.error('Error fetching job title:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobTitle();
  }, []);

  const handleSearch = async () => {
    try {
      setSearching(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's current job search preferences
      const { data: userData, error: userError } = await supabase
        .from('cv_details')
        .select('*')
        .eq('uid', user.id)
        .single();

      if (userError) throw userError;

      // Prepare form data
      const formData = {
        job_title: jobTitle,
        country: userData.country || '',
        city: userData.city || '',
        salary_range: {
          min: userData.salary_min || 0,
          max: userData.salary_max || 100000
        },
        job_type_preferences: userData.job_type_preferences || {
          fullTime: '',
          partTime: '',
          remote: ''
        },
        email: userData.email || '',
        notify_whatsapp: userData.notify_whatsapp || ''
      };

      // Start job search
      const run_id = await startJobSearch(
        user.id,
        formData,
        !!userData.notify_whatsapp,
        userData.notify_whatsapp?.split(' ')[0] || '+1',
        userData.notify_whatsapp?.split(' ')[1] || ''
      );

      // Navigate to jobs found page with run_id
      navigate(`/jobs-found?runId=${run_id}`, {
        state: { runId: run_id }
      });
    } catch (error: any) {
      toast.error('Failed to start job search: ' + error.message);
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg shadow-xl ring-1 ring-white/20 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg shadow-xl ring-1 ring-white/20">
      <h3 className="text-lg font-semibold mb-4">Quick Job Search</h3>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Enter job title"
            className="w-full bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={!jobTitle.trim() || searching}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {searching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Briefcase className="w-5 h-5" />
              Go get a job!
            </>
          )}
        </button>
      </div>
    </div>
  );
}