import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import ChatComponent from './ChatComponent';
import { useAppContext } from '../contexts/AppContext';

const DefaultMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-family: 'Courier New', monospace;
  color: ${props => props.theme.textColor};
  background-color: ${props => props.theme.backgroundColor};
`;

function ChatPage() {
  const { conversationId } = useParams();
  const { conversations, theme } = useAppContext();

  if (conversationId && !conversations[conversationId]) {
    return (
      <DefaultMessage theme={theme}>
        No conversation selected or backend server isn't runnning!
      </DefaultMessage>
    );
  }

  return <ChatComponent />;
}

export default ChatPage;
