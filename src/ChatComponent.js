import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { ScrollableDiv, Button } from './components/SharedStyles';
import { MAX_TEXTAREA_HEIGHT } from './constants';
import { useAPI } from './api';
import { useAppContext } from './contexts/AppContext';
import Message from './components/Message';
import SystemPrompt from './components/SystemPrompt';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  background-color: ${props => props.theme.backgroundColor};
  color: ${props => props.theme.textColor};
`;

const MessageHistory = styled(ScrollableDiv)`
  flex: 1;
  overflow-y: auto;
  padding: 0px;

  /* Additional Chrome-specific styles */
  &::-webkit-scrollbar-button {
    display: none !important;
  }

  &::-webkit-scrollbar-button:vertical:start,
  &::-webkit-scrollbar-button:vertical:end,
  &::-webkit-scrollbar-button:horizontal:start,
  &::-webkit-scrollbar-button:horizontal:end {
    display: none !important;
  }
`;

const InputContainer = styled.div`
  display: flex;
  padding: 0px;
  background-color: ${props => props.theme.backgroundColor};
  border-top: 1px solid ${props => props.theme.borderColor};
`;

const InputWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
  background-color: ${props => props.theme.backgroundColor};
  border: 1px solid ${props => props.theme.borderColor};
`;

const Prompt = styled.span`
  color: ${props => props.theme.textColor};
  padding: 5px;
  font-size: 14px;
`;

const TextArea = styled.textarea`
  flex-grow: 1;
  padding: 5px;
  border: none;
  resize: none;
  min-height: 24px;
  max-height: ${MAX_TEXTAREA_HEIGHT}px;
  overflow-y: auto;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.2;  
  background-color: transparent;
  color: white;

  &:focus {
    outline: none;
    box-shadow: inset 0 0 0 0px #0f0;
  }
`;

const SendButton = styled(Button)`
  background-color: transparent;
  color: ${props => props.theme.textColor};
  border: 1px solid ${props => props.theme.borderColor};
  font-size: 14px;
  padding: 5px 10px;

  &:hover {
    background-color: ${props => props.theme.hoverColor};
  }
`;

function ChatComponent({ theme, conversationId, messages, setMessages, refreshProject }) {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);
  const messageEndRef = useRef(null);
  const textAreaRef = useRef(null);
  const api = useAPI();
  const { addMessage } = useAppContext();

  useEffect(() => {
    if (messageEndRef.current && !isSystemPromptOpen) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSystemPromptOpen]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
    }
  }, [inputValue]);
  
  const handleSend = async () => {
    if (inputValue.trim()) {
      const userMessage = { role: 'user', message: inputValue, timestamp: new Date().toISOString() };
      setIsTyping(true);
      setInputValue('');
  
      addMessage(userMessage);
  
      try {
        const data = await api.processMessage({ message: inputValue, conversation_id: conversationId });
        const aiMessage = { role: 'ai', message: data.response, timestamp: new Date().toISOString() };
        addMessage(aiMessage);
      } catch (error) {
        console.error('Error:', error);
        const errorMessage = { role: 'ai', message: 'Sorry, I encountered an error.', timestamp: new Date().toISOString() };
        addMessage(errorMessage);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSystemPromptUpdate = (updatedMessage) => {
    setMessages(prevMessages => {
      const systemPromptIndex = prevMessages.findIndex(msg => msg.role === 'system');
      if (systemPromptIndex !== -1) {
        const updatedMessages = [...prevMessages];
        updatedMessages[systemPromptIndex] = { ...updatedMessages[systemPromptIndex], message: updatedMessage };
        return updatedMessages;
      }
      return prevMessages;
    });
  };

  const systemPrompt = messages.find(msg => msg.role === 'system');
  const otherMessages = messages.filter(msg => msg.role !== 'system');

  return (
    <ChatContainer theme={theme}>
      <MessageHistory theme={theme}>
        {systemPrompt && (
          <SystemPrompt
            message={systemPrompt.message}
            theme={theme}
            onUpdate={handleSystemPromptUpdate}
            isOpen={isSystemPromptOpen}
            setIsOpen={setIsSystemPromptOpen}
            refreshProject={refreshProject}
          />
        )}
        {otherMessages.map((message, index) => (
          <Message
            key={index}
            message={message.message}
            isUser={message.role === 'user'}
            timestamp={message.timestamp}
            theme={theme}
          />
        ))}
        {isTyping && <Message message="AI is typing..." isUser={false} theme={theme} />}
        <div ref={messageEndRef} />
      </MessageHistory>
      <InputContainer theme={theme}>
        <InputWrapper theme={theme}>
          <Prompt theme={theme}>$</Prompt>
          <TextArea 
            ref={textAreaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter command..."
            rows={1}
            theme={theme}
          />
        </InputWrapper>
        <SendButton onClick={handleSend} theme={theme}>Send</SendButton>
      </InputContainer>
    </ChatContainer>
  );
}

export default ChatComponent;
