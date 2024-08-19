import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { ScrollableDiv, Button } from './SharedStyles';
import { MAX_TEXTAREA_HEIGHT } from '../constants';
import { useAppContext } from '../contexts/AppContext';
import Message from './Message';
import SystemPrompt from './SystemPrompt';
import { streamProcessMessage } from '../APIstream';

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
`;

const InputContainer = styled.div`
  display: flex;
  padding: 0px;
  background-color: ${props => props.theme.backgroundColor};
  border-left: 10px solid ${props => props.theme.textColor};
  border-top: 1px solid ${props => props.theme.textColor};
`;

const InputWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: flex-start;
  background-color: ${props => props.theme.backgroundColor};
`;

const Prompt = styled.span`
  color: ${props => props.theme.textColor};
  padding: 5px 2px;
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

function ChatComponent() {
  const {
    theme,
    conversations,
    addMessage,
    updateMessage
  } = useAppContext();

  const { conversationId } = useParams();

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const messageEndRef = useRef(null);
  const textAreaRef = useRef(null);

  useEffect(() => {
  }, [conversationId]);

  const currentConversation = conversations[conversationId] || { messages: [], systemPrompt: '' };
  const { messages, systemPrompt } = currentConversation;

  useEffect(() => {
    if (messageEndRef.current && !isSystemPromptOpen) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSystemPromptOpen, streamedContent]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
    }
  }, [inputValue]);
  
  const handleSend = async () => {
    if (inputValue.trim()) {
      const timestamp = new Date().toISOString();
      const userMessage = { role: 'user', content: inputValue, timestamp };
      setIsTyping(true);
      setInputValue('');
      setStreamedContent('');
  
      addMessage(conversationId, userMessage);
  
      try {
        await streamProcessMessage(
          inputValue,
          (content) => setStreamedContent(prev => prev + content),
          (finalContent, streamedInMeta, streamedOutMeta) => {
            updateMessage(conversationId, timestamp, { 
              id: streamedInMeta.id,
              input_tokens: streamedInMeta.input_tokens,
              output_tokens: streamedInMeta.output_tokens,
              price: streamedInMeta.price,
              elapsed: streamedInMeta.elapsed,});
            addMessage(conversationId, { 
              role: 'assistant', 
              content: finalContent, 
              timestamp: new Date().toISOString(),
              id: streamedOutMeta.id,
              input_tokens: streamedOutMeta.input_tokens,
              output_tokens: streamedOutMeta.output_tokens,
              price: streamedOutMeta.price,
              elapsed: streamedOutMeta.elapsed,
            });
            setStreamedContent('');
            setIsTyping(false);
          }
        );
      } catch (error) {
        console.error('Error:', error);
        setIsTyping(false);
      }
    }
  };

  return (
    <ChatContainer theme={theme}>
      <MessageHistory theme={theme}>
        <SystemPrompt
          isOpen={isSystemPromptOpen}
          setIsOpen={setIsSystemPromptOpen}
          systemPrompt={systemPrompt}
          conversationId={conversationId}
        />
        {messages.map((message, index) => (
          <Message
            message={message}
            theme={theme}
          />
        ))}
        {isTyping && (
          <Message
            message={{content: streamedContent || "AI is typing..."}}
            theme={theme}
          />
        )}
        <div ref={messageEndRef} />
      </MessageHistory>
      <InputContainer theme={theme}>
        <InputWrapper theme={theme}>
          <Prompt theme={theme}>$</Prompt>
          <TextArea 
            ref={textAreaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
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
