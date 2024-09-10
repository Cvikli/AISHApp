import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import ChatComponent from './ChatComponent';
import ServerSettings from './ServerSettings';
import { useAppContext } from '../contexts/AppContext';

const DefaultMessage = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-family: 'Courier New', monospace;
  font-weight: 300;
  color: white;
  background-color: ${props => props.theme.backgroundColor};
  text-align: center;
  padding: 20px;
`;

const MessageContent = styled.div`
  max-width: 600px;
  width: 100%;
`;

const Title = styled.h2`
  margin-bottom: 20px;
`;

const Instructions = styled.ol`
  text-align: left;
  margin: 20px 0;
  padding-left: 20px;
`;

const SettingsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
`;

const ActionButton = styled.button`
  position: relative;
  width: 120px;
  height: 40px;
  margin-left: 10px;
  overflow: hidden;
  background-color: ${props => props.theme.backgroundColor};
  color: ${props => props.theme.textColor};
  border: 1px solid ${props => props.theme.textColor};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: ${props => props.theme.textColor};
    color: ${props => props.theme.backgroundColor};
  }
`;

const ProgressBarFill = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: ${props => props.theme.textColor};
  width: ${props => props.progress}%;
  opacity: 0.5;
  transition: width 0.1s linear;
`;

const ButtonText = styled.span`
  z-index: 1;
  font-size: 16px;
  color: white;
`;


const RETRY_INTERVAL = 3000;

function ChatPage() {
  const { conversationId } = useParams();
  const { 
    conversations, 
    theme, 
    serverIP, 
    serverPort, 
    initializeApp, 
    autoReconnect, 
    toggleAutoReconnect 
  } = useAppContext();
  const [isServerConnected, setIsServerConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [progress, setProgress] = useState(0);

  const attemptConnection = useCallback(async () => {
    setIsLoading(true);
    setProgress(0);
    try {
      await initializeApp();
      setIsServerConnected(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error at initialization:', error);
      setIsServerConnected(false);
      setIsLoading(false);
      setRetryCount(prev => prev + 1);
    }
  }, []);

  useEffect(() => {
    if (!isServerConnected) {
      attemptConnection();
      let intervalId;
      if (autoReconnect) {
        intervalId = setInterval(() => {
          if (!isServerConnected) {
            attemptConnection();
          }
        }, RETRY_INTERVAL);
      }
      return () => clearInterval(intervalId);
    }
  }, [attemptConnection, isServerConnected, autoReconnect]);

  useEffect(() => {
    if (!isServerConnected && !isLoading && autoReconnect) {
      const intervalId = setInterval(() => {
        setProgress(prev => (prev + 1) % 101);
      }, RETRY_INTERVAL / 100);
      return () => clearInterval(intervalId);
    } else {
      setProgress(0);
    }
  }, [isServerConnected, isLoading, autoReconnect]);

  if (isLoading) {
    return (
      <DefaultMessage theme={theme}>
        <MessageContent>
          <p>Connecting to server...</p>
        </MessageContent>
      </DefaultMessage>
    );
  }

  if (!isServerConnected) {
    return (
      <DefaultMessage theme={theme}>
        <MessageContent>
          <Title>Server Connection Error</Title>
          <p>Unable to connect to the backend server. Please follow these steps to set up:</p>
          <Instructions>
            <li>Make sure the backend server is running on {serverIP}:{serverPort}</li>
            <li>Check if you have started the server using the run.sh script</li>
            <li>Ensure all dependencies are installed</li>
          </Instructions>
          <SettingsRow>
            <ServerSettings />
            <ActionButton onClick={attemptConnection} theme={theme}>
              <ButtonText>Retry Now</ButtonText>
            </ActionButton>
            <ActionButton 
              onClick={toggleAutoReconnect} 
              theme={theme}
            >
              {autoReconnect && <ProgressBarFill progress={progress} theme={theme} />}
              <ButtonText>
                {autoReconnect ? `Auto On (${retryCount})` : `Auto Off (${retryCount})`}
              </ButtonText>
            </ActionButton>
          </SettingsRow>
        </MessageContent>
      </DefaultMessage>
    );
  }

  if (!conversations[conversationId]) {
    return (
      <DefaultMessage theme={theme}>
        <MessageContent>
          <p>No conversation selected. Please choose a conversation from the sidebar or start a new one.</p>
        </MessageContent>
      </DefaultMessage>
    );
  }

  return <ChatComponent />;
}

export default ChatPage;
