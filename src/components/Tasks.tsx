import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FileText, Plus, Calendar, Clock, CheckCircle } from "lucide-react";
import SubmitPDF from "./SubmitPDF";
interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  classId: string;
  createdAt: string;
}

const Tasks: React.FC = () => {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  interface ClassItem {
    id: string;
    name: string;
    // Add other properties if needed
  }

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    classId: "",
  });

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

      // Fetch tasks for each class
      const allTasks: Task[] = [];
      for (const classItem of classesData) {
        try {
          const tasksResponse = await fetch(
            `http://localhost:3001/api/classes/${classItem.id}/tasks`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const tasksData = await tasksResponse.json();
          allTasks.push(...tasksData);
        } catch (error) {
          console.error("Error fetching tasks for class:", classItem.id, error);
        }
      }
      setTasks(allTasks);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:3001/api/classes/${newTask.classId}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newTask.title,
            description: newTask.description,
            dueDate: newTask.dueDate,
          }),
        }
      );

      if (response.ok) {
        setShowCreateModal(false);
        setNewTask({ title: "", description: "", dueDate: "", classId: "" });
        fetchClasses();
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const getTaskStatus = (dueDate: Date) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil(
      (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0)
      return { status: "overdue", color: "text-red-600", bg: "bg-red-50" };
    if (diffDays <= 2)
      return { status: "urgent", color: "text-orange-600", bg: "bg-orange-50" };
    return { status: "normal", color: "text-green-600", bg: "bg-green-50" };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tâches</h1>
          <p className="text-gray-600 mt-2">
            Gérez les assignments et suivez les soumissions
          </p>
        </div>
        {user?.role === "professor" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle tâche
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => {
          const status = getTaskStatus(task.dueDate);
          const className = classes.find((c) => c.id === task.classId);

          return (
            <div
              key={task.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">
                    {task.title}
                  </h3>
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {task.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    Échéance: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    Classe: {className?.name || "Classe inconnue"}
                  </div>
                </div>

                <div
                  className={`flex items-center justify-between p-3 rounded-lg ${status.bg}`}
                >
                  <span className={`text-sm font-medium ${status.color}`}>
                    {status.status === "overdue"
                      ? "En retard"
                      : status.status === "urgent"
                      ? "Urgent"
                      : "À temps"}
                  </span>
                  <CheckCircle className={`w-4 h-4 ${status.color}`} />
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
                  <button
                    onClick={() =>
                      setSelectedTaskId(
                        selectedTaskId === task.id ? null : task.id
                      )
                    }
                    className="flex-1 text-sm text-blue-600 hover:text-blue-700 font-medium py-2 px-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    {selectedTaskId === task.id ? "Fermer" : "Voir détails"}
                  </button>

                  {/* {user?.role === 'student'  && (
                    
                    <button className="flex-1 text-sm text-green-600 hover:text-green-700 font-medium py-2 px-3 border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
                      Soumettre
                    </button>
                  )} */}
                  {user?.role === "student" && (
                    <SubmitPDF
                      taskId={task.id}
                      onSubmitted={() => {
                        alert("PDF soumis avec succès !");
                        fetchClasses(); // ou fetchTasks pour rafraichir
                      }}
                    />
                  )}
                </div>
                {selectedTaskId === task.id && (
                  <div className="bg-gray-100 p-4 rounded-lg mt-2 shadow">
                    <h3 className="text-md font-semibold mb-1">
                      Détails de la tâche
                    </h3>
                    <p>
                      <strong>Titre :</strong> {task.title}
                    </p>
                    <p>
                      <strong>Description :</strong>{" "}
                      {task.description || "Aucune"}
                    </p>
                    <p>
                      <strong>Date de création :</strong>{" "}
                      {new Date(task.createdAt).toLocaleString()}
                    </p>
                    <p>
                      <strong>Échéance :</strong>{" "}
                      {new Date(task.dueDate).toLocaleString()}
                    </p>
                    <p>
                      <strong>Classe :</strong>{" "}
                      {task.className || "Classe inconnue"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune tâche
          </h3>
          <p className="text-gray-600">
            {user?.role === "professor"
              ? "Créez votre première tâche pour assigner du travail"
              : "Aucune tâche assignée pour le moment"}
          </p>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Créer une nouvelle tâche
            </h2>
            <form onSubmit={createTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'échéance
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Classe
                </label>
                <select
                  required
                  value={newTask.classId}
                  onChange={(e) =>
                    setNewTask({ ...newTask, classId: e.target.value })
                  }
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
