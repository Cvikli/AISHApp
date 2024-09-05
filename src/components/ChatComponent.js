import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useParams } from 'react-router-dom';
import { ScrollableDiv, Button } from './SharedStyles';
import { MAX_TEXTAREA_HEIGHT } from '../constants';
import { useAppContext } from '../contexts/AppContext';
import Message from './Message';
import SystemPrompt from './SystemPrompt';
import { streamProcessMessage } from '../APIstream';
import STTButton from './STTButton';


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
  background-color: #1270ff;  // Kék háttérszín
  color: white;  // Fehér ikon szín
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background-color: #0056b3;  // Sötétebb kék hover állapotban
  }

  &:active {
    background-color: #003d82;  // Még sötétebb kék kattintáskor
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

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px 0px rgba(0, 255, 0, 0.5); }
  50% { box-shadow: 0 0 20px 10px rgba(0, 255, 0, 0.3); }
  100% { box-shadow: 0 0 5px 0px rgba(0, 255, 0, 0.5); }
`;

const InputContainer = styled.div`
  display: flex;
  padding: 0px;
  background-color: ${props => props.theme.backgroundColor};
  border-left: 10px solid ${props => props.theme.textColor};
  border-top: 1px solid ${props => props.theme.textColor};
  animation: ${props => props.$isListening ? glowAnimation : 'none'} 2s infinite;
  transition: box-shadow 0.3s ease-in-out;
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

  & > div {
    height: 100% !important;
    min-height: 34px !important;
  }
`;

const CLOSING_PHRASES = {
  en: ['i finished', "let's do it", 'send it', 'that is all', 'answer please'],
  hu: ['befejeztem', 'küldd el', 'ennyi volt', 'válaszolj kérlek'],
  de: ['ich bin fertig', 'lass uns das machen', 'sende es', 'das ist alles'],
  fr: ["j'ai fini", 'faisons-le', 'envoie-le', "c'est tout"],
  es: ['he terminado', 'hagámoslo', 'envíalo', 'eso es todo'],
  it: ['ho finito', 'facciamolo', 'invialo', 'questo è tutto'],
  ja: ['終わりました', 'やりましょう', '送信して', '以上です'],
  ko: ['끝났어요', '시작하자', '보내', '이게 다야'],
  zh: ['我完成了', '让我们开始吧', '发送', '就这样'],
};

function ChatComponent() {
  const {
    theme,
    conversations,
    addMessage,
    updateMessage,
    projectPath,
    setFinalTranscript,
    voiceState,
    setVoiceState,
    finalTranscript,
    interimTranscript,
    toggleSTTListening,
    language
  } = useAppContext();

  const { conversationId } = useParams();

  const [inputValue, setInputValue] = useState('');
  const [isReceivingMessage, setIsReceivingMessage] = useState(false);
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [isSTTActive, setIsSTTActive] = useState(false);


  const messageEndRef = useRef(null);
  const messageHistoryRef = useRef(null);
  const textAreaRef = useRef(null);

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


  const handleSend = async () => {
    if (isSTTActive) {
      toggleSTTListening();
    }
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
        // Append error message to the streamed content
        const errorMessage = `\n\nError: ${error.message}`;
        setStreamedContent(prev => prev + errorMessage);
        
        // Add the message with the streamed content and error
        addMessage(conversationId, { 
          role: 'assistant', 
          content: streamedContent + errorMessage,
          error: error.message
        });
        
        setStreamedContent('');
        setIsReceivingMessage(false);
      }
    }
  };

  useEffect(() => {
    if (voiceState === 'COMMAND_LISTENING' || voiceState === 'VOICE_ACTIVATED_COMMAND_LISTENING') {
      const lowercaseTranscript = (inputValue + finalTranscript + ' ' + interimTranscript).toLowerCase();
      const closingPhrases = CLOSING_PHRASES[language] || CLOSING_PHRASES['en'];
      
      if (closingPhrases.some(phrase => lowercaseTranscript.includes(phrase))) {
        setInputValue(prevInput => prevInput + finalTranscript + ' ' + interimTranscript);
        handleSend();
        setVoiceState(voiceState === 'COMMAND_LISTENING' ? 'INACTIVE' : 'WAKE_WORD_LISTENING');
      }
      if (finalTranscript) {
        setInputValue(prev => prev + finalTranscript);
        setFinalTranscript('');
        
      }
    }
  }, [finalTranscript, interimTranscript]);


  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setInputValue(inputValue + finalTranscript + ' ' + interimTranscript);
      handleSend();
    }
  };  
  
  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
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
      <JumpToBottomButton
        onClick={scrollToBottom}
        $isVisible={!isNearBottom}
        theme={theme}
        title="Jump to bottom"
      >
        <ArrowDownIcon />
      </JumpToBottomButton>
      <InputContainer theme={theme} $isListening={isSTTActive}>
        <InputWrapper theme={theme}>
          <Prompt theme={theme}>$</Prompt>
          <TextArea 
            ref={textAreaRef}
            value={inputValue + interimTranscript}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Enter command... ${projectPath ? `(Project: ${projectPath})` : ''}`}
            rows={1}
            theme={theme}
          />
        </InputWrapper>
        <StyledSTTButton 
          onActiveChange={setIsSTTActive}
        />
        <SendButton onClick={handleSend} theme={theme}>Send</SendButton>
      </InputContainer>
    </ChatContainer>
  );
}

export default ChatComponent;
