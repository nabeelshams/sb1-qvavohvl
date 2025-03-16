import { JobSearchFormData } from '../../../types/jobSearch';
import toast from 'react-hot-toast';

export function useFormValidation() {
  const validateRequiredFields = (formData: JobSearchFormData, enableWhatsapp: boolean, whatsappNumber: string) => {
    if (!formData.job_title?.trim()) {
      toast.error('Please enter a job title');
      return false;
    }
    if (!formData.country.trim()) {
      toast.error('Please select a country');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error('Please enter a city');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter an email address');
      return false;
    }
    if (enableWhatsapp && !whatsappNumber) {
      toast.error('Please enter a WhatsApp number');
      return false;
    }
    return true;
  };

  return {
    validateRequiredFields
  };
}