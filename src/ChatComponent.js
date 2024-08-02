import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import * as API from './API';
import { ScrollbarStyle, Button } from './components/SharedStyles';
import { MAX_TEXTAREA_HEIGHT } from './constants';
import Message from './components/Message';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-grow: 1;
  padding: 0;
  background-color: ${props => props.theme.chatBackground};
  color: ${props => props.theme.text};
`;

const MessageHistory = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  height: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  background-color: ${props => props.theme.chatBackground};
  ${ScrollbarStyle}
`;

const InputContainer = styled.div`
  display: flex;
  padding: 0px;
  align-items: flex-end;
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
  const messageEndRef = useRef(null);
  const textAreaRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
    }
  }, [inputValue]);
  
  const handleSend = async () => {
    if (inputValue.trim()) {
      const newUserMessage = { role: 'user', message: inputValue };
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      setInputValue('');
      setIsTyping(true);
  
      try {
        const data = await API.processMessage(inputValue, conversationId);
        const newAIMessage = { role: 'ai', message: data.response };
        setMessages(prevMessages => [...prevMessages, newAIMessage]);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prevMessages => [...prevMessages, { role: 'ai', message: 'Sorry, I encountered an error.' }]);
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

  return (
    <ChatContainer theme={theme}>
      <MessageHistory theme={theme}>
        {messages.map((message, index) => (
          <Message 
            key={index} 
            message={message.message} 
            isUser={message.role === 'user'} 
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
