import React, { useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
}

const ClassMembers = ({ classId }: { classId: string }) => {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:3001/api/classes/${classId}/members`)
      .then((res) => {
        setMembers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des membres :", err);
        setLoading(false);
      });
  }, [classId]);

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      <h3>Membres de la classe</h3>
      {members.length === 0 ? (
        <p>Aucun membre trouvé.</p>
      ) : (
        <ul>
          {members.map((member) => (
            <li key={member.id}>
              {member.name} ({member.email})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClassMembers;
