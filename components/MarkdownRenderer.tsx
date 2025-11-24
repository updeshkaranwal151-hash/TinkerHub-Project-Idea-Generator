import React from 'react';
import { parseMarkdown } from '../utils/markdown';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return <div className="prose prose-invert text-white" dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />;
};

export default MarkdownRenderer;