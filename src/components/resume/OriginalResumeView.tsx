import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface OriginalResumeViewProps {
  userId: string;
}

export function OriginalResumeView({ userId }: OriginalResumeViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cvData, setCvData] = useState<any>(null);

  useEffect(() => {
    const fetchCVDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('cv_details')
          .select('*')
          .eq('uid', userId)
          .single();

        if (error) throw error;
        setCvData(data);
      } catch (err: any) {
        console.error('Error fetching CV details:', err);
        setError(err.message);
        toast.error('Failed to load CV details');
      } finally {
        setLoading(false);
      }
    };

    fetchCVDetails();
  }, [userId]);

  const formatExperience = (data: string | null) => {
    if (!data) return [];
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return parsed.Experience || [];
    } catch {
      return [];
    }
  };

  const formatEducation = (data: string | null) => {
    if (!data) return [];
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return parsed.Education || [];
    } catch {
      return [];
    }
  };

  const formatCertifications = (data: string | null) => {
    if (!data) return [];
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return parsed.certification || [];
    } catch {
      return [];
    }
  };

  const formatLanguages = (data: string | null) => {
    if (!data) return [];
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return parsed.languages || [];
    } catch {
      return [];
    }
  };

  const formatActivities = (data: string | null) => {
    if (!data) return [];
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return parsed.activities || [];
    } catch {
      return [];
    }
  };

  const formatReferences = (data: string | null) => {
    if (!data) return [];
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return parsed.references || [];
    } catch {
      return [];
    }
  };

  const formatSkills = (skills: any): string => {
    if (!skills) return '';
    
    try {
      // If skills is already a string, return it
      if (typeof skills === 'string') {
        return skills;
      }
      
      // If skills is an array, join with commas
      if (Array.isArray(skills)) {
        return skills.join(', ');
      }
      
      // If skills is an object, convert values to array and join
      if (typeof skills === 'object') {
        return Object.values(skills).join(', ');
      }
      
      return '';
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400">Loading CV details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="p-4">
        <p className="text-yellow-400">No CV details found</p>
      </div>
    );
  }

  const experiences = formatExperience(cvData.experience);
  const education = formatEducation(cvData.education);
  const certifications = formatCertifications(cvData.certifications);
  const languages = formatLanguages(cvData.languages);
  const activities = formatActivities(cvData.activities);
  const references = formatReferences(cvData.reference_list);
  const skills = formatSkills(cvData.skills);

  return (
    <div className="prose prose-invert max-w-none">
      <h1>{cvData.full_name}</h1>
      <p>
        <strong>Phone:</strong> {cvData.phone_number} | <strong>Email:</strong> {cvData.email}
      </p>
      <p><strong>Address:</strong> {cvData.address}</p>
      {cvData.website_or_portfolio && (
        <p>{cvData.website_or_portfolio}</p>
      )}

      <h2>Summary</h2>
      <p>{cvData.summary}</p>

      <h2>Experience</h2>
      {experiences.map((exp: any, index: number) => (
        <div key={index}>
          <h3>{exp.job_title}</h3>
          <p>{exp.company_name}</p>
          <p>{exp.start_date} - {exp.end_date}</p>
          {exp.location && <p>{exp.location}</p>}
          <div dangerouslySetInnerHTML={{ __html: exp.description.replace(/\n/g, '<br/>') }} />
        </div>
      ))}

      <h2>Education</h2>
      {education.map((edu: any, index: number) => (
        <div key={index}>
          <h3>{edu.institution_name}</h3>
          <p>{edu.degree} in {edu.major}</p>
          {edu.minor && <p>Minor: {edu.minor}</p>}
          <p>Graduation Year: {edu.graduation_year}</p>
          {edu.additional_info && <p>{edu.additional_info}</p>}
        </div>
      ))}

      <h2>Skills</h2>
      <p>{skills}</p>

      <h2>Certifications</h2>
      {certifications.map((cert: any, index: number) => (
        <div key={index}>
          <h3>{cert.certification}</h3>
          <p>{cert.issuing_organization}</p>
          <p>Valid: {new Date(cert.issue_date).toLocaleDateString()} - {new Date(cert.expiry_date).toLocaleDateString()}</p>
        </div>
      ))}

      <h2>Languages</h2>
      {languages.map((lang: any, index: number) => (
        <p key={index}>{lang.language}: {lang.Proficiency}</p>
      ))}

      <h2>Activities & Volunteering</h2>
      {activities.map((activity: any, index: number) => (
        <div key={index}>
          <h3>{activity.activity}</h3>
          <p>{activity.description}</p>
        </div>
      ))}

      <h2>References</h2>
      {references.map((ref: any, index: number) => (
        <div key={index}>
          <h3>{ref.Name}</h3>
          <p>{ref.company_or_affiliation}</p>
          <p>{ref.contact_info}</p>
        </div>
      ))}
    </div>
  );
}