import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import TextAlign from '@tiptap/extension-text-align';
import { Bold, Italic, List, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3 } from 'lucide-react';

interface EditorProps {
  content: string;
  onChange: (html: string) => void;
  onEditorReady?: (editor: any) => void;
}

export function Editor({ content, onChange, onEditorReady }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: content || '<p></p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[500px] focus:outline-none'
      }
    }
  });

  // Notify parent when editor is ready
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Update content only when it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '<p></p>', false);
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative">
      {/* Floating Toolbar */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg mb-2">
        <div className="flex flex-wrap gap-2 p-2">
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
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}