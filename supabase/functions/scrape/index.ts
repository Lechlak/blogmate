import { DOMParser } from 'npm:linkedom@0.16.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface ScrapedData {
  title: string;
  description: string;
  content: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const response = await fetch(url);
    const html = await response.text();

    // Parse HTML using linkedom
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract relevant data
    const data: ScrapedData = {
      title: doc.querySelector('title')?.textContent || '',
      description: doc.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      content: '',
    };

    // Get main content
    const mainContent = doc.querySelector('main, article, .content, #content');
    if (mainContent) {
      // Clean up content
      const scripts = mainContent.getElementsByTagName('script');
      const styles = mainContent.getElementsByTagName('style');
      [...scripts, ...styles].forEach(el => el.remove());
      
      data.content = mainContent.textContent.trim()
        .replace(/\s+/g, ' ')
        .substring(0, 5000); // Limit content length
    }

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});