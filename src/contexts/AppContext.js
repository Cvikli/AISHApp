import React, { createContext, useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAPI } from '../API';
import { lightTheme, darkTheme } from '../theme';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [conversations, setConversations] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [projectPath, setProjectPath] = useState("");
  const [isAutoExecute, setIsAutoExecute] = useState(false);

  const theme = isDarkMode ? darkTheme : lightTheme;
  const initializeAppCalled = useRef(false);
  const navigate = useNavigate();
  const api = useAPI();

  const updateConversation = useCallback((id, updates) => {
    setConversations(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  }, []);

  const initializeApp = useCallback(async () => {
    if (initializeAppCalled.current) return;
    console.log('initializeApp called');
    try {
      const data = await api.initializeAIState();
      setConversations(data.available_conversations);
      setProjectPath(data.project_path || "");
      setIsAutoExecute(data.is_auto_execute || false);
      updateConversation(data.conversation_id, {
        messages: [],
        systemPrompt: data.system_prompt?.content
      });
      initializeAppCalled.current = true;
      if (data.conversation_id) {
        navigate(`/chat/${data.conversation_id}`);
      }
    } catch (error) {
      console.error('Error at initialization:', error);
    }
  }, [api, navigate, updateConversation]);

  useEffect(() => {
    initializeApp();
  }, []);

  const selectConversation = useCallback(async (id) => {
    const response = await api.selectConversation({ conversation_id: id });
    console.log('API Response:', response);

    if (response?.status === 'success') {
      updateConversation(id, {
        messages: response.history || [],
        systemPrompt: response.system_prompt?.content
      });
      navigate(`/chat/${id}`);
    }
  }, [api, navigate, updateConversation]);

  const newConversation = useCallback(async () => {
    const emptyConversation = Object.values(conversations).find(
      conv => conv.sentence === "New" || conv.sentence === ""
    );
    if (emptyConversation) {
        setConversations(prev => {
          const { [emptyConversation.id]: _, ...rest } = prev;
          return rest;
        });
    }
    const response = await api.newConversation();
    if (response?.status === 'success' && response.conversation?.id) {
      updateConversation(response.conversation.id, {
        ...response.conversation,
        messages: [],
        systemPrompt: response.system_prompt?.content || ''
      });
      navigate(`/chat/${response.conversation.id}`);
    }
      
  }, [api, navigate, conversations, updateConversation]);

  const addMessage = useCallback((conversationId, newMessage) => {
    setConversations(prev => {
      const conversation = prev[conversationId];
      if (!conversation) return prev;
      console.log("conversation")
      console.log(conversation)
      return {
        ...prev,
        [conversationId]: {
          ...conversation,
          messages: [...conversation.messages, newMessage],
          sentence: newMessage.role === 'user' ? newMessage.content.substring(0, 30) + '...' : conversation.sentence
        }
      };
    });
  }, []);

  const updateProjectPath = useCallback(async (conversationId, newPath) => {
    const response = await api.setPath({ path: newPath });
    if (response?.status === 'success') {
      setProjectPath(newPath);
      if (response.system_prompt) {
        updateConversation(conversationId, { systemPrompt: response.system_prompt.content });
      }
    }
  }, [api, updateConversation]);

  const updateMessage = useCallback((conversationId, messageTimestamp, updates) => {
    setConversations(prev => {
      const conversation = prev[conversationId];
      if (!conversation) return prev;
      return {
        ...prev,
        [conversationId]: {
          ...conversation,
          messages: conversation.messages.map(msg =>
            msg.timestamp === messageTimestamp ? { ...msg, ...updates } : msg
          ),
        }
      };
    });
  }, []);

  const executeBlock = useCallback(async (code) => {
      const response = await api.executeBlock({ code });
      console.log('Execution result:', response.result);
  }, [api]);

  const toggleAutoExecute = useCallback(async () => {
    const newAutoExecuteState = !isAutoExecute;
    const response = await api.toggleAutoExecute({ is_auto_execute: newAutoExecuteState });
    if (response?.status === 'success') {
      setIsAutoExecute(newAutoExecuteState);
    }
  }, [isAutoExecute, api]);

  const value = useMemo(() => ({
    theme,
    isDarkMode,
    isCollapsed,
    setIsCollapsed,
    projectPath,
    conversations,
    selectConversation,
    newConversation,
    addMessage,
    updateMessage,
    updateProjectPath,
    executeBlock,
    isAutoExecute,
    toggleAutoExecute,
  }), [
    theme,
    isDarkMode,
    isCollapsed,
    setIsCollapsed,
    projectPath,
    conversations,
    selectConversation,
    newConversation,
    addMessage,
    updateMessage,
    updateProjectPath,
    executeBlock,
    isAutoExecute,
    toggleAutoExecute,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
