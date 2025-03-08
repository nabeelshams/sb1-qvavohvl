import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { MonsterScraper } from '../scraper/monsterscraper/monsterscraper';

export function JobScraper() {
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [maxJobs, setMaxJobs] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobTitle.trim() || !location.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Initialize the scraper
      const scraper = new MonsterScraper();
      
      // Start scraping
      const { jobs } = await scraper.scrapeJobs(jobTitle, location, maxJobs);

      // Store jobs in Supabase
      for (const job of jobs) {
        const { error } = await supabase.from('jobs_found').insert({
          id: user.id,
          job_id: job.jobId,
          title: job.jobTitle,
          company_name: job.companyName,
          location: job.location,
          salary_type: job.salary ? 'yearly' : null,
          description: job.jobDescription,
          date_published: job.postingDate,
          job_url: `https://www.monster.com/job-openings/${job.jobId}`,
          scraped_from: 'monster',
          created_at: new Date().toISOString()
        });

        if (error) {
          console.error('Error storing job:', error);
        }
      }

      toast.success(`Successfully scraped ${jobs.length} jobs!`);
      navigate('/jobs-found');
    } catch (error: any) {
      console.error('Scraping error:', error);
      toast.error('Failed to scrape jobs: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/30 backdrop-blur-sm p-8 rounded-lg shadow-xl ring-1 ring-white/20 animate-glow">
          <div className="flex items-center gap-4 mb-8">
            <Search className="w-8 h-8 text-blue-500" />
            <h2 className="text-3xl font-bold">Job Scraper</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. New York, NY"
                className="w-full bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Maximum Jobs to Scrape
              </label>
              <input
                type="number"
                value={maxJobs}
                onChange={(e) => setMaxJobs(parseInt(e.target.value))}
                min="1"
                max="500"
                className="w-full bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
              />
              <p className="text-sm text-gray-400 mt-1">
                Maximum number of jobs to scrape (1-500)
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Scraping Jobs...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Start Scraping
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}