import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { useNavigate } from 'react-router-dom';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ContactFormProps {
  isNewUser?: boolean;
}

export function ContactForm({ isNewUser = false }: ContactFormProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const extractHtmlFromFile = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!['pdf', 'doc', 'docx'].includes(extension)) {
      throw new Error('Invalid file type. Please upload a PDF, DOC, or DOCX file.');
    }

    try {
      if (extension === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let html = '<div class="pdf-content">';
        let hasContent = false;
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          let lastY = null;
          let isInParagraph = false;
          
          for (const item of textContent.items) {
            const textItem = item as pdfjsLib.TextItem;
            hasContent = true;
            const fontSize = Math.abs(textItem.transform[3]); // Get font size from transform matrix
            
            // Check for new line based on Y position
            if (lastY !== null && Math.abs(lastY - textItem.transform[5]) > 5) {
              if (isInParagraph) {
                html += '</p>';
                isInParagraph = false;
              }
              html += '<br/>';
            }
            
            // Check for heading based on font size
            if (fontSize > 14) {
              if (isInParagraph) {
                html += '</p>';
                isInParagraph = false;
              }
              const headingLevel = Math.min(Math.ceil((20 - fontSize) / 2), 6);
              html += `<h${headingLevel}>${textItem.str}</h${headingLevel}>`;
            } else {
              if (!isInParagraph) {
                html += '<p>';
                isInParagraph = true;
              }
              
              // Add formatting based on font properties
              let formattedText = textItem.str;
              const fontName = textItem.fontName?.toLowerCase() || '';
              
              if (fontName.includes('bold')) {
                formattedText = `<strong>${formattedText}</strong>`;
              }
              if (fontName.includes('italic')) {
                formattedText = `<em>${formattedText}</em>`;
              }
              
              html += formattedText;
            }
            
            lastY = textItem.transform[5];
          }
          
          if (isInParagraph) {
            html += '</p>';
          }
          html += '<hr/>';
        }
        
        html += '</div>';
        
        if (!hasContent) {
          throw new Error('No extractable text found in PDF. The file might be scanned or image-based.');
        }

        return html;
      } else {
        // For DOC/DOCX files
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });

        if (!result.value.trim()) {
          throw new Error('No extractable text found in document.');
        }

        return result.value;
      }
    } catch (error) {
      if (error.message.includes('No extractable text')) {
        throw error;
      }
      throw new Error('Failed to extract text from file. Please ensure the file is not corrupted or password-protected.');
    }
  };

  const triggerWebhook = async (data: { 
    uid: string; 
    cv_url: string; 
    created_at: string; 
    cv_html: string;
  }) => {
    try {
      const response = await fetch('https://hook.eu2.make.com/9rcww69on6w7dz1e1b5pc8j54gl01ahs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to trigger automation');
      }
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  };

  const convertDocToPdf = async (file: File): Promise<Uint8Array> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.276, 841.890]);
    
    const { width, height } = page.getSize();
    page.drawText(html.replace(/<[^>]*>/g, ' '), {
      x: 50,
      y: height - 50,
      size: 12,
      maxWidth: width - 100,
    });

    return await pdfDoc.save();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      // Extract HTML from the file first
      const extractedHtml = await extractHtmlFromFile(file);
      
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      if (!userId) throw new Error('User not authenticated');

      let fileToUpload: File | Blob = file;
      const originalExt = file.name.split('.').pop()?.toLowerCase();

      if (originalExt !== 'pdf') {
        const pdfBytes = await convertDocToPdf(file);
        fileToUpload = new Blob([pdfBytes], { type: 'application/pdf' });
      }

      const fileName = `${userId}/${Math.random()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from('resume')
        .upload(fileName, fileToUpload);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resume')
        .getPublicUrl(fileName);

      const timestamp = new Date().toISOString();

      const { error: upsertError } = await supabase
        .from('cv_details')
        .upsert({ 
          uid: userId,
          cv_url: publicUrl,
          updated_at: timestamp
        });

      if (upsertError) throw upsertError;

      await triggerWebhook({
        uid: userId,
        cv_url: publicUrl,
        created_at: timestamp,
        cv_html: extractedHtml
      });

      toast.success('CV uploaded and converted successfully!');
      navigate(`/cv-details/${encodeURIComponent(publicUrl)}?isNew=true`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white pt-24 px-8 pb-8">
      <div className="max-w-6xl mx-auto">
        {isNewUser ? (
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1 bg-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6">
              Step 1 of 3
            </div>
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              Welcome to Chaakri
            </h1>
            <h2 className="text-3xl font-bold mb-4">Let's Start with Your CV</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              To help you find the perfect job opportunities, we'll need your CV. 
              Upload it now and our AI will analyze it to understand your skills, 
              experience, and preferences.
            </p>
          </div>
        ) : (
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-4 opacity-20">UPLOAD CV</h1>
            <h2 className="text-3xl font-bold mb-4">Upload Your CV</h2>
            <p className="text-gray-400">
              Upload your CV to start the magic
            </p>
          </div>
        )}

        <div className="max-w-md mx-auto">
          <div className="bg-black/30 backdrop-blur-sm p-8 rounded-lg shadow-xl ring-1 ring-white/20 animate-glow">
            <div className="flex items-center space-x-4 mb-6">
              <Upload className="w-8 h-8 text-blue-500" />
              <h3 className="text-xl font-semibold">Upload your CV</h3>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full bg-blue-600 text-white p-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 text-lg"
            >
              {uploading ? 'Processing...' : 'Select File'}
            </button>
            <p className="text-gray-400 text-sm mt-4 text-center">
              Supported formats: PDF, DOC, DOCX
            </p>
          </div>

          {isNewUser && (
            <div className="mt-8 text-center">
              <h4 className="text-lg font-medium text-gray-300 mb-4">What happens next?</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-black/20 rounded-lg">
                  <div className="text-blue-400 font-bold mb-2">Step 2</div>
                  <p className="text-sm text-gray-400">Review and enhance your CV details</p>
                </div>
                <div className="p-4 bg-black/20 rounded-lg">
                  <div className="text-purple-400 font-bold mb-2">Step 3</div>
                  <p className="text-sm text-gray-400">Set your job preferences</p>
                </div>
                <div className="p-4 bg-black/20 rounded-lg">
                  <div className="text-pink-400 font-bold mb-2">Ready!</div>
                  <p className="text-sm text-gray-400">Start receiving matched jobs</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}