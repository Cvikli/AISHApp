import React from 'react';
import styled from 'styled-components';
import { Button } from './SharedStyles';

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  height: 36px;  
  border-bottom: 1px solid ${props => props.theme.borderColor};
  background-color: ${props => props.theme.background};
`;

const CollapseButton = styled.button`
  background: none;
  width: 36px;
  height: 36px;
  border: none;
  font-size: 18px;
  cursor: pointer;
  margin: 0px 4px;
  color: ${props => props.theme.text};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-family: 'Press Start 2P', cursive;
  font-size: 22px;
  margin: 0 14px;
  padding-top: 5px;
  line-height: 36px;
  color: ${props => props.theme.text};
  display: flex;
  align-items: center;
`;

const ConversationId = styled.span`
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  margin-left: 22px;
  color: ${props => props.theme.text};
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
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FolderIcon = styled.span`
  margin-right: 5px;
`;

const RefreshButton = styled(Button)`
  font-size: 18px;
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 5px 10px;
  color: ${props => props.theme.text};
`;

function Header({ 
  theme,
  toggleSidebar, 
  toggleTheme, 
  handleFolderSelect, 
  refreshProject, 
  updateSystemPrompt, 
  projectPath,
  isCollapsed,
  selectedConversationId
}) {
  const selectFolder = async () => {
    try {
      // Check if the browser supports the File System Access API
      if ('showDirectoryPicker' in window) {
        const directoryHandle = await window.showDirectoryPicker();
        console.log('Directory Handle:', directoryHandle);
        
        // Get the name of the directory
        const name = directoryHandle.name;
        console.log('Directory Name:', name);
        
        // List files in the directory
        for await (const entry of directoryHandle.values()) {
          console.log(entry.kind, entry.name);
        }

        // Construct a relative path-like string
        let pathParts = [];
        let currentHandle = directoryHandle;
        while (currentHandle !== null) {
          pathParts.unshift(currentHandle.name);
          currentHandle = await currentHandle.getParent();
        }
        console.log('Directory pathParts:', pathParts);
        const relativePath = pathParts.join('/');
        console.log('Relative Path:', relativePath);
        // handleFolderSelect(path);
      } else {
        // Fallback for browsers that don't support showDirectoryPicker
        alert("Your browser doesn't support folder selection. Please use a modern browser like Chrome or Edge.");
      }
    } catch (err) {
      console.error("Error selecting folder:", err);
    }
  };

  return (
    <HeaderContainer theme={theme}>
      <CollapseButton onClick={toggleSidebar} theme={theme}>
        {isCollapsed ? '▶' : '◀'}
      </CollapseButton>
      <Title theme={theme}>
        KODA
        <ConversationId theme={theme}>
          {selectedConversationId ? `#${selectedConversationId}` : ''}
        </ConversationId>
      </Title>
      <ButtonGroup>
        <FolderSelectButton onClick={selectFolder}>
          <FolderIcon>📁</FolderIcon>
          {projectPath ? projectPath : "Select Project"}
        </FolderSelectButton>
        <RefreshButton onClick={refreshProject}>🔄</RefreshButton>
        <Button onClick={updateSystemPrompt}>Update System Prompt</Button>
        <ThemeToggle onClick={toggleTheme} theme={theme}>
          {theme.name === 'dark' ? '☀️' : '🌙'}
        </ThemeToggle>
      </ButtonGroup>
    </HeaderContainer>
  );
}

export default Header;
