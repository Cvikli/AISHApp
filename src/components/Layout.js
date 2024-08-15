import React from 'react';
import styled from 'styled-components';
import { useAppContext } from '../contexts/AppContext';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatComponent from '../ChatComponent';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const HeaderWrapper = styled.div`
  flex: 0 0 auto;
`;

const ChatWrapper = styled.div`
  flex: 1;
  overflow: hidden;
`;

const Layout = () => {
  const {
    theme,
    setIsDarkMode,
    isCollapsed,
    selectedConversationId,
    messages,
    setMessages,
    setIsCollapsed,
    projectPath,
    setProjectPath,
    api,
  } = useAppContext();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <AppContainer>
      <Sidebar theme={theme} isCollapsed={isCollapsed} />
      <MainContent>
        <HeaderWrapper>
          <Header 
            theme={theme}
            toggleSidebar={toggleSidebar}
            toggleTheme={toggleTheme}
            projectPath={projectPath}
            setProjectPath={setProjectPath}
            isCollapsed={isCollapsed}
            selectedConversationId={selectedConversationId}
          />
        </HeaderWrapper>
        <ChatWrapper>
          <ChatComponent 
            theme={theme}
            conversationId={selectedConversationId}          
            messages={messages}
            setMessages={setMessages}
            refreshProject={api.refreshProject}
          />
        </ChatWrapper>
      </MainContent>
    </AppContainer>
  );
};

export default Layout;
