import React, { createContext, useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAPI } from '../API';
import { lightTheme, darkTheme } from '../theme';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [conversations, setConversations] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(true);  // Changed to true
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [projectPath, setProjectPath] = useState("");
  const [isNoAutoExecute, setIsNoAutoExecute] = useState(true);
  const [model, setModel] = useState("");
  const [language, setLanguage] = useState("en");

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
      if (data.status === 'success') {
        setConversations(data.available_conversations);
        setIsNoAutoExecute(data.skip_code_execution);
        setModel(data.model || "");
        setLanguage(data.language || "en");
        setProjectPath(data.project_path || "");

        if (data.conversation_id && data.available_conversations[data.conversation_id]) {
          updateConversation(data.conversation_id, {
            messages: [],
            systemPrompt: data.system_prompt?.content
          });
          navigate(`/chat/${data.conversation_id}`);
        }

        initializeAppCalled.current = true;
      } else {
        console.error('Initialization failed:', data.message);
      }
    } catch (error) {
      console.error('Error at initialization:', error);
    }
  }, [api, navigate, updateConversation]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);


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
      if (response.project_path) {
        setProjectPath(response.project_path);
      }
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

  const updateMessage = useCallback((conversationId, messagecontent, updates) => {
    setConversations(prev => {
      const conversation = prev[conversationId];
      if (!conversation) return prev;
      return {
        ...prev,
        [conversationId]: {
          ...conversation,
          messages: conversation.messages.map(msg =>
            msg.content === messagecontent ? { ...msg, ...updates } : msg
          ),
        }
      };
    });
  }, []);

  const executeBlock = useCallback(async (code, timestamp) => {
    const response = await api.executeBlock({ code, timestamp });
    console.log('Execution result:', response.result);
    return response;
  }, [api]);

  const toggleAutoExecute = useCallback(async () => {
    const response = await api.toggleAutoExecute();
    if (response?.status === 'success') {
      setIsNoAutoExecute(response.skip_code_execution);
    }
  }, [api]);

  const value = useMemo(() => ({
    theme,
    isDarkMode,
    setIsDarkMode,
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
    isNoAutoExecute,
    toggleAutoExecute,
    model,
    language,
    setLanguage,
  }), [
    theme,
    isDarkMode,
    setIsDarkMode,
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
    isNoAutoExecute,
    toggleAutoExecute,
    model,
    language,
    setLanguage,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
