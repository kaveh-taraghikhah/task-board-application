'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { TipTapDocument } from '@/lib/types';

export function TipTapViewer({ document }: { document: TipTapDocument }) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link.configure({ openOnClick: true, protocols: ['http', 'https'] }),
    ],
    content: document,
  });

  if (!editor) return null;
  return <EditorContent editor={editor} className="tiptap text-sm leading-6" />;
}
