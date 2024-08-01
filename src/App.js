import React from 'react';
import { AppProvider } from './contexts/AppContext';
import AppContent from './components/AppContent';

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
