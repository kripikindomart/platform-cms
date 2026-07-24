'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Heading2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 transition-colors',
        'hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40',
        active && 'bg-indigo-50 text-indigo-600'
      )}
    >
      {children}
    </button>
  );
}

/**
 * Rich text (WYSIWYG) editor used for "wysiwyg" input-type fields in
 * generated create/edit forms. Stores content as HTML.
 */
export function RichTextEditor({ value, onChange, placeholder, className, disabled }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder || 'Tulis sesuatu...' }),
    ],
    content: value || '',
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[160px] px-4 py-3',
      },
    },
  });

  if (!editor) return null;

  return (
    <div
      className={cn(
        'w-full rounded-xl border border-neutral-200 bg-white transition-all overflow-hidden',
        'focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/20',
        disabled && 'opacity-50',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-neutral-100 bg-neutral-50/50 px-2 py-1.5">
        <ToolbarButton
          label="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Strikethrough"
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Link"
          active={editor.isActive('link')}
          onClick={() => {
            const url = window.prompt('URL');
            if (url) editor.chain().focus().setLink({ href: url }).run();
            else editor.chain().focus().unsetLink().run();
          }}
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-neutral-200" />
        <ToolbarButton
          label="Undo"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
