import { supabase } from '../../../lib/supabase';
import { JobSearchFormData } from '../../../types/jobSearch';
import { countryCodes } from '../../../utils/countryCodes';

export async function saveJobSearchRules(
  userId: string,
  formData: JobSearchFormData,
  enableWhatsapp: boolean,
  countryCode: string,
  whatsappNumber: string
) {
  const fullWhatsappNumber = enableWhatsapp ? `${countryCode}${whatsappNumber}` : '';

  const { error } = await supabase
    .from('cv_details')
    .update({
      job_titles: formData.job_titles,
      country: formData.country,
      city: formData.city,
      salary_min: formData.salary_range.min,
      salary_max: formData.salary_range.max,
      job_type_preferences: formData.job_type_preferences,
      notify_whatsapp: fullWhatsappNumber,
      email: formData.email
    })
    .eq('uid', userId);

  if (error) throw error;
}

export async function startJobSearch(
  userId: string,
  formData: JobSearchFormData,
  enableWhatsapp: boolean,
  countryCode: string,
  whatsappNumber: string,
  jobId: string
) {
  // First, save the job search rules
  await saveJobSearchRules(userId, formData, enableWhatsapp, countryCode, whatsappNumber);

  // Fetch additional CV details
  const { data: cvDetails, error: cvError } = await supabase
    .from('cv_details')
    .select('summary, experience, education, skills, certifications, languages, job_type_preferences')
    .eq('uid', userId)
    .single();

  if (cvError) throw cvError;

  // Prepare webhook data
  const webhookData = {
    uid: userId,
    job_id: jobId,
    job_titles: formData.job_titles,
    country: formData.country,
    country_code: countryCodes[formData.country] || '',
    city: formData.city,
    salary_min: formData.salary_range.min,
    salary_max: formData.salary_range.max,
    job_type_preferences: Object.entries(formData.job_type_preferences)
      .filter(([_, value]) => value === true || value === 'true')
      .map(([key, _]) => key.toLowerCase())
      .join(', '),
    remote_work: formData.job_type_preferences.remote === 'remote',
    email: formData.email,
    whatsapp: enableWhatsapp ? `${countryCode}${whatsappNumber}` : null,
    summary: cvDetails?.summary || '',
    experience: cvDetails?.experience || [],
    education: cvDetails?.education || [],
    skills: Array.isArray(cvDetails?.skills) 
      ? cvDetails.skills.join(', ')
      : typeof cvDetails?.skills === 'string'
        ? cvDetails.skills
        : '',
    certifications: cvDetails?.certifications || [],
    languages: cvDetails?.languages || []
  };

  // Trigger webhook
  const response = await fetch('https://hook.eu2.make.com/jtaieaifo26rr1dwz7knyq1lg54lby2i', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(webhookData),
  });

  if (!response.ok) {
    throw new Error('Failed to start job search');
  }
}