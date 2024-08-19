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

  const theme = isDarkMode ? darkTheme : lightTheme;
  const initializeAppCalled = useRef(false);
  const navigate = useNavigate();

  const api = useAPI();

  const initializeApp = useCallback(async () => {
    if (initializeAppCalled.current) return;
    console.log('initializeApp called');
    try {
      const data = await api.initializeAIState();
      setConversations(data.available_conversations);
      setProjectPath(data.project_path || "");
      setConversations(prev => ({
        ...prev,
        [data.conversation_id]: {
          ...prev[data.conversation_id],
          messages: [],
          systemPrompt: data.system_prompt
        }
      }));
      initializeAppCalled.current = true;

      if (data.conversation_id) {
        navigate(`/chat/${data.conversation_id}`);
      }
    } catch (error) {
      console.error('Failed to initialize AI state:', error);
    }
  }, [api, navigate]);

  useEffect(() => {
    initializeApp();
  }, []);

  const selectConversation = useCallback(async (id) => {
    try {
      const response = await api.selectConversation({ conversation_id: id });
      console.log('API Response:', response);

      if (response?.status === 'success') {
        const updatedConversation = {
          ...conversations[id],
          messages: response.history || [],
          system_prompt: response.system_prompt
        };
        
        console.log('Updated Conversation:', updatedConversation);

        setConversations(prev => ({
          ...prev,
          [id]: updatedConversation
        }));

        navigate(`/chat/${id}`);

        console.log('Updated Conversations State:', {
          ...conversations,
          [id]: updatedConversation
        });
      }
    } catch (error) {
      console.error('Error selecting conversation:', error);
    }
  }, [api, conversations]);

  const startNewConversation = useCallback(async () => {
    try {
      const response = await api.startNewConversation();
      if (response?.status === 'success') {
        const newConversation = response.conversation;
        if (newConversation?.id) {
          setConversations(prev => ({
            ...prev,
            [newConversation.id]: {
              ...newConversation,
              messages: [],
              systemPrompt: response.system_prompt || ''
            }
          }));
          navigate(`/chat/${newConversation.id}`);
        }
      }
    } catch (error) {
      console.error('Error starting new conversation:', error);
    }
  }, [api, navigate]);

  const addMessage = useCallback((conversationId, newMessage) => {
    setConversations(prev => {
      const conversation = prev[conversationId];
      if (!conversation) return prev;
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

  const updateProjectPath = useCallback(async (newPath) => {
    try {
      const response = await api.setPath({ path: newPath });
      if (response?.status === 'success') {
        setProjectPath(newPath);
        if (response.system_prompt) {
          setConversations(prev => ({
            ...prev,
            [Object.keys(prev)[0]]: {
              ...prev[Object.keys(prev)[0]],
              systemPrompt: response.system_prompt
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error updating project path:', error);
    }
  }, [api]);

  const updateSystemPrompt = useCallback(async (conversationId, newPrompt) => {
    try {
      await api.updateSystemPrompt({ system_prompt: newPrompt });
      setConversations(prev => ({
        ...prev,
        [conversationId]: {
          ...prev[conversationId],
          systemPrompt: newPrompt
        }
      }));
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
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
