import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAppContext } from '../contexts/AppContext';
import { ScrollableDiv } from './SharedStyles';

const SidebarContainer = styled.div`
  flex-shrink: 0;
  width: ${props => props.$isCollapsed ? '0' : '300px'};
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  background-color: ${props => props.theme.backgroundColor};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 1px;
    background-color: ${props => props.theme.borderColor};
    transform: scaleX(${props => props.$isCollapsed ? 0 : 1});
    transform-origin: right;
    transition: transform 0.3s ease;
  }
`;

const ConversationList = styled(ScrollableDiv)`
  flex-grow: 1;
  overflow-y: auto;
  width: 300px;
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform: translateX(${props => props.$isCollapsed ? '-300px' : '0'});
  opacity: ${props => props.$isCollapsed ? '0' : '1'};

  scrollbar-color: ${props => props.theme.name === 'dark' ? '#555' : '#ccc'} transparent;

  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme.name === 'dark' ? '#555' : '#ccc'};
    border-radius: 4px;
    border: 2px solid ${props => props.theme.backgroundColor};
  }
`;

const ConversationItem = styled.div`
  padding: 4px 8px;
  cursor: pointer;
  transition: background-color 0.05s ease;
  border-left: 3px solid transparent;
  &:hover {
    background-color: ${props => props.theme.hoverColor};
  }

  ${props => props.$isSelected && `
    background-color: ${props.theme.hoverColor};
    border-left-color: ${props.theme.textColor};
    font-weight: bold;
  `}
`;

const ConversationTitle = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
    selectConversation
  } = useAppContext();

  const { conversationId } = useParams();

  const formatTitle = (title) => {
    if (!title) {
      return "New"
    }
    return title.replace(/_/g, ' ');
  };

  const handleConversationClick = (id) => {
    selectConversation(id);
  };

  const sortedConversations = Object.values(conversations).sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <SidebarContainer $isCollapsed={isCollapsed} theme={theme}>
      <ConversationList theme={theme} $isCollapsed={isCollapsed}>
        {sortedConversations.length === 0 ? (
          <EmptyConversation theme={theme}>No conversations yet</EmptyConversation>
        ) : (
          sortedConversations.map((conversation) => (
            <ConversationItem 
              key={conversation.id}
              $isSelected={conversation.id === conversationId}
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
    </SidebarContainer>
  );
}

export default Sidebar;
