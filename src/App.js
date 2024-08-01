import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ChatComponent from './ChatComponent';
import axios from 'axios';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;  
  background-color: ${props => props.isDarkMode ? '#333' : '#fff'};
  color: ${props => props.isDarkMode ? '#fff' : '#333'};  
  --border-color: ${props => props.isDarkMode ? '#606060' : '#e0e0e0'};
`;

const Sidebar = styled.div`
  flex-shrink: 0;
  overflow: hidden;
  width: ${props => props.isCollapsed ? '36px' : '350px'};
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
`;

const SidebarHeader = styled.div`
  display: flex;
  padding: 0px;
  align-items: flex-end;
`;

const NewConversationButton = styled.button`
  width: 100%;
  height: 36px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 4px 10px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  color: ${props => props.isDarkMode ? '#fff' : '#333'};
  &:hover {
    background-color: #606060;
  }
`;

const ConversationList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
`;

const ConversationItem = styled.div`
  padding: 4px 10px;
  cursor: pointer;
  &:hover {
    background-color: #606060;
  }
`;

const MainContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  height: 36px;  
  border-bottom: 1px solid var(--border-color);
`;

const CollapseButton = styled.button`
  background: none;
  width: 36px;
  height: 36px;
  border: none;
  font-size: 18px;
  cursor: pointer;
  margin: 0px 4px;
  color: ${props => props.isDarkMode ? '#fff' : '#333'};
`;

const Title = styled.h1`
  font-family: 'Press Start 2P', cursive;
  font-size: 22px;
  margin: 0;
  line-height: 36px;
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 5px 10px;
  color: ${props => props.isDarkMode ? '#fff' : '#333'};
`;

const Button = styled.button`
  padding: 5px 10px;
  margin: 5px;
  background-color: #0084ff;
  color: white;
  border: none;
  border-radius: 0px;
  cursor: pointer;
  font-size: 14px;
`;

const ButtonGroup = styled.div`
  margin-left: auto;
  display: flex;
  gap: 10px;
  align-items: center;
`;

const FolderSelectButton = styled(Button)`
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RefreshButton = styled(Button)`
  padding: 5px 10px;
  font-size: 18px;
`;
const HiddenInput = styled.input`
  display: none;
`;

function App() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [projectPath, setProjectPath] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    initializeAIState();
  }, []);

  const handleFolderSelect = async () => {
    try {
      const result = await window.electron.openFolder();
      if (!result.canceled && result.filePaths.length > 0) {
        const path = result.filePaths[0];
        setProjectPath(path);
        await setPath(path);
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };


  const initializeAIState = async () => {
    try {
      const response = await axios.get('http://localhost:8001/api/initialize');
      setSelectedConversationId(response.data.conversation_id);
      setConversations(response.data.available_conversations);
    } catch (error) {
      console.error('Error initializing AI state:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Data:', error.response.data);
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      console.error('Error config:', error.config);
    }
  };
  


  const startNewConversation = async () => {
    try {
      const response = await axios.post('http://localhost:8001/api/new_conversation');
      if (response.data.status === 'success') {
        setSelectedConversationId(response.data.conversation_id);
        setConversations(prev => [...prev, response.data.conversation_id]);
      }
    } catch (error) {
      console.error('Error starting new conversation:', error);
    }
  };

  const selectConversation = async (id) => {
    try {
      const response = await axios.post('http://localhost:8001/api/select_conversation', { conversation_id: id });
      if (response.data.status === 'success') {
        setSelectedConversationId(id);
        setMessages(response.data.history);
      }
    } catch (error) {
      console.error('Error selecting conversation:', error);
    }
  };


  const setPath = async (path) => {
    try {
      const response = await axios.post('http://localhost:8001/api/set_path', { path: path });
      if (response.data.status === 'success') {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error setting project path:', error);
    }
  };
  
  const refreshProject = async () => {
    try {
      const response = await axios.post('http://localhost:8001/api/refresh_project');
      if (response.data.status === 'success') {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error refreshing project:', error);
    }
  };

  const updateSystemPrompt = async () => {
    try {
      const response = await axios.get('http://localhost:8001/api/update_system_prompt');
      if (response.data.status === 'success') {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error updating system prompt:', error);
    }
  };


  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <AppContainer isDarkMode={isDarkMode}>
      <Sidebar isCollapsed={isCollapsed}>
        <SidebarHeader>
          <NewConversationButton onClick={startNewConversation} isDarkMode={isDarkMode}>
            {isCollapsed ? '+' : '+ New Conversation'}
          </NewConversationButton>
        </SidebarHeader>
        {!isCollapsed && (
          <ConversationList>
            {conversations.map((conv) => (
              <ConversationItem key={conv} onClick={() => selectConversation(conv)}>
                {conv === selectedConversationId ? '➤ ' : ''}{conv}
              </ConversationItem>
            ))}
          </ConversationList>
        )}
      </Sidebar>

      <MainContent>
        <Header>
          <CollapseButton onClick={toggleSidebar} isDarkMode={isDarkMode}>
            {isCollapsed ? '▶' : '◀'}
          </CollapseButton>
          <Title>KODA</Title>
          <ButtonGroup>
            <FolderSelectButton onClick={handleFolderSelect}>
              {projectPath || "Select Project Path"}
            </FolderSelectButton>
            <RefreshButton onClick={refreshProject}>🔄</RefreshButton>
            <Button onClick={updateSystemPrompt}>Update System Prompt</Button>
            <ThemeToggle onClick={toggleTheme} isDarkMode={isDarkMode}>
              {isDarkMode ? '☀️' : '🌙'}
            </ThemeToggle>
          </ButtonGroup>
        </Header>
        <ChatComponent 
          isDarkMode={isDarkMode} 
          conversationId={selectedConversationId}          
          messages={messages}
          setMessages={setMessages}
        />
      </MainContent>
    </AppContainer>
  );
}

export default App;
