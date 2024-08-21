import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { Button } from './SharedStyles';
import { useAppContext } from '../contexts/AppContext';

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
    position: relative;

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

const ExecuteButton = styled(Button)`
  position: absolute;
  top: 5px;
  right: 5px;
  padding: 2px 5px;
  font-size: 12px;
`;

const formatTimestamp = (ts) => {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
};

const formatMetaInfo = (msg) => {
  if (!msg) return '';
  const { input_tokens, output_tokens, price, elapsed } = msg;
  const parts = [];
  
  if (input_tokens > 0) parts.push(`${input_tokens} in`);
  if (output_tokens > 0) parts.push(`${output_tokens} out`);
  if (price > 0) parts.push(`$${price.toFixed(6)}`);
  if (elapsed > 0) parts.push(`${elapsed.toFixed(2)}s`);
  
  return parts.length > 0 ? `[${parts.join(', ')}]` : '';
};

function Message({ message, theme }) {
  const { executeBlock } = useAppContext();

  if (!message || !message.content) {
    console.warn("Received empty or invalid message");
    return null;
  }

  const isUser = message.role === 'user';
  const formattedTimestamp = formatTimestamp(message.timestamp);
  const formattedMeta = formatMetaInfo(message);

  const handleExecute = (code) => {
    console.log('Executing code:', code);
    executeBlock(code);
  };

  const renderContent = () => {
    return {
      code: ({ node, inline, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : '';
        const isCodeBlock = !inline && language;

        if (isCodeBlock) {
          return (
            <pre className={className} {...props}>
              <ExecuteButton onClick={() => handleExecute(String(children))}>
                EXECUTE
              </ExecuteButton>
              <code>{children}</code>
            </pre>
          );
        }

        return <code className={className} {...props}>{children}</code>;
      }
    };
  };

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
        <StyledMarkdown theme={theme} >
          {message.content}
        </StyledMarkdown>
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
