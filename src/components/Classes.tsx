import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Plus, Users, Calendar, Copy, Settings } from "lucide-react";
import AddToClass from "./AddToClass";
interface Class {
  id: string;
  name: string;
  code: string;
  description: string;
  professor_id: string;
  createdAt: string;
}

const Classes: React.FC = () => {
  const { user, token } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newClass, setNewClass] = useState({ name: "", description: "" });
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  const [fetchError, setFetchError] = useState("");
  const fetchClasses = async () => {
    try {
      setFetchError("");
      const response = await fetch("http://localhost:3001/api/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setClasses(data);
      } else {
        setClasses([]);
        setFetchError(data.error || "Erreur lors du chargement des classes.");
      }
    } catch (error) {
      setFetchError("Erreur réseau ou serveur.");
      setClasses([]);
      console.error("Error fetching classes:", error);
    }
  };

  const [createError, setCreateError] = useState("");
  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    try {
      const response = await fetch("http://localhost:3001/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newClass),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewClass({ name: "", description: "" });
        fetchClasses();
      } else {
        const data = await response.json();
        setCreateError(
          data.error || "Erreur lors de la création de la classe."
        );
      }
    } catch (error) {
      setCreateError("Erreur réseau ou serveur.");
      console.error("Error creating class:", error);
    }
  };

  const joinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/api/classes/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: joinCode }),
      });

      if (response.ok) {
        setShowJoinModal(false);
        setJoinCode("");
        fetchClasses();
      }
    } catch (error) {
      console.error("Error joining class:", error);
    }
  };

  const copyClassCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // Show toast notification here
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos classes et rejoignez de nouvelles
          </p>
        </div>
        <div className="flex space-x-3">
          {user?.role === "student" && (
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Rejoindre une classe
            </button>
          )}
          {user?.role === "professor" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer une classe
            </button>
          )}
        </div>
      </div>

      {fetchError && (
        <div className="text-red-600 text-sm mb-4">{fetchError}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <div
            key={classItem.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {classItem.name}
                </h3>
                <Settings className="w-5 h-5 text-gray-400" />
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">
                {classItem.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(classItem.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                    {classItem.code}
                  </span>
                  <button
                    onClick={() => copyClassCode(classItem.code)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-1" />
                  Membres actifs
                </div>
              </div>
            </div>
            <AddToClass classId={"ID_DE_LA_CLASSE"} />
          </div>
          
        ))}
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Créer une nouvelle classe
            </h2>
            <form onSubmit={createClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la classe
                </label>
                <input
                  type="text"
                  required
                  value={newClass.name}
                  onChange={(e) =>
                    setNewClass({ ...newClass, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newClass.description}
                  onChange={(e) =>
                    setNewClass({ ...newClass, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Créer
                </button>
              </div>
              {createError && (
                <div className="text-red-600 text-sm mt-2">{createError}</div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Rejoindre une classe
            </h2>
            <form onSubmit={joinClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code de la classe
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: CLS-ABC123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Rejoindre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
