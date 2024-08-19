import React, { createContext, useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAPI } from '../API';
import { lightTheme, darkTheme } from '../theme';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [conversations, setConversations] = useState({});
  const [conversationId, setConversationId] = useState("");
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

      if (data.conversation_id) {
        navigate(`/conversation/${data.conversation_id}`);
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
      setConversationId(id)
      const response = await api.selectConversation({ conversation_id: id });
      console.log('API Response:', response); // Log the entire response

      if (response?.status === 'success') {
        const updatedConversation = {
          ...conversations[id],
          messages: response.history || [],
          system_prompt: response.system_prompt
        };
        
        console.log('Updated Conversation:', updatedConversation); // Log the updated conversation

        setConversations(prev => ({
          ...prev,
          [id]: updatedConversation
        }));

        setSystemPrompt(response.system_prompt);

        // Log the updated state
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
              messages: [{ role: 'system', message: systemPrompt, timestamp: new Date().toISOString() }],
              system_prompt: systemPrompt
            }
          }));
          setConversationId(newConversation.id)
          navigate(`/conversation/${newConversation.id}`);
        }
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
      if (response?.status === 'success') {
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

  const updateMessage = useCallback((conversationId, messageTimestamp, updates) => {
    setConversations(prev => {
      const conversation = prev[conversationId];
      console.log(conversation)
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
    conversations,
    conversationId,
    setConversationId,
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
    updateMessage,
    updateProjectPath,
    updateSystemPrompt,
    refreshProject,
  }), [
    conversations,
    conversationId,
    setConversationId,
    isCollapsed,
    isDarkMode,
    projectPath,
    systemPrompt,
    theme,
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
