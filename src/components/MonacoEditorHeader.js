
import React from 'react';
import styled from 'styled-components';
import { Button } from './SharedStyles';
import SaveIcon from '../assets/SaveIcon';
import CopyIcon from '../assets/CopyIcon';

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
  opacity: ${props => props.disabled ? 0.5 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MonacoEditorHeader = ({ filename, onCopy, onSave, onUndo, onRedo, canUndo, canRedo, showSaveButton }) => {
  const showUndoRedo = canUndo || canRedo;

  return (
    <HeaderContainer>
      <Filename>{filename}</Filename>
      <ButtonGroup>
        {showUndoRedo && (
          <>
            <HeaderButton onClick={onUndo} disabled={!canUndo} title="Undo">↩️</HeaderButton>
            <HeaderButton onClick={onRedo} disabled={!canRedo} title="Redo">↪️</HeaderButton>
          </>
        )}
        {showSaveButton && (
          <HeaderButton onClick={onSave} title="Save">
            <IconWrapper>
              <SaveIcon size={18} />
            </IconWrapper>
          </HeaderButton>
        )}
        <HeaderButton onClick={onCopy} title="Copy">
          <IconWrapper>
            <CopyIcon size={18} />
          </IconWrapper>
        </HeaderButton>
      </ButtonGroup>
    </HeaderContainer>
  );
};

export default MonacoEditorHeader;

