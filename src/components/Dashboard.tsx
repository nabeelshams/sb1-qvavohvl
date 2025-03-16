import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Upload, RefreshCcw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function Dashboard() {
  const [hasCV, setHasCV] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  const checkCVStatus = async (retry = false) => {
    try {
      if (retry) {
        setIsLoading(true);
        setError(null);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Authentication error. Please try logging in again.');
        return;
      }

      const { data, error } = await supabase
        .from('cv_details')
        .select('uid')
        .eq('uid', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setHasCV(!!data);
      setRetryCount(0); // Reset retry count on success
    } catch (error: any) {
      console.error('Error checking user status:', error);
      
      // Handle retry logic
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => checkCVStatus(true), RETRY_DELAY * Math.pow(2, retryCount));
        return;
      }

      const errorMessage = error.message === 'Failed to fetch' 
        ? 'Connection error. Please check your internet connection.'
        : error.message;
      
      setError(errorMessage);
      toast.error('Connection error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkCVStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white">
        <div className="max-w-6xl mx-auto px-8 pt-20 pb-8">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white">
        <div className="max-w-6xl mx-auto px-8 pt-20 pb-8">
          <div className="bg-red-900/30 backdrop-blur-sm p-6 rounded-lg mb-8 border border-red-500/30 ml-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-red-200">{error}</p>
              <button
                onClick={() => checkCVStatus(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white">
      <div className="max-w-6xl mx-auto px-8 pt-20 pb-8">
        {/* CV Upload Notice */}
        {hasCV === false && (
          <div className="bg-blue-900/30 backdrop-blur-sm p-6 rounded-lg mb-8 border border-blue-500/30 ml-12">
            <div className="flex items-center gap-4">
              <Upload className="w-8 h-8 text-blue-400" />
              <div>
                <h3 className="text-xl font-semibold text-blue-300">Upload Your CV</h3>
                <p className="text-blue-200/80 mt-1">
                  Get started by uploading your CV to unlock all features.
                </p>
              </div>
              <Link
                to="/upload-cv"
                className="ml-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Upload Now
              </Link>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="bg-black/30 backdrop-blur-sm p-8 rounded-lg shadow-xl ring-1 ring-white/20 animate-glow ml-12">
          <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
          <div className="text-gray-300">
            <p className="text-xl">🚧 Work in Progress</p>
            <p className="mt-4">
              We're building something amazing for you. Stay tuned for exciting features and updates!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}