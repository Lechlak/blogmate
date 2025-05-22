import React, { useState } from 'react';
import Input from '../components/Input';
import Select from '../components/Select';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import Alert from '../components/Alert';
import BlogPreview from '../components/BlogPreview';
import { useGeminiService } from '../services/geminiService';
import { useDalleService } from '../services/dalleService';
import { useWordpressService } from '../services/wordpressService';
import { useAppContext } from '../context/AppContext';

const blogTypes = [
  { value: 'Informative Article', label: 'Informative Article' },
  { value: 'Persuasive Argument', label: 'Persuasive Argument' },
  { value: 'Listicle', label: 'Listicle' },
  { value: 'How-to Guide', label: 'How-to Guide' },
];

const TitleMode: React.FC = () => {
  const [title, setTitle] = useState('');
  const [blogType, setBlogType] = useState('');
  const [outline, setOutline] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  
  const { wordpressConfig } = useAppContext();
  const { generateContent } = useGeminiService();
  const { generateImage } = useDalleService();
  const { publishPost } = useWordpressService();

  const handleGenerate = async () => {
    if (!title) {
      setError('Title is required');
      return;
    }

    if (!blogType) {
      setError('Blog type is required');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsGenerating(true);
    setGeneratedContent(null);
    setGeneratedImageUrl(null);

    try {
      // Generate content with Gemini
      const content = await generateContent({
        title,
        blogType,
        outline,
        keywords,
      });
      
      setGeneratedContent(content);
      
      // Generate image with DALL-E
      const imageUrl = await generateImage(title);
      setGeneratedImageUrl(imageUrl);
      
      setSuccess('Content and image generated successfully!');
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!generatedContent || !title) {
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
        title,
        content: generatedContent,
        imageUrl: generatedImageUrl || undefined,
      });
      
      setPublishedUrl(postUrl);
      setSuccess('Blog post published successfully!');
    } catch (err: any) {
      setError(err.message || 'An error occurred during publishing');
      console.error('Publishing error:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setBlogType('');
    setOutline('');
    setKeywords('');
    setGeneratedContent(null);
    setGeneratedImageUrl(null);
    setError(null);
    setSuccess(null);
    setPublishedUrl(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Title Mode</h1>
        <p className="text-gray-600 mb-6">
          Generate a complete blog post and featured image based on a title and additional details.
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
          <Input
            id="title"
            label="Blog Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a captivating blog title"
            required
          />
          
          <Select
            id="blogType"
            label="Blog Type"
            value={blogType}
            onChange={(e) => setBlogType(e.target.value)}
            options={blogTypes}
            required
          />
          
          <TextArea
            id="outline"
            label="Outline or Notes (Optional)"
            value={outline}
            onChange={(e) => setOutline(e.target.value)}
            placeholder="Add any specific points or structure you want included in the blog post"
            rows={4}
          />
          
          <Input
            id="keywords"
            label="Target Keywords (Optional)"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Comma-separated keywords for SEO optimization"
          />
          
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={handleGenerate}
              isLoading={isGenerating}
              disabled={!title || !blogType || isGenerating}
            >
              Generate Blog Post
            </Button>
            
            {generatedContent && (
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
                  disabled={isGenerating || isPublishing}
                >
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {(generatedContent || generatedImageUrl) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Generated Content Preview</h2>
          
          {generatedImageUrl && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Featured Image</h3>
              <img 
                src={generatedImageUrl} 
                alt={title} 
                className="w-full max-h-96 object-cover rounded-lg shadow-sm" 
              />
            </div>
          )}
          
          {generatedContent && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Blog Content</h3>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: generatedContent }}
              />
            </div>
          )}
        </div>
      )}
      
      {generatedContent && generatedImageUrl && (
        <BlogPreview
          title={title}
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

export default TitleMode;