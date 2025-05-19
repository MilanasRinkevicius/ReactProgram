import React from 'react';
import {Routes, Route } from 'react-router-dom';
import GroupDetailPage from './pages/GroupDetailPage'; // adjust path as needed
import GroupsPage from './pages/GroupsPage';
import NewTransactionPage from './pages/NewTransactionPageWrapper'; // Use the actual page

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GroupsPage />} />
      <Route path="/groups/:id" element={<GroupDetailPage />} />
      <Route path="/groups/:id/new-transaction" element={<NewTransactionPage />} />
      
    </Routes>
  );
}