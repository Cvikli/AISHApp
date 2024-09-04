import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import { Button } from './SharedStyles';
import { useAppContext } from '../contexts/AppContext';

const STTButtonStyled = styled(Button)`
  padding: 0px 10px;
  background-color: '#ff4136';
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  border-radius: 0;
  transition: all 0.2s ease-in-out;
  color: ${props => props.$isActive ? 'white' : props.theme.textColor};

  &:hover {
    background-color: ${props => props.$isActive ? '#e61e10' : props.theme.hoverColor};
    color: ${props => props.$isActive ? 'white' : props.theme.textColor};
    border-color: ${props => props.$isActive ? '#e61e10' : props.theme.textColor};
    transform: scale(1.05);
  }

  ${props => props.$isActive && `
    animation: pulse 1.5s infinite;
  `}

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 65, 54, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(255, 65, 54, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 65, 54, 0);
    }
  }
`;

const Icon = styled.span`
  font-size: 16px;
`;

const STTButton = forwardRef(({ onTranscript, onActiveChange }, ref) => {
  const [isSTTActive, setIsSTTActive] = useState(false);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const interimTranscriptRef = useRef('');

  const { language, theme } = useAppContext();

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    stopSTT: () => {
      return new Promise((resolve) => {
        if (recognitionRef.current) {
          recognitionRef.current.onend = () => {
            setIsSTTActive(false);
            onActiveChange(false);
            resolve(finalTranscriptRef.current);
          };
          recognitionRef.current.stop();
        } else {
          resolve(finalTranscriptRef.current);
        }
      });
    }
  }));

  const toggleSTT = () => {
    if (isSTTActive) {
      stopSTT();
    } else {
      startSTT();
    }
  };

  const startSTT = () => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'hu' ? 'hu-HU' : 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript;
          onTranscript(finalTranscript.trim(), true);
        }
        
        interimTranscriptRef.current = interimTranscript;
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        stopSTT();
      };

      recognitionRef.current.onend = () => {
        stopSTT();
      };

      finalTranscriptRef.current = '';
      recognitionRef.current.start();
      setIsSTTActive(true);
      onActiveChange(true);
    } else {
      console.error('Web Speech API is not supported in this browser');
    }
  };

  const stopSTT = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsSTTActive(false);
    onActiveChange(false);
  };

  return (
    <STTButtonStyled 
      onClick={toggleSTT} 
      $isActive={isSTTActive} 
      title={isSTTActive ? "Stop listening" : "Start listening"}
      theme={theme}
    >
      <Icon>{isSTTActive ? '⏹️' : '🎙️'}</Icon>
    </STTButtonStyled>
  );
});

export default STTButton;