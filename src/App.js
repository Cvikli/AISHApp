import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import ChatComponent from './ChatComponent';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import * as API from './API';
import { lightTheme, darkTheme } from './theme';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;  
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};  
`;

const MainContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

function App() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [projectPath, setProjectPath] = useState("");
  const [messages, setMessages] = useState([]);

  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {    
    const init = async () => {
      try {
        const data = await API.initializeAIState();
        setSelectedConversationId(data.conversation_id);
        setConversations(data.available_conversations);
        console.log("Initialized conversations:", data.available_conversations);
      } catch (error) {
        console.error('Failed to initialize AI state:', error);
      }
    };
    init();
  }, []);

  const handleFolderSelect = async () => {
    try {
      const result = await window.electron.openFolder();
      if (!result.canceled && result.filePaths.length > 0) {
        const path = result.filePaths[0];
        setProjectPath(path);
        await API.setPath(path);
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  const startNewConversation = async () => {
    try {
      const data = await API.startNewConversation();
      setSelectedConversationId(data.conversation_id);
      setConversations(prev => [...prev, data.conversation_id]);
    } catch (error) {
      console.error('Error starting new conversation:', error);
    }
  };

  const selectConversation = async (id) => {
    const data = await API.selectConversation(id);
    setSelectedConversationId(id);
    setMessages(data.history);
  };

  const refreshProject = async () => {
    const data = await API.refreshProject();
    alert(data.message);
  };

  const updateSystemPrompt = async () => {
    const data = await API.updateSystemPrompt();
    alert(data.message);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <Sidebar theme={theme}
          isCollapsed={isCollapsed}
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          startNewConversation={startNewConversation}
          selectConversation={selectConversation}
        />
        <MainContent>
          <Header 
            theme={theme}
            toggleSidebar={toggleSidebar}
            toggleTheme={toggleTheme}
            handleFolderSelect={handleFolderSelect}
            refreshProject={refreshProject}
            updateSystemPrompt={updateSystemPrompt}
            projectPath={projectPath}
          />
          <ChatComponent 
            theme={theme}
            conversationId={selectedConversationId}          
            messages={messages}
            setMessages={setMessages}
          />
        </MainContent>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
