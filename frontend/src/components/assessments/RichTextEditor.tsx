"use client";

import { useEffect, useRef } from "react";

type Props = { value?: string; onChange: (value: string) => void; placeholder?: string; minHeight?: number };

export default function RichTextEditor({ value = "", onChange, placeholder, minHeight = 110 }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value;
  }, [value]);
  const command = (name: string) => {
    editorRef.current?.focus();
    document.execCommand(name, false);
    onChange(editorRef.current?.innerHTML || "");
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    onChange(editorRef.current?.innerHTML || "");
  };

  return <div className="overflow-hidden rounded-lg border border-gray-300 focus-within:border-[#010080] focus-within:ring-2 focus-within:ring-[#010080]/20">
    <div className="flex gap-1 border-b border-gray-200 bg-gray-50 p-2">
      <button type="button" onClick={() => command("bold")} className="h-8 w-8 rounded font-bold hover:bg-gray-200">B</button>
      <button type="button" onClick={() => command("italic")} className="h-8 w-8 rounded italic hover:bg-gray-200">I</button>
      <button type="button" onClick={() => command("insertUnorderedList")} className="h-8 px-2 rounded hover:bg-gray-200">• List</button>
    </div>
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onInput={(e) => onChange(e.currentTarget.innerHTML)}
      onPaste={handlePaste}
      className="rich-editor px-4 py-3 text-sm outline-none"
      style={{ minHeight }}
    />
    <style jsx>{`.rich-editor:empty:before { content: attr(data-placeholder); color: #9ca3af; }`}</style>
  </div>;
}
