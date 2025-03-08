import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useOptimizedResume } from '../hooks/useOptimizedResume';
import { Editor } from './resume/Editor';
import { KeywordsList } from './resume/KeywordsList';
import { OriginalResume } from './resume/OriginalResume';
import { MatchGauge } from './job/MatchGauge';

type TabType = 'optimized' | 'original';

export function ResumeOptimization() {
  const params = useParams<{ userId: string; jobId: string; optimizationId: string }>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [editedResume, setEditedResume] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('optimized');

  // Validate required parameters
  if (!params.userId || !params.jobId || !params.optimizationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white p-8 pt-24">
        <div className="max-w-7xl mx-auto ml-20">
          <div className="bg-red-900/30 backdrop-blur-sm p-8 rounded-lg shadow-xl ring-1 ring-red-500/20">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Invalid Request</h2>
            <p className="text-red-200">Missing required parameters. Please ensure you have a valid URL.</p>
          </div>
        </div>
      </div>
    );
  }

  const { optimizedResume, loading, error } = useOptimizedResume({
    userId: params.userId,
    jobId: params.jobId,
    optimizationId: params.optimizationId
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user && user.id === params.userId);
    };
    
    checkAuth();
  }, [params.userId]);

  useEffect(() => {
    if (optimizedResume?.optimized_resume) {
      const cleanHtml = optimizedResume.optimized_resume.replace(/```html\n?|\n?```/g, '');
      setEditedResume(cleanHtml);
    }
  }, [optimizedResume]);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('optimized_resumes')
        .update({ optimized_resume: editedResume })
        .eq('id', params.optimizationId);

      if (error) throw error;
      toast.success('Resume saved successfully!');
    } catch (error: any) {
      toast.error('Failed to save resume: ' + error.message);
    }
  };

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 ml-20">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 ml-20">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          <h2 className="text-2xl font-bold text-blue-300">Optimizing Resume</h2>
          <p className="text-gray-400">Please wait while we optimize your resume...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white p-8 pt-24">
        <div className="max-w-7xl mx-auto ml-20">
          <div className="bg-red-900/30 backdrop-blur-sm p-8 rounded-lg shadow-xl ring-1 ring-red-500/20">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!optimizedResume || !optimizedResume.optimized_resume) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 ml-20">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          <h2 className="text-2xl font-bold text-blue-300">Waiting for Optimization</h2>
          <p className="text-gray-400">Your resume is being optimized. This may take a few moments...</p>
        </div>
      </div>
    );
  }

  // Clean the HTML content
  const optimizedHtml = optimizedResume.optimized_resume.replace(/```html\n?|\n?```/g, '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white p-8 pt-24">
      <div className="max-w-7xl mx-auto ml-20">
        <div className="flex gap-4">
          {/* Left Section - 70% */}
          <div className="flex-[0.7] h-[calc(100vh-8rem)]">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg shadow-xl ring-1 ring-white/20 h-full flex flex-col">
              {/* Tabs */}
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => setActiveTab('optimized')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'optimized'
                      ? 'border-b-2 border-blue-500 text-blue-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Optimized Resume
                </button>
                <button
                  onClick={() => setActiveTab('original')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'original'
                      ? 'border-b-2 border-blue-500 text-blue-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Original Resume
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6">
                  {activeTab === 'optimized' ? (
                    <Editor
                      content={editedResume || optimizedHtml}
                      onChange={setEditedResume}
                    />
                  ) : (
                    <OriginalResume userId={params.userId} />
                  )}
                </div>
              </div>

              {/* Save Button */}
              {activeTab === 'optimized' && (
                <div className="p-4 border-t border-white/10 bg-black/20">
                  <button
                    onClick={handleSave}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - 30% */}
          <div className="flex-[0.3] space-y-4">
            {/* ATS Score */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg shadow-xl ring-1 ring-white/20 p-6">
              <h2 className="text-xl font-semibold mb-4">ATS Score</h2>
              <div className="flex justify-center">
                <MatchGauge
                  percentage={85}
                  size="lg"
                  label="ATS Compatibility"
                />
              </div>
            </div>

            {/* Keywords and Requirements */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg shadow-xl ring-1 ring-white/20 p-6">
              <KeywordsList metadata={optimizedResume.metadata ? JSON.parse(optimizedResume.metadata) : {}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}