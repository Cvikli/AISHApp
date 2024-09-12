import React, { useState, useCallback, useEffect, memo, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Button } from './SharedStyles';
import { useAppContext } from '../contexts/AppContext';
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

const ExecuteButton = styled(Button)`
  margin-top: 5px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  background-color: ${props => props.theme.backgroundColor};
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
`;

const LoadingSpinner = styled.div`
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  margin-right: 5px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ExecuteCount = styled.span`
  margin-left: 5px;
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
  const { executeBlock, updateMessage } = useAppContext();
  const [executeCounts, setExecuteCounts] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const editorRefs = useRef({});
  const lastCodeBlockRef = useRef(null);

  const updateMessageWrapper = useCallback((response) => {
    updateMessage(message.conversationId, message.id, { content: response.updated_content });
  }, [updateMessage, message.conversationId, message.id]);

  const handleExecute = useCallback(async (code, index) => {
    setLoadingStates(prevStates => ({ ...prevStates, [index]: true }));
    try {
      const response = await executeBlock(code, new Date(message.timestamp).toISOString());
      setExecuteCounts(prevCounts => ({
        ...prevCounts,
        [index]: (prevCounts[index] || 0) + 1
      }));
      updateMessageWrapper(response);
    } catch (error) {
      console.error('Error executing block:', error);
    } finally {
      setLoadingStates(prevStates => ({ ...prevStates, [index]: false }));
    }
  }, [executeBlock, updateMessageWrapper, message.timestamp]);

  const isUser = message.role === 'user';
  const formattedTimestamp = formatTimestamp(message.timestamp);
  const formattedMeta = formatMetaInfo(message);

  useEffect(() => {
    if (isStreaming && message.content) {
      if (lastCodeBlockRef.current) {
        lastCodeBlockRef.current.addContent(message.content);
      }
    }
  }, [isStreaming, message.content]);

  const renderContent = () => {
    if (!message.content) return null;

    const blocks = message.content.split(/^```/gm);

    return blocks.map((block, index) => {
      if (index % 2 === 1) {
        const [language, ...codeLines] = block.split('\n');
        const code = codeLines.join('\n');
        const isExecutable = ['sh', 'bash', 'zsh'].includes(language.trim());
        const codeIndex = JSON.stringify(code);
        const isLoading = loadingStates[codeIndex];

        return (
          <EditorWrapper key={index}>
            <MonacoEditor
              ref={el => {
                editorRefs.current[index] = el;
                if (index === blocks.length - 1) {
                  lastCodeBlockRef.current = el;
                }
              }}
              value={code}
              language={language.trim()}
              onChange={() => {}}
              readOnly={!isExecutable || isStreaming}
              options={{ scrollBeyondLastLine: false }}
              onScroll={(scrollTop) => {
                // Handle scroll event if needed
                // console.log('Editor scrolled:', scrollTop);
              }}
            />
            {isExecutable && !isStreaming && (
              <ExecuteButton
                onClick={() => handleExecute(code, codeIndex)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    LOADING
                  </>
                ) : (
                  <>
                    EXECUTE
                    <ExecuteCount>{executeCounts[codeIndex] > 0 ? `(${executeCounts[codeIndex]})` : ''}</ExecuteCount>
                  </>
                )}
              </ExecuteButton>
            )}
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
  };

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
