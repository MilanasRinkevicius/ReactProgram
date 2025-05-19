import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

interface Member {
  id: number;
  name: string;
}

interface Props {
  usersInGroup: Member[];
  onSubmit: (payerId: number, amount: number, participants: { memberId: number, share: number }[]) => void;
}

export default function NewTransactionPage({ usersInGroup, onSubmit }: Props) {
  const [payerId, setPayerId] = useState<number>(usersInGroup[0]?.id || 0);
  const [amount, setAmount] = useState<number>(0);
  const [splitMethod, setSplitMethod] = useState<'equal' | 'percentage' | 'shares'>('equal');
  const [inputs, setInputs] = useState<Record<number, number>>(() => {
    if (Array.isArray(usersInGroup)){
    Object.fromEntries(usersInGroup.map(u => [u.id, 0]))
    }
    return{};
});

  //Update split values when method or amount changes
  const updateInputs = () => {
    if (splitMethod === 'equal') {
      const perPerson = amount / usersInGroup.length;
      const updated = Object.fromEntries(usersInGroup.map(u => [u.id, perPerson]));
      setInputs(updated);
    } else {
      //Do nothing for percentage/shares — let user input manually
    }
  };

  const handleSubmit = () => {
    if (splitMethod === 'percentage') {
      const total = Object.values(inputs).reduce((acc, val) => acc + val, 0);
      if (Math.round(total) !== 100) {
        alert("Percentages must add up to 100%");
        return;
      }
      const participants = usersInGroup.map(u => ({
        memberId: u.id,
        share: (inputs[u.id] / 100) * amount,
      }));
      onSubmit(payerId, amount, participants);
    } else if (splitMethod === 'shares') {
      const totalShares = Object.values(inputs).reduce((a, b) => a + b, 0);
      if (totalShares === 0) {
        alert("Total shares must be more than 0");
        return;
      }

      const participants = usersInGroup.map(u => ({
        memberId: u.id,
        share: (inputs[u.id] / totalShares) * amount,
      }));
      onSubmit(payerId, amount, participants);
    } else {
      const participants = usersInGroup.map(u => ({
        memberId: u.id,
        share: amount / usersInGroup.length,
      }));
      onSubmit(payerId, amount, participants);
    }
  };
  const payer = usersInGroup.find(m => m.id === payerId);
  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <label className="font-semibold">Paid by {payer?.name || "unknown"}</label>
        <select value={payerId} onChange={e => setPayerId(Number(e.target.value))} className="border px-2 py-1 rounded">
          {usersInGroup.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>

        <label className="font-semibold">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="border px-2 py-1 rounded w-28"
          onBlur={updateInputs}
        />
      </div>

      <div className="flex gap-4 items-center">
        <label className="font-semibold">Split method</label>
        <label>
          <input type="radio" value="equal" checked={splitMethod === 'equal'} onChange={() => { setSplitMethod('equal'); updateInputs(); }} /> Equally
        </label>
        <label>
          <input type="radio" value="percentage" checked={splitMethod === 'percentage'} onChange={() => setSplitMethod('percentage')} /> By percentage
        </label>
        <label>
          <input type="radio" value="shares" checked={splitMethod === 'shares'} onChange={() => setSplitMethod('shares')} /> By shares
        </label>
      </div>

      {usersInGroup.map(user => (
        <div key={user.id} className="flex gap-2 items-center">
          <span className="w-24">{user.name}</span>
          <input
            type="number"
            value={inputs[user.id]}
            onChange={e => setInputs(prev => ({ ...prev, [user.id]: Number(e.target.value) }))}
            className="border px-2 py-1 rounded w-24"
            disabled={splitMethod === 'equal'}
          />
          {splitMethod === 'percentage' && <span>%</span>}
          {splitMethod === 'shares' && <span>shares</span>}
        </div>
      ))}

      {splitMethod === 'percentage' && (
        <p className="text-sm text-gray-600">Total: {Object.values(inputs).reduce((a, b) => a + b, 0)}%</p>
      )}

      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
        Add Transaction
      </button>
    </div>
  );
}
