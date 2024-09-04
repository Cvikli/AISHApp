import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from './SharedStyles';
import FolderStructureModal from './FolderStructureModal';
import { useAppContext } from '../contexts/AppContext';
import { useParams } from 'react-router-dom';

export const HEADER_HEIGHT = 48; // Increased header height

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
  font-size: 24px; // Increased font size
  cursor: pointer;
  margin: 0px 4px;
  color: ${props => props.theme.textColor};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-family: 'Press Start 2P', cursive;
  font-size: 28px;
  margin: 0 14px;
  padding-top: 5px;
  line-height: ${HEADER_HEIGHT}px;
  display: flex;
  align-items: center;
`;

const ConversationId = styled.span`
  font-family: 'Arial', sans-serif;
  font-size: 18px;
  margin-left: 22px;
`;

const ModelName = styled.span`
  font-family: 'Arial', sans-serif;
  margin-left: 10px;
  font-size: 18px;
  opacity: 0.7;
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
  font-size: 28px;
  cursor: pointer;
  padding: 5px 10px;
`;

const AutoExecuteToggle = styled.button`
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProjectPathContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
  background-color: ${props => props.theme.inputBackground};
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  flex-grow: 1;
  max-width: 600px;
`;

const ProjectPathText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 5px;
  flex-grow: 1;
`;

const FolderButton = styled(Button)`
  padding: 2px 5px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  flex-shrink: 0;
`;

const LanguageSelect = styled.select`
  background-color: #1270ff;
  color: white;
  border: 1px solid ${props => props.theme.borderColor};
  padding: 5px;
  cursor: pointer;
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
    isNoAutoExecute,
    toggleAutoExecute,
    model,
    language,
    setLanguage,
  } = useAppContext();
  const { conversationId } = useParams();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSetProjectPath = async (newPath) => {
    await updateProjectPath(conversationId, newPath);
    closeModal();
  };

  const handleToggleAutoExecute = () => {
    toggleAutoExecute();
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <HeaderContainer theme={theme}>
      <CollapseButton onClick={toggleSidebar} theme={theme}>
        {isCollapsed ? '▶' : '◀'}
      </CollapseButton>
      <Title theme={theme}>
        ORION
        <ModelName>{model}</ModelName>
        <ConversationId theme={theme}>
          {conversationId ? `${conversationId}` : ''}
        </ConversationId>
      </Title>
      <ButtonGroup>
        <ProjectPathContainer theme={theme}>
          <FolderButton onClick={openModal} theme={theme}>📁</FolderButton>
          <ProjectPathText theme={theme} title={projectPath}>
            {projectPath || 'No project selected'}
          </ProjectPathText>
        </ProjectPathContainer>
        <LanguageSelect value={language} onChange={handleLanguageChange} theme={theme}>
          <option value="en">English</option>
          <option value="hu">Hungarian</option>
        </LanguageSelect>
        <AutoExecuteToggle onClick={handleToggleAutoExecute} theme={theme} title={isNoAutoExecute ? "Pause auto-execute" : "Start auto-execute"}>
          {isNoAutoExecute ? '⏸️' : '▶️'}
        </AutoExecuteToggle>
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
