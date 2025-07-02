import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";

const GroupDetailPage = () => {
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [allMembers, setAllMembers] = useState([]); // State to hold all members for transaction display
  const navigate = useNavigate();
  const { groupId } = useParams(); // Get groupId from route params

  // Fetch members when page loads or groupId changes
  useEffect(() => {
    fetchMembers();
    fetchTransactions();
    fetchAllMembers(); // Fetch all members for transaction display
  }, [groupId]);

  const fetchMembers = async () => {
    if (!groupId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/group/${groupId}/member`);
      let data = res.data;
      // Fix for $values serialization artifact
      if (data && data.$values) {
        data = data.$values;
      }
      setMembers(data);
    } catch (err) {
      // Optionally handle error
    }
  };

  const fetchTransactions = async () => {
    if (!groupId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/group/${groupId}/transaction`);
      let data = res.data;
      if (data && data.$values) data = data.$values;
      setTransactions(data);
    } catch (err) {
      // Optionally handle error
    }
  };

  // Fetch all members for transaction display
  const fetchAllMembers = async () => {
    if (!groupId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/group/${groupId}/member/all`);
      let data = res.data;
      if (data && data.$values) data = data.$values;
      setAllMembers(data);
    } catch (err) {
      // Optionally handle error
    }
  };

  // Add a new member with balance 0
  const handleAddMember = async () => {
    if (newMemberName.trim() === "") return;
    try {
      await axios.post(`http://localhost:5000/api/group/${groupId}/member`, {
        groupId: groupId,
        name: newMemberName,
        balance: 0
      });
      setNewMemberName("");
      fetchMembers(); // Refresh the members list from backend
    } catch (err) {
      alert("Failed to add member");
    }
  };

  // Delete member if balance is 0
  const handleDeleteMember = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/group/${groupId}/member/${id}`);
      fetchMembers(); // Refresh the list from backend
    } 
    catch (err) {
      alert("Failed to delete member");
    }
  };

  // Settle member transactions
  const handleSettleMember = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/group/${groupId}/member/${id}/settle`);
      fetchMembers(); // Refresh the list from backend
    } 
    catch (err) {
      alert("Failed to settle member");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <Link to="/groups">&larr; Back to Groups</Link>
      </div>
      <h2>Group Members</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="New member name"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
        />
        <button onClick={handleAddMember}>Add Member</button>
      </div>
      <ul>
        {Array.isArray(members) && members.length > 0 ? (
          members.map((member) => (
            <li key={member.id} style={{ marginBottom: 8 }}>
              {member.name} — Balance: {member.balance}
              {member.balance === 0 ? (
                <button
                  style={{ marginLeft: 8, color: "red" }}
                  onClick={() => handleDeleteMember(member.id)}
                >
                  Delete
                </button>
              ) : (
                <button
                  style={{ marginLeft: 8, color: "green" }}
                  onClick={() => handleSettleMember(member.id)}
                >
                  Settle
                </button>
              )}
            </li>
          ))
        ) : (
          <li>No members found.</li>
        )}
      </ul>

      <h2>Transactions</h2>
      <ul>
        {transactions.length === 0 && <li>No transactions yet.</li>}
        {transactions.map((tx) => (
          <li key={tx.id}>
            {(tx.payerName || (allMembers.find(m => m.id === tx.payerId)?.name) || `Member #${tx.payerId}`)} paid {tx.amount}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 24 }}>
        <button onClick={() => navigate(`/groups/${groupId}/add-transaction`)}>
          Add New Transaction
        </button>
      </div>
    </div>
  );
};

export default GroupDetailPage;