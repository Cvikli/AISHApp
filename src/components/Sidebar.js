import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAppContext } from '../contexts/AppContext';
import { ScrollableDiv } from './SharedStyles';
import { HEADER_HEIGHT } from './Header';

const SidebarContainer = styled.div`
  flex-shrink: 0;
  width: ${props => props.isCollapsed ? `${HEADER_HEIGHT}px` : '250px'};
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  background-color: ${props => props.theme.backgroundColor};
  border-right: 1px solid ${props => props.theme.borderColor};
  font-family: 'Courier New', monospace;
`;

const NewConversationButton = styled.button`
  width: 100%;
  height: ${HEADER_HEIGHT}px;
  min-height: ${HEADER_HEIGHT}px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: ${props => props.isCollapsed ? 'center' : 'flex-start'};
  padding: 0 10px;
  border: none;
  background-color: ${props => props.theme.backgroundColor};
  border-bottom: 1px solid ${props => props.theme.borderColor};
  cursor: pointer;
  color: ${props => props.theme.textColor};
  font-family: inherit;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.hoverColor};
  }

  &:focus {
    outline: none;
    box-shadow: inset 0 0 0 1px ${props => props.theme.textColor};
  }
`;

const ConversationList = styled(ScrollableDiv)`
  flex-grow: 1;
  overflow-y: auto;

  /* Customizing scrollbar */
  scrollbar-width: thin;
  scrollbar-color: ${props => props.theme.name === 'dark' ? '#555' : '#ccc'} transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme.name === 'dark' ? '#555' : '#ccc'};
    border-radius: 4px;
    border: 2px solid ${props => props.theme.backgroundColor};
  }
`;

const ConversationItem = styled.div`
  padding: 4px 8px;
  cursor: pointer;
  color: ${props => props.theme.text};  
  transition: background-color 0.05s ease;
  border-left: 3px solid transparent;
  &:hover {
    background-color: ${props => props.theme.hoverColor};
  }

  ${props => props.isSelected && `
    background-color: ${props.theme.hoverColor};
    border-left-color: ${props.theme.textColor};
    font-weight: bold;
  `}
`;

const ConversationTitle = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
`;

const EmptyConversation = styled.div`
  padding: 8px 10px;
  color: ${props => props.theme.textColor};
  font-style: italic;
  opacity: 0.7;
`;

function Sidebar() {
  const { 
    theme, 
    isCollapsed, 
    conversations, 
    startNewConversation,
    selectConversation
  } = useAppContext();

  const { conversationId } = useParams();
  const navigate = useNavigate();

  const formatTitle = (title) => {
    return title.replace(/_/g, ' ');
  };

  const handleConversationClick = (id) => {
    selectConversation(id);
    navigate(`/conversation/${id}`);
  };

  // Sort conversations by timestamp in descending order
  const sortedConversations = Object.values(conversations).sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <SidebarContainer isCollapsed={isCollapsed} theme={theme}>
      <NewConversationButton 
        onClick={startNewConversation} 
        theme={theme}
        isCollapsed={isCollapsed}
      >
        {isCollapsed ? '+' : '+ New Conversation'}
      </NewConversationButton>
      {!isCollapsed && (
        <ConversationList theme={theme}>
          {sortedConversations.length === 0 ? (
            <EmptyConversation theme={theme}>No conversations yet</EmptyConversation>
          ) : (
            sortedConversations.map((conversation) => (
              <ConversationItem 
                key={conversation.id}
                isSelected={conversation.id === conversationId}
                theme={theme}
                onClick={() => handleConversationClick(conversation.id)}
              >
                <ConversationTitle title={formatTitle(conversation.sentence)}>
                  {formatTitle(conversation.sentence)}
                </ConversationTitle>
              </ConversationItem>
            ))
          )}
        </ConversationList>
      )}
    </SidebarContainer>
  );
}

export default Sidebar;
