import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { CVDetails } from '../types/cv';
import { fetchCVDetails, saveCVDetails, startPolling } from '../services/cvService';
import { PersonalInfo } from './cv/PersonalInfo';
import { ExperienceSection } from './cv/ExperienceSection';
import { EducationSection } from './cv/EducationSection';
import { SkillsSection } from './cv/SkillsSection';
import { CertificationsSection } from './cv/CertificationsSection';
import { LanguagesSection } from './cv/LanguagesSection';
import { ActivitiesSection } from './cv/ActivitiesSection';
import { ReferencesSection } from './cv/ReferencesSection';
import { ValidationChecklist } from './cv/ValidationChecklist';

const defaultFormData: CVDetails = {
  full_name: '',
  phone_number: '',
  email: '',
  address: '',
  website_or_portfolio: '',
  summary: '',
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
  activities: [],
  reference_list: []
};

export function CVDetailsForm() {
  const { cvUrl } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get('isNew') === 'true';
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState('');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [isDataPopulated, setIsDataPopulated] = useState(false);
  const [formData, setFormData] = useState<CVDetails>(defaultFormData);

  useEffect(() => {
    const loadCVDetails = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Start polling immediately
        toast.loading('Processing CV details, please wait...', { duration: 3000 });
        const interval = await startPolling(user.id, (populatedData) => {
          setFormData(populatedData);
          setIsDataPopulated(true);
          setLoading(false);
          toast.success('CV details have been processed and loaded!');
        });
        setPollingInterval(interval);
      } catch (error: any) {
        toast.error(error.message);
        setLoading(false);
      }
    };

    loadCVDetails();

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [cvUrl]);

  const handleInputChange = (field: keyof CVDetails, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(newSkill.trim())) {
        handleInputChange('skills', [...formData.skills, newSkill.trim()]);
      }
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    handleInputChange(
      'skills',
      formData.skills.filter(skill => skill !== skillToRemove)
    );
  };

  const validateMandatoryFields = () => {
    if (!formData.full_name.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!formData.phone_number.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error('Please enter your address');
      return false;
    }
    if (!formData.summary.trim()) {
      toast.error('Please provide a professional summary');
      return false;
    }
    if (!formData.education.some(edu => 
      !!edu.institution_name.trim() &&
      !!edu.degree.trim() &&
      !!edu.graduation_year.trim()
    )) {
      toast.error('Please add at least one education entry with institution, degree, and graduation year');
      return false;
    }
    if (formData.skills.length === 0) {
      toast.error('Please add at least one skill');
      return false;
    }
    return true;
  };

  const checkRecommendedFields = () => {
    const missingRecommended = [];
    
    if (!formData.website_or_portfolio.trim()) {
      missingRecommended.push('Website/Portfolio');
    }
    if (formData.experience.length === 0) {
      missingRecommended.push('Work Experience');
    }
    if (formData.certifications.length === 0) {
      missingRecommended.push('Certifications');
    }
    if (formData.activities.length === 0) {
      missingRecommended.push('Activities & Achievements');
    }

    return missingRecommended;
  };

  const handleSave = async () => {
    try {
      if (!validateMandatoryFields()) {
        return;
      }

      const missingRecommended = checkRecommendedFields();
      if (missingRecommended.length > 0) {
        const confirmed = window.confirm(
          `The following recommended sections are incomplete:\n\n${missingRecommended.join('\n')}\n\nThese sections can improve your resume's effectiveness. Do you want to continue anyway?`
        );
        if (!confirmed) {
          return;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await saveCVDetails(user.id, cvUrl, formData);
      toast.success('CV details saved successfully');
      navigate('/job-search-rule', { state: { isNewUser: isNew } });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading || !isDataPopulated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-lg font-medium text-blue-300">
            {!isDataPopulated ? 'Processing your CV...' : 'Loading your CV details...'}
          </p>
          {!isDataPopulated && (
            <p className="text-sm text-blue-200/60">
              This may take a few moments while we analyze your CV
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        {isNew ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-1 bg-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6">
                Step 2 of 3
              </div>
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                Review Your CV Details
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                We've analyzed your CV and extracted the key information. Please review and enhance these details to ensure we find the most relevant job opportunities for you.
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
                <div className="mt-2 w-full h-1 bg-purple-500/50 rounded-full animate-pulse" />
              </div>
              <div className="p-4 bg-black/20 rounded-lg border border-pink-500/20">
                <div className="text-pink-400 font-bold mb-2">Step 3</div>
                <p className="text-sm text-gray-400">Set your job preferences</p>
                <div className="mt-2 w-full h-1 bg-gray-700 rounded-full" />
              </div>
            </div>
          </>
        ) : (
          <h2 className="text-3xl font-bold mb-8">CV Details</h2>
        )}

        <div className="flex gap-8">
          {/* Main Form */}
          <div className="flex-1">
            <div className="bg-black/30 backdrop-blur-sm p-8 rounded-lg shadow-xl ring-1 ring-white/20 animate-glow">
              <PersonalInfo
                fullName={formData.full_name}
                phoneNumber={formData.phone_number}
                email={formData.email}
                website={formData.website_or_portfolio}
                address={formData.address}
                onUpdate={handleInputChange}
              />

              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Professional Summary</h3>
                <textarea
                  placeholder="Write a brief professional summary..."
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  className="w-full bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
                  rows={4}
                />
              </section>

              <ExperienceSection
                experiences={formData.experience}
                onAdd={() => handleInputChange('experience', [...formData.experience, {
                  end_date: 'Present',
                  location: '',
                  job_title: '',
                  start_date: '',
                  description: '',
                  company_name: ''
                }])}
                onUpdate={(index, experience) => handleInputChange('experience', 
                  formData.experience.map((exp, i) => i === index ? experience : exp)
                )}
                onRemove={(index) => handleInputChange('experience',
                  formData.experience.filter((_, i) => i !== index)
                )}
              />

              <EducationSection
                education={formData.education}
                onAdd={() => handleInputChange('education', [...formData.education, {
                  major: '',
                  minor: '',
                  degree: '',
                  additional_info: '',
                  graduation_year: '',
                  institution_name: ''
                }])}
                onUpdate={(index, education) => handleInputChange('education',
                  formData.education.map((edu, i) => i === index ? education : edu)
                )}
                onRemove={(index) => handleInputChange('education',
                  formData.education.filter((_, i) => i !== index)
                )}
              />

              <SkillsSection
                skills={formData.skills}
                newSkill={newSkill}
                onNewSkillChange={setNewSkill}
                onAddSkill={handleAddSkill}
                onRemoveSkill={handleRemoveSkill}
              />

              <CertificationsSection
                certifications={formData.certifications}
                onAdd={() => handleInputChange('certifications', [...formData.certifications, {
                  issue_date: '',
                  expiry_date: '',
                  certification: '',
                  issuing_organization: ''
                }])}
                onUpdate={(index, certification) => handleInputChange('certifications',
                  formData.certifications.map((cert, i) => i === index ? certification : cert)
                )}
                onRemove={(index) => handleInputChange('certifications',
                  formData.certifications.filter((_, i) => i !== index)
                )}
              />

              <LanguagesSection
                languages={formData.languages}
                onAdd={() => handleInputChange('languages', [...formData.languages, {
                  language: '',
                  Proficiency: ''
                }])}
                onUpdate={(index, language) => handleInputChange('languages',
                  formData.languages.map((lang, i) => i === index ? language : lang)
                )}
                onRemove={(index) => handleInputChange('languages',
                  formData.languages.filter((_, i) => i !== index)
                )}
              />

              <ActivitiesSection
                activities={formData.activities}
                onAdd={() => handleInputChange('activities', [...formData.activities, {
                  activity: '',
                  description: ''
                }])}
                onUpdate={(index, activity) => handleInputChange('activities',
                  formData.activities.map((act, i) => i === index ? activity : act)
                )}
                onRemove={(index) => handleInputChange('activities',
                  formData.activities.filter((_, i) => i !== index)
                )}
              />

              <ReferencesSection
                references={formData.reference_list}
                onAdd={() => handleInputChange('reference_list', [...formData.reference_list, {
                  Name: '',
                  contact_info: '',
                  company_or_affiliation: ''
                }])}
                onUpdate={(index, reference) => handleInputChange('reference_list',
                  formData.reference_list.map((ref, i) => i === index ? reference : ref)
                )}
                onRemove={(index) => handleInputChange('reference_list',
                  formData.reference_list.filter((_, i) => i !== index)
                )}
              />

              {/* Save Button */}
              <div className="flex justify-between items-center">
                {isNew && (
                  <div className="text-sm text-gray-400">
                    Next: Set your job preferences and start receiving matched opportunities
                  </div>
                )}
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-5 h-5" /> {isNew ? 'Continue to Next Step' : 'Save Details'}
                </button>
              </div>
            </div>
          </div>

          {/* Validation Checklist */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-24">
              <ValidationChecklist formData={formData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}