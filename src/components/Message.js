import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';

const MessageContainer = styled.div`
  margin: 8px 0;
  padding: 5px 2px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  background-color: ${props => props.theme.backgroundColor};
  color: white;
  border-left: ${props => props.isUser ? `10px solid ${props.theme.textColor}` : 'none'};
`;

const UserPrompt = styled.span`
  color: ${props => props.theme.textColor};
  font-weight: bold;
`;

const Timestamp = styled.div`
  font-size: 12px;
  color: white;
  opacity: 0.7;
  margin-top: 4px;
`;

const StyledMarkdown = styled(ReactMarkdown)`
  margin: 0;
  padding: 0;

  p {
    margin: 0;
    color: white;
  }

  code {
    background-color: ${props => props.theme.backgroundColor};
    border: 1px solid ${props => props.theme.borderColor};
    border-radius: 3px;
    padding: 2px 4px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    color: ${props => props.theme.textColor};
  }

  pre {
    background-color: ${props => props.theme.backgroundColor};
    border: 1px solid ${props => props.theme.borderColor};
    border-radius: 3px;
    padding: 10px;
    overflow-x: auto;

    code {
      border: none;
      padding: 0;
      color: ${props => props.theme.textColor};
    }
  }

  img {
    max-width: 100%;
    height: auto;
  }

  * {
    color: white;
  }

  code, pre code {
    color: ${props => props.theme.textColor};
  }
`;

function Message({ message, isUser, timestamp, theme }) {
  const formatTimestamp = (ts) => {
    if (!ts) return ''; // Return an empty string if timestamp is undefined
    const parts = ts.split('_');
    return parts.length > 1 ? parts[1] : ts; // Return the original timestamp if it doesn't contain an underscore
  };

  const formattedTimestamp = formatTimestamp(timestamp);

  return (
    <MessageContainer isUser={isUser} theme={theme}>
      {isUser ? (
        <>
          <div>
            <UserPrompt theme={theme}>$ </UserPrompt>
            {message}
          </div>
          {formattedTimestamp && <Timestamp theme={theme}>{formattedTimestamp}</Timestamp>}
        </>
      ) : (
        <>
          <StyledMarkdown theme={theme}>{message}</StyledMarkdown>
          {formattedTimestamp && <Timestamp theme={theme}>{formattedTimestamp}</Timestamp>}
        </>
      )}
    </MessageContainer>
  );
}

export default Message;
