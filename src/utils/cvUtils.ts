import { Certification, Language, Activity, Reference } from '../types/cv';

export function parseExperience(data: any) {
  try {
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      return (parsed.Experience || []).map((exp: any) => ({
        end_date: exp.end_date || '',
        location: exp.location || '',
        job_title: exp.job_title || '',
        start_date: exp.start_date || '',
        description: exp.description || '',
        company_name: exp.company_name || ''
      }));
    }
    return (data?.Experience || []).map((exp: any) => ({
      end_date: exp.end_date || '',
      location: exp.location || '',
      job_title: exp.job_title || '',
      start_date: exp.start_date || '',
      description: exp.description || '',
      company_name: exp.company_name || ''
    }));
  } catch {
    return [];
  }
}

export function parseEducation(data: any) {
  try {
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      return (parsed.Education || []).map((edu: any) => ({
        major: edu.major || '',
        minor: edu.minor || '',
        degree: edu.degree || '',
        additional_info: edu.additional_info || '',
        graduation_year: edu.graduation_year || '',
        institution_name: edu.institution_name || ''
      }));
    }
    return (data?.Education || []).map((edu: any) => ({
      major: edu.major || '',
      minor: edu.minor || '',
      degree: edu.degree || '',
      additional_info: edu.additional_info || '',
      graduation_year: edu.graduation_year || '',
      institution_name: edu.institution_name || ''
    }));
  } catch {
    return [];
  }
}

export function parseCertifications(data: any): Certification[] {
  try {
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      return (parsed.certification || []).map((cert: any) => ({
        issue_date: cert.issue_date || '',
        expiry_date: cert.expiry_date || '',
        certification: cert.certification || '',
        issuing_organization: cert.issuing_organization || ''
      }));
    }
    return (data?.certification || []).map((cert: any) => ({
      issue_date: cert.issue_date || '',
      expiry_date: cert.expiry_date || '',
      certification: cert.certification || '',
      issuing_organization: cert.issuing_organization || ''
    }));
  } catch {
    return [];
  }
}

export function parseLanguages(data: any): Language[] {
  try {
    if (typeof data === 'string') {
      // First, fix any missing commas in the JSON string
      const fixedJsonString = data.replace(/}{"language"/g, '},{"language"');
      const parsed = JSON.parse(fixedJsonString);
      
      if (!parsed.languages || !Array.isArray(parsed.languages)) {
        return [];
      }
      
      return parsed.languages.map((lang: any) => ({
        language: lang.language || '',
        Proficiency: lang.Proficiency || ''
      }));
    }
    
    if (data?.languages && Array.isArray(data.languages)) {
      return data.languages.map((lang: any) => ({
        language: lang.language || '',
        Proficiency: lang.Proficiency || ''
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error parsing languages:', error);
    return [];
  }
}

export function parseActivities(data: any): Activity[] {
  try {
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      return (parsed.activities || []).map((act: any) => ({
        activity: act.activity || '',
        description: act.description || ''
      }));
    }
    return (data?.activities || []).map((act: any) => ({
      activity: act.activity || '',
      description: act.description || ''
    }));
  } catch {
    return [];
  }
}

export function parseReferences(data: any): Reference[] {
  try {
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      return (parsed.references || []).map((ref: any) => ({
        Name: ref.Name || '',
        contact_info: ref.contact_info || '',
        company_or_affiliation: ref.company_or_affiliation || ''
      }));
    }
    return (data?.references || []).map((ref: any) => ({
      Name: ref.Name || '',
      contact_info: ref.contact_info || '',
      company_or_affiliation: ref.company_or_affiliation || ''
    }));
  } catch {
    return [];
  }
}

export function parseSkills(data: any): string[] {
  try {
    if (typeof data === 'string') {
      return data.split(',').map((skill: string) => skill.trim()).filter(Boolean);
    }
    if (Array.isArray(data)) {
      return data.map(skill => String(skill).trim()).filter(Boolean);
    }
    if (typeof data === 'object' && data !== null) {
      return Object.values(data).map(skill => String(skill).trim()).filter(Boolean);
    }
    return [];
  } catch {
    return [];
  }
}