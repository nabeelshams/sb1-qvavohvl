import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import TextAlign from '@tiptap/extension-text-align';
import { Bold, Italic, List, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3 } from 'lucide-react';

interface EditorProps {
  content: string;
  onChange: (html: string) => void;
}

export function Editor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <div className="bg-black/20 border-b border-white/10 p-2 flex flex-wrap gap-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-white/10 ${editor.isActive('bold') ? 'bg-white/10' : ''}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-white/10 ${editor.isActive('italic') ? 'bg-white/10' : ''}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-white/10 ${editor.isActive('bulletList') ? 'bg-white/10' : ''}`}
        >
          <List className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-white/10 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-white/10 ${editor.isActive('heading', { level: 1 }) ? 'bg-white/10' : ''}`}
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-white/10 ${editor.isActive('heading', { level: 2 }) ? 'bg-white/10' : ''}`}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-white/10 ${editor.isActive('heading', { level: 3 }) ? 'bg-white/10' : ''}`}
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-white/10 mx-1" />
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-white/10 ${editor.isActive({ textAlign: 'left' }) ? 'bg-white/10' : ''}`}
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-white/10 ${editor.isActive({ textAlign: 'center' }) ? 'bg-white/10' : ''}`}
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-white/10 ${editor.isActive({ textAlign: 'right' }) ? 'bg-white/10' : ''}`}
        >
          <AlignRight className="w-4 h-4" />
        </button>
      </div>
      <EditorContent 
        editor={editor} 
        className="prose prose-invert max-w-none p-4 min-h-[500px] focus:outline-none"
      />
    </div>
  );
}