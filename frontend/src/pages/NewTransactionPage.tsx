import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { createTransaction } from '../api/transactionsApi';
import {useNavigate} from 'react-router-dom';

interface Member {
  id: number;
  name: string;
}

interface Props {
  usersInGroup: Member[];
  onSubmit: (payerId: number, amount: number, participants: { memberId: number, share: number }[]) => void;
}

interface ParticipantInput {
  memberId: number;
  share: number;
}

export default function NewTransactionPage({ usersInGroup, onSubmit }: Props) {
  const {id} = useParams();
  const groupId = Number(id);
  const navigate = useNavigate();
  const [payerId, setPayerId] = useState<number>(usersInGroup[0]?.id || 0);
  const [PayerName] = useState<string>(usersInGroup[0]?.name || "");
  const [amount, setAmount] = useState<number>(0);
  const [splitMethod, setSplitMethod] = useState<'equal' | 'percentage' | 'shares'>('equal');
  const [inputs, setInputs] = useState<Record<number, number>>(
      Object.fromEntries(usersInGroup.map(u => [u.id, 0]))
    );



  const handleSubmit = async () => {
  if (!payerId || !amount || amount <= 0 || usersInGroup.length === 0) {
    alert("Please fill out every field.");
    return;
  }

  const participants = usersInGroup.filter(user=>user.id !== payerId).map(user=>({
    memberId: user.id,
    share: inputs[user.id] || 0
  }));
  
  const payload = {
    payerId,
    amount,
    divisionType: splitMethod,
    participants
  };

  try {
    await createTransaction(groupId, payload);
    alert("Transaction was succesfully added");
    navigate(`/groups/${groupId}`);
  } catch (error) {
    console.error("Something went wrong", error);
    alert("Something went wrong");
  }
};
  const payer = usersInGroup.find(m => m.id === payerId);
  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <label className="font-semibold">Paid by {PayerName}</label>
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
        />
      </div>

      <div className="flex gap-4 items-center">
        <label className="font-semibold">Split method</label>
        <label>
          <input type="radio" value="equal" checked={splitMethod === 'equal'} onChange={() => { setSplitMethod('equal'); }} /> Equally
        </label>
        <label>
          <input type="radio" value="percentage" checked={splitMethod === 'percentage'} onChange={() => setSplitMethod('percentage')} /> By percentage
        </label>
        <label>
          <input type="radio" value="shares" checked={splitMethod === 'shares'} onChange={() => setSplitMethod('shares')} /> By shares
        </label>
      </div>

      {usersInGroup.filter(user => user.id !== payerId).map(user => (
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
