import './App.css';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import NewTransactionPage from './pages/NewTransactionPage';
import LoginPage from './pages/LogInPage';
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/groups" element={<GroupsPage />} />
      <Route path="/groups/:groupId" element={<GroupDetailPage />} />
      <Route path="/groups/:groupId/add-transaction" element={<NewTransactionPage />} />
    </Routes>
  );
}

export default App;