import { JobMatchData } from '../types/jobMatch';

export function parseJobMatch(jobMatch: any): JobMatchData | null {
  if (!jobMatch) return null;
  
  try {
    let rawMatch: any;
    
    if (typeof jobMatch === 'string') {
      // Remove code block markers and clean the string
      const cleanJson = jobMatch.replace(/```json\n|\n```/g, '').trim();
      try {
        // Handle double-encoded JSON
        rawMatch = JSON.parse(cleanJson);
        if (typeof rawMatch === 'string') {
          rawMatch = JSON.parse(rawMatch);
        }
      } catch {
        // If parsing fails, try the original string
        rawMatch = JSON.parse(jobMatch);
      }
    } else if (typeof jobMatch === 'object' && !Array.isArray(jobMatch)) {
      rawMatch = jobMatch;
    } else {
      console.error('Invalid job match data type:', typeof jobMatch);
      return null;
    }

    // Extract match percentages from the correct fields
    const overallPercentage = rawMatch["Overall Match Score"]?.overall_percentage ?? 0;
    const skillsMatch = rawMatch["Skills Match"]?.skills_percentage ?? 0;
    const experienceMatch = rawMatch["Experience Match"]?.experience_percentage ?? 0;
    const educationMatch = rawMatch["Education Match"]?.education_percentage ?? 0;
    const locationMatch = rawMatch["Location Match"]?.location_percentage ?? 0;
    const salaryMatch = rawMatch["Salary Expectation Match"]?.salary_percentage ?? 0;
    const languagesMatch = rawMatch["Languages Match"]?.languages_percentage ?? 0;

    // Extract skills information
    const skillsRationale = rawMatch["Skills Match"]?.skills_rationale || '';
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    
    if (skillsRationale.toLowerCase().includes('matched skills:')) {
      const matched = skillsRationale
        .toLowerCase()
        .split('matched skills:')[1]
        .split(/[.;]/)[0]
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      matchedSkills.push(...matched);
    }
    
    if (skillsRationale.toLowerCase().includes('missing skills:')) {
      const missing = skillsRationale
        .toLowerCase()
        .split('missing skills:')[1]
        .split(/[.;]/)[0]
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      missingSkills.push(...missing);
    }

    // Extract experience details
    const expRationale = rawMatch["Experience Match"]?.experience_rationale || '';
    const yearsRequired = parseInt(expRationale.match(/requires (\d+)/)?.[1] || '0');
    const yearsMatched = parseInt(expRationale.match(/has (\d+)/)?.[1] || '0');

    return {
      match_data: {
        overall_percentage: overallPercentage,
        skills_match: skillsMatch,
        experience_match: experienceMatch,
        education_match: educationMatch,
        location_match: locationMatch,
        salary_match: salaryMatch,
        job_type_match: languagesMatch // Use languages match as job type match
      },
      skills_details: {
        matched: matchedSkills,
        missing: missingSkills
      },
      experience_details: {
        years_required: yearsRequired,
        years_matched: yearsMatched
      },
      rationale: {
        overall: rawMatch["Overall Match Score"]?.overall_summary || 'No summary available',
        skills: rawMatch["Skills Match"]?.skills_rationale || 'No skills rationale available',
        experience: rawMatch["Experience Match"]?.experience_rationale || 'No experience rationale available',
        education: rawMatch["Education Match"]?.education_rationale || 'No education rationale available',
        location: rawMatch["Location Match"]?.location_rationale || 'No location rationale available',
        salary: rawMatch["Salary Expectation Match"]?.salary_rationale || 'No salary rationale available'
      }
    };
  } catch (error) {
    console.error('Error parsing job match:', error);
    return null;
  }
}