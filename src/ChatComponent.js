import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const ScrollbarStyle = `
  scrollbar-width: thin;
  scrollbar-color: #6b6b6b #3a3a3a;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #3a3a3a;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #6b6b6b;
    border-radius: 4px;
    &:hover {
      background-color: #7b7b7b;
    }
  }
`;


const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-grow: 1;
  padding: 0;
  background-color: ${props => props.isDarkMode ? '#1e1e1e' : '#f1f1f1'};
  color: ${props => props.isDarkMode ? '#e0e0e0' : '#333'};
`;

const MessageHistory = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  height: 0;
  padding: 10px;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  ${ScrollbarStyle}
`;

const Message = styled.div`
  margin-bottom: 8px;
  padding: 10px;
  border-radius: 4px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

const UserMessage = styled(Message)`
  background-color: ${props => props.isDarkMode ? '#2a2a2a' : '#e0e0e0'};
  border-left: 4px solid #0084ff;
`;

const AIMessage = styled(Message)`
  background-color: ${props => props.isDarkMode ? '#333' : '#f0f0f0'};
`;

const StyledMarkdown = styled(ReactMarkdown)`
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  & > * {
    margin-bottom: 0.5em;
  }

  code {
    background-color: ${props => props.isDarkMode ? '#444' : '#e0e0e0'};
    padding: 2px 4px;
    border-radius: 4px;
    font-family: 'Courier New', Courier, monospace;
    white-space: pre-wrap;
    word-break: break-all;
  }

  pre {
    background-color: ${props => props.isDarkMode ? '#444' : '#e0e0e0'};
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }

  img {
    max-width: 100%;
    height: auto;
  }
`;

const InputContainer = styled.div`
  display: flex;
  padding: 0px;
  align-items: flex-end;
`;

const TextArea = styled.textarea`
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 0px;
  resize: none;
  min-height: 40px;
  max-height: 150px;
  overflow-y: auto;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.2;  
  border-right: 1px solid var(--border-color);
  background-color: ${props => props.isDarkMode ? '#333' : '#fff'};
  color: ${props => props.isDarkMode ? '#fff' : '#333'};
  ${ScrollbarStyle}
`;

const SendButton = styled.button`
  padding: 10px 10px;
  background-color: #0084ff;
  color: white;
  border: none;
  border-radius: 0px;
  cursor: pointer;
  height: auto;
  font-size: 14px;
`;

function ChatComponent({ isDarkMode, conversationId, messages, setMessages }) {
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
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 150)}px`;
    }
  }, [inputValue]);

  const handleSend = async () => {
    if (inputValue.trim()) {
      const newUserMessage = { role: 'user', message: inputValue };
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      setInputValue('');
      setIsTyping(true);

      try {
        const response = await axios.post('http://localhost:8001/api/process_message', 
          { message: inputValue, conversation_id: conversationId },
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        if (response.data.status === 'success') {
          const newAIMessage = { role: 'ai', message: response.data.response };
          setMessages(prevMessages => [...prevMessages, newAIMessage]);
        } else {
          throw new Error(response.data.message || 'Unknown error occurred');
        }
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
    <ChatContainer isDarkMode={isDarkMode}>
      <MessageHistory isDarkMode={isDarkMode}>
        {messages.map((message, index) => (
          message.role === 'user' ? 
            <UserMessage key={index} isDarkMode={isDarkMode}>➜ {message.message}</UserMessage> :
            <AIMessage key={index} isDarkMode={isDarkMode}>
              <StyledMarkdown isDarkMode={isDarkMode}>{message.message}</StyledMarkdown>
            </AIMessage>
        ))}
        {isTyping && <AIMessage isDarkMode={isDarkMode}>AI is typing...</AIMessage>}
        <div ref={messageEndRef} />
      </MessageHistory>

      <InputContainer>
        <TextArea 
          ref={textAreaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message here... (Press Shift+Enter for new line)"
          rows={1}          
          isDarkMode={isDarkMode}
        />
        <SendButton onClick={handleSend}>Send</SendButton>
      </InputContainer>
    </ChatContainer>
  );
}

export default ChatComponent;
