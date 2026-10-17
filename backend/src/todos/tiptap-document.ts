export type TipTapMark = {
  type: 'bold' | 'italic' | 'link';
  attrs?: Record<string, unknown>;
};

export type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  marks?: TipTapMark[];
  text?: string;
};

export type TipTapDocument = {
  type: 'doc';
  content?: TipTapNode[];
};

export const EMPTY_TIPTAP_DOCUMENT: TipTapDocument = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};
