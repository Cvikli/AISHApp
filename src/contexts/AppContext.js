import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAPI } from '../hooks/useAPI';
import { lightTheme, darkTheme } from '../theme';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  console.log('AppProvider rendering');
  const [conversations, setConversations] = useState({});
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [projectPath, setProjectPath] = useState("");
  const [messages, setMessages] = useState([]);

  const theme = isDarkMode ? { ...darkTheme, name: 'dark' } : { ...lightTheme, name: 'light' };

  const api = useAPI();

  useEffect(() => {
    const initializeApp = async () => {
      console.log('initializeApp called');
      try {
        const data = await api.initializeAIState();
        setSelectedConversationId(data.conversation_id);
        console.log(data.available_conversations)
        setConversations(data.available_conversations);
        console.log("Initialized conversations:", data.available_conversations);
      } catch (error) {
        console.error('Failed to initialize AI state:', error);
      }
    };
    initializeApp();
  }, []);

  const selectConversation = useCallback(async (id) => {
    try {
      const response = await api.selectConversation(id);
      if (response && response.status === 'success') {
        setSelectedConversationId(id);
        console.log(response.history)
        setMessages(response.history || []);
      }
    } catch (error) {
      console.error('Error selecting conversation:', error);
    }
  }, [api]);

  const value = {
    conversations,
    setConversations,
    selectedConversationId,
    setSelectedConversationId,
    isCollapsed,
    setIsCollapsed,
    isDarkMode,
    setIsDarkMode,
    projectPath,
    setProjectPath,
    messages,
    setMessages,
    theme,
    api,
    selectConversation,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
