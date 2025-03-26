import { supabase } from '../lib/supabase';
import { CVDetails } from '../types/cv';
import { parseExperience, parseEducation, parseCertifications, parseLanguages, parseActivities, parseReferences, parseSkills } from '../utils/cvUtils';

export async function fetchCVDetails(userId: string) {
  const { data, error } = await supabase
    .from('cv_details')
    .select('*')
    .eq('uid', userId)
    .single();

  if (error) throw error;

  if (data) {
    return {
      full_name: data.full_name || '',
      phone_number: data.phone_number || '',
      email: data.email || '',
      address: data.address || '',
      website_or_portfolio: data.website_or_portfolio || '',
      summary: data.summary || '',
      experience: parseExperience(data.experience),
      education: parseEducation(data.education),
      skills: parseSkills(data.skills),
      certifications: parseCertifications(data.certifications),
      languages: parseLanguages(data.languages),
      activities: parseActivities(data.activities),
      reference_list: parseReferences(data.reference_list)
    };
  }

  return null;
}

export async function saveCVDetails(userId: string, cvUrl: string | undefined, data: CVDetails) {
  const dataToSave = {
    uid: userId,
    cv_url: cvUrl,
    ...data,
    experience: JSON.stringify({ Experience: data.experience }),
    education: JSON.stringify({ Education: data.education }),
    certifications: JSON.stringify({ certification: data.certifications }),
    languages: JSON.stringify({ languages: data.languages }),
    activities: JSON.stringify({ activities: data.activities }),
    reference_list: JSON.stringify({ references: data.reference_list }),
    skills: data.skills.join(', ')
  };

  const { error } = await supabase
    .from('cv_details')
    .upsert(dataToSave);

  if (error) throw error;
}

export async function startPolling(userId: string, callback: (data: CVDetails) => void) {
  try {
    // First check if we already have populated data
    const { data: currentData, error } = await supabase
      .from('cv_details')
      .select('*')
      .eq('uid', userId)
      .single();

    if (error) throw error;

    // If we have data with a full_name, return it immediately
    if (currentData && currentData.full_name) {
      const parsedData = {
        full_name: currentData.full_name || '',
        phone_number: currentData.phone_number || '',
        email: currentData.email || '',
        address: currentData.address || '',
        website_or_portfolio: currentData.website_or_portfolio || '',
        summary: currentData.summary || '',
        experience: parseExperience(currentData.experience),
        education: parseEducation(currentData.education),
        skills: parseSkills(currentData.skills),
        certifications: parseCertifications(currentData.certifications),
        languages: parseLanguages(currentData.languages),
        activities: parseActivities(currentData.activities),
        reference_list: parseReferences(currentData.reference_list)
      };
      callback(parsedData);
      return null; // Return null instead of an interval since we don't need to poll
    }

    // If no populated data found, start polling
    const interval = setInterval(async () => {
      try {
        const { data: updatedData } = await supabase
          .from('cv_details')
          .select('*')
          .eq('uid', userId)
          .single();

        if (updatedData && updatedData.full_name) {
          clearInterval(interval);
          const parsedData = {
            full_name: updatedData.full_name || '',
            phone_number: updatedData.phone_number || '',
            email: updatedData.email || '',
            address: updatedData.address || '',
            website_or_portfolio: updatedData.website_or_portfolio || '',
            summary: updatedData.summary || '',
            experience: parseExperience(updatedData.experience),
            education: parseEducation(updatedData.education),
            skills: parseSkills(updatedData.skills),
            certifications: parseCertifications(updatedData.certifications),
            languages: parseLanguages(updatedData.languages),
            activities: parseActivities(updatedData.activities),
            reference_list: parseReferences(updatedData.reference_list)
          };
          callback(parsedData);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000);

    return interval;
  } catch (error) {
    console.error('Error in startPolling:', error);
    throw error;
  }
}