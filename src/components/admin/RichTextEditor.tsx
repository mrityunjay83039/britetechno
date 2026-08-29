'use client';

import React, { useRef } from 'react';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2 } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTag = (openTag: string, closeTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selectedText = currentText.substring(start, end);

    const replacement = `${openTag}${selectedText}${closeTag}`;
    const newText = currentText.substring(0, start) + replacement + currentText.substring(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, end + openTag.length);
    }, 0);
  };

  return (
    <div className="border border-[#1E3A8A]/30 rounded-sm overflow-hidden bg-white focus-within:border-[#1E3A8A] transition-colors">
      {/* Toolbar */}
      <div className="bg-[#FFFFFF] border-b border-[#1E3A8A]/20 p-1.5 flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => insertTag('<strong>', '</strong>')}
          className="p-1.5 rounded-xs hover:bg-gray-200 text-xs font-bold transition-colors text-[#1E3A8A] cursor-pointer"
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => insertTag('<em>', '</em>')}
          className="p-1.5 rounded-xs hover:bg-gray-200 text-xs font-bold transition-colors text-[#1E3A8A] cursor-pointer"
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-[#1E3A8A]/30 mx-1" />

        <button
          type="button"
          onClick={() => insertTag('<h1>', '</h1>')}
          className="p-1.5 rounded-xs hover:bg-gray-200 text-xs font-bold transition-colors text-[#1E3A8A] cursor-pointer"
          title="Heading 1"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => insertTag('<h2>', '</h2>')}
          className="p-1.5 rounded-xs hover:bg-gray-200 text-xs font-bold transition-colors text-[#1E3A8A] cursor-pointer"
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-[#1E3A8A]/30 mx-1" />

        <button
          type="button"
          onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')}
          className="p-1.5 rounded-xs hover:bg-gray-200 text-xs font-bold transition-colors text-[#1E3A8A] cursor-pointer"
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => insertTag('<ol>\n  <li>', '</li>\n</ol>')}
          className="p-1.5 rounded-xs hover:bg-gray-200 text-xs font-bold transition-colors text-[#1E3A8A] cursor-pointer"
          title="Ordered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content Editor */}
      <textarea
        ref={textareaRef}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder="Enter rich HTML or text description..."
        className="w-full px-3 py-2 bg-white text-[#1E3A8A] font-sans text-xs sm:text-sm leading-relaxed focus:outline-none resize-y"
      />
    </div>
  );
}
