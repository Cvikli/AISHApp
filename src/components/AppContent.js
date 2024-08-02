import React from 'react';
import { ThemeProvider } from 'styled-components';
import { useAppContext } from '../contexts/AppContext';
import Layout from './Layout';

function AppContent() {
  const { theme } = useAppContext();

  return (
    <ThemeProvider theme={theme}>
      <Layout />
    </ThemeProvider>
  );
}

export default AppContent;
