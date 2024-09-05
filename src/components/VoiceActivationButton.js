import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAppContext } from '../contexts/AppContext';

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
`;

const StyledButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid ${props => props.$isActive ? '#ff0000' : props.theme.borderColor};
  background-color: ${props => props.$isActive ? '#ff0000' : props.theme.backgroundColor};
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: visible;

  &:hover {
    border-color: #00ff00;
    background-color: ${props => props.$isActive ? '#ff0000' : '#005500'};
  }

  ${props => props.$isActive && css`
    animation: ${pulse} 1s infinite ease-in-out;
  `}
`;

const InnerCircle = styled.div`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: ${props => props.$isActive ? '#ffffff' : props.theme.textColor};
  transition: all 0.3s ease;
`;

const VoiceActivationButton = () => {
  const { theme, voiceState, toggleVoiceActivation } = useAppContext();

  const isActive = voiceState === 'WAKE_WORD_LISTENING'  || voiceState === 'VOICE_ACTIVATED_COMMAND_LISTENING';
  let title = '';
  switch (voiceState) {
    case 'WAKE_WORD_LISTENING':
      title = "Listening for 'Orion'";
      break;
    case 'COMMAND_LISTENING':
      title = "Listening for command";
      break;
    case 'VOICE_ACTIVATED_COMMAND_LISTENING':
      title = "Voice activated, listening for command";
      break;
    default:
      title = "Click to start voice activation";
  }

  const handleClick = () => {
    toggleVoiceActivation();
  };

  return (
    <StyledButton
      onClick={handleClick}
      $isActive={isActive}
      theme={theme}
      title={title}
    >
      <InnerCircle $isActive={isActive} theme={theme} />
    </StyledButton>
  );
};

export default VoiceActivationButton;
