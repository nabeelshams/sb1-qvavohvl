import React from 'react';
import { Check, AlertCircle, Circle } from 'lucide-react';
import { CVDetails } from '../../types/cv';

interface ValidationChecklistProps {
  formData: CVDetails;
}

export function ValidationChecklist({ formData }: ValidationChecklistProps) {
  // Mandatory checks
  const mandatoryChecks = [
    {
      label: 'Full Name',
      isComplete: !!formData.full_name.trim(),
    },
    {
      label: 'Phone Number',
      isComplete: !!formData.phone_number.trim(),
    },
    {
      label: 'Email',
      isComplete: !!formData.email.trim(),
    },
    {
      label: 'Address',
      isComplete: !!formData.address.trim(),
    },
    {
      label: 'Professional Summary',
      isComplete: !!formData.summary.trim(),
    },
    {
      label: 'Education Details',
      isComplete: formData.education.some(edu => 
        !!edu.institution_name.trim() &&
        !!edu.degree.trim() &&
        !!edu.graduation_year.trim()
      ),
    },
    {
      label: 'Skills (at least one)',
      isComplete: formData.skills.length > 0,
    },
  ];

  // Recommended checks
  const recommendedChecks = [
    {
      label: 'Website/Portfolio',
      isComplete: !!formData.website_or_portfolio.trim(),
    },
    {
      label: 'Work Experience',
      isComplete: formData.experience.length > 0,
    },
    {
      label: 'Certifications',
      isComplete: formData.certifications.length > 0,
    },
    {
      label: 'Activities & Achievements',
      isComplete: formData.activities.length > 0,
    },
  ];

  const mandatoryCompleted = mandatoryChecks.filter(check => check.isComplete).length;
  const recommendedCompleted = recommendedChecks.filter(check => check.isComplete).length;

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          Mandatory Fields
          <span className="text-sm font-normal text-gray-400">
            ({mandatoryCompleted}/{mandatoryChecks.length})
          </span>
        </h3>
        <div className="space-y-2">
          {mandatoryChecks.map((check, index) => (
            <div 
              key={index}
              className={`flex items-center gap-2 p-2 rounded ${
                check.isComplete ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'
              }`}
            >
              {check.isComplete ? (
                <Check className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
              <span className="text-sm">{check.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          Recommended Fields
          <span className="text-sm font-normal text-gray-400">
            ({recommendedCompleted}/{recommendedChecks.length})
          </span>
        </h3>
        <div className="space-y-2">
          {recommendedChecks.map((check, index) => (
            <div 
              key={index}
              className={`flex items-center gap-2 p-2 rounded ${
                check.isComplete ? 'text-green-400 bg-green-900/20' : 'text-yellow-400 bg-yellow-900/20'
              }`}
            >
              {check.isComplete ? (
                <Check className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
              <span className="text-sm">{check.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}