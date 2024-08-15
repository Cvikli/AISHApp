import React, { createContext, useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { useAPI } from '../API';
import { lightTheme, darkTheme } from '../theme';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [conversations, setConversations] = useState({});
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [projectPath, setProjectPath] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  const theme = isDarkMode ? darkTheme : lightTheme;

  const api = useAPI();
  const initializeAppCalled = useRef(false);

  const initializeApp = useCallback(async () => {
    if (initializeAppCalled.current) return;
    console.log('initializeApp called');
    try {
      const data = await api.initializeAIState();
      setSelectedConversationId(data.conversation_id);
      setConversations(data.available_conversations);
      setSystemPrompt(data.system_prompt);
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
        setSelectedConversationId(id);
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
        setSelectedConversationId(newConversationId);
        setSystemPrompt(systemPrompt);
      }
    } catch (error) {
      console.error('Error starting new conversation:', error);
    }
  }, [api, systemPrompt]);

  const addMessage = useCallback((newMessage) => {
    setConversations(prev => {
      const conversation = prev[selectedConversationId];
      return {
        ...prev,
        [selectedConversationId]: {
          ...conversation,
          messages: [...conversation.messages, newMessage],
          sentence: newMessage.role === 'user' ? newMessage.message.substring(0, 30) + '...' : conversation.sentence
        }
      };
    });
  }, [selectedConversationId]);

 const updateProjectPath = useCallback((newPath) => {
    setProjectPath(newPath);
    
    // Add a system message to indicate the project path change attempt
    addMessage({
      role: 'system',
      message: `Attempting to update project path to: ${newPath}`,
      timestamp: new Date().toISOString()
    });

    // Make the API call without waiting for the response
    api.setPath({ path: newPath })
      .then(response => {
        if (response && response.status === 'success') {
          if (response.system_prompt) {
            setSystemPrompt(response.system_prompt);
            setConversations(prev => ({
              ...prev,
              [selectedConversationId]: {
                ...prev[selectedConversationId],
                system_prompt: response.system_prompt
              }
            }));
          }
          // Add a success message
          addMessage({
            role: 'system',
            message: `Project path successfully updated to: ${newPath}`,
            timestamp: new Date().toISOString()
          });
        } else {
          // Add an error message if the status is not success
          addMessage({
            role: 'system',
            message: `Failed to update project path. Server response: ${response.message || 'Unknown error'}`,
            timestamp: new Date().toISOString()
          });
        }
      })
      .catch(error => {
        console.error('Error updating project path:', error);
        // Add an error message
        addMessage({
          role: 'system',
          message: `Error updating project path: ${error.message || 'Unknown error'}`,
          timestamp: new Date().toISOString()
        });
      });
  }, [api, selectedConversationId, addMessage]);
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

  const processMessage = useCallback(async (message) => {
    try {
      const data = await api.processMessage({ message, conversation_id: selectedConversationId });
      const aiMessage = { role: 'ai', message: data.response, timestamp: new Date().toISOString() };
      addMessage(aiMessage);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = { role: 'ai', message: 'Sorry, I encountered an error.', timestamp: new Date().toISOString() };
      addMessage(errorMessage);
    }
  }, [api, selectedConversationId, addMessage]);

  const value = useMemo(() => ({
    conversations,
    selectedConversationId,
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
    selectedConversationId,
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
