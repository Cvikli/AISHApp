import React from 'react';
import styled from 'styled-components';
import { useAppContext } from '../contexts/AppContext';

const SidebarContainer = styled.div`
  flex-shrink: 0;
  overflow: hidden;
  width: ${props => props.isCollapsed ? '36px' : '250px'};
  border-right: 1px solid ${props => props.theme.borderColor};
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  background-color: ${props => props.theme.background};
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
  border-bottom: 1px solid ${props => props.theme.borderColor};
  &:hover {
    background-color: ${props => props.theme.hoverBackground};
  }
`;

const ConversationList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
`;

const ConversationItem = styled.div`
  padding: 8px 10px;
  cursor: pointer;
  color: ${props => props.theme.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &:hover {
    background-color: ${props => props.theme.hoverBackground};
  }
  ${props => props.isSelected && `
    background-color: ${props.theme.selectedBackground};
    font-weight: bold;
  `}
`;

function Sidebar({ isCollapsed, theme }) {
  const { conversations, selectedConversationId, selectConversation, api } = useAppContext();

  return (
    <SidebarContainer isCollapsed={isCollapsed} theme={theme}>
      <NewConversationButton onClick={api.startNewConversation} theme={theme}>
        {isCollapsed ? '+' : '+ New Conversation'}
      </NewConversationButton>
      {!isCollapsed && (
        <ConversationList>
          {Object.entries(conversations).map(([id, name]) => (
            <ConversationItem 
              key={id} 
              onClick={() => selectConversation(id)}
              isSelected={id === selectedConversationId}
              theme={theme}
              title={name}
            >
              {name}
            </ConversationItem>
          ))}
        </ConversationList>
      )}
    </SidebarContainer>
  );
}

export default Sidebar;
