import React from 'react';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  flex-shrink: 0;
  overflow: hidden;
  width: ${props => props.isCollapsed ? '36px' : '250px'};
  border-right: 1px solid ${props => props.theme.borderColor};
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
`;

const SidebarHeader = styled.div`
  display: flex;
  padding: 0px;
  align-items: flex-end;
`;

const NewConversationButton = styled.button`
  width: 100%;
  height: 36px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 4px 10px;
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
`;

const ConversationItem = styled.div`
  padding: 4px 10px;
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

function Sidebar({ 
  isCollapsed, 
  theme, 
  conversations, 
  selectedConversationId, 
  startNewConversation, 
  selectConversation 
}) {
  return (
    <SidebarContainer isCollapsed={isCollapsed} theme={theme}>
      <SidebarHeader>
        <NewConversationButton onClick={startNewConversation} theme={theme}>
          {isCollapsed ? '+' : '+ New Conversation'}
        </NewConversationButton>
      </SidebarHeader>
      {!isCollapsed && (
        <ConversationList>
          {conversations.map((conv) => (
            <ConversationItem 
              key={conv} 
              onClick={() => selectConversation(conv)}
              isSelected={conv === selectedConversationId}
              theme={theme}
            >
              {conv === selectedConversationId ? '➤ ' : ''}{conv}
            </ConversationItem>
          ))}
        </ConversationList>
      )}
    </SidebarContainer>
  );
}

export default Sidebar;
