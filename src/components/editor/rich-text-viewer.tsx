"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";

export function RichTextViewer({ content }: { content: JSONContent | null }) {
  const editor = useEditor({
    editable: false,
    immediatelyRender: false,
    extensions: [StarterKit, Link, TextStyle, Color],
    content: content ?? { type: "doc", content: [] },
  });

  if (!editor) return null;
  return <EditorContent editor={editor} />;
}


