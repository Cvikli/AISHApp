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

const MetaInfo = styled.span`
  margin-left: 10px;
  font-size: 12px;
  color: ${props => props.theme.textColor};
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

const formatTimestamp = (ts) => {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatMetaInfo = (msg) => {
  if (!msg) return '';
  const { input_tokens, output_tokens, price, elapsed } = msg;
  return `[${input_tokens || 0} in, ${output_tokens || 0} out, $${(price || 0).toFixed(6)}, ${(elapsed || 0).toFixed(2)}s]`;
};

function Message({ message, theme }) {
  if (!message || !message.content) {
    console.warn("Received empty or invalid message");
    return null;
  }

  const isUser = message.role === 'user';
  const formattedTimestamp = formatTimestamp(message.timestamp);
  const formattedMeta = formatMetaInfo(message);

  return (
    <MessageContainer isUser={isUser} theme={theme}>
      {isUser ? (
        <>
          <div>
            <UserPrompt theme={theme}>$ </UserPrompt>
            {message.content}
          </div>
        </>
      ) : (
        <StyledMarkdown theme={theme}>{message.content}</StyledMarkdown>
      )}
      {formattedTimestamp && (
        <Timestamp theme={theme}>
          {formattedTimestamp}
          {formattedMeta && <MetaInfo theme={theme}>{formattedMeta}</MetaInfo>}
        </Timestamp>
      )}
    </MessageContainer>
  );
}

export default Message;
