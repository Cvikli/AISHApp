import React, { createContext, useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAPI } from '../API';
import { lightTheme, darkTheme } from '../theme';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [conversations, setConversations] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [projectPath, setProjectPath] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  const theme = isDarkMode ? darkTheme : lightTheme;
  const navigate = useNavigate();

  const api = useAPI();
  const initializeAppCalled = useRef(false);

  const initializeApp = useCallback(async () => {
    if (initializeAppCalled.current) return;
    console.log('initializeApp called');
    try {
      const data = await api.initializeAIState();
      setConversations(data.available_conversations);
      setSystemPrompt(data.system_prompt);
      setProjectPath(data.project_path || "");
      initializeAppCalled.current = true;
    } catch (error) {
      console.error('Failed to initialize AI state:', error);
    }
  }, [api]);

  useEffect(() => {
    initializeApp();
  }, []);

  const selectConversation = useCallback(async (id) => {
    try {
      const response = await api.selectConversation({ conversation_id: id });
      if (response && response.status === 'success') {
        setConversations(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            messages: response.history || [],
            system_prompt: response.system_prompt
          }
        }));
        setSystemPrompt(response.system_prompt);
      }
    } catch (error) {
      console.error('Error selecting conversation:', error);
    }
  }, [api]);

  const startNewConversation = useCallback(async () => {
    try {
      const response = await api.startNewConversation();
      if (response && response.status === 'success') {
        const newConversationId = response.conversation_id;
        const newConversation = {
          id: newConversationId,
          timestamp: new Date().toISOString(),
          sentence: "New Conversation",
          messages: [{ role: 'system', message: systemPrompt, timestamp: new Date().toISOString() }],
          system_prompt: systemPrompt
        };
        setConversations(prev => ({
          ...prev,
          [newConversationId]: newConversation
        }));
        navigate(`/conversation/${newConversationId}`);
      }
    } catch (error) {
      console.error('Error starting new conversation:', error);
    }
  }, [api, systemPrompt, navigate]);

  const addMessage = useCallback((conversationId, newMessage) => {
    setConversations(prev => {
      const conversation = prev[conversationId];
      if (!conversation) return prev;
      return {
        ...prev,
        [conversationId]: {
          ...conversation,
          messages: [...conversation.messages, newMessage],
          sentence: newMessage.role === 'user' ? newMessage.message.substring(0, 30) + '...' : conversation.sentence
        }
      };
    });
  }, []);

  const updateProjectPath = useCallback(async (newPath) => {
    try {
      const response = await api.setPath({ path: newPath });
      if (response && response.status === 'success') {
        setProjectPath(newPath);
        if (response.system_prompt) {
          setSystemPrompt(response.system_prompt);
        }
      }
    } catch (error) {
      console.error('Error updating project path:', error);
    }
  }, [api]);

  const updateSystemPrompt = useCallback(async (newPrompt) => {
    try {
      await api.updateSystemPrompt({ system_prompt: newPrompt });
      setSystemPrompt(newPrompt);
    } catch (error) {
      console.error('Error updating system prompt:', error);
    }
  }, [api]);

  const refreshProject = useCallback(async () => {
    try {
      await api.refreshProject();
    } catch (error) {
      console.error('Error refreshing project:', error);
    }
  }, [api]);

  const processMessage = useCallback(async (conversationId, message) => {
    try {
      const data = await api.processMessage({ message, conversation_id: conversationId });
      const aiMessage = { role: 'ai', message: data.response, timestamp: new Date().toISOString() };
      addMessage(conversationId, aiMessage);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = { role: 'ai', message: 'Sorry, I encountered an error.', timestamp: new Date().toISOString() };
      addMessage(conversationId, errorMessage);
    }
  }, [api, addMessage]);

  const value = useMemo(() => ({
    conversations,
    isCollapsed,
    setIsCollapsed,
    isDarkMode,
    setIsDarkMode,
    projectPath,
    systemPrompt,
    theme,
    selectConversation,
    startNewConversation,
    addMessage,
    updateProjectPath,
    updateSystemPrompt,
    refreshProject,
    processMessage,
  }), [
    conversations,
    isCollapsed,
    isDarkMode,
    projectPath,
    systemPrompt,
    theme,
    selectConversation,
    startNewConversation,
    addMessage,
    updateProjectPath,
    updateSystemPrompt,
    refreshProject,
    processMessage,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
