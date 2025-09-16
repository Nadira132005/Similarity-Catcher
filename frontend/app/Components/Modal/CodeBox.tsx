import { useState } from "react";
import React from "react";

//@ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-ignore
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

type BoxType = {
  code: string;
  language: string;
};

export default function CodeBox({ code, language }: BoxType) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div className="relative bg-gray-900 text-green-200 text-sm font-mono p-12 rounded-lg shadow-md overflow-hidden h-full w-full ">
      <button
        onClick={handleCopy}
        className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded transition"
      >
        {copied ? "✔ Copied" : "📋 Copy All"}
      </button>
      <SyntaxHighlighter
        language={language}
        style={dracula}
        customStyle={{
          margin: 0,
          padding: "1.25rem",
          height: "100%",
          width: "100%",
          overflow: "auto",
          fontSize: "0.85rem",
          backgroundColor: "#282a36",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        wrapLines
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
