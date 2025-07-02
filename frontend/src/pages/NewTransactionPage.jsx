import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const NewTransactionPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [payerId, setPayerId] = useState("");
  const [amount, setAmount] = useState("");
  const [splitType, setSplitType] = useState("equal");
  const [percentages, setPercentages] = useState([]);
  const [amounts, setAmounts] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [message, setMessage] = useState("");
  const [percentagesError, setPercentagesError] = useState("");
  const [amountsError, setAmountsError] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:5000/api/group/${groupId}/member`).then(res => {
      let data = res.data;
      if (data && data.$values) data = data.$values;
      setMembers(data);
      setSelectedRecipients(data.map(m => m.id));
      setPercentages(data.map(() => 0));
      setAmounts(data.map(() => 0));
    });
  }, [groupId]);

  useEffect(() => {
    if (!amount || recipientMembers.length === 0) return;
    setPercentages(Array(recipientMembers.length).fill(100 / recipientMembers.length));
    setAmounts(Array(recipientMembers.length).fill(Number(amount) / recipientMembers.length));
  }, [amount, payerId, members]);

  const handleSplitTypeChange = (type) => {
    setSplitType(type);
    setPercentages(Array(recipientMembers.length).fill(0));
    setAmounts(Array(recipientMembers.length).fill(0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const recipientIds = recipientMembers.map(m => m.id);
      const payload = {
        payerId: Number(payerId),
        amount: Number(amount),
        recipientIds,
        splitType,
        percentages: splitType === "percentage" ? percentages.map(Number) : undefined,
        amounts: splitType === "dynamic" ? amounts.map(Number) : undefined,
      };
      await axios.post(`http://localhost:5000/api/group/${groupId}/transaction`, payload);
      setMessage("Transaction added!");
      setTimeout(() => navigate(`/groups/${groupId}`), 1000);
    } catch (err) {
      setMessage("Failed to add transaction");
    }
  };

  const recipientMembers = members.filter(m => m.id !== Number(payerId));

  // Validation for percentages
  useEffect(() => {
    if (splitType === "percentage") {
      const total = percentages.reduce((sum, p) => sum + Number(p || 0), 0);
      if (percentages.some(p => Number(p) > 100)) {
        setPercentagesError("No individual percentage can exceed 100%");
      } else if (total !== 100) {
        setPercentagesError("Total percentage must be exactly 100%");
      } else {
        setPercentagesError("");
      }
    } else {
      setPercentagesError("");
    }
  }, [percentages, splitType]);

  // Validation for dynamic amounts
  useEffect(() => {
    if (splitType === "dynamic") {
      const total = amounts.reduce((sum, a) => sum + Number(a || 0), 0);
      if (amounts.some(a => Number(a) > Number(amount))) {
        setAmountsError("No individual amount can exceed the total amount");
      } else if (total !== Number(amount)) {
        setAmountsError("Sum of all amounts must equal the total amount");
      } else {
        setAmountsError("");
      }
    } else {
      setAmountsError("");
    }
  }, [amounts, splitType, amount]);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <Link to={`/groups/${groupId}`}>&larr; Back to Group Details</Link>
      </div>
      <h2>Add New Transaction</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Payer:</label>
          <select value={payerId} onChange={e => setPayerId(e.target.value)} required>
            <option value="">Select payer</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Amount:</label>
          <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
        </div>
        <div>
          <label>Split Type:</label>
          <select value={splitType} onChange={e => handleSplitTypeChange(e.target.value)}>
            <option value="equal">Equally</option>
            <option value="percentage">Percentage</option>
            <option value="dynamic">Dynamic</option>
          </select>
        </div>
        {splitType === "percentage" && (
          <div>
            <label>Percentages:</label>
            {recipientMembers.map((m, idx) => (
              <div key={m.id}>
                {m.name}: <input
                  type="number"
                  min="0"
                  max="100"
                  value={percentages[idx] || ""}
                  onChange={e => {
                    let val = Number(e.target.value);
                    if (val > 100) val = 100;
                    const arr = [...percentages];
                    arr[idx] = val;
                    setPercentages(arr);
                  }}
                  required
                /> %
                <span style={{ marginLeft: 8, color: "#888" }}>
                  ({((Number(amount) * (percentages[idx] || 0)) / 100).toFixed(2)})
                </span>
              </div>
            ))}
            {percentagesError && <div style={{ color: "red" }}>{percentagesError}</div>}
          </div>
        )}
        {splitType === "dynamic" && (
          <div>
            <label>Amounts:</label>
            {recipientMembers.map((m, idx) => (
              <div key={m.id}>
                {m.name}: <input
                  type="number"
                  min="0"
                  max={amount}
                  value={amounts[idx] || ""}
                  onChange={e => {
                    let val = Number(e.target.value);
                    if (val > Number(amount)) val = Number(amount);
                    const arr = [...amounts];
                    arr[idx] = val;
                    setAmounts(arr);
                  }}
                  required
                />
                <span style={{ marginLeft: 8, color: "#888" }}>
                  ({((Number(amounts[idx]) / Number(amount) * 100) || 0).toFixed(2)}%)
                </span>
              </div>
            ))}
            {amountsError && <div style={{ color: "red" }}>{amountsError}</div>}
          </div>
        )}
        <button type="submit" disabled={!!percentagesError || !!amountsError}>
          Add Transaction
        </button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
};

export default NewTransactionPage;