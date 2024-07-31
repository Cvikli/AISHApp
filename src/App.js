import React, { useState } from 'react';
import styled from 'styled-components';
import ChatComponent from './ChatComponent';

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
  overflow: hidden;
  width: ${props => props.isCollapsed ? '36px' : '250px'};
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


function App() {
  const [conversations, setConversations] = useState([
    "💬 Conversation 1",
    "💬 Conversation 2",
    "💬 Conversation 3",
  ]);
  const [isCollapsed, setIsCollapsed] = useState(false);  
  const [isDarkMode, setIsDarkMode] = useState(true);


  const addNewConversation = () => {
    setConversations([`Conversation ${conversations.length + 1}`, ...conversations]);
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
          <NewConversationButton onClick={addNewConversation}>
          {isCollapsed ? '+' : '➕ New Conversation'}</NewConversationButton>
        </SidebarHeader>
         {!isCollapsed && (
          <ConversationList>
            {conversations.map((conv, index) => (
              <ConversationItem key={index}>{conv}</ConversationItem>
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

        </Header>
        <ChatComponent  isDarkMode={isDarkMode} />
      </MainContent>
    </AppContainer>
  );
}

export default App;