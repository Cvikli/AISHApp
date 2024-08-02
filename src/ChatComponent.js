import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import * as API from './API';
import { ScrollbarStyle, Button } from './components/SharedStyles';
import { MAX_TEXTAREA_HEIGHT } from './constants';
import Message from './components/Message';
import SystemPrompt from './components/SystemPrompt';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const MessageHistory = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0px;
  background-color: ${props => props.theme.chatBackground};
  ${ScrollbarStyle}
`;

const InputContainer = styled.div`
  display: flex;
  padding: 0px;
  background-color: ${props => props.theme.background};
`;

const TextArea = styled.textarea`
  flex-grow: 1;
  padding: 10px;
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 0px;
  resize: none;
  min-height: 40px;
  max-height: ${MAX_TEXTAREA_HEIGHT}px;
  overflow-y: auto;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.2;  
  border-right: 1px solid ${props => props.theme.borderColor};
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.text};
  ${ScrollbarStyle}
`;

const SendButton = styled(Button)`
  height: auto;
`;

function ChatComponent({ theme, conversationId, messages, setMessages }) {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);
  const messageEndRef = useRef(null);
  const textAreaRef = useRef(null);

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
      const newUserMessage = { role: 'user', message: inputValue, timestamp: new Date().toISOString() };
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      setInputValue('');
      setIsTyping(true);
  
      try {
        const data = await API.processMessage(inputValue, conversationId);
        const newAIMessage = { role: 'ai', message: data.response, timestamp: new Date().toISOString() };
        setMessages(prevMessages => [...prevMessages, newAIMessage]);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prevMessages => [...prevMessages, { role: 'ai', message: 'Sorry, I encountered an error.', timestamp: new Date().toISOString() }]);
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
    <ChatContainer>
      <MessageHistory theme={theme}>
        {systemPrompt && (
          <SystemPrompt
            message={systemPrompt.message}
            theme={theme}
            onUpdate={handleSystemPromptUpdate}
            isOpen={isSystemPromptOpen}
            setIsOpen={setIsSystemPromptOpen}
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
        <TextArea 
          ref={textAreaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message here... (Press Shift+Enter for new line)"
          rows={1}
          theme={theme}
        />
        <SendButton onClick={handleSend}>Send</SendButton>
      </InputContainer>
    </ChatContainer>
  );
}

export default ChatComponent;
