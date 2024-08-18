import React from 'react';
import { useParams } from 'react-router-dom';
import ChatComponent from '../Chat';
import { useAppContext } from '../contexts/AppContext';

function ChatPage() {
  const { conversationId } = useParams();
  const { conversations } = useAppContext();

  if (!conversations[conversationId]) {
    return <div>No conversation selected. Most likely the backend server isn't on as it would initialize an empty conversation!</div>;
  }

  return <ChatComponent />;
}

export default ChatPage;
