
import React, { useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight, Link, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const quillRef = useRef<ReactQuill>(null);

  const handleFormat = (format: string, value?: any) => {
    if (!quillRef.current) return;
    
    const quill = quillRef.current.getEditor();
    quill.focus();
    
    if (value !== undefined) {
      quill.format(format, value);
    } else {
      const currentFormat = quill.getFormat();
      quill.format(format, !currentFormat[format]);
    }
  };

  const handleLink = () => {
    if (!quillRef.current) return;
    
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);
    
    if (range) {
      // If text is selected, prompt for the URL
      const url = prompt('Enter URL:', 'https://');
      
      if (url) {
        quill.format('link', url);
      } else {
        quill.format('link', false);
      }
    }
  };

  const handleImage = () => {
    if (!quillRef.current) return;
    
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);
    
    if (range) {
      const url = prompt('Enter image URL:', 'https://');
      
      if (url) {
        quill.insertEmbed(range.index, 'image', url);
      }
    }
  };

  const modules = {
    toolbar: false // Disable default toolbar
  };

  const formats = [
    'bold', 'italic', 'underline', 'list', 'bullet',
    'align', 'link', 'image'
  ];

  return (
    <div className="rich-text-editor border rounded-md">
      <div className="flex items-center gap-1 p-1 border-b bg-muted/20">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 px-2 quill-button" onClick={() => handleFormat('bold')}>
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 px-2 quill-button" onClick={() => handleFormat('italic')}>
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 px-2 quill-button" onClick={() => handleFormat('underline')}>
                <Underline className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 px-2 quill-button" onClick={() => handleFormat('list', 'bullet')}>
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 px-2 quill-button" onClick={() => handleFormat('align', 'left')}>
                <AlignLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Left</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 px-2 quill-button" onClick={() => handleFormat('align', 'center')}>
                <AlignCenter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Center</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 px-2 quill-button" onClick={() => handleFormat('align', 'right')}>
                <AlignRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Right</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 px-2 quill-button" onClick={handleLink}>
                <Link className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert Link</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 px-2 quill-button" onClick={handleImage}>
                <Image className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert Image</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="quill-editor"
      />
      <style>
        {`
        .quill-editor .ql-toolbar {
          display: none;
        }
        .quill-editor .ql-container {
          border: none;
          font-size: 14px;
        }
        .quill-editor .ql-editor {
          min-height: 150px;
          font-family: inherit;
        }
        `}
      </style>
    </div>
  );
};

export default RichTextEditor;
