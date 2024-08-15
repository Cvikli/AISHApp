import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from './SharedStyles';
import { useAppContext } from '../contexts/AppContext';

const SystemPromptContainer = styled.div`
  background-color: ${props => props.theme.name === 'dark' ? '#2a2a2a' : '#f0f0f0'};
  border: 1px solid ${props => props.theme.name === 'dark' ? '#444' : props.theme.borderColor};
  border-radius: 4px;
  margin: 10px;
  padding: 10px;
  color: ${props => props.theme.name === 'dark' ? '#e0e0e0' : '#333'};
  font-family: 'Courier New', monospace;
`;

const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: ${props => props.theme.name === 'dark' ? '#0084ff' : '#0066cc'};
  margin-bottom: 5px;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${props => props.theme.name === 'dark' ? '#3a3a3a' : '#e0e0e0'};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const SystemPromptContent = styled.textarea`
  width: 100%;
  min-height: 100px;
  resize: vertical;
  background-color: ${props => props.theme.name === 'dark' ? '#1e1e1e' : '#ffffff'};
  border: 1px solid ${props => props.theme.name === 'dark' ? '#444' : '#ccc'};
  border-radius: 4px;
  color: ${props => props.theme.name === 'dark' ? '#e0e0e0' : '#333'};
  font-family: inherit;
  font-size: 14px;
  line-height: 1.4;
  padding: 8px;
  margin-top: 5px;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: ${props => props.theme.name === 'dark' ? '#0084ff' : '#0066cc'};
  }
`;

const RefreshButton = styled(Button)`
  font-size: 18px;
`;

function SystemPrompt({ message, theme, onUpdate, isOpen, setIsOpen, refreshProject }) {
  const [editableMessage, setEditableMessage] = useState(message);
  const [isEdited, setIsEdited] = useState(false);
  const textareaRef = useRef(null);
  const { api, setSystemPrompt } = useAppContext();

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isOpen, editableMessage]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => textareaRef.current.focus(), 0);
    }
  };

  const handleChange = (e) => {
    setEditableMessage(e.target.value);
    setIsEdited(e.target.value !== message);
  };

  const handleUpdateSystemPrompt = async () => {
    try {
      await api.updateSystemPrompt({ system_prompt: editableMessage });
      setSystemPrompt(editableMessage);
      if (onUpdate) {
        onUpdate(editableMessage);
      }
      setIsEdited(false);
    } catch (error) {
      console.error('Error updating system prompt:', error);
    }
  };

  return (
    <SystemPromptContainer theme={theme}>
      <TopSection>
        <ToggleButton onClick={handleToggle} theme={theme}>
          System Prompt {isOpen ? '▲' : '▼'}
        </ToggleButton>
        {isOpen && (
          <ButtonContainer>
            {isEdited && <Button onClick={handleUpdateSystemPrompt}>Update System Prompt</Button>}
            <RefreshButton onClick={refreshProject}>🔄 Refresh</RefreshButton>
          </ButtonContainer>
        )}
      </TopSection>
      {isOpen && (
        <SystemPromptContent
          ref={textareaRef}
          value={editableMessage}
          onChange={handleChange}
          theme={theme}
        />
      )}
    </SystemPromptContainer>
  );
}

export default SystemPrompt;
