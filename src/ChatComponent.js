import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const ChatContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
`;

const MessageHistory = styled.div`
  flex-grow: 1;
  padding: 5px;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  border-radius: 0px;
  overflow-y: auto;
`;

const Message = styled.div`
  margin-bottom: 5px;
`;

const UserMessage = styled(Message)`
  color: #0084ff;
`;

const AIMessage = styled(Message)`
  color: #000000;
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


function ChatComponent({ isDarkMode }) {
  const [messages, setMessages] = useState([]);
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
      setMessages(prevMessages => [...prevMessages, { type: 'user', content: inputValue }]);
      setInputValue('');
      setIsTyping(true);

      try {
        console.log('Sending request to backend...');
        const response = await axios.post('http://localhost:8000', { message: inputValue }, {
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('Received response:', response.data);
        setMessages(prevMessages => [...prevMessages, { type: 'ai', content: response.data.response }]);
      } catch (error) {
        console.error('Error:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Error setting up request:', error.message);
        }
        setMessages(prevMessages => [...prevMessages, { type: 'ai', content: 'Sorry, I encountered an error.' }]);
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
          message.type === 'user' ? 
            <UserMessage key={index}>➜ {message.content}</UserMessage> :
            <AIMessage key={index}>{message.content}</AIMessage>
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