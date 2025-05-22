import React, { useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import BlogPreview from '../components/BlogPreview';
import { Link, Loader } from 'lucide-react';
import { useGeminiService } from '../services/geminiService';
import { useDalleService } from '../services/dalleService';
import { useWordpressService } from '../services/wordpressService';
import { useScrapeService } from '../services/scrapeService';
import { useAppContext } from '../context/AppContext';

const URLMode: React.FC = () => {
  const [url, setUrl] = useState('');
  const [blogTitle, setBlogTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [scrapedContent, setScrapedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  
  const { geminiApiKey, dalleApiKey, wordpressConfig } = useAppContext();
  const { generateContentFromURL } = useGeminiService();
  const { generateImage } = useDalleService();
  const { publishPost } = useWordpressService();
  const { scrapeUrl } = useScrapeService();

  // Validate URL format
  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleScrape = async () => {
    if (!url || !isValidUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsScraping(true);
    setScrapedContent(null);

    try {
      const data = await scrapeUrl(url);
      setScrapedContent(data.content);
      setBlogTitle(data.title);
      setSuccess('Content scraped successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to scrape URL');
    } finally {
      setIsScraping(false);
    }
  };

  const handleProcess = async () => {
    if (!url || !isValidUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }

    if (!blogTitle) {
      setError('Please enter a blog title');
      return;
    }

    if (!geminiApiKey) {
      setError('Gemini API key is required. Please add it in the Settings page.');
      return;
    }

    if (!dalleApiKey) {
      setError('DALL-E API key is required. Please add it in the Settings page.');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsProcessing(true);
    setGeneratedContent(null);
    setGeneratedImageUrl(null);

    try {
      // Generate content based on URL and scraped content
      const content = await generateContentFromURL(url, blogTitle, scrapedContent);
      setGeneratedContent(content);
      
      // Generate image with DALL-E
      const imageUrl = await generateImage(blogTitle);
      setGeneratedImageUrl(imageUrl);
      
      setSuccess('Content and image generated successfully!');
    } catch (err: any) {
      setError(err.message || 'An error occurred during processing');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublish = async () => {
    if (!generatedContent || !blogTitle) {
      setError('Generated content and title are required for publishing');
      return;
    }

    if (!wordpressConfig.siteUrl || !wordpressConfig.username || !wordpressConfig.appPassword) {
      setError('WordPress configuration is incomplete. Please check your settings.');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsPublishing(true);

    try {
      const postUrl = await publishPost({
        title: blogTitle,
        content: generatedContent,
        imageUrl: generatedImageUrl || undefined,
      });
      
      setPublishedUrl(postUrl);
      setSuccess('Blog post published successfully!');
    } catch (err: any) {
      setError(err.message || 'An error occurred during publishing');
    } finally {
      setIsPublishing(false);
    }
  };

  const resetForm = () => {
    setUrl('');
    setBlogTitle('');
    setGeneratedContent(null);
    setGeneratedImageUrl(null);
    setScrapedContent(null);
    setError(null);
    setSuccess(null);
    setPublishedUrl(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">URL Mode</h1>
        <p className="text-gray-600 mb-6">
          Generate a new blog post by providing a specific URL as a reference source.
        </p>
        
        {error && (
          <div className="mb-6">
            <Alert 
              type="error" 
              message={error} 
              onClose={() => setError(null)} 
            />
          </div>
        )}
        
        {success && (
          <div className="mb-6">
            <Alert 
              type="success" 
              message={success} 
              onClose={() => setSuccess(null)} 
            />
          </div>
        )}
        
        {publishedUrl && (
          <div className="mb-6">
            <Alert 
              type="info" 
              message={
                <span>
                  Post published! <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="underline">View your post</a>
                </span>
              } 
              onClose={() => setPublishedUrl(null)} 
            />
          </div>
        )}
        
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <Input
                id="url"
                label="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                required
              />
            </div>
            <div className="flex-shrink-0 md:self-end">
              <Button
                onClick={handleScrape}
                isLoading={isScraping}
                disabled={!url || !isValidUrl(url) || isScraping}
                type="secondary"
              >
                {isScraping ? <Loader className="animate-spin mr-2" size={18} /> : <Link size={18} className="mr-2" />}
                Scrape URL
              </Button>
            </div>
          </div>
          
          {scrapedContent && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Scraped Content Preview:</h3>
              <p className="text-sm text-gray-600 line-clamp-3">{scrapedContent}</p>
            </div>
          )}
          
          <Input
            id="blogTitle"
            label="Blog Title"
            value={blogTitle}
            onChange={(e) => setBlogTitle(e.target.value)}
            placeholder="Enter a title for your new blog post"
            required
          />
          
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={handleProcess}
              isLoading={isProcessing}
              disabled={!url || !blogTitle || isProcessing || !isValidUrl(url)}
            >
              Generate Blog Post
            </Button>
            
            {generatedContent && generatedImageUrl && (
              <>
                <Button
                  type="success"
                  onClick={handlePublish}
                  isLoading={isPublishing}
                  disabled={isPublishing}
                >
                  Save to WordPress
                </Button>
                
                <Button
                  type="outline"
                  onClick={resetForm}
                  disabled={isProcessing || isPublishing}
                >
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {generatedContent && generatedImageUrl && (
        <BlogPreview
          title={blogTitle}
          content={generatedContent}
          imageUrl={generatedImageUrl}
          onPublish={handlePublish}
          isPublishing={isPublishing}
          onClose={() => {
            setGeneratedContent(null);
            setGeneratedImageUrl(null);
          }}
        />
      )}
    </div>
  );
};

export default URLMode;