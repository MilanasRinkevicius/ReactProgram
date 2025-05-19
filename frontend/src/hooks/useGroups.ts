import { useEffect, useState } from "react";
import { fetchGroups } from "../api/groupsApi";
import { Group } from "../types/group";

export function useGroups(userId: number) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups(userId).then(res => {
      setGroups(res.data);
      setLoading(false);
    });
  }, [userId]);

  return { groups, loading };
}