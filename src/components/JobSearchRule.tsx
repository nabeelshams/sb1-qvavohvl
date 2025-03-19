import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Loader2, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { JobSearchProvider, useJobSearch } from './jobSearch/context/JobSearchContext';
import { useFormValidation } from './jobSearch/hooks/useFormValidation';
import { startJobSearch, saveJobSearchRules } from './jobSearch/services/jobSearchService';
import { JobTitlesSection } from './jobSearch/JobTitlesSection';
import { LocationSection } from './jobSearch/LocationSection';
import { SalarySection } from './jobSearch/SalarySection';
import { JobTypeSection } from './jobSearch/JobTypeSection';
import { NotificationSection } from './jobSearch/NotificationSection';

interface JobSearchRuleProps {
  isNewUser?: boolean;
}

function JobSearchRuleContent({ isNewUser = false }: JobSearchRuleProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isNewFromState = location.state?.isNewUser ?? isNewUser;

  const {
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
  } = useJobSearch();

  const { validateRequiredFields } = useFormValidation();

  const handleSave = async () => {
    try {
      if (!validateRequiredFields(formData, enableWhatsapp, whatsappNumber)) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await saveJobSearchRules(user.id, formData, enableWhatsapp, countryCode, whatsappNumber);
      toast.success('Job search rules saved successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleStartJobSearch = async () => {
    try {
      if (!validateRequiredFields(formData, enableWhatsapp, whatsappNumber)) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const run_id = await startJobSearch(user.id, formData, enableWhatsapp, countryCode, whatsappNumber);
      
      // Navigate with both state and query parameter
      navigate(`/jobs-found?runId=${run_id}`, {
        state: { runId: run_id }
      });
    } catch (error: any) {
      toast.error('Failed to start job search. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-lg font-medium text-blue-300">Loading job search rules...</p>
          <button
            onClick={retryFetch}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors mt-4"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        {isNewFromState ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-1 bg-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6">
                Step 3 of 3
              </div>
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                Set Your Job Preferences
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Help us understand what kind of job opportunities you're looking for. 
                We'll use these preferences to find and notify you about relevant positions.
              </p>
            </div>

            {/* Steps Overview */}
            <div className="grid grid-cols-3 gap-6 mb-12">
              <div className="p-4 bg-black/20 rounded-lg border border-blue-500/20">
                <div className="text-blue-400 font-bold mb-2">Step 1</div>
                <p className="text-sm text-gray-400">Upload CV</p>
                <div className="mt-2 w-full h-1 bg-blue-500 rounded-full" />
              </div>
              <div className="p-4 bg-black/20 rounded-lg border border-purple-500/20">
                <div className="text-purple-400 font-bold mb-2">Step 2</div>
                <p className="text-sm text-gray-400">Review and enhance CV details</p>
                <div className="mt-2 w-full h-1 bg-purple-500 rounded-full" />
              </div>
              <div className="p-4 bg-black/20 rounded-lg border border-pink-500/20">
                <div className="text-pink-400 font-bold mb-2">Step 3</div>
                <p className="text-sm text-gray-400">Set your job preferences</p>
                <div className="mt-2 w-full h-1 bg-pink-500/50 rounded-full animate-pulse" />
              </div>
            </div>
          </>
        ) : (
          <h2 className="text-3xl font-bold mb-8">Job Search Rules</h2>
        )}

        <div className="bg-black/30 backdrop-blur-sm p-8 rounded-lg shadow-xl ring-1 ring-white/20 animate-glow">
          <JobTitlesSection
            jobTitle={formData.job_title}
            onJobTitleChange={(value) => updateFormData('job_title', value)}
          />

          <LocationSection
            country={formData.country}
            city={formData.city}
            onCountryChange={(value) => updateFormData('country', value)}
            onCityChange={(value) => updateFormData('city', value)}
          />

          <SalarySection
            salaryRange={formData.salary_range}
            onSalaryChange={updateSalaryRange}
          />

          <JobTypeSection
            preferences={formData.job_type_preferences}
            onPreferenceChange={updateJobTypePreference}
          />

          <NotificationSection
            email={formData.email}
            whatsappNumber={whatsappNumber}
            countryCode={countryCode}
            enableWhatsapp={enableWhatsapp}
            onEmailChange={(value) => updateFormData('email', value)}
            onWhatsappChange={setWhatsappNumber}
            onCountryCodeChange={setCountryCode}
            onWhatsappToggle={() => setEnableWhatsapp(!enableWhatsapp)}
          />

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            {isNewFromState && (
              <div className="text-sm text-gray-400">
                Next: Start receiving matched job opportunities
              </div>
            )}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              >
                <Save className="w-5 h-5" /> Save Rules
              </button>
              <button
                onClick={handleStartJobSearch}
                disabled={searching}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Starting Search...
                  </>
                ) : (
                  <>
                    <Briefcase className="w-5 h-5" />
                    {isNewFromState ? "Let's Find Your Dream Job!" : 'Go get a job!'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function JobSearchRule({ isNewUser = false }: JobSearchRuleProps) {
  return (
    <JobSearchProvider>
      <JobSearchRuleContent isNewUser={isNewUser} />
    </JobSearchProvider>
  );
}