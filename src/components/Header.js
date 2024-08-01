import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.div`
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

function Header({ 
  isDarkMode, 
  toggleSidebar, 
  toggleTheme, 
  handleFolderSelect, 
  refreshProject, 
  updateSystemPrompt, 
  projectPath 
}) {
  return (
    <HeaderContainer>
      <CollapseButton onClick={toggleSidebar} isDarkMode={isDarkMode}>
        {toggleSidebar ? '▶' : '◀'}
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
    </HeaderContainer>
  );
}

export default Header;
