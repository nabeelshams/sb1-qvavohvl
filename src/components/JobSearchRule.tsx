import React from 'react';
import { useNavigate } from 'react-router-dom';
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
import { phoneCountryCodes } from '../utils/phoneCountryCodes';

function JobSearchRuleContent() {
  const navigate = useNavigate();
  const {
    formData,
    loading,
    searching,
    newJobTitle,
    countryCode,
    whatsappNumber,
    enableWhatsapp,
    setNewJobTitle,
    setCountryCode,
    setWhatsappNumber,
    setEnableWhatsapp,
    updateFormData,
    updateJobTypePreference,
    updateSalaryRange,
    addJobTitle,
    removeJobTitle,
    retryFetch
  } = useJobSearch();
  const { validateRequiredFields } = useFormValidation();

  const handleAddJobTitle = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newJobTitle.trim()) {
      e.preventDefault();
      addJobTitle(newJobTitle.trim());
      setNewJobTitle('');
    }
  };

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

      await startJobSearch(user.id, formData, enableWhatsapp, countryCode, whatsappNumber);
      navigate('/jobs-found');
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
        <div className="bg-black/30 backdrop-blur-sm p-8 rounded-lg shadow-xl ring-1 ring-white/20 animate-glow">
          <h2 className="text-3xl font-bold mb-4">Job Search Rules</h2>
          <p className="text-gray-400 mb-8">
            Please provide necessary details to commence job hunting. We have guessed some things like job title etc based on your cv. Feel free to edit the details.
          </p>

          <JobTitlesSection
            jobTitles={formData.job_titles}
            newJobTitle={newJobTitle}
            onNewJobTitleChange={setNewJobTitle}
            onAddJobTitle={handleAddJobTitle}
            onRemoveJobTitle={removeJobTitle}
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
            countryCodes={phoneCountryCodes}
            enableWhatsapp={enableWhatsapp}
            onEmailChange={(value) => updateFormData('email', value)}
            onWhatsappChange={setWhatsappNumber}
            onCountryCodeChange={setCountryCode}
            onWhatsappToggle={() => setEnableWhatsapp(!enableWhatsapp)}
          />

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
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
                  Go get a job!
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function JobSearchRule() {
  return (
    <JobSearchProvider>
      <JobSearchRuleContent />
    </JobSearchProvider>
  );
}