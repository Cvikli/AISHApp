export const getLanguageFromExtension = (extension) => {
  const languageMap = {
    'js': 'javascript',
    'ts': 'typescript',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'less': 'less',
    'json': 'json',
    'xml': 'xml',
    'svg': 'xml',
    'py': 'python',
    'rb': 'ruby',
    'php': 'php',
    'java': 'java',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'scala': 'scala',
    'kt': 'kotlin',
    'swift': 'swift',
    'sh': 'shell',
    'bash': 'shell',
    'zsh': 'shell',
    'ps1': 'powershell',
    'bat': 'bat',
    'cmd': 'bat',
    'md': 'markdown',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'ini': 'ini',
    'sql': 'sql',
    'c': 'c',
    'cpp': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'dart': 'dart',
    'lua': 'lua',
    'r': 'r',
    'jl': 'julia',
    'ex': 'elixir',
    'exs': 'elixir',
    'erl': 'erlang',
    'hrl': 'erlang',
    'clj': 'clojure',
    'fs': 'fsharp',
    'fsx': 'fsharp',
    'vb': 'vb',
    'asm': 'assembly',
    'pl': 'perl',
    'groovy': 'groovy',
    'dockerfile': 'dockerfile',
    'tex': 'latex',
  };
  return languageMap[extension] || 'plaintext';
};

export const getLanguageFromCommand = (command) => {
  if (command.startsWith('meld ')) {
    const match = command.match(/meld\s+(\S+)/);
    if (match) {
      const filename = match[1];
      const extension = filename.split('.').pop().toLowerCase();
      return getLanguageFromExtension(extension);
    }
  } else if (command.startsWith('cat ')) {
    const match = command.match(/cat\s+>\s+(\S+)/);
    if (match) {
      const filename = match[1];
      const extension = filename.split('.').pop().toLowerCase();
      return getLanguageFromExtension(extension);
    }
  }
  return 'plaintext';
};
