import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";

interface Member {
  id: number;
  name: string;
}

export const previewTransaction = (
  groupId: number,
  data: {
    payerId: number;
    amount: number;
    divisionType: string;
    participants: { memberId: number; share: number }[];
  }
) => {
  return axios.post(
    `http://localhost:5000/api/groups/${groupId}/transactions/preview`,
    data
  );
};

export default function NewTransactionPageWrapper() {
  const { id } = useParams<{ id: string }>();
  const groupId = id ? parseInt(id) : undefined;
  const navigate = useNavigate();
  const [PayerName] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [payerId, setPayerId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [splitMethod, setSplitMethod] = useState<'equal' | 'percentage' | 'shares'>('equal');
  const [inputs, setInputs] = useState<Record<number, number>>({});
  const [calculated, setCalculated] = useState<Record<number, number>>({});

  useEffect(() => {
    if (
      groupId !== undefined &&
      (splitMethod === 'equal') &&
      payerId !== null
    ) {
      const participants = members
        .filter((u) => u.id !== payerId)
        .map((u: Member) => ({
          memberId: u.id,
          share: 0, // for equal division, share values are not required
        }));

      previewTransaction(groupId, {
        payerId,
        amount,
        divisionType: splitMethod,
        participants,
      }).then((res) => {
        const values = (res.data as any).$values;
        if (Array.isArray(values)) {
          const calculatedInputs = Object.fromEntries(
            values.map((p: { memberId: number; share: number }) => [p.memberId, p.share])
          );
          setCalculated(calculatedInputs);
        } else {
          console.error("Unexpected response format:", res.data);
        }
      });
    }
  }, [groupId, splitMethod, payerId, amount, members]);

  useEffect(() => {
    if (!groupId) return;
    
    axios.get(`http://localhost:5000/api/groups/${groupId}/members`)
      .then(res => {
        const values = res.data?.$values;
        if (Array.isArray(values)) {
          setMembers(values);
        }
      })
      .catch(err => {
        console.error("Failed to fetch members", err);
      });
  }, [groupId]);

  const handleSubmit = () => {
    if (!groupId || !payerId || !amount) return;

    const participants =
  splitMethod === 'equal'
    ? members
        .filter((m) => m.id !== payerId)
        .map((m) => ({
          memberId: m.id,
          share: 0, // bus paskaičiuota serverio pusėje
        }))
    : Object.entries(inputs)
        .filter(([memberId]) => Number(memberId) !== payerId)
        .map(([memberId, share]) => ({
          memberId: Number(memberId),
          share,
        }));
    console.log("SENDING DATA", {payerId, amount, divisiontype: splitMethod, participants});
    axios.post(`http://localhost:5000/api/groups/${groupId}/transactions`, {
      payerId,
      amount,
      divisiontype: splitMethod,
      participants,
    }).then(() => navigate(`/groups/${groupId}`));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">New Transaction</h1>

      <div className="flex gap-4 items-center">
        <label>Paid by</label>
        <select value={payerId ?? ''} onChange={e => setPayerId(Number(e.target.value))}>
          {members.map(m => (
            <option key={m.id} value={m.id}>{PayerName}</option>
          ))}
        </select>

        <label>Amount</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="border px-2 py-1 w-24"
        />
      </div>

      <div className="flex gap-4">
        <label><input type="radio" value="equal" checked={splitMethod === 'equal'} onChange={() => setSplitMethod('equal')} /> Equally</label>
        <label><input type="radio" value="percentage" checked={splitMethod === 'percentage'} onChange={() => setSplitMethod('percentage')} /> By percentage</label>
        <label><input type="radio" value="shares" checked={splitMethod === 'shares'} onChange={() => setSplitMethod('shares')} /> By shares</label>
      </div>

      {members.filter(m => m.id !== payerId).map(m => (
        <div key={m.id} className="flex gap-2 items-center">
          <span className="w-24">{m.name}</span>
          <input
            type="number"
            value={
              splitMethod === 'equal'
                ? (calculated[m.id] ?? 0)
                : (inputs[m.id] ?? 0)
            }
            onChange={e => setInputs(prev => ({ ...prev, [m.id]: Number(e.target.value) }))}
            className="border px-2 py-1 w-24"
            disabled={splitMethod === 'equal'}
          />
          {splitMethod === 'percentage' && <span>%</span>}
          {splitMethod === 'shares' && <span>shares</span>}
        </div>
      ))}

      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
        Add Transaction
      </button>
    </div>
  );
}
