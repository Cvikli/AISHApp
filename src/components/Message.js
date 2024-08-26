import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { Button } from './SharedStyles';
import { useAppContext } from '../contexts/AppContext';

const MessageContainer = styled.div`
  margin: 8px 0;
  padding: 5px 2px;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  background-color: ${props => props.theme.backgroundColor};
  color: white;
  border-left: ${props => props.$isUser ? `10px solid ${props.theme.textColor}` : 'none'};
`;

const UserPrompt = styled.span`
  color: ${props => props.theme.textColor};
  font-weight: bold;
`;

const Timestamp = styled.div`
  font-size: 14px;
  color: white;
  opacity: 0.7;
  margin-top: 4px;
`;

const MetaInfo = styled.span`
  margin-left: 10px;
  font-size: 14px;
  color: ${props => props.theme.textColor};
`;

const StyledMarkdown = styled(ReactMarkdown)`
  margin: 0;
  padding: 0;

  code {
    background-color: ${props => props.theme.backgroundColor};
    border: 1px solid white;
    border-radius: 4px;
    padding: 1px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 16px;
    color: ${props => props.theme.textColor};
  }

  pre {
    background-color: ${props => props.theme.backgroundColor};
    border-radius: 4px;
    padding: 0px 10px;
    overflow-x: auto;
    position: relative;
    margin: 5px 0;

    code {
      display: block;
      padding: 10px;
    }
  }
`;

const ExecuteButton = styled(Button)`
  position: absolute;
  bottom: 5px;
  right: 5px;
  padding: 4px 8px;
  font-size: 14px;
`;

const ExecuteCount = styled.span`
  margin-left: 5px;
  color: ${props => props.theme.textColor};
`;

const CodeBlock = styled.div`
  position: relative;
  margin: 0px 0px 10px 0px;
  overflow-x: auto;
`;

const CodeContent = styled.code`
  display: block;
  color: ${props => props.theme.textColor};
  font-family: 'Courier New', Courier, monospace;
  font-size: 16px;
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
  const { executeBlock, updateMessage } = useAppContext();
  const [ executeCounts, setExecuteCounts ] = useState({});
  const [ localContent, setLocalContent ] = useState(message.content);

  useEffect(() => {
    setLocalContent(message.content);
  }, [message.content]);

  const handleExecute = useCallback(async (code, index) => {
    console.log('Executing code:', code, message.timestamp);
    const response = await executeBlock(code, new Date(message.timestamp).toISOString());
    setExecuteCounts(prevCounts => ({
      ...prevCounts,
      [index]: (prevCounts[index] || 0) + 1
    }));

    console.log(response)
    console.log(response.updated_content)

    updateMessage(message.conversationId, message.content, { content: response.updated_content });
    setLocalContent(response.updated_content);
  }, [executeBlock, updateMessage, message]);

  if (!message || !localContent) {
    console.warn("Received empty or invalid message");
    return null;
  }

  const isUser = message.role === 'user';
  const formattedTimestamp = formatTimestamp(message.timestamp);
  const formattedMeta = formatMetaInfo(message);

  const renderContent = () => {
    return {
      code: ({ node, inline, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : '';
        const isExecutableBlock = !inline && ['sh', 'bash', 'zsh'].includes(language);

        if (isExecutableBlock) {
          const codeString = String(children);
          const codeIndex = JSON.stringify(codeString);

          return (
              <CodeBlock theme={theme}>
                <CodeContent theme={theme}>{children}</CodeContent>
                <ExecuteButton onClick={() => handleExecute(codeString, codeIndex)}>
                  EXECUTE
                  <ExecuteCount>{executeCounts[codeIndex] > 0 ? `(${executeCounts[codeIndex]})` : ''}</ExecuteCount>
                </ExecuteButton>
              </CodeBlock>
          );
        }

        return <code className={className} {...props}>{children}</code>;
      }
    };
  };

  return (
    <MessageContainer $isUser={isUser} theme={theme}>
      {isUser ? (
        <>
          <div>
            <UserPrompt theme={theme}>$ </UserPrompt>
            {localContent}
          </div>
        </>
      ) : (
        <StyledMarkdown theme={theme} components={renderContent()}>
          {localContent}
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
