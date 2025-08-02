import { useState, useEffect } from "react";
import axios from "axios";

interface Props {
  groupId: string;
  classId: string;
}

const AddToGroup: React.FC<Props> = ({ groupId, classId }) => {
  const [classMembers, setClassMembers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:3001/class-members/${classId}`)
      .then((res) => setClassMembers(res.data))
      .catch((err) => console.error("Erreur:", err));
  }, [classId]);

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:3001/group-members", {
        groupId,
        userId: selectedUserId
      });
      alert("Ajouté au groupe !");
      setSelectedUserId("");
    } catch (err) {
      console.error(err);
      alert("Erreur !");
    }
  };

  return (
    <div>
      <h3>Ajouter un étudiant au groupe</h3>
      <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
        <option value="">-- Étudiant de la classe --</option>
        {classMembers.map((u: any) => (
          <option key={u.user_id} value={u.user_id}>
            {u.name} ({u.email})
          </option>
        ))}
      </select>
      <button onClick={handleSubmit} disabled={!selectedUserId}>
        Ajouter au groupe
      </button>
    </div>
  );
};

export default AddToGroup;
