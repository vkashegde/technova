"use client";

import * as React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Undo,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  initialContent?: JSONContent;
  onChange?: (json: JSONContent) => void;
};

export function RichTextEditor({ initialContent, onChange }: Props) {
  const [link, setLink] = React.useState("");

  const editor = useEditor({
    // Required for Next.js/SSR to avoid hydration mismatches
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: "Write your story…",
      }),
      TextStyle,
      Color,
    ],
    content: initialContent ?? { type: "doc", content: [] },
    editorProps: {
      attributes: {
        class:
          "rounded-2xl border bg-background px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-ring",
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getJSON());
    },
  });

  if (!editor) return null;

  const setOrUnsetLink = () => {
    const url = link.trim();
    if (!url) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          type="button"
          variant={editor.isActive("bold") ? "default" : "outline"}
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("italic") ? "default" : "outline"}
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("bulletList") ? "default" : "outline"}
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Bullet list"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("orderedList") ? "default" : "outline"}
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Ordered list"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("blockquote") ? "default" : "outline"}
          size="icon"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="mx-2 h-6 w-px bg-border" />

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().undo().run()}
          aria-label="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().redo().run()}
          aria-label="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="mx-2 h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4 text-muted-foreground" />
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://…"
            className="h-9 w-52"
          />
          <Button type="button" variant="outline" onClick={setOrUnsetLink}>
            Set
          </Button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}


