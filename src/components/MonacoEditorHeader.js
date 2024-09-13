import React from 'react';
import styled from 'styled-components';
import { Button } from './SharedStyles';

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${props => props.theme.inputBackground};
  border-bottom: 1px solid ${props => props.theme.borderColor};
  font-family: inherit;
  font-size: inherit;
`;

const Filename = styled.span`
  margin: 0 8px;
  color: ${props => props.theme.textColor};
`;

const Instructions = styled.div`
  font-size: 12px;
  color: ${props => props.theme.textColor};
  margin-right: 10px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0px;
`;

const HeaderButton = styled(Button)`
  padding: 4px 8px;
  border: 1px solid ${props => props.theme.buttonBorderColor};
  font-size: inherit;
`;

const MonacoEditorHeader = ({ filename, onCopy, onAccept, onReject, onSave, showMergeOptions, children }) => {
  return (
    <HeaderContainer>
      <Filename>{filename}</Filename>
      <Instructions>
        Click on glyph margin to accept, Alt+Click to reject changes
      </Instructions>
      <ButtonGroup>
        {children}
        {showMergeOptions && (
          <>
            <HeaderButton onClick={onAccept}>Accept ✓</HeaderButton>
            <HeaderButton onClick={onReject}>Reject ✗</HeaderButton>
          </>
        )}
        <HeaderButton onClick={onSave}>Save</HeaderButton>
        <HeaderButton onClick={onCopy}>Copy</HeaderButton>
      </ButtonGroup>
    </HeaderContainer>
  );
};

export default MonacoEditorHeader;
