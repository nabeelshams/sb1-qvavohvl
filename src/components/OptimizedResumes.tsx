import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, FileDown, FileText, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import pdfMake from '../lib/pdfmake';
import htmlToPdfmake from 'html-to-pdfmake';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

interface OptimizedResume {
  id: string;
  job_id: string;
  optimized_resume: string;
  created_at: string;
  job_title?: string;
}

export function OptimizedResumes() {
  const [resumes, setResumes] = useState<OptimizedResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedResumes, setExpandedResumes] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState<{ id: string; format: 'pdf' | 'doc' } | null>(null);

  useEffect(() => {
    fetchOptimizedResumes();
  }, []);

  const fetchOptimizedResumes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: optimizedResumes, error: resumesError } = await supabase
        .from('optimized_resumes')
        .select('id, job_id, optimized_resume, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (resumesError) throw resumesError;

      const resumesWithTitles = await Promise.all(
        (optimizedResumes || []).map(async (resume) => {
          const { data: jobData } = await supabase
            .from('jobs_found')
            .select('title')
            .eq('job_id', resume.job_id)
            .single();

          const cleanedResume = {
            ...resume,
            optimized_resume: resume.optimized_resume.replace(/```html\n?|\n?```/g, ''),
            job_title: jobData?.title || 'Unknown Job'
          };

          return cleanedResume;
        })
      );

      setResumes(resumesWithTitles);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedResumes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const downloadAsPDF = async (resume: OptimizedResume) => {
    try {
      setDownloading({ id: resume.id, format: 'pdf' });

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = resume.optimized_resume;

      const styleTags = tempDiv.getElementsByTagName('style');
      while (styleTags.length > 0) {
        styleTags[0].parentNode?.removeChild(styleTags[0]);
      }

      const content = htmlToPdfmake(tempDiv.innerHTML, {
        defaultStyles: {
          h1: { fontSize: 24, bold: true, marginBottom: 10 },
          h2: { fontSize: 20, bold: true, marginBottom: 8 },
          h3: { fontSize: 16, bold: true, marginBottom: 6 },
          p: { fontSize: 12, marginBottom: 5 },
          ul: { marginLeft: 20 },
          li: { fontSize: 12 }
        }
      });

      const docDefinition = {
        content: [content],
        defaultStyle: {
          font: 'Roboto',
          fontSize: 12,
          lineHeight: 1.5
        },
        pageMargins: [40, 40, 40, 40]
      };

      pdfMake.createPdf(docDefinition).download(`${resume.job_title || 'resume'}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error: any) {
      toast.error('Failed to download PDF: ' + error.message);
    } finally {
      setDownloading(null);
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
              spacing: { before: 240, after: 120 } // 24pt before, 12pt after
            })];
          case 'h2':
            return [new Paragraph({
              text: element.textContent || '',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 } // 20pt before, 10pt after
            })];
          case 'h3':
            return [new Paragraph({
              text: element.textContent || '',
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 160, after: 80 } // 16pt before, 8pt after
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
                }
              }
            });
            return [new Paragraph({
              children: runs,
              spacing: { after: 120 } // 12pt after paragraph
            })];
          case 'ul':
          case 'ol':
            const listItems: Paragraph[] = [];
            element.querySelectorAll('li').forEach((li, index) => {
              listItems.push(new Paragraph({
                children: [new TextRun(`• ${li.textContent || ''}`)],
                spacing: { before: 60, after: 60 }, // 6pt spacing
                indent: { left: 720 } // 0.5 inch indent (720 twips)
              }));
            });
            return listItems;
          case 'div':
            // Process div children recursively
            element.childNodes.forEach(child => {
              result.push(...processNode(child));
            });
            return result;
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

  const downloadAsDoc = async (resume: OptimizedResume) => {
    try {
      setDownloading({ id: resume.id, format: 'doc' });

      const docElements = parseHtmlToDocxElements(resume.optimized_resume);

      const doc = new Document({
        sections: [{
          properties: {},
          children: docElements
        }]
      });

      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resume.job_title || 'resume'}.docx`;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-lg font-medium text-blue-300">Loading optimized resumes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Optimized Resumes</h1>
        
        {resumes.length === 0 ? (
          <div className="bg-black/30 backdrop-blur-sm p-8 rounded-lg text-center">
            <p className="text-gray-400">No optimized resumes found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <div key={resume.id} className="bg-black/30 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-blue-300">{resume.job_title}</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Created on {new Date(resume.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadAsPDF(resume)}
                      disabled={!!downloading}
                      className="flex items-center gap-2 px-3 py-2 bg-purple-600 rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {downloading?.id === resume.id && downloading?.format === 'pdf' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileDown className="w-4 h-4" />
                      )}
                      PDF
                    </button>
                    <button
                      onClick={() => downloadAsDoc(resume)}
                      disabled={!!downloading}
                      className="flex items-center gap-2 px-3 py-2 bg-purple-600 rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {downloading?.id === resume.id && downloading?.format === 'doc' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                      DOC
                    </button>
                    <button
                      onClick={() => toggleExpand(resume.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                    >
                      {expandedResumes.has(resume.id) ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Hide Resume
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Show Resume
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                {expandedResumes.has(resume.id) && (
                  <div className="mt-6 prose prose-invert max-w-none [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white">
                    <div dangerouslySetInnerHTML={{ __html: resume.optimized_resume }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}