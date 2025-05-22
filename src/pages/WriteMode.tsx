import React, { useState } from 'react';
import Input from '../components/Input';
import Select from '../components/Select';
import TextArea from '../components/TextArea';
import RichTextEditor from '../components/RichTextEditor';
import Button from '../components/Button';
import Alert from '../components/Alert';
import BlogPreview from '../components/BlogPreview';
import { useDalleService } from '../services/dalleService';
import { useWordpressService } from '../services/wordpressService';
import { useAppContext } from '../context/AppContext';

const blogTypes = [
  { value: 'Informative Article', label: 'Informative Article' },
  { value: 'Persuasive Argument', label: 'Persuasive Argument' },
  { value: 'Listicle', label: 'Listicle' },
  { value: 'How-to Guide', label: 'How-to Guide' },
];

const WriteMode: React.FC = () => {
  const [title, setTitle] = useState('');
  const [blogType, setBlogType] = useState('');
  const [outline, setOutline] = useState('');
  const [keywords, setKeywords] = useState('');
  const [content, setContent] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  
  const { dalleApiKey, wordpressConfig } = useAppContext();
  const { generateImage } = useDalleService();
  const { publishPost } = useWordpressService();

  const handleGenerateImage = async () => {
    if (!title) {
      setError('Title is required');
      return;
    }

    if (!dalleApiKey) {
      setError('DALL-E API key is required. Please add it in the Settings page.');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsGenerating(true);

    try {
      // Generate image with DALL-E
      const imageUrl = await generateImage(title);
      setGeneratedImageUrl(imageUrl);
      
      setSuccess('Image generated successfully!');
    } catch (err: any) {
      setError(err.message || 'An error occurred during image generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = () => {
    if (!title) {
      setError('Title is required');
      return;
    }

    if (!content) {
      setError('Content is required');
      return;
    }

    setError(null);
    setIsPreviewMode(true);
  };

  const handlePublish = async () => {
    if (!content || !title) {
      setError('Content and title are required for publishing');
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
        content,
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
    setTitle('');
    setBlogType('');
    setOutline('');
    setKeywords('');
    setContent('');
    setGeneratedImageUrl(null);
    setError(null);
    setSuccess(null);
    setPublishedUrl(null);
    setIsPreviewMode(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Write Mode</h1>
        <p className="text-gray-600 mb-6">
          Manually write your blog post and generate a featured image based on the title.
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
          />
          
          <TextArea
            id="outline"
            label="Outline or Notes (Optional)"
            value={outline}
            onChange={(e) => setOutline(e.target.value)}
            placeholder="Add any specific points or structure you want to include"
            rows={3}
          />
          
          <Input
            id="keywords"
            label="Target Keywords (Optional)"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Comma-separated keywords for SEO optimization"
          />
          
          <div className="mb-2">
            <Button
              onClick={handleGenerateImage}
              isLoading={isGenerating}
              disabled={!title || isGenerating}
              type="secondary"
              className="mb-4"
            >
              Generate Featured Image
            </Button>
            
            {generatedImageUrl && (
              <div className="mt-4 mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Generated Image:</p>
                <img 
                  src={generatedImageUrl} 
                  alt={title} 
                  className="max-h-48 rounded border border-gray-200 shadow-sm" 
                />
              </div>
            )}
          </div>
          
          <RichTextEditor
            label="Blog Content"
            initialValue={content}
            onChange={setContent}
          />
          
          <div className="flex flex-wrap gap-3 pt-4">
            <Button
              onClick={handlePreview}
              disabled={!title || !content}
            >
              Preview
            </Button>
            
            <Button
              type="success"
              onClick={handlePublish}
              isLoading={isPublishing}
              disabled={!title || !content || isPublishing}
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
          </div>
        </div>
      </div>
      
      {isPreviewMode && (
        <BlogPreview
          title={title}
          content={content}
          imageUrl={generatedImageUrl}
          onPublish={handlePublish}
          isPublishing={isPublishing}
          onClose={() => setIsPreviewMode(false)}
        />
      )}
    </div>
  );
};

export default WriteMode;