import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (tempIP !== serverIP || tempPort !== serverPort) {
        updateServerSettings(tempIP, tempPort);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [tempIP, tempPort, serverIP, serverPort, updateServerSettings]);

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

export default ServerSettings;
