import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import ChatPage from './components/ChatPage';

function App() {
  return (
    <Router>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/chat/new" replace />} />
            <Route path="chat/:conversationId" element={<ChatPage />} />
          </Route>
        </Routes>
      </AppProvider>
    </Router>
  );
}

export default App;
