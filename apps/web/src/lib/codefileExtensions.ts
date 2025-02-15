const extensionRegex = /\.[0-9a-z]+$/i;

export const codeFileExtensions: Record<string, string> = {
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript React',
  '.js': 'JavaScript',
  '.jsx': 'JavaScript React',
  '.html': 'HTML',
  '.css': 'CSS',
  '.scss': 'SCSS',
  '.less': 'LESS',
  '.json': 'JSON',
  '.md': 'Markdown',
  '.py': 'Python',
  '.java': 'Java',
  '.c': 'C',
  '.cpp': 'C++',
  '.cs': 'C#',
  '.rb': 'Ruby',
  '.php': 'PHP',
  '.rs': 'Rust',
  '.go': 'Go',
  '.kt': 'Kotlin',
  '.swift': 'Swift',
  '.xml': 'XML',
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.sql': 'SQL',
};

export function getLanguageFromFileName(fileName: string): string {
  const extension = fileName.toLowerCase().match(extensionRegex)?.[0];
  return extension ? (codeFileExtensions[extension] ?? 'Code') : 'Code';
}
