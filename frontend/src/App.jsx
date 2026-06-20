import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Servers from './pages/Servers';
import ServerCreate from './pages/ServerCreate';
import ServerView from './pages/ServerView';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/servers" element={<PrivateRoute><Servers /></PrivateRoute>} />
        <Route path="/servers/create" element={<PrivateRoute><ServerCreate /></PrivateRoute>} />
        <Route path="/servers/:id" element={<PrivateRoute><ServerView /></PrivateRoute>} />
        <Route path="/servers/:id/edit" element={<PrivateRoute><ServerCreate /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;