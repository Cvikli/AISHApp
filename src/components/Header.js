import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from './SharedStyles';
import FolderStructureModal from './FolderStructureModal';
import { useAppContext } from '../contexts/AppContext';
import { useParams } from 'react-router-dom';

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

const ProjectPathContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
  background-color: ${props => props.theme.inputBackground};
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
`;

const ProjectPathText = styled.span`
  color: ${props => props.theme.textColor};
  font-size: 14px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 5px;
`;

const FolderButton = styled(Button)`
  padding: 2px 5px;
  font-size: 16px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
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

  return (
    <HeaderContainer theme={theme}>
      <CollapseButton onClick={toggleSidebar} theme={theme}>
        {isCollapsed ? '▶' : '◀'}
      </CollapseButton>
      <Title theme={theme}>
        ORION
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
