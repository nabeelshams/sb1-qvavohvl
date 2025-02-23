import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await saveCVDetails(user.id, cvUrl, formData);
      toast.success('CV details saved successfully');
      navigate('/job-search-rule');
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
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/30 backdrop-blur-sm p-8 rounded-lg shadow-xl ring-1 ring-white/20 animate-glow">
          <h2 className="text-3xl font-bold mb-8">CV Details</h2>
          
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
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              <Save className="w-5 h-5" /> Save Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}