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
  margin: 0;
  line-height: 36px;
  color: ${props => props.theme.text};
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 5px 10px;
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
`;

const RefreshButton = styled(Button)`
  font-size: 18px;
`;

function Header({ 
  theme,
  toggleSidebar, 
  toggleTheme, 
  handleFolderSelect, 
  refreshProject, 
  updateSystemPrompt, 
  projectPath,
  isCollapsed
}) {
  return (
    <HeaderContainer theme={theme}>
      <CollapseButton onClick={toggleSidebar} theme={theme}>
        {isCollapsed ? '▶' : '◀'}
      </CollapseButton>
      <Title theme={theme}>KODA</Title>
      <ButtonGroup>
        <FolderSelectButton onClick={handleFolderSelect}>
          {projectPath || "Select Project Path"}
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
