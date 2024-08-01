import styled from 'styled-components';

export const Button = styled.button`
  padding: 5px 10px;
  margin: 5px;
  background-color: #0084ff;
  color: white;
  border: none;
  border-radius: 0px;
  cursor: pointer;
  font-size: 14px;
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
