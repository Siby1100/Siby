import { useState, useEffect } from "react";
import axios from "axios";

interface Props {
  classId: string;
}

const AddToClass: React.FC<Props> = ({ classId }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    axios.get("http://localhost:3001/users") // suppose que tu as une route GET /users
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Erreur:", err));
  }, []);

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:3001/class-members", {
        classId,
        userId: selectedUserId
      });
      alert("Ajouté à la classe !");
      setSelectedUserId("");
    } catch (err) {
      console.error(err);
      alert("Erreur !");
    }
  };

  return (
    <div>
      <h3>Ajouter un étudiant à la classe</h3>
      <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
        <option value="">-- Sélectionner un utilisateur --</option>
        {users.map((u: any) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.email})
          </option>
        ))}
      </select>
      <button onClick={handleSubmit} disabled={!selectedUserId}>
        Ajouter à la classe
      </button>
    </div>
  );
};

export default AddToClass;
