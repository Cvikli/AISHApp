const commonStyles = {
  styleColor: '#0f0',
  textColor: '#d4d4d4',
  borderColor: '#0f0',
  hoverColor: '#030',
  backgroundColor: '#242424',
};

export const lightTheme = {
  ...commonStyles,
  name: 'light',
  background: '#fff',
  text: '#333',
  borderColor: '#e0e0e0',
  chatBackground: '#f5f5f5',
  inputBackground: '#fff',
  userMessageBackground: '#e0e0e0',
  aiMessageBackground: '#f0f0f0',
  hoverBackground: '#f0f0f0',
  selectedBackground: '#e0e0e0',
  codeBackground: '#f0f0f0',
};

export const darkTheme = {
  ...commonStyles,
  name: 'dark',
  background: '#2d2d2d',
  text: '#fff',
  borderColor: '#606060',
  chatBackground: '#1e1e1e',
  inputBackground: '#3a3a3a',
  userMessageBackground: '#2a2a2a',
  aiMessageBackground: '#333',
  hoverBackground: '#3a3a3a',
  selectedBackground: '#4a4a4a',
  codeBackground: '#2a2a2a',
};

