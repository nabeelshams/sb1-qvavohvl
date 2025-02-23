import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Set up the worker source to use local file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export function useOriginalCV(userId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cvContent, setCvContent] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    const fetchAndExtractCV = async () => {
      try {
        // First, get the CV URL from cv_details
        const { data: cvDetails, error: cvError } = await supabase
          .from('cv_details')
          .select('cv_url')
          .eq('uid', userId)
          .single();

        if (cvError) throw cvError;
        if (!cvDetails?.cv_url) throw new Error('CV not found');

        // Fetch the PDF file
        const response = await fetch(cvDetails.cv_url);
        if (!response.ok) throw new Error('Failed to fetch CV file');

        const arrayBuffer = await response.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let formattedContent = '<div class="prose prose-invert max-w-none">';
        
        // Extract text from each page
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          let lastY = null;
          let isInParagraph = false;
          let currentList = null;
          
          for (const item of textContent.items) {
            const textItem = item as pdfjsLib.TextItem;
            const fontSize = Math.abs(textItem.transform[3]); // Get font size from transform matrix
            const text = textItem.str.trim();
            
            if (!text) continue;
            
            // Check for new line based on Y position
            if (lastY !== null && Math.abs(lastY - textItem.transform[5]) > 5) {
              if (isInParagraph) {
                formattedContent += '</p>';
                isInParagraph = false;
              }
              if (currentList) {
                formattedContent += '</ul>';
                currentList = null;
              }
            }
            
            // Check if text looks like a bullet point
            const isBulletPoint = text.startsWith('•') || text.startsWith('-') || text.startsWith('*');
            
            // Format based on characteristics
            if (fontSize > 14 || (text === text.toUpperCase() && text.length < 50)) {
              // Heading
              if (isInParagraph) {
                formattedContent += '</p>';
                isInParagraph = false;
              }
              if (currentList) {
                formattedContent += '</ul>';
                currentList = null;
              }
              const headingLevel = fontSize > 18 ? 2 : 3;
              formattedContent += `<h${headingLevel} class="font-bold ${headingLevel === 2 ? 'text-xl' : 'text-lg'} mt-6 mb-4">${text}</h${headingLevel}>`;
            } else if (isBulletPoint) {
              // Bullet point
              if (isInParagraph) {
                formattedContent += '</p>';
                isInParagraph = false;
              }
              if (!currentList) {
                formattedContent += '<ul class="list-disc pl-6 mb-4">';
                currentList = 'bullet';
              }
              formattedContent += `<li>${text.substring(1).trim()}</li>`;
            } else {
              // Regular paragraph text
              if (currentList) {
                formattedContent += '</ul>';
                currentList = null;
              }
              if (!isInParagraph) {
                formattedContent += '<p class="mb-4">';
                isInParagraph = true;
              }
              formattedContent += text + ' ';
            }
            
            lastY = textItem.transform[5];
          }
          
          // Close any open tags at the end of the page
          if (isInParagraph) {
            formattedContent += '</p>';
            isInParagraph = false;
          }
          if (currentList) {
            formattedContent += '</ul>';
            currentList = null;
          }
          
          // Add page break if not the last page
          if (i < pdf.numPages) {
            formattedContent += '<hr class="my-8" />';
          }
        }
        
        formattedContent += '</div>';

        if (isSubscribed) {
          setCvContent(formattedContent);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error fetching CV:', err);
        if (isSubscribed) {
          setError(err.message);
          setLoading(false);
          toast.error('Failed to load original CV');
        }
      }
    };

    fetchAndExtractCV();

    return () => {
      isSubscribed = false;
    };
  }, [userId]);

  return { cvContent, loading, error };
}