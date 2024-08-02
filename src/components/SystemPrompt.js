import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const SystemPromptContainer = styled.div`
  background-color: ${props => props.theme.systemPromptBackground || '#f0f0f0'};
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  margin: 10px;
  padding: 10px;
  color: ${props => props.theme.systemPromptText || '#333'};
  font-family: 'Courier New', monospace;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: ${props => props.theme.systemPromptText || '#333'};
  margin-bottom: 5px;
`;

const SystemPromptContent = styled.textarea`
  width: 100%;
  min-height: 100px;
  resize: vertical;
  background-color: transparent;
  border: none;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  outline: none;
  padding: 0;
  margin: 0;
`;

function SystemPrompt({ message, theme, onUpdate, isOpen, setIsOpen }) {
  const [editableMessage, setEditableMessage] = useState(message);
  const textareaRef = useRef(null);

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
    if (onUpdate) {
      onUpdate(e.target.value);
    }
  };

  return (
    <SystemPromptContainer theme={theme}>
      <ToggleButton onClick={handleToggle} theme={theme}>
        System Prompt {isOpen ? '▲' : '▼'}
      </ToggleButton>
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
