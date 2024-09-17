import React, { useState, useRef, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useParams } from 'react-router-dom';
import { ScrollableDiv, Button } from './SharedStyles';
import { useAppContext } from '../contexts/AppContext';
import Message from './Message';
import SystemPrompt from './SystemPrompt';
import { streamProcessMessage } from '../APIstream';
import ChatInput from './ChatInput';
import { v4 as uuidv4 } from 'uuid';

const JumpToBottomButton = styled(Button)`
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 1000;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transition: opacity 0.3s ease-in-out, background-color 0.3s ease;
  padding: 10px;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  background-color: #1270ff;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background-color: #0056b3;
  }

  &:active {
    background-color: #003d82;
  }
`;

const ArrowDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <polyline points="19 12 12 19 5 12"></polyline>
  </svg>
);

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
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

const ChatComponent = () => {
  const {
    theme,
    conversations,
    addMessage,
    projectPath,
    setFinalTranscript,
    voiceState,
    setVoiceState,
    finalTranscript,
    interimTranscript,
    toggleSTTListening,
    language,
    delMessage,
    updateMessage
  } = useAppContext();

  const { conversationId } = useParams();

  const [isReceivingMessage, setIsReceivingMessage] = useState(false);
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);
  const [tempAIMessage, setTempAIMessage] = useState(null);

  const messageEndRef = useRef(null);
  const messageHistoryRef = useRef(null);

  const [isNearBottom, setIsNearBottom] = useState(true);

  const currentConversation = conversations[conversationId] || { messages: [], systemPrompt: '' };
  const { messages, systemPrompt } = currentConversation;

  const checkIfNearBottom = useCallback(() => {
    if (messageHistoryRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageHistoryRef.current;
      const scrollThreshold = 300;
      const newIsNearBottom = scrollTop + clientHeight >= scrollHeight - scrollThreshold;
      setIsNearBottom(newIsNearBottom);
      return newIsNearBottom;
    }
    return true;
  }, []);

  useEffect(() => {
    const messageHistory = messageHistoryRef.current;
    if (messageHistory) {
      const handleScroll = () => checkIfNearBottom();
      messageHistory.addEventListener('scroll', handleScroll);
      return () => messageHistory.removeEventListener('scroll', handleScroll);
    }
  }, [checkIfNearBottom]);

  useLayoutEffect(() => {
    if (messageEndRef.current && !isSystemPromptOpen && checkIfNearBottom()) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  });

  const scrollToBottom = useCallback(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleSend = useCallback(async (trimmedInput) => {
    console.log('ChatComponent: handleSend called');
    if (trimmedInput) {
      const user_msg_id = uuidv4();
      const userMessage = {
        id: user_msg_id,
        role: 'user',
        content: trimmedInput,
      };
      
      // Add user message to the conversation immediately
      addMessage(conversationId, userMessage);

      setIsReceivingMessage(true);
      let stream_content = '';
      try {
        await streamProcessMessage(
          trimmedInput,
          conversationId, 
          (content) => {
            stream_content += content;
            setTempAIMessage(prev => ({
              ...prev,
              content: (prev?.content || '') + content
            }));
          },
          (inMeta) => {

            delMessage(conversationId, user_msg_id);
            addMessage(conversationId, {
              role: 'user',
              content: trimmedInput,
              ...inMeta // timestamp, id and metas...
            });
            setTempAIMessage({
              role: 'assistant',
              content: '',
              timestamp: new Date().toISOString()
            });
          },
          (outMeta) => {
            const assistantMessage = {
              ...tempAIMessage,
              content: stream_content,
              ...outMeta
            };
            addMessage(conversationId, assistantMessage);
            setIsReceivingMessage(false);
            setTempAIMessage(null);
            stream_content = '';
          }
        );
      } catch (error) {
        console.error('Error:', error);
        const errorMessage = `\n\nError: ${error.message}`;

        addMessage(conversationId, {
          id: uuidv4(),
          role: 'assistant',
          content: stream_content + '\n' + errorMessage,
          timestamp: new Date().toISOString(),
        });

        setIsReceivingMessage(false);
        setTempAIMessage(null);
        stream_content = '';
      }
    }
  }, [conversationId, addMessage]);

  return (
    <ChatContainer theme={theme}>
      <MessageHistory ref={messageHistoryRef} theme={theme}>
        <SystemPrompt
          isOpen={isSystemPromptOpen}
          setIsOpen={setIsSystemPromptOpen}
          conversationId={conversationId}
        />
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            isStreaming={false}
            theme={theme}
          />
        ))}
        {tempAIMessage && <Message
          key="temp-ai-message"
          message={tempAIMessage}
          isStreaming={true}
          theme={theme}
        />}
        <BottomPadding 
          ref={messageEndRef} 
          data-is-receiving={isReceivingMessage}
        />
      </MessageHistory>
      <JumpToBottomButton
        onClick={scrollToBottom}
        $isVisible={!isNearBottom}
        theme={theme}
        title="Jump to bottom"
      >
        <ArrowDownIcon />
      </JumpToBottomButton>
      <ChatInput
        theme={theme}
        projectPath={projectPath}
        onSend={handleSend}
        interimTranscript={interimTranscript}
        finalTranscript={finalTranscript}
        setFinalTranscript={setFinalTranscript}
        voiceState={voiceState}
        setVoiceState={setVoiceState}
        toggleSTTListening={toggleSTTListening}
        language={language}
      />
    </ChatContainer>
  );
};

export default ChatComponent;
