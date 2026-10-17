'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';
import { TipTapDocument } from '@/lib/types';

export function TipTapEditor({
  value,
  onChange,
}: {
  value: TipTapDocument;
  onChange: (value: TipTapDocument) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ['http', 'https'],
      }),
    ],
    content: value,
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getJSON() as TipTapDocument);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(value);
    if (current !== next) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  if (!editor) {
    return <div className="min-h-32 rounded-lg border border-[var(--line)] bg-white p-3" />;
  }

  return (
    <div className="rounded-lg border border-[var(--line)] bg-white">
      <div className="flex flex-wrap gap-1 border-b border-[var(--line)] p-2 text-sm">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          ضخیم
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          کج
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
          عنوان
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          فهرست
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          شماره‌دار
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
          نقل‌قول
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const href = window.prompt('نشانی پیوند (فقط http یا https)');
            if (!href) return;
            editor.chain().focus().setLink({ href }).run();
          }}
          active={editor.isActive('link')}
        >
          پیوند
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className="tiptap min-h-32 p-3 focus:outline-none" />
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-1 ${active ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--bg)]'}`}
    >
      {children}
    </button>
  );
}
