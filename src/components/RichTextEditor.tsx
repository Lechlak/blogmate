import React, { useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  initialValue?: string;
  onChange: (content: string) => void;
  label?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialValue = '',
  onChange,
  label = 'Content',
  className = '',
}) => {
  const [content, setContent] = useState(initialValue);
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize the editor
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialValue;
    }
  }, [initialValue]);
  
  // Format handlers
  const execCommand = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      onChange(newContent);
    }
    editorRef.current?.focus();
  };

  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');
  const handleH2 = () => execCommand('formatBlock', '<h2>');
  const handleH3 = () => execCommand('formatBlock', '<h3>');
  const handleParagraph = () => execCommand('formatBlock', '<p>');
  const handleBulletList = () => execCommand('insertUnorderedList');
  const handleNumberedList = () => execCommand('insertOrderedList');
  const handleLink = () => {
    const url = prompt('Enter a URL:', 'https://');
    if (url) execCommand('createLink', url);
  };
  
  const handleEditorChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      onChange(newContent);
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="border border-gray-300 rounded-md overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={handleBold}
            className="p-1 rounded hover:bg-gray-200"
            title="Bold"
          >
            <span className="font-bold">B</span>
          </button>
          <button
            type="button"
            onClick={handleItalic}
            className="p-1 rounded hover:bg-gray-200"
            title="Italic"
          >
            <span className="italic">I</span>
          </button>
          <button
            type="button"
            onClick={handleUnderline}
            className="p-1 rounded hover:bg-gray-200"
            title="Underline"
          >
            <span className="underline">U</span>
          </button>
          <div className="h-5 border-r border-gray-300 mx-1"></div>
          <button
            type="button"
            onClick={handleH2}
            className="p-1 rounded hover:bg-gray-200"
            title="Heading 2"
          >
            <span className="font-bold">H2</span>
          </button>
          <button
            type="button"
            onClick={handleH3}
            className="p-1 rounded hover:bg-gray-200"
            title="Heading 3"
          >
            <span className="font-bold">H3</span>
          </button>
          <button
            type="button"
            onClick={handleParagraph}
            className="p-1 rounded hover:bg-gray-200"
            title="Paragraph"
          >
            <span>P</span>
          </button>
          <div className="h-5 border-r border-gray-300 mx-1"></div>
          <button
            type="button"
            onClick={handleBulletList}
            className="p-1 rounded hover:bg-gray-200"
            title="Bullet List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={handleNumberedList}
            className="p-1 rounded hover:bg-gray-200"
            title="Numbered List"
          >
            1. List
          </button>
          <button
            type="button"
            onClick={handleLink}
            className="p-1 rounded hover:bg-gray-200"
            title="Insert Link"
          >
            Link
          </button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          className="p-3 min-h-[200px] focus:outline-none overflow-y-auto bg-white"
          onInput={handleEditorChange}
          onBlur={handleEditorChange}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;