import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMembersByGroupId } from '../api/membersApi';
import { createTransaction } from '../api/transactionsApi';

interface Member {
  id: number;
  name: string;
}

export default function NewTransactionPageWrapper() {
  const { id } = useParams<{ id: string }>();
  const groupId = id ? parseInt(id) : undefined;
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);
  const [payerId, setPayerId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [splitMethod, setSplitMethod] = useState<'equal' | 'percentage' | 'shares'>('equal');
  const [inputs, setInputs] = useState<Record<number, number>>({});

  useEffect(() => 
    {
    if (groupId) {
      getMembersByGroupId(groupId).then(res => {
        const rawData = res.data;
        const loadedmembers = Array.isArray(rawData)
        ? rawData
        : rawData?.$values ?? [];
        console.log('loaded members:', loadedmembers);
        setMembers(loadedmembers);
        setPayerId(loadedmembers[0]?.id || null);

        const defaultSplits = Object.fromEntries(loadedmembers.map((u: any) => [u.id, 0]));
        setInputs(defaultSplits);
      });
    }
  }, [groupId]);

  const updateInputs = () => {
    if (!payerId) return;
    const receivers = members.filter(m => m.id !== payerId);

    if (splitMethod === 'equal') {
      const perPerson = amount / receivers.length;
      const updated = Object.fromEntries(receivers.map(u => [u.id, parseFloat(perPerson.toFixed(2))]));
      setInputs(updated);
    }
  };

  const handleInputChange = (id: number, value: number) => {
    const newInputs = { ...inputs, [id]: value };
    const total = Object.entries(newInputs).reduce((a, [, v]) => a + v, 0);

    if (splitMethod === 'percentage' && total > 100) {
      alert("Total percentage cannot exceed 100%");
      return;
    }

    if (splitMethod === 'shares' && total > 1000) { // arbitrary share cap
      alert("Total shares too high");
      return;
    }

    setInputs(newInputs);
  };

  const handleSubmit = () => {
    if (!payerId || !groupId) return;

    const receivers = members.filter(m => m.id !== payerId);

    if (splitMethod === 'percentage') {
      const total = Object.values(inputs).reduce((a, b) => a + b, 0);
      if (Math.round(total) !== 100) {
        alert(`Total percentage must be exactly 100%. Current total: ${total}%`);
        return;
      }
    } else if (splitMethod === 'shares') {
      const totalShares = Object.values(inputs).reduce((a, b) => a + b, 0);
      if (totalShares === 0) {
        alert("Total shares must be greater than 0");
        return;
      }
    }

    const participants = receivers.map(u => {
      let share = inputs[u.id];
      if (splitMethod === 'percentage') {
        share = (inputs[u.id] / 100) * amount;
      } else if (splitMethod === 'shares') {
        const totalShares = Object.values(inputs).reduce((a, b) => a + b, 0);
        share = (inputs[u.id] / totalShares) * amount;
      }
      return { memberId: u.id, share };
    });

createTransaction(groupId, {
      payerId,
      amount,
      divisionType: splitMethod,
      participants,
    }).then(() => navigate(`/groups/${groupId}`));
  };

  const totalPercent = Object.values(inputs).reduce((a, b) => a + b, 0);
  const totalShares = Object.values(inputs).reduce((a, b) => a + b, 0);
  const payer = members.find(m => m.id === payerId);
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">New Transaction</h1>

      <div className="flex gap-4 items-center">
        <label>Paid by {payer?.name || "unknown"}</label>
        <select value={payerId ?? ''} onChange={e => setPayerId(Number(e.target.value))}>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <label>Amount</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          onBlur={updateInputs}
          className="border px-2 py-1 w-24"
        />
      </div>

      <div className="flex gap-4">
        <label><input type="radio" value="equal" checked={splitMethod === 'equal'} onChange={() => { setSplitMethod('equal'); updateInputs(); }} /> Equally</label>
        <label><input type="radio" value="percentage" checked={splitMethod === 'percentage'} onChange={() => setSplitMethod('percentage')} /> By percentage</label>
        <label><input type="radio" value="shares" checked={splitMethod === 'shares'} onChange={() => setSplitMethod('shares')} /> By shares</label>
      </div>

      {members.filter(m => m.id !== payerId).map(m => {
        const shareAmount = splitMethod === 'shares' && totalShares > 0
          ? ((inputs[m.id] || 0) / totalShares * amount).toFixed(2)
          : '';

        return (
          <div key={m.id} className="flex gap-2 items-center">
            <span className="w-24">{m.name}</span>
            <input
              type="number"
              value={inputs[m.id] || 0}
              onChange={e => handleInputChange(m.id, Number(e.target.value))}
              className="border px-2 py-1 w-24"
              disabled={splitMethod === 'equal'}
            />
            {splitMethod === 'percentage' && <span>%</span>}
            {splitMethod === 'shares' && <span>shares ≈ €{shareAmount}</span>}
          </div>
        );
      })}

      {splitMethod === 'percentage' && (
        <p className={`text-sm ${totalPercent > 100 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
          Total: {totalPercent}%
        </p>
      )}

      {splitMethod === 'shares' && (
        <p className={`text-sm ${totalShares > 1000 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
          Total shares: {totalShares}
        </p>
      )}

      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
        Add Transaction
      </button>
    </div>
  );
}
