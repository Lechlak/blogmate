import React from 'react';
import { Check, X } from 'lucide-react';
import Button from './Button';

interface BlogPreviewProps {
  title: string;
  content: string;
  imageUrl: string | null;
  onPublish: () => void;
  isPublishing: boolean;
  onClose: () => void;
}

const BlogPreview: React.FC<BlogPreviewProps> = ({
  title,
  content,
  imageUrl,
  onPublish,
  isPublishing,
  onClose,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
      <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
        <h2 className="text-xl font-bold">Blog Preview</h2>
        <button
          onClick={onClose}
          className="text-white hover:text-indigo-100 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        {imageUrl && (
          <div className="mb-6">
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-auto max-h-80 object-cover rounded-lg" 
            />
          </div>
        )}
        
        <h1 className="text-2xl font-bold mb-4 text-gray-800">{title}</h1>
        
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
        <div className="space-x-3">
          <Button 
            type="outline" 
            onClick={onClose}
          >
            Edit
          </Button>
          <Button 
            type="success"
            onClick={onPublish}
            isLoading={isPublishing}
          >
            <Check size={18} className="mr-1" />
            Save to WordPress
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogPreview;