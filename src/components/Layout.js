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
    isCollapsed,
    selectedConversationId,
    projectPath,
    messages,
    setMessages,
    setIsCollapsed,
    setIsDarkMode,
    setProjectPath,
    api,
  } = useAppContext();

  const sidebarWidth = isCollapsed ? 36 : 250;

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const handleFolderSelect = async () => {
    try {
      const result = await window.electron.openFolder();
      if (!result.canceled && result.filePaths.length > 0) {
        const path = result.filePaths[0];
        setProjectPath(path);
        await api.setPath(path);
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  return (
    <AppContainer>
      <Sidebar theme={theme} isCollapsed={isCollapsed} />
      <MainContent>
        <HeaderWrapper>
          <Header 
            theme={theme}
            toggleSidebar={toggleSidebar}
            toggleTheme={toggleTheme}
            handleFolderSelect={handleFolderSelect}
            refreshProject={api.refreshProject}
            updateSystemPrompt={api.updateSystemPrompt}
            projectPath={projectPath}
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
          />
        </ChatWrapper>
      </MainContent>
    </AppContainer>
  );
};

export default Layout;
