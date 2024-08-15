import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from './SharedStyles';
import FolderStructureModal from './FolderStructureModal';
import { useAppContext } from '../contexts/AppContext';

export const HEADER_HEIGHT = 36;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  height: ${HEADER_HEIGHT}px;
  border-bottom: 1px solid ${props => props.theme.borderColor};
  background-color: ${props => props.theme.backgroundColor};
`;

const CollapseButton = styled.button`
  background: none;
  width: ${HEADER_HEIGHT}px;
  height: ${HEADER_HEIGHT}px;
  border: none;
  font-size: 18px;
  cursor: pointer;
  margin: 0px 4px;
  color: ${props => props.theme.textColor};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-family: 'Press Start 2P', cursive;
  font-size: 22px;
  margin: 0 14px;
  padding-top: 5px;
  line-height: ${HEADER_HEIGHT}px;
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

const ThemeToggle = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 5px 10px;
  color: ${props => props.theme.textColor};
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
  color: ${props => props.theme.textColor};
`;

const FolderButton = styled(Button)`
  padding: 5px 10px;
  margin-right: 10px;
`;

function Header() {
  const {
    theme,
    isDarkMode,
    setIsDarkMode,
    isCollapsed,
    setIsCollapsed,
    projectPath,
    updateProjectPath,
    selectedConversationId
  } = useAppContext();

  const [inputPath, setInputPath] = useState(projectPath);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handlePathChange = (e) => {
    setInputPath(e.target.value);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSetProjectPath = async (newPath) => {
    await updateProjectPath(newPath);
    setInputPath(newPath);
  };

  return (
    <HeaderContainer theme={theme}>
      <CollapseButton onClick={toggleSidebar} theme={theme}>
        {isCollapsed ? '▶' : '◀'}
      </CollapseButton>
      <Title theme={theme}>
        ORION
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
        <ThemeToggle onClick={toggleTheme} theme={theme}>
          {isDarkMode ? '☀️' : '🌙'}
        </ThemeToggle>
      </ButtonGroup>
      <FolderStructureModal
        isOpen={isModalOpen}
        onClose={closeModal}
        theme={theme}
        projectPath={projectPath}
        setProjectPath={handleSetProjectPath}
      />
    </HeaderContainer>
  );
}

export default Header;
