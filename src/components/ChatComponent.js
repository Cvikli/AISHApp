import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { ScrollableDiv, Button } from './SharedStyles';
import { MAX_TEXTAREA_HEIGHT } from '../constants';
import { useAppContext } from '../contexts/AppContext';
import Message from './Message';
import SystemPrompt from './SystemPrompt';
import { streamProcessMessage } from '../APIstream';
import STTButton from './STTButton';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  font-family: 'Courier New', monospace;
  background-color: ${props => props.theme.backgroundColor};
  color: ${props => props.theme.textColor};
`;

const MessageHistory = styled(ScrollableDiv)`
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
`;

const BottomPadding = styled.div`
  height: ${props => props['data-is-receiving'] ? '148px' : '36px'};
  transition: height 0.3s ease;
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
  padding: 5px 2px 0 5px;
`;

const TextArea = styled.textarea`
  flex-grow: 1;
  padding: 5px;
  border: none;
  resize: none;
  min-height: 20px;
  height: 24px;
  font-size: 20px;
  max-height: ${MAX_TEXTAREA_HEIGHT}px;
  overflow-y: auto;
  font-family: inherit;
  line-height: 1.2;  
  background-color: transparent;
  color: white;

  &:focus {
    outline: none;
    box-shadow: inset 0 0 0 0px #0f0;
  }
`;

const SendButton = styled(Button)`
  margin-left: 2px;
  height: auto;
  min-height: 20px;
  align-self: stretch;
  display: flex;
  align-items: center;
`;

const StyledSTTButton = styled(STTButton)`
  align-self: stretch;
  height: auto !important;
  min-height: 20px !important;

  & > button {
    height: 100% !important;
    min-height: 34px !important;
  }
`;

function ChatComponent() {
  const {
    theme,
    conversations,
    addMessage,
    updateMessage,
    projectPath
  } = useAppContext();

  const { conversationId } = useParams();

  const [inputValue, setInputValue] = useState('');
  const [isReceivingMessage, setIsReceivingMessage] = useState(false);
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [isSTTActive, setIsSTTActive] = useState(false);
  const [interimInput, setInterimInput] = useState('');

  const messageEndRef = useRef(null);
  const messageHistoryRef = useRef(null);
  const textAreaRef = useRef(null);
  const sttButtonRef = useRef(null);

  const currentConversation = conversations[conversationId] || { messages: [], systemPrompt: '' };
  const { messages, systemPrompt } = currentConversation;

  const checkIfNearBottom = useCallback(() => {
    if (messageHistoryRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageHistoryRef.current;
      const scrollThreshold = 300;
      return scrollTop + clientHeight >= scrollHeight - scrollThreshold;
    }
    return true;
  }, []);

  useEffect(() => {
    const messageHistory = messageHistoryRef.current;
    if (messageHistory) {
      const handleScroll = () => (checkIfNearBottom());
      messageHistory.addEventListener('scroll', handleScroll);
      return () => messageHistory.removeEventListener('scroll', handleScroll);
    }
  }, [checkIfNearBottom]);

  useEffect(() => {
    if (messageEndRef.current && !isSystemPromptOpen && checkIfNearBottom()) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isSystemPromptOpen, streamedContent]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.max(textAreaRef.current.scrollHeight, 20)}px`;
    }
  }, [inputValue]);

  const resetInputAndSTT = useCallback(async () => {
    if (isSTTActive && sttButtonRef.current) {
      const finalTranscript = await sttButtonRef.current.stopSTT();
      setInputValue(prevInput => prevInput || finalTranscript);
    }
  }, [isSTTActive]);

  const handleSend = async () => {
    await resetInputAndSTT();
    const trimmedInput = inputValue.trim();
    
    if (trimmedInput) {
      const userMessage = { role: 'user', content: trimmedInput };
      addMessage(conversationId, userMessage);
  
      setIsReceivingMessage(true);
      setInputValue('');
      setStreamedContent('');
  
      try {
        await streamProcessMessage(
          trimmedInput,
          (content) => setStreamedContent(prev => prev + content),
          (inMeta) => updateMessage(conversationId, trimmedInput, inMeta),
          (finalContent, outMeta) => {
            addMessage(conversationId, { role: 'assistant', content: finalContent, ...outMeta });
            setStreamedContent('');
            setIsReceivingMessage(false);
          }
        );
      } catch (error) {
        console.error('Error:', error);
        setIsReceivingMessage(false);
      }
    }
  };

  const handleSTTTranscript = useCallback((transcript, isFinal) => {
    if (isFinal) {
      setInputValue(prev => prev + transcript);
      setInterimInput('');
    } else {
      setInterimInput(transcript);
    }
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setInterimInput(''); // Clear interim input when user types
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <ChatContainer theme={theme}>
      <MessageHistory ref={messageHistoryRef} theme={theme}>
        <SystemPrompt
          isOpen={isSystemPromptOpen}
          setIsOpen={setIsSystemPromptOpen}
          conversationId={conversationId}
        />
        {messages.map((message, index) => (
          <Message
            key={`${message.role}-${index}`}
            message={message}
            theme={theme}
          />
        ))}
        {isReceivingMessage && (
          <Message
            key="receiving-message"
            message={{content: streamedContent || "AI is typing..."}}
            theme={theme}
          />
        )}
        <BottomPadding 
          ref={messageEndRef} 
          data-is-receiving={isReceivingMessage}
        />
      </MessageHistory>
      <InputContainer theme={theme}>
        <InputWrapper theme={theme}>
          <Prompt theme={theme}>$</Prompt>
          <TextArea 
            ref={textAreaRef}
            value={inputValue + interimInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Enter command... ${projectPath ? `(Project: ${projectPath})` : ''}`}
            rows={1}
            theme={theme}
          />
        </InputWrapper>
        <StyledSTTButton 
          ref={sttButtonRef}
          onTranscript={handleSTTTranscript}
          onActiveChange={setIsSTTActive}
        />
        <SendButton onClick={handleSend} theme={theme}>Send</SendButton>
      </InputContainer>
    </ChatContainer>
  );
}

export default ChatComponent;
