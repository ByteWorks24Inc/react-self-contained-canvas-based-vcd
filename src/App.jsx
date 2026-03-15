import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './router/AppRouter';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="noise-overlay"></div>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
