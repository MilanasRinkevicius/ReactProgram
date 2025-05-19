import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getGroupById } from "../api/groupsApi"; // adjust the import as needed
import { getTransactionsByGroupId } from "../api/transactionsApi";
import GroupSummary from "../Components/GroupSummary";
import TransactionList from "../Components/TransactionList";
import { Group } from "../types/group"; // adjust if you store types elsewhere
import { Transaction} from "../types/transaction";
import { addMemberToGroup, getMembersByGroupId } from "../api/membersApi";

export default function GroupDetailPage() {
  
  type Member = {
  id: number;
  name: string;
  balance: number;
  };
  
  const { id } = useParams<{ id: string }>();
  const groupIdNum  = id ? parseInt(id) : undefined;
  const [members, setMembers] = useState<Member[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [group, setGroup] = useState<Group | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  console.log("groupIdNum:", groupIdNum);

  if (groupIdNum !== undefined) {
    Promise.all([
      getGroupById(groupIdNum),
      getTransactionsByGroupId(groupIdNum)
    ])
      .then(([groupRes, txRes]) => {
        console.log("Group API response:", groupRes.data);
        console.log("Transactions API response:", txRes.data);

        setGroup(groupRes.data); // Assuming it's not wrapped in $values

        const transactions = Array.isArray(txRes.data)
          ? txRes.data
          : (txRes.data as { $values: Transaction[] }).$values || [];

        setTransactions(transactions);

        return getMembersByGroupId(groupIdNum);
      })
      .then((res) => {
  const rawData = res.data;
  const members = Array.isArray(rawData)
    ? rawData
    : rawData?.$values ?? [];

        setMembers(members);
        console.log("Members:", members);
        console.log("groupIdNum:", rawData);
      })
      .catch((err) => {
        console.log("groupIdNum:", groupIdNum);
        console.error("Failed to fetch group details:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }
}, [groupIdNum]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!group) return <p className="p-4">Group not found</p>;
  
  const handleAddMember = async () => {
  if (!newMemberName.trim()) return;
  try {

    await addMemberToGroup(groupIdNum!, newMemberName);
    const res = await getMembersByGroupId(groupIdNum!);
    
    const rawData = res.data;
    const members = Array.isArray(rawData)
    ? rawData
    : rawData?.$values ?? [];
    
    setMembers(members);
    setNewMemberName("");
  } catch (err) {
    console.error("Add member failed", err);
  }
};


const handleDeleteMember = async (memberId: number) => {
  const confirmed = window.confirm("Are you sure you want to remove this member?");
  if (!confirmed) return;

  try {
    console.log("Deleting member:", memberId);
    console.log("Deleting member from group:", groupIdNum);
    
    const response = await fetch(`http://localhost:5000/api/groups/${groupIdNum}/members/${memberId}`, {method: 'DELETE'});
    
    if (response.ok) {
      console.log("Deleting member:", memberId);
      
      await getMembersByGroupId(groupIdNum!).then(res => {
            const rawData = res.data;
    const members = Array.isArray(rawData)
    ? rawData
    : rawData?.$values ?? [];
  setMembers(members);});

    } else {
      const error = await response.text();
      alert("Failed to delete member: " + error);
    }
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Something went wrong while deleting.");
  }
};


  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{group.title}</h1>

      <GroupSummary group={group} transactions={transactions} />

      <div className="flex justify-end my-4">
        <Link
          to={`/groups/${groupIdNum}/new-transaction`}
          className="bg-green-600 text-white px-4 py-2 rounded"
          >
          Add Transaction
      </Link>
      </div>

      <TransactionList transactions={transactions} />
      <hr className="my-6" />
      <h2 className="text-xl font-bold mb-2">Members</h2>
      <ul className="space-y-2 mb-4">
        {members.map(member => (
          <li
            key={member.id}
            className="flex justify-between items-center border p-2 rounded"
          >
            <span>{member.name} – <strong>{typeof member.balance === 'number' ? member.balance.toFixed(2) : '0.00'} €</strong></span>
            {member.balance === 0 && (
              <button
                onClick={() => handleDeleteMember(member.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          placeholder="New member name"
          className="border px-3 py-1 rounded w-full"
        />
        <button
          onClick={handleAddMember}
          className="bg-green-600 text-white px-4 py-1 rounded"
        >  
          Add
        </button>

      </div>
    </div>
  );
}