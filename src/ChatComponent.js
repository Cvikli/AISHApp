import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  height: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
`;

const MessageHistory = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  height: 0;
  flex-grow: 1;
  padding: 10px;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  border-radius: 0px;
  overflow-y: auto;
`;

const Message = styled.div`
  margin-bottom: 8px;
`;

const UserMessage = styled(Message)`
  color: ${props => props.isDarkMode ? '#66b2ff' : '#0084ff'};
  white-space: pre-wrap;
`;

const AIMessage = styled(Message)`
  color: ${props => props.isDarkMode ? '#ffffff' : '#fff'};
  white-space: pre-wrap;
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
        setMessages(prevMessages => [...prevMessages, { type: 'ai', message: 'Sorry, I encountered an error.' }]);
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
    <ChatContainer>
      <MessageHistory>
        {messages.map((message, index) => (
          message.role === 'user' ? 
            <UserMessage key={index} isDarkMode={isDarkMode}>➜ {message.message}</UserMessage> :
            <AIMessage key={index} isDarkMode={isDarkMode}>{message.message}</AIMessage>
        ))}
        {isTyping && <AIMessage>AI is typing...</AIMessage>}
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
