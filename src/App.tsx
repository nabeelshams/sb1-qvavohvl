import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthForm } from './components/AuthForm';
import { ContactForm } from './components/ContactForm';
import { FloatingMenu } from './components/FloatingMenu';
import { Sidebar } from './components/Sidebar';
import { CVDetailsForm } from './components/CVDetailsForm';
import { JobSearchRule } from './components/JobSearchRule';
import { JobFound } from './components/JobFound';
import { Dashboard } from './components/Dashboard';
import { OptimizedResumes } from './components/OptimizedResumes';
import ResumeOptimization from './components/ResumeOptimization';
import { supabase } from './lib/supabase';

function AppContent() {
  const [session, setSession] = useState<any>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();

  const checkIfNewUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('cv_details')
        .select('cv_url')
        .eq('uid', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        setIsNewUser(true);
      } else if (error) {
        throw error;
      } else {
        setIsNewUser(!data.cv_url);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkIfNewUser(session.user.id);
        // Redirect to dashboard or upload-cv on login
        if (window.location.pathname === '/') {
          navigate(isNewUser ? '/upload-cv' : '/dashboard', { replace: true });
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkIfNewUser(session.user.id);
        // Redirect to dashboard or upload-cv on login
        if (window.location.pathname === '/') {
          navigate(isNewUser ? '/upload-cv' : '/dashboard', { replace: true });
        }
      } else {
        // On logout, redirect to root
        navigate('/', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isNewUser]);

  if (!session) {
    return <AuthForm />;
  }

  return (
    <>
      <Toaster position="top-right" />
      <FloatingMenu />
      <Sidebar />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload-cv" element={<ContactForm isNewUser={isNewUser} />} />
        <Route path="/cv-details/:cvUrl" element={<CVDetailsForm />} />
        <Route path="/job-search-rule" element={<JobSearchRule isNewUser={isNewUser} />} />
        <Route path="/jobs-found" element={<JobFound />} />
        <Route path="/optimized-resumes" element={<OptimizedResumes />} />
        <Route path="/resume-optimization/:userId/:jobId/:optimizationId" element={<ResumeOptimization />} />
        <Route path="/" element={
          isNewUser ? <Navigate to="/upload-cv" replace /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;