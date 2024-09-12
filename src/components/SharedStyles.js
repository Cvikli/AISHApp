import styled from 'styled-components';

export const Button = styled.button`
  padding: 5px 10px;
  margin: 0px;
  background-color: #1270ff;
  color: white;
  border: none;
  border-radius: 0px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #187bcd;
  }

  &:active {
    background-color: #1464a8;
  }
`;

export const ScrollableDiv = styled.div`
  scrollbar-width: thin;
  scrollbar-color: ${props => props.theme.textColor} ${props => props.theme.backgroundColor};

  &::-webkit-scrollbar {
    width: 12px; // Increased width
    height: 12px; // Increased height
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.backgroundColor};
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme.textColor};
    border: 3px solid ${props => props.theme.backgroundColor};
    border-radius: 6px; // Increased border-radius
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
