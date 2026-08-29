'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Undo, Redo } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[140px] px-3 py-2 bg-white text-[#1E3A8A] font-sans text-xs sm:text-sm leading-relaxed',
      },
    },
  });

  // Sync content if controlled value changes externally
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-[#1E3A8A]/30 rounded-sm overflow-hidden bg-white focus-within:border-[#1E3A8A] transition-colors">
      {/* Toolbar */}
      <div className="bg-[#FFFFFF] border-b border-[#1E3A8A]/20 p-1.5 flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-xs hover:bg-gray-200 text-xs font-bold transition-colors cursor-pointer ${
            editor.isActive('bold') ? 'bg-[#1E3A8A] text-white' : 'text-[#1E3A8A]'
          }`}
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-xs hover:bg-gray-200 text-xs font-bold transition-colors cursor-pointer ${
            editor.isActive('italic') ? 'bg-[#1E3A8A] text-white' : 'text-[#1E3A8A]'
          }`}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-[#1E3A8A]/30 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded-xs hover:bg-gray-200 text-xs font-bold transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 1 }) ? 'bg-[#1E3A8A] text-white' : 'text-[#1E3A8A]'
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-xs hover:bg-gray-200 text-xs font-bold transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 2 }) ? 'bg-[#1E3A8A] text-white' : 'text-[#1E3A8A]'
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-[#1E3A8A]/30 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-xs hover:bg-gray-200 text-xs font-bold transition-colors cursor-pointer ${
            editor.isActive('bulletList') ? 'bg-[#1E3A8A] text-white' : 'text-[#1E3A8A]'
          }`}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-xs hover:bg-gray-200 text-xs font-bold transition-colors cursor-pointer ${
            editor.isActive('orderedList') ? 'bg-[#1E3A8A] text-white' : 'text-[#1E3A8A]'
          }`}
          title="Ordered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-[#1E3A8A]/30 mx-1 ml-auto" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-xs hover:bg-gray-200 text-xs font-bold transition-colors disabled:opacity-30 cursor-pointer"
          title="Undo"
        >
          <Undo className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-xs hover:bg-gray-200 text-xs font-bold transition-colors disabled:opacity-30 cursor-pointer"
          title="Redo"
        >
          <Redo className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
