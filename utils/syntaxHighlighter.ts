// A simple syntax highlighter for demo purposes.

const escapeHtml = (code: string): string => {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

export const highlightHtml = (code: string): string => {
  let highlightedCode = escapeHtml(code);

  // Comments
  highlightedCode = highlightedCode.replace(/(&lt;!--.*?--&gt;)/g, '<span style="color: #6b7280;">$1</span>');

  // Doctype
  highlightedCode = highlightedCode.replace(/(&lt;!DOCTYPE.*&gt;)/gi, '<span style="color: #9ca3af;">$1</span>');
  
  // Tags and attributes
  highlightedCode = highlightedCode.replace(
    /(&lt;)(\/?\w+)(.*?)(\/?&gt;)/g,
    (_, p1, p2, p3, p4) => {
      const attributes = p3.replace(
        /([\w-]+)=(".*?"|'.*?'|[^>\s]+)/g,
        '<span style="color: #6ee7b7;">$1</span>=<span style="color: #f9a8d4;">$2</span>'
      );
      return `${p1}<span style="color: #f87171;">${p2}</span>${attributes}${p4}`;
    }
  );

  // CSS inside <style>
  highlightedCode = highlightedCode.replace(/(&lt;style&gt;[\s\S]*?&lt;\/style&gt;)/g, (match) => {
      return match.replace(/([\w-]+)\s*:/g, '<span style="color: #c4b5fd;">$1</span>:')
                  .replace(/:\s*(.*?);/g, ': <span style="color: #f9a8d4;">$1</span>;');
  });
  
  // JS inside <script>
  highlightedCode = highlightedCode.replace(/(&lt;script&gt;[\s\S]*?&lt;\/script&gt;)/g, (match) => {
      return match.replace(/\b(function|var|let|const|if|else|return|for|while|new|document|window)\b/g, '<span style="color: #a78bfa;">$1</span>')
                  .replace(/(\/\*.*\*\/|\/\/.*)/g, '<span style="color: #6b7280;">$1</span>')
                  .replace(/('.*?'|".*?")/g, '<span style="color: #f9a8d4;">$1</span>');
  });

  return highlightedCode;
};

export const highlightCpp = (code: string): string => {
  let highlightedCode = escapeHtml(code);

    // Comments
    highlightedCode = highlightedCode.replace(/(\/\/.*)/g, '<span style="color: #6b7280;">$1</span>');
    highlightedCode = highlightedCode.replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6b7280;">$1</span>');
    
    // Strings
    highlightedCode = highlightedCode.replace(/(".*?")/g, '<span style="color: #f9a8d4;">$1</span>');

    // Keywords
    const keywords = ['void', 'int', 'float', 'char', 'bool', 'if', 'else', 'for', 'while', 'return', 'class', 'struct', 'new', 'delete', 'true', 'false', 'const', 'static', 'pinMode', 'digitalWrite', 'digitalRead', 'delay', 'Serial', 'setup', 'loop', 'long', 'unsigned'];
    const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    highlightedCode = highlightedCode.replace(keywordRegex, '<span style="color: #a78bfa;">$1</span>');
    
    // Numbers
    highlightedCode = highlightedCode.replace(/\b(\d+L?|\d+\.\d+f?)\b/g, '<span style="color: #7dd3fc;">$1</span>');

    // Preprocessor directives
    highlightedCode = highlightedCode.replace(/(#\w+)/g, '<span style="color: #f87171;">$1</span>');

    // Library includes
    highlightedCode = highlightedCode.replace(/(&lt;)(.*?)(&gt;)/g, '$1<span style="color: #f9a8d4;">$2</span>$3');

  return highlightedCode;
}
