import React, { createContext, useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { useAPI } from '../api';
import { lightTheme, darkTheme } from '../theme';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [conversations, setConversations] = useState({});
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [projectPath, setProjectPath] = useState("");
  const [messages, setMessages] = useState([]);
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
      if (data.history && data.history.length > 0) {
        setMessages(data.history);
      } else {
        // If no history, add the system prompt from the API
        const apiSystemPrompt = { role: 'system', message: data.system_prompt, timestamp: new Date().toISOString() };
        setMessages([apiSystemPrompt]);
      }
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
        setMessages(response.history || []);
      }
    } catch (error) {
      console.error('Error selecting conversation:', error);
    }
  }, [api]);

  const startNewConversation = useCallback(async () => {
    console.log("startNewConversation function called");
    try {
      console.log("Starting new conversation");
      const response = await api.startNewConversation();
      console.log("New conversation response:", response);
      if (response && response.status === 'success') {
        const apiSystemPrompt = { role: 'system', message: systemPrompt, timestamp: new Date().toISOString() };
        const newConversation = {
          id: response.conversation_id,
          timestamp: new Date().toISOString(),
          sentence: "New Conversation",
          messages: [apiSystemPrompt]
        };
        console.log("New conversation object:", newConversation);
        setConversations(prevConversations => ({
          ...prevConversations,
          [response.conversation_id]: newConversation
        }));
        setMessages([apiSystemPrompt]);
        await selectConversation(response.conversation_id);
      }
    } catch (error) {
      console.error('Error starting new conversation:', error);
    }
  }, [api, selectConversation, systemPrompt]);

  const addMessage = useCallback((newMessage) => {
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setConversations(prevConversations => {
      const updatedConversation = {
        ...prevConversations[selectedConversationId],
        messages: [...(prevConversations[selectedConversationId]?.messages || []), newMessage],
        sentence: newMessage.role === 'user' ? newMessage.message.substring(0, 30) + '...' : prevConversations[selectedConversationId]?.sentence
      };
      return {
        ...prevConversations,
        [selectedConversationId]: updatedConversation
      };
    });
  }, [selectedConversationId]);

  const updateProjectPath = useCallback(async (newPath) => {
    try {
      await api.setPath({ path: newPath });
      setProjectPath(newPath);
    } catch (error) {
      console.error('Error updating project path:', error);
    }
  }, [api]);

  const value = useMemo(() => ({
    conversations,
    setConversations,
    selectedConversationId,
    setSelectedConversationId,
    isCollapsed,
    setIsCollapsed,
    isDarkMode,
    setIsDarkMode,
    projectPath,
    setProjectPath: updateProjectPath,
    messages,
    setMessages,
    theme,
    api,
    selectConversation,
    startNewConversation,
    addMessage,
    systemPrompt,
    setSystemPrompt,
  }), [
    conversations,
    selectedConversationId,
    isCollapsed,
    isDarkMode,
    projectPath,
    messages,
    theme,
    api,
    selectConversation,
    startNewConversation,
    addMessage,
    updateProjectPath,
    systemPrompt,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
