import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
  class_name: string;
}

const TaskDetails: React.FC = () => {
  const { id } = useParams();
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3001/tasks/${id}`)
      .then((res) => res.json())
      .then((data) => setTask(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!task) return <p>Chargement...</p>;

  return (
    <div className="task-details">
      <h2>{task.title}</h2>
      <p><strong>Description :</strong> {task.description}</p>
      <p><strong>Classe :</strong> {task.class_name}</p>
      <p><strong>Date de publication :</strong> {new Date(task.created_at).toLocaleDateString()}</p>
      <p><strong>Date limite :</strong> {new Date(task.due_date).toLocaleDateString()}</p>
    </div>
  );
};

export default TaskDetails;
