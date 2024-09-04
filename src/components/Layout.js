import React from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import Sidebar from './Sidebar';
import Header from './Header';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

const HeaderWrapper = styled.div`
  flex: 0 0 auto;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const ChatWrapper = styled.div`
  flex: 1;
  overflow: hidden;
`;

const Layout = () => {
  const { theme } = useAppContext();

  return (
    <AppContainer theme={theme}>
      <HeaderWrapper>
        <Header />
      </HeaderWrapper>
      <ContentWrapper>
        <Sidebar />
        <MainContent>
          <ChatWrapper>
            <Outlet />
          </ChatWrapper>
        </MainContent>
      </ContentWrapper>
    </AppContainer>
  );
};

export default Layout;
