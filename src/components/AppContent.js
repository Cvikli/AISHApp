import React, { useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { useAppContext } from '../contexts/AppContext';
import Layout from './Layout';

function AppContent() {
  const { theme, api, setSelectedConversationId, setConversations } = useAppContext();

  useEffect(() => {
    console.log('AppContent useEffect triggered');
    const initializeApp = async () => {
      console.log('initializeApp called');
      try {
        const data = await api.initializeAIState();
        setSelectedConversationId(data.conversation_id);
        setConversations(data.available_conversations);
        console.log("Initialized conversations:", data.available_conversations);
      } catch (error) {
        console.error('Failed to initialize AI state:', error);
      }
    };
    initializeApp();
  }, []); // Empty dependency array

  return (
    <ThemeProvider theme={theme}>
      <Layout />
    </ThemeProvider>
  );
}

export default AppContent;
