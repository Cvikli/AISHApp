import React from 'react';
import styled from 'styled-components';
import { useAppContext } from '../contexts/AppContext';
import { ScrollbarStyle } from './SharedStyles';

const SidebarContainer = styled.div`
  flex-shrink: 0;
  width: ${props => props.isCollapsed ? '36px' : '250px'};
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  background-color: ${props => props.theme.background};
  border-right: 1px solid ${props => props.theme.borderColor};
`;

const NewConversationButton = styled.button`
  width: 100%;
  height: 36px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 10px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  color: ${props => props.theme.text};
  &:hover {
    background-color: ${props => props.theme.hoverBackground};
  }
`;

const ConversationList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  ${ScrollbarStyle}
`;

const ConversationItem = styled.div`
  padding: 8px 10px;
  cursor: pointer;
  color: ${props => props.theme.text};
  &:hover {
    background-color: ${props => props.theme.hoverBackground};
  }
  ${props => props.isSelected && `
    background-color: ${props.theme.selectedBackground};
    font-weight: bold;
  `}
`;

const ConversationTitle = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ConversationTimestamp = styled.div`
  font-size: 0.8em;
  color: ${props => props.theme.secondaryText};
`;

function Sidebar({ isCollapsed, theme }) {
  const { conversations, selectConversation, selectedConversationId, api } = useAppContext();

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleConversationClick = (id) => {
    selectConversation(id);
  };

  return (
    <SidebarContainer isCollapsed={isCollapsed} theme={theme}>
      <NewConversationButton onClick={api.startNewConversation} theme={theme}>
        {isCollapsed ? '+' : '+ New Conversation'}
      </NewConversationButton>
      {!isCollapsed && (
        <ConversationList>
          {Object.values(conversations).map((conversation) => (
            <ConversationItem 
              key={conversation.id} 
              onClick={() => handleConversationClick(conversation.id)}
              isSelected={conversation.id === selectedConversationId}
              theme={theme}
            >
              <ConversationTitle title={conversation.sentence}>
                {conversation.sentence}
              </ConversationTitle>
              <ConversationTimestamp theme={theme}>
                {formatTimestamp(conversation.timestamp)}
              </ConversationTimestamp>
            </ConversationItem>
          ))}
        </ConversationList>
      )}
    </SidebarContainer>
  );
}

export default Sidebar;
