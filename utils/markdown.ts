// A very simple markdown to HTML converter

export const parseMarkdown = (text: string): string => {
  let html = text
    // Escape HTML to prevent XSS
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Bold **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Unordered lists
  html = html.replace(/^\s*[-*]\s+(.*)/gm, '<ul><li>$1</li></ul>');
  // Combine adjacent list items
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  // Paragraphs
  html = html.split('\n\n').map(p => p.trim() ? `<p>${p.replace(/\n/g, '<br>')}</p>` : '').join('');

  // Clean up paragraph wrappers around lists
  html = html.replace(/<p><ul>/g, '<ul>').replace(/<\/ul><\/p>/g, '</ul>');
  
  return html;
};