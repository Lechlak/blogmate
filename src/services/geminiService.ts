import { useCallback } from 'react';

interface GenerateContentParams {
  title: string;
  blogType: string;
  outline?: string;
  keywords?: string;
}

export const useGeminiService = () => {
  const generateContent = useCallback(async (params: GenerateContentParams): Promise<string> => {
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not found in environment variables.');
    }

    const { title, blogType, outline, keywords } = params;

    let prompt = `Generate a ${blogType} blog post titled "${title}"`;
    
    if (outline && outline.trim() !== '') {
      prompt += ` using the following outline or notes: ${outline}`;
    }
    
    if (keywords && keywords.trim() !== '') {
      prompt += ` and targeting these keywords: ${keywords}`;
    }
    
    prompt += `. Write in a professional but engaging tone. Format the content with appropriate HTML tags (h2, h3, p, ul, li, etc.) for a WordPress blog.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate content');
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      throw error;
    }
  }, []);

  const generateContentFromURL = useCallback(async (url: string, title: string, scrapedContent?: string | null): Promise<string> => {
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not found in environment variables.');
    }

    try {
      const prompt = `Create a completely original blog post titled "${title}" based on this content from ${url}:
        
        ${scrapedContent || 'No content available'}
        
        Requirements:
        1. Write in a professional but engaging tone
        2. Structure the content well with headings and paragraphs
        3. Format with appropriate HTML tags (h2, h3, p, ul, li) for WordPress
        4. Make it informative and accurate
        5. Ensure it's completely original to avoid plagiarism
        6. Include relevant examples and explanations
        7. Add a strong conclusion`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate content');
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      console.error('Error generating content from URL:', error);
      throw error;
    }
  }, []);

  return {
    generateContent,
    generateContentFromURL,
  };
};