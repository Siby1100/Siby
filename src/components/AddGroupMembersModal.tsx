import React, { useState } from "react";

interface AddGroupMembersModalProps {
  onClose: () => void;
  onAdd: (emails: string[]) => void;
}

const AddGroupMembersModal: React.FC<AddGroupMembersModalProps> = ({ onClose, onAdd }) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input.trim() !== "") {
      setEmails([...emails, input.trim()]);
      setInput("");
    }
  };

  const handleSubmit = () => {
    if (emails.length > 0) {
      onAdd(emails);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Ajouter des membres</h2>
        <div className="space-y-2 mb-4">
          <div className="flex gap-2">
            <input
              type="email"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Email de l'étudiant"
              className="flex-1 border border-gray-300 px-3 py-2 rounded-lg"
            />
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Ajouter
            </button>
          </div>
          {emails.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-gray-600">
              {emails.map((email, i) => (
                <li key={i}>{email}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGroupMembersModal;
