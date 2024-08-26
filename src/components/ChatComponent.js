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
  font-size: 16px;
  background-color: ${props => props.theme.backgroundColor};
  color: ${props => props.theme.textColor};
`;

const MessageHistory = styled(ScrollableDiv)`
  flex: 1;
  overflow-y: auto;
  padding: 0px;
  scroll-behavior: smooth;
`;

const BottomPadding = styled.div`
  height: 36px;
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
  align-items: center;
  background-color: ${props => props.theme.backgroundColor};
`;

const Prompt = styled.span`
  color: ${props => props.theme.textColor};
  padding: 5px 2px;
  font-size: 16px;
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
  font-size: 16px;
  line-height: 1.2;  
  background-color: transparent;
  color: white;

  &:focus {
    outline: none;
    box-shadow: inset 0 0 0 0px #0f0;
  }
`;

const SendButton = styled(Button)`
  font-size: 16px;
  padding: 5px 10px;
  margin-left: 2px;
  height: 40px;
  width: 80px;
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
  const [isTyping, setIsTyping] = useState(false);
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [isSTTActive, setIsSTTActive] = useState(false);
  const messageEndRef = useRef(null);
  const messageHistoryRef = useRef(null);
  const textAreaRef = useRef(null);
  const sttButtonRef = useRef(null);

  useEffect(() => {
    setInputValue('');
  }, [conversationId]);

  const currentConversation = conversations[conversationId] || { messages: [], systemPrompt: '' };
  const { messages, systemPrompt } = currentConversation;

  const scrollToBottom = useCallback(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSystemPromptOpen, streamedContent, scrollToBottom]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
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
  
      setIsTyping(true);
      setInputValue('');
      setStreamedContent('');
      scrollToBottom();
  
      try {
        await streamProcessMessage(
          trimmedInput,
          (content) => {
            setStreamedContent(prev => prev + content);
            scrollToBottom();
          },
          (inMeta) => {
            updateMessage(conversationId, trimmedInput, { 
              id: inMeta.id,
              input_tokens: inMeta.input_tokens,
              output_tokens: inMeta.output_tokens,
              price: inMeta.price,
              elapsed: inMeta.elapsed,
              timestamp: inMeta.timestamp,
            });
          },
          (finalContent, outMeta) => {
            console.log(outMeta)
            addMessage(conversationId, { 
              role: 'assistant', 
              content: finalContent, 
              timestamp: outMeta.timestamp,
              id: outMeta.id,
              input_tokens: outMeta.input_tokens,
              output_tokens: outMeta.output_tokens,
              price: outMeta.price,
              elapsed: outMeta.elapsed,
            });
            setStreamedContent('');
            setIsTyping(false);
            scrollToBottom();
          }
        );
      } catch (error) {
        console.error('Error:', error);
        setIsTyping(false);
      }
    }
  };

  const handleSTTTranscript = (transcript) => {
    setInputValue(transcript);
  };

  const handleSTTActiveChange = (active) => {
    setIsSTTActive(active);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
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
        <BottomPadding ref={messageEndRef} />
      </MessageHistory>
      <InputContainer theme={theme}>
        <InputWrapper theme={theme}>
          <Prompt theme={theme}>$</Prompt>
          <TextArea 
            ref={textAreaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Enter command... ${projectPath ? `(Project: ${projectPath})` : ''}`}
            rows={1}
            theme={theme}
          />
        </InputWrapper>
        <STTButton 
          ref={sttButtonRef}
          onTranscript={handleSTTTranscript} 
          onActiveChange={handleSTTActiveChange} 
        />
        <SendButton onClick={handleSend}>Send</SendButton>
      </InputContainer>
    </ChatContainer>
  );
}

export default ChatComponent;
