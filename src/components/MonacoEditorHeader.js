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

const ButtonGroup = styled.div`
  display: flex;
  gap: 0px;
`;

const HeaderButton = styled(Button)`
  padding: 4px 8px;
  border: 1px solid ${props => props.theme.buttonBorderColor};
  font-size: inherit;
`;

const MonacoEditorHeader = ({ filename, onCopy, onSave, onUndo, onRedo }) => {
  return (
    <HeaderContainer>
      <Filename>{filename}</Filename>
      <ButtonGroup>
        <HeaderButton onClick={onUndo} title="Undo">↩️</HeaderButton>
        <HeaderButton onClick={onRedo} title="Redo">↪️</HeaderButton>
        <HeaderButton onClick={onSave}>Save</HeaderButton>
        <HeaderButton onClick={onCopy}>Copy</HeaderButton>
      </ButtonGroup>
    </HeaderContainer>
  );
};

export default MonacoEditorHeader;
