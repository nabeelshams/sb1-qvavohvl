import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Loader2, Save, Sparkles, FileDown, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useOptimizedResume } from '../hooks/useOptimizedResume';
import { useATSScore } from '../hooks/useATSScore';
import { Editor } from './resume/Editor';
import { KeywordsList } from './resume/KeywordsList';
import { OriginalResume } from './resume/OriginalResume';
import { ATSCheckpoints } from './resume/ATSCheckpoints';
import { MatchGauge } from './job/MatchGauge';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType, convertInchesToTwip } from 'docx';
import pdfMake from '../lib/pdfmake';
import htmlToPdfmake from 'html-to-pdfmake';

export function ResumeOptimization() {
  const params = useParams<{ userId: string; jobId: string; optimizationId: string }>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [editedResume, setEditedResume] = useState('');
  const [activeTab, setActiveTab] = useState<'optimized' | 'original' | 'ats'>('optimized');
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [downloading, setDownloading] = useState<'pdf' | 'doc' | null>(null);

  // Validate required parameters
  if (!params.userId || !params.jobId || !params.optimizationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white p-8 pt-16">
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

  const { atsScore, atsData, loading: atsLoading } = useATSScore({
    optimizationId: params.optimizationId
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user && user.id === params.userId);
    };
    
    checkAuth();
  }, [params.userId]);

  // Update editedResume when optimizedResume changes
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

  const handleKeywordClick = (keyword: string) => {
    if (editorInstance && activeTab === 'optimized') {
      const { state, view } = editorInstance;
      const { selection } = state;
      const position = selection.$head.pos;
      
      view.dispatch(view.state.tr.insertText(keyword + ' ', position));
      view.focus();
    }
  };

  const parseHtmlToDocxElements = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const elements: (Paragraph | any)[] = [];

    const processNode = (node: Node): any[] => {
      const result: any[] = [];

      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent?.trim()) {
          return [new TextRun(node.textContent)];
        }
        return [];
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const style = window.getComputedStyle(element);

        switch (element.tagName.toLowerCase()) {
          case 'h1':
            return [new Paragraph({
              text: element.textContent || '',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: convertInchesToTwip(0.4), after: convertInchesToTwip(0.2) }
            })];
          case 'h2':
            return [new Paragraph({
              text: element.textContent || '',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: convertInchesToTwip(0.3), after: convertInchesToTwip(0.15) }
            })];
          case 'h3':
            return [new Paragraph({
              text: element.textContent || '',
              heading: HeadingLevel.HEADING_3,
              spacing: { before: convertInchesToTwip(0.2), after: convertInchesToTwip(0.1) }
            })];
          case 'p':
            const runs: TextRun[] = [];
            element.childNodes.forEach(child => {
              if (child.nodeType === Node.TEXT_NODE) {
                runs.push(new TextRun(child.textContent || ''));
              } else if (child.nodeType === Node.ELEMENT_NODE) {
                const childElement = child as Element;
                switch (childElement.tagName.toLowerCase()) {
                  case 'strong':
                  case 'b':
                    runs.push(new TextRun({
                      text: childElement.textContent || '',
                      bold: true
                    }));
                    break;
                  case 'em':
                  case 'i':
                    runs.push(new TextRun({
                      text: childElement.textContent || '',
                      italics: true
                    }));
                    break;
                  case 'u':
                    runs.push(new TextRun({
                      text: childElement.textContent || '',
                      underline: { type: UnderlineType.SINGLE }
                    }));
                    break;
                }
              }
            });
            return [new Paragraph({
              children: runs,
              spacing: { after: convertInchesToTwip(0.15) }
            })];
          case 'ul':
          case 'ol':
            const listItems: Paragraph[] = [];
            element.querySelectorAll('li').forEach((li, index) => {
              listItems.push(new Paragraph({
                text: li.textContent || '',
                bullet: {
                  level: 0
                },
                spacing: { after: convertInchesToTwip(0.1) }
              }));
            });
            return listItems;
        }

        // Process child nodes recursively
        element.childNodes.forEach(child => {
          result.push(...processNode(child));
        });
      }

      return result;
    };

    return processNode(doc.body);
  };

  const downloadAsPDF = async () => {
    try {
      setDownloading('pdf');

      // Create a temporary container to clean the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editedResume;

      // Remove any style tags
      const styleTags = tempDiv.getElementsByTagName('style');
      while (styleTags.length > 0) {
        styleTags[0].parentNode?.removeChild(styleTags[0]);
      }

      // Get the cleaned HTML
      const cleanedHtml = tempDiv.innerHTML;

      // Convert HTML to pdfmake format
      const content = htmlToPdfmake(cleanedHtml, {
        defaultStyles: {
          h1: { fontSize: 24, bold: true, marginBottom: 10 },
          h2: { fontSize: 20, bold: true, marginBottom: 8 },
          h3: { fontSize: 16, bold: true, marginBottom: 6 },
          p: { fontSize: 12, marginBottom: 5 },
          ul: { marginLeft: 20 },
          li: { fontSize: 12 },
          strong: { bold: true },
          em: { italics: true }
        }
      });

      // Create PDF document definition
      const docDefinition = {
        content: [content],
        defaultStyle: {
          font: 'Roboto',
          fontSize: 12,
          lineHeight: 1.5
        },
        pageMargins: [40, 40, 40, 40]
      };

      // Generate and download PDF
      pdfMake.createPdf(docDefinition).download('optimized_resume.pdf');
      
      toast.success('PDF downloaded successfully!');
    } catch (error: any) {
      toast.error('Failed to download PDF: ' + error.message);
    } finally {
      setDownloading(null);
    }
  };

  const downloadAsDoc = async () => {
    try {
      setDownloading('doc');

      // Create a new document
      const doc = new Document({
        sections: [{
          properties: {},
          children: parseHtmlToDocxElements(editedResume)
        }]
      });

      // Generate and download the document
      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'optimized_resume.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('DOCX downloaded successfully!');
    } catch (error: any) {
      toast.error('Failed to download DOCX: ' + error.message);
    } finally {
      setDownloading(null);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white p-8 pt-16">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white p-8 pt-16">
      <div className="flex">
        {/* Left Section - Fixed - 75% */}
        <div className="fixed top-16 bottom-8 left-28 right-[24%] pr-4">
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
              {!atsLoading && atsData && (
                <button
                  onClick={() => setActiveTab('ats')}
                  className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${
                    activeTab === 'ats'
                      ? 'border-b-2 border-purple-500 text-purple-400 bg-purple-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-purple-500/5'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  ATS Check Points
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-6">
                {activeTab === 'optimized' ? (
                  <Editor
                    key={`editor-${editedResume.length}`}
                    content={editedResume}
                    onChange={setEditedResume}
                    onEditorReady={setEditorInstance}
                  />
                ) : activeTab === 'original' ? (
                  <OriginalResume userId={params.userId} />
                ) : (
                  <ATSCheckpoints data={atsData} />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {activeTab === 'optimized' && (
              <div className="p-4 border-t border-white/10 bg-black/20 flex justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={downloadAsPDF}
                    disabled={downloading === 'pdf'}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {downloading === 'pdf' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileDown className="w-4 h-4" />
                    )}
                    Download PDF
                  </button>
                  <button
                    onClick={downloadAsDoc}
                    disabled={downloading === 'doc'}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {downloading === 'doc' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    Download DOCX
                  </button>
                </div>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - 24% */}
        <div className="w-[24%] ml-[76%] space-y-3 pb-8">
          {/* ATS Score */}
          <div className="bg-black/30 backdrop-blur-sm rounded-lg shadow-xl ring-1 ring-white/20 p-4">
            <h2 className="text-lg font-semibold mb-2">ATS Score</h2>
            <div className="flex justify-center scale-75 origin-center">
              <MatchGauge
                percentage={atsScore}
                size="lg"
                loading={atsLoading}
                label="ATS Compatibility"
              />
            </div>
          </div>

          {/* Keywords and Requirements */}
          <div className="bg-black/30 backdrop-blur-sm rounded-lg shadow-xl ring-1 ring-white/20 p-4">
            <KeywordsList 
              metadata={optimizedResume.metadata ? 
                (typeof optimizedResume.metadata === 'string' ? 
                  JSON.parse(optimizedResume.metadata) : 
                  optimizedResume.metadata
                ) : {}}
              onKeywordClick={handleKeywordClick}
              isClickable={activeTab === 'optimized'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}