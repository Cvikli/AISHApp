import styled from 'styled-components';

export const Button = styled.button`
  padding: 5px 10px;
  margin: 0px;
  background-color: transparent;
  color: ${props => props.theme.textColor};
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 0px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: ${props => props.theme.hoverColor};
  }
`;

export const ScrollableDiv = styled.div`
  scrollbar-width: thin;
  scrollbar-color: ${props => props.theme.textColor} ${props => props.theme.backgroundColor};

  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.backgroundColor};
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme.textColor};
    border: 3px solid ${props => props.theme.backgroundColor};
    border-radius: 5px;
  }

  &::-webkit-scrollbar-corner {
    background: ${props => props.theme.backgroundColor};
  }

  &::-webkit-scrollbar-button {
    width: 0;
    height: 0;
  }

  &::-webkit-scrollbar-button:vertical:start:decrement,
  &::-webkit-scrollbar-button:vertical:end:increment,
  &::-webkit-scrollbar-button:horizontal:start:decrement,
  &::-webkit-scrollbar-button:horizontal:end:increment {
    display: none;
  }

  /* Chrome-specific styles */
  &::-webkit-scrollbar-button:vertical:start {
    height: 0;
    display: none;
  }

  &::-webkit-scrollbar-button:vertical:end {
    height: 0;
    display: none;
  }

  &::-webkit-scrollbar-button:horizontal:start {
    width: 0;
    display: none;
  }

  &::-webkit-scrollbar-button:horizontal:end {
    width: 0;
    display: none;
  }
`;
