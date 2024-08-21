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
    const data = await api.initializeAIState();
    setConversations(data.available_conversations);
    setProjectPath(data.project_path || "");
    updateConversation(data.conversation_id, {
      messages: [],
      systemPrompt: data.system_prompt?.content
    });
    initializeAppCalled.current = true;
    if (data.conversation_id) {
      navigate(`/chat/${data.conversation_id}`);
    }
  }, [api, navigate, updateConversation]);

  useEffect(() => {
    initializeApp();
  }, []);

  const selectConversation = useCallback(async (id) => {
    try {
      const response = await api.selectConversation({ conversation_id: id });
      console.log('API Response:', response);

      if (response?.status === 'success') {
        updateConversation(id, {
          messages: response.history || [],
          systemPrompt: response.system_prompt?.content
        });
        navigate(`/chat/${id}`);
      }
    } catch (error) {
      console.error('Error selecting conversation:', error);
    }
  }, [api, navigate, updateConversation]);

  const startNewConversation = useCallback(async () => {
    const emptyConversation = Object.values(conversations).find(
      conv => conv.sentence === "New" || conv.sentence === ""
    );
    if (emptyConversation) {
        setConversations(prev => {
          const { [emptyConversation.id]: _, ...rest } = prev;
          return rest;
        });
    }
    const response = await api.startNewConversation();
    if (response?.status === 'success' && response.conversation?.id) {
      // Add the new conversation
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

  const updateSystemPrompt = useCallback(async (conversationId, newPrompt) => {
      await api.updateSystemPrompt({ system_prompt: newPrompt });
      updateConversation(conversationId, { systemPrompt: newPrompt });
  }, [api, updateConversation]);

  const refreshProject = useCallback(async () => {
    try {
      await api.refreshProject();
    } catch (error) {
      console.error('Error refreshing project:', error);
    }
  }, [api]);

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

  const value = useMemo(() => ({
    theme,
    isDarkMode,
    isCollapsed,
    setIsCollapsed,
    projectPath,
    conversations,
    selectConversation,
    startNewConversation,
    addMessage,
    updateMessage,
    updateProjectPath,
    updateSystemPrompt,
    refreshProject,
    executeBlock,
  }), [
    theme,
    isDarkMode,
    isCollapsed,
    setIsCollapsed,
    projectPath,
    conversations,
    selectConversation,
    startNewConversation,
    addMessage,
    updateMessage,
    updateProjectPath,
    updateSystemPrompt,
    refreshProject,
    executeBlock,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
