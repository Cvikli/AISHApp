import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';

const MessageContainer = styled.div`
  margin-bottom: 8px;
  padding: 10px;
  border-radius: 4px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  background-color: ${props => props.isUser ? props.theme.userMessageBackground : props.theme.aiMessageBackground};
  color: ${props => props.theme.text};
  ${props => props.isUser && `border-left: 4px solid #0084ff;`}
`;

const StyledMarkdown = styled(ReactMarkdown)`
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  & > * {
    margin-bottom: 0.5em;
  }

  code {
    background-color: ${props => props.theme.codeBackground};
    padding: 2px 4px;
    border-radius: 4px;
    font-family: 'Courier New', Courier, monospace;
    white-space: pre-wrap;
    word-break: break-all;
  }

  pre {
    background-color: ${props => props.theme.codeBackground};
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }

  img {
    max-width: 100%;
    height: auto;
  }
`;

function Message({ message, isUser, theme }) {
  return (
    <MessageContainer isUser={isUser} theme={theme}>
      {isUser ? (
        <>➜ {message}</>
      ) : (
        <StyledMarkdown theme={theme}>{message}</StyledMarkdown>
      )}
    </MessageContainer>
  );
}

export default Message;
