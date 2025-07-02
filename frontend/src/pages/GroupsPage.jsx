import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/group';

export default function GroupsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [groups, setGroups] = useState([]);
  const [balances, setBalances] = useState({});
  const navigate = useNavigate();

  // Fetch groups on mount
  useEffect(() => {
    fetchGroups();
  }, []);

  // After fetching groups
  const fetchGroups = async () => {
    try {
      const res = await axios.get(API_URL);
      let data = res.data;
      // If the response is an object with $values, use that
      if (data && data.$values) data = data.$values;
      setGroups(data);

      // Fetch balances for each group
      const balancesObj = {};
      await Promise.all(
        data.map(async (group) => {
          const txRes = await axios.get(`${API_URL}/${group.id}/transaction`);
          let txs = txRes.data;
          if (txs && txs.$values) txs = txs.$values;
          // Sum up all transaction amounts for this group
          const balance = txs.reduce((sum, tx) => sum + (tx.amount || 0), 0);
          balancesObj[group.id] = balance;
        })
      );
      setBalances(balancesObj);
    } catch (err) {
      setMessage('Error loading groups.');
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setMessage('Title cannot be empty');
      return;
    }
    try {
      await axios.post(API_URL, { title });
      setMessage(`Group "${title}" created!`);
      setTitle('');
      fetchGroups(); // Refresh list
    } catch (error) {
      setMessage('Error creating group.');
      console.error(error);
    }
  };

  const goToDetail = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '400px' }}>
      <h3>Create New Group</h3>
      <input
        type="text"
        className="form-control"
        placeholder="Enter group title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button
        className="btn btn-primary mt-3"
        onClick={handleCreate}
      >
        Create Group
      </button>
      {message && <div className="mt-3 alert alert-info">{message}</div>}

      <h4 className="mt-5">All Groups</h4>
      <ul className="list-group">
        {groups.map((group) => (
          <li key={group.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => goToDetail(group.id)}
            >
              {group.title}
            </span>
            <span style={{ fontWeight: 500, color: "#7c3aed" }}>
              Balance: {balances[group.id] ?? 0}
            </span>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => goToDetail(group.id)}
            >
              Details
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}