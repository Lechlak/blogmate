import React, { useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import BlogPreview from '../components/BlogPreview';
import { Search, RefreshCw, ExternalLink } from 'lucide-react';
import { useSearchService, SearchResult } from '../services/searchService';
import { useGeminiService } from '../services/geminiService';
import { useDalleService } from '../services/dalleService';
import { useWordpressService } from '../services/wordpressService';
import { useAppContext } from '../context/AppContext';

const ResearchMode: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isRemixing, setIsRemixing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  
  const { geminiApiKey, dalleApiKey, wordpressConfig } = useAppContext();
  const { searchKeyword } = useSearchService();
  const { generateContentFromURL } = useGeminiService();
  const { generateImage } = useDalleService();
  const { publishPost } = useWordpressService();

  const handleSearch = async () => {
    if (!keyword) {
      setError('Keyword is required');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSearching(true);
    setSearchResults([]);
    setSelectedUrl(null);
    setGeneratedContent(null);
    setGeneratedImageUrl(null);

    try {
      const results = await searchKeyword(keyword);
      setSearchResults(results);
      if (results.length === 0) {
        setError('No results found. Try a different keyword.');
      } else {
        setSuccess(`Found ${results.length} results for "${keyword}"`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during search');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRemix = async (url: string, title: string) => {
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
    setIsRemixing(true);
    setSelectedUrl(url);
    setBlogTitle(title);
    setGeneratedContent(null);
    setGeneratedImageUrl(null);

    try {
      // Generate content based on URL
      const content = await generateContentFromURL(url, title);
      setGeneratedContent(content);
      
      // Generate image with DALL-E
      const imageUrl = await generateImage(title);
      setGeneratedImageUrl(imageUrl);
      
      setSuccess('Content and image generated successfully!');
    } catch (err: any) {
      setError(err.message || 'An error occurred during remixing');
    } finally {
      setIsRemixing(false);
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
    setKeyword('');
    setSearchResults([]);
    setSelectedUrl(null);
    setBlogTitle('');
    setGeneratedContent(null);
    setGeneratedImageUrl(null);
    setError(null);
    setSuccess(null);
    setPublishedUrl(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Research Mode</h1>
        <p className="text-gray-600 mb-6">
          Research a topic by keyword, find relevant articles, and remix them into new blog content.
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
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-grow">
              <Input
                id="keyword"
                label="Keyword or Topic"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter a keyword to research"
                required
              />
            </div>
            <div className="flex-shrink-0">
              <Button
                onClick={handleSearch}
                isLoading={isSearching}
                disabled={!keyword || isSearching}
                className="md:mb-0"
              >
                <Search size={18} className="mr-1" />
                Search
              </Button>
            </div>
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Search Results</h3>
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    <h4 className="text-md font-semibold text-gray-800">{result.title}</h4>
                    <p className="text-sm text-gray-600 mt-1 mb-3">{result.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="secondary"
                        onClick={() => handleRemix(result.url, result.title)}
                        isLoading={isRemixing && selectedUrl === result.url}
                        disabled={isRemixing}
                        className="text-xs"
                      >
                        <RefreshCw size={14} className="mr-1" />
                        Remix
                      </Button>
                      <a 
                        href={result.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 text-xs rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      >
                        <ExternalLink size={14} className="mr-1" />
                        Visit
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {generatedContent && generatedImageUrl && (
            <div className="mt-6">
              <Button
                type="outline"
                onClick={resetForm}
                disabled={isPublishing}
                className="mb-4"
              >
                Start New Search
              </Button>
            </div>
          )}
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

export default ResearchMode;