import React, { createContext, useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { lightTheme, darkTheme } from '../theme';
import { setCookie, getCookie } from '../cookies';
import { LANGUAGE_CODES, VoiceState } from '../constants'; 

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [availableMicrophones, setAvailableMicrophones] = useState([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState(null);
  const [conversations, setConversations] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [projectPath, setProjectPath] = useState(() => getCookie('projectPath') || "");
  const [isNoAutoExecute, setIsNoAutoExecute] = useState(true);
  const [model, setModel] = useState("");
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [language, setLanguage] = useState(() => getCookie('language') || 'en');
  const [voiceState, setVoiceState] = useState(() => getCookie('voiceState') || VoiceState.INACTIVE);
  const [serverIP, setServerIP] = useState(() => getCookie('serverIP') || 'localhost');
  const [serverPort, setServerPort] = useState(() => getCookie('serverPort') || '8001');
  const [autoReconnect, setAutoReconnect] = useState(() => getCookie('autoReconnect') !== 'false');
  const [isResponsePending, setIsResponsePending] = useState(false);

  const theme = isDarkMode ? darkTheme : lightTheme;
  const navigate = useNavigate();

  const recognitionRef = useRef(null);

  useEffect(() => {
    setCookie('serverIP', serverIP);
    setCookie('serverPort', serverPort);
  }, [serverIP, serverPort]);

  useEffect(() => {
    setCookie('language', language);
    setCookie('voiceState', voiceState);
  }, [language, voiceState]);

  const updateServerSettings = useCallback((newIP, newPort) => {
    setServerIP(newIP);
    setServerPort(newPort);
  }, []);

  const toggleAutoReconnect = useCallback(() => {
    setAutoReconnect(prev => {
      const newValue = !prev;
      setCookie('autoReconnect', newValue);
      return newValue;
    });
  }, []);

  // API methods
  const createApiMethod = useCallback((endpoint, method) => async (data = null) => {
    try {
      console.log(`http://${serverIP}:${serverPort}/api/${endpoint}`);
      console.log('Data:', data);
      const response = await axios[method](`http://${serverIP}:${serverPort}/api/${endpoint}`, data);
      if (response.data.status !== 'success') {
        throw new Error(response.data.message || `Failed to ${endpoint}`);
      }
      return response.data;
    } catch (err) {
      console.error(`Error in API method ${endpoint}:`, err);
      throw err;
    }
  }, [serverIP, serverPort]);

  const api = useMemo(() => ({
    initializeAIState: createApiMethod('initialize', 'get'),
    newConversation: createApiMethod('new_conversation', 'post'),
    selectConversation: createApiMethod('select_conversation', 'post'),
    setPath: createApiMethod('set_path', 'post'),
    listItems: createApiMethod('list_items', 'post'),
    executeBlock: createApiMethod('execute_block', 'post'),
    getWholeChanges: createApiMethod('get_whole_changes', 'post'),
    toggleAutoExecute: createApiMethod('toggle_auto_execute', 'post'),
    saveFile: createApiMethod('save_file', 'post'),
  }), [createApiMethod]);

  const saveFile = useCallback(async (filename, content) => {
    try {
      const response = await api.saveFile({ filename, content });
      if (response.status === 'success') {
        console.log('File saved successfully');
        // You might want to update some state or show a notification here
      } else {
        throw new Error(response.message || 'Failed to save file');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      // Handle the error (e.g., show an error message to the user)
    }
  }, [api]);

  const initializeApp = useCallback(async () => {
    try {
      const cookieProjectPath = getCookie('projectPath');
      const data = await api.initializeAIState();
      if (data.status === 'success') {
        console.log("data.available_conversations", data.available_conversations);
        setConversations(data.available_conversations);
        setIsNoAutoExecute(data.skip_code_execution);
        setModel(data.model || "");

        if (data.conversation_id && data.available_conversations[data.conversation_id]) {
          if (cookieProjectPath) {
            await updateProjectPath(data.conversation_id, cookieProjectPath);
          } else {
            setProjectPath(data.project_path || "");
          }
          updateConversation(data.conversation_id, {
            messages: [],
            systemPrompt: data.system_prompt?.content
          });
          navigate(`/chat/${data.conversation_id}`);
        }
      } else {
        throw new Error('Initialization failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error at initialization:', error);
      throw new Error('Initialization failed: ' + (error));
    }
  }, [api, navigate]);

  const updateConversation = useCallback((id, updates) => {
    setConversations(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  }, []);

  const removeEmptyConversation = useCallback((excludeId = null) => {
    const emptyConversation = Object.values(conversations).find(
      conv => conv.messages.length === 0 && conv.id !== excludeId
    );
    if (emptyConversation) {
      setConversations(prev => {
        const { [emptyConversation.id]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [conversations]);

  const selectConversation = useCallback(async (id) => {
    removeEmptyConversation(id);
    const response = await api.selectConversation({ conversation_id: id });
    if (response?.status === 'success') {
      updateConversation(id, {
        messages: response.history || [],
        systemPrompt: response.system_prompt?.content
      });
      navigate(`/chat/${id}`);
    }
  }, [api, navigate, updateConversation, removeEmptyConversation]);

  const newConversation = useCallback(async () => {
    removeEmptyConversation();
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
  }, [api, navigate, updateConversation, removeEmptyConversation]);

  const updateProjectPath = useCallback(async (conversationId, newPath) => {
    console.log("newPath", newPath);
    const response = await api.setPath({ path: newPath });
    if (response?.status === 'success') {
      setProjectPath(newPath);
      setCookie('projectPath', newPath);
      if (response.system_prompt) {
        updateConversation(conversationId, { systemPrompt: response.system_prompt.content });
      }
    }
  }, []);

  const addMessage = useCallback((conversationId, message) => {
    setConversations(prevConversations => {
      if (!prevConversations[conversationId]) {
        console.warn(`Conversation ${conversationId} not found. Creating a new conversation.`);
        return {
          ...prevConversations,
          [conversationId]: {
            id: conversationId,
            messages: [message],
            systemPrompt: ''
          }
        };
      }
      return {
        ...prevConversations,
        [conversationId]: {
          ...prevConversations[conversationId],
          messages: [...(prevConversations[conversationId].messages || []), message]
        }
      };
    });
  }, []);

  const delMessage = useCallback((conversationId, messageId) => {
    setConversations(prevConversations => {
      const updatedConversation = { ...prevConversations[conversationId] };
      updatedConversation.messages = updatedConversation.messages.filter(message => message.id !== messageId);
      return {
        ...prevConversations,
        [conversationId]: updatedConversation
      };
    });
  }, []);

  const updateMessage = useCallback((conversationId, messageId, updates) => {
    setConversations(prevConversations => {
      const conversation = prevConversations[conversationId];
      if (!conversation) {
        console.warn(`Conversation ${conversationId} not found.`);
        return prevConversations;
      }
      return {
        ...prevConversations,
        [conversationId]: {
          ...conversation,
          messages: conversation.messages.map(msg => 
            msg.id === messageId ? { ...msg, ...updates } : msg
          )
        }
      };
    });
  }, []);

  const executeBlock = useCallback(async (code, timestamp) => { // TODO change timestamp to id
    if (code.trim().startsWith('meld ')) {
      return await api.getWholeChanges({ code, timestamp });
    } else {
      return await api.executeBlock({ code, timestamp });
    }
  }, [api]);

  const toggleAutoExecute = useCallback(async () => {
    const response = await api.toggleAutoExecute();
    if (response?.status === 'success') {
      setIsNoAutoExecute(response.skip_code_execution);
    }
  }, [api]);

  const handleLanguage = useCallback((newLanguage) => {
    setLanguage(newLanguage);
    setCookie('language', newLanguage);
  }, []);

  const getMicrophones = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const microphones = devices.filter(device => device.kind === 'audioinput');
      setAvailableMicrophones(microphones);
      if (microphones.length > 0 && !selectedMicrophone) {
        setSelectedMicrophone(microphones[0].deviceId);
      }
    } catch (error) {
      console.error('Error getting microphones:', error);
    }
  }, [selectedMicrophone]);

  useEffect(() => {
    getMicrophones();
  }, [getMicrophones]);

  const toggleVoiceActivation = useCallback(() => {
    setVoiceState(prevState => {
      switch (prevState) {
        case VoiceState.INACTIVE: return VoiceState.WAKE_WORD_LISTENING;
        case VoiceState.WAKE_WORD_LISTENING: return VoiceState.INACTIVE;
        case VoiceState.VOICE_ACTIVATED_COMMAND_LISTENING: return VoiceState.COMMAND_LISTENING;
        case VoiceState.COMMAND_LISTENING: return VoiceState.COMMAND_LISTENING;
        default: return VoiceState.INACTIVE;
      }
    });
  }, []);

  const toggleSTTListening = useCallback(() => {
    setVoiceState(prevState => {
      switch (prevState) {
        case VoiceState.INACTIVE: return VoiceState.COMMAND_LISTENING;
        case VoiceState.WAKE_WORD_LISTENING: return VoiceState.VOICE_ACTIVATED_COMMAND_LISTENING;
        case VoiceState.VOICE_ACTIVATED_COMMAND_LISTENING: 
          setFinalTranscript(prev => prev + ' ' + interimTranscript);
          setInterimTranscript('');
          return VoiceState.WAKE_WORD_LISTENING;
        case VoiceState.COMMAND_LISTENING: 
          setFinalTranscript(prev => prev +  ' ' + interimTranscript);  
          setInterimTranscript('');
          return VoiceState.INACTIVE;
        default: return VoiceState.INACTIVE;
      }
    });
  }, []);

  const initializeSpeechRecognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = LANGUAGE_CODES[language] || 'en-US';

      recognition.onresult = (event) => {
        console.log('Speech recognition result received:', event);
        if (voiceState === VoiceState.INACTIVE) {
          console.log('VoiceState is INACTIVE, ignoring result');
          return;
        }
        let interimTranscript = '';
        let finalTranscriptPart = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptPart += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const lowercaseTranscript = (finalTranscriptPart + ' ' + interimTranscript).toLowerCase();
        console.log('Current transcript:', lowercaseTranscript);

        if (voiceState === VoiceState.WAKE_WORD_LISTENING && (lowercaseTranscript.includes('orion') || lowercaseTranscript.includes('ai'))) {
          console.log('Wake word detected');
          setVoiceState(VoiceState.VOICE_ACTIVATED_COMMAND_LISTENING);
          setFinalTranscript('');
          setInterimTranscript('');
          interimTranscript = '';
          finalTranscriptPart = '';
        } else if (voiceState === VoiceState.WAKE_WORD_LISTENING) {
          setFinalTranscript('');
        } else if (voiceState === VoiceState.COMMAND_LISTENING || voiceState === VoiceState.VOICE_ACTIVATED_COMMAND_LISTENING) {
          console.log('Updating transcripts in COMMAND_LISTENING or VOICE_ACTIVATED_COMMAND_LISTENING state');
          setFinalTranscript(prev => prev + finalTranscriptPart);
          setInterimTranscript(interimTranscript);
        }
      };
      recognition.onstart = () => { setIsRecognizing(true) };
      recognition.onend = () => { if (voiceState === VoiceState.INACTIVE) setIsRecognizing(false) };

      recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
          console.log('No speech detected, continuing to listen...');
        } else {
          console.error('Speech recognition error', event.error);
          setIsRecognizing(false);
        }
      };

      recognitionRef.current = recognition;
    } else {
      console.log('webkitSpeechRecognition not available');
    }
  }, [language, voiceState]);

  useEffect(() => {
    initializeSpeechRecognition();
    // Cleanup function to stop recognition when component unmounts
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [initializeSpeechRecognition]);

  useEffect(() => {
    if (voiceState === VoiceState.INACTIVE) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        console.log('Stopped speech recognition');
      }
    } else {
      if (!isRecognizing && recognitionRef.current) {
        recognitionRef.current.start();
        console.log('Started speech recognition');
      } else if (!recognitionRef.current) {
        console.log('The speech recognition is not initialized');
        initializeSpeechRecognition();
      } else {
        console.log(recognitionRef.current);
        console.log('Speech recognition is already running');
      }
    }
  }, [voiceState, isRecognizing]);

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
    delMessage,
    updateProjectPath,
    executeBlock,
    isNoAutoExecute,
    toggleAutoExecute,
    model,
    language,
    handleLanguage,
    interimTranscript,
    finalTranscript,
    setFinalTranscript,
    availableMicrophones, 
    setSelectedMicrophone, 
    voiceState,
    setVoiceState,
    toggleVoiceActivation,
    toggleSTTListening,
    serverIP,
    serverPort,
    updateServerSettings,
    api,
    initializeApp,
    autoReconnect,
    toggleAutoReconnect,
    isResponsePending,
    setIsResponsePending,
    saveFile,
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
    delMessage,
    updateProjectPath,
    executeBlock,
    isNoAutoExecute,
    toggleAutoExecute,
    model,
    language,
    handleLanguage,
    interimTranscript,
    finalTranscript,
    setFinalTranscript,
    availableMicrophones, 
    setSelectedMicrophone,
    voiceState,
    setVoiceState,
    toggleVoiceActivation,
    toggleSTTListening,
    serverIP,
    serverPort,
    updateServerSettings,
    api,
    initializeApp,
    autoReconnect,
    toggleAutoReconnect,
    isResponsePending,
    setIsResponsePending,
    saveFile,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
