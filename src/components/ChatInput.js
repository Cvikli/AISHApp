import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from './SharedStyles';
import { MAX_TEXTAREA_HEIGHT } from '../constants';
import STTButton from './STTButton';

const InputContainer = styled.div`
  display: flex;
  padding: 0px;
  background-color: ${props => props.theme.backgroundColor};
  border-left: 10px solid ${props => props.theme.styleColor};
  border-top: 1px solid ${props => props.theme.styleColor};
  animation: ${props => props.$isListening ? props.glowAnimation : 'none'} 2s infinite;
  transition: box-shadow 0.3s ease-in-out;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: flex-start;
  background-color: ${props => props.theme.backgroundColor};
`;

const Prompt = styled.span`
  color: ${props => props.theme.styleColor};
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

const ChatInput = (({ theme, projectPath, onSend, interimTranscript, finalTranscript, setFinalTranscript, voiceState, setVoiceState, toggleSTTListening, language }) => {
  const [inputValue, setInputValue] = useState('');
  const [isSTTActive, setIsSTTActive] = useState(false);
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.max(textAreaRef.current.scrollHeight, 20)}px`;
    }
  }, [inputValue]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (isSTTActive) {
      toggleSTTListening();
    }
    const trimmedInput = inputValue.trim() + ' ' + interimTranscript;
    if (trimmedInput) {
      onSend(trimmedInput);
      setInputValue('');
    }
  };

  useEffect(() => {
    if (voiceState === 'COMMAND_LISTENING' || voiceState === 'VOICE_ACTIVATED_COMMAND_LISTENING') {
      const lowercaseTranscript = (inputValue + finalTranscript + ' ' + interimTranscript).toLowerCase();
      const closingPhrases = ['i finished', "let's do it", 'send it', 'that is all', 'answer please'];
      
      if (closingPhrases.some(phrase => lowercaseTranscript.includes(phrase))) {
        setInputValue(prevInput => prevInput + finalTranscript + ' ' + interimTranscript);
        handleSend();
        setVoiceState(voiceState === 'COMMAND_LISTENING' ? 'INACTIVE' : 'WAKE_WORD_LISTENING');
      }
      if (finalTranscript) {
        setInputValue(prev => prev + finalTranscript);
        setFinalTranscript('');
      }
    } else {
      if (finalTranscript) {
        setInputValue(prev => prev + finalTranscript);
        setFinalTranscript('');
      }
    }
  }, [finalTranscript, interimTranscript, voiceState]);

  return (
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
  );
});

export default ChatInput;
