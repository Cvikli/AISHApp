import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './contexts/AppContext';
import Layout from './components/Layout';
import ChatPage from './components/ChatPage';
import { ThemeProvider } from 'styled-components';
import './styles/diff.css';

const AppContent = () => {
  const { theme } = useAppContext();

  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/chat/new" replace />} />
          <Route path="chat/:conversationId" element={<ChatPage />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Router>
  );
}

export default App;
