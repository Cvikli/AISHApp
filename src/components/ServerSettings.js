import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useAppContext } from '../contexts/AppContext';

const SettingsContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: ${props => props.theme.backgroundColor};
  color: ${props => props.theme.textColor};
`;

const Input = styled.input`
  margin: 0 5px;
  padding: 5px;
  width: 120px;
  background-color: ${props => props.theme.inputBackground};
  color: white;
  border: 1px solid ${props => props.theme.borderColor};
`;

const Label = styled.span`
  margin-right: 5px;
`;

const ServerSettings = () => {
  const { serverIP, serverPort, updateServerSettings, theme } = useAppContext();
  const [tempIP, setTempIP] = useState(serverIP);
  const [tempPort, setTempPort] = useState(serverPort);

  const debouncedUpdateSettings = useCallback(
    debounce((ip, port) => {
      updateServerSettings(ip, port);
    }, 1000),
    [updateServerSettings]
  );

  useEffect(() => {
    if (tempIP !== serverIP || tempPort !== serverPort) {
      debouncedUpdateSettings(tempIP, tempPort);
    }
  }, [tempIP, tempPort, serverIP, serverPort, debouncedUpdateSettings]);

  return (
    <SettingsContainer theme={theme}>
      <Label>Server:</Label>
      <Input
        type="text"
        value={tempIP}
        onChange={(e) => setTempIP(e.target.value)}
        placeholder="IP Address"
        theme={theme}
      />
      <Input
        type="text"
        value={tempPort}
        onChange={(e) => setTempPort(e.target.value)}
        placeholder="Port"
        theme={theme}
      />
    </SettingsContainer>
  );
};

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default ServerSettings;
