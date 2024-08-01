import styled from 'styled-components';

export const Button = styled.button`
  padding: 10px 16px;
  margin: 0px;
  background-color: ${props => props.theme.buttonBackground};
  color: ${props => props.theme.buttonText};
  border: none;
  border-radius: 0px;
  cursor: pointer;
  font-size: 16px;
`;

export const ScrollbarStyle = `
  scrollbar-width: thin;
  scrollbar-color: #6b6b6b #3a3a3a;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #3a3a3a;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #6b6b6b;
    border-radius: 4px;
    &:hover {
      background-color: #7b7b7b;
    }
  }
`;
