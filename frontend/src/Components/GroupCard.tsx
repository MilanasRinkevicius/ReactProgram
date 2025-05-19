import React from "react";
import { Group } from "../types/group";
import { Link } from "react-router-dom";

type Props = { group: Group };

export default function GroupCard({ group }: Props) {
  return (
    <div className="border p-3 rounded shadow-sm flex justify-between">
      <Link to={`/groups/${group.id}`} className="font-bold">
        {group.title}
      </Link>
      <span className={group.balance >= 0 ? "text-green-600" : "text-red-600"}>
        {group.balance >= 0 ? `You are owed $${group.balance}` : `You owe $${-group.balance}`}
      </span>
    </div>
  );
}