import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ChatComponent from './ChatComponent';
import axios from 'axios';

const AppContainer = styled.div`
  display: flex;
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
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  height_ 36px;  
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
`;
const Title = styled.h1`
  font-family: 'Press Start 2P', cursive;
  font-size: 22px;
`;

const ThemeToggle = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  z-index: 1000;
`;

const Button = styled.button`
  padding: 5px 10px;
  margin: 5px;
  background-color: #0084ff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

function App() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [projectPath, setProjectPath] = useState('');  
  const [messages, setMessages] = useState([]);


  useEffect(() => {
    initializeAIState();
  }, []);


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


  const setPath = async () => {
    try {
      const response = await axios.post('http://localhost:8001/api/set_path', { path: projectPath });
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
          <NewConversationButton onClick={startNewConversation}>
            {isCollapsed ? '+' : '➕ New Conversation'}
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
          <CollapseButton onClick={toggleSidebar}>
            {isCollapsed ? '▶' : '◀'}
          </CollapseButton>
          <Title>KODA</Title>
          <ThemeToggle onClick={toggleTheme}>
            {isDarkMode ? '☀️' : '🌙'}
          </ThemeToggle>

          <input 
            type="text" 
            value={projectPath} 
            onChange={(e) => setProjectPath(e.target.value)} 
            placeholder="Enter project path"
          />
          <Button onClick={setPath}>Set Project Path</Button>
          <Button onClick={refreshProject}>Refresh Project</Button>
          <Button onClick={updateSystemPrompt}>Update System Prompt</Button>
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
