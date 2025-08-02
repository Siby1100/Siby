import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  taskId: string;
  onSubmitted: () => void;
}

const SubmitPDF: React.FC<Props> = ({ taskId, onSubmitted }) => {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setError(null);
    } else {
      setError("Veuillez sélectionner un fichier PDF valide");
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Aucun fichier sélectionné");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `http://localhost:3001/api/tasks/${taskId}/submissions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || "Erreur lors de l'envoi");
      } else {
        setFile(null);
        onSubmitted();
      }
    } catch (e) {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {error && <p className="text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="flex-1 text-sm text-green-600 hover:text-green-700 font-medium py-2 px-3 border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
        {loading ? "Envoi..." : "Soumettre le PDF"}
      </button>
    </form>
  );
};

export default SubmitPDF;
