import React, { useEffect, useState } from "react";
import { getAllGroups, createGroup } from "../api/groupsApi";
import { Group } from "../types/group";
import GroupCard from "../Components/GroupCard";
import NewGroupForm from "../Components/NewGroupForm";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  getAllGroups()
    .then((res) => {
      const data = res.data;

      const actualGroups: Group[] = Array.isArray(data)
        ? data
        : (data as { $values: Group[] }).$values || [];

      setGroups(actualGroups);
    })
    .catch((err: any) => console.error("Failed to load groups", err))
    .finally(() => setLoading(false));
}, []);

  const handleCreateGroup = (title: string) => {
    createGroup({
        title,
        userId: 0
    })
      .then(res => {
        setGroups(prev => [...prev, res.data]);
      })
      .catch(err => console.error("Failed to create group", err));
  };
  console.log("groups:", groups, "typeof:", typeof groups, "Array.isArray:", Array.isArray(groups));
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Groups</h1>

      <NewGroupForm onCreate={handleCreateGroup} />

      {loading ? (
        <p className="mt-4">Loading...</p>
      ) : groups.length === 0 ? (
        <p className="mt-4">No groups yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          
         {groups.map(group => {
           console.log("Rendering group card:", group.id);
           return <GroupCard key={group.id} group={group} />
          })}
        </div>
      )}
    </div>
  );
}