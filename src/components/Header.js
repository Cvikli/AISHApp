import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from './SharedStyles';
import FolderStructureModal from './FolderStructureModal';
import { useAppContext } from '../contexts/AppContext';
import { useParams } from 'react-router-dom';
import VoiceActivationButton from './VoiceActivationButton';

import MoonIcon from '../assets/MoonIcon';
import SunIcon from '../assets/SunIcon';
import AutoExecuteIcon from '../assets/AutoExecuteIcon';
import PauseIcon from '../assets/PauseIcon';


export const HEADER_HEIGHT = 48;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  height: ${HEADER_HEIGHT}px;
  border-bottom: 1px solid ${props => props.theme.borderColor};
  background-color: ${props => props.theme.backgroundColor};
  padding: 0 0px;
`;

const CollapseButton = styled.button`
  background: none;
  width: ${HEADER_HEIGHT}px;
  height: ${HEADER_HEIGHT}px;
  border: none;
  border-right: 1px solid ${props => props.theme.borderColor};
  font-size: 24px;
  cursor: pointer;
  color: ${props => props.theme.textColor};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;

  &:hover {
    background-color: ${props => props.theme.hoverColor};
  }
`;

const Title = styled.h1`
  font-family: 'Press Start 2P', cursive;
  font-size: 28px;
  margin: 0 14px;
  padding-top: 5px;
  line-height: ${HEADER_HEIGHT}px;
  display: flex;
  align-items: center;
  font-weight: 400;
`;

const ConversationId = styled.span`
  font-family: 'Arial', sans-serif;
  font-size: 18px;
  margin-left: 22px;
  opacity: 0.7;
  font-weight: 400;
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
  cursor: pointer;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProjectPathContainer = styled.div`
  display: flex;
  align-items: stretch; // Changed from center to stretch
  margin-right: 10px;
  background-color: ${props => props.theme.inputBackground};
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  flex-grow: 1;
  max-width: 600px;
  height: ${HEADER_HEIGHT - 8}px;
`;

const ProjectPathText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 5px;
  flex-grow: 1;
  display: flex;
  align-items: center; // Center text vertically
`;

const FolderButton = styled(Button)`
  padding: 0 10px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  flex-shrink: 0;
  justify-content: center;
  font-size: 20px;
  height: 100%; // Make it full height of the container
`;

const LanguageSelect = styled.select`
  background-color: #1270ff;
  color: white;
  border: 1px solid ${props => props.theme.borderColor};
  cursor: pointer;
  padding: 8px;
  height: ${HEADER_HEIGHT - 8}px;
`;

const NewConversationButton = styled(Button)`
  width: ${props => props.$isCollapsed ? HEADER_HEIGHT : 300}px;
  height: ${HEADER_HEIGHT}px;
  min-height: ${HEADER_HEIGHT}px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: ${props => props.$isCollapsed ? 'center' : 'flex-start'};
  padding: ${props => props.$isCollapsed ? '0' : '0 10px'};
  border: none;
  border-right: 1px solid ${props => props.theme.borderColor};
  border-bottom: 1px solid ${props => props.theme.borderColor};
  background-color: ${props => props.theme.backgroundColor};
  cursor: pointer;
  color: ${props => props.theme.textColor};
  transition: background-color 0.2s ease;
  font-family: 'Courier New', monospace;  // Added this line

  &:hover {
    background-color: ${props => props.theme.hoverColor};
  }

  &:focus {
    outline: none;
    box-shadow: inset 0 0 0 1px ${props => props.theme.textColor};
  }
`;

const VoiceActivationWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;
  padding: 0 10px;
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
    handleLanguage,
    newConversation,
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
    handleLanguage(e.target.value);
  };

  return (
    <HeaderContainer theme={theme}>
      <NewConversationButton onClick={newConversation} theme={theme} $isCollapsed={isCollapsed}>
        {isCollapsed ? '+' : '+ New Conversation'}
      </NewConversationButton>
      <CollapseButton onClick={toggleSidebar} theme={theme}>
        {isCollapsed ? '▶' : '◀'}
      </CollapseButton>
      <Title theme={theme}>
        ORION
        <VoiceActivationWrapper>
          <VoiceActivationButton />
        </VoiceActivationWrapper>
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
          <option value="de">German</option>
          <option value="fr">French</option>
          <option value="es">Spanish</option>
          <option value="it">Italian</option>
          <option value="ja">Japanese</option>
          <option value="ko">Korean</option>
          <option value="zh">Chinese</option>
        </LanguageSelect>
        <AutoExecuteToggle onClick={handleToggleAutoExecute} theme={theme} title={isNoAutoExecute ? "Pause auto-execute" : "Start auto-execute"}>
        {isNoAutoExecute ? <AutoExecuteIcon color={theme.textColor} /> : <PauseIcon color={theme.textColor} />}
        </AutoExecuteToggle>
        <ThemeToggle onClick={toggleTheme} theme={theme}>
          {isDarkMode ? <SunIcon color={theme.textColor} /> : <MoonIcon color={theme.textColor} />}
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
