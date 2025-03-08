import React from 'react';
import { FileText, Settings, HelpCircle, LayoutDashboard, Upload, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function Sidebar() {
  const navigate = useNavigate();

  const handleCVManager = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('cv_details')
        .select('cv_url')
        .eq('uid', user.id)
        .single();

      if (error) throw error;

      if (data?.cv_url) {
        navigate(`/cv-details/${encodeURIComponent(data.cv_url)}`);
      } else {
        navigate('/upload-cv');
        toast.error('Please upload a CV first');
      }
    } catch (error: any) {
      toast.error(error.message);
      navigate('/upload-cv');
    }
  };

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40">
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 shadow-xl ring-1 ring-white/20 animate-glow">
        <nav className="flex flex-col space-y-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-3 hover:bg-white/10 rounded-lg transition-colors group relative"
          >
            <LayoutDashboard className="w-6 h-6 text-white/80" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-black/50 rounded text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Dashboard
            </span>
          </button>
          <button 
            onClick={handleCVManager}
            className="p-3 hover:bg-white/10 rounded-lg transition-colors group relative"
          >
            <FileText className="w-6 h-6 text-white/80" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-black/50 rounded text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              CV Manager
            </span>
          </button>
          <button 
            onClick={() => navigate('/upload-cv')}
            className="p-3 hover:bg-white/10 rounded-lg transition-colors group relative"
          >
            <Upload className="w-6 h-6 text-white/80" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-black/50 rounded text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Upload CV
            </span>
          </button>
          <button 
            onClick={() => navigate('/jobs-found')}
            className="p-3 hover:bg-white/10 rounded-lg transition-colors group relative"
          >
            <Briefcase className="w-6 h-6 text-white/80" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-black/50 rounded text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Jobs Found
            </span>
          </button>
          <button className="p-3 hover:bg-white/10 rounded-lg transition-colors group relative">
            <Settings className="w-6 h-6 text-white/80" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-black/50 rounded text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Settings
            </span>
          </button>
          <button className="p-3 hover:bg-white/10 rounded-lg transition-colors group relative">
            <HelpCircle className="w-6 h-6 text-white/80" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-black/50 rounded text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Help
            </span>
          </button>
        </nav>
      </div>
    </div>
  );
}