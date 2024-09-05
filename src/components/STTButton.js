import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import styled from 'styled-components';
import { Button } from './SharedStyles';
import { useAppContext } from '../contexts/AppContext';

const ButtonGroup = styled.div`
  display: flex;
  height: 100%;
  position: relative;
`;

const STTButtonStyled = styled(Button)`
  padding: 0px 10px;
  background-color: ${props => props.$isActive ? '#ff4136' : '#1270ff'};
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

const MicrophoneSelectButton = styled(Button)`
  padding: 0px 5px;
  background-color: ${props => props.theme.backgroundColor};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  border-radius: 0;
  border-left: 1px solid ${props => props.theme.borderColor};

  &:hover {
    background-color: ${props => props.theme.hoverColor};
  }
`;

const Icon = styled.span`
  font-size: 24px;
`;


const MicrophoneList = styled.ul`
  position: absolute;
  bottom: 100%;
  right: 0;
  min-width: 200px;
  max-width: 90vw;
  padding: 5px;
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  background-color: ${props => props.theme.backgroundColor};
  color: ${props => props.theme.textColor};
  z-index: 1000;
  list-style-type: none;
  margin: 0;
  overflow-y: auto;
  white-space: nowrap;
`;

const MicrophoneItem = styled.li`
  padding: 8px 10px;
  cursor: pointer;
  &:hover {
    background-color: ${props => props.theme.hoverColor};
  }
`;

const STTButton = forwardRef(({ onActiveChange }, ref) => {
  const [showMicrophoneList, setShowMicrophoneList] = useState(false);
  const buttonGroupRef = useRef(null);
  const { 
    theme, 
    voiceState,
    toggleSTTListening, 
    availableMicrophones, 
    setSelectedMicrophone 
  } = useAppContext();

  const isSTTActive = voiceState === 'COMMAND_LISTENING' || voiceState === 'VOICE_ACTIVATED_COMMAND_LISTENING';

  useEffect(() => {
    onActiveChange(isSTTActive);
  }, [isSTTActive, onActiveChange]);


  useEffect(() => {
    function handleClickOutside(event) {
      if (buttonGroupRef.current && !buttonGroupRef.current.contains(event.target)) {
        setShowMicrophoneList(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMicrophoneSelectToggle = () => {
    setShowMicrophoneList(!showMicrophoneList);
  };

  const handleMicrophoneSelect = (microphoneId) => {
    setSelectedMicrophone(microphoneId);
    setShowMicrophoneList(false);
  };
  const handleSTTButtonClick = () => {
    toggleSTTListening();
  };

  return (
    <ButtonGroup ref={buttonGroupRef}>
      <STTButtonStyled 
        onClick={handleSTTButtonClick} 
        $isActive={isSTTActive} 
        title={isSTTActive ? "Stop listening" : "Start listening"}
        theme={theme}
      >
        <Icon>{isSTTActive ? '⏹️' : '🎙️'}</Icon>
      </STTButtonStyled>
      <MicrophoneSelectButton
        onClick={handleMicrophoneSelectToggle}
        title="Select microphone"
        theme={theme}
      >
        ▼
      </MicrophoneSelectButton>
      {showMicrophoneList && (
        <MicrophoneList theme={theme}>
          {availableMicrophones.map(mic => (
            <MicrophoneItem 
              key={mic.deviceId} 
              onClick={() => handleMicrophoneSelect(mic.deviceId)}
              theme={theme}
            >
              {mic.label || `Microphone ${mic.deviceId}`}
            </MicrophoneItem>
          ))}
        </MicrophoneList>
      )}
    </ButtonGroup>
  );
});

export default STTButton;
