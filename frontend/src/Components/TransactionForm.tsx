import React, { useState } from "react";
import { previewTransaction } from "../pages/NewTransactionPageWrapper";
import { getGroupById } from "../api/groupsApi";
import { Group } from "../types/group";
import { useParams } from "react-router-dom";

type Member = { id: number; name: string };

type Props = {
  usersInGroup: Member[];
  onSubmit: (payerId: number, amount: number, participants: { memberId: number; share: number }[]) => void;
};

export default function TransactionForm({ usersInGroup, onSubmit }: Props) {
  const [step, setStep] = useState(1);
  const [payerId, setPayerId] = useState<number>(usersInGroup[0]?.id || 0);
  const [amount, setAmount] = useState<number>(0);
  const [splitMethod, setSplitMethod] = useState<"equal" | "percent" | "manual">("equal");
  const { groupId } = useParams<{ groupId: string }>();
  const [splits, setSplits] = useState<Record<number, number>>(() =>
    Object.fromEntries(usersInGroup.map((u) => [u.id, 0]))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const participants = Object.entries(splits)
      .filter(([_, share]) => share > 0)
      .map(([id, share]) => ({ memberId: Number(id), share }));

    onSubmit(payerId, amount, participants);
  };

  const handleSplitChange = (id: number, value: number) => {
    setSplits((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {step === 1 && (
        <>
          <div>
            <label className="block font-semibold">Payer</label>
            <select value={payerId} onChange={(e) => setPayerId(Number(e.target.value))} className="border p-2 w-full">
              {usersInGroup.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              className="border p-2 w-full"
              required
              min="0.01"
              step="0.01"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setStep(2);
              const participants = Object.entries(splits)
              .filter(([id]) => Number(id) !== payerId)
              .map(([id, share]) => ({
                memberId: Number(id),
                share,
              }));

            previewTransaction(Number(groupId), {
              payerId,
              amount,
              divisionType: splitMethod,
              participants,
            }).then(res => {
              const newSplits = Object.fromEntries(
                res.data.map((item: any) => [item.memberId, item.share])
              );
              setSplits(newSplits);
            }).catch(err => {
              console.error("Preview failed", err);
            });
          }}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Next
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div>
            <label className="block font-semibold mb-2">Split Method</label>
            <div className="flex gap-4">
              {["equal", "percent", "manual"].map((method) => (
                <label key={method} className="flex items-center space-x-1">
                  <input
                    type="radio"
                    name="splitMethod"
                    value={method}
                    checked={splitMethod === method}
                    onChange={(e) => {
                      setSplitMethod(e.target.value as any);
                    }}
                  />
                  <span>{method.charAt(0).toUpperCase() + method.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold">Set Shares</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {usersInGroup.map((user) => (
                <div key={user.id} className="flex items-center space-x-2">
                  <span className="w-24">{user.name}</span>
                  <input
                    type="number"
                    value={splits[user.id] || 0}
                    onChange={(e) => handleSplitChange(user.id, parseFloat(e.target.value))}
                    className="border p-1 w-full"
                    min="0"
                    step="0.01"
                    disabled={splitMethod === "equal"}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Back
            </button>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
              Submit Transaction
            </button>
          </div>
        </>
      )}
    </form>
  );
}
