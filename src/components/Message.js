import React, { useCallback, memo } from 'react';
import styled, { keyframes } from 'styled-components';
import MonacoEditor from './MonacoEditor';

const MessageContainer = styled.div`
  margin: 8px 0;
  padding: 5px 10px;
  background-color: ${props => props.theme.backgroundColor};
  color: white;
  border-left: ${props => props.$isUser ? `10px solid ${props.theme.styleColor}` : 'none'};
`;

const UserMessageContainer = styled.div`
  display: flex;
  align-items: flex-start;
`;

const EditorWrapper = styled.div`
  margin: 10px 0;
`;

const UserPrompt = styled.span`
  color: ${props => props.theme.styleColor};
  font-weight: bold;
  margin-right: 8px;
  flex-shrink: 0;
`;

const UserTextarea = styled.div`
  width: 100%;
  min-height: 24px;
  background-color: ${props => props.theme.backgroundColor};
  color: white;
  font-family: inherit;
  font-size: inherit;
  padding: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const Timestamp = styled.div`
  font-size: 16px;
  opacity: 0.7;
  margin-top: 4px;
`;

const MetaInfo = styled.span`
  margin-left: 10px;
  font-size: 16px;
  color: ${props => props.theme.textColor};
`;

const blinkingCursor = keyframes`
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

const BlinkingCursor = styled.span`
  display: inline-block;
  width: 0.5em;
  height: 1em;
  background-color: ${props => props.theme.styleColor};
  animation: ${blinkingCursor} 1s infinite;
  vertical-align: middle;
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

const Message = memo(({ message, theme, isStreaming = false }) => {
  const isUser = message.role === 'user';
  const formattedTimestamp = formatTimestamp(message.timestamp);
  const formattedMeta = formatMetaInfo(message);

  const renderContent = useCallback(() => {
    if (!message.content) return null;

    const blocks = message.content.split(/^```/gm);

    return blocks.map((block, index) => {
      if (index % 2 === 1) {
        const [language, ...codeLines] = block.split('\n');
        const code = codeLines.join('\n');
        const isExecutable = ['sh', 'bash', 'zsh'].includes(language.trim());

        return (
          <EditorWrapper key={index}>
            <MonacoEditor
              value={code}
              language={language.trim()}
              readOnly={!isExecutable || isStreaming}
              isExecutable={isExecutable}
              autoExecute={isExecutable && (!isStreaming || index !== blocks.length - 1)}
              messageTimestamp={message.timestamp}
              theme={theme}
              onChange={(newValue) => console.log(index)}
            />
          </EditorWrapper>
        );
      } else {
        return (
          <UserTextarea key={index}>
            {block}
          </UserTextarea>
        );
      }
    });
  }, [message.content, isStreaming, message.timestamp, theme]);

  return (
    <MessageContainer $isUser={isUser} theme={theme}>
      {isUser ? (
        <UserMessageContainer>
          <UserPrompt theme={theme}>$</UserPrompt>
          <UserTextarea>
            {message.content}
          </UserTextarea>
        </UserMessageContainer>
      ) : (
        <>
          {renderContent()}
          {isStreaming && <BlinkingCursor theme={theme} />}
        </>
      )}
      {formattedTimestamp && !isStreaming && (
        <Timestamp theme={theme}>
          {formattedTimestamp}
          {formattedMeta && <MetaInfo theme={theme}>{formattedMeta}</MetaInfo>}
        </Timestamp>
      )}
    </MessageContainer>
  );
});

export default Message;
