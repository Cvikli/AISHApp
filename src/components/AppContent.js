import React, { useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { useAppContext } from '../contexts/AppContext';
import Layout from './Layout';

function AppContent() {
  const { theme, api, setSelectedConversationId, setConversations } = useAppContext();

  useEffect(() => {    
    const init = async () => {
      try {
        const data = await api.initializeAIState();
        setSelectedConversationId(data.conversation_id);
        setConversations(data.available_conversations);
        console.log("Initialized conversations:", data.available_conversations);
      } catch (error) {
        console.error('Failed to initialize AI state:', error);
      }
    };
    init();
  }, [api, setSelectedConversationId, setConversations]);

  return (
    <ThemeProvider theme={theme}>
      <Layout />
    </ThemeProvider>
  );
}

export default AppContent;
