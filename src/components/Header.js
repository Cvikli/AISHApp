import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from './SharedStyles';
import FolderStructureModal from './FolderStructureModal';

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

const PathInputContainer = styled.div`
  display: flex;
  align-items: center;
`;

const PathInput = styled.input`
  width: 200px;
  padding: 5px;
  margin-right: 10px;
  border: 1px solid ${props => props.theme.borderColor};
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.text};
`;

const FolderButton = styled(Button)`
  padding: 5px 10px;
  margin-right: 10px;
`;

function Header({ 
  theme,
  toggleSidebar, 
  toggleTheme, 
  refreshProject, 
  updateSystemPrompt, 
  projectPath,
  setProjectPath,
  isCollapsed,
  selectedConversationId
}) {
  const [inputPath, setInputPath] = useState(projectPath);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePathChange = (e) => {
    setInputPath(e.target.value);
  };

  const handleRefresh = async () => {
    try {
      await setProjectPath(inputPath);
      await refreshProject();
    } catch (error) {
      console.error("Error refreshing project:", error);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <HeaderContainer theme={theme}>
      <CollapseButton onClick={toggleSidebar} theme={theme}>
        {isCollapsed ? '▶' : '◀'}
      </CollapseButton>
      <Title theme={theme}>
        KODA
        <ConversationId theme={theme}>
          {selectedConversationId ? `${selectedConversationId}` : ''}
        </ConversationId>
      </Title>
      <ButtonGroup>
        <PathInputContainer>
          <PathInput 
            value={inputPath}
            onChange={handlePathChange}
            placeholder="Enter project path"
            theme={theme}
          />
          <FolderButton onClick={openModal}>📁</FolderButton>
        </PathInputContainer>
        <RefreshButton onClick={handleRefresh}>🔄</RefreshButton>
        <Button onClick={updateSystemPrompt}>Update System Prompt</Button>
        <ThemeToggle onClick={toggleTheme} theme={theme}>
          {theme.name === 'dark' ? '☀️' : '🌙'}
        </ThemeToggle>
      </ButtonGroup>
      <FolderStructureModal
        isOpen={isModalOpen}
        onClose={closeModal}
        theme={theme}
        projectPath={projectPath}
        setProjectPath={setProjectPath}
      />
    </HeaderContainer>
  );
}

export default Header;
