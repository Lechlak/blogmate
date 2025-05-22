import { useCallback } from 'react';

export const useDalleService = () => {
  const generateImage = useCallback(async (title: string): Promise<string | null> => {
    // Make sure you have a user-scoped API key here, NOT a project key
    const dalleApiKey = import.meta.env.VITE_OPENAI_USER_API_KEY;

    if (!dalleApiKey) {
      throw new Error('OpenAI API key is missing in environment variables.');
    }

    const prompt = `Create a professional, high-quality image for a tech blog post titled "${title}". The image should be visually appealing, modern, and suitable for a professional technology blog.`;

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${dalleApiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3', // Required as of the latest spec
          prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard', // 'standard' or 'hd'
          response_format: 'url', // 'url' or 'b64_json'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('DALL-E API error:', {
          status: response.status,
          error: errorData,
        });
        throw new Error(errorData.error?.message || 'Image generation failed.');
      }

      const data = await response.json();
      const imageUrl = data.data?.[0]?.url;

      if (!imageUrl) {
        throw new Error('Image URL missing from DALL-E response');
      }

      return imageUrl;
    } catch (err: any) {
      console.error('Error calling DALL-E API:', err);
      throw err;
    }
  }, []);

  return { generateImage };
};
