export interface ScrapedData {
  title: string;
  description: string;
  content: string;
}

export const useScrapeService = () => {
  const scrapeUrl = async (url: string): Promise<ScrapedData> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to scrape URL');
      }

      return await response.json();
    } catch (error) {
      console.error('Error scraping URL:', error);
      throw error;
    }
  };

  return {
    scrapeUrl,
  };
};