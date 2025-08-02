import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Users, Crown, Plus, Mail } from "lucide-react";
import AddToClass from "./AddToClass";
import AddToGroup from "./AddToGroup";
interface Group {
  id: string;
  name: string;
  coordinatorId: string;
  members: string[];
  classId: string;
}

const Groups: React.FC = () => {
  const { user, token } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  interface Class {
    id: string;
    name: string;
    // Add other properties if needed
  }

  const [classMembers, setClassMembers] = useState<
    { id: string; email: string }[]
  >([]);

  const fetchClassMembers = async (classId: string) => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/classes/${classId}/members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setClassMembers(data); // [{ id, email }]
    } catch (err) {
      console.error("Erreur lors du chargement des membres :", err);
    }
  };

  const [classes, setClasses] = useState<Class[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    classId: "",
    coordinatorEmail: "",
    members: [] as string[],
  });
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const classesData = await response.json();
      setClasses(classesData);

      // Fetch groups for each class
      const allGroups: Group[] = [];
      for (const classItem of classesData) {
        try {
          const groupsResponse = await fetch(
            `http://localhost:3001/api/classes/${classItem.id}/groups`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const groupsData = await groupsResponse.json();
          allGroups.push(...groupsData);
        } catch (error) {
          console.error(
            "Error fetching groups for class:",
            classItem.id,
            error
          );
        }
      }
      setGroups(allGroups);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    try {
      // Chercher l'id du coordinateur à partir de l'email
      const userRes = await fetch("http://localhost:3001/api/users/by-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: newGroup.coordinatorEmail }),
      });
      if (!userRes.ok) {
        setCreateError("Email du coordinateur introuvable.");
        return;
      }
      const userData = await userRes.json();
      const coordinatorId = userData.id;
      if (!coordinatorId) {
        setCreateError("Email du coordinateur introuvable.");
        return;
      }
      // Création du groupe avec l'id trouvé
      const response = await fetch(
        `http://localhost:3001/api/classes/${newGroup.classId}/groups`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newGroup.name,
            coordinatorId,
            members: newGroup.members,
          }),
        }
      );
      if (response.ok) {
        setShowCreateModal(false);
        setNewGroup({
          name: "",
          classId: "",
          coordinatorEmail: "",
          members: [],
        });
        fetchClasses();
      } else {
        const data = await response.json();
        setCreateError(data.error || "Erreur lors de la création du groupe.");
      }
    } catch (error) {
      setCreateError("Erreur réseau ou serveur.");
      console.error("Error creating group:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groupes</h1>
          <p className="text-gray-600 mt-2">
            Organisez les étudiants en groupes de travail
          </p>
        </div>
        {user?.role === "professor" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer un groupe
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {group.name}
                </h3>
                <Users className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <Crown className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
                    Coordinateur
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {group.members.length} membre
                    {group.members.length > 1 ? "s" : ""}
                  </div>

                  <div className="flex -space-x-2">
                    {group.members.slice(0, 3).map((_, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                      >
                        {index + 1}
                      </div>
                    ))}
                    {group.members.length > 3 && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                        +{group.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium py-1 px-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  onClick={() =>
                    setSelectedGroupId(
                      selectedGroupId === group.id ? null : group.id
                    )
                  }
                >
                  {selectedGroupId === group.id ? "Masquer" : "Voir détails"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun groupe
          </h3>
          <p className="text-gray-600">
            {user?.role === "professor"
              ? "Créez votre premier groupe pour organiser vos étudiants"
              : "Aucun groupe disponible pour le moment"}
          </p>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Créer un nouveau groupe
            </h2>
            <form onSubmit={createGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du groupe
                </label>
                <input
                  type="text"
                  required
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Classe
                </label>
                <select
                  onChange={(e) => {
                    const selectedClassId = e.target.value;
                    setNewGroup({ ...newGroup, classId: selectedClassId });
                    fetchClassMembers(selectedClassId);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner une classe</option>
                  {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email du coordinateur
                </label>
                <input
                  type="email"
                  required
                  value={newGroup.coordinatorEmail}
                  onChange={(e) =>
                    setNewGroup({
                      ...newGroup,
                      coordinatorEmail: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <AddToGroup groupId={"ID_DU_GROUPE"} classId={"ID_DE_LA_CLASSE"} />
              


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
    </div>
  );
};

export default Groups;
