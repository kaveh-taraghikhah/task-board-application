import { BadRequestException } from '@nestjs/common';
import { TipTapDocument, TipTapNode } from './tiptap-document';

const ALLOWED_NODES = new Set([
  'doc',
  'paragraph',
  'text',
  'heading',
  'bulletList',
  'orderedList',
  'listItem',
  'blockquote',
  'hardBreak',
]);

const ALLOWED_MARKS = new Set(['bold', 'italic', 'link']);

function assertHttpUrl(value: unknown): void {
  if (typeof value !== 'string') {
    throw new BadRequestException('Link href must be a string.');
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new BadRequestException('Link href must be a valid URL.');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new BadRequestException('Links may only use http or https.');
  }
}

function validateNode(node: TipTapNode, isRoot = false): void {
  if (!node || typeof node !== 'object' || Array.isArray(node)) {
    throw new BadRequestException('Invalid TipTap node.');
  }

  if (typeof node.type !== 'string' || !ALLOWED_NODES.has(node.type)) {
    throw new BadRequestException(`Unsupported TipTap node: ${String(node.type)}`);
  }

  if (isRoot && node.type !== 'doc') {
    throw new BadRequestException('TipTap document root must be type "doc".');
  }

  if (node.type === 'heading') {
    const level = node.attrs?.level;
    if (level !== 1 && level !== 2 && level !== 3) {
      throw new BadRequestException('Heading level must be 1, 2, or 3.');
    }
  }

  if (node.marks) {
    if (!Array.isArray(node.marks)) {
      throw new BadRequestException('TipTap marks must be an array.');
    }

    for (const mark of node.marks) {
      if (!ALLOWED_MARKS.has(mark.type)) {
        throw new BadRequestException(`Unsupported TipTap mark: ${mark.type}`);
      }

      if (mark.type === 'link') {
        assertHttpUrl(mark.attrs?.href);
      }
    }
  }

  if (node.content) {
    if (!Array.isArray(node.content)) {
      throw new BadRequestException('TipTap content must be an array.');
    }
    for (const child of node.content) {
      validateNode(child);
    }
  }
}

export function validateTipTapDocument(value: unknown): TipTapDocument {
  if (value === null || value === undefined) {
    throw new BadRequestException('Description is required. Empty documents are allowed.');
  }

  const document = value as TipTapDocument;
  validateNode(document as TipTapNode, true);
  return document;
}
