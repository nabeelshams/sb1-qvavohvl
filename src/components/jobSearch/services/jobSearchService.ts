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

  console.log('Saving job search rules:', {
    userId,
    formData,
    fullWhatsappNumber
  });

  const { error } = await supabase
    .from('cv_details')
    .update({
      job_titles: formData.job_title,  // Changed from array to single string
      country: formData.country,
      city: formData.city,
      salary_min: formData.salary_range.min,
      salary_max: formData.salary_range.max,
      job_type_preferences: formData.job_type_preferences,
      notify_whatsapp: fullWhatsappNumber,
      email: formData.email
    })
    .eq('uid', userId);

  if (error) {
    console.error('Error saving job search rules:', error);
    throw error;
  }
}

export async function startJobSearch(
  userId: string,
  formData: JobSearchFormData,
  enableWhatsapp: boolean,
  countryCode: string,
  whatsappNumber: string,
  jobId: string
) {
  console.log('Starting job search with data:', {
    userId,
    formData,
    enableWhatsapp,
    countryCode,
    whatsappNumber,
    jobId
  });

  // First, save the job search rules
  await saveJobSearchRules(userId, formData, enableWhatsapp, countryCode, whatsappNumber);

  // Fetch additional CV details
  const { data: cvDetails, error: cvError } = await supabase
    .from('cv_details')
    .select('summary, experience, education, skills, certifications, languages, job_type_preferences')
    .eq('uid', userId)
    .single();

  if (cvError) {
    console.error('Error fetching CV details:', cvError);
    throw cvError;
  }

  console.log('CV details fetched:', cvDetails);

  // Prepare webhook data
  const webhookData = {
    uid: userId,
    job_id: jobId || 'default',  // Provide a default value if jobId is undefined
    job_title: formData.job_title,  // Changed from job_titles array
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

  console.log('Webhook data prepared:', webhookData);

  try {
    // Trigger webhook
    const response = await fetch('https://hook.eu2.make.com/jtaieaifo26rr1dwz7knyq1lg54lby2i', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook response error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Failed to start job search: ${response.statusText}`);
    }

    console.log('Job search started successfully');
  } catch (error) {
    console.error('Error triggering webhook:', error);
    throw error;
  }
}